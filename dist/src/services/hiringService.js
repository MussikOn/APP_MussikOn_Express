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
exports.HiringService = void 0;
const firebase_1 = require("../utils/firebase");
const loggerService_1 = require("../services/loggerService");
class HiringService {
    constructor() {
        this.collection = 'hiring_requests';
    }
    /**
     * Crear una nueva solicitud de contratación
     */
    createHiringRequest(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('HiringService: Creando nueva solicitud de contratación', {
                    metadata: {
                        eventId: data.eventId,
                        musicianId: data.musicianId
                    }
                });
                // Verificar que el evento existe
                const eventDoc = yield firebase_1.db.collection('events').doc(data.eventId).get();
                if (!eventDoc.exists) {
                    throw new Error('Evento no encontrado');
                }
                // Verificar que el músico existe
                const musicianDoc = yield firebase_1.db.collection('users').doc(data.musicianId).get();
                if (!musicianDoc.exists) {
                    throw new Error('Músico no encontrado');
                }
                // Verificar que no existe una solicitud activa para este evento y músico
                const existingRequest = yield firebase_1.db.collection(this.collection)
                    .where('eventId', '==', data.eventId)
                    .where('musicianId', '==', data.musicianId)
                    .where('status', 'in', ['pending', 'accepted'])
                    .get();
                if (!existingRequest.empty) {
                    throw new Error('Ya existe una solicitud activa para este evento y músico');
                }
                const hiringRequest = {
                    eventId: data.eventId,
                    eventCreatorId: data.eventCreatorId,
                    musicianId: data.musicianId,
                    status: 'pending',
                    eventDetails: data.eventDetails || '',
                    terms: data.terms || '',
                    messages: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                const docRef = yield firebase_1.db.collection(this.collection).add(hiringRequest);
                const result = yield this.getHiringRequestById(docRef.id);
                if (!result) {
                    throw new Error('Error al crear la solicitud de contratación');
                }
                return result;
            }
            catch (error) {
                loggerService_1.logger.error('HiringService: Error al crear solicitud de contratación', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        eventId: data.eventId,
                        musicianId: data.musicianId
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener una solicitud de contratación por ID
     */
    getHiringRequestById(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('HiringService: Obteniendo solicitud de contratación', {
                    metadata: { requestId }
                });
                const doc = yield firebase_1.db.collection(this.collection).doc(requestId).get();
                if (!doc.exists) {
                    return null;
                }
                return Object.assign({ id: doc.id }, doc.data());
            }
            catch (error) {
                loggerService_1.logger.error('HiringService: Error al obtener solicitud de contratación', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        requestId
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Actualizar el estado de una solicitud de contratación
     */
    updateHiringRequestStatus(requestId, status, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('HiringService: Actualizando estado de solicitud', {
                    metadata: {
                        requestId,
                        status,
                        userId
                    }
                });
                const request = yield this.getHiringRequestById(requestId);
                if (!request) {
                    throw new Error('Solicitud de contratación no encontrada');
                }
                // Verificar permisos
                if (request.musicianId !== userId && request.eventCreatorId !== userId) {
                    throw new Error('No tienes permisos para actualizar esta solicitud');
                }
                // Verificar transiciones válidas
                const validTransitions = this.getValidStatusTransitions(request.status, userId === request.musicianId);
                if (!validTransitions.includes(status)) {
                    throw new Error(`Transición de estado inválida: ${request.status} -> ${status}`);
                }
                const updateData = {
                    status,
                    updatedAt: new Date()
                };
                yield firebase_1.db.collection(this.collection).doc(requestId).update(updateData);
                const updatedRequest = yield this.getHiringRequestById(requestId);
                if (!updatedRequest) {
                    throw new Error('Error al obtener la solicitud actualizada');
                }
                loggerService_1.logger.info('HiringService: Estado de solicitud actualizado exitosamente', {
                    metadata: {
                        requestId,
                        newStatus: status
                    }
                });
                return updatedRequest;
            }
            catch (error) {
                loggerService_1.logger.error('HiringService: Error al actualizar estado de solicitud', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        requestId,
                        status
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener solicitudes de contratación por usuario
     */
    getHiringRequestsByUser(userId, userRole, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('HiringService: Obteniendo solicitudes por usuario', {
                    metadata: {
                        userId,
                        userRole,
                        status
                    }
                });
                let query = firebase_1.db.collection(this.collection);
                if (userRole === 'musico') {
                    query = query.where('musicianId', '==', userId);
                }
                else {
                    query = query.where('eventCreatorId', '==', userId);
                }
                if (status) {
                    query = query.where('status', '==', status);
                }
                query = query.orderBy('createdAt', 'desc');
                const snapshot = yield query.get();
                return snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
            }
            catch (error) {
                loggerService_1.logger.error('HiringService: Error al obtener solicitudes por usuario', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        userId,
                        userRole
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Agregar mensaje a una solicitud de contratación
     */
    addMessage(requestId, senderId, senderType, content) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('HiringService: Agregando mensaje a solicitud', {
                    metadata: {
                        requestId,
                        senderId,
                        senderType
                    }
                });
                const request = yield this.getHiringRequestById(requestId);
                if (!request) {
                    throw new Error('Solicitud de contratación no encontrada');
                }
                // Verificar que el remitente tiene acceso a esta solicitud
                if (senderType === 'musician' && request.musicianId !== senderId) {
                    throw new Error('No tienes permisos para enviar mensajes en esta solicitud');
                }
                if (senderType === 'eventCreator' && request.eventCreatorId !== senderId) {
                    throw new Error('No tienes permisos para enviar mensajes en esta solicitud');
                }
                const message = {
                    id: Date.now().toString(),
                    senderId,
                    senderType,
                    content,
                    timestamp: new Date(),
                    isRead: false
                };
                const updatedMessages = [...request.messages, message];
                yield firebase_1.db.collection(this.collection).doc(requestId).update({
                    messages: updatedMessages,
                    updatedAt: new Date()
                });
                loggerService_1.logger.info('HiringService: Mensaje agregado exitosamente', {
                    metadata: {
                        requestId,
                        messageId: message.id
                    }
                });
                return message;
            }
            catch (error) {
                loggerService_1.logger.error('HiringService: Error al agregar mensaje', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        requestId,
                        senderId
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Marcar mensajes como leídos
     */
    markMessagesAsRead(requestId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('HiringService: Marcando mensajes como leídos', {
                    metadata: {
                        requestId,
                        userId
                    }
                });
                const request = yield this.getHiringRequestById(requestId);
                if (!request) {
                    throw new Error('Solicitud de contratación no encontrada');
                }
                // Verificar que el usuario tiene acceso a esta solicitud
                if (request.musicianId !== userId && request.eventCreatorId !== userId) {
                    throw new Error('No tienes permisos para acceder a esta solicitud');
                }
                const updatedMessages = request.messages.map(message => (Object.assign(Object.assign({}, message), { isRead: true })));
                yield firebase_1.db.collection(this.collection).doc(requestId).update({
                    messages: updatedMessages,
                    updatedAt: new Date()
                });
                loggerService_1.logger.info('HiringService: Mensajes marcados como leídos exitosamente', {
                    metadata: {
                        requestId,
                        userId
                    }
                });
            }
            catch (error) {
                loggerService_1.logger.error('HiringService: Error al marcar mensajes como leídos', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        requestId,
                        userId
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener estadísticas de contratación
     */
    getHiringStats(userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('HiringService: Obteniendo estadísticas de contratación', {
                    metadata: {
                        userId,
                        userRole
                    }
                });
                const requests = yield this.getHiringRequestsByUser(userId, userRole);
                const stats = {
                    totalRequests: requests.length,
                    pendingRequests: requests.filter(r => r.status === 'pending').length,
                    acceptedRequests: requests.filter(r => r.status === 'accepted').length,
                    rejectedRequests: requests.filter(r => r.status === 'rejected').length,
                    completedRequests: requests.filter(r => r.status === 'completed').length,
                    averageResponseTime: this.calculateAverageResponseTime(requests)
                };
                loggerService_1.logger.info('HiringService: Estadísticas calculadas exitosamente', {
                    metadata: {
                        userId,
                        userRole,
                        stats
                    }
                });
                return stats;
            }
            catch (error) {
                loggerService_1.logger.error('HiringService: Error al obtener estadísticas', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        userId,
                        userRole
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener transiciones de estado válidas
     */
    getValidStatusTransitions(currentStatus, isMusician) {
        const transitions = {
            pending: isMusician ? ['accepted', 'rejected'] : ['cancelled'],
            accepted: ['completed', 'cancelled'],
            rejected: [],
            cancelled: [],
            completed: []
        };
        return transitions[currentStatus] || [];
    }
    /**
     * Calcular tiempo promedio de respuesta
     */
    calculateAverageResponseTime(requests) {
        const responseTimes = requests
            .filter(r => r.status === 'accepted' || r.status === 'rejected')
            .map(r => {
            const firstMessage = r.messages.find(m => m.senderType === 'musician');
            if (firstMessage) {
                return firstMessage.timestamp.getTime() - r.createdAt.getTime();
            }
            return 0;
        })
            .filter(time => time > 0);
        if (responseTimes.length === 0) {
            return 0;
        }
        return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    }
}
exports.HiringService = HiringService;
