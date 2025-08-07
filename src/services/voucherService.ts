import { db } from '../utils/firebase';
import { logger } from './loggerService';
import { uploadToS3, generatePresignedUrl, getFileInfo } from '../utils/idriveE2';
import { UserDeposit } from '../types/paymentTypes';

export class VoucherService {
  private readonly VOUCHER_PREFIX = 'musikon-media/deposits/';

  /**
   * Subir voucher a IDrive E2 y guardar referencia en Firebase
   */
  async uploadVoucher(
    userId: string, 
    file: Express.Multer.File, 
    depositData: {
      amount: number;
      accountHolderName: string;
      bankName: string;
      accountNumber?: string;
      depositDate?: string;
      depositTime?: string;
      referenceNumber?: string;
      comments?: string;
    }
  ): Promise<UserDeposit> {
    try {
      logger.info('[src/services/voucherService.ts] Subiendo voucher a IDrive E2', { 
        metadata: { userId, filename: file.originalname, amount: depositData.amount } 
      });

      // Generar clave única para IDrive E2
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.originalname || 'voucher.jpg'}`;
      const idriveKey = `${this.VOUCHER_PREFIX}${filename}`;

      // Subir archivo a IDrive E2
      const fileUrl = await uploadToS3(
        file.buffer,
        filename,
        file.mimetype || 'image/jpeg',
        'deposits'
      );

      logger.info('[src/services/voucherService.ts] Archivo subido a IDrive E2', { 
        metadata: { idriveKey, fileUrl } 
      });

      // Crear objeto de depósito con referencia a IDrive E2
      const deposit: UserDeposit = {
        id: `deposit_${timestamp}_${userId}`,
        userId,
        amount: depositData.amount,
        currency: 'RD$',
        voucherFile: {
          idriveKey, // Guardamos la clave de IDrive E2, no la URL
          filename: file.originalname || 'voucher.jpg',
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
      };

      // Guardar en Firebase solo la referencia
      await db.collection('user_deposits').doc(deposit.id).set(deposit);

      logger.info('[src/services/voucherService.ts] Voucher guardado en Firebase', { 
        metadata: { depositId: deposit.id, idriveKey } 
      });

      return deposit;
    } catch (error) {
      logger.error('[src/services/voucherService.ts] Error subiendo voucher', error instanceof Error ? error : new Error(String(error)), { 
        metadata: { userId } 
      });
      throw new Error('Error subiendo voucher');
    }
  }

  /**
   * Obtener voucher con URL firmada temporal
   */
  async getVoucherWithSignedUrl(depositId: string): Promise<UserDeposit> {
    try {
      logger.info('[src/services/voucherService.ts] Obteniendo voucher con URL firmada', { 
        metadata: { depositId } 
      });

      const depositDoc = await db.collection('user_deposits').doc(depositId).get();
      
      if (!depositDoc.exists) {
        throw new Error('Depósito no encontrado');
      }

      const deposit = depositDoc.data() as UserDeposit;

      // Verificar que el archivo existe en IDrive E2
      const fileInfo = await getFileInfo(deposit.voucherFile.idriveKey);
      
      if (!fileInfo.exists) {
        throw new Error('Archivo de voucher no encontrado en IDrive E2');
      }

      // Generar URL firmada temporal (1 hora)
      const signedUrl = await generatePresignedUrl(deposit.voucherFile.idriveKey, 3600);

      // Crear copia del depósito con URL temporal
      const depositWithUrl: UserDeposit = {
        ...deposit,
        voucherFile: {
          ...deposit.voucherFile,
          tempUrl: signedUrl // URL temporal para la respuesta
        }
      };

      logger.info('[src/services/voucherService.ts] Voucher obtenido con URL firmada', { 
        metadata: { depositId, idriveKey: deposit.voucherFile.idriveKey } 
      });

      return depositWithUrl;
    } catch (error) {
      logger.error('[src/services/voucherService.ts] Error obteniendo voucher', error instanceof Error ? error : new Error(String(error)), { 
        metadata: { depositId } 
      });
      throw new Error('Error obteniendo voucher');
    }
  }

  /**
   * Obtener múltiples vouchers con URLs firmadas
   */
  async getVouchersWithSignedUrls(depositIds: string[]): Promise<UserDeposit[]> {
    try {
      logger.info('[src/services/voucherService.ts] Obteniendo múltiples vouchers', { 
        metadata: { count: depositIds.length } 
      });

      const deposits: UserDeposit[] = [];

      // Procesar en lotes para evitar sobrecarga
      const batchSize = 10;
      for (let i = 0; i < depositIds.length; i += batchSize) {
        const batch = depositIds.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (depositId) => {
          try {
            return await this.getVoucherWithSignedUrl(depositId);
          } catch (error) {
            logger.warn('[src/services/voucherService.ts] Error obteniendo voucher individual', { 
              metadata: { depositId, error: error instanceof Error ? error.message : String(error) } 
            });
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        deposits.push(...batchResults.filter(deposit => deposit !== null) as UserDeposit[]);
      }

      logger.info('[src/services/voucherService.ts] Vouchers obtenidos exitosamente', { 
        metadata: { requested: depositIds.length, obtained: deposits.length } 
      });

      return deposits;
    } catch (error) {
      logger.error('[src/services/voucherService.ts] Error obteniendo múltiples vouchers', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Error obteniendo vouchers');
    }
  }

  /**
   * Verificar integridad del voucher en IDrive E2
   */
  async verifyVoucherIntegrity(depositId: string): Promise<{
    exists: boolean;
    accessible: boolean;
    size: number;
    lastModified: string;
  }> {
    try {
      logger.info('[src/services/voucherService.ts] Verificando integridad del voucher', { 
        metadata: { depositId } 
      });

      const depositDoc = await db.collection('user_deposits').doc(depositId).get();
      
      if (!depositDoc.exists) {
        return { exists: false, accessible: false, size: 0, lastModified: '' };
      }

      const deposit = depositDoc.data() as UserDeposit;
      const fileInfo = await getFileInfo(deposit.voucherFile.idriveKey);

      const result = {
        exists: fileInfo.exists,
        accessible: fileInfo.exists && fileInfo.size !== undefined,
        size: fileInfo.size || 0,
        lastModified: fileInfo.lastModified?.toISOString() || ''
      };

      logger.info('[src/services/voucherService.ts] Verificación de integridad completada', { 
        metadata: { depositId, ...result } 
      });

      return result;
    } catch (error) {
      logger.error('[src/services/voucherService.ts] Error verificando integridad', error instanceof Error ? error : new Error(String(error)), { 
        metadata: { depositId } 
      });
      return { exists: false, accessible: false, size: 0, lastModified: '' };
    }
  }

  /**
   * Eliminar voucher de IDrive E2 y Firebase
   */
  async deleteVoucher(depositId: string): Promise<boolean> {
    try {
      logger.info('[src/services/voucherService.ts] Eliminando voucher', { 
        metadata: { depositId } 
      });

      const depositDoc = await db.collection('user_deposits').doc(depositId).get();
      
      if (!depositDoc.exists) {
        throw new Error('Depósito no encontrado');
      }

      const deposit = depositDoc.data() as UserDeposit;

      // Importar función de eliminación
      const { deleteFromS3 } = await import('../utils/idriveE2');
      
      // Eliminar de IDrive E2
      const deletedFromS3 = await deleteFromS3(deposit.voucherFile.idriveKey);
      
      if (!deletedFromS3) {
        throw new Error('Error eliminando archivo de IDrive E2');
      }

      // Eliminar de Firebase
      await db.collection('user_deposits').doc(depositId).delete();

      logger.info('[src/services/voucherService.ts] Voucher eliminado exitosamente', { 
        metadata: { depositId, idriveKey: deposit.voucherFile.idriveKey } 
      });

      return true;
    } catch (error) {
      logger.error('[src/services/voucherService.ts] Error eliminando voucher', error instanceof Error ? error : new Error(String(error)), { 
        metadata: { depositId } 
      });
      throw new Error('Error eliminando voucher');
    }
  }

  /**
   * Obtener estadísticas de vouchers
   */
  async getVoucherStatistics(): Promise<{
    totalVouchers: number;
    totalSize: number;
    vouchersByStatus: Record<string, number>;
    vouchersByMonth: Record<string, number>;
  }> {
    try {
      logger.info('[src/services/voucherService.ts] Obteniendo estadísticas de vouchers');

      const vouchersSnapshot = await db.collection('user_deposits').get();
      const vouchers = vouchersSnapshot.docs.map(doc => doc.data() as UserDeposit);

      const stats = {
        totalVouchers: vouchers.length,
        totalSize: 0,
        vouchersByStatus: {} as Record<string, number>,
        vouchersByMonth: {} as Record<string, number>
      };

      // Calcular estadísticas
      for (const voucher of vouchers) {
        // Contar por estado
        stats.vouchersByStatus[voucher.status] = (stats.vouchersByStatus[voucher.status] || 0) + 1;

        // Contar por mes
        const month = new Date(voucher.createdAt).toISOString().substring(0, 7); // YYYY-MM
        stats.vouchersByMonth[month] = (stats.vouchersByMonth[month] || 0) + 1;

        // Verificar tamaño en IDrive E2 (opcional, puede ser costoso)
        try {
          const fileInfo = await getFileInfo(voucher.voucherFile.idriveKey);
          if (fileInfo.exists && fileInfo.size) {
            stats.totalSize += fileInfo.size;
          }
        } catch (error) {
          // Ignorar errores de verificación de tamaño
        }
      }

      logger.info('[src/services/voucherService.ts] Estadísticas obtenidas', { 
        metadata: { totalVouchers: stats.totalVouchers, totalSize: stats.totalSize } 
      });

      return stats;
    } catch (error) {
      logger.error('[src/services/voucherService.ts] Error obteniendo estadísticas', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Error obteniendo estadísticas de vouchers');
    }
  }
}

// Instancia singleton
export const voucherService = new VoucherService(); 