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
exports.testPushNotification = exports.getVapidPublicKey = exports.getNotificationStats = exports.deleteNotificationTemplate = exports.updateNotificationTemplate = exports.getActiveTemplates = exports.getNotificationTemplate = exports.createNotificationTemplate = exports.sendBulkNotification = exports.sendNotificationToUser = exports.deletePushSubscription = exports.getUserPushSubscriptions = exports.savePushSubscription = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const pushNotificationService_1 = require("../services/pushNotificationService");
const loggerService_1 = require("../services/loggerService");
/**
 * Guardar suscripción push de un usuario
 */
exports.savePushSubscription = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { endpoint, keys } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Usuario no autenticado',
                code: 'UNAUTHORIZED'
            }
        });
    }
    if (!endpoint || !keys) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Endpoint y keys son requeridos',
                code: 'VALIDATION_ERROR'
            }
        });
    }
    const subscription = yield pushNotificationService_1.pushNotificationService.saveSubscription(userId, {
        endpoint,
        keys,
        isActive: true
    });
    loggerService_1.logger.info('Suscripción push guardada', {
        metadata: { userId, subscriptionId: subscription.id }
    });
    res.status(201).json({
        success: true,
        data: subscription,
        message: 'Suscripción push guardada exitosamente'
    });
}));
/**
 * Obtener suscripciones de un usuario
 */
exports.getUserPushSubscriptions = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Usuario no autenticado',
                code: 'UNAUTHORIZED'
            }
        });
    }
    const subscriptions = yield pushNotificationService_1.pushNotificationService.getUserSubscriptions(userId);
    res.json({
        success: true,
        data: subscriptions,
        message: 'Suscripciones obtenidas exitosamente'
    });
}));
/**
 * Eliminar suscripción push
 */
exports.deletePushSubscription = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { subscriptionId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Usuario no autenticado',
                code: 'UNAUTHORIZED'
            }
        });
    }
    yield pushNotificationService_1.pushNotificationService.deleteSubscription(subscriptionId);
    loggerService_1.logger.info('Suscripción push eliminada', {
        metadata: { userId, subscriptionId }
    });
    res.json({
        success: true,
        message: 'Suscripción push eliminada exitosamente'
    });
}));
/**
 * Enviar notificación push a un usuario específico
 */
exports.sendNotificationToUser = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const notification = req.body;
    if (!notification.title || !notification.body) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Título y cuerpo de la notificación son requeridos',
                code: 'VALIDATION_ERROR'
            }
        });
    }
    yield pushNotificationService_1.pushNotificationService.sendNotificationToUser(userId, notification);
    loggerService_1.logger.info('Notificación push enviada a usuario', {
        metadata: { userId, notificationTitle: notification.title }
    });
    res.json({
        success: true,
        message: 'Notificación push enviada exitosamente'
    });
}));
/**
 * Enviar notificación masiva
 */
exports.sendBulkNotification = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bulkRequest = req.body;
    if (!bulkRequest.templateId && !bulkRequest.customNotification) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Debe especificar un template o notificación personalizada',
                code: 'VALIDATION_ERROR'
            }
        });
    }
    if (!bulkRequest.userIds && !bulkRequest.userRoles) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Debe especificar usuarios o roles para enviar la notificación',
                code: 'VALIDATION_ERROR'
            }
        });
    }
    const result = yield pushNotificationService_1.pushNotificationService.sendBulkNotification(bulkRequest);
    loggerService_1.logger.info('Notificación masiva enviada', {
        metadata: { success: result.success, failed: result.failed }
    });
    res.json({
        success: true,
        data: result,
        message: `Notificación masiva enviada: ${result.success} exitosas, ${result.failed} fallidas`
    });
}));
/**
 * Crear template de notificación
 */
exports.createNotificationTemplate = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const template = req.body;
    if (!template.name || !template.title || !template.body) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Nombre, título y cuerpo del template son requeridos',
                code: 'VALIDATION_ERROR'
            }
        });
    }
    const createdTemplate = yield pushNotificationService_1.pushNotificationService.createNotificationTemplate(template);
    loggerService_1.logger.info('Template de notificación creado', {
        metadata: { templateId: createdTemplate.id, name: createdTemplate.name }
    });
    res.status(201).json({
        success: true,
        data: createdTemplate,
        message: 'Template de notificación creado exitosamente'
    });
}));
/**
 * Obtener template de notificación
 */
exports.getNotificationTemplate = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templateId } = req.params;
    const template = yield pushNotificationService_1.pushNotificationService.getNotificationTemplate(templateId);
    res.json({
        success: true,
        data: template,
        message: 'Template obtenido exitosamente'
    });
}));
/**
 * Obtener todos los templates activos
 */
exports.getActiveTemplates = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const templates = yield pushNotificationService_1.pushNotificationService.getActiveTemplates();
    res.json({
        success: true,
        data: templates,
        message: 'Templates obtenidos exitosamente'
    });
}));
/**
 * Actualizar template de notificación
 */
exports.updateNotificationTemplate = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templateId } = req.params;
    const updates = req.body;
    const updatedTemplate = yield pushNotificationService_1.pushNotificationService.updateNotificationTemplate(templateId, updates);
    loggerService_1.logger.info('Template de notificación actualizado', {
        metadata: { templateId }
    });
    res.json({
        success: true,
        data: updatedTemplate,
        message: 'Template actualizado exitosamente'
    });
}));
/**
 * Eliminar template de notificación
 */
exports.deleteNotificationTemplate = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templateId } = req.params;
    yield pushNotificationService_1.pushNotificationService.deleteNotificationTemplate(templateId);
    loggerService_1.logger.info('Template de notificación eliminado', {
        metadata: { templateId }
    });
    res.json({
        success: true,
        message: 'Template eliminado exitosamente'
    });
}));
/**
 * Obtener estadísticas de notificaciones
 */
exports.getNotificationStats = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield pushNotificationService_1.pushNotificationService.getNotificationStats();
    res.json({
        success: true,
        data: stats,
        message: 'Estadísticas obtenidas exitosamente'
    });
}));
/**
 * Obtener VAPID public key
 */
exports.getVapidPublicKey = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const publicKey = pushNotificationService_1.pushNotificationService.getVapidPublicKey();
    res.json({
        success: true,
        data: { publicKey },
        message: 'VAPID public key obtenida exitosamente'
    });
}));
/**
 * Probar notificación push (solo para desarrollo)
 */
exports.testPushNotification = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Usuario no autenticado',
                code: 'UNAUTHORIZED'
            }
        });
    }
    const testNotification = {
        title: '🔔 Notificación de Prueba',
        body: 'Esta es una notificación de prueba del sistema MussikOn',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'test-notification',
        data: {
            url: '/dashboard',
            type: 'test'
        },
        requireInteraction: true,
        priority: 'high'
    };
    yield pushNotificationService_1.pushNotificationService.sendNotificationToUser(userId, testNotification);
    loggerService_1.logger.info('Notificación de prueba enviada', {
        metadata: { userId }
    });
    res.json({
        success: true,
        message: 'Notificación de prueba enviada exitosamente'
    });
}));
