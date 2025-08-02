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
// Mock de todas las dependencias
jest.mock('../models/eventModel');
describe('EventControllers', () => {
    let mockRequest;
    let mockResponse;
    let mockJson;
    let mockStatus;
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
            mockRequest = {
                user: {
                    userId: 'musico123',
                    email: 'musico@example.com',
                    role: 'musico',
                    name: 'Músico Test',
                    userEmail: 'musico@example.com'
                },
                body: {
                    eventId: 'event123'
                }
            };
        });
        it('should accept event successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                status: 'musician_assigned'
            };
            eventModel_1.acceptEventModel.mockResolvedValue(mockEvent);
            yield (0, eventControllers_1.acceptEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({ data: mockEvent });
        }));
        it('should return error when user is not a musician', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = {
                userId: 'user123',
                email: 'user@example.com',
                role: 'eventCreator',
                name: 'User Test',
                userEmail: 'user@example.com'
            };
            yield (0, eventControllers_1.acceptEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({ msg: 'Solo los músicos pueden aceptar eventos' });
        }));
        it('should return error when event acceptance fails', () => __awaiter(void 0, void 0, void 0, function* () {
            eventModel_1.acceptEventModel.mockRejectedValue(new Error('Database error'));
            yield (0, eventControllers_1.acceptEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ msg: 'Error al aceptar evento' });
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
        it('should return cancelled events successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvents = [
                { id: 'event1', eventName: 'Evento 1', status: 'cancelled' },
                { id: 'event2', eventName: 'Evento 2', status: 'cancelled' }
            ];
            eventModel_1.getEventsByUserAndStatus.mockResolvedValue(mockEvents);
            yield (0, eventControllers_1.myCancelledEventsController)(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith({ data: mockEvents });
            expect(eventModel_1.getEventsByUserAndStatus).toHaveBeenCalledWith('juan@example.com', 'cancelled');
        }));
    });
    describe('getEventByIdController', () => {
        beforeEach(() => {
            mockRequest = {
                params: {
                    eventId: 'event123'
                }
            };
        });
        it('should return event by ID successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                location: 'Santo Domingo'
            };
            eventModel_1.getEventByIdModel.mockResolvedValue(mockEvent);
            yield (0, eventControllers_1.getEventByIdController)(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith({ data: mockEvent });
            expect(eventModel_1.getEventByIdModel).toHaveBeenCalledWith('event123');
        }));
        it('should return error when event not found', () => __awaiter(void 0, void 0, void 0, function* () {
            eventModel_1.getEventByIdModel.mockResolvedValue(null);
            yield (0, eventControllers_1.getEventByIdController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ msg: 'Evento no encontrado' });
        }));
    });
    describe('cancelEventController', () => {
        beforeEach(() => {
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'juan@example.com',
                    role: 'eventCreator',
                    name: 'Juan Pérez',
                    userEmail: 'juan@example.com'
                },
                params: {
                    eventId: 'event123'
                },
                body: {
                    reason: 'Cambio de fecha'
                }
            };
        });
        it('should cancel event successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                status: 'cancelled'
            };
            eventModel_1.cancelEventModel.mockResolvedValue(mockEvent);
            yield (0, eventControllers_1.cancelEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({ data: mockEvent });
        }));
        it('should return error when event cancellation fails', () => __awaiter(void 0, void 0, void 0, function* () {
            eventModel_1.cancelEventModel.mockRejectedValue(new Error('Database error'));
            yield (0, eventControllers_1.cancelEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ msg: 'Error al cancelar evento' });
        }));
    });
    describe('completeEventController', () => {
        beforeEach(() => {
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'juan@example.com',
                    role: 'eventCreator',
                    name: 'Juan Pérez',
                    userEmail: 'juan@example.com'
                },
                params: {
                    eventId: 'event123'
                },
                body: {
                    rating: 5,
                    comment: 'Excelente servicio'
                }
            };
        });
        it('should complete event successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEvent = {
                id: 'event123',
                eventName: 'Boda de María',
                status: 'completed'
            };
            eventModel_1.completeEventModel.mockResolvedValue(mockEvent);
            yield (0, eventControllers_1.completeEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({ data: mockEvent });
        }));
        it('should return error when event completion fails', () => __awaiter(void 0, void 0, void 0, function* () {
            eventModel_1.completeEventModel.mockRejectedValue(new Error('Database error'));
            yield (0, eventControllers_1.completeEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ msg: 'Error al completar evento' });
        }));
    });
    describe('deleteEventController', () => {
        beforeEach(() => {
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'juan@example.com',
                    role: 'eventCreator',
                    name: 'Juan Pérez',
                    userEmail: 'juan@example.com'
                },
                params: {
                    eventId: 'event123'
                }
            };
        });
        it('should delete event successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            eventModel_1.deleteEventModel.mockResolvedValue(true);
            yield (0, eventControllers_1.deleteEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({ msg: 'Evento eliminado exitosamente' });
        }));
        it('should return error when event deletion fails', () => __awaiter(void 0, void 0, void 0, function* () {
            eventModel_1.deleteEventModel.mockRejectedValue(new Error('Database error'));
            yield (0, eventControllers_1.deleteEventController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ msg: 'Error al eliminar evento' });
        }));
    });
});
