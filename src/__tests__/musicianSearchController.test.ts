import { Request, Response } from 'express';
import {
  searchMusiciansForEvent,
  getRecommendedMusicians,
  advancedSearch,
  getSearchStats
} from '../controllers/musicianSearchController';
import { MusicianSearchService } from '../services/musicianSearchService';

// Mock del servicio
jest.mock('../services/musicianSearchService');

describe('MusicianSearchController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockMusicianSearchService: jest.Mocked<MusicianSearchService>;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    // Mock del servicio
    mockMusicianSearchService = {
      searchMusiciansForEvent: jest.fn(),
      getRecommendedMusicians: jest.fn(),
      advancedSearch: jest.fn(),
      getSearchStats: jest.fn()
    } as any;

    (MusicianSearchService as jest.Mock).mockImplementation(() => mockMusicianSearchService);

    // Reset de todos los mocks
    jest.clearAllMocks();
  });

  describe('searchMusiciansForEvent', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          id: 'user123',
          roll: 'eventCreator'
        },
        body: {
          eventId: 'event123',
          criteria: {
            instrument: 'guitarra',
            date: '2024-12-25',
            time: '18:00',
            duration: 120,
            budget: 5000,
            location: {
              lat: 18.4861,
              lng: -69.9312
            }
          }
        }
      };
    });

    it('should search musicians successfully', async () => {
      const mockResults = [
        {
          musicianId: 'musician1',
          name: 'Juan Pérez',
          instrument: 'guitarra',
          score: 85,
          hourlyRate: 2000,
          distance: 5.2
        },
        {
          musicianId: 'musician2',
          name: 'María García',
          instrument: 'guitarra',
          score: 78,
          hourlyRate: 1800,
          distance: 8.1
        }
      ];

      mockMusicianSearchService.searchMusiciansForEvent.mockResolvedValue(mockResults);

      await searchMusiciansForEvent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResults,
        count: mockResults.length
      });
      expect(mockMusicianSearchService.searchMusiciansForEvent).toHaveBeenCalledWith(
        'event123',
        mockRequest.body.criteria
      );
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await searchMusiciansForEvent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should return error when user is not an event creator', async () => {
      mockRequest.user = {
        id: 'user123',
        roll: 'musico'
      };

      await searchMusiciansForEvent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Solo los creadores de eventos pueden buscar músicos'
      });
    });

    it('should return error when required fields are missing', async () => {
      mockRequest.body = {
        eventId: 'event123'
        // criteria faltante
      };

      await searchMusiciansForEvent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'eventId y criteria son requeridos'
      });
    });

    it('should return error when search fails', async () => {
      mockMusicianSearchService.searchMusiciansForEvent.mockRejectedValue(
        new Error('Search service error')
      );

      await searchMusiciansForEvent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error al buscar músicos'
      });
    });
  });

  describe('getRecommendedMusicians', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          id: 'user123',
          roll: 'eventCreator'
        },
        params: {
          eventId: 'event123'
        }
      };
    });

    it('should get recommended musicians successfully', async () => {
      const mockRecommendations = [
        {
          musicianId: 'musician1',
          name: 'Juan Pérez',
          instrument: 'guitarra',
          score: 90,
          reason: 'Excelente calificación y experiencia'
        },
        {
          musicianId: 'musician2',
          name: 'María García',
          instrument: 'guitarra',
          score: 85,
          reason: 'Buena ubicación y disponibilidad'
        }
      ];

      mockMusicianSearchService.getRecommendedMusicians.mockResolvedValue(mockRecommendations);

      await getRecommendedMusicians(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockRecommendations,
        count: mockRecommendations.length
      });
      expect(mockMusicianSearchService.getRecommendedMusicians).toHaveBeenCalledWith('event123');
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getRecommendedMusicians(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should return error when eventId is missing', async () => {
      mockRequest.params = {};

      await getRecommendedMusicians(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'eventId es requerido'
      });
    });

    it('should return error when recommendations fail', async () => {
      mockMusicianSearchService.getRecommendedMusicians.mockRejectedValue(
        new Error('Recommendations service error')
      );

      await getRecommendedMusicians(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener recomendaciones'
      });
    });
  });

  describe('advancedSearch', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          id: 'user123',
          roll: 'eventCreator'
        },
        body: {
          filters: {
            instruments: ['guitarra', 'piano'],
            minRating: 4.0,
            maxHourlyRate: 3000,
            maxDistance: 10,
            availability: {
              date: '2024-12-25',
              time: '18:00',
              duration: 120
            }
          },
          sortBy: 'rating',
          sortOrder: 'desc',
          limit: 10
        }
      };
    });

    it('should perform advanced search successfully', async () => {
      const mockResults = [
        {
          musicianId: 'musician1',
          name: 'Juan Pérez',
          instruments: ['guitarra'],
          rating: 4.8,
          hourlyRate: 2500,
          distance: 5.2
        },
        {
          musicianId: 'musician2',
          name: 'María García',
          instruments: ['piano'],
          rating: 4.5,
          hourlyRate: 2800,
          distance: 7.8
        }
      ];

      mockMusicianSearchService.advancedSearch.mockResolvedValue(mockResults);

      await advancedSearch(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResults,
        count: mockResults.length
      });
      expect(mockMusicianSearchService.advancedSearch).toHaveBeenCalledWith(
        mockRequest.body.filters,
        mockRequest.body.sortBy,
        mockRequest.body.sortOrder,
        mockRequest.body.limit
      );
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await advancedSearch(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should return error when filters are missing', async () => {
      mockRequest.body = {
        sortBy: 'rating',
        sortOrder: 'desc'
        // filters faltante
      };

      await advancedSearch(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'filters son requeridos'
      });
    });

    it('should return error when advanced search fails', async () => {
      mockMusicianSearchService.advancedSearch.mockRejectedValue(
        new Error('Advanced search service error')
      );

      await advancedSearch(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error en búsqueda avanzada'
      });
    });
  });

  describe('getSearchStats', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          id: 'user123',
          roll: 'eventCreator'
        }
      };
    });

    it('should get search stats successfully', async () => {
      const mockStats = {
        totalSearches: 150,
        averageResultsPerSearch: 8.5,
        mostSearchedInstruments: ['guitarra', 'piano', 'violín'],
        averageSearchTime: 2.3,
        topRatedMusicians: [
          { musicianId: 'musician1', name: 'Juan Pérez', rating: 4.9 },
          { musicianId: 'musician2', name: 'María García', rating: 4.8 }
        ]
      };

      mockMusicianSearchService.getSearchStats.mockResolvedValue(mockStats);

      await getSearchStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
      expect(mockMusicianSearchService.getSearchStats).toHaveBeenCalled();
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getSearchStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should return error when stats retrieval fails', async () => {
      mockMusicianSearchService.getSearchStats.mockRejectedValue(
        new Error('Stats service error')
      );

      await getSearchStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener estadísticas'
      });
    });
  });
}); 