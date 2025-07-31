import { Request, Response } from 'express';
import { searchService, SearchFilters } from '../services/searchService';
import { logger } from '../services/loggerService';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Búsqueda avanzada de eventos
 */
export const searchEventsController = asyncHandler(async (req: Request, res: Response) => {
  const filters: SearchFilters = {
    query: req.query.query as string,
    status: req.query.status as string,
    eventType: req.query.eventType as string,
    instrument: req.query.instrument as string,
    dateFrom: req.query.dateFrom as string,
    dateTo: req.query.dateTo as string,
    location: req.query.location as string,
    budget: req.query.budget ? {
      min: parseInt(req.query.budget as string),
      max: parseInt(req.query.budgetMax as string)
    } : undefined,
    limit: parseInt(req.query.limit as string) || 20,
    offset: parseInt(req.query.offset as string) || 0,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as 'asc' | 'desc'
  };

  logger.info('Búsqueda de eventos iniciada', {
    metadata: { filters, userId: (req as any).user?.userEmail }
  });

  const result = await searchService.searchEvents(filters);

  logger.info('Búsqueda de eventos completada', {
    metadata: { 
      totalResults: result.total,
      userId: (req as any).user?.userEmail 
    }
  });

  res.json({
    success: true,
    data: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore
    }
  });
});

/**
 * Búsqueda avanzada de solicitudes de músicos
 */
export const searchMusicianRequestsController = asyncHandler(async (req: Request, res: Response) => {
  const filters: SearchFilters = {
    query: req.query.query as string,
    status: req.query.status as string,
    eventType: req.query.eventType as string,
    instrument: req.query.instrument as string,
    dateFrom: req.query.dateFrom as string,
    dateTo: req.query.dateTo as string,
    location: req.query.location as string,
    budget: req.query.budget ? {
      min: parseInt(req.query.budget as string),
      max: parseInt(req.query.budgetMax as string)
    } : undefined,
    limit: parseInt(req.query.limit as string) || 20,
    offset: parseInt(req.query.offset as string) || 0,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as 'asc' | 'desc'
  };

  logger.info('Búsqueda de solicitudes iniciada', {
    metadata: { filters, userId: (req as any).user?.userEmail }
  });

  const result = await searchService.searchMusicianRequests(filters);

  logger.info('Búsqueda de solicitudes completada', {
    metadata: { 
      totalResults: result.total,
      userId: (req as any).user?.userEmail 
    }
  });

  res.json({
    success: true,
    data: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore
    }
  });
});

/**
 * Búsqueda avanzada de usuarios
 */
export const searchUsersController = asyncHandler(async (req: Request, res: Response) => {
  const filters: SearchFilters = {
    query: req.query.query as string,
    userRole: req.query.userRole as string,
    limit: parseInt(req.query.limit as string) || 20,
    offset: parseInt(req.query.offset as string) || 0,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as 'asc' | 'desc'
  };

  logger.info('Búsqueda de usuarios iniciada', {
    metadata: { filters, userId: (req as any).user?.userEmail }
  });

  const result = await searchService.searchUsers(filters);

  logger.info('Búsqueda de usuarios completada', {
    metadata: { 
      totalResults: result.total,
      userId: (req as any).user?.userEmail 
    }
  });

  res.json({
    success: true,
    data: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore
    }
  });
});

/**
 * Búsqueda global en todas las colecciones
 */
export const globalSearchController = asyncHandler(async (req: Request, res: Response) => {
  const filters: SearchFilters = {
    query: req.query.query as string,
    status: req.query.status as string,
    eventType: req.query.eventType as string,
    instrument: req.query.instrument as string,
    dateFrom: req.query.dateFrom as string,
    dateTo: req.query.dateTo as string,
    location: req.query.location as string,
    userRole: req.query.userRole as string,
    limit: parseInt(req.query.limit as string) || 10,
    offset: parseInt(req.query.offset as string) || 0,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as 'asc' | 'desc'
  };

  logger.info('Búsqueda global iniciada', {
    metadata: { filters, userId: (req as any).user?.userEmail }
  });

  const result = await searchService.globalSearch(filters);

  logger.info('Búsqueda global completada', {
    metadata: { 
      totalEvents: result.events.length,
      totalRequests: result.requests.length,
      totalUsers: result.users.length,
      userId: (req as any).user?.userEmail 
    }
  });

  res.json({
    success: true,
    data: {
      events: result.events,
      requests: result.requests,
      users: result.users
    },
    summary: {
      totalEvents: result.events.length,
      totalRequests: result.requests.length,
      totalUsers: result.users.length
    }
  });
});

/**
 * Búsqueda por ubicación
 */
export const searchByLocationController = asyncHandler(async (req: Request, res: Response) => {
  const { location, radius } = req.query;
  const searchRadius = parseInt(radius as string) || 50;

  logger.info('Búsqueda por ubicación iniciada', {
    metadata: { 
      location, 
      radius: searchRadius,
      userId: (req as any).user?.userEmail 
    }
  });

  const result = await searchService.searchByLocation(location as string, searchRadius);

  logger.info('Búsqueda por ubicación completada', {
    metadata: { 
      totalEvents: result.events.length,
      totalRequests: result.requests.length,
      userId: (req as any).user?.userEmail 
    }
  });

  res.json({
    success: true,
    data: {
      events: result.events,
      requests: result.requests
    },
    location: {
      searchLocation: location,
      radius: searchRadius
    }
  });
});

/**
 * Búsqueda de eventos disponibles para músicos
 */
export const searchAvailableEventsForMusicianController = asyncHandler(async (req: Request, res: Response) => {
  const musicianId = (req as any).user?.userEmail;
  const filters: SearchFilters = {
    query: req.query.query as string,
    eventType: req.query.eventType as string,
    instrument: req.query.instrument as string,
    dateFrom: req.query.dateFrom as string,
    dateTo: req.query.dateTo as string,
    location: req.query.location as string,
    budget: req.query.budget ? {
      min: parseInt(req.query.budget as string),
      max: parseInt(req.query.budgetMax as string)
    } : undefined,
    limit: parseInt(req.query.limit as string) || 20,
    offset: parseInt(req.query.offset as string) || 0,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as 'asc' | 'desc'
  };

  logger.info('Búsqueda de eventos disponibles para músico iniciada', {
    metadata: { filters, musicianId }
  });

  const result = await searchService.searchAvailableEventsForMusician(musicianId, filters);

  logger.info('Búsqueda de eventos disponibles para músico completada', {
    metadata: { 
      totalResults: result.total,
      musicianId 
    }
  });

  res.json({
    success: true,
    data: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore
    }
  });
});

/**
 * Búsqueda de músicos disponibles para un evento
 */
export const searchAvailableMusiciansForEventController = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const filters: SearchFilters = {
    query: req.query.query as string,
    limit: parseInt(req.query.limit as string) || 20,
    offset: parseInt(req.query.offset as string) || 0,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as 'asc' | 'desc'
  };

  logger.info('Búsqueda de músicos disponibles para evento iniciada', {
    metadata: { filters, eventId, userId: (req as any).user?.userEmail }
  });

  const result = await searchService.searchAvailableMusiciansForEvent(eventId, filters);

  logger.info('Búsqueda de músicos disponibles para evento completada', {
    metadata: { 
      totalResults: result.total,
      eventId,
      userId: (req as any).user?.userEmail 
    }
  });

  res.json({
    success: true,
    data: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore
    }
  });
}); 