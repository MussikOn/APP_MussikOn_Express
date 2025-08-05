import { Request, Response } from 'express';
import { PaymentSystemService } from '../services/paymentSystemService';
import { logger } from '../services/loggerService';
import { db } from '../utils/firebase';
import { 
  BankAccountData, 
  DepositRequest, 
  WithdrawalRequestData, 
  EventPaymentRequest 
} from '../types/paymentTypes';
import { generatePresignedUrl } from '../utils/idriveE2';

export class PaymentSystemController {
  private paymentService: PaymentSystemService;

  constructor() {
    this.paymentService = new PaymentSystemService();
  }

  /**
   * Obtener balance de usuario
   */
  async getUserBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const balance = await this.paymentService.getUserBalance(userId);
      
      res.status(200).json({
        success: true,
        data: balance
      });
    } catch (error) {
      logger.error('Error obteniendo balance de usuario', error as Error, { 
        metadata: { userId: (req as any).user?.userEmail } 
      });
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo balance de usuario'
      });
    }
  }

  /**
   * Registrar cuenta bancaria
   */
  async registerBankAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const accountData: BankAccountData = req.body;
      
      // Validaciones básicas
      if (!accountData.accountHolder || !accountData.accountNumber || !accountData.bankName) {
        res.status(400).json({ error: 'Datos de cuenta bancaria incompletos' });
        return;
      }

      const bankAccount = await this.paymentService.registerBankAccount(userId, accountData);
      
      res.status(200).json({
        success: true,
        data: bankAccount
      });
    } catch (error) {
      logger.error('Error registrando cuenta bancaria', error as Error, { 
        metadata: { userId: (req as any).user?.userEmail } 
      });
      
      res.status(500).json({
        success: false,
        error: 'Error registrando cuenta bancaria'
      });
    }
  }

  /**
   * Obtener cuentas bancarias de usuario
   */
  async getUserBankAccounts(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const accounts = await this.paymentService.getUserBankAccounts(userId);
      
      res.status(200).json({
        success: true,
        data: accounts
      });
    } catch (error) {
      logger.error('Error obteniendo cuentas bancarias', error as Error, { 
        metadata: { userId: (req as any).user?.userEmail } 
      });
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo cuentas bancarias'
      });
    }
  }

  /**
   * Subir comprobante de depósito (MEJORADO)
   */
  async uploadDepositVoucher(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No se proporcionó archivo de comprobante' });
        return;
      }

      const { 
        amount, 
        accountHolderName, 
        accountNumber, 
        bankName, 
        depositDate, 
        depositTime, 
        referenceNumber, 
        comments 
      } = req.body;
      
      if (!amount || isNaN(Number(amount))) {
        res.status(400).json({ error: 'Monto inválido' });
        return;
      }

      if (!accountHolderName || !bankName) {
        res.status(400).json({ error: 'Nombre del titular y banco son obligatorios' });
        return;
      }

      const depositData: DepositRequest = {
        amount: Number(amount),
        voucherFile: req.file,
        accountHolderName,
        accountNumber,
        bankName,
        depositDate,
        depositTime,
        referenceNumber,
        comments
      };

      logger.info('Subiendo comprobante de depósito', { metadata: { userId, amount } });

      const deposit = await this.paymentService.uploadDepositVoucher(userId, depositData);
      
      // Notificar automáticamente a todos los administradores
      await this.notifyAdminsAboutNewDeposit(deposit, userId);
      
      res.status(201).json({
        success: true,
        data: deposit,
        message: 'Depósito subido exitosamente. Pendiente de verificación por administrador.'
      });
    } catch (error) {
      logger.error('Error subiendo comprobante de depósito', error as Error, { 
        metadata: { userId: (req as any).user?.userEmail } 
      });
      
      // Manejar errores específicos
      if (error instanceof Error) {
        if (error.message.includes('monto mínimo') || error.message.includes('monto máximo')) {
          res.status(400).json({
            success: false,
            error: error.message
          });
          return;
        }
        
        if (error.message.includes('archivo') || error.message.includes('tamaño')) {
          res.status(400).json({
            success: false,
            error: error.message
          });
          return;
        }
      }
      
      res.status(500).json({
        success: false,
        error: 'Error subiendo comprobante de depósito'
      });
    }
  }

  /**
   * Obtener depósitos del usuario (MEJORADO)
   */
  async getUserDeposits(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const deposits = await this.paymentService.getUserDeposits(userId);
      
      res.status(200).json({
        success: true,
        data: deposits,
        message: 'Depósitos obtenidos exitosamente'
      });
    } catch (error) {
      logger.error('Error obteniendo depósitos del usuario', error as Error, { 
        metadata: { userId: (req as any).user?.userEmail } 
      });
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo depósitos del usuario'
      });
    }
  }

  /**
   * Notificar a administradores sobre nuevo depósito
   */
  private async notifyAdminsAboutNewDeposit(deposit: any, userId: string): Promise<void> {
    try {
      // Obtener todos los usuarios administradores
      const adminsSnapshot = await db.collection('users')
        .where('roll', 'in', ['admin', 'superadmin'])
        .get();

      const adminEmails = adminsSnapshot.docs.map(doc => doc.data().userEmail);

      // Crear notificación para cada administrador
      const notificationPromises = adminEmails.map(adminEmail => 
        db.collection('notifications').add({
          userId: adminEmail,
          title: 'Nuevo Depósito Pendiente',
          message: `Usuario ${userId} ha subido un depósito de RD$ ${deposit.amount.toLocaleString()}`,
          type: 'info',
          category: 'payment',
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            depositId: deposit.id,
            userId: userId,
            amount: deposit.amount,
            voucherUrl: deposit.voucherFile.url,
            accountHolderName: deposit.accountHolderName,
            bankName: deposit.bankName
          }
        })
      );

      await Promise.all(notificationPromises);

      logger.info('Notificaciones enviadas a administradores', { 
        metadata: { 
          depositId: deposit.id, 
          adminCount: adminEmails.length 
        } 
      });

      // Enviar push notifications si está disponible
      try {
        const { pushNotificationService } = await import('../services/pushNotificationService');
        
        const pushPromises = adminEmails.map(adminEmail =>
          pushNotificationService.sendNotificationToUser(adminEmail, {
            title: 'Nuevo Depósito Pendiente',
            body: `Usuario ${userId} ha subido un depósito de RD$ ${deposit.amount.toLocaleString()}`,
            data: {
              depositId: deposit.id,
              type: 'new_deposit',
              amount: deposit.amount,
              userId: userId
            },
            type: 'payment',
            category: 'deposit'
          })
        );

        await Promise.all(pushPromises);
      } catch (pushError) {
        logger.warn('Error enviando push notifications a administradores', pushError as Error);
      }

    } catch (error) {
      logger.error('Error notificando a administradores sobre nuevo depósito', error as Error);
    }
  }

  /**
   * Pagar músico por evento
   */
  async payMusicianForEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const { eventId } = req.params;
      const { musicianId, amount } = req.body;
      
      if (!musicianId || !amount || isNaN(Number(amount))) {
        res.status(400).json({ error: 'Datos de pago incompletos' });
        return;
      }

      const paymentData: EventPaymentRequest = {
        eventId,
        organizerId: userId,
        musicianId,
        amount: Number(amount)
      };

      logger.info('Procesando pago de evento', { 
        metadata: { 
          eventId,
          organizerId: userId,
          musicianId,
          amount
        }
      });

      const payment = await this.paymentService.processEventPayment(paymentData);
      
      res.status(200).json({
        success: true,
        data: payment
      });
    } catch (error) {
      logger.error('Error procesando pago de evento', error as Error, { 
        metadata: { eventId: req.params.eventId } 
      });
      
      // Manejar errores específicos
      if (error instanceof Error) {
        if (error.message.includes('Saldo insuficiente')) {
          res.status(400).json({
            success: false,
            error: error.message
          });
          return;
        }
      }
      
      res.status(500).json({
        success: false,
        error: 'Error procesando pago de evento'
      });
    }
  }

  /**
   * Obtener ganancias de músico
   */
  async getMusicianEarnings(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const earnings = await this.paymentService.getMusicianEarnings(userId);
      
      res.status(200).json({
        success: true,
        data: earnings
      });
    } catch (error) {
      logger.error('Error obteniendo ganancias de músico', error as Error, { 
        metadata: { userId: (req as any).user?.userEmail } 
      });
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo ganancias de músico'
      });
    }
  }

  /**
   * Solicitar retiro de ganancias (MEJORADO)
   */
  async requestWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const { amount, bankAccountId } = req.body;
      
      if (!amount || !bankAccountId || isNaN(Number(amount))) {
        res.status(400).json({ error: 'Datos de retiro incompletos' });
        return;
      }

      const withdrawalData: WithdrawalRequestData = {
        amount: Number(amount),
        bankAccountId
      };

      logger.info('Solicitando retiro de ganancias', { metadata: { userId, amount: withdrawalData.amount } });

      const withdrawal = await this.paymentService.requestWithdrawal(userId, withdrawalData);
      
      res.status(200).json({
        success: true,
        data: withdrawal,
        message: 'Solicitud de retiro creada exitosamente'
      });
    } catch (error) {
      logger.error('Error solicitando retiro', error as Error, { 
        metadata: { userId: (req as any).user?.userEmail } 
      });
      
      // Manejar errores específicos
      if (error instanceof Error) {
        if (error.message.includes('monto mínimo') || error.message.includes('Saldo insuficiente')) {
          res.status(400).json({
            success: false,
            error: error.message
          });
          return;
        }
        
        if (error.message.includes('Cuenta bancaria no encontrada')) {
          res.status(400).json({
            success: false,
            error: error.message
          });
          return;
        }
      }
      
      res.status(500).json({
        success: false,
        error: 'Error solicitando retiro'
      });
    }
  }

  // ===== ENDPOINTS DE ADMINISTRACIÓN =====

  /**
   * Obtener depósitos pendientes (admin)
   */
  async getPendingDeposits(req: Request, res: Response): Promise<void> {
    try {
      const deposits = await this.paymentService.getPendingDeposits();
      
      res.status(200).json({
        success: true,
        data: deposits
      });
    } catch (error) {
      logger.error('Error obteniendo depósitos pendientes', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo depósitos pendientes'
      });
    }
  }

  /**
   * Verificar depósito (admin) - MEJORADO
   */
  async verifyDeposit(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user?.userEmail;
      const { depositId } = req.params;
      const { approved, notes, verificationData } = req.body;
      
      if (typeof approved !== 'boolean') {
        res.status(400).json({ error: 'Estado de aprobación inválido' });
        return;
      }

      // Si se aprueba, validar que se proporcionen los datos de verificación
      if (approved && (!verificationData || !verificationData.bankDepositDate || !verificationData.referenceNumber)) {
        res.status(400).json({ 
          error: 'Para aprobar un depósito, debe proporcionar fecha del depósito y número de referencia' 
        });
        return;
      }

      logger.info('Verificando depósito', { metadata: { depositId, adminId, approved } });

      await this.paymentService.verifyDeposit(depositId, adminId, approved, notes);
      
      // Notificar al usuario sobre el resultado
      await this.notifyUserAboutDepositVerification(depositId, approved, notes);
      
      res.status(200).json({
        success: true,
        data: {
          depositId,
          status: approved ? 'approved' : 'rejected',
          verifiedBy: adminId,
          verifiedAt: new Date().toISOString(),
          userBalanceUpdated: approved
        },
        message: `Depósito ${approved ? 'aprobado' : 'rechazado'} exitosamente`
      });
    } catch (error) {
      logger.error('Error verificando depósito', error as Error, { 
        metadata: { depositId: req.params.depositId, adminId: (req as any).user?.userEmail } 
      });
      
      // Manejar errores específicos
      if (error instanceof Error) {
        if (error.message.includes('Depósito no encontrado') || error.message.includes('ya fue procesado')) {
          res.status(400).json({
            success: false,
            error: error.message
          });
          return;
        }
      }
      
      res.status(500).json({
        success: false,
        error: 'Error verificando depósito'
      });
    }
  }

  /**
   * Notificar al usuario sobre la verificación de su depósito
   */
  private async notifyUserAboutDepositVerification(depositId: string, approved: boolean, notes?: string): Promise<void> {
    try {
      // Obtener información del depósito
      const depositDoc = await db.collection('user_deposits').doc(depositId).get();
      if (!depositDoc.exists) return;

      const deposit = depositDoc.data() as any;
      const userId = deposit.userId;

      // Crear notificación para el usuario
      await db.collection('notifications').add({
        userId: userId,
        title: approved ? 'Depósito Aprobado' : 'Depósito Rechazado',
        message: approved 
          ? `Tu depósito de RD$ ${deposit.amount.toLocaleString()} ha sido aprobado y agregado a tu balance`
          : `Tu depósito ha sido rechazado: ${notes || 'Sin especificar'}`,
        type: approved ? 'success' : 'error',
        category: 'payment',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          depositId: depositId,
          amount: deposit.amount,
          status: approved ? 'approved' : 'rejected',
          notes: notes
        }
      });

      // Enviar push notification si está disponible
      try {
        const { pushNotificationService } = await import('../services/pushNotificationService');
        
        await pushNotificationService.sendNotificationToUser(userId, {
          title: approved ? 'Depósito Aprobado' : 'Depósito Rechazado',
          body: approved
            ? `Tu depósito de RD$ ${deposit.amount.toLocaleString()} ha sido aprobado`
            : `Tu depósito ha sido rechazado: ${notes || 'Sin especificar'}`,
          data: {
            depositId: depositId,
            type: approved ? 'deposit_approved' : 'deposit_rejected',
            amount: deposit.amount
          },
          type: 'payment',
          category: 'deposit'
        });
      } catch (pushError) {
        logger.warn('Error enviando push notification al usuario', pushError as Error);
      }

      logger.info('Usuario notificado sobre verificación de depósito', { 
        metadata: { depositId, userId, approved } 
      });

    } catch (error) {
      logger.error('Error notificando al usuario sobre verificación de depósito', error as Error);
    }
  }

  /**
   * Obtener retiros pendientes (admin)
   */
  async getPendingWithdrawals(req: Request, res: Response): Promise<void> {
    try {
      const withdrawals = await this.paymentService.getPendingWithdrawals();
      
      res.status(200).json({
        success: true,
        data: withdrawals
      });
    } catch (error) {
      logger.error('Error obteniendo retiros pendientes', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo retiros pendientes'
      });
    }
  }

  /**
   * Procesar retiro (admin)
   */
  async processWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user?.userEmail;
      const { withdrawalId } = req.params;
      const { approved, notes } = req.body;
      
      if (typeof approved !== 'boolean') {
        res.status(400).json({ error: 'Estado de aprobación inválido' });
        return;
      }

      logger.info('Procesando retiro', { metadata: { withdrawalId, adminId, approved } });

      await this.paymentService.processWithdrawal(withdrawalId, adminId, approved, notes);
      
      res.status(200).json({
        success: true,
        message: `Retiro ${approved ? 'aprobado' : 'rechazado'} exitosamente`
      });
    } catch (error) {
      logger.error('Error procesando retiro', error as Error, { 
        metadata: { withdrawalId: req.params.withdrawalId, adminId: (req as any).user?.userEmail } 
      });
      
      res.status(500).json({
        success: false,
        error: 'Error procesando retiro'
      });
    }
  }

  /**
   * Obtener estadísticas de pagos (admin) (DPT - DEPÓSITO)
   */
  async dptGetPaymentStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.paymentService.getPaymentStatistics();
      
      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Error obteniendo estadísticas de pagos', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estadísticas de pagos'
      });
    }
  }

  /**
   * Obtener estadísticas de pagos (admin) - MÉTODO LEGACY
   */
  async getPaymentStatistics(req: Request, res: Response): Promise<void> {
    await this.dptGetPaymentStatistics(req, res);
  }

  /**
   * Obtener detalles de un depósito específico (admin)
   */
  async getDepositDetails(req: Request, res: Response): Promise<void> {
    try {
      const { depositId } = req.params;
      
      const deposit = await this.paymentService.getDepositDetails(depositId);
      
      if (!deposit) {
        res.status(404).json({
          success: false,
          error: 'Depósito no encontrado'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: deposit
      });
    } catch (error) {
      logger.error('Error obteniendo detalles del depósito', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo detalles del depósito'
      });
    }
  }

  /**
   * Verificar duplicados de voucher (admin)
   */
  async checkVoucherDuplicates(req: Request, res: Response): Promise<void> {
    try {
      const { depositId } = req.params;
      
      if (!depositId) {
        res.status(400).json({
          success: false,
          error: 'ID de depósito requerido'
        });
        return;
      }

      logger.info('Verificando duplicados de voucher', { metadata: { depositId } });

      const duplicates = await this.paymentService.checkVoucherDuplicates(depositId);
      
      res.status(200).json({
        success: true,
        data: duplicates
      });
    } catch (error) {
      logger.error('Error verificando duplicados de voucher', error as Error, { 
        metadata: { depositId: req.params.depositId } 
      });
      
      res.status(500).json({
        success: false,
        error: 'Error verificando duplicados de voucher'
      });
    }
  }

  // ===== MÉTODOS DPT (DEPÓSITOS) =====

  /**
   * Subir comprobante de depósito (DPT - DEPÓSITO)
   */
  async dptUploadDepositVoucher(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const { amount, description } = req.body;
      const voucherFile = req.file;

      // Validaciones básicas
      if (!amount || !voucherFile) {
        res.status(400).json({ error: 'Monto y comprobante son requeridos' });
        return;
      }

      const depositData: DepositRequest = {
        amount: parseFloat(amount),
        voucherFile,
        accountHolderName: 'Usuario', // Valor por defecto
        bankName: 'Banco' // Valor por defecto
      };

      const deposit = await this.paymentService.uploadDepositVoucher(userId, depositData);
      
      // Notificar a administradores sobre nuevo depósito
      await this.notifyAdminsAboutNewDeposit(deposit, userId);
      
      res.status(201).json({
        success: true,
        data: deposit,
        message: 'Comprobante de depósito subido exitosamente'
      });
    } catch (error) {
      logger.error('Error subiendo comprobante de depósito', error as Error, { 
        metadata: { userId: (req as any).user?.userEmail } 
      });
      
      res.status(500).json({
        success: false,
        error: 'Error subiendo comprobante de depósito'
      });
    }
  }

  /**
   * Obtener historial de depósitos del usuario (DPT - DEPÓSITO)
   */
  async dptGetUserDeposits(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const deposits = await this.paymentService.getUserDeposits(userId);
      
      res.status(200).json({
        success: true,
        data: deposits
      });
    } catch (error) {
      logger.error('Error obteniendo depósitos del usuario', error as Error, { 
        metadata: { userId: (req as any).user?.userEmail } 
      });
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo depósitos del usuario'
      });
    }
  }

  /**
   * Obtener depósitos pendientes (admin) (DPT - DEPÓSITO)
   */
  async dptGetPendingDeposits(req: Request, res: Response): Promise<void> {
    try {
      const deposits = await this.paymentService.getPendingDeposits();
      
      res.status(200).json({
        success: true,
        data: deposits
      });
    } catch (error) {
      logger.error('Error obteniendo depósitos pendientes', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo depósitos pendientes'
      });
    }
  }

  /**
   * Verificar depósito (admin) (DPT - DEPÓSITO)
   */
  async dptVerifyDeposit(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user?.userEmail;
      const { depositId } = req.params;
      const { approved, notes, verificationData } = req.body;
      
      if (typeof approved !== 'boolean') {
        res.status(400).json({ error: 'Estado de aprobación inválido' });
        return;
      }

      logger.info('Verificando depósito', { metadata: { depositId, adminId, approved } });

      await this.paymentService.verifyDeposit(depositId, adminId, approved, notes);
      
      // Notificar al usuario sobre la verificación
      await this.notifyUserAboutDepositVerification(depositId, approved, notes);
      
      res.status(200).json({
        success: true,
        message: `Depósito ${approved ? 'aprobado' : 'rechazado'} exitosamente`
      });
    } catch (error) {
      logger.error('Error verificando depósito', error as Error, { 
        metadata: { depositId: req.params.depositId, adminId: (req as any).user?.userEmail } 
      });
      
      res.status(500).json({
        success: false,
        error: 'Error verificando depósito'
      });
    }
  }

  /**
   * Obtener detalles de un depósito específico (admin) (DPT - DEPÓSITO)
   */
  async dptGetDepositDetails(req: Request, res: Response): Promise<void> {
    try {
      const { depositId } = req.params;
      
      const deposit = await this.paymentService.getDepositDetails(depositId);
      
      if (!deposit) {
        res.status(404).json({
          success: false,
          error: 'Depósito no encontrado'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: deposit
      });
    } catch (error) {
      logger.error('Error obteniendo detalles del depósito', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo detalles del depósito'
      });
    }
  }

  /**
   * Verificar duplicados de voucher (admin) (DPT - DEPÓSITO)
   */
  async dptCheckVoucherDuplicates(req: Request, res: Response): Promise<void> {
    try {
      const { depositId } = req.params;
      
      if (!depositId) {
        res.status(400).json({
          success: false,
          error: 'ID de depósito requerido'
        });
        return;
      }

      logger.info('Verificando duplicados de voucher', { metadata: { depositId } });

      const duplicates = await this.paymentService.checkVoucherDuplicates(depositId);
      
      res.status(200).json({
        success: true,
        data: duplicates
      });
    } catch (error) {
      logger.error('Error verificando duplicados de voucher', error as Error, { 
        metadata: { depositId: req.params.depositId } 
      });
      
      res.status(500).json({
        success: false,
        error: 'Error verificando duplicados de voucher'
      });
    }
  }
} 

/**
 * Genera una URL firmada para acceder a un comprobante de pago
 * Resuelve problemas de CORS y Access Denied en el frontend
 */
export const getVoucherPresignedUrl = async (req: Request, res: Response) => {
  try {
    const { depositId } = req.params;
    
    if (!depositId) {
      res.status(400).json({
        success: false,
        error: 'ID de depósito requerido'
      });
      return;
    }

    logger.info('[src/controllers/paymentSystemController.ts] Generando URL firmada para comprobante:', { metadata: { depositId } });

    // Obtener información del depósito
    const paymentSystemService = new PaymentSystemService();
    const deposit = await paymentSystemService.getDepositDetails(depositId);
    
    if (!deposit) {
      res.status(404).json({
        success: false,
        error: 'Depósito no encontrado'
      });
      return;
    }

    // Verificar que el usuario tenga permisos para ver este depósito
    const userId = (req as any).user?.uid;
    if (!userId || (deposit.userId !== userId && !(req as any).user?.role?.includes('admin'))) {
      res.status(403).json({
        success: false,
        error: 'No tienes permisos para acceder a este depósito'
      });
      return;
    }

    // Obtener la clave del archivo del comprobante desde la URL
    const voucherKey = deposit.voucherFile?.url?.split('/').pop();
    
    if (!voucherKey) {
      res.status(404).json({
        success: false,
        error: 'Comprobante no encontrado'
      });
      return;
    }

    // Generar URL firmada
    const presignedUrl = await generatePresignedUrl(voucherKey, 3600); // 1 hora

    logger.info('[src/controllers/paymentSystemController.ts] URL firmada generada exitosamente:', { metadata: { depositId, voucherKey } });

    res.status(200).json({
      success: true,
      data: {
        presignedUrl,
        expiresIn: 3600,
        depositId,
        voucherKey
      },
      message: 'URL firmada generada exitosamente'
    });

  } catch (error) {
    logger.error('[src/controllers/paymentSystemController.ts] Error generando URL firmada:', error instanceof Error ? error : new Error(String(error)));
    
    res.status(500).json({
      success: false,
      error: 'Error generando URL firmada del comprobante'
    });
  }
}; 