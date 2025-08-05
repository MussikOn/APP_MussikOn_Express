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
exports.imagesController = exports.ImagesController = void 0;
const imageService_1 = require("../services/imageService");
const loggerService_1 = require("../services/loggerService");
const firebase_1 = require("../utils/firebase");
const idriveE2_1 = require("../utils/idriveE2");
class ImagesController {
    /**
     * Subir imagen
     */
    uploadImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
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
                loggerService_1.logger.info('Subiendo imagen', { metadata: { userId, filename: req.file.originalname } });
                const result = yield imageService_1.imageService.uploadImage(req.file, userId, folder, metadata);
                res.status(201).json({
                    success: true,
                    data: result,
                    message: 'Imagen subida exitosamente'
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error subiendo imagen', error, {
                    metadata: { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail }
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
        });
    }
    /**
     * Obtener imagen por ID
     */
    getImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { imageId } = req.params;
                const image = yield imageService_1.imageService.getImage(imageId);
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
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo imagen', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo imagen'
                });
            }
        });
    }
    /**
     * Obtener imagen por URL
     */
    getImageByUrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { url } = req.query;
                if (!url || typeof url !== 'string') {
                    res.status(400).json({
                        success: false,
                        error: 'URL requerida'
                    });
                    return;
                }
                const image = yield imageService_1.imageService.getImageByUrl(url);
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
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo imagen por URL', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo imagen por URL'
                });
            }
        });
    }
    /**
     * Eliminar imagen
     */
    deleteImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                const { imageId } = req.params;
                if (!userId) {
                    res.status(401).json({ error: 'Usuario no autenticado' });
                    return;
                }
                const deleted = yield imageService_1.imageService.deleteImage(imageId);
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
            }
            catch (error) {
                loggerService_1.logger.error('Error eliminando imagen', error);
                res.status(500).json({
                    success: false,
                    error: 'Error eliminando imagen'
                });
            }
        });
    }
    /**
     * Obtener estadísticas de imágenes
     */
    getImageStatistics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                const { userId: targetUserId } = req.query;
                // Solo administradores pueden ver estadísticas de otros usuarios
                if (targetUserId && targetUserId !== userId) {
                    const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.roll;
                    if (!['admin', 'superadmin'].includes(userRole)) {
                        res.status(403).json({
                            success: false,
                            error: 'No tienes permisos para ver estas estadísticas'
                        });
                        return;
                    }
                }
                const statistics = yield imageService_1.imageService.getImageStatistics(targetUserId || userId);
                res.status(200).json({
                    success: true,
                    data: statistics
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo estadísticas de imágenes', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo estadísticas de imágenes'
                });
            }
        });
    }
    /**
     * Obtener todas las imágenes con filtros
     */
    getAllImages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                const { category, isPublic, isActive, search, page = 1, limit = 20 } = req.query;
                const filters = {
                    category: category,
                    isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
                    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                    search: search,
                    page: Number(page),
                    limit: Number(limit)
                };
                const images = yield imageService_1.imageService.getAllImages(filters);
                res.status(200).json({
                    success: true,
                    images,
                    total: images.length,
                    page: Number(page),
                    limit: Number(limit)
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo imágenes', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo imágenes'
                });
            }
        });
    }
    /**
     * Obtener estadísticas de imágenes (alias para getImageStatistics)
     */
    getImageStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                const statistics = yield imageService_1.imageService.getImageStatistics(userId);
                res.status(200).json({
                    success: true,
                    stats: statistics
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo estadísticas de imágenes', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo estadísticas de imágenes'
                });
            }
        });
    }
    /**
     * Verificar integridad de imagen
     */
    verifyImageIntegrity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { imageId } = req.params;
                const integrity = yield imageService_1.imageService.verifyImageIntegrity(imageId);
                res.status(200).json({
                    success: true,
                    data: integrity
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error verificando integridad de imagen', error);
                res.status(500).json({
                    success: false,
                    error: 'Error verificando integridad de imagen'
                });
            }
        });
    }
    /**
     * Limpiar imágenes no utilizadas (solo admin)
     */
    cleanupUnusedImages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { daysOld = 30 } = req.body;
                const deletedCount = yield imageService_1.imageService.cleanupUnusedImages(Number(daysOld));
                res.status(200).json({
                    success: true,
                    data: {
                        deletedCount,
                        daysOld: Number(daysOld)
                    },
                    message: `${deletedCount} imágenes eliminadas`
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error en limpieza de imágenes', error);
                res.status(500).json({
                    success: false,
                    error: 'Error en limpieza de imágenes'
                });
            }
        });
    }
    /**
     * Validar archivo antes de subir
     */
    validateImageFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.file) {
                    res.status(400).json({
                        success: false,
                        error: 'No se proporcionó archivo'
                    });
                    return;
                }
                const validation = imageService_1.imageService.validateImageFile(req.file);
                res.status(200).json({
                    success: validation.isValid,
                    data: validation,
                    message: validation.isValid ? 'Archivo válido' : 'Archivo inválido'
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error validando archivo', error);
                res.status(500).json({
                    success: false,
                    error: 'Error validando archivo'
                });
            }
        });
    }
    /**
     * Servir imagen directamente (para compatibilidad)
     */
    serveImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { imageId } = req.params;
                const image = yield imageService_1.imageService.getImage(imageId);
                if (!image) {
                    res.status(404).json({
                        success: false,
                        error: 'Imagen no encontrada'
                    });
                    return;
                }
                // Redirigir a la URL de S3
                res.redirect(image.url);
            }
            catch (error) {
                loggerService_1.logger.error('Error sirviendo imagen', error);
                res.status(500).json({
                    success: false,
                    error: 'Error sirviendo imagen'
                });
            }
        });
    }
    /**
     * Servir imagen directamente desde URL
     */
    serveImageByUrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    const response = yield fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const buffer = yield response.arrayBuffer();
                    const contentType = response.headers.get('content-type') || 'image/jpeg';
                    res.set({
                        'Content-Type': contentType,
                        'Cache-Control': 'public, max-age=3600',
                        'Content-Length': buffer.byteLength.toString(),
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.send(Buffer.from(buffer));
                }
                catch (fetchError) {
                    loggerService_1.logger.error('Error obteniendo imagen de S3', fetchError, { metadata: { url } });
                    res.status(500).json({ error: 'Error obteniendo imagen' });
                }
            }
            catch (error) {
                loggerService_1.logger.error('Error sirviendo imagen por URL', error);
                res.status(500).json({
                    success: false,
                    error: 'Error sirviendo imagen'
                });
            }
        });
    }
    /**
     * Obtener imagen de voucher de depósito - MEJORADO
     */
    getVoucherImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { depositId } = req.params;
                if (!depositId) {
                    res.status(400).json({
                        success: false,
                        error: 'ID de depósito requerido'
                    });
                    return;
                }
                loggerService_1.logger.info('[src/controllers/imagesController.ts] Obteniendo imagen de voucher', { metadata: { depositId } });
                // Obtener los detalles del depósito directamente desde Firestore
                const depositDoc = yield firebase_1.db.collection('user_deposits').doc(depositId).get();
                if (!depositDoc.exists) {
                    res.status(404).json({
                        success: false,
                        error: 'Depósito no encontrado'
                    });
                    return;
                }
                const deposit = depositDoc.data();
                if (!((_a = deposit === null || deposit === void 0 ? void 0 : deposit.voucherFile) === null || _a === void 0 ? void 0 : _a.url)) {
                    res.status(404).json({
                        success: false,
                        error: 'Voucher no encontrado para este depósito'
                    });
                    return;
                }
                // Extraer la clave del archivo desde la URL
                const key = (0, idriveE2_1.extractKeyFromUrl)(deposit.voucherFile.url);
                if (!key) {
                    loggerService_1.logger.error('[src/controllers/imagesController.ts] No se pudo extraer la clave de la URL', new Error('No se pudo extraer la clave'), {
                        metadata: { depositId, voucherUrl: deposit.voucherFile.url }
                    });
                    // Fallback: intentar obtener la imagen usando fetch
                    try {
                        const response = yield fetch(deposit.voucherFile.url);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const buffer = yield response.arrayBuffer();
                        const contentType = response.headers.get('content-type') || 'image/jpeg';
                        res.set({
                            'Content-Type': contentType,
                            'Cache-Control': 'public, max-age=3600',
                            'Content-Length': buffer.byteLength.toString(),
                            'Access-Control-Allow-Origin': '*'
                        });
                        res.send(Buffer.from(buffer));
                        return;
                    }
                    catch (fetchError) {
                        loggerService_1.logger.error('[src/controllers/imagesController.ts] Error en fallback fetch', fetchError, {
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
                    const imageData = yield (0, idriveE2_1.getImageFromS3)(key);
                    res.set({
                        'Content-Type': imageData.contentType,
                        'Cache-Control': 'public, max-age=3600',
                        'Content-Length': imageData.size.toString(),
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.send(imageData.buffer);
                    loggerService_1.logger.info('[src/controllers/imagesController.ts] Imagen de voucher servida exitosamente', {
                        metadata: { depositId, key, contentType: imageData.contentType, size: imageData.size }
                    });
                }
                catch (s3Error) {
                    loggerService_1.logger.error('[src/controllers/imagesController.ts] Error obteniendo imagen desde S3', s3Error, {
                        metadata: { depositId, key, voucherUrl: deposit.voucherFile.url }
                    });
                    // Fallback: intentar obtener la imagen usando fetch
                    try {
                        const response = yield fetch(deposit.voucherFile.url);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const buffer = yield response.arrayBuffer();
                        const contentType = response.headers.get('content-type') || 'image/jpeg';
                        res.set({
                            'Content-Type': contentType,
                            'Cache-Control': 'public, max-age=3600',
                            'Content-Length': buffer.byteLength.toString(),
                            'Access-Control-Allow-Origin': '*'
                        });
                        res.send(Buffer.from(buffer));
                    }
                    catch (fetchError) {
                        loggerService_1.logger.error('[src/controllers/imagesController.ts] Error en fallback fetch final', fetchError, {
                            metadata: { depositId, voucherUrl: deposit.voucherFile.url }
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Error obteniendo imagen de voucher'
                        });
                    }
                }
            }
            catch (error) {
                loggerService_1.logger.error('[src/controllers/imagesController.ts] Error obteniendo imagen de voucher', error, {
                    metadata: { depositId: req.params.depositId }
                });
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo imagen de voucher'
                });
            }
        });
    }
    /**
     * Generar URL firmada para una imagen
     */
    generatePresignedUrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { imageId } = req.params;
                const { expiresIn = 3600 } = req.query;
                const image = yield imageService_1.imageService.getImage(imageId);
                if (!image) {
                    res.status(404).json({
                        success: false,
                        error: 'Imagen no encontrada'
                    });
                    return;
                }
                // Extraer la clave del archivo desde la URL
                const key = (0, idriveE2_1.extractKeyFromUrl)(image.url);
                if (!key) {
                    res.status(400).json({
                        success: false,
                        error: 'No se pudo extraer la clave de la imagen'
                    });
                    return;
                }
                // Generar URL firmada
                const presignedUrl = yield (0, idriveE2_1.generatePresignedUrl)(key, Number(expiresIn));
                res.status(200).json({
                    success: true,
                    data: {
                        presignedUrl,
                        expiresIn: Number(expiresIn),
                        originalUrl: image.url
                    }
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error generando URL firmada', error);
                res.status(500).json({
                    success: false,
                    error: 'Error generando URL firmada'
                });
            }
        });
    }
}
exports.ImagesController = ImagesController;
// Instancia singleton
exports.imagesController = new ImagesController();
