import { Request, Response, RequestHandler } from "express";
import * as Joi from "joi";
import { 
  createMusicianRequestModel, 
  getAvailableMusicianRequests, 
  respondToMusicianRequest,
  acceptMusicianResponse,
  getOrganizerRequests,
  cancelMusicianRequest,
  resendExpiredRequest
} from "../models/musicianRequestModel";
import { uploadImage } from "../models/imagesModel";

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
 *         organizerId:
 *           type: string
 *           format: email
 *           description: Email del organizador
 *         organizerName:
 *           type: string
 *           description: Nombre del organizador
 *         eventName:
 *           type: string
 *           description: Nombre del evento
 *         eventType:
 *           type: string
 *           enum: [culto, campana_dentro_templo, otro]
 *           description: Tipo de evento
 *         eventDate:
 *           type: string
 *           format: date
 *           description: Fecha del evento
 *         startTime:
 *           type: string
 *           pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Hora de inicio (HH:mm)
 *         endTime:
 *           type: string
 *           pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Hora de fin (HH:mm)
 *         location:
 *           type: string
 *           description: Ubicación del evento
 *         locationCoordinates:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               minimum: -90
 *               maximum: 90
 *             longitude:
 *               type: number
 *               minimum: -180
 *               maximum: 180
 *         instrumentType:
 *           type: string
 *           description: Tipo de instrumento requerido
 *         eventDescription:
 *           type: string
 *           description: Descripción del evento
 *         flyerUrl:
 *           type: string
 *           description: URL del flyer del evento
 *         calculatedPrice:
 *           type: number
 *           description: Precio calculado automáticamente
 *         status:
 *           type: string
 *           enum: [searching_musician, musician_found, completed, expired, cancelled]
 *           description: Estado de la solicitud
 *         assignedMusicianId:
 *           type: string
 *           description: ID del músico asignado
 *         interestedMusicians:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de músicos interesados
 *         searchExpiryTime:
 *           type: string
 *           format: date-time
 *           description: Tiempo de expiración de la búsqueda
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     MusicianRequestResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la respuesta
 *         requestId:
 *           type: string
 *           description: ID de la solicitud
 *         musicianId:
 *           type: string
 *           format: email
 *           description: Email del músico
 *         musicianName:
 *           type: string
 *           description: Nombre del músico
 *         status:
 *           type: string
 *           enum: [pending, accepted, declined]
 *           description: Estado de la respuesta
 *         message:
 *           type: string
 *           description: Mensaje del músico
 *         proposedPrice:
 *           type: number
 *           description: Precio propuesto por el músico
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     CreateMusicianRequest:
 *       type: object
 *       required:
 *         - organizerId
 *         - organizerName
 *         - eventName
 *         - eventType
 *         - eventDate
 *         - startTime
 *         - endTime
 *         - location
 *         - instrumentType
 *         - eventDescription
 *       properties:
 *         organizerId:
 *           type: string
 *           format: email
 *           description: Email del organizador
 *         organizerName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Nombre del organizador
 *         eventName:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Nombre del evento
 *         eventType:
 *           type: string
 *           enum: [culto, campana_dentro_templo, otro]
 *           description: Tipo de evento
 *         eventDate:
 *           type: string
 *           format: date
 *           description: Fecha del evento
 *         startTime:
 *           type: string
 *           pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Hora de inicio (HH:mm)
 *         endTime:
 *           type: string
 *           pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Hora de fin (HH:mm)
 *         location:
 *           type: string
 *           minLength: 5
 *           maxLength: 500
 *           description: Ubicación del evento
 *         locationCoordinates:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               minimum: -90
 *               maximum: 90
 *             longitude:
 *               type: number
 *               minimum: -180
 *               maximum: 180
 *         instrumentType:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Tipo de instrumento requerido
 *         eventDescription:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *           description: Descripción del evento
 *     
 *     RespondToRequest:
 *       type: object
 *       required:
 *         - musicianId
 *         - musicianName
 *       properties:
 *         musicianId:
 *           type: string
 *           format: email
 *           description: Email del músico
 *         musicianName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Nombre del músico
 *         message:
 *           type: string
 *           maxLength: 500
 *           description: Mensaje opcional del músico
 *         proposedPrice:
 *           type: number
 *           minimum: 0
 *           description: Precio propuesto por el músico
 */

// Esquemas de validación
const createMusicianRequestSchema = Joi.object({
  organizerId: Joi.string().email().required(),
  organizerName: Joi.string().min(2).max(100).required(),
  eventName: Joi.string().min(3).max(200).required(),
  eventType: Joi.string().valid('culto', 'campana_dentro_templo', 'otro').required(),
  eventDate: Joi.string().isoDate().required(),
  startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  location: Joi.string().min(5).max(500).required(),
  locationCoordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }).optional(),
  instrumentType: Joi.string().min(2).max(100).required(),
  eventDescription: Joi.string().min(10).max(1000).required(),
});

const respondToRequestSchema = Joi.object({
  musicianId: Joi.string().email().required(),
  musicianName: Joi.string().min(2).max(100).required(),
  message: Joi.string().max(500).optional(),
  proposedPrice: Joi.number().positive().optional(),
});

/**
 * @swagger
 * /musician-requests/create:
 *   post:
 *     tags:
 *       - Musician Requests
 *     summary: Crear nueva solicitud de músico
 *     description: Crea una nueva solicitud de músico con cálculo automático de tarifas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - organizerId
 *               - organizerName
 *               - eventName
 *               - eventType
 *               - eventDate
 *               - startTime
 *               - endTime
 *               - location
 *               - instrumentType
 *               - eventDescription
 *             properties:
 *               organizerId:
 *                 type: string
 *                 format: email
 *                 description: Email del organizador
 *               organizerName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nombre del organizador
 *               eventName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 description: Nombre del evento
 *               eventType:
 *                 type: string
 *                 enum: [culto, campana_dentro_templo, otro]
 *                 description: Tipo de evento
 *               eventDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha del evento
 *               startTime:
 *                 type: string
 *                 pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: Hora de inicio (HH:mm)
 *               endTime:
 *                 type: string
 *                 pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: Hora de fin (HH:mm)
 *               location:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *                 description: Ubicación del evento
 *               locationCoordinates:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     minimum: -90
 *                     maximum: 90
 *                   longitude:
 *                     type: number
 *                     minimum: -180
 *                     maximum: 180
 *               instrumentType:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Tipo de instrumento requerido
 *               eventDescription:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Descripción del evento
 *               flyer:
 *                 type: string
 *                 format: binary
 *                 description: Flyer del evento (opcional)
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
 *                   example: "Solicitud de músico creada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     request:
 *                       $ref: '#/components/schemas/MusicianRequest'
 *                     searchExpiryTime:
 *                       type: string
 *                       format: date-time
 *                       description: Tiempo de expiración de la búsqueda
 *                     calculatedPrice:
 *                       type: number
 *                       description: Precio calculado automáticamente
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Datos de entrada inválidos"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
// Crear nueva solicitud de músico
export const createMusicianRequest: any = async (req: Request, res: Response) => {
  try {
    const { error, value } = createMusicianRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Datos de entrada inválidos",
        errors: error.details.map(detail => detail.message)
      });
    }

    // Validar que la hora de fin sea después de la hora de inicio
    const startTime = value.startTime;
    const endTime = value.endTime;
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "La hora de fin debe ser después de la hora de inicio"
      });
    }

    // Procesar imagen si se proporciona
    let flyerUrl;
    if (req.file) {
      const uploadResult = await uploadImage(req.file);
      flyerUrl = uploadResult.url;
    }

    const requestData = {
      ...value,
      flyerUrl,
    };

    const request = await createMusicianRequestModel(requestData);

    return res.status(201).json({
      success: true,
      message: "Solicitud de músico creada exitosamente",
      data: {
        request,
        searchExpiryTime: request.searchExpiryTime,
        calculatedPrice: request.calculatedPrice
      }
    });

  } catch (error) {
    console.error("Error al crear solicitud de músico:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

/**
 * @swagger
 * /musician-requests/available:
 *   get:
 *     tags:
 *       - Musician Requests
 *     summary: Obtener solicitudes disponibles
 *     description: Obtiene todas las solicitudes disponibles para músicos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: instrumentType
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de instrumento
 *         example: "Piano"
 *     responses:
 *       200:
 *         description: Lista de solicitudes disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MusicianRequest'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
// Obtener solicitudes disponibles para músicos
export const getAvailableRequests: any = async (req: Request, res: Response) => {
  try {
    const { instrumentType } = req.query;
    
    const requests = await getAvailableMusicianRequests(
      instrumentType as string
    );

    return res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error("Error al obtener solicitudes disponibles:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

/**
 * @swagger
 * /musician-requests/respond/{requestId}:
 *   post:
 *     tags:
 *       - Musician Requests
 *     summary: Responder a solicitud
 *     description: Permite a un músico responder a una solicitud disponible
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud
 *         example: "request_123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RespondToRequest'
 *     responses:
 *       200:
 *         description: Respuesta enviada exitosamente
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
 *                   example: "Respuesta enviada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/MusicianRequestResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error interno del servidor
 */
// Músico responde a una solicitud
export const respondToRequest: any = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { error, value } = respondToRequestSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Datos de entrada inválidos",
        errors: error.details.map((detail: any) => detail.message)
      });
    }

    const response = await respondToMusicianRequest(
      requestId,
      value.musicianId,
      value.musicianName,
      value.message,
      value.proposedPrice
    );

    if (!response) {
      return res.status(404).json({
        success: false,
        message: "Solicitud no encontrada o ya no está disponible"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Respuesta enviada exitosamente",
      data: response
    });

  } catch (error) {
    console.error("Error al responder a solicitud:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

/**
 * @swagger
 * /musician-requests/accept/{requestId}/{musicianId}:
 *   post:
 *     tags:
 *       - Musician Requests
 *     summary: Aceptar músico
 *     description: Permite al organizador aceptar la respuesta de un músico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud
 *         example: "request_123"
 *       - in: path
 *         name: musicianId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del músico
 *         example: "musico@email.com"
 *     responses:
 *       200:
 *         description: Músico aceptado exitosamente
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
 *                   example: "Músico aceptado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     request:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         status:
 *                           type: string
 *                           example: "musician_found"
 *                         assignedMusicianId:
 *                           type: string
 *                     response:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         status:
 *                           type: string
 *                           example: "accepted"
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Solicitud o respuesta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
// Organizador acepta respuesta de músico
export const acceptMusician: any = async (req: Request, res: Response) => {
  try {
    const { requestId, musicianId } = req.params;

    const result = await acceptMusicianResponse(requestId, musicianId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Solicitud o respuesta no encontrada"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Músico aceptado exitosamente",
      data: result
    });

  } catch (error) {
    console.error("Error al aceptar músico:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

/**
 * @swagger
 * /musician-requests/organizer/{organizerId}:
 *   get:
 *     tags:
 *       - Musician Requests
 *     summary: Obtener solicitudes del organizador
 *     description: Obtiene todas las solicitudes creadas por un organizador
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Email del organizador
 *         example: "organizador@email.com"
 *     responses:
 *       200:
 *         description: Lista de solicitudes del organizador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MusicianRequest'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
// Obtener solicitudes de un organizador
export const getOrganizerRequestsList: any = async (req: Request, res: Response) => {
  try {
    const { organizerId } = req.params;

    const requests = await getOrganizerRequests(organizerId);

    return res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error("Error al obtener solicitudes del organizador:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

/**
 * @swagger
 * /musician-requests/cancel/{requestId}:
 *   post:
 *     tags:
 *       - Musician Requests
 *     summary: Cancelar solicitud
 *     description: Cancela una solicitud activa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud
 *         example: "request_123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizerId
 *             properties:
 *               organizerId:
 *                 type: string
 *                 format: email
 *                 description: Email del organizador
 *                 example: "organizador@email.com"
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
 *                   example: "Solicitud cancelada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: "cancelled"
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error interno del servidor
 */
// Cancelar solicitud
export const cancelRequest: any = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { organizerId } = req.body;

    const cancelledRequest = await cancelMusicianRequest(requestId, organizerId);

    if (!cancelledRequest) {
      return res.status(404).json({
        success: false,
        message: "Solicitud no encontrada o no tienes permisos para cancelarla"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Solicitud cancelada exitosamente",
      data: cancelledRequest
    });

  } catch (error) {
    console.error("Error al cancelar solicitud:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

/**
 * @swagger
 * /musician-requests/resend/{requestId}:
 *   post:
 *     tags:
 *       - Musician Requests
 *     summary: Renviar solicitud expirada
 *     description: Renvia una solicitud que expiró sin encontrar músico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud
 *         example: "request_123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizerId
 *             properties:
 *               organizerId:
 *                 type: string
 *                 format: email
 *                 description: Email del organizador
 *                 example: "organizador@email.com"
 *     responses:
 *       200:
 *         description: Solicitud renviada exitosamente
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
 *                   example: "Solicitud renviada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     request:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         status:
 *                           type: string
 *                           example: "searching_musician"
 *                     searchExpiryTime:
 *                       type: string
 *                       format: date-time
 *                       description: Nuevo tiempo de expiración
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Solicitud no encontrada o no está expirada
 *       500:
 *         description: Error interno del servidor
 */
// Renviar solicitud expirada
export const resendRequest: any = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { organizerId } = req.body;

    const resentRequest = await resendExpiredRequest(requestId, organizerId);

    if (!resentRequest) {
      return res.status(404).json({
        success: false,
        message: "Solicitud no encontrada o no está expirada"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Solicitud renviada exitosamente",
      data: {
        request: resentRequest,
        searchExpiryTime: resentRequest.searchExpiryTime
      }
    });

  } catch (error) {
    console.error("Error al renviar solicitud:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
}; 