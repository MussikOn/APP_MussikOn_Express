"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.validateId = validateId;
exports.validatePagination = validatePagination;
/**
 * Middleware de validación genérico usando Joi
 * @param schema Esquema de validación de Joi
 * @param property Propiedad a validar ('body', 'query', 'params')
 */
function validate(schema, property = 'body') {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            res.status(400).json({
                message: 'Datos de entrada inválidos',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
            return;
        }
        // Reemplazar los datos con los validados y limpiados
        req[property] = value;
        next();
    };
}
/**
 * Middleware para validar IDs de MongoDB/Firestore
 */
function validateId(req, res, next) {
    const id = req.params.id;
    if (!id || id.trim().length === 0) {
        res.status(400).json({ message: 'ID requerido' });
        return;
    }
    // Validación básica para IDs de Firestore (al menos 1 carácter)
    if (id.length < 1) {
        res.status(400).json({ message: 'ID inválido' });
        return;
    }
    next();
}
/**
 * Middleware para validar paginación
 */
function validatePagination(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (page < 1) {
        res.status(400).json({ message: 'Página debe ser mayor a 0' });
        return;
    }
    if (limit < 1 || limit > 100) {
        res.status(400).json({ message: 'Límite debe estar entre 1 y 100' });
        return;
    }
    // Agregar valores validados a req
    req.pagination = { page, limit };
    next();
}
