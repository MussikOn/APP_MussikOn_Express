import { Request, Response } from 'express';
import {
  createHiringRequest,
  getHiringRequestById,
  updateHiringRequestStatus,
  getHiringRequestsByUser,
  addMessage,
  markMessagesAsRead,
  getHiringStats
} from '../controllers/hiringController';
import { HiringService } from '../services/hiringService';

// Mock del servicio
jest.mock('../services/hiringService');

describe('HiringController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHiringService: jest.Mocked<HiringService>;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    // Mock del servicio
    mockHiringService = {
      createHiringRequest: jest.fn(),
      getHiringRequestById: jest.fn(),
      updateHiringRequestStatus: jest.fn(),
      getHiringRequestsByUser: jest.fn(),
      addMessage: jest.fn(),
      markMessagesAsRead: jest.fn(),
      getHiringStats: jest.fn()
    } as any;

    (HiringService as jest.Mock).mockImplementation(() => mockHiringService);

    // Reset de todos los mocks
    jest.clearAllMocks();
  });

  describe('createHiringRequest', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          id: 'user123',
          roll: 'eventCreator'
        },
        body: {
          eventId: 'event123',
          musicianId: 'musician123',
          eventDetails: 'Evento de música en vivo',
          terms: 'Pago por adelantado'
        }
      };
    });

    it('should create hiring request successfully', async () => {
      const mockHiringRequest = {
        id: 'hiring123',
        eventId: 'event123',
        musicianId: 'musician123',
        eventCreatorId: 'user123',
        status: 'pending',
        eventDetails: 'Evento de música en vivo',
        terms: 'Pago por adelantado',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockHiringService.createHiringRequest.mockResolvedValue(mockHiringRequest);

      await createHiringRequest(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockHiringRequest
      });
      expect(mockHiringService.createHiringRequest).toHaveBeenCalledWith({
        eventId: 'event123',
        musicianId: 'musician123',
        eventCreatorId: 'user123',
        eventDetails: 'Evento de música en vivo',
        terms: 'Pago por adelantado'
      });
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await createHiringRequest(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should return error when required fields are missing', async () => {
      mockRequest.body = {
        eventId: 'event123'
        // musicianId faltante
      };

      await createHiringRequest(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'eventId y musicianId son requeridos'
      });
    });

    it('should return error when hiring request creation fails', async () => {
      mockHiringService.createHiringRequest.mockRejectedValue(
        new Error('Hiring service error')
      );

      await createHiringRequest(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error al crear solicitud de contratación'
      });
    });
  });

  describe('getHiringRequestById', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          id: 'user123'
        },
        params: {
          requestId: 'hiring123'
        }
      };
    });

    it('should get hiring request successfully', async () => {
      const mockHiringRequest = {
        id: 'hiring123',
        eventId: 'event123',
        musicianId: 'musician123',
        eventCreatorId: 'user123',
        status: 'pending'
      };

      mockHiringService.getHiringRequestById.mockResolvedValue(mockHiringRequest);

      await getHiringRequestById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockHiringRequest
      });
      expect(mockHiringService.getHiringRequestById).toHaveBeenCalledWith('hiring123');
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getHiringRequestById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should return error when hiring request not found', async () => {
      mockHiringService.getHiringRequestById.mockResolvedValue(null);

      await getHiringRequestById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Solicitud de contratación no encontrada'
      });
    });

    it('should return error when user has no access', async () => {
      const mockHiringRequest = {
        id: 'hiring123',
        eventId: 'event123',
        musicianId: 'musician456', // Diferente al usuario actual
        eventCreatorId: 'user456'  // Diferente al usuario actual
      };

      mockHiringService.getHiringRequestById.mockResolvedValue(mockHiringRequest);

      await getHiringRequestById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No tienes permisos para ver esta solicitud'
      });
    });
  });

  describe('updateHiringRequestStatus', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          id: 'user123'
        },
        params: {
          requestId: 'hiring123'
        },
        body: {
          status: 'accepted'
        }
      };
    });

    it('should update hiring request status successfully', async () => {
      const mockUpdatedRequest = {
        id: 'hiring123',
        status: 'accepted',
        updatedAt: new Date()
      };

      mockHiringService.updateHiringRequestStatus.mockResolvedValue(mockUpdatedRequest);

      await updateHiringRequestStatus(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Estado de solicitud actualizado exitosamente',
        data: mockUpdatedRequest
      });
      expect(mockHiringService.updateHiringRequestStatus).toHaveBeenCalledWith(
        'hiring123',
        'accepted',
        'user123'
      );
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await updateHiringRequestStatus(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should return error when status is missing', async () => {
      mockRequest.body = {};

      await updateHiringRequestStatus(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'El estado es requerido'
      });
    });

    it('should return error when status update fails', async () => {
      mockHiringService.updateHiringRequestStatus.mockRejectedValue(
        new Error('Status update error')
      );

      await updateHiringRequestStatus(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error al actualizar estado de solicitud'
      });
    });
  });

  describe('getHiringRequestsByUser', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          id: 'user123',
          roll: 'musico'
        },
        query: {
          status: 'pending'
        }
      };
    });

    it('should get hiring requests successfully', async () => {
      const mockRequests = [
        {
          id: 'hiring1',
          eventId: 'event1',
          status: 'pending'
        },
        {
          id: 'hiring2',
          eventId: 'event2',
          status: 'pending'
        }
      ];

      mockHiringService.getHiringRequestsByUser.mockResolvedValue(mockRequests);

      await getHiringRequestsByUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockRequests,
        count: mockRequests.length
      });
      expect(mockHiringService.getHiringRequestsByUser).toHaveBeenCalledWith(
        'user123',
        'musico',
        'pending'
      );
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getHiringRequestsByUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should return error when user role is invalid', async () => {
      mockRequest.user = {
        id: 'user123',
        roll: 'admin' // Rol inválido
      };

      await getHiringRequestsByUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Rol de usuario inválido'
      });
    });
  });

  describe('addMessage', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          id: 'user123',
          roll: 'musico'
        },
        params: {
          requestId: 'hiring123'
        },
        body: {
          content: 'Hola, estoy interesado en el evento'
        }
      };
    });

    it('should add message successfully', async () => {
      const mockMessage = {
        id: 'msg123',
        senderId: 'user123',
        senderType: 'musician',
        content: 'Hola, estoy interesado en el evento',
        timestamp: new Date(),
        isRead: false
      };

      mockHiringService.addMessage.mockResolvedValue(mockMessage);

      await addMessage(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Mensaje enviado exitosamente',
        data: mockMessage
      });
      expect(mockHiringService.addMessage).toHaveBeenCalledWith(
        'hiring123',
        'user123',
        'musician',
        'Hola, estoy interesado en el evento'
      );
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await addMessage(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should return error when content is missing', async () => {
      mockRequest.body = {};

      await addMessage(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'El contenido del mensaje es requerido'
      });
    });

    it('should return error when user role is invalid', async () => {
      mockRequest.user = {
        id: 'user123',
        roll: 'admin' // Rol inválido
      };

      await addMessage(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Rol de usuario inválido'
      });
    });
  });

  describe('markMessagesAsRead', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          id: 'user123'
        },
        params: {
          requestId: 'hiring123'
        }
      };
    });

    it('should mark messages as read successfully', async () => {
      mockHiringService.markMessagesAsRead.mockResolvedValue();

      await markMessagesAsRead(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Mensajes marcados como leídos exitosamente'
      });
      expect(mockHiringService.markMessagesAsRead).toHaveBeenCalledWith('hiring123', 'user123');
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await markMessagesAsRead(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should return error when marking messages fails', async () => {
      mockHiringService.markMessagesAsRead.mockRejectedValue(
        new Error('Mark messages error')
      );

      await markMessagesAsRead(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error al marcar mensajes como leídos'
      });
    });
  });

  describe('getHiringStats', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          id: 'user123',
          roll: 'musico'
        }
      };
    });

    it('should get hiring stats successfully', async () => {
      const mockStats = {
        totalRequests: 25,
        pendingRequests: 5,
        acceptedRequests: 15,
        rejectedRequests: 3,
        completedRequests: 2,
        averageResponseTime: 2.5
      };

      mockHiringService.getHiringStats.mockResolvedValue(mockStats);

      await getHiringStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
      expect(mockHiringService.getHiringStats).toHaveBeenCalledWith('user123', 'musico');
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getHiringStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should return error when user role is invalid', async () => {
      mockRequest.user = {
        id: 'user123',
        roll: 'admin' // Rol inválido
      };

      await getHiringStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Rol de usuario inválido'
      });
    });

    it('should return error when stats retrieval fails', async () => {
      mockHiringService.getHiringStats.mockRejectedValue(
        new Error('Stats retrieval error')
      );

      await getHiringStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener estadísticas de contratación'
      });
    });
  });
}); 