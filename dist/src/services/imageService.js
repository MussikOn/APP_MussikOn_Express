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
exports.ImageService = void 0;
const imagesModel_1 = require("../models/imagesModel");
/**
 * Servicio para manejo de imágenes
 */
class ImageService {
    /**
     * Subir imagen de perfil
     */
    static uploadProfileImage(file, userId, description) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, imagesModel_1.uploadImage)(file, userId, 'profile', {
                description: description || 'Foto de perfil',
                tags: ['profile', 'user'],
                isPublic: true,
            });
        });
    }
    /**
     * Subir imagen de post
     */
    static uploadPostImage(file, userId, description, tags) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, imagesModel_1.uploadImage)(file, userId, 'post', {
                description: description || 'Imagen de post',
                tags: tags || ['post'],
                isPublic: true,
            });
        });
    }
    /**
     * Subir imagen de evento
     */
    static uploadEventImage(file, userId, eventId, description) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, imagesModel_1.uploadImage)(file, userId, 'event', {
                description: description || 'Imagen de evento',
                tags: ['event', eventId],
                isPublic: true,
                customMetadata: { eventId },
            });
        });
    }
    /**
     * Subir imagen de galería
     */
    static uploadGalleryImage(file, userId, description, tags) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, imagesModel_1.uploadImage)(file, userId, 'gallery', {
                description: description || 'Imagen de galería',
                tags: tags || ['gallery'],
                isPublic: true,
            });
        });
    }
    /**
     * Subir imagen administrativa
     */
    static uploadAdminImage(file, userId, description, tags) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, imagesModel_1.uploadImage)(file, userId, 'admin', {
                description: description || 'Imagen administrativa',
                tags: tags || ['admin'],
                isPublic: false,
            });
        });
    }
    /**
     * Obtener imagen por ID con validación de permisos
     */
    static getImageByIdWithPermissions(imageId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = yield (0, imagesModel_1.getImageById)(imageId);
            if (!image) {
                return null;
            }
            // Si la imagen no es pública, solo el propietario puede verla
            if (!image.isPublic && image.userId !== userId) {
                return null;
            }
            return image;
        });
    }
    /**
     * Listar imágenes con filtros y paginación
     */
    static listImagesWithPagination() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page = 1, limit = 20) {
            const offset = (page - 1) * limit;
            const allImages = yield (0, imagesModel_1.listImages)(Object.assign(Object.assign({}, filters), { limit: undefined, offset: undefined }));
            const total = allImages.length;
            const images = allImages.slice(offset, offset + limit);
            const totalPages = Math.ceil(total / limit);
            return {
                images,
                total,
                page,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            };
        });
    }
    /**
     * Actualizar imagen con validación de permisos
     */
    static updateImageWithPermissions(imageId, userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = yield (0, imagesModel_1.getImageById)(imageId);
            if (!image) {
                throw new Error('Imagen no encontrada');
            }
            if (image.userId !== userId) {
                throw new Error('No tienes permisos para actualizar esta imagen');
            }
            return yield (0, imagesModel_1.updateImage)(imageId, updateData);
        });
    }
    /**
     * Eliminar imagen con validación de permisos
     */
    static deleteImageWithPermissions(imageId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = yield (0, imagesModel_1.getImageById)(imageId);
            if (!image) {
                throw new Error('Imagen no encontrada');
            }
            if (image.userId !== userId) {
                throw new Error('No tienes permisos para eliminar esta imagen');
            }
            return yield (0, imagesModel_1.deleteImage)(imageId, userId);
        });
    }
    /**
     * Obtener imágenes de perfil de un usuario
     */
    static getUserProfileImages(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, imagesModel_1.getUserProfileImages)(userId);
        });
    }
    /**
     * Obtener imágenes de posts
     */
    static getPostImages(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, imagesModel_1.getPostImages)(userId);
        });
    }
    /**
     * Obtener imágenes de eventos
     */
    static getEventImages(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, imagesModel_1.getEventImages)(eventId);
        });
    }
    /**
     * Obtener estadísticas de imágenes
     */
    static getImageStats() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, imagesModel_1.getImageStats)();
        });
    }
    /**
     * Buscar imágenes por texto
     */
    static searchImages(searchTerm_1) {
        return __awaiter(this, arguments, void 0, function* (searchTerm, filters = {}) {
            return yield (0, imagesModel_1.listImages)(Object.assign(Object.assign({}, filters), { search: searchTerm }));
        });
    }
    /**
     * Obtener imágenes por etiquetas
     */
    static getImagesByTags(tags_1) {
        return __awaiter(this, arguments, void 0, function* (tags, filters = {}) {
            const images = yield (0, imagesModel_1.listImages)(filters);
            return images.filter(image => image.tags && tags.some(tag => image.tags.includes(tag)));
        });
    }
    /**
     * Obtener imágenes recientes
     */
    static getRecentImages() {
        return __awaiter(this, arguments, void 0, function* (limit = 10, filters = {}) {
            return yield (0, imagesModel_1.listImages)(Object.assign(Object.assign({}, filters), { limit }));
        });
    }
    /**
     * Validar formato de imagen
     */
    static validateImageFormat(file) {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ];
        return allowedMimeTypes.includes(file.mimetype);
    }
    /**
     * Validar tamaño de imagen
     */
    static validateImageSize(file, maxSize = 10 * 1024 * 1024) {
        return file.size <= maxSize;
    }
    /**
     * Generar nombre de archivo único
     */
    static generateUniqueFileName(originalName, category, userId) {
        const timestamp = Date.now();
        const extension = originalName.split('.').pop();
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
        return `${category}/${userId}/${timestamp}_${sanitizedName}`;
    }
    /**
     * Obtener información de imagen sin descargar
     */
    static getImageInfo(imageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = yield (0, imagesModel_1.getImageById)(imageId);
            if (!image) {
                return null;
            }
            return {
                id: image.id,
                originalName: image.originalName,
                size: image.size,
                mimetype: image.mimetype,
                category: image.category,
                createdAt: image.createdAt,
                isPublic: image.isPublic,
            };
        });
    }
}
exports.ImageService = ImageService;
