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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const authController_1 = require("../controllers/authController");
const routAuth = (0, express_1.Router)();
routAuth.use(express_1.default.json());
/**
 * @swagger
 * /auth/verToken:
 *   get:
 *     summary: Verifica y retorna la data del token JWT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data del usuario autenticado
 */
routAuth.get("/verToken", authMiddleware_1.authMiddleware, (req, res) => {
    const data = req.user;
    res.send({ msg: "La data es:", data });
});
/**
 * @swagger
 * /auth/Register:
 *   post:
 *     summary: Registro de usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               lastName:
 *                 type: string
 *               roll:
 *                 type: string
 *               userEmail:
 *                 type: string
 *               userPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario registrado exitosamente
 */
routAuth.post("/Register", authController_1.registerController);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login de usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userEmail:
 *                 type: string
 *               userPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 */
routAuth.post("/login", authController_1.loginController);
/**
 * @swagger
 * /auth/update/{userEmail}:
 *   put:
 *     summary: Actualiza datos del usuario
 *     parameters:
 *       - in: path
 *         name: userEmail
 *         schema:
 *           type: string
 *         required: true
 *         description: Email del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
routAuth.put("/update/:userEmail", authMiddleware_1.authMiddleware, authController_1.updateUserByEmailController);
/**
 * @swagger
 * /auth/authEmail:
 *   post:
 *     summary: Enviar email de verificación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email enviado
 */
routAuth.post("/authEmail", authController_1.emailRegisterController);
/**
 * @swagger
 * /auth/validEmail/{vaildNumber}:
 *   post:
 *     summary: Validar código de email
 *     parameters:
 *       - in: path
 *         name: vaildNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: Código de validación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vaildNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validación exitosa
 */
routAuth.post("/validEmail/:vaildNumber", authController_1.validNumberGetByEmail);
/**
 * @swagger
 * /auth/addEvent:
 *   post:
 *     summary: Agrega un evento al usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Evento guardado exitosamente
 */
routAuth.post("/addEvent", authMiddleware_1.authMiddleware, authController_1.addEventToUserController);
exports.default = routAuth;
