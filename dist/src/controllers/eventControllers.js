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
exports.myPastPerformancesController = exports.myScheduledEventsController = exports.acceptEventController = exports.availableRequestsController = exports.myCompletedEventsController = exports.myAssignedEventsController = exports.myPendingEventsController = exports.requestMusicianController = void 0;
const eventModel_1 = require("../models/eventModel");
const index_1 = require("../../index");
// POST /events/request-musician
const requestMusicianController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user || user.roll !== 'organizer') {
            res.status(403).json({ msg: "Solo los organizadores pueden crear solicitudes." });
            return;
        }
        const eventData = req.body;
        const event = yield (0, eventModel_1.createEventModel)(Object.assign(Object.assign({}, eventData), { user: user.userEmail }));
        index_1.io.emit('new_event_request', event);
        res.status(201).json(event);
    }
    catch (error) {
        res.status(500).json({ msg: "Error al crear el evento.", error });
    }
});
exports.requestMusicianController = requestMusicianController;
const myPendingEventsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const events = yield (0, eventModel_1.getEventsByUserAndStatus)(user.userEmail, 'pending_musician');
    res.json(events);
});
exports.myPendingEventsController = myPendingEventsController;
const myAssignedEventsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const events = yield (0, eventModel_1.getEventsByUserAndStatus)(user.userEmail, 'musician_assigned');
    res.json(events);
});
exports.myAssignedEventsController = myAssignedEventsController;
const myCompletedEventsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const events = yield (0, eventModel_1.getEventsByUserAndStatus)(user.userEmail, 'completed');
    res.json(events);
});
exports.myCompletedEventsController = myCompletedEventsController;
const availableRequestsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const events = yield (0, eventModel_1.getAvailableEvents)();
    res.json(events);
});
exports.availableRequestsController = availableRequestsController;
const acceptEventController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user || user.roll !== 'musician') {
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
            index_1.io.to(organizerSocketId).emit('musician_accepted', updatedEvent);
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
    res.json(events);
});
exports.myScheduledEventsController = myScheduledEventsController;
const myPastPerformancesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const events = yield (0, eventModel_1.getEventsByMusicianAndStatus)(user.userEmail, 'completed');
    res.json(events);
});
exports.myPastPerformancesController = myPastPerformancesController;
