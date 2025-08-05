"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.chatService = exports.ChatService = void 0;
const firebase_1 = require("../utils/firebase");
const loggerService_1 = require("./loggerService");
const pushNotificationService_1 = require("./pushNotificationService");
const admin = __importStar(require("firebase-admin"));
class ChatService {
    static getInstance() {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService();
        }
        return ChatService.instance;
    }
    /**
     * Crear conversación con validaciones avanzadas
     */
    createConversation(participants_1) {
        return __awaiter(this, arguments, void 0, function* (participants, type = 'direct', name, eventId, creatorEmail) {
            try {
                // Validar participantes
                if (!participants || participants.length === 0) {
                    throw new Error('Se requiere al menos un participante');
                }
                // Verificar que todos los participantes existen
                const usersSnapshot = yield firebase_1.db.collection('users').get();
                const existingUsers = usersSnapshot.docs.map(doc => doc.data().userEmail);
                const invalidParticipants = participants.filter(p => !existingUsers.includes(p));
                if (invalidParticipants.length > 0) {
                    throw new Error(`Usuarios no encontrados: ${invalidParticipants.join(', ')}`);
                }
                // Para conversaciones directas, verificar si ya existe
                if (type === 'direct' && participants.length === 2) {
                    const existingConversation = yield this.getConversationBetweenUsers(participants[0], participants[1]);
                    if (existingConversation) {
                        return existingConversation;
                    }
                }
                // Crear la conversación
                const now = new Date().toISOString();
                const conversationRef = firebase_1.db.collection('conversations').doc();
                const conversation = {
                    id: conversationRef.id,
                    participants,
                    unreadCount: 0,
                    updatedAt: now,
                    isActive: true,
                    createdAt: now,
                    type,
                    name,
                    eventId,
                    settings: {
                        notifications: true,
                        muted: false,
                        pinned: false
                    },
                    typingUsers: []
                };
                yield conversationRef.set(conversation);
                // Notificar a los participantes sobre la nueva conversación
                participants.forEach(participant => {
                    if (participant !== creatorEmail) {
                        this.sendConversationNotification(participant, {
                            type: 'new_message',
                            conversationId: conversation.id,
                            senderId: creatorEmail || participants[0],
                            senderName: 'Sistema',
                            message: `Nueva conversación creada: ${name || 'Chat'}`,
                            timestamp: now
                        });
                    }
                });
                loggerService_1.logger.info('Conversación creada:', { metadata: { id: conversation.id, type, participants } });
                return conversation;
            }
            catch (error) {
                loggerService_1.logger.error('Error al crear conversación:', error);
                throw error;
            }
        });
    }
    /**
     * Enviar mensaje con validaciones y notificaciones
     */
    sendMessage(conversationId_1, senderId_1, senderName_1, content_1) {
        return __awaiter(this, arguments, void 0, function* (conversationId, senderId, senderName, content, type = 'text', metadata, replyTo) {
            try {
                // Verificar que la conversación existe y el usuario es participante
                const conversation = yield this.getConversationById(conversationId);
                if (!conversation) {
                    throw new Error('Conversación no encontrada');
                }
                if (!conversation.participants.includes(senderId)) {
                    throw new Error('No tienes permisos para enviar mensajes a esta conversación');
                }
                // Validar contenido según el tipo
                if (type === 'text' && (!content || content.trim() === '')) {
                    throw new Error('El contenido del mensaje es requerido');
                }
                // Crear el mensaje
                const now = new Date().toISOString();
                const messageRef = firebase_1.db.collection('messages').doc();
                const message = {
                    id: messageRef.id,
                    conversationId,
                    senderId,
                    senderName,
                    content: content.trim(),
                    timestamp: now,
                    status: 'sent',
                    type,
                    metadata,
                    replyTo,
                    isEdited: false,
                    isDeleted: false,
                    reactions: {}
                };
                yield messageRef.set(message);
                // Actualizar la conversación
                yield this.updateConversationLastMessage(conversationId, message);
                // Enviar notificaciones push a participantes no conectados
                yield this.sendMessageNotifications(conversation, message);
                loggerService_1.logger.info('Mensaje enviado:', { metadata: { id: message.id, conversationId } });
                return message;
            }
            catch (error) {
                loggerService_1.logger.error('Error al enviar mensaje:', error);
                throw error;
            }
        });
    }
    /**
     * Editar mensaje con validaciones
     */
    editMessage(messageId, newContent, userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messageRef = firebase_1.db.collection('messages').doc(messageId);
                const messageSnap = yield messageRef.get();
                if (!messageSnap.exists) {
                    return null;
                }
                const message = messageSnap.data();
                // Verificar permisos
                if (message.senderId !== userEmail) {
                    throw new Error('No tienes permisos para editar este mensaje');
                }
                // Verificar que no han pasado más de 15 minutos
                const messageTime = new Date(message.timestamp);
                const now = new Date();
                const timeDiff = now.getTime() - messageTime.getTime();
                const minutesDiff = timeDiff / (1000 * 60);
                if (minutesDiff > 15) {
                    throw new Error('No se puede editar un mensaje después de 15 minutos');
                }
                const updatedAt = new Date().toISOString();
                const updatedMessage = Object.assign(Object.assign({}, message), { content: newContent.trim(), editedAt: updatedAt, isEdited: true });
                yield messageRef.update({
                    content: newContent.trim(),
                    editedAt: updatedAt,
                    isEdited: true
                });
                loggerService_1.logger.info('Mensaje editado:', { metadata: { id: messageId, userEmail } });
                return updatedMessage;
            }
            catch (error) {
                loggerService_1.logger.error('Error al editar mensaje:', error);
                throw error;
            }
        });
    }
    /**
     * Agregar reacción a mensaje
     */
    addReaction(messageId, userEmail, emoji) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messageRef = firebase_1.db.collection('messages').doc(messageId);
                const messageSnap = yield messageRef.get();
                if (!messageSnap.exists) {
                    throw new Error('Mensaje no encontrado');
                }
                const message = messageSnap.data();
                // Verificar que el usuario es participante de la conversación
                const conversation = yield this.getConversationById(message.conversationId);
                if (!conversation || !conversation.participants.includes(userEmail)) {
                    throw new Error('No tienes permisos para reaccionar a este mensaje');
                }
                yield messageRef.update({
                    [`reactions.${userEmail}`]: admin.firestore.FieldValue.arrayUnion(emoji)
                });
                loggerService_1.logger.info('Reacción agregada:', { metadata: { messageId, userEmail, emoji } });
            }
            catch (error) {
                loggerService_1.logger.error('Error al agregar reacción:', error);
                throw error;
            }
        });
    }
    /**
     * Remover reacción de mensaje
     */
    removeReaction(messageId, userEmail, emoji) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messageRef = firebase_1.db.collection('messages').doc(messageId);
                yield messageRef.update({
                    [`reactions.${userEmail}`]: admin.firestore.FieldValue.arrayRemove(emoji)
                });
                loggerService_1.logger.info('Reacción removida:', { metadata: { messageId, userEmail, emoji } });
            }
            catch (error) {
                loggerService_1.logger.error('Error al remover reacción:', error);
                throw error;
            }
        });
    }
    /**
     * Eliminar mensaje (soft delete)
     */
    deleteMessage(messageId, userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messageRef = firebase_1.db.collection('messages').doc(messageId);
                const messageSnap = yield messageRef.get();
                if (!messageSnap.exists) {
                    throw new Error('Mensaje no encontrado');
                }
                const message = messageSnap.data();
                // Verificar permisos
                if (message.senderId !== userEmail) {
                    throw new Error('No tienes permisos para eliminar este mensaje');
                }
                const now = new Date().toISOString();
                yield messageRef.update({
                    isDeleted: true,
                    deletedAt: now,
                    content: 'Mensaje eliminado'
                });
                loggerService_1.logger.info('Mensaje eliminado:', { metadata: { messageId, userEmail } });
            }
            catch (error) {
                loggerService_1.logger.error('Error al eliminar mensaje:', error);
                throw error;
            }
        });
    }
    /**
     * Marcar conversación como leída
     */
    markConversationAsRead(conversationId, userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conversationRef = firebase_1.db.collection('conversations').doc(conversationId);
                yield conversationRef.update({
                    unreadCount: 0
                });
                // Marcar todos los mensajes no leídos como leídos
                const messagesSnapshot = yield firebase_1.db
                    .collection('messages')
                    .where('conversationId', '==', conversationId)
                    .where('senderId', '!=', userEmail)
                    .where('status', '!=', 'read')
                    .get();
                const batch = firebase_1.db.batch();
                messagesSnapshot.docs.forEach(doc => {
                    batch.update(doc.ref, { status: 'read' });
                });
                yield batch.commit();
                loggerService_1.logger.info('Conversación marcada como leída:', { metadata: { conversationId, userEmail } });
            }
            catch (error) {
                loggerService_1.logger.error('Error al marcar conversación como leída:', error);
                throw error;
            }
        });
    }
    /**
     * Obtener estadísticas avanzadas del chat
     */
    getChatStats(userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conversations = yield this.getConversationsByUser(userEmail);
                // Obtener mensajes de las últimas semanas
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                const messagesSnapshot = yield firebase_1.db
                    .collection('messages')
                    .where('senderId', '==', userEmail)
                    .where('timestamp', '>=', weekAgo.toISOString())
                    .get();
                const messagesThisWeek = messagesSnapshot.docs.length;
                const monthMessagesSnapshot = yield firebase_1.db
                    .collection('messages')
                    .where('senderId', '==', userEmail)
                    .where('timestamp', '>=', monthAgo.toISOString())
                    .get();
                const messagesThisMonth = monthMessagesSnapshot.docs.length;
                // Encontrar conversación más activa
                let mostActiveConversation = null;
                let maxMessages = 0;
                for (const conv of conversations) {
                    const convMessagesSnapshot = yield firebase_1.db
                        .collection('messages')
                        .where('conversationId', '==', conv.id)
                        .get();
                    const messageCount = convMessagesSnapshot.docs.length;
                    if (messageCount > maxMessages) {
                        maxMessages = messageCount;
                        mostActiveConversation = {
                            id: conv.id,
                            name: conv.name || conv.participants.join(', '),
                            messageCount
                        };
                    }
                }
                const stats = {
                    totalConversations: conversations.length,
                    unreadMessages: conversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
                    activeConversations: conversations.filter(conv => conv.unreadCount > 0).length,
                    totalMessages: 0, // Se calcularía con una consulta adicional
                    messagesThisWeek,
                    messagesThisMonth,
                    mostActiveConversation: mostActiveConversation || undefined
                };
                return stats;
            }
            catch (error) {
                loggerService_1.logger.error('Error al obtener estadísticas del chat:', error);
                throw error;
            }
        });
    }
    /**
     * Buscar conversaciones con filtros avanzados
     */
    searchConversations(userEmail, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let query = firebase_1.db
                    .collection('conversations')
                    .where('participants', 'array-contains', userEmail)
                    .where('isActive', '==', true);
                if (filters.type) {
                    query = query.where('type', '==', filters.type);
                }
                if (filters.unreadOnly) {
                    query = query.where('unreadCount', '>', 0);
                }
                const snapshot = yield query.get();
                let conversations = snapshot.docs.map(doc => doc.data());
                // Filtrar por fecha
                if (filters.dateFrom || filters.dateTo) {
                    conversations = conversations.filter(conv => {
                        const convDate = new Date(conv.updatedAt);
                        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
                        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
                        if (fromDate && convDate < fromDate)
                            return false;
                        if (toDate && convDate > toDate)
                            return false;
                        return true;
                    });
                }
                // Buscar por texto
                if (filters.search) {
                    const searchTerm = filters.search.toLowerCase();
                    conversations = conversations.filter(conv => {
                        var _a, _b;
                        return (((_a = conv.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm)) ||
                            ((_b = conv.lastMessage) === null || _b === void 0 ? void 0 : _b.content.toLowerCase().includes(searchTerm)) ||
                            conv.participants.some(p => p.toLowerCase().includes(searchTerm)));
                    });
                }
                // Filtrar por participantes
                if (filters.participants && filters.participants.length > 0) {
                    conversations = conversations.filter(conv => filters.participants.some(p => conv.participants.includes(p)));
                }
                return conversations.sort((a, b) => {
                    const dateA = new Date(a.updatedAt);
                    const dateB = new Date(b.updatedAt);
                    return dateB.getTime() - dateA.getTime();
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error al buscar conversaciones:', error);
                throw error;
            }
        });
    }
    // Métodos privados auxiliares
    getConversationById(conversationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversationRef = firebase_1.db.collection('conversations').doc(conversationId);
            const conversationSnap = yield conversationRef.get();
            if (!conversationSnap.exists) {
                return null;
            }
            return conversationSnap.data();
        });
    }
    getConversationsByUser(userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield firebase_1.db
                .collection('conversations')
                .where('participants', 'array-contains', userEmail)
                .where('isActive', '==', true)
                .orderBy('updatedAt', 'desc')
                .get();
            return snapshot.docs.map(doc => doc.data());
        });
    }
    getConversationBetweenUsers(user1, user2) {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield firebase_1.db
                .collection('conversations')
                .where('participants', 'array-contains', user1)
                .where('type', '==', 'direct')
                .where('isActive', '==', true)
                .get();
            const conversation = snapshot.docs
                .map(doc => doc.data())
                .find(conv => conv.participants.includes(user2));
            return conversation || null;
        });
    }
    updateConversationLastMessage(conversationId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversationRef = firebase_1.db.collection('conversations').doc(conversationId);
            yield conversationRef.update({
                lastMessage: message,
                updatedAt: message.timestamp,
                unreadCount: admin.firestore.FieldValue.increment(1)
            });
        });
    }
    sendMessageNotifications(conversation, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                conversation.participants.forEach((participant) => __awaiter(this, void 0, void 0, function* () {
                    if (participant !== message.senderId) {
                        // Enviar notificación push
                        yield pushNotificationService_1.pushNotificationService.sendNotificationToUser(participant, {
                            title: message.senderName,
                            body: message.content,
                            type: 'chat',
                            data: {
                                conversationId: conversation.id,
                                messageId: message.id,
                                senderId: message.senderId
                            },
                            category: 'chat'
                        });
                    }
                }));
            }
            catch (error) {
                loggerService_1.logger.error('Error al enviar notificaciones de mensaje:', error);
            }
        });
    }
    sendConversationNotification(userEmail, notification) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pushNotificationService_1.pushNotificationService.sendNotificationToUser(userEmail, {
                    title: notification.senderName || 'Nueva conversación',
                    body: notification.message || 'Tienes una nueva conversación',
                    type: 'chat',
                    data: {
                        conversationId: notification.conversationId,
                        notificationType: notification.type
                    },
                    category: 'chat'
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error al enviar notificación de conversación:', error);
            }
        });
    }
}
exports.ChatService = ChatService;
exports.chatService = ChatService.getInstance();
