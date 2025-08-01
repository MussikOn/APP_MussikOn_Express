"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUser = exports.requireMusician = exports.requireSuperAdmin = exports.requireAdmin = exports.requireRole = void 0;
const errorHandler_1 = require("./errorHandler");
// Role-based access control middleware
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                throw new errorHandler_1.OperationalError('Usuario no autenticado', 401);
            }
            if (!allowedRoles.includes(user.role)) {
                throw new errorHandler_1.OperationalError(`Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`, 403);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireRole = requireRole;
// Middleware específicos para roles comunes
exports.requireAdmin = (0, exports.requireRole)(['admin', 'super_admin']);
exports.requireSuperAdmin = (0, exports.requireRole)(['super_admin']);
exports.requireMusician = (0, exports.requireRole)([
    'musician',
    'admin',
    'super_admin',
]);
exports.requireUser = (0, exports.requireRole)([
    'user',
    'musician',
    'admin',
    'super_admin',
]);
