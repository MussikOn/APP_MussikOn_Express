import { db } from '../utils/firebase';
import { Event, User } from '../utils/DataTypes';
import { logger } from './loggerService';

// Definir tipo para MusicianRequest ya que no existe en DataTypes
export interface MusicianRequest {
  id: string;
  user: string;
  eventName: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  duration: string;
  instrument: string;
  bringInstrument: boolean;
  comment: string;
  budget: string;
  flyerUrl?: string;
  songs: string[];
  recommendations: string[];
  mapsLink: string;
  status: 'pendiente' | 'asignada' | 'cancelada' | 'completada' | 'no_asignada';
  assignedMusicianId?: string;
  interestedMusicians?: string[];
  createdAt: string;
  updatedAt: string;
  description?: string;
  requirements?: string;
}

export interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  eventType?: string;
  status?: string;
  userRole?: string;
  location?: string;
}

export interface EventAnalytics {
  totalEvents: number;
  eventsByStatus: Record<string, number>;
  eventsByType: Record<string, number>;
  eventsByMonth: Record<string, number>;
  averageBudget: number;
  totalBudget: number;
  completionRate: number;
  cancellationRate: number;
}

export interface RequestAnalytics {
  totalRequests: number;
  requestsByStatus: Record<string, number>;
  requestsByType: Record<string, number>;
  requestsByMonth: Record<string, number>;
  averageBudget: number;
  totalBudget: number;
  acceptanceRate: number;
  averageResponseTime: number;
}

export interface UserAnalytics {
  totalUsers: number;
  usersByRole: Record<string, number>;
  usersByMonth: Record<string, number>;
  activeUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
}

export interface PlatformAnalytics {
  totalRevenue: number;
  averageEventValue: number;
  topEventTypes: Array<{ type: string; count: number; revenue: number }>;
  topLocations: Array<{ location: string; count: number; revenue: number }>;
  userEngagement: {
    eventsPerUser: number;
    requestsPerUser: number;
    averageSessionDuration: number;
  };
  performance: {
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
  };
}

export class AnalyticsService {
  /**
   * Analytics de eventos
   */
  async getEventAnalytics(
    filters: AnalyticsFilters = {}
  ): Promise<EventAnalytics> {
    try {
      let query: any = db.collection('events');

      if (filters.dateFrom) {
        query = query.where('createdAt', '>=', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.where('createdAt', '<=', filters.dateTo);
      }

      const snapshot = await query.get();
      const events = snapshot.docs.map((doc: any) => doc.data() as Event);

      const eventsByStatus: Record<string, number> = {};
      const eventsByType: Record<string, number> = {};
      const eventsByMonth: Record<string, number> = {};
      let totalBudget = 0;
      let completedEvents = 0;
      let cancelledEvents = 0;

      events.forEach((event: any) => {
        // Contar por estado
        eventsByStatus[event.status] = (eventsByStatus[event.status] || 0) + 1;

        // Contar por tipo
        eventsByType[event.eventType] =
          (eventsByType[event.eventType] || 0) + 1;

        // Contar por mes - Validar fecha antes de convertir
        let month: string;
        try {
          const createdAt = event.createdAt
            ? new Date(event.createdAt)
            : new Date();
          if (isNaN(createdAt.getTime())) {
            console.info('./src/services/analyticsService.ts line 126');
            console.warn('Fecha inválida en event:', event.id, event.createdAt);
            month = new Date().toISOString().substring(0, 7);
          } else {
            month = createdAt.toISOString().substring(0, 7);
          }
        } catch (error) {
          console.info('./src/services/analyticsService.ts line 133');
          console.warn('Error al procesar fecha de event:', event.id, error);
          month = new Date().toISOString().substring(0, 7);
        }

        eventsByMonth[month] = (eventsByMonth[month] || 0) + 1;

        // Calcular presupuesto
        totalBudget += event.budget || 0;

        // Contar eventos completados
        if (event.status === 'completado') completedEvents++;

        // Contar eventos cancelados
        if (event.status === 'cancelado') cancelledEvents++;
      });

      const averageBudget = events.length > 0 ? totalBudget / events.length : 0;
      const completionRate =
        events.length > 0 ? (completedEvents / events.length) * 100 : 0;
      const cancellationRate =
        events.length > 0 ? (cancelledEvents / events.length) * 100 : 0;

      return {
        totalEvents: events.length,
        eventsByStatus,
        eventsByType,
        eventsByMonth,
        averageBudget,
        totalBudget,
        completionRate,
        cancellationRate,
      };
    } catch (error) {
      logger.error('Error al obtener analytics de eventos:', error as Error);
      throw new Error('Error al obtener analytics de eventos');
    }
  }

  /**
   * Analytics de solicitudes de músicos
   */
  async getRequestAnalytics(
    filters: AnalyticsFilters = {}
  ): Promise<RequestAnalytics> {
    try {
      let query: any = db.collection('musicianRequests');

      if (filters.dateFrom) {
        query = query.where('createdAt', '>=', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.where('createdAt', '<=', filters.dateTo);
      }

      const snapshot = await query.get();
      const requests = snapshot.docs.map(
        (doc: any) => doc.data() as MusicianRequest
      );

      const requestsByStatus: Record<string, number> = {};
      const requestsByType: Record<string, number> = {};
      const requestsByMonth: Record<string, number> = {};
      let totalBudget = 0;
      let acceptedRequests = 0;
      let totalResponseTime = 0;
      let responseTimeCount = 0;

      requests.forEach((request: any) => {
        // Contar por estado
        requestsByStatus[request.status] =
          (requestsByStatus[request.status] || 0) + 1;

        // Contar por tipo
        requestsByType[request.eventType] =
          (requestsByType[request.eventType] || 0) + 1;

        // Contar por mes - Validar fecha antes de convertir
        let month: string;
        try {
          let createdAt: Date;
          
          // Manejar diferentes tipos de fecha (Timestamp de Firestore, Date, string)
          if (request.createdAt) {
            if (request.createdAt.toDate) {
              // Es un Timestamp de Firestore
              createdAt = request.createdAt.toDate();
            } else if (request.createdAt instanceof Date) {
              // Ya es un Date
              createdAt = request.createdAt;
            } else if (typeof request.createdAt === 'string') {
              // Es un string, intentar convertir
              createdAt = new Date(request.createdAt);
            } else {
              // Otro tipo, usar fecha actual
              createdAt = new Date();
            }
          } else {
            createdAt = new Date();
          }
          
          if (isNaN(createdAt.getTime())) {
            logger.warn('Fecha inválida en request', {
              metadata: { requestId: request.id, createdAt: request.createdAt }
            });
            month = new Date().toISOString().substring(0, 7);
          } else {
            month = createdAt.toISOString().substring(0, 7);
          }
        } catch (error) {
          logger.warn('Error al procesar fecha de request', {
            metadata: { requestId: request.id, error: (error as Error).message }
          });
          month = new Date().toISOString().substring(0, 7);
        }

        requestsByMonth[month] = (requestsByMonth[month] || 0) + 1;

        // Calcular presupuesto
        totalBudget += request.budget || 0;

        // Contar solicitudes aceptadas
        if (request.status === 'asignada') acceptedRequests++;

        // Calcular tiempo de respuesta - Validar fechas
        if (request.assignedMusicianId && request.updatedAt) {
          try {
            let created: Date;
            let updated: Date;
            
            // Manejar createdAt
            if (request.createdAt) {
              if (request.createdAt.toDate) {
                created = request.createdAt.toDate();
              } else if (request.createdAt instanceof Date) {
                created = request.createdAt;
              } else if (typeof request.createdAt === 'string') {
                created = new Date(request.createdAt);
              } else {
                created = new Date();
              }
            } else {
              created = new Date();
            }
            
            // Manejar updatedAt
            if (request.updatedAt.toDate) {
              updated = request.updatedAt.toDate();
            } else if (request.updatedAt instanceof Date) {
              updated = request.updatedAt;
            } else if (typeof request.updatedAt === 'string') {
              updated = new Date(request.updatedAt);
            } else {
              updated = new Date();
            }

            if (!isNaN(created.getTime()) && !isNaN(updated.getTime())) {
              totalResponseTime += updated.getTime() - created.getTime();
              responseTimeCount++;
            }
          } catch (error) {
            logger.warn('Error al calcular tiempo de respuesta', {
              metadata: { requestId: request.id, error: (error as Error).message }
            });
          }
        }
      });

      const averageBudget =
        requests.length > 0 ? totalBudget / requests.length : 0;
      const acceptanceRate =
        requests.length > 0 ? (acceptedRequests / requests.length) * 100 : 0;
      const averageResponseTime =
        responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;

      return {
        totalRequests: requests.length,
        requestsByStatus,
        requestsByType,
        requestsByMonth,
        averageBudget,
        totalBudget,
        acceptanceRate,
        averageResponseTime,
      };
    } catch (error) {
      logger.error('Error al obtener analytics de solicitudes:', error as Error);
      throw new Error('Error al obtener analytics de solicitudes');
    }
  }

  /**
   * Analytics de usuarios
   */
  async getUserAnalytics(
    filters: AnalyticsFilters = {}
  ): Promise<UserAnalytics> {
    try {
      let query: any = db.collection('users');

      if (filters.userRole) {
        query = query.where('roll', '==', filters.userRole);
      }

      const snapshot = await query.get();
      const users = snapshot.docs.map((doc: any) => doc.data() as User);

      const usersByRole: Record<string, number> = {};
      const usersByMonth: Record<string, number> = {};
      let activeUsers = 0;
      let newUsersThisMonth = 0;

      const currentMonth = new Date().toISOString().substring(0, 7);
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .substring(0, 7);

      users.forEach((user: any) => {
        // Contar por rol
        usersByRole[user.roll] = (usersByRole[user.roll] || 0) + 1;

        // Contar por mes - Validar fecha antes de convertir
        let month: string;
        try {
          const createAt = user.create_at
            ? new Date(user.create_at)
            : new Date();
          if (isNaN(createAt.getTime())) {
            console.info('./src/services/analyticsService.ts line 296');
            console.warn('Fecha inválida en user:', user.id, user.create_at);
            month = new Date().toISOString().substring(0, 7);
          } else {
            month = createAt.toISOString().substring(0, 7);
          }
        } catch (error) {
          console.info('./src/services/analyticsService.ts line 303');
          console.warn('Error al procesar fecha de user:', user.id, error);
          month = new Date().toISOString().substring(0, 7);
        }

        usersByMonth[month] = (usersByMonth[month] || 0) + 1;

        // Contar usuarios activos (creados en el último mes)
        if (month >= lastMonth) activeUsers++;

        // Contar nuevos usuarios este mes
        if (month === currentMonth) newUsersThisMonth++;
      });

      // Calcular tasa de crecimiento
      const previousMonthUsers = usersByMonth[lastMonth] || 0;
      const currentMonthUsers = usersByMonth[currentMonth] || 0;
      const userGrowthRate =
        previousMonthUsers > 0
          ? ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) *
            100
          : 0;

      return {
        totalUsers: users.length,
        usersByRole,
        usersByMonth,
        activeUsers,
        newUsersThisMonth,
        userGrowthRate,
      };
    } catch (error) {
      logger.error('Error al obtener analytics de usuarios:', error as Error);
      throw new Error('Error al obtener analytics de usuarios');
    }
  }

  /**
   * Analytics de la plataforma completa
   */
  async getPlatformAnalytics(
    filters: AnalyticsFilters = {}
  ): Promise<PlatformAnalytics> {
    try {
      const [eventAnalytics, requestAnalytics, userAnalytics] =
        await Promise.all([
          this.getEventAnalytics(filters),
          this.getRequestAnalytics(filters),
          this.getUserAnalytics(filters),
        ]);

      // Calcular ingresos totales (simulado)
      const totalRevenue = eventAnalytics.totalBudget * 0.1; // 10% de comisión
      const averageEventValue =
        eventAnalytics.totalEvents > 0
          ? eventAnalytics.totalBudget / eventAnalytics.totalEvents
          : 0;

      // Top tipos de eventos
      const topEventTypes = Object.entries(eventAnalytics.eventsByType)
        .map(([type, count]) => ({
          type,
          count,
          revenue: count * averageEventValue,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top ubicaciones (simulado)
      const topLocations = [
        { location: 'Santo Domingo', count: 150, revenue: 15000 },
        { location: 'Santiago', count: 120, revenue: 12000 },
        { location: 'La Romana', count: 80, revenue: 8000 },
        { location: 'Puerto Plata', count: 60, revenue: 6000 },
        { location: 'San Pedro de Macorís', count: 40, revenue: 4000 },
      ];

      // Métricas de engagement
      const eventsPerUser =
        userAnalytics.totalUsers > 0
          ? eventAnalytics.totalEvents / userAnalytics.totalUsers
          : 0;
      const requestsPerUser =
        userAnalytics.totalUsers > 0
          ? requestAnalytics.totalRequests / userAnalytics.totalUsers
          : 0;

      // Métricas de performance (simuladas)
      const performance = {
        averageResponseTime: requestAnalytics.averageResponseTime,
        successRate: 95.5, // Simulado
        errorRate: 4.5, // Simulado
      };

      return {
        totalRevenue,
        averageEventValue,
        topEventTypes,
        topLocations,
        userEngagement: {
          eventsPerUser,
          requestsPerUser,
          averageSessionDuration: 25.5, // Simulado en minutos
        },
        performance,
      };
    } catch (error) {
      logger.error('Error al obtener analytics de plataforma:', error as Error);
      throw new Error('Error al obtener analytics de plataforma');
    }
  }

  /**
   * Reporte de tendencias
   */
  async getTrendsReport(months: number = 6): Promise<{
    eventTrends: Array<{ month: string; count: number; revenue: number }>;
    requestTrends: Array<{
      month: string;
      count: number;
      acceptanceRate: number;
    }>;
    userTrends: Array<{ month: string; newUsers: number; activeUsers: number }>;
  }> {
    try {
      const trends = {
        eventTrends: [] as Array<{
          month: string;
          count: number;
          revenue: number;
        }>,
        requestTrends: [] as Array<{
          month: string;
          count: number;
          acceptanceRate: number;
        }>,
        userTrends: [] as Array<{
          month: string;
          newUsers: number;
          activeUsers: number;
        }>,
      };

      // Generar datos de tendencias para los últimos meses
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toISOString().substring(0, 7);

        // Simular datos de tendencias
        const eventCount = Math.floor(Math.random() * 50) + 20;
        const eventRevenue = eventCount * (Math.random() * 500 + 200);

        const requestCount = Math.floor(Math.random() * 30) + 10;
        const acceptanceRate = Math.random() * 30 + 60;

        const newUsers = Math.floor(Math.random() * 20) + 5;
        const activeUsers = Math.floor(Math.random() * 100) + 50;

        trends.eventTrends.push({
          month,
          count: eventCount,
          revenue: eventRevenue,
        });

        trends.requestTrends.push({
          month,
          count: requestCount,
          acceptanceRate,
        });

        trends.userTrends.push({
          month,
          newUsers,
          activeUsers,
        });
      }

      return trends;
    } catch (error) {
      console.info('./src/services/analyticsService.ts line 459');
      logger.error('Error al obtener reporte de tendencias:', error as Error);
      throw new Error('Error al obtener reporte de tendencias');
    }
  }

  /**
   * Reporte de rendimiento por ubicación
   */
  async getLocationPerformanceReport(): Promise<
    Array<{
      location: string;
      totalEvents: number;
      totalRequests: number;
      totalRevenue: number;
      averageEventValue: number;
      completionRate: number;
      acceptanceRate: number;
    }>
  > {
    try {
      // Simular datos de rendimiento por ubicación
      const locations = [
        'Santo Domingo',
        'Santiago',
        'La Romana',
        'Puerto Plata',
        'San Pedro de Macorís',
        'Higüey',
        'San Francisco de Macorís',
        'La Vega',
        'Moca',
        'Bonao',
      ];

      return locations.map(location => ({
        location,
        totalEvents: Math.floor(Math.random() * 100) + 20,
        totalRequests: Math.floor(Math.random() * 60) + 10,
        totalRevenue: Math.floor(Math.random() * 20000) + 5000,
        averageEventValue: Math.floor(Math.random() * 500) + 200,
        completionRate: Math.random() * 30 + 70,
        acceptanceRate: Math.random() * 40 + 50,
      }));
    } catch (error) {
      console.info('./src/services/analyticsService.ts line 502');
      logger.error('Error al obtener reporte de rendimiento por ubicación:', error as Error);
      throw new Error('Error al obtener reporte de rendimiento por ubicación');
    }
  }

  /**
   * Reporte de usuarios más activos
   */
  async getTopActiveUsersReport(limit: number = 10): Promise<
    Array<{
      user: User;
      eventsCreated: number;
      requestsCreated: number;
      eventsCompleted: number;
      requestsAccepted: number;
      totalRevenue: number;
    }>
  > {
    try {
      // Obtener usuarios
      const usersSnapshot = await db.collection('users').limit(limit).get();
      const users = usersSnapshot.docs.map(doc => doc.data() as User);

      // Simular datos de actividad
      return users
        .map(user => ({
          user,
          eventsCreated: Math.floor(Math.random() * 20) + 1,
          requestsCreated: Math.floor(Math.random() * 15) + 1,
          eventsCompleted: Math.floor(Math.random() * 15) + 1,
          requestsAccepted: Math.floor(Math.random() * 10) + 1,
          totalRevenue: Math.floor(Math.random() * 5000) + 500,
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue);
    } catch (error) {
      console.info('./src/services/analyticsService.ts line 534');
      logger.error('Error al obtener reporte de usuarios más activos:', error as Error);
      throw new Error('Error al obtener reporte de usuarios más activos');
    }
  }
}

export const analyticsService = new AnalyticsService();
