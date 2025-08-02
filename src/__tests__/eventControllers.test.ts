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
  deleteEventController
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
  deleteEventModel
} from '../models/eventModel';

// Mock de todas las dependencias
jest.mock('../models/eventModel');

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
      expect(mockJson).toHaveBeenCalledWith({ data: mockEvent });
    });

    it('should return error when event creation fails', async () => {
      (createEventModel as jest.Mock).mockRejectedValue(new Error('Database error'));

      await requestMusicianController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ msg: 'Error al crear solicitud' });
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
    it('should return available events successfully', async () => {
      const mockEvents = [
        { id: 'event1', eventName: 'Evento 1', status: 'pending_musician' },
        { id: 'event2', eventName: 'Evento 2', status: 'pending_musician' }
      ];

      (getAvailableEvents as jest.Mock).mockResolvedValue(mockEvents);

      await availableRequestsController(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
    });
  });

  describe('acceptEventController', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'musico123',
          email: 'musico@example.com',
          role: 'musico',
          name: 'Músico Test',
          userEmail: 'musico@example.com'
        },
        body: {
          eventId: 'event123'
        }
      };
    });

    it('should accept event successfully', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        status: 'musician_assigned'
      };

      (acceptEventModel as jest.Mock).mockResolvedValue(mockEvent);

      await acceptEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ data: mockEvent });
    });

    it('should return error when user is not a musician', async () => {
      mockRequest.user = {
        userId: 'user123',
        email: 'user@example.com',
        role: 'eventCreator',
        name: 'User Test',
        userEmail: 'user@example.com'
      };

      await acceptEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ msg: 'Solo los músicos pueden aceptar eventos' });
    });

    it('should return error when event acceptance fails', async () => {
      (acceptEventModel as jest.Mock).mockRejectedValue(new Error('Database error'));

      await acceptEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ msg: 'Error al aceptar evento' });
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

    it('should return cancelled events successfully', async () => {
      const mockEvents = [
        { id: 'event1', eventName: 'Evento 1', status: 'cancelled' },
        { id: 'event2', eventName: 'Evento 2', status: 'cancelled' }
      ];

      (getEventsByUserAndStatus as jest.Mock).mockResolvedValue(mockEvents);

      await myCancelledEventsController(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
      expect(getEventsByUserAndStatus).toHaveBeenCalledWith('juan@example.com', 'cancelled');
    });
  });

  describe('getEventByIdController', () => {
    beforeEach(() => {
      mockRequest = {
        params: {
          eventId: 'event123'
        }
      };
    });

    it('should return event by ID successfully', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        location: 'Santo Domingo'
      };

      (getEventByIdModel as jest.Mock).mockResolvedValue(mockEvent);

      await getEventByIdController(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ data: mockEvent });
      expect(getEventByIdModel).toHaveBeenCalledWith('event123');
    });

    it('should return error when event not found', async () => {
      (getEventByIdModel as jest.Mock).mockResolvedValue(null);

      await getEventByIdController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ msg: 'Evento no encontrado' });
    });
  });

  describe('cancelEventController', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'juan@example.com',
          role: 'eventCreator',
          name: 'Juan Pérez',
          userEmail: 'juan@example.com'
        },
        params: {
          eventId: 'event123'
        },
        body: {
          reason: 'Cambio de fecha'
        }
      };
    });

    it('should cancel event successfully', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        status: 'cancelled'
      };

      (cancelEventModel as jest.Mock).mockResolvedValue(mockEvent);

      await cancelEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ data: mockEvent });
    });

    it('should return error when event cancellation fails', async () => {
      (cancelEventModel as jest.Mock).mockRejectedValue(new Error('Database error'));

      await cancelEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ msg: 'Error al cancelar evento' });
    });
  });

  describe('completeEventController', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'juan@example.com',
          role: 'eventCreator',
          name: 'Juan Pérez',
          userEmail: 'juan@example.com'
        },
        params: {
          eventId: 'event123'
        },
        body: {
          rating: 5,
          comment: 'Excelente servicio'
        }
      };
    });

    it('should complete event successfully', async () => {
      const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        status: 'completed'
      };

      (completeEventModel as jest.Mock).mockResolvedValue(mockEvent);

      await completeEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ data: mockEvent });
    });

    it('should return error when event completion fails', async () => {
      (completeEventModel as jest.Mock).mockRejectedValue(new Error('Database error'));

      await completeEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ msg: 'Error al completar evento' });
    });
  });

  describe('deleteEventController', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'juan@example.com',
          role: 'eventCreator',
          name: 'Juan Pérez',
          userEmail: 'juan@example.com'
        },
        params: {
          eventId: 'event123'
        }
      };
    });

    it('should delete event successfully', async () => {
      (deleteEventModel as jest.Mock).mockResolvedValue(true);

      await deleteEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ msg: 'Evento eliminado exitosamente' });
    });

    it('should return error when event deletion fails', async () => {
      (deleteEventModel as jest.Mock).mockRejectedValue(new Error('Database error'));

      await deleteEventController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ msg: 'Error al eliminar evento' });
    });
  });
}); 