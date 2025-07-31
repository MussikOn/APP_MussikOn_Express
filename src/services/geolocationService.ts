import { db } from '../utils/firebase';
import { logger } from './loggerService';

// Interfaces para geolocalización
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  type: 'event' | 'user' | 'venue';
  metadata?: Record<string, any>;
}

export interface GeoSearchFilters {
  radius: number; // en kilómetros
  type?: string;
  limit?: number;
}

export interface RouteOptimization {
  waypoints: Coordinates[];
  mode: 'driving' | 'walking' | 'bicycling' | 'transit';
  avoid?: string[];
}

export interface RouteResult {
  distance: number; // en kilómetros
  duration: number; // en minutos
  polyline: string;
  waypoints: Coordinates[];
}

export class GeolocationService {
  private readonly earthRadius = 6371; // Radio de la Tierra en kilómetros

  /**
   * Calcular distancia entre dos puntos usando la fórmula de Haversine
   */
  calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const lat1 = this.toRadians(point1.latitude);
    const lon1 = this.toRadians(point1.longitude);
    const lat2 = this.toRadians(point2.latitude);
    const lon2 = this.toRadians(point2.longitude);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.earthRadius * c;
  }

  /**
   * Convertir grados a radianes
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Verificar si un punto está dentro del radio especificado
   */
  isWithinRadius(center: Coordinates, point: Coordinates, radius: number): boolean {
    const distance = this.calculateDistance(center, point);
    return distance <= radius;
  }

  /**
   * Buscar ubicaciones por proximidad
   */
  async searchByProximity(center: Coordinates, filters: GeoSearchFilters): Promise<Location[]> {
    try {
      logger.info('Buscando ubicaciones por proximidad', { metadata: { filters } });

      // En una implementación real, usarías índices geoespaciales
      // Por ahora, simulamos la búsqueda
      const snapshot = await db.collection('locations')
        .where('type', '==', filters.type || 'event')
        .limit(filters.limit || 50)
        .get();

      const locations: Location[] = [];
      snapshot.forEach((doc: any) => {
        const location = { id: doc.id, ...doc.data() };
        if (this.isWithinRadius(center, location.coordinates, filters.radius)) {
          locations.push(location);
        }
      });

      logger.info('Búsqueda por proximidad completada', { metadata: { total: locations.length } });

      return locations;
    } catch (error) {
      logger.error('Error en búsqueda por proximidad', error as Error, { metadata: { center, filters } });
      throw error;
    }
  }

  /**
   * Encontrar eventos cercanos
   */
  async findNearbyEvents(center: Coordinates, radius: number, limit: number = 20): Promise<any[]> {
    try {
      logger.info('Buscando eventos cercanos', { metadata: { center, radius } });

      const snapshot = await db.collection('events')
        .where('status', '==', 'active')
        .limit(limit)
        .get();

      const events: any[] = [];
      snapshot.forEach((doc: any) => {
        const event = { id: doc.id, ...doc.data() };
        if (event.location?.coordinates && this.isWithinRadius(center, event.location.coordinates, radius)) {
          events.push({
            ...event,
            distance: this.calculateDistance(center, event.location.coordinates)
          });
        }
      });

      // Ordenar por distancia
      events.sort((a, b) => a.distance - b.distance);

      logger.info('Eventos cercanos encontrados', { metadata: { total: events.length } });

      return events;
    } catch (error) {
      logger.error('Error buscando eventos cercanos', error as Error, { metadata: { center, radius } });
      throw error;
    }
  }

  /**
   * Encontrar músicos cercanos
   */
  async findNearbyMusicians(center: Coordinates, radius: number, limit: number = 20): Promise<any[]> {
    try {
      logger.info('Buscando músicos cercanos', { metadata: { center, radius } });

      const snapshot = await db.collection('users')
        .where('roll', '==', 'musician')
        .where('status', '==', true)
        .limit(limit)
        .get();

      const musicians: any[] = [];
      snapshot.forEach((doc: any) => {
        const musician = { id: doc.id, ...doc.data() };
        if (musician.location?.coordinates && this.isWithinRadius(center, musician.location.coordinates, radius)) {
          musicians.push({
            ...musician,
            distance: this.calculateDistance(center, musician.location.coordinates)
          });
        }
      });

      // Ordenar por distancia
      musicians.sort((a, b) => a.distance - b.distance);

      logger.info('Músicos cercanos encontrados', { metadata: { total: musicians.length } });

      return musicians;
    } catch (error) {
      logger.error('Error buscando músicos cercanos', error as Error, { metadata: { center, radius } });
      throw error;
    }
  }

  /**
   * Optimizar ruta entre múltiples puntos
   */
  async optimizeRoute(routeData: RouteOptimization): Promise<RouteResult> {
    try {
      logger.info('Optimizando ruta', { metadata: { routeData } });

      // En producción, esto se integraría con Google Maps Directions API
      // Por ahora, simulamos la optimización
      let totalDistance = 0;
      let totalDuration = 0;

      for (let i = 0; i < routeData.waypoints.length - 1; i++) {
        const distance = this.calculateDistance(
          routeData.waypoints[i],
          routeData.waypoints[i + 1]
        );
        totalDistance += distance;
        
        // Estimación de tiempo basada en el modo de transporte
        const speed = this.getAverageSpeed(routeData.mode);
        totalDuration += (distance / speed) * 60; // Convertir a minutos
      }

      const result: RouteResult = {
        distance: totalDistance,
        duration: totalDuration,
        polyline: this.generatePolyline(routeData.waypoints),
        waypoints: routeData.waypoints
      };

      logger.info('Ruta optimizada', { metadata: { result } });

      return result;
    } catch (error) {
      logger.error('Error optimizando ruta', error as Error, { metadata: { routeData } });
      throw error;
    }
  }

  /**
   * Obtener velocidad promedio según el modo de transporte
   */
  private getAverageSpeed(mode: string): number {
    switch (mode) {
      case 'driving': return 50; // km/h
      case 'walking': return 5; // km/h
      case 'bicycling': return 15; // km/h
      case 'transit': return 25; // km/h
      default: return 30; // km/h
    }
  }

  /**
   * Generar polyline (simulado)
   */
  private generatePolyline(waypoints: Coordinates[]): string {
    // En producción, esto generaría un polyline real
    return waypoints.map(point => `${point.latitude},${point.longitude}`).join('|');
  }

  /**
   * Estimar tiempo de viaje
   */
  async estimateTravelTime(origin: Coordinates, destination: Coordinates, mode: string = 'driving'): Promise<number> {
    try {
      const distance = this.calculateDistance(origin, destination);
      const speed = this.getAverageSpeed(mode);
      return (distance / speed) * 60; // Retornar en minutos
    } catch (error) {
      logger.error('Error estimando tiempo de viaje', error as Error, { metadata: { origin, destination, mode } });
      throw error;
    }
  }

  /**
   * Calcular costo de combustible
   */
  async calculateFuelCost(distance: number, fuelPrice: number = 1.2): Promise<number> {
    try {
      const fuelEfficiency = 8; // km/l
      const fuelConsumption = distance / fuelEfficiency;
      return fuelConsumption * fuelPrice;
    } catch (error) {
      logger.error('Error calculando costo de combustible', error as Error, { metadata: { distance, fuelPrice } });
      throw error;
    }
  }

  /**
   * Geocodificar dirección
   */
  async geocodeAddress(address: string, country?: string): Promise<Coordinates | null> {
    try {
      logger.info('Geocodificando dirección', { metadata: { address, country } });

      // En producción, esto se integraría con Google Geocoding API
      // Por ahora, simulamos la geocodificación
      const mockCoordinates: Record<string, Coordinates> = {
        'Madrid, Spain': { latitude: 40.4168, longitude: -3.7038 },
        'Barcelona, Spain': { latitude: 41.3851, longitude: 2.1734 },
        'Valencia, Spain': { latitude: 39.4699, longitude: -0.3763 },
        'Sevilla, Spain': { latitude: 37.3891, longitude: -5.9845 },
        'Zaragoza, Spain': { latitude: 41.6488, longitude: -0.8891 }
      };

      const key = country ? `${address}, ${country}` : address;
      const coordinates = mockCoordinates[key];

      if (coordinates) {
        logger.info('Dirección geocodificada', { metadata: { address, coordinates } });
        return coordinates;
      }

      logger.warn('Dirección no encontrada', { metadata: { address } });
      return null;
    } catch (error) {
      logger.error('Error geocodificando dirección', error as Error, { metadata: { address, country } });
      throw error;
    }
  }

  /**
   * Geocodificación inversa
   */
  async reverseGeocode(coordinates: Coordinates): Promise<string | null> {
    try {
      logger.info('Geocodificación inversa', { metadata: { coordinates } });

      // En producción, esto se integraría con Google Reverse Geocoding API
      // Por ahora, simulamos la geocodificación inversa
      const mockAddresses: Record<string, string> = {
        '40.4168,-3.7038': 'Madrid, Spain',
        '41.3851,2.1734': 'Barcelona, Spain',
        '39.4699,-0.3763': 'Valencia, Spain',
        '37.3891,-5.9845': 'Sevilla, Spain',
        '41.6488,-0.8891': 'Zaragoza, Spain'
      };

      const key = `${coordinates.latitude},${coordinates.longitude}`;
      const address = mockAddresses[key];

      if (address) {
        logger.info('Coordenadas geocodificadas', { metadata: { coordinates, address } });
        return address;
      }

      logger.warn('Coordenadas no encontradas', { metadata: { coordinates } });
      return null;
    } catch (error) {
      logger.error('Error en geocodificación inversa', error as Error, { metadata: { coordinates } });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de ubicación
   */
  async getLocationStats(center: Coordinates, radius: number): Promise<any> {
    try {
      logger.info('Obteniendo estadísticas de ubicación', { metadata: { center, radius } });

      const [events, musicians, venues] = await Promise.all([
        this.findNearbyEvents(center, radius),
        this.findNearbyMusicians(center, radius),
        this.searchByProximity(center, { radius, type: 'venue', limit: 100 })
      ]);

      const stats = {
        totalEvents: events.length,
        totalMusicians: musicians.length,
        totalVenues: venues.length,
        averageEventDistance: events.length > 0 
          ? events.reduce((sum, event) => sum + event.distance, 0) / events.length 
          : 0,
        averageMusicianDistance: musicians.length > 0 
          ? musicians.reduce((sum, musician) => sum + musician.distance, 0) / musicians.length 
          : 0,
        density: {
          events: events.length / (Math.PI * radius * radius),
          musicians: musicians.length / (Math.PI * radius * radius),
          venues: venues.length / (Math.PI * radius * radius)
        }
      };

      logger.info('Estadísticas de ubicación obtenidas', { metadata: { stats } });

      return stats;
    } catch (error) {
      logger.error('Error obteniendo estadísticas de ubicación', error as Error, { metadata: { center, radius } });
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const geolocationService = new GeolocationService(); 