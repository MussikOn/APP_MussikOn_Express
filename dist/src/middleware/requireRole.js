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
                console.log('[src/middleware/requireRole.ts:10] Usuario no autenticado');
                throw new errorHandler_1.OperationalError('Usuario no autenticado', 401);
            }
            console.log('[src/middleware/requireRole.ts:15] Usuario autenticado:', {
                email: user.userEmail,
                roll: user.roll,
                allowedRoles
            });
            if (!allowedRoles.includes(user.roll)) {
                console.log('[src/middleware/requireRole.ts:22] Acceso denegado - Rol no permitido');
                throw new errorHandler_1.OperationalError(`Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`, 403);
            }
            console.log('[src/middleware/requireRole.ts:28] Acceso permitido');
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireRole = requireRole;
// Middleware específicos para roles comunes 
exports.requireAdmin = (0, exports.requireRole)(['admin', 'superadmin']);
exports.requireSuperAdmin = (0, exports.requireRole)(['superadmin']);
exports.requireMusician = (0, exports.requireRole)([
    'musician',
    'admin',
    'superadmin',
]);
exports.requireUser = (0, exports.requireRole)([
    'user',
    'musician',
    'admin',
    'superadmin',
]);
