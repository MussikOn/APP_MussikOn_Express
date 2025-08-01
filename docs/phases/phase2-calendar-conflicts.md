# 📅 Fase 2: Sistema de Calendario y Conflictos

## 📋 Resumen de la Fase

Esta fase implementa un sistema completo de gestión de calendario para músicos, incluyendo detección de conflictos, verificación de disponibilidad, y gestión de márgenes de tiempo entre eventos.

## 🎯 Objetivos

- ✅ Base de datos de calendario para músicos
- ✅ Detección automática de conflictos de horarios
- ✅ Algoritmo de margen de tiempo (1 hora mínimo)
- ✅ Verificación de disponibilidad por fecha/hora
- ✅ Gestión de fechas bloqueadas y preferencias
- ✅ Endpoints para gestión de calendario

## 🗄️ Base de Datos

### **📊 Colección: `musicianCalendar`**

```typescript
interface MusicianCalendar {
  musicianId: string;
  
  events: CalendarEvent[];
  blockedDates: BlockedDate[];
  preferences: CalendarPreferences;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CalendarEvent {
  eventId: string;
  eventName: string;
  startTime: Timestamp;
  endTime: Timestamp;
  
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  type: 'performance' | 'rehearsal' | 'travel' | 'personal' | 'other';
  
  details: {
    description: string;
    organizerId: string;
    organizerName: string;
    expectedDuration: number; // horas
    setupTime: number; // minutos
    travelTime: number; // minutos
  };
  
  payment: {
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'refunded';
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface BlockedDate {
  id: string;
  startDate: Timestamp;
  endDate: Timestamp;
  reason: string;
  isRecurring: boolean;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Timestamp;
  };
  createdAt: Timestamp;
}

interface CalendarPreferences {
  minRestHours: number; // Horas mínimas de descanso entre eventos
  maxEventsPerDay: number; // Máximo de eventos por día
  preferredEventTypes: string[]; // Tipos de eventos preferidos
  blackoutDates: Timestamp[]; // Fechas específicas bloqueadas
  
  workingHours: {
    start: string; // "09:00"
    end: string;   // "18:00"
    days: number[]; // [1,2,3,4,5,6,7] - Lunes=1, Domingo=7
  };
  
  travelPreferences: {
    maxTravelDistanceKm: number;
    maxTravelTimeHours: number;
    preferredTravelMode: 'car' | 'public' | 'walking';
  };
  
  notificationSettings: {
    reminderMinutes: number[]; // [60, 30, 15] - Recordatorios en minutos
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
}
```

### **📊 Colección: `calendarConflicts`**

```typescript
interface CalendarConflict {
  id: string;
  musicianId: string;
  eventId: string;
  conflictType: 'time_overlap' | 'insufficient_margin' | 'blackout_date' | 'working_hours';
  
  conflictingEvent?: {
    eventId: string;
    eventName: string;
    startTime: Timestamp;
    endTime: Timestamp;
  };
  
  details: {
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    suggestedResolution?: string;
  };
  
  detectedAt: Timestamp;
  resolvedAt?: Timestamp;
  status: 'active' | 'resolved' | 'ignored';
}
```

## 🔧 Servicios

### **📅 CalendarService**

```typescript
class CalendarService {
  private db: FirebaseFirestore.Firestore;
  
  constructor() {
    this.db = admin.firestore();
  }
  
  // Obtener calendario del músico
  async getMusicianCalendar(musicianId: string): Promise<MusicianCalendar | null> {
    try {
      const doc = await this.db
        .collection('musicianCalendar')
        .doc(musicianId)
        .get();
        
      return doc.exists ? doc.data() as MusicianCalendar : null;
    } catch (error) {
      console.error('Error obteniendo calendario:', error);
      throw new Error('Error obteniendo calendario del músico');
    }
  }
  
  // Agregar evento al calendario
  async addEvent(
    musicianId: string, 
    event: Omit<CalendarEvent, 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const eventId = this.db.collection('events').doc().id;
      
      const newEvent: CalendarEvent = {
        ...event,
        eventId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await this.db
        .collection('musicianCalendar')
        .doc(musicianId)
        .update({
          events: admin.firestore.FieldValue.arrayUnion(newEvent),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
      return eventId;
    } catch (error) {
      console.error('Error agregando evento:', error);
      throw new Error('Error agregando evento al calendario');
    }
  }
  
  // Actualizar evento
  async updateEvent(
    musicianId: string, 
    eventId: string, 
    updates: Partial<CalendarEvent>
  ): Promise<void> {
    try {
      const calendar = await this.getMusicianCalendar(musicianId);
      if (!calendar) throw new Error('Calendario no encontrado');
      
      const updatedEvents = calendar.events.map(event => 
        event.eventId === eventId 
          ? { ...event, ...updates, updatedAt: admin.firestore.FieldValue.serverTimestamp() }
          : event
      );
      
      await this.db
        .collection('musicianCalendar')
        .doc(musicianId)
        .update({
          events: updatedEvents,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
      console.error('Error actualizando evento:', error);
      throw new Error('Error actualizando evento');
    }
  }
  
  // Eliminar evento
  async removeEvent(musicianId: string, eventId: string): Promise<void> {
    try {
      const calendar = await this.getMusicianCalendar(musicianId);
      if (!calendar) throw new Error('Calendario no encontrado');
      
      const filteredEvents = calendar.events.filter(event => event.eventId !== eventId);
      
      await this.db
        .collection('musicianCalendar')
        .doc(musicianId)
        .update({
          events: filteredEvents,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
      console.error('Error eliminando evento:', error);
      throw new Error('Error eliminando evento');
    }
  }
  
  // Obtener eventos en un rango de fechas
  async getEventsInDateRange(
    musicianId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<CalendarEvent[]> {
    try {
      const calendar = await this.getMusicianCalendar(musicianId);
      if (!calendar) return [];
      
      return calendar.events.filter(event => {
        const eventStart = event.startTime.toDate();
        const eventEnd = event.endTime.toDate();
        
        return eventStart >= startDate && eventEnd <= endDate;
      });
    } catch (error) {
      console.error('Error obteniendo eventos en rango:', error);
      throw new Error('Error obteniendo eventos en rango de fechas');
    }
  }
}
```

### **🔍 ConflictDetectionService**

```typescript
class ConflictDetectionService {
  private db: FirebaseFirestore.Firestore;
  private calendarService: CalendarService;
  
  constructor() {
    this.db = admin.firestore();
    this.calendarService = new CalendarService();
  }
  
  // Verificar disponibilidad para un nuevo evento
  async checkAvailability(
    musicianId: string, 
    eventDate: Date, 
    durationHours: number,
    options?: AvailabilityCheckOptions
  ): Promise<AvailabilityCheckResult> {
    try {
      const calendar = await this.calendarService.getMusicianCalendar(musicianId);
      if (!calendar) {
        return {
          isAvailable: true,
          conflicts: [],
          warnings: []
        };
      }
      
      const conflicts: CalendarConflict[] = [];
      const warnings: string[] = [];
      
      // 1. Verificar conflictos de tiempo
      const timeConflicts = await this.checkTimeConflicts(
        calendar.events, 
        eventDate, 
        durationHours
      );
      conflicts.push(...timeConflicts);
      
      // 2. Verificar fechas bloqueadas
      const blackoutConflicts = this.checkBlackoutDates(
        calendar.blockedDates, 
        eventDate
      );
      conflicts.push(...blackoutConflicts);
      
      // 3. Verificar horario de trabajo
      const workingHoursConflicts = this.checkWorkingHours(
        calendar.preferences.workingHours, 
        eventDate
      );
      conflicts.push(...workingHoursConflicts);
      
      // 4. Verificar límites diarios
      const dailyLimitWarnings = this.checkDailyLimits(
        calendar.events, 
        calendar.preferences.maxEventsPerDay, 
        eventDate
      );
      warnings.push(...dailyLimitWarnings);
      
      // 5. Verificar margen de tiempo
      const marginConflicts = this.checkTimeMargin(
        calendar.events, 
        eventDate, 
        durationHours, 
        options?.minMarginHours || 1
      );
      conflicts.push(...marginConflicts);
      
      const isAvailable = conflicts.length === 0;
      
      return {
        isAvailable,
        conflicts,
        warnings,
        nextAvailableSlot: isAvailable ? null : await this.findNextAvailableSlot(
          musicianId, 
          eventDate, 
          durationHours
        )
      };
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      throw new Error('Error verificando disponibilidad');
    }
  }
  
  // Verificar conflictos de tiempo
  private async checkTimeConflicts(
    events: CalendarEvent[], 
    eventDate: Date, 
    durationHours: number
  ): Promise<CalendarConflict[]> {
    const conflicts: CalendarConflict[] = [];
    const eventStart = eventDate;
    const eventEnd = new Date(eventDate.getTime() + durationHours * 60 * 60 * 1000);
    
    events.forEach(event => {
      if (event.status === 'cancelled') return;
      
      const existingStart = event.startTime.toDate();
      const existingEnd = event.endTime.toDate();
      
      // Verificar superposición
      if (eventStart < existingEnd && eventEnd > existingStart) {
        conflicts.push({
          id: this.db.collection('calendarConflicts').doc().id,
          musicianId: event.musicianId,
          eventId: event.eventId,
          conflictType: 'time_overlap',
          conflictingEvent: {
            eventId: event.eventId,
            eventName: event.eventName,
            startTime: event.startTime,
            endTime: event.endTime
          },
          details: {
            description: `El evento se superpone con "${event.eventName}"`,
            severity: 'high'
          },
          detectedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'active'
        });
      }
    });
    
    return conflicts;
  }
  
  // Verificar fechas bloqueadas
  private checkBlackoutDates(
    blockedDates: BlockedDate[], 
    eventDate: Date
  ): CalendarConflict[] {
    const conflicts: CalendarConflict[] = [];
    
    blockedDates.forEach(blocked => {
      const blockedStart = blocked.startDate.toDate();
      const blockedEnd = blocked.endDate.toDate();
      
      if (eventDate >= blockedStart && eventDate <= blockedEnd) {
        conflicts.push({
          id: this.db.collection('calendarConflicts').doc().id,
          musicianId: blocked.musicianId,
          eventId: '',
          conflictType: 'blackout_date',
          details: {
            description: `La fecha está bloqueada: ${blocked.reason}`,
            severity: 'critical'
          },
          detectedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'active'
        });
      }
    });
    
    return conflicts;
  }
  
  // Verificar horario de trabajo
  private checkWorkingHours(
    workingHours: any, 
    eventDate: Date
  ): CalendarConflict[] {
    const conflicts: CalendarConflict[] = [];
    
    const currentDay = eventDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const currentTime = eventDate.toTimeString().slice(0, 5); // "HH:MM"
    
    // Verificar si es día laboral
    if (!workingHours.days.includes(currentDay)) {
      conflicts.push({
        id: this.db.collection('calendarConflicts').doc().id,
        musicianId: '',
        eventId: '',
        conflictType: 'working_hours',
        details: {
          description: 'El evento está fuera del horario de trabajo',
          severity: 'medium'
        },
        detectedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active'
      });
    }
    
    // Verificar si está dentro del horario
    if (currentTime < workingHours.start || currentTime > workingHours.end) {
      conflicts.push({
        id: this.db.collection('calendarConflicts').doc().id,
        musicianId: '',
        eventId: '',
        conflictType: 'working_hours',
        details: {
          description: 'El evento está fuera del horario de trabajo',
          severity: 'medium'
        },
        detectedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active'
      });
    }
    
    return conflicts;
  }
  
  // Verificar límites diarios
  private checkDailyLimits(
    events: CalendarEvent[], 
    maxEventsPerDay: number, 
    eventDate: Date
  ): string[] {
    const warnings: string[] = [];
    
    const eventsOnDate = events.filter(event => {
      const eventDateOnly = event.startTime.toDate().toDateString();
      const targetDateOnly = eventDate.toDateString();
      return eventDateOnly === targetDateOnly && event.status !== 'cancelled';
    });
    
    if (eventsOnDate.length >= maxEventsPerDay) {
      warnings.push(`Ya tienes ${eventsOnDate.length} eventos programados para este día`);
    }
    
    return warnings;
  }
  
  // Verificar margen de tiempo
  private checkTimeMargin(
    events: CalendarEvent[], 
    eventDate: Date, 
    durationHours: number, 
    minMarginHours: number
  ): CalendarConflict[] {
    const conflicts: CalendarConflict[] = [];
    const eventStart = eventDate;
    const eventEnd = new Date(eventDate.getTime() + durationHours * 60 * 60 * 1000);
    
    events.forEach(event => {
      if (event.status === 'cancelled') return;
      
      const existingStart = event.startTime.toDate();
      const existingEnd = event.endTime.toDate();
      
      // Calcular tiempo entre eventos
      const timeBefore = (existingStart.getTime() - eventEnd.getTime()) / (1000 * 60 * 60);
      const timeAfter = (eventStart.getTime() - existingEnd.getTime()) / (1000 * 60 * 60);
      
      if (timeBefore > 0 && timeBefore < minMarginHours) {
        conflicts.push({
          id: this.db.collection('calendarConflicts').doc().id,
          musicianId: event.musicianId,
          eventId: event.eventId,
          conflictType: 'insufficient_margin',
          conflictingEvent: {
            eventId: event.eventId,
            eventName: event.eventName,
            startTime: event.startTime,
            endTime: event.endTime
          },
          details: {
            description: `Insuficiente margen de tiempo antes de "${event.eventName}"`,
            severity: 'medium',
            suggestedResolution: `Programar al menos ${minMarginHours} hora(s) antes`
          },
          detectedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'active'
        });
      }
      
      if (timeAfter > 0 && timeAfter < minMarginHours) {
        conflicts.push({
          id: this.db.collection('calendarConflicts').doc().id,
          musicianId: event.musicianId,
          eventId: event.eventId,
          conflictType: 'insufficient_margin',
          conflictingEvent: {
            eventId: event.eventId,
            eventName: event.eventName,
            startTime: event.startTime,
            endTime: event.endTime
          },
          details: {
            description: `Insuficiente margen de tiempo después de "${event.eventName}"`,
            severity: 'medium',
            suggestedResolution: `Programar al menos ${minMarginHours} hora(s) después`
          },
          detectedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'active'
        });
      }
    });
    
    return conflicts;
  }
  
  // Encontrar próximo slot disponible
  private async findNextAvailableSlot(
    musicianId: string, 
    eventDate: Date, 
    durationHours: number
  ): Promise<Date | null> {
    try {
      // Buscar en las próximas 7 días
      for (let day = 1; day <= 7; day++) {
        const checkDate = new Date(eventDate.getTime() + day * 24 * 60 * 60 * 1000);
        
        // Verificar cada hora del día
        for (let hour = 9; hour <= 18; hour++) {
          const slotStart = new Date(checkDate);
          slotStart.setHours(hour, 0, 0, 0);
          
          const availability = await this.checkAvailability(
            musicianId, 
            slotStart, 
            durationHours
          );
          
          if (availability.isAvailable) {
            return slotStart;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error encontrando slot disponible:', error);
      return null;
    }
  }
}
```

## 🎯 Endpoints

### **📅 POST /api/calendar/check-availability**

```typescript
// Verificar disponibilidad para un evento
router.post('/check-availability', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { musicianId, eventDate, durationHours, options } = req.body;
      
      const conflictService = new ConflictDetectionService();
      const result = await conflictService.checkAvailability(
        musicianId, 
        new Date(eventDate), 
        durationHours, 
        options
      );
      
      res.json({ 
        success: true, 
        data: result 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error verificando disponibilidad' 
      });
    }
  }
);
```

### **📊 GET /api/calendar/musician/:musicianId**

```typescript
// Obtener calendario del músico
router.get('/musician/:musicianId', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { musicianId } = req.params;
      const { startDate, endDate } = req.query;
      
      const calendarService = new CalendarService();
      let calendar = await calendarService.getMusicianCalendar(musicianId);
      
      if (!calendar) {
        return res.status(404).json({ 
          success: false, 
          message: 'Calendario no encontrado' 
        });
      }
      
      // Filtrar por rango de fechas si se especifica
      if (startDate && endDate) {
        const events = await calendarService.getEventsInDateRange(
          musicianId, 
          new Date(startDate as string), 
          new Date(endDate as string)
        );
        calendar = { ...calendar, events };
      }
      
      res.json({ 
        success: true, 
        data: calendar 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo calendario' 
      });
    }
  }
);
```

### **🚫 POST /api/calendar/block-date**

```typescript
// Bloquear fecha
router.post('/block-date', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const musicianId = req.user?.id;
      const { startDate, endDate, reason, isRecurring, recurrencePattern } = req.body;
      
      const calendarService = new CalendarService();
      const calendar = await calendarService.getMusicianCalendar(musicianId);
      
      if (!calendar) {
        // Crear calendario si no existe
        await calendarService.createCalendar(musicianId);
      }
      
      const blockedDate: BlockedDate = {
        id: admin.firestore().collection('blockedDates').doc().id,
        startDate: admin.firestore.Timestamp.fromDate(new Date(startDate)),
        endDate: admin.firestore.Timestamp.fromDate(new Date(endDate)),
        reason,
        isRecurring,
        recurrencePattern,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await calendarService.addBlockedDate(musicianId, blockedDate);
      
      res.json({ 
        success: true, 
        message: 'Fecha bloqueada correctamente' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error bloqueando fecha' 
      });
    }
  }
);
```

### **🗑️ DELETE /api/calendar/block-date/:blockId**

```typescript
// Eliminar fecha bloqueada
router.delete('/block-date/:blockId', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const musicianId = req.user?.id;
      const { blockId } = req.params;
      
      const calendarService = new CalendarService();
      await calendarService.removeBlockedDate(musicianId, blockId);
      
      res.json({ 
        success: true, 
        message: 'Fecha desbloqueada correctamente' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error desbloqueando fecha' 
      });
    }
  }
);
```

## 🧪 Testing

### **📋 Tests Unitarios**

```typescript
describe('ConflictDetectionService', () => {
  let conflictService: ConflictDetectionService;
  
  beforeEach(() => {
    conflictService = new ConflictDetectionService();
  });
  
  test('should detect time conflicts correctly', async () => {
    const events = [
      {
        eventId: '1',
        eventName: 'Evento 1',
        startTime: admin.firestore.Timestamp.fromDate(new Date('2024-06-15T10:00:00')),
        endTime: admin.firestore.Timestamp.fromDate(new Date('2024-06-15T12:00:00')),
        status: 'confirmed'
      }
    ];
    
    const newEventDate = new Date('2024-06-15T11:00:00');
    const conflicts = await conflictService.checkTimeConflicts(events, newEventDate, 2);
    
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0].conflictType).toBe('time_overlap');
  });
  
  test('should check time margin correctly', async () => {
    const events = [
      {
        eventId: '1',
        eventName: 'Evento 1',
        startTime: admin.firestore.Timestamp.fromDate(new Date('2024-06-15T10:00:00')),
        endTime: admin.firestore.Timestamp.fromDate(new Date('2024-06-15T12:00:00')),
        status: 'confirmed'
      }
    ];
    
    const newEventDate = new Date('2024-06-15T12:30:00'); // Solo 30 min de margen
    const conflicts = await conflictService.checkTimeMargin(events, newEventDate, 2, 1);
    
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0].conflictType).toBe('insufficient_margin');
  });
});
```

## 📊 Monitoreo

### **📈 Métricas a Monitorear**

- **Conflictos detectados**: Número de conflictos por día
- **Tiempo de verificación**: Tiempo para verificar disponibilidad
- **Slots disponibles**: Porcentaje de slots disponibles
- **Errores de calendario**: Errores en operaciones de calendario

### **🔍 Logs**

```typescript
// Logs de verificación de disponibilidad
logger.info('Disponibilidad verificada', {
  musicianId,
  eventDate,
  durationHours,
  isAvailable,
  conflictsCount: conflicts.length
});

// Logs de conflictos detectados
logger.warn('Conflicto detectado', {
  musicianId,
  conflictType,
  severity,
  description
});

// Logs de eventos agregados
logger.info('Evento agregado al calendario', {
  musicianId,
  eventId,
  eventName,
  startTime,
  endTime
});
```

## 🚀 Deployment

### **📋 Configuración de Producción**

```typescript
// Variables de entorno
CALENDAR_CLEANUP_INTERVAL_HOURS=24
CONFLICT_DETECTION_ENABLED=true
MIN_MARGIN_HOURS=1
MAX_EVENTS_PER_DAY=5
```

### **📋 Cron Jobs**

```typescript
// Limpiar conflictos resueltos diariamente
export const cleanupResolvedConflicts = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const conflictService = new ConflictDetectionService();
    await conflictService.cleanupResolvedConflicts();
  });
```

## 🎯 Criterios de Éxito

### **✅ Funcional**
- Detección de conflictos funciona correctamente
- Verificación de margen de tiempo precisa
- Gestión de fechas bloqueadas efectiva
- Endpoints responden correctamente

### **📊 Performance**
- Tiempo de verificación < 1 segundo
- Escalabilidad con múltiples músicos
- Sin memory leaks en operaciones largas
- Optimización de consultas a Firestore

### **🔒 Seguridad**
- Validación de fechas y horarios
- Verificación de permisos por músico
- Logs de auditoría completos
- Protección contra manipulación de fechas

---

**📅 Fecha de Creación**: $(date)
**👨‍💻 Autor**: Sistema de Documentación Automática
**📋 Versión**: 1.0.0
**🎯 Estado**: Listo para Implementación 