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
exports.searchAvailableMusiciansForEventController = exports.searchAvailableEventsForMusicianController = exports.searchByLocationController = exports.globalSearchController = exports.searchUsersController = exports.searchMusicianRequestsController = exports.searchEventsController = void 0;
const searchService_1 = require("../services/searchService");
const loggerService_1 = require("../services/loggerService");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Búsqueda avanzada de eventos
 */
exports.searchEventsController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const filters = {
        query: req.query.query,
        status: req.query.status,
        eventType: req.query.eventType,
        instrument: req.query.instrument,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        location: req.query.location,
        budget: req.query.budget ? {
            min: parseInt(req.query.budget),
            max: parseInt(req.query.budgetMax)
        } : undefined,
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
    };
    loggerService_1.logger.info('Búsqueda de eventos iniciada', {
        metadata: { filters, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail }
    });
    const result = yield searchService_1.searchService.searchEvents(filters);
    loggerService_1.logger.info('Búsqueda de eventos completada', {
        metadata: {
            totalResults: result.total,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail
        }
    });
    res.json({
        success: true,
        data: result.data,
        pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            hasMore: result.hasMore
        }
    });
}));
/**
 * Búsqueda avanzada de solicitudes de músicos
 */
exports.searchMusicianRequestsController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const filters = {
        query: req.query.query,
        status: req.query.status,
        eventType: req.query.eventType,
        instrument: req.query.instrument,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        location: req.query.location,
        budget: req.query.budget ? {
            min: parseInt(req.query.budget),
            max: parseInt(req.query.budgetMax)
        } : undefined,
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
    };
    loggerService_1.logger.info('Búsqueda de solicitudes iniciada', {
        metadata: { filters, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail }
    });
    const result = yield searchService_1.searchService.searchMusicianRequests(filters);
    loggerService_1.logger.info('Búsqueda de solicitudes completada', {
        metadata: {
            totalResults: result.total,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail
        }
    });
    res.json({
        success: true,
        data: result.data,
        pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            hasMore: result.hasMore
        }
    });
}));
/**
 * Búsqueda avanzada de usuarios
 */
exports.searchUsersController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const filters = {
        query: req.query.query,
        userRole: req.query.userRole,
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
    };
    loggerService_1.logger.info('Búsqueda de usuarios iniciada', {
        metadata: { filters, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail }
    });
    const result = yield searchService_1.searchService.searchUsers(filters);
    loggerService_1.logger.info('Búsqueda de usuarios completada', {
        metadata: {
            totalResults: result.total,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail
        }
    });
    res.json({
        success: true,
        data: result.data,
        pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            hasMore: result.hasMore
        }
    });
}));
/**
 * Búsqueda global en todas las colecciones
 */
exports.globalSearchController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const filters = {
        query: req.query.query,
        status: req.query.status,
        eventType: req.query.eventType,
        instrument: req.query.instrument,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        location: req.query.location,
        userRole: req.query.userRole,
        limit: parseInt(req.query.limit) || 10,
        offset: parseInt(req.query.offset) || 0,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
    };
    loggerService_1.logger.info('Búsqueda global iniciada', {
        metadata: { filters, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail }
    });
    const result = yield searchService_1.searchService.globalSearch(filters);
    loggerService_1.logger.info('Búsqueda global completada', {
        metadata: {
            totalEvents: result.events.length,
            totalRequests: result.requests.length,
            totalUsers: result.users.length,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail
        }
    });
    res.json({
        success: true,
        data: {
            events: result.events,
            requests: result.requests,
            users: result.users
        },
        summary: {
            totalEvents: result.events.length,
            totalRequests: result.requests.length,
            totalUsers: result.users.length
        }
    });
}));
/**
 * Búsqueda por ubicación
 */
exports.searchByLocationController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { location, radius } = req.query;
    const searchRadius = parseInt(radius) || 50;
    loggerService_1.logger.info('Búsqueda por ubicación iniciada', {
        metadata: {
            location,
            radius: searchRadius,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail
        }
    });
    const result = yield searchService_1.searchService.searchByLocation(location, searchRadius);
    loggerService_1.logger.info('Búsqueda por ubicación completada', {
        metadata: {
            totalEvents: result.events.length,
            totalRequests: result.requests.length,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail
        }
    });
    res.json({
        success: true,
        data: {
            events: result.events,
            requests: result.requests
        },
        location: {
            searchLocation: location,
            radius: searchRadius
        }
    });
}));
/**
 * Búsqueda de eventos disponibles para músicos
 */
exports.searchAvailableEventsForMusicianController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const musicianId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
    const filters = {
        query: req.query.query,
        eventType: req.query.eventType,
        instrument: req.query.instrument,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        location: req.query.location,
        budget: req.query.budget ? {
            min: parseInt(req.query.budget),
            max: parseInt(req.query.budgetMax)
        } : undefined,
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
    };
    loggerService_1.logger.info('Búsqueda de eventos disponibles para músico iniciada', {
        metadata: { filters, musicianId }
    });
    const result = yield searchService_1.searchService.searchAvailableEventsForMusician(musicianId, filters);
    loggerService_1.logger.info('Búsqueda de eventos disponibles para músico completada', {
        metadata: {
            totalResults: result.total,
            musicianId
        }
    });
    res.json({
        success: true,
        data: result.data,
        pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            hasMore: result.hasMore
        }
    });
}));
/**
 * Búsqueda de músicos disponibles para un evento
 */
exports.searchAvailableMusiciansForEventController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { eventId } = req.params;
    const filters = {
        query: req.query.query,
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
    };
    loggerService_1.logger.info('Búsqueda de músicos disponibles para evento iniciada', {
        metadata: { filters, eventId, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail }
    });
    const result = yield searchService_1.searchService.searchAvailableMusiciansForEvent(eventId, filters);
    loggerService_1.logger.info('Búsqueda de músicos disponibles para evento completada', {
        metadata: {
            totalResults: result.total,
            eventId,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail
        }
    });
    res.json({
        success: true,
        data: result.data,
        pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            hasMore: result.hasMore
        }
    });
}));
