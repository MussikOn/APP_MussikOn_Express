import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { OperationalError } from '../middleware/errorHandler';
import { logger } from '../services/loggerService';
import { db } from '../utils/firebase';
import { FieldValue } from 'firebase-admin/firestore';

// Interfaces para notificaciones
interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'user' | 'event' | 'request' | 'payment';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
}

interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'user' | 'event' | 'request' | 'payment';
  metadata?: any;
}

/**
 * Obtener notificaciones del usuario
 */
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  logger.info('Obteniendo notificaciones', { userId, metadata: { page, limit, unreadOnly } });

  let query = db.collection('notifications').where('userId', '==', userId);

  if (unreadOnly === 'true') {
    query = query.where('isRead', '==', false);
  }

  const snapshot = await query
    .orderBy('createdAt', 'desc')
    .limit(parseInt(limit as string))
    .offset((parseInt(page as string) - 1) * parseInt(limit as string))
    .get();

  const notifications = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Obtener total de notificaciones
  const totalSnapshot = await query.count().get();
  const total = totalSnapshot.data().count;

  logger.info('Notificaciones obtenidas', { userId, metadata: { count: notifications.length, total } });

  res.status(200).json({
    success: true,
    data: {
      notifications,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    },
    message: 'Notificaciones obtenidas exitosamente'
  });
});

/**
 * Marcar notificación como leída
 */
export const markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { notificationId } = req.params;

  logger.info('Marcando notificación como leída', { userId, metadata: { notificationId } });

  const notificationRef = db.collection('notifications').doc(notificationId);
  const notification = await notificationRef.get();

  if (!notification.exists) {
    throw new OperationalError('Notificación no encontrada', 404);
  }

  const notificationData = notification.data();
  if (notificationData!.userId !== userId) {
    throw new OperationalError('No autorizado para acceder a esta notificación', 403);
  }

  await notificationRef.update({
    isRead: true,
    updatedAt: FieldValue.serverTimestamp()
  });

  logger.info('Notificación marcada como leída', { userId, metadata: { notificationId } });

  res.status(200).json({
    success: true,
    message: 'Notificación marcada como leída'
  });
});

/**
 * Marcar todas las notificaciones como leídas
 */
export const markAllNotificationsAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user!;

  logger.info('Marcando todas las notificaciones como leídas', { userId });

  const batch = db.batch();
  const notificationsRef = db.collection('notifications')
    .where('userId', '==', userId)
    .where('isRead', '==', false);

  const snapshot = await notificationsRef.get();

  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      isRead: true,
      updatedAt: FieldValue.serverTimestamp()
    });
  });

  await batch.commit();

  logger.info('Todas las notificaciones marcadas como leídas', { userId, metadata: { count: snapshot.docs.length } });

  res.status(200).json({
    success: true,
    message: `${snapshot.docs.length} notificaciones marcadas como leídas`
  });
});

/**
 * Eliminar notificación
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { notificationId } = req.params;

  logger.info('Eliminando notificación', { userId, metadata: { notificationId } });

  const notificationRef = db.collection('notifications').doc(notificationId);
  const notification = await notificationRef.get();

  if (!notification.exists) {
    throw new OperationalError('Notificación no encontrada', 404);
  }

  const notificationData = notification.data();
  if (notificationData!.userId !== userId) {
    throw new OperationalError('No autorizado para eliminar esta notificación', 403);
  }

  await notificationRef.delete();

  logger.info('Notificación eliminada', { userId, metadata: { notificationId } });

  res.status(200).json({
    success: true,
    message: 'Notificación eliminada exitosamente'
  });
});

/**
 * Obtener contador de notificaciones no leídas
 */
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user!;

  logger.info('Obteniendo contador de notificaciones no leídas', { userId });

  const snapshot = await db.collection('notifications')
    .where('userId', '==', userId)
    .where('isRead', '==', false)
    .count()
    .get();

  const count = snapshot.data().count;

  logger.info('Contador de notificaciones no leídas obtenido', { userId, metadata: { count } });

  res.status(200).json({
    success: true,
    data: { count },
    message: 'Contador de notificaciones no leídas obtenido'
  });
});

/**
 * Crear notificación (para uso interno del sistema)
 */
export const createNotification = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const notificationData: CreateNotificationData = req.body;

  logger.info('Creando notificación', { userId, metadata: { notificationData } });

  if (!notificationData.userId || !notificationData.title || !notificationData.message) {
    throw new OperationalError('Datos de notificación incompletos', 400);
  }

  const notification: Omit<Notification, 'id'> = {
    userId: notificationData.userId,
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type || 'info',
    category: notificationData.category || 'system',
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: notificationData.metadata || {}
  };

  const docRef = await db.collection('notifications').add(notification);

  logger.info('Notificación creada', { userId, metadata: { notificationId: docRef.id } });

  res.status(201).json({
    success: true,
    data: { id: docRef.id, ...notification },
    message: 'Notificación creada exitosamente'
  });
});

/**
 * Enviar notificación masiva (solo para superadmin)
 */
export const sendBulkNotification = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { title, message, type, category, targetUsers, metadata } = req.body;

  logger.info('Enviando notificación masiva', { userId, metadata: { title, targetUsers } });

  if (!title || !message || !targetUsers || !Array.isArray(targetUsers)) {
    throw new OperationalError('Datos de notificación masiva incompletos', 400);
  }

  const batch = db.batch();
  const notifications: any[] = [];

  targetUsers.forEach((targetUserId: string) => {
    const notificationRef = db.collection('notifications').doc();
    const notification = {
      userId: targetUserId,
      title,
      message,
      type: type || 'info',
      category: category || 'system',
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: metadata || {}
    };

    batch.set(notificationRef, notification);
    notifications.push({ id: notificationRef.id, ...notification });
  });

  await batch.commit();

  logger.info('Notificación masiva enviada', { userId, metadata: { count: targetUsers.length } });

  res.status(201).json({
    success: true,
    data: { notifications },
    message: `Notificación enviada a ${targetUsers.length} usuarios`
  });
});

/**
 * Obtener estadísticas de notificaciones
 */
export const getNotificationStats = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { period = 'week' } = req.query;

  logger.info('Obteniendo estadísticas de notificaciones', { userId, metadata: { period } });

  // Calcular fecha de inicio según el período
  const now = new Date();
  let startDate: Date;

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
  const snapshot = await db.collection('notifications')
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
      error: notifications.filter(n => n.type === 'error').length
    },
    byCategory: {
      system: notifications.filter(n => n.category === 'system').length,
      user: notifications.filter(n => n.category === 'user').length,
      event: notifications.filter(n => n.category === 'event').length,
      request: notifications.filter(n => n.category === 'request').length,
      payment: notifications.filter(n => n.category === 'payment').length
    },
    period
  };

  logger.info('Estadísticas de notificaciones obtenidas', { userId, metadata: { stats } });

  res.status(200).json({
    success: true,
    data: stats,
    message: 'Estadísticas de notificaciones obtenidas'
  });
}); 