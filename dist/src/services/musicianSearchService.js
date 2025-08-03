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
exports.MusicianSearchService = void 0;
const firebase_1 = require("../utils/firebase");
const loggerService_1 = require("../services/loggerService");
/**
 * Algoritmo de búsqueda de músicos para eventos
 * Implementa un sistema de scoring basado en múltiples criterios
 */
class MusicianSearchService {
    /**
     * Busca músicos disponibles que coincidan con los criterios del evento
     */
    static searchMusiciansForEvent(event, criteria) {
        return __awaiter(this, void 0, void 0, function* () {
            loggerService_1.logger.info('[src/services/musicianSearchService.ts:75] 🔍 Iniciando búsqueda de músicos para evento:', { metadata: { id: event.id,
                } });
            try {
                // 1. Obtener todos los músicos aprobados y disponibles
                const musicians = yield this.getAvailableMusicians();
                loggerService_1.logger.info('[src/services/musicianSearchService.ts:82] 📊 Músicos disponibles encontrados:', { metadata: { id: musicians.length,
                    } });
                // 2. Filtrar por instrumento requerido
                const musiciansWithInstrument = musicians.filter(musician => musician.instruments.includes(criteria.instrument));
                loggerService_1.logger.info('[src/services/musicianSearchService.ts:89] 🎵 Músicos con instrumento requerido:', { metadata: { id: musiciansWithInstrument.length,
                    } });
                // 3. Verificar disponibilidad de tiempo
                const availableMusicians = yield this.checkAvailability(musiciansWithInstrument, event);
                loggerService_1.logger.info('[src/services/musicianSearchService.ts:96] ⏰ Músicos disponibles en fecha/hora:', { metadata: { id: availableMusicians.length,
                    } });
                // 4. Calcular puntuaciones de matching
                const scoredMusicians = yield this.calculateMatchScores(availableMusicians, event, criteria);
                // 5. Ordenar por puntuación (mayor a menor)
                const sortedMusicians = scoredMusicians.sort((a, b) => b.matchScore - a.matchScore);
                loggerService_1.logger.info('[src/services/musicianSearchService.ts:108] 🏆 Búsqueda completada. Músicos encontrados:', { metadata: { id: sortedMusicians.length,
                    } });
                return sortedMusicians;
            }
            catch (error) {
                loggerService_1.logger.error('[src/services/musicianSearchService.ts:115] ❌ Error en búsqueda de músicos:', error);
                throw error;
            }
        });
    }
    /**
     * Obtiene todos los músicos aprobados y disponibles
     */
    static getAvailableMusicians() {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield firebase_1.db
                .collection('users')
                .where('roll', '==', 'musico')
                .where('isApproved', '==', true)
                .where('isAvailable', '==', true)
                .get();
            const musicians = [];
            for (const doc of snapshot.docs) {
                const userData = doc.data();
                // Obtener perfil completo del músico
                const profileSnapshot = yield firebase_1.db
                    .collection('musicianProfiles')
                    .where('userEmail', '==', userData.userEmail)
                    .limit(1)
                    .get();
                if (!profileSnapshot.empty) {
                    const profileData = profileSnapshot.docs[0].data();
                    musicians.push({
                        userEmail: userData.userEmail,
                        name: userData.name,
                        lastName: userData.lastName,
                        instruments: profileData.instruments || [],
                        hasOwnInstruments: profileData.hasOwnInstruments || false,
                        experience: profileData.experience || 0,
                        bio: profileData.bio,
                        location: profileData.location || '',
                        hourlyRate: profileData.hourlyRate || 0,
                        isApproved: userData.isApproved || false,
                        isAvailable: userData.isAvailable || false,
                        phone: profileData.phone,
                        socialMedia: profileData.socialMedia,
                        rating: profileData.rating || 0,
                        totalEvents: profileData.totalEvents || 0,
                        completedEvents: profileData.completedEvents || 0,
                    });
                }
            }
            return musicians;
        });
    }
    /**
     * Verifica la disponibilidad de tiempo de los músicos
     */
    static checkAvailability(musicians, event) {
        return __awaiter(this, void 0, void 0, function* () {
            const eventDate = new Date(`${event.date}T${event.time}`);
            const eventEndTime = new Date(eventDate.getTime() + this.parseDuration(event.duration));
            const availableMusicians = [];
            for (const musician of musicians) {
                // Verificar si el músico tiene conflictos en la fecha/hora del evento
                const conflicts = yield this.checkMusicianConflicts(musician.userEmail, eventDate, eventEndTime);
                if (conflicts.length === 0) {
                    availableMusicians.push(musician);
                }
            }
            return availableMusicians;
        });
    }
    /**
     * Verifica conflictos de horario para un músico específico
     */
    static checkMusicianConflicts(musicianEmail, eventStart, eventEnd) {
        return __awaiter(this, void 0, void 0, function* () {
            const conflicts = [];
            // Buscar eventos asignados al músico en la misma fecha
            const snapshot = yield firebase_1.db
                .collection('events')
                .where('assignedMusicianId', '==', musicianEmail)
                .where('status', 'in', ['musician_assigned', 'pending_musician'])
                .get();
            for (const doc of snapshot.docs) {
                const event = doc.data();
                const eventDate = new Date(`${event.date}T${event.time}`);
                const eventEndTime = new Date(eventDate.getTime() + this.parseDuration(event.duration));
                // Verificar si hay solapamiento de horarios
                if ((eventStart >= eventDate && eventStart < eventEndTime) ||
                    (eventEnd > eventDate && eventEnd <= eventEndTime) ||
                    (eventStart <= eventDate && eventEnd >= eventEndTime)) {
                    conflicts.push(event.eventName);
                }
            }
            return conflicts;
        });
    }
    /**
     * Calcula las puntuaciones de matching para cada músico
     */
    static calculateMatchScores(musicians, event, criteria) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            for (const musician of musicians) {
                let matchScore = 0;
                // 1. Puntuación por instrumento (40 puntos)
                if (musician.instruments.includes(criteria.instrument)) {
                    matchScore += 40;
                }
                // 2. Puntuación por disponibilidad de instrumento (15 puntos)
                if (musician.hasOwnInstruments) {
                    matchScore += 15;
                }
                else if (event.bringInstrument) {
                    matchScore += 5; // Puntuación menor si el evento requiere instrumento
                }
                // 3. Puntuación por experiencia (20 puntos)
                const experienceScore = Math.min(musician.experience * 2, 20);
                matchScore += experienceScore;
                // 4. Puntuación por rating (15 puntos)
                const ratingScore = (musician.rating / 5) * 15;
                matchScore += ratingScore;
                // 5. Puntuación por presupuesto (10 puntos)
                if (criteria.budget) {
                    const hourlyCost = musician.hourlyRate * this.parseDuration(event.duration) / 60;
                    if (hourlyCost <= criteria.budget) {
                        matchScore += 10;
                    }
                    else if (hourlyCost <= criteria.budget * 1.2) {
                        matchScore += 5; // Puntuación reducida si está dentro del 20% del presupuesto
                    }
                }
                // 6. Puntuación por ubicación (si se especifica)
                if (criteria.location && musician.location) {
                    const distance = this.calculateDistance(criteria.location, musician.location);
                    if (distance <= 10) { // 10 km
                        matchScore += 10;
                    }
                    else if (distance <= 25) { // 25 km
                        matchScore += 5;
                    }
                }
                // 7. Puntuación por historial de eventos completados
                if (musician.completedEvents > 0) {
                    const completionRate = musician.completedEvents / musician.totalEvents;
                    matchScore += completionRate * 10;
                }
                // Limitar la puntuación máxima a 100
                matchScore = Math.min(matchScore, 100);
                results.push({
                    userEmail: musician.userEmail,
                    name: musician.name,
                    lastName: musician.lastName,
                    instruments: musician.instruments,
                    hasOwnInstruments: musician.hasOwnInstruments,
                    experience: musician.experience,
                    hourlyRate: musician.hourlyRate,
                    location: musician.location,
                    isAvailable: musician.isAvailable,
                    rating: musician.rating,
                    matchScore: Math.round(matchScore),
                    availability: {
                        isAvailable: true,
                        conflicts: [],
                    },
                });
            }
            return results;
        });
    }
    /**
     * Convierte la duración de string a minutos
     */
    static parseDuration(duration) {
        const hours = parseInt(duration.split(':')[0]) || 0;
        const minutes = parseInt(duration.split(':')[1]) || 0;
        return hours * 60 + minutes;
    }
    /**
     * Calcula la distancia entre dos ubicaciones (implementación básica)
     * En producción, usar Google Maps API o similar
     */
    static calculateDistance(location1, location2) {
        // Implementación básica - en producción usar Google Maps API
        // Por ahora retorna una distancia aleatoria para demostración
        return Math.random() * 50; // 0-50 km
    }
    /**
     * Obtiene músicos recomendados para un evento específico
     */
    static getRecommendedMusicians(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield this.getEventById(eventId);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            const criteria = {
                instrument: event.instrument,
                budget: parseFloat(event.budget),
                date: event.date,
                time: event.time,
                duration: event.duration,
                eventType: event.eventType,
            };
            return this.searchMusiciansForEvent(event, criteria);
        });
    }
    /**
     * Obtiene un evento por ID
     */
    static getEventById(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield firebase_1.db.collection('events').doc(eventId).get();
            if (!doc.exists)
                return null;
            return doc.data();
        });
    }
}
exports.MusicianSearchService = MusicianSearchService;
