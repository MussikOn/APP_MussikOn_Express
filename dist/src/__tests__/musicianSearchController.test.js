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
const musicianSearchController_1 = require("../controllers/musicianSearchController");
// Mock de las dependencias
jest.mock('../models/eventModel', () => ({
    getEventByIdModel: jest.fn()
}));
jest.mock('../services/musicianSearchService', () => ({
    MusicianSearchService: {
        searchMusiciansForEvent: jest.fn(),
        getRecommendedMusicians: jest.fn()
    }
}));
// Importar los mocks
const eventModel_1 = require("../models/eventModel");
const musicianSearchService_1 = require("../services/musicianSearchService");
describe('MusicianSearchController', () => {
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
    describe('searchMusiciansForEvent', () => {
        beforeEach(() => {
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'user@example.com',
                    role: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com',
                    roll: 'eventCreator'
                },
                body: {
                    eventId: 'event123',
                    criteria: {
                        instrument: 'guitarra',
                        location: 'Madrid',
                        budget: 500,
                        date: '2024-12-25',
                        time: '20:00',
                        duration: 120,
                        eventType: 'wedding',
                        maxDistance: 50
                    }
                }
            };
        });
        it('should search musicians for event successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock del evento
            const mockEvent = {
                id: 'event123',
                user: 'user@example.com',
                eventName: 'Boda de María',
                instrument: 'guitarra',
                location: 'Madrid',
                budget: '500',
                date: '2024-12-25',
                time: '20:00',
                duration: '120',
                eventType: 'wedding'
            };
            // Mock de músicos encontrados
            const mockMusicians = [
                {
                    id: 'musician1',
                    name: 'Juan Pérez',
                    instrument: 'guitarra',
                    rating: 4.5,
                    rate: 150
                }
            ];
            // Configurar mocks
            eventModel_1.getEventByIdModel.mockResolvedValue(mockEvent);
            musicianSearchService_1.MusicianSearchService.searchMusiciansForEvent.mockResolvedValue(mockMusicians);
            yield musicianSearchController_1.MusicianSearchController.searchMusiciansForEvent(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Búsqueda de músicos completada exitosamente',
                data: expect.objectContaining({
                    eventId: 'event123',
                    totalMusicians: 1,
                    musicians: mockMusicians
                })
            }));
        }));
        it('should return error when user is not event creator', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = {
                userId: 'user123',
                email: 'user@example.com',
                role: 'musico',
                name: 'Test User',
                userEmail: 'user@example.com',
                roll: 'musico'
            };
            yield musicianSearchController_1.MusicianSearchController.searchMusiciansForEvent(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Solo los creadores de eventos pueden buscar músicos'
            });
        }));
    });
    describe('getRecommendedMusicians', () => {
        beforeEach(() => {
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'user@example.com',
                    role: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com',
                    roll: 'eventCreator'
                },
                params: {
                    eventId: 'event123'
                }
            };
        });
        it('should get recommended musicians successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock de músicos recomendados
            const mockMusicians = [
                {
                    id: 'musician1',
                    name: 'Juan Pérez',
                    instrument: 'guitarra',
                    rating: 4.5,
                    rate: 150
                }
            ];
            // Configurar mocks
            musicianSearchService_1.MusicianSearchService.getRecommendedMusicians.mockResolvedValue(mockMusicians);
            yield musicianSearchController_1.MusicianSearchController.getRecommendedMusicians(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Recomendaciones obtenidas exitosamente',
                data: expect.objectContaining({
                    eventId: 'event123',
                    recommendations: mockMusicians,
                    totalRecommendations: 1
                })
            }));
        }));
    });
});
