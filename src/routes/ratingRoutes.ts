import { Router } from 'express';
import { ratingController } from '../controllers/ratingController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del rating
 *         eventId:
 *           type: string
 *           description: ID del evento
 *         musicianId:
 *           type: string
 *           description: ID del músico
 *         eventCreatorId:
 *           type: string
 *           description: ID del creador del evento
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Calificación de 1 a 5 estrellas
 *         review:
 *           type: string
 *           description: Comentario del rating
 *         category:
 *           type: string
 *           enum: [musician, event_creator]
 *           description: Categoría del rating
 *         isVerified:
 *           type: boolean
 *           description: Si el rating está verificado
 *         isActive:
 *           type: boolean
 *           description: Si el rating está activo
 *         helpfulCount:
 *           type: number
 *           description: Número de veces marcado como útil
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Crear un nuevo rating
 *     description: Permite a un usuario crear un rating para un músico o creador de evento
 *     tags: [Ratings]
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
 *               - musicianId
 *               - rating
 *               - category
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID del evento
 *               musicianId:
 *                 type: string
 *                 description: ID del músico
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Calificación de 1 a 5 estrellas
 *               review:
 *                 type: string
 *                 description: Comentario opcional
 *               category:
 *                 type: string
 *                 enum: [musician, event_creator]
 *                 description: Categoría del rating
 *     responses:
 *       201:
 *         description: Rating creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', authMiddleware, ratingController.createRating);

/**
 * @swagger
 * /ratings/user/{userId}/{category}:
 *   get:
 *     summary: Obtener ratings de un usuario
 *     description: Obtiene todos los ratings de un usuario específico
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [musician, event_creator]
 *         description: Categoría del rating
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: Rating mínimo para filtrar
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: Rating máximo para filtrar
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filtrar por ratings verificados
 *     responses:
 *       200:
 *         description: Ratings obtenidos exitosamente
 *       400:
 *         description: Parámetros inválidos
 */
router.get('/user/:userId/:category', ratingController.getUserRatings);

/**
 * @swagger
 * /ratings/user/{userId}/{category}/stats:
 *   get:
 *     summary: Obtener estadísticas de rating de un usuario
 *     description: Obtiene estadísticas agregadas de los ratings de un usuario
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [musician, event_creator]
 *         description: Categoría del rating
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       400:
 *         description: Parámetros inválidos
 */
router.get('/user/:userId/:category/stats', ratingController.getUserRatingStats);

/**
 * @swagger
 * /ratings/{ratingId}:
 *   put:
 *     summary: Actualizar un rating
 *     description: Permite actualizar un rating existente
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del rating
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Nueva calificación
 *               review:
 *                 type: string
 *                 description: Nuevo comentario
 *               isActive:
 *                 type: boolean
 *                 description: Estado activo del rating
 *     responses:
 *       200:
 *         description: Rating actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para actualizar este rating
 *       404:
 *         description: Rating no encontrado
 */
router.put('/:ratingId', authMiddleware, ratingController.updateRating);

/**
 * @swagger
 * /ratings/{ratingId}/helpful:
 *   post:
 *     summary: Marcar rating como útil
 *     description: Marca un rating como útil
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del rating
 *     responses:
 *       200:
 *         description: Rating marcado como útil exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Rating no encontrado
 */
router.post('/:ratingId/helpful', authMiddleware, ratingController.markRatingAsHelpful);

/**
 * @swagger
 * /ratings/{ratingId}/report:
 *   post:
 *     summary: Reportar un rating
 *     description: Reporta un rating inapropiado
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del rating
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Razón del reporte
 *     responses:
 *       200:
 *         description: Rating reportado exitosamente
 *       400:
 *         description: Razón requerida
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Rating no encontrado
 */
router.post('/:ratingId/report', authMiddleware, ratingController.reportRating);

/**
 * @swagger
 * /ratings/event/{eventId}:
 *   get:
 *     summary: Obtener ratings de un evento
 *     description: Obtiene todos los ratings relacionados con un evento específico
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Ratings del evento obtenidos exitosamente
 *       400:
 *         description: ID de evento requerido
 */
router.get('/event/:eventId', ratingController.getEventRatings);

/**
 * @swagger
 * /ratings/top-musicians:
 *   get:
 *     summary: Obtener top músicos por rating
 *     description: Obtiene la lista de músicos mejor calificados
 *     tags: [Ratings]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Número máximo de músicos a retornar
 *       - in: query
 *         name: minRatings
 *         schema:
 *           type: number
 *           default: 5
 *         description: Número mínimo de ratings requeridos
 *     responses:
 *       200:
 *         description: Top músicos obtenidos exitosamente
 */
router.get('/top-musicians', ratingController.getTopRatedMusicians);

/**
 * @swagger
 * /ratings/trends:
 *   get:
 *     summary: Obtener tendencias de rating
 *     description: Obtiene tendencias de ratings en el tiempo
 *     tags: [Ratings]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *           default: 30
 *         description: Número de días para analizar
 *     responses:
 *       200:
 *         description: Tendencias obtenidas exitosamente
 */
router.get('/trends', ratingController.getRatingTrends);

/**
 * @swagger
 * /ratings/user/{userId}/{category}/helpful:
 *   get:
 *     summary: Obtener ratings más útiles de un usuario
 *     description: Obtiene los ratings más útiles de un usuario específico
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [musician, event_creator]
 *         description: Categoría del rating
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 5
 *         description: Número máximo de ratings a retornar
 *     responses:
 *       200:
 *         description: Ratings más útiles obtenidos exitosamente
 *       400:
 *         description: Parámetros inválidos
 */
router.get('/user/:userId/:category/helpful', ratingController.getMostHelpfulRatings);

export default router; 