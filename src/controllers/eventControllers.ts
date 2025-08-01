import { Request, Response } from 'express';
import {
  createEventModel,
  getEventsByUserAndStatus,
  getAvailableEvents,
  acceptEventModel,
  getEventsByMusicianAndStatus,
  getEventsByUser,
  getEventsByMusician,
  getEventByIdModel,
  cancelEventModel,
  completeEventModel,
  deleteEventModel,
} from '../models/eventModel';
import { Event } from '../utils/DataTypes';

// Comentado temporalmente para evitar dependencias circulares
// import { io, users } from "../../index";

// POST /events/request-musician
export const requestMusicianController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    const eventData = req.body;
    console.log(
      '[src/controllers/eventControllers.ts:27] Payload recibido en /events/request-musician:',
      eventData
    );
    const event = await createEventModel({
      ...eventData,
      user: user.userEmail,
    });
    // io.emit('new_event_request', event); // Comentado temporalmente
    res.status(201).json({ data: event });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ msg: 'Error al crear solicitud' });
  }
};

export const myPendingEventsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  const events = await getEventsByUserAndStatus(
    user.userEmail,
    'pending_musician'
  );
  res.json({ data: events });
};

export const myAssignedEventsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  console.log(
    '[src/controllers/eventControllers.ts:45] 🔍 Buscando eventos asignados para:',
    user.userEmail
  );
  const events = await getEventsByUserAndStatus(
    user.userEmail,
    'musician_assigned'
  );
  console.log(
    '[src/controllers/eventControllers.ts:47] 📦 Eventos asignados encontrados:',
    events.length
  );
  console.log('[src/controllers/eventControllers.ts:48] 📦 Eventos:', events);
  res.json({ data: events });
};

export const myCompletedEventsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  const events = await getEventsByUserAndStatus(user.userEmail, 'completed');
  res.json({ data: events });
};

export const availableRequestsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const events = await getAvailableEvents();
  res.json({ data: events });
};

export const acceptEventController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.roll !== 'musico') {
      res.status(403).json({ msg: 'Solo los músicos pueden aceptar eventos.' });
      return;
    }
    const { eventId } = req.params;
    const updatedEvent = await acceptEventModel(eventId, user.userEmail);
    if (!updatedEvent) {
      res.status(400).json({ msg: 'No se pudo aceptar el evento.' });
      return;
    }
    // Comentado temporalmente - notificaciones por socket
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error al aceptar evento:', error);
    res.status(500).json({ msg: 'Error al aceptar evento' });
  }
};

export const myScheduledEventsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  const events = await getEventsByMusicianAndStatus(
    user.userEmail,
    'musician_assigned'
  );
  res.json({ data: events });
};

export const myPastPerformancesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  const events = await getEventsByMusicianAndStatus(
    user.userEmail,
    'completed'
  );
  res.json({ data: events });
};

export const myEventsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  let events: Event[] = [];
  if (user.roll === 'eventCreator') {
    events = await getEventsByUser(user.userEmail);
  } else if (user.roll === 'musico') {
    events = await getEventsByMusician(user.userEmail);
  }
  res.json({ data: events });
};

export const myCancelledEventsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  let events: Event[] = [];

  if (user.roll === 'eventCreator') {
    // Para organizadores: obtener eventos cancelados que ellos crearon
    events = await getEventsByUserAndStatus(user.userEmail, 'cancelled');
    const musicianCancelledEvents = await getEventsByUserAndStatus(
      user.userEmail,
      'musician_cancelled'
    );
    events = [...events, ...musicianCancelledEvents];
  } else if (user.roll === 'musico') {
    // Para músicos: obtener eventos cancelados donde están asignados
    events = await getEventsByMusicianAndStatus(user.userEmail, 'cancelled');
    const musicianCancelledEvents = await getEventsByMusicianAndStatus(
      user.userEmail,
      'musician_cancelled'
    );
    events = [...events, ...musicianCancelledEvents];
  }

  res.json({ data: events });
};

export const getEventByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const event = await getEventByIdModel(eventId);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Evento no encontrado',
      });
      return;
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error al obtener el evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el evento',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

export const cancelEventController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    const { eventId } = req.params;

    console.log(
      '🔄 Cancelando solicitud:',
      eventId,
      'por usuario:',
      user.userEmail
    );

    // Obtener el evento antes de cancelarlo
    const originalEvent = await getEventByIdModel(eventId);

    if (!originalEvent) {
      console.log('❌ Solicitud no encontrada:', eventId);
      res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada',
      });
      return;
    }

    // Verificar permisos
    if (user.roll === 'eventCreator' && originalEvent.user !== user.userEmail) {
      console.log('❌ Usuario no autorizado para cancelar esta solicitud');
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para cancelar esta solicitud',
      });
      return;
    }

    if (
      user.roll === 'musico' &&
      originalEvent.assignedMusicianId !== user.userEmail
    ) {
      console.log('❌ Músico no autorizado para cancelar esta solicitud');
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para cancelar esta solicitud',
      });
      return;
    }

    // Cancelar el evento
    const cancelledEvent = await cancelEventModel(eventId, user.userEmail);

    if (!cancelledEvent) {
      console.log('❌ Error al cancelar solicitud en la base de datos');
      res.status(500).json({
        success: false,
        message: 'Error al cancelar la solicitud',
      });
      return;
    }

    console.log('✅ Solicitud cancelada exitosamente:', eventId);

    // Comentado temporalmente - notificaciones por socket

    res.json({
      success: true,
      message: 'Solicitud cancelada exitosamente',
      data: cancelledEvent,
    });
  } catch (error) {
    console.error('❌ Error al cancelar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar la solicitud',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

export const completeEventController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    const { eventId } = req.params;

    console.log(
      '🔄 Completando solicitud:',
      eventId,
      'por usuario:',
      user.userEmail
    );

    // Obtener el evento antes de completarlo
    const originalEvent = await getEventByIdModel(eventId);

    if (!originalEvent) {
      console.log('❌ Solicitud no encontrada:', eventId);
      res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada',
      });
      return;
    }

    // Verificar permisos
    if (user.roll === 'eventCreator' && originalEvent.user !== user.userEmail) {
      console.log('❌ Usuario no autorizado para completar esta solicitud');
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para completar esta solicitud',
      });
      return;
    }

    if (
      user.roll === 'musico' &&
      originalEvent.assignedMusicianId !== user.userEmail
    ) {
      console.log('❌ Músico no autorizado para completar esta solicitud');
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para completar esta solicitud',
      });
      return;
    }

    // Completar el evento
    const completedEvent = await completeEventModel(eventId, user.userEmail);

    if (!completedEvent) {
      console.log('❌ Error al completar solicitud en la base de datos');
      res.status(500).json({
        success: false,
        message: 'Error al completar la solicitud',
      });
      return;
    }

    console.log('✅ Solicitud completada exitosamente:', eventId);

    // Comentado temporalmente - notificaciones por socket

    const response = {
      success: true,
      message: 'Solicitud completada exitosamente',
      data: completedEvent,
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Error al completar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al completar la solicitud',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

export const deleteEventController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    const { eventId } = req.params;

    console.log(
      '🗑️ Eliminando solicitud:',
      eventId,
      'por usuario:',
      user.userEmail
    );

    // Obtener el evento antes de eliminarlo
    const originalEvent = await getEventByIdModel(eventId);

    if (!originalEvent) {
      console.log('❌ Solicitud no encontrada:', eventId);
      res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada',
      });
      return;
    }

    // Verificar permisos
    if (user.roll !== 'eventCreator') {
      console.log('❌ Solo los organizadores pueden eliminar solicitudes');
      res.status(403).json({
        success: false,
        message: 'Solo los organizadores pueden eliminar solicitudes',
      });
      return;
    }

    if (originalEvent.user !== user.userEmail) {
      console.log('❌ Usuario no autorizado para eliminar esta solicitud');
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta solicitud',
      });
      return;
    }

    // Eliminar el evento
    const deleteResult = await deleteEventModel(eventId, user.userEmail);

    if (!deleteResult) {
      console.log('❌ Error al eliminar solicitud en la base de datos');
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la solicitud',
      });
      return;
    }

    console.log('✅ Solicitud eliminada exitosamente:', eventId);

    // Comentado temporalmente - notificaciones por socket

    res.json({
      success: true,
      message: 'Solicitud eliminada exitosamente',
    });
  } catch (error) {
    console.error('❌ Error al eliminar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la solicitud',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};
