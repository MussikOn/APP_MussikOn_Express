"use strict";
// Eventos de socket disponibles:
// - register: Registrar usuario por email
// - send-notification: Enviar notificación a usuario
// - join: Unirse a una sala por userId
// - disconnect: Eliminar usuario de la lista de conectados
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHandler = void 0;
const chatSocket_1 = require("./chatSocket");
const loggerService_1 = require("../services/loggerService");
// const users: Record<string, string> = {};
const socketHandler = (io, socket, users) => {
    loggerService_1.logger.info('🔌 Usuario conectado:', { context: 'EventSocket', metadata: { socketId: socket.id } });
    // Autenticar usuario (nuevo evento)
    socket.on('authenticate', (data) => {
        const userEmail = data.userEmail.toLowerCase();
        users[userEmail] = socket.id;
        loggerService_1.logger.info('🔐 Usuario autenticado:', { context: 'EventSocket', metadata: { userEmail, socketId: socket.id } });
        console.log('[src/sockets/eventSocket.ts:21] 📊 Usuarios conectados:', Object.keys(users));
        // Confirmar autenticación
        socket.emit('authenticated', { success: true, userEmail });
    });
    // Registrar usuario (mantener compatibilidad)
    socket.on('register', (userEmail) => {
        users[userEmail.toLowerCase()] = socket.id;
        console.info('[src/sockets/eventSocket.ts:29] 📥 Usuarios registrados:', users);
        return;
    });
    // Enviar notificación
    socket.on('send-notification', ({ toUserId: email, data }) => {
        console.info('[src/sockets/eventSocket.ts:35] Email destinatario:', email);
        const receiverSocket = users[email];
        console.info('[src/sockets/eventSocket.ts:37] Socket del destinatario:', receiverSocket);
        if (receiverSocket) {
            io.to(receiverSocket).emit('notification', data);
        }
    });
    // Unirse a una sala
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`[src/sockets/eventSocket.ts:45] 🎧 Usuario ${userId} se unió a su sala.`);
        return;
    });
    // Desconexión
    socket.on('disconnect', () => {
        const userEmail = Object.keys(users).find(key => users[key] === socket.id);
        if (userEmail) {
            delete users[userEmail];
            console.log(`[src/sockets/eventSocket.ts:57] 🧹 Usuario eliminado: ${userEmail}`);
        }
        loggerService_1.logger.info('❌ Usuario desconectado:', { context: 'EventSocket', metadata: { socketId: socket.id } });
        return;
    });
    // Inicializar el handler de chat
    (0, chatSocket_1.chatSocketHandler)(io, socket);
    return;
};
exports.socketHandler = socketHandler;
// export { users };
