import { Request, Response } from "express";
import { createEventModel, getEventsByUserAndStatus, getAvailableEvents, acceptEventModel, getEventsByMusicianAndStatus } from "../models/eventModel";
import { Event } from "../utils/DataTypes";
import { io, users } from "../../index";

// POST /events/request-musician
export const requestMusicianController = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user || user.roll !== 'organizer') {
      res.status(403).json({ msg: "Solo los organizadores pueden crear solicitudes." });
      return;
    }
    const eventData = req.body;
    const event = await createEventModel({ ...eventData, user: user.userEmail });
    io.emit('new_event_request', event);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ msg: "Error al crear el evento.", error });
  }
};

export const myPendingEventsController = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const events = await getEventsByUserAndStatus(user.userEmail, 'pending_musician');
  res.json(events);
};

export const myAssignedEventsController = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const events = await getEventsByUserAndStatus(user.userEmail, 'musician_assigned');
  res.json(events);
};

export const myCompletedEventsController = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const events = await getEventsByUserAndStatus(user.userEmail, 'completed');
  res.json(events);
};

export const availableRequestsController = async (req: Request, res: Response): Promise<void> => {
  const events = await getAvailableEvents();
  res.json(events);
};

export const acceptEventController = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user || user.roll !== 'musician') {
      res.status(403).json({ msg: "Solo los músicos pueden aceptar eventos." });
      return;
    }
    const { eventId } = req.params;
    const updatedEvent = await acceptEventModel(eventId, user.userEmail);
    if (!updatedEvent) {
      res.status(400).json({ msg: "No se pudo aceptar el evento." });
      return;
    }
    const organizerSocketId = users[updatedEvent.user];
    if (organizerSocketId) {
      io.to(organizerSocketId).emit('musician_accepted', updatedEvent);
    }
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ msg: "Error al aceptar el evento.", error });
  }
};

export const myScheduledEventsController = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const events = await getEventsByMusicianAndStatus(user.userEmail, 'musician_assigned');
  res.json(events);
};

export const myPastPerformancesController = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const events = await getEventsByMusicianAndStatus(user.userEmail, 'completed');
  res.json(events);
};
