import { Request, Response } from 'express';
import { PaymentSystemService } from '../services/paymentSystemService';
import { logger } from '../services/loggerService';
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
      
      res.json({
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
      
      res.json({
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
      
      res.json({
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
   * Subir comprobante de depósito
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

      const { amount } = req.body;
      
      if (!amount || isNaN(Number(amount))) {
        res.status(400).json({ error: 'Monto inválido' });
        return;
      }

      const depositData: DepositRequest = {
        amount: Number(amount),
        voucherFile: req.file
      };

      logger.info('Subiendo comprobante de depósito', { metadata: { userId, amount } });

      const deposit = await this.paymentService.uploadDepositVoucher(userId, depositData);
      
      res.json({
        success: true,
        data: deposit
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
   * Obtener depósitos del usuario
   */
  async getUserDeposits(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      // TODO: Implementar método en el servicio
      res.json({
        success: true,
        data: [],
        message: 'Funcionalidad en desarrollo'
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
      
      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      logger.error('Error procesando pago de evento', error as Error, { 
        metadata: { eventId: req.params.eventId } 
      });
      
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
      
      res.json({
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
   * Solicitar retiro de ganancias
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
      
      res.json({
        success: true,
        data: withdrawal
      });
    } catch (error) {
      logger.error('Error solicitando retiro', error as Error, { 
        metadata: { userId: (req as any).user?.userEmail } 
      });
      
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
      
      res.json({
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
   * Verificar depósito (admin)
   */
  async verifyDeposit(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user?.userEmail;
      const { depositId } = req.params;
      const { approved, notes } = req.body;
      
      if (typeof approved !== 'boolean') {
        res.status(400).json({ error: 'Estado de aprobación inválido' });
        return;
      }

      logger.info('Verificando depósito', { metadata: { depositId, adminId, approved } });

      await this.paymentService.verifyDeposit(depositId, adminId, approved, notes);
      
      res.json({
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
   * Obtener retiros pendientes (admin)
   */
  async getPendingWithdrawals(req: Request, res: Response): Promise<void> {
    try {
      const withdrawals = await this.paymentService.getPendingWithdrawals();
      
      res.json({
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
      
      res.json({
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
   * Obtener estadísticas de pagos (admin)
   */
  async getPaymentStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.paymentService.getPaymentStatistics();
      
      res.json({
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
   * Obtener detalles de un depósito específico (admin)
   */
  async getDepositDetails(req: Request, res: Response): Promise<void> {
    try {
      const { depositId } = req.params;
      
      if (!depositId) {
        res.status(400).json({ error: 'ID de depósito requerido' });
        return;
      }

      logger.info('Obteniendo detalles de depósito', { metadata: { depositId } });

      const deposit = await this.paymentService.getDepositDetails(depositId);
      
      res.json({
        success: true,
        data: deposit
      });
    } catch (error) {
      logger.error('Error obteniendo detalles de depósito', error as Error, { 
        metadata: { depositId: req.params.depositId } 
      });
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo detalles de depósito'
      });
    }
  }

  /**
   * Verificar si un voucher es duplicado (admin)
   */
  async checkVoucherDuplicates(req: Request, res: Response): Promise<void> {
    try {
      const { depositId } = req.params;
      
      if (!depositId) {
        res.status(400).json({ error: 'ID de depósito requerido' });
        return;
      }

      logger.info('Verificando duplicados de voucher', { metadata: { depositId } });

      const duplicates = await this.paymentService.checkVoucherDuplicates(depositId);
      
      res.json({
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
      return res.status(400).json({
        success: false,
        error: 'ID de depósito requerido'
      });
    }

    logger.info('[functions/src/controllers/paymentSystemController.ts] Generando URL firmada para comprobante:', { metadata: { depositId } });

    // Obtener información del depósito
    const paymentSystemService = new PaymentSystemService();
    const deposit = await paymentSystemService.getDepositDetails(depositId);
    
    if (!deposit) {
      return res.status(404).json({
        success: false,
        error: 'Depósito no encontrado'
      });
    }

    // Verificar que el usuario tenga permisos para ver este depósito
    const userId = (req as any).user?.uid;
    if (!userId || (deposit.userId !== userId && !(req as any).user?.role?.includes('admin'))) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para acceder a este depósito'
      });
    }

    // Obtener la clave del archivo del comprobante desde la URL
    const voucherKey = deposit.voucherFile?.url?.split('/').pop();
    
    if (!voucherKey) {
      return res.status(404).json({
        success: false,
        error: 'Comprobante no encontrado'
      });
    }

    // Generar URL firmada
    const presignedUrl = await generatePresignedUrl(voucherKey, 3600); // 1 hora

    logger.info('[functions/src/controllers/paymentSystemController.ts] URL firmada generada exitosamente:', { metadata: { depositId, voucherKey } });

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
    logger.error('[functions/src/controllers/paymentSystemController.ts] Error generando URL firmada:', error instanceof Error ? error : new Error(String(error)));
    
    res.status(500).json({
      success: false,
      error: 'Error generando URL firmada del comprobante'
    });
  }
}; 