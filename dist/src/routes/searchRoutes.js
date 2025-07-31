"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const searchController_1 = require("../controllers/searchController");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Endpoints de búsqueda avanzada y filtros
 */
/**
 * @swagger
 * /search/events:
 *   get:
 *     tags: [Search]
 *     summary: Búsqueda avanzada de eventos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Término de búsqueda en texto
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending_musician, musician_assigned, completed, cancelled, musician_cancelled]
 *         description: Estado del evento
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [concierto, boda, culto, evento_corporativo, festival, fiesta_privada, graduacion, cumpleanos, otro]
 *         description: Tipo de evento
 *       - in: query
 *         name: instrument
 *         schema:
 *           type: string
 *           enum: [guitarra, piano, bajo, bateria, saxofon, trompeta, violin, canto, teclado, flauta, otro]
 *         description: Instrumento requerido
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Ubicación
 *       - in: query
 *         name: budget
 *         schema:
 *           type: number
 *         description: Presupuesto mínimo
 *       - in: query
 *         name: budgetMax
 *         schema:
 *           type: number
 *         description: Presupuesto máximo
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de resultados por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de resultados a omitir
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, date, eventName]
 *           default: createdAt
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Parámetros de búsqueda inválidos
 */
router.get('/events', authMiddleware_1.authMiddleware, validationMiddleware_1.validatePagination, searchController_1.searchEventsController);
/**
 * @swagger
 * /search/musician-requests:
 *   get:
 *     tags: [Search]
 *     summary: Búsqueda avanzada de solicitudes de músicos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Término de búsqueda en texto
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendiente, asignada, cancelada, completada, no_asignada]
 *         description: Estado de la solicitud
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [concierto, boda, culto, evento_corporativo, festival, fiesta_privada, graduacion, cumpleanos, otro]
 *         description: Tipo de evento
 *       - in: query
 *         name: instrument
 *         schema:
 *           type: string
 *           enum: [guitarra, piano, bajo, bateria, saxofon, trompeta, violin, canto, teclado, flauta, otro]
 *         description: Instrumento requerido
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Ubicación
 *       - in: query
 *         name: budget
 *         schema:
 *           type: number
 *         description: Presupuesto mínimo
 *       - in: query
 *         name: budgetMax
 *         schema:
 *           type: number
 *         description: Presupuesto máximo
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de resultados por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de resultados a omitir
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, date, eventName]
 *           default: createdAt
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MusicianRequest'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Parámetros de búsqueda inválidos
 */
router.get('/musician-requests', authMiddleware_1.authMiddleware, validationMiddleware_1.validatePagination, searchController_1.searchMusicianRequestsController);
/**
 * @swagger
 * /search/users:
 *   get:
 *     tags: [Search]
 *     summary: Búsqueda avanzada de usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Término de búsqueda en texto
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, musician, admin, super_admin]
 *         description: Rol del usuario
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Ubicación
 *       - in: query
 *         name: instrument
 *         schema:
 *           type: string
 *           enum: [guitarra, piano, bajo, bateria, saxofon, trompeta, violin, canto, teclado, flauta, otro]
 *         description: Instrumento (solo para músicos)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de resultados por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de resultados a omitir
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, name, email]
 *           default: createdAt
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Parámetros de búsqueda inválidos
 */
router.get('/users', authMiddleware_1.authMiddleware, validationMiddleware_1.validatePagination, searchController_1.searchUsersController);
/**
 * @swagger
 * /search/global:
 *   get:
 *     tags: [Search]
 *     summary: Búsqueda global en toda la plataforma
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Término de búsqueda
 *       - in: query
 *         name: types
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [events, users, musician-requests]
 *         description: Tipos de contenido a buscar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de resultados por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de resultados a omitir
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [relevance, createdAt, updatedAt]
 *           default: relevance
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Resultados de búsqueda global
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     musicianRequests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MusicianRequest'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Parámetros de búsqueda inválidos
 */
router.get('/global', authMiddleware_1.authMiddleware, validationMiddleware_1.validatePagination, searchController_1.globalSearchController);
/**
 * @swagger
 * /search/location:
 *   get:
 *     tags: [Search]
 *     summary: Búsqueda por ubicación geográfica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         required: true
 *         description: Latitud
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         required: true
 *         description: Longitud
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           minimum: 0.1
 *           maximum: 100
 *           default: 10
 *         description: Radio de búsqueda en kilómetros
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [events, users, all]
 *           default: all
 *         description: Tipo de contenido a buscar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de resultados por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de resultados a omitir
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [distance, createdAt, updatedAt]
 *           default: distance
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Resultados de búsqueda por ubicación
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Parámetros de búsqueda inválidos
 */
router.get('/location', authMiddleware_1.authMiddleware, validationMiddleware_1.validatePagination, searchController_1.searchByLocationController);
/**
 * @swagger
 * /search/available-events:
 *   get:
 *     tags: [Search]
 *     summary: Buscar eventos disponibles para un músico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: instrument
 *         schema:
 *           type: string
 *           enum: [guitarra, piano, bajo, bateria, saxofon, trompeta, violin, canto, teclado, flauta, otro]
 *         description: Instrumento del músico
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Ubicación
 *       - in: query
 *         name: budget
 *         schema:
 *           type: number
 *         description: Presupuesto mínimo
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de resultados por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de resultados a omitir
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, budget, createdAt]
 *           default: date
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Eventos disponibles para el músico
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Parámetros de búsqueda inválidos
 */
router.get('/available-events', authMiddleware_1.authMiddleware, validationMiddleware_1.validatePagination, searchController_1.searchAvailableEventsForMusicianController);
/**
 * @swagger
 * /search/available-musicians:
 *   get:
 *     tags: [Search]
 *     summary: Buscar músicos disponibles para un evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del evento
 *       - in: query
 *         name: instrument
 *         schema:
 *           type: string
 *           enum: [guitarra, piano, bajo, bateria, saxofon, trompeta, violin, canto, teclado, flauta, otro]
 *         description: Instrumento requerido
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Ubicación preferida
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de resultados por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de resultados a omitir
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [rating, experience, distance]
 *           default: rating
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Músicos disponibles para el evento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Parámetros de búsqueda inválidos
 */
router.get('/available-musicians', authMiddleware_1.authMiddleware, validationMiddleware_1.validatePagination, searchController_1.searchAvailableMusiciansForEventController);
exports.default = router;
