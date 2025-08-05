"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imagesController_1 = require("../controllers/imagesController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const requireRole_1 = require("../middleware/requireRole");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const uploadMiddleware_2 = require("../middleware/uploadMiddleware");
const router = (0, express_1.Router)();
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
router.post('/upload', authMiddleware_1.authMiddleware, uploadMiddleware_1.upload.single('file'), uploadMiddleware_2.validateImageFile, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield imagesController_1.imagesController.uploadImage(req, res);
}));
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
router.get('/', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield imagesController_1.imagesController.getAllImages(req, res);
}));
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
router.get('/stats', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield imagesController_1.imagesController.getImageStats(req, res);
}));
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
router.get('/:imageId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield imagesController_1.imagesController.getImage(req, res);
}));
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
router.get('/url', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield imagesController_1.imagesController.getImageByUrl(req, res);
}));
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
router.get('/voucher/:depositId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield imagesController_1.imagesController.getVoucherImage(req, res);
}));
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
router.delete('/:imageId', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield imagesController_1.imagesController.deleteImage(req, res);
}));
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
router.get('/statistics', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield imagesController_1.imagesController.getImageStatistics(req, res);
}));
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
router.get('/:imageId/integrity', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield imagesController_1.imagesController.verifyImageIntegrity(req, res);
}));
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
router.post('/cleanup', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['admin', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield imagesController_1.imagesController.cleanupUnusedImages(req, res);
}));
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
router.post('/validate', uploadMiddleware_1.upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield imagesController_1.imagesController.validateImageFile(req, res);
}));
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
router.get('/:imageId/serve', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield imagesController_1.imagesController.serveImage(req, res);
}));
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
router.get('/serve-url', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield imagesController_1.imagesController.serveImageByUrl(req, res);
}));
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
router.post('/saveImage', authMiddleware_1.authMiddleware, uploadMiddleware_1.upload.single('file'), uploadMiddleware_2.validateImageFile, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield imagesController_1.imagesController.uploadImage(req, res);
}));
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
router.get('/getImage/:key', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Convertir clave a imageId para compatibilidad
    req.params.imageId = req.params.key;
    yield imagesController_1.imagesController.getImage(req, res);
}));
exports.default = router;
