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
exports.MusicianStatusService = void 0;
const firebase_1 = require("../utils/firebase");
const loggerService_1 = require("./loggerService");
class MusicianStatusService {
    constructor() {
        this.COLLECTION = 'musician_status';
        this.HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutos
        this.OFFLINE_THRESHOLD = 10 * 60 * 1000; // 10 minutos
    }
    /**
     * Actualizar estado del músico
     */
    updateStatus(musicianId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            try {
                console.log('[src/services/musicianStatusService.ts:45] Actualizando estado del músico:', musicianId);
                const now = new Date();
                const statusRef = firebase_1.db.collection(this.COLLECTION).doc(musicianId);
                const updateData = Object.assign(Object.assign({}, data), { lastSeen: now, updatedAt: now });
                // Si es la primera vez, crear el documento
                const existingDoc = yield statusRef.get();
                if (!existingDoc.exists) {
                    const newStatus = {
                        id: musicianId,
                        musicianId,
                        isOnline: (_a = data.isOnline) !== null && _a !== void 0 ? _a : true,
                        lastSeen: now,
                        currentLocation: data.currentLocation,
                        availability: {
                            isAvailable: (_c = (_b = data.availability) === null || _b === void 0 ? void 0 : _b.isAvailable) !== null && _c !== void 0 ? _c : true,
                            availableFrom: (_d = data.availability) === null || _d === void 0 ? void 0 : _d.availableFrom,
                            availableTo: (_e = data.availability) === null || _e === void 0 ? void 0 : _e.availableTo,
                            maxDistance: (_g = (_f = data.availability) === null || _f === void 0 ? void 0 : _f.maxDistance) !== null && _g !== void 0 ? _g : 50
                        },
                        preferences: {
                            eventTypes: [],
                            instruments: [],
                            minBudget: 0,
                            maxBudget: 10000
                        },
                        performance: {
                            rating: 0,
                            totalEvents: 0,
                            completedEvents: 0,
                            responseTime: 0
                        },
                        createdAt: now,
                        updatedAt: now
                    };
                    yield statusRef.set(newStatus);
                    loggerService_1.logger.info('Estado de músico creado', {
                        metadata: { musicianId, status: newStatus }
                    });
                    return newStatus;
                }
                // Actualizar documento existente
                yield statusRef.update(updateData);
                const updatedDoc = yield statusRef.get();
                const updatedStatus = updatedDoc.data();
                loggerService_1.logger.info('Estado de músico actualizado', {
                    metadata: { musicianId, updates: updateData }
                });
                return updatedStatus;
            }
            catch (error) {
                loggerService_1.logger.error('Error actualizando estado del músico', error, {
                    metadata: { musicianId }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener estado actual del músico
     */
    getStatus(musicianId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[src/services/musicianStatusService.ts:95] Obteniendo estado del músico:', musicianId);
                const statusRef = firebase_1.db.collection(this.COLLECTION).doc(musicianId);
                const doc = yield statusRef.get();
                if (!doc.exists) {
                    return null;
                }
                const status = doc.data();
                // Verificar si el músico está realmente online basado en lastSeen
                const timeSinceLastSeen = Date.now() - status.lastSeen.getTime();
                if (timeSinceLastSeen > this.OFFLINE_THRESHOLD && status.isOnline) {
                    // Actualizar automáticamente a offline
                    yield this.updateStatus(musicianId, { isOnline: false });
                    status.isOnline = false;
                }
                return status;
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo estado del músico', error, {
                    metadata: { musicianId }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener músicos online disponibles
     */
    getOnlineMusicians(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[src/services/musicianStatusService.ts:125] Buscando músicos online disponibles');
                let query = firebase_1.db.collection(this.COLLECTION)
                    .where('isOnline', '==', true)
                    .where('availability.isAvailable', '==', true);
                const snapshot = yield query.get();
                let musicians = snapshot.docs.map(doc => doc.data());
                // Aplicar filtros adicionales
                if (filters) {
                    musicians = this.applyFilters(musicians, filters);
                }
                // Ordenar por rating y tiempo de respuesta
                musicians.sort((a, b) => {
                    const scoreA = (a.performance.rating * 0.7) + ((100 - a.performance.responseTime) * 0.3);
                    const scoreB = (b.performance.rating * 0.7) + ((100 - b.performance.responseTime) * 0.3);
                    return scoreB - scoreA;
                });
                loggerService_1.logger.info('Músicos online encontrados', {
                    metadata: { count: musicians.length }
                });
                return musicians;
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo músicos online', error);
                throw error;
            }
        });
    }
    /**
     * Heartbeat para mantener estado online
     */
    heartbeat(musicianId, location) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[src/services/musicianStatusService.ts:155] Heartbeat del músico:', musicianId);
                const updateData = {
                    isOnline: true
                };
                if (location) {
                    updateData.currentLocation = location;
                }
                yield this.updateStatus(musicianId, updateData);
            }
            catch (error) {
                loggerService_1.logger.error('Error en heartbeat del músico', error, {
                    metadata: { musicianId }
                });
                throw error;
            }
        });
    }
    /**
     * Marcar músico como offline
     */
    setOffline(musicianId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[src/services/musicianStatusService.ts:175] Marcando músico como offline:', musicianId);
                yield this.updateStatus(musicianId, { isOnline: false });
            }
            catch (error) {
                loggerService_1.logger.error('Error marcando músico como offline', error, {
                    metadata: { musicianId }
                });
                throw error;
            }
        });
    }
    /**
     * Actualizar preferencias del músico
     */
    updatePreferences(musicianId, preferences) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[src/services/musicianStatusService.ts:190] Actualizando preferencias del músico:', musicianId);
                const statusRef = firebase_1.db.collection(this.COLLECTION).doc(musicianId);
                const doc = yield statusRef.get();
                if (!doc.exists) {
                    throw new Error('Estado del músico no encontrado');
                }
                const currentStatus = doc.data();
                const updatedPreferences = Object.assign(Object.assign({}, currentStatus.preferences), preferences);
                yield statusRef.update({
                    preferences: updatedPreferences,
                    updatedAt: new Date()
                });
                const updatedDoc = yield statusRef.get();
                return updatedDoc.data();
            }
            catch (error) {
                loggerService_1.logger.error('Error actualizando preferencias del músico', error, {
                    metadata: { musicianId }
                });
                throw error;
            }
        });
    }
    /**
     * Actualizar métricas de rendimiento
     */
    updatePerformance(musicianId, performance) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[src/services/musicianStatusService.ts:220] Actualizando rendimiento del músico:', musicianId);
                const statusRef = firebase_1.db.collection(this.COLLECTION).doc(musicianId);
                const doc = yield statusRef.get();
                if (!doc.exists) {
                    throw new Error('Estado del músico no encontrado');
                }
                const currentStatus = doc.data();
                const updatedPerformance = Object.assign(Object.assign({}, currentStatus.performance), performance);
                yield statusRef.update({
                    performance: updatedPerformance,
                    updatedAt: new Date()
                });
                const updatedDoc = yield statusRef.get();
                return updatedDoc.data();
            }
            catch (error) {
                loggerService_1.logger.error('Error actualizando rendimiento del músico', error, {
                    metadata: { musicianId }
                });
                throw error;
            }
        });
    }
    /**
     * Limpiar estados offline antiguos
     */
    cleanupOfflineStatuses() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[src/services/musicianStatusService.ts:250] Limpiando estados offline antiguos');
                const cutoffTime = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 24 horas
                const query = firebase_1.db.collection(this.COLLECTION)
                    .where('isOnline', '==', false)
                    .where('lastSeen', '<', cutoffTime);
                const snapshot = yield query.get();
                const batch = firebase_1.db.batch();
                snapshot.docs.forEach(doc => {
                    batch.delete(doc.ref);
                });
                yield batch.commit();
                const deletedCount = snapshot.docs.length;
                loggerService_1.logger.info('Estados offline limpiados', {
                    metadata: { deletedCount }
                });
                return deletedCount;
            }
            catch (error) {
                loggerService_1.logger.error('Error limpiando estados offline', error);
                throw error;
            }
        });
    }
    /**
     * Aplicar filtros a la lista de músicos
     */
    applyFilters(musicians, filters) {
        return musicians.filter(musician => {
            // Filtro por tipo de evento
            if (filters.eventType && !musician.preferences.eventTypes.includes(filters.eventType)) {
                return false;
            }
            // Filtro por instrumento
            if (filters.instrument && !musician.preferences.instruments.includes(filters.instrument)) {
                return false;
            }
            // Filtro por presupuesto
            if (filters.minBudget && musician.preferences.maxBudget < filters.minBudget) {
                return false;
            }
            if (filters.maxBudget && musician.preferences.minBudget > filters.maxBudget) {
                return false;
            }
            // Filtro por ubicación
            if (filters.location && musician.currentLocation) {
                const distance = this.calculateDistance(filters.location.latitude, filters.location.longitude, musician.currentLocation.latitude, musician.currentLocation.longitude);
                if (distance > filters.location.radius) {
                    return false;
                }
            }
            return true;
        });
    }
    /**
     * Calcular distancia entre dos puntos (fórmula de Haversine)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
}
exports.MusicianStatusService = MusicianStatusService;
