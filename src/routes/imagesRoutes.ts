import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/adminOnly';
import {
  imageUpload,
  handleMulterError,
  validateImageFile,
} from '../middleware/uploadMiddleware';
import {
  uploadImageController,
  getImageByIdController,
  listImagesController,
  updateImageController,
  deleteImageController,
  getImageStatsController,
  getUserProfileImagesController,
  getPostImagesController,
  getEventImagesController,
  cleanupExpiredImagesController,
  // Controladores legacy para compatibilidad
  getAllImagesController,
  getImageUrlController,
} from '../controllers/imagesController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Image:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la imagen
 *         key:
 *           type: string
 *           description: Clave en S3
 *         url:
 *           type: string
 *           description: URL firmada de la imagen
 *         originalName:
 *           type: string
 *           description: Nombre original del archivo
 *         fileName:
 *           type: string
 *           description: Nombre del archivo en el sistema
 *         size:
 *           type: number
 *           description: Tamaño del archivo en bytes
 *         mimetype:
 *           type: string
 *           description: Tipo MIME del archivo
 *         category:
 *           type: string
 *           enum: [profile, post, event, gallery, admin]
 *           description: Categoría de la imagen
 *         userId:
 *           type: string
 *           description: Email del propietario
 *         description:
 *           type: string
 *           description: Descripción de la imagen
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Etiquetas de la imagen
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
 *         isPublic:
 *           type: boolean
 *           description: Si la imagen es pública
 *         isActive:
 *           type: boolean
 *           description: Si la imagen está activa
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración (para URLs temporales)
 *     ImageStats:
 *       type: object
 *       properties:
 *         totalImages:
 *           type: number
 *           description: Total de imágenes
 *         totalSize:
 *           type: number
 *           description: Tamaño total en bytes
 *         imagesByCategory:
 *           type: object
 *           description: Conteo de imágenes por categoría
 *         imagesByUser:
 *           type: object
 *           description: Conteo de imágenes por usuario
 *         recentUploads:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Image'
 *           description: Imágenes subidas recientemente
 */

// ==================== RUTAS PRINCIPALES ====================

/**
 * POST /images/upload
 * Subir una nueva imagen
 */
router.post(
  '/upload',
  authMiddleware,
  imageUpload.single('image'),
  validateImageFile,
  uploadImageController
);

/**
 * GET /images
 * Listar imágenes con filtros
 */
router.get('/', listImagesController);

/**
 * GET /images/:imageId
 * Obtener imagen por ID
 */
router.get('/:imageId', getImageByIdController);

/**
 * PUT /images/:imageId
 * Actualizar imagen
 */
router.put('/:imageId', authMiddleware, updateImageController);

/**
 * DELETE /images/:imageId
 * Eliminar imagen
 */
router.delete('/:imageId', authMiddleware, deleteImageController);

// ==================== RUTAS ESPECÍFICAS ====================

/**
 * GET /images/profile/:userId
 * Obtener imágenes de perfil de un usuario
 */
router.get('/profile/:userId', getUserProfileImagesController);

/**
 * GET /images/posts
 * Obtener imágenes de posts
 */
router.get('/posts', getPostImagesController);

/**
 * GET /images/events
 * Obtener imágenes de eventos
 */
router.get('/events', getEventImagesController);

// ==================== RUTAS DE ADMINISTRACIÓN ====================

/**
 * GET /images/stats
 * Obtener estadísticas de imágenes (Solo administradores)
 */
router.get('/stats', authMiddleware, adminOnly, getImageStatsController);

/**
 * POST /images/cleanup
 * Limpiar imágenes expiradas (Solo administradores senior)
 */
router.post(
  '/cleanup',
  authMiddleware,
  adminOnly,
  cleanupExpiredImagesController
);

// ==================== RUTAS LEGACY (COMPATIBILIDAD) ====================

/**
 * GET /imgs/getAllImg
 * Obtener galería de imágenes (Legacy)
 */
router.get('/getAllImg', getAllImagesController);

/**
 * GET /imgs/url/:key
 * Obtener URL de imagen por clave (Legacy)
 */
router.get('/url/:key', getImageUrlController);

export default router;
