import { Router } from 'express';
import { adminOnly } from '../middleware/adminOnly';
import {
  adminUsersGetAll,
  adminUsersGetById,
  adminUsersCreate,
  adminUsersUpdate,
  adminUsersRemove,
  adminUsersStats,
  adminEventsGetAll,
  adminEventsGetById,
  adminEventsCreate,
  adminEventsUpdate,
  adminEventsRemove,
  adminMusiciansGetAll,
  adminMusiciansGetById,
  adminMusiciansUpdate,
  adminMusiciansRemove,
  adminImagesGetAll,
  adminImagesGetById,
  adminImagesRemove,
  adminMusicianRequestsGetAll,
  adminMusicianRequestsCreate,
  adminMusicianRequestsGetById,
  adminMusicianRequestsUpdate,
  adminMusicianRequestsRemove,
  adminMusicianRequestsStats
} from '../controllers/adminController';

const adminRoutes = Router();

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Endpoints de administración de usuarios
 *   - name: AdminEvents
 *     description: Endpoints de administración de eventos
 *   - name: AdminMusicians
 *     description: Endpoints de administración de músicos
 *   - name: AdminImages
 *     description: Endpoints de administración de imágenes
 *   - name: AdminMusicianRequests
 *     description: Endpoints de administración de solicitudes de músico
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       403:
 *         description: Acceso solo para administradores
 *   post:
 *     summary: Crear usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *               userEmail:
 *                 type: string
 *               roll:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Usuario creado
 *       403:
 *         description: Acceso solo para administradores
 *
 * /admin/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: Acceso solo para administradores
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       403:
 *         description: Acceso solo para administradores
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       403:
 *         description: Acceso solo para administradores
 */

// --- Usuarios ---
adminRoutes.get('/admin/users', adminOnly, adminUsersGetAll);
adminRoutes.get('/admin/users/:id', adminOnly, adminUsersGetById);
adminRoutes.post('/admin/users', adminOnly, adminUsersCreate);
adminRoutes.put('/admin/users/:id', adminOnly, adminUsersUpdate);
adminRoutes.delete('/admin/users/:id', adminOnly, adminUsersRemove);
adminRoutes.get('/admin/users/stats', adminOnly, adminUsersStats);

/**
 * @swagger
 * /admin/events:
 *   get:
 *     summary: Obtener todos los eventos
 *     tags: [AdminEvents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos
 *       403:
 *         description: Acceso solo para administradores
 *   post:
 *     summary: Crear evento
 *     tags: [AdminEvents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Evento creado
 *       403:
 *         description: Acceso solo para administradores
 *
 * /admin/events/{id}:
 *   get:
 *     summary: Obtener evento por ID
 *     tags: [AdminEvents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Evento encontrado
 *       404:
 *         description: Evento no encontrado
 *       403:
 *         description: Acceso solo para administradores
 *   put:
 *     summary: Actualizar evento
 *     tags: [AdminEvents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Evento actualizado
 *       403:
 *         description: Acceso solo para administradores
 *   delete:
 *     summary: Eliminar evento
 *     tags: [AdminEvents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Evento eliminado
 *       403:
 *         description: Acceso solo para administradores
 */

// --- Eventos ---
adminRoutes.get('/admin/events', adminOnly, adminEventsGetAll);
adminRoutes.get('/admin/events/:id', adminOnly, adminEventsGetById);
adminRoutes.post('/admin/events', adminOnly, adminEventsCreate);
adminRoutes.put('/admin/events/:id', adminOnly, adminEventsUpdate);
adminRoutes.delete('/admin/events/:id', adminOnly, adminEventsRemove);

/**
 * @swagger
 * /admin/musicians:
 *   get:
 *     summary: Obtener todos los músicos
 *     tags: [AdminMusicians]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de músicos
 *       403:
 *         description: Acceso solo para administradores
 * /admin/musicians/{id}:
 *   get:
 *     summary: Obtener músico por ID
 *     tags: [AdminMusicians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Músico encontrado
 *       404:
 *         description: Músico no encontrado
 *       403:
 *         description: Acceso solo para administradores
 *   put:
 *     summary: Actualizar músico
 *     tags: [AdminMusicians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Músico actualizado
 *       403:
 *         description: Acceso solo para administradores
 *   delete:
 *     summary: Eliminar músico
 *     tags: [AdminMusicians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Músico eliminado
 *       403:
 *         description: Acceso solo para administradores
 */

// --- Músicos ---
adminRoutes.get('/admin/musicians', adminOnly, adminMusiciansGetAll);
adminRoutes.get('/admin/musicians/:id', adminOnly, adminMusiciansGetById);
adminRoutes.put('/admin/musicians/:id', adminOnly, adminMusiciansUpdate);
adminRoutes.delete('/admin/musicians/:id', adminOnly, adminMusiciansRemove);

/**
 * @swagger
 * /admin/images:
 *   get:
 *     summary: Obtener todas las imágenes
 *     tags: [AdminImages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de imágenes
 *       403:
 *         description: Acceso solo para administradores
 * /admin/images/{id}:
 *   get:
 *     summary: Obtener imagen por ID
 *     tags: [AdminImages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Imagen encontrada
 *       404:
 *         description: Imagen no encontrada
 *       403:
 *         description: Acceso solo para administradores
 *   delete:
 *     summary: Eliminar imagen
 *     tags: [AdminImages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Imagen eliminada
 *       403:
 *         description: Acceso solo para administradores
 */

// --- Imágenes ---
adminRoutes.get('/admin/images', adminOnly, adminImagesGetAll);
adminRoutes.get('/admin/images/:id', adminOnly, adminImagesGetById);
adminRoutes.delete('/admin/images/:id', adminOnly, adminImagesRemove);

/**
 * @swagger
 * /admin/musician-requests:
 *   get:
 *     summary: Obtener todas las solicitudes de músico
 *     tags: [AdminMusicianRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 *       403:
 *         description: Acceso solo para administradores
 * /admin/musician-requests/{id}:
 *   get:
 *     summary: Obtener solicitud de músico por ID
 *     tags: [AdminMusicianRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Solicitud encontrada
 *       404:
 *         description: Solicitud no encontrada
 *       403:
 *         description: Acceso solo para administradores
 *   delete:
 *     summary: Eliminar solicitud de músico
 *     tags: [AdminMusicianRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Solicitud eliminada
 *       403:
 *         description: Acceso solo para administradores
 */

// --- Solicitudes de Músico ---
adminRoutes.get('/admin/musician-requests', adminOnly, adminMusicianRequestsGetAll);
adminRoutes.post('/admin/musician-requests', adminOnly, adminMusicianRequestsCreate);
adminRoutes.get('/admin/musician-requests/:id', adminOnly, adminMusicianRequestsGetById);
adminRoutes.put('/admin/musician-requests/:id', adminOnly, adminMusicianRequestsUpdate);
adminRoutes.delete('/admin/musician-requests/:id', adminOnly, adminMusicianRequestsRemove);
adminRoutes.get('/admin/musician-requests/stats', adminOnly, adminMusicianRequestsStats);

export default adminRoutes;