"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const setup_1 = require("./setup");
// Mock de jsonwebtoken
jest.mock('jsonwebtoken');
describe('AuthMiddleware', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    let mockJson;
    let mockStatus;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        mockResponse = {
            status: mockStatus,
            json: mockJson
        };
        mockNext = jest.fn();
        // Reset de todos los mocks
        jest.clearAllMocks();
    });
    describe('authMiddleware', () => {
        it('should call next() when valid token is provided', () => {
            const mockToken = 'valid.jwt.token';
            const mockDecoded = {
                id: 'user123',
                email: 'user@example.com',
                roll: 'musico'
            };
            mockRequest = (0, setup_1.createMockRequest)({
                headers: {
                    authorization: `Bearer ${mockToken}`
                }
            });
            jsonwebtoken_1.default.verify.mockReturnValue(mockDecoded);
            (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith(mockToken, '0ch1n@gu@01');
            expect(mockRequest.user).toEqual(mockDecoded);
            expect(mockNext).toHaveBeenCalled();
        });
        it('should return 401 when no authorization header is provided', () => {
            mockRequest = (0, setup_1.createMockRequest)({
                headers: {}
            });
            (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Token no proporcionado'
            });
        });
        it('should return 401 when authorization header does not start with Bearer', () => {
            mockRequest = (0, setup_1.createMockRequest)({
                headers: {
                    authorization: 'InvalidToken'
                }
            });
            (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Token no proporcionado'
            });
        });
        it('should return 401 when token is invalid', () => {
            const mockToken = 'invalid.jwt.token';
            mockRequest = (0, setup_1.createMockRequest)({
                headers: {
                    authorization: `Bearer ${mockToken}`
                }
            });
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Token inválido o expirado'
            });
        });
        it('should return 401 when token is expired', () => {
            const mockToken = 'expired.jwt.token';
            mockRequest = (0, setup_1.createMockRequest)({
                headers: {
                    authorization: `Bearer ${mockToken}`
                }
            });
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw new Error('TokenExpiredError');
            });
            (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Token inválido o expirado'
            });
        });
        it('should handle empty token after Bearer', () => {
            mockRequest = (0, setup_1.createMockRequest)({
                headers: {
                    authorization: 'Bearer '
                }
            });
            (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Token inválido o expirado'
            });
        });
    });
});
