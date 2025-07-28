import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  requestMusicianController,
  myPendingEventsController,
  myAssignedEventsController,
  myCompletedEventsController,
  availableRequestsController,
  acceptEventController,
  myScheduledEventsController,
  myPastPerformancesController,
  myEventsController,
  myCancelledEventsController,
  getEventByIdController,
  cancelEventController,
  completeEventController
} from '../controllers/eventControllers';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Endpoints para gestión de eventos y matching
 */

/**
 * @swagger
 * /events/request-musician:
 *   post:
 *     tags: [Events]
 *     summary: Crear una solicitud de músico (Organizador)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       403:
 *         description: Solo los organizadores pueden crear solicitudes
 *       500:
 *         description: Error al crear el evento
 */
router.post('/request-musician', authMiddleware, requestMusicianController);

/**
 * @swagger
 * /events/my-pending:
 *   get:
 *     tags: [Events]
 *     summary: Ver eventos/solicitudes pendientes del organizador
 *     description: |
 *       Devuelve los eventos/solicitudes en estado pendiente creados por el organizador autenticado. Usado en el tab "Pendientes" de la pantalla "Mis Solicitudes".
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos pendientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/my-pending', authMiddleware, myPendingEventsController);

/**
 * @swagger
 * /events/my-assigned:
 *   get:
 *     tags: [Events]
 *     summary: Ver eventos/solicitudes asignados al organizador
 *     description: |
 *       Devuelve los eventos/solicitudes en estado asignado creados por el organizador autenticado. Usado en el tab "Asignados" de la pantalla "Mis Solicitudes".
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos asignados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/my-assigned', authMiddleware, myAssignedEventsController);

/**
 * @swagger
 * /events/my-completed:
 *   get:
 *     tags: [Events]
 *     summary: Ver eventos completados del organizador
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos completados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/my-completed', authMiddleware, myCompletedEventsController);

/**
 * @swagger
 * /events/available-requests:
 *   get:
 *     tags: [Events]
 *     summary: Ver solicitudes de eventos disponibles para músicos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/available-requests', authMiddleware, availableRequestsController);

/**
 * @swagger
 * /events/{eventId}/accept:
 *   post:
 *     tags: [Events]
 *     summary: Aceptar una solicitud de evento (Músico)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del evento a aceptar
 *     responses:
 *       200:
 *         description: Evento aceptado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: No se pudo aceptar el evento
 *       403:
 *         description: Solo los músicos pueden aceptar eventos
 *       500:
 *         description: Error al aceptar el evento
 */
router.post('/:eventId/accept', authMiddleware, acceptEventController);

/**
 * @swagger
 * /events/my-scheduled:
 *   get:
 *     tags: [Events]
 *     summary: Ver eventos/solicitudes agendados del músico
 *     description: |
 *       Devuelve los eventos/solicitudes en estado asignado/agendado para el músico autenticado. Usado en el tab "Agendados" de la pantalla "Mis Solicitudes".
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos agendados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/my-scheduled', authMiddleware, myScheduledEventsController);

/**
 * @swagger
 * /events/my-past-performances:
 *   get:
 *     tags: [Events]
 *     summary: Ver historial de actuaciones del músico
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos pasados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/my-past-performances', authMiddleware, myPastPerformancesController);

/**
 * @swagger
 * /events/my-events:
 *   get:
 *     tags: [Events]
 *     summary: Ver todos los eventos/solicitudes en los que participa el usuario (organizador o músico)
 *     description: |
 *       Devuelve todos los eventos/solicitudes en los que participa el usuario autenticado. Si el usuario es organizador, devuelve todos los eventos creados por él. Si es músico, devuelve todos los eventos donde está asignado como músico. Esta ruta es utilizada por la pantalla "Mis Solicitudes" para mostrar el tab "Todos".
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *             examples:
 *               ejemplo:
 *                 summary: Ejemplo de respuesta exitosa
 *                 value:
 *                   data:
 *                     - id: "abc123"
 *                       user: "organizador@email.com"
 *                       eventName: "Concierto de Verano"
 *                       eventType: "concierto"
 *                       date: "2025-08-01"
 *                       time: "20:00 - 22:00"
 *                       location: "Teatro Nacional"
 *                       duration: "120"
 *                       instrument: "guitarra"
 *                       bringInstrument: true
 *                       comment: "Llevar amplificador"
 *                       budget: "500"
 *                       flyerUrl: "https://ejemplo.com/flyer.png"
 *                       songs: ["Song 1", "Song 2"]
 *                       recommendations: []
 *                       mapsLink: "https://maps.google.com/?q=Teatro+Nacional"
 *                       status: "musician_assigned"
 *                       assignedMusicianId: "musico@email.com"
 *                       interestedMusicians: ["musico@email.com"]
 *                       createdAt: "2025-07-01T12:00:00.000Z"
 *                       updatedAt: "2025-07-01T12:00:00.000Z"
 *                     - id: "def456"
 *                       user: "organizador@email.com"
 *                       eventName: "Evento de Prueba"
 *                       eventType: "culto"
 *                       date: "2025-09-10"
 *                       time: "18:00 - 19:00"
 *                       location: "Iglesia Central"
 *                       duration: "60"
 *                       instrument: "piano"
 *                       bringInstrument: false
 *                       comment: ""
 *                       budget: "200"
 *                       flyerUrl: null
 *                       songs: []
 *                       recommendations: []
 *                       mapsLink: "https://maps.google.com/?q=Iglesia+Central"
 *                       status: "pending_musician"
 *                       assignedMusicianId: null
 *                       interestedMusicians: []
 *                       createdAt: "2025-08-01T10:00:00.000Z"
 *                       updatedAt: "2025-08-01T10:00:00.000Z"
 */
router.get('/my-events', authMiddleware, myEventsController);

/**
 * @swagger
 * /events/my-cancelled:
 *   get:
 *     tags: [Events]
 *     summary: Ver eventos/solicitudes canceladas del usuario
 *     description: |
 *       Devuelve los eventos/solicitudes canceladas del usuario autenticado. Usado en el tab "Canceladas" de la pantalla "Mis Solicitudes".
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos cancelados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/my-cancelled', authMiddleware, myCancelledEventsController);

/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     tags: [Events]
 *     summary: Obtener un evento por su ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del evento a obtener
 *     responses:
 *       200:
 *         description: Evento encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error al obtener el evento
 */
router.get('/:eventId', authMiddleware, getEventByIdController);

/**
 * @swagger
 * /events/{eventId}/cancel:
 *   patch:
 *     tags: [Events]
 *     summary: Cancelar una solicitud de evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del evento a cancelar
 *     responses:
 *       200:
 *         description: Evento cancelado exitosamente
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error al cancelar el evento
 */
router.patch('/:eventId/cancel', authMiddleware, cancelEventController);

/**
 * @swagger
 * /events/{eventId}/complete:
 *   patch:
 *     tags: [Events]
 *     summary: Marcar una solicitud de evento como completada
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del evento a completar
 *     responses:
 *       200:
 *         description: Evento marcado como completado exitosamente
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error al completar el evento
 */
router.patch('/:eventId/complete', authMiddleware, completeEventController);

export default router;
