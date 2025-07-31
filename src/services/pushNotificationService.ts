import { db } from '../utils/firebase';
import { logger } from './loggerService';

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp: Date;
  expiresAt?: Date;
  priority?: 'high' | 'normal' | 'low';
  ttl?: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  priority?: 'high' | 'normal' | 'low';
  ttl?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BulkNotificationRequest {
  userIds?: string[];
  userRoles?: string[];
  templateId?: string;
  customNotification?: Omit<PushNotification, 'id' | 'timestamp'>;
  scheduledAt?: Date;
  expiresAt?: Date;
}

export class PushNotificationService {
  private readonly vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY || 'your-vapid-public-key',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'your-vapid-private-key'
  };

  /**
   * Guardar suscripción push de un usuario
   */
  async saveSubscription(userId: string, subscription: Omit<PushSubscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<PushSubscription> {
    try {
      const subscriptionData: PushSubscription = {
        id: `${userId}_${Date.now()}`,
        userId,
        ...subscription,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      await db.collection('pushSubscriptions').doc(subscriptionData.id).set(subscriptionData);
      
      logger.info('Suscripción push guardada', {
        metadata: { userId, subscriptionId: subscriptionData.id }
      });

      return subscriptionData;
    } catch (error) {
      logger.error('Error al guardar suscripción push', error as Error);
      throw new Error('Error al guardar suscripción push');
    }
  }

  /**
   * Obtener suscripciones de un usuario
   */
  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    try {
      const snapshot = await db.collection('pushSubscriptions')
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map(doc => doc.data() as PushSubscription);
    } catch (error) {
      logger.error('Error al obtener suscripciones del usuario', error as Error);
      throw new Error('Error al obtener suscripciones del usuario');
    }
  }

  /**
   * Eliminar suscripción push
   */
  async deleteSubscription(subscriptionId: string): Promise<void> {
    try {
      await db.collection('pushSubscriptions').doc(subscriptionId).delete();
      
      logger.info('Suscripción push eliminada', {
        metadata: { subscriptionId }
      });
    } catch (error) {
      logger.error('Error al eliminar suscripción push', error as Error);
      throw new Error('Error al eliminar suscripción push');
    }
  }

  /**
   * Enviar notificación push a un usuario
   */
  async sendNotificationToUser(userId: string, notification: Omit<PushNotification, 'id' | 'timestamp'>): Promise<void> {
    try {
      const subscriptions = await this.getUserSubscriptions(userId);
      
      if (subscriptions.length === 0) {
        logger.warn('Usuario sin suscripciones push', {
          metadata: { userId }
        });
        return;
      }

      const notificationData: PushNotification = {
        id: `notification_${Date.now()}_${userId}`,
        ...notification,
        timestamp: new Date()
      };

      // Enviar a todas las suscripciones del usuario
      const promises = subscriptions.map(subscription => 
        this.sendToSubscription(subscription, notificationData)
      );

      await Promise.allSettled(promises);

      // Guardar notificación en la base de datos
      await this.saveNotificationToDatabase(userId, notificationData);

      logger.info('Notificación push enviada al usuario', {
        metadata: { userId, notificationId: notificationData.id }
      });
    } catch (error) {
      logger.error('Error al enviar notificación push al usuario', error as Error);
      throw new Error('Error al enviar notificación push al usuario');
    }
  }

  /**
   * Enviar notificación push a múltiples usuarios
   */
  async sendBulkNotification(request: BulkNotificationRequest): Promise<{ success: number; failed: number }> {
    try {
      let userIds: string[] = [];

      // Obtener usuarios por roles si se especifican
      if (request.userRoles && request.userRoles.length > 0) {
        const usersSnapshot = await db.collection('users')
          .where('roll', 'in', request.userRoles)
          .get();
        userIds = usersSnapshot.docs.map(doc => doc.id);
      }

      // Agregar usuarios específicos
      if (request.userIds) {
        userIds = [...new Set([...userIds, ...request.userIds])];
      }

      if (userIds.length === 0) {
        throw new Error('No se encontraron usuarios para enviar notificación');
      }

      let notification: Omit<PushNotification, 'id' | 'timestamp'>;

      // Usar template si se especifica
      if (request.templateId) {
        const template = await this.getNotificationTemplate(request.templateId);
        notification = {
          title: template.title,
          body: template.body,
          icon: template.icon,
          badge: template.badge,
          image: template.image,
          tag: template.tag,
          data: template.data,
          actions: template.actions,
          requireInteraction: template.requireInteraction,
          silent: template.silent,
          priority: template.priority,
          ttl: template.ttl
        };
      } else if (request.customNotification) {
        notification = request.customNotification;
      } else {
        throw new Error('Debe especificar un template o notificación personalizada');
      }

      let success = 0;
      let failed = 0;

      // Enviar notificaciones a todos los usuarios
      for (const userId of userIds) {
        try {
          await this.sendNotificationToUser(userId, notification);
          success++;
        } catch (error) {
          logger.error('Error al enviar notificación a usuario', error as Error, {
            metadata: { userId }
          });
          failed++;
        }
      }

      logger.info('Notificación masiva enviada', {
        metadata: { total: userIds.length, success, failed }
      });

      return { success, failed };
    } catch (error) {
      logger.error('Error al enviar notificación masiva', error as Error);
      throw new Error('Error al enviar notificación masiva');
    }
  }

  /**
   * Enviar notificación a una suscripción específica
   */
  private async sendToSubscription(subscription: PushSubscription, notification: PushNotification): Promise<void> {
    try {
      // En un entorno real, aquí usarías web-push para enviar la notificación
      // Por ahora, simulamos el envío
      
      const payload = {
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        badge: notification.badge,
        image: notification.image,
        tag: notification.tag,
        data: notification.data,
        actions: notification.actions,
        requireInteraction: notification.requireInteraction,
        silent: notification.silent,
        priority: notification.priority,
        ttl: notification.ttl || 86400 // 24 horas por defecto
      };

      // Simular envío de notificación push
      console.log(`Enviando notificación push a ${subscription.endpoint}:`, payload);
      
      // En producción, usarías:
      // await webpush.sendNotification(subscription, JSON.stringify(payload));
      
    } catch (error) {
      logger.error('Error al enviar notificación a suscripción', error as Error, {
        metadata: { subscriptionId: subscription.id, endpoint: subscription.endpoint }
      });
      
      // Marcar suscripción como inactiva si falla
      await this.markSubscriptionInactive(subscription.id);
      
      throw error;
    }
  }

  /**
   * Marcar suscripción como inactiva
   */
  private async markSubscriptionInactive(subscriptionId: string): Promise<void> {
    try {
      await db.collection('pushSubscriptions').doc(subscriptionId).update({
        isActive: false,
        updatedAt: new Date()
      });
    } catch (error) {
      logger.error('Error al marcar suscripción como inactiva', error as Error);
    }
  }

  /**
   * Guardar notificación en la base de datos
   */
  private async saveNotificationToDatabase(userId: string, notification: PushNotification): Promise<void> {
    try {
      await db.collection('notifications').doc(notification.id).set({
        ...notification,
        userId,
        read: false,
        createdAt: new Date()
      });
    } catch (error) {
      logger.error('Error al guardar notificación en base de datos', error as Error);
    }
  }

  /**
   * Crear template de notificación
   */
  async createNotificationTemplate(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate> {
    try {
      const templateData: NotificationTemplate = {
        id: `template_${Date.now()}`,
        ...template,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('notificationTemplates').doc(templateData.id).set(templateData);
      
      logger.info('Template de notificación creado', {
        metadata: { templateId: templateData.id, name: template.name }
      });

      return templateData;
    } catch (error) {
      logger.error('Error al crear template de notificación', error as Error);
      throw new Error('Error al crear template de notificación');
    }
  }

  /**
   * Obtener template de notificación
   */
  async getNotificationTemplate(templateId: string): Promise<NotificationTemplate> {
    try {
      const doc = await db.collection('notificationTemplates').doc(templateId).get();
      
      if (!doc.exists) {
        throw new Error('Template de notificación no encontrado');
      }

      return doc.data() as NotificationTemplate;
    } catch (error) {
      logger.error('Error al obtener template de notificación', error as Error);
      throw new Error('Error al obtener template de notificación');
    }
  }

  /**
   * Obtener todos los templates activos
   */
  async getActiveTemplates(): Promise<NotificationTemplate[]> {
    try {
      const snapshot = await db.collection('notificationTemplates')
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map(doc => doc.data() as NotificationTemplate);
    } catch (error) {
      logger.error('Error al obtener templates activos', error as Error);
      throw new Error('Error al obtener templates activos');
    }
  }

  /**
   * Actualizar template de notificación
   */
  async updateNotificationTemplate(templateId: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await db.collection('notificationTemplates').doc(templateId).update(updateData);
      
      logger.info('Template de notificación actualizado', {
        metadata: { templateId }
      });

      return await this.getNotificationTemplate(templateId);
    } catch (error) {
      logger.error('Error al actualizar template de notificación', error as Error);
      throw new Error('Error al actualizar template de notificación');
    }
  }

  /**
   * Eliminar template de notificación
   */
  async deleteNotificationTemplate(templateId: string): Promise<void> {
    try {
      await db.collection('notificationTemplates').doc(templateId).delete();
      
      logger.info('Template de notificación eliminado', {
        metadata: { templateId }
      });
    } catch (error) {
      logger.error('Error al eliminar template de notificación', error as Error);
      throw new Error('Error al eliminar template de notificación');
    }
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  async getNotificationStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalTemplates: number;
    activeTemplates: number;
    notificationsSentToday: number;
    notificationsSentThisWeek: number;
    notificationsSentThisMonth: number;
  }> {
    try {
      const [
        subscriptionsSnapshot,
        activeSubscriptionsSnapshot,
        templatesSnapshot,
        activeTemplatesSnapshot,
        todayNotificationsSnapshot,
        weekNotificationsSnapshot,
        monthNotificationsSnapshot
      ] = await Promise.all([
        db.collection('pushSubscriptions').get(),
        db.collection('pushSubscriptions').where('isActive', '==', true).get(),
        db.collection('notificationTemplates').get(),
        db.collection('notificationTemplates').where('isActive', '==', true).get(),
        db.collection('notifications')
          .where('timestamp', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))
          .get(),
        db.collection('notifications')
          .where('timestamp', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .get(),
        db.collection('notifications')
          .where('timestamp', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .get()
      ]);

      return {
        totalSubscriptions: subscriptionsSnapshot.size,
        activeSubscriptions: activeSubscriptionsSnapshot.size,
        totalTemplates: templatesSnapshot.size,
        activeTemplates: activeTemplatesSnapshot.size,
        notificationsSentToday: todayNotificationsSnapshot.size,
        notificationsSentThisWeek: weekNotificationsSnapshot.size,
        notificationsSentThisMonth: monthNotificationsSnapshot.size
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas de notificaciones', error as Error);
      throw new Error('Error al obtener estadísticas de notificaciones');
    }
  }

  /**
   * Obtener VAPID keys para el frontend
   */
  getVapidPublicKey(): string {
    return this.vapidKeys.publicKey;
  }
}

export const pushNotificationService = new PushNotificationService(); 