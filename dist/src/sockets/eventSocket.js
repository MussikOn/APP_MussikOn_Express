"use strict";
// Eventos de socket disponibles:
// - register: Registrar usuario por email
// - send-notification: Enviar notificación a usuario
// - join: Unirse a una sala por userId
// - disconnect: Eliminar usuario de la lista de conectados
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHandler = void 0;
const chatSocket_1 = require("./chatSocket");
// const users: Record<string, string> = {};
const socketHandler = (io, socket, users) => {
    console.log("🔌 Usuario conectado:", socket.id);
    // Registrar usuario
    socket.on("register", (userEmail) => {
        users[userEmail.toLowerCase()] = socket.id;
        console.info("📥 Usuarios registrados:", users);
        return;
    });
    // Enviar notificación
    socket.on("send-notification", ({ toUserId: email, data }) => {
        console.info(email);
        const receiverSocket = users[email];
        console.info(receiverSocket);
        if (receiverSocket) {
            io.to(receiverSocket).emit("notification", data);
        }
    });
    // Unirse a una sala
    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`🎧 Usuario ${userId} se unió a su sala.`);
        return;
    });
    // Desconexión
    socket.on("disconnect", () => {
        const userEmail = Object.keys(users).find((key) => users[key] === socket.id);
        if (userEmail) {
            delete users[userEmail];
            console.log(`🧹 Usuario eliminado: ${userEmail}`);
        }
        console.log("❌ Usuario desconectado:", socket.id);
        return;
    });
    // Inicializar el handler de chat
    (0, chatSocket_1.chatSocketHandler)(io, socket);
    return;
};
exports.socketHandler = socketHandler;
// export { users };
