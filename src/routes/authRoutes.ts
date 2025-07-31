import express, { Request, Response, Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { validate } from "../middleware/validationMiddleware";
import { asyncHandler } from "../middleware/errorHandler";
import { logger } from "../services/loggerService";
import { LoginDTO, RegisterDTO, UpdateUserDTO } from "../types/dtos";
import { 
  emailRegisterController, 
  loginController, 
  registerController, 
  updateUserByEmailController, 
  validNumberGetByEmail, 
  addEventToUserController, 
  deleteUserByEmailController,
  forgotPasswordController,
  verifyCodeController,
  resetPasswordController
} from "../controllers/authController";

const router = Router();

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
router.post("/Register", 
  validate(RegisterDTO),
  asyncHandler(async (req: Request, res: Response) => {
    logger.logAuth('Intento de registro', req.body.userEmail);
    await registerController(req, res);
    logger.logAuth('Registro exitoso', req.body.userEmail);
  })
);

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
router.post("/login", 
  validate(LoginDTO),
  asyncHandler(async (req: Request, res: Response) => {
    logger.logAuth('Intento de login', req.body.userEmail);
    await loginController(req, res);
    logger.logAuth('Login exitoso', req.body.userEmail);
  })
);

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
router.post("/email-register", 
  validate(RegisterDTO),
  asyncHandler(async (req: Request, res: Response) => {
    logger.logAuth('Intento de registro con email', req.body.userEmail);
    await emailRegisterController(req, res);
    logger.logAuth('Registro con email exitoso', req.body.userEmail);
  })
);

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
router.put("/update/:userEmail", 
  authMiddleware,
  validate(UpdateUserDTO),
  asyncHandler(async (req: Request, res: Response) => {
    const userEmail = req.params.userEmail;
    logger.logAuth('Intento de actualización de usuario', userEmail, { 
      metadata: { updatedBy: (req as any).user?.userEmail } 
    });
    await updateUserByEmailController(req, res);
    logger.logAuth('Actualización de usuario exitosa', userEmail);
  })
);

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
router.get("/validate-number/:userEmail", 
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userEmail = req.params.userEmail;
    logger.logAuth('Validación de número solicitada', userEmail);
    await validNumberGetByEmail(req, res);
  })
);

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
router.post("/add-event/:userEmail", 
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userEmail = req.params.userEmail;
    const eventId = req.body.eventId;
    logger.logAuth('Agregando evento a usuario', userEmail, { 
      metadata: { eventId, addedBy: (req as any).user?.userEmail } 
    });
    await addEventToUserController(req, res);
    logger.logAuth('Evento agregado exitosamente', userEmail, { metadata: { eventId } });
  })
);

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
router.delete("/delete/:userEmail", 
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userEmail = req.params.userEmail;
    logger.logAuth('Eliminación de usuario solicitada', userEmail, { 
      metadata: { deletedBy: (req as any).user?.userEmail } 
    });
    await deleteUserByEmailController(req, res);
    logger.logAuth('Usuario eliminado exitosamente', userEmail);
  })
);

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
router.post("/forgot-password", 
  asyncHandler(async (req: Request, res: Response) => {
    const userEmail = req.body.userEmail;
    logger.logAuth('Solicitud de recuperación de contraseña', userEmail);
    await forgotPasswordController(req, res);
    logger.logAuth('Código de verificación enviado', userEmail);
  })
);

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
router.post("/verify-code", 
  asyncHandler(async (req: Request, res: Response) => {
    const userEmail = req.body.userEmail;
    const code = req.body.code;
    logger.logAuth('Verificación de código solicitada', userEmail, { metadata: { code } });
    await verifyCodeController(req, res);
    logger.logAuth('Código verificado exitosamente', userEmail);
  })
);

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
router.post("/reset-password", 
  asyncHandler(async (req: Request, res: Response) => {
    const userEmail = req.body.userEmail;
    logger.logAuth('Restablecimiento de contraseña solicitado', userEmail);
    await resetPasswordController(req, res);
    logger.logAuth('Contraseña restablecida exitosamente', userEmail);
  })
);

export default router;