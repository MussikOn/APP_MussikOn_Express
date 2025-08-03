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
exports.getChatStatsModel = exports.getConversationBetweenUsersModel = exports.archiveConversationModel = exports.deleteConversationModel = exports.searchConversationsModel = exports.markConversationAsReadModel = exports.markMessageAsReadModel = exports.updateConversationLastMessage = exports.createMessageModel = exports.getMessagesByConversationModel = exports.getConversationByIdModel = exports.getConversationsByUserModel = exports.createConversationModel = void 0;
const firebase_1 = require("../utils/firebase");
const admin = __importStar(require("firebase-admin"));
const loggerService_1 = require("../services/loggerService");
// Crear una nueva conversación
const createConversationModel = (participants) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date().toISOString();
    const conversationRef = firebase_1.db.collection("conversations").doc();
    const conversation = {
        id: conversationRef.id,
        participants,
        unreadCount: 0,
        updatedAt: now,
        isActive: true,
        createdAt: now,
    };
    yield conversationRef.set(conversation);
    loggerService_1.logger.info('[src/models/chatModel.ts:19] Conversación creada:', { metadata: { id: conversation } });
    return conversation;
});
exports.createConversationModel = createConversationModel;
// Obtener conversaciones de un usuario
const getConversationsByUserModel = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield firebase_1.db.collection("conversations")
        .where("participants", "array-contains", userEmail)
        .where("isActive", "==", true)
        .orderBy("updatedAt", "desc")
        .get();
    return snapshot.docs.map(doc => doc.data());
});
exports.getConversationsByUserModel = getConversationsByUserModel;
// Obtener conversación por ID
const getConversationByIdModel = (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationRef = firebase_1.db.collection("conversations").doc(conversationId);
    const conversationSnap = yield conversationRef.get();
    if (!conversationSnap.exists) {
        return null;
    }
    return conversationSnap.data();
});
exports.getConversationByIdModel = getConversationByIdModel;
// Obtener mensajes de una conversación
const getMessagesByConversationModel = (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield firebase_1.db.collection("messages")
        .where("conversationId", "==", conversationId)
        .orderBy("timestamp", "asc")
        .get();
    return snapshot.docs.map(doc => doc.data());
});
exports.getMessagesByConversationModel = getMessagesByConversationModel;
// Crear un nuevo mensaje
const createMessageModel = (messageData) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date().toISOString();
    const messageRef = firebase_1.db.collection("messages").doc();
    const message = Object.assign(Object.assign({}, messageData), { id: messageRef.id, timestamp: now });
    yield messageRef.set(message);
    loggerService_1.logger.info('[src/models/chatModel.ts:68] Mensaje creado:', { metadata: { id: message } });
    // Actualizar la conversación con el último mensaje
    yield (0, exports.updateConversationLastMessage)(message.conversationId, message);
    return message;
});
exports.createMessageModel = createMessageModel;
// Actualizar el último mensaje de una conversación
const updateConversationLastMessage = (conversationId, message) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationRef = firebase_1.db.collection("conversations").doc(conversationId);
    yield conversationRef.update({
        lastMessage: message,
        updatedAt: message.timestamp,
        unreadCount: admin.firestore.FieldValue.increment(1)
    });
});
exports.updateConversationLastMessage = updateConversationLastMessage;
// Marcar mensaje como leído
const markMessageAsReadModel = (messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const messageRef = firebase_1.db.collection("messages").doc(messageId);
    yield messageRef.update({
        status: 'read'
    });
});
exports.markMessageAsReadModel = markMessageAsReadModel;
// Marcar conversación como leída
const markConversationAsReadModel = (conversationId, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationRef = firebase_1.db.collection("conversations").doc(conversationId);
    // Obtener la conversación para verificar que el usuario es participante
    const conversationSnap = yield conversationRef.get();
    if (!conversationSnap.exists) {
        throw new Error('Conversación no encontrada');
    }
    const conversation = conversationSnap.data();
    if (!conversation.participants.includes(userEmail)) {
        throw new Error('Usuario no es participante de esta conversación');
    }
    yield conversationRef.update({
        unreadCount: 0
    });
});
exports.markConversationAsReadModel = markConversationAsReadModel;
// Buscar conversaciones con filtros
const searchConversationsModel = (userEmail, filters) => __awaiter(void 0, void 0, void 0, function* () {
    let query = firebase_1.db.collection("conversations")
        .where("participants", "array-contains", userEmail)
        .where("isActive", "==", true);
    if (filters.unreadOnly) {
        query = query.where("unreadCount", ">", 0);
    }
    if (filters.dateFrom) {
        query = query.where("updatedAt", ">=", filters.dateFrom);
    }
    if (filters.dateTo) {
        query = query.where("updatedAt", "<=", filters.dateTo);
    }
    const snapshot = yield query.orderBy("updatedAt", "desc").get();
    let conversations = snapshot.docs.map(doc => doc.data());
    // Filtrar por búsqueda de texto si se proporciona
    if (filters.search) {
        conversations = conversations.filter(conversation => {
            var _a;
            // Buscar en el último mensaje
            if ((_a = conversation.lastMessage) === null || _a === void 0 ? void 0 : _a.content.toLowerCase().includes(filters.search.toLowerCase())) {
                return true;
            }
            // Buscar en participantes (excluyendo al usuario actual)
            const otherParticipants = conversation.participants.filter(p => p !== userEmail);
            return otherParticipants.some(p => p.toLowerCase().includes(filters.search.toLowerCase()));
        });
    }
    return conversations;
});
exports.searchConversationsModel = searchConversationsModel;
// Eliminar conversación (marcar como inactiva)
const deleteConversationModel = (conversationId, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationRef = firebase_1.db.collection("conversations").doc(conversationId);
    // Verificar que el usuario es participante
    const conversationSnap = yield conversationRef.get();
    if (!conversationSnap.exists) {
        throw new Error('Conversación no encontrada');
    }
    const conversation = conversationSnap.data();
    if (!conversation.participants.includes(userEmail)) {
        throw new Error('Usuario no es participante de esta conversación');
    }
    yield conversationRef.update({
        isActive: false
    });
});
exports.deleteConversationModel = deleteConversationModel;
// Archivar conversación
const archiveConversationModel = (conversationId, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationRef = firebase_1.db.collection("conversations").doc(conversationId);
    // Verificar que el usuario es participante
    const conversationSnap = yield conversationRef.get();
    if (!conversationSnap.exists) {
        throw new Error('Conversación no encontrada');
    }
    const conversation = conversationSnap.data();
    if (!conversation.participants.includes(userEmail)) {
        throw new Error('Usuario no es participante de esta conversación');
    }
    yield conversationRef.update({
        isActive: false
    });
});
exports.archiveConversationModel = archiveConversationModel;
// Obtener conversación entre dos usuarios específicos
const getConversationBetweenUsersModel = (user1, user2) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield firebase_1.db.collection("conversations")
        .where("participants", "array-contains", user1)
        .where("isActive", "==", true)
        .get();
    const conversations = snapshot.docs.map(doc => doc.data());
    // Buscar conversación que contenga ambos usuarios
    const conversation = conversations.find(conv => conv.participants.includes(user1) && conv.participants.includes(user2));
    return conversation || null;
});
exports.getConversationBetweenUsersModel = getConversationBetweenUsersModel;
// Obtener estadísticas de chat para un usuario
const getChatStatsModel = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const conversations = yield (0, exports.getConversationsByUserModel)(userEmail);
    const totalConversations = conversations.length;
    const unreadMessages = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    const activeConversations = conversations.filter(conv => conv.isActive).length;
    return {
        totalConversations,
        unreadMessages,
        activeConversations
    };
});
exports.getChatStatsModel = getChatStatsModel;
