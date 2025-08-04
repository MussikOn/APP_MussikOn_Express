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
}
exports.ImagesController = ImagesController;
// Instancia singleton
exports.imagesController = new ImagesController();
