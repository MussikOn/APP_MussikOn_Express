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
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'user@example.com',
                    role: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com'
                },
                body: {
                    eventId: 'event123',
                    musicianId: 'musician123',
                    eventDetails: 'Evento de música en vivo',
                    terms: 'Pago por adelantado'
                }
            };
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
            mockRequest.user = undefined;
            yield hiringController.createHiringRequest(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Usuario no autenticado'
            });
        }));
        it('should return error when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {
                eventId: 'event123'
                // musicianId, eventDetails, terms faltantes
            };
            yield hiringController.createHiringRequest(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
        }));
    });
    describe('getHiringRequestById', () => {
        beforeEach(() => {
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'user@example.com',
                    role: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com'
                },
                params: {
                    requestId: 'hiring123'
                }
            };
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
            mockRequest.user = undefined;
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
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'user@example.com',
                    role: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com'
                },
                params: {
                    requestId: 'hiring123'
                },
                body: {
                    status: 'accepted'
                }
            };
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
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Estado de solicitud actualizado exitosamente',
                data: mockUpdatedRequest
            });
            expect(mockHiringService.updateHiringRequestStatus).toHaveBeenCalledWith('hiring123', 'accepted');
        }));
        it('should return error when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
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
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'user@example.com',
                    role: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com'
                }
            };
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
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockRequests
            });
            expect(mockHiringService.getHiringRequestsByUser).toHaveBeenCalledWith('user123');
        }));
        it('should return error when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
            yield hiringController.getHiringRequestsByUser(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Usuario no autenticado'
            });
        }));
    });
    describe('addMessage', () => {
        beforeEach(() => {
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'user@example.com',
                    role: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com'
                },
                params: {
                    requestId: 'hiring123'
                },
                body: {
                    content: 'Mensaje de prueba',
                    senderType: 'eventCreator'
                }
            };
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
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Mensaje agregado exitosamente',
                data: mockMessage
            });
            expect(mockHiringService.addMessage).toHaveBeenCalledWith('hiring123', {
                content: 'Mensaje de prueba',
                senderId: 'user123',
                senderType: 'eventCreator'
            });
        }));
        it('should return error when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
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
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'user@example.com',
                    role: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com'
                },
                params: {
                    requestId: 'hiring123'
                }
            };
        });
        it('should mark messages as read successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockHiringService.markMessagesAsRead.mockResolvedValue();
            yield hiringController.markMessagesAsRead(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Mensajes marcados como leídos'
            });
            expect(mockHiringService.markMessagesAsRead).toHaveBeenCalledWith('hiring123', 'user123');
        }));
        it('should return error when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
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
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'user@example.com',
                    role: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com'
                }
            };
        });
        it('should return hiring stats successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockStats = {
                total: 10,
                pending: 3,
                accepted: 5,
                rejected: 2,
                completed: 0,
                cancelled: 0
            };
            mockHiringService.getHiringStats.mockResolvedValue(mockStats);
            yield hiringController.getHiringStats(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockStats
            });
            expect(mockHiringService.getHiringStats).toHaveBeenCalledWith('user123');
        }));
        it('should return error when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
            yield hiringController.getHiringStats(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Usuario no autenticado'
            });
        }));
    });
});
