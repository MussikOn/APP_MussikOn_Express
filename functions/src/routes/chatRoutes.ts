import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';
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

// Obtener usuarios disponibles para chat - TODO: Implementar función getAvailableUsers
// router.get('/users/available', getAvailableUsers);

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

// Subir archivo para chat
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No se proporcionó ningún archivo'
      });
      return;
    }

    const { conversationId } = req.body;
    
    // Aquí puedes procesar el archivo y guardarlo en IDrive E2
    // Por ahora, devolvemos una respuesta básica
    res.status(200).json({
      success: true,
      data: {
        fileUrl: `https://example.com/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        fileSize: req.file.size
      },
      message: 'Archivo subido exitosamente'
    });
  } catch (error) {
    console.error('Error uploading chat file:', error);
    res.status(500).json({
      success: false,
      error: 'Error al subir el archivo'
    });
  }
});

export default router; 