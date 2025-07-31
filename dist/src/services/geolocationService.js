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
exports.geolocationService = exports.GeolocationService = void 0;
const firebase_1 = require("../utils/firebase");
const loggerService_1 = require("./loggerService");
class GeolocationService {
    constructor() {
        this.earthRadius = 6371; // Radio de la Tierra en kilómetros
    }
    /**
     * Calcular distancia entre dos puntos usando la fórmula de Haversine
     */
    calculateDistance(point1, point2) {
        const lat1 = this.toRadians(point1.latitude);
        const lon1 = this.toRadians(point1.longitude);
        const lat2 = this.toRadians(point2.latitude);
        const lon2 = this.toRadians(point2.longitude);
        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return this.earthRadius * c;
    }
    /**
     * Convertir grados a radianes
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    /**
     * Verificar si un punto está dentro del radio especificado
     */
    isWithinRadius(center, point, radius) {
        const distance = this.calculateDistance(center, point);
        return distance <= radius;
    }
    /**
     * Buscar ubicaciones por proximidad
     */
    searchByProximity(center, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Buscando ubicaciones por proximidad', { metadata: { filters } });
                // En una implementación real, usarías índices geoespaciales
                // Por ahora, simulamos la búsqueda
                const snapshot = yield firebase_1.db.collection('locations')
                    .where('type', '==', filters.type || 'event')
                    .limit(filters.limit || 50)
                    .get();
                const locations = [];
                snapshot.forEach((doc) => {
                    const location = Object.assign({ id: doc.id }, doc.data());
                    if (this.isWithinRadius(center, location.coordinates, filters.radius)) {
                        locations.push(location);
                    }
                });
                loggerService_1.logger.info('Búsqueda por proximidad completada', { metadata: { total: locations.length } });
                return locations;
            }
            catch (error) {
                loggerService_1.logger.error('Error en búsqueda por proximidad', error, { metadata: { center, filters } });
                throw error;
            }
        });
    }
    /**
     * Encontrar eventos cercanos
     */
    findNearbyEvents(center_1, radius_1) {
        return __awaiter(this, arguments, void 0, function* (center, radius, limit = 20) {
            try {
                loggerService_1.logger.info('Buscando eventos cercanos', { metadata: { center, radius } });
                const snapshot = yield firebase_1.db.collection('events')
                    .where('status', '==', 'active')
                    .limit(limit)
                    .get();
                const events = [];
                snapshot.forEach((doc) => {
                    var _a;
                    const event = Object.assign({ id: doc.id }, doc.data());
                    if (((_a = event.location) === null || _a === void 0 ? void 0 : _a.coordinates) && this.isWithinRadius(center, event.location.coordinates, radius)) {
                        events.push(Object.assign(Object.assign({}, event), { distance: this.calculateDistance(center, event.location.coordinates) }));
                    }
                });
                // Ordenar por distancia
                events.sort((a, b) => a.distance - b.distance);
                loggerService_1.logger.info('Eventos cercanos encontrados', { metadata: { total: events.length } });
                return events;
            }
            catch (error) {
                loggerService_1.logger.error('Error buscando eventos cercanos', error, { metadata: { center, radius } });
                throw error;
            }
        });
    }
    /**
     * Encontrar músicos cercanos
     */
    findNearbyMusicians(center_1, radius_1) {
        return __awaiter(this, arguments, void 0, function* (center, radius, limit = 20) {
            try {
                loggerService_1.logger.info('Buscando músicos cercanos', { metadata: { center, radius } });
                const snapshot = yield firebase_1.db.collection('users')
                    .where('roll', '==', 'musician')
                    .where('status', '==', true)
                    .limit(limit)
                    .get();
                const musicians = [];
                snapshot.forEach((doc) => {
                    var _a;
                    const musician = Object.assign({ id: doc.id }, doc.data());
                    if (((_a = musician.location) === null || _a === void 0 ? void 0 : _a.coordinates) && this.isWithinRadius(center, musician.location.coordinates, radius)) {
                        musicians.push(Object.assign(Object.assign({}, musician), { distance: this.calculateDistance(center, musician.location.coordinates) }));
                    }
                });
                // Ordenar por distancia
                musicians.sort((a, b) => a.distance - b.distance);
                loggerService_1.logger.info('Músicos cercanos encontrados', { metadata: { total: musicians.length } });
                return musicians;
            }
            catch (error) {
                loggerService_1.logger.error('Error buscando músicos cercanos', error, { metadata: { center, radius } });
                throw error;
            }
        });
    }
    /**
     * Optimizar ruta entre múltiples puntos
     */
    optimizeRoute(routeData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Optimizando ruta', { metadata: { routeData } });
                // En producción, esto se integraría con Google Maps Directions API
                // Por ahora, simulamos la optimización
                let totalDistance = 0;
                let totalDuration = 0;
                for (let i = 0; i < routeData.waypoints.length - 1; i++) {
                    const distance = this.calculateDistance(routeData.waypoints[i], routeData.waypoints[i + 1]);
                    totalDistance += distance;
                    // Estimación de tiempo basada en el modo de transporte
                    const speed = this.getAverageSpeed(routeData.mode);
                    totalDuration += (distance / speed) * 60; // Convertir a minutos
                }
                const result = {
                    distance: totalDistance,
                    duration: totalDuration,
                    polyline: this.generatePolyline(routeData.waypoints),
                    waypoints: routeData.waypoints
                };
                loggerService_1.logger.info('Ruta optimizada', { metadata: { result } });
                return result;
            }
            catch (error) {
                loggerService_1.logger.error('Error optimizando ruta', error, { metadata: { routeData } });
                throw error;
            }
        });
    }
    /**
     * Obtener velocidad promedio según el modo de transporte
     */
    getAverageSpeed(mode) {
        switch (mode) {
            case 'driving': return 50; // km/h
            case 'walking': return 5; // km/h
            case 'bicycling': return 15; // km/h
            case 'transit': return 25; // km/h
            default: return 30; // km/h
        }
    }
    /**
     * Generar polyline (simulado)
     */
    generatePolyline(waypoints) {
        // En producción, esto generaría un polyline real
        return waypoints.map(point => `${point.latitude},${point.longitude}`).join('|');
    }
    /**
     * Estimar tiempo de viaje
     */
    estimateTravelTime(origin_1, destination_1) {
        return __awaiter(this, arguments, void 0, function* (origin, destination, mode = 'driving') {
            try {
                const distance = this.calculateDistance(origin, destination);
                const speed = this.getAverageSpeed(mode);
                return (distance / speed) * 60; // Retornar en minutos
            }
            catch (error) {
                loggerService_1.logger.error('Error estimando tiempo de viaje', error, { metadata: { origin, destination, mode } });
                throw error;
            }
        });
    }
    /**
     * Calcular costo de combustible
     */
    calculateFuelCost(distance_1) {
        return __awaiter(this, arguments, void 0, function* (distance, fuelPrice = 1.2) {
            try {
                const fuelEfficiency = 8; // km/l
                const fuelConsumption = distance / fuelEfficiency;
                return fuelConsumption * fuelPrice;
            }
            catch (error) {
                loggerService_1.logger.error('Error calculando costo de combustible', error, { metadata: { distance, fuelPrice } });
                throw error;
            }
        });
    }
    /**
     * Geocodificar dirección
     */
    geocodeAddress(address, country) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Geocodificando dirección', { metadata: { address, country } });
                // En producción, esto se integraría con Google Geocoding API
                // Por ahora, simulamos la geocodificación
                const mockCoordinates = {
                    'Madrid, Spain': { latitude: 40.4168, longitude: -3.7038 },
                    'Barcelona, Spain': { latitude: 41.3851, longitude: 2.1734 },
                    'Valencia, Spain': { latitude: 39.4699, longitude: -0.3763 },
                    'Sevilla, Spain': { latitude: 37.3891, longitude: -5.9845 },
                    'Zaragoza, Spain': { latitude: 41.6488, longitude: -0.8891 }
                };
                const key = country ? `${address}, ${country}` : address;
                const coordinates = mockCoordinates[key];
                if (coordinates) {
                    loggerService_1.logger.info('Dirección geocodificada', { metadata: { address, coordinates } });
                    return coordinates;
                }
                loggerService_1.logger.warn('Dirección no encontrada', { metadata: { address } });
                return null;
            }
            catch (error) {
                loggerService_1.logger.error('Error geocodificando dirección', error, { metadata: { address, country } });
                throw error;
            }
        });
    }
    /**
     * Geocodificación inversa
     */
    reverseGeocode(coordinates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Geocodificación inversa', { metadata: { coordinates } });
                // En producción, esto se integraría con Google Reverse Geocoding API
                // Por ahora, simulamos la geocodificación inversa
                const mockAddresses = {
                    '40.4168,-3.7038': 'Madrid, Spain',
                    '41.3851,2.1734': 'Barcelona, Spain',
                    '39.4699,-0.3763': 'Valencia, Spain',
                    '37.3891,-5.9845': 'Sevilla, Spain',
                    '41.6488,-0.8891': 'Zaragoza, Spain'
                };
                const key = `${coordinates.latitude},${coordinates.longitude}`;
                const address = mockAddresses[key];
                if (address) {
                    loggerService_1.logger.info('Coordenadas geocodificadas', { metadata: { coordinates, address } });
                    return address;
                }
                loggerService_1.logger.warn('Coordenadas no encontradas', { metadata: { coordinates } });
                return null;
            }
            catch (error) {
                loggerService_1.logger.error('Error en geocodificación inversa', error, { metadata: { coordinates } });
                throw error;
            }
        });
    }
    /**
     * Obtener estadísticas de ubicación
     */
    getLocationStats(center, radius) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Obteniendo estadísticas de ubicación', { metadata: { center, radius } });
                const [events, musicians, venues] = yield Promise.all([
                    this.findNearbyEvents(center, radius),
                    this.findNearbyMusicians(center, radius),
                    this.searchByProximity(center, { radius, type: 'venue', limit: 100 })
                ]);
                const stats = {
                    totalEvents: events.length,
                    totalMusicians: musicians.length,
                    totalVenues: venues.length,
                    averageEventDistance: events.length > 0
                        ? events.reduce((sum, event) => sum + event.distance, 0) / events.length
                        : 0,
                    averageMusicianDistance: musicians.length > 0
                        ? musicians.reduce((sum, musician) => sum + musician.distance, 0) / musicians.length
                        : 0,
                    density: {
                        events: events.length / (Math.PI * radius * radius),
                        musicians: musicians.length / (Math.PI * radius * radius),
                        venues: venues.length / (Math.PI * radius * radius)
                    }
                };
                loggerService_1.logger.info('Estadísticas de ubicación obtenidas', { metadata: { stats } });
                return stats;
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo estadísticas de ubicación', error, { metadata: { center, radius } });
                throw error;
            }
        });
    }
}
exports.GeolocationService = GeolocationService;
// Instancia singleton del servicio
exports.geolocationService = new GeolocationService();
