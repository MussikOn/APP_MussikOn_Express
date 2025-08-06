import { Request, Response } from 'express';
import { db } from '../utils/firebase';
import { logger } from '../services/loggerService';

export class AnalyticsController {
  /**
   * Obtener estadísticas generales del sistema
   */
  async getSystemStats(req: Request, res: Response): Promise<void> {
    try {
      logger.info('[src/controllers/analyticsController.ts] Obteniendo estadísticas del sistema');

      // Obtener estadísticas de usuarios
      const usersSnapshot = await db.collection('users').get();
      const totalUsers = usersSnapshot.size;
      
      // Contar usuarios por rol
      const roleStats = {
        admin: 0,
        superadmin: 0,
        eventCreator: 0,
        musician: 0
      };

      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        const role = userData.roll || 'musician';
        if (roleStats.hasOwnProperty(role)) {
          (roleStats as any)[role]++;
        }
      });

      // Obtener estadísticas de eventos
      const eventsSnapshot = await db.collection('events').get();
      const totalEvents = eventsSnapshot.size;

      // Contar eventos por estado
      const eventStats = {
        active: 0,
        completed: 0,
        cancelled: 0,
        pending: 0
      };

      eventsSnapshot.forEach(doc => {
        const eventData = doc.data();
        const status = eventData.status || 'pending';
        if (eventStats.hasOwnProperty(status)) {
          (eventStats as any)[status]++;
        }
      });

      // Obtener estadísticas de solicitudes
      const requestsSnapshot = await db.collection('musician_requests').get();
      const totalRequests = requestsSnapshot.size;

      // Contar solicitudes por estado
      const requestStats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        completed: 0
      };

      requestsSnapshot.forEach(doc => {
        const requestData = doc.data();
        const status = requestData.status || 'pending';
        if (requestStats.hasOwnProperty(status)) {
          (requestStats as any)[status]++;
        }
      });

      // Obtener estadísticas de imágenes
      const imagesSnapshot = await db.collection('images').get();
      const totalImages = imagesSnapshot.size;

      // Calcular tamaño total de imágenes
      let totalImageSize = 0;
      imagesSnapshot.forEach(doc => {
        const imageData = doc.data();
        totalImageSize += imageData.size || 0;
      });

      // Obtener estadísticas de chat
      const chatSnapshot = await db.collection('chat_conversations').get();
      const totalConversations = chatSnapshot.size;

      // Calcular mensajes totales
      let totalMessages = 0;
      for (const doc of chatSnapshot.docs) {
        const messagesSnapshot = await doc.ref.collection('messages').get();
        totalMessages += messagesSnapshot.size;
      }

      // Calcular porcentajes de cambio (simulado para demo)
      const changePercentages = {
        users: Math.floor(Math.random() * 20) + 5, // 5-25%
        events: Math.floor(Math.random() * 15) + 3, // 3-18%
        requests: Math.floor(Math.random() * 30) - 10, // -10 a 20%
        images: Math.floor(Math.random() * 25) + 10 // 10-35%
      };

      const stats = {
        users: {
          total: totalUsers,
          byRole: roleStats,
          change: changePercentages.users
        },
        events: {
          total: totalEvents,
          byStatus: eventStats,
          change: changePercentages.events
        },
        requests: {
          total: totalRequests,
          byStatus: requestStats,
          change: changePercentages.requests
        },
        images: {
          total: totalImages,
          totalSize: totalImageSize,
          change: changePercentages.images
        },
        chat: {
          conversations: totalConversations,
          messages: totalMessages
        },
        system: {
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage()
        }
      };

      res.status(200).json({
      success: true,
        data: stats
      });

    } catch (error) {
      logger.error('[src/controllers/analyticsController.ts] Error obteniendo estadísticas del sistema', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estadísticas del sistema'
      });
    }
  }

  /**
   * Obtener estadísticas de rendimiento
   */
  async getPerformanceStats(req: Request, res: Response): Promise<void> {
    try {
      const performanceStats = {
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      };

      res.status(200).json({
        success: true,
        data: performanceStats
      });

    } catch (error) {
      logger.error('[src/controllers/analyticsController.ts] Error obteniendo estadísticas de rendimiento', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estadísticas de rendimiento'
      });
    }
  }

  /**
   * Obtener estadísticas de actividad reciente
   */
  async getRecentActivity(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;
      const limitNum = Math.min(Number(limit), 50); // Máximo 50 registros

      // Obtener eventos recientes
      const recentEvents = await db.collection('events')
        .orderBy('create_at', 'desc')
        .limit(limitNum)
        .get();

      // Obtener usuarios recientes
      const recentUsers = await db.collection('users')
        .orderBy('create_at', 'desc')
        .limit(limitNum)
        .get();

      // Obtener solicitudes recientes
      const recentRequests = await db.collection('musician_requests')
        .orderBy('create_at', 'desc')
        .limit(limitNum)
        .get();

      const activity = {
        events: recentEvents.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'event'
        })),
        users: recentUsers.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'user'
        })),
        requests: recentRequests.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'request'
        }))
      };

      res.status(200).json({
        success: true,
        data: activity
      });

    } catch (error) {
      logger.error('[src/controllers/analyticsController.ts] Error obteniendo actividad reciente', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo actividad reciente'
      });
    }
  }
}

// Instancia singleton
export const analyticsController = new AnalyticsController();
