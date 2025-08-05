import { Request, Response } from 'express';
import { imageService } from '../services/imageService';
import { logger } from '../services/loggerService';
import { db } from '../utils/firebase';
import { getImageFromS3, extractKeyFromUrl, generatePresignedUrl } from '../utils/idriveE2';

export class ImagesController {
  /**
   * Subir imagen
   */
  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No se proporcionó archivo' });
        return;
      }

      const { folder = 'uploads', description, tags } = req.body;
      const metadata = {
        description,
        tags: tags ? tags.split(',') : [],
        uploadedBy: userId
      };

      logger.info('Subiendo imagen', { metadata: { userId, filename: req.file.originalname } });

      const result = await imageService.uploadImage(req.file, userId, folder, metadata);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Imagen subida exitosamente'
      });
    } catch (error) {
      logger.error('Error subiendo imagen', error as Error, { 
        metadata: { userId: (req as any).user?.userEmail } 
      });
      
      // Manejar errores específicos
      if (error instanceof Error) {
        if (error.message.includes('validación') || error.message.includes('tamaño')) {
          res.status(400).json({
            success: false,
            error: error.message
          });
          return;
        }
      }
      
      res.status(500).json({
        success: false,
        error: 'Error subiendo imagen'
      });
    }
  }

  /**
   * Obtener imagen por ID
   */
  async getImage(req: Request, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      
      const image = await imageService.getImage(imageId);
      
      if (!image) {
        res.status(404).json({
          success: false,
          error: 'Imagen no encontrada'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: image
      });
    } catch (error) {
      logger.error('Error obteniendo imagen', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo imagen'
      });
    }
  }

  /**
   * Obtener imagen por URL
   */
  async getImageByUrl(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        res.status(400).json({
          success: false,
          error: 'URL requerida'
        });
        return;
      }
      
      const image = await imageService.getImageByUrl(url);
      
      if (!image) {
        res.status(404).json({
          success: false,
          error: 'Imagen no encontrada'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: image
      });
    } catch (error) {
      logger.error('Error obteniendo imagen por URL', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo imagen por URL'
      });
    }
  }

  /**
   * Eliminar imagen
   */
  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      const { imageId } = req.params;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const deleted = await imageService.deleteImage(imageId);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Imagen no encontrada'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando imagen', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error eliminando imagen'
      });
    }
  }

  /**
   * Obtener estadísticas de imágenes
   */
  async getImageStatistics(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      const { userId: targetUserId } = req.query;
      
      // Solo administradores pueden ver estadísticas de otros usuarios
      if (targetUserId && targetUserId !== userId) {
        const userRole = (req as any).user?.roll;
        if (!['admin', 'superadmin'].includes(userRole)) {
          res.status(403).json({
            success: false,
            error: 'No tienes permisos para ver estas estadísticas'
          });
          return;
        }
      }
      
      const statistics = await imageService.getImageStatistics(targetUserId as string || userId);
      
      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Error obteniendo estadísticas de imágenes', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estadísticas de imágenes'
      });
    }
  }

  /**
   * Obtener todas las imágenes con filtros
   */
  async getAllImages(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      const { category, isPublic, isActive, search, page = 1, limit = 20 } = req.query;
      
      const filters = {
        category: category as string,
        isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        search: search as string,
        page: Number(page),
        limit: Number(limit)
      };

      const images = await imageService.getAllImages(filters);
      
      res.status(200).json({
        success: true,
        images,
        total: images.length,
        page: Number(page),
        limit: Number(limit)
      });
    } catch (error) {
      logger.error('Error obteniendo imágenes', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo imágenes'
      });
    }
  }

  /**
   * Obtener estadísticas de imágenes (alias para getImageStatistics)
   */
  async getImageStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      const statistics = await imageService.getImageStatistics(userId);
      
      res.status(200).json({
        success: true,
        stats: statistics
      });
    } catch (error) {
      logger.error('Error obteniendo estadísticas de imágenes', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estadísticas de imágenes'
      });
    }
  }

  /**
   * Verificar integridad de imagen
   */
  async verifyImageIntegrity(req: Request, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      
      const integrity = await imageService.verifyImageIntegrity(imageId);
      
      res.status(200).json({
        success: true,
        data: integrity
      });
    } catch (error) {
      logger.error('Error verificando integridad de imagen', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error verificando integridad de imagen'
      });
    }
  }

  /**
   * Limpiar imágenes no utilizadas (solo admin)
   */
  async cleanupUnusedImages(req: Request, res: Response): Promise<void> {
    try {
      const { daysOld = 30 } = req.body;
      
      const deletedCount = await imageService.cleanupUnusedImages(Number(daysOld));
      
      res.status(200).json({
        success: true,
        data: {
          deletedCount,
          daysOld: Number(daysOld)
        },
        message: `${deletedCount} imágenes eliminadas`
      });
    } catch (error) {
      logger.error('Error en limpieza de imágenes', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error en limpieza de imágenes'
      });
    }
  }

  /**
   * Validar archivo antes de subir
   */
  async validateImageFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No se proporcionó archivo'
        });
        return;
      }

      const validation = imageService.validateImageFile(req.file);
      
      res.status(200).json({
        success: validation.isValid,
        data: validation,
        message: validation.isValid ? 'Archivo válido' : 'Archivo inválido'
      });
    } catch (error) {
      logger.error('Error validando archivo', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error validando archivo'
      });
    }
  }

  /**
   * Servir imagen directamente (para compatibilidad)
   */
  async serveImage(req: Request, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      
      const image = await imageService.getImage(imageId);
      
      if (!image) {
        res.status(404).json({
          success: false,
          error: 'Imagen no encontrada'
        });
        return;
      }

      // Redirigir a la URL de S3
      res.redirect(image.url);
    } catch (error) {
      logger.error('Error sirviendo imagen', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error sirviendo imagen'
      });
    }
  }

  /**
   * Servir imagen directamente desde URL
   */
  async serveImageByUrl(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        res.status(400).json({
          success: false,
          error: 'URL requerida'
        });
        return;
      }

      // Intentar obtener la imagen desde S3 directamente
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        
        res.set({
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
          'Content-Length': buffer.byteLength.toString(),
          'Access-Control-Allow-Origin': '*'
        });
        
        res.send(Buffer.from(buffer));
      } catch (fetchError) {
        logger.error('Error obteniendo imagen de S3', fetchError as Error, { metadata: { url } });
        res.status(500).json({ error: 'Error obteniendo imagen' });
      }
    } catch (error) {
      logger.error('Error sirviendo imagen por URL', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error sirviendo imagen'
      });
    }
  }

  /**
   * Obtener imagen de voucher de depósito - MEJORADO
   */
  async getVoucherImage(req: Request, res: Response): Promise<void> {
    try {
      const { depositId } = req.params;
      
      if (!depositId) {
        res.status(400).json({
          success: false,
          error: 'ID de depósito requerido'
        });
        return;
      }

      logger.info('[src/controllers/imagesController.ts] Obteniendo imagen de voucher', { metadata: { depositId } });

      // Obtener los detalles del depósito directamente desde Firestore
      const depositDoc = await db.collection('user_deposits').doc(depositId).get();
      
      if (!depositDoc.exists) {
        res.status(404).json({
          success: false,
          error: 'Depósito no encontrado'
        });
        return;
      }

      const deposit = depositDoc.data();
      
      if (!deposit?.voucherFile?.url) {
        res.status(404).json({
          success: false,
          error: 'Voucher no encontrado para este depósito'
        });
        return;
      }

      // Extraer la clave del archivo desde la URL
      const key = extractKeyFromUrl(deposit.voucherFile.url);
      
      if (!key) {
        logger.error('[src/controllers/imagesController.ts] No se pudo extraer la clave de la URL', new Error('No se pudo extraer la clave'), { 
          metadata: { depositId, voucherUrl: deposit.voucherFile.url } 
        });
        
        // Fallback: intentar obtener la imagen usando fetch
        try {
          const response = await fetch(deposit.voucherFile.url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const buffer = await response.arrayBuffer();
          const contentType = response.headers.get('content-type') || 'image/jpeg';
          
          res.set({
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
            'Content-Length': buffer.byteLength.toString(),
            'Access-Control-Allow-Origin': '*'
          });
          
          res.send(Buffer.from(buffer));
          return;
        } catch (fetchError) {
          logger.error('[src/controllers/imagesController.ts] Error en fallback fetch', fetchError as Error, { 
            metadata: { depositId, voucherUrl: deposit.voucherFile.url } 
          });
          
          res.status(500).json({
            success: false,
            error: 'Error obteniendo imagen de voucher'
          });
          return;
        }
      }

      // Obtener la imagen directamente desde S3 usando la nueva función
      try {
        const imageData = await getImageFromS3(key);
        
        res.set({
          'Content-Type': imageData.contentType,
          'Cache-Control': 'public, max-age=3600',
          'Content-Length': imageData.size.toString(),
          'Access-Control-Allow-Origin': '*'
        });
        
        res.send(imageData.buffer);
        
        logger.info('[src/controllers/imagesController.ts] Imagen de voucher servida exitosamente', { 
          metadata: { depositId, key, contentType: imageData.contentType, size: imageData.size } 
        });
      } catch (s3Error) {
        logger.error('[src/controllers/imagesController.ts] Error obteniendo imagen desde S3', s3Error as Error, { 
          metadata: { depositId, key, voucherUrl: deposit.voucherFile.url } 
        });
        
        // Fallback: intentar obtener la imagen usando fetch
        try {
          const response = await fetch(deposit.voucherFile.url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const buffer = await response.arrayBuffer();
          const contentType = response.headers.get('content-type') || 'image/jpeg';
          
          res.set({
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
            'Content-Length': buffer.byteLength.toString(),
            'Access-Control-Allow-Origin': '*'
          });
          
          res.send(Buffer.from(buffer));
        } catch (fetchError) {
          logger.error('[src/controllers/imagesController.ts] Error en fallback fetch final', fetchError as Error, { 
            metadata: { depositId, voucherUrl: deposit.voucherFile.url } 
          });
          
          res.status(500).json({
            success: false,
            error: 'Error obteniendo imagen de voucher'
          });
        }
      }
    } catch (error) {
      logger.error('[src/controllers/imagesController.ts] Error obteniendo imagen de voucher', error as Error, { 
        metadata: { depositId: req.params.depositId } 
      });
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo imagen de voucher'
      });
    }
  }

  /**
   * Generar URL firmada para una imagen
   */
  async generatePresignedUrl(req: Request, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      const { expiresIn = 3600 } = req.query;
      
      const image = await imageService.getImage(imageId);
      
      if (!image) {
        res.status(404).json({
          success: false,
          error: 'Imagen no encontrada'
        });
        return;
      }

      // Extraer la clave del archivo desde la URL
      const key = extractKeyFromUrl(image.url);
      
      if (!key) {
        res.status(400).json({
          success: false,
          error: 'No se pudo extraer la clave de la imagen'
        });
        return;
      }

      // Generar URL firmada
      const presignedUrl = await generatePresignedUrl(key, Number(expiresIn));

      res.status(200).json({
        success: true,
        data: {
          presignedUrl,
          expiresIn: Number(expiresIn),
          originalUrl: image.url
        }
      });
    } catch (error) {
      logger.error('Error generando URL firmada', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error generando URL firmada'
      });
    }
  }
}

// Instancia singleton
export const imagesController = new ImagesController();
