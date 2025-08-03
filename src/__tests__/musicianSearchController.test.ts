import { Request, Response } from 'express';
import { MusicianSearchController } from '../controllers/musicianSearchController';

// Mock de las dependencias
jest.mock('../models/eventModel', () => ({
  getEventByIdModel: jest.fn()
}));

jest.mock('../services/musicianSearchService', () => ({
  MusicianSearchService: {
    searchMusiciansForEvent: jest.fn(),
    getRecommendedMusicians: jest.fn()
  }
}));

// Importar los mocks
import { getEventByIdModel } from '../models/eventModel';
import { MusicianSearchService } from '../services/musicianSearchService';

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
      // Mock del evento
      const mockEvent = {
        id: 'event123',
        user: 'user@example.com',
        eventName: 'Boda de María',
        instrument: 'guitarra',
        location: 'Madrid',
        budget: '500',
        date: '2024-12-25',
        time: '20:00',
        duration: '120',
        eventType: 'wedding'
      };

      // Mock de músicos encontrados
      const mockMusicians = [
        {
          id: 'musician1',
          name: 'Juan Pérez',
          instrument: 'guitarra',
          rating: 4.5,
          rate: 150
        }
      ];

      // Configurar mocks
      (getEventByIdModel as jest.Mock).mockResolvedValue(mockEvent);
      (MusicianSearchService.searchMusiciansForEvent as jest.Mock).mockResolvedValue(mockMusicians);

      await MusicianSearchController.searchMusiciansForEvent(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Búsqueda de músicos completada exitosamente',
          data: expect.objectContaining({
            eventId: 'event123',
            totalMusicians: 1,
            musicians: mockMusicians
          })
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
      // Mock de músicos recomendados
      const mockMusicians = [
        {
          id: 'musician1',
          name: 'Juan Pérez',
          instrument: 'guitarra',
          rating: 4.5,
          rate: 150
        }
      ];

      // Configurar mocks
      (MusicianSearchService.getRecommendedMusicians as jest.Mock).mockResolvedValue(mockMusicians);

      await MusicianSearchController.getRecommendedMusicians(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Recomendaciones obtenidas exitosamente',
          data: expect.objectContaining({
            eventId: 'event123',
            recommendations: mockMusicians,
            totalRecommendations: 1
          })
        })
      );
    });
  });
}); 