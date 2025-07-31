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
exports.exportReportController = exports.getDashboardController = exports.getTopActiveUsersReportController = exports.getLocationPerformanceReportController = exports.getTrendsReportController = exports.getPlatformAnalyticsController = exports.getUserAnalyticsController = exports.getRequestAnalyticsController = exports.getEventAnalyticsController = void 0;
const analyticsService_1 = require("../services/analyticsService");
const loggerService_1 = require("../services/loggerService");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Analytics de eventos
 */
exports.getEventAnalyticsController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const filters = {
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        eventType: req.query.eventType,
        status: req.query.status,
        location: req.query.location
    };
    loggerService_1.logger.info('Solicitud de analytics de eventos', {
        metadata: { filters, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail }
    });
    const analytics = yield analyticsService_1.analyticsService.getEventAnalytics(filters);
    loggerService_1.logger.info('Analytics de eventos completado', {
        metadata: {
            totalEvents: analytics.totalEvents,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail
        }
    });
    res.json({
        success: true,
        data: analytics
    });
}));
/**
 * Analytics de solicitudes de músicos
 */
exports.getRequestAnalyticsController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const filters = {
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        eventType: req.query.eventType,
        status: req.query.status,
        location: req.query.location
    };
    loggerService_1.logger.info('Solicitud de analytics de solicitudes', {
        metadata: { filters, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail }
    });
    const analytics = yield analyticsService_1.analyticsService.getRequestAnalytics(filters);
    loggerService_1.logger.info('Analytics de solicitudes completado', {
        metadata: {
            totalRequests: analytics.totalRequests,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail
        }
    });
    res.json({
        success: true,
        data: analytics
    });
}));
/**
 * Analytics de usuarios
 */
exports.getUserAnalyticsController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const filters = {
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        userRole: req.query.userRole
    };
    loggerService_1.logger.info('Solicitud de analytics de usuarios', {
        metadata: { filters, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail }
    });
    const analytics = yield analyticsService_1.analyticsService.getUserAnalytics(filters);
    loggerService_1.logger.info('Analytics de usuarios completado', {
        metadata: {
            totalUsers: analytics.totalUsers,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail
        }
    });
    res.json({
        success: true,
        data: analytics
    });
}));
/**
 * Analytics de la plataforma completa
 */
exports.getPlatformAnalyticsController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const filters = {
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        eventType: req.query.eventType,
        status: req.query.status,
        userRole: req.query.userRole,
        location: req.query.location
    };
    loggerService_1.logger.info('Solicitud de analytics de plataforma', {
        metadata: { filters, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail }
    });
    const analytics = yield analyticsService_1.analyticsService.getPlatformAnalytics(filters);
    loggerService_1.logger.info('Analytics de plataforma completado', {
        metadata: {
            totalRevenue: analytics.totalRevenue,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail
        }
    });
    res.json({
        success: true,
        data: analytics
    });
}));
/**
 * Reporte de tendencias
 */
exports.getTrendsReportController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const months = parseInt(req.query.months) || 6;
    loggerService_1.logger.info('Solicitud de reporte de tendencias', {
        metadata: { months, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail }
    });
    const trends = yield analyticsService_1.analyticsService.getTrendsReport(months);
    loggerService_1.logger.info('Reporte de tendencias completado', {
        metadata: {
            months,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail
        }
    });
    res.json({
        success: true,
        data: trends
    });
}));
/**
 * Reporte de rendimiento por ubicación
 */
exports.getLocationPerformanceReportController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    loggerService_1.logger.info('Solicitud de reporte de rendimiento por ubicación', {
        metadata: { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail }
    });
    const performance = yield analyticsService_1.analyticsService.getLocationPerformanceReport();
    loggerService_1.logger.info('Reporte de rendimiento por ubicación completado', {
        metadata: {
            locationsCount: performance.length,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail
        }
    });
    res.json({
        success: true,
        data: performance
    });
}));
/**
 * Reporte de usuarios más activos
 */
exports.getTopActiveUsersReportController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const limit = parseInt(req.query.limit) || 10;
    loggerService_1.logger.info('Solicitud de reporte de usuarios más activos', {
        metadata: { limit, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail }
    });
    const users = yield analyticsService_1.analyticsService.getTopActiveUsersReport(limit);
    loggerService_1.logger.info('Reporte de usuarios más activos completado', {
        metadata: {
            usersCount: users.length,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail
        }
    });
    res.json({
        success: true,
        data: users
    });
}));
/**
 * Dashboard de analytics completo
 */
exports.getDashboardController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const filters = {
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo
    };
    loggerService_1.logger.info('Solicitud de dashboard de analytics', {
        metadata: { filters, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail }
    });
    const [eventAnalytics, requestAnalytics, userAnalytics, platformAnalytics, trends] = yield Promise.all([
        analyticsService_1.analyticsService.getEventAnalytics(filters),
        analyticsService_1.analyticsService.getRequestAnalytics(filters),
        analyticsService_1.analyticsService.getUserAnalytics(filters),
        analyticsService_1.analyticsService.getPlatformAnalytics(filters),
        analyticsService_1.analyticsService.getTrendsReport(6)
    ]);
    loggerService_1.logger.info('Dashboard de analytics completado', {
        metadata: {
            totalEvents: eventAnalytics.totalEvents,
            totalRequests: requestAnalytics.totalRequests,
            totalUsers: userAnalytics.totalUsers,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail
        }
    });
    res.json({
        success: true,
        data: {
            events: eventAnalytics,
            requests: requestAnalytics,
            users: userAnalytics,
            platform: platformAnalytics,
            trends
        }
    });
}));
/**
 * Exportar reporte en formato CSV
 */
exports.exportReportController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { type, format } = req.query;
    const filters = {
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        eventType: req.query.eventType,
        status: req.query.status,
        userRole: req.query.userRole,
        location: req.query.location
    };
    loggerService_1.logger.info('Solicitud de exportación de reporte', {
        metadata: { type, format, filters, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail }
    });
    let data;
    let filename;
    switch (type) {
        case 'events':
            data = yield analyticsService_1.analyticsService.getEventAnalytics(filters);
            filename = `eventos_analytics_${new Date().toISOString().split('T')[0]}.csv`;
            break;
        case 'requests':
            data = yield analyticsService_1.analyticsService.getRequestAnalytics(filters);
            filename = `solicitudes_analytics_${new Date().toISOString().split('T')[0]}.csv`;
            break;
        case 'users':
            data = yield analyticsService_1.analyticsService.getUserAnalytics(filters);
            filename = `usuarios_analytics_${new Date().toISOString().split('T')[0]}.csv`;
            break;
        case 'platform':
            data = yield analyticsService_1.analyticsService.getPlatformAnalytics(filters);
            filename = `plataforma_analytics_${new Date().toISOString().split('T')[0]}.csv`;
            break;
        case 'trends':
            data = yield analyticsService_1.analyticsService.getTrendsReport(6);
            filename = `tendencias_${new Date().toISOString().split('T')[0]}.csv`;
            break;
        case 'location':
            data = yield analyticsService_1.analyticsService.getLocationPerformanceReport();
            filename = `rendimiento_ubicacion_${new Date().toISOString().split('T')[0]}.csv`;
            break;
        default:
            throw new Error('Tipo de reporte no válido');
    }
    // Convertir a CSV (implementación básica)
    const csvData = convertToCSV(data);
    loggerService_1.logger.info('Exportación de reporte completada', {
        metadata: {
            type,
            format,
            filename,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail
        }
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
}));
/**
 * Función auxiliar para convertir datos a CSV
 */
function convertToCSV(data) {
    if (Array.isArray(data)) {
        if (data.length === 0)
            return '';
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value}"` : value;
            });
            csvRows.push(values.join(','));
        }
        return csvRows.join('\n');
    }
    else {
        // Para objetos simples, convertir a formato clave-valor
        const rows = Object.entries(data).map(([key, value]) => `${key},${value}`);
        return `Metrica,Valor\n${rows.join('\n')}`;
    }
}
