import { Server, Socket } from 'socket.io';
import {
  createMessageModel,
  getConversationByIdModel,
  updateTypingIndicatorModel,
  editMessageModel,
  addReactionToMessageModel,
  removeReactionFromMessageModel,
  deleteMessageModel,
  markMessageAsReadModel
} from '../models/chatModel';
import { Message, ChatNotification } from '../utils/DataTypes';
import { logger } from '../services/loggerService';

interface ChatUser {
  socketId: string;
  userEmail: string;
  userName: string;
  currentConversation?: string;
}

interface ConnectedUsers {
  [userEmail: string]: ChatUser;
}

const connectedUsers: ConnectedUsers = {};

export const chatSocketHandler = (io: Server, socket: Socket) => {
  logger.info('💬 Usuario conectado al chat:', { context: 'ChatSocket', metadata: { socketId: socket.id } });

  // Registrar usuario en el chat
  socket.on(
    'chat-register',
    (userData: { userEmail: string; userName: string }) => {
      const { userEmail, userName } = userData;
      connectedUsers[userEmail.toLowerCase()] = {
        socketId: socket.id,
        userEmail: userEmail.toLowerCase(),
        userName,
      };

      // Unirse a la sala personal del usuario
      socket.join(userEmail.toLowerCase());

      logger.info('📝 Usuario registrado en chat:', { context: 'ChatSocket', metadata: { userEmail } });
      console.log(
        '[src/sockets/chatSocket.ts:33] 👥 Usuarios conectados al chat:',
        Object.keys(connectedUsers)
      );

      // Notificar a otros usuarios que este usuario está online
      socket.broadcast.emit('user-online', {
        userEmail: userEmail.toLowerCase(),
        userName
      });
    }
  );

  // Unirse a una conversación
  socket.on('join-conversation', async (conversationId: string) => {
    try {
      const userEmail = Object.keys(connectedUsers).find(
        email => connectedUsers[email].socketId === socket.id
      );

      if (!userEmail) {
        socket.emit('error', { message: 'Usuario no registrado' });
        return;
      }

      // Verificar que el usuario es participante de la conversación
      const conversation = await getConversationByIdModel(conversationId);
      if (!conversation) {
        socket.emit('error', { message: 'Conversación no encontrada' });
        return;
      }

      if (!conversation.participants.includes(userEmail)) {
        socket.emit('error', { message: 'No tienes permisos para acceder a esta conversación' });
        return;
      }

      socket.join(conversationId);
      connectedUsers[userEmail].currentConversation = conversationId;

      console.log(
        `[src/sockets/chatSocket.ts:60] 💬 Usuario ${userEmail} se unió a la conversación: ${conversationId}`
      );

      // Notificar a otros participantes
      socket.to(conversationId).emit('user-joined-conversation', {
        userEmail,
        userName: connectedUsers[userEmail].userName,
        conversationId
      });
    } catch (error) {
      logger.error('Error al unirse a conversación:', error as Error);
      socket.emit('error', { message: 'Error al unirse a la conversación' });
    }
  });

  // Salir de una conversación
  socket.on('leave-conversation', (conversationId: string) => {
    const userEmail = Object.keys(connectedUsers).find(
      email => connectedUsers[email].socketId === socket.id
    );

    if (userEmail) {
      socket.leave(conversationId);
      delete connectedUsers[userEmail].currentConversation;

      console.log(
        `[src/sockets/chatSocket.ts:85] 💬 Usuario ${userEmail} salió de la conversación: ${conversationId}`
      );

      // Notificar a otros participantes
      socket.to(conversationId).emit('user-left-conversation', {
        userEmail,
        userName: connectedUsers[userEmail].userName,
        conversationId
      });
    }
  });

  // Indicador de escritura
  socket.on('typing', async (data: { conversationId: string; isTyping: boolean }) => {
    try {
      const { conversationId, isTyping } = data;
      const userEmail = Object.keys(connectedUsers).find(
        email => connectedUsers[email].socketId === socket.id
      );

      if (!userEmail) {
        return;
      }

      // Actualizar en la base de datos
      await updateTypingIndicatorModel(conversationId, userEmail, isTyping);

      // Notificar a otros participantes
      socket.to(conversationId).emit('user-typing', {
        userEmail,
        userName: connectedUsers[userEmail].userName,
        isTyping,
        conversationId
      });
    } catch (error) {
      logger.error('Error al actualizar indicador de escritura:', error as Error);
    }
  });

  // Enviar mensaje en tiempo real
  socket.on(
    'send-message',
    async (messageData: {
      conversationId: string;
      senderId: string;
      senderName: string;
      content: string;
      type?: 'text' | 'image' | 'audio' | 'file' | 'location' | 'contact';
      metadata?: any;
      replyTo?: any;
    }) => {
      try {
        const {
          conversationId,
          senderId,
          senderName,
          content,
          type = 'text',
          metadata,
          replyTo
        } = messageData;

        // Verificar que la conversación existe
        const conversation = await getConversationByIdModel(conversationId);
        if (!conversation) {
          socket.emit('message-error', { error: 'Conversación no encontrada' });
          return;
        }

        // Verificar que el remitente es participante
        if (!conversation.participants.includes(senderId)) {
          socket.emit('message-error', {
            error: 'No tienes permisos para enviar mensajes a esta conversación'
          });
          return;
        }

        // Crear el mensaje en la base de datos
        const message: Omit<Message, 'id' | 'timestamp'> = {
          conversationId,
          senderId,
          senderName,
          content,
          type,
          metadata,
          replyTo,
          status: 'sent',
          isEdited: false,
          isDeleted: false,
          reactions: {}
        };

        const createdMessage = await createMessageModel(message);

        // Enviar el mensaje a todos los participantes de la conversación
        io.to(conversationId).emit('new-message', createdMessage);

        // Enviar notificación push a usuarios no conectados
        const notification: ChatNotification = {
          type: 'new_message',
          conversationId,
          senderId,
          senderName,
          message: content,
          timestamp: createdMessage.timestamp
        };

        conversation.participants.forEach(participant => {
          if (participant !== senderId && !connectedUsers[participant]) {
            // Enviar notificación push aquí si está implementado
            console.log(`Enviando notificación push a: ${participant}`);
          }
        });

        logger.info('Mensaje enviado:', { metadata: { messageId: createdMessage.id, conversationId } });
      } catch (error) {
        logger.error('Error al enviar mensaje:', error as Error);
        socket.emit('message-error', { error: 'Error al enviar mensaje' });
      }
    }
  );

  // Editar mensaje
  socket.on('edit-message', async (data: { messageId: string; newContent: string }) => {
    try {
      const { messageId, newContent } = data;
      const userEmail = Object.keys(connectedUsers).find(
        email => connectedUsers[email].socketId === socket.id
      );

      if (!userEmail) {
        socket.emit('error', { message: 'Usuario no registrado' });
        return;
      }

      const updatedMessage = await editMessageModel(messageId, newContent, userEmail);
      if (!updatedMessage) {
        socket.emit('error', { message: 'Mensaje no encontrado' });
        return;
      }

      // Notificar a todos los participantes de la conversación
      io.to(updatedMessage.conversationId).emit('message-edited', updatedMessage);
    } catch (error) {
      logger.error('Error al editar mensaje:', error as Error);
      socket.emit('error', { message: 'Error al editar mensaje' });
    }
  });

  // Agregar reacción
  socket.on('add-reaction', async (data: { messageId: string; emoji: string }) => {
    try {
      const { messageId, emoji } = data;
      const userEmail = Object.keys(connectedUsers).find(
        email => connectedUsers[email].socketId === socket.id
      );

      if (!userEmail) {
        socket.emit('error', { message: 'Usuario no registrado' });
        return;
      }

      await addReactionToMessageModel(messageId, userEmail, emoji);

      // Obtener el mensaje actualizado y notificar
      // Aquí podrías obtener el mensaje actualizado de la base de datos
      socket.broadcast.emit('reaction-added', {
        messageId,
        userEmail,
        emoji
      });
    } catch (error) {
      logger.error('Error al agregar reacción:', error as Error);
      socket.emit('error', { message: 'Error al agregar reacción' });
    }
  });

  // Remover reacción
  socket.on('remove-reaction', async (data: { messageId: string; emoji: string }) => {
    try {
      const { messageId, emoji } = data;
      const userEmail = Object.keys(connectedUsers).find(
        email => connectedUsers[email].socketId === socket.id
      );

      if (!userEmail) {
        socket.emit('error', { message: 'Usuario no registrado' });
        return;
      }

      await removeReactionFromMessageModel(messageId, userEmail, emoji);

      socket.broadcast.emit('reaction-removed', {
        messageId,
        userEmail,
        emoji
      });
    } catch (error) {
      logger.error('Error al remover reacción:', error as Error);
      socket.emit('error', { message: 'Error al remover reacción' });
    }
  });

  // Eliminar mensaje
  socket.on('delete-message', async (data: { messageId: string }) => {
    try {
      const { messageId } = data;
      const userEmail = Object.keys(connectedUsers).find(
        email => connectedUsers[email].socketId === socket.id
      );

      if (!userEmail) {
        socket.emit('error', { message: 'Usuario no registrado' });
        return;
      }

      await deleteMessageModel(messageId, userEmail);

      socket.broadcast.emit('message-deleted', {
        messageId,
        userEmail
      });
    } catch (error) {
      logger.error('Error al eliminar mensaje:', error as Error);
      socket.emit('error', { message: 'Error al eliminar mensaje' });
    }
  });

  // Marcar mensaje como leído
  socket.on('mark-as-read', async (data: { messageId: string }) => {
    try {
      const { messageId } = data;
      const userEmail = Object.keys(connectedUsers).find(
        email => connectedUsers[email].socketId === socket.id
      );

      if (!userEmail) {
        return;
      }

      await markMessageAsReadModel(messageId);

      // Notificar al remitente que el mensaje fue leído
      socket.broadcast.emit('message-read', {
        messageId,
        readBy: userEmail
      });
    } catch (error) {
      logger.error('Error al marcar mensaje como leído:', error as Error);
    }
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    const userEmail = Object.keys(connectedUsers).find(
      email => connectedUsers[email].socketId === socket.id
    );

    if (userEmail) {
      const user = connectedUsers[userEmail];
      
      // Notificar a otros usuarios que este usuario está offline
      socket.broadcast.emit('user-offline', {
        userEmail,
        userName: user.userName
      });

      // Limpiar indicadores de escritura
      if (user.currentConversation) {
        updateTypingIndicatorModel(user.currentConversation, userEmail, false)
          .then(() => {
            socket.to(user.currentConversation!).emit('user-typing', {
              userEmail,
              userName: user.userName,
              isTyping: false,
              conversationId: user.currentConversation
            });
          })
          .catch(error => {
            logger.error('Error al limpiar indicador de escritura:', error as Error);
          });
      }

      // Remover usuario de la lista de conectados
      delete connectedUsers[userEmail];

      console.log(
        `[src/sockets/chatSocket.ts:280] 👋 Usuario ${userEmail} desconectado. Usuarios restantes:`,
        Object.keys(connectedUsers)
      );
    }
  });
};

// Función para obtener usuarios conectados
export const getConnectedUsers = () => connectedUsers;

// Función para enviar notificación a usuario específico
export const sendNotificationToUser = (
  io: Server,
  userEmail: string,
  notification: ChatNotification
) => {
  const user = connectedUsers[userEmail.toLowerCase()];
  if (user) {
    io.to(user.socketId).emit('chat-notification', notification);
  }
};

// Función para enviar mensaje a usuario específico
export const sendMessageToUser = (
  io: Server,
  userEmail: string,
  message: Message
) => {
  const user = connectedUsers[userEmail.toLowerCase()];
  if (user) {
    io.to(user.socketId).emit('new-message', message);
  }
};

// Función para enviar mensaje a conversación
export const sendMessageToConversation = (
  io: Server,
  conversationId: string,
  message: Message
) => {
  io.to(conversationId).emit('new-message', message);
};
