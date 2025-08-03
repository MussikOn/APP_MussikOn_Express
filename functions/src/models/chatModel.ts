import { db } from "../utils/firebase";
import { Message, Conversation, ChatFilters } from "../utils/DataTypes";
import * as admin from "firebase-admin";
import { logger } from "../services/loggerService";

// Crear una nueva conversación
export const createConversationModel = async (participants: string[]): Promise<Conversation> => {
  const now = new Date().toISOString();
  const conversationRef = db.collection("conversations").doc();
  
  const conversation: Conversation = {
    id: conversationRef.id,
    participants,
    unreadCount: 0,
    updatedAt: now,
    isActive: true,
    createdAt: now,
  };

  await conversationRef.set(conversation);
  logger.info('[src/models/chatModel.ts:19] Conversación creada:', { metadata: { id: conversation  } });
  return conversation;
};

// Obtener conversaciones de un usuario
export const getConversationsByUserModel = async (userEmail: string): Promise<Conversation[]> => {
  const snapshot = await db.collection("conversations")
    .where("participants", "array-contains", userEmail)
    .where("isActive", "==", true)
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map(doc => doc.data() as Conversation);
};

// Obtener conversación por ID
export const getConversationByIdModel = async (conversationId: string): Promise<Conversation | null> => {
  const conversationRef = db.collection("conversations").doc(conversationId);
  const conversationSnap = await conversationRef.get();
  
  if (!conversationSnap.exists) {
    return null;
  }
  
  return conversationSnap.data() as Conversation;
};

// Obtener mensajes de una conversación
export const getMessagesByConversationModel = async (conversationId: string): Promise<Message[]> => {
  const snapshot = await db.collection("messages")
    .where("conversationId", "==", conversationId)
    .orderBy("timestamp", "asc")
    .get();

  return snapshot.docs.map(doc => doc.data() as Message);
};

// Crear un nuevo mensaje
export const createMessageModel = async (messageData: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
  const now = new Date().toISOString();
  const messageRef = db.collection("messages").doc();
  
  const message: Message = {
    ...messageData,
    id: messageRef.id,
    timestamp: now,
  };

  await messageRef.set(message);
  logger.info('[src/models/chatModel.ts:68] Mensaje creado:', { metadata: { id: message  } });

  // Actualizar la conversación con el último mensaje
  await updateConversationLastMessage(message.conversationId, message);
  
  return message;
};

// Actualizar el último mensaje de una conversación
export const updateConversationLastMessage = async (conversationId: string, message: Message): Promise<void> => {
  const conversationRef = db.collection("conversations").doc(conversationId);
  
  await conversationRef.update({
    lastMessage: message,
    updatedAt: message.timestamp,
    unreadCount: admin.firestore.FieldValue.increment(1)
  });
};

// Marcar mensaje como leído
export const markMessageAsReadModel = async (messageId: string): Promise<void> => {
  const messageRef = db.collection("messages").doc(messageId);
  await messageRef.update({
    status: 'read'
  });
};

// Marcar conversación como leída
export const markConversationAsReadModel = async (conversationId: string, userEmail: string): Promise<void> => {
  const conversationRef = db.collection("conversations").doc(conversationId);
  
  // Obtener la conversación para verificar que el usuario es participante
  const conversationSnap = await conversationRef.get();
  if (!conversationSnap.exists) {
    throw new Error('Conversación no encontrada');
  }
  
  const conversation = conversationSnap.data() as Conversation;
  if (!conversation.participants.includes(userEmail)) {
    throw new Error('Usuario no es participante de esta conversación');
  }
  
  await conversationRef.update({
    unreadCount: 0
  });
};

// Buscar conversaciones con filtros
export const searchConversationsModel = async (userEmail: string, filters: ChatFilters): Promise<Conversation[]> => {
  let query = db.collection("conversations")
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

  const snapshot = await query.orderBy("updatedAt", "desc").get();
  let conversations = snapshot.docs.map(doc => doc.data() as Conversation);

  // Filtrar por búsqueda de texto si se proporciona
  if (filters.search) {
    conversations = conversations.filter(conversation => {
      // Buscar en el último mensaje
      if (conversation.lastMessage?.content.toLowerCase().includes(filters.search!.toLowerCase())) {
        return true;
      }
      
      // Buscar en participantes (excluyendo al usuario actual)
      const otherParticipants = conversation.participants.filter(p => p !== userEmail);
      return otherParticipants.some(p => p.toLowerCase().includes(filters.search!.toLowerCase()));
    });
  }

  return conversations;
};

// Eliminar conversación (marcar como inactiva)
export const deleteConversationModel = async (conversationId: string, userEmail: string): Promise<void> => {
  const conversationRef = db.collection("conversations").doc(conversationId);
  
  // Verificar que el usuario es participante
  const conversationSnap = await conversationRef.get();
  if (!conversationSnap.exists) {
    throw new Error('Conversación no encontrada');
  }
  
  const conversation = conversationSnap.data() as Conversation;
  if (!conversation.participants.includes(userEmail)) {
    throw new Error('Usuario no es participante de esta conversación');
  }
  
  await conversationRef.update({
    isActive: false
  });
};

// Archivar conversación
export const archiveConversationModel = async (conversationId: string, userEmail: string): Promise<void> => {
  const conversationRef = db.collection("conversations").doc(conversationId);
  
  // Verificar que el usuario es participante
  const conversationSnap = await conversationRef.get();
  if (!conversationSnap.exists) {
    throw new Error('Conversación no encontrada');
  }
  
  const conversation = conversationSnap.data() as Conversation;
  if (!conversation.participants.includes(userEmail)) {
    throw new Error('Usuario no es participante de esta conversación');
  }
  
  await conversationRef.update({
    isActive: false
  });
};

// Obtener conversación entre dos usuarios específicos
export const getConversationBetweenUsersModel = async (user1: string, user2: string): Promise<Conversation | null> => {
  const snapshot = await db.collection("conversations")
    .where("participants", "array-contains", user1)
    .where("isActive", "==", true)
    .get();

  const conversations = snapshot.docs.map(doc => doc.data() as Conversation);
  
  // Buscar conversación que contenga ambos usuarios
  const conversation = conversations.find(conv => 
    conv.participants.includes(user1) && conv.participants.includes(user2)
  );

  return conversation || null;
};

// Obtener estadísticas de chat para un usuario
export const getChatStatsModel = async (userEmail: string): Promise<{
  totalConversations: number;
  unreadMessages: number;
  activeConversations: number;
}> => {
  const conversations = await getConversationsByUserModel(userEmail);
  
  const totalConversations = conversations.length;
  const unreadMessages = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  const activeConversations = conversations.filter(conv => conv.isActive).length;

  return {
    totalConversations,
    unreadMessages,
    activeConversations
  };
}; 