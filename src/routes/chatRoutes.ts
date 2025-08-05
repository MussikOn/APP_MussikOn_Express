import express from 'express';
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
  getAvailableUsers,
  editMessage,
  addReaction,
  removeReaction,
  deleteMessage,
  updateTypingIndicator
} from '../controllers/chatController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         conversationId:
 *           type: string
 *         senderId:
 *           type: string
 *         senderName:
 *           type: string
 *         content:
 *           type: string
 *         timestamp:
 *           type: string
 *         status:
 *           type: string
 *           enum: [sent, delivered, read]
 *         type:
 *           type: string
 *           enum: [text, image, audio, file, location, contact]
 *         metadata:
 *           type: object
 *         editedAt:
 *           type: string
 *         isEdited:
 *           type: boolean
 *         reactions:
 *           type: object
 *         replyTo:
 *           type: object
 *         deletedAt:
 *           type: string
 *         isDeleted:
 *           type: boolean
 *     Conversation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *         lastMessage:
 *           $ref: '#/components/schemas/Message'
 *         unreadCount:
 *           type: number
 *         updatedAt:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *         type:
 *           type: string
 *           enum: [direct, group, event]
 *         name:
 *           type: string
 *         avatar:
 *           type: string
 *         settings:
 *           type: object
 *         typingUsers:
 *           type: array
 *           items:
 *             type: string
 *         eventId:
 *           type: string
 *     ChatStats:
 *       type: object
 *       properties:
 *         totalConversations:
 *           type: number
 *         unreadMessages:
 *           type: number
 *         activeConversations:
 *           type: number
 *         totalMessages:
 *           type: number
 *         messagesThisWeek:
 *           type: number
 *         messagesThisMonth:
 *           type: number
 *         mostActiveConversation:
 *           type: object
 */

/**
 * @swagger
 * /chat/conversations:
 *   get:
 *     summary: Obtener todas las conversaciones del usuario
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conversaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 */
router.get('/conversations', authMiddleware, getConversations);

/**
 * @swagger
 * /chat/conversations/{conversationId}:
 *   get:
 *     summary: Obtener conversación por ID
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles de la conversación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 */
router.get('/conversations/:conversationId', authMiddleware, getConversationById);

/**
 * @swagger
 * /chat/conversations/{conversationId}/messages:
 *   get:
 *     summary: Obtener mensajes de una conversación
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *           default: 0
 *     responses:
 *       200:
 *         description: Lista de mensajes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 */
router.get('/conversations/:conversationId/messages', authMiddleware, getMessages);

/**
 * @swagger
 * /chat/conversations:
 *   post:
 *     summary: Crear una nueva conversación
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: string
 *                 enum: [direct, group, event]
 *                 default: direct
 *               name:
 *                 type: string
 *               eventId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversación creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 */
router.post('/conversations', authMiddleware, createConversation);

/**
 * @swagger
 * /chat/messages:
 *   post:
 *     summary: Enviar un mensaje
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [text, image, audio, file, location, contact]
 *                 default: text
 *               metadata:
 *                 type: object
 *               replyTo:
 *                 type: object
 *     responses:
 *       201:
 *         description: Mensaje enviado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 */
router.post('/messages', authMiddleware, sendMessage);

/**
 * @swagger
 * /chat/messages/{messageId}/edit:
 *   put:
 *     summary: Editar un mensaje
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mensaje editado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 */
router.put('/messages/:messageId/edit', authMiddleware, editMessage);

/**
 * @swagger
 * /chat/messages/{messageId}/reactions:
 *   post:
 *     summary: Agregar reacción a un mensaje
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emoji:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reacción agregada
 */
router.post('/messages/:messageId/reactions', authMiddleware, addReaction);

/**
 * @swagger
 * /chat/messages/{messageId}/reactions:
 *   delete:
 *     summary: Remover reacción de un mensaje
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emoji:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reacción removida
 */
router.delete('/messages/:messageId/reactions', authMiddleware, removeReaction);

/**
 * @swagger
 * /chat/messages/{messageId}:
 *   delete:
 *     summary: Eliminar un mensaje
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mensaje eliminado
 */
router.delete('/messages/:messageId', authMiddleware, deleteMessage);

/**
 * @swagger
 * /chat/messages/{messageId}/read:
 *   put:
 *     summary: Marcar mensaje como leído
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mensaje marcado como leído
 */
router.put('/messages/:messageId/read', authMiddleware, markAsRead);

/**
 * @swagger
 * /chat/conversations/{conversationId}/typing:
 *   put:
 *     summary: Actualizar indicador de escritura
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isTyping:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Indicador actualizado
 */
router.put('/conversations/:conversationId/typing', authMiddleware, updateTypingIndicator);

/**
 * @swagger
 * /chat/conversations/search:
 *   get:
 *     summary: Buscar conversaciones
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [direct, group, event]
 *     responses:
 *       200:
 *         description: Conversaciones filtradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 */
router.get('/conversations/search', authMiddleware, searchConversations);

/**
 * @swagger
 * /chat/conversations/{conversationId}:
 *   delete:
 *     summary: Eliminar conversación
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversación eliminada
 */
router.delete('/conversations/:conversationId', authMiddleware, deleteConversation);

/**
 * @swagger
 * /chat/conversations/{conversationId}/archive:
 *   put:
 *     summary: Archivar conversación
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversación archivada
 */
router.put('/conversations/:conversationId/archive', authMiddleware, archiveConversation);

/**
 * @swagger
 * /chat/stats:
 *   get:
 *     summary: Obtener estadísticas del chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del chat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ChatStats'
 */
router.get('/stats', authMiddleware, getChatStats);

/**
 * @swagger
 * /chat/users:
 *   get:
 *     summary: Obtener usuarios disponibles para chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userEmail:
 *                         type: string
 *                       name:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       roll:
 *                         type: string
 */
router.get('/users', authMiddleware, getAvailableUsers);

export default router;
