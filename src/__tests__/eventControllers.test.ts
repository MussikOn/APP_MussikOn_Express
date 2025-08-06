import { Request, Response } from 'express';
import {
  requestMusicianController,
  myPendingEventsController,
  myAssignedEventsController,
  myCompletedEventsController,
  availableRequestsController,
  acceptEventController,
  myScheduledEventsController,
  myPastPerformancesController,
  myEventsController,
  myCancelledEventsController,
  getEventByIdController,
  cancelEventController,
  completeEventController,
  deleteEventController,
} from '../controllers/eventControllers';
import {
  createEventModel,
  getEventsByUserAndStatus,
  getAvailableEvents,
  acceptEventModel,
  getEventsByMusicianAndStatus,
  getEventsByUser,
  getEventsByMusician,
  getEventByIdModel,
  cancelEventModel,
  completeEventModel,
  deleteEventModel,
} from '../models/eventModel';
import { createMockRequest, createMockResponse } from './setup';

// Mock de todas las dependencias
jest.mock('../models/eventModel');

// Mock simple de los servicios avanzados
jest.mock('../services/musicianStatusService', () => ({
  musicianStatusService: {
    getStatus: jest.fn().mockResolvedValue({
      isOnline: true,
      availability: { isAvailable: true }
    }),
    updateStatus: jest.fn().mockResolvedValue(undefined),
    getOnlineMusicians: jest.fn().mockResolvedValue([])
  }
}));

jest.mock('../services/calendarConflictService', () => ({
  calendarConflictService: {
    checkConflicts: jest.fn().mockResolvedValue({ hasConflict: false }),
    addEvent: jest.fn().mockResolvedValue(undefined),
    getMusicianEvents: jest.fn().mockResolvedValue([]),
    removeEvent: jest.fn().mockResolvedValue(undefined)
  }
}));

jest.mock('../services/rateCalculationService', () => ({
  rateCalculationService: {
    calculateRate: jest.fn().mockResolvedValue({
      finalRate: 5000,
      breakdown: {},
      recommendations: []
    })
  }
}));

describe('EventControllers', () => {
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

  describe('requestMusicianController', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'juan@example.com',
          role: 'eventCreator',
          name: 'Juan Pérez',
          userEmail: 'juan@example.com'
        },
        body: {
          eventName: 'Boda de María',
          location: 'Santo Domingo',
          date: '2024-12-25',
          time: '18:00',
          duration: '2 horas',
          instrument: 'guitarra',
          budget: '5000'
        }
      };
    });

    it('should create event request successfully', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        user: 'juan@example.com',
        status: 'pending_musician'
      };

      (createEventModel as jest.Mock).mockResolvedValue(mockEvent);

      await requestMusicianController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({ 
        success: true,
        message: 'Evento creado exitosamente con búsqueda avanzada de músicos',
        data: expect.objectContaining({
          id: 'event123',
          eventName: 'Boda de María',
          user: 'juan@example.com',
          status: 'pending_musician'
        })
      });
    });

    it('should return error when event creation fails', async () => {
      (createEventModel as jest.Mock).mockRejectedValue(new Error('Database error'));

      await requestMusicianController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ 
        success: false,
        message: 'Error al crear evento',
        error: 'Database error'
      });
    });
  });

  describe('myPendingEventsController', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'juan@example.com',
          role: 'eventCreator',
          name: 'Juan Pérez',
          userEmail: 'juan@example.com'
        }
      };
    });

    it('should return pending events successfully', async () => {
      const mockEvents = [
        { id: 'event1', eventName: 'Evento 1', status: 'pending_musician' },
        { id: 'event2', eventName: 'Evento 2', status: 'pending_musician' }
      ];

      (getEventsByUserAndStatus as jest.Mock).mockResolvedValue(mockEvents);

      await myPendingEventsController(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
      expect(getEventsByUserAndStatus).toHaveBeenCalledWith('juan@example.com', 'pending_musician');
    });
  });

  describe('myAssignedEventsController', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'juan@example.com',
          role: 'eventCreator',
          name: 'Juan Pérez',
          userEmail: 'juan@example.com'
        }
      };
    });

    it('should return assigned events successfully', async () => {
      const mockEvents = [
        { id: 'event1', eventName: 'Evento 1', status: 'musician_assigned' },
        { id: 'event2', eventName: 'Evento 2', status: 'musician_assigned' }
      ];

      (getEventsByUserAndStatus as jest.Mock).mockResolvedValue(mockEvents);

      await myAssignedEventsController(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
      expect(getEventsByUserAndStatus).toHaveBeenCalledWith('juan@example.com', 'musician_assigned');
    });
  });

  describe('myCompletedEventsController', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'juan@example.com',
          role: 'eventCreator',
          name: 'Juan Pérez',
          userEmail: 'juan@example.com'
        }
      };
    });

    it('should return completed events successfully', async () => {
      const mockEvents = [
        { id: 'event1', eventName: 'Evento 1', status: 'completed' },
        { id: 'event2', eventName: 'Evento 2', status: 'completed' }
      ];

      (getEventsByUserAndStatus as jest.Mock).mockResolvedValue(mockEvents);

      await myCompletedEventsController(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
      expect(getEventsByUserAndStatus).toHaveBeenCalledWith('juan@example.com', 'completed');
    });
  });

  describe('availableRequestsController', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'musico123',
          email: 'musico@example.com',
          role: 'musico',
          name: 'Músico Test',
          userEmail: 'musico@example.com',
          roll: 'musico'
        }
      };
    });

    it('should return available events successfully', async () => {
      const mockEvents = [
        { id: 'event1', eventName: 'Evento 1', status: 'pending_musician' },
        { id: 'event2', eventName: 'Evento 2', status: 'pending_musician' }
      ];

      (getAvailableEvents as jest.Mock).mockResolvedValue(mockEvents);

      await availableRequestsController(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ 
        success: true,
        data: mockEvents,
        message: expect.any(String),
        searchMetadata: expect.any(Object)
      });
    });
  });

  describe('acceptEventController', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        params: {
          eventId: 'event123'
        },
        user: {
          id: 'user123',
          userEmail: 'juan@example.com',
          roll: 'musico'
        }
      });
    });

    it('should accept event successfully', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        status: 'musician_assigned',
        date: '2024-12-25',
        time: '18:00',
        duration: '120',
        location: 'Santo Domingo'
      };

      (getEventByIdModel as jest.Mock).mockResolvedValue(mockEvent);
      (acceptEventModel as jest.Mock).mockResolvedValue(mockEvent);

      await acceptEventController(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ 
        success: true,
        message: 'Evento aceptado exitosamente',
        data: expect.objectContaining({
          event: mockEvent,
          calculatedRate: expect.any(Number),
          rateBreakdown: expect.any(Object),
          recommendations: expect.any(Array)
        })
      });
    });

    it('should return error when user is not a musician', async () => {
      mockRequest = createMockRequest({
        params: {
          eventId: 'event123'
        },
        user: {
          id: 'user123',
          userEmail: 'juan@example.com',
          roll: 'eventCreator'
        }
      });

      await acceptEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ msg: 'Solo los músicos pueden aceptar eventos.' });
    });

    it('should return error when event acceptance fails', async () => {
      // Mock que el músico está online pero el evento no se puede aceptar
      const { musicianStatusService } = require('../services/musicianStatusService');
      (musicianStatusService.getStatus as jest.Mock).mockResolvedValue({
        isOnline: true,
        availability: { isAvailable: true }
      });
      
      (getEventByIdModel as jest.Mock).mockResolvedValue({
        id: 'event123',
        eventName: 'Boda de María',
        status: 'pending_musician',
        date: '2024-12-25',
        time: '18:00',
        duration: '120',
        location: 'Santo Domingo'
      });
      
      (acceptEventModel as jest.Mock).mockResolvedValue(null);

      await acceptEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ 
        success: false,
        message: 'No se pudo aceptar el evento.' 
      });
    });
  });

  describe('myScheduledEventsController', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'musico123',
          email: 'musico@example.com',
          role: 'musico',
          name: 'Músico Test',
          userEmail: 'musico@example.com'
        }
      };
    });

    it('should return scheduled events successfully', async () => {
      const mockEvents = [
        { id: 'event1', eventName: 'Evento 1', status: 'musician_assigned' },
        { id: 'event2', eventName: 'Evento 2', status: 'musician_assigned' }
      ];

      (getEventsByMusicianAndStatus as jest.Mock).mockResolvedValue(mockEvents);

      await myScheduledEventsController(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
      expect(getEventsByMusicianAndStatus).toHaveBeenCalledWith('musico@example.com', 'musician_assigned');
    });
  });

  describe('myPastPerformancesController', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'musico123',
          email: 'musico@example.com',
          role: 'musico',
          name: 'Músico Test',
          userEmail: 'musico@example.com'
        }
      };
    });

    it('should return past performances successfully', async () => {
      const mockEvents = [
        { id: 'event1', eventName: 'Evento 1', status: 'completed' },
        { id: 'event2', eventName: 'Evento 2', status: 'completed' }
      ];

      (getEventsByMusicianAndStatus as jest.Mock).mockResolvedValue(mockEvents);

      await myPastPerformancesController(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
      expect(getEventsByMusicianAndStatus).toHaveBeenCalledWith('musico@example.com', 'completed');
    });
  });

  describe('myEventsController', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        user: {
          id: 'user123',
          userEmail: 'juan@example.com',
          roll: 'eventCreator'
        }
      });
    });

    it('should return all user events successfully', async () => {
      const mockEvents = [
        { id: 'event1', eventName: 'Evento 1' },
        { id: 'event2', eventName: 'Evento 2' }
      ];

      (getEventsByUser as jest.Mock).mockResolvedValue(mockEvents);

      await myEventsController(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
      expect(getEventsByUser).toHaveBeenCalledWith('juan@example.com');
    });
  });

  describe('myCancelledEventsController', () => {
    let isolatedMockRequest: Partial<Request>;
    let isolatedMockResponse: Partial<Response>;
    let isolatedMockJson: jest.Mock;
    let isolatedMockStatus: jest.Mock;

    beforeEach(() => {
      // Crear mocks completamente aislados para este test
      isolatedMockJson = jest.fn();
      isolatedMockStatus = jest.fn().mockReturnValue({ json: isolatedMockJson });
      
      isolatedMockResponse = {
        status: isolatedMockStatus,
        json: isolatedMockJson
      };

      isolatedMockRequest = createMockRequest({
        user: {
          id: 'user123',
          userEmail: 'juan@example.com',
          roll: 'eventCreator'
        }
      });
      
      // Limpiar completamente todos los mocks
      jest.clearAllMocks();
    });

    it('should return cancelled events successfully', async () => {
      const cancelledEvents = [
        { id: 'event1', eventName: 'Evento 1', status: 'cancelled' },
        { id: 'event2', eventName: 'Evento 2', status: 'cancelled' }
      ];

      const musicianCancelledEvents = [
        { id: 'event3', eventName: 'Evento 3', status: 'musician_cancelled' },
        { id: 'event4', eventName: 'Evento 4', status: 'musician_cancelled' }
      ];

      const expectedEvents = [...cancelledEvents, ...musicianCancelledEvents];

      // Mock específico para este test que devuelve diferentes resultados para cada llamada
      (getEventsByUserAndStatus as jest.Mock)
        .mockResolvedValueOnce(cancelledEvents)        // Primera llamada: 'cancelled'
        .mockResolvedValueOnce(musicianCancelledEvents); // Segunda llamada: 'musician_cancelled'

      await myCancelledEventsController(isolatedMockRequest as Request, isolatedMockResponse as Response);

      expect(isolatedMockJson).toHaveBeenCalledWith({ data: expectedEvents });
      expect(getEventsByUserAndStatus).toHaveBeenCalledWith('juan@example.com', 'cancelled');
      expect(getEventsByUserAndStatus).toHaveBeenCalledWith('juan@example.com', 'musician_cancelled');
    });
  });

  describe('getEventByIdController', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        params: {
          eventId: 'event123'
        }
      });
    });

    it('should return event by ID successfully', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        location: 'Santo Domingo'
      };

      (getEventByIdModel as jest.Mock).mockResolvedValue(mockEvent);

      await getEventByIdController(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockEvent
      });
      expect(getEventByIdModel).toHaveBeenCalledWith('event123');
    });

    it('should return error when event not found', async () => {
      (getEventByIdModel as jest.Mock).mockResolvedValue(null);

      await getEventByIdController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Evento no encontrado'
      });
    });
  });

  describe('cancelEventController', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        params: {
          eventId: 'event123'
        },
        user: {
          id: 'user123',
          userEmail: 'juan@example.com',
          roll: 'eventCreator'
        }
      });
    });

    it('should cancel event successfully', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        status: 'cancelled',
        user: 'juan@example.com' // El usuario debe ser el propietario
      };

      (getEventByIdModel as jest.Mock).mockResolvedValue(mockEvent);
      (cancelEventModel as jest.Mock).mockResolvedValue(mockEvent);

      await cancelEventController(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Solicitud cancelada exitosamente',
        data: mockEvent
      });
    });

    it('should return error when user is not authorized', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        status: 'pending',
        user: 'otro@example.com' // Usuario diferente al propietario
      };

      (getEventByIdModel as jest.Mock).mockResolvedValue(mockEvent);

      await cancelEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No tienes permisos para cancelar esta solicitud'
      });
    });

    it('should return error when event cancellation fails', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        status: 'pending',
        user: 'juan@example.com'
      };

      (getEventByIdModel as jest.Mock).mockResolvedValue(mockEvent);
      (cancelEventModel as jest.Mock).mockResolvedValue(null);

      await cancelEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error al cancelar la solicitud'
      });
    });
  });

  describe('completeEventController', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        params: {
          eventId: 'event123'
        },
        user: {
          id: 'user123',
          userEmail: 'juan@example.com',
          roll: 'eventCreator'
        }
      });
    });

    it('should complete event successfully', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        status: 'completed',
        user: 'juan@example.com'
      };

      (getEventByIdModel as jest.Mock).mockResolvedValue(mockEvent);
      (completeEventModel as jest.Mock).mockResolvedValue(mockEvent);

      await completeEventController(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Evento completado exitosamente',
        data: mockEvent
      });
    });

    it('should return error when user is not authorized', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        status: 'pending',
        user: 'otro@example.com'
      };

      (getEventByIdModel as jest.Mock).mockResolvedValue(mockEvent);

      await completeEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No tienes permisos para completar este evento'
      });
    });

    it('should return error when event completion fails', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        status: 'pending',
        user: 'juan@example.com'
      };

      (getEventByIdModel as jest.Mock).mockResolvedValue(mockEvent);
      (completeEventModel as jest.Mock).mockResolvedValue(null);

      await completeEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No se pudo completar el evento'
      });
    });
  });

  describe('deleteEventController', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        params: {
          eventId: 'event123'
        },
        user: {
          id: 'user123',
          userEmail: 'juan@example.com',
          roll: 'eventCreator'
        }
      });
    });

    it('should delete event successfully', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        status: 'completed',
        user: 'juan@example.com'
      };

      (getEventByIdModel as jest.Mock).mockResolvedValue(mockEvent);
      (deleteEventModel as jest.Mock).mockResolvedValue(true);

      await deleteEventController(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Evento eliminado exitosamente',
        data: true
      });
    });

    it('should return error when user is not authorized', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        status: 'completed',
        user: 'otro@example.com'
      };

      (getEventByIdModel as jest.Mock).mockResolvedValue(mockEvent);

      await deleteEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Evento no encontrado o no tienes permisos para eliminarlo'
      });
    });

    it('should return error when event deletion fails', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        status: 'completed',
        user: 'juan@example.com'
      };

      (getEventByIdModel as jest.Mock).mockResolvedValue(mockEvent);
      (deleteEventModel as jest.Mock).mockResolvedValue(false);

      await deleteEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Evento no encontrado o no tienes permisos para eliminarlo'
      });
    });
  });
}); 