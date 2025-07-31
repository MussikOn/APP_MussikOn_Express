"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
exports.initializeSocket = initializeSocket;
const socket_io_1 = require("socket.io");
const eventSocket_1 = require("../sockets/eventSocket");
exports.users = {};
function initializeSocket(server, userMap) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT"],
        },
    });
    io.on("connection", (socket) => {
        (0, eventSocket_1.socketHandler)(io, socket, userMap);
    });
    return io;
}
