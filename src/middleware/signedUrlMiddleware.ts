import { Request, Response, NextFunction } from 'express';
import { imageService } from '../services/imageService';
import { logger } from '../services/loggerService';

/**
 * Middleware para actualizar automáticamente URLs firmadas en cada consulta
 * Garantiza que todas las imágenes tengan URLs firmadas válidas y seguras
 */
export const autoUpdateSignedUrls = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Solo aplicar en endpoints que devuelven imágenes
    const imageEndpoints = [
      '/images/all',
      '/images/all/signed',
      '/images/all/idrive',
      '/images/stats',
      '/images/integrity'
    ];

    const isImageEndpoint = imageEndpoints.some(endpoint => req.path.includes(endpoint));
    
    if (!isImageEndpoint) {
      return next();
    }

    logger.info('[src/middleware/signedUrlMiddleware.ts] Verificando URLs firmadas en endpoint de imágenes', {
      metadata: { 
        path: req.path,
        method: req.method,
        userId: (req as any).user?.userEmail 
      }
    });

    // Verificar y renovar URLs expiradas en segundo plano
    setImmediate(async () => {
      try {
        const result = await imageService.refreshExpiredSignedUrls();
        
        if (result.expiredImages > 0) {
          logger.info('[src/middleware/signedUrlMiddleware.ts] URLs firmadas renovadas automáticamente', {
            metadata: {
              checkedImages: result.checkedImages,
              expiredImages: result.expiredImages,
              refreshedImages: result.refreshedImages,
              endpoint: req.path
            }
          });
        }
      } catch (error) {
        logger.error('[src/middleware/signedUrlMiddleware.ts] Error renovando URLs firmadas automáticamente', error as Error);
        // No bloquear la respuesta por errores en la renovación automática
      }
    });

    next();
  } catch (error) {
    logger.error('[src/middleware/signedUrlMiddleware.ts] Error en middleware de URLs firmadas', error as Error);
    next(); // Continuar incluso si hay errores
  }
};

/**
 * Middleware para garantizar URLs firmadas en respuestas de imágenes
 * Intercepta las respuestas y actualiza las URLs si es necesario
 */
export const ensureSignedUrlsInResponse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Solo aplicar en endpoints que devuelven imágenes
    const imageEndpoints = [
      '/images/all',
      '/images/all/signed',
      '/images/all/idrive',
      '/images/stats'
    ];

    const isImageEndpoint = imageEndpoints.some(endpoint => req.path.includes(endpoint));
    
    if (!isImageEndpoint) {
      return next();
    }

    // Interceptar la respuesta original
    const originalJson = res.json;
    
    res.json = function(data: any) {
      // Si la respuesta contiene imágenes, asegurar que tengan URLs firmadas válidas
      if (data && (data.images || data.data)) {
        const images = data.images || (Array.isArray(data.data) ? data.data : []);
        
        if (Array.isArray(images) && images.length > 0) {
          logger.info('[src/middleware/signedUrlMiddleware.ts] Verificando URLs firmadas en respuesta', {
            metadata: {
              imageCount: images.length,
              endpoint: req.path
            }
          });

          // Verificar que todas las imágenes tengan URLs firmadas válidas
          const now = new Date();
          const imagesWithExpiredUrls = images.filter((img: any) => {
            if (!img.urlExpiresAt) return true;
            const expiresAt = new Date(img.urlExpiresAt);
            return expiresAt <= now || (expiresAt.getTime() - now.getTime()) < 30 * 60 * 1000; // 30 minutos
          });

          if (imagesWithExpiredUrls.length > 0) {
            logger.warn('[src/middleware/signedUrlMiddleware.ts] Detectadas imágenes con URLs expiradas en respuesta', {
              metadata: {
                totalImages: images.length,
                expiredImages: imagesWithExpiredUrls.length,
                endpoint: req.path
              }
            });

            // Renovar URLs expiradas en segundo plano
            setImmediate(async () => {
              try {
                await imageService.refreshExpiredSignedUrls();
                logger.info('[src/middleware/signedUrlMiddleware.ts] URLs expiradas renovadas después de detectar en respuesta');
              } catch (error) {
                logger.error('[src/middleware/signedUrlMiddleware.ts] Error renovando URLs después de detectar en respuesta', error as Error);
              }
            });
          }
        }
      }

      // Llamar al método original
      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    logger.error('[src/middleware/signedUrlMiddleware.ts] Error en middleware de verificación de respuestas', error as Error);
    next(); // Continuar incluso si hay errores
  }
};

/**
 * Middleware para actualizar URLs firmadas en intervalos regulares
 * Se ejecuta cada 30 minutos para mantener las URLs actualizadas
 */
export const scheduledSignedUrlUpdate = (): void => {
  const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutos

  setInterval(async () => {
    try {
      logger.info('[src/middleware/signedUrlMiddleware.ts] Ejecutando actualización programada de URLs firmadas');
      
      const result = await imageService.refreshExpiredSignedUrls();
      
      if (result.expiredImages > 0) {
        logger.info('[src/middleware/signedUrlMiddleware.ts] Actualización programada completada', {
          metadata: {
            checkedImages: result.checkedImages,
            expiredImages: result.expiredImages,
            refreshedImages: result.refreshedImages
          }
        });
      } else {
        logger.info('[src/middleware/signedUrlMiddleware.ts] No se encontraron URLs expiradas en actualización programada');
      }
    } catch (error) {
      logger.error('[src/middleware/signedUrlMiddleware.ts] Error en actualización programada de URLs firmadas', error as Error);
    }
  }, UPDATE_INTERVAL);

  logger.info('[src/middleware/signedUrlMiddleware.ts] Actualización programada de URLs firmadas configurada', {
    metadata: { intervalMinutes: UPDATE_INTERVAL / 60000 }
  });
};

/**
 * Middleware para verificar la salud de las URLs firmadas
 */
export const checkSignedUrlsHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Solo aplicar en endpoint de health check
    if (req.path !== '/images/health/signed-urls') {
      return next();
    }

    logger.info('[src/middleware/signedUrlMiddleware.ts] Verificando salud de URLs firmadas');

    const result = await imageService.refreshExpiredSignedUrls();
    
    const healthStatus = {
      status: 'healthy',
      checkedImages: result.checkedImages,
      expiredImages: result.expiredImages,
      refreshedImages: result.refreshedImages,
      errorCount: result.errors.length,
      timestamp: new Date().toISOString()
    };

    // Determinar estado de salud
    if (result.errors.length > 0) {
      healthStatus.status = 'warning';
    }
    
    if (result.expiredImages > result.checkedImages * 0.1) { // Más del 10% expiradas
      healthStatus.status = 'critical';
    }

    res.status(200).json({
      success: true,
      data: healthStatus
    });

  } catch (error) {
    logger.error('[src/middleware/signedUrlMiddleware.ts] Error verificando salud de URLs firmadas', error as Error);
    
    res.status(500).json({
      success: false,
      error: 'Error verificando salud de URLs firmadas',
      data: {
        status: 'error',
        timestamp: new Date().toISOString()
      }
    });
  }
}; 