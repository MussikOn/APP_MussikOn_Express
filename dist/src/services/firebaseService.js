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
exports.firebaseEventService = exports.FirebaseEventService = void 0;
const firebase_1 = require("../utils/firebase");
class FirebaseEventService {
    constructor() {
        this.collectionName = 'events';
    }
    /**
     * Crear un nuevo evento
     */
    createEvent(eventData, userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventDoc = Object.assign(Object.assign({}, eventData), { user: userEmail, status: 'pending_musician', assignedMusicianId: null, interestedMusicians: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
                const docRef = yield firebase_1.db.collection(this.collectionName).add(eventDoc);
                const createdEvent = yield docRef.get();
                return Object.assign({ id: docRef.id }, createdEvent.data());
            }
            catch (error) {
                console.error('Error creating event:', error);
                throw new Error('Failed to create event');
            }
        });
    }
    /**
     * Obtener evento por ID
     */
    getEventById(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventSnap = yield firebase_1.db.collection(this.collectionName).doc(eventId).get();
                if (!eventSnap.exists) {
                    return null;
                }
                return Object.assign({ id: eventSnap.id }, eventSnap.data());
            }
            catch (error) {
                console.error('Error getting event by ID:', error);
                throw new Error('Failed to get event');
            }
        });
    }
    /**
     * Obtener eventos por usuario y estado
     */
    getEventsByUserAndStatus(userEmail, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventsSnap = yield firebase_1.db.collection(this.collectionName)
                    .where('user', '==', userEmail)
                    .where('status', '==', status)
                    .get();
                return eventsSnap.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            }
            catch (error) {
                console.error('Error getting events by user and status:', error);
                throw new Error('Failed to get events');
            }
        });
    }
    /**
     * Obtener eventos por músico y estado
     */
    getEventsByMusicianAndStatus(musicianEmail, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventsSnap = yield firebase_1.db.collection(this.collectionName)
                    .where('assignedMusicianId', '==', musicianEmail)
                    .where('status', '==', status)
                    .get();
                return eventsSnap.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            }
            catch (error) {
                console.error('Error getting events by musician and status:', error);
                throw new Error('Failed to get events');
            }
        });
    }
    /**
     * Obtener todos los eventos de un usuario
     */
    getEventsByUser(userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventsSnap = yield firebase_1.db.collection(this.collectionName)
                    .where('user', '==', userEmail)
                    .get();
                return eventsSnap.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            }
            catch (error) {
                console.error('Error getting events by user:', error);
                throw new Error('Failed to get events');
            }
        });
    }
    /**
     * Obtener eventos disponibles para músicos
     */
    getAvailableEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventsSnap = yield firebase_1.db.collection(this.collectionName)
                    .where('status', '==', 'pending_musician')
                    .get();
                return eventsSnap.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            }
            catch (error) {
                console.error('Error getting available events:', error);
                throw new Error('Failed to get available events');
            }
        });
    }
    /**
     * Actualizar evento
     */
    updateEvent(eventId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventRef = firebase_1.db.collection(this.collectionName).doc(eventId);
                const updateDoc = Object.assign(Object.assign({}, updateData), { updatedAt: new Date().toISOString() });
                yield eventRef.update(updateDoc);
                const updatedEvent = yield eventRef.get();
                return Object.assign({ id: updatedEvent.id }, updatedEvent.data());
            }
            catch (error) {
                console.error('Error updating event:', error);
                throw new Error('Failed to update event');
            }
        });
    }
    /**
     * Cancelar evento
     */
    cancelEvent(eventId, cancelledBy) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventRef = firebase_1.db.collection(this.collectionName).doc(eventId);
                const updateData = {
                    status: 'cancelled',
                    cancelledAt: new Date().toISOString(),
                    cancelledBy,
                    updatedAt: new Date().toISOString(),
                };
                yield eventRef.update(updateData);
                const cancelledEvent = yield eventRef.get();
                return Object.assign({ id: cancelledEvent.id }, cancelledEvent.data());
            }
            catch (error) {
                console.error('Error cancelling event:', error);
                throw new Error('Failed to cancel event');
            }
        });
    }
    /**
     * Completar evento
     */
    completeEvent(eventId, completedBy) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventRef = firebase_1.db.collection(this.collectionName).doc(eventId);
                const updateData = {
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                    completedBy,
                    updatedAt: new Date().toISOString(),
                };
                yield eventRef.update(updateData);
                const completedEvent = yield eventRef.get();
                return Object.assign({ id: completedEvent.id }, completedEvent.data());
            }
            catch (error) {
                console.error('Error completing event:', error);
                throw new Error('Failed to complete event');
            }
        });
    }
    /**
     * Aceptar evento por músico
     */
    acceptEvent(eventId, musicianEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventRef = firebase_1.db.collection(this.collectionName).doc(eventId);
                const updateData = {
                    status: 'musician_assigned',
                    assignedMusicianId: musicianEmail,
                    updatedAt: new Date().toISOString(),
                };
                yield eventRef.update(updateData);
                const acceptedEvent = yield eventRef.get();
                return Object.assign({ id: acceptedEvent.id }, acceptedEvent.data());
            }
            catch (error) {
                console.error('Error accepting event:', error);
                throw new Error('Failed to accept event');
            }
        });
    }
    /**
     * Eliminar evento
     */
    deleteEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield firebase_1.db.collection(this.collectionName).doc(eventId).delete();
            }
            catch (error) {
                console.error('Error deleting event:', error);
                throw new Error('Failed to delete event');
            }
        });
    }
}
exports.FirebaseEventService = FirebaseEventService;
// Instancia singleton del servicio
exports.firebaseEventService = new FirebaseEventService();
