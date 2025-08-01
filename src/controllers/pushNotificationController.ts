import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { pushNotificationService } from '../services/pushNotificationService';
import { logger } from '../services/loggerService';
import { requireRole } from '../middleware/requireRole';

/**
 * Guardar suscripción push de un usuario
 */
export const savePushSubscription = asyncHandler(
  async (req: Request, res: Response) => {
    const { endpoint, keys } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Usuario no autenticado',
          code: 'UNAUTHORIZED',
        },
      });
    }

    if (!endpoint || !keys) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Endpoint y keys son requeridos',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const subscription = await pushNotificationService.saveSubscription(
      userId,
      {
        endpoint,
        keys,
        isActive: true,
      }
    );

    logger.info('Suscripción push guardada', {
      metadata: { userId, subscriptionId: subscription.id },
    });

    res.status(201).json({
      success: true,
      data: subscription,
      message: 'Suscripción push guardada exitosamente',
    });
  }
);

/**
 * Obtener suscripciones de un usuario
 */
export const getUserPushSubscriptions = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Usuario no autenticado',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const subscriptions = await pushNotificationService.getUserSubscriptions();

    res.json({
      success: true,
      data: subscriptions,
      message: 'Suscripciones obtenidas exitosamente',
    });
  }
);

/**
 * Eliminar suscripción push
 */
export const deletePushSubscription = asyncHandler(
  async (req: Request, res: Response) => {
    const { subscriptionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Usuario no autenticado',
          code: 'UNAUTHORIZED',
        },
      });
    }

    await pushNotificationService.deleteSubscription(subscriptionId);

    logger.info('Suscripción push eliminada', {
      metadata: { userId, subscriptionId },
    });

    res.json({
      success: true,
      message: 'Suscripción push eliminada exitosamente',
    });
  }
);

/**
 * Enviar notificación push a un usuario específico
 */
export const sendNotificationToUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const notification = req.body;

    if (!notification.title || !notification.body) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Título y cuerpo de la notificación son requeridos',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    await pushNotificationService.sendNotificationToUser(userId, notification);

    logger.info('Notificación push enviada a usuario', {
      metadata: { userId, notificationTitle: notification.title },
    });

    res.json({
      success: true,
      message: 'Notificación push enviada exitosamente',
    });
  }
);

/**
 * Enviar notificación masiva
 */
export const sendBulkNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const bulkRequest = req.body;

    if (!bulkRequest.templateId && !bulkRequest.customNotification) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Debe especificar un template o notificación personalizada',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    if (!bulkRequest.userIds && !bulkRequest.userRoles) {
      return res.status(400).json({
        success: false,
        error: {
          message:
            'Debe especificar usuarios o roles para enviar la notificación',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const result =
      await pushNotificationService.sendBulkNotification(bulkRequest);

    if (result) {
      logger.info('Notificación masiva enviada', {
        metadata: { success: result.success, failed: result.failed },
      });

      res.json({
        success: true,
        data: result,
        message: `Notificación masiva enviada: ${result.success} exitosas, ${result.failed} fallidas`,
      });
    } else {
      logger.error('Error enviando notificación masiva');
      res.status(500).json({
        success: false,
        error: {
          message: 'Error enviando notificación masiva',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }
);

/**
 * Crear template de notificación
 */
export const createNotificationTemplate = asyncHandler(
  async (req: Request, res: Response) => {
    const template = req.body;

    if (!template.name || !template.title || !template.body) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Nombre, título y cuerpo del template son requeridos',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const createdTemplate =
      await pushNotificationService.createNotificationTemplate(template);

    if (createdTemplate) {
      logger.info('Template de notificación creado', {
        metadata: {
          templateId: createdTemplate.id,
          name: createdTemplate.name,
        },
      });

      res.status(201).json({
        success: true,
        data: createdTemplate,
        message: 'Template de notificación creado exitosamente',
      });
    } else {
      logger.error('Error creando template de notificación');
      res.status(500).json({
        success: false,
        error: {
          message: 'Error creando template de notificación',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }
);

/**
 * Obtener template de notificación
 */
export const getNotificationTemplate = asyncHandler(
  async (req: Request, res: Response) => {
    const { templateId } = req.params;

    const template =
      await pushNotificationService.getNotificationTemplate(templateId);

    res.json({
      success: true,
      data: template,
      message: 'Template obtenido exitosamente',
    });
  }
);

/**
 * Obtener todos los templates activos
 */
export const getActiveTemplates = asyncHandler(
  async (req: Request, res: Response) => {
    const templates = await pushNotificationService.getActiveTemplates();

    res.json({
      success: true,
      data: templates,
      message: 'Templates obtenidos exitosamente',
    });
  }
);

/**
 * Actualizar template de notificación
 */
export const updateNotificationTemplate = asyncHandler(
  async (req: Request, res: Response) => {
    const { templateId } = req.params;
    const updates = req.body;

    const updatedTemplate =
      await pushNotificationService.updateNotificationTemplate(
        templateId,
        updates
      );

    logger.info('Template de notificación actualizado', {
      metadata: { templateId },
    });

    res.json({
      success: true,
      data: updatedTemplate,
      message: 'Template actualizado exitosamente',
    });
  }
);

/**
 * Eliminar template de notificación
 */
export const deleteNotificationTemplate = asyncHandler(
  async (req: Request, res: Response) => {
    const { templateId } = req.params;

    await pushNotificationService.deleteNotificationTemplate(templateId);

    logger.info('Template de notificación eliminado', {
      metadata: { templateId },
    });

    res.json({
      success: true,
      message: 'Template eliminado exitosamente',
    });
  }
);

/**
 * Obtener estadísticas de notificaciones
 */
export const getNotificationStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await pushNotificationService.getNotificationStats();

    res.json({
      success: true,
      data: stats,
      message: 'Estadísticas obtenidas exitosamente',
    });
  }
);

/**
 * Obtener VAPID public key
 */
export const getVapidPublicKey = asyncHandler(
  async (req: Request, res: Response) => {
    const publicKey = pushNotificationService.getVapidPublicKey();

    res.json({
      success: true,
      data: { publicKey },
      message: 'VAPID public key obtenida exitosamente',
    });
  }
);

/**
 * Probar notificación push (solo para desarrollo)
 */
export const testPushNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Usuario no autenticado',
          code: 'UNAUTHORIZED',
        },
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
        type: 'test',
      },
      requireInteraction: true,
      priority: 'high' as const,
      category: 'test',
      type: 'test',
    };

    await pushNotificationService.sendNotificationToUser(
      userId,
      testNotification
    );

    logger.info('Notificación de prueba enviada', {
      metadata: { userId },
    });

    res.json({
      success: true,
      message: 'Notificación de prueba enviada exitosamente',
    });
  }
);
