import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import Joi from 'joi';
import {
  searchByProximityController,
  findNearbyEventsController,
  findNearbyMusiciansController,
  optimizeRouteController,
  geocodeAddressController,
  reverseGeocodeController,
  calculateDistanceController,
  getLocationStatsController,
  isWithinRadiusController,
} from '../controllers/geolocationController';

const router = Router();

// DTOs para validación
const coordinatesDTO = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
});

const geocodeAddressDTO = Joi.object({
  address: Joi.string().required().min(3).max(200),
});

const reverseGeocodeDTO = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
});

const calculateDistanceDTO = Joi.object({
  point1: coordinatesDTO.required(),
  point2: coordinatesDTO.required(),
});

const isWithinRadiusDTO = Joi.object({
  center: coordinatesDTO.required(),
  point: coordinatesDTO.required(),
  radius: Joi.number().positive().required(),
});

const optimizeRouteDTO = Joi.object({
  startLocation: coordinatesDTO.required(),
  destinations: Joi.array().items(coordinatesDTO).min(1).required(),
  mode: Joi.string().valid('driving', 'walking', 'transit').required(),
  optimize: Joi.boolean().default(false),
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
router.get('/proximity', authMiddleware, searchByProximityController);

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
router.get('/nearby-events', authMiddleware, findNearbyEventsController);

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
router.get('/nearby-musicians', authMiddleware, findNearbyMusiciansController);

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
router.post(
  '/optimize-route',
  authMiddleware,
  validate(optimizeRouteDTO),
  optimizeRouteController
);

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
router.post(
  '/geocode',
  authMiddleware,
  validate(geocodeAddressDTO),
  geocodeAddressController
);

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
router.post(
  '/reverse-geocode',
  authMiddleware,
  validate(reverseGeocodeDTO),
  reverseGeocodeController
);

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
router.post(
  '/calculate-distance',
  authMiddleware,
  validate(calculateDistanceDTO),
  calculateDistanceController
);

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
router.get('/stats', authMiddleware, getLocationStatsController);

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
router.post(
  '/within-radius',
  authMiddleware,
  validate(isWithinRadiusDTO),
  isWithinRadiusController
);

export default router;
