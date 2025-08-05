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
exports.getChatStatsModel = exports.getConversationBetweenUsersModel = exports.archiveConversationModel = exports.deleteConversationModel = exports.searchConversationsModel = exports.updateTypingIndicatorModel = exports.deleteMessageModel = exports.removeReactionFromMessageModel = exports.addReactionToMessageModel = exports.editMessageModel = exports.markConversationAsReadModel = exports.markMessageAsReadModel = exports.updateConversationLastMessage = exports.createMessageModel = exports.getMessagesByConversationModel = exports.getConversationByIdModel = exports.getConversationsByUserModel = exports.createConversationModel = void 0;
const firebase_1 = require("../utils/firebase");
const admin = __importStar(require("firebase-admin"));
const loggerService_1 = require("../services/loggerService");
// Crear una nueva conversación
const createConversationModel = (participants_1, ...args_1) => __awaiter(void 0, [participants_1, ...args_1], void 0, function* (participants, type = 'direct', name, eventId) {
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
    loggerService_1.logger.info('Conversación creada:', { metadata: { id: conversation.id, type, participants } });
    return conversation;
});
exports.createConversationModel = createConversationModel;
// Obtener conversaciones de un usuario
const getConversationsByUserModel = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Primero intentar con la consulta optimizada
        const snapshot = yield firebase_1.db
            .collection('conversations')
            .where('participants', 'array-contains', userEmail)
            .where('isActive', '==', true)
            .orderBy('updatedAt', 'desc')
            .get();
        return snapshot.docs.map(doc => doc.data());
    }
    catch (error) {
        // Si falla por índice faltante, usar consulta alternativa
        if (error.code === 9 && error.message.includes('requires an index')) {
            console.warn('Índice compuesto faltante, usando consulta alternativa');
            // Consulta alternativa sin ordenamiento
            const snapshot = yield firebase_1.db
                .collection('conversations')
                .where('participants', 'array-contains', userEmail)
                .where('isActive', '==', true)
                .get();
            const conversations = snapshot.docs.map(doc => doc.data());
            // Ordenar en memoria
            return conversations.sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.createdAt || 0);
                const dateB = new Date(b.updatedAt || b.createdAt || 0);
                return dateB.getTime() - dateA.getTime();
            });
        }
        // Si es otro tipo de error, relanzarlo
        throw error;
    }
});
exports.getConversationsByUserModel = getConversationsByUserModel;
// Obtener conversación por ID
const getConversationByIdModel = (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationRef = firebase_1.db.collection('conversations').doc(conversationId);
    const conversationSnap = yield conversationRef.get();
    if (!conversationSnap.exists) {
        return null;
    }
    return conversationSnap.data();
});
exports.getConversationByIdModel = getConversationByIdModel;
// Obtener mensajes de una conversación
const getMessagesByConversationModel = (conversationId_1, ...args_1) => __awaiter(void 0, [conversationId_1, ...args_1], void 0, function* (conversationId, limit = 50, offset = 0) {
    const snapshot = yield firebase_1.db
        .collection('messages')
        .where('conversationId', '==', conversationId)
        .where('isDeleted', '==', false)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .offset(offset)
        .get();
    return snapshot.docs.map(doc => doc.data()).reverse();
});
exports.getMessagesByConversationModel = getMessagesByConversationModel;
// Crear un nuevo mensaje
const createMessageModel = (messageData) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date().toISOString();
    const messageRef = firebase_1.db.collection('messages').doc();
    const message = Object.assign(Object.assign({}, messageData), { id: messageRef.id, timestamp: now, isEdited: false, isDeleted: false, reactions: {} });
    yield messageRef.set(message);
    // Actualizar la conversación con el último mensaje
    yield (0, exports.updateConversationLastMessage)(message.conversationId, message);
    loggerService_1.logger.info('Mensaje creado:', { metadata: { id: message.id, conversationId: message.conversationId } });
    return message;
});
exports.createMessageModel = createMessageModel;
// Actualizar último mensaje de la conversación
const updateConversationLastMessage = (conversationId, message) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationRef = firebase_1.db.collection('conversations').doc(conversationId);
    yield conversationRef.update({
        lastMessage: message,
        updatedAt: message.timestamp,
        unreadCount: admin.firestore.FieldValue.increment(1)
    });
});
exports.updateConversationLastMessage = updateConversationLastMessage;
// Marcar mensaje como leído
const markMessageAsReadModel = (messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const messageRef = firebase_1.db.collection('messages').doc(messageId);
    yield messageRef.update({
        status: 'read'
    });
});
exports.markMessageAsReadModel = markMessageAsReadModel;
// Marcar conversación como leída
const markConversationAsReadModel = (conversationId, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.markConversationAsReadModel = markConversationAsReadModel;
// Editar mensaje
const editMessageModel = (messageId, newContent, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const messageRef = firebase_1.db.collection('messages').doc(messageId);
    const messageSnap = yield messageRef.get();
    if (!messageSnap.exists) {
        return null;
    }
    const message = messageSnap.data();
    // Verificar que el usuario es el propietario del mensaje
    if (message.senderId !== userEmail) {
        throw new Error('No tienes permisos para editar este mensaje');
    }
    const now = new Date().toISOString();
    const updatedMessage = Object.assign(Object.assign({}, message), { content: newContent, editedAt: now, isEdited: true });
    yield messageRef.update({
        content: newContent,
        editedAt: now,
        isEdited: true
    });
    return updatedMessage;
});
exports.editMessageModel = editMessageModel;
// Agregar reacción a mensaje
const addReactionToMessageModel = (messageId, userEmail, emoji) => __awaiter(void 0, void 0, void 0, function* () {
    const messageRef = firebase_1.db.collection('messages').doc(messageId);
    yield messageRef.update({
        [`reactions.${userEmail}`]: admin.firestore.FieldValue.arrayUnion(emoji)
    });
});
exports.addReactionToMessageModel = addReactionToMessageModel;
// Remover reacción de mensaje
const removeReactionFromMessageModel = (messageId, userEmail, emoji) => __awaiter(void 0, void 0, void 0, function* () {
    const messageRef = firebase_1.db.collection('messages').doc(messageId);
    yield messageRef.update({
        [`reactions.${userEmail}`]: admin.firestore.FieldValue.arrayRemove(emoji)
    });
});
exports.removeReactionFromMessageModel = removeReactionFromMessageModel;
// Eliminar mensaje (soft delete)
const deleteMessageModel = (messageId, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const messageRef = firebase_1.db.collection('messages').doc(messageId);
    const messageSnap = yield messageRef.get();
    if (!messageSnap.exists) {
        throw new Error('Mensaje no encontrado');
    }
    const message = messageSnap.data();
    // Verificar que el usuario es el propietario del mensaje
    if (message.senderId !== userEmail) {
        throw new Error('No tienes permisos para eliminar este mensaje');
    }
    const now = new Date().toISOString();
    yield messageRef.update({
        isDeleted: true,
        deletedAt: now,
        content: 'Mensaje eliminado'
    });
});
exports.deleteMessageModel = deleteMessageModel;
// Actualizar indicador de escritura
const updateTypingIndicatorModel = (conversationId, userEmail, isTyping) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationRef = firebase_1.db.collection('conversations').doc(conversationId);
    if (isTyping) {
        yield conversationRef.update({
            typingUsers: admin.firestore.FieldValue.arrayUnion(userEmail)
        });
    }
    else {
        yield conversationRef.update({
            typingUsers: admin.firestore.FieldValue.arrayRemove(userEmail)
        });
    }
});
exports.updateTypingIndicatorModel = updateTypingIndicatorModel;
// Buscar conversaciones
const searchConversationsModel = (userEmail, filters) => __awaiter(void 0, void 0, void 0, function* () {
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
    // Filtrar por fecha si se especifica
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
    // Buscar por texto si se especifica
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        conversations = conversations.filter(conv => {
            var _a, _b;
            return (((_a = conv.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm)) ||
                ((_b = conv.lastMessage) === null || _b === void 0 ? void 0 : _b.content.toLowerCase().includes(searchTerm)) ||
                conv.participants.some(p => p.toLowerCase().includes(searchTerm)));
        });
    }
    return conversations.sort((a, b) => {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
    });
});
exports.searchConversationsModel = searchConversationsModel;
// Eliminar conversación
const deleteConversationModel = (conversationId, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationRef = firebase_1.db.collection('conversations').doc(conversationId);
    const conversationSnap = yield conversationRef.get();
    if (!conversationSnap.exists) {
        throw new Error('Conversación no encontrada');
    }
    const conversation = conversationSnap.data();
    if (!conversation.participants.includes(userEmail)) {
        throw new Error('No tienes permisos para eliminar esta conversación');
    }
    yield conversationRef.update({
        isActive: false
    });
});
exports.deleteConversationModel = deleteConversationModel;
// Archivar conversación
const archiveConversationModel = (conversationId, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationRef = firebase_1.db.collection('conversations').doc(conversationId);
    const conversationSnap = yield conversationRef.get();
    if (!conversationSnap.exists) {
        throw new Error('Conversación no encontrada');
    }
    const conversation = conversationSnap.data();
    if (!conversation.participants.includes(userEmail)) {
        throw new Error('No tienes permisos para archivar esta conversación');
    }
    yield conversationRef.update({
        'settings.pinned': false
    });
});
exports.archiveConversationModel = archiveConversationModel;
// Obtener conversación entre dos usuarios
const getConversationBetweenUsersModel = (user1, user2) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.getConversationBetweenUsersModel = getConversationBetweenUsersModel;
// Obtener estadísticas del chat
const getChatStatsModel = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const conversations = yield (0, exports.getConversationsByUserModel)(userEmail);
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
});
exports.getChatStatsModel = getChatStatsModel;
