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
exports.getRequestStatus = exports.cancelRequest = exports.acceptRequest = exports.createRequest = exports.deleteRequest = exports.updateRequest = exports.getRequestById = exports.getRequestsByDate = exports.getRequestsByInstrument = exports.getRequestsByStatus = exports.searchRequests = exports.getAllRequests = exports.setSocketInstance = void 0;
const firebase_1 = require("../utils/firebase");
// Asume que tienes acceso a la instancia de io y users (mapa de usuarios conectados)
let io;
let users;
const setSocketInstance = (_io, _users) => {
    io = _io;
    users = _users;
};
exports.setSocketInstance = setSocketInstance;
// Obtener todas las solicitudes con filtros opcionales
const getAllRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, instrument, date } = req.query;
        let query = firebase_1.db.collection('musicianRequests');
        // Aplicar filtros si están presentes
        if (status) {
            query = query.where('status', '==', status);
        }
        if (instrument) {
            query = query.where('instrument', '==', instrument);
        }
        if (date) {
            query = query.where('date', '==', date);
        }
        const snapshot = yield query.get();
        const requests = [];
        snapshot.forEach((doc) => {
            requests.push(Object.assign({ id: doc.id }, doc.data()));
        });
        res.status(200).json(requests);
    }
    catch (err) {
        res.status(500).json({ error: 'Error al obtener solicitudes', details: err });
    }
});
exports.getAllRequests = getAllRequests;
// Buscar solicitudes por texto
const searchRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Término de búsqueda requerido' });
        }
        const searchTerm = q.toString().toLowerCase();
        const snapshot = yield firebase_1.db.collection('musicianRequests').get();
        const requests = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            const searchableText = `${data.eventType} ${data.location} ${data.instrument} ${data.comments || ''}`.toLowerCase();
            if (searchableText.includes(searchTerm)) {
                requests.push(Object.assign({ id: doc.id }, data));
            }
        });
        res.status(200).json(requests);
    }
    catch (err) {
        res.status(500).json({ error: 'Error en la búsqueda', details: err });
    }
});
exports.searchRequests = searchRequests;
// Obtener solicitudes por estado
const getRequestsByStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.params;
        const snapshot = yield firebase_1.db.collection('musicianRequests')
            .where('status', '==', status)
            .get();
        const requests = [];
        snapshot.forEach((doc) => {
            requests.push(Object.assign({ id: doc.id }, doc.data()));
        });
        res.status(200).json(requests);
    }
    catch (err) {
        res.status(500).json({ error: 'Error al obtener solicitudes por estado', details: err });
    }
});
exports.getRequestsByStatus = getRequestsByStatus;
// Obtener solicitudes por instrumento
const getRequestsByInstrument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { instrument } = req.params;
        const snapshot = yield firebase_1.db.collection('musicianRequests')
            .where('instrument', '==', instrument)
            .get();
        const requests = [];
        snapshot.forEach((doc) => {
            requests.push(Object.assign({ id: doc.id }, doc.data()));
        });
        res.status(200).json(requests);
    }
    catch (err) {
        res.status(500).json({ error: 'Error al obtener solicitudes por instrumento', details: err });
    }
});
exports.getRequestsByInstrument = getRequestsByInstrument;
// Obtener solicitudes por fecha
const getRequestsByDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = req.params;
        const snapshot = yield firebase_1.db.collection('musicianRequests')
            .where('date', '==', date)
            .get();
        const requests = [];
        snapshot.forEach((doc) => {
            requests.push(Object.assign({ id: doc.id }, doc.data()));
        });
        res.status(200).json(requests);
    }
    catch (err) {
        res.status(500).json({ error: 'Error al obtener solicitudes por fecha', details: err });
    }
});
exports.getRequestsByDate = getRequestsByDate;
// Obtener solicitud por ID
const getRequestById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const doc = yield firebase_1.db.collection('musicianRequests').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        res.status(200).json(Object.assign({ id: doc.id }, doc.data()));
    }
    catch (err) {
        res.status(500).json({ error: 'Error al obtener solicitud', details: err });
    }
});
exports.getRequestById = getRequestById;
// Actualizar solicitud
const updateRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const docRef = firebase_1.db.collection('musicianRequests').doc(id);
        const doc = yield docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        // Preparar datos para actualización
        const updateFields = {
            updatedAt: new Date()
        };
        if (updateData.eventType)
            updateFields.eventType = updateData.eventType;
        if (updateData.date)
            updateFields.date = updateData.date;
        if (updateData.startTime && updateData.endTime) {
            updateFields.time = `${updateData.startTime} - ${updateData.endTime}`;
        }
        if (updateData.location)
            updateFields.location = updateData.location;
        if (updateData.instrument)
            updateFields.instrument = updateData.instrument;
        if (updateData.budget !== undefined)
            updateFields.budget = updateData.budget;
        if (updateData.comments !== undefined)
            updateFields.comments = updateData.comments;
        if (updateData.status)
            updateFields.status = updateData.status;
        if (updateData.assignedMusicianId !== undefined) {
            updateFields.assignedMusicianId = updateData.assignedMusicianId;
        }
        yield docRef.update(updateFields);
        // Emitir evento de actualización
        if (io) {
            io.emit('request_updated', Object.assign({ id }, updateFields));
        }
        res.status(200).json({
            success: true,
            message: 'Solicitud actualizada correctamente',
            data: Object.assign({ id }, updateFields)
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Error al actualizar solicitud', details: err });
    }
});
exports.updateRequest = updateRequest;
// Eliminar solicitud
const deleteRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const docRef = firebase_1.db.collection('musicianRequests').doc(id);
        const doc = yield docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        yield docRef.delete();
        // Emitir evento de eliminación
        if (io) {
            io.emit('request_deleted', { id });
        }
        res.status(200).json({
            success: true,
            message: 'Solicitud eliminada correctamente'
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Error al eliminar solicitud', details: err });
    }
});
exports.deleteRequest = deleteRequest;
// Crear solicitud de músico
const createRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, eventType, date, startTime, endTime, location, instrument, budget, comments } = req.body;
        const newRequest = {
            userId,
            eventType,
            date,
            time: `${startTime} - ${endTime}`,
            location,
            instrument,
            budget,
            comments
        };
        const docRef = yield firebase_1.db.collection('musicianRequests').add(Object.assign(Object.assign({}, newRequest), { status: 'pendiente', createdAt: new Date(), updatedAt: new Date() }));
        // Emitir evento socket a músicos conectados
        if (io)
            io.emit('new_event_request', Object.assign({ id: docRef.id }, newRequest));
        res.status(201).json(Object.assign(Object.assign({ id: docRef.id }, newRequest), { status: 'pendiente' }));
    }
    catch (err) {
        res.status(500).json({ error: 'Error al crear solicitud', details: err });
    }
});
exports.createRequest = createRequest;
// Aceptar solicitud (solo el primero la toma)
const acceptRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requestId, musicianId } = req.body;
        const docRef = firebase_1.db.collection('musicianRequests').doc(requestId);
        const doc = yield docRef.get();
        if (!doc.exists) {
            res.status(404).json({ error: 'Solicitud no encontrada' });
            return;
        }
        const data = doc.data();
        if (data.status !== 'pendiente') {
            res.status(400).json({ error: 'Solicitud ya tomada o no disponible' });
            return;
        }
        yield docRef.update({
            status: 'asignada',
            assignedMusicianId: musicianId,
            updatedAt: new Date(),
        });
        // Emitir evento a usuario y músicos
        if (io) {
            io.emit('musician_accepted', { requestId, musician: { id: musicianId } });
            io.emit('musician_request_taken', { requestId });
        }
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Error al aceptar solicitud', details: err });
    }
});
exports.acceptRequest = acceptRequest;
// Cancelar solicitud
const cancelRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requestId } = req.body;
        const docRef = firebase_1.db.collection('musicianRequests').doc(requestId);
        const doc = yield docRef.get();
        if (!doc.exists) {
            res.status(404).json({ error: 'Solicitud no encontrada' });
            return;
        }
        yield docRef.update({ status: 'cancelada', updatedAt: new Date() });
        if (io)
            io.emit('request_cancelled', { requestId });
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Error al cancelar solicitud', details: err });
    }
});
exports.cancelRequest = cancelRequest;
// Consultar estado de solicitud
const getRequestStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const doc = yield firebase_1.db.collection('musicianRequests').doc(id).get();
        if (!doc.exists) {
            res.status(404).json({ error: 'Solicitud no encontrada' });
            return;
        }
        res.json(doc.data());
    }
    catch (err) {
        res.status(500).json({ error: 'Error al consultar estado', details: err });
    }
});
exports.getRequestStatus = getRequestStatus;
