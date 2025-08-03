import { Request, Response } from "express";
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
  getChatStatsModel
} from "../models/chatModel";
import { ChatFilters } from "../utils/DataTypes";

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
        error: 'Usuario no autenticado' 
      });
      return;
    }

    const conversations = await getConversationsByUserModel(userEmail);
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error: any) {
    logger.error('Error al obtener conversaciones:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
};

// Obtener mensajes de una conversación específica
export const getMessages = async (req: any, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userEmail = req.user?.userEmail;
    
    if (!userEmail) {
      res.status(401).json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      });
      return;
    }

    // Verificar que el usuario es participante de la conversación
    const conversation = await getConversationByIdModel(conversationId);
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

    const messages = await getMessagesByConversationModel(conversationId);
    
    // Marcar conversación como leída
    await markConversationAsReadModel(conversationId, userEmail);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error: any) {
    logger.error('Error al obtener mensajes:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
};

// Enviar un mensaje
export const sendMessage = async (req: any, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text' } = req.body;
    const userEmail = req.user?.userEmail;
    const userName = req.user?.name;
    
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
    const conversation = await getConversationByIdModel(conversationId);
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
      status: 'sent' as const,
      type: type as 'text' | 'image' | 'audio' | 'file'
    };

    const message = await createMessageModel(messageData);
    
    res.json({
      success: true,
      data: message
    });
  } catch (error: any) {
    logger.error('Error al enviar mensaje:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
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
        error: 'Usuario no autenticado' 
      });
      return;
    }

    await markMessageAsReadModel(messageId);
    
    res.json({
      success: true,
      data: null
    });
  } catch (error: any) {
    logger.error('Error al marcar mensaje como leído:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
};

// Crear una nueva conversación
export const createConversation = async (req: any, res: Response) => {
  try {
    const { participants } = req.body;
    const userEmail = req.user?.userEmail;
    
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
    const existingConversation = await getConversationBetweenUsersModel(userEmail, participants[0]);
    if (existingConversation) {
      res.json({
        success: true,
        data: existingConversation
      });
      return;
    }

    const conversation = await createConversationModel(allParticipants);
    
    res.json({
      success: true,
      data: conversation
    });
  } catch (error: any) {
    logger.error('Error al crear conversación:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
};

// Buscar conversaciones con filtros
export const searchConversations = async (req: any, res: Response) => {
  try {
    const userEmail = req.user?.userEmail;
    const { search, unreadOnly, dateFrom, dateTo } = req.query;
    
    if (!userEmail) {
      res.status(401).json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      });
      return;
    }

    const filters: ChatFilters = {
      search: search as string,
      unreadOnly: unreadOnly === 'true',
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    const conversations = await searchConversationsModel(userEmail, filters);
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error: any) {
    logger.error('Error al buscar conversaciones:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
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
        error: 'Usuario no autenticado' 
      });
      return;
    }

    await deleteConversationModel(conversationId, userEmail);
    
    res.json({
      success: true,
      data: null
    });
  } catch (error: any) {
    logger.error('Error al eliminar conversación:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
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
        error: 'Usuario no autenticado' 
      });
      return;
    }

    await archiveConversationModel(conversationId, userEmail);
    
    res.json({
      success: true,
      data: null
    });
  } catch (error: any) {
    logger.error('Error al archivar conversación:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
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
        error: 'Usuario no autenticado' 
      });
      return;
    }

    const conversation = await getConversationByIdModel(conversationId);
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
  } catch (error: any) {
    logger.error('Error al obtener conversación:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de chat
export const getChatStats = async (req: any, res: Response) => {
  try {
    const userEmail = req.user?.userEmail;
    
    if (!userEmail) {
      res.status(401).json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      });
      return;
    }

    const stats = await getChatStatsModel(userEmail);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    logger.error('Error al obtener estadísticas de chat:', error as Error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
}; 