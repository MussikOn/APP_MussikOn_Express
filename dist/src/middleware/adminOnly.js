"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = adminOnly;
const authMiddleware_1 = require("./authMiddleware");
/**
 * Middleware que permite el acceso solo a usuarios con rol admin o superadmin.
 * Primero autentica y luego verifica el rol.
 */
function adminOnly(req, res, next) {
    // Primero aplicar autenticación
    (0, authMiddleware_1.authMiddleware)(req, res, (err) => {
        if (err) {
            return res.status(401).json({ message: "Token no válido" });
        }
        // Luego verificar rol de administrador
        const user = req.user;
        if (user &&
            (user.roll === "admin" ||
                user.roll === "superadmin" ||
                user.roll === "adminJunior" ||
                user.roll === "adminMidLevel" ||
                user.roll === "adminSenior" ||
                user.roll === "superAdmin")) {
            next();
        }
        else {
            res.status(403).json({ message: "Acceso solo para administradores" });
        }
    });
}
