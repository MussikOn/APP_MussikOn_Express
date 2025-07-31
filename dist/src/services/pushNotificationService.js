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
const firebase_1 = require("../utils/firebase");
const loggerService_1 = require("./loggerService");
class PushNotificationService {
    constructor() {
        this.vapidKeys = {
            publicKey: process.env.VAPID_PUBLIC_KEY || 'your-vapid-public-key',
            privateKey: process.env.VAPID_PRIVATE_KEY || 'your-vapid-private-key'
        };
    }
    /**
     * Guardar suscripción push de un usuario
     */
    saveSubscription(userId, subscription) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscriptionData = Object.assign(Object.assign({ id: `${userId}_${Date.now()}`, userId }, subscription), { createdAt: new Date(), updatedAt: new Date(), isActive: true });
                yield firebase_1.db.collection('pushSubscriptions').doc(subscriptionData.id).set(subscriptionData);
                loggerService_1.logger.info('Suscripción push guardada', {
                    metadata: { userId, subscriptionId: subscriptionData.id }
                });
                return subscriptionData;
            }
            catch (error) {
                loggerService_1.logger.error('Error al guardar suscripción push', error);
                throw new Error('Error al guardar suscripción push');
            }
        });
    }
    /**
     * Obtener suscripciones de un usuario
     */
    getUserSubscriptions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield firebase_1.db.collection('pushSubscriptions')
                    .where('userId', '==', userId)
                    .where('isActive', '==', true)
                    .get();
                return snapshot.docs.map(doc => doc.data());
            }
            catch (error) {
                loggerService_1.logger.error('Error al obtener suscripciones del usuario', error);
                throw new Error('Error al obtener suscripciones del usuario');
            }
        });
    }
    /**
     * Eliminar suscripción push
     */
    deleteSubscription(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield firebase_1.db.collection('pushSubscriptions').doc(subscriptionId).delete();
                loggerService_1.logger.info('Suscripción push eliminada', {
                    metadata: { subscriptionId }
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error al eliminar suscripción push', error);
                throw new Error('Error al eliminar suscripción push');
            }
        });
    }
    /**
     * Enviar notificación push a un usuario
     */
    sendNotificationToUser(userId, notification) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscriptions = yield this.getUserSubscriptions(userId);
                if (subscriptions.length === 0) {
                    loggerService_1.logger.warn('Usuario sin suscripciones push', {
                        metadata: { userId }
                    });
                    return;
                }
                const notificationData = Object.assign(Object.assign({ id: `notification_${Date.now()}_${userId}` }, notification), { timestamp: new Date() });
                // Enviar a todas las suscripciones del usuario
                const promises = subscriptions.map(subscription => this.sendToSubscription(subscription, notificationData));
                yield Promise.allSettled(promises);
                // Guardar notificación en la base de datos
                yield this.saveNotificationToDatabase(userId, notificationData);
                loggerService_1.logger.info('Notificación push enviada al usuario', {
                    metadata: { userId, notificationId: notificationData.id }
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error al enviar notificación push al usuario', error);
                throw new Error('Error al enviar notificación push al usuario');
            }
        });
    }
    /**
     * Enviar notificación push a múltiples usuarios
     */
    sendBulkNotification(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let userIds = [];
                // Obtener usuarios por roles si se especifican
                if (request.userRoles && request.userRoles.length > 0) {
                    const usersSnapshot = yield firebase_1.db.collection('users')
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
                let notification;
                // Usar template si se especifica
                if (request.templateId) {
                    const template = yield this.getNotificationTemplate(request.templateId);
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
                }
                else if (request.customNotification) {
                    notification = request.customNotification;
                }
                else {
                    throw new Error('Debe especificar un template o notificación personalizada');
                }
                let success = 0;
                let failed = 0;
                // Enviar notificaciones a todos los usuarios
                for (const userId of userIds) {
                    try {
                        yield this.sendNotificationToUser(userId, notification);
                        success++;
                    }
                    catch (error) {
                        loggerService_1.logger.error('Error al enviar notificación a usuario', error, {
                            metadata: { userId }
                        });
                        failed++;
                    }
                }
                loggerService_1.logger.info('Notificación masiva enviada', {
                    metadata: { total: userIds.length, success, failed }
                });
                return { success, failed };
            }
            catch (error) {
                loggerService_1.logger.error('Error al enviar notificación masiva', error);
                throw new Error('Error al enviar notificación masiva');
            }
        });
    }
    /**
     * Enviar notificación a una suscripción específica
     */
    sendToSubscription(subscription, notification) {
        return __awaiter(this, void 0, void 0, function* () {
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
            }
            catch (error) {
                loggerService_1.logger.error('Error al enviar notificación a suscripción', error, {
                    metadata: { subscriptionId: subscription.id, endpoint: subscription.endpoint }
                });
                // Marcar suscripción como inactiva si falla
                yield this.markSubscriptionInactive(subscription.id);
                throw error;
            }
        });
    }
    /**
     * Marcar suscripción como inactiva
     */
    markSubscriptionInactive(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield firebase_1.db.collection('pushSubscriptions').doc(subscriptionId).update({
                    isActive: false,
                    updatedAt: new Date()
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error al marcar suscripción como inactiva', error);
            }
        });
    }
    /**
     * Guardar notificación en la base de datos
     */
    saveNotificationToDatabase(userId, notification) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield firebase_1.db.collection('notifications').doc(notification.id).set(Object.assign(Object.assign({}, notification), { userId, read: false, createdAt: new Date() }));
            }
            catch (error) {
                loggerService_1.logger.error('Error al guardar notificación en base de datos', error);
            }
        });
    }
    /**
     * Crear template de notificación
     */
    createNotificationTemplate(template) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const templateData = Object.assign(Object.assign({ id: `template_${Date.now()}` }, template), { createdAt: new Date(), updatedAt: new Date() });
                yield firebase_1.db.collection('notificationTemplates').doc(templateData.id).set(templateData);
                loggerService_1.logger.info('Template de notificación creado', {
                    metadata: { templateId: templateData.id, name: template.name }
                });
                return templateData;
            }
            catch (error) {
                loggerService_1.logger.error('Error al crear template de notificación', error);
                throw new Error('Error al crear template de notificación');
            }
        });
    }
    /**
     * Obtener template de notificación
     */
    getNotificationTemplate(templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doc = yield firebase_1.db.collection('notificationTemplates').doc(templateId).get();
                if (!doc.exists) {
                    throw new Error('Template de notificación no encontrado');
                }
                return doc.data();
            }
            catch (error) {
                loggerService_1.logger.error('Error al obtener template de notificación', error);
                throw new Error('Error al obtener template de notificación');
            }
        });
    }
    /**
     * Obtener todos los templates activos
     */
    getActiveTemplates() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield firebase_1.db.collection('notificationTemplates')
                    .where('isActive', '==', true)
                    .get();
                return snapshot.docs.map(doc => doc.data());
            }
            catch (error) {
                loggerService_1.logger.error('Error al obtener templates activos', error);
                throw new Error('Error al obtener templates activos');
            }
        });
    }
    /**
     * Actualizar template de notificación
     */
    updateNotificationTemplate(templateId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateData = Object.assign(Object.assign({}, updates), { updatedAt: new Date() });
                yield firebase_1.db.collection('notificationTemplates').doc(templateId).update(updateData);
                loggerService_1.logger.info('Template de notificación actualizado', {
                    metadata: { templateId }
                });
                return yield this.getNotificationTemplate(templateId);
            }
            catch (error) {
                loggerService_1.logger.error('Error al actualizar template de notificación', error);
                throw new Error('Error al actualizar template de notificación');
            }
        });
    }
    /**
     * Eliminar template de notificación
     */
    deleteNotificationTemplate(templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield firebase_1.db.collection('notificationTemplates').doc(templateId).delete();
                loggerService_1.logger.info('Template de notificación eliminado', {
                    metadata: { templateId }
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error al eliminar template de notificación', error);
                throw new Error('Error al eliminar template de notificación');
            }
        });
    }
    /**
     * Obtener estadísticas de notificaciones
     */
    getNotificationStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [subscriptionsSnapshot, activeSubscriptionsSnapshot, templatesSnapshot, activeTemplatesSnapshot, todayNotificationsSnapshot, weekNotificationsSnapshot, monthNotificationsSnapshot] = yield Promise.all([
                    firebase_1.db.collection('pushSubscriptions').get(),
                    firebase_1.db.collection('pushSubscriptions').where('isActive', '==', true).get(),
                    firebase_1.db.collection('notificationTemplates').get(),
                    firebase_1.db.collection('notificationTemplates').where('isActive', '==', true).get(),
                    firebase_1.db.collection('notifications')
                        .where('timestamp', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))
                        .get(),
                    firebase_1.db.collection('notifications')
                        .where('timestamp', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                        .get(),
                    firebase_1.db.collection('notifications')
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
            }
            catch (error) {
                loggerService_1.logger.error('Error al obtener estadísticas de notificaciones', error);
                throw new Error('Error al obtener estadísticas de notificaciones');
            }
        });
    }
    /**
     * Obtener VAPID keys para el frontend
     */
    getVapidPublicKey() {
        return this.vapidKeys.publicKey;
    }
}
exports.PushNotificationService = PushNotificationService;
exports.pushNotificationService = new PushNotificationService();
