"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const chatController_1 = require("../controllers/chatController");
const router = express_1.default.Router();
// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware_1.authMiddleware);
// Obtener todas las conversaciones del usuario
router.get('/conversations', chatController_1.getConversations);
// Buscar conversaciones con filtros
router.get('/conversations/search', chatController_1.searchConversations);
// Obtener estadísticas de chat
router.get('/stats', chatController_1.getChatStats);
// Obtener usuarios disponibles para chat
router.get('/users/available', chatController_1.getAvailableUsers);
// Crear una nueva conversación
router.post('/conversations', chatController_1.createConversation);
// Obtener conversación por ID
router.get('/conversations/:conversationId', chatController_1.getConversationById);
// Obtener mensajes de una conversación
router.get('/conversations/:conversationId/messages', chatController_1.getMessages);
// Enviar mensaje a una conversación
router.post('/conversations/:conversationId/messages', chatController_1.sendMessage);
// Marcar mensaje como leído
router.patch('/messages/:messageId/read', chatController_1.markAsRead);
// Archivar conversación
router.patch('/conversations/:conversationId/archive', chatController_1.archiveConversation);
// Eliminar conversación
router.delete('/conversations/:conversationId', chatController_1.deleteConversation);
// Subir archivo para chat
router.post('/upload', uploadMiddleware_1.upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (error) {
        console.error('Error uploading chat file:', error);
        res.status(500).json({
            success: false,
            error: 'Error al subir el archivo'
        });
    }
}));
exports.default = router;
