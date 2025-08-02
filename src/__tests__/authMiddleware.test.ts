import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/authMiddleware';

// Mock de jwt
jest.mock('jsonwebtoken');

describe('AuthMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

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

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(mockRequest.user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no authorization header is provided', () => {
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

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

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

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

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

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

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

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

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

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

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token de acceso requerido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 