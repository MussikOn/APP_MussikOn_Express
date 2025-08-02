import { db } from '../utils/firebase';
import { logger } from './loggerService';

export interface MusicianStatus {
  id: string;
  musicianId: string;
  isOnline: boolean;
  lastSeen: string; // ISO string para compatibilidad con Firestore
  currentLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  availability: {
    isAvailable: boolean;
    availableFrom?: string; // ISO string para compatibilidad con Firestore
    availableTo?: string; // ISO string para compatibilidad con Firestore
    maxDistance?: number; // km
  };
  preferences: {
    eventTypes: string[];
    instruments: string[];
    minBudget: number;
    maxBudget: number;
  };
  performance: {
    rating: number;
    totalEvents: number;
    completedEvents: number;
    responseTime: number; // minutos promedio
  };
  createdAt: string; // ISO string para compatibilidad con Firestore
  updatedAt: string; // ISO string para compatibilidad con Firestore
}

export interface StatusUpdateData {
  isOnline?: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  availability?: {
    isAvailable: boolean;
    availableFrom?: string; // ISO string para compatibilidad con Firestore
    availableTo?: string; // ISO string para compatibilidad con Firestore
    maxDistance?: number;
  };
}

export class MusicianStatusService {
  private readonly COLLECTION = 'musician_status';
  private readonly HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutos
  private readonly OFFLINE_THRESHOLD = 10 * 60 * 1000; // 10 minutos

  /**
   * Actualizar estado del músico
   */
  async updateStatus(musicianId: string, data: StatusUpdateData): Promise<MusicianStatus> {
    try {
      console.log('[src/services/musicianStatusService.ts:45] Actualizando estado del músico:', musicianId);
      
      const now = new Date();
      const statusRef = db.collection(this.COLLECTION).doc(musicianId);
      
      const updateData: Partial<MusicianStatus> = {
        ...data,
        lastSeen: now.toISOString(),
        updatedAt: now.toISOString()
      };

      // Si es la primera vez, crear el documento
      const existingDoc = await statusRef.get();
      if (!existingDoc.exists) {
        const newStatus: MusicianStatus = {
          id: musicianId,
          musicianId,
          isOnline: data.isOnline ?? true,
          lastSeen: now.toISOString(),
          currentLocation: data.currentLocation,
          availability: {
            isAvailable: data.availability?.isAvailable ?? true,
            availableFrom: data.availability?.availableFrom,
            availableTo: data.availability?.availableTo,
            maxDistance: data.availability?.maxDistance ?? 50
          },
          preferences: {
            eventTypes: [],
            instruments: [],
            minBudget: 0,
            maxBudget: 10000
          },
          performance: {
            rating: 0,
            totalEvents: 0,
            completedEvents: 0,
            responseTime: 0
          },
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        };

        await statusRef.set(newStatus);
        logger.info('Estado de músico creado', { 
          metadata: { musicianId, status: newStatus }
        });
        return newStatus;
      }

      // Actualizar documento existente
      await statusRef.update(updateData);
      
      const updatedDoc = await statusRef.get();
      const updatedStatus = updatedDoc.data() as MusicianStatus;
      
      logger.info('Estado de músico actualizado', { 
        metadata: { musicianId, updates: updateData }
      });
      return updatedStatus;
    } catch (error) {
      logger.error('Error actualizando estado del músico', error as Error, { 
        metadata: { musicianId }
      });
      throw error;
    }
  }

  /**
   * Obtener estado actual del músico
   */
  async getStatus(musicianId: string): Promise<MusicianStatus | null> {
    try {
      console.log('[src/services/musicianStatusService.ts:95] Obteniendo estado del músico:', musicianId);
      
      const statusRef = db.collection(this.COLLECTION).doc(musicianId);
      const doc = await statusRef.get();
      
      if (!doc.exists) {
        return null;
      }

      const status = doc.data() as MusicianStatus;
      
      // Verificar si el músico está realmente online basado en lastSeen
      const lastSeenDate = new Date(status.lastSeen);
      const timeSinceLastSeen = Date.now() - lastSeenDate.getTime();
      if (timeSinceLastSeen > this.OFFLINE_THRESHOLD && status.isOnline) {
        // Actualizar automáticamente a offline
        await this.updateStatus(musicianId, { isOnline: false });
        status.isOnline = false;
      }

      return status;
    } catch (error) {
      logger.error('Error obteniendo estado del músico', error as Error, { 
        metadata: { musicianId }
      });
      throw error;
    }
  }

  /**
   * Obtener músicos online disponibles
   */
  async getOnlineMusicians(filters?: {
    location?: { latitude: number; longitude: number; radius: number };
    eventType?: string;
    instrument?: string;
    minBudget?: number;
    maxBudget?: number;
  }): Promise<MusicianStatus[]> {
    try {
      console.log('[src/services/musicianStatusService.ts:125] Buscando músicos online disponibles');
      
      let query = db.collection(this.COLLECTION)
        .where('isOnline', '==', true)
        .where('availability.isAvailable', '==', true);

      const snapshot = await query.get();
      let musicians = snapshot.docs.map(doc => doc.data() as MusicianStatus);

      // Aplicar filtros adicionales
      if (filters) {
        musicians = this.applyFilters(musicians, filters);
      }

      // Ordenar por rating y tiempo de respuesta
      musicians.sort((a, b) => {
        const scoreA = (a.performance.rating * 0.7) + ((100 - a.performance.responseTime) * 0.3);
        const scoreB = (b.performance.rating * 0.7) + ((100 - b.performance.responseTime) * 0.3);
        return scoreB - scoreA;
      });

      logger.info('Músicos online encontrados', { 
        metadata: { count: musicians.length }
      });
      return musicians;
    } catch (error) {
      logger.error('Error obteniendo músicos online', error as Error);
      throw error;
    }
  }

  /**
   * Heartbeat para mantener estado online
   */
  async heartbeat(musicianId: string, location?: { latitude: number; longitude: number }): Promise<void> {
    try {
      console.log('[src/services/musicianStatusService.ts:155] Heartbeat del músico:', musicianId);
      
      const updateData: StatusUpdateData = {
        isOnline: true
      };

      if (location) {
        updateData.currentLocation = location;
      }

      await this.updateStatus(musicianId, updateData);
    } catch (error) {
      logger.error('Error en heartbeat del músico', error as Error, { 
        metadata: { musicianId }
      });
      throw error;
    }
  }

  /**
   * Marcar músico como offline
   */
  async setOffline(musicianId: string): Promise<void> {
    try {
      console.log('[src/services/musicianStatusService.ts:175] Marcando músico como offline:', musicianId);
      
      await this.updateStatus(musicianId, { isOnline: false });
    } catch (error) {
      logger.error('Error marcando músico como offline', error as Error, { 
        metadata: { musicianId }
      });
      throw error;
    }
  }

  /**
   * Actualizar preferencias del músico
   */
  async updatePreferences(
    musicianId: string, 
    preferences: Partial<MusicianStatus['preferences']>
  ): Promise<MusicianStatus> {
    try {
      console.log('[src/services/musicianStatusService.ts:190] Actualizando preferencias del músico:', musicianId);
      
      const statusRef = db.collection(this.COLLECTION).doc(musicianId);
      const doc = await statusRef.get();
      
      if (!doc.exists) {
        throw new Error('Estado del músico no encontrado');
      }

      const currentStatus = doc.data() as MusicianStatus;
      const updatedPreferences = { ...currentStatus.preferences, ...preferences };

      await statusRef.update({
        preferences: updatedPreferences,
        updatedAt: new Date().toISOString()
      });

      const updatedDoc = await statusRef.get();
      return updatedDoc.data() as MusicianStatus;
    } catch (error) {
      logger.error('Error actualizando preferencias del músico', error as Error, { 
        metadata: { musicianId }
      });
      throw error;
    }
  }

  /**
   * Actualizar métricas de rendimiento
   */
  async updatePerformance(
    musicianId: string,
    performance: Partial<MusicianStatus['performance']>
  ): Promise<MusicianStatus> {
    try {
      console.log('[src/services/musicianStatusService.ts:220] Actualizando rendimiento del músico:', musicianId);
      
      const statusRef = db.collection(this.COLLECTION).doc(musicianId);
      const doc = await statusRef.get();
      
      if (!doc.exists) {
        throw new Error('Estado del músico no encontrado');
      }

      const currentStatus = doc.data() as MusicianStatus;
      const updatedPerformance = { ...currentStatus.performance, ...performance };

      await statusRef.update({
        performance: updatedPerformance,
        updatedAt: new Date().toISOString()
      });

      const updatedDoc = await statusRef.get();
      return updatedDoc.data() as MusicianStatus;
    } catch (error) {
      logger.error('Error actualizando rendimiento del músico', error as Error, { 
        metadata: { musicianId }
      });
      throw error;
    }
  }

  /**
   * Limpiar estados offline antiguos
   */
  async cleanupOfflineStatuses(): Promise<number> {
    try {
      console.log('[src/services/musicianStatusService.ts:250] Limpiando estados offline antiguos');
      
      const cutoffTime = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 24 horas
      
      const query = db.collection(this.COLLECTION)
        .where('isOnline', '==', false)
        .where('lastSeen', '<', cutoffTime);

      const snapshot = await query.get();
      const batch = db.batch();
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
      const deletedCount = snapshot.docs.length;
      logger.info('Estados offline limpiados', { 
        metadata: { deletedCount }
      });
      
      return deletedCount;
    } catch (error) {
      logger.error('Error limpiando estados offline', error as Error);
      throw error;
    }
  }

  /**
   * Aplicar filtros a la lista de músicos
   */
  private applyFilters(musicians: MusicianStatus[], filters: any): MusicianStatus[] {
    return musicians.filter(musician => {
      // Filtro por tipo de evento
      if (filters.eventType && !musician.preferences.eventTypes.includes(filters.eventType)) {
        return false;
      }

      // Filtro por instrumento
      if (filters.instrument && !musician.preferences.instruments.includes(filters.instrument)) {
        return false;
      }

      // Filtro por presupuesto
      if (filters.minBudget && musician.preferences.maxBudget < filters.minBudget) {
        return false;
      }
      if (filters.maxBudget && musician.preferences.minBudget > filters.maxBudget) {
        return false;
      }

      // Filtro por ubicación
      if (filters.location && musician.currentLocation) {
        const distance = this.calculateDistance(
          filters.location.latitude,
          filters.location.longitude,
          musician.currentLocation.latitude,
          musician.currentLocation.longitude
        );
        
        if (distance > filters.location.radius) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Calcular distancia entre dos puntos (fórmula de Haversine)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
} 