import { db } from '../utils/firebase';
import { logger } from './loggerService';
import { BankDeposit, BankAccount, DepositRequest, DepositApproval } from '../utils/DataTypes';
import { ImageService } from './imageService';
import { pushNotificationService } from './pushNotificationService';

export class DepositService {
  private readonly COLLECTION_DEPOSITS = 'bank_deposits';
  private readonly COLLECTION_BANK_ACCOUNTS = 'bank_accounts';
  private readonly COLLECTION_USER_BALANCES = 'user_balances';
  private readonly imageService = new ImageService();

  /**
   * Crear un nuevo reporte de depósito
   */
  async createDepositReport(
    userEmail: string,
    depositData: Omit<DepositRequest, 'voucherFile'>,
    voucherFile: Express.Multer.File
  ): Promise<BankDeposit> {
    try {
      logger.info('Creando reporte de depósito DPT:', {
        userId: userEmail,
        metadata: { amount: depositData.amount, bankName: depositData.bankName }
      });

      // 1. Subir voucher a idriveE2
      const uploadResult = await this.imageService.uploadImage(voucherFile, userEmail, 'vouchers');
      const voucherUrl = uploadResult.url;

      // 2. Verificar si es un duplicado
      const isDuplicate = await this.checkForDuplicateVoucher(voucherUrl, userEmail);

      // 3. Crear el depósito
      const deposit: BankDeposit = {
        id: `deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userEmail,
        amount: depositData.amount,
        currency: depositData.currency,
        depositDate: depositData.depositDate,
        bankName: depositData.bankName,
        accountNumber: depositData.accountNumber,
        reference: depositData.reference,
        purpose: depositData.purpose,
        voucherUrl,
        status: 'pending',
        isDuplicate,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 4. Guardar en Firestore
      await db.collection(this.COLLECTION_DEPOSITS).doc(deposit.id).set(deposit);

      // 5. Notificar a administradores
      await this.notifyAdminsOfNewDeposit(deposit);

      logger.info('Reporte de depósito DPT creado exitosamente:', {
        userId: userEmail,
        metadata: { depositId: deposit.id, isDuplicate }
      });

      return deposit;
    } catch (error) {
      logger.error('Error creando reporte de depósito DPT:', error as Error, {
        userId: userEmail
      });
      throw error;
    }
  }

  /**
   * Obtener depósitos de un usuario
   */
  async getUserDeposits(userEmail: string, status?: string): Promise<BankDeposit[]> {
    try {
      let query = db.collection(this.COLLECTION_DEPOSITS)
        .where('userEmail', '==', userEmail)
        .orderBy('createdAt', 'desc');

      if (status) {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as BankDeposit);
    } catch (error) {
      logger.error('Error obteniendo depósitos del usuario:', error as Error, {
        userId: userEmail
      });
      throw error;
    }
  }

  /**
   * Obtener todos los depósitos pendientes (para administradores)
   */
  async getPendingDeposits(): Promise<BankDeposit[]> {
    try {
      const snapshot = await db.collection(this.COLLECTION_DEPOSITS)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'asc')
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as BankDeposit);
    } catch (error) {
      logger.error('Error obteniendo depósitos pendientes:', error as Error);
      throw error;
    }
  }

  /**
   * Aprobar o rechazar un depósito
   */
  async processDepositApproval(approval: DepositApproval): Promise<BankDeposit> {
    try {
          logger.info('Procesando aprobación de depósito DPT:', {
      userId: approval.adminEmail,
      metadata: { depositId: approval.depositId, action: approval.action }
    });

      const depositRef = db.collection(this.COLLECTION_DEPOSITS).doc(approval.depositId);
      const depositDoc = await depositRef.get();

      if (!depositDoc.exists) {
        throw new Error('Depósito no encontrado');
      }

      const deposit = { id: depositDoc.id, ...depositDoc.data() } as BankDeposit;

      if (deposit.status !== 'pending') {
        throw new Error('El depósito ya ha sido procesado');
      }

      const updateData: Partial<BankDeposit> = {
        status: approval.action === 'approve' ? 'approved' : 'rejected',
        reviewedBy: approval.adminEmail,
        reviewedAt: new Date(),
        updatedAt: new Date()
      };

      if (approval.action === 'reject' && approval.reason) {
        updateData.rejectionReason = approval.reason;
      }

      await depositRef.update(updateData);

      // Si se aprueba, actualizar balance del usuario
      if (approval.action === 'approve') {
        await this.updateUserBalance(deposit.userEmail, deposit.amount, deposit.currency);
      }

      // Notificar al usuario
      await this.notifyUserOfDepositStatus(deposit.userEmail, approval.action, approval.reason);

      const updatedDeposit = { ...deposit, ...updateData };

      logger.info('Depósito DPT procesado exitosamente:', {
        userId: approval.adminEmail,
        metadata: { depositId: approval.depositId, action: approval.action }
      });

      return updatedDeposit;
    } catch (error) {
      logger.error('Error procesando aprobación de depósito DPT:', error as Error, {
        userId: approval.adminEmail
      });
      throw error;
    }
  }

  /**
   * Verificar si un voucher es duplicado
   */
  private async checkForDuplicateVoucher(voucherUrl: string, userEmail: string): Promise<boolean> {
    try {
      const snapshot = await db.collection(this.COLLECTION_DEPOSITS)
        .where('voucherUrl', '==', voucherUrl)
        .where('userEmail', '==', userEmail)
        .get();

      return !snapshot.empty;
    } catch (error) {
      logger.error('Error verificando duplicado de voucher:', error as Error);
      return false;
    }
  }

  /**
   * Actualizar balance del usuario
   */
  private async updateUserBalance(userEmail: string, amount: number, currency: string): Promise<void> {
    try {
      const balanceRef = db.collection(this.COLLECTION_USER_BALANCES).doc(userEmail);
      const balanceDoc = await balanceRef.get();

      if (balanceDoc.exists) {
        const currentBalance = balanceDoc.data()?.balance || 0;
        await balanceRef.update({
          balance: currentBalance + amount,
          updatedAt: new Date()
        });
      } else {
        await balanceRef.set({
          userEmail,
          balance: amount,
          currency,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error) {
      logger.error('Error actualizando balance del usuario:', error as Error, {
        userId: userEmail
      });
      throw error;
    }
  }

  /**
   * Notificar a administradores de nuevo depósito
   */
  private async notifyAdminsOfNewDeposit(deposit: BankDeposit): Promise<void> {
    try {
      // Obtener administradores
      const adminsSnapshot = await db.collection('users')
        .where('roll', 'in', ['admin', 'superadmin', 'senioradmin'])
        .get();

      const adminEmails = adminsSnapshot.docs.map(doc => doc.data().userEmail);

      // Enviar notificación a cada administrador
      for (const adminEmail of adminEmails) {
        await pushNotificationService.sendNotificationToUser(adminEmail, {
          title: 'Nuevo Depósito Pendiente',
          body: `Usuario ${deposit.userEmail} reportó un depósito de ${deposit.amount} ${deposit.currency}`,
          type: 'deposit_pending',
          category: 'payments',
          data: { depositId: deposit.id }
        });
      }
    } catch (error) {
      logger.error('Error notificando administradores:', error as Error);
    }
  }

  /**
   * Notificar al usuario del estado de su depósito
   */
  private async notifyUserOfDepositStatus(
    userEmail: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<void> {
    try {
      const title = action === 'approve' ? 'Depósito Aprobado' : 'Depósito Rechazado';
      const body = action === 'approve' 
        ? 'Tu depósito ha sido aprobado y tu balance ha sido actualizado.'
        : `Tu depósito fue rechazado. Razón: ${reason || 'No especificada'}`;

      await pushNotificationService.sendNotificationToUser(userEmail, {
        title,
        body,
        type: 'deposit_status',
        category: 'payments',
        data: { action, reason }
      });
    } catch (error) {
      logger.error('Error notificando usuario:', error as Error, { userId: userEmail });
    }
  }

  /**
   * Obtener estadísticas de depósitos
   */
  async getDepositStats(period?: string): Promise<any> {
    try {
      const snapshot = await db.collection(this.COLLECTION_DEPOSITS).get();
      const deposits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as BankDeposit);

      const stats = {
        total: deposits.length,
        pending: deposits.filter(d => d.status === 'pending').length,
        approved: deposits.filter(d => d.status === 'approved').length,
        rejected: deposits.filter(d => d.status === 'rejected').length,
        totalAmount: deposits
          .filter(d => d.status === 'approved')
          .reduce((sum, d) => sum + d.amount, 0),
        duplicates: deposits.filter(d => d.isDuplicate).length
      };

      return stats;
    } catch (error) {
      logger.error('Error obteniendo estadísticas de depósitos:', error as Error);
      throw error;
    }
  }

  /**
   * Obtener cuentas bancarias de Mussikon
   */
  async getBankAccounts(): Promise<BankAccount[]> {
    try {
      const snapshot = await db.collection(this.COLLECTION_BANK_ACCOUNTS)
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as BankAccount);
    } catch (error) {
      logger.error('Error obteniendo cuentas bancarias:', error as Error);
      throw error;
    }
  }
} 