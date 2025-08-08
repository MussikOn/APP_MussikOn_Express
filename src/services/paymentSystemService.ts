import { db, cleanObjectForFirestore } from '../utils/firebase';
import { logger } from './loggerService';
import { uploadToS3 } from '../utils/idriveE2';
import { 
  BankAccount, 
  UserDeposit, 
  EventPayment, 
  MusicianEarnings, 
  WithdrawalRequest, 
  UserBalance, 
  CommissionCalculation,
  PaymentStatistics,
  BankAccountData,
  DepositRequest,
  WithdrawalRequestData,
  EventPaymentRequest
} from '../types/paymentTypes';

export class PaymentSystemService {
  private readonly COMMISSION_RATE = 0.10; // 10% de comisión

  /**
   * Calcular comisión de la plataforma
   */
  private calculateCommission(eventAmount: number): CommissionCalculation {
    const commission = eventAmount * this.COMMISSION_RATE;
    const musicianAmount = eventAmount - commission;
    
    return {
      totalAmount: eventAmount,
      commissionAmount: commission,
      musicianAmount: musicianAmount,
      commissionRate: this.COMMISSION_RATE
    };
  }

  /**
   * Obtener balance de usuario
   */
  async getUserBalance(userId: string): Promise<UserBalance> {
    try {
      logger.info('Obteniendo balance de usuario', { metadata: { userId } });
      
      const balanceDoc = await db.collection('user_balances').doc(userId).get();
      
      if (!balanceDoc.exists) {
        // Crear balance inicial si no existe
        const initialBalance: UserBalance = cleanObjectForFirestore({
          userId,
          balance: 0,
          currency: 'RD$',
          lastUpdated: new Date().toISOString(),
          totalDeposits: 0,
          totalWithdrawals: 0,
          totalEarnings: 0
        });
        
        await db.collection('user_balances').doc(userId).set(initialBalance);
        return initialBalance;
      }
      
      return balanceDoc.data() as UserBalance;
    } catch (error) {
      logger.error('Error obteniendo balance de usuario', error as Error, { 
        metadata: { userId } 
      });
      throw new Error('Error obteniendo balance de usuario');
    }
  }

  /**
   * Registrar cuenta bancaria
   */
  async registerBankAccount(userId: string, accountData: BankAccountData): Promise<BankAccount> {
    try {
      logger.info('Registrando cuenta bancaria', { metadata: { userId } });
      
      const bankAccount: BankAccount = cleanObjectForFirestore({
        id: `bank_${Date.now()}_${userId}`,
        userId,
        accountHolder: accountData.accountHolder,
        accountNumber: accountData.accountNumber,
        bankName: accountData.bankName,
        accountType: accountData.accountType,
        routingNumber: accountData.routingNumber,
        isVerified: false,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      await db.collection('bank_accounts').doc(bankAccount.id).set(bankAccount);
      
      // Si es la primera cuenta, establecer como default
      const userAccounts = await db.collection('bank_accounts')
        .where('userId', '==', userId)
        .get();
      
      if (userAccounts.size === 1) {
        bankAccount.isDefault = true;
        await db.collection('bank_accounts').doc(bankAccount.id).update({ isDefault: true });
      }
      
      return bankAccount;
    } catch (error) {
      logger.error('Error registrando cuenta bancaria', error as Error, { 
        metadata: { userId } 
      });
      throw new Error('Error registrando cuenta bancaria');
    }
  }

  /**
   * Obtener cuentas bancarias de usuario
   */
  async getUserBankAccounts(userId: string): Promise<BankAccount[]> {
    try {
      logger.info('Obteniendo cuentas bancarias de usuario', { metadata: { userId } });
      
      const accountsSnapshot = await db.collection('bank_accounts')
        .where('userId', '==', userId)
        .orderBy('isDefault', 'desc')
        .orderBy('createdAt', 'desc')
        .get();
      
      return accountsSnapshot.docs.map(doc => doc.data() as BankAccount);
    } catch (error) {
      logger.error('Error obteniendo cuentas bancarias', error as Error, { 
        metadata: { userId } 
      });
      throw new Error('Error obteniendo cuentas bancarias');
    }
  }

  /**
   * Subir comprobante de depósito
   */
  async uploadDepositVoucher(userId: string, depositData: DepositRequest): Promise<UserDeposit> {
    try {
      logger.info('Subiendo comprobante de depósito', { metadata: { userId, amount: depositData.amount } });
      
      // Subir archivo a S3
      const fileUrl = await uploadToS3(
        depositData.voucherFile.buffer,
        depositData.voucherFile.originalname || 'voucher.jpg',
        depositData.voucherFile.mimetype || 'image/jpeg',
        'deposits'
      );
      
      // Extraer la clave de IDrive E2 de la URL
      const idriveKey = fileUrl.split('/').slice(-2).join('/'); // Obtener la parte de la clave
      
      const deposit: UserDeposit = cleanObjectForFirestore({
        id: `deposit_${Date.now()}_${userId}`,
        userId,
        amount: depositData.amount,
        currency: 'RD$',
        voucherFile: {
          idriveKey, // Usar la clave de IDrive E2 en lugar de la URL
          filename: depositData.voucherFile.originalname || 'voucher.jpg',
          uploadedAt: new Date().toISOString()
        },
        accountHolderName: depositData.accountHolderName,
        bankName: depositData.bankName,
        accountNumber: depositData.accountNumber,
        depositDate: depositData.depositDate,
        depositTime: depositData.depositTime,
        referenceNumber: depositData.referenceNumber,
        comments: depositData.comments,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      await db.collection('user_deposits').doc(deposit.id).set(deposit);
      
      return deposit;
    } catch (error) {
      logger.error('Error subiendo comprobante de depósito', error as Error, { 
        metadata: { userId } 
      });
      throw new Error('Error subiendo comprobante de depósito');
    }
  }

  /**
   * Verificar depósito (admin)
   */
  async verifyDeposit(depositId: string, adminId: string, approved: boolean, notes?: string): Promise<void> {
    try {
      logger.info('Verificando depósito', { metadata: { depositId, adminId, approved } });
      
      const depositRef = db.collection('user_deposits').doc(depositId);
      const depositDoc = await depositRef.get();
      
      if (!depositDoc.exists) {
        throw new Error('Depósito no encontrado');
      }
      
      const deposit = depositDoc.data() as UserDeposit;
      
      if (deposit.status !== 'pending') {
        throw new Error('Depósito ya fue procesado');
      }
      
      const updateData: Partial<UserDeposit> = {
        status: approved ? 'approved' : 'rejected',
        verifiedBy: adminId,
        verifiedAt: new Date().toISOString(),
        notes,
        updatedAt: new Date().toISOString()
      };
      
      await depositRef.update(updateData);
      
      // Si fue aprobado, actualizar balance del usuario
      if (approved) {
        await this.updateUserBalance(deposit.userId, deposit.amount, 'deposit');
      }
    } catch (error) {
      logger.error('Error verificando depósito', error as Error, { 
        metadata: { depositId, adminId } 
      });
      throw new Error('Error verificando depósito');
    }
  }

  /**
   * Procesar pago de evento
   */
  async processEventPayment(paymentData: EventPaymentRequest): Promise<EventPayment> {
    try {
      logger.info('Procesando pago de evento', { 
        metadata: { 
          eventId: paymentData.eventId,
          organizerId: paymentData.organizerId,
          musicianId: paymentData.musicianId,
          amount: paymentData.amount
        }
      });
      
      const commission = this.calculateCommission(paymentData.amount);
      
      const eventPayment: EventPayment = cleanObjectForFirestore({
        id: `payment_${Date.now()}_${paymentData.eventId}`,
        eventId: paymentData.eventId,
        organizerId: paymentData.organizerId,
        musicianId: paymentData.musicianId,
        amount: paymentData.amount,
        currency: 'RD$',
        commission: commission.commissionAmount,
        musicianAmount: commission.musicianAmount,
        status: 'completed',
        paymentMethod: 'transfer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      await db.collection('event_payments').doc(eventPayment.id).set(eventPayment);
      
      // Crear ganancia para el músico
      await this.createMusicianEarning(eventPayment);
      
      // Actualizar balance del organizador (deducir pago)
      await this.updateUserBalance(paymentData.organizerId, -paymentData.amount, 'payment');
      
      return eventPayment;
    } catch (error) {
      logger.error('Error procesando pago de evento', error as Error, { 
        metadata: { eventId: paymentData.eventId } 
      });
      throw new Error('Error procesando pago de evento');
    }
  }

  /**
   * Crear ganancia para músico
   */
  private async createMusicianEarning(eventPayment: EventPayment): Promise<void> {
    try {
      const earning: MusicianEarnings = cleanObjectForFirestore({
        id: `earning_${Date.now()}_${eventPayment.musicianId}`,
        musicianId: eventPayment.musicianId,
        eventId: eventPayment.eventId,
        eventPaymentId: eventPayment.id,
        amount: eventPayment.musicianAmount,
        currency: 'RD$',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      await db.collection('musician_earnings').doc(earning.id).set(earning);
      
      // Actualizar balance del músico
      await this.updateUserBalance(eventPayment.musicianId, eventPayment.musicianAmount, 'earning');
    } catch (error) {
      logger.error('Error creando ganancia para músico', error as Error, { 
        metadata: { musicianId: eventPayment.musicianId, eventId: eventPayment.eventId } 
      });
      throw new Error('Error creando ganancia para músico');
    }
  }

  /**
   * Solicitar retiro de ganancias
   */
  async requestWithdrawal(musicianId: string, withdrawalData: WithdrawalRequestData): Promise<WithdrawalRequest> {
    try {
      logger.info('Solicitando retiro de ganancias', { metadata: { musicianId, amount: withdrawalData.amount } });
      
      // Verificar que el usuario tenga suficiente balance
      const balance = await this.getUserBalance(musicianId);
      if (balance.balance < withdrawalData.amount) {
        throw new Error('Saldo insuficiente para el retiro');
      }
      
      const withdrawal: WithdrawalRequest = cleanObjectForFirestore({
        id: `withdrawal_${Date.now()}_${musicianId}`,
        musicianId,
        amount: withdrawalData.amount,
        currency: 'RD$',
        bankAccountId: withdrawalData.bankAccountId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      await db.collection('withdrawal_requests').doc(withdrawal.id).set(withdrawal);
      
      return withdrawal;
    } catch (error) {
      logger.error('Error solicitando retiro', error as Error, { 
        metadata: { musicianId } 
      });
      throw new Error('Error solicitando retiro');
    }
  }

  /**
   * Procesar retiro (admin)
   */
  async processWithdrawal(withdrawalId: string, adminId: string, approved: boolean, notes?: string): Promise<void> {
    try {
      logger.info('Procesando retiro', { metadata: { withdrawalId, adminId, approved } });
      
      const withdrawalRef = db.collection('withdrawal_requests').doc(withdrawalId);
      const withdrawalDoc = await withdrawalRef.get();
      
      if (!withdrawalDoc.exists) {
        throw new Error('Solicitud de retiro no encontrada');
      }
      
      const withdrawal = withdrawalDoc.data() as WithdrawalRequest;
      
      if (withdrawal.status !== 'pending') {
        throw new Error('Solicitud de retiro ya fue procesada');
      }
      
      const updateData: Partial<WithdrawalRequest> = {
        status: approved ? 'approved' : 'rejected',
        processedBy: adminId,
        processedAt: new Date().toISOString(),
        notes,
        updatedAt: new Date().toISOString()
      };
      
      await withdrawalRef.update(updateData);
      
      // Si fue aprobado, actualizar balance del usuario
      if (approved) {
        await this.updateUserBalance(withdrawal.musicianId, -withdrawal.amount, 'withdrawal');
      }
    } catch (error) {
      logger.error('Error procesando retiro', error as Error, { 
        metadata: { withdrawalId, adminId } 
      });
      throw new Error('Error procesando retiro');
    }
  }

  /**
   * Actualizar balance de usuario
   */
  private async updateUserBalance(userId: string, amount: number, transactionType: 'deposit' | 'payment' | 'earning' | 'withdrawal'): Promise<void> {
    try {
      const balanceRef = db.collection('user_balances').doc(userId);
      const balanceDoc = await balanceRef.get();
      
      let currentBalance = 0;
      let totalDeposits = 0;
      let totalWithdrawals = 0;
      let totalEarnings = 0;
      
      if (balanceDoc.exists) {
        const balance = balanceDoc.data() as UserBalance;
        currentBalance = balance.balance;
        totalDeposits = balance.totalDeposits;
        totalWithdrawals = balance.totalWithdrawals;
        totalEarnings = balance.totalEarnings;
      }
      
      // Actualizar balance y estadísticas
      const newBalance = currentBalance + amount;
      
      switch (transactionType) {
        case 'deposit':
          totalDeposits += amount;
          break;
        case 'withdrawal':
          totalWithdrawals += Math.abs(amount);
          break;
        case 'earning':
          totalEarnings += amount;
          break;
      }
      
      const updatedBalance: UserBalance = cleanObjectForFirestore({
        userId,
        balance: newBalance,
        currency: 'RD$',
        lastUpdated: new Date().toISOString(),
        totalDeposits,
        totalWithdrawals,
        totalEarnings
      });
      
      await balanceRef.set(updatedBalance);
    } catch (error) {
      logger.error('Error actualizando balance de usuario', error as Error, { 
        metadata: { userId, amount, transactionType } 
      });
      throw new Error('Error actualizando balance de usuario');
    }
  }

  /**
   * Obtener estadísticas de pagos (admin)
   */
  async getPaymentStatistics(): Promise<PaymentStatistics> {
    try {
      // Obtener total de depósitos
      const depositsSnapshot = await db.collection('user_deposits')
        .where('status', '==', 'approved')
        .get();
      
      const totalDeposits = depositsSnapshot.docs.reduce((sum, doc) => {
        const deposit = doc.data() as UserDeposit;
        return sum + deposit.amount;
      }, 0);
      
      // Obtener total de pagos de eventos
      const paymentsSnapshot = await db.collection('event_payments')
        .where('status', '==', 'completed')
        .get();
      
      const totalPayments = paymentsSnapshot.docs.reduce((sum, doc) => {
        const payment = doc.data() as EventPayment;
        return sum + payment.amount;
      }, 0);
      
      const totalCommissions = paymentsSnapshot.docs.reduce((sum, doc) => {
        const payment = doc.data() as EventPayment;
        return sum + payment.commission;
      }, 0);
      
      // Obtener total de retiros
      const withdrawalsSnapshot = await db.collection('withdrawal_requests')
        .where('status', '==', 'approved')
        .get();
      
      const totalWithdrawals = withdrawalsSnapshot.docs.reduce((sum, doc) => {
        const withdrawal = doc.data() as WithdrawalRequest;
        return sum + withdrawal.amount;
      }, 0);
      
      // Obtener depósitos pendientes
      const pendingDepositsSnapshot = await db.collection('user_deposits')
        .where('status', '==', 'pending')
        .get();
      
      // Obtener retiros pendientes
      const pendingWithdrawalsSnapshot = await db.collection('withdrawal_requests')
        .where('status', '==', 'pending')
        .get();
      
      return {
        totalDeposits,
        totalPayments,
        totalCommissions,
        totalWithdrawals,
        pendingDepositsCount: pendingDepositsSnapshot.size,
        pendingWithdrawalsCount: pendingWithdrawalsSnapshot.size,
        totalUsers: await this.getTotalUsers(),
        totalMusicians: await this.getTotalMusicians(),
        totalEvents: await this.getTotalEvents(),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de pagos', error as Error);
      throw new Error('Error obteniendo estadísticas de pagos');
    }
  }

  /**
   * Obtener depósitos pendientes (admin)
   */
  async getPendingDeposits(): Promise<UserDeposit[]> {
    try {
      const depositsSnapshot = await db.collection('user_deposits')
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();
      console.info('./src/services/paymentSystemService.ts line 507');
        console.info(`\n\n\n Depósitos pendientes: ${depositsSnapshot.docs.length}\n\n\n`);
        console.info(depositsSnapshot.docs.map(doc => doc.data()));
      return depositsSnapshot.docs.map(doc => doc.data() as UserDeposit);
    } catch (error) {
      logger.error('Error obteniendo depósitos pendientes', error as Error);
      throw new Error('Error obteniendo depósitos pendientes');
    }
  }

  /**
   * Obtener retiros pendientes (admin)
   */
  async getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
    try {
      const withdrawalsSnapshot = await db.collection('withdrawal_requests')
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();
      
      return withdrawalsSnapshot.docs.map(doc => doc.data() as WithdrawalRequest);
    } catch (error) {
      logger.error('Error obteniendo retiros pendientes', error as Error);
      throw new Error('Error obteniendo retiros pendientes');
    }
  }

  /**
   * Obtener ganancias de músico
   */
  async getMusicianEarnings(musicianId: string): Promise<MusicianEarnings[]> {
    try {
      const earningsSnapshot = await db.collection('musician_earnings')
        .where('musicianId', '==', musicianId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return earningsSnapshot.docs.map(doc => doc.data() as MusicianEarnings);
    } catch (error) {
      logger.error('Error obteniendo ganancias de músico', error as Error, { 
        metadata: { musicianId } 
      });
      throw new Error('Error obteniendo ganancias de músico');
    }
  }

  /**
   * Obtener depósitos de usuario
   */
  async getUserDeposits(userId: string): Promise<UserDeposit[]> {
    try {
      logger.info('Obteniendo depósitos de usuario', { metadata: { userId } });
      
      const depositsSnapshot = await db.collection('user_deposits')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return depositsSnapshot.docs.map(doc => doc.data() as UserDeposit);
    } catch (error) {
      logger.error('Error obteniendo depósitos de usuario', error as Error, { 
        metadata: { userId } 
      });
      throw new Error('Error obteniendo depósitos de usuario');
    }
  }

  // Métodos auxiliares para estadísticas
  private async getTotalUsers(): Promise<number> {
    const usersSnapshot = await db.collection('users').get();
    return usersSnapshot.size;
  }

  private async getTotalMusicians(): Promise<number> {
    const musiciansSnapshot = await db.collection('users')
      .where('role', '==', 'musician')
      .get();
    return musiciansSnapshot.size;
  }

  private async getTotalEvents(): Promise<number> {
    const eventsSnapshot = await db.collection('events').get();
    return eventsSnapshot.size;
  }

  /**
   * Obtener detalles de un depósito específico
   */
  async getDepositDetails(depositId: string): Promise<UserDeposit> {
    try {
      const depositDoc = await db.collection('user_deposits').doc(depositId).get();
      
      if (!depositDoc.exists) {
        throw new Error('Depósito no encontrado');
      }
      
      const deposit = depositDoc.data() as UserDeposit;
      
      // Agregar propiedad calculada hasVoucherFile
      const depositWithHasVoucherFile = {
        ...deposit,
        hasVoucherFile: Boolean(deposit.voucherFile && deposit.voucherFile.idriveKey)
      };
      
      return depositWithHasVoucherFile;
    } catch (error) {
      logger.error('Error obteniendo detalles de depósito', error as Error, { 
        metadata: { depositId } 
      });
      throw new Error('Error obteniendo detalles de depósito');
    }
  }

  /**
   * Verificar si un voucher es duplicado
   */
  async checkVoucherDuplicates(depositId: string): Promise<{ isDuplicate: boolean; duplicates: UserDeposit[] }> {
    try {
      // Obtener el depósito actual
      const currentDeposit = await this.getDepositDetails(depositId);
      
      if (!currentDeposit.voucherFile?.idriveKey) {
        return { isDuplicate: false, duplicates: [] };
      }

      // Buscar otros depósitos con la misma clave de IDrive E2
      const duplicatesSnapshot = await db.collection('user_deposits')
        .where('voucherFile.idriveKey', '==', currentDeposit.voucherFile.idriveKey)
        .where('id', '!=', depositId)
        .get();
      
      const duplicates = duplicatesSnapshot.docs.map(doc => doc.data() as UserDeposit);
      
      return {
        isDuplicate: duplicates.length > 0,
        duplicates
      };
    } catch (error) {
      logger.error('Error verificando duplicados de voucher', error as Error, { 
        metadata: { depositId } 
      });
      throw new Error('Error verificando duplicados de voucher');
    }
  }
} 