import { Request, Response } from 'express';
import { MusicianSearchService, MusicianSearchCriteria } from '../services/musicianSearchService';
import { getEventByIdModel } from '../models/eventModel';
import { Event } from '../utils/DataTypes';

/**
 * Controlador para búsqueda de músicos
 * Maneja las solicitudes de búsqueda de músicos para eventos
 */
export class MusicianSearchController {
  /**
   * Busca músicos disponibles para un evento específico
   * POST /musician-search/search-for-event
   */
  static async searchMusiciansForEvent(req: Request, res: Response): Promise<void> {
    try {
      const { eventId, criteria } = req.body;
      const user = (req as any).user;

      console.log(
        '[src/controllers/musicianSearchController.ts:20] 🔍 Búsqueda de músicos solicitada:',
        { eventId, userEmail: user.userEmail }
      );

      // Validar que el usuario sea un creador de eventos
      if (user.roll !== 'eventCreator') {
        res.status(403).json({
          success: false,
          message: 'Solo los creadores de eventos pueden buscar músicos',
        });
        return;
      }

      // Validar que el evento existe y pertenece al usuario
      const event = await getEventByIdModel(eventId);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
        return;
      }

      if (event.user !== user.userEmail) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para buscar músicos para este evento',
        });
        return;
      }

      // Validar criterios de búsqueda
      const searchCriteria: MusicianSearchCriteria = {
        instrument: criteria.instrument || event.instrument,
        location: criteria.location || event.location,
        budget: criteria.budget || parseFloat(event.budget),
        date: criteria.date || event.date,
        time: criteria.time || event.time,
        duration: criteria.duration || event.duration,
        eventType: criteria.eventType || event.eventType,
        maxDistance: criteria.maxDistance || 50, // 50km por defecto
      };

      // Realizar búsqueda
      const musicians = await MusicianSearchService.searchMusiciansForEvent(
        event,
        searchCriteria
      );

      console.log(
        '[src/controllers/musicianSearchController.ts:65] ✅ Búsqueda completada. Músicos encontrados:',
        musicians.length
      );

      res.status(200).json({
        success: true,
        message: 'Búsqueda de músicos completada exitosamente',
        data: {
          eventId,
          totalMusicians: musicians.length,
          musicians: musicians.slice(0, 10), // Limitar a 10 resultados
          searchCriteria,
        },
      });
    } catch (error) {
      console.error(
        '[src/controllers/musicianSearchController.ts:80] ❌ Error en búsqueda de músicos:',
        error
      );
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  /**
   * Obtiene músicos recomendados para un evento
   * GET /musician-search/recommendations/:eventId
   */
  static async getRecommendedMusicians(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const user = (req as any).user;

      console.log(
        '[src/controllers/musicianSearchController.ts:95] 🎯 Obteniendo recomendaciones para evento:',
        eventId
      );

      // Validar que el usuario sea un creador de eventos
      if (user.roll !== 'eventCreator') {
        res.status(403).json({
          success: false,
          message: 'Solo los creadores de eventos pueden obtener recomendaciones',
        });
        return;
      }

      // Validar que el evento existe y pertenece al usuario
      const event = await getEventByIdModel(eventId);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
        return;
      }

      if (event.user !== user.userEmail) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para obtener recomendaciones para este evento',
        });
        return;
      }

      // Obtener recomendaciones
      const recommendations = await MusicianSearchService.getRecommendedMusicians(eventId);

      console.log(
        '[src/controllers/musicianSearchController.ts:125] ✅ Recomendaciones obtenidas:',
        recommendations.length
      );

      res.status(200).json({
        success: true,
        message: 'Recomendaciones obtenidas exitosamente',
        data: {
          eventId,
          totalRecommendations: recommendations.length,
          recommendations: recommendations.slice(0, 5), // Top 5 recomendaciones
        },
      });
    } catch (error) {
      console.error(
        '[src/controllers/musicianSearchController.ts:140] ❌ Error obteniendo recomendaciones:',
        error
      );
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  /**
   * Busca músicos por criterios específicos (búsqueda avanzada)
   * POST /musician-search/advanced-search
   */
  static async advancedSearch(req: Request, res: Response): Promise<void> {
    try {
      const { criteria } = req.body;
      const user = (req as any).user;

      console.log(
        '[src/controllers/musicianSearchController.ts:155] 🔍 Búsqueda avanzada solicitada:',
        { criteria, userEmail: user.userEmail }
      );

      // Validar que el usuario sea un creador de eventos
      if (user.roll !== 'eventCreator') {
        res.status(403).json({
          success: false,
          message: 'Solo los creadores de eventos pueden realizar búsquedas avanzadas',
        });
        return;
      }

      // Validar criterios mínimos
      if (!criteria.instrument) {
        res.status(400).json({
          success: false,
          message: 'El instrumento es requerido para la búsqueda',
        });
        return;
      }

      // Crear un evento temporal para la búsqueda
      const tempEvent: Event = {
        id: 'temp',
        user: user.userEmail,
        eventName: 'Búsqueda temporal',
        eventType: criteria.eventType || 'general',
        date: criteria.date || new Date().toISOString().split('T')[0],
        time: criteria.time || '12:00',
        location: criteria.location || '',
        duration: criteria.duration || '02:00',
        instrument: criteria.instrument,
        bringInstrument: criteria.bringInstrument || false,
        comment: '',
        budget: criteria.budget?.toString() || '0',
        flyerUrl: '',
        songs: [],
        recommendations: [],
        mapsLink: '',
        status: 'pending_musician',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Realizar búsqueda
      const musicians = await MusicianSearchService.searchMusiciansForEvent(
        tempEvent,
        criteria
      );

      console.log(
        '[src/controllers/musicianSearchController.ts:195] ✅ Búsqueda avanzada completada. Músicos encontrados:',
        musicians.length
      );

      res.status(200).json({
        success: true,
        message: 'Búsqueda avanzada completada exitosamente',
        data: {
          totalMusicians: musicians.length,
          musicians: musicians.slice(0, 20), // Limitar a 20 resultados
          searchCriteria: criteria,
        },
      });
    } catch (error) {
      console.error(
        '[src/controllers/musicianSearchController.ts:210] ❌ Error en búsqueda avanzada:',
        error
      );
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  /**
   * Obtiene estadísticas de búsqueda
   * GET /musician-search/stats
   */
  static async getSearchStats(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      console.log(
        '[src/controllers/musicianSearchController.ts:225] 📊 Obteniendo estadísticas de búsqueda para:',
        user.userEmail
      );

      // Validar que el usuario sea un creador de eventos
      if (user.roll !== 'eventCreator') {
        res.status(403).json({
          success: false,
          message: 'Solo los creadores de eventos pueden obtener estadísticas',
        });
        return;
      }

      // Obtener estadísticas básicas
      const stats = {
        totalSearches: 0, // En producción, esto vendría de una base de datos
        averageResults: 0,
        mostSearchedInstrument: 'Guitarra',
        lastSearchDate: new Date().toISOString(),
        totalMusiciansAvailable: 0,
      };

      res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats,
      });
    } catch (error) {
      console.error(
        '[src/controllers/musicianSearchController.ts:250] ❌ Error obteniendo estadísticas:',
        error
      );
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }
} 