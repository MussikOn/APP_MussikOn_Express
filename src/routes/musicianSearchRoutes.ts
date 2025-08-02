import express, { Request, Response, Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../services/loggerService';
import { MusicianSearchController } from '../controllers/musicianSearchController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Musician Search
 *   description: Endpoints para búsqueda y recomendación de músicos
 */

/**
 * @swagger
 * /musician-search/search-for-event:
 *   post:
 *     tags: [Musician Search]
 *     summary: Buscar músicos disponibles para un evento específico
 *     description: Algoritmo de búsqueda inteligente que encuentra músicos que coinciden con los criterios del evento
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID del evento para el cual buscar músicos
 *               criteria:
 *                 type: object
 *                 description: Criterios adicionales de búsqueda (opcionales)
 *                 properties:
 *                   instrument:
 *                     type: string
 *                     description: Instrumento específico requerido
 *                   location:
 *                     type: string
 *                     description: Ubicación preferida
 *                   budget:
 *                     type: number
 *                     description: Presupuesto máximo
 *                   maxDistance:
 *                     type: number
 *                     description: Distancia máxima en kilómetros
 *     responses:
 *       200:
 *         description: Búsqueda completada exitosamente
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
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                     totalMusicians:
 *                       type: number
 *                     musicians:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userEmail:
 *                             type: string
 *                           name:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           instruments:
 *                             type: array
 *                             items:
 *                               type: string
 *                           hasOwnInstruments:
 *                             type: boolean
 *                           experience:
 *                             type: number
 *                           hourlyRate:
 *                             type: number
 *                           location:
 *                             type: string
 *                           isAvailable:
 *                             type: boolean
 *                           rating:
 *                             type: number
 *                           matchScore:
 *                             type: number
 *                           availability:
 *                             type: object
 *                             properties:
 *                               isAvailable:
 *                                 type: boolean
 *                               conflicts:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *       400:
 *         description: Datos de entrada inválidos
 *       403:
 *         description: No autorizado - Solo creadores de eventos
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/search-for-event',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    logger.logAuth('Búsqueda de músicos solicitada', (req as any).user?.userEmail, {
      metadata: { eventId: req.body.eventId },
    });
    await MusicianSearchController.searchMusiciansForEvent(req, res);
    logger.logAuth('Búsqueda de músicos completada', (req as any).user?.userEmail);
  })
);

/**
 * @swagger
 * /musician-search/recommendations/{eventId}:
 *   get:
 *     tags: [Musician Search]
 *     summary: Obtener músicos recomendados para un evento
 *     description: Obtiene las mejores recomendaciones de músicos para un evento específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Recomendaciones obtenidas exitosamente
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
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                     totalRecommendations:
 *                       type: number
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userEmail:
 *                             type: string
 *                           name:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           instruments:
 *                             type: array
 *                             items:
 *                               type: string
 *                           hasOwnInstruments:
 *                             type: boolean
 *                           experience:
 *                             type: number
 *                           hourlyRate:
 *                             type: number
 *                           location:
 *                             type: string
 *                           isAvailable:
 *                             type: boolean
 *                           rating:
 *                             type: number
 *                           matchScore:
 *                             type: number
 *       403:
 *         description: No autorizado - Solo creadores de eventos
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/recommendations/:eventId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    logger.logAuth('Recomendaciones solicitadas', (req as any).user?.userEmail, {
      metadata: { eventId: req.params.eventId },
    });
    await MusicianSearchController.getRecommendedMusicians(req, res);
    logger.logAuth('Recomendaciones obtenidas', (req as any).user?.userEmail);
  })
);

/**
 * @swagger
 * /musician-search/advanced-search:
 *   post:
 *     tags: [Musician Search]
 *     summary: Búsqueda avanzada de músicos
 *     description: Búsqueda personalizada con criterios específicos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - criteria
 *             properties:
 *               criteria:
 *                 type: object
 *                 required:
 *                   - instrument
 *                 properties:
 *                   instrument:
 *                     type: string
 *                     description: Instrumento requerido
 *                   location:
 *                     type: string
 *                     description: Ubicación preferida
 *                   budget:
 *                     type: number
 *                     description: Presupuesto máximo
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: Fecha del evento
 *                   time:
 *                     type: string
 *                     description: Hora del evento
 *                   duration:
 *                     type: string
 *                     description: Duración del evento (HH:MM)
 *                   eventType:
 *                     type: string
 *                     description: Tipo de evento
 *                   maxDistance:
 *                     type: number
 *                     description: Distancia máxima en kilómetros
 *                   bringInstrument:
 *                     type: boolean
 *                     description: Si el evento requiere instrumento
 *     responses:
 *       200:
 *         description: Búsqueda avanzada completada exitosamente
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
 *                   type: object
 *                   properties:
 *                     totalMusicians:
 *                       type: number
 *                     musicians:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userEmail:
 *                             type: string
 *                           name:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           instruments:
 *                             type: array
 *                             items:
 *                               type: string
 *                           hasOwnInstruments:
 *                             type: boolean
 *                           experience:
 *                             type: number
 *                           hourlyRate:
 *                             type: number
 *                           location:
 *                             type: string
 *                           isAvailable:
 *                             type: boolean
 *                           rating:
 *                             type: number
 *                           matchScore:
 *                             type: number
 *       400:
 *         description: Criterios de búsqueda inválidos
 *       403:
 *         description: No autorizado - Solo creadores de eventos
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/advanced-search',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    logger.logAuth('Búsqueda avanzada solicitada', (req as any).user?.userEmail, {
      metadata: { criteria: req.body.criteria },
    });
    await MusicianSearchController.advancedSearch(req, res);
    logger.logAuth('Búsqueda avanzada completada', (req as any).user?.userEmail);
  })
);

/**
 * @swagger
 * /musician-search/stats:
 *   get:
 *     tags: [Musician Search]
 *     summary: Obtener estadísticas de búsqueda
 *     description: Obtiene estadísticas sobre las búsquedas realizadas
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSearches:
 *                       type: number
 *                       description: Total de búsquedas realizadas
 *                     averageResults:
 *                       type: number
 *                       description: Promedio de resultados por búsqueda
 *                     mostSearchedInstrument:
 *                       type: string
 *                       description: Instrumento más buscado
 *                     lastSearchDate:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de la última búsqueda
 *                     totalMusiciansAvailable:
 *                       type: number
 *                       description: Total de músicos disponibles
 *       403:
 *         description: No autorizado - Solo creadores de eventos
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/stats',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    logger.logAuth('Estadísticas de búsqueda solicitadas', (req as any).user?.userEmail);
    await MusicianSearchController.getSearchStats(req, res);
    logger.logAuth('Estadísticas de búsqueda obtenidas', (req as any).user?.userEmail);
  })
);

export default router; 