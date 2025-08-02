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
// Mock del servicio
jest.mock('../services/musicianSearchService', () => ({
    MusicianSearchService: {
        searchMusiciansForEvent: jest.fn(),
        getRecommendedMusicians: jest.fn(),
        advancedSearch: jest.fn(),
        getSearchStats: jest.fn()
    }
}));
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
            yield musicianSearchController_1.MusicianSearchController.searchMusiciansForEvent(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Búsqueda de músicos completada exitosamente'
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
            yield musicianSearchController_1.MusicianSearchController.getRecommendedMusicians(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Músicos recomendados obtenidos exitosamente'
            }));
        }));
    });
    describe('advancedSearch', () => {
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
                    criteria: {
                        instruments: ['guitarra', 'piano'],
                        location: 'Madrid',
                        budget: { min: 300, max: 800 },
                        date: '2024-12-25',
                        time: '20:00',
                        duration: 120,
                        eventType: 'wedding',
                        maxDistance: 50,
                        rating: 4.0,
                        availability: 'immediate'
                    }
                }
            };
        });
        it('should perform advanced search successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            yield musicianSearchController_1.MusicianSearchController.advancedSearch(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Búsqueda avanzada completada exitosamente'
            }));
        }));
    });
    describe('getSearchStats', () => {
        beforeEach(() => {
            mockRequest = {
                user: {
                    userId: 'user123',
                    email: 'user@example.com',
                    role: 'eventCreator',
                    name: 'Test User',
                    userEmail: 'user@example.com',
                    roll: 'eventCreator'
                }
            };
        });
        it('should get search stats successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            yield musicianSearchController_1.MusicianSearchController.getSearchStats(mockRequest, mockResponse);
            expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Estadísticas de búsqueda obtenidas exitosamente'
            }));
        }));
    });
});
