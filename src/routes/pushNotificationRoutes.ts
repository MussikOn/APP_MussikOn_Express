import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';
import {
  savePushSubscription,
  getUserPushSubscriptions,
  deletePushSubscription,
  sendNotificationToUser,
  sendBulkNotification,
  createNotificationTemplate,
  getNotificationTemplate,
  getActiveTemplates,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  getNotificationStats,
  getVapidPublicKey,
  testPushNotification,
} from '../controllers/pushNotificationController';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PushSubscription:
 *       type: object
 *       required:
 *         - endpoint
 *         - keys
 *       properties:
 *         endpoint:
 *           type: string
 *           description: URL del endpoint de la suscripción push
 *         keys:
 *           type: object
 *           properties:
 *             p256dh:
 *               type: string
 *               description: Clave pública P-256
 *             auth:
 *               type: string
 *               description: Clave de autenticación
 *     PushNotification:
 *       type: object
 *       required:
 *         - title
 *         - body
 *       properties:
 *         title:
 *           type: string
 *           description: Título de la notificación
 *         body:
 *           type: string
 *           description: Cuerpo de la notificación
 *         icon:
 *           type: string
 *           description: URL del icono de la notificación
 *         badge:
 *           type: string
 *           description: URL del badge de la notificación
 *         image:
 *           type: string
 *           description: URL de la imagen de la notificación
 *         tag:
 *           type: string
 *           description: Tag para agrupar notificaciones
 *         data:
 *           type: object
 *           description: Datos adicionales de la notificación
 *         actions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *               title:
 *                 type: string
 *               icon:
 *                 type: string
 *         requireInteraction:
 *           type: boolean
 *           description: Si la notificación requiere interacción
 *         silent:
 *           type: boolean
 *           description: Si la notificación es silenciosa
 *         priority:
 *           type: string
 *           enum: [high, normal, low]
 *           description: Prioridad de la notificación
 *         ttl:
 *           type: number
 *           description: Tiempo de vida de la notificación en segundos
 *     NotificationTemplate:
 *       type: object
 *       required:
 *         - name
 *         - title
 *         - body
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre del template
 *         title:
 *           type: string
 *           description: Título del template
 *         body:
 *           type: string
 *           description: Cuerpo del template
 *         icon:
 *           type: string
 *           description: URL del icono
 *         badge:
 *           type: string
 *           description: URL del badge
 *         image:
 *           type: string
 *           description: URL de la imagen
 *         tag:
 *           type: string
 *           description: Tag del template
 *         data:
 *           type: object
 *           description: Datos adicionales
 *         actions:
 *           type: array
 *           items:
 *             type: object
 *         requireInteraction:
 *           type: boolean
 *         silent:
 *           type: boolean
 *         priority:
 *           type: string
 *           enum: [high, normal, low]
 *         ttl:
 *           type: number
 *         isActive:
 *           type: boolean
 *           description: Si el template está activo
 *     BulkNotificationRequest:
 *       type: object
 *       properties:
 *         userIds:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs de usuarios específicos
 *         userRoles:
 *           type: array
 *           items:
 *             type: string
 *           description: Roles de usuarios
 *         templateId:
 *           type: string
 *           description: ID del template a usar
 *         customNotification:
 *           $ref: '#/components/schemas/PushNotification'
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           description: Fecha programada para envío
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración
 */

/**
 * @swagger
 * tags:
 *   name: Push Notifications
 *   description: API para gestión de notificaciones push
 */

/**
 * @swagger
 * /push-notifications/subscription:
 *   post:
 *     summary: Guardar suscripción push de un usuario
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endpoint
 *               - keys
 *             properties:
 *               endpoint:
 *                 type: string
 *               keys:
 *                 type: object
 *                 properties:
 *                   p256dh:
 *                     type: string
 *                   auth:
 *                     type: string
 *     responses:
 *       201:
 *         description: Suscripción guardada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PushSubscription'
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Datos inválidos
 */
router.post('/subscription', authMiddleware, savePushSubscription);

/**
 * @swagger
 * /push-notifications/subscriptions:
 *   get:
 *     summary: Obtener suscripciones push del usuario
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Suscripciones obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PushSubscription'
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 */
router.get('/subscriptions', authMiddleware, getUserPushSubscriptions);

/**
 * @swagger
 * /push-notifications/subscription/{subscriptionId}:
 *   delete:
 *     summary: Eliminar suscripción push
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la suscripción
 *     responses:
 *       200:
 *         description: Suscripción eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Suscripción no encontrada
 */
router.delete(
  '/subscription/:subscriptionId',
  authMiddleware,
  deletePushSubscription
);

/**
 * @swagger
 * /push-notifications/send/{userId}:
 *   post:
 *     summary: Enviar notificación push a un usuario específico
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PushNotification'
 *     responses:
 *       200:
 *         description: Notificación enviada exitosamente
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/send/:userId',
  authMiddleware,
  requireRole(['admin', 'superadmin']),
  sendNotificationToUser
);

/**
 * @swagger
 * /push-notifications/bulk:
 *   post:
 *     summary: Enviar notificación masiva
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkNotificationRequest'
 *     responses:
 *       200:
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
 *                     success:
 *                       type: number
 *                     failed:
 *                       type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/bulk',
  authMiddleware,
  requireRole(['admin', 'superadmin']),
  sendBulkNotification
);

/**
 * @swagger
 * /push-notifications/templates:
 *   post:
 *     summary: Crear template de notificación
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationTemplate'
 *     responses:
 *       201:
 *         description: Template creado exitosamente
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/templates',
  authMiddleware,
  requireRole(['admin', 'superadmin']),
  createNotificationTemplate
);

/**
 * @swagger
 * /push-notifications/templates:
 *   get:
 *     summary: Obtener templates activos
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Templates obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NotificationTemplate'
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 */
router.get('/templates', authMiddleware, getActiveTemplates);

/**
 * @swagger
 * /push-notifications/templates/{templateId}:
 *   get:
 *     summary: Obtener template específico
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del template
 *     responses:
 *       200:
 *         description: Template obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Template no encontrado
 */
router.get('/templates/:templateId', authMiddleware, getNotificationTemplate);

/**
 * @swagger
 * /push-notifications/templates/{templateId}:
 *   put:
 *     summary: Actualizar template de notificación
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationTemplate'
 *     responses:
 *       200:
 *         description: Template actualizado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Template no encontrado
 */
router.put(
  '/templates/:templateId',
  authMiddleware,
  requireRole(['admin', 'superadmin']),
  updateNotificationTemplate
);

/**
 * @swagger
 * /push-notifications/templates/{templateId}:
 *   delete:
 *     summary: Eliminar template de notificación
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del template
 *     responses:
 *       200:
 *         description: Template eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Template no encontrado
 */
router.delete(
  '/templates/:templateId',
  authMiddleware,
  requireRole(['admin', 'superadmin']),
  deleteNotificationTemplate
);

/**
 * @swagger
 * /push-notifications/stats:
 *   get:
 *     summary: Obtener estadísticas de notificaciones
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                     totalSubscriptions:
 *                       type: number
 *                     activeSubscriptions:
 *                       type: number
 *                     totalTemplates:
 *                       type: number
 *                     activeTemplates:
 *                       type: number
 *                     notificationsSentToday:
 *                       type: number
 *                     notificationsSentThisWeek:
 *                       type: number
 *                     notificationsSentThisMonth:
 *                       type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 */
router.get(
  '/stats',
  authMiddleware,
  requireRole(['admin', 'superadmin']),
  getNotificationStats
);

/**
 * @swagger
 * /push-notifications/vapid-key:
 *   get:
 *     summary: Obtener VAPID public key
 *     tags: [Push Notifications]
 *     responses:
 *       200:
 *         description: VAPID public key obtenida exitosamente
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
 *                     publicKey:
 *                       type: string
 *                 message:
 *                   type: string
 */
router.get('/vapid-key', getVapidPublicKey);

/**
 * @swagger
 * /push-notifications/test:
 *   post:
 *     summary: Probar notificación push (solo desarrollo)
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificación de prueba enviada exitosamente
 *       401:
 *         description: No autorizado
 */
router.post('/test', authMiddleware, testPushNotification);

export default router;
