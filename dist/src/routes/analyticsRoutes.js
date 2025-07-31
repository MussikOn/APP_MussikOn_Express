"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminOnly_1 = require("../middleware/adminOnly");
const analyticsController_1 = require("../controllers/analyticsController");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Endpoints de analytics, reportes y métricas de la plataforma
 */
/**
 * @swagger
 * /analytics/events:
 *   get:
 *     tags: [Analytics]
 *     summary: Analytics de eventos
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Tipo de evento
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Estado del evento
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Ubicación
 *     responses:
 *       200:
 *         description: Analytics de eventos
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
 *                     totalEvents:
 *                       type: integer
 *                     eventsByStatus:
 *                       type: object
 *                     eventsByType:
 *                       type: object
 *                     eventsByMonth:
 *                       type: object
 *                     averageBudget:
 *                       type: number
 *                     totalBudget:
 *                       type: number
 *                     completionRate:
 *                       type: number
 *                     cancellationRate:
 *                       type: number
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/events', authMiddleware_1.authMiddleware, (0, adminOnly_1.requireRole)('admin', 'superadmin', 'eventCreator', 'organizador'), analyticsController_1.getEventAnalyticsController);
/**
 * @swagger
 * /analytics/requests:
 *   get:
 *     tags: [Analytics]
 *     summary: Analytics de solicitudes de músicos
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Tipo de evento
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Estado de la solicitud
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Ubicación
 *     responses:
 *       200:
 *         description: Analytics de solicitudes
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
 *                     totalRequests:
 *                       type: integer
 *                     requestsByStatus:
 *                       type: object
 *                     requestsByType:
 *                       type: object
 *                     requestsByMonth:
 *                       type: object
 *                     averageBudget:
 *                       type: number
 *                     totalBudget:
 *                       type: number
 *                     acceptanceRate:
 *                       type: number
 *                     averageResponseTime:
 *                       type: number
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/requests', authMiddleware_1.authMiddleware, (0, adminOnly_1.requireRole)('admin', 'superadmin', 'eventCreator', 'organizador'), analyticsController_1.getRequestAnalyticsController);
/**
 * @swagger
 * /analytics/users:
 *   get:
 *     tags: [Analytics]
 *     summary: Analytics de usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: userRole
 *         schema:
 *           type: string
 *         description: Rol de usuario
 *     responses:
 *       200:
 *         description: Analytics de usuarios
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
 *                     totalUsers:
 *                       type: integer
 *                     usersByRole:
 *                       type: object
 *                     usersByMonth:
 *                       type: object
 *                     activeUsers:
 *                       type: integer
 *                     newUsersThisMonth:
 *                       type: integer
 *                     userGrowthRate:
 *                       type: number
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/users', authMiddleware_1.authMiddleware, (0, adminOnly_1.requireRole)('admin', 'superadmin'), analyticsController_1.getUserAnalyticsController);
/**
 * @swagger
 * /analytics/platform:
 *   get:
 *     tags: [Analytics]
 *     summary: Analytics de la plataforma completa
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Tipo de evento
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Estado
 *       - in: query
 *         name: userRole
 *         schema:
 *           type: string
 *         description: Rol de usuario
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Ubicación
 *     responses:
 *       200:
 *         description: Analytics de la plataforma
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
 *                     totalRevenue:
 *                       type: number
 *                     averageEventValue:
 *                       type: number
 *                     topEventTypes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           revenue:
 *                             type: number
 *                     topLocations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           location:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           revenue:
 *                             type: number
 *                     userEngagement:
 *                       type: object
 *                       properties:
 *                         eventsPerUser:
 *                           type: number
 *                         requestsPerUser:
 *                           type: number
 *                         averageSessionDuration:
 *                           type: number
 *                     performance:
 *                       type: object
 *                       properties:
 *                         averageResponseTime:
 *                           type: number
 *                         successRate:
 *                           type: number
 *                         errorRate:
 *                           type: number
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/platform', authMiddleware_1.authMiddleware, (0, adminOnly_1.requireRole)('admin', 'superadmin', 'eventCreator', 'organizador'), analyticsController_1.getPlatformAnalyticsController);
/**
 * @swagger
 * /analytics/trends:
 *   get:
 *     tags: [Analytics]
 *     summary: Reporte de tendencias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Número de meses a analizar
 *     responses:
 *       200:
 *         description: Reporte de tendencias
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
 *                     eventTrends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           revenue:
 *                             type: number
 *                     requestTrends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           acceptanceRate:
 *                             type: number
 *                     userTrends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                           newUsers:
 *                             type: integer
 *                           activeUsers:
 *                             type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/trends', authMiddleware_1.authMiddleware, (0, adminOnly_1.requireRole)('admin', 'superadmin', 'eventCreator', 'organizador'), analyticsController_1.getTrendsReportController);
/**
 * @swagger
 * /analytics/location-performance:
 *   get:
 *     tags: [Analytics]
 *     summary: Reporte de rendimiento por ubicación
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte de rendimiento por ubicación
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
 *                     type: object
 *                     properties:
 *                       location:
 *                         type: string
 *                       totalEvents:
 *                         type: integer
 *                       totalRequests:
 *                         type: integer
 *                       totalRevenue:
 *                         type: number
 *                       averageEventValue:
 *                         type: number
 *                       completionRate:
 *                         type: number
 *                       acceptanceRate:
 *                         type: number
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/location-performance', authMiddleware_1.authMiddleware, (0, adminOnly_1.requireRole)('admin', 'superadmin'), analyticsController_1.getLocationPerformanceReportController);
/**
 * @swagger
 * /analytics/top-users:
 *   get:
 *     tags: [Analytics]
 *     summary: Reporte de usuarios más activos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de usuarios a mostrar
 *     responses:
 *       200:
 *         description: Reporte de usuarios más activos
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
 *                     type: object
 *                     properties:
 *                       user:
 *                         $ref: '#/components/schemas/User'
 *                       eventsCreated:
 *                         type: integer
 *                       requestsCreated:
 *                         type: integer
 *                       eventsCompleted:
 *                         type: integer
 *                       requestsAccepted:
 *                         type: integer
 *                       totalRevenue:
 *                         type: number
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/top-users', authMiddleware_1.authMiddleware, (0, adminOnly_1.requireRole)('admin', 'superadmin'), analyticsController_1.getTopActiveUsersReportController);
/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Dashboard de analytics completo
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Dashboard completo de analytics
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
 *                       type: object
 *                     requests:
 *                       type: object
 *                     users:
 *                       type: object
 *                     platform:
 *                       type: object
 *                     trends:
 *                       type: object
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/dashboard', authMiddleware_1.authMiddleware, (0, adminOnly_1.requireRole)('admin', 'superadmin', 'eventCreator', 'organizador'), analyticsController_1.getDashboardController);
/**
 * @swagger
 * /analytics/export:
 *   get:
 *     tags: [Analytics]
 *     summary: Exportar reporte en formato CSV
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [events, requests, users, platform, trends, location]
 *         description: Tipo de reporte a exportar
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           default: csv
 *         description: Formato de exportación
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
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Tipo de evento
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Estado
 *       - in: query
 *         name: userRole
 *         schema:
 *           type: string
 *         description: Rol de usuario
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Ubicación
 *     responses:
 *       200:
 *         description: Archivo CSV descargado
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       400:
 *         description: Tipo de reporte no válido
 */
router.get('/export', authMiddleware_1.authMiddleware, (0, adminOnly_1.requireRole)('admin', 'superadmin'), analyticsController_1.exportReportController);
exports.default = router;
