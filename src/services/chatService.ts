import { db } from '../utils/firebase';
import { Message, Conversation, ChatStats, ChatNotification } from '../utils/DataTypes';
import { logger } from './loggerService';
import { pushNotificationService } from './pushNotificationService';
import * as admin from 'firebase-admin';

export class ChatService {
  private static instance: ChatService;

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Crear conversación con validaciones avanzadas
   */
  async createConversation(
    participants: string[],
    type: 'direct' | 'group' | 'event' = 'direct',
    name?: string,
    eventId?: string,
    creatorEmail?: string
  ): Promise<Conversation> {
    try {
      // Validar participantes
      if (!participants || participants.length === 0) {
        throw new Error('Se requiere al menos un participante');
      }

      // Verificar que todos los participantes existen
      const usersSnapshot = await db.collection('users').get();
      const existingUsers = usersSnapshot.docs.map(doc => doc.data().userEmail);
      
      const invalidParticipants = participants.filter(p => !existingUsers.includes(p));
      if (invalidParticipants.length > 0) {
        throw new Error(`Usuarios no encontrados: ${invalidParticipants.join(', ')}`);
      }

      // Para conversaciones directas, verificar si ya existe
      if (type === 'direct' && participants.length === 2) {
        const existingConversation = await this.getConversationBetweenUsers(
          participants[0],
          participants[1]
        );
        if (existingConversation) {
          return existingConversation;
        }
      }

      // Crear la conversación
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

      logger.info('Conversación creada:', { metadata: { id: conversation.id, type, participants } });
      return conversation;
    } catch (error) {
      logger.error('Error al crear conversación:', error as Error);
      throw error;
    }
  }

  /**
   * Enviar mensaje con validaciones y notificaciones
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
    type: 'text' | 'image' | 'audio' | 'file' | 'location' | 'contact' = 'text',
    metadata?: any,
    replyTo?: any
  ): Promise<Message> {
    try {
      // Verificar que la conversación existe y el usuario es participante
      const conversation = await this.getConversationById(conversationId);
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
      const messageRef = db.collection('messages').doc();

      const message: Message = {
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

      await messageRef.set(message);

      // Actualizar la conversación
      await this.updateConversationLastMessage(conversationId, message);

      // Enviar notificaciones push a participantes no conectados
      await this.sendMessageNotifications(conversation, message);

      logger.info('Mensaje enviado:', { metadata: { id: message.id, conversationId } });
      return message;
    } catch (error) {
      logger.error('Error al enviar mensaje:', error as Error);
      throw error;
    }
  }

  /**
   * Editar mensaje con validaciones
   */
  async editMessage(
    messageId: string,
    newContent: string,
    userEmail: string
  ): Promise<Message | null> {
    try {
      const messageRef = db.collection('messages').doc(messageId);
      const messageSnap = await messageRef.get();

      if (!messageSnap.exists) {
        return null;
      }

      const message = messageSnap.data() as Message;

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
      const updatedMessage: Message = {
        ...message,
        content: newContent.trim(),
        editedAt: updatedAt,
        isEdited: true
      };

      await messageRef.update({
        content: newContent.trim(),
        editedAt: updatedAt,
        isEdited: true
      });

      logger.info('Mensaje editado:', { metadata: { id: messageId, userEmail } });
      return updatedMessage;
    } catch (error) {
      logger.error('Error al editar mensaje:', error as Error);
      throw error;
    }
  }

  /**
   * Agregar reacción a mensaje
   */
  async addReaction(
    messageId: string,
    userEmail: string,
    emoji: string
  ): Promise<void> {
    try {
      const messageRef = db.collection('messages').doc(messageId);
      const messageSnap = await messageRef.get();

      if (!messageSnap.exists) {
        throw new Error('Mensaje no encontrado');
      }

      const message = messageSnap.data() as Message;

      // Verificar que el usuario es participante de la conversación
      const conversation = await this.getConversationById(message.conversationId);
      if (!conversation || !conversation.participants.includes(userEmail)) {
        throw new Error('No tienes permisos para reaccionar a este mensaje');
      }

      await messageRef.update({
        [`reactions.${userEmail}`]: admin.firestore.FieldValue.arrayUnion(emoji)
      });

      logger.info('Reacción agregada:', { metadata: { messageId, userEmail, emoji } });
    } catch (error) {
      logger.error('Error al agregar reacción:', error as Error);
      throw error;
    }
  }

  /**
   * Remover reacción de mensaje
   */
  async removeReaction(
    messageId: string,
    userEmail: string,
    emoji: string
  ): Promise<void> {
    try {
      const messageRef = db.collection('messages').doc(messageId);
      
      await messageRef.update({
        [`reactions.${userEmail}`]: admin.firestore.FieldValue.arrayRemove(emoji)
      });

      logger.info('Reacción removida:', { metadata: { messageId, userEmail, emoji } });
    } catch (error) {
      logger.error('Error al remover reacción:', error as Error);
      throw error;
    }
  }

  /**
   * Eliminar mensaje (soft delete)
   */
  async deleteMessage(
    messageId: string,
    userEmail: string
  ): Promise<void> {
    try {
      const messageRef = db.collection('messages').doc(messageId);
      const messageSnap = await messageRef.get();

      if (!messageSnap.exists) {
        throw new Error('Mensaje no encontrado');
      }

      const message = messageSnap.data() as Message;

      // Verificar permisos
      if (message.senderId !== userEmail) {
        throw new Error('No tienes permisos para eliminar este mensaje');
      }

      const now = new Date().toISOString();
      await messageRef.update({
        isDeleted: true,
        deletedAt: now,
        content: 'Mensaje eliminado'
      });

      logger.info('Mensaje eliminado:', { metadata: { messageId, userEmail } });
    } catch (error) {
      logger.error('Error al eliminar mensaje:', error as Error);
      throw error;
    }
  }

  /**
   * Marcar conversación como leída
   */
  async markConversationAsRead(
    conversationId: string,
    userEmail: string
  ): Promise<void> {
    try {
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

      logger.info('Conversación marcada como leída:', { metadata: { conversationId, userEmail } });
    } catch (error) {
      logger.error('Error al marcar conversación como leída:', error as Error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas avanzadas del chat
   */
  async getChatStats(userEmail: string): Promise<ChatStats> {
    try {
      const conversations = await this.getConversationsByUser(userEmail);
      
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
    } catch (error) {
      logger.error('Error al obtener estadísticas del chat:', error as Error);
      throw error;
    }
  }

  /**
   * Buscar conversaciones con filtros avanzados
   */
  async searchConversations(
    userEmail: string,
    filters: {
      search?: string;
      unreadOnly?: boolean;
      dateFrom?: string;
      dateTo?: string;
      type?: 'direct' | 'group' | 'event';
      participants?: string[];
    }
  ): Promise<Conversation[]> {
    try {
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

      // Filtrar por fecha
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

      // Buscar por texto
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

      // Filtrar por participantes
      if (filters.participants && filters.participants.length > 0) {
        conversations = conversations.filter(conv =>
          filters.participants!.some(p => conv.participants.includes(p))
        );
      }

      return conversations.sort((a, b) => {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      logger.error('Error al buscar conversaciones:', error as Error);
      throw error;
    }
  }

  // Métodos privados auxiliares

  private async getConversationById(conversationId: string): Promise<Conversation | null> {
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationSnap = await conversationRef.get();

    if (!conversationSnap.exists) {
      return null;
    }

    return conversationSnap.data() as Conversation;
  }

  private async getConversationsByUser(userEmail: string): Promise<Conversation[]> {
    const snapshot = await db
      .collection('conversations')
      .where('participants', 'array-contains', userEmail)
      .where('isActive', '==', true)
      .orderBy('updatedAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as Conversation);
  }

  private async getConversationBetweenUsers(user1: string, user2: string): Promise<Conversation | null> {
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
  }

  private async updateConversationLastMessage(conversationId: string, message: Message): Promise<void> {
    const conversationRef = db.collection('conversations').doc(conversationId);
    
    await conversationRef.update({
      lastMessage: message,
      updatedAt: message.timestamp,
      unreadCount: admin.firestore.FieldValue.increment(1)
    });
  }

  private async sendMessageNotifications(conversation: Conversation, message: Message): Promise<void> {
    try {
      conversation.participants.forEach(async (participant) => {
        if (participant !== message.senderId) {
          // Enviar notificación push
          await pushNotificationService.sendNotificationToUser(participant, {
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
      });
    } catch (error) {
      logger.error('Error al enviar notificaciones de mensaje:', error as Error);
    }
  }

  private async sendConversationNotification(userEmail: string, notification: ChatNotification): Promise<void> {
    try {
      await pushNotificationService.sendNotificationToUser(userEmail, {
        title: notification.senderName || 'Nueva conversación',
        body: notification.message || 'Tienes una nueva conversación',
        type: 'chat',
        data: {
          conversationId: notification.conversationId,
          notificationType: notification.type
        },
        category: 'chat'
      });
    } catch (error) {
      logger.error('Error al enviar notificación de conversación:', error as Error);
    }
  }
}

export const chatService = ChatService.getInstance();
