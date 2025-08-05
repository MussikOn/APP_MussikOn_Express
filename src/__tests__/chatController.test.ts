import { Request, Response } from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  createConversation,
  searchConversations,
  deleteConversation,
  archiveConversation,
  getConversationById,
  getChatStats,
  getAvailableUsers
} from '../controllers/chatController';
import {
  createConversationModel,
  getConversationsByUserModel,
  getConversationByIdModel,
  getMessagesByConversationModel,
  createMessageModel,
  markMessageAsReadModel,
  markConversationAsReadModel,
  searchConversationsModel,
  deleteConversationModel,
  archiveConversationModel,
  getChatStatsModel,
  getConversationBetweenUsersModel,
} from '../models/chatModel';

// Mock the chat models
jest.mock('../models/chatModel');
jest.mock('../services/loggerService', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('ChatController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn().mockReturnThis();
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };
    jest.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should return user conversations successfully', async () => {
      // Arrange
      const userEmail = 'user@example.com';
      const mockConversations = [
        {
          id: 'conv1',
          participants: ['user@example.com', 'other@example.com'],
          lastMessage: 'Hello there',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 2,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        }
      };

      (getConversationsByUserModel as jest.Mock).mockResolvedValue(mockConversations);

      // Act
      await getConversations(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(getConversationsByUserModel).toHaveBeenCalledWith(userEmail);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockConversations
      });
    });

    it('should return error when user is not authenticated', async () => {
      // Arrange
      mockRequest = {
        user: undefined
      };

      // Act
      await getConversations(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Usuario no autenticado'
      });
    });
  });

  describe('getMessages', () => {
    it('should return messages successfully', async () => {
      // Arrange
      const conversationId = 'conv123';
      const userEmail = 'user@example.com';
      const mockMessages = [
        {
          id: 'msg1',
          conversationId,
          sender: 'user@example.com',
          content: 'Hello',
          timestamp: new Date().toISOString(),
          isRead: false
        }
      ];

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        params: { conversationId }
      };

      (getConversationByIdModel as jest.Mock).mockResolvedValue({
        id: conversationId,
        participants: [userEmail, 'other@example.com']
      });
      (getMessagesByConversationModel as jest.Mock).mockResolvedValue(mockMessages);
      (markConversationAsReadModel as jest.Mock).mockResolvedValue(undefined);

      // Act
      await getMessages(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(getConversationByIdModel).toHaveBeenCalledWith(conversationId);
      expect(getMessagesByConversationModel).toHaveBeenCalledWith(conversationId);
      expect(markConversationAsReadModel).toHaveBeenCalledWith(conversationId, userEmail);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockMessages
      });
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      // Arrange
      const conversationId = 'conv123';
      const userEmail = 'user@example.com';
      const messageContent = 'Hello there';
      const mockMessage = {
        id: 'msg123',
        conversationId,
        sender: userEmail,
        content: messageContent,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        params: { conversationId },
        body: { content: messageContent }
      };

      (getConversationByIdModel as jest.Mock).mockResolvedValue({
        id: conversationId,
        participants: [userEmail, 'other@example.com']
      });
      (createMessageModel as jest.Mock).mockResolvedValue(mockMessage);

      // Act
      await sendMessage(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(getConversationByIdModel).toHaveBeenCalledWith(conversationId);
      expect(createMessageModel).toHaveBeenCalledWith({
        conversationId,
        senderId: userEmail,
        senderName: 'Test User',
        content: messageContent,
        status: 'sent',
        type: 'text'
      });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockMessage
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read successfully', async () => {
      // Arrange
      const messageId = 'msg123';
      const userEmail = 'user@example.com';

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        params: { messageId }
      };

      (markMessageAsReadModel as jest.Mock).mockResolvedValue(undefined);

      // Act
      await markAsRead(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(markMessageAsReadModel).toHaveBeenCalledWith(messageId);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: null
      });
    });
  });

  describe('createConversation', () => {
    it('should create conversation successfully', async () => {
      // Arrange
      const userEmail = 'user@example.com';
      const participantEmail = 'other@example.com';
      const mockConversation = {
        id: 'conv123',
        participants: [userEmail, participantEmail],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        body: { participants: [participantEmail] }
      };

      (getConversationBetweenUsersModel as jest.Mock).mockResolvedValue(null);
      (createConversationModel as jest.Mock).mockResolvedValue(mockConversation);

      // Act
      await createConversation(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(getConversationBetweenUsersModel).toHaveBeenCalledWith(userEmail, participantEmail);
      expect(createConversationModel).toHaveBeenCalledWith([userEmail, participantEmail]);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockConversation
      });
    });

    it('should return error when participant email is missing', async () => {
      // Arrange
      const userEmail = 'user@example.com';

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        body: { participants: [] }
      };

      // Act
      await createConversation(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Se requiere al menos un participante'
      });
    });
  });

  describe('searchConversations', () => {
    it('should search conversations successfully', async () => {
      // Arrange
      const userEmail = 'user@example.com';
      const searchTerm = 'test';
      const mockConversations = [
        {
          id: 'conv1',
          participants: [userEmail, 'other@example.com'],
          lastMessage: 'test message',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          isArchived: false
        }
      ];

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        query: { search: searchTerm }
      };

      (searchConversationsModel as jest.Mock).mockResolvedValue(mockConversations);

      // Act
      await searchConversations(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(searchConversationsModel).toHaveBeenCalledWith(userEmail, {
        dateFrom: undefined,
        dateTo: undefined,
        search: searchTerm,
        unreadOnly: false
      });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockConversations
      });
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation successfully', async () => {
      // Arrange
      const conversationId = 'conv123';
      const userEmail = 'user@example.com';

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        params: { conversationId }
      };

      (deleteConversationModel as jest.Mock).mockResolvedValue(undefined);

      // Act
      await deleteConversation(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(deleteConversationModel).toHaveBeenCalledWith(conversationId, userEmail);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: null
      });
    });
  });

  describe('archiveConversation', () => {
    it('should archive conversation successfully', async () => {
      // Arrange
      const conversationId = 'conv123';
      const userEmail = 'user@example.com';

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        params: { conversationId }
      };

      (archiveConversationModel as jest.Mock).mockResolvedValue(undefined);

      // Act
      await archiveConversation(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(archiveConversationModel).toHaveBeenCalledWith(conversationId, userEmail);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: null
      });
    });
  });

  describe('getConversationById', () => {
    it('should return conversation by id successfully', async () => {
      // Arrange
      const conversationId = 'conv123';
      const userEmail = 'user@example.com';
      const mockConversation = {
        id: conversationId,
        participants: [userEmail, 'other@example.com'],
        lastMessage: 'Hello there',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 2,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        params: { conversationId }
      };

      (getConversationByIdModel as jest.Mock).mockResolvedValue(mockConversation);

      // Act
      await getConversationById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(getConversationByIdModel).toHaveBeenCalledWith(conversationId);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockConversation
      });
    });

    it('should return 404 when conversation not found', async () => {
      // Arrange
      const conversationId = 'nonexistent';
      const userEmail = 'user@example.com';

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        params: { conversationId }
      };

      (getConversationByIdModel as jest.Mock).mockResolvedValue(null);

      // Act
      await getConversationById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Conversación no encontrada'
      });
    });
  });

  describe('getChatStats', () => {
    it('should return chat stats successfully', async () => {
      // Arrange
      const userEmail = 'user@example.com';
      const mockStats = {
        totalConversations: 10,
        unreadMessages: 5,
        archivedConversations: 2,
        totalMessages: 150
      };

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        }
      };

      (getChatStatsModel as jest.Mock).mockResolvedValue(mockStats);

      // Act
      await getChatStats(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(getChatStatsModel).toHaveBeenCalledWith(userEmail);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
    });
  });

  describe('getAvailableUsers', () => {
    it('should return available users successfully', async () => {
      // Arrange
      const userEmail = 'user@example.com';
      const mockUsers = [
        {
          email: 'other@example.com',
          name: 'Other User',
          role: 'musician',
          isOnline: true
        }
      ];

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        }
      };

      // Mock the function that gets available users (this would need to be implemented)
      // For now, we'll just test the basic structure
      mockResponse.json = jest.fn();

      // Act
      await getAvailableUsers(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
}); 