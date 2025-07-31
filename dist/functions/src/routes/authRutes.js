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
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación y gestión de usuario
 */
/**
 * @swagger
 * /auth/verToken:
 *   get:
 *     tags: [Auth]
 *     summary: Verifica y retorna la data del token JWT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 data:
 *                   type: object
 */
routAuth.get("/verToken", authMiddleware_1.authMiddleware, (req, res) => {
    const data = req.user;
    res.send({ msg: "La data es:", data });
});
/**
 * @swagger
 * /auth/Register:
 *   post:
 *     tags: [Auth]
 *     summary: Registro de usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthUserRegister'
 *     responses:
 *       200:
 *         description: Usuario registrado exitosamente
 *       409:
 *         description: Usuario ya existe o campos incompletos
 */
routAuth.post("/Register", authController_1.registerController);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciales incorrectas
 */
routAuth.post("/login", authController_1.loginController);
/**
 * @swagger
 * /auth/update/{userEmail}:
 *   put:
 *     tags: [Auth]
 *     summary: Actualiza datos del usuario
 *     security:
 *       - bearerAuth: []
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
 *       400:
 *         description: Email inválido
 */
routAuth.put("/update/:userEmail", authMiddleware_1.authMiddleware, authController_1.updateUserByEmailController);
/**
 * @swagger
 * /auth/authEmail:
 *   post:
 *     tags: [Auth]
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
 *       409:
 *         description: Usuario ya existe
 */
routAuth.post("/authEmail", authController_1.emailRegisterController);
/**
 * @swagger
 * /auth/validEmail/{vaildNumber}:
 *   post:
 *     tags: [Auth]
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
 *       402:
 *         description: Código incorrecto o datos faltantes
 */
routAuth.post("/validEmail/:vaildNumber", authController_1.validNumberGetByEmail);
/**
 * @swagger
 * /auth/addEvent:
 *   post:
 *     tags: [Auth]
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
/**
 * @swagger
 * /auth/delete:
 *   delete:
 *     tags: [Auth]
 *     summary: Elimina un usuario por su email
 *     security:
 *       - bearerAuth: []
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
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
routAuth.delete("/delete", authController_1.deleteUserByEmailController);
exports.default = routAuth;
