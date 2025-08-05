"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chatController_1 = require("../controllers/chatController");
const chatModel_1 = require("../models/chatModel");
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
    let mockRequest;
    let mockResponse;
    let mockStatus;
    let mockJson;
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
        it('should return user conversations successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.getConversationsByUserModel.mockResolvedValue(mockConversations);
            // Act
            yield (0, chatController_1.getConversations)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.getConversationsByUserModel).toHaveBeenCalledWith(userEmail);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockConversations
            });
        }));
        it('should return error when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest = {
                user: undefined
            };
            // Act
            yield (0, chatController_1.getConversations)(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: 'Usuario no autenticado'
            });
        }));
    });
    describe('getMessages', () => {
        it('should return messages successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.getConversationByIdModel.mockResolvedValue({
                id: conversationId,
                participants: [userEmail, 'other@example.com']
            });
            chatModel_1.getMessagesByConversationModel.mockResolvedValue(mockMessages);
            chatModel_1.markConversationAsReadModel.mockResolvedValue(undefined);
            // Act
            yield (0, chatController_1.getMessages)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.getConversationByIdModel).toHaveBeenCalledWith(conversationId);
            expect(chatModel_1.getMessagesByConversationModel).toHaveBeenCalledWith(conversationId);
            expect(chatModel_1.markConversationAsReadModel).toHaveBeenCalledWith(conversationId, userEmail);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockMessages
            });
        }));
    });
    describe('sendMessage', () => {
        it('should send message successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.getConversationByIdModel.mockResolvedValue({
                id: conversationId,
                participants: [userEmail, 'other@example.com']
            });
            chatModel_1.createMessageModel.mockResolvedValue(mockMessage);
            // Act
            yield (0, chatController_1.sendMessage)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.getConversationByIdModel).toHaveBeenCalledWith(conversationId);
            expect(chatModel_1.createMessageModel).toHaveBeenCalledWith({
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
        }));
    });
    describe('markAsRead', () => {
        it('should mark message as read successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.markMessageAsReadModel.mockResolvedValue(undefined);
            // Act
            yield (0, chatController_1.markAsRead)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.markMessageAsReadModel).toHaveBeenCalledWith(messageId);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: null
            });
        }));
    });
    describe('createConversation', () => {
        it('should create conversation successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.getConversationBetweenUsersModel.mockResolvedValue(null);
            chatModel_1.createConversationModel.mockResolvedValue(mockConversation);
            // Act
            yield (0, chatController_1.createConversation)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.getConversationBetweenUsersModel).toHaveBeenCalledWith(userEmail, participantEmail);
            expect(chatModel_1.createConversationModel).toHaveBeenCalledWith([userEmail, participantEmail]);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockConversation
            });
        }));
        it('should return error when participant email is missing', () => __awaiter(void 0, void 0, void 0, function* () {
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
            yield (0, chatController_1.createConversation)(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: 'Se requiere al menos un participante'
            });
        }));
    });
    describe('searchConversations', () => {
        it('should search conversations successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.searchConversationsModel.mockResolvedValue(mockConversations);
            // Act
            yield (0, chatController_1.searchConversations)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.searchConversationsModel).toHaveBeenCalledWith(userEmail, {
                dateFrom: undefined,
                dateTo: undefined,
                search: searchTerm,
                unreadOnly: false
            });
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockConversations
            });
        }));
    });
    describe('deleteConversation', () => {
        it('should delete conversation successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.deleteConversationModel.mockResolvedValue(undefined);
            // Act
            yield (0, chatController_1.deleteConversation)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.deleteConversationModel).toHaveBeenCalledWith(conversationId, userEmail);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: null
            });
        }));
    });
    describe('archiveConversation', () => {
        it('should archive conversation successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.archiveConversationModel.mockResolvedValue(undefined);
            // Act
            yield (0, chatController_1.archiveConversation)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.archiveConversationModel).toHaveBeenCalledWith(conversationId, userEmail);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: null
            });
        }));
    });
    describe('getConversationById', () => {
        it('should return conversation by id successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.getConversationByIdModel.mockResolvedValue(mockConversation);
            // Act
            yield (0, chatController_1.getConversationById)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.getConversationByIdModel).toHaveBeenCalledWith(conversationId);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockConversation
            });
        }));
        it('should return 404 when conversation not found', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.getConversationByIdModel.mockResolvedValue(null);
            // Act
            yield (0, chatController_1.getConversationById)(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: 'Conversación no encontrada'
            });
        }));
    });
    describe('getChatStats', () => {
        it('should return chat stats successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.getChatStatsModel.mockResolvedValue(mockStats);
            // Act
            yield (0, chatController_1.getChatStats)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.getChatStatsModel).toHaveBeenCalledWith(userEmail);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockStats
            });
        }));
    });
    describe('getAvailableUsers', () => {
        it('should return available users successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            yield (0, chatController_1.getAvailableUsers)(mockRequest, mockResponse);
            // Assert
            expect(mockResponse.json).toHaveBeenCalled();
        }));
    });
});
