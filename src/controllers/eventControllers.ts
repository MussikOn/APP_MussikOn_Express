import { Request, Response } from 'express';
import { logger } from '../services/loggerService';
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

// Importar servicios avanzados
import { MusicianStatusService } from '../services/musicianStatusService';
import { CalendarConflictService } from '../services/calendarConflictService';
import { RateCalculationService } from '../services/rateCalculationService';

// Comentado temporalmente para evitar dependencias circulares
// import { io, users } from "../../index";

// Instanciar servicios
const musicianStatusService = new MusicianStatusService();
const calendarConflictService = new CalendarConflictService();
const rateCalculationService = new RateCalculationService();

// POST /events/request-musician
export const requestMusicianController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    const eventData = req.body;
    
    logger.info('🎵 Creando evento con sistemas avanzados integrados:', { 
      context: 'Event', 
      metadata: { 
        userEmail: user.userEmail,
        eventType: eventData.eventType,
        instrument: eventData.instrument,
        date: eventData.date,
        time: eventData.time
      } 
    });

    // 1. Crear el evento base
    const event = await createEventModel({
      ...eventData,
      user: user.userEmail,
    });

    // 2. Buscar músicos disponibles con sistemas avanzados
    const availableMusicians = await findAvailableMusiciansWithAdvancedSystems(eventData);

    // 3. Calcular tarifas automáticas para músicos disponibles
    const musiciansWithRates = await calculateRatesForMusicians(availableMusicians as any[], eventData);

    // 4. Actualizar el evento con información de músicos disponibles
    const enhancedEvent = {
      ...event,
      availableMusicians: musiciansWithRates,
      searchMetadata: {
        totalMusiciansFound: availableMusicians.length,
        availableMusiciansCount: musiciansWithRates.length,
        searchTimestamp: new Date().toISOString(),
        advancedSearchUsed: true
      }
    };

    logger.info('✅ Evento creado con sistemas avanzados:', { 
      context: 'Event', 
      metadata: { 
        eventId: event.id,
        availableMusiciansCount: musiciansWithRates.length,
        totalMusiciansFound: availableMusicians.length
      } 
    });

    // io.emit('new_event_request', enhancedEvent); // Comentado temporalmente
    res.status(201).json({ 
      success: true,
      message: 'Evento creado exitosamente con búsqueda avanzada de músicos',
      data: enhancedEvent 
    });
  } catch (error) {
    logger.error('❌ Error al crear evento con sistemas avanzados:', error as Error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear evento',
      error: (error as Error).message 
    });
  }
};

/**
 * Buscar músicos disponibles usando sistemas avanzados
 */
async function findAvailableMusiciansWithAdvancedSystems(eventData: {
  eventType: string;
  instrument: string;
  date: string;
  time: string;
  budget?: string;
  duration?: string;
}) {
  try {
    logger.info('🔍 Buscando músicos con sistemas avanzados:', { 
      context: 'AdvancedSearch', 
      metadata: { 
        eventType: eventData.eventType,
        instrument: eventData.instrument,
        date: eventData.date,
        time: eventData.time
      } 
    });

    // 1. Obtener músicos online disponibles
    const onlineMusicians = await musicianStatusService.getOnlineMusicians({
      eventType: eventData.eventType,
      instrument: eventData.instrument,
      minBudget: eventData.budget ? parseInt(eventData.budget) : undefined,
      maxBudget: eventData.budget ? parseInt(eventData.budget) * 2 : undefined
    });

    if (onlineMusicians.length === 0) {
      logger.info('📭 No se encontraron músicos online disponibles');
      return [];
    }

    // 2. Verificar conflictos de calendario
    const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);
    const duration = parseInt(eventData.duration || '120') || 120; // 2 horas por defecto
    const endDateTime = new Date(eventDateTime.getTime() + duration * 60000);

    const musicianIds = onlineMusicians.map((m: any) => m.musicianId);
    const availabilityResult = await calendarConflictService.checkMultipleMusiciansAvailability(
      musicianIds,
      eventDateTime,
      endDateTime
    );

    // 3. Filtrar músicos disponibles
    const availableMusicians = onlineMusicians.filter((musician: any) => 
      availabilityResult.availableMusicians.includes(musician.id)
    );

    logger.info('✅ Músicos disponibles encontrados:', { 
      context: 'AdvancedSearch', 
      metadata: { 
        totalOnline: onlineMusicians.length,
        availableAfterCalendarCheck: availableMusicians.length,
        conflictsFound: availabilityResult.unavailableMusicians.length
      } 
    });

    return availableMusicians;
  } catch (error) {
    logger.error('❌ Error en búsqueda avanzada de músicos:', error as Error);
    return [];
  }
}

/**
 * Calcular tarifas automáticas para músicos disponibles
 */
async function calculateRatesForMusicians(musicians: Array<{
  id: string;
  userEmail: string;
  name: string;
  instrument: string;
  experience: number;
  rating: number;
  baseRate: number;
}>, eventData: {
  eventType: string;
  instrument: string;
  date: string;
  time: string;
  budget?: string;
  duration?: string;
  location?: string;
}) {
  try {
    logger.info('💰 Calculando tarifas automáticas para músicos:', { 
      context: 'RateCalculation', 
      metadata: { 
        musiciansCount: musicians.length 
      } 
    });

    const musiciansWithRates = await Promise.all(
      musicians.map(async (musician) => {
        try {
          const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);
          const duration = parseInt(eventData.duration || '120') || 120;

          const rateResult = await rateCalculationService.calculateRate({
            musicianId: musician.id,
            eventType: eventData.eventType,
            duration,
            location: eventData.location || '',
            eventDate: eventDateTime,
            instrument: eventData.instrument,
            isUrgent: false // TODO: Determinar urgencia basada en fecha
          });

          return {
            ...musician,
            calculatedRate: rateResult.finalRate,
            rateBreakdown: rateResult.breakdown,
            recommendations: rateResult.recommendations,
            relevanceScore: calculateRelevanceScore({
              rating: musician.rating,
              experience: musician.experience,
              responseTime: 60 // Valor por defecto
            }, rateResult.finalRate)
          };
        } catch (error) {
          logger.error('❌ Error calculando tarifa para músico:', error as Error, {
            metadata: { musicianId: musician.id }
          });
          return {
            ...musician,
            calculatedRate: null,
            rateBreakdown: null,
            recommendations: null,
            relevanceScore: 0
          };
        }
      })
    );

    // Ordenar por score de relevancia
    musiciansWithRates.sort((a, b) => b.relevanceScore - a.relevanceScore);

    logger.info('✅ Tarifas calculadas exitosamente:', { 
      context: 'RateCalculation', 
      metadata: { 
        musiciansWithRates: musiciansWithRates.length,
        averageRate: musiciansWithRates.reduce((sum, m) => sum + (m.calculatedRate || 0), 0) / musiciansWithRates.length
      } 
    });

    return musiciansWithRates;
  } catch (error) {
    logger.error('❌ Error calculando tarifas:', error as Error);
    return musicians.map(musician => ({
      ...musician,
      calculatedRate: null,
      rateBreakdown: null,
      recommendations: null,
      relevanceScore: 0
    }));
  }
}

/**
 * Calcular score de relevancia para ordenar músicos
 */
function calculateRelevanceScore(musician: {
  rating: number;
  experience: number;
  responseTime: number;
}, rate: number): number {
  // Score basado en rating (40%)
  const ratingScore = (musician.rating / 5.0) * 40;
  
  // Score basado en tiempo de respuesta (30%)
  const responseScore = Math.max(0, (120 - musician.responseTime) / 120) * 30;
  
  // Score basado en precio (20%) - menor precio = mayor score
  const priceScore = rate ? Math.max(0, (200 - rate) / 200) * 20 : 10;
  
  // Score basado en experiencia (10%)
  const experienceScore = Math.min(10, musician.experience / 10);
  
  return ratingScore + responseScore + priceScore + experienceScore;
}

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
  logger.info('🔍 Buscando eventos asignados para:', { context: 'Event', metadata: user.userEmail });
  const events = await getEventsByUserAndStatus(
    user.userEmail,
    'musician_assigned'
  );
  logger.info('📦 Eventos asignados encontrados:', { context: 'Event', metadata: { count: events.length } });
  logger.info('📦 Eventos:', { context: 'Event', metadata: events });
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
  try {
    const user = (req as any).user;
    
    logger.info('🔍 Búsqueda avanzada de eventos disponibles:', { 
      context: 'Event', 
      metadata: { 
        musicianId: user.userEmail,
        userRole: user.roll 
      } 
    });

    // Verificar que el usuario es un músico
    if (user.roll !== 'musico') {
      res.status(403).json({ 
        success: false,
        message: 'Solo los músicos pueden buscar eventos disponibles' 
      });
      return;
    }

    // 1. Obtener eventos básicos disponibles
    const basicEvents = await getAvailableEvents();
    
    if (basicEvents.length === 0) {
      res.status(200).json({ 
        success: true,
        message: 'No hay eventos disponibles en este momento',
        data: [],
        searchMetadata: {
          totalEvents: 0,
          availableEvents: 0,
          advancedSearchUsed: true
        }
      });
      return;
    }

    // 2. Verificar estado online del músico
    const musicianStatus = await musicianStatusService.getStatus(user.userEmail);
    if (!musicianStatus || !musicianStatus.isOnline || !musicianStatus.availability.isAvailable) {
      res.status(400).json({ 
        success: false,
        message: 'Debes estar online y disponible para ver eventos' 
      });
      return;
    }

    // 3. Filtrar eventos por disponibilidad de calendario
    const availableEvents = await filterEventsByAvailability(
      basicEvents.map(event => ({
        ...event,
        duration: parseInt(String(event.duration)) || 120
      })), 
      user.userEmail
    );

    // 4. Calcular tarifas para eventos disponibles
    const eventsWithRates = await calculateRatesForEvents(
      availableEvents.map(event => ({
        id: event.id,
        eventType: event.eventType || '',
        budget: event.budget || '',
        location: event.location,
        date: event.date,
        time: event.time,
        instrument: event.instrument,
        duration: String(event.duration)
      })), 
      user.userEmail
    );

    // 5. Ordenar por relevancia
    eventsWithRates.sort((a, b) => b.relevanceScore - a.relevanceScore);

    logger.info('✅ Eventos disponibles encontrados con sistemas avanzados:', { 
      context: 'Event', 
      metadata: { 
        totalEvents: basicEvents.length,
        availableEvents: eventsWithRates.length,
        averageRate: eventsWithRates.reduce((sum, e) => sum + (e.calculatedRate || 0), 0) / eventsWithRates.length
      } 
    });

    res.status(200).json({ 
      success: true,
      message: 'Eventos disponibles encontrados',
      data: eventsWithRates,
      searchMetadata: {
        totalEvents: basicEvents.length,
        availableEvents: eventsWithRates.length,
        advancedSearchUsed: true,
        searchTimestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('❌ Error en búsqueda avanzada de eventos:', error as Error);
    res.status(500).json({ 
      success: false,
      message: 'Error al buscar eventos disponibles',
      error: (error as Error).message 
    });
  }
};

/**
 * Filtrar eventos por disponibilidad de calendario del músico
 */
async function filterEventsByAvailability(events: Array<{
  id: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  eventType?: string;
  budget?: string;
  instrument?: string;
}>, musicianId: string) {
  try {
    logger.info('📅 Filtrando eventos por disponibilidad de calendario:', { 
      context: 'CalendarCheck', 
      metadata: { 
        totalEvents: events.length,
        musicianId 
      } 
    });

    const availableEvents = [];

    for (const event of events) {
      try {
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        const duration = parseInt(String(event.duration)) || 120;
        const endDateTime = new Date(eventDateTime.getTime() + duration * 60000);

        const conflictResult = await calendarConflictService.checkConflicts({
          musicianId,
          startTime: eventDateTime,
          endTime: endDateTime,
          location: event.location
        });

        if (!conflictResult.hasConflict) {
          availableEvents.push({
            ...event,
            availabilityChecked: true,
            conflicts: [],
            availableSlots: conflictResult.availableSlots
          });
        } else {
          logger.info('⚠️ Evento con conflictos de calendario:', { 
            context: 'CalendarCheck', 
            metadata: { 
              eventId: event.id,
              conflicts: conflictResult.conflicts.length 
            } 
          });
        }
      } catch (error) {
        logger.error('❌ Error verificando disponibilidad para evento:', error as Error, {
          metadata: { eventId: event.id }
        });
        // Incluir evento con advertencia
        availableEvents.push({
          ...event,
          availabilityChecked: false,
          availabilityError: true
        });
      }
    }

    logger.info('✅ Filtrado de eventos completado:', { 
      context: 'CalendarCheck', 
      metadata: { 
        originalCount: events.length,
        availableCount: availableEvents.length
      } 
    });

    return availableEvents;
  } catch (error) {
    logger.error('❌ Error en filtrado de eventos:', error as Error);
    return events.map(event => ({
      ...event,
      availabilityChecked: false,
      availabilityError: true
    }));
  }
}

/**
 * Calcular tarifas para eventos disponibles
 */
async function calculateRatesForEvents(events: Array<{
  id: string;
  eventType: string;
  budget: string;
  location: string;
  date: string;
  time: string;
  instrument?: string;
  duration?: string;
}>, musicianId: string) {
  try {
    logger.info('💰 Calculando tarifas para eventos:', { 
      context: 'RateCalculation', 
      metadata: { 
        eventsCount: events.length,
        musicianId 
      } 
    });

    const eventsWithRates = await Promise.all(
      events.map(async (event) => {
        try {
          const eventDateTime = new Date(`${event.date}T${event.time}`);
          const duration = parseInt(String(event.duration || '120')) || 120;

          const rateResult = await rateCalculationService.calculateRate({
            musicianId,
            eventType: event.eventType,
            duration,
            location: event.location,
            eventDate: eventDateTime,
            instrument: event.instrument || '',
            isUrgent: false
          });

          return {
            ...event,
            calculatedRate: rateResult.finalRate,
            rateBreakdown: rateResult.breakdown,
            recommendations: rateResult.recommendations,
            relevanceScore: calculateEventRelevanceScore(event, rateResult.finalRate)
          };
        } catch (error) {
          logger.error('❌ Error calculando tarifa para evento:', error as Error, {
            metadata: { eventId: event.id }
          });
          return {
            ...event,
            calculatedRate: null,
            rateBreakdown: null,
            recommendations: null,
            relevanceScore: 0
          };
        }
      })
    );

    logger.info('✅ Cálculo de tarifas completado:', { 
      context: 'RateCalculation', 
      metadata: { 
        eventsWithRates: eventsWithRates.length,
        averageRate: eventsWithRates.reduce((sum, e) => sum + (e.calculatedRate || 0), 0) / eventsWithRates.length
      } 
    });

    return eventsWithRates;
  } catch (error) {
    logger.error('❌ Error calculando tarifas para eventos:', error as Error);
    return events.map(event => ({
      ...event,
      calculatedRate: null,
      rateBreakdown: null,
      recommendations: null,
      relevanceScore: 0
    }));
  }
}

/**
 * Calcular score de relevancia para eventos
 */
function calculateEventRelevanceScore(event: {
  eventType: string;
  budget: string;
  location: string;
  date?: string;
  time?: string;
}, rate: number): number {
  // Score basado en presupuesto vs tarifa calculada (40%)
  const budget = parseInt(event.budget) || 0;
  const budgetScore = rate && budget ? Math.max(0, (budget - rate) / budget) * 40 : 20;
  
  // Score basado en proximidad de fecha (30%)
  const eventDate = event.date && event.time ? new Date(`${event.date}T${event.time}`) : new Date();
  const daysUntilEvent = Math.max(0, (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const dateScore = Math.max(0, (30 - daysUntilEvent) / 30) * 30;
  
  // Score basado en tipo de evento (20%)
  const eventTypeScore = getEventTypeScore(event.eventType) * 20;
  
  // Score basado en ubicación (10%)
  const locationScore = 10; // TODO: Implementar cálculo de proximidad
  
  return budgetScore + dateScore + eventTypeScore + locationScore;
}

/**
 * Obtener score por tipo de evento
 */
function getEventTypeScore(eventType: string): number {
  const typeScores: { [key: string]: number } = {
    'boda': 1.0,
    'evento_corporativo': 0.9,
    'concierto': 0.8,
    'fiesta_privada': 0.7,
    'graduacion': 0.6,
    'cumpleanos': 0.5,
    'culto': 0.4,
    'otro': 0.3
  };
  
  return typeScores[eventType] || 0.5;
}

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
    
    logger.info('🎵 Músico aceptando evento con verificación avanzada:', { 
      context: 'Event', 
      metadata: { 
        eventId,
        musicianId: user.userEmail 
      } 
    });

    // 1. Verificar estado online del músico
    const musicianStatus = await musicianStatusService.getStatus(user.userEmail);
    if (!musicianStatus || !musicianStatus.isOnline || !musicianStatus.availability.isAvailable) {
      res.status(400).json({ 
        success: false,
        message: 'Debes estar online y disponible para aceptar eventos' 
      });
      return;
    }

    // 2. Obtener detalles del evento
    const event = await getEventByIdModel(eventId);
    if (!event) {
      res.status(404).json({ 
        success: false,
        message: 'Evento no encontrado' 
      });
      return;
    }

    // 3. Verificar conflictos de calendario
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    const duration = parseInt(event.duration) || 120;
    const endDateTime = new Date(eventDateTime.getTime() + duration * 60000);

    const conflictResult = await calendarConflictService.checkConflicts({
      musicianId: user.userEmail,
      startTime: eventDateTime,
      endTime: endDateTime,
      location: event.location
    });

    if (conflictResult.hasConflict) {
      res.status(400).json({ 
        success: false,
        message: 'Tienes conflictos de calendario para este evento',
        data: {
          conflicts: conflictResult.conflicts,
          availableSlots: conflictResult.availableSlots,
          recommendedTime: conflictResult.recommendedTime
        }
      });
      return;
    }

    // 4. Calcular tarifa automática
    const rateResult = await rateCalculationService.calculateRate({
      musicianId: user.userEmail,
      eventType: event.eventType,
      duration,
      location: event.location,
      eventDate: eventDateTime,
      instrument: event.instrument,
      isUrgent: false
    });

    // 5. Aceptar el evento
    const updatedEvent = await acceptEventModel(eventId, user.userEmail);
    if (!updatedEvent) {
      res.status(400).json({ 
        success: false,
        message: 'No se pudo aceptar el evento.' 
      });
      return;
    }

    // 6. Agregar evento al calendario
    await calendarConflictService.addEvent({
      musicianId: user.userEmail,
      eventId: eventId,
      startTime: eventDateTime,
      endTime: endDateTime,
      location: event.location,
      status: 'confirmed'
    });

    // 7. Actualizar estado del músico
    await musicianStatusService.updateStatus(user.userEmail, {
      isOnline: true,
      availability: {
        isAvailable: false, // Temporalmente no disponible
        availableFrom: endDateTime.toISOString(),
        availableTo: new Date(endDateTime.getTime() + 60 * 60000).toISOString() // 1 hora después
      }
    });

    logger.info('✅ Evento aceptado con sistemas avanzados:', { 
      context: 'Event', 
      metadata: { 
        eventId,
        musicianId: user.userEmail,
        calculatedRate: rateResult.finalRate,
        conflictsChecked: true,
        calendarUpdated: true
      } 
    });

    res.status(200).json({ 
      success: true,
      message: 'Evento aceptado exitosamente',
      data: {
        event: updatedEvent,
        calculatedRate: rateResult.finalRate,
        rateBreakdown: rateResult.breakdown,
        recommendations: rateResult.recommendations
      }
    });
  } catch (error) {
    logger.error('❌ Error al aceptar evento con sistemas avanzados:', error as Error);
    res.status(500).json({ 
      success: false,
      message: 'Error al aceptar evento',
      error: (error as Error).message 
    });
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
    logger.error('Error al obtener el evento:', error as Error);
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

    logger.info('🔄 Cancelando solicitud:', { metadata: { eventId, userEmail: user.userEmail } });

    // Obtener el evento antes de cancelarlo
    const originalEvent = await getEventByIdModel(eventId);

    if (!originalEvent) {
      logger.info('❌ Solicitud no encontrada:', { metadata: { eventId } });
      res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada',
      });
      return;
    }

    // Verificar permisos
    if (user.roll === 'eventCreator' && originalEvent.user !== user.userEmail) {
      logger.info('❌ Usuario no autorizado para cancelar esta solicitud');
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
      logger.info('❌ Músico no autorizado para cancelar esta solicitud');
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para cancelar esta solicitud',
      });
      return;
    }

    // Cancelar el evento
    const cancelledEvent = await cancelEventModel(eventId, user.userEmail);

    if (!cancelledEvent) {
      logger.info('❌ Error al cancelar solicitud en la base de datos');
      res.status(500).json({
        success: false,
        message: 'Error al cancelar la solicitud',
      });
      return;
    }

    logger.info('✅ Solicitud cancelada exitosamente:', { metadata: { eventId } });

    // Comentado temporalmente - notificaciones por socket

    res.json({
      success: true,
      message: 'Solicitud cancelada exitosamente',
      data: cancelledEvent,
    });
  } catch (error) {
    logger.error('❌ Error al cancelar solicitud:', error as Error);
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

    logger.info('🎵 Completando evento con sistemas avanzados:', { 
      context: 'Event', 
      metadata: { 
        eventId,
        userId: user.userEmail,
        userRole: user.roll 
      } 
    });

    // 1. Obtener el evento
    const event = await getEventByIdModel(eventId);
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Evento no encontrado' 
      });
      return;
    }

    // 2. Verificar permisos
    const isEventCreator = event.user === user.userEmail;
    const isAssignedMusician = event.assignedMusicianId === user.userEmail;
    
    if (!isEventCreator && !isAssignedMusician) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para completar este evento' 
      });
      return;
    }

    // 3. Completar el evento
    const completedEvent = await completeEventModel(eventId, user.userEmail);
    if (!completedEvent) {
      res.status(400).json({ 
        success: false,
        message: 'No se pudo completar el evento' 
      });
      return;
    }

    // 4. Si es el músico quien completa, actualizar su estado
    if (isAssignedMusician) {
      await musicianStatusService.updateStatus(user.userEmail, {
        isOnline: true,
        availability: {
          isAvailable: true,
          availableFrom: new Date().toISOString()
        }
      });

      // Actualizar métricas de rendimiento
      await updateMusicianPerformance(user.userEmail, {
        ...event,
        duration: parseInt(String(event.duration)) || 120
      });
    }

    // 5. Remover evento del calendario
    try {
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      const duration = parseInt(String(event.duration)) || 120;
      const endDateTime = new Date(eventDateTime.getTime() + duration * 60000);

      // Buscar y eliminar el evento del calendario
      const calendarEvents = await calendarConflictService.getMusicianEvents(
        user.userEmail,
        eventDateTime,
        endDateTime
      );

      const calendarEvent = calendarEvents.find(e => e.eventId === eventId);
      if (calendarEvent) {
        await calendarConflictService.removeEvent(calendarEvent.id);
        logger.info('📅 Evento removido del calendario:', { 
          context: 'Calendar', 
          metadata: { 
            calendarEventId: calendarEvent.id,
            eventId 
          } 
        });
      }
    } catch (error) {
      logger.error('❌ Error removiendo evento del calendario:', error as Error);
      // No fallar la operación principal por este error
    }

    // 6. Actualizar datos del mercado si es el músico
    if (isAssignedMusician) {
      try {
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        const duration = parseInt(String(event.duration)) || 120;
        
        // Obtener tarifa calculada para actualizar datos del mercado
        const rateResult = await rateCalculationService.calculateRate({
          musicianId: user.userEmail,
          eventType: event.eventType,
          duration,
          location: event.location,
          eventDate: eventDateTime,
          instrument: event.instrument,
          isUrgent: false
        });

        // Actualizar datos del mercado
        await rateCalculationService.updateMarketData(
          event.instrument || '',
          event.location,
          event.eventType,
          rateResult.finalRate
        );

        logger.info('📊 Datos del mercado actualizados:', { 
          context: 'MarketData', 
          metadata: { 
            instrument: event.instrument,
            location: event.location,
            eventType: event.eventType,
            rate: rateResult.finalRate
          } 
        });
  } catch (error) {
        logger.error('❌ Error actualizando datos del mercado:', error as Error);
        // No fallar la operación principal por este error
      }
    }

    logger.info('✅ Evento completado con sistemas avanzados:', { 
      context: 'Event', 
      metadata: { 
        eventId,
        completedBy: user.userEmail,
        userRole: user.roll,
        calendarUpdated: true,
        marketDataUpdated: isAssignedMusician
      } 
    });

    res.status(200).json({ 
      success: true,
      message: 'Evento completado exitosamente',
      data: completedEvent
    });
  } catch (error) {
    logger.error('❌ Error completando evento con sistemas avanzados:', error as Error);
    res.status(500).json({
      success: false,
      message: 'Error al completar evento',
      error: (error as Error).message 
    });
  }
};

/**
 * Actualizar métricas de rendimiento del músico
 */
async function updateMusicianPerformance(musicianId: string, event: {
  id: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
  duration: number;
}) {
  try {
    logger.info('📈 Actualizando métricas de rendimiento del músico:', { 
      context: 'Performance', 
      metadata: { 
        musicianId,
        eventId: event.id 
      } 
    });

    // Obtener métricas actuales
    const currentPerformance = await musicianStatusService.getStatus(musicianId);
    if (!currentPerformance) {
      logger.warn('⚠️ No se encontraron métricas de rendimiento para el músico:', { 
        context: 'Performance', 
        metadata: { musicianId } 
      });
      return;
    }

    // Calcular nuevas métricas
    const newTotalEvents = currentPerformance.performance.totalEvents + 1;
    const newCompletedEvents = currentPerformance.performance.completedEvents + 1;
    const completionRate = newCompletedEvents / newTotalEvents;

    // Actualizar métricas
    await musicianStatusService.updatePerformance(musicianId, {
      totalEvents: newTotalEvents,
      completedEvents: newCompletedEvents,
      // Mantener rating y responseTime como están
      rating: currentPerformance.performance.rating,
      responseTime: currentPerformance.performance.responseTime
    });

    logger.info('✅ Métricas de rendimiento actualizadas:', { 
      context: 'Performance', 
      metadata: { 
        musicianId,
        newTotalEvents,
        newCompletedEvents,
        completionRate
      } 
    });
  } catch (error) {
    logger.error('❌ Error actualizando métricas de rendimiento:', error as Error, {
      metadata: { musicianId }
    });
  }
}

export const deleteEventController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    const { eventId } = req.params;

    logger.info('🗑️ Eliminando evento:', { metadata: { eventId, userEmail: user.userEmail } });

    const deletedEvent = await deleteEventModel(eventId, user.userEmail);

    if (!deletedEvent) {
      res.status(404).json({
        success: false,
        message: 'Evento no encontrado o no tienes permisos para eliminarlo',
      });
      return;
    }

    logger.info('✅ Evento eliminado exitosamente:', { metadata: { eventId } });

    res.json({
      success: true,
      message: 'Evento eliminado exitosamente',
      data: deletedEvent,
    });
  } catch (error) {
    logger.error('❌ Error al eliminar evento:', error as Error);
    res.status(500).json({
        success: false,
      message: 'Error al eliminar evento',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

/**
 * GET /events/advanced/:eventId
 * Obtener evento con información avanzada integrada
 */
export const getEventWithAdvancedInfoController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    const { eventId } = req.params;

    logger.info('🔍 Obteniendo evento con información avanzada:', { 
      context: 'Event', 
      metadata: { 
        eventId,
        userId: user.userEmail 
      } 
    });

    // 1. Obtener evento básico
    const event = await getEventByIdModel(eventId);
    if (!event) {
      res.status(404).json({ 
        success: false,
        message: 'Evento no encontrado' 
      });
      return;
    }

    // 2. Verificar permisos
    const isEventCreator = event.user === user.userEmail;
    const isAssignedMusician = event.assignedMusicianId === user.userEmail;
    const isAdmin = user.roll === 'admin' || user.roll === 'superadmin';
    
    if (!isEventCreator && !isAssignedMusician && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este evento' 
      });
      return;
    }

    // 3. Obtener información avanzada
    const advancedInfo = await getAdvancedEventInfo({
      ...event,
      duration: parseInt(String(event.duration)) || 120
    }, user.userEmail);

    const enhancedEvent = {
      ...event,
      advancedInfo
    };

    logger.info('✅ Evento con información avanzada obtenido:', { 
      context: 'Event', 
      metadata: { 
        eventId,
        hasAdvancedInfo: !!advancedInfo,
        musicianStatus: advancedInfo?.musicianStatus ? 'available' : 'unavailable'
      } 
    });

    res.status(200).json({ 
      success: true,
      message: 'Evento obtenido exitosamente',
      data: enhancedEvent
    });
  } catch (error) {
    logger.error('❌ Error obteniendo evento con información avanzada:', error as Error);
      res.status(500).json({
        success: false,
      message: 'Error al obtener evento',
      error: (error as Error).message 
    });
  }
};

/**
 * Obtener información avanzada del evento
 */
async function getAdvancedEventInfo(event: {
  id: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
  duration: number;
  eventType: string;
  budget: string;
  user: string;
  assignedMusicianId?: string;
  instrument?: string;
  status?: string;
}, userId: string) {
  try {
    const advancedInfo: any = {};

    // 1. Información del músico asignado (si existe)
    if (event.assignedMusicianId) {
      try {
        const musicianStatus = await musicianStatusService.getStatus(event.assignedMusicianId);
        advancedInfo.musicianStatus = musicianStatus;
        
        // Calcular tarifa para el músico asignado
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        const duration = parseInt(String(event.duration)) || 120;
        
        const rateResult = await rateCalculationService.calculateRate({
          musicianId: event.assignedMusicianId,
          eventType: event.eventType,
          duration,
          location: event.location,
          eventDate: eventDateTime,
          instrument: event.instrument || '',
          isUrgent: false
        });
        
        advancedInfo.calculatedRate = rateResult.finalRate;
        advancedInfo.rateBreakdown = rateResult.breakdown;
        advancedInfo.recommendations = rateResult.recommendations;
      } catch (error) {
        logger.error('❌ Error obteniendo información del músico:', error as Error);
        advancedInfo.musicianStatus = null;
        advancedInfo.calculatedRate = null;
      }
    }

    // 2. Verificar conflictos de calendario (si es el músico asignado)
    if (event.assignedMusicianId === userId) {
      try {
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        const duration = parseInt(String(event.duration)) || 120;
        const endDateTime = new Date(eventDateTime.getTime() + duration * 60000);

        const conflictResult = await calendarConflictService.checkConflicts({
          musicianId: userId,
          startTime: eventDateTime,
          endTime: endDateTime,
          location: event.location
        });

        advancedInfo.calendarConflicts = conflictResult.conflicts;
        advancedInfo.hasConflicts = conflictResult.hasConflict;
        advancedInfo.availableSlots = conflictResult.availableSlots;
      } catch (error) {
        logger.error('❌ Error verificando conflictos de calendario:', error as Error);
        advancedInfo.calendarConflicts = [];
        advancedInfo.hasConflicts = false;
      }
    }

    // 3. Información de disponibilidad de músicos (si es el creador del evento)
    if (event.user === userId && event.status === 'pending_musician') {
      try {
        const availableMusicians = await findAvailableMusiciansWithAdvancedSystems({
          eventType: event.eventType,
          instrument: event.instrument || '',
          date: event.date,
          time: event.time,
          budget: event.budget,
          duration: String(event.duration)
        });
        advancedInfo.availableMusicians = availableMusicians;
        advancedInfo.availableMusiciansCount = availableMusicians.length;
      } catch (error) {
        logger.error('❌ Error obteniendo músicos disponibles:', error as Error);
        advancedInfo.availableMusicians = [];
        advancedInfo.availableMusiciansCount = 0;
      }
    }

    // 4. Estadísticas del mercado
    try {
      const marketData = await rateCalculationService.getPublicMarketData(
        event.instrument || '',
        event.location,
        event.eventType
      );
      advancedInfo.marketData = marketData;
    } catch (error) {
      logger.error('❌ Error obteniendo datos del mercado:', error as Error);
      advancedInfo.marketData = null;
    }

    return advancedInfo;
  } catch (error) {
    logger.error('❌ Error obteniendo información avanzada del evento:', error as Error);
    return null;
  }
}

/**
 * POST /events/heartbeat
 * Sistema de heartbeat para mantener estado online de músicos
 */
export const musicianHeartbeatController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    const { location, availability } = req.body;

    logger.info('💓 Heartbeat del músico con sistemas avanzados:', { 
      context: 'Heartbeat', 
      metadata: { 
        musicianId: user.userEmail,
        hasLocation: !!location,
        availability: availability 
      } 
    });

    // Verificar que el usuario es un músico
    if (user.roll !== 'musico') {
      res.status(403).json({ 
        success: false,
        message: 'Solo los músicos pueden usar el sistema de heartbeat' 
      });
      return;
    }

    // 1. Actualizar estado del músico
    const updateData: any = {
      isOnline: true
    };

    if (location) {
      updateData.currentLocation = location;
    }

    if (availability) {
      updateData.availability = availability;
    }

    const updatedStatus = await musicianStatusService.updateStatus(user.userEmail, updateData);

    // 2. Verificar eventos próximos
    const upcomingEvents = await getUpcomingEventsForMusician(user.userEmail);

    // 3. Calcular métricas de rendimiento
    const performanceMetrics = await calculatePerformanceMetrics(user.userEmail);

    // 4. Verificar conflictos de calendario próximos
    const upcomingConflicts = await checkUpcomingConflicts(user.userEmail);

    logger.info('✅ Heartbeat procesado exitosamente:', { 
      context: 'Heartbeat', 
      metadata: { 
        musicianId: user.userEmail,
        upcomingEvents: upcomingEvents.length,
        hasConflicts: upcomingConflicts.length > 0,
        performanceUpdated: true
      } 
    });

    res.status(200).json({ 
      success: true,
      message: 'Heartbeat registrado exitosamente',
      data: {
        status: updatedStatus,
        upcomingEvents,
        performanceMetrics,
        upcomingConflicts,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('❌ Error en heartbeat del músico:', error as Error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar heartbeat',
      error: (error as Error).message 
    });
  }
};

/**
 * Obtener eventos próximos para el músico
 */
async function getUpcomingEventsForMusician(musicianId: string) {
  try {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const events = await getEventsByMusicianAndStatus(musicianId, 'musician_assigned');
    
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(`${event.date}T${event.time}`);
      return eventDate >= now && eventDate <= nextWeek;
    });

    return upcomingEvents.map(event => ({
      id: event.id,
      eventName: event.eventName,
      date: event.date,
      time: event.time,
      location: event.location,
      duration: event.duration,
      daysUntilEvent: Math.ceil((new Date(`${event.date}T${event.time}`).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }));
  } catch (error) {
    logger.error('❌ Error obteniendo eventos próximos:', error as Error);
    return [];
  }
}

/**
 * Calcular métricas de rendimiento del músico
 */
async function calculatePerformanceMetrics(musicianId: string) {
  try {
    const status = await musicianStatusService.getStatus(musicianId);
    if (!status) {
      return null;
    }

    const performance = status.performance;
    const completionRate = performance.totalEvents > 0 ? 
      (performance.completedEvents / performance.totalEvents) * 100 : 0;

    return {
      rating: performance.rating,
      totalEvents: performance.totalEvents,
      completedEvents: performance.completedEvents,
      completionRate: Math.round(completionRate * 100) / 100,
      averageResponseTime: performance.responseTime,
      isOnline: status.isOnline,
      isAvailable: status.availability.isAvailable
    };
  } catch (error) {
    logger.error('❌ Error calculando métricas de rendimiento:', error as Error);
    return null;
  }
}

/**
 * Verificar conflictos de calendario próximos
 */
async function checkUpcomingConflicts(musicianId: string) {
  try {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const events = await calendarConflictService.getMusicianEvents(
      musicianId,
      now,
      nextWeek
    );

    // Verificar conflictos potenciales (eventos muy cercanos)
    const potentialConflicts = events.filter(event => {
      const timeBetweenEvents = 60; // 1 hora entre eventos
      const eventEnd = new Date(event.endTime.getTime() + timeBetweenEvents * 60000);
      
      return events.some(otherEvent => 
        otherEvent.id !== event.id && 
        otherEvent.startTime < eventEnd &&
        otherEvent.endTime > event.startTime
      );
    });

    return potentialConflicts.map((event: {
      id: string;
      eventId: string;
      startTime: Date;
      endTime: Date;
      location: string;
      status: string;
    }) => ({
      id: event.id,
      eventId: event.eventId,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      status: event.status
    }));
  } catch (error) {
    logger.error('❌ Error verificando conflictos próximos:', error as Error);
    return [];
  }
}
