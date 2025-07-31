import { Request, Response } from 'express';
import { geolocationService, GeoSearchFilters, RouteOptimization, Coordinates } from '../services/geolocationService';
import { logger } from '../services/loggerService';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Buscar ubicaciones por proximidad
 */
export const searchByProximityController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { lat, lng, radius, type, limit } = req.query;

  const center: Coordinates = {
    latitude: parseFloat(lat as string),
    longitude: parseFloat(lng as string)
  };

  const filters: GeoSearchFilters = {
    radius: parseFloat(radius as string),
    type: type as string,
    limit: limit ? parseInt(limit as string) : 20
  };

  const locations = await geolocationService.searchByProximity(center, filters);

  logger.info('Búsqueda por proximidad completada', {
    userId: req.user?.userId,
    metadata: { filters, results: locations.length }
  });

  res.status(200).json({
    success: true,
    data: {
      locations,
      filters,
      total: locations.length
    }
  });
});

/**
 * Buscar eventos cercanos
 */
export const findNearbyEventsController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { lat, lng, radius, limit } = req.query;

  const center: Coordinates = {
    latitude: parseFloat(lat as string),
    longitude: parseFloat(lng as string)
  };

  const events = await geolocationService.findNearbyEvents(
    center, 
    parseFloat(radius as string), 
    limit ? parseInt(limit as string) : 20
  );

  logger.info('Eventos cercanos encontrados', {
    userId: req.user?.userId,
    metadata: { center, radius, results: events.length }
  });

  res.status(200).json({
    success: true,
    data: {
      events,
      center,
      radius: parseFloat(radius as string),
      total: events.length
    }
  });
});

/**
 * Buscar músicos cercanos
 */
export const findNearbyMusiciansController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { lat, lng, radius, limit } = req.query;

  const center: Coordinates = {
    latitude: parseFloat(lat as string),
    longitude: parseFloat(lng as string)
  };

  const musicians = await geolocationService.findNearbyMusicians(
    center, 
    parseFloat(radius as string), 
    limit ? parseInt(limit as string) : 20
  );

  logger.info('Músicos cercanos encontrados', {
    userId: req.user?.userId,
    metadata: { center, radius, results: musicians.length }
  });

  res.status(200).json({
    success: true,
    data: {
      musicians,
      center,
      radius: parseFloat(radius as string),
      total: musicians.length
    }
  });
});

/**
 * Optimizar ruta
 */
export const optimizeRouteController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { waypoints, mode, avoid } = req.body;

  const routeData: RouteOptimization = {
    waypoints: waypoints.map((point: any) => ({
      latitude: point.latitude || point.lat,
      longitude: point.longitude || point.lng
    })),
    mode: mode || 'driving',
    avoid: avoid || []
  };

  const route = await geolocationService.optimizeRoute(routeData);

  logger.info('Ruta optimizada', {
    userId: req.user?.userId,
    metadata: { routeData, result: route }
  });

  res.status(200).json({
    success: true,
    data: route
  });
});

/**
 * Geocodificar dirección
 */
export const geocodeAddressController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { address, country } = req.body;

  const coordinates = await geolocationService.geocodeAddress(address, country);

  logger.info('Dirección geocodificada', {
    userId: req.user?.userId,
    metadata: { address, country, coordinates }
  });

  res.status(200).json({
    success: true,
    data: coordinates
  });
});

/**
 * Geocodificación inversa
 */
export const reverseGeocodeController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { lat, lng } = req.query;

  const coordinates: Coordinates = {
    latitude: parseFloat(lat as string),
    longitude: parseFloat(lng as string)
  };

  const address = await geolocationService.reverseGeocode(coordinates);

  logger.info('Geocodificación inversa completada', {
    userId: req.user?.userId,
    metadata: { coordinates, address }
  });

  res.status(200).json({
    success: true,
    data: address
  });
});

/**
 * Calcular distancia entre dos puntos
 */
export const calculateDistanceController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { lat1, lng1, lat2, lng2 } = req.query;

  const point1: Coordinates = {
    latitude: parseFloat(lat1 as string),
    longitude: parseFloat(lng1 as string)
  };

  const point2: Coordinates = {
    latitude: parseFloat(lat2 as string),
    longitude: parseFloat(lng2 as string)
  };

  const distance = geolocationService.calculateDistance(point1, point2);

  logger.info('Distancia calculada', {
    userId: req.user?.userId,
    metadata: { point1, point2, distance }
  });

  res.status(200).json({
    success: true,
    data: {
      distance,
      unit: 'km'
    }
  });
});

/**
 * Obtener estadísticas de ubicación
 */
export const getLocationStatsController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { lat, lng, radius } = req.query;

  const center: Coordinates = {
    latitude: parseFloat(lat as string),
    longitude: parseFloat(lng as string)
  };

  const stats = await geolocationService.getLocationStats(center, parseFloat(radius as string));

  logger.info('Estadísticas de ubicación obtenidas', {
    userId: req.user?.userId,
    metadata: { center, radius, stats }
  });

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * Verificar si un punto está dentro del radio
 */
export const isWithinRadiusController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { centerLat, centerLng, pointLat, pointLng, radius } = req.query;

  const center: Coordinates = {
    latitude: parseFloat(centerLat as string),
    longitude: parseFloat(centerLng as string)
  };

  const point: Coordinates = {
    latitude: parseFloat(pointLat as string),
    longitude: parseFloat(pointLng as string)
  };

  const isWithin = geolocationService.isWithinRadius(center, point, parseFloat(radius as string));

  logger.info('Verificación de radio completada', {
    userId: req.user?.userId,
    metadata: { center, point, radius, isWithin }
  });

  res.status(200).json({
    success: true,
    data: {
      isWithin,
      distance: geolocationService.calculateDistance(center, point),
      radius: parseFloat(radius as string)
    }
  });
}); 
