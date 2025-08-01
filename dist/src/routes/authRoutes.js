"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const errorHandler_1 = require("../middleware/errorHandler");
const loggerService_1 = require("../services/loggerService");
const validationSchemas_1 = require("../utils/validationSchemas");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación y gestión de usuario
 */
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
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       409:
 *         description: Usuario ya existe
 */
router.post('/Register', (0, validationMiddleware_1.validate)(validationSchemas_1.registerSchema), (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    loggerService_1.logger.logAuth('Intento de registro', req.body.userEmail);
    yield (0, authController_1.registerController)(req, res);
    loggerService_1.logger.logAuth('Registro exitoso', req.body.userEmail);
})));
/**
 * @swagger
 * /auth/request-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Solicitar verificación de email para registro
 *     description: Envía un código de verificación al email para completar el registro de músicos o creadores de eventos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - lastName
 *               - userEmail
 *               - userPassword
 *               - roll
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Nombre del usuario
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Apellido del usuario
 *               userEmail:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *               userPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: Contraseña del usuario
 *               roll:
 *                 type: string
 *                 enum: [musico, eventCreator]
 *                 description: Rol del usuario (músico o creador de eventos)
 *     responses:
 *       200:
 *         description: Email de verificación enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userEmail:
 *                       type: string
 *                     roll:
 *                       type: string
 *                     expiresIn:
 *                       type: string
 *       400:
 *         description: Datos de entrada inválidos
 *       409:
 *         description: Usuario ya existe
 */
router.post('/request-verification', (0, validationMiddleware_1.validate)(validationSchemas_1.musicianRegisterSchema), (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    loggerService_1.logger.logAuth('Solicitud de verificación de email', req.body.userEmail);
    yield (0, authController_1.requestEmailVerificationController)(req, res);
    loggerService_1.logger.logAuth('Email de verificación enviado', req.body.userEmail);
})));
/**
 * @swagger
 * /auth/verify-and-complete-registration:
 *   post:
 *     tags: [Auth]
 *     summary: Verificar código y completar registro
 *     description: Verifica el código enviado por email y completa el registro del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userEmail
 *               - code
 *             properties:
 *               userEmail:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 description: Código de verificación enviado por email
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userEmail:
 *                       type: string
 *                     name:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     roll:
 *                       type: string
 *                     status:
 *                       type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Código inválido o expirado
 *       404:
 *         description: Datos de registro no encontrados
 */
router.post('/verify-and-complete-registration', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    loggerService_1.logger.logAuth('Verificación de código solicitada', req.body.userEmail);
    yield (0, authController_1.verifyAndCompleteRegistrationController)(req, res);
    loggerService_1.logger.logAuth('Registro completado exitosamente', req.body.userEmail);
})));
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
 *                 format: email
 *               userPassword:
 *                 type: string
 *                 minLength: 6
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
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/login', (0, validationMiddleware_1.validate)(validationSchemas_1.loginSchema), (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    loggerService_1.logger.logAuth('Intento de login', req.body.userEmail);
    yield (0, authController_1.loginController)(req, res);
    loggerService_1.logger.logAuth('Login exitoso', req.body.userEmail);
})));
/**
 * @swagger
 * /auth/email-register:
 *   post:
 *     tags: [Auth]
 *     summary: Registro con email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthUserRegister'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/email-register', (0, validationMiddleware_1.validate)(validationSchemas_1.registerSchema), (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    loggerService_1.logger.logAuth('Intento de registro con email', req.body.userEmail);
    yield (0, authController_1.emailRegisterController)(req, res);
    loggerService_1.logger.logAuth('Registro con email exitoso', req.body.userEmail);
})));
/**
 * @swagger
 * /auth/update/{userEmail}:
 *   put:
 *     tags: [Auth]
 *     summary: Actualizar usuario por email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userEmail
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/update/:userEmail', authMiddleware_1.authMiddleware, validationMiddleware_1.validateId, (0, validationMiddleware_1.validate)(validationSchemas_1.updateUserSchema), (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userEmail = req.params.userEmail;
    loggerService_1.logger.logAuth('Intento de actualización de usuario', userEmail, {
        metadata: { updatedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail },
    });
    yield (0, authController_1.updateUserByEmailController)(req, res);
    loggerService_1.logger.logAuth('Actualización de usuario exitosa', userEmail);
})));
/**
 * @swagger
 * /auth/validate-number/{userEmail}:
 *   get:
 *     tags: [Auth]
 *     summary: Validar número de teléfono por email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userEmail
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Número validado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/validate-number/:userEmail', authMiddleware_1.authMiddleware, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = req.params.userEmail;
    loggerService_1.logger.logAuth('Validación de número solicitada', userEmail);
    yield (0, authController_1.validNumberGetByEmail)(req, res);
})));
/**
 * @swagger
 * /auth/add-event/{userEmail}:
 *   post:
 *     tags: [Auth]
 *     summary: Agregar evento a usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userEmail
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Evento agregado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario o evento no encontrado
 */
router.post('/add-event/:userEmail', authMiddleware_1.authMiddleware, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userEmail = req.params.userEmail;
    const eventId = req.body.eventId;
    loggerService_1.logger.logAuth('Agregando evento a usuario', userEmail, {
        metadata: { eventId, addedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail },
    });
    yield (0, authController_1.addEventToUserController)(req, res);
    loggerService_1.logger.logAuth('Evento agregado exitosamente', userEmail, {
        metadata: { eventId },
    });
})));
/**
 * @swagger
 * /auth/delete/{userEmail}:
 *   delete:
 *     tags: [Auth]
 *     summary: Eliminar usuario por email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userEmail
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/delete/:userEmail', authMiddleware_1.authMiddleware, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userEmail = req.params.userEmail;
    loggerService_1.logger.logAuth('Eliminación de usuario solicitada', userEmail, {
        metadata: { deletedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail },
    });
    yield (0, authController_1.deleteUserByEmailController)(req, res);
    loggerService_1.logger.logAuth('Usuario eliminado exitosamente', userEmail);
})));
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Solicitar recuperación de contraseña (solo superadmin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Código de verificación enviado
 *       400:
 *         description: Email inválido
 *       403:
 *         description: Solo superadmin puede recuperar contraseña
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/forgot-password', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = req.body.userEmail;
    loggerService_1.logger.logAuth('Solicitud de recuperación de contraseña', userEmail);
    yield (0, authController_1.forgotPasswordController)(req, res);
    loggerService_1.logger.logAuth('Código de verificación enviado', userEmail);
})));
/**
 * @swagger
 * /auth/verify-code:
 *   post:
 *     tags: [Auth]
 *     summary: Verificar código de recuperación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userEmail:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *     responses:
 *       200:
 *         description: Código verificado correctamente
 *       400:
 *         description: Código inválido o expirado
 *       403:
 *         description: Solo superadmin puede recuperar contraseña
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/verify-code', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = req.body.userEmail;
    const code = req.body.code;
    loggerService_1.logger.logAuth('Verificación de código solicitada', userEmail, {
        metadata: { code },
    });
    yield (0, authController_1.verifyCodeController)(req, res);
    loggerService_1.logger.logAuth('Código verificado exitosamente', userEmail);
})));
/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Restablecer contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userEmail:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Código inválido o contraseña débil
 *       403:
 *         description: Solo superadmin puede recuperar contraseña
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/reset-password', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = req.body.userEmail;
    loggerService_1.logger.logAuth('Restablecimiento de contraseña solicitado', userEmail);
    yield (0, authController_1.resetPasswordController)(req, res);
    loggerService_1.logger.logAuth('Contraseña restablecida exitosamente', userEmail);
})));
exports.default = router;
