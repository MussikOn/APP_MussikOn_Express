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
    assignedMusicianId: undefined,
    interestedMusicians: [],
  };
  await eventRef.set(event);
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