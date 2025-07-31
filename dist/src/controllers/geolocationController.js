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
exports.isWithinRadiusController = exports.getLocationStatsController = exports.calculateDistanceController = exports.reverseGeocodeController = exports.geocodeAddressController = exports.optimizeRouteController = exports.findNearbyMusiciansController = exports.findNearbyEventsController = exports.searchByProximityController = void 0;
const geolocationService_1 = require("../services/geolocationService");
const loggerService_1 = require("../services/loggerService");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Buscar ubicaciones por proximidad
 */
exports.searchByProximityController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { lat, lng, radius, type, limit } = req.query;
    const center = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
    };
    const filters = {
        radius: parseFloat(radius),
        type: type,
        limit: limit ? parseInt(limit) : 20
    };
    const locations = yield geolocationService_1.geolocationService.searchByProximity(center, filters);
    loggerService_1.logger.info('Búsqueda por proximidad completada', {
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        metadata: { filters, results: locations.length }
    });
    res.status(200).json({
        success: true,
        data: {
            locations,
            filters,
            total: locations.length
        }
    });
}));
/**
 * Buscar eventos cercanos
 */
exports.findNearbyEventsController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { lat, lng, radius, limit } = req.query;
    const center = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
    };
    const events = yield geolocationService_1.geolocationService.findNearbyEvents(center, parseFloat(radius), limit ? parseInt(limit) : 20);
    loggerService_1.logger.info('Eventos cercanos encontrados', {
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        metadata: { center, radius, results: events.length }
    });
    res.status(200).json({
        success: true,
        data: {
            events,
            center,
            radius: parseFloat(radius),
            total: events.length
        }
    });
}));
/**
 * Buscar músicos cercanos
 */
exports.findNearbyMusiciansController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { lat, lng, radius, limit } = req.query;
    const center = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
    };
    const musicians = yield geolocationService_1.geolocationService.findNearbyMusicians(center, parseFloat(radius), limit ? parseInt(limit) : 20);
    loggerService_1.logger.info('Músicos cercanos encontrados', {
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        metadata: { center, radius, results: musicians.length }
    });
    res.status(200).json({
        success: true,
        data: {
            musicians,
            center,
            radius: parseFloat(radius),
            total: musicians.length
        }
    });
}));
/**
 * Optimizar ruta
 */
exports.optimizeRouteController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { waypoints, mode, avoid } = req.body;
    const routeData = {
        waypoints: waypoints.map((point) => ({
            latitude: point.latitude || point.lat,
            longitude: point.longitude || point.lng
        })),
        mode: mode || 'driving',
        avoid: avoid || []
    };
    const route = yield geolocationService_1.geolocationService.optimizeRoute(routeData);
    loggerService_1.logger.info('Ruta optimizada', {
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        metadata: { routeData, result: route }
    });
    res.status(200).json({
        success: true,
        data: route
    });
}));
/**
 * Geocodificar dirección
 */
exports.geocodeAddressController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { address, country } = req.body;
    const coordinates = yield geolocationService_1.geolocationService.geocodeAddress(address, country);
    loggerService_1.logger.info('Dirección geocodificada', {
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        metadata: { address, country, coordinates }
    });
    res.status(200).json({
        success: true,
        data: coordinates
    });
}));
/**
 * Geocodificación inversa
 */
exports.reverseGeocodeController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { lat, lng } = req.query;
    const coordinates = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
    };
    const address = yield geolocationService_1.geolocationService.reverseGeocode(coordinates);
    loggerService_1.logger.info('Geocodificación inversa completada', {
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        metadata: { coordinates, address }
    });
    res.status(200).json({
        success: true,
        data: address
    });
}));
/**
 * Calcular distancia entre dos puntos
 */
exports.calculateDistanceController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { lat1, lng1, lat2, lng2 } = req.query;
    const point1 = {
        latitude: parseFloat(lat1),
        longitude: parseFloat(lng1)
    };
    const point2 = {
        latitude: parseFloat(lat2),
        longitude: parseFloat(lng2)
    };
    const distance = geolocationService_1.geolocationService.calculateDistance(point1, point2);
    loggerService_1.logger.info('Distancia calculada', {
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        metadata: { point1, point2, distance }
    });
    res.status(200).json({
        success: true,
        data: {
            distance,
            unit: 'km'
        }
    });
}));
/**
 * Obtener estadísticas de ubicación
 */
exports.getLocationStatsController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { lat, lng, radius } = req.query;
    const center = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
    };
    const stats = yield geolocationService_1.geolocationService.getLocationStats(center, parseFloat(radius));
    loggerService_1.logger.info('Estadísticas de ubicación obtenidas', {
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        metadata: { center, radius, stats }
    });
    res.status(200).json({
        success: true,
        data: stats
    });
}));
/**
 * Verificar si un punto está dentro del radio
 */
exports.isWithinRadiusController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { centerLat, centerLng, pointLat, pointLng, radius } = req.query;
    const center = {
        latitude: parseFloat(centerLat),
        longitude: parseFloat(centerLng)
    };
    const point = {
        latitude: parseFloat(pointLat),
        longitude: parseFloat(pointLng)
    };
    const isWithin = geolocationService_1.geolocationService.isWithinRadius(center, point, parseFloat(radius));
    loggerService_1.logger.info('Verificación de radio completada', {
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        metadata: { center, point, radius, isWithin }
    });
    res.status(200).json({
        success: true,
        data: {
            isWithin,
            distance: geolocationService_1.geolocationService.calculateDistance(center, point),
            radius: parseFloat(radius)
        }
    });
}));
