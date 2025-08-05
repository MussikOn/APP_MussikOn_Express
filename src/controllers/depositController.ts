import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { DepositService } from '../services/depositService';
import { logger } from '../services/loggerService';
import { BankDeposit, DepositApproval } from '../utils/DataTypes';

const depositService = new DepositService();

/**
 * POST /deposits/report
 * Reportar un nuevo depósito bancario
 */
export const reportDepositController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { amount, currency, depositDate, bankName, accountNumber, reference, purpose } = req.body;
    const voucherFile = req.file;

    if (!voucherFile) {
      res.status(400).json({
        success: false,
        message: 'El voucher es requerido'
      });
      return;
    }

    logger.info('Reportando depósito DPT:', {
      userId: user.userEmail,
      metadata: { amount, bankName, purpose }
    });

    const depositData = {
      amount: parseFloat(amount),
      currency: currency || 'EUR',
      depositDate: new Date(depositDate),
      bankName,
      accountNumber,
      reference,
      purpose
    };

    const deposit = await depositService.createDepositReport(
      user.userEmail,
      depositData,
      voucherFile
    );

    res.status(201).json({
      success: true,
      message: 'Depósito reportado exitosamente. Pendiente de revisión.',
      data: {
        id: deposit.id,
        status: deposit.status,
        amount: deposit.amount,
        currency: deposit.currency,
        createdAt: deposit.createdAt
      }
    });
  }
);

/**
 * GET /deposits/my-deposits
 * Obtener depósitos del usuario
 */
export const getMyDepositsController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { status } = req.query;

    logger.info('Obteniendo depósitos del usuario:', {
      userId: user.userEmail,
      metadata: { status }
    });

    const deposits = await depositService.getUserDeposits(
      user.userEmail,
      status as string
    );

    res.status(200).json({
      success: true,
      message: 'Depósitos obtenidos exitosamente',
      data: deposits
    });
  }
);

/**
 * GET /deposits/pending (ADMIN ONLY)
 * Obtener depósitos pendientes de revisión
 */
export const getPendingDepositsController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    // Verificar que sea administrador
    if (!['admin', 'superadmin', 'senioradmin'].includes(user.roll)) {
      res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo administradores pueden ver depósitos pendientes.'
      });
      return;
    }

    logger.info('Obteniendo depósitos pendientes:', {
      userId: user.userEmail
    });

    const deposits = await depositService.getPendingDeposits();

    res.status(200).json({
      success: true,
      message: 'Depósitos pendientes obtenidos exitosamente',
      data: deposits
    });
  }
);

/**
 * POST /deposits/:depositId/approve (ADMIN ONLY)
 * Aprobar un depósito
 */
export const approveDepositController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { depositId } = req.params;

    // Verificar que sea administrador
    if (!['admin', 'superadmin', 'senioradmin'].includes(user.roll)) {
      res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo administradores pueden aprobar depósitos.'
      });
      return;
    }

    logger.info('Aprobando depósito DPT:', {
      userId: user.userEmail,
      metadata: { depositId }
    });

    const approval: DepositApproval = {
      depositId,
      action: 'approve',
      adminEmail: user.userEmail
    };

    const deposit = await depositService.processDepositApproval(approval);

    res.status(200).json({
      success: true,
      message: 'Depósito aprobado exitosamente',
      data: {
        id: deposit.id,
        status: deposit.status,
        reviewedBy: deposit.reviewedBy,
        reviewedAt: deposit.reviewedAt
      }
    });
  }
);

/**
 * POST /deposits/:depositId/reject (ADMIN ONLY)
 * Rechazar un depósito
 */
export const rejectDepositController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { depositId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({
        success: false,
        message: 'La razón del rechazo es requerida'
      });
      return;
    }

    // Verificar que sea administrador
    if (!['admin', 'superadmin', 'senioradmin'].includes(user.roll)) {
      res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo administradores pueden rechazar depósitos.'
      });
      return;
    }

    logger.info('Rechazando depósito DPT:', {
      userId: user.userEmail,
      metadata: { depositId, reason }
    });

    const approval: DepositApproval = {
      depositId,
      action: 'reject',
      reason,
      adminEmail: user.userEmail
    };

    const deposit = await depositService.processDepositApproval(approval);

    res.status(200).json({
      success: true,
      message: 'Depósito rechazado exitosamente',
      data: {
        id: deposit.id,
        status: deposit.status,
        rejectionReason: deposit.rejectionReason,
        reviewedBy: deposit.reviewedBy,
        reviewedAt: deposit.reviewedAt
      }
    });
  }
);

/**
 * GET /deposits/stats (ADMIN ONLY)
 * Obtener estadísticas de depósitos
 */
export const getDepositStatsController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { period } = req.query;

    // Verificar que sea administrador
    if (!['admin', 'superadmin', 'senioradmin'].includes(user.roll)) {
      res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo administradores pueden ver estadísticas.'
      });
      return;
    }

    logger.info('Obteniendo estadísticas de depósitos DPT:', {
      userId: user.userEmail,
      metadata: { period }
    });

    const stats = await depositService.getDepositStats(period as string);

    res.status(200).json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: stats
    });
  }
);

/**
 * GET /deposits/bank-accounts
 * Obtener cuentas bancarias de Mussikon
 */
export const getBankAccountsController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.info('Obteniendo cuentas bancarias de Mussikon');

    const bankAccounts = await depositService.getBankAccounts();

    res.status(200).json({
      success: true,
      message: 'Cuentas bancarias obtenidas exitosamente',
      data: bankAccounts
    });
  }
);

/**
 * GET /deposits/:depositId
 * Obtener detalles de un depósito específico
 */
export const getDepositByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { depositId } = req.params;

    logger.info('Obteniendo detalles de depósito:', {
      userId: user.userEmail,
      metadata: { depositId }
    });

    // Obtener el depósito
    const deposits = await depositService.getUserDeposits(user.userEmail);
    const deposit = deposits.find(d => d.id === depositId);

    if (!deposit) {
      res.status(404).json({
        success: false,
        message: 'Depósito no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Depósito obtenido exitosamente',
      data: deposit
    });
  }
); 