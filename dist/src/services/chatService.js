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
exports.chatService = exports.ChatService = void 0;
const firebase_1 = require("../utils/firebase");
const firestore_1 = require("firebase-admin/firestore");
class ChatService {
    /**
     * Crear una nueva conversación
     */
    createConversation(participants_1) {
        return __awaiter(this, arguments, void 0, function* (participants, isGroup = false, groupName, groupAdmin) {
            try {
                // Obtener nombres de participantes
                const participantNames = {};
                for (const participantId of participants) {
                    const userDoc = yield firebase_1.db.collection('users').doc(participantId).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        participantNames[participantId] =
                            `${userData.name} ${userData.lastName}`;
                    }
                }
                const conversation = {
                    id: firebase_1.db.collection('conversations').doc().id,
                    participants,
                    participantNames,
                    lastActivity: new Date(),
                    isGroup,
                    groupName,
                    groupAdmin,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                yield firebase_1.db
                    .collection('conversations')
                    .doc(conversation.id)
                    .set(conversation);
                return conversation;
            }
            catch (error) {
                console.error('Error al crear conversación:', error);
                throw new Error('Error al crear conversación');
            }
        });
    }
    /**
     * Obtener conversaciones de un usuario
     */
    getUserConversations(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, limit = 20, offset = 0, unreadOnly = false } = filters;
                const query = firebase_1.db
                    .collection('conversations')
                    .where('participants', 'array-contains', userId)
                    .orderBy('lastActivity', 'desc')
                    .limit(limit)
                    .offset(offset);
                const snapshot = yield query.get();
                const conversations = snapshot.docs.map(doc => doc.data());
                // Filtrar por mensajes no leídos si se especifica
                if (unreadOnly) {
                    const conversationsWithUnread = yield Promise.all(conversations.map((conversation) => __awaiter(this, void 0, void 0, function* () {
                        const unreadCount = yield this.getUnreadMessageCount(conversation.id, userId);
                        return Object.assign(Object.assign({}, conversation), { unreadCount });
                    })));
                    return conversationsWithUnread.filter(conv => conv.unreadCount > 0);
                }
                return conversations;
            }
            catch (error) {
                console.error('Error al obtener conversaciones:', error);
                throw new Error('Error al obtener conversaciones');
            }
        });
    }
    /**
     * Obtener mensajes de una conversación
     */
    getConversationMessages(conversationId_1) {
        return __awaiter(this, arguments, void 0, function* (conversationId, limit = 50, offset = 0) {
            try {
                const query = firebase_1.db
                    .collection('conversations')
                    .doc(conversationId)
                    .collection('messages')
                    .orderBy('timestamp', 'desc')
                    .limit(limit)
                    .offset(offset);
                const snapshot = yield query.get();
                return snapshot.docs.map(doc => doc.data());
            }
            catch (error) {
                console.error('Error al obtener mensajes:', error);
                throw new Error('Error al obtener mensajes');
            }
        });
    }
    /**
     * Enviar un mensaje
     */
    sendMessage(conversationId_1, senderId_1, content_1) {
        return __awaiter(this, arguments, void 0, function* (conversationId, senderId, content, type = 'text', metadata) {
            try {
                // Verificar que la conversación existe
                const conversationDoc = yield firebase_1.db
                    .collection('conversations')
                    .doc(conversationId)
                    .get();
                if (!conversationDoc.exists) {
                    throw new Error('Conversación no encontrada');
                }
                // Obtener información del remitente
                const senderDoc = yield firebase_1.db.collection('users').doc(senderId).get();
                if (!senderDoc.exists) {
                    throw new Error('Usuario remitente no encontrado');
                }
                const senderData = senderDoc.data();
                const senderName = `${senderData.name} ${senderData.lastName}`;
                const message = {
                    id: firebase_1.db
                        .collection('conversations')
                        .doc(conversationId)
                        .collection('messages')
                        .doc().id,
                    conversationId,
                    senderId,
                    senderName,
                    content,
                    type,
                    timestamp: new Date(),
                    readBy: [senderId], // El remitente ya leyó el mensaje
                    metadata,
                };
                // Guardar el mensaje
                yield firebase_1.db
                    .collection('conversations')
                    .doc(conversationId)
                    .collection('messages')
                    .doc(message.id)
                    .set(message);
                // Actualizar la conversación con el último mensaje
                yield firebase_1.db.collection('conversations').doc(conversationId).update({
                    lastMessage: message,
                    lastActivity: new Date(),
                    updatedAt: new Date(),
                });
                return message;
            }
            catch (error) {
                console.error('Error al enviar mensaje:', error);
                throw new Error('Error al enviar mensaje');
            }
        });
    }
    /**
     * Marcar mensajes como leídos
     */
    markMessagesAsRead(conversationId, userId, messageIds) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (messageIds && messageIds.length > 0) {
                    // Marcar mensajes específicos como leídos
                    const batch = firebase_1.db.batch();
                    for (const messageId of messageIds) {
                        const messageRef = firebase_1.db
                            .collection('conversations')
                            .doc(conversationId)
                            .collection('messages')
                            .doc(messageId);
                        batch.update(messageRef, {
                            readBy: firestore_1.FieldValue.arrayUnion(userId),
                        });
                    }
                    yield batch.commit();
                }
                else {
                    // Marcar todos los mensajes no leídos como leídos
                    const messagesQuery = firebase_1.db
                        .collection('conversations')
                        .doc(conversationId)
                        .collection('messages')
                        .where('readBy', 'not-in', [[userId]]);
                    const snapshot = yield messagesQuery.get();
                    const batch = firebase_1.db.batch();
                    snapshot.docs.forEach(doc => {
                        batch.update(doc.ref, {
                            readBy: firestore_1.FieldValue.arrayUnion(userId),
                        });
                    });
                    yield batch.commit();
                }
            }
            catch (error) {
                console.error('Error al marcar mensajes como leídos:', error);
                throw new Error('Error al marcar mensajes como leídos');
            }
        });
    }
    /**
     * Obtener número de mensajes no leídos
     */
    getUnreadMessageCount(conversationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = firebase_1.db
                    .collection('conversations')
                    .doc(conversationId)
                    .collection('messages')
                    .where('readBy', 'not-in', [[userId]]);
                const snapshot = yield query.get();
                return snapshot.size;
            }
            catch (error) {
                console.error('Error al obtener conteo de mensajes no leídos:', error);
                return 0;
            }
        });
    }
    /**
     * Obtener conversación por ID
     */
    getConversationById(conversationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doc = yield firebase_1.db
                    .collection('conversations')
                    .doc(conversationId)
                    .get();
                if (doc.exists) {
                    return doc.data();
                }
                return null;
            }
            catch (error) {
                console.error('Error al obtener conversación:', error);
                throw new Error('Error al obtener conversación');
            }
        });
    }
    /**
     * Buscar conversaciones
     */
    searchConversations(userId, searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Obtener todas las conversaciones del usuario
                const conversations = yield this.getUserConversations({
                    userId,
                    limit: 100,
                });
                // Filtrar por término de búsqueda
                return conversations.filter(conversation => {
                    var _a, _b;
                    // Buscar en nombres de participantes
                    const participantNames = Object.values(conversation.participantNames);
                    const nameMatch = participantNames.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
                    // Buscar en nombre del grupo
                    const groupMatch = (_a = conversation.groupName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase());
                    // Buscar en último mensaje
                    const messageMatch = (_b = conversation.lastMessage) === null || _b === void 0 ? void 0 : _b.content.toLowerCase().includes(searchTerm.toLowerCase());
                    return nameMatch || groupMatch || messageMatch;
                });
            }
            catch (error) {
                console.error('Error al buscar conversaciones:', error);
                throw new Error('Error al buscar conversaciones');
            }
        });
    }
    /**
     * Buscar mensajes
     */
    searchMessages(conversationId_1, searchTerm_1) {
        return __awaiter(this, arguments, void 0, function* (conversationId, searchTerm, limit = 20) {
            try {
                const query = firebase_1.db
                    .collection('conversations')
                    .doc(conversationId)
                    .collection('messages')
                    .orderBy('timestamp', 'desc')
                    .limit(limit);
                const snapshot = yield query.get();
                const messages = snapshot.docs.map(doc => doc.data());
                // Filtrar por término de búsqueda
                return messages.filter(message => message.content.toLowerCase().includes(searchTerm.toLowerCase()));
            }
            catch (error) {
                console.error('Error al buscar mensajes:', error);
                throw new Error('Error al buscar mensajes');
            }
        });
    }
    /**
     * Eliminar mensaje
     */
    deleteMessage(conversationId, messageId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messageDoc = yield firebase_1.db
                    .collection('conversations')
                    .doc(conversationId)
                    .collection('messages')
                    .doc(messageId)
                    .get();
                if (!messageDoc.exists) {
                    throw new Error('Mensaje no encontrado');
                }
                const message = messageDoc.data();
                // Solo el remitente puede eliminar el mensaje
                if (message.senderId !== userId) {
                    throw new Error('No autorizado para eliminar este mensaje');
                }
                yield firebase_1.db
                    .collection('conversations')
                    .doc(conversationId)
                    .collection('messages')
                    .doc(messageId)
                    .delete();
            }
            catch (error) {
                console.error('Error al eliminar mensaje:', error);
                throw new Error('Error al eliminar mensaje');
            }
        });
    }
    /**
     * Agregar participante a conversación grupal
     */
    addParticipantToGroup(conversationId, participantId, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conversation = yield this.getConversationById(conversationId);
                if (!conversation) {
                    throw new Error('Conversación no encontrada');
                }
                if (!conversation.isGroup) {
                    throw new Error('Solo se pueden agregar participantes a conversaciones grupales');
                }
                if (conversation.groupAdmin !== adminId) {
                    throw new Error('Solo el administrador del grupo puede agregar participantes');
                }
                if (conversation.participants.includes(participantId)) {
                    throw new Error('El participante ya está en la conversación');
                }
                // Obtener nombre del nuevo participante
                const userDoc = yield firebase_1.db.collection('users').doc(participantId).get();
                if (!userDoc.exists) {
                    throw new Error('Usuario no encontrado');
                }
                const userData = userDoc.data();
                const participantName = `${userData.name} ${userData.lastName}`;
                // Actualizar conversación
                yield firebase_1.db
                    .collection('conversations')
                    .doc(conversationId)
                    .update({
                    participants: firestore_1.FieldValue.arrayUnion(participantId),
                    [`participantNames.${participantId}`]: participantName,
                    updatedAt: new Date(),
                });
            }
            catch (error) {
                console.error('Error al agregar participante:', error);
                throw new Error('Error al agregar participante');
            }
        });
    }
    /**
     * Remover participante de conversación grupal
     */
    removeParticipantFromGroup(conversationId, participantId, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conversation = yield this.getConversationById(conversationId);
                if (!conversation) {
                    throw new Error('Conversación no encontrada');
                }
                if (!conversation.isGroup) {
                    throw new Error('Solo se pueden remover participantes de conversaciones grupales');
                }
                if (conversation.groupAdmin !== adminId) {
                    throw new Error('Solo el administrador del grupo puede remover participantes');
                }
                if (!conversation.participants.includes(participantId)) {
                    throw new Error('El participante no está en la conversación');
                }
                // Actualizar conversación
                yield firebase_1.db
                    .collection('conversations')
                    .doc(conversationId)
                    .update({
                    participants: firestore_1.FieldValue.arrayRemove(participantId),
                    [`participantNames.${participantId}`]: firestore_1.FieldValue.delete(),
                    updatedAt: new Date(),
                });
            }
            catch (error) {
                console.error('Error al remover participante:', error);
                throw new Error('Error al remover participante');
            }
        });
    }
    /**
     * Obtener estadísticas de chat
     */
    getChatStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conversations = yield this.getUserConversations({
                    userId,
                    limit: 100,
                });
                let totalMessages = 0;
                let unreadMessages = 0;
                let activeConversations = 0;
                for (const conversation of conversations) {
                    const messageCount = yield this.getConversationMessages(conversation.id, 1000);
                    totalMessages += messageCount.length;
                    const unreadCount = yield this.getUnreadMessageCount(conversation.id, userId);
                    unreadMessages += unreadCount;
                    if (unreadCount > 0) {
                        activeConversations++;
                    }
                }
                return {
                    totalConversations: conversations.length,
                    totalMessages,
                    unreadMessages,
                    activeConversations,
                };
            }
            catch (error) {
                console.error('Error al obtener estadísticas de chat:', error);
                throw new Error('Error al obtener estadísticas de chat');
            }
        });
    }
}
exports.ChatService = ChatService;
exports.chatService = new ChatService();
