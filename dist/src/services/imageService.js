"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const admin = __importStar(require("firebase-admin"));
const eventConfig_1 = require("../config/eventConfig");
class ImageService {
    constructor() {
        this.bucket = admin.storage().bucket();
    }
    static getInstance() {
        if (!ImageService.instance) {
            ImageService.instance = new ImageService();
        }
        return ImageService.instance;
    }
    /**
     * Procesa y sube una imagen al storage
     */
    uploadEventImage(imageBuffer_1, fileName_1, eventId_1) {
        return __awaiter(this, arguments, void 0, function* (imageBuffer, fileName, eventId, options = {}) {
            try {
                const { maxSize = eventConfig_1.EVENT_CONFIG.IMAGE_CONFIG.MAX_SIZE, allowedTypes = eventConfig_1.EVENT_CONFIG.IMAGE_CONFIG.ALLOWED_TYPES, quality = eventConfig_1.EVENT_CONFIG.IMAGE_CONFIG.QUALITY, resize } = options;
                // Validar tamaño usando configuraciones centralizadas
                if (imageBuffer.length > maxSize) {
                    throw new Error(`Imagen demasiado grande. Máximo ${maxSize / (1024 * 1024)}MB`);
                }
                // Generar nombre único
                const timestamp = Date.now();
                const fileExtension = fileName.split('.').pop();
                const uniqueFileName = `events/${eventId}/images/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
                // Crear archivo en storage
                const file = this.bucket.file(uniqueFileName);
                // Configurar metadata
                const metadata = {
                    contentType: `image/${fileExtension}`,
                    metadata: {
                        eventId,
                        uploadedAt: new Date().toISOString(),
                        originalName: fileName
                    }
                };
                // Subir archivo
                yield file.save(imageBuffer, metadata);
                // Hacer público el archivo
                yield file.makePublic();
                // Obtener URL pública
                const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${uniqueFileName}`;
                return {
                    url: publicUrl,
                    key: uniqueFileName,
                    size: imageBuffer.length,
                    mimetype: `image/${fileExtension}`
                };
            }
            catch (error) {
                console.error('Error uploading image:', error);
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                throw new Error(`Error al subir imagen: ${errorMessage}`);
            }
        });
    }
    /**
     * Procesa múltiples imágenes para un evento
     */
    processEventImages(images_1, eventId_1) {
        return __awaiter(this, arguments, void 0, function* (images, // URLs o base64 de las imágenes
        eventId, options = {}) {
            try {
                const processedUrls = [];
                for (const image of images) {
                    try {
                        // Si es una URL local (base64), convertir a buffer
                        let imageBuffer;
                        if (image.startsWith('data:image/')) {
                            // Es base64
                            const base64Data = image.split(',')[1];
                            imageBuffer = Buffer.from(base64Data, 'base64');
                        }
                        else if (image.startsWith('file://')) {
                            // Es una ruta de archivo local
                            const fs = require('fs');
                            imageBuffer = fs.readFileSync(image.replace('file://', ''));
                        }
                        else {
                            // Es una URL, descargar
                            const response = yield fetch(image);
                            imageBuffer = Buffer.from(yield response.arrayBuffer());
                        }
                        // Generar nombre de archivo
                        const fileName = `event_image_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
                        // Subir imagen
                        const result = yield this.uploadEventImage(imageBuffer, fileName, eventId, options);
                        processedUrls.push(result.url);
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                        console.error(`Error processing image: ${errorMessage}`);
                        // Continuar con las siguientes imágenes
                    }
                }
                return processedUrls;
            }
            catch (error) {
                console.error('Error processing event images:', error);
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                throw new Error(`Error al procesar imágenes: ${errorMessage}`);
            }
        });
    }
    /**
     * Elimina imágenes de un evento
     */
    deleteEventImages(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [files] = yield this.bucket.getFiles({
                    prefix: `events/${eventId}/images/`
                });
                if (files.length > 0) {
                    yield Promise.all(files.map((file) => file.delete()));
                    console.log(`Deleted ${files.length} images for event ${eventId}`);
                }
            }
            catch (error) {
                console.error('Error deleting event images:', error);
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                throw new Error(`Error al eliminar imágenes: ${errorMessage}`);
            }
        });
    }
    /**
     * Valida una imagen antes de procesarla
     */
    validateImage(imageBuffer, options = {}) {
        const { maxSize = 5 * 1024 * 1024, // 5MB
        allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;
        // Validar tamaño
        if (imageBuffer.length > maxSize) {
            return {
                isValid: false,
                error: `Imagen demasiado grande. Máximo ${maxSize / (1024 * 1024)}MB`
            };
        }
        // Validar tipo de archivo (verificar magic numbers)
        const magicNumbers = {
            'image/jpeg': [0xFF, 0xD8, 0xFF],
            'image/png': [0x89, 0x50, 0x4E, 0x47],
            'image/webp': [0x52, 0x49, 0x46, 0x46]
        };
        const isValidType = Object.entries(magicNumbers).some(([mimeType, numbers]) => {
            if (!allowedTypes.includes(mimeType))
                return false;
            return numbers.every((byte, index) => imageBuffer[index] === byte);
        });
        if (!isValidType) {
            return {
                isValid: false,
                error: 'Tipo de archivo no soportado'
            };
        }
        return { isValid: true };
    }
    /**
     * Obtiene estadísticas de imágenes de un evento
     */
    getEventImageStats(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [files] = yield this.bucket.getFiles({
                    prefix: `events/${eventId}/images/`
                });
                const totalSize = files.reduce((sum, file) => { var _a; return sum + (((_a = file.metadata) === null || _a === void 0 ? void 0 : _a.size) || 0); }, 0);
                const totalImages = files.length;
                const averageSize = totalImages > 0 ? totalSize / totalImages : 0;
                return {
                    totalImages,
                    totalSize,
                    averageSize
                };
            }
            catch (error) {
                console.error('Error getting image stats:', error);
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                throw new Error(`Error al obtener estadísticas: ${errorMessage}`);
            }
        });
    }
}
exports.ImageService = ImageService;
// Exportar instancia singleton
exports.imageService = ImageService.getInstance();
