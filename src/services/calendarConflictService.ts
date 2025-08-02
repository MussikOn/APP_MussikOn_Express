import { db } from '../utils/firebase';
import { logger } from './loggerService';
import { Event } from '../utils/DataTypes';

export interface CalendarEvent {
  id: string;
  musicianId: string;
  eventId: string;
  startTime: Date;
  endTime: Date;
  location: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  travelTime?: number; // minutos
  bufferTime?: number; // minutos de margen
  createdAt: Date;
  updatedAt: Date;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflicts: CalendarEvent[];
  availableSlots: {
    startTime: Date;
    endTime: Date;
    duration: number; // minutos
  }[];
  recommendedTime?: Date;
}

export interface AvailabilityRequest {
  musicianId: string;
  startTime: Date;
  endTime: Date;
  location: string;
  travelTime?: number;
  bufferTime?: number;
}

export class CalendarConflictService {
  private readonly COLLECTION = 'calendar_events';
  private readonly DEFAULT_BUFFER_TIME = 60; // 1 hora en minutos
  private readonly DEFAULT_TRAVEL_TIME = 30; // 30 minutos

  /**
   * Verificar conflictos de calendario para un músico
   */
  async checkConflicts(request: AvailabilityRequest): Promise<ConflictCheckResult> {
    try {
      console.log('[src/services/calendarConflictService.ts:45] Verificando conflictos para músico:', request.musicianId);
      
      const { musicianId, startTime, endTime, location, travelTime = this.DEFAULT_TRAVEL_TIME, bufferTime = this.DEFAULT_BUFFER_TIME } = request;

      // Obtener eventos del músico en el rango de tiempo
      const events = await this.getMusicianEvents(musicianId, startTime, endTime);
      
      // Calcular tiempo total necesario (evento + viaje + buffer)
      const totalDuration = this.calculateEventDuration(startTime, endTime) + travelTime + bufferTime;
      
      // Verificar conflictos
      const conflicts = this.findConflicts(events, startTime, endTime, travelTime, bufferTime);
      
      // Si hay conflictos, encontrar slots disponibles
      let availableSlots: ConflictCheckResult['availableSlots'] = [];
      let recommendedTime: Date | undefined;

      if (conflicts.length > 0) {
        availableSlots = this.findAvailableSlots(events, startTime, endTime, totalDuration);
        recommendedTime = this.findBestTimeSlot(availableSlots, startTime);
      }

      const result: ConflictCheckResult = {
        hasConflict: conflicts.length > 0,
        conflicts,
        availableSlots,
        recommendedTime
      };

      logger.info('Verificación de conflictos completada', {
        metadata: {
          musicianId,
          hasConflict: result.hasConflict,
          conflictsCount: conflicts.length,
          availableSlotsCount: availableSlots.length
        }
      });

      return result;
    } catch (error) {
      logger.error('Error verificando conflictos de calendario', error as Error, { 
        metadata: { request }
      });
      throw error;
    }
  }

  /**
   * Agregar evento al calendario
   */
  async addEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    try {
      console.log('[src/services/calendarConflictService.ts:85] Agregando evento al calendario:', event.eventId);
      
      const now = new Date();
      const eventRef = db.collection(this.COLLECTION).doc();
      
      const newEvent: CalendarEvent = {
        ...event,
        id: eventRef.id,
        createdAt: now,
        updatedAt: now
      };

      await eventRef.set(newEvent);
      
      logger.info('Evento agregado al calendario', { 
        metadata: { eventId: event.eventId, musicianId: event.musicianId }
      });
      return newEvent;
    } catch (error) {
      logger.error('Error agregando evento al calendario', error as Error, { 
        metadata: { event }
      });
      throw error;
    }
  }

  /**
   * Actualizar evento del calendario
   */
  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      console.log('[src/services/calendarConflictService.ts:105] Actualizando evento del calendario:', eventId);
      
      const eventRef = db.collection(this.COLLECTION).doc(eventId);
      const doc = await eventRef.get();
      
      if (!doc.exists) {
        throw new Error('Evento del calendario no encontrado');
      }

      await eventRef.update({
        ...updates,
        updatedAt: new Date()
      });

      const updatedDoc = await eventRef.get();
      const updatedEvent = updatedDoc.data() as CalendarEvent;
      
      logger.info('Evento del calendario actualizado', { 
        metadata: { eventId, updates }
      });
      return updatedEvent;
    } catch (error) {
      logger.error('Error actualizando evento del calendario', error as Error, { 
        metadata: { eventId }
      });
      throw error;
    }
  }

  /**
   * Eliminar evento del calendario
   */
  async removeEvent(eventId: string): Promise<void> {
    try {
      console.log('[src/services/calendarConflictService.ts:130] Eliminando evento del calendario:', eventId);
      
      const eventRef = db.collection(this.COLLECTION).doc(eventId);
      await eventRef.delete();
      
      logger.info('Evento eliminado del calendario', { 
        metadata: { eventId }
      });
    } catch (error) {
      logger.error('Error eliminando evento del calendario', error as Error, { 
        metadata: { eventId }
      });
      throw error;
    }
  }

  /**
   * Obtener eventos de un músico en un rango de tiempo
   */
  async getMusicianEvents(musicianId: string, startTime: Date, endTime: Date): Promise<CalendarEvent[]> {
    try {
      console.log('[src/services/calendarConflictService.ts:145] Obteniendo eventos del músico:', musicianId);
      
      const query = db.collection(this.COLLECTION)
        .where('musicianId', '==', musicianId)
        .where('status', 'in', ['confirmed', 'pending'])
        .where('startTime', '<=', endTime)
        .where('endTime', '>=', startTime);

      const snapshot = await query.get();
      const events = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as CalendarEvent;
      });

      return events;
    } catch (error) {
      logger.error('Error obteniendo eventos del músico', error as Error, { 
        metadata: { musicianId }
      });
      throw error;
    }
  }

  /**
   * Obtener disponibilidad de un músico para un día específico
   */
  async getDailyAvailability(musicianId: string, date: Date): Promise<{
    date: Date;
    busySlots: CalendarEvent[];
    availableSlots: { startTime: Date; endTime: Date; duration: number }[];
  }> {
    try {
      console.log('[src/services/calendarConflictService.ts:175] Obteniendo disponibilidad diaria del músico:', musicianId);
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const events = await this.getMusicianEvents(musicianId, startOfDay, endOfDay);
      
      // Encontrar slots disponibles
      const availableSlots = this.findAvailableSlotsInDay(events, startOfDay, endOfDay);

      return {
        date,
        busySlots: events,
        availableSlots
      };
    } catch (error) {
      logger.error('Error obteniendo disponibilidad diaria', error as Error, { 
        metadata: { musicianId, date }
      });
      throw error;
    }
  }

  /**
   * Verificar disponibilidad de múltiples músicos
   */
  async checkMultipleMusiciansAvailability(
    musicianIds: string[],
    startTime: Date,
    endTime: Date
  ): Promise<{
    availableMusicians: string[];
    unavailableMusicians: string[];
    conflicts: Record<string, CalendarEvent[]>;
  }> {
    try {
      console.log('[src/services/calendarConflictService.ts:205] Verificando disponibilidad de múltiples músicos');
      
      const results = await Promise.all(
        musicianIds.map(async (musicianId) => {
          const result = await this.checkConflicts({
            musicianId,
            startTime,
            endTime,
            location: ''
          });
          return { musicianId, result };
        })
      );

      const availableMusicians: string[] = [];
      const unavailableMusicians: string[] = [];
      const conflicts: Record<string, CalendarEvent[]> = {};

      results.forEach(({ musicianId, result }) => {
        if (result.hasConflict) {
          unavailableMusicians.push(musicianId);
          conflicts[musicianId] = result.conflicts;
        } else {
          availableMusicians.push(musicianId);
        }
      });

      return {
        availableMusicians,
        unavailableMusicians,
        conflicts
      };
    } catch (error) {
      logger.error('Error verificando disponibilidad de múltiples músicos', error as Error, { 
        metadata: { musicianIds }
      });
      throw error;
    }
  }

  /**
   * Encontrar conflictos en eventos existentes
   */
  private findConflicts(
    events: CalendarEvent[],
    startTime: Date,
    endTime: Date,
    travelTime: number,
    bufferTime: number
  ): CalendarEvent[] {
    const conflicts: CalendarEvent[] = [];
    
    // Expandir el rango de tiempo para incluir viaje y buffer
    const expandedStartTime = new Date(startTime.getTime() - (travelTime + bufferTime) * 60000);
    const expandedEndTime = new Date(endTime.getTime() + (travelTime + bufferTime) * 60000);

    events.forEach(event => {
      // Verificar si hay solapamiento
      if (
        (event.startTime < expandedEndTime && event.endTime > expandedStartTime) ||
        (expandedStartTime < event.endTime && expandedEndTime > event.startTime)
      ) {
        conflicts.push(event);
      }
    });

    return conflicts;
  }

  /**
   * Encontrar slots disponibles
   */
  private findAvailableSlots(
    events: CalendarEvent[],
    startTime: Date,
    endTime: Date,
    requiredDuration: number
  ): { startTime: Date; endTime: Date; duration: number }[] {
    const slots: { startTime: Date; endTime: Date; duration: number }[] = [];
    
    // Ordenar eventos por hora de inicio
    const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    let currentTime = new Date(startTime);
    
    sortedEvents.forEach(event => {
      const timeUntilEvent = event.startTime.getTime() - currentTime.getTime();
      const availableDuration = timeUntilEvent / 60000; // convertir a minutos
      
      if (availableDuration >= requiredDuration) {
        slots.push({
          startTime: new Date(currentTime),
          endTime: new Date(event.startTime),
          duration: availableDuration
        });
      }
      
      currentTime = new Date(Math.max(currentTime.getTime(), event.endTime.getTime()));
    });
    
    // Verificar si hay tiempo disponible después del último evento
    const timeAfterLastEvent = endTime.getTime() - currentTime.getTime();
    const availableDuration = timeAfterLastEvent / 60000;
    
    if (availableDuration >= requiredDuration) {
      slots.push({
        startTime: new Date(currentTime),
        endTime: new Date(endTime),
        duration: availableDuration
      });
    }
    
    return slots;
  }

  /**
   * Encontrar slots disponibles en un día completo
   */
  private findAvailableSlotsInDay(
    events: CalendarEvent[],
    startOfDay: Date,
    endOfDay: Date
  ): { startTime: Date; endTime: Date; duration: number }[] {
    const slots: { startTime: Date; endTime: Date; duration: number }[] = [];
    
    // Ordenar eventos por hora de inicio
    const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    let currentTime = new Date(startOfDay);
    
    sortedEvents.forEach(event => {
      if (event.startTime > currentTime) {
        const duration = (event.startTime.getTime() - currentTime.getTime()) / 60000;
        if (duration >= 30) { // Mínimo 30 minutos
          slots.push({
            startTime: new Date(currentTime),
            endTime: new Date(event.startTime),
            duration
          });
        }
      }
      currentTime = new Date(Math.max(currentTime.getTime(), event.endTime.getTime()));
    });
    
    // Verificar tiempo después del último evento
    if (currentTime < endOfDay) {
      const duration = (endOfDay.getTime() - currentTime.getTime()) / 60000;
      if (duration >= 30) {
        slots.push({
          startTime: new Date(currentTime),
          endTime: new Date(endOfDay),
          duration
        });
      }
    }
    
    return slots;
  }

  /**
   * Encontrar el mejor slot de tiempo
   */
  private findBestTimeSlot(
    slots: { startTime: Date; endTime: Date; duration: number }[],
    preferredTime: Date
  ): Date | undefined {
    if (slots.length === 0) return undefined;
    
    // Encontrar el slot más cercano al tiempo preferido
    let bestSlot = slots[0];
    let minDifference = Math.abs(slots[0].startTime.getTime() - preferredTime.getTime());
    
    slots.forEach(slot => {
      const difference = Math.abs(slot.startTime.getTime() - preferredTime.getTime());
      if (difference < minDifference) {
        minDifference = difference;
        bestSlot = slot;
      }
    });
    
    return bestSlot.startTime;
  }

  /**
   * Calcular duración de un evento en minutos
   */
  private calculateEventDuration(startTime: Date, endTime: Date): number {
    return (endTime.getTime() - startTime.getTime()) / 60000;
  }
} 