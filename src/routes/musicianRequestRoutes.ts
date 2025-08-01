import { Router } from 'express';
import {
  createRequest,
  acceptRequest,
  cancelRequest,
  getRequestStatus,
  getRequestById,
  updateRequest,
  deleteRequest,
} from '../controllers/musicianRequestController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: MusicianRequests
 *   description: Endpoints para solicitudes directas de músicos - CRUD completo implementado
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MusicianRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la solicitud
 *         userId:
 *           type: string
 *           description: ID del usuario que crea la solicitud
 *         eventType:
 *           type: string
 *           enum: [concierto, boda, culto, evento_corporativo, festival, fiesta_privada, graduacion, cumpleanos, otro]
 *           description: Tipo de evento
 *         date:
 *           type: string
 *           format: date
 *           description: Fecha del evento (YYYY-MM-DD)
 *         time:
 *           type: string
 *           description: Hora del evento (HH:MM)
 *         location:
 *           type: string
 *           description: Ubicación del evento
 *         instrument:
 *           type: string
 *           enum: [guitarra, piano, bajo, bateria, saxofon, trompeta, violin, canto, teclado, flauta, otro]
 *           description: Instrumento requerido
 *         budget:
 *           type: number
 *           description: Presupuesto disponible
 *         status:
 *           type: string
 *           enum: [pendiente, asignada, cancelada, completada, no_asignada]
 *           description: Estado de la solicitud
 *         assignedMusicianId:
 *           type: string
 *           description: ID del músico asignado
 *         description:
 *           type: string
 *           description: Descripción adicional del evento
 *         requirements:
 *           type: string
 *           description: Requisitos específicos
 *         contactPhone:
 *           type: string
 *           description: Teléfono de contacto
 *         contactEmail:
 *           type: string
 *           description: Email de contacto
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */

/**
 * @swagger
 * /musician-requests:
 *   post:
 *     tags: [MusicianRequests]
 *     summary: Crear solicitud de músico
 *     description: Crea una nueva solicitud de músico para un evento
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *               - date
 *               - time
 *               - location
 *               - instrument
 *               - budget
 *             properties:
 *               eventType:
 *                 type: string
 *                 enum: [concierto, boda, culto, evento_corporativo, festival, fiesta_privada, graduacion, cumpleanos, otro]
 *                 example: "boda"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-25"
 *               time:
 *                 type: string
 *                 example: "18:00"
 *               location:
 *                 type: string
 *                 example: "Salón de Eventos ABC"
 *               instrument:
 *                 type: string
 *                 enum: [guitarra, piano, bajo, bateria, saxofon, trompeta, violin, canto, teclado, flauta, otro]
 *                 example: "piano"
 *               budget:
 *                 type: number
 *                 example: 50000
 *               description:
 *                 type: string
 *                 example: "Necesitamos un pianista para ceremonia y recepción"
 *               requirements:
 *                 type: string
 *                 example: "Repertorio romántico y clásico"
 *               contactPhone:
 *                 type: string
 *                 example: "+1234567890"
 *               contactEmail:
 *                 type: string
 *                 example: "organizador@evento.com"
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Solicitud creada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/MusicianRequest'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Datos de entrada inválidos"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', createRequest);

/**
 * @swagger
 * /musician-requests/{id}:
 *   get:
 *     tags: [MusicianRequests]
 *     summary: Obtener solicitud por ID
 *     description: Obtiene una solicitud específica por su ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la solicitud
 *         example: "request_123456"
 *     responses:
 *       200:
 *         description: Solicitud encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MusicianRequest'
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Solicitud no encontrada"
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /musician-requests/{id}:
 *   put:
 *     tags: [MusicianRequests]
 *     summary: Actualizar solicitud
 *     description: Actualiza una solicitud existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la solicitud
 *         example: "request_123456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-26"
 *               time:
 *                 type: string
 *                 example: "19:00"
 *               location:
 *                 type: string
 *                 example: "Salón de Eventos XYZ"
 *               budget:
 *                 type: number
 *                 example: 60000
 *               description:
 *                 type: string
 *                 example: "Actualización: Necesitamos un pianista para ceremonia, recepción y baile"
 *               requirements:
 *                 type: string
 *                 example: "Repertorio actualizado"
 *     responses:
 *       200:
 *         description: Solicitud actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Solicitud actualizada correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "request_123456"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T11:45:00Z"
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /musician-requests/{id}:
 *   delete:
 *     tags: [MusicianRequests]
 *     summary: Eliminar solicitud
 *     description: Elimina una solicitud específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la solicitud
 *         example: "request_123456"
 *     responses:
 *       200:
 *         description: Solicitud eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Solicitud eliminada correctamente"
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /musician-requests/accept:
 *   post:
 *     tags: [MusicianRequests]
 *     summary: Aceptar solicitud de músico
 *     description: Permite a un músico aceptar una solicitud disponible
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *               - musicianId
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: ID de la solicitud
 *                 example: "request_123456"
 *               musicianId:
 *                 type: string
 *                 description: ID del músico que acepta
 *                 example: "musician_456"
 *               message:
 *                 type: string
 *                 description: Mensaje opcional del músico
 *                 example: "Estoy disponible para tocar en tu boda"
 *     responses:
 *       200:
 *         description: Solicitud aceptada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Solicitud aceptada correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 *                       example: "request_123456"
 *                     musicianId:
 *                       type: string
 *                       example: "musician_456"
 *                     status:
 *                       type: string
 *                       example: "asignada"
 *                     assignedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T12:00:00Z"
 *       400:
 *         description: Solicitud ya asignada o no disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La solicitud ya ha sido asignada a otro músico"
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /musician-requests/cancel:
 *   post:
 *     tags: [MusicianRequests]
 *     summary: Cancelar solicitud de músico
 *     description: Cancela una solicitud (solo el creador o admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: ID de la solicitud
 *                 example: "request_123456"
 *               reason:
 *                 type: string
 *                 description: Razón de la cancelación
 *                 example: "Evento cancelado por el cliente"
 *     responses:
 *       200:
 *         description: Solicitud cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Solicitud cancelada correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 *                       example: "request_123456"
 *                     status:
 *                       type: string
 *                       example: "cancelada"
 *                     cancelledAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T13:00:00Z"
 *                     reason:
 *                       type: string
 *                       example: "Evento cancelado por el cliente"
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /musician-requests/{id}/status:
 *   get:
 *     tags: [MusicianRequests]
 *     summary: Consultar estado de solicitud
 *     description: Obtiene solo el estado actual de una solicitud
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la solicitud
 *         example: "request_123456"
 *     responses:
 *       200:
 *         description: Estado de la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "request_123456"
 *                 status:
 *                   type: string
 *                   enum: [pendiente, asignada, cancelada, completada, no_asignada]
 *                   example: "asignada"
 *                 assignedMusicianId:
 *                   type: string
 *                   example: "musician_456"
 *                 assignedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T12:00:00Z"
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error interno del servidor
 */

// CRUD completo
router.get('/:id', getRequestById);
router.put('/:id', updateRequest);
router.delete('/:id', deleteRequest);

export default router;
