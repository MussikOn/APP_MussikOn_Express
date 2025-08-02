import { Request, Response } from 'express';
import { MusicianSearchController } from '../controllers/musicianSearchController';

// Mock del servicio
jest.mock('../services/musicianSearchService', () => ({
  MusicianSearchService: {
    searchMusiciansForEvent: jest.fn(),
    getRecommendedMusicians: jest.fn(),
    advancedSearch: jest.fn(),
    getSearchStats: jest.fn()
  }
}));

describe('MusicianSearchController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    // Reset de todos los mocks
    jest.clearAllMocks();
  });

  describe('searchMusiciansForEvent', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'user@example.com',
          role: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com',
          roll: 'eventCreator'
        },
        body: {
          eventId: 'event123',
          criteria: {
            instrument: 'guitarra',
            location: 'Madrid',
            budget: 500,
            date: '2024-12-25',
            time: '20:00',
            duration: 120,
            eventType: 'wedding',
            maxDistance: 50
          }
        }
      };
    });

    it('should search musicians for event successfully', async () => {
      await MusicianSearchController.searchMusiciansForEvent(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Búsqueda de músicos completada exitosamente'
        })
      );
    });

    it('should return error when user is not event creator', async () => {
      mockRequest.user = {
        userId: 'user123',
        email: 'user@example.com',
        role: 'musico',
        name: 'Test User',
        userEmail: 'user@example.com',
        roll: 'musico'
      };

      await MusicianSearchController.searchMusiciansForEvent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Solo los creadores de eventos pueden buscar músicos'
      });
    });
  });

  describe('getRecommendedMusicians', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'user@example.com',
          role: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com',
          roll: 'eventCreator'
        },
        params: {
          eventId: 'event123'
        }
      };
    });

    it('should get recommended musicians successfully', async () => {
      await MusicianSearchController.getRecommendedMusicians(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Músicos recomendados obtenidos exitosamente'
        })
      );
    });
  });

  describe('advancedSearch', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'user@example.com',
          role: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com',
          roll: 'eventCreator'
        },
        body: {
          criteria: {
            instruments: ['guitarra', 'piano'],
            location: 'Madrid',
            budget: { min: 300, max: 800 },
            date: '2024-12-25',
            time: '20:00',
            duration: 120,
            eventType: 'wedding',
            maxDistance: 50,
            rating: 4.0,
            availability: 'immediate'
          }
        }
      };
    });

    it('should perform advanced search successfully', async () => {
      await MusicianSearchController.advancedSearch(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Búsqueda avanzada completada exitosamente'
        })
      );
    });
  });

  describe('getSearchStats', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'user@example.com',
          role: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com',
          roll: 'eventCreator'
        }
      };
    });

    it('should get search stats successfully', async () => {
      await MusicianSearchController.getSearchStats(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Estadísticas de búsqueda obtenidas exitosamente'
        })
      );
    });
  });
}); 