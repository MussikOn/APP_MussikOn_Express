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
const ratingController_1 = require("../../controllers/ratingController");
const ratingService_1 = require("../../services/ratingService");
// Mock más realista del servicio
jest.mock('../../services/ratingService');
jest.mock('../../services/loggerService', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
    }
}));
describe('RatingController Integration Tests', () => {
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
    // 🆕 TESTS DE INTEGRACIÓN: Escenarios complejos
    describe('Complex Integration Scenarios', () => {
        // Test de concurrencia simulada
        it('should handle concurrent rating creation requests', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const ratingData = {
                eventId: 'event123',
                musicianId: 'musician123',
                rating: 5,
                review: 'Excellent performance!',
                category: 'musician'
            };
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
                user: {
                    id: 'user123',
                    userId: 'user123',
                    userEmail: 'user@example.com',
                    email: 'user@example.com',
                    role: 'user',
                    name: 'Test User'
                },
                body: ratingData
            };
            // Simular múltiples llamadas concurrentes
            const promises = [];
            for (let i = 0; i < 5; i++) {
                mockRatingService.createRating.mockResolvedValueOnce(Object.assign(Object.assign({}, mockRating), { id: `rating${i}` }));
                promises.push(ratingController.createRating(mockRequest, mockResponse));
            }
            // Act
            yield Promise.all(promises);
            // Assert
            expect(mockRatingService.createRating).toHaveBeenCalledTimes(5);
            expect(mockStatus).toHaveBeenCalledWith(201);
        }));
        // Test de rate limiting simulado
        it('should handle rate limiting scenarios', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const ratingData = {
                eventId: 'event123',
                musicianId: 'musician123',
                rating: 5,
                review: 'Excellent performance!',
                category: 'musician'
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
                body: ratingData
            };
            // Simular error de rate limiting
            const rateLimitError = new Error('Rate limit exceeded');
            rateLimitError.name = 'RateLimitError';
            mockRatingService.createRating.mockRejectedValue(rateLimitError);
            // Act
            yield ratingController.createRating(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Rate limit exceeded'
            });
        }));
        // Test de validación de datos maliciosos
        it('should handle malicious input data', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const maliciousData = {
                eventId: 'event123',
                musicianId: 'musician123',
                rating: 5,
                review: '<script>alert("XSS")</script>',
                category: 'musician'
            };
            const mockRating = {
                id: 'rating123',
                eventId: 'event123',
                musicianId: 'musician123',
                eventCreatorId: 'user123',
                rating: 5,
                review: '<script>alert("XSS")</script>',
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
                body: maliciousData
            };
            mockRatingService.createRating.mockResolvedValue(mockRating);
            // Act
            yield ratingController.createRating(mockRequest, mockResponse);
            // Assert
            expect(mockRatingService.createRating).toHaveBeenCalledWith(expect.objectContaining({
                review: '<script>alert("XSS")</script>'
            }));
            expect(mockStatus).toHaveBeenCalledWith(201);
        }));
        // Test de validación de IDs maliciosos
        it('should handle malicious ID formats', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const maliciousData = {
                eventId: 'event123; DROP TABLE users; --',
                musicianId: 'musician123',
                rating: 5,
                review: 'Test review',
                category: 'musician'
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
                body: maliciousData
            };
            // Act
            yield ratingController.createRating(mockRequest, mockResponse);
            // Assert
            // El controlador debería validar y rechazar IDs maliciosos
            expect(mockStatus).toHaveBeenCalledWith(500);
        }));
        // Test de validación de emails maliciosos
        it('should handle malicious email formats', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const ratingData = {
                eventId: 'event123',
                musicianId: 'musician123',
                rating: 5,
                review: 'Test review',
                category: 'musician'
            };
            mockRequest = {
                user: {
                    id: 'user123',
                    userId: 'user123',
                    userEmail: 'user@example.com<script>alert("XSS")</script>',
                    email: 'user@example.com<script>alert("XSS")</script>',
                    role: 'user',
                    name: 'Test User'
                },
                body: ratingData
            };
            // Act
            yield ratingController.createRating(mockRequest, mockResponse);
            // Assert
            // El controlador debería validar y rechazar emails maliciosos
            expect(mockStatus).toHaveBeenCalledWith(500);
        }));
        // Test de validación de caracteres especiales en review
        it('should handle special characters in review', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const specialCharsReview = '¡Hola! ¿Cómo estás? 🎵🎶🎸🎹🎺🎻🎷🥁';
            const ratingData = {
                eventId: 'event123',
                musicianId: 'musician123',
                rating: 5,
                review: specialCharsReview,
                category: 'musician'
            };
            const mockRating = {
                id: 'rating123',
                eventId: 'event123',
                musicianId: 'musician123',
                eventCreatorId: 'user123',
                rating: 5,
                review: specialCharsReview,
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
                body: ratingData
            };
            mockRatingService.createRating.mockResolvedValue(mockRating);
            // Act
            yield ratingController.createRating(mockRequest, mockResponse);
            // Assert
            expect(mockRatingService.createRating).toHaveBeenCalledWith(expect.objectContaining({
                review: specialCharsReview
            }));
            expect(mockStatus).toHaveBeenCalledWith(201);
        }));
        // Test de validación de review muy larga
        it('should handle very long review text', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const longReview = 'A'.repeat(10000); // Review de 10,000 caracteres
            const ratingData = {
                eventId: 'event123',
                musicianId: 'musician123',
                rating: 5,
                review: longReview,
                category: 'musician'
            };
            const mockRating = {
                id: 'rating123',
                eventId: 'event123',
                musicianId: 'musician123',
                eventCreatorId: 'user123',
                rating: 5,
                review: longReview,
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
                body: ratingData
            };
            mockRatingService.createRating.mockResolvedValue(mockRating);
            // Act
            yield ratingController.createRating(mockRequest, mockResponse);
            // Assert
            expect(mockRatingService.createRating).toHaveBeenCalledWith(expect.objectContaining({
                review: longReview
            }));
            expect(mockStatus).toHaveBeenCalledWith(201);
        }));
        // Test de validación de review con caracteres de control
        it('should handle control characters in review', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const controlCharsReview = 'Review with \x00\x01\x02 control chars \x7F\x80\x81';
            const ratingData = {
                eventId: 'event123',
                musicianId: 'musician123',
                rating: 5,
                review: controlCharsReview,
                category: 'musician'
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
                body: ratingData
            };
            // Act
            yield ratingController.createRating(mockRequest, mockResponse);
            // Assert
            // El controlador debería validar y rechazar caracteres de control
            expect(mockStatus).toHaveBeenCalledWith(500);
        }));
        // Test de validación de rating con valores extremos
        it('should handle extreme rating values', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const extremeValues = [
                Number.MAX_SAFE_INTEGER,
                Number.MIN_SAFE_INTEGER,
                Number.MAX_VALUE,
                Number.MIN_VALUE,
                Number.POSITIVE_INFINITY,
                Number.NEGATIVE_INFINITY,
                Number.EPSILON
            ];
            for (const extremeValue of extremeValues) {
                const ratingData = {
                    eventId: 'event123',
                    musicianId: 'musician123',
                    rating: extremeValue,
                    review: 'Test review',
                    category: 'musician'
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
                    body: ratingData
                };
                // Act
                yield ratingController.createRating(mockRequest, mockResponse);
                // Assert
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    message: 'El rating debe estar entre 1 y 5 estrellas'
                });
                // Reset mocks for next iteration
                jest.clearAllMocks();
            }
        }));
        // Test de validación de category con valores extremos
        it('should handle extreme category values', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const extremeCategories = [
                'A'.repeat(1000), // Category muy larga
                '', // Category vacía
                '   ', // Solo espacios
                '\t\n\r', // Caracteres de control
                'musician\x00', // Con caracteres de control
                'musician<script>alert("XSS")</script>', // Con script
                'musician; DROP TABLE users; --' // SQL injection
            ];
            for (const category of extremeCategories) {
                const ratingData = {
                    eventId: 'event123',
                    musicianId: 'musician123',
                    rating: 5,
                    review: 'Test review',
                    category: category
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
                    body: ratingData
                };
                // Act
                yield ratingController.createRating(mockRequest, mockResponse);
                // Assert
                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    message: 'Faltan campos requeridos: eventId, musicianId, rating, category'
                });
                // Reset mocks for next iteration
                jest.clearAllMocks();
            }
        }));
    });
    // 🆕 TESTS DE INTEGRACIÓN: Escenarios de error complejos
    describe('Complex Error Scenarios', () => {
        // Test de timeout del servicio
        it('should handle service timeout', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const ratingData = {
                eventId: 'event123',
                musicianId: 'musician123',
                rating: 5,
                review: 'Test review',
                category: 'musician'
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
                body: ratingData
            };
            // Simular timeout
            const timeoutError = new Error('Request timeout');
            timeoutError.name = 'TimeoutError';
            mockRatingService.createRating.mockRejectedValue(timeoutError);
            // Act
            yield ratingController.createRating(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Request timeout'
            });
        }));
        // Test de error de red
        it('should handle network error', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const ratingData = {
                eventId: 'event123',
                musicianId: 'musician123',
                rating: 5,
                review: 'Test review',
                category: 'musician'
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
                body: ratingData
            };
            // Simular error de red
            const networkError = new Error('Network error');
            networkError.name = 'NetworkError';
            mockRatingService.createRating.mockRejectedValue(networkError);
            // Act
            yield ratingController.createRating(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Network error'
            });
        }));
        // Test de error de base de datos
        it('should handle database error', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const ratingData = {
                eventId: 'event123',
                musicianId: 'musician123',
                rating: 5,
                review: 'Test review',
                category: 'musician'
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
                body: ratingData
            };
            // Simular error de base de datos
            const dbError = new Error('Database connection failed');
            dbError.name = 'DatabaseError';
            mockRatingService.createRating.mockRejectedValue(dbError);
            // Act
            yield ratingController.createRating(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Database connection failed'
            });
        }));
    });
});
