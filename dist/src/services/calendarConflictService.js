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
exports.CalendarConflictService = void 0;
const firebase_1 = require("../utils/firebase");
const loggerService_1 = require("./loggerService");
class CalendarConflictService {
    constructor() {
        this.COLLECTION = 'calendar_events';
        this.DEFAULT_BUFFER_TIME = 60; // 1 hora en minutos
        this.DEFAULT_TRAVEL_TIME = 30; // 30 minutos
    }
    /**
     * Verificar conflictos de calendario para un músico
     */
    checkConflicts(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[src/services/calendarConflictService.ts:45] Verificando conflictos para músico:', request.musicianId);
                const { musicianId, startTime, endTime, location, travelTime = this.DEFAULT_TRAVEL_TIME, bufferTime = this.DEFAULT_BUFFER_TIME } = request;
                // Obtener eventos del músico en el rango de tiempo
                const events = yield this.getMusicianEvents(musicianId, startTime, endTime);
                // Calcular tiempo total necesario (evento + viaje + buffer)
                const totalDuration = this.calculateEventDuration(startTime, endTime) + travelTime + bufferTime;
                // Verificar conflictos
                const conflicts = this.findConflicts(events, startTime, endTime, travelTime, bufferTime);
                // Si hay conflictos, encontrar slots disponibles
                let availableSlots = [];
                let recommendedTime;
                if (conflicts.length > 0) {
                    availableSlots = this.findAvailableSlots(events, startTime, endTime, totalDuration);
                    recommendedTime = this.findBestTimeSlot(availableSlots, startTime);
                }
                const result = {
                    hasConflict: conflicts.length > 0,
                    conflicts,
                    availableSlots,
                    recommendedTime
                };
                loggerService_1.logger.info('Verificación de conflictos completada', {
                    metadata: {
                        musicianId,
                        hasConflict: result.hasConflict,
                        conflictsCount: conflicts.length,
                        availableSlotsCount: availableSlots.length
                    }
                });
                return result;
            }
            catch (error) {
                loggerService_1.logger.error('Error verificando conflictos de calendario', error, {
                    metadata: { request }
                });
                throw error;
            }
        });
    }
    /**
     * Agregar evento al calendario
     */
    addEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[src/services/calendarConflictService.ts:85] Agregando evento al calendario:', event.eventId);
                const now = new Date();
                const eventRef = firebase_1.db.collection(this.COLLECTION).doc();
                const newEvent = Object.assign(Object.assign({}, event), { id: eventRef.id, createdAt: now, updatedAt: now });
                yield eventRef.set(newEvent);
                loggerService_1.logger.info('Evento agregado al calendario', {
                    metadata: { eventId: event.eventId, musicianId: event.musicianId }
                });
                return newEvent;
            }
            catch (error) {
                loggerService_1.logger.error('Error agregando evento al calendario', error, {
                    metadata: { event }
                });
                throw error;
            }
        });
    }
    /**
     * Actualizar evento del calendario
     */
    updateEvent(eventId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[src/services/calendarConflictService.ts:105] Actualizando evento del calendario:', eventId);
                const eventRef = firebase_1.db.collection(this.COLLECTION).doc(eventId);
                const doc = yield eventRef.get();
                if (!doc.exists) {
                    throw new Error('Evento del calendario no encontrado');
                }
                yield eventRef.update(Object.assign(Object.assign({}, updates), { updatedAt: new Date() }));
                const updatedDoc = yield eventRef.get();
                const updatedEvent = updatedDoc.data();
                loggerService_1.logger.info('Evento del calendario actualizado', {
                    metadata: { eventId, updates }
                });
                return updatedEvent;
            }
            catch (error) {
                loggerService_1.logger.error('Error actualizando evento del calendario', error, {
                    metadata: { eventId }
                });
                throw error;
            }
        });
    }
    /**
     * Eliminar evento del calendario
     */
    removeEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[src/services/calendarConflictService.ts:130] Eliminando evento del calendario:', eventId);
                const eventRef = firebase_1.db.collection(this.COLLECTION).doc(eventId);
                yield eventRef.delete();
                loggerService_1.logger.info('Evento eliminado del calendario', {
                    metadata: { eventId }
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error eliminando evento del calendario', error, {
                    metadata: { eventId }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener eventos de un músico en un rango de tiempo
     */
    getMusicianEvents(musicianId, startTime, endTime) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[src/services/calendarConflictService.ts:145] Obteniendo eventos del músico:', musicianId);
                const query = firebase_1.db.collection(this.COLLECTION)
                    .where('musicianId', '==', musicianId)
                    .where('status', 'in', ['confirmed', 'pending'])
                    .where('startTime', '<=', endTime)
                    .where('endTime', '>=', startTime);
                const snapshot = yield query.get();
                const events = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return Object.assign(Object.assign({}, data), { startTime: data.startTime.toDate(), endTime: data.endTime.toDate(), createdAt: data.createdAt.toDate(), updatedAt: data.updatedAt.toDate() });
                });
                return events;
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo eventos del músico', error, {
                    metadata: { musicianId }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener disponibilidad de un músico para un día específico
     */
    getDailyAvailability(musicianId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[src/services/calendarConflictService.ts:175] Obteniendo disponibilidad diaria del músico:', musicianId);
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                const events = yield this.getMusicianEvents(musicianId, startOfDay, endOfDay);
                // Encontrar slots disponibles
                const availableSlots = this.findAvailableSlotsInDay(events, startOfDay, endOfDay);
                return {
                    date,
                    busySlots: events,
                    availableSlots
                };
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo disponibilidad diaria', error, {
                    metadata: { musicianId, date }
                });
                throw error;
            }
        });
    }
    /**
     * Verificar disponibilidad de múltiples músicos
     */
    checkMultipleMusiciansAvailability(musicianIds, startTime, endTime) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[src/services/calendarConflictService.ts:205] Verificando disponibilidad de múltiples músicos');
                const results = yield Promise.all(musicianIds.map((musicianId) => __awaiter(this, void 0, void 0, function* () {
                    const result = yield this.checkConflicts({
                        musicianId,
                        startTime,
                        endTime,
                        location: ''
                    });
                    return { musicianId, result };
                })));
                const availableMusicians = [];
                const unavailableMusicians = [];
                const conflicts = {};
                results.forEach(({ musicianId, result }) => {
                    if (result.hasConflict) {
                        unavailableMusicians.push(musicianId);
                        conflicts[musicianId] = result.conflicts;
                    }
                    else {
                        availableMusicians.push(musicianId);
                    }
                });
                return {
                    availableMusicians,
                    unavailableMusicians,
                    conflicts
                };
            }
            catch (error) {
                loggerService_1.logger.error('Error verificando disponibilidad de múltiples músicos', error, {
                    metadata: { musicianIds }
                });
                throw error;
            }
        });
    }
    /**
     * Encontrar conflictos en eventos existentes
     */
    findConflicts(events, startTime, endTime, travelTime, bufferTime) {
        const conflicts = [];
        // Expandir el rango de tiempo para incluir viaje y buffer
        const expandedStartTime = new Date(startTime.getTime() - (travelTime + bufferTime) * 60000);
        const expandedEndTime = new Date(endTime.getTime() + (travelTime + bufferTime) * 60000);
        events.forEach(event => {
            // Verificar si hay solapamiento
            if ((event.startTime < expandedEndTime && event.endTime > expandedStartTime) ||
                (expandedStartTime < event.endTime && expandedEndTime > event.startTime)) {
                conflicts.push(event);
            }
        });
        return conflicts;
    }
    /**
     * Encontrar slots disponibles
     */
    findAvailableSlots(events, startTime, endTime, requiredDuration) {
        const slots = [];
        // Ordenar eventos por hora de inicio
        const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        let currentTime = new Date(startTime);
        sortedEvents.forEach(event => {
            const timeUntilEvent = event.startTime.getTime() - currentTime.getTime();
            const availableDuration = timeUntilEvent / 60000; // convertir a minutos
            if (availableDuration >= requiredDuration) {
                slots.push({
                    startTime: new Date(currentTime),
                    endTime: new Date(event.startTime),
                    duration: availableDuration
                });
            }
            currentTime = new Date(Math.max(currentTime.getTime(), event.endTime.getTime()));
        });
        // Verificar si hay tiempo disponible después del último evento
        const timeAfterLastEvent = endTime.getTime() - currentTime.getTime();
        const availableDuration = timeAfterLastEvent / 60000;
        if (availableDuration >= requiredDuration) {
            slots.push({
                startTime: new Date(currentTime),
                endTime: new Date(endTime),
                duration: availableDuration
            });
        }
        return slots;
    }
    /**
     * Encontrar slots disponibles en un día completo
     */
    findAvailableSlotsInDay(events, startOfDay, endOfDay) {
        const slots = [];
        // Ordenar eventos por hora de inicio
        const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        let currentTime = new Date(startOfDay);
        sortedEvents.forEach(event => {
            if (event.startTime > currentTime) {
                const duration = (event.startTime.getTime() - currentTime.getTime()) / 60000;
                if (duration >= 30) { // Mínimo 30 minutos
                    slots.push({
                        startTime: new Date(currentTime),
                        endTime: new Date(event.startTime),
                        duration
                    });
                }
            }
            currentTime = new Date(Math.max(currentTime.getTime(), event.endTime.getTime()));
        });
        // Verificar tiempo después del último evento
        if (currentTime < endOfDay) {
            const duration = (endOfDay.getTime() - currentTime.getTime()) / 60000;
            if (duration >= 30) {
                slots.push({
                    startTime: new Date(currentTime),
                    endTime: new Date(endOfDay),
                    duration
                });
            }
        }
        return slots;
    }
    /**
     * Encontrar el mejor slot de tiempo
     */
    findBestTimeSlot(slots, preferredTime) {
        if (slots.length === 0)
            return undefined;
        // Encontrar el slot más cercano al tiempo preferido
        let bestSlot = slots[0];
        let minDifference = Math.abs(slots[0].startTime.getTime() - preferredTime.getTime());
        slots.forEach(slot => {
            const difference = Math.abs(slot.startTime.getTime() - preferredTime.getTime());
            if (difference < minDifference) {
                minDifference = difference;
                bestSlot = slot;
            }
        });
        return bestSlot.startTime;
    }
    /**
     * Calcular duración de un evento en minutos
     */
    calculateEventDuration(startTime, endTime) {
        return (endTime.getTime() - startTime.getTime()) / 60000;
    }
}
exports.CalendarConflictService = CalendarConflictService;
