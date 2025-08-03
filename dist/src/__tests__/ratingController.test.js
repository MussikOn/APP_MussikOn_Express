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
const ratingController_1 = require("../controllers/ratingController");
const ratingService_1 = require("../services/ratingService");
// Mock the rating service
jest.mock('../services/ratingService');
jest.mock('../services/loggerService', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
    }
}));
describe('RatingController', () => {
    let ratingController;
    let mockRequest;
    let mockResponse;
    let mockStatus;
    let mockJson;
    let mockRatingService;
    beforeEach(() => {
        mockStatus = jest.fn().mockReturnThis();
        mockJson = jest.fn().mockReturnThis();
        mockResponse = {
            status: mockStatus,
            json: mockJson
        };
        ratingController = new ratingController_1.RatingController();
        mockRatingService = ratingService_1.ratingService;
        jest.clearAllMocks();
    });
    // Helper function para crear usuario mock válido
    const createValidUser = (overrides = {}) => (Object.assign({ id: 'user123', userId: 'user123', userEmail: 'user@example.com', email: 'user@example.com', role: 'user', name: 'Test User' }, overrides));
    // Helper function para crear rating data válido
    const createValidRatingData = (overrides = {}) => (Object.assign({ eventId: 'event123', musicianId: 'musician123', rating: 5, review: 'Excellent performance!', category: 'musician' }, overrides));
    describe('createRating', () => {
        it('should create rating successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const ratingData = createValidRatingData();
            const mockRating = {
                id: 'rating123',
                eventId: 'event123',
                musicianId: 'musician123',
                eventCreatorId: 'user123',
                rating: 5,
                review: 'Excellent performance!',
                category: 'musician',
                isVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                helpfulCount: 0,
                reportedCount: 0,
                isActive: true
            };
            mockRequest = {
                user: createValidUser(),
                body: ratingData
            };
            mockRatingService.createRating.mockResolvedValue(mockRating);
            // Act
            yield ratingController.createRating(mockRequest, mockResponse);
            // Assert
            expect(mockRatingService.createRating).toHaveBeenCalledWith({
                eventId: 'event123',
                musicianId: 'musician123',
                eventCreatorId: 'user123',
                rating: 5,
                review: 'Excellent performance!',
                category: 'musician',
                isVerified: false
            });
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Rating creado exitosamente',
                rating: mockRating
            });
        }));
        it('should return error when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const ratingData = createValidRatingData();
            mockRequest = {
                user: undefined,
                body: ratingData
            };
            // Act
            yield ratingController.createRating(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Usuario no autenticado'
            });
        }));
        it('should return error when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const ratingData = {
                eventId: 'event123',
                // Missing musicianId, rating, category
                review: 'Excellent performance!'
            };
            mockRequest = {
                user: createValidUser(),
                body: ratingData
            };
            // Act
            yield ratingController.createRating(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Faltan campos requeridos: eventId, musicianId, rating, category'
            });
        }));
        // 🆕 TESTS MEJORADOS: Casos edge para rating
        describe('rating validation edge cases', () => {
            it.each([
                { rating: 0, description: 'rating cero' },
                { rating: -1, description: 'rating negativo' },
                { rating: 6, description: 'rating mayor a 5' },
                { rating: 5.5, description: 'rating decimal' },
                { rating: NaN, description: 'rating NaN' },
                { rating: Infinity, description: 'rating infinito' },
                { rating: -Infinity, description: 'rating infinito negativo' }
            ])('should return error for $description', (_a) => __awaiter(void 0, [_a], void 0, function* ({ rating }) {
                // Arrange
                const ratingData = {
                    eventId: 'event123',
                    musicianId: 'musician123',
                    rating: rating,
                    review: 'Excellent performance!',
                    category: 'musician'
                };
                mockRequest = {
                    user: createValidUser(),
                    body: ratingData
                };
                // Act
                yield ratingController.createRating(mockRequest, mockResponse);
                // Assert
                expect(mockStatus).toHaveBeenCalledWith(400);
                // Para rating 0 y NaN, el controlador devuelve "Faltan campos requeridos"
                // Para otros valores, devuelve el mensaje específico
                if (rating === 0 || isNaN(rating)) {
                    expect(mockJson).toHaveBeenCalledWith({
                        success: false,
                        message: 'Faltan campos requeridos: eventId, musicianId, rating, category'
                    });
                }
                else {
                    expect(mockJson).toHaveBeenCalledWith({
                        success: false,
                        message: 'El rating debe estar entre 1 y 5 estrellas'
                    });
                }
            }));
            it.each([
                { rating: 1, description: 'rating mínimo válido' },
                { rating: 2, description: 'rating válido' },
                { rating: 3, description: 'rating válido' },
                { rating: 4, description: 'rating válido' },
                { rating: 5, description: 'rating máximo válido' }
            ])('should accept $description', (_a) => __awaiter(void 0, [_a], void 0, function* ({ rating }) {
                // Arrange
                const ratingData = createValidRatingData({ rating });
                const mockRating = {
                    id: 'rating123',
                    eventId: 'event123',
                    musicianId: 'musician123',
                    eventCreatorId: 'user123',
                    rating,
                    review: 'Excellent performance!',
                    category: 'musician',
                    isVerified: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    helpfulCount: 0,
                    reportedCount: 0,
                    isActive: true
                };
                mockRequest = {
                    user: createValidUser(),
                    body: ratingData
                };
                mockRatingService.createRating.mockResolvedValue(mockRating);
                // Act
                yield ratingController.createRating(mockRequest, mockResponse);
                // Assert
                expect(mockRatingService.createRating).toHaveBeenCalledWith(expect.objectContaining({ rating }));
                expect(mockStatus).toHaveBeenCalledWith(201);
            }));
        });
        // 🆕 TESTS MEJORADOS: Validación de categorías
        describe('category validation', () => {
            it.each([
                'invalid',
                'musician_',
                '_musician',
                'MUSICIAN',
                'Musician',
                '',
                null,
                undefined
            ])('should return error for invalid category: %s', (category) => __awaiter(void 0, void 0, void 0, function* () {
                // Arrange
                const ratingData = {
                    eventId: 'event123',
                    musicianId: 'musician123',
                    rating: 5,
                    review: 'Excellent performance!',
                    category: category
                };
                mockRequest = {
                    user: createValidUser(),
                    body: ratingData
                };
                // Act
                yield ratingController.createRating(mockRequest, mockResponse);
                // Assert
                expect(mockStatus).toHaveBeenCalledWith(400);
                // Para categorías null, undefined o vacías, el controlador devuelve "Faltan campos requeridos"
                // Para otros valores, devuelve el mensaje específico
                if (category === null || category === undefined || category === '') {
                    expect(mockJson).toHaveBeenCalledWith({
                        success: false,
                        message: 'Faltan campos requeridos: eventId, musicianId, rating, category'
                    });
                }
                else {
                    expect(mockJson).toHaveBeenCalledWith({
                        success: false,
                        message: 'Categoría debe ser "musician" o "event_creator"'
                    });
                }
            }));
            it.each(['musician', 'event_creator'])('should accept valid category: %s', (category) => __awaiter(void 0, void 0, void 0, function* () {
                // Arrange
                const ratingData = createValidRatingData({ category });
                const mockRating = {
                    id: 'rating123',
                    eventId: 'event123',
                    musicianId: 'musician123',
                    eventCreatorId: 'user123',
                    rating: 5,
                    review: 'Excellent performance!',
                    category: category,
                    isVerified: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    helpfulCount: 0,
                    reportedCount: 0,
                    isActive: true
                };
                mockRequest = {
                    user: createValidUser(),
                    body: ratingData
                };
                mockRatingService.createRating.mockResolvedValue(mockRating);
                // Act
                yield ratingController.createRating(mockRequest, mockResponse);
                // Assert
                expect(mockRatingService.createRating).toHaveBeenCalledWith(expect.objectContaining({ category }));
                expect(mockStatus).toHaveBeenCalledWith(201);
            }));
        });
        // 🆕 TESTS MEJORADOS: Validación de IDs
        describe('ID validation', () => {
            it.each([
                { field: 'eventId', value: '', description: 'eventId vacío' },
                { field: 'eventId', value: null, description: 'eventId null' },
                { field: 'eventId', value: undefined, description: 'eventId undefined' },
                { field: 'musicianId', value: '', description: 'musicianId vacío' },
                { field: 'musicianId', value: null, description: 'musicianId null' },
                { field: 'musicianId', value: undefined, description: 'musicianId undefined' }
            ])('should return error for $description', (_a) => __awaiter(void 0, [_a], void 0, function* ({ field, value }) {
                // Arrange
                const ratingData = createValidRatingData({ [field]: value });
                mockRequest = {
                    user: createValidUser(),
                    body: ratingData
                };
                // Act
                yield ratingController.createRating(mockRequest, mockResponse);
                // Assert
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    message: 'Faltan campos requeridos: eventId, musicianId, rating, category'
                });
            }));
        });
        // 🆕 TESTS MEJORADOS: Casos de error del servicio
        describe('service error handling', () => {
            it('should handle service throwing error', () => __awaiter(void 0, void 0, void 0, function* () {
                // Arrange
                const ratingData = createValidRatingData();
                const serviceError = new Error('Database connection failed');
                mockRequest = {
                    user: createValidUser(),
                    body: ratingData
                };
                mockRatingService.createRating.mockRejectedValue(serviceError);
                // Act
                yield ratingController.createRating(mockRequest, mockResponse);
                // Assert
                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    message: 'Database connection failed'
                });
            }));
            it('should handle unknown error type', () => __awaiter(void 0, void 0, void 0, function* () {
                // Arrange
                const ratingData = createValidRatingData();
                mockRequest = {
                    user: createValidUser(),
                    body: ratingData
                };
                mockRatingService.createRating.mockRejectedValue('String error');
                // Act
                yield ratingController.createRating(mockRequest, mockResponse);
                // Assert
                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    message: 'Error interno del servidor'
                });
            }));
        });
        // 🆕 TESTS MEJORADOS: Validación de review
        describe('review validation', () => {
            it('should accept review with special characters', () => __awaiter(void 0, void 0, void 0, function* () {
                // Arrange
                const review = '¡Excelente presentación! 🎵🎶 Muy profesional.';
                const ratingData = createValidRatingData({ review });
                const mockRating = {
                    id: 'rating123',
                    eventId: 'event123',
                    musicianId: 'musician123',
                    eventCreatorId: 'user123',
                    rating: 5,
                    review,
                    category: 'musician',
                    isVerified: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    helpfulCount: 0,
                    reportedCount: 0,
                    isActive: true
                };
                mockRequest = {
                    user: createValidUser(),
                    body: ratingData
                };
                mockRatingService.createRating.mockResolvedValue(mockRating);
                // Act
                yield ratingController.createRating(mockRequest, mockResponse);
                // Assert
                expect(mockRatingService.createRating).toHaveBeenCalledWith(expect.objectContaining({ review }));
                expect(mockStatus).toHaveBeenCalledWith(201);
            }));
            it('should accept empty review', () => __awaiter(void 0, void 0, void 0, function* () {
                // Arrange
                const ratingData = createValidRatingData({ review: '' });
                const mockRating = {
                    id: 'rating123',
                    eventId: 'event123',
                    musicianId: 'musician123',
                    eventCreatorId: 'user123',
                    rating: 5,
                    review: '',
                    category: 'musician',
                    isVerified: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    helpfulCount: 0,
                    reportedCount: 0,
                    isActive: true
                };
                mockRequest = {
                    user: createValidUser(),
                    body: ratingData
                };
                mockRatingService.createRating.mockResolvedValue(mockRating);
                // Act
                yield ratingController.createRating(mockRequest, mockResponse);
                // Assert
                expect(mockRatingService.createRating).toHaveBeenCalledWith(expect.objectContaining({ review: '' }));
                expect(mockStatus).toHaveBeenCalledWith(201);
            }));
        });
    });
    describe('getUserRatings', () => {
        it('should return user ratings successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const userId = 'user123';
            const category = 'musician';
            const mockRatings = [
                {
                    id: 'rating1',
                    eventId: 'event1',
                    musicianId: 'musician1',
                    eventCreatorId: 'user123',
                    rating: 5,
                    review: 'Great performance',
                    category: 'musician',
                    isVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    helpfulCount: 0,
                    reportedCount: 0,
                    isActive: true
                }
            ];
            mockRequest = {
                params: { userId, category },
                query: {
                    minRating: '4',
                    maxRating: '5',
                    isVerified: 'true'
                }
            };
            mockRatingService.getUserRatings.mockResolvedValue(mockRatings);
            // Act
            yield ratingController.getUserRatings(mockRequest, mockResponse);
            // Assert
            expect(mockRatingService.getUserRatings).toHaveBeenCalledWith(userId, category, {
                minRating: 4,
                maxRating: 5,
                isVerified: true,
                dateFrom: undefined,
                dateTo: undefined
            });
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Ratings obtenidos exitosamente',
                ratings: mockRatings,
                count: mockRatings.length
            });
        }));
        it('should return error when required parameters are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest = {
                params: { userId: 'user123' }, // Missing category
                query: {}
            };
            // Act
            yield ratingController.getUserRatings(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Faltan parámetros requeridos: userId, category'
            });
        }));
    });
    describe('getUserRatingStats', () => {
        it('should return user rating stats successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const userId = 'user123';
            const category = 'musician';
            const mockStats = {
                totalRatings: 10,
                averageRating: 4.5,
                ratingDistribution: {
                    1: 0,
                    2: 1,
                    3: 2,
                    4: 4,
                    5: 3
                },
                verifiedRatings: 8,
                totalReviews: 7,
                recentRatings: [],
                responseRate: 85.5
            };
            mockRequest = {
                params: { userId, category }
            };
            mockRatingService.getUserRatingStats.mockResolvedValue(mockStats);
            // Act
            yield ratingController.getUserRatingStats(mockRequest, mockResponse);
            // Assert
            expect(mockRatingService.getUserRatingStats).toHaveBeenCalledWith(userId, category);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Estadísticas obtenidas exitosamente',
                stats: mockStats
            });
        }));
    });
    describe('updateRating', () => {
        it('should update rating successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const ratingId = 'rating123';
            const updateData = {
                rating: 4,
                review: 'Updated review'
            };
            const mockUpdatedRating = {
                id: ratingId,
                eventId: 'event123',
                musicianId: 'musician123',
                eventCreatorId: 'user123',
                rating: 4,
                review: 'Updated review',
                category: 'musician',
                isVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                helpfulCount: 0,
                reportedCount: 0,
                isActive: true
            };
            mockRequest = {
                user: {
                    id: 'user123',
                    userId: 'user123',
                    userEmail: 'user@example.com',
                    email: 'user@example.com',
                    role: 'user',
                    name: 'Test User'
                },
                params: { ratingId },
                body: updateData
            };
            mockRatingService.getRatingById.mockResolvedValue({
                id: ratingId,
                eventId: 'event123',
                musicianId: 'musician123',
                eventCreatorId: 'user123',
                rating: 3,
                review: 'Original review',
                category: 'musician',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                isVerified: false,
                helpfulCount: 0,
                reportedCount: 0
            });
            mockRatingService.updateRating.mockResolvedValue(mockUpdatedRating);
            // Act
            yield ratingController.updateRating(mockRequest, mockResponse);
            // Assert
            expect(mockRatingService.updateRating).toHaveBeenCalledWith(ratingId, updateData);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Rating actualizado exitosamente',
                rating: mockUpdatedRating
            });
        }));
        it('should return error when rating is out of range', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const ratingId = 'rating123';
            const updateData = {
                rating: 6, // Invalid rating
                review: 'Updated review'
            };
            const existingRating = {
                id: ratingId,
                eventId: 'event123',
                musicianId: 'musician123',
                eventCreatorId: 'user123',
                rating: 4,
                review: 'Original review',
                category: 'musician',
                isVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                helpfulCount: 0,
                reportedCount: 0,
                isActive: true
            };
            mockRequest = {
                user: {
                    id: 'user123',
                    userId: 'user123',
                    userEmail: 'user@example.com',
                    email: 'user@example.com',
                    role: 'user',
                    name: 'Test User'
                },
                params: { ratingId },
                body: updateData
            };
            mockRatingService.getRatingById.mockResolvedValue(existingRating);
            // Act
            yield ratingController.updateRating(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'El rating debe estar entre 1 y 5 estrellas'
            });
        }));
    });
    describe('markRatingAsHelpful', () => {
        it('should mark rating as helpful successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const ratingId = 'rating123';
            const mockUpdatedRating = {
                id: ratingId,
                helpfulCount: 5,
                isHelpful: true
            };
            mockRequest = {
                user: {
                    id: 'user123',
                    userId: 'user123',
                    userEmail: 'user@example.com',
                    email: 'user@example.com',
                    role: 'user',
                    name: 'Test User'
                },
                params: { ratingId }
            };
            mockRatingService.markRatingAsHelpful.mockResolvedValue();
            // Act
            yield ratingController.markRatingAsHelpful(mockRequest, mockResponse);
            // Assert
            expect(mockRatingService.markRatingAsHelpful).toHaveBeenCalledWith(ratingId);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Rating marcado como útil exitosamente'
            });
        }));
    });
    describe('reportRating', () => {
        it('should report rating successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const ratingId = 'rating123';
            const reportData = {
                reason: 'inappropriate_content',
                description: 'This rating contains inappropriate content'
            };
            mockRequest = {
                user: {
                    id: 'user123',
                    userId: 'user123',
                    userEmail: 'user@example.com',
                    email: 'user@example.com',
                    role: 'user',
                    name: 'Test User'
                },
                params: { ratingId },
                body: reportData
            };
            mockRatingService.reportRating.mockResolvedValue(undefined);
            // Act
            yield ratingController.reportRating(mockRequest, mockResponse);
            // Assert
            expect(mockRatingService.reportRating).toHaveBeenCalledWith(ratingId, 'inappropriate_content');
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Rating reportado exitosamente'
            });
        }));
        it('should return error when reason is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const ratingId = 'rating123';
            const reportData = {
                description: 'This rating contains inappropriate content'
                // Missing reason
            };
            mockRequest = {
                user: {
                    id: 'user123',
                    userId: 'user123',
                    userEmail: 'user@example.com',
                    email: 'user@example.com',
                    role: 'user',
                    name: 'Test User'
                },
                params: { ratingId },
                body: reportData
            };
            // Act
            yield ratingController.reportRating(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'ID de rating y razón requeridos'
            });
        }));
    });
    describe('getEventRatings', () => {
        it('should return event ratings successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const eventId = 'event123';
            const mockRatings = [
                {
                    id: 'rating1',
                    eventId: 'event123',
                    musicianId: 'musician1',
                    eventCreatorId: 'user123',
                    rating: 5,
                    review: 'Great performance',
                    category: 'musician',
                    isVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    helpfulCount: 0,
                    reportedCount: 0,
                    isActive: true
                }
            ];
            mockRequest = {
                params: { eventId },
                query: {
                    category: 'musician',
                    minRating: '4'
                }
            };
            mockRatingService.getEventRatings.mockResolvedValue(mockRatings);
            // Act
            yield ratingController.getEventRatings(mockRequest, mockResponse);
            // Assert
            expect(mockRatingService.getEventRatings).toHaveBeenCalledWith(eventId);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Ratings del evento obtenidos exitosamente',
                ratings: mockRatings,
                count: mockRatings.length
            });
        }));
    });
    describe('getTopRatedMusicians', () => {
        it('should return top rated musicians successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const mockMusicians = [
                {
                    userId: 'musician1',
                    stats: {
                        averageRating: 4.8,
                        totalRatings: 50,
                        ratingDistribution: { 1: 0, 2: 1, 3: 2, 4: 15, 5: 32 },
                        recentRatings: [],
                        verifiedRatings: 45,
                        responseRate: 90.0
                    }
                }
            ];
            mockRequest = {
                query: {
                    limit: '10',
                    minRatings: '5'
                }
            };
            mockRatingService.getTopRatedMusicians.mockResolvedValue(mockMusicians);
            // Act
            yield ratingController.getTopRatedMusicians(mockRequest, mockResponse);
            // Assert
            expect(mockRatingService.getTopRatedMusicians).toHaveBeenCalledWith(10, 5);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Top músicos obtenidos exitosamente',
                musicians: mockMusicians,
                count: mockMusicians.length
            });
        }));
    });
    describe('getRatingTrends', () => {
        it('should return rating trends successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const mockTrends = {
                averageRatingByDay: {
                    '2024-01-01': 4.2,
                    '2024-01-02': 4.5
                },
                totalRatingsByDay: {
                    '2024-01-01': 25,
                    '2024-01-02': 30
                },
                categoryDistribution: {
                    'musician': 60,
                    'event_creator': 40
                }
            };
            mockRequest = {
                query: {
                    period: 'monthly',
                    userId: 'user123'
                }
            };
            mockRatingService.getRatingTrends.mockResolvedValue(mockTrends);
            // Act
            yield ratingController.getRatingTrends(mockRequest, mockResponse);
            // Assert
            expect(mockRatingService.getRatingTrends).toHaveBeenCalledWith(30);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Tendencias de rating obtenidas exitosamente',
                trends: mockTrends
            });
        }));
    });
    describe('getMostHelpfulRatings', () => {
        it('should return most helpful ratings successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const mockRatings = [
                {
                    id: 'rating1',
                    eventId: 'event1',
                    musicianId: 'musician1',
                    eventCreatorId: 'user123',
                    rating: 5,
                    review: 'Very helpful review',
                    category: 'musician',
                    helpfulCount: 10,
                    isVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    reportedCount: 0,
                    isActive: true
                }
            ];
            mockRequest = {
                params: {
                    userId: 'user123',
                    category: 'musician'
                },
                query: {
                    limit: '5'
                }
            };
            mockRatingService.getMostHelpfulRatings.mockResolvedValue(mockRatings);
            // Act
            yield ratingController.getMostHelpfulRatings(mockRequest, mockResponse);
            // Assert
            expect(mockRatingService.getMostHelpfulRatings).toHaveBeenCalledWith('user123', 'musician', 5);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Ratings más útiles obtenidos exitosamente',
                ratings: mockRatings,
                count: mockRatings.length
            });
        }));
    });
});
