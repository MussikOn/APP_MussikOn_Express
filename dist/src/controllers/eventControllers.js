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
exports.deleteEventController = exports.completeEventController = exports.cancelEventController = exports.getEventByIdController = exports.myCancelledEventsController = exports.myEventsController = exports.myPastPerformancesController = exports.myScheduledEventsController = exports.acceptEventController = exports.availableRequestsController = exports.myCompletedEventsController = exports.myAssignedEventsController = exports.myPendingEventsController = exports.requestMusicianController = void 0;
const loggerService_1 = require("../services/loggerService");
const eventModel_1 = require("../models/eventModel");
// Comentado temporalmente para evitar dependencias circulares
// import { io, users } from "../../index";
// POST /events/request-musician
const requestMusicianController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const eventData = req.body;
        loggerService_1.logger.info('Payload recibido en /events/request-musician:', { context: 'Event', metadata: eventData });
        const event = yield (0, eventModel_1.createEventModel)(Object.assign(Object.assign({}, eventData), { user: user.userEmail }));
        // io.emit('new_event_request', event); // Comentado temporalmente
        res.status(201).json({ data: event });
    }
    catch (error) {
        loggerService_1.logger.error('Error al crear solicitud:', error);
        res.status(500).json({ msg: 'Error al crear solicitud' });
    }
});
exports.requestMusicianController = requestMusicianController;
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
    const events = yield (0, eventModel_1.getAvailableEvents)();
    res.json({ data: events });
});
exports.availableRequestsController = availableRequestsController;
const acceptEventController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (user.roll !== 'musico') {
            res.status(403).json({ msg: 'Solo los músicos pueden aceptar eventos.' });
            return;
        }
        const { eventId } = req.params;
        const updatedEvent = yield (0, eventModel_1.acceptEventModel)(eventId, user.userEmail);
        if (!updatedEvent) {
            res.status(400).json({ msg: 'No se pudo aceptar el evento.' });
            return;
        }
        // Comentado temporalmente - notificaciones por socket
        res.json(updatedEvent);
    }
    catch (error) {
        loggerService_1.logger.error('Error al aceptar evento:', error);
        res.status(500).json({ msg: 'Error al aceptar evento' });
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
        loggerService_1.logger.info('🔄 Completando solicitud:', { metadata: { eventId, userEmail: user.userEmail } });
        // Obtener el evento antes de completarlo
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
            loggerService_1.logger.info('❌ Usuario no autorizado para completar esta solicitud');
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para completar esta solicitud',
            });
            return;
        }
        if (user.roll === 'musico' &&
            originalEvent.assignedMusicianId !== user.userEmail) {
            loggerService_1.logger.info('❌ Músico no autorizado para completar esta solicitud');
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para completar esta solicitud',
            });
            return;
        }
        // Completar el evento
        const completedEvent = yield (0, eventModel_1.completeEventModel)(eventId, user.userEmail);
        if (!completedEvent) {
            loggerService_1.logger.info('❌ Error al completar solicitud en la base de datos');
            res.status(500).json({
                success: false,
                message: 'Error al completar la solicitud',
            });
            return;
        }
        loggerService_1.logger.info('✅ Solicitud completada exitosamente:', { metadata: { eventId } });
        // Comentado temporalmente - notificaciones por socket
        const response = {
            success: true,
            message: 'Solicitud completada exitosamente',
            data: completedEvent,
        };
        res.json(response);
    }
    catch (error) {
        loggerService_1.logger.error('❌ Error al completar solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error al completar la solicitud',
            error: error instanceof Error ? error.message : 'Error desconocido',
        });
    }
});
exports.completeEventController = completeEventController;
const deleteEventController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { eventId } = req.params;
        loggerService_1.logger.info('🗑️ Eliminando solicitud:', { metadata: { eventId, userEmail: user.userEmail } });
        // Obtener el evento antes de eliminarlo
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
        if (user.roll !== 'eventCreator') {
            loggerService_1.logger.info('❌ Solo los organizadores pueden eliminar solicitudes');
            res.status(403).json({
                success: false,
                message: 'Solo los organizadores pueden eliminar solicitudes',
            });
            return;
        }
        if (originalEvent.user !== user.userEmail) {
            loggerService_1.logger.info('❌ Usuario no autorizado para eliminar esta solicitud');
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para eliminar esta solicitud',
            });
            return;
        }
        // Eliminar el evento
        const deleteResult = yield (0, eventModel_1.deleteEventModel)(eventId, user.userEmail);
        if (!deleteResult) {
            loggerService_1.logger.info('❌ Error al eliminar solicitud en la base de datos');
            res.status(500).json({
                success: false,
                message: 'Error al eliminar la solicitud',
            });
            return;
        }
        loggerService_1.logger.info('✅ Solicitud eliminada exitosamente:', { metadata: { eventId } });
        // Comentado temporalmente - notificaciones por socket
        res.json({
            success: true,
            message: 'Solicitud eliminada exitosamente',
        });
    }
    catch (error) {
        loggerService_1.logger.error('❌ Error al eliminar solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la solicitud',
            error: error instanceof Error ? error.message : 'Error desconocido',
        });
    }
});
exports.deleteEventController = deleteEventController;
