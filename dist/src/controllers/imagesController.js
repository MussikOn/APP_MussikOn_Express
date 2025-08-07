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
     * Obtener todas las imágenes con URLs firmadas de IDrive E2
     */
    getAllImagesWithSignedUrls(req, res) {
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
                loggerService_1.logger.info('[src/controllers/imagesController.ts] Obteniendo imágenes con URLs firmadas', {
                    metadata: { userId, filters }
                });
                const images = yield imageService_1.imageService.getAllImagesWithSignedUrls(filters);
                res.status(200).json({
                    success: true,
                    images,
                    total: images.length,
                    page: Number(page),
                    limit: Number(limit),
                    message: 'Imágenes obtenidas con URLs firmadas de IDrive E2'
                });
            }
            catch (error) {
                loggerService_1.logger.error('[src/controllers/imagesController.ts] Error obteniendo imágenes con URLs firmadas', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo imágenes con URLs firmadas'
                });
            }
        });
    }
    /**
     * Obtener imágenes directamente desde IDrive E2 con URLs firmadas
     */
    getAllImagesFromIDriveE2(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category, search, page = 1, limit = 20 } = req.query;
                const filters = {
                    category: category,
                    search: search,
                    page: Number(page),
                    limit: Number(limit)
                };
                loggerService_1.logger.info('[src/controllers/imagesController.ts] Obteniendo imágenes directamente desde IDrive E2', {
                    metadata: { filters }
                });
                const images = yield imageService_1.imageService.getAllImagesFromIDriveE2(filters);
                res.status(200).json({
                    success: true,
                    images,
                    total: images.length,
                    page: Number(page),
                    limit: Number(limit),
                    message: 'Imágenes obtenidas directamente desde IDrive E2 con URLs firmadas'
                });
            }
            catch (error) {
                loggerService_1.logger.error('[src/controllers/imagesController.ts] Error obteniendo imágenes desde IDrive E2', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo imágenes desde IDrive E2'
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
    /**
     * Endpoint de diagnóstico para verificar estado de imágenes
     */
    diagnoseImages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                if (!userId) {
                    res.status(401).json({ error: 'Usuario no autenticado' });
                    return;
                }
                loggerService_1.logger.info('[src/controllers/imagesController.ts] Iniciando diagnóstico de imágenes', { metadata: { userId } });
                // 1. Verificar configuración de IDrive E2
                const config = {
                    endpoint: process.env.IDRIVE_E2_ENDPOINT,
                    region: process.env.IDRIVE_E2_REGION,
                    bucket: process.env.IDRIVE_E2_BUCKET_NAME,
                    accessKey: process.env.IDRIVE_E2_ACCESS_KEY ? 'Configurado' : 'No configurado',
                    secretKey: process.env.IDRIVE_E2_SECRET_KEY ? 'Configurado' : 'No configurado'
                };
                // 2. Verificar registros en Firestore
                const imagesSnapshot = yield firebase_1.db.collection('images').limit(10).get();
                const imageUploadsSnapshot = yield firebase_1.db.collection('image_uploads').limit(10).get();
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
                let idriveStatus = { connected: false, error: null, files: 0 };
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
                    const response = yield s3Client.send(listCommand);
                    idriveStatus = {
                        connected: true,
                        error: null,
                        files: ((_b = response.Contents) === null || _b === void 0 ? void 0 : _b.length) || 0,
                        sampleFiles: ((_c = response.Contents) === null || _c === void 0 ? void 0 : _c.slice(0, 3).map((file) => ({
                            key: file.Key,
                            size: file.Size,
                            lastModified: file.LastModified
                        }))) || []
                    };
                }
                catch (error) {
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
                            const response = yield fetch(image.url, { method: 'HEAD' });
                            urlTests.push({
                                url: image.url,
                                accessible: response.ok,
                                status: response.status,
                                size: response.headers.get('content-length')
                            });
                        }
                        catch (error) {
                            urlTests.push({
                                url: image.url,
                                accessible: false,
                                error: error instanceof Error ? error.message : 'Error desconocido'
                            });
                        }
                    }
                }
                const diagnosis = {
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
            }
            catch (error) {
                loggerService_1.logger.error('[src/controllers/imagesController.ts] Error en diagnóstico de imágenes', error);
                res.status(500).json({
                    success: false,
                    error: 'Error en diagnóstico de imágenes'
                });
            }
        });
    }
    /**
     * Obtener una sola imagen específica desde IDrive E2
     */
    getSingleImageFromIDriveE2(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { key } = req.params;
                if (!key) {
                    res.status(400).json({
                        success: false,
                        error: 'Se requiere la clave (key) de la imagen'
                    });
                    return;
                }
                const image = yield imageService_1.imageService.getSingleImageFromIDriveE2(key);
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
            }
            catch (error) {
                loggerService_1.logger.error('[src/controllers/imagesController.ts] Error obteniendo imagen individual:', error instanceof Error ? error : new Error(String(error)));
                res.status(500).json({
                    success: false,
                    error: `Error obteniendo imagen: ${error instanceof Error ? error.message : String(error)}`
                });
            }
        });
    }
    /**
     * Obtener imagen por nombre de archivo desde IDrive E2
     */
    getImageByFilenameFromIDriveE2(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const image = yield imageService_1.imageService.getImageByFilenameFromIDriveE2(filename, category);
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
            }
            catch (error) {
                loggerService_1.logger.error('[src/controllers/imagesController.ts] Error obteniendo imagen por nombre:', error instanceof Error ? error : new Error(String(error)));
                res.status(500).json({
                    success: false,
                    error: `Error obteniendo imagen por nombre: ${error instanceof Error ? error.message : String(error)}`
                });
            }
        });
    }
    /**
     * Actualizar todas las URLs firmadas (endpoint administrativo)
     */
    updateAllSignedUrls(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('[src/controllers/imagesController.ts] Iniciando actualización masiva de URLs firmadas');
                const result = yield imageService_1.imageService.updateAllSignedUrls();
                res.status(200).json({
                    success: true,
                    message: 'Actualización de URLs firmadas completada',
                    data: result
                });
            }
            catch (error) {
                loggerService_1.logger.error('[src/controllers/imagesController.ts] Error actualizando URLs firmadas', error);
                res.status(500).json({
                    success: false,
                    error: 'Error actualizando URLs firmadas'
                });
            }
        });
    }
    /**
     * Verificar y renovar URLs firmadas expiradas
     */
    refreshExpiredSignedUrls(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('[src/controllers/imagesController.ts] Verificando URLs firmadas expiradas');
                const result = yield imageService_1.imageService.refreshExpiredSignedUrls();
                res.status(200).json({
                    success: true,
                    message: 'Verificación de URLs expiradas completada',
                    data: result
                });
            }
            catch (error) {
                loggerService_1.logger.error('[src/controllers/imagesController.ts] Error verificando URLs expiradas', error);
                res.status(500).json({
                    success: false,
                    error: 'Error verificando URLs expiradas'
                });
            }
        });
    }
    /**
     * Obtener imagen con URL firmada garantizada
     */
    getImageWithGuaranteedSignedUrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { imageId } = req.params;
                if (!imageId) {
                    res.status(400).json({
                        success: false,
                        error: 'ID de imagen requerido'
                    });
                    return;
                }
                const image = yield imageService_1.imageService.getImageWithGuaranteedSignedUrl(imageId);
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
                loggerService_1.logger.error('[src/controllers/imagesController.ts] Error obteniendo imagen con URL garantizada', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo imagen con URL garantizada'
                });
            }
        });
    }
    /**
     * Obtener múltiples imágenes con URLs firmadas garantizadas
     */
    getMultipleImagesWithGuaranteedSignedUrls(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { imageIds } = req.body;
                if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
                    res.status(400).json({
                        success: false,
                        error: 'Array de IDs de imágenes requerido'
                    });
                    return;
                }
                const result = yield imageService_1.imageService.getMultipleImagesWithGuaranteedSignedUrls(imageIds);
                res.status(200).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                loggerService_1.logger.error('[src/controllers/imagesController.ts] Error obteniendo múltiples imágenes con URLs garantizadas', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo múltiples imágenes'
                });
            }
        });
    }
}
exports.ImagesController = ImagesController;
// Instancia singleton
exports.imagesController = new ImagesController();
