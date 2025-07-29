import { db } from "../utils/firebase";
import { Event } from "../utils/DataTypes";
import * as admin from "firebase-admin";

export const createEventModel = async (eventData: Omit<Event, 'id' | 'status' | 'assignedMusicianId' | 'interestedMusicians' | 'createdAt' | 'updatedAt'> & { user: string }) => {
  const now = new Date().toISOString();
  const eventRef = db.collection("events").doc();
  const event: Event = {
    ...eventData,
    id: eventRef.id,
    status: 'pending_musician',
    createdAt: now,
    updatedAt: now,
    interestedMusicians: [],
  };
  await eventRef.set(event);
  console.log('[src/models/eventModel.ts:16] Evento guardado:', event);
  return event;
};

export const getEventsByUserAndStatus = async (userEmail: string, status: Event['status']) => {
  const snapshot = await db.collection("events")
    .where("user", "==", userEmail)
    .where("status", "==", status)
    .get();
  return snapshot.docs.map(doc => doc.data() as Event);
};

export const getAvailableEvents = async () => {
  const snapshot = await db.collection("events")
    .where("status", "==", "pending_musician")
    .get();
  console.log('[src/models/eventModel.ts:32] Eventos encontrados en BD:', snapshot.docs.length);
  return snapshot.docs.map(doc => doc.data() as Event);
};

export const acceptEventModel = async (eventId: string, musicianId: string) => {
  const eventRef = db.collection("events").doc(eventId);
  const eventSnap = await eventRef.get();
  if (!eventSnap.exists) return null;
  const event = eventSnap.data() as Event;
  if (event.status !== 'pending_musician') return null;
  const updatedEvent: Event = {
    ...event,
    status: 'musician_assigned',
    assignedMusicianId: musicianId,
    updatedAt: new Date().toISOString(),
  };
  const { id, ...updateFields } = updatedEvent;
  await eventRef.update(updateFields);
  return updatedEvent;
};

export const getEventsByMusicianAndStatus = async (musicianId: string, status: Event['status']) => {
  const snapshot = await db.collection("events")
    .where("assignedMusicianId", "==", musicianId)
    .where("status", "==", status)
    .get();
  return snapshot.docs.map(doc => doc.data() as Event);
};

export const getEventsByUser = async (userEmail: string) => {
  const snapshot = await db.collection("events")
    .where("user", "==", userEmail)
    .get();
  return snapshot.docs.map(doc => doc.data() as Event);
};

export const getEventsByMusician = async (musicianId: string) => {
  const snapshot = await db.collection("events")
    .where("assignedMusicianId", "==", musicianId)
    .get();
  return snapshot.docs.map(doc => doc.data() as Event);
}; 

export const getEventByIdModel = async (eventId: string) => {
  const eventRef = db.collection("events").doc(eventId);
  const eventSnap = await eventRef.get();
  if (!eventSnap.exists) return null;
  return eventSnap.data() as Event;
};

export const cancelEventModel = async (eventId: string, cancelledBy: string) => {
  const eventRef = db.collection("events").doc(eventId);
  const eventSnap = await eventRef.get();
  if (!eventSnap.exists) return null;
  
  const event = eventSnap.data() as Event;
  const updatedEvent: Event = {
    ...event,
    status: 'cancelled',
    updatedAt: new Date().toISOString(),
  };
  
  const { id, ...updateFields } = updatedEvent;
  await eventRef.update(updateFields);
  return updatedEvent;
};

export const completeEventModel = async (eventId: string, completedBy: string) => {
  const eventRef = db.collection("events").doc(eventId);
  const eventSnap = await eventRef.get();
  if (!eventSnap.exists) return null;
  
  const event = eventSnap.data() as Event;
  const updatedEvent: Event = {
    ...event,
    status: 'completed',
    updatedAt: new Date().toISOString(),
  };
  
  const { id, ...updateFields } = updatedEvent;
  await eventRef.update(updateFields);
  return updatedEvent;
};

export const deleteEventModel = async (eventId: string, deletedBy: string) => {
  const eventRef = db.collection("events").doc(eventId);
  const eventSnap = await eventRef.get();
  if (!eventSnap.exists) return null;
  
  const event = eventSnap.data() as Event;
  
  // Verificar que solo el organizador puede eliminar el evento
  if (event.user !== deletedBy) {
    throw new Error('Solo el organizador puede eliminar este evento');
  }
  
  // Eliminar el documento completamente
  await eventRef.delete();
  console.log('[src/models/eventModel.ts:130] Evento eliminado completamente:', eventId);
  
  return { success: true, eventId };
}; 