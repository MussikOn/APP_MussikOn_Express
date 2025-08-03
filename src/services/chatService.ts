import { db } from '../utils/firebase';
import { User } from '../utils/DataTypes';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from '../services/loggerService';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'file';
  timestamp: Date;
  readBy: string[];
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    duration?: number;
    thumbnail?: string;
  };
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage?: Message;
  lastActivity: Date;
  isGroup: boolean;
  groupName?: string;
  groupAdmin?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatFilters {
  userId: string;
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

export class ChatService {
  /**
   * Crear una nueva conversación
   */
  async createConversation(
    participants: string[],
    isGroup: boolean = false,
    groupName?: string,
    groupAdmin?: string
  ): Promise<Conversation> {
    try {
      // Obtener nombres de participantes
      const participantNames: Record<string, string> = {};
      for (const participantId of participants) {
        const userDoc = await db.collection('users').doc(participantId).get();
        if (userDoc.exists) {
          const userData = userDoc.data() as User;
          participantNames[participantId] =
            `${userData.name} ${userData.lastName}`;
        }
      }

      const conversation: Conversation = {
        id: db.collection('conversations').doc().id,
        participants,
        participantNames,
        lastActivity: new Date(),
        isGroup,
        groupName,
        groupAdmin,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db
        .collection('conversations')
        .doc(conversation.id)
        .set(conversation);

      return conversation;
    } catch (error) {
      logger.error('Error al crear conversación:', error as Error);
      throw new Error('Error al crear conversación');
    }
  }

  /**
   * Obtener conversaciones de un usuario
   */
  async getUserConversations(filters: ChatFilters): Promise<Conversation[]> {
    try {
      const { userId, limit = 20, offset = 0, unreadOnly = false } = filters;

      const query = db
        .collection('conversations')
        .where('participants', 'array-contains', userId)
        .orderBy('lastActivity', 'desc')
        .limit(limit)
        .offset(offset);

      const snapshot = await query.get();
      const conversations = snapshot.docs.map(
        doc => doc.data() as Conversation
      );

      // Filtrar por mensajes no leídos si se especifica
      if (unreadOnly) {
        const conversationsWithUnread = await Promise.all(
          conversations.map(async conversation => {
            const unreadCount = await this.getUnreadMessageCount(
              conversation.id,
              userId
            );
            return { ...conversation, unreadCount };
          })
        );
        return conversationsWithUnread.filter(conv => conv.unreadCount > 0);
      }

      return conversations;
    } catch (error) {
      logger.error('Error al obtener conversaciones:', error as Error);
      throw new Error('Error al obtener conversaciones');
    }
  }

  /**
   * Obtener mensajes de una conversación
   */
  async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    try {
      const query = db
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .offset(offset);

      const snapshot = await query.get();
      return snapshot.docs.map(doc => doc.data() as Message);
    } catch (error) {
      logger.error('Error al obtener mensajes:', error as Error);
      throw new Error('Error al obtener mensajes');
    }
  }

  /**
   * Enviar un mensaje
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: 'text' | 'image' | 'audio' | 'file' = 'text',
    metadata?: any
  ): Promise<Message> {
    try {
      // Verificar que la conversación existe
      const conversationDoc = await db
        .collection('conversations')
        .doc(conversationId)
        .get();
      if (!conversationDoc.exists) {
        throw new Error('Conversación no encontrada');
      }

      // Obtener información del remitente
      const senderDoc = await db.collection('users').doc(senderId).get();
      if (!senderDoc.exists) {
        throw new Error('Usuario remitente no encontrado');
      }

      const senderData = senderDoc.data() as User;
      const senderName = `${senderData.name} ${senderData.lastName}`;

      const message: Message = {
        id: db
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
      await db
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .doc(message.id)
        .set(message);

      // Actualizar la conversación con el último mensaje
      await db.collection('conversations').doc(conversationId).update({
        lastMessage: message,
        lastActivity: new Date(),
        updatedAt: new Date(),
      });

      return message;
    } catch (error) {
      logger.error('Error al enviar mensaje:', error as Error);
      throw new Error('Error al enviar mensaje');
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  async markMessagesAsRead(
    conversationId: string,
    userId: string,
    messageIds?: string[]
  ): Promise<void> {
    try {
      if (messageIds && messageIds.length > 0) {
        // Marcar mensajes específicos como leídos
        const batch = db.batch();

        for (const messageId of messageIds) {
          const messageRef = db
            .collection('conversations')
            .doc(conversationId)
            .collection('messages')
            .doc(messageId);

          batch.update(messageRef, {
            readBy: FieldValue.arrayUnion(userId),
          });
        }

        await batch.commit();
      } else {
        // Marcar todos los mensajes no leídos como leídos
        const messagesQuery = db
          .collection('conversations')
          .doc(conversationId)
          .collection('messages')
          .where('readBy', 'not-in', [[userId]]);

        const snapshot = await messagesQuery.get();
        const batch = db.batch();

        snapshot.docs.forEach(doc => {
          batch.update(doc.ref, {
            readBy: FieldValue.arrayUnion(userId),
          });
        });

        await batch.commit();
      }
    } catch (error) {
      logger.error('Error al marcar mensajes como leídos:', error as Error);
      throw new Error('Error al marcar mensajes como leídos');
    }
  }

  /**
   * Obtener número de mensajes no leídos
   */
  async getUnreadMessageCount(
    conversationId: string,
    userId: string
  ): Promise<number> {
    try {
      const query = db
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .where('readBy', 'not-in', [[userId]]);

      const snapshot = await query.get();
      return snapshot.size;
    } catch (error) {
      logger.error('Error al obtener conteo de mensajes no leídos:', error as Error);
      return 0;
    }
  }

  /**
   * Obtener conversación por ID
   */
  async getConversationById(
    conversationId: string
  ): Promise<Conversation | null> {
    try {
      const doc = await db
        .collection('conversations')
        .doc(conversationId)
        .get();
      if (doc.exists) {
        return doc.data() as Conversation;
      }
      return null;
    } catch (error) {
      logger.error('Error al obtener conversación:', error as Error);
      throw new Error('Error al obtener conversación');
    }
  }

  /**
   * Buscar conversaciones
   */
  async searchConversations(
    userId: string,
    searchTerm: string
  ): Promise<Conversation[]> {
    try {
      // Obtener todas las conversaciones del usuario
      const conversations = await this.getUserConversations({
        userId,
        limit: 100,
      });

      // Filtrar por término de búsqueda
      return conversations.filter(conversation => {
        // Buscar en nombres de participantes
        const participantNames = Object.values(conversation.participantNames);
        const nameMatch = participantNames.some(name =>
          name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Buscar en nombre del grupo
        const groupMatch = conversation.groupName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

        // Buscar en último mensaje
        const messageMatch = conversation.lastMessage?.content
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        return nameMatch || groupMatch || messageMatch;
      });
    } catch (error) {
      logger.error('Error al buscar conversaciones:', error as Error);
      throw new Error('Error al buscar conversaciones');
    }
  }

  /**
   * Buscar mensajes
   */
  async searchMessages(
    conversationId: string,
    searchTerm: string,
    limit: number = 20
  ): Promise<Message[]> {
    try {
      const query = db
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .limit(limit);

      const snapshot = await query.get();
      const messages = snapshot.docs.map(doc => doc.data() as Message);

      // Filtrar por término de búsqueda
      return messages.filter(message =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      logger.error('Error al buscar mensajes:', error as Error);
      throw new Error('Error al buscar mensajes');
    }
  }

  /**
   * Eliminar mensaje
   */
  async deleteMessage(
    conversationId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    try {
      const messageDoc = await db
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .doc(messageId)
        .get();

      if (!messageDoc.exists) {
        throw new Error('Mensaje no encontrado');
      }

      const message = messageDoc.data() as Message;

      // Solo el remitente puede eliminar el mensaje
      if (message.senderId !== userId) {
        throw new Error('No autorizado para eliminar este mensaje');
      }

      await db
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .doc(messageId)
        .delete();
    } catch (error) {
      logger.error('Error al eliminar mensaje:', error as Error);
      throw new Error('Error al eliminar mensaje');
    }
  }

  /**
   * Agregar participante a conversación grupal
   */
  async addParticipantToGroup(
    conversationId: string,
    participantId: string,
    adminId: string
  ): Promise<void> {
    try {
      const conversation = await this.getConversationById(conversationId);
      if (!conversation) {
        throw new Error('Conversación no encontrada');
      }

      if (!conversation.isGroup) {
        throw new Error(
          'Solo se pueden agregar participantes a conversaciones grupales'
        );
      }

      if (conversation.groupAdmin !== adminId) {
        throw new Error(
          'Solo el administrador del grupo puede agregar participantes'
        );
      }

      if (conversation.participants.includes(participantId)) {
        throw new Error('El participante ya está en la conversación');
      }

      // Obtener nombre del nuevo participante
      const userDoc = await db.collection('users').doc(participantId).get();
      if (!userDoc.exists) {
        throw new Error('Usuario no encontrado');
      }

      const userData = userDoc.data() as User;
      const participantName = `${userData.name} ${userData.lastName}`;

      // Actualizar conversación
      await db
        .collection('conversations')
        .doc(conversationId)
        .update({
          participants: FieldValue.arrayUnion(participantId),
          [`participantNames.${participantId}`]: participantName,
          updatedAt: new Date(),
        });
    } catch (error) {
      logger.error('Error al agregar participante:', error as Error);
      throw new Error('Error al agregar participante');
    }
  }

  /**
   * Remover participante de conversación grupal
   */
  async removeParticipantFromGroup(
    conversationId: string,
    participantId: string,
    adminId: string
  ): Promise<void> {
    try {
      const conversation = await this.getConversationById(conversationId);
      if (!conversation) {
        throw new Error('Conversación no encontrada');
      }

      if (!conversation.isGroup) {
        throw new Error(
          'Solo se pueden remover participantes de conversaciones grupales'
        );
      }

      if (conversation.groupAdmin !== adminId) {
        throw new Error(
          'Solo el administrador del grupo puede remover participantes'
        );
      }

      if (!conversation.participants.includes(participantId)) {
        throw new Error('El participante no está en la conversación');
      }

      // Actualizar conversación
      await db
        .collection('conversations')
        .doc(conversationId)
        .update({
          participants: FieldValue.arrayRemove(participantId),
          [`participantNames.${participantId}`]: FieldValue.delete(),
          updatedAt: new Date(),
        });
    } catch (error) {
      logger.error('Error al remover participante:', error as Error);
      throw new Error('Error al remover participante');
    }
  }

  /**
   * Obtener estadísticas de chat
   */
  async getChatStats(userId: string): Promise<{
    totalConversations: number;
    totalMessages: number;
    unreadMessages: number;
    activeConversations: number;
  }> {
    try {
      const conversations = await this.getUserConversations({
        userId,
        limit: 100,
      });

      let totalMessages = 0;
      let unreadMessages = 0;
      let activeConversations = 0;

      for (const conversation of conversations) {
        const messageCount = await this.getConversationMessages(
          conversation.id,
          1000
        );
        totalMessages += messageCount.length;

        const unreadCount = await this.getUnreadMessageCount(
          conversation.id,
          userId
        );
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
    } catch (error) {
      logger.error('Error al obtener estadísticas de chat:', error as Error);
      throw new Error('Error al obtener estadísticas de chat');
    }
  }
}

export const chatService = new ChatService();
