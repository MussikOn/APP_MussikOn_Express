"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const joi_1 = __importDefault(require("joi"));
const geolocationController_1 = require("../controllers/geolocationController");
const router = (0, express_1.Router)();
// DTOs para validación
const coordinatesDTO = joi_1.default.object({
    lat: joi_1.default.number().min(-90).max(90).required(),
    lng: joi_1.default.number().min(-180).max(180).required(),
});
const geocodeAddressDTO = joi_1.default.object({
    address: joi_1.default.string().required().min(3).max(200),
});
const reverseGeocodeDTO = joi_1.default.object({
    lat: joi_1.default.number().min(-90).max(90).required(),
    lng: joi_1.default.number().min(-180).max(180).required(),
});
const calculateDistanceDTO = joi_1.default.object({
    point1: coordinatesDTO.required(),
    point2: coordinatesDTO.required(),
});
const isWithinRadiusDTO = joi_1.default.object({
    center: coordinatesDTO.required(),
    point: coordinatesDTO.required(),
    radius: joi_1.default.number().positive().required(),
});
const optimizeRouteDTO = joi_1.default.object({
    startLocation: coordinatesDTO.required(),
    destinations: joi_1.default.array().items(coordinatesDTO).min(1).required(),
    mode: joi_1.default.string().valid('driving', 'walking', 'transit').required(),
    optimize: joi_1.default.boolean().default(false),
});
/**
 * @swagger
 * /geolocation/proximity:
 *   get:
 *     summary: Buscar ubicaciones por proximidad
 *     tags: [Geolocalización]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitud del centro de búsqueda
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitud del centro de búsqueda
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         required: true
 *         description: Radio de búsqueda en kilómetros
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [event, user, venue, all]
 *         description: Tipo de ubicación a buscar
 *       - in: query
 *         name: instrument
 *         schema:
 *           type: string
 *         description: Instrumento requerido
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Tipo de evento
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Número máximo de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *         description: Desplazamiento para paginación
 *     responses:
 *       200:
 *         description: Ubicaciones encontradas
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
 *                     locations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           address:
 *                             type: string
 *                           coordinates:
 *                             type: object
 *                             properties:
 *                               lat:
 *                                 type: number
 *                               lng:
 *                                 type: number
 *                           distance:
 *                             type: number
 *                     total:
 *                       type: number
 */
router.get('/proximity', authMiddleware_1.authMiddleware, geolocationController_1.searchByProximityController);
/**
 * @swagger
 * /geolocation/nearby-events:
 *   get:
 *     summary: Buscar eventos cercanos
 *     tags: [Geolocalización]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitud del centro de búsqueda
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitud del centro de búsqueda
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         required: true
 *         description: Radio de búsqueda en kilómetros
 *       - in: query
 *         name: instrument
 *         schema:
 *           type: string
 *         description: Instrumento requerido
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Tipo de evento
 *     responses:
 *       200:
 *         description: Eventos cercanos encontrados
 */
router.get('/nearby-events', authMiddleware_1.authMiddleware, geolocationController_1.findNearbyEventsController);
/**
 * @swagger
 * /geolocation/nearby-musicians:
 *   get:
 *     summary: Buscar músicos cercanos
 *     tags: [Geolocalización]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitud del centro de búsqueda
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitud del centro de búsqueda
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         required: true
 *         description: Radio de búsqueda en kilómetros
 *       - in: query
 *         name: instrument
 *         schema:
 *           type: string
 *         description: Instrumento del músico
 *       - in: query
 *         name: specialties
 *         schema:
 *           type: string
 *         description: Especialidades del músico
 *     responses:
 *       200:
 *         description: Músicos cercanos encontrados
 */
router.get('/nearby-musicians', authMiddleware_1.authMiddleware, geolocationController_1.findNearbyMusiciansController);
/**
 * @swagger
 * /geolocation/optimize-route:
 *   post:
 *     summary: Optimizar ruta para múltiples destinos
 *     tags: [Geolocalización]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               destinations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                     lng:
 *                       type: number
 *               mode:
 *                 type: string
 *                 enum: [driving, walking, transit]
 *               optimize:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Ruta optimizada
 */
router.post('/optimize-route', authMiddleware_1.authMiddleware, (0, validationMiddleware_1.validate)(optimizeRouteDTO), geolocationController_1.optimizeRouteController);
/**
 * @swagger
 * /geolocation/geocode:
 *   post:
 *     summary: Geocodificar dirección a coordenadas
 *     tags: [Geolocalización]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coordenadas obtenidas
 */
router.post('/geocode', authMiddleware_1.authMiddleware, (0, validationMiddleware_1.validate)(geocodeAddressDTO), geolocationController_1.geocodeAddressController);
/**
 * @swagger
 * /geolocation/reverse-geocode:
 *   post:
 *     summary: Geocodificar coordenadas a dirección
 *     tags: [Geolocalización]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       200:
 *         description: Dirección obtenida
 */
router.post('/reverse-geocode', authMiddleware_1.authMiddleware, (0, validationMiddleware_1.validate)(reverseGeocodeDTO), geolocationController_1.reverseGeocodeController);
/**
 * @swagger
 * /geolocation/calculate-distance:
 *   post:
 *     summary: Calcular distancia entre dos puntos
 *     tags: [Geolocalización]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               point1:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               point2:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       200:
 *         description: Distancia calculada
 */
router.post('/calculate-distance', authMiddleware_1.authMiddleware, (0, validationMiddleware_1.validate)(calculateDistanceDTO), geolocationController_1.calculateDistanceController);
/**
 * @swagger
 * /geolocation/stats:
 *   get:
 *     summary: Obtener estadísticas de ubicaciones
 *     tags: [Geolocalización]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de ubicaciones
 */
router.get('/stats', authMiddleware_1.authMiddleware, geolocationController_1.getLocationStatsController);
/**
 * @swagger
 * /geolocation/within-radius:
 *   post:
 *     summary: Verificar si un punto está dentro del radio
 *     tags: [Geolocalización]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               center:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               point:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               radius:
 *                 type: number
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 */
router.post('/within-radius', authMiddleware_1.authMiddleware, (0, validationMiddleware_1.validate)(isWithinRadiusDTO), geolocationController_1.isWithinRadiusController);
exports.default = router;
