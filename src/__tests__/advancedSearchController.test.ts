import { AdvancedSearchController } from '../controllers/advancedSearchController';
import { MusicianStatusService } from '../services/musicianStatusService';
import { CalendarConflictService } from '../services/calendarConflictService';
import { RateCalculationService } from '../services/rateCalculationService';

// Mock de los servicios
jest.mock('../services/musicianStatusService');
jest.mock('../services/calendarConflictService');
jest.mock('../services/rateCalculationService');

describe('AdvancedSearchController', () => {
  let controller: AdvancedSearchController;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    controller = new AdvancedSearchController();
    mockRequest = {
      body: {},
      params: {},
      query: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('searchAvailableMusicians', () => {
    it('should return error when required parameters are missing', async () => {
      mockRequest.body = {};

      await controller.searchAvailableMusicians(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Faltan parámetros requeridos: eventType, instrument, location, eventDate, duration'
      });
    });

    it('should return empty results when no musicians are available', async () => {
      mockRequest.body = {
        eventType: 'wedding',
        instrument: 'guitarra',
        location: 'Madrid',
        eventDate: '2024-12-25T20:00:00Z',
        duration: 120
      };

      // Mock de servicios
      const mockMusicianStatusService = MusicianStatusService as jest.MockedClass<typeof MusicianStatusService>;
      mockMusicianStatusService.prototype.getOnlineMusicians = jest.fn().mockResolvedValue([]);

      await controller.searchAvailableMusicians(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          availableMusicians: [],
          unavailableMusicians: [],
          conflicts: {},
          message: 'No hay músicos disponibles en este momento'
        }
      });
    });

    it('should return available musicians with rates', async () => {
      mockRequest.body = {
        eventType: 'wedding',
        instrument: 'guitarra',
        location: 'Madrid',
        eventDate: '2024-12-25T20:00:00Z',
        duration: 120
      };

      const mockMusicians = [
        {
          musicianId: 'musician1',
          isOnline: true,
          availability: { isAvailable: true },
          performance: { rating: 4.5, responseTime: 30, totalEvents: 50 }
        }
      ];

      const mockRateResult = {
        finalRate: 150,
        breakdown: [],
        recommendations: { suggestedRate: 150, marketAverage: 120, competitorRates: [140, 160] }
      };

      // Mock de servicios
      const mockMusicianStatusService = MusicianStatusService as jest.MockedClass<typeof MusicianStatusService>;
      const mockCalendarConflictService = CalendarConflictService as jest.MockedClass<typeof CalendarConflictService>;
      const mockRateCalculationService = RateCalculationService as jest.MockedClass<typeof RateCalculationService>;

      mockMusicianStatusService.prototype.getOnlineMusicians = jest.fn().mockResolvedValue(mockMusicians);
      mockCalendarConflictService.prototype.checkMultipleMusiciansAvailability = jest.fn().mockResolvedValue({
        availableMusicians: ['musician1'],
        unavailableMusicians: [],
        conflicts: {}
      });
      mockRateCalculationService.prototype.calculateRate = jest.fn().mockResolvedValue(mockRateResult);

      await controller.searchAvailableMusicians(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          availableMusicians: expect.arrayContaining([
            expect.objectContaining({
              musicianId: 'musician1',
              rate: 150
            })
          ]),
          totalFound: 1,
          availableCount: 1,
          unavailableCount: 0
        })
      });
    });
  });

  describe('checkMusicianAvailability', () => {
    it('should return error when required parameters are missing', async () => {
      mockRequest.body = {};

      await controller.checkMusicianAvailability(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Faltan parámetros requeridos: musicianId, eventDate, duration'
      });
    });

    it('should return not found when musician does not exist', async () => {
      mockRequest.body = {
        musicianId: 'nonexistent',
        eventDate: '2024-12-25T20:00:00Z',
        duration: 120
      };

      const mockMusicianStatusService = MusicianStatusService as jest.MockedClass<typeof MusicianStatusService>;
      mockMusicianStatusService.prototype.getStatus = jest.fn().mockResolvedValue(null);

      await controller.checkMusicianAvailability(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Músico no encontrado'
      });
    });

    it('should return unavailable when musician is offline', async () => {
      mockRequest.body = {
        musicianId: 'musician1',
        eventDate: '2024-12-25T20:00:00Z',
        duration: 120
      };

      const mockStatus = {
        isOnline: false,
        availability: { isAvailable: false }
      };

      const mockMusicianStatusService = MusicianStatusService as jest.MockedClass<typeof MusicianStatusService>;
      mockMusicianStatusService.prototype.getStatus = jest.fn().mockResolvedValue(mockStatus);

      await controller.checkMusicianAvailability(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          isAvailable: false,
          reason: 'Músico no está online o no disponible',
          status: mockStatus
        }
      });
    });
  });

  describe('updateMusicianStatus', () => {
    it('should return error when musicianId is missing', async () => {
      mockRequest.params = {};

      await controller.updateMusicianStatus(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'ID del músico requerido'
      });
    });

    it('should update musician status successfully', async () => {
      mockRequest.params = { musicianId: 'musician1' };
      mockRequest.body = {
        isOnline: true,
        currentLocation: { latitude: 40.4168, longitude: -3.7038 }
      };

      const mockUpdatedStatus = {
        id: 'musician1',
        isOnline: true,
        currentLocation: { latitude: 40.4168, longitude: -3.7038 }
      };

      const mockMusicianStatusService = MusicianStatusService as jest.MockedClass<typeof MusicianStatusService>;
      mockMusicianStatusService.prototype.updateStatus = jest.fn().mockResolvedValue(mockUpdatedStatus);

      await controller.updateMusicianStatus(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedStatus
      });
    });
  });

  describe('musicianHeartbeat', () => {
    it('should return error when musicianId is missing', async () => {
      mockRequest.params = {};

      await controller.musicianHeartbeat(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'ID del músico requerido'
      });
    });

    it('should register heartbeat successfully', async () => {
      mockRequest.params = { musicianId: 'musician1' };
      mockRequest.body = {
        location: { latitude: 40.4168, longitude: -3.7038 }
      };

      const mockMusicianStatusService = MusicianStatusService as jest.MockedClass<typeof MusicianStatusService>;
      mockMusicianStatusService.prototype.heartbeat = jest.fn().mockResolvedValue(undefined);

      await controller.musicianHeartbeat(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Heartbeat registrado correctamente'
      });
    });
  });

  describe('getDailyAvailability', () => {
    it('should return error when musicianId is missing', async () => {
      mockRequest.params = {};

      await controller.getDailyAvailability(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'ID del músico requerido'
      });
    });

    it('should return daily availability', async () => {
      mockRequest.params = { musicianId: 'musician1' };
      mockRequest.query = { date: '2024-12-25' };

      const mockAvailability = {
        date: new Date('2024-12-25'),
        busySlots: [],
        availableSlots: [
          { startTime: new Date('2024-12-25T10:00:00'), endTime: new Date('2024-12-25T12:00:00'), duration: 120 }
        ]
      };

      const mockCalendarConflictService = CalendarConflictService as jest.MockedClass<typeof CalendarConflictService>;
      mockCalendarConflictService.prototype.getDailyAvailability = jest.fn().mockResolvedValue(mockAvailability);

      await controller.getDailyAvailability(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAvailability
      });
    });
  });

  describe('calculateMusicianRate', () => {
    it('should return error when required parameters are missing', async () => {
      mockRequest.body = {};

      await controller.calculateMusicianRate(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Faltan parámetros requeridos'
      });
    });

    it('should calculate rate successfully', async () => {
      mockRequest.body = {
        musicianId: 'musician1',
        eventType: 'wedding',
        duration: 120,
        location: 'Madrid',
        eventDate: '2024-12-25T20:00:00Z',
        instrument: 'guitarra'
      };

      const mockRateResult = {
        baseRate: 50,
        finalRate: 150,
        breakdown: [],
        factors: {},
        recommendations: {}
      };

      const mockRateCalculationService = RateCalculationService as jest.MockedClass<typeof RateCalculationService>;
      mockRateCalculationService.prototype.calculateRate = jest.fn().mockResolvedValue(mockRateResult);

      await controller.calculateMusicianRate(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockRateResult
      });
    });
  });

  describe('calculateRelevanceScore', () => {
    it('should calculate relevance score correctly', () => {
      const musician = {
        status: {
          performance: {
            rating: 4.5,
            responseTime: 30,
            totalEvents: 50
          }
        },
        rate: 150
      };

      const score = (controller as any).calculateRelevanceScore(musician);

      // Score esperado: rating(36) + response(22.5) + price(5) + experience(10) = 73.5
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
}); 