import { Request, Response } from 'express';
import { ratingService } from '../services/ratingService';
import { logger } from '../services/loggerService';

export class RatingController {
  /**
   * Crear un nuevo rating
   */
  async createRating(req: Request, res: Response): Promise<void> {
    try {
      const { eventId, musicianId, rating, review, category } = req.body;
      const eventCreatorId = req.user?.id;

      if (!eventCreatorId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Validaciones
      if (!eventId || !musicianId || !rating || !category) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: eventId, musicianId, rating, category'
        });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          message: 'El rating debe estar entre 1 y 5 estrellas'
        });
        return;
      }

      if (category !== 'musician' && category !== 'event_creator') {
        res.status(400).json({
          success: false,
          message: 'Categoría debe ser "musician" o "event_creator"'
        });
        return;
      }

      const newRating = await ratingService.createRating({
        eventId,
        musicianId,
        eventCreatorId,
        rating,
        review,
        category,
        isVerified: false // Se verificará cuando el evento esté completado
      });

      logger.info('RatingController: Rating creado exitosamente', {
        metadata: {
          ratingId: newRating.id,
          eventId,
          musicianId,
          category
        }
      });

      res.status(201).json({
        success: true,
        message: 'Rating creado exitosamente',
        rating: newRating
      });
    } catch (error) {
      logger.error('RatingController: Error al crear rating', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          context: 'rating'
        }
      });

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener ratings de un usuario
   */
  async getUserRatings(req: Request, res: Response): Promise<void> {
    try {
      const { userId, category } = req.params;
      const { minRating, maxRating, isVerified, dateFrom, dateTo } = req.query;

      if (!userId || !category) {
        res.status(400).json({
          success: false,
          message: 'Faltan parámetros requeridos: userId, category'
        });
        return;
      }

      if (category !== 'musician' && category !== 'event_creator') {
        res.status(400).json({
          success: false,
          message: 'Categoría debe ser "musician" o "event_creator"'
        });
        return;
      }

      const filters = {
        minRating: minRating ? parseInt(minRating as string) : undefined,
        maxRating: maxRating ? parseInt(maxRating as string) : undefined,
        isVerified: isVerified ? isVerified === 'true' : undefined,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined
      };

      const ratings = await ratingService.getUserRatings(userId, category as 'musician' | 'event_creator', filters);

      logger.info('RatingController: Ratings obtenidos exitosamente', {
        metadata: {
          userId,
          category,
          count: ratings.length
        }
      });

      res.status(200).json({
        success: true,
        message: 'Ratings obtenidos exitosamente',
        ratings,
        count: ratings.length
      });
    } catch (error) {
      logger.error('RatingController: Error al obtener ratings de usuario', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          context: 'rating'
        }
      });

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener estadísticas de rating de un usuario
   */
  async getUserRatingStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId, category } = req.params;

      if (!userId || !category) {
        res.status(400).json({
          success: false,
          message: 'Faltan parámetros requeridos: userId, category'
        });
        return;
      }

      if (category !== 'musician' && category !== 'event_creator') {
        res.status(400).json({
          success: false,
          message: 'Categoría debe ser "musician" o "event_creator"'
        });
        return;
      }

      const stats = await ratingService.getUserRatingStats(userId, category as 'musician' | 'event_creator');

      logger.info('RatingController: Estadísticas de rating obtenidas exitosamente', {
        metadata: {
          userId,
          category,
          averageRating: stats.averageRating
        }
      });

      res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        stats
      });
    } catch (error) {
      logger.error('RatingController: Error al obtener estadísticas de rating', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          context: 'rating'
        }
      });

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar rating
   */
  async updateRating(req: Request, res: Response): Promise<void> {
    try {
      const { ratingId } = req.params;
      const { rating, review, isActive } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!ratingId) {
        res.status(400).json({
          success: false,
          message: 'ID de rating requerido'
        });
        return;
      }

      // Verificar que el usuario sea el propietario del rating
      const existingRating = await ratingService.getRatingById(ratingId);
      if (!existingRating) {
        res.status(404).json({
          success: false,
          message: 'Rating no encontrado'
        });
        return;
      }

      if (existingRating.eventCreatorId !== userId) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar este rating'
        });
        return;
      }

      const updates: any = {};
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          res.status(400).json({
            success: false,
            message: 'El rating debe estar entre 1 y 5 estrellas'
          });
          return;
        }
        updates.rating = rating;
      }

      if (review !== undefined) {
        updates.review = review;
      }

      if (isActive !== undefined) {
        updates.isActive = isActive;
      }

      const updatedRating = await ratingService.updateRating(ratingId, updates);

      logger.info('RatingController: Rating actualizado exitosamente', {
        metadata: {
          ratingId,
          userId
        }
      });

      res.status(200).json({
        success: true,
        message: 'Rating actualizado exitosamente',
        rating: updatedRating
      });
    } catch (error) {
      logger.error('RatingController: Error al actualizar rating', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          context: 'rating'
        }
      });

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * Marcar rating como útil
   */
  async markRatingAsHelpful(req: Request, res: Response): Promise<void> {
    try {
      const { ratingId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!ratingId) {
        res.status(400).json({
          success: false,
          message: 'ID de rating requerido'
        });
        return;
      }

      await ratingService.markRatingAsHelpful(ratingId);

      logger.info('RatingController: Rating marcado como útil', {
        metadata: {
          ratingId,
          userId
        }
      });

      res.status(200).json({
        success: true,
        message: 'Rating marcado como útil exitosamente'
      });
    } catch (error) {
      logger.error('RatingController: Error al marcar rating como útil', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          context: 'rating'
        }
      });

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * Reportar rating
   */
  async reportRating(req: Request, res: Response): Promise<void> {
    try {
      const { ratingId } = req.params;
      const { reason } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!ratingId || !reason) {
        res.status(400).json({
          success: false,
          message: 'ID de rating y razón requeridos'
        });
        return;
      }

      await ratingService.reportRating(ratingId, reason);

      logger.warn('RatingController: Rating reportado', {
        metadata: {
          ratingId,
          userId,
          reason
        }
      });

      res.status(200).json({
        success: true,
        message: 'Rating reportado exitosamente'
      });
    } catch (error) {
      logger.error('RatingController: Error al reportar rating', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          context: 'rating'
        }
      });

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener ratings de un evento
   */
  async getEventRatings(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;

      if (!eventId) {
        res.status(400).json({
          success: false,
          message: 'ID de evento requerido'
        });
        return;
      }

      const ratings = await ratingService.getEventRatings(eventId);

      logger.info('RatingController: Ratings del evento obtenidos exitosamente', {
        metadata: {
          eventId,
          count: ratings.length
        }
      });

      res.status(200).json({
        success: true,
        message: 'Ratings del evento obtenidos exitosamente',
        ratings,
        count: ratings.length
      });
    } catch (error) {
      logger.error('RatingController: Error al obtener ratings del evento', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          context: 'rating'
        }
      });

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener top músicos por rating
   */
  async getTopRatedMusicians(req: Request, res: Response): Promise<void> {
    try {
      const { limit = '10', minRatings = '5' } = req.query;

      const musicians = await ratingService.getTopRatedMusicians(
        parseInt(limit as string),
        parseInt(minRatings as string)
      );

      logger.info('RatingController: Top músicos obtenidos exitosamente', {
        metadata: {
          count: musicians.length,
          limit: parseInt(limit as string),
          minRatings: parseInt(minRatings as string)
        }
      });

      res.status(200).json({
        success: true,
        message: 'Top músicos obtenidos exitosamente',
        musicians,
        count: musicians.length
      });
    } catch (error) {
      logger.error('RatingController: Error al obtener top músicos', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          context: 'rating'
        }
      });

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener tendencias de rating
   */
  async getRatingTrends(req: Request, res: Response): Promise<void> {
    try {
      const { days = '30' } = req.query;

      const trends = await ratingService.getRatingTrends(parseInt(days as string));

      logger.info('RatingController: Tendencias de rating obtenidas exitosamente', {
        metadata: {
          days: parseInt(days as string)
        }
      });

      res.status(200).json({
        success: true,
        message: 'Tendencias de rating obtenidas exitosamente',
        trends
      });
    } catch (error) {
      logger.error('RatingController: Error al obtener tendencias de rating', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          context: 'rating'
        }
      });

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener ratings más útiles de un usuario
   */
  async getMostHelpfulRatings(req: Request, res: Response): Promise<void> {
    try {
      const { userId, category } = req.params;
      const { limit = '5' } = req.query;

      if (!userId || !category) {
        res.status(400).json({
          success: false,
          message: 'Faltan parámetros requeridos: userId, category'
        });
        return;
      }

      if (category !== 'musician' && category !== 'event_creator') {
        res.status(400).json({
          success: false,
          message: 'Categoría debe ser "musician" o "event_creator"'
        });
        return;
      }

      const ratings = await ratingService.getMostHelpfulRatings(
        userId,
        category as 'musician' | 'event_creator',
        parseInt(limit as string)
      );

      logger.info('RatingController: Ratings más útiles obtenidos exitosamente', {
        metadata: {
          userId,
          category,
          count: ratings.length
        }
      });

      res.status(200).json({
        success: true,
        message: 'Ratings más útiles obtenidos exitosamente',
        ratings,
        count: ratings.length
      });
    } catch (error) {
      logger.error('RatingController: Error al obtener ratings más útiles', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          context: 'rating'
        }
      });

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }
}

export const ratingController = new RatingController(); 