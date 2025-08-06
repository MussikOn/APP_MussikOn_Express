import { ChatService } from '../services/chatService';
import { db } from '../utils/firebase';
import { logger } from '../services/loggerService';
import * as admin from 'firebase-admin';

// Mock Firebase
jest.mock('../utils/firebase', () => ({
  db: {
    collection: jest.fn(),
    batch: jest.fn(() => ({
      update: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    })),
  },
}));

// Mock logger
jest.mock('../services/loggerService', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock firebase-admin for FieldValue
jest.mock('firebase-admin', () => ({
  firestore: {
    FieldValue: {
      increment: jest.fn((value) => ({ __op: 'increment', value })),
      arrayRemove: jest.fn((value) => ({ __op: 'arrayRemove', value })),
      arrayUnion: jest.fn((value) => ({ __op: 'arrayUnion', value })),
    },
  },
}));

describe('ChatService', () => {
  let chatService: ChatService;
  let mockCollection: jest.Mocked<any>;
  let mockDoc: jest.Mocked<any>;
  let mockQuery: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDoc = {
      id: 'test-id',
      data: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
    };

    mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
      doc: jest.fn().mockReturnValue(mockDoc),
    };

    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
      add: jest.fn(),
      where: jest.fn().mockReturnValue(mockQuery),
      orderBy: jest.fn().mockReturnValue(mockQuery),
      limit: jest.fn().mockReturnValue(mockQuery),
      get: jest.fn().mockResolvedValue({
        docs: [],
        size: 0
      }),
    };

    (db.collection as jest.Mock).mockReturnValue(mockCollection);
    
    chatService = ChatService.getInstance();
  });

  describe('createConversation', () => {
    it('should create direct conversation successfully', async () => {
      const participants = ['user1', 'user2'];
      const type = 'direct';

      // Mock users collection
      const mockUsersSnapshot = {
        docs: [
          { data: () => ({ userEmail: 'user1' }) },
          { data: () => ({ userEmail: 'user2' }) },
        ],
      };
      (db.collection as jest.Mock).mockReturnValueOnce({
        ...mockCollection,
        get: jest.fn().mockResolvedValue(mockUsersSnapshot)
      });
      
      // Mock conversation search
      (db.collection as jest.Mock).mockReturnValueOnce({
        ...mockCollection,
        get: jest.fn().mockResolvedValue({
          docs: []
        })
      });

      // Mock conversation creation
      mockDoc.set.mockResolvedValue(undefined);

      const result = await chatService.createConversation(participants, type);

      expect(result).toHaveProperty('id', 'test-id');
      expect(result).toHaveProperty('participants', participants);
      expect(result).toHaveProperty('type', type);
      expect(mockDoc.set).toHaveBeenCalled();
    });

    it('should create group conversation successfully', async () => {
      const participants = ['user1', 'user2', 'user3'];
      const type = 'group';
      const name = 'Test Group';

      // Mock users collection
      const mockUsersSnapshot = {
        docs: [
          { data: () => ({ userEmail: 'user1' }) },
          { data: () => ({ userEmail: 'user2' }) },
          { data: () => ({ userEmail: 'user3' }) },
        ],
      };
      (db.collection as jest.Mock).mockReturnValueOnce({
        ...mockCollection,
        get: jest.fn().mockResolvedValue(mockUsersSnapshot)
      });

      // Mock conversation creation
      mockDoc.set.mockResolvedValue(undefined);

      const result = await chatService.createConversation(participants, type, name);

      expect(result).toHaveProperty('id', 'test-id');
      expect(result).toHaveProperty('participants', participants);
      expect(result).toHaveProperty('type', type);
      expect(result).toHaveProperty('name', name);
      expect(mockDoc.set).toHaveBeenCalled();
    });

    it('should throw error for empty participants', async () => {
      await expect(chatService.createConversation([], 'direct')).rejects.toThrow(
        'Se requiere al menos un participante'
      );
    });

    it('should throw error for invalid participants', async () => {
      const participants = ['user1', 'invalid_user'];
      
      // Mock users collection with only one valid user
      const mockUsersSnapshot = {
        docs: [
          { data: () => ({ userEmail: 'user1' }) },
        ],
      };
      (db.collection as jest.Mock).mockReturnValueOnce({
        ...mockCollection,
        get: jest.fn().mockResolvedValue(mockUsersSnapshot)
      });

      await expect(chatService.createConversation(participants, 'direct')).rejects.toThrow(
        'Usuarios no encontrados: invalid_user'
      );
    });
  });

  describe('sendMessage', () => {
    it('should send text message successfully', async () => {
      const conversationId = 'conversation123';
      const senderId = 'user1';
      const senderName = 'John Doe';
      const content = 'Hello world!';
      const type = 'text';

      // Mock conversation exists
      const mockConversation = {
        participants: ['user1', 'user2'],
        type: 'direct',
      };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockConversation,
      });

      // Mock message creation
      mockDoc.set.mockResolvedValue(undefined);

      const result = await chatService.sendMessage(conversationId, senderId, senderName, content, type);

      expect(result).toHaveProperty('id', 'test-id');
      expect(result).toHaveProperty('conversationId', conversationId);
      expect(result).toHaveProperty('senderId', senderId);
      expect(result).toHaveProperty('content', content);
      expect(result).toHaveProperty('type', type);
      expect(mockDoc.set).toHaveBeenCalled();
    });

    it('should send image message successfully', async () => {
      const conversationId = 'conversation123';
      const senderId = 'user1';
      const senderName = 'John Doe';
      const content = 'Check this image';
      const type = 'image';
      const metadata = {
        fileUrl: 'https://example.com/image.jpg',
        fileName: 'image.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
      };

      // Mock conversation exists
      const mockConversation = {
        participants: ['user1', 'user2'],
        type: 'direct',
      };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockConversation,
      });

      // Mock message creation
      mockDoc.set.mockResolvedValue(undefined);

      const result = await chatService.sendMessage(conversationId, senderId, senderName, content, type, metadata);

      expect(result).toHaveProperty('id', 'test-id');
      expect(result).toHaveProperty('type', type);
      expect(result).toHaveProperty('metadata', metadata);
      expect(mockDoc.set).toHaveBeenCalled();
    });

    it('should throw error when conversation not found', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      await expect(
        chatService.sendMessage('non-existent', 'user1', 'John Doe', 'Hello', 'text')
      ).rejects.toThrow('Conversación no encontrada');
    });

    it('should throw error when sender not in conversation', async () => {
      const mockConversation = {
        participants: ['user2', 'user3'],
        type: 'direct',
      };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockConversation,
      });

      await expect(
        chatService.sendMessage('conversation123', 'user1', 'John Doe', 'Hello', 'text')
      ).rejects.toThrow('No tienes permisos para enviar mensajes a esta conversación');
    });
  });

  describe('editMessage', () => {
    it('should edit message successfully', async () => {
      const messageId = 'message123';
      const newContent = 'Updated message';
      const userEmail = 'user1';

      // Mock message exists and belongs to user
      const mockMessage = {
        senderId: 'user1',
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        isDeleted: false,
      };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockMessage,
      });

      // Mock message update
      mockDoc.update.mockResolvedValue(undefined);

      const result = await chatService.editMessage(messageId, newContent, userEmail);

      expect(result).toHaveProperty('content', newContent);
      expect(result).toHaveProperty('isEdited', true);
      expect(mockDoc.update).toHaveBeenCalled();
    });

    it('should return null when message not found', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const result = await chatService.editMessage('non-existent', 'Updated message', 'user1');

      expect(result).toBeNull();
    });

    it('should throw error when user is not the sender', async () => {
      const mockMessage = {
        senderId: 'user2',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        isDeleted: false,
      };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockMessage,
      });

      await expect(
        chatService.editMessage('message123', 'Updated message', 'user1')
      ).rejects.toThrow('No tienes permisos para editar este mensaje');
    });

    it('should throw error when message is too old', async () => {
      const mockMessage = {
        senderId: 'user1',
        timestamp: new Date(Date.now() - 1000000).toISOString(), // More than 15 minutes ago
        isDeleted: false,
      };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockMessage,
      });

      await expect(
        chatService.editMessage('message123', 'Updated message', 'user1')
      ).rejects.toThrow('No se puede editar un mensaje después de 15 minutos');
    });
  });

  describe('addReaction', () => {
    it('should add reaction successfully', async () => {
      const messageId = 'message123';
      const userEmail = 'user1';
      const emoji = '👍';

      // Mock message exists with conversation
      const mockMessage = {
        conversationId: 'conv123',
        reactions: {},
        isDeleted: false,
      };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockMessage,
      });

      // Mock conversation exists and user is participant
      const mockConversation = {
        participants: ['user1', 'user2'],
      };
      
      // Mock the getConversationById method by mocking the collection call
      (db.collection as jest.Mock).mockReturnValueOnce({
        ...mockCollection,
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => mockConversation,
          }),
        }),
      });

      // Mock message update
      mockDoc.update.mockResolvedValue(undefined);

      await chatService.addReaction(messageId, userEmail, emoji);

      expect(mockDoc.update).toHaveBeenCalledWith({
        'reactions.user1': admin.firestore.FieldValue.arrayUnion(emoji),
      });
    });

    it('should add reaction to existing reactions', async () => {
      const messageId = 'message123';
      const userEmail = 'user2';
      const emoji = '👍';

      // Mock message exists with conversation
      const mockMessage = {
        conversationId: 'conv123',
        reactions: { '👍': ['user1'] },
        isDeleted: false,
      };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockMessage,
      });

      // Mock conversation exists and user is participant
      const mockConversation = {
        participants: ['user1', 'user2'],
      };
      
      // Mock the getConversationById method by mocking the collection call
      (db.collection as jest.Mock).mockReturnValueOnce({
        ...mockCollection,
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => mockConversation,
          }),
        }),
      });

      // Mock message update
      mockDoc.update.mockResolvedValue(undefined);

      await chatService.addReaction(messageId, userEmail, emoji);

      expect(mockDoc.update).toHaveBeenCalledWith({
        'reactions.user2': admin.firestore.FieldValue.arrayUnion(emoji),
      });
    });

    it('should throw error when message not found', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      await expect(
        chatService.addReaction('non-existent', 'user1', '👍')
      ).rejects.toThrow('Mensaje no encontrado');
    });
  });

  describe('removeReaction', () => {
    it('should remove reaction successfully', async () => {
      const messageId = 'message123';
      const userEmail = 'user1';
      const emoji = '👍';

      // Mock message exists with reactions
      const mockMessage = {
        reactions: { '👍': ['user1', 'user2'] },
        isDeleted: false,
      };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockMessage,
      });

      // Mock message update
      mockDoc.update.mockResolvedValue(undefined);

      await chatService.removeReaction(messageId, userEmail, emoji);

      expect(mockDoc.update).toHaveBeenCalledWith({
        'reactions.user1': admin.firestore.FieldValue.arrayRemove(emoji),
      });
    });

    it('should remove emoji completely when no reactions left', async () => {
      const messageId = 'message123';
      const userEmail = 'user1';
      const emoji = '👍';

      // Mock message exists with only one reaction
      const mockMessage = {
        reactions: { '👍': ['user1'] },
        isDeleted: false,
      };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockMessage,
      });

      // Mock message update
      mockDoc.update.mockResolvedValue(undefined);

      await chatService.removeReaction(messageId, userEmail, emoji);

      expect(mockDoc.update).toHaveBeenCalledWith({
        'reactions.user1': admin.firestore.FieldValue.arrayRemove(emoji),
      });
    });
  });

  describe('deleteMessage', () => {
    it('should delete message successfully', async () => {
      const messageId = 'message123';
      const userEmail = 'user1';

      // Mock message exists and belongs to user
      const mockMessage = {
        senderId: 'user1',
        isDeleted: false,
      };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockMessage,
      });

      // Mock message update
      mockDoc.update.mockResolvedValue(undefined);

      await chatService.deleteMessage(messageId, userEmail);

      expect(mockDoc.update).toHaveBeenCalledWith({
        isDeleted: true,
        deletedAt: expect.any(String),
        content: 'Mensaje eliminado',
      });
    });

    it('should throw error when user is not the sender', async () => {
      const mockMessage = {
        senderId: 'user2',
        isDeleted: false,
      };
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockMessage,
      });

      await expect(
        chatService.deleteMessage('message123', 'user1')
      ).rejects.toThrow('No tienes permisos para eliminar este mensaje');
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark conversation as read successfully', async () => {
      const conversationId = 'conversation123';
      const userEmail = 'user1';

      // Mock unread messages
      const mockMessages = [
        { id: '1', data: () => ({ isRead: false }), ref: { update: jest.fn() } },
        { id: '2', data: () => ({ isRead: false }), ref: { update: jest.fn() } },
      ];

      mockQuery.get.mockResolvedValue({
        size: 2,
        docs: mockMessages,
      });

      // Mock batch operations
      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      (db.batch as jest.Mock).mockReturnValue(mockBatch);

      await chatService.markConversationAsRead(conversationId, userEmail);

      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  describe('getChatStats', () => {
    it('should return chat statistics', async () => {
      const userEmail = 'user1';

      // Mock conversations
      const mockConversations = [
        { id: '1', data: () => ({ unreadCount: 5 }) },
        { id: '2', data: () => ({ unreadCount: 3 }) },
      ];

      // Mock messages
      const mockMessages = [
        { id: '1', data: () => ({ timestamp: new Date().toISOString() }) },
        { id: '2', data: () => ({ timestamp: new Date().toISOString() }) },
      ];

      mockQuery.get
        .mockResolvedValueOnce({
          size: 2,
          docs: mockConversations,
        })
        .mockResolvedValueOnce({
          size: 2,
          docs: mockMessages,
        })
        .mockResolvedValueOnce({
          size: 2,
          docs: mockMessages,
        })
        .mockResolvedValueOnce({
          size: 2,
          docs: mockMessages,
        });

      const result = await chatService.getChatStats(userEmail);

      expect(result).toHaveProperty('totalConversations', 2);
      expect(result).toHaveProperty('unreadMessages', 8);
      expect(result).toHaveProperty('totalMessages', 2);
    });
  });

  describe('searchConversations', () => {
    it('should search conversations successfully', async () => {
      const userEmail = 'user1';
      const filters = {
        search: 'test',
        unreadOnly: false,
        type: 'direct' as const,
      };

      // Mock conversations
      const mockConversations = [
        { id: '1', data: () => ({ name: 'Test Conversation' }) },
      ];

      mockQuery.get.mockResolvedValue({
        size: 1,
        docs: mockConversations,
      });

      const result = await chatService.searchConversations(userEmail, filters);

      expect(result).toHaveLength(1);
    });

    it('should filter by unread only', async () => {
      const userEmail = 'user1';
      const filters = {
        unreadOnly: true,
      };

      // Mock conversations - when unreadOnly is true, only return conversations with unreadCount > 0
      const mockConversations = [
        { id: '1', data: () => ({ unreadCount: 5 }) },
      ];

      mockQuery.get.mockResolvedValue({
        size: 1,
        docs: mockConversations,
      });

      const result = await chatService.searchConversations(userEmail, filters);

      expect(result).toHaveLength(1); // Only unread conversations
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockQuery.get.mockRejectedValue(new Error('Database error'));

      await expect(chatService.getChatStats('user1')).rejects.toThrow('Database error');
    });

    it('should handle validation errors', async () => {
      await expect(chatService.createConversation([], 'direct')).rejects.toThrow(
        'Se requiere al menos un participante'
      );
    });
  });

  describe('Singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ChatService.getInstance();
      const instance2 = ChatService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
}); 