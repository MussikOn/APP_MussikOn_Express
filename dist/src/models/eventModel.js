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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEventModel = exports.completeEventModel = exports.cancelEventModel = exports.getEventByIdModel = exports.getEventsByMusician = exports.getEventsByUser = exports.getEventsByMusicianAndStatus = exports.acceptEventModel = exports.getAvailableEvents = exports.getEventsByUserAndStatus = exports.createEventModel = void 0;
const firebase_1 = require("../utils/firebase");
const createEventModel = (eventData) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date().toISOString();
    const eventRef = firebase_1.db.collection("events").doc();
    const event = Object.assign(Object.assign({}, eventData), { id: eventRef.id, status: 'pending_musician', createdAt: now, updatedAt: now, interestedMusicians: [] });
    yield eventRef.set(event);
    console.log('Evento guardado:', event);
    return event;
});
exports.createEventModel = createEventModel;
const getEventsByUserAndStatus = (userEmail, status) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield firebase_1.db.collection("events")
        .where("user", "==", userEmail)
        .where("status", "==", status)
        .get();
    return snapshot.docs.map(doc => doc.data());
});
exports.getEventsByUserAndStatus = getEventsByUserAndStatus;
const getAvailableEvents = () => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield firebase_1.db.collection("events")
        .where("status", "==", "pending_musician")
        .get();
    console.log('Eventos encontrados en BD:', snapshot.docs.length);
    return snapshot.docs.map(doc => doc.data());
});
exports.getAvailableEvents = getAvailableEvents;
const acceptEventModel = (eventId, musicianId) => __awaiter(void 0, void 0, void 0, function* () {
    const eventRef = firebase_1.db.collection("events").doc(eventId);
    const eventSnap = yield eventRef.get();
    if (!eventSnap.exists)
        return null;
    const event = eventSnap.data();
    if (event.status !== 'pending_musician')
        return null;
    const updatedEvent = Object.assign(Object.assign({}, event), { status: 'musician_assigned', assignedMusicianId: musicianId, updatedAt: new Date().toISOString() });
    const { id } = updatedEvent, updateFields = __rest(updatedEvent, ["id"]);
    yield eventRef.update(updateFields);
    return updatedEvent;
});
exports.acceptEventModel = acceptEventModel;
const getEventsByMusicianAndStatus = (musicianId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield firebase_1.db.collection("events")
        .where("assignedMusicianId", "==", musicianId)
        .where("status", "==", status)
        .get();
    return snapshot.docs.map(doc => doc.data());
});
exports.getEventsByMusicianAndStatus = getEventsByMusicianAndStatus;
const getEventsByUser = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield firebase_1.db.collection("events")
        .where("user", "==", userEmail)
        .get();
    return snapshot.docs.map(doc => doc.data());
});
exports.getEventsByUser = getEventsByUser;
const getEventsByMusician = (musicianId) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield firebase_1.db.collection("events")
        .where("assignedMusicianId", "==", musicianId)
        .get();
    return snapshot.docs.map(doc => doc.data());
});
exports.getEventsByMusician = getEventsByMusician;
const getEventByIdModel = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const eventRef = firebase_1.db.collection("events").doc(eventId);
    const eventSnap = yield eventRef.get();
    if (!eventSnap.exists)
        return null;
    return eventSnap.data();
});
exports.getEventByIdModel = getEventByIdModel;
const cancelEventModel = (eventId, cancelledBy) => __awaiter(void 0, void 0, void 0, function* () {
    const eventRef = firebase_1.db.collection("events").doc(eventId);
    const eventSnap = yield eventRef.get();
    if (!eventSnap.exists)
        return null;
    const event = eventSnap.data();
    const updatedEvent = Object.assign(Object.assign({}, event), { status: 'cancelled', updatedAt: new Date().toISOString() });
    const { id } = updatedEvent, updateFields = __rest(updatedEvent, ["id"]);
    yield eventRef.update(updateFields);
    return updatedEvent;
});
exports.cancelEventModel = cancelEventModel;
const completeEventModel = (eventId, completedBy) => __awaiter(void 0, void 0, void 0, function* () {
    const eventRef = firebase_1.db.collection("events").doc(eventId);
    const eventSnap = yield eventRef.get();
    if (!eventSnap.exists)
        return null;
    const event = eventSnap.data();
    const updatedEvent = Object.assign(Object.assign({}, event), { status: 'completed', updatedAt: new Date().toISOString() });
    const { id } = updatedEvent, updateFields = __rest(updatedEvent, ["id"]);
    yield eventRef.update(updateFields);
    return updatedEvent;
});
exports.completeEventModel = completeEventModel;
const deleteEventModel = (eventId, deletedBy) => __awaiter(void 0, void 0, void 0, function* () {
    const eventRef = firebase_1.db.collection("events").doc(eventId);
    const eventSnap = yield eventRef.get();
    if (!eventSnap.exists)
        return null;
    const event = eventSnap.data();
    // Verificar que solo el organizador puede eliminar el evento
    if (event.user !== deletedBy) {
        throw new Error('Solo el organizador puede eliminar este evento');
    }
    // Eliminar el documento completamente
    yield eventRef.delete();
    console.log('Evento eliminado completamente:', eventId);
    return { success: true, eventId };
});
exports.deleteEventModel = deleteEventModel;
