import { Request, Response } from 'express';
import { HiringController } from '../controllers/hiringController';
import { HiringService, Message, HiringStats } from '../services/hiringService';
import { createMockRequest, createMockResponse } from './setup';

// Mock del servicio
jest.mock('../services/hiringService');

describe('HiringController', () => {
  let hiringController: HiringController;
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
    hiringController = new HiringController();

    // Reset de todos los mocks
    jest.clearAllMocks();
  });

  describe('createHiringRequest', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        user: {
          id: 'user123',
          email: 'user@example.com',
          roll: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com'
        },
        body: {
          eventId: 'event123',
          musicianId: 'musician123',
          eventDetails: 'Evento de música en vivo',
          terms: 'Pago por adelantado'
        }
      });
    });

    it('should create hiring request successfully', async () => {
      const mockHiringRequest = {
        id: 'hiring123',
        eventId: 'event123',
        musicianId: 'musician123',
        eventCreatorId: 'user123',
        status: 'pending' as const,
        eventDetails: 'Evento de música en vivo',
        terms: 'Pago por adelantado',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockHiringService.createHiringRequest.mockResolvedValue(mockHiringRequest);

      await hiringController.createHiringRequest(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Solicitud de contratación creada exitosamente',
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
      mockRequest = createMockRequest({
        body: {
          eventId: 'event123',
          musicianId: 'musician123',
          eventDetails: 'Evento de música en vivo',
          terms: 'Pago por adelantado'
        }
      });

      await hiringController.createHiringRequest(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should return error when service fails', async () => {
      mockHiringService.createHiringRequest.mockRejectedValue(new Error('Service error'));

      await hiringController.createHiringRequest(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Service error'
      });
    });
  });

  describe('getHiringRequestById', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        user: {
          id: 'user123',
          email: 'user@example.com',
          roll: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com'
        },
        params: {
          requestId: 'hiring123'
        }
      });
    });

    it('should return hiring request by ID successfully', async () => {
      const mockHiringRequest = {
        id: 'hiring123',
        eventId: 'event123',
        musicianId: 'musician123',
        eventCreatorId: 'user123',
        status: 'pending' as const,
        eventDetails: 'Evento de música en vivo',
        terms: 'Pago por adelantado',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockHiringService.getHiringRequestById.mockResolvedValue(mockHiringRequest);

      await hiringController.getHiringRequestById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockHiringRequest
      });
      expect(mockHiringService.getHiringRequestById).toHaveBeenCalledWith('hiring123');
    });

    it('should return 404 when hiring request not found', async () => {
      mockHiringService.getHiringRequestById.mockResolvedValue(null);

      await hiringController.getHiringRequestById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Solicitud de contratación no encontrada'
      });
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest = createMockRequest({
        params: {
          requestId: 'hiring123'
        }
      });

      await hiringController.getHiringRequestById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });
  });

  describe('updateHiringRequestStatus', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        user: {
          id: 'user123',
          email: 'user@example.com',
          roll: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com'
        },
        params: {
          requestId: 'hiring123'
        },
        body: {
          status: 'accepted'
        }
      });
    });

    it('should update hiring request status successfully', async () => {
      const mockUpdatedRequest = {
        id: 'hiring123',
        eventId: 'event123',
        musicianId: 'musician123',
        eventCreatorId: 'user123',
        status: 'accepted' as const,
        eventDetails: 'Evento de música en vivo',
        terms: 'Pago por adelantado',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockHiringService.updateHiringRequestStatus.mockResolvedValue(mockUpdatedRequest);

      await hiringController.updateHiringRequestStatus(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Estado de solicitud actualizado exitosamente',
        data: mockUpdatedRequest
      });
      expect(mockHiringService.updateHiringRequestStatus).toHaveBeenCalledWith('hiring123', 'accepted', 'user123');
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest = createMockRequest({
        params: {
          requestId: 'hiring123'
        },
        body: {
          status: 'accepted'
        }
      });

      await hiringController.updateHiringRequestStatus(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });
  });

  describe('getHiringRequestsByUser', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        user: {
          id: 'user123',
          email: 'user@example.com',
          roll: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com'
        },
        query: {
          status: 'pending'
        }
      });
    });

    it('should return hiring requests by user successfully', async () => {
      const mockRequests = [
        {
          id: 'hiring123',
          eventId: 'event123',
          musicianId: 'musician123',
          eventCreatorId: 'user123',
          status: 'pending' as const,
          eventDetails: 'Evento de música en vivo',
          terms: 'Pago por adelantado',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockHiringService.getHiringRequestsByUser.mockResolvedValue(mockRequests);

      await hiringController.getHiringRequestsByUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockRequests,
        count: mockRequests.length
      });
      expect(mockHiringService.getHiringRequestsByUser).toHaveBeenCalledWith('user123', 'eventCreator', 'pending');
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest = createMockRequest({
        query: {
          status: 'pending'
        }
      });

      await hiringController.getHiringRequestsByUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should return error when user role is invalid', async () => {
      mockRequest = createMockRequest({
        user: {
          id: 'user123',
          email: 'user@example.com',
          roll: 'admin', // Rol inválido
          name: 'Test User',
          userEmail: 'user@example.com'
        },
        query: {
          status: 'pending'
        }
      });

      await hiringController.getHiringRequestsByUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Rol de usuario inválido'
      });
    });

    it('should return error when service fails', async () => {
      mockHiringService.getHiringRequestsByUser.mockRejectedValue(new Error('Service error'));

      await hiringController.getHiringRequestsByUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener solicitudes de contratación'
      });
    });
  });

  describe('addMessage', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        user: {
          id: 'user123',
          email: 'user@example.com',
          roll: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com'
        },
        params: {
          requestId: 'hiring123'
        },
        body: {
          content: 'Mensaje de prueba'
        }
      });
    });

    it('should add message successfully', async () => {
      const mockMessage: Message = {
        id: 'msg123',
        content: 'Mensaje de prueba',
        senderId: 'user123',
        senderType: 'eventCreator',
        timestamp: new Date(),
        isRead: false
      };

      mockHiringService.addMessage.mockResolvedValue(mockMessage);

      await hiringController.addMessage(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Mensaje enviado exitosamente',
        data: mockMessage
      });
      expect(mockHiringService.addMessage).toHaveBeenCalledWith('hiring123', 'user123', 'eventCreator', 'Mensaje de prueba');
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest = createMockRequest({
        params: {
          requestId: 'hiring123'
        },
        body: {
          content: 'Mensaje de prueba'
        }
      });

      await hiringController.addMessage(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });
  });

  describe('markMessagesAsRead', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        user: {
          id: 'user123',
          email: 'user@example.com',
          roll: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com'
        },
        params: {
          requestId: 'hiring123'
        }
      });
    });

    it('should mark messages as read successfully', async () => {
      mockHiringService.markMessagesAsRead.mockResolvedValue();

      await hiringController.markMessagesAsRead(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Mensajes marcados como leídos exitosamente'
      });
      expect(mockHiringService.markMessagesAsRead).toHaveBeenCalledWith('hiring123', 'user123');
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest = createMockRequest({
        params: {
          requestId: 'hiring123'
        }
      });

      await hiringController.markMessagesAsRead(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });
  });

  describe('getHiringStats', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        user: {
          id: 'user123',
          email: 'user@example.com',
          roll: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com'
        }
      });
    });

    it('should return hiring stats successfully', async () => {
      const mockStats: HiringStats = {
        totalRequests: 10,
        pendingRequests: 3,
        acceptedRequests: 5,
        rejectedRequests: 2,
        completedRequests: 0,
        averageResponseTime: 2.5
      };

      mockHiringService.getHiringStats.mockResolvedValue(mockStats);

      await hiringController.getHiringStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
      expect(mockHiringService.getHiringStats).toHaveBeenCalledWith('user123', 'eventCreator');
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest = createMockRequest({});

      await hiringController.getHiringStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });
  });
}); 