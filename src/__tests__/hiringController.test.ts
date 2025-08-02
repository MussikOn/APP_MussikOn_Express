import { Request, Response } from 'express';
import { HiringController } from '../controllers/hiringController';
import { HiringService } from '../services/hiringService';

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
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'user@example.com',
          role: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com'
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
      mockRequest.user = undefined;

      await hiringController.createHiringRequest(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should return error when required fields are missing', async () => {
      mockRequest.body = {
        eventId: 'event123'
        // musicianId, eventDetails, terms faltantes
      };

      await hiringController.createHiringRequest(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
    });
  });

  describe('getHiringRequestById', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'user@example.com',
          role: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com'
        },
        params: {
          requestId: 'hiring123'
        }
      };
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
      mockRequest.user = undefined;

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
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'user@example.com',
          role: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com'
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

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Estado de solicitud actualizado exitosamente',
        data: mockUpdatedRequest
      });
      expect(mockHiringService.updateHiringRequestStatus).toHaveBeenCalledWith('hiring123', 'accepted');
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

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
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'user@example.com',
          role: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com'
        }
      };
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

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockRequests
      });
      expect(mockHiringService.getHiringRequestsByUser).toHaveBeenCalledWith('user123');
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await hiringController.getHiringRequestsByUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });
  });

  describe('addMessage', () => {
    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'user@example.com',
          role: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com'
        },
        params: {
          requestId: 'hiring123'
        },
        body: {
          content: 'Mensaje de prueba',
          senderType: 'eventCreator'
        }
      };
    });

    it('should add message successfully', async () => {
      const mockMessage = {
        id: 'msg123',
        content: 'Mensaje de prueba',
        senderId: 'user123',
        senderType: 'eventCreator' as const,
        timestamp: new Date(),
        isRead: false
      };

      mockHiringService.addMessage.mockResolvedValue(mockMessage);

      await hiringController.addMessage(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Mensaje agregado exitosamente',
        data: mockMessage
      });
      expect(mockHiringService.addMessage).toHaveBeenCalledWith('hiring123', {
        content: 'Mensaje de prueba',
        senderId: 'user123',
        senderType: 'eventCreator'
      });
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

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
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'user@example.com',
          role: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com'
        },
        params: {
          requestId: 'hiring123'
        }
      };
    });

    it('should mark messages as read successfully', async () => {
      mockHiringService.markMessagesAsRead.mockResolvedValue();

      await hiringController.markMessagesAsRead(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Mensajes marcados como leídos'
      });
      expect(mockHiringService.markMessagesAsRead).toHaveBeenCalledWith('hiring123', 'user123');
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

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
      mockRequest = {
        user: {
          userId: 'user123',
          email: 'user@example.com',
          role: 'eventCreator',
          name: 'Test User',
          userEmail: 'user@example.com'
        }
      };
    });

    it('should return hiring stats successfully', async () => {
      const mockStats = {
        total: 10,
        pending: 3,
        accepted: 5,
        rejected: 2,
        completed: 0,
        cancelled: 0
      } as any;

      mockHiringService.getHiringStats.mockResolvedValue(mockStats);

      await hiringController.getHiringStats(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
      expect(mockHiringService.getHiringStats).toHaveBeenCalledWith('user123');
    });

    it('should return error when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await hiringController.getHiringStats(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });
  });
}); 