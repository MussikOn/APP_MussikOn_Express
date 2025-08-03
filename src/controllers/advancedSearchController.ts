import { Request, Response } from 'express';
import { MusicianStatusService } from '../services/musicianStatusService';
import { CalendarConflictService } from '../services/calendarConflictService';
import { RateCalculationService } from '../services/rateCalculationService';
import { logger } from '../services/loggerService';

export class AdvancedSearchController {
  private musicianStatusService: MusicianStatusService;
  private calendarConflictService: CalendarConflictService;
  private rateCalculationService: RateCalculationService;

  constructor() {
    this.musicianStatusService = new MusicianStatusService();
    this.calendarConflictService = new CalendarConflictService();
    this.rateCalculationService = new RateCalculationService();
  }

  /**
   * POST /api/advanced-search/musicians
   * Búsqueda avanzada de músicos con verificación de disponibilidad
   */
  async searchAvailableMusicians(req: Request, res: Response) {
    try {
      logger.info('[src/controllers/advancedSearchController.ts:25] Búsqueda avanzada de músicos solicitada');
      
      const {
        eventType,
        instrument,
        location,
        eventDate,
        duration,
        budget,
        isUrgent = false,
        radius = 50
      } = req.body;

      // Validar parámetros requeridos
      if (!eventType || !instrument || !location || !eventDate || !duration) {
        return res.status(400).json({
          success: false,
          message: 'Faltan parámetros requeridos: eventType, instrument, location, eventDate, duration'
        });
      }

      const eventDateTime = new Date(eventDate);
      const endDateTime = new Date(eventDateTime.getTime() + duration * 60000);

      // 1. Obtener músicos online disponibles
      const onlineMusicians = await this.musicianStatusService.getOnlineMusicians({
        location: {
          latitude: 0, // TODO: Geocodificar location
          longitude: 0,
          radius
        },
        eventType,
        instrument,
        minBudget: budget?.min,
        maxBudget: budget?.max
      });

      if (onlineMusicians.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            availableMusicians: [],
            unavailableMusicians: [],
            conflicts: {},
            message: 'No hay músicos disponibles en este momento'
          }
        });
      }

      // 2. Verificar disponibilidad de calendario
      const musicianIds = onlineMusicians.map(m => m.musicianId);
      const availabilityResult = await this.calendarConflictService.checkMultipleMusiciansAvailability(
        musicianIds,
        eventDateTime,
        endDateTime
      );

      // 3. Calcular tarifas para músicos disponibles
      const availableMusiciansWithRates = await Promise.all(
        availabilityResult.availableMusicians.map(async (musicianId) => {
          const rateResult = await this.rateCalculationService.calculateRate({
            musicianId,
            eventType,
            duration,
            location,
            eventDate: eventDateTime,
            instrument,
            isUrgent
          });

          const musicianStatus = onlineMusicians.find(m => m.musicianId === musicianId);
          
          return {
            musicianId,
            status: musicianStatus,
            rate: rateResult.finalRate,
            rateBreakdown: rateResult.breakdown,
            recommendations: rateResult.recommendations
          };
        })
      );

      // 4. Ordenar por relevancia (rating + tiempo de respuesta + precio)
      availableMusiciansWithRates.sort((a, b) => {
        const scoreA = this.calculateRelevanceScore(a);
        const scoreB = this.calculateRelevanceScore(b);
        return scoreB - scoreA;
      });

      // 5. Obtener detalles de conflictos para músicos no disponibles
      const conflictDetails = await Promise.all(
        availabilityResult.unavailableMusicians.map(async (musicianId) => {
          const conflicts = await this.calendarConflictService.checkConflicts({
            musicianId,
            startTime: eventDateTime,
            endTime: endDateTime,
            location
          });

          return {
            musicianId,
            conflicts: conflicts.conflicts,
            availableSlots: conflicts.availableSlots,
            recommendedTime: conflicts.recommendedTime
          };
        })
      );

      const response = {
        success: true,
        data: {
          availableMusicians: availableMusiciansWithRates,
          unavailableMusicians: conflictDetails,
          searchCriteria: {
            eventType,
            instrument,
            location,
            eventDate: eventDateTime,
            duration,
            budget,
            isUrgent,
            radius
          },
          totalFound: onlineMusicians.length,
          availableCount: availableMusiciansWithRates.length,
          unavailableCount: conflictDetails.length
        }
      };

      logger.info('Búsqueda avanzada completada', {
        metadata: { 
          totalFound: response.data.totalFound,
          availableCount: response.data.availableCount,
          unavailableCount: response.data.unavailableCount
        }
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error en búsqueda avanzada de músicos', error as Error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: (error as Error).message
      });
    }
  }

  /**
   * POST /api/advanced-search/check-availability
   * Verificar disponibilidad específica de un músico
   */
  async checkMusicianAvailability(req: Request, res: Response) {
    try {
      logger.info('[src/controllers/advancedSearchController.ts:120] Verificando disponibilidad específica del músico');
      
      const { musicianId, eventDate, duration, location } = req.body;

      if (!musicianId || !eventDate || !duration) {
        return res.status(400).json({
          success: false,
          message: 'Faltan parámetros requeridos: musicianId, eventDate, duration'
        });
      }

      const eventDateTime = new Date(eventDate);
      const endDateTime = new Date(eventDateTime.getTime() + duration * 60000);

      // 1. Verificar estado online del músico
      const musicianStatus = await this.musicianStatusService.getStatus(musicianId);
      
      if (!musicianStatus) {
        return res.status(404).json({
          success: false,
          message: 'Músico no encontrado'
        });
      }

      if (!musicianStatus.isOnline || !musicianStatus.availability.isAvailable) {
        return res.status(200).json({
          success: true,
          data: {
            isAvailable: false,
            reason: 'Músico no está online o no disponible',
            status: musicianStatus
          }
        });
      }

      // 2. Verificar conflictos de calendario
      const conflictResult = await this.calendarConflictService.checkConflicts({
        musicianId,
        startTime: eventDateTime,
        endTime: endDateTime,
        location: location || ''
      });

      // 3. Calcular tarifa si está disponible
      let rateResult = null;
      if (!conflictResult.hasConflict) {
        rateResult = await this.rateCalculationService.calculateRate({
          musicianId,
          eventType: 'general', // TODO: Obtener del request
          duration,
          location: location || '',
          eventDate: eventDateTime,
          instrument: 'general' // TODO: Obtener del request
        });
      }

      const response = {
        success: true,
        data: {
          isAvailable: !conflictResult.hasConflict,
          musicianStatus,
          conflicts: conflictResult.conflicts,
          availableSlots: conflictResult.availableSlots,
          recommendedTime: conflictResult.recommendedTime,
          rate: rateResult ? {
            finalRate: rateResult.finalRate,
            breakdown: rateResult.breakdown,
            recommendations: rateResult.recommendations
          } : null
        }
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error verificando disponibilidad del músico', error as Error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: (error as Error).message
      });
    }
  }

  /**
   * POST /api/advanced-search/update-status
   * Actualizar estado del músico
   */
  async updateMusicianStatus(req: Request, res: Response) {
    try {
      logger.info('[src/controllers/advancedSearchController.ts:190] Actualizando estado del músico');
      
      const { musicianId } = req.params;
      const { isOnline, currentLocation, availability } = req.body;

      if (!musicianId) {
        return res.status(400).json({
          success: false,
          message: 'ID del músico requerido'
        });
      }

      const updateData = {
        isOnline,
        currentLocation,
        availability
      };

      const updatedStatus = await this.musicianStatusService.updateStatus(musicianId, updateData);

      res.status(200).json({
        success: true,
        data: updatedStatus
      });
    } catch (error) {
      logger.error('Error actualizando estado del músico', error as Error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: (error as Error).message
      });
    }
  }

  /**
   * POST /api/advanced-search/heartbeat
   * Heartbeat para mantener estado online
   */
  async musicianHeartbeat(req: Request, res: Response) {
    try {
      logger.info('[src/controllers/advancedSearchController.ts:225] Heartbeat del músico');
      
      const { musicianId } = req.params;
      const { location } = req.body;

      if (!musicianId) {
        return res.status(400).json({
          success: false,
          message: 'ID del músico requerido'
        });
      }

      await this.musicianStatusService.heartbeat(musicianId, location);

      res.status(200).json({
        success: true,
        message: 'Heartbeat registrado correctamente'
      });
    } catch (error) {
      logger.error('Error en heartbeat del músico', error as Error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: (error as Error).message
      });
    }
  }

  /**
   * GET /api/advanced-search/daily-availability/:musicianId
   * Obtener disponibilidad diaria del músico
   */
  async getDailyAvailability(req: Request, res: Response) {
    try {
      logger.info('[src/controllers/advancedSearchController.ts:255] Obteniendo disponibilidad diaria del músico');
      
      const { musicianId } = req.params;
      const { date } = req.query;

      if (!musicianId) {
        return res.status(400).json({
          success: false,
          message: 'ID del músico requerido'
        });
      }

      const targetDate = date ? new Date(date as string) : new Date();
      const availability = await this.calendarConflictService.getDailyAvailability(musicianId, targetDate);

      res.status(200).json({
        success: true,
        data: availability
      });
    } catch (error) {
      logger.error('Error obteniendo disponibilidad diaria', error as Error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: (error as Error).message
      });
    }
  }

  /**
   * POST /api/advanced-search/calculate-rate
   * Calcular tarifa para un músico
   */
  async calculateMusicianRate(req: Request, res: Response) {
    try {
      logger.info('[src/controllers/advancedSearchController.ts:285] Calculando tarifa del músico');
      
      const {
        musicianId,
        eventType,
        duration,
        location,
        eventDate,
        instrument,
        isUrgent = false
      } = req.body;

      if (!musicianId || !eventType || !duration || !location || !eventDate || !instrument) {
        return res.status(400).json({
          success: false,
          message: 'Faltan parámetros requeridos'
        });
      }

      const rateResult = await this.rateCalculationService.calculateRate({
        musicianId,
        eventType,
        duration,
        location,
        eventDate: new Date(eventDate),
        instrument,
        isUrgent
      });

      res.status(200).json({
        success: true,
        data: rateResult
      });
    } catch (error) {
      logger.error('Error calculando tarifa del músico', error as Error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: (error as Error).message
      });
    }
  }

  /**
   * Calcular score de relevancia para ordenar músicos
   */
  private calculateRelevanceScore(musician: any): number {
    const status = musician.status;
    const rate = musician.rate;
    
    // Score basado en rating (40%)
    const ratingScore = (status.performance.rating / 5.0) * 40;
    
    // Score basado en tiempo de respuesta (30%)
    const responseScore = Math.max(0, (120 - status.performance.responseTime) / 120) * 30;
    
    // Score basado en precio (20%) - menor precio = mayor score
    const priceScore = Math.max(0, (200 - rate) / 200) * 20;
    
    // Score basado en experiencia (10%)
    const experienceScore = Math.min(10, status.performance.totalEvents / 10);
    
    return ratingScore + responseScore + priceScore + experienceScore;
  }
} 