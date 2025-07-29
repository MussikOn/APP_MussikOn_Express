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
exports.getImageUrlController = exports.getAllImagesController = exports.cleanupExpiredImagesController = exports.getEventImagesController = exports.getPostImagesController = exports.getUserProfileImagesController = exports.getImageStatsController = exports.deleteImageController = exports.updateImageController = exports.listImagesController = exports.getImageByIdController = exports.uploadImageController = void 0;
const imagesModel_1 = require("../models/imagesModel");
/**
 * @swagger
 * /images/upload:
 *   post:
 *     summary: Subir una nueva imagen
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen
 *               category:
 *                 type: string
 *                 enum: [profile, post, event, gallery, admin]
 *                 description: Categoría de la imagen
 *               description:
 *                 type: string
 *                 description: Descripción de la imagen
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Etiquetas de la imagen
 *               isPublic:
 *                 type: boolean
 *                 default: true
 *                 description: Si la imagen es pública
 *     responses:
 *       200:
 *         description: Imagen subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 image:
 *                   $ref: '#/components/schemas/Image'
 */
const uploadImageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: "Usuario no autenticado" });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: "No se proporcionó ningún archivo" });
            return;
        }
        const { category, description, tags, isPublic } = req.body;
        if (!category || !['profile', 'post', 'event', 'gallery', 'admin'].includes(category)) {
            res.status(400).json({ error: "Categoría inválida" });
            return;
        }
        const metadata = {
            description: description || '',
            tags: tags ? JSON.parse(tags) : [],
            isPublic: isPublic !== undefined ? JSON.parse(isPublic) : true,
        };
        const image = yield (0, imagesModel_1.uploadImage)(req.file, user.userEmail, category, metadata);
        console.log(`[src/controllers/imagesController.ts:uploadImageController] Imagen subida por ${user.userEmail}:`, image.id);
        res.status(201).json({
            success: true,
            message: "Imagen subida exitosamente",
            image
        });
    }
    catch (error) {
        console.error('[src/controllers/imagesController.ts:uploadImageController] Error al subir imagen:', error);
        res.status(500).json({
            error: "Error al subir imagen",
            details: error.message
        });
    }
});
exports.uploadImageController = uploadImageController;
/**
 * @swagger
 * /images/{imageId}:
 *   get:
 *     summary: Obtener imagen por ID
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la imagen
 *     responses:
 *       200:
 *         description: Imagen encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 image:
 *                   $ref: '#/components/schemas/Image'
 *       404:
 *         description: Imagen no encontrada
 */
const getImageByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { imageId } = req.params;
        if (!imageId) {
            res.status(400).json({ error: "ID de imagen requerido" });
            return;
        }
        const image = yield (0, imagesModel_1.getImageById)(imageId);
        if (!image) {
            res.status(404).json({ error: "Imagen no encontrada" });
            return;
        }
        console.log(`[src/controllers/imagesController.ts:getImageByIdController] Imagen obtenida:`, imageId);
        res.status(200).json({
            success: true,
            image
        });
    }
    catch (error) {
        console.error('[src/controllers/imagesController.ts:getImageByIdController] Error al obtener imagen:', error);
        res.status(500).json({
            error: "Error al obtener imagen",
            details: error.message
        });
    }
});
exports.getImageByIdController = getImageByIdController;
/**
 * @swagger
 * /images:
 *   get:
 *     summary: Listar imágenes con filtros
 *     tags: [Images]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [profile, post, event, gallery, admin]
 *         description: Filtrar por categoría
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filtrar por usuario
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Filtrar por visibilidad
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en descripción y nombre
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Lista de imágenes
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
 *                   type: integer
 */
const listImagesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, userId, isPublic, search, limit = 20, offset = 0 } = req.query;
        const filters = {};
        if (category)
            filters.category = category;
        if (userId)
            filters.userId = userId;
        if (isPublic !== undefined)
            filters.isPublic = isPublic === 'true';
        if (search)
            filters.search = search;
        if (limit)
            filters.limit = parseInt(limit);
        if (offset)
            filters.offset = parseInt(offset);
        const images = yield (0, imagesModel_1.listImages)(filters);
        console.log(`[src/controllers/imagesController.ts:listImagesController] ${images.length} imágenes listadas`);
        res.status(200).json({
            success: true,
            images,
            total: images.length,
            filters
        });
    }
    catch (error) {
        console.error('[src/controllers/imagesController.ts:listImagesController] Error al listar imágenes:', error);
        res.status(500).json({
            error: "Error al listar imágenes",
            details: error.message
        });
    }
});
exports.listImagesController = listImagesController;
/**
 * @swagger
 * /images/{imageId}:
 *   put:
 *     summary: Actualizar imagen
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la imagen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPublic:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Imagen actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 image:
 *                   $ref: '#/components/schemas/Image'
 */
const updateImageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: "Usuario no autenticado" });
            return;
        }
        const { imageId } = req.params;
        const updateData = req.body;
        if (!imageId) {
            res.status(400).json({ error: "ID de imagen requerido" });
            return;
        }
        // Verificar que la imagen existe y pertenece al usuario
        const existingImage = yield (0, imagesModel_1.getImageById)(imageId);
        if (!existingImage) {
            res.status(404).json({ error: "Imagen no encontrada" });
            return;
        }
        if (existingImage.userId !== user.userEmail) {
            res.status(403).json({ error: "No tienes permisos para actualizar esta imagen" });
            return;
        }
        const updatedImage = yield (0, imagesModel_1.updateImage)(imageId, updateData);
        console.log(`[src/controllers/imagesController.ts:updateImageController] Imagen actualizada por ${user.userEmail}:`, imageId);
        res.status(200).json({
            success: true,
            message: "Imagen actualizada exitosamente",
            image: updatedImage
        });
    }
    catch (error) {
        console.error('[src/controllers/imagesController.ts:updateImageController] Error al actualizar imagen:', error);
        res.status(500).json({
            error: "Error al actualizar imagen",
            details: error.message
        });
    }
});
exports.updateImageController = updateImageController;
/**
 * @swagger
 * /images/{imageId}:
 *   delete:
 *     summary: Eliminar imagen
 *     tags: [Images]
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
 *         description: Imagen eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
const deleteImageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: "Usuario no autenticado" });
            return;
        }
        const { imageId } = req.params;
        if (!imageId) {
            res.status(400).json({ error: "ID de imagen requerido" });
            return;
        }
        yield (0, imagesModel_1.deleteImage)(imageId, user.userEmail);
        console.log(`[src/controllers/imagesController.ts:deleteImageController] Imagen eliminada por ${user.userEmail}:`, imageId);
        res.status(200).json({
            success: true,
            message: "Imagen eliminada exitosamente"
        });
    }
    catch (error) {
        console.error('[src/controllers/imagesController.ts:deleteImageController] Error al eliminar imagen:', error);
        res.status(500).json({
            error: "Error al eliminar imagen",
            details: error.message
        });
    }
});
exports.deleteImageController = deleteImageController;
/**
 * @swagger
 * /images/stats:
 *   get:
 *     summary: Obtener estadísticas de imágenes
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de imágenes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   $ref: '#/components/schemas/ImageStats'
 */
const getImageStatsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user || !['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin'].includes(user.roll)) {
            res.status(403).json({ error: "Acceso denegado. Se requieren permisos de administrador" });
            return;
        }
        const stats = yield (0, imagesModel_1.getImageStats)();
        console.log(`[src/controllers/imagesController.ts:getImageStatsController] Estadísticas obtenidas por ${user.userEmail}`);
        res.status(200).json({
            success: true,
            stats
        });
    }
    catch (error) {
        console.error('[src/controllers/imagesController.ts:getImageStatsController] Error al obtener estadísticas:', error);
        res.status(500).json({
            error: "Error al obtener estadísticas",
            details: error.message
        });
    }
});
exports.getImageStatsController = getImageStatsController;
/**
 * @swagger
 * /images/profile/{userId}:
 *   get:
 *     summary: Obtener imágenes de perfil de un usuario
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Email del usuario
 *     responses:
 *       200:
 *         description: Imágenes de perfil
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
 */
const getUserProfileImagesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ error: "ID de usuario requerido" });
            return;
        }
        const images = yield (0, imagesModel_1.getUserProfileImages)(userId);
        console.log(`[src/controllers/imagesController.ts:getUserProfileImagesController] Imágenes de perfil obtenidas para ${userId}`);
        res.status(200).json({
            success: true,
            images
        });
    }
    catch (error) {
        console.error('[src/controllers/imagesController.ts:getUserProfileImagesController] Error al obtener imágenes de perfil:', error);
        res.status(500).json({
            error: "Error al obtener imágenes de perfil",
            details: error.message
        });
    }
});
exports.getUserProfileImagesController = getUserProfileImagesController;
/**
 * @swagger
 * /images/posts:
 *   get:
 *     summary: Obtener imágenes de posts
 *     tags: [Images]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filtrar por usuario específico
 *     responses:
 *       200:
 *         description: Imágenes de posts
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
 */
const getPostImagesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.query;
        const images = yield (0, imagesModel_1.getPostImages)(userId);
        console.log(`[src/controllers/imagesController.ts:getPostImagesController] ${images.length} imágenes de posts obtenidas`);
        res.status(200).json({
            success: true,
            images
        });
    }
    catch (error) {
        console.error('[src/controllers/imagesController.ts:getPostImagesController] Error al obtener imágenes de posts:', error);
        res.status(500).json({
            error: "Error al obtener imágenes de posts",
            details: error.message
        });
    }
});
exports.getPostImagesController = getPostImagesController;
/**
 * @swagger
 * /images/events:
 *   get:
 *     summary: Obtener imágenes de eventos
 *     tags: [Images]
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *         description: Filtrar por evento específico
 *     responses:
 *       200:
 *         description: Imágenes de eventos
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
 */
const getEventImagesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.query;
        const images = yield (0, imagesModel_1.getEventImages)(eventId);
        console.log(`[src/controllers/imagesController.ts:getEventImagesController] ${images.length} imágenes de eventos obtenidas`);
        res.status(200).json({
            success: true,
            images
        });
    }
    catch (error) {
        console.error('[src/controllers/imagesController.ts:getEventImagesController] Error al obtener imágenes de eventos:', error);
        res.status(500).json({
            error: "Error al obtener imágenes de eventos",
            details: error.message
        });
    }
});
exports.getEventImagesController = getEventImagesController;
/**
 * @swagger
 * /images/cleanup:
 *   post:
 *     summary: Limpiar imágenes expiradas (Solo administradores)
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Limpieza completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 deletedCount:
 *                   type: integer
 *                 message:
 *                   type: string
 */
const cleanupExpiredImagesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user || !['adminSenior', 'superAdmin'].includes(user.roll)) {
            res.status(403).json({ error: "Acceso denegado. Se requieren permisos de administrador senior" });
            return;
        }
        const deletedCount = yield (0, imagesModel_1.cleanupExpiredImages)();
        console.log(`[src/controllers/imagesController.ts:cleanupExpiredImagesController] Limpieza realizada por ${user.userEmail}: ${deletedCount} imágenes eliminadas`);
        res.status(200).json({
            success: true,
            deletedCount,
            message: `${deletedCount} imágenes expiradas eliminadas`
        });
    }
    catch (error) {
        console.error('[src/controllers/imagesController.ts:cleanupExpiredImagesController] Error en limpieza:', error);
        res.status(500).json({
            error: "Error en limpieza de imágenes",
            details: error.message
        });
    }
});
exports.cleanupExpiredImagesController = cleanupExpiredImagesController;
// Controladores legacy para compatibilidad
const getAllImagesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const images = yield (0, imagesModel_1.listImages)();
        res.status(200).json({
            success: true,
            message: "Galería de fotos obtenida",
            images
        });
    }
    catch (error) {
        console.error('[src/controllers/imagesController.ts:getAllImagesController] Error al obtener galería:', error);
        res.status(500).json({
            error: "Error al obtener galería de imágenes",
            details: error.message
        });
    }
});
exports.getAllImagesController = getAllImagesController;
const getImageUrlController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.params;
        if (!key) {
            res.status(400).json({ error: "Clave de archivo requerida" });
            return;
        }
        const image = yield (0, imagesModel_1.getImageById)(key);
        if (!image) {
            res.status(404).json({ error: "Imagen no encontrada" });
            return;
        }
        res.status(200).json({ url: image.url });
    }
    catch (error) {
        console.error('[src/controllers/imagesController.ts:getImageUrlController] Error al obtener URL:', error);
        res.status(500).json({
            error: "Error al generar URL de archivo",
            details: error.message
        });
    }
});
exports.getImageUrlController = getImageUrlController;
