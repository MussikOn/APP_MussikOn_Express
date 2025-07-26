import { Router } from 'express';
import { createRequest, acceptRequest, cancelRequest, getRequestStatus, getRequestById, updateRequest, deleteRequest } from '../controllers/musicianRequestController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: MusicianRequests
 *   description: Endpoints para solicitudes directas de músicos
 */

/**
 * @swagger
 * /musician-requests/:
 *   post:
 *     tags: [MusicianRequests]
 *     summary: Crear solicitud de músico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               eventType:
 *                 type: string
 *               date:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               location:
 *                 type: string
 *               instrument:
 *                 type: string
 *               budget:
 *                 type: string
 *               comments:
 *                 type: string
 *     responses:
 *       201:
 *         description: Solicitud creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Error al crear solicitud
 */
router.post('/', createRequest);

/**
 * @swagger
 * /musician-requests/accept:
 *   post:
 *     tags: [MusicianRequests]
 *     summary: Aceptar solicitud de músico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requestId:
 *                 type: string
 *               musicianId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Solicitud aceptada
 *       400:
 *         description: Solicitud ya tomada o no disponible
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error al aceptar solicitud
 */
router.post('/accept', acceptRequest);

/**
 * @swagger
 * /musician-requests/cancel:
 *   post:
 *     tags: [MusicianRequests]
 *     summary: Cancelar solicitud de músico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requestId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Solicitud cancelada
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error al cancelar solicitud
 */
router.post('/cancel', cancelRequest);

/**
 * @swagger
 * /musician-requests/{id}/status:
 *   get:
 *     tags: [MusicianRequests]
 *     summary: Consultar estado de solicitud de músico
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Estado de la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error al consultar estado
 */
router.get('/:id/status', getRequestStatus);

// CRUD completo
router.get('/:id', getRequestById);
router.put('/:id', updateRequest);
router.delete('/:id', deleteRequest);

export default router; 