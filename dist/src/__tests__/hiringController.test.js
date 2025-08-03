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
const hiringController_1 = require("../controllers/hiringController");
const hiringService_1 = require("../services/hiringService");
const setup_1 = require("./setup");
// Mock del servicio
jest.mock('../services/hiringService');
describe('HiringController', () => {
    let hiringController;
    let mockRequest;
    let mockResponse;
    let mockJson;
    let mockStatus;
    let mockHiringService;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        mockResponse = {
            status: mockStatus,
            json: mockJson
        };
        // Mock del servicio
        mockHiringService = {
            createHiringRequest: jest.fn(),
            getHiringRequestById: jest.fn(),
            updateHiringRequestStatus: jest.fn(),
            getHiringRequestsByUser: jest.fn(),
            addMessage: jest.fn(),
            markMessagesAsRead: jest.fn(),
            getHiringStats: jest.fn()
        };
        hiringService_1.HiringService.mockImplementation(() => mockHiringService);
        hiringController = new hiringController_1.HiringController();
        // Reset de todos los mocks
        jest.clearAllMocks();
    });
    describe('createHiringRequest', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                user: {
                    id: 'user123',
                    email: 'user@example.com',
                    roll: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com'
                },
                body: {
                    eventId: 'event123',
                    musicianId: 'musician123',
                    eventDetails: 'Evento de música en vivo',
                    terms: 'Pago por adelantado'
                }
            });
        });
        it('should create hiring request successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockHiringRequest = {
                id: 'hiring123',
                eventId: 'event123',
                musicianId: 'musician123',
                eventCreatorId: 'user123',
                status: 'pending',
                eventDetails: 'Evento de música en vivo',
                terms: 'Pago por adelantado',
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockHiringService.createHiringRequest.mockResolvedValue(mockHiringRequest);
            yield hiringController.createHiringRequest(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Solicitud de contratación creada exitosamente',
                data: mockHiringRequest
            });
            expect(mockHiringService.createHiringRequest).toHaveBeenCalledWith({
                eventId: 'event123',
                musicianId: 'musician123',
                eventCreatorId: 'user123',
                eventDetails: 'Evento de música en vivo',
                terms: 'Pago por adelantado'
            });
        }));
        it('should return error when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    eventId: 'event123',
                    musicianId: 'musician123',
                    eventDetails: 'Evento de música en vivo',
                    terms: 'Pago por adelantado'
                }
            });
            yield hiringController.createHiringRequest(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Usuario no autenticado'
            });
        }));
        it('should return error when service fails', () => __awaiter(void 0, void 0, void 0, function* () {
            mockHiringService.createHiringRequest.mockRejectedValue(new Error('Service error'));
            yield hiringController.createHiringRequest(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Service error'
            });
        }));
    });
    describe('getHiringRequestById', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                user: {
                    id: 'user123',
                    email: 'user@example.com',
                    roll: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com'
                },
                params: {
                    requestId: 'hiring123'
                }
            });
        });
        it('should return hiring request by ID successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockHiringRequest = {
                id: 'hiring123',
                eventId: 'event123',
                musicianId: 'musician123',
                eventCreatorId: 'user123',
                status: 'pending',
                eventDetails: 'Evento de música en vivo',
                terms: 'Pago por adelantado',
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockHiringService.getHiringRequestById.mockResolvedValue(mockHiringRequest);
            yield hiringController.getHiringRequestById(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockHiringRequest
            });
            expect(mockHiringService.getHiringRequestById).toHaveBeenCalledWith('hiring123');
        }));
        it('should return 404 when hiring request not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockHiringService.getHiringRequestById.mockResolvedValue(null);
            yield hiringController.getHiringRequestById(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Solicitud de contratación no encontrada'
            });
        }));
        it('should return error when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest = (0, setup_1.createMockRequest)({
                params: {
                    requestId: 'hiring123'
                }
            });
            yield hiringController.getHiringRequestById(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Usuario no autenticado'
            });
        }));
    });
    describe('updateHiringRequestStatus', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                user: {
                    id: 'user123',
                    email: 'user@example.com',
                    roll: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com'
                },
                params: {
                    requestId: 'hiring123'
                },
                body: {
                    status: 'accepted'
                }
            });
        });
        it('should update hiring request status successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUpdatedRequest = {
                id: 'hiring123',
                eventId: 'event123',
                musicianId: 'musician123',
                eventCreatorId: 'user123',
                status: 'accepted',
                eventDetails: 'Evento de música en vivo',
                terms: 'Pago por adelantado',
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockHiringService.updateHiringRequestStatus.mockResolvedValue(mockUpdatedRequest);
            yield hiringController.updateHiringRequestStatus(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Estado de solicitud actualizado exitosamente',
                data: mockUpdatedRequest
            });
            expect(mockHiringService.updateHiringRequestStatus).toHaveBeenCalledWith('hiring123', 'accepted', 'user123');
        }));
        it('should return error when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest = (0, setup_1.createMockRequest)({
                params: {
                    requestId: 'hiring123'
                },
                body: {
                    status: 'accepted'
                }
            });
            yield hiringController.updateHiringRequestStatus(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Usuario no autenticado'
            });
        }));
    });
    describe('getHiringRequestsByUser', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                user: {
                    id: 'user123',
                    email: 'user@example.com',
                    roll: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com'
                },
                query: {
                    status: 'pending'
                }
            });
        });
        it('should return hiring requests by user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockRequests = [
                {
                    id: 'hiring123',
                    eventId: 'event123',
                    musicianId: 'musician123',
                    eventCreatorId: 'user123',
                    status: 'pending',
                    eventDetails: 'Evento de música en vivo',
                    terms: 'Pago por adelantado',
                    messages: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];
            mockHiringService.getHiringRequestsByUser.mockResolvedValue(mockRequests);
            yield hiringController.getHiringRequestsByUser(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockRequests,
                count: mockRequests.length
            });
            expect(mockHiringService.getHiringRequestsByUser).toHaveBeenCalledWith('user123', 'eventCreator', 'pending');
        }));
        it('should return error when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest = (0, setup_1.createMockRequest)({
                query: {
                    status: 'pending'
                }
            });
            yield hiringController.getHiringRequestsByUser(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Usuario no autenticado'
            });
        }));
        it('should return error when user role is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest = (0, setup_1.createMockRequest)({
                user: {
                    id: 'user123',
                    email: 'user@example.com',
                    roll: 'admin', // Rol inválido
                    name: 'Test User',
                    userEmail: 'user@example.com'
                },
                query: {
                    status: 'pending'
                }
            });
            yield hiringController.getHiringRequestsByUser(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Rol de usuario inválido'
            });
        }));
        it('should return error when service fails', () => __awaiter(void 0, void 0, void 0, function* () {
            mockHiringService.getHiringRequestsByUser.mockRejectedValue(new Error('Service error'));
            yield hiringController.getHiringRequestsByUser(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Error al obtener solicitudes de contratación'
            });
        }));
    });
    describe('addMessage', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                user: {
                    id: 'user123',
                    email: 'user@example.com',
                    roll: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com'
                },
                params: {
                    requestId: 'hiring123'
                },
                body: {
                    content: 'Mensaje de prueba'
                }
            });
        });
        it('should add message successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockMessage = {
                id: 'msg123',
                content: 'Mensaje de prueba',
                senderId: 'user123',
                senderType: 'eventCreator',
                timestamp: new Date(),
                isRead: false
            };
            mockHiringService.addMessage.mockResolvedValue(mockMessage);
            yield hiringController.addMessage(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Mensaje enviado exitosamente',
                data: mockMessage
            });
            expect(mockHiringService.addMessage).toHaveBeenCalledWith('hiring123', 'user123', 'eventCreator', 'Mensaje de prueba');
        }));
        it('should return error when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest = (0, setup_1.createMockRequest)({
                params: {
                    requestId: 'hiring123'
                },
                body: {
                    content: 'Mensaje de prueba'
                }
            });
            yield hiringController.addMessage(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Usuario no autenticado'
            });
        }));
    });
    describe('markMessagesAsRead', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                user: {
                    id: 'user123',
                    email: 'user@example.com',
                    roll: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com'
                },
                params: {
                    requestId: 'hiring123'
                }
            });
        });
        it('should mark messages as read successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockHiringService.markMessagesAsRead.mockResolvedValue();
            yield hiringController.markMessagesAsRead(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Mensajes marcados como leídos exitosamente'
            });
            expect(mockHiringService.markMessagesAsRead).toHaveBeenCalledWith('hiring123', 'user123');
        }));
        it('should return error when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest = (0, setup_1.createMockRequest)({
                params: {
                    requestId: 'hiring123'
                }
            });
            yield hiringController.markMessagesAsRead(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Usuario no autenticado'
            });
        }));
    });
    describe('getHiringStats', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                user: {
                    id: 'user123',
                    email: 'user@example.com',
                    roll: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com'
                }
            });
        });
        it('should return hiring stats successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockStats = {
                totalRequests: 10,
                pendingRequests: 3,
                acceptedRequests: 5,
                rejectedRequests: 2,
                completedRequests: 0,
                averageResponseTime: 2.5
            };
            mockHiringService.getHiringStats.mockResolvedValue(mockStats);
            yield hiringController.getHiringStats(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockStats
            });
            expect(mockHiringService.getHiringStats).toHaveBeenCalledWith('user123', 'eventCreator');
        }));
        it('should return error when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest = (0, setup_1.createMockRequest)({});
            yield hiringController.getHiringStats(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Usuario no autenticado'
            });
        }));
    });
});
