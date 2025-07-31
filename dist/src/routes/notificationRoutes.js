"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const requireRole_1 = require("../middleware/requireRole");
const notificationController_1 = require("../controllers/notificationController");
const notificationRoutes = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: Sistema de notificaciones en tiempo real
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la notificación
 *         userId:
 *           type: string
 *           description: ID del usuario destinatario
 *         title:
 *           type: string
 *           description: Título de la notificación
 *         message:
 *           type: string
 *           description: Mensaje de la notificación
 *         type:
 *           type: string
 *           enum: [info, success, warning, error]
 *           description: Tipo de notificación
 *         category:
 *           type: string
 *           enum: [system, user, event, request, payment]
 *           description: Categoría de la notificación
 *         isRead:
 *           type: boolean
 *           description: Estado de lectura
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
 *       required:
 *         - userId
 *         - title
 *         - message
 *         - type
 *         - category
 *         - isRead
 *         - createdAt
 *         - updatedAt
 *
 *     CreateNotificationDTO:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: ID del usuario destinatario
 *         title:
 *           type: string
 *           description: Título de la notificación
 *         message:
 *           type: string
 *           description: Mensaje de la notificación
 *         type:
 *           type: string
 *           enum: [info, success, warning, error]
 *           description: Tipo de notificación
 *         category:
 *           type: string
 *           enum: [system, user, event, request, payment]
 *           description: Categoría de la notificación
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
 *       required:
 *         - userId
 *         - title
 *         - message
 *
 *     BulkNotificationDTO:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Título de la notificación
 *         message:
 *           type: string
 *           description: Mensaje de la notificación
 *         type:
 *           type: string
 *           enum: [info, success, warning, error]
 *           description: Tipo de notificación
 *         category:
 *           type: string
 *           enum: [system, user, event, request, payment]
 *           description: Categoría de la notificación
 *         targetUsers:
 *           type: array
 *           items:
 *             type: string
 *           description: Array de IDs de usuarios destinatarios
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
 *       required:
 *         - title
 *         - message
 *         - targetUsers
 */
/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Obtener notificaciones del usuario
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de notificaciones por página
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Solo notificaciones no leídas
 *     responses:
 *       200:
 *         description: Notificaciones obtenidas exitosamente
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
notificationRoutes.get('/', authMiddleware_1.authMiddleware, notificationController_1.getNotifications);
/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   put:
 *     summary: Marcar notificación como leída
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
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
 *         description: No autorizado
 *       403:
 *         description: No autorizado para acceder a esta notificación
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
notificationRoutes.put('/:notificationId/read', authMiddleware_1.authMiddleware, notificationController_1.markNotificationAsRead);
/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: Marcar todas las notificaciones como leídas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las notificaciones marcadas como leídas
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
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
notificationRoutes.put('/read-all', authMiddleware_1.authMiddleware, notificationController_1.markAllNotificationsAsRead);
/**
 * @swagger
 * /notifications/{notificationId}:
 *   delete:
 *     summary: Eliminar notificación
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación eliminada exitosamente
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
 *         description: No autorizado
 *       403:
 *         description: No autorizado para eliminar esta notificación
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
notificationRoutes.delete('/:notificationId', authMiddleware_1.authMiddleware, notificationController_1.deleteNotification);
/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Obtener contador de notificaciones no leídas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contador de notificaciones no leídas
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
 *                     count:
 *                       type: integer
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
notificationRoutes.get('/unread-count', authMiddleware_1.authMiddleware, notificationController_1.getUnreadCount);
/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Crear notificación (uso interno)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationDTO'
 *     responses:
 *       201:
 *         description: Notificación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos de notificación incompletos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
notificationRoutes.post('/', authMiddleware_1.authMiddleware, notificationController_1.createNotification);
/**
 * @swagger
 * /notifications/bulk:
 *   post:
 *     summary: Enviar notificación masiva (solo superadmin)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkNotificationDTO'
 *     responses:
 *       201:
 *         description: Notificación masiva enviada exitosamente
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos de notificación masiva incompletos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso solo para superadmin
 *       500:
 *         description: Error interno del servidor
 */
notificationRoutes.post('/bulk', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['super_admin']), notificationController_1.sendBulkNotification);
/**
 * @swagger
 * /notifications/stats:
 *   get:
 *     summary: Obtener estadísticas de notificaciones
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: week
 *         description: Período de análisis
 *     responses:
 *       200:
 *         description: Estadísticas de notificaciones
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
 *                     total:
 *                       type: integer
 *                     unread:
 *                       type: integer
 *                     read:
 *                       type: integer
 *                     byType:
 *                       type: object
 *                       properties:
 *                         info:
 *                           type: integer
 *                         success:
 *                           type: integer
 *                         warning:
 *                           type: integer
 *                         error:
 *                           type: integer
 *                     byCategory:
 *                       type: object
 *                       properties:
 *                         system:
 *                           type: integer
 *                         user:
 *                           type: integer
 *                         event:
 *                           type: integer
 *                         request:
 *                           type: integer
 *                         payment:
 *                           type: integer
 *                     period:
 *                       type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
notificationRoutes.get('/stats', authMiddleware_1.authMiddleware, notificationController_1.getNotificationStats);
exports.default = notificationRoutes;
