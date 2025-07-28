"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const chatController_1 = require("../controllers/chatController");
const router = express_1.default.Router();
// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware_1.authMiddleware);
// Obtener todas las conversaciones del usuario
router.get("/conversations", chatController_1.getConversations);
// Buscar conversaciones con filtros
router.get("/conversations/search", chatController_1.searchConversations);
// Obtener estadísticas de chat
router.get("/stats", chatController_1.getChatStats);
// Crear una nueva conversación
router.post("/conversations", chatController_1.createConversation);
// Obtener conversación por ID
router.get("/conversations/:conversationId", chatController_1.getConversationById);
// Obtener mensajes de una conversación
router.get("/conversations/:conversationId/messages", chatController_1.getMessages);
// Enviar mensaje a una conversación
router.post("/conversations/:conversationId/messages", chatController_1.sendMessage);
// Marcar mensaje como leído
router.patch("/messages/:messageId/read", chatController_1.markAsRead);
// Archivar conversación
router.patch("/conversations/:conversationId/archive", chatController_1.archiveConversation);
// Eliminar conversación
router.delete("/conversations/:conversationId", chatController_1.deleteConversation);
exports.default = router;
