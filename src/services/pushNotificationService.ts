// Tipos para notificaciones push
export interface PushSubscription {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  requireInteraction?: boolean;
  priority?: 'high' | 'normal' | 'low';
  timestamp: Date;
  read: boolean;
  category: string;
  type: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  category: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BulkNotificationRequest {
  userIds: string[];
  templateId?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  category?: string;
  type?: string;
}

export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalRead: number;
  averageDeliveryTime: number;
  successRate: number;
}

export interface NotificationSettings {
  enabled: boolean;
  categories: Record<string, boolean>;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  sound: boolean;
  vibration: boolean;
}

export interface PushNotificationApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PushNotificationError {
  code: string;
  message: string;
  details?: any;
}

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

// Servicio API básico
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<PushNotificationApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async post<T>(endpoint: string, body: any): Promise<PushNotificationApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async delete<T>(endpoint: string): Promise<PushNotificationApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async put<T>(endpoint: string, body: any): Promise<PushNotificationApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

const apiService = new ApiService();

/**
 * Servicio completo para manejo de notificaciones push
 * Integra con el backend y maneja la suscripción del dispositivo
 */
export class PushNotificationService {
  private vapidPublicKey: string | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private isInitialized = false;

  /**
   * Inicializar el servicio de notificaciones push
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Verificar soporte
      if (!this.isSupported()) {
        throw new Error('Las notificaciones push no están soportadas en este dispositivo');
      }

      // Obtener VAPID key del backend
      await this.loadVapidKey();

      // Registrar Service Worker
      await this.registerServiceWorker();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error inicializando PushNotificationService:', error);
      return false;
    }
  }

  /**
   * Verificar si las notificaciones push están soportadas
   */
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Obtener el estado actual del permiso
   */
  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return { granted: false, denied: false, default: true };
    }

    const permission = Notification.permission;
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    };
  }

  /**
   * Solicitar permiso para notificaciones
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (!this.isSupported()) {
        throw new Error('Las notificaciones push no están soportadas');
      }

      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error solicitando permiso:', error);
      return false;
    }
  }

  /**
   * Cargar VAPID key del backend
   */
  private async loadVapidKey(): Promise<void> {
    try {
      const response = await apiService.get<{ vapidPublicKey: string }>('/push-notifications/vapid-key');
      if (response.success && response.data) {
        this.vapidPublicKey = response.data.vapidPublicKey;
      } else {
        throw new Error('No se pudo obtener la VAPID key');
      }
    } catch (error) {
      console.error('Error cargando VAPID key:', error);
      throw error;
    }
  }

  /**
   * Registrar Service Worker
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', this.registration);
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      throw error;
    }
  }

  /**
   * Suscribirse a notificaciones push
   */
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.vapidPublicKey) {
        throw new Error('VAPID key no disponible');
      }

      if (!this.registration) {
        throw new Error('Service Worker no registrado');
      }

      // Verificar permiso
      const permission = this.getPermissionStatus();
      if (!permission.granted) {
        const granted = await this.requestPermission();
        if (!granted) {
          throw new Error('Permiso de notificaciones denegado');
        }
      }

      // Obtener suscripción existente o crear nueva
      let subscription = await this.registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        });
      }

      // Guardar suscripción en el backend
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      const response = await apiService.post<PushSubscription>('/push-notifications/subscription', subscriptionData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Error guardando suscripción en el backend');
      }
    } catch (error) {
      console.error('Error suscribiéndose a notificaciones push:', error);
      return null;
    }
  }

  /**
   * Obtener suscripciones del usuario
   */
  async getUserSubscriptions(): Promise<PushSubscription[]> {
    try {
      const response = await apiService.get<PushSubscription[]>('/push-notifications/subscriptions');
      return response.success && response.data ? response.data : [];
    } catch (error) {
      console.error('Error obteniendo suscripciones:', error);
      return [];
    }
  }

  /**
   * Guardar suscripción push
   */
  async saveSubscription(userId: string, subscriptionData: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    isActive: boolean;
  }): Promise<PushSubscription> {
    try {
      const response = await apiService.post<PushSubscription>('/push-notifications/subscriptions', {
        userId,
        ...subscriptionData
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Error guardando suscripción');
    } catch (error) {
      console.error('Error guardando suscripción:', error);
      throw error;
    }
  }

  /**
   * Obtener VAPID public key
   */
  getVapidPublicKey(): string | null {
    return this.vapidPublicKey;
  }

  /**
   * Eliminar suscripción
   */
  async deleteSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await apiService.delete(`/push-notifications/subscription/${subscriptionId}`);
      
      if (response.success) {
        // También eliminar suscripción local si existe
        if (this.registration) {
          const subscription = await this.registration.pushManager.getSubscription();
          if (subscription) {
            await subscription.unsubscribe();
          }
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error eliminando suscripción:', error);
      return false;
    }
  }

  /**
   * Enviar notificación a usuario específico
   */
  async sendNotificationToUser(
    userId: string, 
    notification: Omit<PushNotification, 'id' | 'userId' | 'timestamp' | 'read'>
  ): Promise<boolean> {
    try {
      const response = await apiService.post(`/push-notifications/send/${userId}`, notification);
      return response.success;
    } catch (error) {
      console.error('Error enviando notificación:', error);
      return false;
    }
  }

  /**
   * Enviar notificación masiva
   */
  async sendBulkNotification(request: BulkNotificationRequest): Promise<{ success: number; failed: number } | null> {
    try {
      const response = await apiService.post<{ success: number; failed: number }>('/push-notifications/bulk', request);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error enviando notificación masiva:', error);
      return null;
    }
  }

  /**
   * Crear template de notificación
   */
  async createNotificationTemplate(
    template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<NotificationTemplate | null> {
    try {
      const response = await apiService.post<NotificationTemplate>('/push-notifications/templates', template);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error creando template:', error);
      return null;
    }
  }

  /**
   * Obtener templates activos
   */
  async getActiveTemplates(): Promise<NotificationTemplate[]> {
    try {
      const response = await apiService.get<NotificationTemplate[]>('/push-notifications/templates');
      return response.success && response.data ? response.data : [];
    } catch (error) {
      console.error('Error obteniendo templates:', error);
      return [];
    }
  }

  /**
   * Obtener template específico
   */
  async getNotificationTemplate(templateId: string): Promise<NotificationTemplate | null> {
    try {
      const response = await apiService.get<NotificationTemplate>(`/push-notifications/templates/${templateId}`);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error obteniendo template:', error);
      return null;
    }
  }

  /**
   * Actualizar template
   */
  async updateNotificationTemplate(
    templateId: string, 
    updates: Partial<NotificationTemplate>
  ): Promise<NotificationTemplate | null> {
    try {
      const response = await apiService.put<NotificationTemplate>(`/push-notifications/templates/${templateId}`, updates);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error actualizando template:', error);
      return null;
    }
  }

  /**
   * Eliminar template
   */
  async deleteNotificationTemplate(templateId: string): Promise<boolean> {
    try {
      const response = await apiService.delete(`/push-notifications/templates/${templateId}`);
      return response.success;
    } catch (error) {
      console.error('Error eliminando template:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  async getNotificationStats(): Promise<NotificationStats | null> {
    try {
      const response = await apiService.get<NotificationStats>('/push-notifications/stats');
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }

  /**
   * Enviar notificación de prueba
   */
  async testPushNotification(): Promise<boolean> {
    try {
      const response = await apiService.post('/push-notifications/test', {});
      return response.success;
    } catch (error) {
      console.error('Error enviando notificación de prueba:', error);
      return false;
    }
  }

  /**
   * Mostrar notificación local (para testing)
   */
  showLocalNotification(title: string, options: NotificationOptions = {}): void {
    if (!('Notification' in window)) {
      console.warn('Las notificaciones no están soportadas');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'mussikon-notification',
        ...options
      });
    }
  }

  /**
   * Convertir VAPID key de base64 a Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Convertir ArrayBuffer a base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Obtener configuración de notificaciones del usuario
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await apiService.get<NotificationSettings>('/push-notifications/settings');
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
    }

    // Configuración por defecto
    return {
      enabled: true,
      categories: {
        system: true,
        user: true,
        event: true,
        request: true,
        payment: true,
        chat: true
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      },
      sound: true,
      vibration: true
    };
  }

  /**
   * Actualizar configuración de notificaciones
   */
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<boolean> {
    try {
      const response = await apiService.put('/push-notifications/settings', settings);
      return response.success;
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      return false;
    }
  }

  /**
   * Verificar si está en horas silenciosas
   */
  isInQuietHours(settings: NotificationSettings): boolean {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = settings.quietHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = settings.quietHours.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Horas silenciosas cruzan la medianoche
      return currentTime >= startTime || currentTime <= endTime;
    }
  }
}

// Instancia singleton del servicio
export const pushNotificationService = new PushNotificationService(); 