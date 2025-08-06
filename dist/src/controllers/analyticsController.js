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
exports.analyticsController = exports.AnalyticsController = void 0;
const firebase_1 = require("../utils/firebase");
const loggerService_1 = require("../services/loggerService");
class AnalyticsController {
    /**
     * Obtener estadísticas generales del sistema
     */
    getSystemStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('[src/controllers/analyticsController.ts] Obteniendo estadísticas del sistema');
                // Obtener estadísticas de usuarios
                const usersSnapshot = yield firebase_1.db.collection('users').get();
                const totalUsers = usersSnapshot.size;
                // Contar usuarios por rol
                const roleStats = {
                    admin: 0,
                    superadmin: 0,
                    eventCreator: 0,
                    musician: 0
                };
                usersSnapshot.forEach(doc => {
                    const userData = doc.data();
                    const role = userData.roll || 'musician';
                    if (roleStats.hasOwnProperty(role)) {
                        roleStats[role]++;
                    }
                });
                // Obtener estadísticas de eventos
                const eventsSnapshot = yield firebase_1.db.collection('events').get();
                const totalEvents = eventsSnapshot.size;
                // Contar eventos por estado
                const eventStats = {
                    active: 0,
                    completed: 0,
                    cancelled: 0,
                    pending: 0
                };
                eventsSnapshot.forEach(doc => {
                    const eventData = doc.data();
                    const status = eventData.status || 'pending';
                    if (eventStats.hasOwnProperty(status)) {
                        eventStats[status]++;
                    }
                });
                // Obtener estadísticas de solicitudes
                const requestsSnapshot = yield firebase_1.db.collection('musician_requests').get();
                const totalRequests = requestsSnapshot.size;
                // Contar solicitudes por estado
                const requestStats = {
                    pending: 0,
                    approved: 0,
                    rejected: 0,
                    completed: 0
                };
                requestsSnapshot.forEach(doc => {
                    const requestData = doc.data();
                    const status = requestData.status || 'pending';
                    if (requestStats.hasOwnProperty(status)) {
                        requestStats[status]++;
                    }
                });
                // Obtener estadísticas de imágenes
                const imagesSnapshot = yield firebase_1.db.collection('images').get();
                const totalImages = imagesSnapshot.size;
                // Calcular tamaño total de imágenes
                let totalImageSize = 0;
                imagesSnapshot.forEach(doc => {
                    const imageData = doc.data();
                    totalImageSize += imageData.size || 0;
                });
                // Obtener estadísticas de chat
                const chatSnapshot = yield firebase_1.db.collection('chat_conversations').get();
                const totalConversations = chatSnapshot.size;
                // Calcular mensajes totales
                let totalMessages = 0;
                for (const doc of chatSnapshot.docs) {
                    const messagesSnapshot = yield doc.ref.collection('messages').get();
                    totalMessages += messagesSnapshot.size;
                }
                // Calcular porcentajes de cambio (simulado para demo)
                const changePercentages = {
                    users: Math.floor(Math.random() * 20) + 5, // 5-25%
                    events: Math.floor(Math.random() * 15) + 3, // 3-18%
                    requests: Math.floor(Math.random() * 30) - 10, // -10 a 20%
                    images: Math.floor(Math.random() * 25) + 10 // 10-35%
                };
                const stats = {
                    users: {
                        total: totalUsers,
                        byRole: roleStats,
                        change: changePercentages.users
                    },
                    events: {
                        total: totalEvents,
                        byStatus: eventStats,
                        change: changePercentages.events
                    },
                    requests: {
                        total: totalRequests,
                        byStatus: requestStats,
                        change: changePercentages.requests
                    },
                    images: {
                        total: totalImages,
                        totalSize: totalImageSize,
                        change: changePercentages.images
                    },
                    chat: {
                        conversations: totalConversations,
                        messages: totalMessages
                    },
                    system: {
                        timestamp: new Date().toISOString(),
                        uptime: process.uptime(),
                        memory: process.memoryUsage()
                    }
                };
                res.status(200).json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                loggerService_1.logger.error('[src/controllers/analyticsController.ts] Error obteniendo estadísticas del sistema', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo estadísticas del sistema'
                });
            }
        });
    }
    /**
     * Obtener estadísticas de rendimiento
     */
    getPerformanceStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const performanceStats = {
                    timestamp: new Date().toISOString(),
                    memory: process.memoryUsage(),
                    cpu: process.cpuUsage(),
                    uptime: process.uptime(),
                    platform: process.platform,
                    nodeVersion: process.version,
                    pid: process.pid
                };
                res.status(200).json({
                    success: true,
                    data: performanceStats
                });
            }
            catch (error) {
                loggerService_1.logger.error('[src/controllers/analyticsController.ts] Error obteniendo estadísticas de rendimiento', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo estadísticas de rendimiento'
                });
            }
        });
    }
    /**
     * Obtener estadísticas de actividad reciente
     */
    getRecentActivity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { limit = 10 } = req.query;
                const limitNum = Math.min(Number(limit), 50); // Máximo 50 registros
                // Obtener eventos recientes
                const recentEvents = yield firebase_1.db.collection('events')
                    .orderBy('create_at', 'desc')
                    .limit(limitNum)
                    .get();
                // Obtener usuarios recientes
                const recentUsers = yield firebase_1.db.collection('users')
                    .orderBy('create_at', 'desc')
                    .limit(limitNum)
                    .get();
                // Obtener solicitudes recientes
                const recentRequests = yield firebase_1.db.collection('musician_requests')
                    .orderBy('create_at', 'desc')
                    .limit(limitNum)
                    .get();
                const activity = {
                    events: recentEvents.docs.map(doc => (Object.assign(Object.assign({ id: doc.id }, doc.data()), { type: 'event' }))),
                    users: recentUsers.docs.map(doc => (Object.assign(Object.assign({ id: doc.id }, doc.data()), { type: 'user' }))),
                    requests: recentRequests.docs.map(doc => (Object.assign(Object.assign({ id: doc.id }, doc.data()), { type: 'request' })))
                };
                res.status(200).json({
                    success: true,
                    data: activity
                });
            }
            catch (error) {
                loggerService_1.logger.error('[src/controllers/analyticsController.ts] Error obteniendo actividad reciente', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo actividad reciente'
                });
            }
        });
    }
}
exports.AnalyticsController = AnalyticsController;
// Instancia singleton
exports.analyticsController = new AnalyticsController();
