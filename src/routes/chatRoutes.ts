import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  createConversation,
  searchConversations,
  deleteConversation,
  archiveConversation,
  getConversationById,
  getChatStats,
} from '../controllers/chatController';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtener todas las conversaciones del usuario
router.get('/conversations', getConversations);

// Buscar conversaciones con filtros
router.get('/conversations/search', searchConversations);

// Obtener estadísticas de chat
router.get('/stats', getChatStats);

// Crear una nueva conversación
router.post('/conversations', createConversation);

// Obtener conversación por ID
router.get('/conversations/:conversationId', getConversationById);

// Obtener mensajes de una conversación
router.get('/conversations/:conversationId/messages', getMessages);

// Enviar mensaje a una conversación
router.post('/conversations/:conversationId/messages', sendMessage);

// Marcar mensaje como leído
router.patch('/messages/:messageId/read', markAsRead);

// Archivar conversación
router.patch('/conversations/:conversationId/archive', archiveConversation);

// Eliminar conversación
router.delete('/conversations/:conversationId', deleteConversation);

export default router;
