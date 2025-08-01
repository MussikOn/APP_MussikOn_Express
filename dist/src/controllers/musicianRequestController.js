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
exports.deleteRequest = exports.updateRequest = exports.getRequestById = exports.getRequestStatus = exports.cancelRequest = exports.acceptRequest = exports.createRequest = exports.setSocketInstance = void 0;
const firebase_1 = require("../utils/firebase");
// Asume que tienes acceso a la instancia de io y users (mapa de usuarios conectados)
let io;
let users;
const setSocketInstance = (_io, _users) => {
    io = _io;
    users = _users;
};
exports.setSocketInstance = setSocketInstance;
// Crear solicitud de músico
const createRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, eventType, date, startTime, endTime, location, instrument, budget, comments, } = req.body;
        const newRequest = {
            userId,
            eventType,
            date,
            time: `${startTime} - ${endTime}`,
            location,
            instrument,
            budget,
            comments,
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
        res
            .status(500)
            .json({ error: 'Error al cancelar solicitud', details: err });
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
// Obtener solicitud por ID
const getRequestById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const doc = yield firebase_1.db.collection('musicianRequests').doc(id).get();
        if (!doc.exists) {
            res.status(404).json({ error: 'Solicitud no encontrada' });
            return;
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
            res.status(404).json({ error: 'Solicitud no encontrada' });
            return;
        }
        yield docRef.update(Object.assign(Object.assign({}, updateData), { updatedAt: new Date() }));
        res
            .status(200)
            .json({ success: true, message: 'Solicitud actualizada correctamente' });
    }
    catch (err) {
        res
            .status(500)
            .json({ error: 'Error al actualizar solicitud', details: err });
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
            res.status(404).json({ error: 'Solicitud no encontrada' });
            return;
        }
        yield docRef.delete();
        res
            .status(200)
            .json({ success: true, message: 'Solicitud eliminada correctamente' });
    }
    catch (err) {
        res
            .status(500)
            .json({ error: 'Error al eliminar solicitud', details: err });
    }
});
exports.deleteRequest = deleteRequest;
