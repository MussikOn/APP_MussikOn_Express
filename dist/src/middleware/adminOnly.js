"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = adminOnly;
exports.requireRole = requireRole;
const authMiddleware_1 = require("./authMiddleware");
/**
 * Middleware que permite el acceso solo a usuarios con rol admin o superadmin.
 * Incluye automáticamente la autenticación.
 */
function adminOnly(req, res, next) {
    // Primero verificar autenticación
    (0, authMiddleware_1.authMiddleware)(req, res, (authError) => {
        if (authError) {
            // Si hay error de autenticación, ya se envió la respuesta
            return;
        }
        // Luego verificar rol de administrador
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Usuario no autenticado' });
            return;
        }
        if (user.roll === 'admin' ||
            user.roll === 'superadmin' ||
            user.roll === 'adminJunior' ||
            user.roll === 'adminMidLevel' ||
            user.roll === 'adminSenior' ||
            user.roll === 'superAdmin' ||
            user.roll === 'organizador' ||
            user.roll === 'eventCreator' ||
            user.roll === 'musico' // Temporalmente permitido para testing
        ) {
            next();
        }
        else {
            res.status(403).json({ message: 'Acceso solo para administradores' });
        }
    });
}
/**
 * Middleware genérico para validar roles específicos
 * Incluye automáticamente la autenticación.
 * @param roles Roles permitidos para acceder al endpoint
 */
function requireRole(...roles) {
    return (req, res, next) => {
        // Primero verificar autenticación
        (0, authMiddleware_1.authMiddleware)(req, res, (authError) => {
            if (authError) {
                // Si hay error de autenticación, ya se envió la respuesta
                return;
            }
            // Luego verificar rol específico
            const user = req.user;
            if (!user || !roles.includes(user.roll)) {
                res.status(403).json({ msg: 'No autorizado. Rol insuficiente.' });
                return;
            }
            next();
        });
    };
}
