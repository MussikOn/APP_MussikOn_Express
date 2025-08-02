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
exports.HiringController = void 0;
const hiringService_1 = require("../services/hiringService");
const loggerService_1 = require("../services/loggerService");
class HiringController {
    constructor() {
        /**
         * Crear una nueva solicitud de contratación
         */
        this.createHiringRequest = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                loggerService_1.logger.info('HiringController: Creando solicitud de contratación', {
                    userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                    metadata: {
                        context: 'hiring'
                    }
                });
                const { eventId, musicianId, eventDetails, terms } = req.body;
                const eventCreatorId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!eventCreatorId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                const hiringData = {
                    eventId,
                    eventCreatorId,
                    musicianId,
                    eventDetails,
                    terms
                };
                const hiringRequest = yield this.hiringService.createHiringRequest(hiringData);
                loggerService_1.logger.info('HiringController: Solicitud de contratación creada exitosamente', {
                    userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
                    metadata: {
                        requestId: hiringRequest.id,
                        eventId,
                        musicianId
                    }
                });
                res.status(201).json({
                    success: true,
                    message: 'Solicitud de contratación creada exitosamente',
                    data: hiringRequest
                });
            }
            catch (error) {
                loggerService_1.logger.error('HiringController: Error al crear solicitud de contratación', error instanceof Error ? error : new Error('Error desconocido'), {
                    userId: (_d = req.user) === null || _d === void 0 ? void 0 : _d.id,
                    metadata: {
                        context: 'hiring'
                    }
                });
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Error al crear solicitud de contratación'
                });
            }
        });
        /**
         * Obtener una solicitud de contratación por ID
         */
        this.getHiringRequestById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { requestId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                loggerService_1.logger.info('HiringController: Obteniendo solicitud de contratación', {
                    userId,
                    metadata: {
                        requestId
                    }
                });
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                const hiringRequest = yield this.hiringService.getHiringRequestById(requestId);
                if (!hiringRequest) {
                    res.status(404).json({
                        success: false,
                        message: 'Solicitud de contratación no encontrada'
                    });
                    return;
                }
                // Verificar que el usuario tiene acceso a esta solicitud
                if (hiringRequest.musicianId !== userId && hiringRequest.eventCreatorId !== userId) {
                    res.status(403).json({
                        success: false,
                        message: 'No tienes permisos para ver esta solicitud'
                    });
                    return;
                }
                loggerService_1.logger.info('HiringController: Solicitud de contratación obtenida exitosamente', {
                    userId,
                    metadata: {
                        requestId
                    }
                });
                res.status(200).json({
                    success: true,
                    data: hiringRequest
                });
            }
            catch (error) {
                loggerService_1.logger.error('HiringController: Error al obtener solicitud de contratación', error instanceof Error ? error : new Error('Error desconocido'), {
                    userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                    metadata: {
                        requestId: req.params.requestId
                    }
                });
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener solicitud de contratación'
                });
            }
        });
        /**
         * Actualizar el estado de una solicitud de contratación
         */
        this.updateHiringRequestStatus = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { requestId } = req.params;
                const { status } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                loggerService_1.logger.info('HiringController: Actualizando estado de solicitud', {
                    userId,
                    metadata: {
                        requestId,
                        status
                    }
                });
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                if (!status) {
                    res.status(400).json({
                        success: false,
                        message: 'El estado es requerido'
                    });
                    return;
                }
                const updatedRequest = yield this.hiringService.updateHiringRequestStatus(requestId, status, userId);
                loggerService_1.logger.info('HiringController: Estado de solicitud actualizado exitosamente', {
                    userId,
                    metadata: {
                        requestId,
                        newStatus: status
                    }
                });
                res.status(200).json({
                    success: true,
                    message: 'Estado de solicitud actualizado exitosamente',
                    data: updatedRequest
                });
            }
            catch (error) {
                loggerService_1.logger.error('HiringController: Error al actualizar estado de solicitud', error instanceof Error ? error : new Error('Error desconocido'), {
                    userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                    metadata: {
                        requestId: req.params.requestId,
                        status: req.body.status
                    }
                });
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Error al actualizar estado de solicitud'
                });
            }
        });
        /**
         * Obtener solicitudes de contratación del usuario
         */
        this.getHiringRequestsByUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.roll;
                const { status } = req.query;
                loggerService_1.logger.info('HiringController: Obteniendo solicitudes por usuario', {
                    userId,
                    metadata: {
                        userRole,
                        status
                    }
                });
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                if (userRole !== 'musico' && userRole !== 'eventCreator') {
                    res.status(400).json({
                        success: false,
                        message: 'Rol de usuario inválido'
                    });
                    return;
                }
                const requests = yield this.hiringService.getHiringRequestsByUser(userId, userRole, status);
                loggerService_1.logger.info('HiringController: Solicitudes obtenidas exitosamente', {
                    userId,
                    metadata: {
                        userRole,
                        count: requests.length
                    }
                });
                res.status(200).json({
                    success: true,
                    data: requests,
                    count: requests.length
                });
            }
            catch (error) {
                loggerService_1.logger.error('HiringController: Error al obtener solicitudes por usuario', error instanceof Error ? error : new Error('Error desconocido'), {
                    userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
                    metadata: {
                        context: 'hiring'
                    }
                });
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener solicitudes de contratación'
                });
            }
        });
        /**
         * Agregar mensaje a una solicitud de contratación
         */
        this.addMessage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const { requestId } = req.params;
                const { content } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.roll;
                loggerService_1.logger.info('HiringController: Agregando mensaje a solicitud', {
                    userId,
                    metadata: {
                        requestId,
                        userRole
                    }
                });
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                if (!content || content.trim().length === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'El contenido del mensaje es requerido'
                    });
                    return;
                }
                if (userRole !== 'musico' && userRole !== 'eventCreator') {
                    res.status(400).json({
                        success: false,
                        message: 'Rol de usuario inválido'
                    });
                    return;
                }
                const senderType = userRole === 'musico' ? 'musician' : 'eventCreator';
                const message = yield this.hiringService.addMessage(requestId, userId, senderType, content.trim());
                loggerService_1.logger.info('HiringController: Mensaje agregado exitosamente', {
                    userId,
                    metadata: {
                        requestId,
                        messageId: message.id
                    }
                });
                res.status(201).json({
                    success: true,
                    message: 'Mensaje enviado exitosamente',
                    data: message
                });
            }
            catch (error) {
                loggerService_1.logger.error('HiringController: Error al agregar mensaje', error instanceof Error ? error : new Error('Error desconocido'), {
                    userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
                    metadata: {
                        requestId: req.params.requestId
                    }
                });
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Error al enviar mensaje'
                });
            }
        });
        /**
         * Marcar mensajes como leídos
         */
        this.markMessagesAsRead = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { requestId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                loggerService_1.logger.info('HiringController: Marcando mensajes como leídos', {
                    userId,
                    metadata: {
                        requestId
                    }
                });
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                yield this.hiringService.markMessagesAsRead(requestId, userId);
                loggerService_1.logger.info('HiringController: Mensajes marcados como leídos exitosamente', {
                    userId,
                    metadata: {
                        requestId
                    }
                });
                res.status(200).json({
                    success: true,
                    message: 'Mensajes marcados como leídos exitosamente'
                });
            }
            catch (error) {
                loggerService_1.logger.error('HiringController: Error al marcar mensajes como leídos', error instanceof Error ? error : new Error('Error desconocido'), {
                    userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                    metadata: {
                        requestId: req.params.requestId
                    }
                });
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Error al marcar mensajes como leídos'
                });
            }
        });
        /**
         * Obtener estadísticas de contratación
         */
        this.getHiringStats = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.roll;
                loggerService_1.logger.info('HiringController: Obteniendo estadísticas de contratación', {
                    userId,
                    metadata: {
                        userRole
                    }
                });
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                if (userRole !== 'musico' && userRole !== 'eventCreator') {
                    res.status(400).json({
                        success: false,
                        message: 'Rol de usuario inválido'
                    });
                    return;
                }
                const stats = yield this.hiringService.getHiringStats(userId, userRole);
                loggerService_1.logger.info('HiringController: Estadísticas obtenidas exitosamente', {
                    userId,
                    metadata: {
                        userRole,
                        stats
                    }
                });
                res.status(200).json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                loggerService_1.logger.error('HiringController: Error al obtener estadísticas', error instanceof Error ? error : new Error('Error desconocido'), {
                    userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
                    metadata: {
                        context: 'hiring'
                    }
                });
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener estadísticas de contratación'
                });
            }
        });
        this.hiringService = new hiringService_1.HiringService();
    }
}
exports.HiringController = HiringController;
