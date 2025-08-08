import { Request, Response } from 'express';
import { voucherService } from '../services/voucherService';
import { logger } from '../services/loggerService';

export class VoucherController {
  /**
   * Subir voucher con referencia a IDrive E2
   */
  async uploadVoucher(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ 
          success: false, 
          error: 'Usuario no autenticado' 
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({ 
          success: false, 
          error: 'No se proporcionó archivo de voucher' 
        });
        return;
      }

      const {
        amount,
        accountHolderName,
        bankName,
        accountNumber,
        depositDate,
        depositTime,
        referenceNumber,
        comments
      } = req.body;

      // Validaciones
      if (!amount || !accountHolderName || !bankName) {
        res.status(400).json({ 
          success: false, 
          error: 'Monto, nombre del titular y banco son requeridos' 
        });
        return;
      }

      const depositData = {
        amount: Number(amount),
        accountHolderName,
        bankName,
        accountNumber,
        depositDate,
        depositTime,
        referenceNumber,
        comments
      };

      logger.info('[src/controllers/voucherController.ts] Subiendo voucher', { 
        metadata: { userId, amount: depositData.amount, filename: req.file.originalname } 
      });

      const deposit = await voucherService.uploadVoucher(userId, req.file, depositData);

      res.status(201).json({
        success: true,
        message: 'Voucher subido exitosamente',
        data: {
          depositId: deposit.id,
          amount: deposit.amount,
          status: deposit.status,
          uploadedAt: deposit.voucherFile.uploadedAt,
          // No incluimos la URL temporal aquí, se obtiene por separado
        }
      });

    } catch (error) {
      logger.error('[src/controllers/voucherController.ts] Error subiendo voucher', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({ 
        success: false, 
        error: `Error subiendo voucher: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  }

  /**
   * Obtener voucher con URL firmada temporal
   */
  async getVoucher(req: Request, res: Response): Promise<void> {
    try {
      const { depositId } = req.params;
      
      if (!depositId) {
        res.status(400).json({ 
          success: false, 
          error: 'ID de depósito requerido' 
        });
        return;
      }

      logger.info('[src/controllers/voucherController.ts] Obteniendo voucher', { 
        metadata: { depositId } 
      });

      const deposit = await voucherService.getVoucherWithSignedUrl(depositId);

      res.status(200).json({
        success: true,
        message: 'Voucher obtenido exitosamente',
        data: {
          ...deposit,
          voucherFile: {
            ...deposit.voucherFile,
            // Incluimos la URL temporal para visualización
            displayUrl: deposit.voucherFile.tempUrl,
            // No incluimos tempUrl en la respuesta principal
            tempUrl: undefined
          }
        }
      });

    } catch (error) {
      logger.error('[src/controllers/voucherController.ts] Error obteniendo voucher', error instanceof Error ? error : new Error(String(error)));
      
      if (error instanceof Error && error.message.includes('no encontrado')) {
        res.status(404).json({ 
          success: false, 
          error: 'Voucher no encontrado' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: `Error obteniendo voucher: ${error instanceof Error ? error.message : String(error)}` 
        });
      }
    }
  }

  /**
   * Obtener múltiples vouchers con URLs firmadas
   */
  async getVouchers(req: Request, res: Response): Promise<void> {
    try {
      const { depositIds } = req.body;
      
      if (!depositIds || !Array.isArray(depositIds) || depositIds.length === 0) {
        res.status(400).json({ 
          success: false, 
          error: 'Lista de IDs de depósitos requerida' 
        });
        return;
      }

      if (depositIds.length > 50) {
        res.status(400).json({ 
          success: false, 
          error: 'Máximo 50 vouchers por consulta' 
        });
        return;
      }

      logger.info('[src/controllers/voucherController.ts] Obteniendo múltiples vouchers', { 
        metadata: { count: depositIds.length } 
      });

      const deposits = await voucherService.getVouchersWithSignedUrls(depositIds);

      res.status(200).json({
        success: true,
        message: `${deposits.length} vouchers obtenidos exitosamente`,
        data: deposits.map(deposit => ({
          ...deposit,
          voucherFile: {
            ...deposit.voucherFile,
            displayUrl: deposit.voucherFile.tempUrl,
            tempUrl: undefined
          }
        }))
      });

    } catch (error) {
      logger.error('[src/controllers/voucherController.ts] Error obteniendo vouchers', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({ 
        success: false, 
        error: `Error obteniendo vouchers: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  }

  /**
   * Verificar integridad del voucher
   */
  async verifyVoucherIntegrity(req: Request, res: Response): Promise<void> {
    try {
      const { depositId } = req.params;
      
      if (!depositId) {
        res.status(400).json({ 
          success: false, 
          error: 'ID de depósito requerido' 
        });
        return;
      }

      logger.info('[src/controllers/voucherController.ts] Verificando integridad del voucher', { 
        metadata: { depositId } 
      });

      const integrity = await voucherService.verifyVoucherIntegrity(depositId);

      res.status(200).json({
        success: true,
        message: 'Verificación de integridad completada',
        data: {
          depositId,
          ...integrity
        }
      });

    } catch (error) {
      logger.error('[src/controllers/voucherController.ts] Error verificando integridad', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({ 
        success: false, 
        error: `Error verificando integridad: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  }

  /**
   * Eliminar voucher
   */
  async deleteVoucher(req: Request, res: Response): Promise<void> {
    try {
      const { depositId } = req.params;
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ 
          success: false, 
          error: 'Usuario no autenticado' 
        });
        return;
      }

      if (!depositId) {
        res.status(400).json({ 
          success: false, 
          error: 'ID de depósito requerido' 
        });
        return;
      }

      logger.info('[src/controllers/voucherController.ts] Eliminando voucher', { 
        metadata: { depositId, userId } 
      });

      const deleted = await voucherService.deleteVoucher(depositId);

      if (deleted) {
        res.status(200).json({
          success: true,
          message: 'Voucher eliminado exitosamente',
          data: { depositId }
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Voucher no encontrado'
        });
      }

    } catch (error) {
      logger.error('[src/controllers/voucherController.ts] Error eliminando voucher', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({ 
        success: false, 
        error: `Error eliminando voucher: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  }

  /**
   * Obtener estadísticas de vouchers
   */
  async getVoucherStatistics(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ 
          success: false, 
          error: 'Usuario no autenticado' 
        });
        return;
      }

      logger.info('[src/controllers/voucherController.ts] Obteniendo estadísticas de vouchers', { 
        metadata: { userId } 
      });

      const statistics = await voucherService.getVoucherStatistics();

      res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: statistics
      });

    } catch (error) {
      logger.error('[src/controllers/voucherController.ts] Error obteniendo estadísticas', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({ 
        success: false, 
        error: `Error obteniendo estadísticas: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  }

  /**
   * Actualizar imagen de voucher existente
   */
  async updateVoucherImage(req: Request, res: Response): Promise<void> {
    try {
      const { voucherId } = req.params;
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ 
          success: false, 
          error: 'Usuario no autenticado' 
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({ 
          success: false, 
          error: 'No se proporcionó archivo de imagen' 
        });
        return;
      }

      if (!voucherId) {
        res.status(400).json({ 
          success: false, 
          error: 'ID de voucher requerido' 
        });
        return;
      }

      logger.info('[src/controllers/voucherController.ts] Actualizando imagen de voucher', { 
        metadata: { voucherId, userId, filename: req.file.originalname } 
      });

      const updatedDeposit = await voucherService.updateVoucherImage(
        voucherId,
        userId,
        req.file
      );

      res.status(200).json({
        success: true,
        message: 'Imagen del voucher actualizada exitosamente',
        data: {
          id: updatedDeposit.id,
          depositId: updatedDeposit.id,
          userId: updatedDeposit.userId,
          amount: updatedDeposit.amount,
          currency: updatedDeposit.currency,
          status: updatedDeposit.status,
          voucherUrl: updatedDeposit.voucherFile?.idriveKey,
          voucherFile: {
            url: updatedDeposit.voucherFile?.idriveKey,
            filename: updatedDeposit.voucherFile?.filename,
            uploadedAt: updatedDeposit.voucherFile?.uploadedAt,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            hash: req.file.buffer.toString('base64').substring(0, 16) // Hash simple
          },
          hasVoucherFile: true,
          createdAt: updatedDeposit.createdAt,
          updatedAt: updatedDeposit.updatedAt
        }
      });

    } catch (error) {
      logger.error('[src/controllers/voucherController.ts] Error actualizando imagen de voucher', error instanceof Error ? error : new Error(String(error)));
      
      if (error instanceof Error) {
        if (error.message.includes('no encontrado')) {
          res.status(404).json({ 
            success: false, 
            error: 'Voucher no encontrado' 
          });
        } else if (error.message.includes('permisos')) {
          res.status(403).json({ 
            success: false, 
            error: 'No tienes permisos para actualizar este voucher' 
          });
        } else {
          res.status(500).json({ 
            success: false, 
            error: `Error actualizando imagen: ${error.message}` 
          });
        }
      } else {
        res.status(500).json({ 
          success: false, 
          error: 'Error interno del servidor' 
        });
      }
    }
  }
}

// Instancia singleton
export const voucherController = new VoucherController(); 