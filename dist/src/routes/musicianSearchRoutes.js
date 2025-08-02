"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const errorHandler_1 = require("../middleware/errorHandler");
const loggerService_1 = require("../services/loggerService");
const musicianSearchController_1 = require("../controllers/musicianSearchController");
const router = (0, express_1.Router)();
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
router.post('/search-for-event', authMiddleware_1.authMiddleware, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    loggerService_1.logger.logAuth('Búsqueda de músicos solicitada', (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail, {
        metadata: { eventId: req.body.eventId },
    });
    yield musicianSearchController_1.MusicianSearchController.searchMusiciansForEvent(req, res);
    loggerService_1.logger.logAuth('Búsqueda de músicos completada', (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail);
})));
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
router.get('/recommendations/:eventId', authMiddleware_1.authMiddleware, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    loggerService_1.logger.logAuth('Recomendaciones solicitadas', (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail, {
        metadata: { eventId: req.params.eventId },
    });
    yield musicianSearchController_1.MusicianSearchController.getRecommendedMusicians(req, res);
    loggerService_1.logger.logAuth('Recomendaciones obtenidas', (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail);
})));
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
router.post('/advanced-search', authMiddleware_1.authMiddleware, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    loggerService_1.logger.logAuth('Búsqueda avanzada solicitada', (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail, {
        metadata: { criteria: req.body.criteria },
    });
    yield musicianSearchController_1.MusicianSearchController.advancedSearch(req, res);
    loggerService_1.logger.logAuth('Búsqueda avanzada completada', (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail);
})));
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
router.get('/stats', authMiddleware_1.authMiddleware, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    loggerService_1.logger.logAuth('Estadísticas de búsqueda solicitadas', (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail);
    yield musicianSearchController_1.MusicianSearchController.getSearchStats(req, res);
    loggerService_1.logger.logAuth('Estadísticas de búsqueda obtenidas', (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail);
})));
exports.default = router;
