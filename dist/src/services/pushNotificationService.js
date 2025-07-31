"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushNotificationService = exports.PushNotificationService = void 0;
// Servicio API básico
class ApiService {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }
    get(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseUrl}${endpoint}`);
                const data = yield response.json();
                return data;
            }
            catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });
    }
    post(endpoint, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseUrl}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });
                const data = yield response.json();
                return data;
            }
            catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });
    }
    delete(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseUrl}${endpoint}`, {
                    method: 'DELETE',
                });
                const data = yield response.json();
                return data;
            }
            catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });
    }
    put(endpoint, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseUrl}${endpoint}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });
                const data = yield response.json();
                return data;
            }
            catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });
    }
}
const apiService = new ApiService();
/**
 * Servicio completo para manejo de notificaciones push
 * Integra con el backend y maneja la suscripción del dispositivo
 */
class PushNotificationService {
    constructor() {
        this.vapidPublicKey = null;
        this.registration = null;
        this.isInitialized = false;
    }
    /**
     * Inicializar el servicio de notificaciones push
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.isInitialized)
                    return true;
                // Verificar soporte
                if (!this.isSupported()) {
                    throw new Error('Las notificaciones push no están soportadas en este dispositivo');
                }
                // Obtener VAPID key del backend
                yield this.loadVapidKey();
                // Registrar Service Worker
                yield this.registerServiceWorker();
                this.isInitialized = true;
                return true;
            }
            catch (error) {
                console.error('Error inicializando PushNotificationService:', error);
                return false;
            }
        });
    }
    /**
     * Verificar si las notificaciones push están soportadas
     */
    isSupported() {
        return ('serviceWorker' in navigator &&
            'PushManager' in window &&
            'Notification' in window);
    }
    /**
     * Obtener el estado actual del permiso
     */
    getPermissionStatus() {
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
    requestPermission() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.isSupported()) {
                    throw new Error('Las notificaciones push no están soportadas');
                }
                const permission = yield Notification.requestPermission();
                return permission === 'granted';
            }
            catch (error) {
                console.error('Error solicitando permiso:', error);
                return false;
            }
        });
    }
    /**
     * Cargar VAPID key del backend
     */
    loadVapidKey() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield apiService.get('/push-notifications/vapid-key');
                if (response.success && response.data) {
                    this.vapidPublicKey = response.data.vapidPublicKey;
                }
                else {
                    throw new Error('No se pudo obtener la VAPID key');
                }
            }
            catch (error) {
                console.error('Error cargando VAPID key:', error);
                throw error;
            }
        });
    }
    /**
     * Registrar Service Worker
     */
    registerServiceWorker() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.registration = yield navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registrado:', this.registration);
            }
            catch (error) {
                console.error('Error registrando Service Worker:', error);
                throw error;
            }
        });
    }
    /**
     * Suscribirse a notificaciones push
     */
    subscribeToPushNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.isInitialized) {
                    yield this.initialize();
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
                    const granted = yield this.requestPermission();
                    if (!granted) {
                        throw new Error('Permiso de notificaciones denegado');
                    }
                }
                // Obtener suscripción existente o crear nueva
                let subscription = yield this.registration.pushManager.getSubscription();
                if (!subscription) {
                    subscription = yield this.registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
                    });
                }
                // Guardar suscripción en el backend
                const subscriptionData = {
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
                        auth: this.arrayBufferToBase64(subscription.getKey('auth'))
                    }
                };
                const response = yield apiService.post('/push-notifications/subscription', subscriptionData);
                if (response.success && response.data) {
                    return response.data;
                }
                else {
                    throw new Error('Error guardando suscripción en el backend');
                }
            }
            catch (error) {
                console.error('Error suscribiéndose a notificaciones push:', error);
                return null;
            }
        });
    }
    /**
     * Obtener suscripciones del usuario
     */
    getUserSubscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield apiService.get('/push-notifications/subscriptions');
                return response.success && response.data ? response.data : [];
            }
            catch (error) {
                console.error('Error obteniendo suscripciones:', error);
                return [];
            }
        });
    }
    /**
     * Guardar suscripción push
     */
    saveSubscription(userId, subscriptionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield apiService.post('/push-notifications/subscriptions', Object.assign({ userId }, subscriptionData));
                if (response.success && response.data) {
                    return response.data;
                }
                throw new Error('Error guardando suscripción');
            }
            catch (error) {
                console.error('Error guardando suscripción:', error);
                throw error;
            }
        });
    }
    /**
     * Obtener VAPID public key
     */
    getVapidPublicKey() {
        return this.vapidPublicKey;
    }
    /**
     * Eliminar suscripción
     */
    deleteSubscription(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield apiService.delete(`/push-notifications/subscription/${subscriptionId}`);
                if (response.success) {
                    // También eliminar suscripción local si existe
                    if (this.registration) {
                        const subscription = yield this.registration.pushManager.getSubscription();
                        if (subscription) {
                            yield subscription.unsubscribe();
                        }
                    }
                    return true;
                }
                return false;
            }
            catch (error) {
                console.error('Error eliminando suscripción:', error);
                return false;
            }
        });
    }
    /**
     * Enviar notificación a usuario específico
     */
    sendNotificationToUser(userId, notification) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield apiService.post(`/push-notifications/send/${userId}`, notification);
                return response.success;
            }
            catch (error) {
                console.error('Error enviando notificación:', error);
                return false;
            }
        });
    }
    /**
     * Enviar notificación masiva
     */
    sendBulkNotification(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield apiService.post('/push-notifications/bulk', request);
                return response.success && response.data ? response.data : null;
            }
            catch (error) {
                console.error('Error enviando notificación masiva:', error);
                return null;
            }
        });
    }
    /**
     * Crear template de notificación
     */
    createNotificationTemplate(template) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield apiService.post('/push-notifications/templates', template);
                return response.success && response.data ? response.data : null;
            }
            catch (error) {
                console.error('Error creando template:', error);
                return null;
            }
        });
    }
    /**
     * Obtener templates activos
     */
    getActiveTemplates() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield apiService.get('/push-notifications/templates');
                return response.success && response.data ? response.data : [];
            }
            catch (error) {
                console.error('Error obteniendo templates:', error);
                return [];
            }
        });
    }
    /**
     * Obtener template específico
     */
    getNotificationTemplate(templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield apiService.get(`/push-notifications/templates/${templateId}`);
                return response.success && response.data ? response.data : null;
            }
            catch (error) {
                console.error('Error obteniendo template:', error);
                return null;
            }
        });
    }
    /**
     * Actualizar template
     */
    updateNotificationTemplate(templateId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield apiService.put(`/push-notifications/templates/${templateId}`, updates);
                return response.success && response.data ? response.data : null;
            }
            catch (error) {
                console.error('Error actualizando template:', error);
                return null;
            }
        });
    }
    /**
     * Eliminar template
     */
    deleteNotificationTemplate(templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield apiService.delete(`/push-notifications/templates/${templateId}`);
                return response.success;
            }
            catch (error) {
                console.error('Error eliminando template:', error);
                return false;
            }
        });
    }
    /**
     * Obtener estadísticas de notificaciones
     */
    getNotificationStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield apiService.get('/push-notifications/stats');
                return response.success && response.data ? response.data : null;
            }
            catch (error) {
                console.error('Error obteniendo estadísticas:', error);
                return null;
            }
        });
    }
    /**
     * Enviar notificación de prueba
     */
    testPushNotification() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield apiService.post('/push-notifications/test', {});
                return response.success;
            }
            catch (error) {
                console.error('Error enviando notificación de prueba:', error);
                return false;
            }
        });
    }
    /**
     * Mostrar notificación local (para testing)
     */
    showLocalNotification(title, options = {}) {
        if (!('Notification' in window)) {
            console.warn('Las notificaciones no están soportadas');
            return;
        }
        if (Notification.permission === 'granted') {
            new Notification(title, Object.assign({ icon: '/icon-192x192.png', badge: '/badge-72x72.png', tag: 'mussikon-notification' }, options));
        }
    }
    /**
     * Convertir VAPID key de base64 a Uint8Array
     */
    urlBase64ToUint8Array(base64String) {
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
    arrayBufferToBase64(buffer) {
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
    getNotificationSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield apiService.get('/push-notifications/settings');
                if (response.success && response.data) {
                    return response.data;
                }
            }
            catch (error) {
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
        });
    }
    /**
     * Actualizar configuración de notificaciones
     */
    updateNotificationSettings(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield apiService.put('/push-notifications/settings', settings);
                return response.success;
            }
            catch (error) {
                console.error('Error actualizando configuración:', error);
                return false;
            }
        });
    }
    /**
     * Verificar si está en horas silenciosas
     */
    isInQuietHours(settings) {
        if (!settings.quietHours.enabled)
            return false;
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [startHour, startMinute] = settings.quietHours.startTime.split(':').map(Number);
        const [endHour, endMinute] = settings.quietHours.endTime.split(':').map(Number);
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        if (startTime <= endTime) {
            return currentTime >= startTime && currentTime <= endTime;
        }
        else {
            // Horas silenciosas cruzan la medianoche
            return currentTime >= startTime || currentTime <= endTime;
        }
    }
}
exports.PushNotificationService = PushNotificationService;
// Instancia singleton del servicio
exports.pushNotificationService = new PushNotificationService();
