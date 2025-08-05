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
exports.musicianHeartbeatController = exports.getEventWithAdvancedInfoController = exports.deleteEventController = exports.completeEventController = exports.cancelEventController = exports.getEventByIdController = exports.myCancelledEventsController = exports.myEventsController = exports.myPastPerformancesController = exports.myScheduledEventsController = exports.acceptEventController = exports.availableRequestsController = exports.myCompletedEventsController = exports.myAssignedEventsController = exports.myPendingEventsController = exports.requestMusicianController = void 0;
const loggerService_1 = require("../services/loggerService");
const eventModel_1 = require("../models/eventModel");
// Importar servicios avanzados
const musicianStatusService_1 = require("../services/musicianStatusService");
const calendarConflictService_1 = require("../services/calendarConflictService");
const rateCalculationService_1 = require("../services/rateCalculationService");
// Comentado temporalmente para evitar dependencias circulares
// import { io, users } from "../../index";
// Instanciar servicios avanzados
const musicianStatusService = new musicianStatusService_1.MusicianStatusService();
const calendarConflictService = new calendarConflictService_1.CalendarConflictService();
const rateCalculationService = new rateCalculationService_1.RateCalculationService();
// POST /events/request-musician
const requestMusicianController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const eventData = req.body;
        loggerService_1.logger.info('🎵 Creando evento con sistemas avanzados integrados:', {
            context: 'Event',
            metadata: {
                userEmail: user.userEmail,
                eventType: eventData.eventType,
                instrument: eventData.instrument,
                date: eventData.date,
                time: eventData.time
            }
        });
        // 1. Crear el evento base
        const event = yield (0, eventModel_1.createEventModel)(Object.assign(Object.assign({}, eventData), { user: user.userEmail }));
        // 2. Buscar músicos disponibles con sistemas avanzados
        const availableMusicians = yield findAvailableMusiciansWithAdvancedSystems(eventData);
        // 3. Calcular tarifas automáticas para músicos disponibles
        const musiciansWithRates = yield calculateRatesForMusicians(availableMusicians, eventData);
        // 4. Actualizar el evento con información de músicos disponibles
        const enhancedEvent = Object.assign(Object.assign({}, event), { availableMusicians: musiciansWithRates, searchMetadata: {
                totalMusiciansFound: availableMusicians.length,
                availableMusiciansCount: musiciansWithRates.length,
                searchTimestamp: new Date().toISOString(),
                advancedSearchUsed: true
            } });
        loggerService_1.logger.info('✅ Evento creado con sistemas avanzados:', {
            context: 'Event',
            metadata: {
                eventId: event.id,
                availableMusiciansCount: musiciansWithRates.length,
                totalMusiciansFound: availableMusicians.length
            }
        });
        // io.emit('new_event_request', enhancedEvent); // Comentado temporalmente
        res.status(201).json({
            success: true,
            message: 'Evento creado exitosamente con búsqueda avanzada de músicos',
            data: enhancedEvent
        });
    }
    catch (error) {
        loggerService_1.logger.error('❌ Error al crear evento con sistemas avanzados:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear evento',
            error: error.message
        });
    }
});
exports.requestMusicianController = requestMusicianController;
/**
 * Buscar músicos disponibles usando sistemas avanzados
 */
function findAvailableMusiciansWithAdvancedSystems(eventData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            loggerService_1.logger.info('🔍 Buscando músicos con sistemas avanzados:', {
                context: 'AdvancedSearch',
                metadata: {
                    eventType: eventData.eventType,
                    instrument: eventData.instrument,
                    date: eventData.date,
                    time: eventData.time
                }
            });
            // 1. Obtener músicos online disponibles
            const onlineMusicians = yield musicianStatusService.getOnlineMusicians({
                eventType: eventData.eventType,
                instrument: eventData.instrument,
                minBudget: eventData.budget ? parseInt(eventData.budget) : undefined,
                maxBudget: eventData.budget ? parseInt(eventData.budget) * 2 : undefined
            });
            if (onlineMusicians.length === 0) {
                loggerService_1.logger.info('📭 No se encontraron músicos online disponibles');
                return [];
            }
            // 2. Verificar conflictos de calendario
            const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);
            const duration = parseInt(eventData.duration) || 120; // 2 horas por defecto
            const endDateTime = new Date(eventDateTime.getTime() + duration * 60000);
            const musicianIds = onlineMusicians.map(m => m.musicianId);
            const availabilityResult = yield calendarConflictService.checkMultipleMusiciansAvailability(musicianIds, eventDateTime, endDateTime);
            // 3. Filtrar músicos disponibles
            const availableMusicians = onlineMusicians.filter(musician => availabilityResult.availableMusicians.includes(musician.musicianId));
            loggerService_1.logger.info('✅ Músicos disponibles encontrados:', {
                context: 'AdvancedSearch',
                metadata: {
                    totalOnline: onlineMusicians.length,
                    availableAfterCalendarCheck: availableMusicians.length,
                    conflictsFound: availabilityResult.unavailableMusicians.length
                }
            });
            return availableMusicians;
        }
        catch (error) {
            loggerService_1.logger.error('❌ Error en búsqueda avanzada de músicos:', error);
            return [];
        }
    });
}
/**
 * Calcular tarifas automáticas para músicos disponibles
 */
function calculateRatesForMusicians(musicians, eventData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            loggerService_1.logger.info('💰 Calculando tarifas automáticas para músicos:', {
                context: 'RateCalculation',
                metadata: {
                    musiciansCount: musicians.length
                }
            });
            const musiciansWithRates = yield Promise.all(musicians.map((musician) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);
                    const duration = parseInt(eventData.duration) || 120;
                    const rateResult = yield rateCalculationService.calculateRate({
                        musicianId: musician.musicianId,
                        eventType: eventData.eventType,
                        duration,
                        location: eventData.location,
                        eventDate: eventDateTime,
                        instrument: eventData.instrument,
                        isUrgent: false // TODO: Determinar urgencia basada en fecha
                    });
                    return Object.assign(Object.assign({}, musician), { calculatedRate: rateResult.finalRate, rateBreakdown: rateResult.breakdown, recommendations: rateResult.recommendations, relevanceScore: calculateRelevanceScore(musician, rateResult.finalRate) });
                }
                catch (error) {
                    loggerService_1.logger.error('❌ Error calculando tarifa para músico:', error, {
                        metadata: { musicianId: musician.musicianId }
                    });
                    return Object.assign(Object.assign({}, musician), { calculatedRate: null, rateBreakdown: null, recommendations: null, relevanceScore: 0 });
                }
            })));
            // Ordenar por score de relevancia
            musiciansWithRates.sort((a, b) => b.relevanceScore - a.relevanceScore);
            loggerService_1.logger.info('✅ Tarifas calculadas exitosamente:', {
                context: 'RateCalculation',
                metadata: {
                    musiciansWithRates: musiciansWithRates.length,
                    averageRate: musiciansWithRates.reduce((sum, m) => sum + (m.calculatedRate || 0), 0) / musiciansWithRates.length
                }
            });
            return musiciansWithRates;
        }
        catch (error) {
            loggerService_1.logger.error('❌ Error calculando tarifas:', error);
            return musicians.map(musician => (Object.assign(Object.assign({}, musician), { calculatedRate: null, rateBreakdown: null, recommendations: null, relevanceScore: 0 })));
        }
    });
}
/**
 * Calcular score de relevancia para ordenar músicos
 */
function calculateRelevanceScore(musician, rate) {
    const status = musician;
    // Score basado en rating (40%)
    const ratingScore = (status.performance.rating / 5.0) * 40;
    // Score basado en tiempo de respuesta (30%)
    const responseScore = Math.max(0, (120 - status.performance.responseTime) / 120) * 30;
    // Score basado en precio (20%) - menor precio = mayor score
    const priceScore = rate ? Math.max(0, (200 - rate) / 200) * 20 : 10;
    // Score basado en experiencia (10%)
    const experienceScore = Math.min(10, status.performance.totalEvents / 10);
    return ratingScore + responseScore + priceScore + experienceScore;
}
const myPendingEventsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const events = yield (0, eventModel_1.getEventsByUserAndStatus)(user.userEmail, 'pending_musician');
    res.json({ data: events });
});
exports.myPendingEventsController = myPendingEventsController;
const myAssignedEventsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    loggerService_1.logger.info('🔍 Buscando eventos asignados para:', { context: 'Event', metadata: user.userEmail });
    const events = yield (0, eventModel_1.getEventsByUserAndStatus)(user.userEmail, 'musician_assigned');
    loggerService_1.logger.info('📦 Eventos asignados encontrados:', { context: 'Event', metadata: { count: events.length } });
    loggerService_1.logger.info('📦 Eventos:', { context: 'Event', metadata: events });
    res.json({ data: events });
});
exports.myAssignedEventsController = myAssignedEventsController;
const myCompletedEventsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const events = yield (0, eventModel_1.getEventsByUserAndStatus)(user.userEmail, 'completed');
    res.json({ data: events });
});
exports.myCompletedEventsController = myCompletedEventsController;
const availableRequestsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        loggerService_1.logger.info('🔍 Búsqueda avanzada de eventos disponibles:', {
            context: 'Event',
            metadata: {
                musicianId: user.userEmail,
                userRole: user.roll
            }
        });
        // Verificar que el usuario es un músico
        if (user.roll !== 'musico') {
            res.status(403).json({
                success: false,
                message: 'Solo los músicos pueden buscar eventos disponibles'
            });
            return;
        }
        // 1. Obtener eventos básicos disponibles
        const basicEvents = yield (0, eventModel_1.getAvailableEvents)();
        if (basicEvents.length === 0) {
            res.status(200).json({
                success: true,
                message: 'No hay eventos disponibles en este momento',
                data: [],
                searchMetadata: {
                    totalEvents: 0,
                    availableEvents: 0,
                    advancedSearchUsed: true
                }
            });
            return;
        }
        // 2. Verificar estado online del músico
        const musicianStatus = yield musicianStatusService.getStatus(user.userEmail);
        if (!musicianStatus || !musicianStatus.isOnline || !musicianStatus.availability.isAvailable) {
            res.status(400).json({
                success: false,
                message: 'Debes estar online y disponible para ver eventos'
            });
            return;
        }
        // 3. Filtrar eventos por disponibilidad de calendario
        const availableEvents = yield filterEventsByAvailability(basicEvents, user.userEmail);
        // 4. Calcular tarifas para eventos disponibles
        const eventsWithRates = yield calculateRatesForEvents(availableEvents, user.userEmail);
        // 5. Ordenar por relevancia
        eventsWithRates.sort((a, b) => b.relevanceScore - a.relevanceScore);
        loggerService_1.logger.info('✅ Eventos disponibles encontrados con sistemas avanzados:', {
            context: 'Event',
            metadata: {
                totalEvents: basicEvents.length,
                availableEvents: eventsWithRates.length,
                averageRate: eventsWithRates.reduce((sum, e) => sum + (e.calculatedRate || 0), 0) / eventsWithRates.length
            }
        });
        res.status(200).json({
            success: true,
            message: 'Eventos disponibles encontrados',
            data: eventsWithRates,
            searchMetadata: {
                totalEvents: basicEvents.length,
                availableEvents: eventsWithRates.length,
                advancedSearchUsed: true,
                searchTimestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        loggerService_1.logger.error('❌ Error en búsqueda avanzada de eventos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar eventos disponibles',
            error: error.message
        });
    }
});
exports.availableRequestsController = availableRequestsController;
/**
 * Filtrar eventos por disponibilidad de calendario del músico
 */
function filterEventsByAvailability(events, musicianId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            loggerService_1.logger.info('📅 Filtrando eventos por disponibilidad de calendario:', {
                context: 'CalendarCheck',
                metadata: {
                    totalEvents: events.length,
                    musicianId
                }
            });
            const availableEvents = [];
            for (const event of events) {
                try {
                    const eventDateTime = new Date(`${event.date}T${event.time}`);
                    const duration = parseInt(event.duration) || 120;
                    const endDateTime = new Date(eventDateTime.getTime() + duration * 60000);
                    const conflictResult = yield calendarConflictService.checkConflicts({
                        musicianId,
                        startTime: eventDateTime,
                        endTime: endDateTime,
                        location: event.location
                    });
                    if (!conflictResult.hasConflict) {
                        availableEvents.push(Object.assign(Object.assign({}, event), { availabilityChecked: true, conflicts: [], availableSlots: conflictResult.availableSlots }));
                    }
                    else {
                        loggerService_1.logger.info('⚠️ Evento con conflictos de calendario:', {
                            context: 'CalendarCheck',
                            metadata: {
                                eventId: event.id,
                                conflicts: conflictResult.conflicts.length
                            }
                        });
                    }
                }
                catch (error) {
                    loggerService_1.logger.error('❌ Error verificando disponibilidad para evento:', error, {
                        metadata: { eventId: event.id }
                    });
                    // Incluir evento con advertencia
                    availableEvents.push(Object.assign(Object.assign({}, event), { availabilityChecked: false, availabilityError: true }));
                }
            }
            loggerService_1.logger.info('✅ Filtrado de eventos completado:', {
                context: 'CalendarCheck',
                metadata: {
                    originalCount: events.length,
                    availableCount: availableEvents.length
                }
            });
            return availableEvents;
        }
        catch (error) {
            loggerService_1.logger.error('❌ Error en filtrado de eventos:', error);
            return events.map(event => (Object.assign(Object.assign({}, event), { availabilityChecked: false, availabilityError: true })));
        }
    });
}
/**
 * Calcular tarifas para eventos disponibles
 */
function calculateRatesForEvents(events, musicianId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            loggerService_1.logger.info('💰 Calculando tarifas para eventos:', {
                context: 'RateCalculation',
                metadata: {
                    eventsCount: events.length,
                    musicianId
                }
            });
            const eventsWithRates = yield Promise.all(events.map((event) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const eventDateTime = new Date(`${event.date}T${event.time}`);
                    const duration = parseInt(event.duration) || 120;
                    const rateResult = yield rateCalculationService.calculateRate({
                        musicianId,
                        eventType: event.eventType,
                        duration,
                        location: event.location,
                        eventDate: eventDateTime,
                        instrument: event.instrument,
                        isUrgent: false
                    });
                    return Object.assign(Object.assign({}, event), { calculatedRate: rateResult.finalRate, rateBreakdown: rateResult.breakdown, recommendations: rateResult.recommendations, relevanceScore: calculateEventRelevanceScore(event, rateResult.finalRate) });
                }
                catch (error) {
                    loggerService_1.logger.error('❌ Error calculando tarifa para evento:', error, {
                        metadata: { eventId: event.id }
                    });
                    return Object.assign(Object.assign({}, event), { calculatedRate: null, rateBreakdown: null, recommendations: null, relevanceScore: 0 });
                }
            })));
            loggerService_1.logger.info('✅ Cálculo de tarifas completado:', {
                context: 'RateCalculation',
                metadata: {
                    eventsWithRates: eventsWithRates.length,
                    averageRate: eventsWithRates.reduce((sum, e) => sum + (e.calculatedRate || 0), 0) / eventsWithRates.length
                }
            });
            return eventsWithRates;
        }
        catch (error) {
            loggerService_1.logger.error('❌ Error calculando tarifas para eventos:', error);
            return events.map(event => (Object.assign(Object.assign({}, event), { calculatedRate: null, rateBreakdown: null, recommendations: null, relevanceScore: 0 })));
        }
    });
}
/**
 * Calcular score de relevancia para eventos
 */
function calculateEventRelevanceScore(event, rate) {
    // Score basado en presupuesto vs tarifa calculada (40%)
    const budget = parseInt(event.budget) || 0;
    const budgetScore = rate && budget ? Math.max(0, (budget - rate) / budget) * 40 : 20;
    // Score basado en proximidad de fecha (30%)
    const eventDate = new Date(`${event.date}T${event.time}`);
    const daysUntilEvent = Math.max(0, (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const dateScore = Math.max(0, (30 - daysUntilEvent) / 30) * 30;
    // Score basado en tipo de evento (20%)
    const eventTypeScore = getEventTypeScore(event.eventType) * 20;
    // Score basado en ubicación (10%)
    const locationScore = 10; // TODO: Implementar cálculo de proximidad
    return budgetScore + dateScore + eventTypeScore + locationScore;
}
/**
 * Obtener score por tipo de evento
 */
function getEventTypeScore(eventType) {
    const typeScores = {
        'boda': 1.0,
        'evento_corporativo': 0.9,
        'concierto': 0.8,
        'fiesta_privada': 0.7,
        'graduacion': 0.6,
        'cumpleanos': 0.5,
        'culto': 0.4,
        'otro': 0.3
    };
    return typeScores[eventType] || 0.5;
}
const acceptEventController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (user.roll !== 'musico') {
            res.status(403).json({ msg: 'Solo los músicos pueden aceptar eventos.' });
            return;
        }
        const { eventId } = req.params;
        loggerService_1.logger.info('🎵 Músico aceptando evento con verificación avanzada:', {
            context: 'Event',
            metadata: {
                eventId,
                musicianId: user.userEmail
            }
        });
        // 1. Verificar estado online del músico
        const musicianStatus = yield musicianStatusService.getStatus(user.userEmail);
        if (!musicianStatus || !musicianStatus.isOnline || !musicianStatus.availability.isAvailable) {
            res.status(400).json({
                success: false,
                message: 'Debes estar online y disponible para aceptar eventos'
            });
            return;
        }
        // 2. Obtener detalles del evento
        const event = yield (0, eventModel_1.getEventByIdModel)(eventId);
        if (!event) {
            res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
            return;
        }
        // 3. Verificar conflictos de calendario
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        const duration = parseInt(event.duration) || 120;
        const endDateTime = new Date(eventDateTime.getTime() + duration * 60000);
        const conflictResult = yield calendarConflictService.checkConflicts({
            musicianId: user.userEmail,
            startTime: eventDateTime,
            endTime: endDateTime,
            location: event.location
        });
        if (conflictResult.hasConflict) {
            res.status(400).json({
                success: false,
                message: 'Tienes conflictos de calendario para este evento',
                data: {
                    conflicts: conflictResult.conflicts,
                    availableSlots: conflictResult.availableSlots,
                    recommendedTime: conflictResult.recommendedTime
                }
            });
            return;
        }
        // 4. Calcular tarifa automática
        const rateResult = yield rateCalculationService.calculateRate({
            musicianId: user.userEmail,
            eventType: event.eventType,
            duration,
            location: event.location,
            eventDate: eventDateTime,
            instrument: event.instrument,
            isUrgent: false
        });
        // 5. Aceptar el evento
        const updatedEvent = yield (0, eventModel_1.acceptEventModel)(eventId, user.userEmail);
        if (!updatedEvent) {
            res.status(400).json({
                success: false,
                message: 'No se pudo aceptar el evento.'
            });
            return;
        }
        // 6. Agregar evento al calendario
        yield calendarConflictService.addEvent({
            musicianId: user.userEmail,
            eventId: eventId,
            startTime: eventDateTime,
            endTime: endDateTime,
            location: event.location,
            status: 'confirmed'
        });
        // 7. Actualizar estado del músico
        yield musicianStatusService.updateStatus(user.userEmail, {
            isOnline: true,
            availability: {
                isAvailable: false, // Temporalmente no disponible
                availableFrom: endDateTime.toISOString(),
                availableTo: new Date(endDateTime.getTime() + 60 * 60000).toISOString() // 1 hora después
            }
        });
        loggerService_1.logger.info('✅ Evento aceptado con sistemas avanzados:', {
            context: 'Event',
            metadata: {
                eventId,
                musicianId: user.userEmail,
                calculatedRate: rateResult.finalRate,
                conflictsChecked: true,
                calendarUpdated: true
            }
        });
        res.status(200).json({
            success: true,
            message: 'Evento aceptado exitosamente',
            data: {
                event: updatedEvent,
                calculatedRate: rateResult.finalRate,
                rateBreakdown: rateResult.breakdown,
                recommendations: rateResult.recommendations
            }
        });
    }
    catch (error) {
        loggerService_1.logger.error('❌ Error al aceptar evento con sistemas avanzados:', error);
        res.status(500).json({
            success: false,
            message: 'Error al aceptar evento',
            error: error.message
        });
    }
});
exports.acceptEventController = acceptEventController;
const myScheduledEventsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const events = yield (0, eventModel_1.getEventsByMusicianAndStatus)(user.userEmail, 'musician_assigned');
    res.json({ data: events });
});
exports.myScheduledEventsController = myScheduledEventsController;
const myPastPerformancesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const events = yield (0, eventModel_1.getEventsByMusicianAndStatus)(user.userEmail, 'completed');
    res.json({ data: events });
});
exports.myPastPerformancesController = myPastPerformancesController;
const myEventsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    let events = [];
    if (user.roll === 'eventCreator') {
        events = yield (0, eventModel_1.getEventsByUser)(user.userEmail);
    }
    else if (user.roll === 'musico') {
        events = yield (0, eventModel_1.getEventsByMusician)(user.userEmail);
    }
    res.json({ data: events });
});
exports.myEventsController = myEventsController;
const myCancelledEventsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    let events = [];
    if (user.roll === 'eventCreator') {
        // Para organizadores: obtener eventos cancelados que ellos crearon
        events = yield (0, eventModel_1.getEventsByUserAndStatus)(user.userEmail, 'cancelled');
        const musicianCancelledEvents = yield (0, eventModel_1.getEventsByUserAndStatus)(user.userEmail, 'musician_cancelled');
        events = [...events, ...musicianCancelledEvents];
    }
    else if (user.roll === 'musico') {
        // Para músicos: obtener eventos cancelados donde están asignados
        events = yield (0, eventModel_1.getEventsByMusicianAndStatus)(user.userEmail, 'cancelled');
        const musicianCancelledEvents = yield (0, eventModel_1.getEventsByMusicianAndStatus)(user.userEmail, 'musician_cancelled');
        events = [...events, ...musicianCancelledEvents];
    }
    res.json({ data: events });
});
exports.myCancelledEventsController = myCancelledEventsController;
const getEventByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.params;
        const event = yield (0, eventModel_1.getEventByIdModel)(eventId);
        if (!event) {
            res.status(404).json({
                success: false,
                message: 'Evento no encontrado',
            });
            return;
        }
        res.json({
            success: true,
            data: event,
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al obtener el evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el evento',
            error: error instanceof Error ? error.message : 'Error desconocido',
        });
    }
});
exports.getEventByIdController = getEventByIdController;
const cancelEventController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { eventId } = req.params;
        loggerService_1.logger.info('🔄 Cancelando solicitud:', { metadata: { eventId, userEmail: user.userEmail } });
        // Obtener el evento antes de cancelarlo
        const originalEvent = yield (0, eventModel_1.getEventByIdModel)(eventId);
        if (!originalEvent) {
            loggerService_1.logger.info('❌ Solicitud no encontrada:', { metadata: { eventId } });
            res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada',
            });
            return;
        }
        // Verificar permisos
        if (user.roll === 'eventCreator' && originalEvent.user !== user.userEmail) {
            loggerService_1.logger.info('❌ Usuario no autorizado para cancelar esta solicitud');
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para cancelar esta solicitud',
            });
            return;
        }
        if (user.roll === 'musico' &&
            originalEvent.assignedMusicianId !== user.userEmail) {
            loggerService_1.logger.info('❌ Músico no autorizado para cancelar esta solicitud');
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para cancelar esta solicitud',
            });
            return;
        }
        // Cancelar el evento
        const cancelledEvent = yield (0, eventModel_1.cancelEventModel)(eventId, user.userEmail);
        if (!cancelledEvent) {
            loggerService_1.logger.info('❌ Error al cancelar solicitud en la base de datos');
            res.status(500).json({
                success: false,
                message: 'Error al cancelar la solicitud',
            });
            return;
        }
        loggerService_1.logger.info('✅ Solicitud cancelada exitosamente:', { metadata: { eventId } });
        // Comentado temporalmente - notificaciones por socket
        res.json({
            success: true,
            message: 'Solicitud cancelada exitosamente',
            data: cancelledEvent,
        });
    }
    catch (error) {
        loggerService_1.logger.error('❌ Error al cancelar solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cancelar la solicitud',
            error: error instanceof Error ? error.message : 'Error desconocido',
        });
    }
});
exports.cancelEventController = cancelEventController;
const completeEventController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { eventId } = req.params;
        loggerService_1.logger.info('🎵 Completando evento con sistemas avanzados:', {
            context: 'Event',
            metadata: {
                eventId,
                userId: user.userEmail,
                userRole: user.roll
            }
        });
        // 1. Obtener el evento
        const event = yield (0, eventModel_1.getEventByIdModel)(eventId);
        if (!event) {
            res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
            return;
        }
        // 2. Verificar permisos
        const isEventCreator = event.user === user.userEmail;
        const isAssignedMusician = event.assignedMusicianId === user.userEmail;
        if (!isEventCreator && !isAssignedMusician) {
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para completar este evento'
            });
            return;
        }
        // 3. Completar el evento
        const completedEvent = yield (0, eventModel_1.completeEventModel)(eventId, user.userEmail);
        if (!completedEvent) {
            res.status(400).json({
                success: false,
                message: 'No se pudo completar el evento'
            });
            return;
        }
        // 4. Si es el músico quien completa, actualizar su estado
        if (isAssignedMusician) {
            yield musicianStatusService.updateStatus(user.userEmail, {
                isOnline: true,
                availability: {
                    isAvailable: true,
                    availableFrom: new Date().toISOString()
                }
            });
            // Actualizar métricas de rendimiento
            yield updateMusicianPerformance(user.userEmail, event);
        }
        // 5. Remover evento del calendario
        try {
            const eventDateTime = new Date(`${event.date}T${event.time}`);
            const duration = parseInt(event.duration) || 120;
            const endDateTime = new Date(eventDateTime.getTime() + duration * 60000);
            // Buscar y eliminar el evento del calendario
            const calendarEvents = yield calendarConflictService.getMusicianEvents(user.userEmail, eventDateTime, endDateTime);
            const calendarEvent = calendarEvents.find(e => e.eventId === eventId);
            if (calendarEvent) {
                yield calendarConflictService.removeEvent(calendarEvent.id);
                loggerService_1.logger.info('📅 Evento removido del calendario:', {
                    context: 'Calendar',
                    metadata: {
                        calendarEventId: calendarEvent.id,
                        eventId
                    }
                });
            }
        }
        catch (error) {
            loggerService_1.logger.error('❌ Error removiendo evento del calendario:', error);
            // No fallar la operación principal por este error
        }
        // 6. Actualizar datos del mercado si es el músico
        if (isAssignedMusician) {
            try {
                const eventDateTime = new Date(`${event.date}T${event.time}`);
                const duration = parseInt(event.duration) || 120;
                // Obtener tarifa calculada para actualizar datos del mercado
                const rateResult = yield rateCalculationService.calculateRate({
                    musicianId: user.userEmail,
                    eventType: event.eventType,
                    duration,
                    location: event.location,
                    eventDate: eventDateTime,
                    instrument: event.instrument,
                    isUrgent: false
                });
                // Actualizar datos del mercado
                yield rateCalculationService.updateMarketData(event.instrument, event.location, event.eventType, rateResult.finalRate);
                loggerService_1.logger.info('📊 Datos del mercado actualizados:', {
                    context: 'MarketData',
                    metadata: {
                        instrument: event.instrument,
                        location: event.location,
                        eventType: event.eventType,
                        rate: rateResult.finalRate
                    }
                });
            }
            catch (error) {
                loggerService_1.logger.error('❌ Error actualizando datos del mercado:', error);
                // No fallar la operación principal por este error
            }
        }
        loggerService_1.logger.info('✅ Evento completado con sistemas avanzados:', {
            context: 'Event',
            metadata: {
                eventId,
                completedBy: user.userEmail,
                userRole: user.roll,
                calendarUpdated: true,
                marketDataUpdated: isAssignedMusician
            }
        });
        res.status(200).json({
            success: true,
            message: 'Evento completado exitosamente',
            data: completedEvent
        });
    }
    catch (error) {
        loggerService_1.logger.error('❌ Error completando evento con sistemas avanzados:', error);
        res.status(500).json({
            success: false,
            message: 'Error al completar evento',
            error: error.message
        });
    }
});
exports.completeEventController = completeEventController;
/**
 * Actualizar métricas de rendimiento del músico
 */
function updateMusicianPerformance(musicianId, event) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            loggerService_1.logger.info('📈 Actualizando métricas de rendimiento del músico:', {
                context: 'Performance',
                metadata: {
                    musicianId,
                    eventId: event.id
                }
            });
            // Obtener métricas actuales
            const currentPerformance = yield musicianStatusService.getStatus(musicianId);
            if (!currentPerformance) {
                loggerService_1.logger.warn('⚠️ No se encontraron métricas de rendimiento para el músico:', {
                    context: 'Performance',
                    metadata: { musicianId }
                });
                return;
            }
            // Calcular nuevas métricas
            const newTotalEvents = currentPerformance.performance.totalEvents + 1;
            const newCompletedEvents = currentPerformance.performance.completedEvents + 1;
            const completionRate = newCompletedEvents / newTotalEvents;
            // Actualizar métricas
            yield musicianStatusService.updatePerformance(musicianId, {
                totalEvents: newTotalEvents,
                completedEvents: newCompletedEvents,
                // Mantener rating y responseTime como están
                rating: currentPerformance.performance.rating,
                responseTime: currentPerformance.performance.responseTime
            });
            loggerService_1.logger.info('✅ Métricas de rendimiento actualizadas:', {
                context: 'Performance',
                metadata: {
                    musicianId,
                    newTotalEvents,
                    newCompletedEvents,
                    completionRate
                }
            });
        }
        catch (error) {
            loggerService_1.logger.error('❌ Error actualizando métricas de rendimiento:', error, {
                metadata: { musicianId }
            });
        }
    });
}
const deleteEventController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { eventId } = req.params;
        loggerService_1.logger.info('🗑️ Eliminando evento:', { metadata: { eventId, userEmail: user.userEmail } });
        const deletedEvent = yield (0, eventModel_1.deleteEventModel)(eventId, user.userEmail);
        if (!deletedEvent) {
            res.status(404).json({
                success: false,
                message: 'Evento no encontrado o no tienes permisos para eliminarlo',
            });
            return;
        }
        loggerService_1.logger.info('✅ Evento eliminado exitosamente:', { metadata: { eventId } });
        res.json({
            success: true,
            message: 'Evento eliminado exitosamente',
            data: deletedEvent,
        });
    }
    catch (error) {
        loggerService_1.logger.error('❌ Error al eliminar evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar evento',
            error: error instanceof Error ? error.message : 'Error desconocido',
        });
    }
});
exports.deleteEventController = deleteEventController;
/**
 * GET /events/advanced/:eventId
 * Obtener evento con información avanzada integrada
 */
const getEventWithAdvancedInfoController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { eventId } = req.params;
        loggerService_1.logger.info('🔍 Obteniendo evento con información avanzada:', {
            context: 'Event',
            metadata: {
                eventId,
                userId: user.userEmail
            }
        });
        // 1. Obtener evento básico
        const event = yield (0, eventModel_1.getEventByIdModel)(eventId);
        if (!event) {
            res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
            return;
        }
        // 2. Verificar permisos
        const isEventCreator = event.user === user.userEmail;
        const isAssignedMusician = event.assignedMusicianId === user.userEmail;
        const isAdmin = user.roll === 'admin' || user.roll === 'superadmin';
        if (!isEventCreator && !isAssignedMusician && !isAdmin) {
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver este evento'
            });
            return;
        }
        // 3. Obtener información avanzada
        const advancedInfo = yield getAdvancedEventInfo(event, user.userEmail);
        const enhancedEvent = Object.assign(Object.assign({}, event), { advancedInfo });
        loggerService_1.logger.info('✅ Evento con información avanzada obtenido:', {
            context: 'Event',
            metadata: {
                eventId,
                hasAdvancedInfo: !!advancedInfo,
                musicianStatus: (advancedInfo === null || advancedInfo === void 0 ? void 0 : advancedInfo.musicianStatus) ? 'available' : 'unavailable'
            }
        });
        res.status(200).json({
            success: true,
            message: 'Evento obtenido exitosamente',
            data: enhancedEvent
        });
    }
    catch (error) {
        loggerService_1.logger.error('❌ Error obteniendo evento con información avanzada:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener evento',
            error: error.message
        });
    }
});
exports.getEventWithAdvancedInfoController = getEventWithAdvancedInfoController;
/**
 * Obtener información avanzada del evento
 */
function getAdvancedEventInfo(event, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const advancedInfo = {};
            // 1. Información del músico asignado (si existe)
            if (event.assignedMusicianId) {
                try {
                    const musicianStatus = yield musicianStatusService.getStatus(event.assignedMusicianId);
                    advancedInfo.musicianStatus = musicianStatus;
                    // Calcular tarifa para el músico asignado
                    const eventDateTime = new Date(`${event.date}T${event.time}`);
                    const duration = parseInt(event.duration) || 120;
                    const rateResult = yield rateCalculationService.calculateRate({
                        musicianId: event.assignedMusicianId,
                        eventType: event.eventType,
                        duration,
                        location: event.location,
                        eventDate: eventDateTime,
                        instrument: event.instrument,
                        isUrgent: false
                    });
                    advancedInfo.calculatedRate = rateResult.finalRate;
                    advancedInfo.rateBreakdown = rateResult.breakdown;
                    advancedInfo.recommendations = rateResult.recommendations;
                }
                catch (error) {
                    loggerService_1.logger.error('❌ Error obteniendo información del músico:', error);
                    advancedInfo.musicianStatus = null;
                    advancedInfo.calculatedRate = null;
                }
            }
            // 2. Verificar conflictos de calendario (si es el músico asignado)
            if (event.assignedMusicianId === userId) {
                try {
                    const eventDateTime = new Date(`${event.date}T${event.time}`);
                    const duration = parseInt(event.duration) || 120;
                    const endDateTime = new Date(eventDateTime.getTime() + duration * 60000);
                    const conflictResult = yield calendarConflictService.checkConflicts({
                        musicianId: userId,
                        startTime: eventDateTime,
                        endTime: endDateTime,
                        location: event.location
                    });
                    advancedInfo.calendarConflicts = conflictResult.conflicts;
                    advancedInfo.hasConflicts = conflictResult.hasConflict;
                    advancedInfo.availableSlots = conflictResult.availableSlots;
                }
                catch (error) {
                    loggerService_1.logger.error('❌ Error verificando conflictos de calendario:', error);
                    advancedInfo.calendarConflicts = [];
                    advancedInfo.hasConflicts = false;
                }
            }
            // 3. Información de disponibilidad de músicos (si es el creador del evento)
            if (event.user === userId && event.status === 'pending_musician') {
                try {
                    const availableMusicians = yield findAvailableMusiciansWithAdvancedSystems(event);
                    advancedInfo.availableMusicians = availableMusicians;
                    advancedInfo.availableMusiciansCount = availableMusicians.length;
                }
                catch (error) {
                    loggerService_1.logger.error('❌ Error obteniendo músicos disponibles:', error);
                    advancedInfo.availableMusicians = [];
                    advancedInfo.availableMusiciansCount = 0;
                }
            }
            // 4. Estadísticas del mercado
            try {
                const marketData = yield rateCalculationService.getPublicMarketData(event.instrument, event.location, event.eventType);
                advancedInfo.marketData = marketData;
            }
            catch (error) {
                loggerService_1.logger.error('❌ Error obteniendo datos del mercado:', error);
                advancedInfo.marketData = null;
            }
            return advancedInfo;
        }
        catch (error) {
            loggerService_1.logger.error('❌ Error obteniendo información avanzada del evento:', error);
            return null;
        }
    });
}
/**
 * POST /events/heartbeat
 * Sistema de heartbeat para mantener estado online de músicos
 */
const musicianHeartbeatController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { location, availability } = req.body;
        loggerService_1.logger.info('💓 Heartbeat del músico con sistemas avanzados:', {
            context: 'Heartbeat',
            metadata: {
                musicianId: user.userEmail,
                hasLocation: !!location,
                availability: availability
            }
        });
        // Verificar que el usuario es un músico
        if (user.roll !== 'musico') {
            res.status(403).json({
                success: false,
                message: 'Solo los músicos pueden usar el sistema de heartbeat'
            });
            return;
        }
        // 1. Actualizar estado del músico
        const updateData = {
            isOnline: true
        };
        if (location) {
            updateData.currentLocation = location;
        }
        if (availability) {
            updateData.availability = availability;
        }
        const updatedStatus = yield musicianStatusService.updateStatus(user.userEmail, updateData);
        // 2. Verificar eventos próximos
        const upcomingEvents = yield getUpcomingEventsForMusician(user.userEmail);
        // 3. Calcular métricas de rendimiento
        const performanceMetrics = yield calculatePerformanceMetrics(user.userEmail);
        // 4. Verificar conflictos de calendario próximos
        const upcomingConflicts = yield checkUpcomingConflicts(user.userEmail);
        loggerService_1.logger.info('✅ Heartbeat procesado exitosamente:', {
            context: 'Heartbeat',
            metadata: {
                musicianId: user.userEmail,
                upcomingEvents: upcomingEvents.length,
                hasConflicts: upcomingConflicts.length > 0,
                performanceUpdated: true
            }
        });
        res.status(200).json({
            success: true,
            message: 'Heartbeat registrado exitosamente',
            data: {
                status: updatedStatus,
                upcomingEvents,
                performanceMetrics,
                upcomingConflicts,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        loggerService_1.logger.error('❌ Error en heartbeat del músico:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar heartbeat',
            error: error.message
        });
    }
});
exports.musicianHeartbeatController = musicianHeartbeatController;
/**
 * Obtener eventos próximos para el músico
 */
function getUpcomingEventsForMusician(musicianId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const now = new Date();
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const events = yield (0, eventModel_1.getEventsByMusicianAndStatus)(musicianId, 'musician_assigned');
            const upcomingEvents = events.filter(event => {
                const eventDate = new Date(`${event.date}T${event.time}`);
                return eventDate >= now && eventDate <= nextWeek;
            });
            return upcomingEvents.map(event => ({
                id: event.id,
                eventName: event.eventName,
                date: event.date,
                time: event.time,
                location: event.location,
                duration: event.duration,
                daysUntilEvent: Math.ceil((new Date(`${event.date}T${event.time}`).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            }));
        }
        catch (error) {
            loggerService_1.logger.error('❌ Error obteniendo eventos próximos:', error);
            return [];
        }
    });
}
/**
 * Calcular métricas de rendimiento del músico
 */
function calculatePerformanceMetrics(musicianId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const status = yield musicianStatusService.getStatus(musicianId);
            if (!status) {
                return null;
            }
            const performance = status.performance;
            const completionRate = performance.totalEvents > 0 ?
                (performance.completedEvents / performance.totalEvents) * 100 : 0;
            return {
                rating: performance.rating,
                totalEvents: performance.totalEvents,
                completedEvents: performance.completedEvents,
                completionRate: Math.round(completionRate * 100) / 100,
                averageResponseTime: performance.responseTime,
                isOnline: status.isOnline,
                isAvailable: status.availability.isAvailable
            };
        }
        catch (error) {
            loggerService_1.logger.error('❌ Error calculando métricas de rendimiento:', error);
            return null;
        }
    });
}
/**
 * Verificar conflictos de calendario próximos
 */
function checkUpcomingConflicts(musicianId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const now = new Date();
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const events = yield calendarConflictService.getMusicianEvents(musicianId, now, nextWeek);
            // Verificar conflictos potenciales (eventos muy cercanos)
            const potentialConflicts = events.filter(event => {
                const timeBetweenEvents = 60; // 1 hora entre eventos
                const eventEnd = new Date(event.endTime.getTime() + timeBetweenEvents * 60000);
                return events.some(otherEvent => otherEvent.id !== event.id &&
                    otherEvent.startTime < eventEnd &&
                    otherEvent.endTime > event.startTime);
            });
            return potentialConflicts.map(event => ({
                id: event.id,
                eventId: event.eventId,
                startTime: event.startTime,
                endTime: event.endTime,
                location: event.location,
                status: event.status
            }));
        }
        catch (error) {
            loggerService_1.logger.error('❌ Error verificando conflictos próximos:', error);
            return [];
        }
    });
}
