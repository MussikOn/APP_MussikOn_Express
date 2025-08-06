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
exports.imageService = exports.ImageService = void 0;
const idriveE2_1 = require("../utils/idriveE2");
const loggerService_1 = require("./loggerService");
const firebase_1 = require("../utils/firebase");
class ImageService {
    constructor() {
        this.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        this.ALLOWED_MIME_TYPES = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'application/pdf'
        ];
    }
    /**
     * Validar archivo de imagen
     */
    validateImageFile(file) {
        const errors = [];
        const warnings = [];
        if (!file) {
            errors.push('No se proporcionó archivo');
            return { isValid: false, errors, warnings };
        }
        // Validar tamaño
        if (file.size > this.MAX_FILE_SIZE) {
            errors.push(`El archivo es demasiado grande. Máximo ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
        // Validar tipo MIME
        if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            errors.push('Tipo de archivo no permitido. Solo imágenes y PDFs');
        }
        // Validar que el buffer no esté vacío
        if (!file.buffer || file.buffer.length === 0) {
            errors.push('El archivo está vacío');
        }
        // Advertencias
        if (file.size > 5 * 1024 * 1024) { // 5MB
            warnings.push('El archivo es grande, puede tardar en subirse');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Generar nombre único para archivo
     */
    generateUniqueFileName(originalName, userId, folder = 'uploads') {
        var _a;
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const extension = ((_a = originalName.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'jpg';
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
        return `${folder}/${userId}/${timestamp}_${randomSuffix}_${sanitizedName}`;
    }
    /**
     * Subir imagen con manejo mejorado de errores
     */
    uploadImage(file_1, userId_1) {
        return __awaiter(this, arguments, void 0, function* (file, userId, folder = 'uploads', metadata) {
            try {
                // Validar archivo
                const validation = this.validateImageFile(file);
                if (!validation.isValid) {
                    throw new Error(`Error de validación: ${validation.errors.join(', ')}`);
                }
                // Generar nombre único
                const uniqueFileName = this.generateUniqueFileName(file.originalname || 'image.jpg', userId, folder);
                loggerService_1.logger.info('Subiendo imagen', {
                    metadata: {
                        userId,
                        filename: uniqueFileName,
                        size: file.size,
                        mimeType: file.mimetype,
                        warnings: validation.warnings
                    }
                });
                // Subir a S3
                const fileUrl = yield (0, idriveE2_1.uploadToS3)(file.buffer, uniqueFileName, file.mimetype, folder);
                // Crear registro en base de datos para tracking
                const imageRecord = {
                    url: fileUrl,
                    filename: uniqueFileName,
                    originalName: file.originalname,
                    size: file.size,
                    mimeType: file.mimetype,
                    userId,
                    folder,
                    metadata,
                    uploadedAt: new Date().toISOString(),
                    lastAccessed: new Date().toISOString(),
                    accessCount: 0
                };
                const imageId = `img_${Date.now()}_${userId}`;
                yield firebase_1.db.collection('image_uploads').doc(imageId).set(imageRecord);
                loggerService_1.logger.info('Imagen subida exitosamente', {
                    metadata: {
                        imageId,
                        url: fileUrl,
                        userId
                    }
                });
                return {
                    url: fileUrl,
                    filename: uniqueFileName,
                    size: file.size,
                    mimeType: file.mimetype,
                    uploadedAt: imageRecord.uploadedAt,
                    metadata
                };
            }
            catch (error) {
                loggerService_1.logger.error('Error subiendo imagen', error, {
                    metadata: { userId, filename: file === null || file === void 0 ? void 0 : file.originalname }
                });
                throw new Error('Error subiendo imagen. Intente nuevamente.');
            }
        });
    }
    /**
     * Obtener imagen con cache y tracking
     */
    getImage(imageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const imageDoc = yield firebase_1.db.collection('image_uploads').doc(imageId).get();
                if (!imageDoc.exists) {
                    loggerService_1.logger.warn('Imagen no encontrada', { metadata: { imageId } });
                    return null;
                }
                const imageData = imageDoc.data();
                // Actualizar contador de acceso
                yield firebase_1.db.collection('image_uploads').doc(imageId).update({
                    lastAccessed: new Date().toISOString(),
                    accessCount: (imageData.accessCount || 0) + 1
                });
                return {
                    url: imageData.url,
                    filename: imageData.filename,
                    size: imageData.size,
                    mimeType: imageData.mimeType,
                    uploadedAt: imageData.uploadedAt,
                    metadata: imageData.metadata
                };
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo imagen', error, { metadata: { imageId } });
                throw new Error('Error obteniendo imagen');
            }
        });
    }
    /**
     * Obtener imagen por URL
     */
    getImageByUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const imageSnapshot = yield firebase_1.db.collection('image_uploads')
                    .where('url', '==', url)
                    .limit(1)
                    .get();
                if (imageSnapshot.empty) {
                    return null;
                }
                const imageDoc = imageSnapshot.docs[0];
                const imageData = imageDoc.data();
                return {
                    url: imageData.url,
                    filename: imageData.filename,
                    size: imageData.size,
                    mimeType: imageData.mimeType,
                    uploadedAt: imageData.uploadedAt,
                    metadata: imageData.metadata
                };
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo imagen por URL', error, { metadata: { url } });
                throw new Error('Error obteniendo imagen por URL');
            }
        });
    }
    /**
     * Obtener todas las imágenes con filtros
     */
    getAllImages(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let query = firebase_1.db.collection('image_uploads');
                // Aplicar filtros
                if (filters === null || filters === void 0 ? void 0 : filters.category) {
                    query = query.where('category', '==', filters.category);
                }
                if ((filters === null || filters === void 0 ? void 0 : filters.isPublic) !== undefined) {
                    query = query.where('isPublic', '==', filters.isPublic);
                }
                if ((filters === null || filters === void 0 ? void 0 : filters.isActive) !== undefined) {
                    query = query.where('isActive', '==', filters.isActive);
                }
                // Aplicar paginación
                const page = (filters === null || filters === void 0 ? void 0 : filters.page) || 1;
                const limit = (filters === null || filters === void 0 ? void 0 : filters.limit) || 20;
                const offset = (page - 1) * limit;
                query = query.limit(limit).offset(offset);
                const imagesSnapshot = yield query.get();
                const images = [];
                imagesSnapshot.forEach((doc) => {
                    var _a, _b, _c;
                    const imageData = doc.data();
                    const image = Object.assign({ id: doc.id }, imageData);
                    // Aplicar filtro de búsqueda si existe
                    if (filters === null || filters === void 0 ? void 0 : filters.search) {
                        const searchTerm = filters.search.toLowerCase();
                        const description = ((_a = imageData.description) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
                        const filename = ((_b = imageData.filename) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
                        const tags = ((_c = imageData.tags) === null || _c === void 0 ? void 0 : _c.join(' ').toLowerCase()) || '';
                        if (description.includes(searchTerm) ||
                            filename.includes(searchTerm) ||
                            tags.includes(searchTerm)) {
                            images.push(image);
                        }
                    }
                    else {
                        images.push(image);
                    }
                });
                return images;
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo imágenes', error);
                throw new Error('Error obteniendo imágenes');
            }
        });
    }
    /**
     * Eliminar imagen
     */
    deleteImage(imageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const imageDoc = yield firebase_1.db.collection('image_uploads').doc(imageId).get();
                if (!imageDoc.exists) {
                    loggerService_1.logger.warn('Imagen no encontrada para eliminar', { metadata: { imageId } });
                    return false;
                }
                const imageData = imageDoc.data();
                // Eliminar de S3 (implementar si es necesario)
                // await deleteFromS3(imageData.filename);
                // Eliminar de base de datos
                yield firebase_1.db.collection('image_uploads').doc(imageId).delete();
                loggerService_1.logger.info('Imagen eliminada exitosamente', { metadata: { imageId } });
                return true;
            }
            catch (error) {
                loggerService_1.logger.error('Error eliminando imagen', error, { metadata: { imageId } });
                throw new Error('Error eliminando imagen');
            }
        });
    }
    /**
     * Obtener estadísticas de imágenes
     */
    getImageStatistics(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let query = firebase_1.db.collection('image_uploads');
                if (userId) {
                    query = query.where('userId', '==', userId);
                }
                const imagesSnapshot = yield query.get();
                const images = imagesSnapshot.docs.map((doc) => doc.data());
                const totalImages = images.length;
                const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
                // Contar por categoría
                const imagesByCategory = {};
                images.forEach((img) => {
                    const category = img.category || 'other';
                    imagesByCategory[category] = (imagesByCategory[category] || 0) + 1;
                });
                // Contar por usuario
                const imagesByUser = {};
                images.forEach((img) => {
                    const user = img.userId || 'unknown';
                    imagesByUser[user] = (imagesByUser[user] || 0) + 1;
                });
                // Contar públicas vs privadas
                const publicImages = images.filter((img) => img.isPublic === true).length;
                const privateImages = totalImages - publicImages;
                // Contar activas vs inactivas
                const activeImages = images.filter((img) => img.isActive !== false).length;
                const inactiveImages = totalImages - activeImages;
                return {
                    totalImages,
                    totalSize,
                    imagesByCategory,
                    imagesByUser,
                    publicImages,
                    privateImages,
                    activeImages,
                    inactiveImages
                };
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo estadísticas de imágenes', error);
                throw new Error('Error obteniendo estadísticas de imágenes');
            }
        });
    }
    /**
     * Limpiar imágenes antiguas no utilizadas
     */
    cleanupUnusedImages() {
        return __awaiter(this, arguments, void 0, function* (daysOld = 30) {
            try {
                const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();
                const unusedImagesSnapshot = yield firebase_1.db.collection('image_uploads')
                    .where('lastAccessed', '<', cutoffDate)
                    .where('accessCount', '==', 0)
                    .get();
                const deletedCount = unusedImagesSnapshot.size;
                // Eliminar en lotes
                const batch = firebase_1.db.batch();
                unusedImagesSnapshot.docs.forEach(doc => {
                    batch.delete(doc.ref);
                });
                yield batch.commit();
                loggerService_1.logger.info('Limpieza de imágenes completada', {
                    metadata: { deletedCount, daysOld }
                });
                return deletedCount;
            }
            catch (error) {
                loggerService_1.logger.error('Error en limpieza de imágenes', error);
                throw new Error('Error en limpieza de imágenes');
            }
        });
    }
    /**
     * Verificar integridad de imagen
     */
    verifyImageIntegrity(imageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const imageDoc = yield firebase_1.db.collection('image_uploads').doc(imageId).get();
                if (!imageDoc.exists) {
                    return {
                        exists: false,
                        accessible: false,
                        size: 0,
                        lastAccessed: '',
                        accessCount: 0
                    };
                }
                const imageData = imageDoc.data();
                // Verificar si la URL es accesible
                let accessible = false;
                try {
                    const response = yield fetch(imageData.url, { method: 'HEAD' });
                    accessible = response.ok;
                }
                catch (fetchError) {
                    loggerService_1.logger.warn('Error verificando accesibilidad de imagen', {
                        error: fetchError,
                        metadata: {
                            imageId,
                            url: imageData.url
                        }
                    });
                }
                return {
                    exists: true,
                    accessible,
                    size: imageData.size || 0,
                    lastAccessed: imageData.lastAccessed || '',
                    accessCount: imageData.accessCount || 0
                };
            }
            catch (error) {
                loggerService_1.logger.error('Error verificando integridad de imagen', error, { metadata: { imageId } });
                throw new Error('Error verificando integridad de imagen');
            }
        });
    }
    /**
     * Obtener todas las imágenes con URLs firmadas de IDrive E2
     */
    getAllImagesWithSignedUrls(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('[src/services/imageService.ts] Obteniendo imágenes con URLs firmadas', {
                    metadata: { filters }
                });
                // Obtener imágenes de la base de datos
                const images = yield this.getAllImages(filters);
                // Generar URLs firmadas para cada imagen
                const imagesWithSignedUrls = yield Promise.all(images.map((image) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        // Extraer la clave del archivo de la URL o usar el filename
                        let fileKey = image.filename || image.url;
                        // Si la URL contiene la clave completa, extraerla
                        if (image.url && image.url.includes('/')) {
                            const urlParts = image.url.split('/');
                            fileKey = urlParts[urlParts.length - 1];
                        }
                        // Generar URL firmada válida por 1 hora
                        const signedUrl = yield (0, idriveE2_1.generatePresignedUrl)(fileKey, 3600);
                        loggerService_1.logger.info('[src/services/imageService.ts] URL firmada generada', {
                            metadata: {
                                imageId: image.id,
                                filename: image.filename,
                                originalUrl: image.url,
                                signedUrl: signedUrl.substring(0, 50) + '...' // Solo mostrar parte de la URL por seguridad
                            }
                        });
                        return Object.assign(Object.assign({}, image), { url: signedUrl, originalUrl: image.url // Mantener URL original como referencia
                         });
                    }
                    catch (error) {
                        loggerService_1.logger.error('[src/services/imageService.ts] Error generando URL firmada', error, {
                            metadata: {
                                imageId: image.id,
                                filename: image.filename
                            }
                        });
                        // Retornar imagen con URL original si falla la generación de URL firmada
                        return Object.assign(Object.assign({}, image), { url: image.url, signedUrlError: true });
                    }
                })));
                loggerService_1.logger.info('[src/services/imageService.ts] Imágenes con URLs firmadas obtenidas', {
                    metadata: {
                        totalImages: imagesWithSignedUrls.length,
                        imagesWithErrors: imagesWithSignedUrls.filter(img => img.signedUrlError).length
                    }
                });
                return imagesWithSignedUrls;
            }
            catch (error) {
                loggerService_1.logger.error('[src/services/imageService.ts] Error obteniendo imágenes con URLs firmadas', error);
                throw new Error('Error obteniendo imágenes con URLs firmadas');
            }
        });
    }
    /**
     * Obtener todas las imágenes directamente desde IDrive E2 con URLs firmadas
     */
    getAllImagesFromIDriveE2(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('[src/services/imageService.ts] Obteniendo imágenes directamente desde IDrive E2', {
                    metadata: { filters }
                });
                // Determinar el prefijo basado en la categoría
                let prefix;
                if (filters === null || filters === void 0 ? void 0 : filters.category) {
                    switch (filters.category.toLowerCase()) {
                        case 'profile':
                            prefix = 'musikon-media/profile/';
                            break;
                        case 'event':
                            prefix = 'musikon-media/post/';
                            break;
                        case 'voucher':
                            prefix = 'musikon-media/deposits/';
                            break;
                        case 'gallery':
                            prefix = 'musikon-media/gallery/';
                            break;
                        default:
                            prefix = `musikon-media/${filters.category}/`;
                    }
                }
                else {
                    // Si no hay categoría específica, buscar en todo el bucket
                    prefix = 'musikon-media/';
                }
                // Obtener imágenes directamente desde IDrive E2
                const images = yield (0, idriveE2_1.listImagesWithSignedUrls)(prefix, (filters === null || filters === void 0 ? void 0 : filters.limit) || 1000);
                // Aplicar filtro de búsqueda si existe
                let filteredImages = images;
                if (filters === null || filters === void 0 ? void 0 : filters.search) {
                    const searchTerm = filters.search.toLowerCase();
                    filteredImages = images.filter(img => {
                        var _a;
                        return img.filename.toLowerCase().includes(searchTerm) ||
                            ((_a = img.category) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm));
                    });
                }
                // Aplicar paginación
                if ((filters === null || filters === void 0 ? void 0 : filters.page) && (filters === null || filters === void 0 ? void 0 : filters.limit)) {
                    const startIndex = (filters.page - 1) * filters.limit;
                    const endIndex = startIndex + filters.limit;
                    filteredImages = filteredImages.slice(startIndex, endIndex);
                }
                // Formatear respuesta para compatibilidad con el frontend
                const formattedImages = filteredImages.map((img, index) => ({
                    id: `idrive_${index}_${Date.now()}`, // ID temporal
                    filename: img.filename,
                    url: img.url,
                    size: img.size,
                    uploadedAt: img.lastModified.toISOString(),
                    category: img.category || 'general',
                    isPublic: true,
                    isActive: true,
                    mimeType: this.getMimeTypeFromFilename(img.filename),
                    metadata: {
                        key: img.key,
                        lastModified: img.lastModified,
                        category: img.category
                    }
                }));
                loggerService_1.logger.info('[src/services/imageService.ts] Imágenes obtenidas desde IDrive E2', {
                    metadata: {
                        totalImages: formattedImages.length,
                        prefix,
                        filters
                    }
                });
                return formattedImages;
            }
            catch (error) {
                loggerService_1.logger.error('[src/services/imageService.ts] Error obteniendo imágenes desde IDrive E2', error);
                throw new Error('Error obteniendo imágenes desde IDrive E2');
            }
        });
    }
    /**
     * Obtener el tipo MIME basado en la extensión del archivo
     */
    getMimeTypeFromFilename(filename) {
        const extension = filename.toLowerCase().split('.').pop();
        switch (extension) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'gif':
                return 'image/gif';
            case 'webp':
                return 'image/webp';
            case 'svg':
                return 'image/svg+xml';
            default:
                return 'image/jpeg';
        }
    }
}
exports.ImageService = ImageService;
// Instancia singleton
exports.imageService = new ImageService();
