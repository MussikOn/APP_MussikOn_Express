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
  myPastPerformancesController
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
 *     summary: Ver eventos pendientes del organizador
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
 *     summary: Ver eventos asignados del organizador
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
 *     summary: Ver eventos agendados del músico
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

export default router;
