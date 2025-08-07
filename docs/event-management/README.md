# 📅 Gestión de Eventos - MussikOn API

## 📋 Índice

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Tipos de Eventos](#tipos-de-eventos)
- [Creación y Gestión](#creación-y-gestión)
- [Calendario y Conflictos](#calendario-y-conflictos)
- [Contratación de Músicos](#contratación-de-músicos)
- [Notificaciones](#notificaciones)
- [Analytics de Eventos](#analytics-de-eventos)

## 🎯 Descripción General

El Sistema de Gestión de Eventos permite a los organizadores crear, gestionar y coordinar eventos musicales de manera eficiente, incluyendo la contratación de músicos, gestión de calendarios y seguimiento del progreso.

### Características Principales

- **Creación de Eventos**: Formularios intuitivos para crear eventos
- **Gestión de Calendario**: Visualización y gestión de fechas
- **Contratación Integrada**: Proceso fluido de contratación de músicos
- **Notificaciones Automáticas**: Alertas y recordatorios
- **Analytics de Eventos**: Métricas y reportes de rendimiento

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
src/
├── controllers/
│   ├── eventControllers.ts           # Controlador de eventos
│   └── calendarController.ts         # Controlador de calendario
├── services/
│   ├── eventService.ts               # Servicio de eventos
│   ├── calendarService.ts            # Servicio de calendario
│   └── conflictService.ts            # Servicio de conflictos
├── routes/
│   ├── eventsRoutes.ts               # Rutas de eventos
│   └── calendarRoutes.ts             # Rutas de calendario
└── types/
    └── eventTypes.ts                 # Tipos de eventos
```

## 🎪 Tipos de Eventos

### Estructura de Evento

```typescript
interface Event {
  id: string;
  organizerId: string;
  
  // Información Básica
  title: string;
  description: string;
  type: EventType;
  category: EventCategory;
  
  // Fechas y Horarios
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // horas
  
  // Ubicación
  location: {
    venue: string;
    address: string;
    city: string;
    coordinates?: { latitude: number; longitude: number };
  };
  
  // Músicos Contratados
  musicians: HiredMusician[];
  
  // Presupuesto
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
  
  // Estado
  status: EventStatus;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

enum EventType {
  WEDDING = 'wedding',
  CORPORATE = 'corporate',
  BIRTHDAY = 'birthday',
  CONCERT = 'concert',
  FESTIVAL = 'festival',
  PRIVATE = 'private'
}

enum EventStatus {
  DRAFT = 'draft',
  PLANNING = 'planning',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}
```

## 🛠️ Creación y Gestión

### Servicio de Eventos

```typescript
// services/eventService.ts
export class EventService {
  async createEvent(organizerId: string, eventData: CreateEventDto): Promise<Event> {
    try {
      // 1. Validar datos del evento
      await this.validateEventData(eventData);
      
      // 2. Verificar conflictos de calendario
      const conflicts = await this.checkCalendarConflicts(organizerId, eventData);
      if (conflicts.length > 0) {
        throw new Error(`Conflictos detectados: ${conflicts.map(c => c.eventTitle).join(', ')}`);
      }
      
      // 3. Crear evento
      const event = await this.saveEvent({
        organizerId,
        ...eventData,
        status: 'draft',
        musicians: [],
        budget: { total: 0, spent: 0, currency: 'USD' }
      });
      
      // 4. Notificar músicos disponibles
      await this.notifyAvailableMusicians(event);
      
      return event;
    } catch (error) {
      logger.error('Error creating event:', error);
      throw new Error('Error al crear evento');
    }
  }
  
  async updateEvent(eventId: string, updates: UpdateEventDto): Promise<Event> {
    try {
      const event = await this.getEventById(eventId);
      
      // Verificar conflictos si se cambia la fecha
      if (updates.date && updates.date !== event.date) {
        const conflicts = await this.checkCalendarConflicts(event.organizerId, updates);
        if (conflicts.length > 0) {
          throw new Error('Conflicto de calendario detectado');
        }
      }
      
      const updatedEvent = await this.saveEventUpdate(eventId, updates);
      
      // Notificar músicos si hay cambios relevantes
      await this.notifyMusiciansOfChanges(updatedEvent);
      
      return updatedEvent;
    } catch (error) {
      logger.error('Error updating event:', error);
      throw new Error('Error al actualizar evento');
    }
  }
}
```

## 📅 Calendario y Conflictos

### Servicio de Calendario

```typescript
// services/calendarService.ts
export class CalendarService {
  async getOrganizerCalendar(organizerId: string, period: DateRange): Promise<CalendarView> {
    try {
      // 1. Obtener eventos del organizador
      const events = await this.getEventsInPeriod(organizerId, period);
      
      // 2. Obtener eventos de músicos contratados
      const musicianEvents = await this.getMusicianEvents(organizerId, period);
      
      // 3. Generar vista de calendario
      const calendarView = this.generateCalendarView(events, musicianEvents, period);
      
      return calendarView;
    } catch (error) {
      logger.error('Error getting calendar:', error);
      throw new Error('Error al obtener calendario');
    }
  }
  
  async checkConflicts(organizerId: string, eventData: EventData): Promise<Conflict[]> {
    try {
      const conflicts: Conflict[] = [];
      
      // Verificar conflictos con eventos existentes
      const existingEvents = await this.getEventsInPeriod(organizerId, {
        start: eventData.date,
        end: eventData.date
      });
      
      existingEvents.forEach(event => {
        if (this.hasTimeConflict(event, eventData)) {
          conflicts.push({
            type: 'time_conflict',
            eventId: event.id,
            eventTitle: event.title,
            description: 'Conflicto de horario'
          });
        }
      });
      
      return conflicts;
    } catch (error) {
      logger.error('Error checking conflicts:', error);
      throw new Error('Error al verificar conflictos');
    }
  }
}
```

## 🎵 Contratación de Músicos

### Proceso de Contratación

```typescript
// services/hiringService.ts
export class EventHiringService {
  async hireMusicianForEvent(
    eventId: string,
    musicianId: string,
    hiringData: HiringData
  ): Promise<HiringContract> {
    try {
      // 1. Verificar disponibilidad del músico
      const availability = await this.checkMusicianAvailability(musicianId, eventId);
      if (!availability.isAvailable) {
        throw new Error('Músico no disponible');
      }
      
      // 2. Crear contrato de contratación
      const contract = await this.createHiringContract({
        eventId,
        musicianId,
        ...hiringData,
        status: 'pending'
      });
      
      // 3. Notificar al músico
      await this.notifyMusicianOfHiring(contract);
      
      return contract;
    } catch (error) {
      logger.error('Error hiring musician:', error);
      throw new Error('Error al contratar músico');
    }
  }
  
  async confirmHiring(contractId: string): Promise<HiringContract> {
    try {
      const contract = await this.getHiringContract(contractId);
      
      // Actualizar estado del contrato
      const updatedContract = await this.updateContractStatus(contractId, 'confirmed');
      
      // Actualizar evento
      await this.addMusicianToEvent(contract.eventId, contract.musicianId);
      
      // Bloquear disponibilidad del músico
      await this.blockMusicianAvailability(contract.musicianId, contract.eventId);
      
      return updatedContract;
    } catch (error) {
      logger.error('Error confirming hiring:', error);
      throw new Error('Error al confirmar contratación');
    }
  }
}
```

## 🔔 Notificaciones

### Sistema de Notificaciones

```typescript
// services/notificationService.ts
export class EventNotificationService {
  async sendEventReminders(): Promise<void> {
    try {
      // Obtener eventos próximos (próximas 24 horas)
      const upcomingEvents = await this.getUpcomingEvents(24);
      
      for (const event of upcomingEvents) {
        // Notificar al organizador
        await this.notifyOrganizer(event, 'event_reminder');
        
        // Notificar a los músicos
        for (const musician of event.musicians) {
          await this.notifyMusician(musician.id, event, 'event_reminder');
        }
      }
    } catch (error) {
      logger.error('Error sending event reminders:', error);
    }
  }
  
  async notifyEventChanges(eventId: string, changes: EventChanges): Promise<void> {
    try {
      const event = await this.getEventById(eventId);
      
      // Notificar cambios relevantes
      if (changes.date || changes.time) {
        await this.notifyMusiciansOfScheduleChange(event, changes);
      }
      
      if (changes.location) {
        await this.notifyMusiciansOfLocationChange(event, changes);
      }
    } catch (error) {
      logger.error('Error notifying event changes:', error);
    }
  }
}
```

## 📊 Analytics de Eventos

### Métricas de Eventos

```typescript
// services/analyticsService.ts
export class EventAnalyticsService {
  async getEventAnalytics(organizerId: string, period: AnalyticsPeriod): Promise<EventAnalytics> {
    try {
      const events = await this.getEventsInPeriod(organizerId, period);
      
      const analytics = {
        totalEvents: events.length,
        completedEvents: events.filter(e => e.status === 'completed').length,
        totalBudget: events.reduce((sum, e) => sum + e.budget.total, 0),
        averageEventDuration: this.calculateAverageDuration(events),
        popularEventTypes: this.getPopularEventTypes(events),
        musicianHiringRate: this.calculateHiringRate(events)
      };
      
      return analytics;
    } catch (error) {
      logger.error('Error getting event analytics:', error);
      throw new Error('Error al obtener analytics de eventos');
    }
  }
}
```

---

**Anterior**: [Gestión de Músicos](../musician-management/README.md)  
**Siguiente**: [Sistema de Chat](../chat-system/README.md) 