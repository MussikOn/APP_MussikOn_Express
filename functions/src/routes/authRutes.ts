import express, {Request, Response, Router} from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { emailRegisterController, loginController, registerController, updateUserByEmailController, validNumberGetByEmail, addEventToUserController, deleteUserByEmailController } from "../controllers/authController";

const routAuth = Router();
routAuth.use(express.json());

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
routAuth.get("/verToken", authMiddleware, (req:Request, res:Response)=>{
    const data = (req as any).user;
    res.send({msg:"La data es:", data});
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
routAuth.post("/Register",registerController);

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
routAuth.post("/login",loginController);

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
routAuth.put("/update/:userEmail",authMiddleware,updateUserByEmailController);

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
routAuth.post("/authEmail", emailRegisterController); 

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
routAuth.post("/validEmail/:vaildNumber", validNumberGetByEmail); 

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
routAuth.post("/addEvent", authMiddleware, addEventToUserController); 

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
routAuth.delete("/delete", deleteUserByEmailController);

export default routAuth;