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
 *           enum: [createdAt, updatedAt, date, budget]
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
 *         name: userRole
 *         schema:
 *           type: string
 *           enum: [musico, eventCreator, usuario, adminJunior, adminMidLevel, adminSenior, superAdmin]
 *         description: Rol del usuario
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
 *           schema:
 *             type: string
 *             enum: [createdAt, updatedAt, name, userEmail]
 *             default: createdAt
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
 *     summary: Búsqueda global en todas las colecciones
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
 *         description: Estado (para eventos y solicitudes)
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Tipo de evento
 *       - in: query
 *         name: instrument
 *         schema:
 *           type: string
 *         description: Instrumento
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
 *         name: userRole
 *         schema:
 *           type: string
 *         description: Rol de usuario
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de resultados por colección
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
 *                     requests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MusicianRequest'
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalEvents:
 *                       type: integer
 *                     totalRequests:
 *                       type: integer
 *                     totalUsers:
 *                       type: integer
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
 *     summary: Búsqueda por ubicación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         required: true
 *         description: Ubicación a buscar
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Radio de búsqueda en kilómetros
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
 *                     requests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MusicianRequest'
 *                 location:
 *                   type: object
 *                   properties:
 *                     searchLocation:
 *                       type: string
 *                     radius:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Parámetros de búsqueda inválidos
 */
router.get('/location', authMiddleware_1.authMiddleware, searchController_1.searchByLocationController);
/**
 * @swagger
 * /search/available-events:
 *   get:
 *     tags: [Search]
 *     summary: Búsqueda de eventos disponibles para músicos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Término de búsqueda en texto
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Tipo de evento
 *       - in: query
 *         name: instrument
 *         schema:
 *           type: string
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
 * /search/available-musicians/{eventId}:
 *   get:
 *     tags: [Search]
 *     summary: Búsqueda de músicos disponibles para un evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Término de búsqueda en texto
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
 *           default: name
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
 *       404:
 *         description: Evento no encontrado
 */
router.get('/available-musicians/:eventId', authMiddleware_1.authMiddleware, validationMiddleware_1.validatePagination, searchController_1.searchAvailableMusiciansForEventController);
exports.default = router;
