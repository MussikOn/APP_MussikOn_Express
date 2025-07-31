"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminOnly_1 = require("../middleware/adminOnly");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const imagesController_1 = require("../controllers/imagesController");
const router = (0, express_1.Router)();
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
router.post("/upload", authMiddleware_1.authMiddleware, uploadMiddleware_1.imageUpload.single('image'), uploadMiddleware_1.validateImageFile, imagesController_1.uploadImageController);
/**
 * GET /images
 * Listar imágenes con filtros
 */
router.get("/", imagesController_1.listImagesController);
/**
 * GET /images/:imageId
 * Obtener imagen por ID
 */
router.get("/:imageId", imagesController_1.getImageByIdController);
/**
 * PUT /images/:imageId
 * Actualizar imagen
 */
router.put("/:imageId", authMiddleware_1.authMiddleware, imagesController_1.updateImageController);
/**
 * DELETE /images/:imageId
 * Eliminar imagen
 */
router.delete("/:imageId", authMiddleware_1.authMiddleware, imagesController_1.deleteImageController);
// ==================== RUTAS ESPECÍFICAS ====================
/**
 * GET /images/profile/:userId
 * Obtener imágenes de perfil de un usuario
 */
router.get("/profile/:userId", imagesController_1.getUserProfileImagesController);
/**
 * GET /images/posts
 * Obtener imágenes de posts
 */
router.get("/posts", imagesController_1.getPostImagesController);
/**
 * GET /images/events
 * Obtener imágenes de eventos
 */
router.get("/events", imagesController_1.getEventImagesController);
// ==================== RUTAS DE ADMINISTRACIÓN ====================
/**
 * GET /images/stats
 * Obtener estadísticas de imágenes (Solo administradores)
 */
router.get("/stats", authMiddleware_1.authMiddleware, adminOnly_1.adminOnly, imagesController_1.getImageStatsController);
/**
 * POST /images/cleanup
 * Limpiar imágenes expiradas (Solo administradores senior)
 */
router.post("/cleanup", authMiddleware_1.authMiddleware, adminOnly_1.adminOnly, imagesController_1.cleanupExpiredImagesController);
// ==================== RUTAS LEGACY (COMPATIBILIDAD) ====================
/**
 * GET /imgs/getAllImg
 * Obtener galería de imágenes (Legacy)
 */
router.get("/getAllImg", imagesController_1.getAllImagesController);
/**
 * GET /imgs/url/:key
 * Obtener URL de imagen por clave (Legacy)
 */
router.get("/url/:key", imagesController_1.getImageUrlController);
exports.default = router;
