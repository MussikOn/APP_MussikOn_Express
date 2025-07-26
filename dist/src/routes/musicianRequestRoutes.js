"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const musicianRequestController_1 = require("../controllers/musicianRequestController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: MusicianRequests
 *   description: Endpoints para solicitudes directas de músicos
 */
/**
 * @swagger
 * /musician-requests:
 *   get:
 *     tags: [MusicianRequests]
 *     summary: Obtener todas las solicitudes de músico
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por estado (pendiente, asignada, cancelada, completada)
 *       - in: query
 *         name: instrument
 *         schema:
 *           type: string
 *         description: Filtrar por instrumento
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Filtrar por fecha (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MusicianRequest'
 *       500:
 *         description: Error al obtener solicitudes
 */
router.get('/', musicianRequestController_1.getAllRequests);
/**
 * @swagger
 * /musician-requests/search:
 *   get:
 *     tags: [MusicianRequests]
 *     summary: Buscar solicitudes por texto
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Solicitudes encontradas
 *       500:
 *         description: Error en la búsqueda
 */
router.get('/search', musicianRequestController_1.searchRequests);
/**
 * @swagger
 * /musician-requests/status/{status}:
 *   get:
 *     tags: [MusicianRequests]
 *     summary: Obtener solicitudes por estado
 *     parameters:
 *       - in: path
 *         name: status
 *         schema:
 *           type: string
 *         required: true
 *         description: Estado de las solicitudes
 *     responses:
 *       200:
 *         description: Solicitudes filtradas por estado
 *       500:
 *         description: Error al obtener solicitudes
 */
router.get('/status/:status', musicianRequestController_1.getRequestsByStatus);
/**
 * @swagger
 * /musician-requests/instrument/{instrument}:
 *   get:
 *     tags: [MusicianRequests]
 *     summary: Obtener solicitudes por instrumento
 *     parameters:
 *       - in: path
 *         name: instrument
 *         schema:
 *           type: string
 *         required: true
 *         description: Instrumento requerido
 *     responses:
 *       200:
 *         description: Solicitudes filtradas por instrumento
 *       500:
 *         description: Error al obtener solicitudes
 */
router.get('/instrument/:instrument', musicianRequestController_1.getRequestsByInstrument);
/**
 * @swagger
 * /musician-requests/date/{date}:
 *   get:
 *     tags: [MusicianRequests]
 *     summary: Obtener solicitudes por fecha
 *     parameters:
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *         required: true
 *         description: Fecha en formato YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Solicitudes filtradas por fecha
 *       500:
 *         description: Error al obtener solicitudes
 */
router.get('/date/:date', musicianRequestController_1.getRequestsByDate);
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
router.post('/accept', musicianRequestController_1.acceptRequest);
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
router.post('/cancel', musicianRequestController_1.cancelRequest);
/**
 * @swagger
 * /musician-requests:
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
router.post('/', musicianRequestController_1.createRequest);
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
router.get('/:id/status', musicianRequestController_1.getRequestStatus);
/**
 * @swagger
 * /musician-requests/{id}:
 *   get:
 *     tags: [MusicianRequests]
 *     summary: Obtener solicitud por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Solicitud encontrada
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error al obtener solicitud
 *   put:
 *     tags: [MusicianRequests]
 *     summary: Actualizar solicitud
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la solicitud
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *                 type: number
 *               comments:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pendiente, asignada, no_asignada, cancelada, completada]
 *     responses:
 *       200:
 *         description: Solicitud actualizada
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error al actualizar solicitud
 *   delete:
 *     tags: [MusicianRequests]
 *     summary: Eliminar solicitud
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Solicitud eliminada
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error al eliminar solicitud
 */
router.get('/:id', musicianRequestController_1.getRequestById);
router.put('/:id', musicianRequestController_1.updateRequest);
router.delete('/:id', musicianRequestController_1.deleteRequest);
exports.default = router;
