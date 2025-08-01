import { Request, Response } from 'express';
import {
  analyticsService,
  AnalyticsFilters,
} from '../services/analyticsService';
import { logger } from '../services/loggerService';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Analytics de eventos
 */
export const getEventAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const filters: AnalyticsFilters = {
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      eventType: req.query.eventType as string,
      status: req.query.status as string,
      location: req.query.location as string,
    };

    logger.info('Solicitud de analytics de eventos', {
      metadata: { filters, userId: (req as any).user?.userEmail },
    });

    const analytics = await analyticsService.getEventAnalytics(filters);

    logger.info('Analytics de eventos completado', {
      metadata: {
        totalEvents: analytics.totalEvents,
        userId: (req as any).user?.userEmail,
      },
    });

    res.json({
      success: true,
      data: analytics,
    });
  }
);

/**
 * Analytics de solicitudes de músicos
 */
export const getRequestAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const filters: AnalyticsFilters = {
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      eventType: req.query.eventType as string,
      status: req.query.status as string,
      location: req.query.location as string,
    };

    logger.info('Solicitud de analytics de solicitudes', {
      metadata: { filters, userId: (req as any).user?.userEmail },
    });

    const analytics = await analyticsService.getRequestAnalytics(filters);

    logger.info('Analytics de solicitudes completado', {
      metadata: {
        totalRequests: analytics.totalRequests,
        userId: (req as any).user?.userEmail,
      },
    });

    res.json({
      success: true,
      data: analytics,
    });
  }
);

/**
 * Analytics de usuarios
 */
export const getUserAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const filters: AnalyticsFilters = {
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      userRole: req.query.userRole as string,
    };

    logger.info('Solicitud de analytics de usuarios', {
      metadata: { filters, userId: (req as any).user?.userEmail },
    });

    const analytics = await analyticsService.getUserAnalytics(filters);

    logger.info('Analytics de usuarios completado', {
      metadata: {
        totalUsers: analytics.totalUsers,
        userId: (req as any).user?.userEmail,
      },
    });

    res.json({
      success: true,
      data: analytics,
    });
  }
);

/**
 * Analytics de la plataforma completa
 */
export const getPlatformAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const filters: AnalyticsFilters = {
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      eventType: req.query.eventType as string,
      status: req.query.status as string,
      userRole: req.query.userRole as string,
      location: req.query.location as string,
    };

    logger.info('Solicitud de analytics de plataforma', {
      metadata: { filters, userId: (req as any).user?.userEmail },
    });

    const analytics = await analyticsService.getPlatformAnalytics(filters);

    logger.info('Analytics de plataforma completado', {
      metadata: {
        totalRevenue: analytics.totalRevenue,
        userId: (req as any).user?.userEmail,
      },
    });

    res.json({
      success: true,
      data: analytics,
    });
  }
);

/**
 * Reporte de tendencias
 */
export const getTrendsReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const months = parseInt(req.query.months as string) || 6;

    logger.info('Solicitud de reporte de tendencias', {
      metadata: { months, userId: (req as any).user?.userEmail },
    });

    const trends = await analyticsService.getTrendsReport(months);

    logger.info('Reporte de tendencias completado', {
      metadata: {
        months,
        userId: (req as any).user?.userEmail,
      },
    });

    res.json({
      success: true,
      data: trends,
    });
  }
);

/**
 * Reporte de rendimiento por ubicación
 */
export const getLocationPerformanceReportController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.info('Solicitud de reporte de rendimiento por ubicación', {
      metadata: { userId: (req as any).user?.userEmail },
    });

    const performance = await analyticsService.getLocationPerformanceReport();

    logger.info('Reporte de rendimiento por ubicación completado', {
      metadata: {
        locationsCount: performance.length,
        userId: (req as any).user?.userEmail,
      },
    });

    res.json({
      success: true,
      data: performance,
    });
  }
);

/**
 * Reporte de usuarios más activos
 */
export const getTopActiveUsersReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;

    logger.info('Solicitud de reporte de usuarios más activos', {
      metadata: { limit, userId: (req as any).user?.userEmail },
    });

    const users = await analyticsService.getTopActiveUsersReport(limit);

    logger.info('Reporte de usuarios más activos completado', {
      metadata: {
        usersCount: users.length,
        userId: (req as any).user?.userEmail,
      },
    });

    res.json({
      success: true,
      data: users,
    });
  }
);

/**
 * Dashboard de analytics completo
 */
export const getDashboardController = asyncHandler(
  async (req: Request, res: Response) => {
    const filters: AnalyticsFilters = {
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
    };

    logger.info('Solicitud de dashboard de analytics', {
      metadata: { filters, userId: (req as any).user?.userEmail },
    });

    const [
      eventAnalytics,
      requestAnalytics,
      userAnalytics,
      platformAnalytics,
      trends,
    ] = await Promise.all([
      analyticsService.getEventAnalytics(filters),
      analyticsService.getRequestAnalytics(filters),
      analyticsService.getUserAnalytics(filters),
      analyticsService.getPlatformAnalytics(filters),
      analyticsService.getTrendsReport(6),
    ]);

    logger.info('Dashboard de analytics completado', {
      metadata: {
        totalEvents: eventAnalytics.totalEvents,
        totalRequests: requestAnalytics.totalRequests,
        totalUsers: userAnalytics.totalUsers,
        userId: (req as any).user?.userEmail,
      },
    });

    res.json({
      success: true,
      data: {
        events: eventAnalytics,
        requests: requestAnalytics,
        users: userAnalytics,
        platform: platformAnalytics,
        trends,
      },
    });
  }
);

/**
 * Exportar reporte en formato CSV
 */
export const exportReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const { type, format } = req.query;
    const filters: AnalyticsFilters = {
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      eventType: req.query.eventType as string,
      status: req.query.status as string,
      userRole: req.query.userRole as string,
      location: req.query.location as string,
    };

    logger.info('Solicitud de exportación de reporte', {
      metadata: { type, format, filters, userId: (req as any).user?.userEmail },
    });

    let data: any;
    let filename: string;

    switch (type) {
      case 'events':
        data = await analyticsService.getEventAnalytics(filters);
        filename = `eventos_analytics_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'requests':
        data = await analyticsService.getRequestAnalytics(filters);
        filename = `solicitudes_analytics_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'users':
        data = await analyticsService.getUserAnalytics(filters);
        filename = `usuarios_analytics_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'platform':
        data = await analyticsService.getPlatformAnalytics(filters);
        filename = `plataforma_analytics_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'trends':
        data = await analyticsService.getTrendsReport(6);
        filename = `tendencias_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'location':
        data = await analyticsService.getLocationPerformanceReport();
        filename = `rendimiento_ubicacion_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      default:
        throw new Error('Tipo de reporte no válido');
    }

    // Convertir a CSV (implementación básica)
    const csvData = convertToCSV(data);

    logger.info('Exportación de reporte completada', {
      metadata: {
        type,
        format,
        filename,
        userId: (req as any).user?.userEmail,
      },
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  }
);

/**
 * Función auxiliar para convertir datos a CSV
 */
function convertToCSV(data: any): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  } else {
    // Para objetos simples, convertir a formato clave-valor
    const rows = Object.entries(data).map(([key, value]) => `${key},${value}`);
    return `Metrica,Valor\n${rows.join('\n')}`;
  }
}
