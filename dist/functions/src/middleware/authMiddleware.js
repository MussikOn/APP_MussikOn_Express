"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ENV_1 = require("../config/ENV");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Token no proporcionado' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, ENV_1.TOKEN_SECRET);
        // Agregar el usuario decodificado en req.user en vez de sobrescribir req.body
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
}
/**
 * Middleware para validar el rol del usuario.
 * @param roles Roles permitidos para acceder al endpoint
 */
function requireRole(...roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.roll)) {
            return res.status(403).json({ msg: 'No autorizado. Rol insuficiente.' });
        }
        next();
    };
}
