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
const eventModel_1 = require("../models/eventModel");
const index_1 = require("../../index");
// POST /events/request-musician
const requestMusicianController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user || user.roll !== 'eventCreator') {
            console.log("[src/controllers/eventControllers.ts:22] Usuario no autorizado:", user);
            res.status(403).json({ msg: "Solo los organizadores pueden crear solicitudes." });
            return;
        }
        const eventData = req.body;
        console.log('[src/controllers/eventControllers.ts:27] Payload recibido en /events/request-musician:', eventData);
        const event = yield (0, eventModel_1.createEventModel)(Object.assign(Object.assign({}, eventData), { user: user.userEmail }));
        index_1.io.emit('new_event_request', event);
        res.status(201).json({ data: event });
    }
    catch (error) {
        console.error('[src/controllers/eventControllers.ts:31] Error al crear el evento:', error);
        res.status(500).json({ msg: "Error al crear el evento.", error });
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
    console.log('[src/controllers/eventControllers.ts:45] 🔍 Buscando eventos asignados para:', user.userEmail);
    const events = yield (0, eventModel_1.getEventsByUserAndStatus)(user.userEmail, 'musician_assigned');
    console.log('[src/controllers/eventControllers.ts:47] 📦 Eventos asignados encontrados:', events.length);
    console.log('[src/controllers/eventControllers.ts:48] 📦 Eventos:', events);
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
        if (!user || user.roll !== 'musico') {
            res.status(403).json({ msg: "Solo los músicos pueden aceptar eventos." });
            return;
        }
        const { eventId } = req.params;
        const updatedEvent = yield (0, eventModel_1.acceptEventModel)(eventId, user.userEmail);
        if (!updatedEvent) {
            res.status(400).json({ msg: "No se pudo aceptar el evento." });
            return;
        }
        const organizerSocketId = index_1.users[updatedEvent.user];
        if (organizerSocketId) {
            console.log('[src/controllers/eventControllers.ts:78] Mapping actual de usuarios:', index_1.users);
            console.log('[src/controllers/eventControllers.ts:79] Emitiendo musician_accepted a socket:', organizerSocketId, 'para usuario:', updatedEvent.user, 'payload:', {
                requestId: updatedEvent.id,
                musician: {
                    name: user.name,
                    email: user.userEmail,
                    instrument: updatedEvent.instrument,
                },
                event: updatedEvent
            });
            index_1.io.to(organizerSocketId).emit('musician_accepted', {
                requestId: updatedEvent.id,
                musician: {
                    name: user.name,
                    email: user.userEmail,
                    instrument: updatedEvent.instrument,
                },
                event: updatedEvent
            });
        }
        res.json(updatedEvent);
    }
    catch (error) {
        res.status(500).json({ msg: "Error al aceptar el evento.", error });
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
// GET /events/:eventId
const getEventByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.params;
        const event = yield (0, eventModel_1.getEventByIdModel)(eventId);
        if (!event) {
            res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
            return;
        }
        res.json({
            success: true,
            data: event,
            message: 'Evento encontrado exitosamente'
        });
    }
    catch (error) {
        console.error('Error al obtener el evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el evento',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.getEventByIdController = getEventByIdController;
// PATCH /events/:eventId/cancel
const cancelEventController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { eventId } = req.params;
        console.log('🔄 Cancelando solicitud:', eventId, 'por usuario:', user.userEmail);
        // Obtener el evento antes de cancelarlo
        const originalEvent = yield (0, eventModel_1.getEventByIdModel)(eventId);
        if (!originalEvent) {
            console.log('❌ Solicitud no encontrada:', eventId);
            res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            });
            return;
        }
        // Verificar que el usuario puede cancelar esta solicitud
        if (user.roll === 'eventCreator' && originalEvent.user !== user.userEmail) {
            console.log('❌ Usuario no autorizado para cancelar esta solicitud');
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para cancelar esta solicitud'
            });
            return;
        }
        if (user.roll === 'musico' && originalEvent.assignedMusicianId !== user.userEmail) {
            console.log('❌ Músico no autorizado para cancelar esta solicitud');
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para cancelar esta solicitud'
            });
            return;
        }
        // Cancelar el evento
        const cancelledEvent = yield (0, eventModel_1.cancelEventModel)(eventId, user.userEmail);
        if (!cancelledEvent) {
            console.log('❌ Error al cancelar solicitud en la base de datos');
            res.status(500).json({
                success: false,
                message: 'Error al cancelar la solicitud'
            });
            return;
        }
        console.log('✅ Solicitud cancelada exitosamente:', eventId);
        // Enviar notificación al músico asignado si existe
        if (originalEvent.assignedMusicianId && user.roll === 'eventCreator') {
            const musicianSocketId = index_1.users[originalEvent.assignedMusicianId];
            if (musicianSocketId) {
                console.log('📢 Enviando notificación de cancelación al músico:', originalEvent.assignedMusicianId);
                index_1.io.to(musicianSocketId).emit('request_cancelled', {
                    eventId: cancelledEvent.id,
                    cancelledBy: user.userEmail,
                    event: cancelledEvent
                });
            }
        }
        // Enviar notificación al organizador si el músico cancela
        if (user.roll === 'musico' && originalEvent.user) {
            const organizerSocketId = index_1.users[originalEvent.user];
            if (organizerSocketId) {
                console.log('📢 Enviando notificación de cancelación al organizador:', originalEvent.user);
                index_1.io.to(organizerSocketId).emit('request_cancelled_by_musician', {
                    eventId: cancelledEvent.id,
                    cancelledBy: user.userEmail,
                    event: cancelledEvent
                });
            }
        }
        const response = {
            success: true,
            message: 'Solicitud cancelada correctamente',
            eventId,
            assignedMusician: originalEvent.assignedMusicianId,
            cancelledBy: user.userEmail
        };
        res.json(response);
    }
    catch (error) {
        console.error('❌ Error al cancelar solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cancelar la solicitud',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.cancelEventController = cancelEventController;
// PATCH /events/:eventId/complete
const completeEventController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { eventId } = req.params;
        console.log('🔄 Completando solicitud:', eventId, 'por usuario:', user.userEmail);
        // Obtener el evento antes de completarlo
        const originalEvent = yield (0, eventModel_1.getEventByIdModel)(eventId);
        if (!originalEvent) {
            console.log('❌ Solicitud no encontrada:', eventId);
            res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            });
            return;
        }
        // Verificar que el usuario puede completar esta solicitud
        if (user.roll === 'eventCreator' && originalEvent.user !== user.userEmail) {
            console.log('❌ Usuario no autorizado para completar esta solicitud');
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para completar esta solicitud'
            });
            return;
        }
        if (user.roll === 'musico' && originalEvent.assignedMusicianId !== user.userEmail) {
            console.log('❌ Músico no autorizado para completar esta solicitud');
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para completar esta solicitud'
            });
            return;
        }
        // Completar el evento
        const completedEvent = yield (0, eventModel_1.completeEventModel)(eventId, user.userEmail);
        if (!completedEvent) {
            console.log('❌ Error al completar solicitud en la base de datos');
            res.status(500).json({
                success: false,
                message: 'Error al completar la solicitud'
            });
            return;
        }
        console.log('✅ Solicitud completada exitosamente:', eventId);
        // Enviar notificación al organizador
        const organizerSocketId = index_1.users[originalEvent.user];
        if (organizerSocketId) {
            index_1.io.to(organizerSocketId).emit('request_completed', {
                eventId: completedEvent.id,
                completedBy: user.userEmail,
                event: completedEvent
            });
        }
        const response = {
            success: true,
            message: 'Solicitud marcada como completada',
            eventId
        };
        res.json(response);
    }
    catch (error) {
        console.error('❌ Error al completar solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error al completar la solicitud',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.completeEventController = completeEventController;
// DELETE /events/:eventId
const deleteEventController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { eventId } = req.params;
        console.log('🗑️ Eliminando solicitud:', eventId, 'por usuario:', user.userEmail);
        // Obtener el evento antes de eliminarlo
        const originalEvent = yield (0, eventModel_1.getEventByIdModel)(eventId);
        if (!originalEvent) {
            console.log('❌ Solicitud no encontrada:', eventId);
            res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            });
            return;
        }
        // Verificar que solo el organizador puede eliminar
        if (user.roll !== 'eventCreator') {
            console.log('❌ Solo los organizadores pueden eliminar solicitudes');
            res.status(403).json({
                success: false,
                message: 'Solo los organizadores pueden eliminar solicitudes'
            });
            return;
        }
        if (originalEvent.user !== user.userEmail) {
            console.log('❌ Usuario no autorizado para eliminar esta solicitud');
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para eliminar esta solicitud'
            });
            return;
        }
        // Eliminar el evento
        const deleteResult = yield (0, eventModel_1.deleteEventModel)(eventId, user.userEmail);
        if (!deleteResult) {
            console.log('❌ Error al eliminar solicitud en la base de datos');
            res.status(500).json({
                success: false,
                message: 'Error al eliminar la solicitud'
            });
            return;
        }
        console.log('✅ Solicitud eliminada exitosamente:', eventId);
        // Enviar notificación al músico asignado si existe
        if (originalEvent.assignedMusicianId) {
            const musicianSocketId = index_1.users[originalEvent.assignedMusicianId];
            if (musicianSocketId) {
                console.log('📢 Enviando notificación de eliminación al músico:', originalEvent.assignedMusicianId);
                index_1.io.to(musicianSocketId).emit('request_deleted', {
                    eventId: eventId,
                    deletedBy: user.userEmail,
                    event: originalEvent
                });
            }
        }
        const response = {
            success: true,
            message: 'Solicitud eliminada correctamente',
            eventId,
            deletedBy: user.userEmail
        };
        res.json(response);
    }
    catch (error) {
        console.error('❌ Error al eliminar solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la solicitud',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.deleteEventController = deleteEventController;
