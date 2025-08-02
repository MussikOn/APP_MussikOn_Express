import { Router, Request, Response } from 'express';
import { AdvancedSearchController } from '../controllers/advancedSearchController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = Router();
const advancedSearchController = new AdvancedSearchController();

/**
 * @swagger
 * /api/advanced-search/musicians:
 *   post:
 *     summary: Búsqueda avanzada de músicos disponibles
 *     tags: [Advanced Search]
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
 *               - instrument
 *               - location
 *               - eventDate
 *               - duration
 *             properties:
 *               eventType:
 *                 type: string
 *                 description: Tipo de evento
 *               instrument:
 *                 type: string
 *                 description: Instrumento requerido
 *               location:
 *                 type: string
 *                 description: Ubicación del evento
 *               eventDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora del evento
 *               duration:
 *                 type: number
 *                 description: Duración en minutos
 *               budget:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                   max:
 *                     type: number
 *               isUrgent:
 *                 type: boolean
 *                 default: false
 *               radius:
 *                 type: number
 *                 default: 50
 *     responses:
 *       200:
 *         description: Búsqueda completada exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/musicians', 
  authMiddleware, 
  requireRole(['eventCreator', 'usuario', 'adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']),
  async (req: Request, res: Response) => {
    await advancedSearchController.searchAvailableMusicians(req, res);
  }
);

/**
 * @swagger
 * /api/advanced-search/check-availability:
 *   post:
 *     summary: Verificar disponibilidad específica de un músico
 *     tags: [Advanced Search]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - musicianId
 *               - eventDate
 *               - duration
 *             properties:
 *               musicianId:
 *                 type: string
 *                 description: ID del músico
 *               eventDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora del evento
 *               duration:
 *                 type: number
 *                 description: Duración en minutos
 *               location:
 *                 type: string
 *                 description: Ubicación del evento
 *     responses:
 *       200:
 *         description: Verificación completada
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: Músico no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/check-availability',
  authMiddleware,
  requireRole(['eventCreator', 'usuario', 'adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']),
  async (req: Request, res: Response) => {
    await advancedSearchController.checkMusicianAvailability(req, res);
  }
);

/**
 * @swagger
 * /api/advanced-search/update-status/{musicianId}:
 *   post:
 *     summary: Actualizar estado del músico
 *     tags: [Advanced Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: musicianId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del músico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isOnline:
 *                 type: boolean
 *                 description: Estado online/offline
 *               currentLocation:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   address:
 *                     type: string
 *               availability:
 *                 type: object
 *                 properties:
 *                   isAvailable:
 *                     type: boolean
 *                   availableFrom:
 *                     type: string
 *                     format: date-time
 *                   availableTo:
 *                     type: string
 *                     format: date-time
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/update-status/:musicianId',
  authMiddleware,
  requireRole(['musico', 'adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']),
  async (req: Request, res: Response) => {
    await advancedSearchController.updateMusicianStatus(req, res);
  }
);

/**
 * @swagger
 * /api/advanced-search/heartbeat/{musicianId}:
 *   post:
 *     summary: Heartbeat para mantener estado online
 *     tags: [Advanced Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: musicianId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del músico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *     responses:
 *       200:
 *         description: Heartbeat registrado correctamente
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/heartbeat/:musicianId',
  authMiddleware,
  requireRole(['musico']),
  async (req: Request, res: Response) => {
    await advancedSearchController.musicianHeartbeat(req, res);
  }
);

/**
 * @swagger
 * /api/advanced-search/daily-availability/{musicianId}:
 *   get:
 *     summary: Obtener disponibilidad diaria del músico
 *     tags: [Advanced Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: musicianId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del músico
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha para consultar disponibilidad
 *     responses:
 *       200:
 *         description: Disponibilidad obtenida exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/daily-availability/:musicianId',
  authMiddleware,
  requireRole(['musico', 'eventCreator', 'usuario', 'adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']),
  async (req: Request, res: Response) => {
    await advancedSearchController.getDailyAvailability(req, res);
  }
);

/**
 * @swagger
 * /api/advanced-search/calculate-rate:
 *   post:
 *     summary: Calcular tarifa para un músico
 *     tags: [Advanced Search]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - musicianId
 *               - eventType
 *               - duration
 *               - location
 *               - eventDate
 *               - instrument
 *             properties:
 *               musicianId:
 *                 type: string
 *                 description: ID del músico
 *               eventType:
 *                 type: string
 *                 description: Tipo de evento
 *               duration:
 *                 type: number
 *                 description: Duración en minutos
 *               location:
 *                 type: string
 *                 description: Ubicación del evento
 *               eventDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha del evento
 *               instrument:
 *                 type: string
 *                 description: Instrumento
 *               isUrgent:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Tarifa calculada exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/calculate-rate',
  authMiddleware,
  requireRole(['eventCreator', 'usuario', 'adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']),
  async (req: Request, res: Response) => {
    await advancedSearchController.calculateMusicianRate(req, res);
  }
);

export default router; 