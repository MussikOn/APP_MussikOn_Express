import express from 'express';
import { adminAuthController } from '../controllers/adminAuthController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Auth
 *   description: Endpoints de autenticación para el panel de administración
 */

/**
 * @swagger
 * /admin-auth/login:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Login para el panel de administración
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *               role:
 *                 type: string
 *                 enum: [admin, superadmin, eventCreator, musician]
 *                 description: Rol del usuario
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Token JWT
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         name:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         status:
 *                           type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales inválidas
 *       403:
 *         description: Usuario inactivo
 */
router.post('/login', async (req, res) => {
  await adminAuthController.adminLogin(req, res);
});

/**
 * @swagger
 * /admin-auth/verify:
 *   get:
 *     tags: [Admin Auth]
 *     summary: Verificar token de autenticación
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         name:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         status:
 *                           type: string
 *       401:
 *         description: Token inválido o no proporcionado
 */
router.get('/verify', async (req, res) => {
  await adminAuthController.verifyToken(req, res);
});

/**
 * @swagger
 * /admin-auth/me:
 *   get:
 *     tags: [Admin Auth]
 *     summary: Obtener información del usuario actual
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         name:
 *                           type: string
 *                         lastName:
 *                           type: string
 *       401:
 *         description: Usuario no autenticado
 */
router.get('/me', authMiddleware, async (req, res) => {
  await adminAuthController.getCurrentUser(req, res);
});

/**
 * @swagger
 * /admin-auth/logout:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Logout del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Usuario no autenticado
 */
router.post('/logout', authMiddleware, async (req, res) => {
  await adminAuthController.logout(req, res);
});

/**
 * @swagger
 * /admin-auth/create-user:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Crear usuario administrador (solo desarrollo)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - lastName
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del usuario
 *               lastName:
 *                 type: string
 *                 description: Apellido del usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *               role:
 *                 type: string
 *                 enum: [admin, superadmin, eventCreator, musician]
 *                 description: Rol del usuario
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     name:
 *                       type: string
 *                     lastName:
 *                       type: string
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Usuario ya existe
 *       401:
 *         description: No autorizado
 */
router.post('/create-user', authMiddleware, async (req, res) => {
  await adminAuthController.createAdminUser(req, res);
});

export default router; 