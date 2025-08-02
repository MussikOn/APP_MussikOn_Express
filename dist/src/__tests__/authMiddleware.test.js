"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware_1 = require("../middleware/authMiddleware");
// Mock de jwt
jest.mock('jsonwebtoken');
describe('AuthMiddleware', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    beforeEach(() => {
        mockRequest = {
            headers: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
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
                userEmail: 'juan@example.com',
                roll: 'musico'
            };
            mockRequest.headers = {
                authorization: `Bearer ${mockToken}`
            };
            jsonwebtoken_1.default.verify.mockReturnValue(mockDecoded);
            (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
            expect(mockRequest.user).toEqual(mockDecoded);
            expect(mockNext).toHaveBeenCalled();
        });
        it('should return 401 when no authorization header is provided', () => {
            (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Token de acceso requerido'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('should return 401 when authorization header does not start with Bearer', () => {
            mockRequest.headers = {
                authorization: 'InvalidToken'
            };
            (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Formato de token inválido'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('should return 401 when token is invalid', () => {
            const mockToken = 'invalid.jwt.token';
            mockRequest.headers = {
                authorization: `Bearer ${mockToken}`
            };
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Token inválido'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('should return 401 when token is expired', () => {
            const mockToken = 'expired.jwt.token';
            mockRequest.headers = {
                authorization: `Bearer ${mockToken}`
            };
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw new jsonwebtoken_1.default.TokenExpiredError('Token expired', new Date());
            });
            (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Token expirado'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('should handle JWT_SECRET not defined', () => {
            const originalJwtSecret = process.env.JWT_SECRET;
            delete process.env.JWT_SECRET;
            const mockToken = 'valid.jwt.token';
            mockRequest.headers = {
                authorization: `Bearer ${mockToken}`
            };
            (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Error de configuración del servidor'
            });
            // Restaurar el valor original
            process.env.JWT_SECRET = originalJwtSecret;
        });
        it('should handle empty token after Bearer', () => {
            mockRequest.headers = {
                authorization: 'Bearer '
            };
            (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Token de acceso requerido'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
