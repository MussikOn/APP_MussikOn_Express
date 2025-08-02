"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.documentUpload = exports.imageUpload = exports.validateImageFile = exports.handleMulterError = void 0;
const multer_1 = __importDefault(require("multer"));
/**
 * Middleware para manejar errores de multer
 */
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
                error: 'El archivo es demasiado grande',
                details: 'El tamaño máximo permitido es 10MB',
                code: 'FILE_TOO_LARGE'
            });
            return;
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            res.status(400).json({
                error: 'Demasiados archivos',
                details: 'Solo se permite un archivo por vez',
                code: 'TOO_MANY_FILES'
            });
            return;
        }
        res.status(400).json({
            error: 'Error en la subida del archivo',
            details: error.message,
            code: 'UPLOAD_ERROR'
        });
        return;
    }
    if (error.message && error.message.includes('Tipo de archivo no permitido')) {
        res.status(400).json({
            error: 'Tipo de archivo no permitido',
            details: 'Solo se permiten imágenes (JPEG, PNG, GIF, WebP, SVG)',
            code: 'INVALID_FILE_TYPE'
        });
        return;
    }
    console.error('[src/middleware/uploadMiddleware.ts] Error de subida:', error);
    res.status(500).json({
        error: 'Error interno del servidor',
        details: 'Error al procesar el archivo',
        code: 'INTERNAL_ERROR'
    });
    return;
};
exports.handleMulterError = handleMulterError;
/**
 * Middleware para validar archivos antes de procesar
 */
const validateImageFile = (req, res, next) => {
    if (!req.file) {
        res.status(400).json({
            error: 'No se proporcionó ningún archivo',
            code: 'NO_FILE'
        });
        return;
    }
    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
        res.status(400).json({
            error: 'El archivo es demasiado grande',
            details: `Tamaño máximo: ${maxSize / 1024 / 1024}MB`,
            code: 'FILE_TOO_LARGE'
        });
        return;
    }
    // Validar tipo MIME
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
    ];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
        res.status(400).json({
            error: 'Tipo de archivo no permitido',
            details: 'Solo se permiten imágenes (JPEG, PNG, GIF, WebP, SVG)',
            code: 'INVALID_FILE_TYPE'
        });
        return;
    }
    next();
};
exports.validateImageFile = validateImageFile;
/**
 * Configuración de multer para imágenes
 */
exports.imageUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1, // Solo un archivo
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes'));
        }
    },
});
/**
 * Configuración de multer para documentos (comprobantes de pago)
 */
exports.documentUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1, // Solo un archivo
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes y PDFs'));
        }
    },
});
// Exportación por defecto para compatibilidad
exports.upload = exports.documentUpload;
