import { Request, Response } from 'express';
import { logger } from '../services/loggerService';
import {
  createConversationModel,
  getConversationsByUserModel,
  getConversationByIdModel,
  getMessagesByConversationModel,
  createMessageModel,
  markMessageAsReadModel,
  markConversationAsReadModel,
  searchConversationsModel,
  deleteConversationModel,
  archiveConversationModel,
  getConversationBetweenUsersModel,
  getChatStatsModel,
  editMessageModel,
  addReactionToMessageModel,
  removeReactionFromMessageModel,
  deleteMessageModel,
  updateTypingIndicatorModel
} from '../models/chatModel';
import { ChatFilters } from '../utils/DataTypes';

// Usar la interfaz global extendida de Express

// Tipo para las funciones del controlador
type ChatControllerFunction = (req: any, res: Response) => Promise<void>;

// Obtener todas las conversaciones del usuario
export const getConversations = async (req: any, res: Response) => {
  try {
    const userEmail = req.user?.userEmail;
    if (!userEmail) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
      return;
    }

    const conversations = await getConversationsByUserModel(userEmail);

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error: any) {
    logger.error('Error al obtener conversaciones:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// Obtener mensajes de una conversación específica
export const getMessages = async (req: any, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userEmail = req.user?.userEmail;

    if (!userEmail) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
      return;
    }

    // Verificar que el usuario es participante de la conversación
    const conversation = await getConversationByIdModel(conversationId);
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

    const messages = await getMessagesByConversationModel(
      conversationId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    // Marcar conversación como leída
    await markConversationAsReadModel(conversationId, userEmail);

    res.json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    logger.error('Error al obtener mensajes:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// Enviar un mensaje
export const sendMessage = async (req: any, res: Response) => {
  try {
    const { conversationId, content, type = 'text', metadata, replyTo } = req.body;
    const userEmail = req.user?.userEmail;
    const userName = req.user?.name + ' ' + req.user?.lastName;

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
    const conversation = await getConversationByIdModel(conversationId);
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
      status: 'sent' as const,
      isEdited: false,
      isDeleted: false
    };

    const message = await createMessageModel(messageData);

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    logger.error('Error al enviar mensaje:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// Marcar mensaje como leído
export const markAsRead = async (req: any, res: Response) => {
  try {
    const { messageId } = req.params;
    const userEmail = req.user?.userEmail;

    if (!userEmail) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
      return;
    }

    await markMessageAsReadModel(messageId);

    res.json({
      success: true,
      message: 'Mensaje marcado como leído',
    });
  } catch (error: any) {
    logger.error('Error al marcar mensaje como leído:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// Crear una nueva conversación
export const createConversation = async (req: any, res: Response) => {
  try {
    const { participants, type = 'direct', name, eventId } = req.body;
    const userEmail = req.user?.userEmail;

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
      const existingConversation = await getConversationBetweenUsersModel(
        allParticipants[0],
        allParticipants[1]
      );

      if (existingConversation) {
        res.json({
          success: true,
          data: existingConversation,
          message: 'Conversación existente encontrada',
        });
        return;
      }
    }

    const conversation = await createConversationModel(allParticipants, type, name, eventId);

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    logger.error('Error al crear conversación:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// Buscar conversaciones
export const searchConversations = async (req: any, res: Response) => {
  try {
    const userEmail = req.user?.userEmail;
    const filters: ChatFilters = req.query;

    if (!userEmail) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
      return;
    }

    const conversations = await searchConversationsModel(userEmail, filters);

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error: any) {
    logger.error('Error al buscar conversaciones:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// Eliminar conversación
export const deleteConversation = async (req: any, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userEmail = req.user?.userEmail;

    if (!userEmail) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
      return;
    }

    await deleteConversationModel(conversationId, userEmail);

    res.json({
      success: true,
      message: 'Conversación eliminada exitosamente',
    });
  } catch (error: any) {
    logger.error('Error al eliminar conversación:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// Archivar conversación
export const archiveConversation = async (req: any, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userEmail = req.user?.userEmail;

    if (!userEmail) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
      return;
    }

    await archiveConversationModel(conversationId, userEmail);

    res.json({
      success: true,
      message: 'Conversación archivada exitosamente',
    });
  } catch (error: any) {
    logger.error('Error al archivar conversación:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// Obtener conversación por ID
export const getConversationById = async (req: any, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userEmail = req.user?.userEmail;

    if (!userEmail) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
      return;
    }

    const conversation = await getConversationByIdModel(conversationId);

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
  } catch (error: any) {
    logger.error('Error al obtener conversación:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// Obtener estadísticas del chat
export const getChatStats = async (req: any, res: Response) => {
  try {
    const userEmail = req.user?.userEmail;

    if (!userEmail) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
      return;
    }

    const stats = await getChatStatsModel(userEmail);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Error al obtener estadísticas del chat:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// Obtener usuarios disponibles para chat
export const getAvailableUsers = async (req: any, res: Response) => {
  try {
    const userEmail = req.user?.userEmail;

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
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs
      .map((doc: any) => doc.data())
      .filter((user: any) => user.userEmail !== userEmail)
      .map((user: any) => ({
        userEmail: user.userEmail,
        name: user.name,
        lastName: user.lastName,
        roll: user.roll
      }));

    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    logger.error('Error al obtener usuarios disponibles:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// Editar mensaje
export const editMessage = async (req: any, res: Response) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userEmail = req.user?.userEmail;

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

    const updatedMessage = await editMessageModel(messageId, content.trim(), userEmail);

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
  } catch (error: any) {
    logger.error('Error al editar mensaje:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// Agregar reacción a mensaje
export const addReaction = async (req: any, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userEmail = req.user?.userEmail;

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

    await addReactionToMessageModel(messageId, userEmail, emoji);

    res.json({
      success: true,
      message: 'Reacción agregada exitosamente',
    });
  } catch (error: any) {
    logger.error('Error al agregar reacción:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// Remover reacción de mensaje
export const removeReaction = async (req: any, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userEmail = req.user?.userEmail;

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

    await removeReactionFromMessageModel(messageId, userEmail, emoji);

    res.json({
      success: true,
      message: 'Reacción removida exitosamente',
    });
  } catch (error: any) {
    logger.error('Error al remover reacción:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// Eliminar mensaje
export const deleteMessage = async (req: any, res: Response) => {
  try {
    const { messageId } = req.params;
    const userEmail = req.user?.userEmail;

    if (!userEmail) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
      return;
    }

    await deleteMessageModel(messageId, userEmail);

    res.json({
      success: true,
      message: 'Mensaje eliminado exitosamente',
    });
  } catch (error: any) {
    logger.error('Error al eliminar mensaje:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};

// Actualizar indicador de escritura
export const updateTypingIndicator = async (req: any, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { isTyping } = req.body;
    const userEmail = req.user?.userEmail;

    if (!userEmail) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
      return;
    }

    await updateTypingIndicatorModel(conversationId, userEmail, isTyping);

    res.json({
      success: true,
      message: 'Indicador de escritura actualizado',
    });
  } catch (error: any) {
    logger.error('Error al actualizar indicador de escritura:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
};
