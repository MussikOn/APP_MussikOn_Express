import { Server } from "socket.io";
import { socketHandler } from "../sockets/eventSocket";

export const users: Record<string, string> = {};

export function initializeSocket(server: any, userMap: Record<string, string>) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT"],
    },
  });

  io.on("connection", (socket) => {
    socketHandler(io, socket, userMap);
  });

  return io;
}

