// Eventos de socket disponibles:
// - register: Registrar usuario por email
// - send-notification: Enviar notificación a usuario
// - join: Unirse a una sala por userId
// - disconnect: Eliminar usuario de la lista de conectados

import { Server, Socket } from 'socket.io';
import { chatSocketHandler } from './chatSocket';

// const users: Record<string, string> = {};

export const socketHandler = (
  io: Server,
  socket: Socket,
  users: Record<string, string>
) => {
  console.log(
    '[src/sockets/eventSocket.ts:14] 🔌 Usuario conectado:',
    socket.id
  );

  // Autenticar usuario (nuevo evento)
  socket.on('authenticate', (data: { userEmail: string; userId: string }) => {
    const userEmail = data.userEmail.toLowerCase();
    users[userEmail] = socket.id;
    console.log(
      '[src/sockets/eventSocket.ts:20] 🔐 Usuario autenticado:',
      userEmail,
      'Socket ID:',
      socket.id
    );
    console.log(
      '[src/sockets/eventSocket.ts:21] 📊 Usuarios conectados:',
      Object.keys(users)
    );

    // Confirmar autenticación
    socket.emit('authenticated', { success: true, userEmail });
  });

  // Registrar usuario (mantener compatibilidad)
  socket.on('register', (userEmail: string) => {
    users[userEmail.toLowerCase()] = socket.id;
    console.info(
      '[src/sockets/eventSocket.ts:29] 📥 Usuarios registrados:',
      users
    );
    return;
  });

  // Enviar notificación
  socket.on('send-notification', ({ toUserId: email, data }) => {
    console.info('[src/sockets/eventSocket.ts:35] Email destinatario:', email);
    const receiverSocket = users[email];
    console.info(
      '[src/sockets/eventSocket.ts:37] Socket del destinatario:',
      receiverSocket
    );
    if (receiverSocket) {
      io.to(receiverSocket).emit('notification', data);
    }
  });

  // Unirse a una sala
  socket.on('join', (userId: string) => {
    socket.join(userId);
    console.log(
      `[src/sockets/eventSocket.ts:45] 🎧 Usuario ${userId} se unió a su sala.`
    );
    return;
  });

  // Desconexión
  socket.on('disconnect', () => {
    const userEmail = Object.keys(users).find(key => users[key] === socket.id);

    if (userEmail) {
      delete users[userEmail];
      console.log(
        `[src/sockets/eventSocket.ts:57] 🧹 Usuario eliminado: ${userEmail}`
      );
    }
    console.log(
      '[src/sockets/eventSocket.ts:59] ❌ Usuario desconectado:',
      socket.id
    );
    return;
  });

  // Inicializar el handler de chat
  chatSocketHandler(io, socket);
  return;
};

// export { users };
