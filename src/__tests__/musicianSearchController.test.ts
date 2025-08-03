import { Request, Response } from 'express';
import { MusicianSearchController } from '../controllers/musicianSearchController';
import { MusicianSearchService } from '../services/musicianSearchService';
import { getEventByIdModel } from '../models/eventModel';

// Mock de los servicios
jest.mock('../services/musicianSearchService');
jest.mock('../models/eventModel');

describe('MusicianSearchController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    // Limpiar todos los mocks
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
            location: 'Santiago, RD',
            budget: 5000,
            date: '2025-02-15',
            time: '18:00',
            duration: '03:00',
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
        eventName: 'Boda en Santiago',
        eventType: 'wedding',
        date: '2025-02-15',
        time: '18:00',
        location: 'Santiago, RD',
        duration: '03:00',
        instrument: 'guitarra',
        bringInstrument: false,
        comment: 'Necesito un guitarrista para mi boda',
        budget: '5000',
        flyerUrl: '',
        songs: ['Canción 1', 'Canción 2'],
        recommendations: [],
        mapsLink: '',
        status: 'pending_musician',
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z'
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
      // Mock del evento
      const mockEvent = {
        id: 'event123',
        user: 'user@example.com',
        eventName: 'Boda en Santiago',
        eventType: 'wedding',
        date: '2025-02-15',
        time: '18:00',
        location: 'Santiago, RD',
        duration: '03:00',
        instrument: 'guitarra',
        bringInstrument: false,
        comment: 'Necesito un guitarrista para mi boda',
        budget: '5000',
        flyerUrl: '',
        songs: ['Canción 1', 'Canción 2'],
        recommendations: [],
        mapsLink: '',
        status: 'pending_musician',
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z'
      };

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
      (getEventByIdModel as jest.Mock).mockResolvedValue(mockEvent);
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