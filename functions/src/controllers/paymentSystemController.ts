import { Request, Response } from 'express';
import { PaymentSystemService } from '../services/paymentSystemService';
import { logger } from '../services/loggerService';
import { 
  BankAccountData, 
  DepositRequest, 
  WithdrawalRequestData, 
  EventPaymentRequest 
} from '../types/paymentTypes';

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
} 