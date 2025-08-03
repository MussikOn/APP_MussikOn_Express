import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/authMiddleware';
import { createMockRequest, createMockResponse } from './setup';

// Mock de jsonwebtoken
jest.mock('jsonwebtoken');

describe('AuthMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

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

      mockRequest = createMockRequest({
        headers: {
          authorization: `Bearer ${mockToken}`
        }
      });

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, '0ch1n@gu@01');
      expect(mockRequest.user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no authorization header is provided', () => {
      mockRequest = createMockRequest({
        headers: {}
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token no proporcionado'
      });
    });

    it('should return 401 when authorization header does not start with Bearer', () => {
      mockRequest = createMockRequest({
        headers: {
          authorization: 'InvalidToken'
        }
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token no proporcionado'
      });
    });

    it('should return 401 when token is invalid', () => {
      const mockToken = 'invalid.jwt.token';

      mockRequest = createMockRequest({
        headers: {
          authorization: `Bearer ${mockToken}`
        }
      });

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token inválido o expirado'
      });
    });

    it('should return 401 when token is expired', () => {
      const mockToken = 'expired.jwt.token';

      mockRequest = createMockRequest({
        headers: {
          authorization: `Bearer ${mockToken}`
        }
      });

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('TokenExpiredError');
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token inválido o expirado'
      });
    });

    it('should handle empty token after Bearer', () => {
      mockRequest = createMockRequest({
        headers: {
          authorization: 'Bearer '
        }
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token inválido o expirado'
      });
    });
  });
}); 