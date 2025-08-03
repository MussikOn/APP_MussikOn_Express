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
const eventControllers_1 = require("../controllers/eventControllers");
const eventModel_1 = require("../models/eventModel");
const setup_1 = require("./setup");
// Mock de todas las dependencias
jest.mock('../models/eventModel');
describe('EventControllers', () => {
    let mockRequest;
    let mockResponse;
    let mockJson;
    let mockStatus;
    const mockEvent = {
        id: 'event123',
        eventName: 'Boda de María',
        location: 'Santo Domingo',
        status: 'pending',
        user: 'juan@example.com',
        assignedMusicianId: 'musician123'
    };
    const mockEvents = [
        {
            id: 'event1',
            eventName: 'Evento 1',
            status: 'pending'
        },
        {
            id: 'event2',
            eventName: 'Evento 2',
            status: 'cancelled'
        }
    ];
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        mockResponse = {
            status: mockStatus,
            json: mockJson
        };
        // Reset de todos los mocks
        jest.clearAllMocks();
    });
    describe('requestMusicianController', () => {
        beforeEach(() => {
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'juan@example.com',
                    role: 'eventCreator',
                    name: 'Juan Pérez',
                    userEmail: 'juan@example.com'
                },
                body: {
                    eventName: 'Boda de María',
                    location: 'Santo Domingo',
                    date: '2024-12-25',
                    time: '18:00',
                    duration: '2 horas',
                    instrument: 'guitarra',
                    budget: '5000'
                }
            };
        });
        it('should create event request successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                user: 'juan@example.com',
                status: 'pending_musician'
            };
            eventModel_1.createEventModel.mockResolvedValue(mockEvent);
            yield (0, eventControllers_1.requestMusicianController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({ data: mockEvent });
        }));
        it('should return error when event creation fails', () => __awaiter(void 0, void 0, void 0, function* () {
            eventModel_1.createEventModel.mockRejectedValue(new Error('Database error'));
            yield (0, eventControllers_1.requestMusicianController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ msg: 'Error al crear solicitud' });
        }));
    });
    describe('myPendingEventsController', () => {
        beforeEach(() => {
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'juan@example.com',
                    role: 'eventCreator',
                    name: 'Juan Pérez',
                    userEmail: 'juan@example.com'
                }
            };
        });
        it('should return pending events successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvents = [
                { id: 'event1', eventName: 'Evento 1', status: 'pending_musician' },
                { id: 'event2', eventName: 'Evento 2', status: 'pending_musician' }
            ];
            eventModel_1.getEventsByUserAndStatus.mockResolvedValue(mockEvents);
            yield (0, eventControllers_1.myPendingEventsController)(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
            expect(eventModel_1.getEventsByUserAndStatus).toHaveBeenCalledWith('juan@example.com', 'pending_musician');
        }));
    });
    describe('myAssignedEventsController', () => {
        beforeEach(() => {
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'juan@example.com',
                    role: 'eventCreator',
                    name: 'Juan Pérez',
                    userEmail: 'juan@example.com'
                }
            };
        });
        it('should return assigned events successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvents = [
                { id: 'event1', eventName: 'Evento 1', status: 'musician_assigned' },
                { id: 'event2', eventName: 'Evento 2', status: 'musician_assigned' }
            ];
            eventModel_1.getEventsByUserAndStatus.mockResolvedValue(mockEvents);
            yield (0, eventControllers_1.myAssignedEventsController)(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
            expect(eventModel_1.getEventsByUserAndStatus).toHaveBeenCalledWith('juan@example.com', 'musician_assigned');
        }));
    });
    describe('myCompletedEventsController', () => {
        beforeEach(() => {
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'juan@example.com',
                    role: 'eventCreator',
                    name: 'Juan Pérez',
                    userEmail: 'juan@example.com'
                }
            };
        });
        it('should return completed events successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvents = [
                { id: 'event1', eventName: 'Evento 1', status: 'completed' },
                { id: 'event2', eventName: 'Evento 2', status: 'completed' }
            ];
            eventModel_1.getEventsByUserAndStatus.mockResolvedValue(mockEvents);
            yield (0, eventControllers_1.myCompletedEventsController)(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
            expect(eventModel_1.getEventsByUserAndStatus).toHaveBeenCalledWith('juan@example.com', 'completed');
        }));
    });
    describe('availableRequestsController', () => {
        it('should return available events successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvents = [
                { id: 'event1', eventName: 'Evento 1', status: 'pending_musician' },
                { id: 'event2', eventName: 'Evento 2', status: 'pending_musician' }
            ];
            eventModel_1.getAvailableEvents.mockResolvedValue(mockEvents);
            yield (0, eventControllers_1.availableRequestsController)(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
        }));
    });
    describe('acceptEventController', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                params: {
                    eventId: 'event123'
                },
                user: {
                    id: 'user123',
                    userEmail: 'juan@example.com',
                    roll: 'musico'
                }
            });
        });
        it('should accept event successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                status: 'musician_assigned'
            };
            eventModel_1.acceptEventModel.mockResolvedValue(mockEvent);
            yield (0, eventControllers_1.acceptEventController)(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith(mockEvent);
        }));
        it('should return error when user is not a musician', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest = (0, setup_1.createMockRequest)({
                params: {
                    eventId: 'event123'
                },
                user: {
                    id: 'user123',
                    userEmail: 'juan@example.com',
                    roll: 'eventCreator'
                }
            });
            yield (0, eventControllers_1.acceptEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({ msg: 'Solo los músicos pueden aceptar eventos.' });
        }));
        it('should return error when event acceptance fails', () => __awaiter(void 0, void 0, void 0, function* () {
            eventModel_1.acceptEventModel.mockResolvedValue(null);
            yield (0, eventControllers_1.acceptEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ msg: 'No se pudo aceptar el evento.' });
        }));
    });
    describe('myScheduledEventsController', () => {
        beforeEach(() => {
            mockRequest = {
                user: {
                    userId: 'musico123',
                    email: 'musico@example.com',
                    role: 'musico',
                    name: 'Músico Test',
                    userEmail: 'musico@example.com'
                }
            };
        });
        it('should return scheduled events successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvents = [
                { id: 'event1', eventName: 'Evento 1', status: 'musician_assigned' },
                { id: 'event2', eventName: 'Evento 2', status: 'musician_assigned' }
            ];
            eventModel_1.getEventsByMusicianAndStatus.mockResolvedValue(mockEvents);
            yield (0, eventControllers_1.myScheduledEventsController)(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
            expect(eventModel_1.getEventsByMusicianAndStatus).toHaveBeenCalledWith('musico@example.com', 'musician_assigned');
        }));
    });
    describe('myPastPerformancesController', () => {
        beforeEach(() => {
            mockRequest = {
                user: {
                    userId: 'musico123',
                    email: 'musico@example.com',
                    role: 'musico',
                    name: 'Músico Test',
                    userEmail: 'musico@example.com'
                }
            };
        });
        it('should return past performances successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvents = [
                { id: 'event1', eventName: 'Evento 1', status: 'completed' },
                { id: 'event2', eventName: 'Evento 2', status: 'completed' }
            ];
            eventModel_1.getEventsByMusicianAndStatus.mockResolvedValue(mockEvents);
            yield (0, eventControllers_1.myPastPerformancesController)(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
            expect(eventModel_1.getEventsByMusicianAndStatus).toHaveBeenCalledWith('musico@example.com', 'completed');
        }));
    });
    describe('myEventsController', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                user: {
                    id: 'user123',
                    userEmail: 'juan@example.com',
                    roll: 'eventCreator'
                }
            });
        });
        it('should return all user events successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvents = [
                { id: 'event1', eventName: 'Evento 1' },
                { id: 'event2', eventName: 'Evento 2' }
            ];
            eventModel_1.getEventsByUser.mockResolvedValue(mockEvents);
            yield (0, eventControllers_1.myEventsController)(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
            expect(eventModel_1.getEventsByUser).toHaveBeenCalledWith('juan@example.com');
        }));
    });
    describe('myCancelledEventsController', () => {
        let isolatedMockRequest;
        let isolatedMockResponse;
        let isolatedMockJson;
        let isolatedMockStatus;
        beforeEach(() => {
            // Crear mocks completamente aislados para este test
            isolatedMockJson = jest.fn();
            isolatedMockStatus = jest.fn().mockReturnValue({ json: isolatedMockJson });
            isolatedMockResponse = {
                status: isolatedMockStatus,
                json: isolatedMockJson
            };
            isolatedMockRequest = (0, setup_1.createMockRequest)({
                user: {
                    id: 'user123',
                    userEmail: 'juan@example.com',
                    roll: 'eventCreator'
                }
            });
            // Limpiar completamente todos los mocks
            jest.clearAllMocks();
        });
        it('should return cancelled events successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const cancelledEvents = [
                { id: 'event1', eventName: 'Evento 1', status: 'cancelled' },
                { id: 'event2', eventName: 'Evento 2', status: 'cancelled' }
            ];
            const musicianCancelledEvents = [
                { id: 'event3', eventName: 'Evento 3', status: 'musician_cancelled' },
                { id: 'event4', eventName: 'Evento 4', status: 'musician_cancelled' }
            ];
            const expectedEvents = [...cancelledEvents, ...musicianCancelledEvents];
            // Mock específico para este test que devuelve diferentes resultados para cada llamada
            eventModel_1.getEventsByUserAndStatus
                .mockResolvedValueOnce(cancelledEvents) // Primera llamada: 'cancelled'
                .mockResolvedValueOnce(musicianCancelledEvents); // Segunda llamada: 'musician_cancelled'
            yield (0, eventControllers_1.myCancelledEventsController)(isolatedMockRequest, isolatedMockResponse);
            expect(isolatedMockJson).toHaveBeenCalledWith({ data: expectedEvents });
            expect(eventModel_1.getEventsByUserAndStatus).toHaveBeenCalledWith('juan@example.com', 'cancelled');
            expect(eventModel_1.getEventsByUserAndStatus).toHaveBeenCalledWith('juan@example.com', 'musician_cancelled');
        }));
    });
    describe('getEventByIdController', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                params: {
                    eventId: 'event123'
                }
            });
        });
        it('should return event by ID successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                location: 'Santo Domingo'
            };
            eventModel_1.getEventByIdModel.mockResolvedValue(mockEvent);
            yield (0, eventControllers_1.getEventByIdController)(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockEvent
            });
            expect(eventModel_1.getEventByIdModel).toHaveBeenCalledWith('event123');
        }));
        it('should return error when event not found', () => __awaiter(void 0, void 0, void 0, function* () {
            eventModel_1.getEventByIdModel.mockResolvedValue(null);
            yield (0, eventControllers_1.getEventByIdController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Evento no encontrado'
            });
        }));
    });
    describe('cancelEventController', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                params: {
                    eventId: 'event123'
                },
                user: {
                    id: 'user123',
                    userEmail: 'juan@example.com',
                    roll: 'eventCreator'
                }
            });
        });
        it('should cancel event successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                status: 'cancelled',
                user: 'juan@example.com' // El usuario debe ser el propietario
            };
            eventModel_1.getEventByIdModel.mockResolvedValue(mockEvent);
            eventModel_1.cancelEventModel.mockResolvedValue(mockEvent);
            yield (0, eventControllers_1.cancelEventController)(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Solicitud cancelada exitosamente',
                data: mockEvent
            });
        }));
        it('should return error when user is not authorized', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                status: 'pending',
                user: 'otro@example.com' // Usuario diferente al propietario
            };
            eventModel_1.getEventByIdModel.mockResolvedValue(mockEvent);
            yield (0, eventControllers_1.cancelEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'No tienes permisos para cancelar esta solicitud'
            });
        }));
        it('should return error when event cancellation fails', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                status: 'pending',
                user: 'juan@example.com'
            };
            eventModel_1.getEventByIdModel.mockResolvedValue(mockEvent);
            eventModel_1.cancelEventModel.mockResolvedValue(null);
            yield (0, eventControllers_1.cancelEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Error al cancelar la solicitud'
            });
        }));
    });
    describe('completeEventController', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                params: {
                    eventId: 'event123'
                },
                user: {
                    id: 'user123',
                    userEmail: 'juan@example.com',
                    roll: 'eventCreator'
                }
            });
        });
        it('should complete event successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                status: 'completed',
                user: 'juan@example.com'
            };
            eventModel_1.getEventByIdModel.mockResolvedValue(mockEvent);
            eventModel_1.completeEventModel.mockResolvedValue(mockEvent);
            yield (0, eventControllers_1.completeEventController)(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Solicitud completada exitosamente',
                data: mockEvent
            });
        }));
        it('should return error when user is not authorized', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                status: 'pending',
                user: 'otro@example.com'
            };
            eventModel_1.getEventByIdModel.mockResolvedValue(mockEvent);
            yield (0, eventControllers_1.completeEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'No tienes permisos para completar esta solicitud'
            });
        }));
        it('should return error when event completion fails', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                status: 'pending',
                user: 'juan@example.com'
            };
            eventModel_1.getEventByIdModel.mockResolvedValue(mockEvent);
            eventModel_1.completeEventModel.mockResolvedValue(null);
            yield (0, eventControllers_1.completeEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Error al completar la solicitud'
            });
        }));
    });
    describe('deleteEventController', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                params: {
                    eventId: 'event123'
                },
                user: {
                    id: 'user123',
                    userEmail: 'juan@example.com',
                    roll: 'eventCreator'
                }
            });
        });
        it('should delete event successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                status: 'completed',
                user: 'juan@example.com'
            };
            eventModel_1.getEventByIdModel.mockResolvedValue(mockEvent);
            eventModel_1.deleteEventModel.mockResolvedValue(true);
            yield (0, eventControllers_1.deleteEventController)(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Solicitud eliminada exitosamente'
            });
        }));
        it('should return error when user is not authorized', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                status: 'completed',
                user: 'otro@example.com'
            };
            eventModel_1.getEventByIdModel.mockResolvedValue(mockEvent);
            yield (0, eventControllers_1.deleteEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'No tienes permisos para eliminar esta solicitud'
            });
        }));
        it('should return error when event deletion fails', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                status: 'completed',
                user: 'juan@example.com'
            };
            eventModel_1.getEventByIdModel.mockResolvedValue(mockEvent);
            eventModel_1.deleteEventModel.mockResolvedValue(false);
            yield (0, eventControllers_1.deleteEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Error al eliminar la solicitud'
            });
        }));
    });
});
