import { Server, Socket } from "socket.io";
import { createMessageModel, getConversationByIdModel } from "../models/chatModel";
import { Message } from "../utils/DataTypes";

interface ChatUser {
  socketId: string;
  userEmail: string;
  userName: string;
}

interface ConnectedUsers {
  [userEmail: string]: ChatUser;
}

const connectedUsers: ConnectedUsers = {};

export const chatSocketHandler = (io: Server, socket: Socket) => {
  console.log("💬 Usuario conectado al chat:", socket.id);

  // Registrar usuario en el chat
  socket.on("chat-register", (userData: { userEmail: string; userName: string }) => {
    const { userEmail, userName } = userData;
    connectedUsers[userEmail.toLowerCase()] = {
      socketId: socket.id,
      userEmail: userEmail.toLowerCase(),
      userName
    };
    
    // Unirse a la sala personal del usuario
    socket.join(userEmail.toLowerCase());
    
    console.log("📝 Usuario registrado en chat:", userEmail);
    console.log("👥 Usuarios conectados al chat:", Object.keys(connectedUsers));
  });

  // Unirse a una conversación
  socket.on("join-conversation", (conversationId: string) => {
    socket.join(conversationId);
    console.log(`💬 Usuario ${socket.id} se unió a la conversación: ${conversationId}`);
  });

  // Salir de una conversación
  socket.on("leave-conversation", (conversationId: string) => {
    socket.leave(conversationId);
    console.log(`💬 Usuario ${socket.id} salió de la conversación: ${conversationId}`);
  });

  // Enviar mensaje en tiempo real
  socket.on("send-message", async (messageData: {
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string;
    type?: 'text' | 'image' | 'audio' | 'file';
  }) => {
    try {
      const { conversationId, senderId, senderName, content, type = 'text' } = messageData;

      // Verificar que la conversación existe
      const conversation = await getConversationByIdModel(conversationId);
      if (!conversation) {
        socket.emit("message-error", { error: "Conversación no encontrada" });
        return;
      }

      // Verificar que el remitente es participante
      if (!conversation.participants.includes(senderId)) {
        socket.emit("message-error", { error: "No tienes permisos para enviar mensajes a esta conversación" });
        return;
      }

      // Crear el mensaje en la base de datos
      const message: Omit<Message, 'id' | 'timestamp'> = {
        conversationId,
        senderId,
        senderName,
        content,
        status: 'sent',
        type
      };

      const savedMessage = await createMessageModel(message);

      // Emitir el mensaje a todos los participantes de la conversación
      io.to(conversationId).emit("new-message", savedMessage);

      // Emitir notificación a participantes que no están en la conversación
      conversation.participants.forEach(participantEmail => {
        if (participantEmail !== senderId) {
          const participantSocket = connectedUsers[participantEmail.toLowerCase()];
          if (participantSocket) {
            io.to(participantSocket.socketId).emit("message-notification", {
              conversationId,
              message: savedMessage,
              unreadCount: conversation.unreadCount + 1
            });
          }
        }
      });

      console.log(`💬 Mensaje enviado en conversación ${conversationId}:`, savedMessage.content);
    } catch (error: any) {
      console.log('./src/sockets/chatSocket.ts line 103')
      console.error("Error al enviar mensaje:", error);
      socket.emit("message-error", { error: error.message || "Error al enviar mensaje" });
    }
  });

  // Marcar mensaje como leído
  socket.on("mark-message-read", async (data: { messageId: string; conversationId: string }) => {
    try {
      const { messageId, conversationId } = data;
      
      // Aquí podrías actualizar el estado del mensaje en la base de datos
      // Por ahora solo emitimos el evento
      
      io.to(conversationId).emit("message-read", { messageId });
      console.log(`✅ Mensaje marcado como leído: ${messageId}`);
    } catch (error: any) {
      console.log('./src/sockets/chatSocket.ts line 120')
      console.error("Error al marcar mensaje como leído:", error);
      socket.emit("message-error", { error: error.message || "Error al marcar mensaje como leído" });
    }
  });

  // Escribiendo...
  socket.on("typing", (data: { conversationId: string; userEmail: string; isTyping: boolean }) => {
    const { conversationId, userEmail, isTyping } = data;
    
    // Emitir a todos en la conversación excepto al remitente
    socket.to(conversationId).emit("user-typing", {
      conversationId,
      userEmail,
      isTyping
    });
  });

  // Estado de conexión
  socket.on("online-status", (data: { userEmail: string; isOnline: boolean }) => {
    const { userEmail, isOnline } = data;
    
    // Emitir a todos los usuarios conectados
    io.emit("user-status-changed", {
      userEmail,
      isOnline
    });
  });

  // Desconexión
  socket.on("disconnect", () => {
    // Encontrar y eliminar al usuario desconectado
    const disconnectedUser = Object.keys(connectedUsers).find(
      email => connectedUsers[email].socketId === socket.id
    );
    
    if (disconnectedUser) {
      delete connectedUsers[disconnectedUser];
      console.log(`❌ Usuario desconectado del chat: ${disconnectedUser}`);
      console.log("👥 Usuarios conectados al chat:", Object.keys(connectedUsers));
    }
    
    console.log("💬 Usuario desconectado del chat:", socket.id);
  });
};

// Función para obtener usuarios conectados (para uso en otros módulos)
export const getConnectedUsers = () => connectedUsers;

// Función para enviar notificación a un usuario específico
export const sendNotificationToUser = (io: Server, userEmail: string, notification: any) => {
  const user = connectedUsers[userEmail.toLowerCase()];
  if (user) {
    io.to(user.socketId).emit("notification", notification);
  }
}; 