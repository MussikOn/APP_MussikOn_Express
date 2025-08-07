# 📱 Integración Móvil - MussikOn API

## 📋 Índice

- [Descripción General](#descripción-general)
- [API para Aplicaciones Móviles](#api-para-aplicaciones-móviles)
- [Push Notifications](#push-notifications)
- [Sincronización Offline](#sincronización-offline)
- [Optimización de Rendimiento](#optimización-de-rendimiento)

## 🎯 Descripción General

La Integración Móvil de MussikOn proporciona APIs optimizadas y funcionalidades específicas para aplicaciones móviles, incluyendo notificaciones push, sincronización offline y optimización de rendimiento.

### Características Principales

- **APIs Optimizadas**: Endpoints específicos para móviles
- **Push Notifications**: Notificaciones en tiempo real
- **Sincronización Offline**: Funcionalidad sin conexión
- **Optimización de Datos**: Reducción de transferencia
- **Gestión de Estado**: Sincronización de estado local

## 🔌 API para Aplicaciones Móviles

### Endpoints Optimizados

```typescript
// routes/mobileRoutes.ts
router.get('/mobile/musicians', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, filters } = req.query;
    
    // Optimizar consulta para móviles
    const optimizedQuery = await mobileService.getOptimizedMusicians({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      filters: JSON.parse(filters as string || '{}')
    });
    
    // Incluir solo datos necesarios para móviles
    const mobileData = optimizedQuery.musicians.map(musician => ({
      id: musician.id,
      name: `${musician.personalInfo.firstName} ${musician.personalInfo.lastName}`,
      avatar: musician.personalInfo.profileImage,
      genres: musician.professionalInfo.genres.slice(0, 3), // Solo primeros 3 géneros
      rating: musician.metrics.averageRating,
      price: musician.pricing.hourlyRate,
      location: {
        city: musician.location.city,
        distance: musician.distance // Si se calculó
      },
      isAvailable: musician.status === 'active'
    }));
    
    res.json({
      musicians: mobileData,
      pagination: {
        page: optimizedQuery.pagination.page,
        hasMore: optimizedQuery.pagination.hasMore,
        total: optimizedQuery.pagination.total
      }
    });
  } catch (error) {
    logger.error('Error getting mobile musicians:', error);
    res.status(500).json({ error: 'Error al obtener músicos' });
  }
});

router.get('/mobile/events', async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const { status = 'upcoming' } = req.query;
    
    const events = await mobileService.getUserEvents(userId, status as string);
    
    // Optimizar datos de eventos para móviles
    const mobileEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.startTime,
      location: event.location.venue,
      status: event.status,
      musicianCount: event.musicians.length,
      totalCost: event.budget.spent
    }));
    
    res.json({ events: mobileEvents });
  } catch (error) {
    logger.error('Error getting mobile events:', error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});
```

### Servicio de Optimización Móvil

```typescript
// services/mobileService.ts
export class MobileService {
  async getOptimizedMusicians(options: MobileQueryOptions): Promise<OptimizedMusiciansResult> {
    try {
      // Aplicar filtros de optimización
      const query = this.buildOptimizedQuery(options);
      
      // Ejecutar consulta con límites específicos para móviles
      const snapshot = await query
        .limit(options.limit)
        .offset((options.page - 1) * options.limit)
        .get();
      
      // Procesar resultados para móviles
      const musicians = snapshot.docs.map(doc => {
        const data = doc.data();
        return this.optimizeMusicianData(data);
      });
      
      return {
        musicians,
        pagination: {
          page: options.page,
          hasMore: snapshot.docs.length === options.limit,
          total: await this.getTotalCount(options.filters)
        }
      };
    } catch (error) {
      logger.error('Error getting optimized musicians:', error);
      throw new Error('Error al obtener músicos optimizados');
    }
  }
  
  private optimizeMusicianData(musician: any): OptimizedMusician {
    return {
      id: musician.id,
      name: `${musician.personalInfo.firstName} ${musician.personalInfo.lastName}`,
      avatar: musician.personalInfo.profileImage,
      genres: musician.professionalInfo.genres.slice(0, 3),
      instruments: musician.professionalInfo.instruments.slice(0, 2),
      rating: musician.metrics.averageRating,
      reviewCount: musician.metrics.totalReviews,
      price: musician.pricing.hourlyRate,
      location: {
        city: musician.location.city,
        state: musician.location.state,
        coordinates: musician.location.coordinates
      },
      isAvailable: musician.status === 'active',
      responseTime: musician.metrics.responseTime
    };
  }
  
  private buildOptimizedQuery(options: MobileQueryOptions): FirestoreQuery {
    let query = admin.firestore()
      .collection('musicians')
      .where('status', '==', 'active');
    
    // Aplicar filtros básicos
    if (options.filters.genres) {
      query = query.where('professionalInfo.genres', 'array-contains-any', options.filters.genres);
    }
    
    if (options.filters.minRating) {
      query = query.where('metrics.averageRating', '>=', options.filters.minRating);
    }
    
    // Ordenar por relevancia
    query = query.orderBy('metrics.averageRating', 'desc');
    
    return query;
  }
}
```

## 🔔 Push Notifications

### Servicio de Notificaciones Push

```typescript
// services/pushNotificationService.ts
import { Expo } from 'expo-server-sdk';

export class PushNotificationService {
  private expo: Expo;
  
  constructor() {
    this.expo = new Expo();
  }
  
  async sendNotification(
    userId: string,
    notification: PushNotification
  ): Promise<void> {
    try {
      // Obtener tokens del usuario
      const tokens = await this.getUserPushTokens(userId);
      
      if (tokens.length === 0) {
        logger.warn(`No push tokens found for user ${userId}`);
        return;
      }
      
      // Crear mensajes de notificación
      const messages = tokens.map(token => ({
        to: token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data,
        priority: notification.priority || 'normal',
        channelId: notification.channelId || 'default'
      }));
      
      // Enviar notificaciones
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];
      
      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          logger.error('Error sending push notification chunk:', error);
        }
      }
      
      // Registrar envío
      await this.logNotificationSent(userId, notification, tickets);
      
    } catch (error) {
      logger.error('Error sending push notification:', error);
      throw new Error('Error al enviar notificación push');
    }
  }
  
  async sendBulkNotifications(
    userIds: string[],
    notification: PushNotification
  ): Promise<BulkNotificationResult> {
    try {
      const results: BulkNotificationResult = {
        sent: 0,
        failed: 0,
        errors: []
      };
      
      // Enviar notificaciones en paralelo
      const promises = userIds.map(async (userId) => {
        try {
          await this.sendNotification(userId, notification);
          results.sent++;
        } catch (error) {
          results.failed++;
          results.errors.push({ userId, error: error.message });
        }
      });
      
      await Promise.all(promises);
      
      return results;
    } catch (error) {
      logger.error('Error sending bulk notifications:', error);
      throw new Error('Error al enviar notificaciones masivas');
    }
  }
  
  async registerPushToken(userId: string, token: string): Promise<void> {
    try {
      // Validar token
      if (!Expo.isExpoPushToken(token)) {
        throw new Error('Token de notificación inválido');
      }
      
      // Guardar token en base de datos
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('push_tokens')
        .doc(token)
        .set({
          token,
          platform: this.detectPlatform(token),
          createdAt: new Date(),
          lastUsed: new Date()
        });
      
      logger.info(`Push token registered for user ${userId}`);
    } catch (error) {
      logger.error('Error registering push token:', error);
      throw new Error('Error al registrar token de notificación');
    }
  }
  
  private detectPlatform(token: string): 'ios' | 'android' {
    if (token.startsWith('ExponentPushToken[')) {
      return 'ios';
    }
    return 'android';
  }
}
```

### Tipos de Notificaciones

```typescript
// types/pushNotificationTypes.ts
interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'normal' | 'high';
  channelId?: string;
  sound?: string;
  badge?: number;
}

enum NotificationType {
  EVENT_REMINDER = 'event_reminder',
  NEW_MESSAGE = 'new_message',
  BOOKING_CONFIRMED = 'booking_confirmed',
  PAYMENT_RECEIVED = 'payment_received',
  SYSTEM_UPDATE = 'system_update'
}

// services/notificationTemplates.ts
export class NotificationTemplates {
  static getEventReminder(event: Event): PushNotification {
    return {
      title: 'Recordatorio de Evento',
      body: `Tu evento "${event.title}" comienza en 1 hora`,
      data: {
        type: NotificationType.EVENT_REMINDER,
        eventId: event.id
      },
      priority: 'high',
      channelId: 'events'
    };
  }
  
  static getNewMessage(senderName: string): PushNotification {
    return {
      title: 'Nuevo Mensaje',
      body: `${senderName} te envió un mensaje`,
      data: {
        type: NotificationType.NEW_MESSAGE
      },
      priority: 'normal',
      channelId: 'chat'
    };
  }
  
  static getBookingConfirmed(amount: number): PushNotification {
    return {
      title: 'Contratación Confirmada',
      body: `Tu contratación ha sido confirmada por $${amount}`,
      data: {
        type: NotificationType.BOOKING_CONFIRMED
      },
      priority: 'high',
      channelId: 'bookings'
    };
  }
}
```

## 📱 Sincronización Offline

### Servicio de Sincronización

```typescript
// services/offlineSyncService.ts
export class OfflineSyncService {
  async getOfflineData(userId: string): Promise<OfflineData> {
    try {
      // Obtener datos esenciales para funcionamiento offline
      const [userProfile, events, musicians] = await Promise.all([
        this.getUserProfile(userId),
        this.getUserEvents(userId),
        this.getFavoriteMusicians(userId)
      ]);
      
      return {
        userProfile: this.optimizeForOffline(userProfile),
        events: events.map(event => this.optimizeForOffline(event)),
        musicians: musicians.map(musician => this.optimizeForOffline(musician)),
        lastSync: new Date(),
        version: '1.0.0'
      };
    } catch (error) {
      logger.error('Error getting offline data:', error);
      throw new Error('Error al obtener datos offline');
    }
  }
  
  async syncOfflineChanges(
    userId: string,
    changes: OfflineChanges
  ): Promise<SyncResult> {
    try {
      const results: SyncResult = {
        success: [],
        failed: [],
        conflicts: []
      };
      
      // Procesar cambios de eventos
      if (changes.events) {
        for (const eventChange of changes.events) {
          try {
            await this.processEventChange(userId, eventChange);
            results.success.push(`event_${eventChange.id}`);
          } catch (error) {
            results.failed.push({
              type: 'event',
              id: eventChange.id,
              error: error.message
            });
          }
        }
      }
      
      // Procesar cambios de mensajes
      if (changes.messages) {
        for (const messageChange of changes.messages) {
          try {
            await this.processMessageChange(userId, messageChange);
            results.success.push(`message_${messageChange.id}`);
          } catch (error) {
            results.failed.push({
              type: 'message',
              id: messageChange.id,
              error: error.message
            });
          }
        }
      }
      
      // Registrar sincronización
      await this.logSync(userId, results);
      
      return results;
    } catch (error) {
      logger.error('Error syncing offline changes:', error);
      throw new Error('Error al sincronizar cambios offline');
    }
  }
  
  private async processEventChange(
    userId: string,
    change: EventChange
  ): Promise<void> {
    // Verificar conflictos
    const existingEvent = await this.getEventById(change.id);
    
    if (existingEvent && existingEvent.updatedAt > change.timestamp) {
      throw new Error('Conflicto de sincronización detectado');
    }
    
    // Aplicar cambio
    await this.applyEventChange(change);
  }
  
  private optimizeForOffline(data: any): any {
    // Remover campos innecesarios para offline
    const { _metadata, _internal, ...optimized } = data;
    
    // Comprimir datos si es necesario
    return this.compressData(optimized);
  }
}
```

## ⚡ Optimización de Rendimiento

### Compresión de Datos

```typescript
// services/compressionService.ts
export class CompressionService {
  async compressResponse(data: any): Promise<CompressedResponse> {
    try {
      // Comprimir datos usando gzip
      const jsonString = JSON.stringify(data);
      const compressed = await this.gzipCompress(jsonString);
      
      return {
        data: compressed,
        originalSize: jsonString.length,
        compressedSize: compressed.length,
        compressionRatio: (1 - compressed.length / jsonString.length) * 100
      };
    } catch (error) {
      logger.error('Error compressing response:', error);
      return { data, originalSize: 0, compressedSize: 0, compressionRatio: 0 };
    }
  }
  
  async decompressRequest(compressedData: Buffer): Promise<any> {
    try {
      const decompressed = await this.gzipDecompress(compressedData);
      return JSON.parse(decompressed);
    } catch (error) {
      logger.error('Error decompressing request:', error);
      throw new Error('Error al descomprimir datos');
    }
  }
  
  private async gzipCompress(data: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const zlib = require('zlib');
      zlib.gzip(data, (error: any, result: Buffer) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }
  
  private async gzipDecompress(data: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const zlib = require('zlib');
      zlib.gunzip(data, (error: any, result: Buffer) => {
        if (error) reject(error);
        else resolve(result.toString());
      });
    });
  }
}
```

### Cache para Móviles

```typescript
// services/mobileCacheService.ts
export class MobileCacheService {
  async getCachedData(key: string): Promise<any> {
    try {
      const cached = await admin.firestore()
        .collection('mobile_cache')
        .doc(key)
        .get();
      
      if (cached.exists && !this.isExpired(cached.data()!.expiresAt)) {
        return cached.data()!.data;
      }
      
      return null;
    } catch (error) {
      logger.error('Error getting cached data:', error);
      return null;
    }
  }
  
  async setCachedData(key: string, data: any, ttl: number = 3600): Promise<void> {
    try {
      await admin.firestore()
        .collection('mobile_cache')
        .doc(key)
        .set({
          data,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + ttl * 1000)
        });
    } catch (error) {
      logger.error('Error setting cached data:', error);
    }
  }
  
  private isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }
}
```

---

**Anterior**: [Despliegue](../deployment/README.md)  
**Siguiente**: [Testing](../testing/README.md) 