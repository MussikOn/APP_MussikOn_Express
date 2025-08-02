"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hiringController_1 = require("../controllers/hiringController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const hiringController = new hiringController_1.HiringController();
/**
 * @swagger
 * components:
 *   schemas:
 *     HiringRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la solicitud
 *         eventId:
 *           type: string
 *           description: ID del evento
 *         eventCreatorId:
 *           type: string
 *           description: ID del creador del evento
 *         musicianId:
 *           type: string
 *           description: ID del músico
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected, cancelled, completed]
 *           description: Estado de la solicitud
 *         requestDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de la solicitud
 *         responseDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de respuesta
 *         eventDetails:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *               description: Título del evento
 *             date:
 *               type: string
 *               format: date-time
 *               description: Fecha del evento
 *             duration:
 *               type: number
 *               description: Duración en minutos
 *             location:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                   description: Dirección del evento
 *                 coordinates:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                       description: Latitud
 *                     lng:
 *                       type: number
 *                       description: Longitud
 *             budget:
 *               type: number
 *               description: Presupuesto del evento
 *             description:
 *               type: string
 *               description: Descripción del evento
 *         musicianDetails:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Nombre del músico
 *             instruments:
 *               type: array
 *               items:
 *                 type: string
 *               description: Instrumentos que toca
 *             hourlyRate:
 *               type: number
 *               description: Tarifa por hora
 *             rating:
 *               type: number
 *               description: Calificación del músico
 *         terms:
 *           type: object
 *           properties:
 *             agreedPrice:
 *               type: number
 *               description: Precio acordado
 *             paymentTerms:
 *               type: string
 *               description: Términos de pago
 *             specialRequirements:
 *               type: string
 *               description: Requisitos especiales
 *         communication:
 *           type: object
 *           properties:
 *             messages:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *             lastActivity:
 *               type: string
 *               format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del mensaje
 *         senderId:
 *           type: string
 *           description: ID del remitente
 *         senderType:
 *           type: string
 *           enum: [eventCreator, musician]
 *           description: Tipo de remitente
 *         content:
 *           type: string
 *           description: Contenido del mensaje
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora del mensaje
 *         isRead:
 *           type: boolean
 *           description: Si el mensaje ha sido leído
 *
 *     HiringRequestCreate:
 *       type: object
 *       required:
 *         - eventId
 *         - musicianId
 *         - eventDetails
 *         - terms
 *       properties:
 *         eventId:
 *           type: string
 *           description: ID del evento
 *         musicianId:
 *           type: string
 *           description: ID del músico
 *         eventDetails:
 *           type: object
 *           required:
 *             - title
 *             - date
 *             - duration
 *             - location
 *             - budget
 *             - description
 *           properties:
 *             title:
 *               type: string
 *               description: Título del evento
 *             date:
 *               type: string
 *               format: date-time
 *               description: Fecha del evento
 *             duration:
 *               type: number
 *               description: Duración en minutos
 *             location:
 *               type: object
 *               required:
 *                 - address
 *                 - coordinates
 *               properties:
 *                 address:
 *                   type: string
 *                   description: Dirección del evento
 *                 coordinates:
 *                   type: object
 *                   required:
 *                     - lat
 *                     - lng
 *                   properties:
 *                     lat:
 *                       type: number
 *                       description: Latitud
 *                     lng:
 *                       type: number
 *                       description: Longitud
 *             budget:
 *               type: number
 *               description: Presupuesto del evento
 *             description:
 *               type: string
 *               description: Descripción del evento
 *         terms:
 *           type: object
 *           required:
 *             - agreedPrice
 *             - paymentTerms
 *           properties:
 *             agreedPrice:
 *               type: number
 *               description: Precio acordado
 *             paymentTerms:
 *               type: string
 *               description: Términos de pago
 *             specialRequirements:
 *               type: string
 *               description: Requisitos especiales
 *
 *     HiringStats:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           description: Total de solicitudes
 *         pending:
 *           type: number
 *           description: Solicitudes pendientes
 *         accepted:
 *           type: number
 *           description: Solicitudes aceptadas
 *         rejected:
 *           type: number
 *           description: Solicitudes rechazadas
 *         completed:
 *           type: number
 *           description: Solicitudes completadas
 *         cancelled:
 *           type: number
 *           description: Solicitudes canceladas
 */
/**
 * @swagger
 * /hiring/create:
 *   post:
 *     summary: Crear una nueva solicitud de contratación
 *     description: Permite a un creador de eventos solicitar un músico para su evento
 *     tags: [Hiring]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HiringRequestCreate'
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
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
 *                   $ref: '#/components/schemas/HiringRequest'
 *       400:
 *         description: Error en los datos de entrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo creadores de eventos pueden crear solicitudes
 */
router.post('/create', authMiddleware_1.authMiddleware, hiringController.createHiringRequest);
/**
 * @swagger
 * /hiring/{requestId}:
 *   get:
 *     summary: Obtener una solicitud de contratación por ID
 *     description: Obtiene los detalles de una solicitud de contratación específica
 *     tags: [Hiring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de contratación
 *     responses:
 *       200:
 *         description: Solicitud obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/HiringRequest'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para ver esta solicitud
 *       404:
 *         description: Solicitud no encontrada
 */
router.get('/:requestId', authMiddleware_1.authMiddleware, hiringController.getHiringRequestById);
/**
 * @swagger
 * /hiring/{requestId}/status:
 *   put:
 *     summary: Actualizar el estado de una solicitud de contratación
 *     description: Permite actualizar el estado de una solicitud (aceptar, rechazar, cancelar, completar)
 *     tags: [Hiring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de contratación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, rejected, cancelled, completed]
 *                 description: Nuevo estado de la solicitud
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
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
 *                   $ref: '#/components/schemas/HiringRequest'
 *       400:
 *         description: Error en los datos de entrada o transición de estado inválida
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para actualizar esta solicitud
 *       404:
 *         description: Solicitud no encontrada
 */
router.put('/:requestId/status', authMiddleware_1.authMiddleware, hiringController.updateHiringRequestStatus);
/**
 * @swagger
 * /hiring/user:
 *   get:
 *     summary: Obtener solicitudes de contratación del usuario
 *     description: Obtiene todas las solicitudes de contratación del usuario autenticado
 *     tags: [Hiring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, cancelled, completed]
 *         description: Filtrar por estado (opcional)
 *     responses:
 *       200:
 *         description: Solicitudes obtenidas exitosamente
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
 *                     $ref: '#/components/schemas/HiringRequest'
 *                 count:
 *                   type: number
 *                   description: Número total de solicitudes
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Rol de usuario inválido
 */
router.get('/user', authMiddleware_1.authMiddleware, hiringController.getHiringRequestsByUser);
/**
 * @swagger
 * /hiring/{requestId}/messages:
 *   post:
 *     summary: Agregar mensaje a una solicitud de contratación
 *     description: Permite enviar un mensaje en el chat de una solicitud de contratación
 *     tags: [Hiring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de contratación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Contenido del mensaje
 *     responses:
 *       201:
 *         description: Mensaje enviado exitosamente
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
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Error en los datos de entrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para enviar mensajes en esta solicitud
 *       404:
 *         description: Solicitud no encontrada
 */
router.post('/:requestId/messages', authMiddleware_1.authMiddleware, hiringController.addMessage);
/**
 * @swagger
 * /hiring/{requestId}/messages/read:
 *   put:
 *     summary: Marcar mensajes como leídos
 *     description: Marca todos los mensajes de una solicitud como leídos para el usuario
 *     tags: [Hiring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de contratación
 *     responses:
 *       200:
 *         description: Mensajes marcados como leídos exitosamente
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
 *         description: No tienes permisos para marcar mensajes como leídos
 *       404:
 *         description: Solicitud no encontrada
 */
router.put('/:requestId/messages/read', authMiddleware_1.authMiddleware, hiringController.markMessagesAsRead);
/**
 * @swagger
 * /hiring/stats:
 *   get:
 *     summary: Obtener estadísticas de contratación
 *     description: Obtiene estadísticas de las solicitudes de contratación del usuario
 *     tags: [Hiring]
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
 *                   $ref: '#/components/schemas/HiringStats'
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Rol de usuario inválido
 */
router.get('/stats', authMiddleware_1.authMiddleware, hiringController.getHiringStats);
exports.default = router;
