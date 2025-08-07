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
   * Obtener todas las imágenes con URLs firmadas de IDrive E2
   */
  async getAllImagesWithSignedUrls(req: Request, res: Response): Promise<void> {
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

      logger.info('[src/controllers/imagesController.ts] Obteniendo imágenes con URLs firmadas', { 
        metadata: { userId, filters } 
      });

      const images = await imageService.getAllImagesWithSignedUrls(filters);
      
      res.status(200).json({
        success: true,
        images,
        total: images.length,
        page: Number(page),
        limit: Number(limit),
        message: 'Imágenes obtenidas con URLs firmadas de IDrive E2'
      });
    } catch (error) {
      logger.error('[src/controllers/imagesController.ts] Error obteniendo imágenes con URLs firmadas', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo imágenes con URLs firmadas'
      });
    }
  }

  /**
   * Obtener imágenes directamente desde IDrive E2 con URLs firmadas
   */
  async getAllImagesFromIDriveE2(req: Request, res: Response): Promise<void> {
    try {
      const { category, search, page = 1, limit = 20 } = req.query;
      
      const filters = {
        category: category as string,
        search: search as string,
        page: Number(page),
        limit: Number(limit)
      };

      logger.info('[src/controllers/imagesController.ts] Obteniendo imágenes directamente desde IDrive E2', { 
        metadata: { filters } 
      });

      const images = await imageService.getAllImagesFromIDriveE2(filters);
      
      res.status(200).json({
        success: true,
        images,
        total: images.length,
        page: Number(page),
        limit: Number(limit),
        message: 'Imágenes obtenidas directamente desde IDrive E2 con URLs firmadas'
      });
    } catch (error) {
      logger.error('[src/controllers/imagesController.ts] Error obteniendo imágenes desde IDrive E2', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo imágenes desde IDrive E2'
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

  /**
   * Endpoint de diagnóstico para verificar estado de imágenes
   */
  async diagnoseImages(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userEmail;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      logger.info('[src/controllers/imagesController.ts] Iniciando diagnóstico de imágenes', { metadata: { userId } });

      // 1. Verificar configuración de IDrive E2
      const config = {
        endpoint: process.env.IDRIVE_E2_ENDPOINT,
        region: process.env.IDRIVE_E2_REGION,
        bucket: process.env.IDRIVE_E2_BUCKET_NAME,
        accessKey: process.env.IDRIVE_E2_ACCESS_KEY ? 'Configurado' : 'No configurado',
        secretKey: process.env.IDRIVE_E2_SECRET_KEY ? 'Configurado' : 'No configurado'
      };

      // 2. Verificar registros en Firestore
      const imagesSnapshot = await db.collection('images').limit(10).get();
      const imageUploadsSnapshot = await db.collection('image_uploads').limit(10).get();

      const firestoreStats = {
        imagesCollection: imagesSnapshot.size,
        imageUploadsCollection: imageUploadsSnapshot.size
      };

      // 3. Verificar URLs de ejemplo
      const sampleImages = [];
      if (imagesSnapshot.size > 0) {
        const sampleImage = imagesSnapshot.docs[0].data();
        sampleImages.push({
          id: imagesSnapshot.docs[0].id,
          key: sampleImage.key,
          url: sampleImage.url,
          filename: sampleImage.filename,
          size: sampleImage.size
        });
      }

      // 4. Intentar conectar a IDrive E2
      let idriveStatus: {
        connected: boolean;
        error: string | null;
        files: number;
        sampleFiles?: Array<{
          key: string | undefined;
          size: number | undefined;
          lastModified: Date | undefined;
        }>;
      } = { connected: false, error: null, files: 0 };
      
      try {
        const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
        const s3Client = new S3Client({
          region: process.env.IDRIVE_E2_REGION || 'us-east-1',
          endpoint: process.env.IDRIVE_E2_ENDPOINT,
          credentials: {
            accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY,
            secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY,
          },
          forcePathStyle: true,
        });

        const listCommand = new ListObjectsV2Command({
          Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
          MaxKeys: 10,
        });

        const response = await s3Client.send(listCommand);
        idriveStatus = {
          connected: true,
          error: null,
          files: response.Contents?.length || 0,
          sampleFiles: response.Contents?.slice(0, 3).map((file: any) => ({
            key: file.Key,
            size: file.Size,
            lastModified: file.LastModified
          })) || []
        };
      } catch (error) {
        idriveStatus = {
          connected: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
          files: 0
        };
      }

      // 5. Verificar URLs de acceso
      const urlTests = [];
      if (sampleImages.length > 0) {
        for (const image of sampleImages.slice(0, 2)) {
          try {
            const response = await fetch(image.url, { method: 'HEAD' });
            urlTests.push({
              url: image.url,
              accessible: response.ok,
              status: response.status,
              size: response.headers.get('content-length')
            });
          } catch (error) {
            urlTests.push({
              url: image.url,
              accessible: false,
              error: error instanceof Error ? error.message : 'Error desconocido'
            });
          }
        }
      }

      const diagnosis: {
        timestamp: string;
        config: any;
        firestoreStats: any;
        idriveStatus: any;
        sampleImages: any[];
        urlTests: any[];
        recommendations: string[];
      } = {
        timestamp: new Date().toISOString(),
        config,
        firestoreStats,
        idriveStatus,
        sampleImages,
        urlTests,
        recommendations: []
      };

      // Generar recomendaciones
      if (!idriveStatus.connected) {
        diagnosis.recommendations.push('Verificar configuración de IDrive E2');
      }
      if (firestoreStats.imagesCollection === 0 && firestoreStats.imageUploadsCollection === 0) {
        diagnosis.recommendations.push('No hay registros de imágenes en Firestore');
      }
      if (urlTests.some(test => !test.accessible)) {
        diagnosis.recommendations.push('Algunas URLs no son accesibles');
      }
      if (idriveStatus.connected && idriveStatus.files === 0) {
        diagnosis.recommendations.push('IDrive E2 conectado pero no hay archivos');
      }

      res.status(200).json({
        success: true,
        data: diagnosis
      });

    } catch (error) {
      logger.error('[src/controllers/imagesController.ts] Error en diagnóstico de imágenes', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error en diagnóstico de imágenes'
      });
    }
  }

  /**
   * Obtener una sola imagen específica desde IDrive E2
   */
  async getSingleImageFromIDriveE2(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      
      if (!key) {
        res.status(400).json({ 
          success: false, 
          error: 'Se requiere la clave (key) de la imagen' 
        });
        return;
      }

      const image = await imageService.getSingleImageFromIDriveE2(key);
      
      if (!image) {
        res.status(404).json({ 
          success: false, 
          error: 'Imagen no encontrada' 
        });
        return;
      }

      res.status(200).json({ 
        success: true, 
        image,
        message: 'Imagen obtenida exitosamente desde IDrive E2' 
      });
      
    } catch (error) {
      logger.error('[src/controllers/imagesController.ts] Error obteniendo imagen individual:', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({ 
        success: false, 
        error: `Error obteniendo imagen: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  }

  /**
   * Obtener imagen por nombre de archivo desde IDrive E2
   */
  async getImageByFilenameFromIDriveE2(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;
      const { category } = req.query;
      
      if (!filename) {
        res.status(400).json({ 
          success: false, 
          error: 'Se requiere el nombre del archivo' 
        });
        return;
      }

      const image = await imageService.getImageByFilenameFromIDriveE2(
        filename, 
        category as string
      );
      
      if (!image) {
        res.status(404).json({ 
          success: false, 
          error: 'Imagen no encontrada' 
        });
        return;
      }

      res.status(200).json({ 
        success: true, 
        image,
        message: 'Imagen encontrada por nombre desde IDrive E2' 
      });
      
    } catch (error) {
      logger.error('[src/controllers/imagesController.ts] Error obteniendo imagen por nombre:', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({ 
        success: false, 
        error: `Error obteniendo imagen por nombre: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  }

  /**
   * Actualizar todas las URLs firmadas (endpoint administrativo)
   */
  async updateAllSignedUrls(req: Request, res: Response): Promise<void> {
    try {
      logger.info('[src/controllers/imagesController.ts] Iniciando actualización masiva de URLs firmadas');
      
      const result = await imageService.updateAllSignedUrls();
      
      res.status(200).json({
        success: true,
        message: 'Actualización de URLs firmadas completada',
        data: result
      });
    } catch (error) {
      logger.error('[src/controllers/imagesController.ts] Error actualizando URLs firmadas', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error actualizando URLs firmadas'
      });
    }
  }

  /**
   * Verificar y renovar URLs firmadas expiradas
   */
  async refreshExpiredSignedUrls(req: Request, res: Response): Promise<void> {
    try {
      logger.info('[src/controllers/imagesController.ts] Verificando URLs firmadas expiradas');
      
      const result = await imageService.refreshExpiredSignedUrls();
      
      res.status(200).json({
        success: true,
        message: 'Verificación de URLs expiradas completada',
        data: result
      });
    } catch (error) {
      logger.error('[src/controllers/imagesController.ts] Error verificando URLs expiradas', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error verificando URLs expiradas'
      });
    }
  }

  /**
   * Obtener imagen con URL firmada garantizada
   */
  async getImageWithGuaranteedSignedUrl(req: Request, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      
      if (!imageId) {
        res.status(400).json({
          success: false,
          error: 'ID de imagen requerido'
        });
        return;
      }

      const image = await imageService.getImageWithGuaranteedSignedUrl(imageId);
      
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
      logger.error('[src/controllers/imagesController.ts] Error obteniendo imagen con URL garantizada', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo imagen con URL garantizada'
      });
    }
  }

  /**
   * Obtener múltiples imágenes con URLs firmadas garantizadas
   */
  async getMultipleImagesWithGuaranteedSignedUrls(req: Request, res: Response): Promise<void> {
    try {
      const { imageIds } = req.body;
      
      if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Array de IDs de imágenes requerido'
        });
        return;
      }

      const result = await imageService.getMultipleImagesWithGuaranteedSignedUrls(imageIds);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('[src/controllers/imagesController.ts] Error obteniendo múltiples imágenes con URLs garantizadas', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo múltiples imágenes'
      });
    }
  }
}

// Instancia singleton
export const imagesController = new ImagesController();
