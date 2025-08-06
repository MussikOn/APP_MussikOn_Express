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
// Mock de todas las dependencias
jest.mock('../models/chatModel');
jest.mock('../services/loggerService', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn()
    }
}));
describe('ChatController', () => {
    let mockRequest;
    let mockResponse;
    let mockJson;
    let mockStatus;
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
        it('should return conversations successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
    });
    describe('getMessages', () => {
        it('should return messages successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            expect(chatModel_1.getMessagesByConversationModel).toHaveBeenCalledWith(conversationId, 50, 0);
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
                    name: 'Test User',
                    lastName: 'Test'
                },
                body: {
                    conversationId,
                    content: messageContent,
                    type: 'text'
                }
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
                message: 'Mensaje marcado como leído'
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
            chatModel_1.getConversationBetweenUsersModel.mockResolvedValue(null);
            chatModel_1.createConversationModel.mockResolvedValue(mockConversation);
            // Act
            yield (0, chatController_1.createConversation)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.getConversationBetweenUsersModel).toHaveBeenCalledWith(participantEmail, userEmail);
            expect(chatModel_1.createConversationModel).toHaveBeenCalledWith([participantEmail, userEmail], 'direct', undefined, undefined);
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockConversation
            });
        }));
    });
    describe('searchConversations', () => {
        it('should search conversations successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.searchConversationsModel.mockResolvedValue(mockConversations);
            // Act
            yield (0, chatController_1.searchConversations)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.searchConversationsModel).toHaveBeenCalledWith(userEmail, { search: 'test' });
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
            chatModel_1.deleteConversationModel.mockResolvedValue(true);
            // Act
            yield (0, chatController_1.deleteConversation)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.deleteConversationModel).toHaveBeenCalledWith(conversationId, userEmail);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Conversación eliminada exitosamente'
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
            chatModel_1.archiveConversationModel.mockResolvedValue(true);
            // Act
            yield (0, chatController_1.archiveConversation)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.archiveConversationModel).toHaveBeenCalledWith(conversationId, userEmail);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Conversación archivada exitosamente'
            });
        }));
    });
    describe('getConversationById', () => {
        it('should return conversation by ID successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
    });
    describe('getChatStats', () => {
        it('should return chat statistics successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            yield (0, chatController_1.getAvailableUsers)(mockRequest, mockResponse);
            // Assert
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: expect.any(Array)
            });
        }));
    });
    describe('editMessage', () => {
        it('should edit message successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.editMessageModel.mockResolvedValue(mockMessage);
            // Act
            yield (0, chatController_1.editMessage)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.editMessageModel).toHaveBeenCalledWith(messageId, newContent, userEmail);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockMessage
            });
        }));
    });
    describe('addReaction', () => {
        it('should add reaction successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.addReactionToMessageModel.mockResolvedValue(true);
            // Act
            yield (0, chatController_1.addReaction)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.addReactionToMessageModel).toHaveBeenCalledWith(messageId, userEmail, emoji);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Reacción agregada exitosamente'
            });
        }));
    });
    describe('removeReaction', () => {
        it('should remove reaction successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.removeReactionFromMessageModel.mockResolvedValue(true);
            // Act
            yield (0, chatController_1.removeReaction)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.removeReactionFromMessageModel).toHaveBeenCalledWith(messageId, userEmail, emoji);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Reacción removida exitosamente'
            });
        }));
    });
    describe('deleteMessage', () => {
        it('should delete message successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.deleteMessageModel.mockResolvedValue(true);
            // Act
            yield (0, chatController_1.deleteMessage)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.deleteMessageModel).toHaveBeenCalledWith(messageId, userEmail);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Mensaje eliminado exitosamente'
            });
        }));
    });
    describe('updateTypingIndicator', () => {
        it('should update typing indicator successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            chatModel_1.updateTypingIndicatorModel.mockResolvedValue(true);
            // Act
            yield (0, chatController_1.updateTypingIndicator)(mockRequest, mockResponse);
            // Assert
            expect(chatModel_1.updateTypingIndicatorModel).toHaveBeenCalledWith(conversationId, userEmail, isTyping);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Indicador de escritura actualizado'
            });
        }));
    });
});
