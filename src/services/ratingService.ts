import { db } from '../utils/firebase';
import { logger } from './loggerService';
import { FieldValue } from 'firebase-admin/firestore';

export interface Rating {
  id: string;
  eventId: string;
  musicianId: string;
  eventCreatorId: string;
  rating: number; // 1-5 estrellas
  review?: string;
  category: 'musician' | 'event_creator';
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean; // Solo ratings de eventos completados
  helpfulCount: number;
  reportedCount: number;
  isActive: boolean;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: Record<number, number>; // 1-5 estrellas
  recentRatings: Rating[];
  verifiedRatings: number;
  responseRate: number; // Porcentaje de eventos con respuesta
}

export interface RatingFilters {
  minRating?: number;
  maxRating?: number;
  category?: 'musician' | 'event_creator';
  isVerified?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  eventType?: string;
}

export class RatingService {
  private readonly collection = 'ratings';

  /**
   * Crear un nuevo rating
   */
  async createRating(data: Omit<Rating, 'id' | 'createdAt' | 'updatedAt' | 'helpfulCount' | 'reportedCount' | 'isActive'>): Promise<Rating> {
    try {
      logger.info('RatingService: Creando nuevo rating', {
        metadata: {
          eventId: data.eventId,
          musicianId: data.musicianId,
          category: data.category,
          context: 'rating'
        }
      });

      // Validar que el rating esté entre 1-5
      if (data.rating < 1 || data.rating > 5) {
        throw new Error('El rating debe estar entre 1 y 5 estrellas');
      }

      // Verificar que no exista un rating duplicado
      const existingRating = await this.getRatingByEventAndUser(data.eventId, data.musicianId, data.eventCreatorId);
      if (existingRating) {
        throw new Error('Ya existe un rating para este evento y usuario');
      }

      const now = new Date();
      const rating: Rating = {
        ...data,
        id: db.collection(this.collection).doc().id,
        createdAt: now,
        updatedAt: now,
        helpfulCount: 0,
        reportedCount: 0,
        isActive: true
      };

      await db.collection(this.collection).doc(rating.id).set(rating);

      // Actualizar estadísticas del usuario
      await this.updateUserRatingStats(data.musicianId, data.category);

      logger.info('RatingService: Rating creado exitosamente', {
        metadata: {
          ratingId: rating.id,
          context: 'rating'
        }
      });

      return rating;
    } catch (error) {
      logger.error('RatingService: Error al crear rating', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          eventId: data.eventId,
          musicianId: data.musicianId,
          category: data.category
        }
      });
      throw error;
    }
  }

  /**
   * Obtener rating por ID
   */
  async getRatingById(ratingId: string): Promise<Rating | null> {
    try {
      const doc = await db.collection(this.collection).doc(ratingId).get();
      return doc.exists ? (doc.data() as Rating) : null;
    } catch (error) {
      logger.error('RatingService: Error al obtener rating por ID', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          ratingId
        }
      });
      throw error;
    }
  }

  /**
   * Obtener rating por evento y usuario
   */
  async getRatingByEventAndUser(eventId: string, musicianId: string, eventCreatorId: string): Promise<Rating | null> {
    try {
      const snapshot = await db.collection(this.collection)
        .where('eventId', '==', eventId)
        .where('musicianId', '==', musicianId)
        .where('eventCreatorId', '==', eventCreatorId)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      return snapshot.empty ? null : (snapshot.docs[0].data() as Rating);
    } catch (error) {
      logger.error('RatingService: Error al obtener rating por evento y usuario', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          eventId,
          musicianId,
          eventCreatorId
        }
      });
      throw error;
    }
  }

  /**
   * Obtener ratings de un usuario
   */
  async getUserRatings(userId: string, category: 'musician' | 'event_creator', filters?: RatingFilters): Promise<Rating[]> {
    try {
      let query = db.collection(this.collection)
        .where('isActive', '==', true);

      if (category === 'musician') {
        query = query.where('musicianId', '==', userId);
      } else {
        query = query.where('eventCreatorId', '==', userId);
      }

      query = query.where('category', '==', category);

      // Aplicar filtros adicionales
      if (filters?.minRating) {
        query = query.where('rating', '>=', filters.minRating);
      }
      if (filters?.maxRating) {
        query = query.where('rating', '<=', filters.maxRating);
      }
      if (filters?.isVerified !== undefined) {
        query = query.where('isVerified', '==', filters.isVerified);
      }
      if (filters?.dateFrom) {
        query = query.where('createdAt', '>=', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.where('createdAt', '<=', filters.dateTo);
      }

      query = query.orderBy('createdAt', 'desc');

      const snapshot = await query.get();
      return snapshot.docs.map(doc => doc.data() as Rating);
    } catch (error) {
      logger.error('RatingService: Error al obtener ratings de usuario', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          userId,
          category
        }
      });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de rating de un usuario
   */
  async getUserRatingStats(userId: string, category: 'musician' | 'event_creator'): Promise<RatingStats> {
    try {
      const ratings = await this.getUserRatings(userId, category);

      if (ratings.length === 0) {
        return {
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          recentRatings: [],
          verifiedRatings: 0,
          responseRate: 0
        };
      }

      // Calcular promedio
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = totalRating / ratings.length;

      // Calcular distribución
      const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach(rating => {
        ratingDistribution[rating.rating]++;
      });

      // Ratings recientes (últimos 10)
      const recentRatings = ratings.slice(0, 10);

      // Ratings verificados
      const verifiedRatings = ratings.filter(rating => rating.isVerified).length;

      // Calcular tasa de respuesta (eventos con rating vs total de eventos)
      const responseRate = await this.calculateResponseRate(userId, category);

      return {
        averageRating: Math.round(averageRating * 100) / 100, // Redondear a 2 decimales
        totalRatings: ratings.length,
        ratingDistribution,
        recentRatings,
        verifiedRatings,
        responseRate
      };
    } catch (error) {
      logger.error('RatingService: Error al obtener estadísticas de rating', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          userId,
          category
        }
      });
      throw error;
    }
  }

  /**
   * Actualizar rating
   */
  async updateRating(ratingId: string, updates: Partial<Pick<Rating, 'rating' | 'review' | 'isActive'>>): Promise<Rating> {
    try {
      logger.info('RatingService: Actualizando rating', {
        metadata: {
          ratingId,
          context: 'rating'
        }
      });

      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await db.collection(this.collection).doc(ratingId).update(updateData);

      const updatedRating = await this.getRatingById(ratingId);
      if (!updatedRating) {
        throw new Error('Rating no encontrado después de la actualización');
      }

      // Actualizar estadísticas del usuario
      await this.updateUserRatingStats(updatedRating.musicianId, updatedRating.category);

      logger.info('RatingService: Rating actualizado exitosamente', {
        metadata: {
          ratingId,
          context: 'rating'
        }
      });

      return updatedRating;
    } catch (error) {
      logger.error('RatingService: Error al actualizar rating', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          ratingId
        }
      });
      throw error;
    }
  }

  /**
   * Marcar rating como útil
   */
  async markRatingAsHelpful(ratingId: string): Promise<void> {
    try {
      await db.collection(this.collection).doc(ratingId).update({
        helpfulCount: FieldValue.increment(1),
        updatedAt: new Date()
      });
    } catch (error) {
      logger.error('RatingService: Error al marcar rating como útil', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          ratingId
        }
      });
      throw error;
    }
  }

  /**
   * Reportar rating
   */
  async reportRating(ratingId: string, reason: string): Promise<void> {
    try {
      logger.warn('RatingService: Rating reportado', {
        metadata: {
          ratingId,
          reason,
          context: 'rating'
        }
      });

      await db.collection(this.collection).doc(ratingId).update({
        reportedCount: FieldValue.increment(1),
        updatedAt: new Date()
      });

      // Si el rating tiene más de 5 reportes, desactivarlo automáticamente
      const rating = await this.getRatingById(ratingId);
      if (rating && rating.reportedCount >= 5) {
        await this.updateRating(ratingId, { isActive: false });
        logger.warn('RatingService: Rating desactivado por múltiples reportes', {
          metadata: {
            ratingId,
            reportedCount: rating.reportedCount,
            context: 'rating'
          }
        });
      }
    } catch (error) {
      logger.error('RatingService: Error al reportar rating', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          ratingId,
          reason
        }
      });
      throw error;
    }
  }

  /**
   * Obtener ratings más útiles
   */
  async getMostHelpfulRatings(userId: string, category: 'musician' | 'event_creator', limit: number = 5): Promise<Rating[]> {
    try {
      let query = db.collection(this.collection)
        .where('isActive', '==', true);

      if (category === 'musician') {
        query = query.where('musicianId', '==', userId);
      } else {
        query = query.where('eventCreatorId', '==', userId);
      }

      query = query.where('category', '==', category);
      query = query.orderBy('helpfulCount', 'desc');
      query = query.limit(limit);

      const snapshot = await query.get();
      return snapshot.docs.map(doc => doc.data() as Rating);
    } catch (error) {
      logger.error('RatingService: Error al obtener ratings más útiles', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          userId,
          category
        }
      });
      throw error;
    }
  }

  /**
   * Obtener ratings por evento
   */
  async getEventRatings(eventId: string): Promise<Rating[]> {
    try {
      const snapshot = await db.collection(this.collection)
        .where('eventId', '==', eventId)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => doc.data() as Rating);
    } catch (error) {
      logger.error('RatingService: Error al obtener ratings del evento', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          eventId
        }
      });
      throw error;
    }
  }

  /**
   * Calcular tasa de respuesta
   */
  private async calculateResponseRate(userId: string, category: 'musician' | 'event_creator'): Promise<number> {
    try {
      // Obtener total de eventos del usuario
      let eventsQuery = db.collection('events') as any;
      if (category === 'musician') {
        eventsQuery = eventsQuery.where('assignedMusicianId', '==', userId);
      } else {
        eventsQuery = eventsQuery.where('user', '==', userId);
      }
      eventsQuery = eventsQuery.where('status', '==', 'completed');

      const eventsSnapshot = await eventsQuery.get();
      const totalEvents = eventsSnapshot.size;

      if (totalEvents === 0) {
        return 0;
      }

      // Obtener eventos con ratings
      const ratings = await this.getUserRatings(userId, category);
      const eventsWithRatings = new Set(ratings.map(rating => rating.eventId)).size;

      return Math.round((eventsWithRatings / totalEvents) * 100);
    } catch (error) {
      logger.error('RatingService: Error al calcular tasa de respuesta', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          userId,
          category
        }
      });
      return 0;
    }
  }

  /**
   * Actualizar estadísticas de rating del usuario
   */
  private async updateUserRatingStats(userId: string, category: 'musician' | 'event_creator'): Promise<void> {
    try {
      const stats = await this.getUserRatingStats(userId, category);
      
      const userDoc = db.collection('users').doc(userId);
      const updateData: any = {};

      if (category === 'musician') {
        updateData.musicianRatingStats = stats;
      } else {
        updateData.eventCreatorRatingStats = stats;
      }

      await userDoc.update(updateData);
    } catch (error) {
      logger.error('RatingService: Error al actualizar estadísticas de usuario', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          userId,
          category
        }
      });
    }
  }

  /**
   * Obtener top músicos por rating
   */
  async getTopRatedMusicians(limit: number = 10, minRatings: number = 5): Promise<Array<{ userId: string; stats: RatingStats }>> {
    try {
      // Obtener todos los usuarios músicos
      const usersSnapshot = await db.collection('users')
        .where('roll', '==', 'musico')
        .where('isApproved', '==', true)
        .get();

      const musicians = usersSnapshot.docs.map(doc => doc.data());

      // Obtener estadísticas de rating para cada músico
      const musiciansWithStats = await Promise.all(
        musicians.map(async (musician) => {
          const stats = await this.getUserRatingStats(musician.id, 'musician');
          return {
            userId: musician.id,
            stats
          };
        })
      );

      // Filtrar por mínimo de ratings y ordenar por rating promedio
      return musiciansWithStats
        .filter(musician => musician.stats.totalRatings >= minRatings)
        .sort((a, b) => b.stats.averageRating - a.stats.averageRating)
        .slice(0, limit);
    } catch (error) {
      logger.error('RatingService: Error al obtener top músicos', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          limit,
          minRatings
        }
      });
      throw error;
    }
  }

  /**
   * Obtener análisis de tendencias de rating
   */
  async getRatingTrends(days: number = 30): Promise<{
    averageRatingByDay: Record<string, number>;
    totalRatingsByDay: Record<string, number>;
    categoryDistribution: Record<string, number>;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const snapshot = await db.collection(this.collection)
        .where('createdAt', '>=', startDate)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'asc')
        .get();

      const ratings = snapshot.docs.map(doc => doc.data() as Rating);

      const averageRatingByDay: Record<string, number> = {};
      const totalRatingsByDay: Record<string, number> = {};
      const categoryDistribution: Record<string, number> = {};

      // Agrupar por día
      ratings.forEach(rating => {
        const date = rating.createdAt.toDateString();
        
        if (!averageRatingByDay[date]) {
          averageRatingByDay[date] = 0;
          totalRatingsByDay[date] = 0;
        }

        averageRatingByDay[date] += rating.rating;
        totalRatingsByDay[date]++;

        // Distribución por categoría
        categoryDistribution[rating.category] = (categoryDistribution[rating.category] || 0) + 1;
      });

      // Calcular promedios
      Object.keys(averageRatingByDay).forEach(date => {
        averageRatingByDay[date] = Math.round((averageRatingByDay[date] / totalRatingsByDay[date]) * 100) / 100;
      });

      return {
        averageRatingByDay,
        totalRatingsByDay,
        categoryDistribution
      };
    } catch (error) {
      logger.error('RatingService: Error al obtener tendencias de rating', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          days
        }
      });
      throw error;
    }
  }
}

export const ratingService = new RatingService(); 