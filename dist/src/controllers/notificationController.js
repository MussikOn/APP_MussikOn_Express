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
exports.getNotificationStats = exports.sendBulkNotification = exports.createNotification = exports.getUnreadCount = exports.deleteNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getNotifications = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const errorHandler_2 = require("../middleware/errorHandler");
const loggerService_1 = require("../services/loggerService");
const firebase_1 = require("../utils/firebase");
const firestore_1 = require("firebase-admin/firestore");
/**
 * Obtener notificaciones del usuario
 */
exports.getNotifications = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    loggerService_1.logger.info('Obteniendo notificaciones', {
        userId,
        metadata: { page, limit, unreadOnly },
    });
    let query = firebase_1.db.collection('notifications').where('userId', '==', userId);
    if (unreadOnly === 'true') {
        query = query.where('isRead', '==', false);
    }
    const snapshot = yield query
        .orderBy('createdAt', 'desc')
        .limit(parseInt(limit))
        .offset((parseInt(page) - 1) * parseInt(limit))
        .get();
    const notifications = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    // Obtener total de notificaciones
    const totalSnapshot = yield query.count().get();
    const total = totalSnapshot.data().count;
    loggerService_1.logger.info('Notificaciones obtenidas', {
        userId,
        metadata: { count: notifications.length, total },
    });
    res.status(200).json({
        success: true,
        data: {
            notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        },
        message: 'Notificaciones obtenidas exitosamente',
    });
}));
/**
 * Marcar notificación como leída
 */
exports.markNotificationAsRead = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { notificationId } = req.params;
    loggerService_1.logger.info('Marcando notificación como leída', {
        userId,
        metadata: { notificationId },
    });
    const notificationRef = firebase_1.db.collection('notifications').doc(notificationId);
    const notification = yield notificationRef.get();
    if (!notification.exists) {
        throw new errorHandler_2.OperationalError('Notificación no encontrada', 404);
    }
    const notificationData = notification.data();
    if (notificationData.userId !== userId) {
        throw new errorHandler_2.OperationalError('No autorizado para acceder a esta notificación', 403);
    }
    yield notificationRef.update({
        isRead: true,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    loggerService_1.logger.info('Notificación marcada como leída', {
        userId,
        metadata: { notificationId },
    });
    res.status(200).json({
        success: true,
        message: 'Notificación marcada como leída',
    });
}));
/**
 * Marcar todas las notificaciones como leídas
 */
exports.markAllNotificationsAsRead = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    loggerService_1.logger.info('Marcando todas las notificaciones como leídas', { userId });
    const batch = firebase_1.db.batch();
    const notificationsRef = firebase_1.db
        .collection('notifications')
        .where('userId', '==', userId)
        .where('isRead', '==', false);
    const snapshot = yield notificationsRef.get();
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
            isRead: true,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
    });
    yield batch.commit();
    loggerService_1.logger.info('Todas las notificaciones marcadas como leídas', {
        userId,
        metadata: { count: snapshot.docs.length },
    });
    res.status(200).json({
        success: true,
        message: `${snapshot.docs.length} notificaciones marcadas como leídas`,
    });
}));
/**
 * Eliminar notificación
 */
exports.deleteNotification = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { notificationId } = req.params;
    loggerService_1.logger.info('Eliminando notificación', {
        userId,
        metadata: { notificationId },
    });
    const notificationRef = firebase_1.db.collection('notifications').doc(notificationId);
    const notification = yield notificationRef.get();
    if (!notification.exists) {
        throw new errorHandler_2.OperationalError('Notificación no encontrada', 404);
    }
    const notificationData = notification.data();
    if (notificationData.userId !== userId) {
        throw new errorHandler_2.OperationalError('No autorizado para eliminar esta notificación', 403);
    }
    yield notificationRef.delete();
    loggerService_1.logger.info('Notificación eliminada', {
        userId,
        metadata: { notificationId },
    });
    res.status(200).json({
        success: true,
        message: 'Notificación eliminada exitosamente',
    });
}));
/**
 * Obtener contador de notificaciones no leídas
 */
exports.getUnreadCount = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    loggerService_1.logger.info('Obteniendo contador de notificaciones no leídas', { userId });
    const snapshot = yield firebase_1.db
        .collection('notifications')
        .where('userId', '==', userId)
        .where('isRead', '==', false)
        .count()
        .get();
    const count = snapshot.data().count;
    loggerService_1.logger.info('Contador de notificaciones no leídas obtenido', {
        userId,
        metadata: { count },
    });
    res.status(200).json({
        success: true,
        data: { count },
        message: 'Contador de notificaciones no leídas obtenido',
    });
}));
/**
 * Crear notificación (para uso interno del sistema)
 */
exports.createNotification = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const notificationData = req.body;
    loggerService_1.logger.info('Creando notificación', {
        userId,
        metadata: { notificationData },
    });
    if (!notificationData.userId ||
        !notificationData.title ||
        !notificationData.message) {
        throw new errorHandler_2.OperationalError('Datos de notificación incompletos', 400);
    }
    const notification = {
        userId: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        category: notificationData.category || 'system',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: notificationData.metadata || {},
    };
    const docRef = yield firebase_1.db.collection('notifications').add(notification);
    loggerService_1.logger.info('Notificación creada', {
        userId,
        metadata: { notificationId: docRef.id },
    });
    res.status(201).json({
        success: true,
        data: Object.assign({ id: docRef.id }, notification),
        message: 'Notificación creada exitosamente',
    });
}));
/**
 * Enviar notificación masiva (solo para superadmin)
 */
exports.sendBulkNotification = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { title, message, type, category, targetUsers, metadata } = req.body;
    loggerService_1.logger.info('Enviando notificación masiva', {
        userId,
        metadata: { title, targetUsers },
    });
    if (!title || !message || !targetUsers || !Array.isArray(targetUsers)) {
        throw new errorHandler_2.OperationalError('Datos de notificación masiva incompletos', 400);
    }
    const batch = firebase_1.db.batch();
    const notifications = [];
    targetUsers.forEach((targetUserId) => {
        const notificationRef = firebase_1.db.collection('notifications').doc();
        const notification = {
            userId: targetUserId,
            title,
            message,
            type: type || 'info',
            category: category || 'system',
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: metadata || {},
        };
        batch.set(notificationRef, notification);
        notifications.push(Object.assign({ id: notificationRef.id }, notification));
    });
    yield batch.commit();
    loggerService_1.logger.info('Notificación masiva enviada', {
        userId,
        metadata: { count: targetUsers.length },
    });
    res.status(201).json({
        success: true,
        data: { notifications },
        message: `Notificación enviada a ${targetUsers.length} usuarios`,
    });
}));
/**
 * Obtener estadísticas de notificaciones
 */
exports.getNotificationStats = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { period = 'week' } = req.query;
    loggerService_1.logger.info('Obteniendo estadísticas de notificaciones', {
        userId,
        metadata: { period },
    });
    // Calcular fecha de inicio según el período
    const now = new Date();
    let startDate;
    switch (period) {
        case 'day':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    // Obtener todas las notificaciones del usuario
    const snapshot = yield firebase_1.db
        .collection('notifications')
        .where('userId', '==', userId)
        .where('createdAt', '>=', startDate)
        .get();
    const notifications = snapshot.docs.map(doc => doc.data());
    // Calcular estadísticas
    const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length,
        read: notifications.filter(n => n.isRead).length,
        byType: {
            info: notifications.filter(n => n.type === 'info').length,
            success: notifications.filter(n => n.type === 'success').length,
            warning: notifications.filter(n => n.type === 'warning').length,
            error: notifications.filter(n => n.type === 'error').length,
        },
        byCategory: {
            system: notifications.filter(n => n.category === 'system').length,
            user: notifications.filter(n => n.category === 'user').length,
            event: notifications.filter(n => n.category === 'event').length,
            request: notifications.filter(n => n.category === 'request').length,
            payment: notifications.filter(n => n.category === 'payment').length,
        },
        period,
    };
    loggerService_1.logger.info('Estadísticas de notificaciones obtenidas', {
        userId,
        metadata: { stats },
    });
    res.status(200).json({
        success: true,
        data: stats,
        message: 'Estadísticas de notificaciones obtenidas',
    });
}));
