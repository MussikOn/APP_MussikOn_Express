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
exports.getChatStats = exports.getConversationById = exports.archiveConversation = exports.deleteConversation = exports.searchConversations = exports.createConversation = exports.markAsRead = exports.sendMessage = exports.getMessages = exports.getConversations = void 0;
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
                error: 'Usuario no autenticado'
            });
            return;
        }
        const conversations = yield (0, chatModel_1.getConversationsByUserModel)(userEmail);
        res.json({
            success: true,
            data: conversations
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al obtener conversaciones:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
});
exports.getConversations = getConversations;
// Obtener mensajes de una conversación específica
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { conversationId } = req.params;
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
            return;
        }
        // Verificar que el usuario es participante de la conversación
        const conversation = yield (0, chatModel_1.getConversationByIdModel)(conversationId);
        if (!conversation) {
            res.status(404).json({
                success: false,
                error: 'Conversación no encontrada'
            });
            return;
        }
        if (!conversation.participants.includes(userEmail)) {
            res.status(403).json({
                success: false,
                error: 'No tienes permisos para acceder a esta conversación'
            });
            return;
        }
        const messages = yield (0, chatModel_1.getMessagesByConversationModel)(conversationId);
        // Marcar conversación como leída
        yield (0, chatModel_1.markConversationAsReadModel)(conversationId, userEmail);
        res.json({
            success: true,
            data: messages
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al obtener mensajes:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
});
exports.getMessages = getMessages;
// Enviar un mensaje
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { conversationId } = req.params;
        const { content, type = 'text' } = req.body;
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        const userName = (_b = req.user) === null || _b === void 0 ? void 0 : _b.name;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
            return;
        }
        if (!content || content.trim().length === 0) {
            res.status(400).json({
                success: false,
                error: 'El contenido del mensaje es requerido'
            });
            return;
        }
        // Verificar que el usuario es participante de la conversación
        const conversation = yield (0, chatModel_1.getConversationByIdModel)(conversationId);
        if (!conversation) {
            res.status(404).json({
                success: false,
                error: 'Conversación no encontrada'
            });
            return;
        }
        if (!conversation.participants.includes(userEmail)) {
            res.status(403).json({
                success: false,
                error: 'No tienes permisos para enviar mensajes a esta conversación'
            });
            return;
        }
        const messageData = {
            conversationId,
            senderId: userEmail,
            senderName: userName || userEmail,
            content: content.trim(),
            status: 'sent',
            type: type
        };
        const message = yield (0, chatModel_1.createMessageModel)(messageData);
        res.json({
            success: true,
            data: message
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al enviar mensaje:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
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
                error: 'Usuario no autenticado'
            });
            return;
        }
        yield (0, chatModel_1.markMessageAsReadModel)(messageId);
        res.json({
            success: true,
            data: null
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al marcar mensaje como leído:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
});
exports.markAsRead = markAsRead;
// Crear una nueva conversación
const createConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { participants } = req.body;
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
            return;
        }
        if (!participants || !Array.isArray(participants) || participants.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Se requiere al menos un participante'
            });
            return;
        }
        // Asegurar que el usuario actual esté en los participantes
        const allParticipants = [...new Set([userEmail, ...participants])];
        // Verificar si ya existe una conversación entre estos usuarios
        const existingConversation = yield (0, chatModel_1.getConversationBetweenUsersModel)(userEmail, participants[0]);
        if (existingConversation) {
            res.json({
                success: true,
                data: existingConversation
            });
            return;
        }
        const conversation = yield (0, chatModel_1.createConversationModel)(allParticipants);
        res.json({
            success: true,
            data: conversation
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al crear conversación:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
});
exports.createConversation = createConversation;
// Buscar conversaciones con filtros
const searchConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        const { search, unreadOnly, dateFrom, dateTo } = req.query;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
            return;
        }
        const filters = {
            search: search,
            unreadOnly: unreadOnly === 'true',
            dateFrom: dateFrom,
            dateTo: dateTo
        };
        const conversations = yield (0, chatModel_1.searchConversationsModel)(userEmail, filters);
        res.json({
            success: true,
            data: conversations
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al buscar conversaciones:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
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
                error: 'Usuario no autenticado'
            });
            return;
        }
        yield (0, chatModel_1.deleteConversationModel)(conversationId, userEmail);
        res.json({
            success: true,
            data: null
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al eliminar conversación:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
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
                error: 'Usuario no autenticado'
            });
            return;
        }
        yield (0, chatModel_1.archiveConversationModel)(conversationId, userEmail);
        res.json({
            success: true,
            data: null
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al archivar conversación:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
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
                error: 'Usuario no autenticado'
            });
            return;
        }
        const conversation = yield (0, chatModel_1.getConversationByIdModel)(conversationId);
        if (!conversation) {
            res.status(404).json({
                success: false,
                error: 'Conversación no encontrada'
            });
            return;
        }
        if (!conversation.participants.includes(userEmail)) {
            res.status(403).json({
                success: false,
                error: 'No tienes permisos para acceder a esta conversación'
            });
            return;
        }
        res.json({
            success: true,
            data: conversation
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al obtener conversación:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
});
exports.getConversationById = getConversationById;
// Obtener estadísticas de chat
const getChatStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
        if (!userEmail) {
            res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
            return;
        }
        const stats = yield (0, chatModel_1.getChatStatsModel)(userEmail);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error al obtener estadísticas de chat:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
});
exports.getChatStats = getChatStats;
