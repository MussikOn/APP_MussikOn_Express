"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
class NotificationService {
    constructor(io) {
        this.io = io;
    }
    /**
     * Enviar notificación de solicitud cancelada
     */
    sendRequestCancelledNotification(assignedMusicianEmail, event, cancelledBy) {
        try {
            const notificationData = {
                eventId: event.id,
                message: 'Una solicitud que aceptaste fue cancelada por el organizador.',
                event: Object.assign(Object.assign({}, event), { status: 'cancelled', cancelledAt: new Date().toISOString(), cancelledBy }),
                timestamp: new Date(),
            };
            const socketData = {
                userEmail: assignedMusicianEmail,
                data: notificationData,
            };
            this.io.emit('request-cancelled', socketData);
            console.log(`🔔 Notificación de cancelación enviada a ${assignedMusicianEmail}`);
        }
        catch (error) {
            console.error('Error sending cancellation notification:', error);
        }
    }
    /**
     * Enviar notificación de solicitud completada
     */
    sendRequestCompletedNotification(organizerEmail, event, completedBy) {
        try {
            const notificationData = {
                eventId: event.id,
                message: 'Una solicitud de músico ha sido marcada como completada.',
                event: Object.assign(Object.assign({}, event), { status: 'completed', completedAt: new Date().toISOString(), completedBy }),
                timestamp: new Date(),
            };
            const socketData = {
                userEmail: organizerEmail,
                data: notificationData,
            };
            this.io.emit('request-completed', socketData);
            console.log(`🔔 Notificación de completación enviada a ${organizerEmail}`);
        }
        catch (error) {
            console.error('Error sending completion notification:', error);
        }
    }
    /**
     * Enviar notificación de músico aceptado
     */
    sendMusicianAcceptedNotification(organizerEmail, event, musician) {
        try {
            const notificationData = {
                requestId: event.id,
                musician,
                event,
            };
            const socketData = {
                userEmail: organizerEmail,
                data: notificationData,
            };
            this.io.emit('musician-accepted', socketData);
            console.log(`🔔 Notificación de músico aceptado enviada a ${organizerEmail}`);
        }
        catch (error) {
            console.error('Error sending musician accepted notification:', error);
        }
    }
    /**
     * Enviar notificación de nueva solicitud
     */
    sendNewRequestNotification(event) {
        try {
            this.io.emit('new-event-request', event);
            console.log('🔔 Notificación de nueva solicitud enviada a todos los músicos');
        }
        catch (error) {
            console.error('Error sending new request notification:', error);
        }
    }
    /**
     * Enviar notificación personalizada
     */
    sendCustomNotification(userEmail, message, data) {
        try {
            this.io.to(userEmail).emit('custom-notification', {
                message,
                data,
                timestamp: new Date(),
            });
            console.log(`🔔 Notificación personalizada enviada a ${userEmail}`);
        }
        catch (error) {
            console.error('Error sending custom notification:', error);
        }
    }
    /**
     * Verificar si un usuario está conectado
     */
    isUserConnected(userEmail) {
        try {
            const room = this.io.sockets.adapter.rooms.get(userEmail);
            return room !== undefined && room.size > 0;
        }
        catch (error) {
            console.error('Error checking user connection:', error);
            return false;
        }
    }
    /**
     * Obtener lista de usuarios conectados
     */
    getConnectedUsers() {
        try {
            const rooms = this.io.sockets.adapter.rooms;
            const connectedUsers = [];
            rooms.forEach((_, roomName) => {
                // Filtrar solo emails válidos (no socket IDs)
                if (roomName.includes('@')) {
                    connectedUsers.push(roomName);
                }
            });
            return connectedUsers;
        }
        catch (error) {
            console.error('Error getting connected users:', error);
            return [];
        }
    }
    /**
     * Enviar notificación de debug
     */
    sendDebugNotification(message, data) {
        try {
            this.io.emit('debug', {
                message,
                data,
                timestamp: new Date(),
            });
            console.log('🔍 Notificación de debug enviada');
        }
        catch (error) {
            console.error('Error sending debug notification:', error);
        }
    }
}
exports.NotificationService = NotificationService;
