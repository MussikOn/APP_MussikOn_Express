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
exports.updateTypingIndicator = exports.deleteMessage = exports.removeReaction = exports.addReaction = exports.editMessage = exports.getAvailableUsers = exports.getChatStats = exports.getConversationById = exports.archiveConversation = exports.deleteConversation = exports.searchConversations = exports.createConversation = exports.markAsRead = exports.sendMessage = exports.getMessages = exports.getConversations = void 0;
const loggerService_1 = require("../services/loggerService");
const chatModel_1 = require("../models/chatModel");
// Obtener todas las conversaciones del usuario
const getConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        const conversations = yield (0, chatModel_1.getConversationsByUserModel)(userEmail);
        res.json({
            success: true,
            data: conversations,
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al obtener conversaciones:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.getConversations = getConversations;
// Obtener mensajes de una conversación específica
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { conversationId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        // Verificar que el usuario es participante de la conversación
        const conversation = yield (0, chatModel_1.getConversationByIdModel)(conversationId);
        if (!conversation) {
            res.status(404).json({
                success: false,
                error: 'Conversación no encontrada',
            });
            return;
        }
        if (!conversation.participants.includes(userEmail)) {
            res.status(403).json({
                success: false,
                error: 'No tienes permisos para acceder a esta conversación',
            });
            return;
        }
        const messages = yield (0, chatModel_1.getMessagesByConversationModel)(conversationId, parseInt(limit), parseInt(offset));
        // Marcar conversación como leída
        yield (0, chatModel_1.markConversationAsReadModel)(conversationId, userEmail);
        res.json({
            success: true,
            data: messages,
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al obtener mensajes:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.getMessages = getMessages;
// Enviar un mensaje
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { conversationId, content, type = 'text', metadata, replyTo } = req.body;
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        const userName = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.name) + ' ' + ((_c = req.user) === null || _c === void 0 ? void 0 : _c.lastName);
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        if (!content || content.trim() === '') {
            res.status(400).json({
                success: false,
                error: 'El contenido del mensaje es requerido',
            });
            return;
        }
        // Verificar que el usuario es participante de la conversación
        const conversation = yield (0, chatModel_1.getConversationByIdModel)(conversationId);
        if (!conversation) {
            res.status(404).json({
                success: false,
                error: 'Conversación no encontrada',
            });
            return;
        }
        if (!conversation.participants.includes(userEmail)) {
            res.status(403).json({
                success: false,
                error: 'No tienes permisos para enviar mensajes a esta conversación',
            });
            return;
        }
        const messageData = {
            conversationId,
            senderId: userEmail,
            senderName: userName,
            content: content.trim(),
            type,
            metadata,
            replyTo,
            status: 'sent',
            isEdited: false,
            isDeleted: false
        };
        const message = yield (0, chatModel_1.createMessageModel)(messageData);
        res.status(201).json({
            success: true,
            data: message,
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al enviar mensaje:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.sendMessage = sendMessage;
// Marcar mensaje como leído
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { messageId } = req.params;
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        yield (0, chatModel_1.markMessageAsReadModel)(messageId);
        res.json({
            success: true,
            message: 'Mensaje marcado como leído',
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al marcar mensaje como leído:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.markAsRead = markAsRead;
// Crear una nueva conversación
const createConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { participants, type = 'direct', name, eventId } = req.body;
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        if (!participants || !Array.isArray(participants) || participants.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Se requiere al menos un participante',
            });
            return;
        }
        // Asegurar que el usuario actual esté en los participantes
        const allParticipants = participants.includes(userEmail)
            ? participants
            : [...participants, userEmail];
        // Para conversaciones directas, verificar si ya existe
        if (type === 'direct' && allParticipants.length === 2) {
            const existingConversation = yield (0, chatModel_1.getConversationBetweenUsersModel)(allParticipants[0], allParticipants[1]);
            if (existingConversation) {
                res.json({
                    success: true,
                    data: existingConversation,
                    message: 'Conversación existente encontrada',
                });
                return;
            }
        }
        const conversation = yield (0, chatModel_1.createConversationModel)(allParticipants, type, name, eventId);
        res.status(201).json({
            success: true,
            data: conversation,
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al crear conversación:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.createConversation = createConversation;
// Buscar conversaciones
const searchConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        const filters = req.query;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        const conversations = yield (0, chatModel_1.searchConversationsModel)(userEmail, filters);
        res.json({
            success: true,
            data: conversations,
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al buscar conversaciones:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.searchConversations = searchConversations;
// Eliminar conversación
const deleteConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { conversationId } = req.params;
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        yield (0, chatModel_1.deleteConversationModel)(conversationId, userEmail);
        res.json({
            success: true,
            message: 'Conversación eliminada exitosamente',
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al eliminar conversación:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.deleteConversation = deleteConversation;
// Archivar conversación
const archiveConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { conversationId } = req.params;
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        yield (0, chatModel_1.archiveConversationModel)(conversationId, userEmail);
        res.json({
            success: true,
            message: 'Conversación archivada exitosamente',
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al archivar conversación:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.archiveConversation = archiveConversation;
// Obtener conversación por ID
const getConversationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { conversationId } = req.params;
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        const conversation = yield (0, chatModel_1.getConversationByIdModel)(conversationId);
        if (!conversation) {
            res.status(404).json({
                success: false,
                error: 'Conversación no encontrada',
            });
            return;
        }
        if (!conversation.participants.includes(userEmail)) {
            res.status(403).json({
                success: false,
                error: 'No tienes permisos para acceder a esta conversación',
            });
            return;
        }
        res.json({
            success: true,
            data: conversation,
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al obtener conversación:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.getConversationById = getConversationById;
// Obtener estadísticas del chat
const getChatStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        const stats = yield (0, chatModel_1.getChatStatsModel)(userEmail);
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al obtener estadísticas del chat:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.getChatStats = getChatStats;
// Obtener usuarios disponibles para chat
const getAvailableUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        // Importar db aquí para evitar dependencias circulares
        const { db } = require('../utils/firebase');
        // Obtener todos los usuarios excepto el actual
        const usersSnapshot = yield db.collection('users').get();
        const users = usersSnapshot.docs
            .map((doc) => doc.data())
            .filter((user) => user.userEmail !== userEmail)
            .map((user) => ({
            userEmail: user.userEmail,
            name: user.name,
            lastName: user.lastName,
            roll: user.roll
        }));
        res.json({
            success: true,
            data: users,
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al obtener usuarios disponibles:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.getAvailableUsers = getAvailableUsers;
// Editar mensaje
const editMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        if (!content || content.trim() === '') {
            res.status(400).json({
                success: false,
                error: 'El contenido del mensaje es requerido',
            });
            return;
        }
        const updatedMessage = yield (0, chatModel_1.editMessageModel)(messageId, content.trim(), userEmail);
        if (!updatedMessage) {
            res.status(404).json({
                success: false,
                error: 'Mensaje no encontrado',
            });
            return;
        }
        res.json({
            success: true,
            data: updatedMessage,
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al editar mensaje:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.editMessage = editMessage;
// Agregar reacción a mensaje
const addReaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        if (!emoji) {
            res.status(400).json({
                success: false,
                error: 'El emoji es requerido',
            });
            return;
        }
        yield (0, chatModel_1.addReactionToMessageModel)(messageId, userEmail, emoji);
        res.json({
            success: true,
            message: 'Reacción agregada exitosamente',
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al agregar reacción:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.addReaction = addReaction;
// Remover reacción de mensaje
const removeReaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        if (!emoji) {
            res.status(400).json({
                success: false,
                error: 'El emoji es requerido',
            });
            return;
        }
        yield (0, chatModel_1.removeReactionFromMessageModel)(messageId, userEmail, emoji);
        res.json({
            success: true,
            message: 'Reacción removida exitosamente',
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al remover reacción:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.removeReaction = removeReaction;
// Eliminar mensaje
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { messageId } = req.params;
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        yield (0, chatModel_1.deleteMessageModel)(messageId, userEmail);
        res.json({
            success: true,
            message: 'Mensaje eliminado exitosamente',
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al eliminar mensaje:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.deleteMessage = deleteMessage;
// Actualizar indicador de escritura
const updateTypingIndicator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { conversationId } = req.params;
        const { isTyping } = req.body;
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
            });
            return;
        }
        yield (0, chatModel_1.updateTypingIndicatorModel)(conversationId, userEmail, isTyping);
        res.json({
            success: true,
            message: 'Indicador de escritura actualizado',
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al actualizar indicador de escritura:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor',
        });
    }
});
exports.updateTypingIndicator = updateTypingIndicator;
