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
  getAvailableUsers,
  editMessage,
  addReaction,
  removeReaction,
  deleteMessage,
  updateTypingIndicator
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
  getConversationBetweenUsersModel,
  getChatStatsModel,
  editMessageModel,
  addReactionToMessageModel,
  removeReactionFromMessageModel,
  deleteMessageModel,
  updateTypingIndicatorModel
} from '../models/chatModel';
import { createMockRequest, createMockResponse } from './setup';

// Mock de todas las dependencias
jest.mock('../models/chatModel');
jest.mock('../services/loggerService', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('ChatController', () => {
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

  describe('getConversations', () => {
    it('should return conversations successfully', async () => {
      // Arrange
      const userEmail = 'user@example.com';
      const mockConversations = [
        { id: 'conv1', participants: [userEmail, 'other@example.com'] },
        { id: 'conv2', participants: [userEmail, 'another@example.com'] }
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
  });

  describe('getMessages', () => {
    it('should return messages successfully', async () => {
      // Arrange
      const conversationId = 'conv123';
      const userEmail = 'user@example.com';
      const mockMessages = [
        { id: 'msg1', content: 'Hello', sender: userEmail },
        { id: 'msg2', content: 'Hi there', sender: 'other@example.com' }
      ];

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        params: { conversationId },
        query: { limit: '50', offset: '0' }
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
      expect(getMessagesByConversationModel).toHaveBeenCalledWith(conversationId, 50, 0);
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
          name: 'Test User',
          lastName: 'Test'
        },
        body: { 
          conversationId,
          content: messageContent,
          type: 'text'
        }
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
        senderName: 'Test User Test',
        content: messageContent,
        status: 'sent',
        type: 'text',
        metadata: undefined,
        replyTo: undefined,
        isEdited: false,
        isDeleted: false
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
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
        message: 'Mensaje marcado como leído'
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
        type: 'direct'
      };

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        body: {
          participants: [participantEmail],
          type: 'direct'
        }
      };

      (getConversationBetweenUsersModel as jest.Mock).mockResolvedValue(null);
      (createConversationModel as jest.Mock).mockResolvedValue(mockConversation);

      // Act
      await createConversation(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(getConversationBetweenUsersModel).toHaveBeenCalledWith(participantEmail, userEmail);
      expect(createConversationModel).toHaveBeenCalledWith([participantEmail, userEmail], 'direct', undefined, undefined);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockConversation
      });
    });
  });

  describe('searchConversations', () => {
    it('should search conversations successfully', async () => {
      // Arrange
      const userEmail = 'user@example.com';
      const mockConversations = [
        { id: 'conv1', participants: [userEmail, 'other@example.com'] }
      ];

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        query: { search: 'test' }
      };

      (searchConversationsModel as jest.Mock).mockResolvedValue(mockConversations);

      // Act
      await searchConversations(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(searchConversationsModel).toHaveBeenCalledWith(userEmail, { search: 'test' });
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

      (deleteConversationModel as jest.Mock).mockResolvedValue(true);

      // Act
      await deleteConversation(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(deleteConversationModel).toHaveBeenCalledWith(conversationId, userEmail);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Conversación eliminada exitosamente'
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

      (archiveConversationModel as jest.Mock).mockResolvedValue(true);

      // Act
      await archiveConversation(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(archiveConversationModel).toHaveBeenCalledWith(conversationId, userEmail);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Conversación archivada exitosamente'
      });
    });
  });

  describe('getConversationById', () => {
    it('should return conversation by ID successfully', async () => {
      // Arrange
      const conversationId = 'conv123';
      const userEmail = 'user@example.com';
      const mockConversation = {
        id: conversationId,
        participants: [userEmail, 'other@example.com']
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
  });

  describe('getChatStats', () => {
    it('should return chat statistics successfully', async () => {
      // Arrange
      const userEmail = 'user@example.com';
      const mockStats = {
        totalConversations: 5,
        totalMessages: 100,
        unreadMessages: 10
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
        { id: 'user1', email: 'user1@example.com', name: 'User 1' },
        { id: 'user2', email: 'user2@example.com', name: 'User 2' }
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

      // Mock de Firebase
      const mockDb = {
        collection: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            docs: mockUsers.map(user => ({
              data: () => user,
              id: user.id
            }))
          })
        })
      };

      jest.doMock('../utils/firebase', () => ({
        db: mockDb
      }));

      // Act
      await getAvailableUsers(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array)
      });
    });
  });

  describe('editMessage', () => {
    it('should edit message successfully', async () => {
      // Arrange
      const messageId = 'msg123';
      const userEmail = 'user@example.com';
      const newContent = 'Updated message';
      const mockMessage = {
        id: messageId,
        content: newContent,
        sender: userEmail
      };

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        params: { messageId },
        body: { content: newContent }
      };

      (editMessageModel as jest.Mock).mockResolvedValue(mockMessage);

      // Act
      await editMessage(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(editMessageModel).toHaveBeenCalledWith(messageId, newContent, userEmail);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockMessage
      });
    });
  });

  describe('addReaction', () => {
    it('should add reaction successfully', async () => {
      // Arrange
      const messageId = 'msg123';
      const userEmail = 'user@example.com';
      const emoji = '👍';

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        params: { messageId },
        body: { emoji }
      };

      (addReactionToMessageModel as jest.Mock).mockResolvedValue(true);

      // Act
      await addReaction(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(addReactionToMessageModel).toHaveBeenCalledWith(messageId, userEmail, emoji);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Reacción agregada exitosamente'
      });
    });
  });

  describe('removeReaction', () => {
    it('should remove reaction successfully', async () => {
      // Arrange
      const messageId = 'msg123';
      const userEmail = 'user@example.com';
      const emoji = '👍';

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        params: { messageId },
        body: { emoji }
      };

      (removeReactionFromMessageModel as jest.Mock).mockResolvedValue(true);

      // Act
      await removeReaction(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(removeReactionFromMessageModel).toHaveBeenCalledWith(messageId, userEmail, emoji);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Reacción removida exitosamente'
      });
    });
  });

  describe('deleteMessage', () => {
    it('should delete message successfully', async () => {
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

      (deleteMessageModel as jest.Mock).mockResolvedValue(true);

      // Act
      await deleteMessage(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(deleteMessageModel).toHaveBeenCalledWith(messageId, userEmail);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Mensaje eliminado exitosamente'
      });
    });
  });

  describe('updateTypingIndicator', () => {
    it('should update typing indicator successfully', async () => {
      // Arrange
      const conversationId = 'conv123';
      const userEmail = 'user@example.com';
      const isTyping = true;

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        params: { conversationId },
        body: { isTyping }
      };

      (updateTypingIndicatorModel as jest.Mock).mockResolvedValue(true);

      // Act
      await updateTypingIndicator(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(updateTypingIndicatorModel).toHaveBeenCalledWith(conversationId, userEmail, isTyping);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Indicador de escritura actualizado'
      });
    });
  });
}); 