"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = adminOnly;
exports.requireRole = requireRole;
/**
 * Middleware que permite el acceso solo a usuarios con rol admin o superadmin.
 * Debe usarse DESPUÉS de authMiddleware.
 */
function adminOnly(req, res, next) {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: "Usuario no autenticado" });
        return;
    }
    if (user.roll === "admin" ||
        user.roll === "superadmin" ||
        user.roll === "adminJunior" ||
        user.roll === "adminMidLevel" ||
        user.roll === "adminSenior" ||
        user.roll === "superAdmin") {
        next();
    }
    else {
        res.status(403).json({ message: "Acceso solo para administradores" });
    }
}
/**
 * Middleware genérico para validar roles específicos
 * @param roles Roles permitidos para acceder al endpoint
 */
function requireRole(...roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.roll)) {
            res.status(403).json({ msg: 'No autorizado. Rol insuficiente.' });
            return;
        }
        next();
    };
}
