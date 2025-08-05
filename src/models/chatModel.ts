import { db } from '../utils/firebase';
import { Message, Conversation, ChatFilters, ChatStats, TypingIndicator } from '../utils/DataTypes';
import * as admin from 'firebase-admin';
import { logger } from '../services/loggerService';

// Crear una nueva conversación
export const createConversationModel = async (
  participants: string[],
  type: 'direct' | 'group' | 'event' = 'direct',
  name?: string,
  eventId?: string
): Promise<Conversation> => {
  const now = new Date().toISOString();
  const conversationRef = db.collection('conversations').doc();

  const conversation: Conversation = {
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

  await conversationRef.set(conversation);
  logger.info('Conversación creada:', { metadata: { id: conversation.id, type, participants } });
  return conversation;
};

// Obtener conversaciones de un usuario
export const getConversationsByUserModel = async (
  userEmail: string
): Promise<Conversation[]> => {
  try {
    // Primero intentar con la consulta optimizada
    const snapshot = await db
      .collection('conversations')
      .where('participants', 'array-contains', userEmail)
      .where('isActive', '==', true)
      .orderBy('updatedAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as Conversation);
  } catch (error: any) {
    // Si falla por índice faltante, usar consulta alternativa
    if (error.code === 9 && error.message.includes('requires an index')) {
      console.warn('Índice compuesto faltante, usando consulta alternativa');
      
      // Consulta alternativa sin ordenamiento
      const snapshot = await db
        .collection('conversations')
        .where('participants', 'array-contains', userEmail)
        .where('isActive', '==', true)
        .get();

      const conversations = snapshot.docs.map(doc => doc.data() as Conversation);
      
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
};

// Obtener conversación por ID
export const getConversationByIdModel = async (
  conversationId: string
): Promise<Conversation | null> => {
  const conversationRef = db.collection('conversations').doc(conversationId);
  const conversationSnap = await conversationRef.get();

  if (!conversationSnap.exists) {
    return null;
  }

  return conversationSnap.data() as Conversation;
};

// Obtener mensajes de una conversación
export const getMessagesByConversationModel = async (
  conversationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Message[]> => {
  const snapshot = await db
    .collection('messages')
    .where('conversationId', '==', conversationId)
    .where('isDeleted', '==', false)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .offset(offset)
    .get();

  return snapshot.docs.map(doc => doc.data() as Message).reverse();
};

// Crear un nuevo mensaje
export const createMessageModel = async (
  messageData: Omit<Message, 'id' | 'timestamp'>
): Promise<Message> => {
  const now = new Date().toISOString();
  const messageRef = db.collection('messages').doc();

  const message: Message = {
    ...messageData,
    id: messageRef.id,
    timestamp: now,
    isEdited: false,
    isDeleted: false,
    reactions: {}
  };

  await messageRef.set(message);

  // Actualizar la conversación con el último mensaje
  await updateConversationLastMessage(message.conversationId, message);

  logger.info('Mensaje creado:', { metadata: { id: message.id, conversationId: message.conversationId } });
  return message;
};

// Actualizar último mensaje de la conversación
export const updateConversationLastMessage = async (
  conversationId: string,
  message: Message
): Promise<void> => {
  const conversationRef = db.collection('conversations').doc(conversationId);
  
  await conversationRef.update({
    lastMessage: message,
    updatedAt: message.timestamp,
    unreadCount: admin.firestore.FieldValue.increment(1)
  });
};

// Marcar mensaje como leído
export const markMessageAsReadModel = async (
  messageId: string
): Promise<void> => {
  const messageRef = db.collection('messages').doc(messageId);
  await messageRef.update({
    status: 'read'
  });
};

// Marcar conversación como leída
export const markConversationAsReadModel = async (
  conversationId: string,
  userEmail: string
): Promise<void> => {
  const conversationRef = db.collection('conversations').doc(conversationId);
  
  await conversationRef.update({
    unreadCount: 0
  });

  // Marcar todos los mensajes no leídos como leídos
  const messagesSnapshot = await db
    .collection('messages')
    .where('conversationId', '==', conversationId)
    .where('senderId', '!=', userEmail)
    .where('status', '!=', 'read')
    .get();

  const batch = db.batch();
  messagesSnapshot.docs.forEach(doc => {
    batch.update(doc.ref, { status: 'read' });
  });

  await batch.commit();
};

// Editar mensaje
export const editMessageModel = async (
  messageId: string,
  newContent: string,
  userEmail: string
): Promise<Message | null> => {
  const messageRef = db.collection('messages').doc(messageId);
  const messageSnap = await messageRef.get();

  if (!messageSnap.exists) {
    return null;
  }

  const message = messageSnap.data() as Message;

  // Verificar que el usuario es el propietario del mensaje
  if (message.senderId !== userEmail) {
    throw new Error('No tienes permisos para editar este mensaje');
  }

  const now = new Date().toISOString();
  const updatedMessage: Message = {
    ...message,
    content: newContent,
    editedAt: now,
    isEdited: true
  };

  await messageRef.update({
    content: newContent,
    editedAt: now,
    isEdited: true
  });

  return updatedMessage;
};

// Agregar reacción a mensaje
export const addReactionToMessageModel = async (
  messageId: string,
  userEmail: string,
  emoji: string
): Promise<void> => {
  const messageRef = db.collection('messages').doc(messageId);
  
  await messageRef.update({
    [`reactions.${userEmail}`]: admin.firestore.FieldValue.arrayUnion(emoji)
  });
};

// Remover reacción de mensaje
export const removeReactionFromMessageModel = async (
  messageId: string,
  userEmail: string,
  emoji: string
): Promise<void> => {
  const messageRef = db.collection('messages').doc(messageId);
  
  await messageRef.update({
    [`reactions.${userEmail}`]: admin.firestore.FieldValue.arrayRemove(emoji)
  });
};

// Eliminar mensaje (soft delete)
export const deleteMessageModel = async (
  messageId: string,
  userEmail: string
): Promise<void> => {
  const messageRef = db.collection('messages').doc(messageId);
  const messageSnap = await messageRef.get();

  if (!messageSnap.exists) {
    throw new Error('Mensaje no encontrado');
  }

  const message = messageSnap.data() as Message;

  // Verificar que el usuario es el propietario del mensaje
  if (message.senderId !== userEmail) {
    throw new Error('No tienes permisos para eliminar este mensaje');
  }

  const now = new Date().toISOString();
  await messageRef.update({
    isDeleted: true,
    deletedAt: now,
    content: 'Mensaje eliminado'
  });
};

// Actualizar indicador de escritura
export const updateTypingIndicatorModel = async (
  conversationId: string,
  userEmail: string,
  isTyping: boolean
): Promise<void> => {
  const conversationRef = db.collection('conversations').doc(conversationId);
  
  if (isTyping) {
    await conversationRef.update({
      typingUsers: admin.firestore.FieldValue.arrayUnion(userEmail)
    });
  } else {
    await conversationRef.update({
      typingUsers: admin.firestore.FieldValue.arrayRemove(userEmail)
    });
  }
};

// Buscar conversaciones
export const searchConversationsModel = async (
  userEmail: string,
  filters: ChatFilters
): Promise<Conversation[]> => {
  let query = db
    .collection('conversations')
    .where('participants', 'array-contains', userEmail)
    .where('isActive', '==', true);

  if (filters.type) {
    query = query.where('type', '==', filters.type);
  }

  if (filters.unreadOnly) {
    query = query.where('unreadCount', '>', 0);
  }

  const snapshot = await query.get();
  let conversations = snapshot.docs.map(doc => doc.data() as Conversation);

  // Filtrar por fecha si se especifica
  if (filters.dateFrom || filters.dateTo) {
    conversations = conversations.filter(conv => {
      const convDate = new Date(conv.updatedAt);
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

      if (fromDate && convDate < fromDate) return false;
      if (toDate && convDate > toDate) return false;
      return true;
    });
  }

  // Buscar por texto si se especifica
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    conversations = conversations.filter(conv => {
      return (
        conv.name?.toLowerCase().includes(searchTerm) ||
        conv.lastMessage?.content.toLowerCase().includes(searchTerm) ||
        conv.participants.some(p => p.toLowerCase().includes(searchTerm))
      );
    });
  }

  return conversations.sort((a, b) => {
    const dateA = new Date(a.updatedAt);
    const dateB = new Date(b.updatedAt);
    return dateB.getTime() - dateA.getTime();
  });
};

// Eliminar conversación
export const deleteConversationModel = async (
  conversationId: string,
  userEmail: string
): Promise<void> => {
  const conversationRef = db.collection('conversations').doc(conversationId);
  const conversationSnap = await conversationRef.get();

  if (!conversationSnap.exists) {
    throw new Error('Conversación no encontrada');
  }

  const conversation = conversationSnap.data() as Conversation;

  if (!conversation.participants.includes(userEmail)) {
    throw new Error('No tienes permisos para eliminar esta conversación');
  }

  await conversationRef.update({
    isActive: false
  });
};

// Archivar conversación
export const archiveConversationModel = async (
  conversationId: string,
  userEmail: string
): Promise<void> => {
  const conversationRef = db.collection('conversations').doc(conversationId);
  const conversationSnap = await conversationRef.get();

  if (!conversationSnap.exists) {
    throw new Error('Conversación no encontrada');
  }

  const conversation = conversationSnap.data() as Conversation;

  if (!conversation.participants.includes(userEmail)) {
    throw new Error('No tienes permisos para archivar esta conversación');
  }

  await conversationRef.update({
    'settings.pinned': false
  });
};

// Obtener conversación entre dos usuarios
export const getConversationBetweenUsersModel = async (
  user1: string,
  user2: string
): Promise<Conversation | null> => {
  const snapshot = await db
    .collection('conversations')
    .where('participants', 'array-contains', user1)
    .where('type', '==', 'direct')
    .where('isActive', '==', true)
    .get();

  const conversation = snapshot.docs
    .map(doc => doc.data() as Conversation)
    .find(conv => conv.participants.includes(user2));

  return conversation || null;
};

// Obtener estadísticas del chat
export const getChatStatsModel = async (
  userEmail: string
): Promise<ChatStats> => {
  const conversations = await getConversationsByUserModel(userEmail);
  
  // Obtener mensajes de las últimas semanas
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const messagesSnapshot = await db
    .collection('messages')
    .where('senderId', '==', userEmail)
    .where('timestamp', '>=', weekAgo.toISOString())
    .get();

  const messagesThisWeek = messagesSnapshot.docs.length;

  const monthMessagesSnapshot = await db
    .collection('messages')
    .where('senderId', '==', userEmail)
    .where('timestamp', '>=', monthAgo.toISOString())
    .get();

  const messagesThisMonth = monthMessagesSnapshot.docs.length;

  // Encontrar conversación más activa
  let mostActiveConversation = null;
  let maxMessages = 0;

  for (const conv of conversations) {
    const convMessagesSnapshot = await db
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

  const stats: ChatStats = {
    totalConversations: conversations.length,
    unreadMessages: conversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
    activeConversations: conversations.filter(conv => conv.unreadCount > 0).length,
    totalMessages: 0, // Se calcularía con una consulta adicional
    messagesThisWeek,
    messagesThisMonth,
    mostActiveConversation: mostActiveConversation || undefined
  };

  return stats;
};
