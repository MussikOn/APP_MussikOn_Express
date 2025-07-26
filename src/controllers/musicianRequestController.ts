import { Request, Response } from 'express';
import { db } from '../utils/firebase';
import { MusicianRequest } from '../models/musicianRequestModel';
import { Server } from 'socket.io';

// Asume que tienes acceso a la instancia de io y users (mapa de usuarios conectados)
let io: Server;
let users: Record<string, string>;
export const setSocketInstance = (_io: Server, _users: Record<string, string>) => {
  io = _io;
  users = _users;
};

// Crear solicitud de músico
export const createRequest = async (req: Request, res: Response) => {
  try {
    const {
      userId, eventType, date, startTime, endTime, location, instrument, budget, comments
    } = req.body;
    const newRequest: Omit<MusicianRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'> = {
      userId,
      eventType,
      date,
      time: `${startTime} - ${endTime}`,
      location,
      instrument,
      budget,
      comments
    };
    const docRef = await db.collection('musicianRequests').add({
      ...newRequest,
      status: 'pendiente',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // Emitir evento socket a músicos conectados
    if (io) io.emit('new_event_request', { id: docRef.id, ...newRequest });
    res.status(201).json({ id: docRef.id, ...newRequest, status: 'pendiente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear solicitud', details: err });
  }
};

// Aceptar solicitud (solo el primero la toma)
export const acceptRequest = async (req: Request, res: Response) => {
  try {
    const { requestId, musicianId } = req.body;
    const docRef = db.collection('musicianRequests').doc(requestId);
    const doc = await docRef.get();
    if (!doc.exists) {res.status(404).json({ error: 'Solicitud no encontrada' });return;}
    const data = doc.data() as MusicianRequest;
    if (data.status !== 'pendiente') {
      res.status(400).json({ error: 'Solicitud ya tomada o no disponible' });
      return;
    }
    await docRef.update({
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
  } catch (err) {
    res.status(500).json({ error: 'Error al aceptar solicitud', details: err });
  }
};

// Cancelar solicitud
export const cancelRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.body;
    const docRef = db.collection('musicianRequests').doc(requestId);
    const doc = await docRef.get();
    if (!doc.exists) {res.status(404).json({ error: 'Solicitud no encontrada' });return;}
    await docRef.update({ status: 'cancelada', updatedAt: new Date() });
    if (io) io.emit('request_cancelled', { requestId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al cancelar solicitud', details: err });
  }
};

// Consultar estado de solicitud
export const getRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('musicianRequests').doc(id).get();
    if (!doc.exists) {res.status(404).json({ error: 'Solicitud no encontrada' });return;}
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar estado', details: err });
  }
};

// Obtener solicitud por ID
export const getRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('musicianRequests').doc(id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Solicitud no encontrada' });
      return;
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener solicitud', details: err });
  }
};

// Actualizar solicitud
export const updateRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const docRef = db.collection('musicianRequests').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Solicitud no encontrada' });
      return;
    }
    await docRef.update({ ...updateData, updatedAt: new Date() });
    res.status(200).json({ success: true, message: 'Solicitud actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar solicitud', details: err });
  }
};

// Eliminar solicitud
export const deleteRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('musicianRequests').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
    res.status(404).json({ error: 'Solicitud no encontrada' });
    return;
    }
    await docRef.delete();
    res.status(200).json({ success: true, message: 'Solicitud eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar solicitud', details: err });
  }
};
