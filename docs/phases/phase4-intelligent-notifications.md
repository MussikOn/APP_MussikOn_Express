# 🔔 Fase 4: Sistema de Notificaciones Inteligentes

## 📋 Resumen de la Fase

Esta fase implementa un sistema completo de notificaciones inteligentes que gestiona automáticamente las comunicaciones entre creadores de eventos y músicos, incluyendo notificaciones cuando no hay músicos disponibles y priorización automática de mensajes.

## 🎯 Objetivos

- ✅ Base de datos de notificaciones inteligentes
- ✅ Servicio de notificaciones con priorización automática
- ✅ Múltiples canales de entrega (push, email, SMS, in-app)
- ✅ Notificaciones cuando no hay músicos disponibles
- ✅ Sistema de seguimiento y análisis de notificaciones
- ✅ Endpoints para gestión de notificaciones

## 🗄️ Base de Datos

### **📊 Colección: `intelligentNotifications`**

```typescript
interface IntelligentNotification {
  notificationId: string;
  type: NotificationType;
  recipientId: string;
  recipientType: 'musician' | 'event_organizer' | 'admin';
  
  content: {
    title: string;
    message: string;
    data: NotificationData;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'musician_request' | 'availability_alert' | 'rate_update' | 'conflict_warning' | 'no_musicians' | 'reminder' | 'system';
  };
  
  delivery: {
    channels: DeliveryChannel[];
    sentAt?: Timestamp;
    deliveredAt?: Timestamp;
    readAt?: Timestamp;
    failedAt?: Timestamp;
    retryCount: number;
    maxRetries: number;
  };
  
  context: {
    eventId?: string;
    musicianId?: string;
    relatedNotifications: string[];
    sourceAction: string;
    triggerEvent: string;
  };
  
  analytics: {
    openRate: number;
    clickRate: number;
    responseTime?: number;
    userAction?: 'accepted' | 'rejected' | 'ignored' | 'contacted';
  };
  
  createdAt: Timestamp;
  scheduledFor?: Timestamp;
  expiresAt?: Timestamp;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'expired';
}

type NotificationType = 
  | 'musician_request' 
  | 'availability_alert' 
  | 'rate_update' 
  | 'conflict_warning' 
  | 'no_musicians_available'
  | 'event_reminder'
  | 'payment_reminder'
  | 'system_alert';

type DeliveryChannel = 'push' | 'email' | 'sms' | 'in_app' | 'webhook';

interface NotificationData {
  eventDetails?: {
    eventName: string;
    eventDate: Timestamp;
    location: string;
    duration: number;
  };
  musicianDetails?: {
    name: string;
    instrument: string;
    rating: number;
    experience: number;
  };
  rateDetails?: {
    amount: number;
    currency: string;
    breakdown: RateBreakdown;
  };
  alternatives?: {
    musicians: MusicianAlternative[];
    suggestions: string[];
  };
  actionButtons?: {
    primary: { text: string; action: string; url?: string };
    secondary?: { text: string; action: string; url?: string };
  };
}
```

### **📊 Colección: `notificationPreferences`**

```typescript
interface NotificationPreferences {
  userId: string;
  userType: 'musician' | 'event_organizer';
  
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    in_app: boolean;
  };
  
  categories: {
    musician_request: NotificationCategoryPreference;
    availability_alert: NotificationCategoryPreference;
    rate_update: NotificationCategoryPreference;
    conflict_warning: NotificationCategoryPreference;
    no_musicians: NotificationCategoryPreference;
    event_reminder: NotificationCategoryPreference;
    payment_reminder: NotificationCategoryPreference;
    system_alert: NotificationCategoryPreference;
  };
  
  timing: {
    quietHours: {
      enabled: boolean;
      start: string; // "22:00"
      end: string;   // "08:00"
      timezone: string;
    };
    maxNotificationsPerDay: number;
    batchNotifications: boolean;
  };
  
  priority: {
    urgent: boolean;
    high: boolean;
    medium: boolean;
    low: boolean;
  };
  
  updatedAt: Timestamp;
}

interface NotificationCategoryPreference {
  enabled: boolean;
  channels: DeliveryChannel[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  quietHours: boolean;
}
```

### **📊 Colección: `notificationTemplates`**

```typescript
interface NotificationTemplate {
  templateId: string;
  type: NotificationType;
  language: string;
  
  content: {
    title: string;
    message: string;
    shortMessage?: string;
    emailSubject?: string;
    emailBody?: string;
    smsText?: string;
  };
  
  variables: {
    required: string[];
    optional: string[];
  };
  
  priority: 'low' | 'medium' | 'high' | 'urgent';
  defaultChannels: DeliveryChannel[];
  
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 🔧 Servicios

### **🔔 IntelligentNotificationService**

```typescript
class IntelligentNotificationService {
  private db: FirebaseFirestore.Firestore;
  private templateService: NotificationTemplateService;
  private deliveryService: NotificationDeliveryService;
  private priorityService: NotificationPriorityService;
  
  constructor() {
    this.db = admin.firestore();
    this.templateService = new NotificationTemplateService();
    this.deliveryService = new NotificationDeliveryService();
    this.priorityService = new NotificationPriorityService();
  }
  
  // Notificar cuando no hay músicos disponibles
  async notifyNoMusiciansAvailable(eventDetails: EventDetails): Promise<void> {
    try {
      // 1. Analizar por qué no hay músicos disponibles
      const analysis = await this.analyzeNoMusiciansReason(eventDetails);
      
      // 2. Generar sugerencias alternativas
      const alternatives = await this.generateAlternatives(eventDetails);
      
      // 3. Crear notificación inteligente
      const notification = await this.createNotification({
        type: 'no_musicians_available',
        recipientId: eventDetails.organizerId,
        recipientType: 'event_organizer',
        content: {
          title: 'No hay músicos disponibles',
          message: this.generateNoMusiciansMessage(analysis, alternatives),
          data: {
            eventDetails: {
              eventName: eventDetails.eventName,
              eventDate: admin.firestore.Timestamp.fromDate(eventDetails.eventDate),
              location: eventDetails.location,
              duration: eventDetails.durationHours
            },
            alternatives: {
              musicians: alternatives.musicians,
              suggestions: alternatives.suggestions
            },
            actionButtons: {
              primary: {
                text: 'Ver Alternativas',
                action: 'view_alternatives'
              },
              secondary: {
                text: 'Modificar Evento',
                action: 'modify_event'
              }
            }
          },
          priority: 'high',
          category: 'no_musicians'
        },
        context: {
          eventId: eventDetails.eventId,
          sourceAction: 'musician_search',
          triggerEvent: 'no_musicians_found'
        }
      });
      
      // 4. Enviar notificación
      await this.sendNotification(notification);
      
      // 5. Programar seguimiento
      await this.scheduleFollowUp(eventDetails);
      
    } catch (error) {
      console.error('Error notificando no músicos disponibles:', error);
      throw new Error('Error notificando no músicos disponibles');
    }
  }
  
  // Notificar solicitud a músico
  async notifyMusicianRequest(
    musicianId: string, 
    eventDetails: EventDetails,
    rateCalculation: RateCalculation
  ): Promise<void> {
    try {
      // 1. Obtener preferencias del músico
      const preferences = await this.getNotificationPreferences(musicianId);
      
      // 2. Calcular prioridad
      const priority = this.priorityService.calculatePriority(eventDetails, musicianId);
      
      // 3. Personalizar mensaje
      const message = await this.personalizeMusicianMessage(musicianId, eventDetails, rateCalculation);
      
      // 4. Crear notificación
      const notification = await this.createNotification({
        type: 'musician_request',
        recipientId: musicianId,
        recipientType: 'musician',
        content: {
          title: 'Nueva Solicitud de Evento',
          message: message,
          data: {
            eventDetails: {
              eventName: eventDetails.eventName,
              eventDate: admin.firestore.Timestamp.fromDate(eventDetails.eventDate),
              location: eventDetails.location,
              duration: eventDetails.durationHours
            },
            rateDetails: {
              amount: rateCalculation.calculation.totalForEvent,
              currency: rateCalculation.calculation.currency,
              breakdown: rateCalculation.breakdown
            },
            actionButtons: {
              primary: {
                text: 'Aceptar',
                action: 'accept_request'
              },
              secondary: {
                text: 'Rechazar',
                action: 'reject_request'
              }
            }
          },
          priority,
          category: 'musician_request'
        },
        context: {
          eventId: eventDetails.eventId,
          sourceAction: 'event_creation',
          triggerEvent: 'musician_request_sent'
        }
      });
      
      // 5. Enviar por canales preferidos
      await this.sendNotificationByPreferences(notification, preferences);
      
    } catch (error) {
      console.error('Error notificando solicitud a músico:', error);
      throw new Error('Error notificando solicitud a músico');
    }
  }
  
  // Analizar razón de no músicos disponibles
  private async analyzeNoMusiciansReason(eventDetails: EventDetails): Promise<NoMusiciansAnalysis> {
    const analysis: NoMusiciansAnalysis = {
      reasons: [],
      suggestions: []
    };
    
    // Verificar disponibilidad por fecha
    const availabilityCheck = await this.checkDateAvailability(eventDetails.eventDate);
    if (!availabilityCheck.isAvailable) {
      analysis.reasons.push('fecha_no_disponible');
      analysis.suggestions.push('Considerar cambiar la fecha del evento');
    }
    
    // Verificar disponibilidad por ubicación
    const locationCheck = await this.checkLocationAvailability(eventDetails.location);
    if (!locationCheck.isAvailable) {
      analysis.reasons.push('ubicacion_no_disponible');
      analysis.suggestions.push('Considerar cambiar la ubicación o ampliar el radio de búsqueda');
    }
    
    // Verificar disponibilidad por instrumento
    const instrumentCheck = await this.checkInstrumentAvailability(eventDetails.instrument);
    if (!instrumentCheck.isAvailable) {
      analysis.reasons.push('instrumento_no_disponible');
      analysis.suggestions.push('Considerar instrumentos alternativos');
    }
    
    // Verificar disponibilidad por presupuesto
    const budgetCheck = await this.checkBudgetAvailability(eventDetails.budget);
    if (!budgetCheck.isAvailable) {
      analysis.reasons.push('presupuesto_insuficiente');
      analysis.suggestions.push('Considerar aumentar el presupuesto o ajustar los requisitos');
    }
    
    return analysis;
  }
  
  // Generar alternativas
  private async generateAlternatives(eventDetails: EventDetails): Promise<EventAlternatives> {
    const alternatives: EventAlternatives = {
      musicians: [],
      suggestions: []
    };
    
    // Buscar músicos con instrumentos similares
    const similarMusicians = await this.findSimilarMusicians(eventDetails);
    alternatives.musicians.push(...similarMusicians);
    
    // Generar sugerencias de modificación
    alternatives.suggestions = [
      'Cambiar la fecha del evento',
      'Modificar la ubicación',
      'Ajustar el presupuesto',
      'Considerar instrumentos alternativos',
      'Ampliar el radio de búsqueda',
      'Programar con más anticipación'
    ];
    
    return alternatives;
  }
  
  // Crear notificación
  private async createNotification(notificationData: Partial<IntelligentNotification>): Promise<IntelligentNotification> {
    try {
      const notification: IntelligentNotification = {
        notificationId: this.db.collection('intelligentNotifications').doc().id,
        type: notificationData.type!,
        recipientId: notificationData.recipientId!,
        recipientType: notificationData.recipientType!,
        content: notificationData.content!,
        delivery: {
          channels: notificationData.content?.data?.actionButtons ? ['push', 'in_app'] : ['email'],
          retryCount: 0,
          maxRetries: 3
        },
        context: notificationData.context!,
        analytics: {
          openRate: 0,
          clickRate: 0
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending'
      };
      
      // Aplicar plantilla si es necesario
      if (notificationData.type) {
        const template = await this.templateService.getTemplate(notificationData.type, 'es');
        if (template) {
          notification.content = this.applyTemplate(template, notification.content);
        }
      }
      
      // Guardar notificación
      await this.db
        .collection('intelligentNotifications')
        .doc(notification.notificationId)
        .set(notification);
      
      return notification;
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw new Error('Error creando notificación');
    }
  }
  
  // Enviar notificación
  private async sendNotification(notification: IntelligentNotification): Promise<void> {
    try {
      // Enviar por cada canal configurado
      for (const channel of notification.delivery.channels) {
        await this.deliveryService.sendByChannel(notification, channel);
      }
      
      // Actualizar estado
      await this.updateNotificationStatus(notification.notificationId, 'sent');
      
    } catch (error) {
      console.error('Error enviando notificación:', error);
      await this.updateNotificationStatus(notification.notificationId, 'failed');
      throw new Error('Error enviando notificación');
    }
  }
  
  // Enviar por preferencias del usuario
  private async sendNotificationByPreferences(
    notification: IntelligentNotification, 
    preferences: NotificationPreferences
  ): Promise<void> {
    try {
      const enabledChannels = this.getEnabledChannels(notification.type, preferences);
      
      for (const channel of enabledChannels) {
        if (preferences.channels[channel]) {
          await this.deliveryService.sendByChannel(notification, channel);
        }
      }
      
      await this.updateNotificationStatus(notification.notificationId, 'sent');
      
    } catch (error) {
      console.error('Error enviando notificación por preferencias:', error);
      throw new Error('Error enviando notificación por preferencias');
    }
  }
  
  // Programar seguimiento
  private async scheduleFollowUp(eventDetails: EventDetails): Promise<void> {
    try {
      const followUpDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas después
      
      const followUpNotification = await this.createNotification({
        type: 'event_reminder',
        recipientId: eventDetails.organizerId,
        recipientType: 'event_organizer',
        content: {
          title: 'Recordatorio: Buscar Músico',
          message: '¿Has encontrado un músico para tu evento? Si no, podemos ayudarte con más opciones.',
          priority: 'medium',
          category: 'event_reminder'
        },
        context: {
          eventId: eventDetails.eventId,
          sourceAction: 'follow_up',
          triggerEvent: 'no_musicians_follow_up'
        }
      });
      
      // Programar para envío posterior
      await this.scheduleNotification(followUpNotification, followUpDate);
      
    } catch (error) {
      console.error('Error programando seguimiento:', error);
    }
  }
  
  // Obtener preferencias de notificación
  private async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const doc = await this.db
        .collection('notificationPreferences')
        .doc(userId)
        .get();
        
      if (doc.exists) {
        return doc.data() as NotificationPreferences;
      }
      
      // Retornar preferencias por defecto
      return this.getDefaultPreferences();
    } catch (error) {
      console.error('Error obteniendo preferencias:', error);
      return this.getDefaultPreferences();
    }
  }
  
  // Personalizar mensaje para músico
  private async personalizeMusicianMessage(
    musicianId: string, 
    eventDetails: EventDetails, 
    rateCalculation: RateCalculation
  ): Promise<string> {
    try {
      // Obtener datos del músico
      const musician = await this.getMusicianData(musicianId);
      
      // Generar mensaje personalizado
      let message = `Hola ${musician.name}, tienes una nueva solicitud para un evento de ${eventDetails.eventType}. `;
      message += `El evento "${eventDetails.eventName}" se realizará el ${eventDetails.eventDate.toLocaleDateString()} `;
      message += `en ${eventDetails.location} con una duración de ${eventDetails.durationHours} horas. `;
      message += `La tarifa calculada es de $${rateCalculation.calculation.totalForEvent} USD. `;
      
      if (musician.preferences?.autoAcceptRequests) {
        message += 'Puedes aceptar automáticamente esta solicitud si te interesa.';
      } else {
        message += 'Por favor revisa los detalles y responde si estás disponible.';
      }
      
      return message;
    } catch (error) {
      console.error('Error personalizando mensaje:', error);
      return 'Tienes una nueva solicitud de evento. Revisa los detalles y responde si estás disponible.';
    }
  }
  
  // Generar mensaje de no músicos disponibles
  private generateNoMusiciansMessage(
    analysis: NoMusiciansAnalysis, 
    alternatives: EventAlternatives
  ): string {
    let message = 'No encontramos músicos disponibles para tu evento. ';
    
    if (analysis.reasons.includes('fecha_no_disponible')) {
      message += 'La fecha seleccionada está muy ocupada. ';
    }
    
    if (analysis.reasons.includes('ubicacion_no_disponible')) {
      message += 'No hay músicos disponibles en esa ubicación. ';
    }
    
    if (analysis.reasons.includes('presupuesto_insuficiente')) {
      message += 'El presupuesto puede ser insuficiente para los músicos disponibles. ';
    }
    
    message += 'Te hemos preparado algunas alternativas y sugerencias para ayudarte a encontrar el músico perfecto.';
    
    return message;
  }
  
  // Actualizar estado de notificación
  private async updateNotificationStatus(
    notificationId: string, 
    status: IntelligentNotification['status']
  ): Promise<void> {
    try {
      await this.db
        .collection('intelligentNotifications')
        .doc(notificationId)
        .update({
          status,
          'delivery.sentAt': status === 'sent' ? admin.firestore.FieldValue.serverTimestamp() : null,
          'delivery.deliveredAt': status === 'delivered' ? admin.firestore.FieldValue.serverTimestamp() : null
        });
    } catch (error) {
      console.error('Error actualizando estado de notificación:', error);
    }
  }
  
  // Obtener canales habilitados
  private getEnabledChannels(
    type: NotificationType, 
    preferences: NotificationPreferences
  ): DeliveryChannel[] {
    const category = this.getCategoryFromType(type);
    const categoryPrefs = preferences.categories[category];
    
    if (!categoryPrefs.enabled) return [];
    
    return categoryPrefs.channels.filter(channel => preferences.channels[channel]);
  }
  
  // Obtener categoría desde tipo
  private getCategoryFromType(type: NotificationType): keyof NotificationPreferences['categories'] {
    switch (type) {
      case 'musician_request': return 'musician_request';
      case 'availability_alert': return 'availability_alert';
      case 'rate_update': return 'rate_update';
      case 'conflict_warning': return 'conflict_warning';
      case 'no_musicians_available': return 'no_musicians';
      case 'event_reminder': return 'event_reminder';
      case 'payment_reminder': return 'payment_reminder';
      case 'system_alert': return 'system_alert';
      default: return 'system_alert';
    }
  }
  
  // Obtener preferencias por defecto
  private getDefaultPreferences(): NotificationPreferences {
    return {
      userId: '',
      userType: 'event_organizer',
      channels: {
        push: true,
        email: true,
        sms: false,
        in_app: true
      },
      categories: {
        musician_request: { enabled: true, channels: ['push', 'in_app'], priority: 'high', quietHours: false },
        availability_alert: { enabled: true, channels: ['email'], priority: 'medium', quietHours: true },
        rate_update: { enabled: true, channels: ['in_app'], priority: 'low', quietHours: true },
        conflict_warning: { enabled: true, channels: ['push', 'email'], priority: 'high', quietHours: false },
        no_musicians: { enabled: true, channels: ['push', 'email'], priority: 'high', quietHours: false },
        event_reminder: { enabled: true, channels: ['email'], priority: 'medium', quietHours: true },
        payment_reminder: { enabled: true, channels: ['email'], priority: 'medium', quietHours: true },
        system_alert: { enabled: true, channels: ['in_app'], priority: 'low', quietHours: true }
      },
      timing: {
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00',
          timezone: 'America/Santo_Domingo'
        },
        maxNotificationsPerDay: 10,
        batchNotifications: true
      },
      priority: {
        urgent: true,
        high: true,
        medium: true,
        low: false
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
  }
}
```

### **📊 NotificationPriorityService**

```typescript
class NotificationPriorityService {
  // Calcular prioridad de notificación
  calculatePriority(eventDetails: EventDetails, musicianId: string): 'low' | 'medium' | 'high' | 'urgent' {
    let priority = 'medium';
    
    // Urgencia del evento
    const daysUntilEvent = Math.ceil(
      (eventDetails.eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilEvent <= 1) priority = 'urgent';
    else if (daysUntilEvent <= 3) priority = 'high';
    else if (daysUntilEvent <= 7) priority = 'medium';
    else priority = 'low';
    
    // Tipo de evento
    if (eventDetails.eventType === 'boda') {
      priority = this.upgradePriority(priority);
    }
    
    // Relación previa
    if (this.hasPreviousCollaboration(eventDetails.organizerId, musicianId)) {
      priority = this.upgradePriority(priority);
    }
    
    return priority as 'low' | 'medium' | 'high' | 'urgent';
  }
  
  // Mejorar prioridad
  private upgradePriority(priority: string): string {
    switch (priority) {
      case 'low': return 'medium';
      case 'medium': return 'high';
      case 'high': return 'urgent';
      default: return 'urgent';
    }
  }
  
  // Verificar colaboración previa
  private hasPreviousCollaboration(organizerId: string, musicianId: string): boolean {
    // Implementar lógica para verificar colaboraciones previas
    return false;
  }
}
```

## 🎯 Endpoints

### **🔔 POST /api/notifications/send**

```typescript
// Enviar notificación
router.post('/send', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { type, recipientId, recipientType, content, context } = req.body;
      
      const notificationService = new IntelligentNotificationService();
      
      if (type === 'no_musicians_available') {
        await notificationService.notifyNoMusiciansAvailable(context.eventDetails);
      } else if (type === 'musician_request') {
        await notificationService.notifyMusicianRequest(
          recipientId, 
          context.eventDetails, 
          context.rateCalculation
        );
      }
      
      res.json({ 
        success: true, 
        message: 'Notificación enviada correctamente' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error enviando notificación' 
      });
    }
  }
);
```

### **📊 GET /api/notifications/user/:userId**

```typescript
// Obtener notificaciones del usuario
router.get('/user/:userId', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { status, limit = 20, offset = 0 } = req.query;
      
      const notificationService = new IntelligentNotificationService();
      const notifications = await notificationService.getUserNotifications(
        userId, 
        status as string, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      
      res.json({ 
        success: true, 
        data: notifications 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo notificaciones' 
      });
    }
  }
);
```

### **✅ PUT /api/notifications/:notificationId/read**

```typescript
// Marcar notificación como leída
router.put('/:notificationId/read', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { notificationId } = req.params;
      
      const notificationService = new IntelligentNotificationService();
      await notificationService.markAsRead(notificationId);
      
      res.json({ 
        success: true, 
        message: 'Notificación marcada como leída' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error marcando notificación como leída' 
      });
    }
  }
);
```

### **⚙️ POST /api/notifications/preferences**

```typescript
// Actualizar preferencias de notificación
router.post('/preferences', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const preferences = req.body;
      
      const notificationService = new IntelligentNotificationService();
      await notificationService.updatePreferences(userId, preferences);
      
      res.json({ 
        success: true, 
        message: 'Preferencias actualizadas correctamente' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error actualizando preferencias' 
      });
    }
  }
);
```

## 🧪 Testing

### **📋 Tests Unitarios**

```typescript
describe('IntelligentNotificationService', () => {
  let notificationService: IntelligentNotificationService;
  
  beforeEach(() => {
    notificationService = new IntelligentNotificationService();
  });
  
  test('should notify no musicians available correctly', async () => {
    const eventDetails = {
      eventId: 'test-event-id',
      eventName: 'Boda de Juan y María',
      eventDate: new Date('2024-06-15'),
      location: 'Santo Domingo',
      durationHours: 3,
      organizerId: 'test-organizer-id'
    };
    
    await notificationService.notifyNoMusiciansAvailable(eventDetails);
    
    // Verificar que se creó la notificación
    // Verificar que se programó el seguimiento
  });
  
  test('should notify musician request correctly', async () => {
    const musicianId = 'test-musician-id';
    const eventDetails = {
      eventId: 'test-event-id',
      eventName: 'Boda de Juan y María',
      eventDate: new Date('2024-06-15'),
      location: 'Santo Domingo',
      durationHours: 3,
      organizerId: 'test-organizer-id'
    };
    
    const rateCalculation = {
      calculation: {
        totalForEvent: 300,
        currency: 'USD'
      }
    };
    
    await notificationService.notifyMusicianRequest(musicianId, eventDetails, rateCalculation);
    
    // Verificar que se creó la notificación personalizada
    // Verificar que se envió por los canales correctos
  });
});
```

## 📊 Monitoreo

### **📈 Métricas a Monitorear**

- **Notificaciones enviadas**: Número de notificaciones por día
- **Tasa de entrega**: Porcentaje de notificaciones entregadas
- **Tasa de apertura**: Porcentaje de notificaciones abiertas
- **Tiempo de respuesta**: Tiempo promedio de respuesta

### **🔍 Logs**

```typescript
// Logs de notificaciones enviadas
logger.info('Notificación enviada', {
  notificationId,
  type,
  recipientId,
  channels: notification.delivery.channels,
  priority: notification.content.priority
});

// Logs de no músicos disponibles
logger.warn('No músicos disponibles', {
  eventId: eventDetails.eventId,
  reasons: analysis.reasons,
  alternativesCount: alternatives.musicians.length
});

// Logs de errores de entrega
logger.error('Error enviando notificación', {
  notificationId,
  channel,
  error: error.message,
  retryCount: notification.delivery.retryCount
});
```

## 🚀 Deployment

### **📋 Configuración de Producción**

```typescript
// Variables de entorno
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_BATCH_SIZE=100
QUIET_HOURS_ENABLED=true
MAX_NOTIFICATIONS_PER_DAY=50
```

### **📋 Cron Jobs**

```typescript
// Limpiar notificaciones expiradas diariamente
export const cleanupExpiredNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const notificationService = new IntelligentNotificationService();
    await notificationService.cleanupExpiredNotifications();
  });
```

## 🎯 Criterios de Éxito

### **✅ Funcional**
- Notificaciones se envían correctamente
- Priorización automática funciona
- Múltiples canales de entrega operativos
- Análisis de no músicos es preciso

### **📊 Performance**
- Tiempo de envío < 5 segundos
- Tasa de entrega > 95%
- Escalabilidad con múltiples usuarios
- Optimización de recursos

### **🔒 Seguridad**
- Validación de datos de entrada
- Verificación de permisos por usuario
- Logs de auditoría completos
- Protección contra spam

---

**📅 Fecha de Creación**: $(date)
**👨‍💻 Autor**: Sistema de Documentación Automática
**📋 Versión**: 1.0.0
**🎯 Estado**: Listo para Implementación 