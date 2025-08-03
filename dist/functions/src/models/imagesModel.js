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
exports.cleanupExpiredImages = exports.getEventImages = exports.getPostImages = exports.getUserProfileImages = exports.getImageStats = exports.deleteImageFromS3 = exports.deleteImage = exports.updateImage = exports.listImages = exports.getImageById = exports.uploadImage = exports.createImageRecord = exports.generateSignedUrl = exports.uploadImageToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const firebase_1 = require("../utils/firebase");
const loggerService_1 = require("../services/loggerService");
// Configuración de idriveE2
const s3Client = new client_s3_1.S3Client({
    region: process.env.IDRIVE_E2_REGION || 'us-east-1',
    endpoint: process.env.IDRIVE_E2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY,
        secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY,
    },
    forcePathStyle: true,
});
const BUCKET_NAME = process.env.IDRIVE_E2_BUCKET_NAME;
// Configuración de validación
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
];
/**
 * Validar archivo antes de subir
 */
const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP, SVG)');
    }
};
/**
 * Generar nombre único para el archivo
 */
const generateFileName = (originalName, category, userId) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${category}/${userId}/${timestamp}_${randomString}.${extension}`;
};
/**
 * Subir imagen a idriveE2
 */
const uploadImageToS3 = (file, key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        validateFile(file);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            Metadata: {
                originalName: file.originalname,
                uploadedBy: 'mussikon-system',
                uploadedAt: new Date().toISOString()
            }
        });
        yield s3Client.send(command);
        console.log(`[src/models/imagesModel.ts:uploadImageToS3] Imagen subida a idriveE2: ${key}`);
        return {
            key,
            size: file.size,
            mimetype: file.mimetype
        };
    }
    catch (error) {
        loggerService_1.logger.error('[src/models/imagesModel.ts:uploadImageToS3] Error al subir imagen a idriveE2:', error);
        throw error;
    }
});
exports.uploadImageToS3 = uploadImageToS3;
/**
 * Generar URL firmada para acceso a imagen
 */
const generateSignedUrl = (key_1, ...args_1) => __awaiter(void 0, [key_1, ...args_1], void 0, function* (key, expiresIn = 3600) {
    try {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        });
        const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn });
        return signedUrl;
    }
    catch (error) {
        loggerService_1.logger.error('[src/models/imagesModel.ts:generateSignedUrl] Error al generar URL firmada:', error);
        throw error;
    }
});
exports.generateSignedUrl = generateSignedUrl;
/**
 * Crear registro de imagen en Firestore
 */
const createImageRecord = (imageData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date().toISOString();
        const imageRef = firebase_1.db.collection("images").doc();
        const image = Object.assign(Object.assign({ id: imageRef.id }, imageData), { createdAt: now, updatedAt: now });
        yield imageRef.set(image);
        console.log(`[src/models/imagesModel.ts:createImageRecord] Registro de imagen creado en Firestore: ${image.id}`);
        return image;
    }
    catch (error) {
        loggerService_1.logger.error('[src/models/imagesModel.ts:createImageRecord] Error al crear registro de imagen:', error);
        throw error;
    }
});
exports.createImageRecord = createImageRecord;
/**
 * Subir imagen completa (idriveE2 + Firestore)
 */
const uploadImage = (file_1, userId_1, category_1, ...args_1) => __awaiter(void 0, [file_1, userId_1, category_1, ...args_1], void 0, function* (file, userId, category, metadata = {}) {
    try {
        // Generar nombre único para el archivo
        const key = generateFileName(file.originalname, category, userId);
        // Subir a idriveE2
        const uploadResult = yield (0, exports.uploadImageToS3)(file, key);
        // Generar URL firmada
        const url = yield (0, exports.generateSignedUrl)(key);
        // Crear registro en Firestore
        const imageData = {
            key,
            url,
            originalName: file.originalname,
            fileName: key.split('/').pop() || file.originalname,
            size: uploadResult.size,
            mimetype: uploadResult.mimetype,
            category,
            userId,
            description: metadata.description || '',
            tags: metadata.tags || [],
            metadata: metadata.customMetadata || {},
            isPublic: metadata.isPublic !== undefined ? metadata.isPublic : true,
            isActive: true
        };
        const image = yield (0, exports.createImageRecord)(imageData);
        console.log(`[src/models/imagesModel.ts:uploadImage] Imagen subida exitosamente: ${image.id}`);
        return image;
    }
    catch (error) {
        loggerService_1.logger.error('[src/models/imagesModel.ts:uploadImage] Error al subir imagen:', error);
        throw error;
    }
});
exports.uploadImage = uploadImage;
/**
 * Obtener imagen por ID
 */
const getImageById = (imageId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imageDoc = yield firebase_1.db.collection("images").doc(imageId).get();
        if (!imageDoc.exists) {
            return null;
        }
        const image = imageDoc.data();
        // Regenerar URL firmada si es necesario
        if (image.url && image.url.includes('expires=')) {
            const expiresMatch = image.url.match(/expires=(\d+)/);
            if (expiresMatch) {
                const expiresAt = parseInt(expiresMatch[1]);
                const now = Math.floor(Date.now() / 1000);
                if (expiresAt <= now + 300) { // Regenerar si expira en menos de 5 minutos
                    image.url = yield (0, exports.generateSignedUrl)(image.key);
                    yield imageDoc.ref.update({ url: image.url, updatedAt: new Date().toISOString() });
                }
            }
        }
        else {
            // Si no tiene URL firmada, generarla
            image.url = yield (0, exports.generateSignedUrl)(image.key);
            yield imageDoc.ref.update({ url: image.url, updatedAt: new Date().toISOString() });
        }
        return image;
    }
    catch (error) {
        loggerService_1.logger.error('[src/models/imagesModel.ts:getImageById] Error al obtener imagen:', error);
        throw error;
    }
});
exports.getImageById = getImageById;
/**
 * Listar imágenes con filtros
 */
const listImages = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    try {
        let query = firebase_1.db.collection("images");
        // Aplicar filtros
        if (filters.category) {
            query = query.where("category", "==", filters.category);
        }
        if (filters.userId) {
            query = query.where("userId", "==", filters.userId);
        }
        if (filters.isPublic !== undefined) {
            query = query.where("isPublic", "==", filters.isPublic);
        }
        if (filters.isActive !== undefined) {
            query = query.where("isActive", "==", filters.isActive);
        }
        if (filters.metadata) {
            Object.entries(filters.metadata).forEach(([key, value]) => {
                query = query.where(`metadata.${key}`, "==", value);
            });
        }
        // Ordenar por fecha de creación (más reciente primero)
        query = query.orderBy("createdAt", "desc");
        // Aplicar límites
        if (filters.limit) {
            query = query.limit(filters.limit);
        }
        if (filters.offset) {
            query = query.offset(filters.offset);
        }
        const snapshot = yield query.get();
        const images = snapshot.docs.map((doc) => doc.data());
        // Regenerar URLs firmadas si es necesario
        const imagesWithUrls = yield Promise.all(images.map((image) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (image.url && image.url.includes('expires=')) {
                    const expiresMatch = image.url.match(/expires=(\d+)/);
                    if (expiresMatch) {
                        const expiresAt = parseInt(expiresMatch[1]);
                        const now = Math.floor(Date.now() / 1000);
                        if (expiresAt <= now + 300) { // Regenerar si expira en menos de 5 minutos
                            image.url = yield (0, exports.generateSignedUrl)(image.key);
                            yield firebase_1.db.collection("images").doc(image.id).update({
                                url: image.url,
                                updatedAt: new Date().toISOString()
                            });
                        }
                    }
                }
                else {
                    // Si no tiene URL firmada, generarla
                    image.url = yield (0, exports.generateSignedUrl)(image.key);
                    yield firebase_1.db.collection("images").doc(image.id).update({
                        url: image.url,
                        updatedAt: new Date().toISOString()
                    });
                }
                return image;
            }
            catch (error) {
                console.error(`[src/models/imagesModel.ts:listImages] Error al regenerar URL para imagen ${image.id}:`, error);
                return image;
            }
        })));
        console.log(`[src/models/imagesModel.ts:listImages] ${imagesWithUrls.length} imágenes encontradas`);
        return imagesWithUrls;
    }
    catch (error) {
        loggerService_1.logger.error('[src/models/imagesModel.ts:listImages] Error al listar imágenes:', error);
        throw error;
    }
});
exports.listImages = listImages;
/**
 * Actualizar imagen
 */
const updateImage = (imageId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imageRef = firebase_1.db.collection("images").doc(imageId);
        const imageDoc = yield imageRef.get();
        if (!imageDoc.exists) {
            throw new Error('Imagen no encontrada');
        }
        const updateFields = Object.assign(Object.assign({}, updateData), { updatedAt: new Date().toISOString() });
        yield imageRef.update(updateFields);
        // Obtener imagen actualizada
        const updatedDoc = yield imageRef.get();
        const updatedImage = updatedDoc.data();
        console.log(`[src/models/imagesModel.ts:updateImage] Imagen actualizada: ${imageId}`);
        return updatedImage;
    }
    catch (error) {
        loggerService_1.logger.error('[src/models/imagesModel.ts:updateImage] Error al actualizar imagen:', error);
        throw error;
    }
});
exports.updateImage = updateImage;
/**
 * Eliminar imagen (soft delete)
 */
const deleteImage = (imageId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const imageRef = firebase_1.db.collection("images").doc(imageId);
        const imageDoc = yield imageRef.get();
        if (!imageDoc.exists) {
            throw new Error('Imagen no encontrada');
        }
        const image = imageDoc.data();
        // Verificar permisos (solo el propietario o admin puede eliminar)
        if (image.userId !== userId) {
            // Verificar si el usuario es admin
            const userDoc = yield firebase_1.db.collection("users").doc(userId).get();
            if (!userDoc.exists || ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.roll) !== 'admin') {
                throw new Error('No tienes permisos para eliminar esta imagen');
            }
        }
        // Soft delete - marcar como inactiva
        yield imageRef.update({
            isActive: false,
            updatedAt: new Date().toISOString()
        });
        console.log(`[src/models/imagesModel.ts:deleteImage] Imagen marcada como eliminada: ${imageId}`);
        return true;
    }
    catch (error) {
        loggerService_1.logger.error('[src/models/imagesModel.ts:deleteImage] Error al eliminar imagen:', error);
        throw error;
    }
});
exports.deleteImage = deleteImage;
/**
 * Eliminar imagen de idriveE2 (hard delete)
 */
const deleteImageFromS3 = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        });
        yield s3Client.send(command);
        console.log(`[src/models/imagesModel.ts:deleteImageFromS3] Imagen eliminada de idriveE2: ${key}`);
        return true;
    }
    catch (error) {
        loggerService_1.logger.error('[src/models/imagesModel.ts:deleteImageFromS3] Error al eliminar imagen de idriveE2:', error);
        throw error;
    }
});
exports.deleteImageFromS3 = deleteImageFromS3;
/**
 * Obtener estadísticas de imágenes
 */
const getImageStats = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const snapshot = yield firebase_1.db.collection("images").where("isActive", "==", true).get();
        const images = snapshot.docs.map(doc => doc.data());
        const totalImages = images.length;
        const totalSize = images.reduce((sum, img) => sum + img.size, 0);
        const imagesByCategory = {};
        const imagesByUser = {};
        images.forEach(image => {
            imagesByCategory[image.category] = (imagesByCategory[image.category] || 0) + 1;
            imagesByUser[image.userId] = (imagesByUser[image.userId] || 0) + 1;
        });
        const recentUploads = images
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);
        const stats = {
            totalImages,
            totalSize,
            imagesByCategory,
            imagesByUser,
            recentUploads
        };
        console.log(`[src/models/imagesModel.ts:getImageStats] Estadísticas generadas: ${totalImages} imágenes, ${totalSize} bytes`);
        return stats;
    }
    catch (error) {
        loggerService_1.logger.error('[src/models/imagesModel.ts:getImageStats] Error al obtener estadísticas:', error);
        throw error;
    }
});
exports.getImageStats = getImageStats;
/**
 * Obtener imágenes de perfil de usuario
 */
const getUserProfileImages = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield (0, exports.listImages)({
            userId,
            category: 'profile',
            isActive: true,
        });
    }
    catch (error) {
        loggerService_1.logger.error('[src/models/imagesModel.ts:getUserProfileImages] Error al obtener imágenes de perfil:', error);
        throw error;
    }
});
exports.getUserProfileImages = getUserProfileImages;
/**
 * Obtener imágenes de posts
 */
const getPostImages = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = {
            category: 'post',
            isActive: true,
            isPublic: true,
        };
        if (userId) {
            filters.userId = userId;
        }
        return yield (0, exports.listImages)(filters);
    }
    catch (error) {
        loggerService_1.logger.error('[src/models/imagesModel.ts:getPostImages] Error al obtener imágenes de posts:', error);
        throw error;
    }
});
exports.getPostImages = getPostImages;
/**
 * Obtener imágenes de eventos
 */
const getEventImages = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = {
            category: 'event',
            isActive: true,
        };
        if (eventId) {
            filters.metadata = { eventId };
        }
        return yield (0, exports.listImages)(filters);
    }
    catch (error) {
        loggerService_1.logger.error('[src/models/imagesModel.ts:getEventImages] Error al obtener imágenes de eventos:', error);
        throw error;
    }
});
exports.getEventImages = getEventImages;
/**
 * Limpiar imágenes expiradas (tareas de mantenimiento)
 */
const cleanupExpiredImages = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const snapshot = yield firebase_1.db.collection("images")
            .where("expiresAt", "<=", now.toISOString())
            .where("isActive", "==", true)
            .get();
        let deletedCount = 0;
        for (const doc of snapshot.docs) {
            const image = doc.data();
            // Eliminar de idriveE2
            yield (0, exports.deleteImageFromS3)(image.key);
            // Marcar como inactiva en Firestore
            yield doc.ref.update({
                isActive: false,
                updatedAt: now.toISOString(),
            });
            deletedCount++;
        }
        console.log(`[src/models/imagesModel.ts:cleanupExpiredImages] ${deletedCount} imágenes expiradas eliminadas`);
        return deletedCount;
    }
    catch (error) {
        loggerService_1.logger.error('[src/models/imagesModel.ts:cleanupExpiredImages] Error al limpiar imágenes expiradas:', error);
        throw error;
    }
});
exports.cleanupExpiredImages = cleanupExpiredImages;
