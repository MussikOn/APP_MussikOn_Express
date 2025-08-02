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
const advancedSearchController_1 = require("../controllers/advancedSearchController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const requireRole_1 = require("../middleware/requireRole");
const router = (0, express_1.Router)();
const advancedSearchController = new advancedSearchController_1.AdvancedSearchController();
/**
 * @swagger
 * /api/advanced-search/musicians:
 *   post:
 *     summary: Búsqueda avanzada de músicos con verificación de disponibilidad
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
 *                 example: "wedding"
 *               instrument:
 *                 type: string
 *                 description: Instrumento requerido
 *                 example: "guitarra"
 *               location:
 *                 type: string
 *                 description: Ubicación del evento
 *                 example: "Madrid"
 *               eventDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora del evento
 *                 example: "2024-12-25T20:00:00Z"
 *               duration:
 *                 type: number
 *                 description: Duración en minutos
 *                 example: 120
 *               budget:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                     example: 100
 *                   max:
 *                     type: number
 *                     example: 500
 *               isUrgent:
 *                 type: boolean
 *                 default: false
 *               radius:
 *                 type: number
 *                 default: 50
 *                 description: Radio de búsqueda en km
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     availableMusicians:
 *                       type: array
 *                       items:
 *                         type: object
 *                     unavailableMusicians:
 *                       type: array
 *                       items:
 *                         type: object
 *                     totalFound:
 *                       type: number
 *                     availableCount:
 *                       type: number
 *                     unavailableCount:
 *                       type: number
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/musicians', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['eventCreator', 'usuario', 'adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield advancedSearchController.searchAvailableMusicians(req, res);
}));
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
router.post('/check-availability', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['eventCreator', 'usuario', 'adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield advancedSearchController.checkMusicianAvailability(req, res);
}));
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
 *                   maxDistance:
 *                     type: number
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/update-status/:musicianId', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['musico', 'adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield advancedSearchController.updateMusicianStatus(req, res);
}));
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
router.post('/heartbeat/:musicianId', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['musico']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield advancedSearchController.musicianHeartbeat(req, res);
}));
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
 *         description: Fecha para consultar disponibilidad (opcional, por defecto hoy)
 *     responses:
 *       200:
 *         description: Disponibilidad obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                     busySlots:
 *                       type: array
 *                       items:
 *                         type: object
 *                     availableSlots:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/daily-availability/:musicianId', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['musico', 'eventCreator', 'usuario', 'adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield advancedSearchController.getDailyAvailability(req, res);
}));
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
 *                 example: "wedding"
 *               duration:
 *                 type: number
 *                 description: Duración en minutos
 *                 example: 120
 *               location:
 *                 type: string
 *                 description: Ubicación del evento
 *                 example: "Madrid"
 *               eventDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora del evento
 *                 example: "2024-12-25T20:00:00Z"
 *               instrument:
 *                 type: string
 *                 description: Instrumento
 *                 example: "guitarra"
 *               isUrgent:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Tarifa calculada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     baseRate:
 *                       type: number
 *                     finalRate:
 *                       type: number
 *                     breakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                     factors:
 *                       type: object
 *                     recommendations:
 *                       type: object
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/calculate-rate', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['eventCreator', 'usuario', 'adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield advancedSearchController.calculateMusicianRate(req, res);
}));
exports.default = router;
