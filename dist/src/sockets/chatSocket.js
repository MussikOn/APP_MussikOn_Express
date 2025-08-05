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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageToConversation = exports.sendMessageToUser = exports.sendNotificationToUser = exports.getConnectedUsers = exports.chatSocketHandler = void 0;
const chatModel_1 = require("../models/chatModel");
const loggerService_1 = require("../services/loggerService");
const connectedUsers = {};
const chatSocketHandler = (io, socket) => {
    loggerService_1.logger.info('💬 Usuario conectado al chat:', { context: 'ChatSocket', metadata: { socketId: socket.id } });
    // Registrar usuario en el chat
    socket.on('chat-register', (userData) => {
        const { userEmail, userName } = userData;
        connectedUsers[userEmail.toLowerCase()] = {
            socketId: socket.id,
            userEmail: userEmail.toLowerCase(),
            userName,
        };
        // Unirse a la sala personal del usuario
        socket.join(userEmail.toLowerCase());
        loggerService_1.logger.info('📝 Usuario registrado en chat:', { context: 'ChatSocket', metadata: { userEmail } });
        console.log('[src/sockets/chatSocket.ts:33] 👥 Usuarios conectados al chat:', Object.keys(connectedUsers));
        // Notificar a otros usuarios que este usuario está online
        socket.broadcast.emit('user-online', {
            userEmail: userEmail.toLowerCase(),
            userName
        });
    });
    // Unirse a una conversación
    socket.on('join-conversation', (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userEmail = Object.keys(connectedUsers).find(email => connectedUsers[email].socketId === socket.id);
            if (!userEmail) {
                socket.emit('error', { message: 'Usuario no registrado' });
                return;
            }
            // Verificar que el usuario es participante de la conversación
            const conversation = yield (0, chatModel_1.getConversationByIdModel)(conversationId);
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
            console.log(`[src/sockets/chatSocket.ts:60] 💬 Usuario ${userEmail} se unió a la conversación: ${conversationId}`);
            // Notificar a otros participantes
            socket.to(conversationId).emit('user-joined-conversation', {
                userEmail,
                userName: connectedUsers[userEmail].userName,
                conversationId
            });
        }
        catch (error) {
            loggerService_1.logger.error('Error al unirse a conversación:', error);
            socket.emit('error', { message: 'Error al unirse a la conversación' });
        }
    }));
    // Salir de una conversación
    socket.on('leave-conversation', (conversationId) => {
        const userEmail = Object.keys(connectedUsers).find(email => connectedUsers[email].socketId === socket.id);
        if (userEmail) {
            socket.leave(conversationId);
            delete connectedUsers[userEmail].currentConversation;
            console.log(`[src/sockets/chatSocket.ts:85] 💬 Usuario ${userEmail} salió de la conversación: ${conversationId}`);
            // Notificar a otros participantes
            socket.to(conversationId).emit('user-left-conversation', {
                userEmail,
                userName: connectedUsers[userEmail].userName,
                conversationId
            });
        }
    });
    // Indicador de escritura
    socket.on('typing', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { conversationId, isTyping } = data;
            const userEmail = Object.keys(connectedUsers).find(email => connectedUsers[email].socketId === socket.id);
            if (!userEmail) {
                return;
            }
            // Actualizar en la base de datos
            yield (0, chatModel_1.updateTypingIndicatorModel)(conversationId, userEmail, isTyping);
            // Notificar a otros participantes
            socket.to(conversationId).emit('user-typing', {
                userEmail,
                userName: connectedUsers[userEmail].userName,
                isTyping,
                conversationId
            });
        }
        catch (error) {
            loggerService_1.logger.error('Error al actualizar indicador de escritura:', error);
        }
    }));
    // Enviar mensaje en tiempo real
    socket.on('send-message', (messageData) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { conversationId, senderId, senderName, content, type = 'text', metadata, replyTo } = messageData;
            // Verificar que la conversación existe
            const conversation = yield (0, chatModel_1.getConversationByIdModel)(conversationId);
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
            const message = {
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
            const createdMessage = yield (0, chatModel_1.createMessageModel)(message);
            // Enviar el mensaje a todos los participantes de la conversación
            io.to(conversationId).emit('new-message', createdMessage);
            // Enviar notificación push a usuarios no conectados
            const notification = {
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
            loggerService_1.logger.info('Mensaje enviado:', { metadata: { messageId: createdMessage.id, conversationId } });
        }
        catch (error) {
            loggerService_1.logger.error('Error al enviar mensaje:', error);
            socket.emit('message-error', { error: 'Error al enviar mensaje' });
        }
    }));
    // Editar mensaje
    socket.on('edit-message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { messageId, newContent } = data;
            const userEmail = Object.keys(connectedUsers).find(email => connectedUsers[email].socketId === socket.id);
            if (!userEmail) {
                socket.emit('error', { message: 'Usuario no registrado' });
                return;
            }
            const updatedMessage = yield (0, chatModel_1.editMessageModel)(messageId, newContent, userEmail);
            if (!updatedMessage) {
                socket.emit('error', { message: 'Mensaje no encontrado' });
                return;
            }
            // Notificar a todos los participantes de la conversación
            io.to(updatedMessage.conversationId).emit('message-edited', updatedMessage);
        }
        catch (error) {
            loggerService_1.logger.error('Error al editar mensaje:', error);
            socket.emit('error', { message: 'Error al editar mensaje' });
        }
    }));
    // Agregar reacción
    socket.on('add-reaction', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { messageId, emoji } = data;
            const userEmail = Object.keys(connectedUsers).find(email => connectedUsers[email].socketId === socket.id);
            if (!userEmail) {
                socket.emit('error', { message: 'Usuario no registrado' });
                return;
            }
            yield (0, chatModel_1.addReactionToMessageModel)(messageId, userEmail, emoji);
            // Obtener el mensaje actualizado y notificar
            // Aquí podrías obtener el mensaje actualizado de la base de datos
            socket.broadcast.emit('reaction-added', {
                messageId,
                userEmail,
                emoji
            });
        }
        catch (error) {
            loggerService_1.logger.error('Error al agregar reacción:', error);
            socket.emit('error', { message: 'Error al agregar reacción' });
        }
    }));
    // Remover reacción
    socket.on('remove-reaction', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { messageId, emoji } = data;
            const userEmail = Object.keys(connectedUsers).find(email => connectedUsers[email].socketId === socket.id);
            if (!userEmail) {
                socket.emit('error', { message: 'Usuario no registrado' });
                return;
            }
            yield (0, chatModel_1.removeReactionFromMessageModel)(messageId, userEmail, emoji);
            socket.broadcast.emit('reaction-removed', {
                messageId,
                userEmail,
                emoji
            });
        }
        catch (error) {
            loggerService_1.logger.error('Error al remover reacción:', error);
            socket.emit('error', { message: 'Error al remover reacción' });
        }
    }));
    // Eliminar mensaje
    socket.on('delete-message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { messageId } = data;
            const userEmail = Object.keys(connectedUsers).find(email => connectedUsers[email].socketId === socket.id);
            if (!userEmail) {
                socket.emit('error', { message: 'Usuario no registrado' });
                return;
            }
            yield (0, chatModel_1.deleteMessageModel)(messageId, userEmail);
            socket.broadcast.emit('message-deleted', {
                messageId,
                userEmail
            });
        }
        catch (error) {
            loggerService_1.logger.error('Error al eliminar mensaje:', error);
            socket.emit('error', { message: 'Error al eliminar mensaje' });
        }
    }));
    // Marcar mensaje como leído
    socket.on('mark-as-read', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { messageId } = data;
            const userEmail = Object.keys(connectedUsers).find(email => connectedUsers[email].socketId === socket.id);
            if (!userEmail) {
                return;
            }
            yield (0, chatModel_1.markMessageAsReadModel)(messageId);
            // Notificar al remitente que el mensaje fue leído
            socket.broadcast.emit('message-read', {
                messageId,
                readBy: userEmail
            });
        }
        catch (error) {
            loggerService_1.logger.error('Error al marcar mensaje como leído:', error);
        }
    }));
    // Manejar desconexión
    socket.on('disconnect', () => {
        const userEmail = Object.keys(connectedUsers).find(email => connectedUsers[email].socketId === socket.id);
        if (userEmail) {
            const user = connectedUsers[userEmail];
            // Notificar a otros usuarios que este usuario está offline
            socket.broadcast.emit('user-offline', {
                userEmail,
                userName: user.userName
            });
            // Limpiar indicadores de escritura
            if (user.currentConversation) {
                (0, chatModel_1.updateTypingIndicatorModel)(user.currentConversation, userEmail, false)
                    .then(() => {
                    socket.to(user.currentConversation).emit('user-typing', {
                        userEmail,
                        userName: user.userName,
                        isTyping: false,
                        conversationId: user.currentConversation
                    });
                })
                    .catch(error => {
                    loggerService_1.logger.error('Error al limpiar indicador de escritura:', error);
                });
            }
            // Remover usuario de la lista de conectados
            delete connectedUsers[userEmail];
            console.log(`[src/sockets/chatSocket.ts:280] 👋 Usuario ${userEmail} desconectado. Usuarios restantes:`, Object.keys(connectedUsers));
        }
    });
};
exports.chatSocketHandler = chatSocketHandler;
// Función para obtener usuarios conectados
const getConnectedUsers = () => connectedUsers;
exports.getConnectedUsers = getConnectedUsers;
// Función para enviar notificación a usuario específico
const sendNotificationToUser = (io, userEmail, notification) => {
    const user = connectedUsers[userEmail.toLowerCase()];
    if (user) {
        io.to(user.socketId).emit('chat-notification', notification);
    }
};
exports.sendNotificationToUser = sendNotificationToUser;
// Función para enviar mensaje a usuario específico
const sendMessageToUser = (io, userEmail, message) => {
    const user = connectedUsers[userEmail.toLowerCase()];
    if (user) {
        io.to(user.socketId).emit('new-message', message);
    }
};
exports.sendMessageToUser = sendMessageToUser;
// Función para enviar mensaje a conversación
const sendMessageToConversation = (io, conversationId, message) => {
    io.to(conversationId).emit('new-message', message);
};
exports.sendMessageToConversation = sendMessageToConversation;
