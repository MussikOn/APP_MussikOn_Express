"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationalError = void 0;
exports.errorHandler = errorHandler;
exports.asyncHandler = asyncHandler;
exports.notFoundHandler = notFoundHandler;
/**
 * Clase para errores operacionales de la aplicación
 */
class OperationalError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.OperationalError = OperationalError;
/**
 * Middleware para manejar errores de forma centralizada
 */
function errorHandler(err, req, res, next) {
    let error = Object.assign({}, err);
    error.message = err.message;
    // Log del error
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    // Error de validación de Joi
    if (err.name === 'ValidationError') {
        const message = 'Datos de entrada inválidos';
        error = new OperationalError(message, 400);
    }
    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        const message = 'Token inválido';
        error = new OperationalError(message, 401);
    }
    // Error de JWT expirado
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expirado';
        error = new OperationalError(message, 401);
    }
    // Error de Cast (ID inválido)
    if (err.name === 'CastError') {
        const message = 'ID inválido';
        error = new OperationalError(message, 400);
    }
    // Error de duplicación de clave única
    if (err.name === 'MongoError' && err.code === 11000) {
        const message = 'Datos duplicados';
        error = new OperationalError(message, 409);
    }
    // Error de Firestore
    if (err.name === 'FirebaseError') {
        const message = 'Error en la base de datos';
        error = new OperationalError(message, 500);
    }
    res.status(error.statusCode || 500).json(Object.assign({ success: false, error: error.message || 'Error interno del servidor' }, (process.env.NODE_ENV === 'development' && { stack: err.stack })));
}
/**
 * Middleware para capturar errores asíncronos
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
/**
 * Middleware para manejar rutas no encontradas
 */
function notFoundHandler(req, res, next) {
    const error = new OperationalError(`Ruta no encontrada: ${req.originalUrl}`, 404);
    next(error);
}
