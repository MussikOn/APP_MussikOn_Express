import { Router } from 'express';
import { imagesController } from '../controllers/imagesController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';
import { upload } from '../middleware/uploadMiddleware';
import { validateImageFile } from '../middleware/uploadMiddleware';
import { imageService } from '../services/imageService';
import { logger } from '../services/loggerService';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ImageUploadResult:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *         filename:
 *           type: string
 *         size:
 *           type: number
 *         mimeType:
 *           type: string
 *         uploadedAt:
 *           type: string
 *         metadata:
 *           type: object
 *     
 *     ImageValidationResult:
 *       type: object
 *       properties:
 *         isValid:
 *           type: boolean
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *         warnings:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /images/upload:
 *   post:
 *     summary: Subir imagen
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen
 *               folder:
 *                 type: string
 *                 default: uploads
 *                 description: Carpeta donde guardar
 *               description:
 *                 type: string
 *                 description: Descripción de la imagen
 *               tags:
 *                 type: string
 *                 description: Etiquetas separadas por comas
 *     responses:
 *       201:
 *         description: Imagen subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ImageUploadResult'
 *                 message:
 *                   type: string
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/upload', authMiddleware, upload.single('file'), validateImageFile, async (req, res) => {
  await imagesController.uploadImage(req, res);
});

/**
 * @swagger
 * /images/upload/public:
 *   post:
 *     summary: Subir imagen (público - desarrollo)
 *     tags: [Imágenes - Desarrollo]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen
 *               folder:
 *                 type: string
 *                 default: test-images
 *                 description: Carpeta donde guardar
 *               description:
 *                 type: string
 *                 description: Descripción de la imagen
 *               tags:
 *                 type: string
 *                 description: Etiquetas separadas por comas
 *     responses:
 *       201:
 *         description: Imagen subida exitosamente
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error del servidor
 */
router.post('/upload/public', upload.single('file'), validateImageFile, async (req, res) => {
  // Simular un usuario para desarrollo
  (req as any).user = { userEmail: 'test@mussikon.com' };
  await imagesController.uploadImage(req, res);
});

/**
 * @swagger
 * /images:
 *   get:
 *     summary: Obtener todas las imágenes
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Filtrar por visibilidad pública
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en descripción y tags
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Lista de imágenes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 images:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Image'
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 limit:
 *                   type: number
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/', authMiddleware, async (req, res) => {
  await imagesController.getAllImages(req, res);
});

/**
 * @swagger
 * /images/stats:
 *   get:
 *     summary: Obtener estadísticas de imágenes
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalImages:
 *                       type: number
 *                     totalSize:
 *                       type: number
 *                     imagesByCategory:
 *                       type: object
 *                     imagesByUser:
 *                       type: object
 *                     publicImages:
 *                       type: number
 *                     privateImages:
 *                       type: number
 *                     activeImages:
 *                       type: number
 *                     inactiveImages:
 *                       type: number
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/stats', authMiddleware, async (req, res) => {
  await imagesController.getImageStats(req, res);
});

/**
 * @swagger
 * /images/{imageId}:
 *   get:
 *     summary: Obtener imagen por ID
 *     tags: [Imágenes]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la imagen
 *     responses:
 *       200:
 *         description: Imagen obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ImageUploadResult'
 *       404:
 *         description: Imagen no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:imageId', async (req, res) => {
  await imagesController.getImage(req, res);
});

/**
 * @swagger
 * /images/url:
 *   get:
 *     summary: Obtener imagen por URL
 *     tags: [Imágenes]
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: URL de la imagen
 *     responses:
 *       200:
 *         description: Imagen obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ImageUploadResult'
 *       404:
 *         description: Imagen no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/url', async (req, res) => {
  await imagesController.getImageByUrl(req, res);
});

/**
 * @swagger
 * /images/voucher/{depositId}:
 *   get:
 *     summary: Obtener imagen de voucher de depósito
 *     tags: [Imágenes]
 *     parameters:
 *       - in: path
 *         name: depositId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del depósito
 *     responses:
 *       200:
 *         description: Imagen del voucher obtenida exitosamente
 *       404:
 *         description: Voucher no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/voucher/:depositId', async (req, res) => {
  await imagesController.getVoucherImage(req, res);
});

/**
 * @swagger
 * /images/{imageId}:
 *   delete:
 *     summary: Eliminar imagen
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la imagen
 *     responses:
 *       200:
 *         description: Imagen eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Imagen no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:imageId', authMiddleware, async (req, res) => {
  await imagesController.deleteImage(req, res);
});

/**
 * @swagger
 * /images/statistics:
 *   get:
 *     summary: Obtener estadísticas de imágenes
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID del usuario (solo admin)
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
router.get('/statistics', authMiddleware, async (req, res) => {
  await imagesController.getImageStatistics(req, res);
});

/**
 * @swagger
 * /images/{imageId}/integrity:
 *   get:
 *     summary: Verificar integridad de imagen
 *     tags: [Imágenes]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la imagen
 *     responses:
 *       200:
 *         description: Integridad verificada exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/:imageId/integrity', async (req, res) => {
  await imagesController.verifyImageIntegrity(req, res);
});

/**
 * @swagger
 * /images/cleanup:
 *   post:
 *     summary: Limpiar imágenes no utilizadas (solo admin)
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daysOld:
 *                 type: number
 *                 default: 30
 *                 description: Días de antigüedad para eliminar
 *     responses:
 *       200:
 *         description: Limpieza completada exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/cleanup', authMiddleware, requireRole(['admin', 'superadmin']), async (req, res) => {
  await imagesController.cleanupUnusedImages(req, res);
});

/**
 * @swagger
 * /images/validate:
 *   post:
 *     summary: Validar archivo antes de subir
 *     tags: [Imágenes]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo a validar
 *     responses:
 *       200:
 *         description: Validación completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ImageValidationResult'
 *                 message:
 *                   type: string
 *       400:
 *         description: No se proporcionó archivo
 *       500:
 *         description: Error del servidor
 */
router.post('/validate', upload.single('file'), async (req, res) => {
  await imagesController.validateImageFile(req, res);
});

/**
 * @swagger
 * /images/{imageId}/serve:
 *   get:
 *     summary: Servir imagen directamente
 *     tags: [Imágenes]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la imagen
 *     responses:
 *       200:
 *         description: Imagen servida exitosamente
 *       404:
 *         description: Imagen no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:imageId/serve', async (req, res) => {
  await imagesController.serveImage(req, res);
});

/**
 * @swagger
 * /images/serve-url:
 *   get:
 *     summary: Servir imagen directamente desde URL
 *     tags: [Imágenes]
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: URL de la imagen
 *     responses:
 *       200:
 *         description: Imagen servida exitosamente
 *       400:
 *         description: URL requerida
 *       500:
 *         description: Error del servidor
 */
router.get('/serve-url', async (req, res) => {
  await imagesController.serveImageByUrl(req, res);
});

/**
 * @swagger
 * /images/diagnose:
 *   get:
 *     summary: Diagnóstico del sistema de imágenes
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diagnóstico completado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     config:
 *                       type: object
 *                     firestoreStats:
 *                       type: object
 *                     idriveStatus:
 *                       type: object
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/diagnose', authMiddleware, async (req, res) => {
  await imagesController.diagnoseImages(req, res);
});

/**
 * @swagger
 * /images/{imageId}/presigned:
 *   get:
 *     summary: Generar URL firmada para una imagen
 *     tags: [Imágenes]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la imagen
 *       - in: query
 *         name: expiresIn
 *         schema:
 *           type: integer
 *           default: 3600
 *         description: Tiempo de expiración en segundos
 *     responses:
 *       200:
 *         description: URL firmada generada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     presignedUrl:
 *                       type: string
 *                     expiresIn:
 *                       type: number
 *                     originalUrl:
 *                       type: string
 *       404:
 *         description: Imagen no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:imageId/presigned', async (req, res) => {
  await imagesController.generatePresignedUrl(req, res);
});

/**
 * @swagger
 * /images/diagnose-signed-urls:
 *   get:
 *     summary: Diagnosticar estado de URLs firmadas
 *     tags: [Imágenes - Diagnóstico]
 *     responses:
 *       200:
 *         description: Diagnóstico completado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalImages:
 *                       type: number
 *                     workingUrls:
 *                       type: number
 *                     brokenUrls:
 *                       type: number
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *                     sampleImages:
 *                       type: array
 *                       items:
 *                         type: object
 *       500:
 *         description: Error del servidor
 */
router.get('/diagnose-signed-urls', async (req, res) => {
  try {
    logger.info('[src/routes/imagesRoutes.ts] Iniciando diagnóstico de URLs firmadas');
    
    // Obtener algunas imágenes de muestra
    const sampleImages = await imageService.getAllImagesFromIDriveE2({ limit: 5 });
    
    const results = {
      totalImages: sampleImages.length,
      workingUrls: 0,
      brokenUrls: 0,
      errors: [] as string[],
      sampleImages: [] as any[]
    };

    // Probar cada URL
    for (const image of sampleImages) {
      try {
        const response = await fetch(image.url, { method: 'HEAD' });
        if (response.ok) {
          results.workingUrls++;
          results.sampleImages.push({
            ...image,
            status: 'working',
            statusCode: response.status
          });
        } else {
          results.brokenUrls++;
          results.sampleImages.push({
            ...image,
            status: 'broken',
            statusCode: response.status,
            error: `HTTP ${response.status}`
          });
        }
      } catch (error) {
        results.brokenUrls++;
        results.errors.push(`Error testing ${image.filename}: ${error}`);
        results.sampleImages.push({
          ...image,
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    logger.info('[src/routes/imagesRoutes.ts] Diagnóstico completado', { 
      metadata: { 
        totalImages: results.totalImages,
        workingUrls: results.workingUrls,
        brokenUrls: results.brokenUrls
      } 
    });

    res.status(200).json({
      success: true,
      data: results,
      message: `Diagnóstico completado: ${results.workingUrls} URLs funcionando, ${results.brokenUrls} URLs con problemas`
    });
  } catch (error) {
    logger.error('[src/routes/imagesRoutes.ts] Error en diagnóstico de URLs firmadas', error as Error);
    res.status(500).json({
      success: false,
      error: 'Error en diagnóstico de URLs firmadas'
    });
  }
});

// Rutas de compatibilidad con el sistema anterior
/**
 * @swagger
 * /images/saveImage:
 *   post:
 *     summary: Subir imagen (compatibilidad)
 *     tags: [Imágenes - Compatibilidad]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Imagen subida exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/saveImage', authMiddleware, upload.single('file'), validateImageFile, async (req, res) => {
  await imagesController.uploadImage(req, res);
});

/**
 * @swagger
 * /images/getImage/{key}:
 *   get:
 *     summary: Obtener imagen por clave (compatibilidad)
 *     tags: [Imágenes - Compatibilidad]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Clave de la imagen
 *     responses:
 *       200:
 *         description: URL de la imagen obtenida
 *       400:
 *         description: Clave requerida
 *       404:
 *         description: Imagen no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/getImage/:key', async (req, res) => {
  // Convertir clave a imageId para compatibilidad
  (req.params as any).imageId = req.params.key;
  await imagesController.getImage(req, res);
});

// Nueva ruta para obtener una sola imagen específica desde IDrive E2 (autenticada)
router.get('/single/:key', authMiddleware, async (req, res) => {
  await imagesController.getSingleImageFromIDriveE2(req, res);
});

// Nueva ruta para obtener una sola imagen específica desde IDrive E2 (pública - desarrollo)
router.get('/single/:key/public', async (req, res) => {
  await imagesController.getSingleImageFromIDriveE2(req, res);
});

// Nueva ruta para obtener imagen por nombre de archivo desde IDrive E2 (autenticada)
router.get('/filename/:filename', authMiddleware, async (req, res) => {
  await imagesController.getImageByFilenameFromIDriveE2(req, res);
});

// Nueva ruta para obtener imagen por nombre de archivo desde IDrive E2 (pública - desarrollo)
router.get('/filename/:filename/public', async (req, res) => {
  await imagesController.getImageByFilenameFromIDriveE2(req, res);
});

// ===== RUTAS TEMPORALES PARA DESARROLLO (SIN AUTENTICACIÓN) =====
// Estas rutas permiten probar el panel de administración sin autenticación completa
// TODO: Remover estas rutas en producción

/**
 * @swagger
 * /images/stats/public:
 *   get:
 *     summary: Obtener estadísticas de imágenes (público - desarrollo)
 *     tags: [Imágenes - Desarrollo]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 */
router.get('/stats/public', async (req, res) => {
  try {
    // Simular estadísticas para desarrollo
    const mockStats = {
      totalImages: 25,
      totalSize: 15728640, // 15MB
      imagesByCategory: {
        'profile': 8,
        'event': 12,
        'voucher': 5
      },
      imagesByUser: {
        'user1': 10,
        'user2': 8,
        'user3': 7
      },
      publicImages: 20,
      privateImages: 5,
      activeImages: 23,
      inactiveImages: 2
    };

    res.json({
      success: true,
      ...mockStats
    });
  } catch (error) {
    console.error('[src/routes/imagesRoutes.ts:stats/public] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /images/all/public:
 *   get:
 *     summary: Obtener todas las imágenes (público - desarrollo)
 *     tags: [Imágenes - Desarrollo]
 *     responses:
 *       200:
 *         description: Lista de imágenes obtenida exitosamente
 */
router.get('/all/public', async (req, res) => {
  try {
    // Simular imágenes para desarrollo
    const mockImages = [
      {
        id: 'img1',
        filename: 'profile-user1.jpg',
        url: '/placeholder-profile.svg',
        size: 1024000,
        uploadedAt: new Date().toISOString(),
        category: 'profile',
        isPublic: true,
        isActive: true
      },
      {
        id: 'img2',
        filename: 'event-concert.jpg',
        url: '/placeholder-event.svg',
        size: 2048000,
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        category: 'event',
        isPublic: true,
        isActive: true
      },
      {
        id: 'img3',
        filename: 'voucher-payment.jpg',
        url: '/placeholder-voucher.svg',
        size: 512000,
        uploadedAt: new Date(Date.now() - 172800000).toISOString(),
        category: 'voucher',
        isPublic: false,
        isActive: true
      }
    ];

    res.json({
      success: true,
      images: mockImages,
      total: mockImages.length,
      page: 1,
      limit: 20
    });
  } catch (error) {
    console.error('[src/routes/imagesRoutes.ts:all/public] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /images/statistics/public:
 *   get:
 *     summary: Obtener estadísticas detalladas (público - desarrollo)
 *     tags: [Imágenes - Desarrollo]
 *     responses:
 *       200:
 *         description: Estadísticas detalladas obtenidas exitosamente
 */
router.get('/statistics/public', async (req, res) => {
  try {
    // Simular estadísticas detalladas para desarrollo
    const mockStatistics = {
      totalImages: 25,
      totalSize: 15728640,
      averageSize: 629145,
      imagesByType: {
        'jpg': 15,
        'png': 8,
        'gif': 2
      },
      imagesByStatus: {
        'active': 23,
        'inactive': 2
      },
      imagesByVisibility: {
        'public': 20,
        'private': 5
      },
      uploadsLastWeek: 8,
      uploadsLastMonth: 25,
      storageUsed: '15.0 MB',
      storageLimit: '100.0 MB'
    };

    res.json({
      success: true,
      ...mockStatistics
    });
  } catch (error) {
    console.error('[src/routes/imagesRoutes.ts:statistics/public] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /images/verify/public:
 *   get:
 *     summary: Verificar integridad del sistema (público - desarrollo)
 *     tags: [Imágenes - Desarrollo]
 *     responses:
 *       200:
 *         description: Verificación completada exitosamente
 */
router.get('/verify/public', async (req, res) => {
  try {
    // Simular verificación para desarrollo
    const mockVerification = {
      firebaseStatus: 'connected',
      idriveStatus: 'connected',
      totalImages: 25,
      corruptedImages: 0,
      orphanedFiles: 0,
      integrityScore: 100,
      recommendations: [
        'Sistema funcionando correctamente',
        'Considerar limpieza mensual de archivos temporales'
      ]
    };

    res.json({
      success: true,
      message: 'Verificación completada exitosamente',
      ...mockVerification
    });
  } catch (error) {
    console.error('[src/routes/imagesRoutes.ts:verify/public] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /images/all/signed:
 *   get:
 *     summary: Obtener todas las imágenes con URLs firmadas de IDrive E2
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Filtrar por visibilidad pública
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en descripción, nombre y etiquetas
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Imágenes obtenidas con URLs firmadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       filename:
 *                         type: string
 *                       url:
 *                         type: string
 *                         description: URL firmada de IDrive E2
 *                       size:
 *                         type: number
 *                       uploadedAt:
 *                         type: string
 *                       category:
 *                         type: string
 *                       isPublic:
 *                         type: boolean
 *                       isActive:
 *                         type: boolean
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/all/signed', authMiddleware, async (req, res) => {
  await imagesController.getAllImagesWithSignedUrls(req, res);
});

/**
 * @swagger
 * /images/all/signed/public:
 *   get:
 *     summary: Obtener todas las imágenes con URLs firmadas de IDrive E2 (público - desarrollo)
 *     tags: [Imágenes - Desarrollo]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Filtrar por visibilidad pública
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en descripción, nombre y etiquetas
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Imágenes obtenidas con URLs firmadas exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/all/signed/public', async (req, res) => {
  await imagesController.getAllImagesWithSignedUrls(req, res);
});

/**
 * @swagger
 * /images/all/idrive:
 *   get:
 *     summary: Obtener todas las imágenes directamente desde IDrive E2 con URLs firmadas
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría (profile, event, voucher, gallery)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en nombre de archivo y categoría
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Imágenes obtenidas directamente desde IDrive E2 exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       filename:
 *                         type: string
 *                       url:
 *                         type: string
 *                         description: URL firmada de IDrive E2
 *                       size:
 *                         type: number
 *                       uploadedAt:
 *                         type: string
 *                       category:
 *                         type: string
 *                       isPublic:
 *                         type: boolean
 *                       isActive:
 *                         type: boolean
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/all/idrive', authMiddleware, async (req, res) => {
  await imagesController.getAllImagesFromIDriveE2(req, res);
});

/**
 * @swagger
 * /images/all/idrive/public:
 *   get:
 *     summary: Obtener todas las imágenes directamente desde IDrive E2 con URLs firmadas (público - desarrollo)
 *     tags: [Imágenes - Desarrollo]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría (profile, event, voucher, gallery)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en nombre de archivo y categoría
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Imágenes obtenidas directamente desde IDrive E2 exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/all/idrive/public', async (req, res) => {
  await imagesController.getAllImagesFromIDriveE2(req, res);
});

/**
 * @swagger
 * /images/update-all-signed-urls:
 *   post:
 *     summary: Actualizar todas las URLs firmadas (endpoint administrativo)
 *     tags: [Imágenes - Administración]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: URLs firmadas actualizadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalImages:
 *                       type: number
 *                     updatedImages:
 *                       type: number
 *                     failedImages:
 *                       type: number
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/update-all-signed-urls', authMiddleware, requireRole(['admin', 'super_admin']), async (req, res) => {
  await imagesController.updateAllSignedUrls(req, res);
});

/**
 * @swagger
 * /images/refresh-expired-signed-urls:
 *   post:
 *     summary: Verificar y renovar URLs firmadas expiradas
 *     tags: [Imágenes - Administración]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verificación de URLs expiradas completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     checkedImages:
 *                       type: number
 *                     refreshedImages:
 *                       type: number
 *                     expiredImages:
 *                       type: number
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/refresh-expired-signed-urls', authMiddleware, requireRole(['admin', 'super_admin']), async (req, res) => {
  await imagesController.refreshExpiredSignedUrls(req, res);
});

/**
 * @swagger
 * /images/{imageId}/guaranteed-signed-url:
 *   get:
 *     summary: Obtener imagen con URL firmada garantizada
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la imagen
 *     responses:
 *       200:
 *         description: Imagen obtenida con URL firmada garantizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ImageUploadResult'
 *       400:
 *         description: ID de imagen requerido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Imagen no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:imageId/guaranteed-signed-url', authMiddleware, async (req, res) => {
  await imagesController.getImageWithGuaranteedSignedUrl(req, res);
});

/**
 * @swagger
 * /images/multiple-guaranteed-signed-urls:
 *   post:
 *     summary: Obtener múltiples imágenes con URLs firmadas garantizadas
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array de IDs de imágenes
 *     responses:
 *       200:
 *         description: Múltiples imágenes obtenidas con URLs firmadas garantizadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     images:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ImageUploadResult'
 *                     failedImages:
 *                       type: array
 *                       items:
 *                         type: string
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Array de IDs de imágenes requerido
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/multiple-guaranteed-signed-urls', authMiddleware, async (req, res) => {
  await imagesController.getMultipleImagesWithGuaranteedSignedUrls(req, res);
});

/**
 * @swagger
 * /images/health/signed-urls:
 *   get:
 *     summary: Verificar salud de URLs firmadas
 *     tags: [Imágenes - Administración]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de salud de URLs firmadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [healthy, warning, critical, error]
 *                     checkedImages:
 *                       type: number
 *                     expiredImages:
 *                       type: number
 *                     refreshedImages:
 *                       type: number
 *                     errorCount:
 *                       type: number
 *                     timestamp:
 *                       type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/health/signed-urls', authMiddleware, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    logger.info('[src/routes/imagesRoutes.ts] Verificando salud de URLs firmadas');
    
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
    logger.error('[src/routes/imagesRoutes.ts] Error verificando salud de URLs firmadas', error as Error);
    
    res.status(500).json({
      success: false,
      error: 'Error verificando salud de URLs firmadas',
      data: {
        status: 'error',
        timestamp: new Date().toISOString()
      }
    });
  }
});

export default router;
