import { Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validationMiddleware';
import { musicianRegisterSchema } from '../utils/validationSchemas';

describe('ValidationMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    mockNext = jest.fn();

    // Reset de todos los mocks
    jest.clearAllMocks();
  });

  describe('validationMiddleware', () => {
    it('should call next() when validation passes', () => {
      mockRequest.body = {
        name: 'Juan',
        lastName: 'Pérez',
        roll: 'musico',
        userEmail: 'juan@example.com',
        userPassword: 'Password123!'
      };

      const middleware = validate(musicianRegisterSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 400 when validation fails with missing required fields', () => {
      mockRequest.body = {
        name: 'Juan',
        lastName: 'Pérez'
        // roll, userEmail, userPassword faltantes
      };

      const middleware = validate(musicianRegisterSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de validación',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String)
          })
        ])
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when email format is invalid', () => {
      mockRequest.body = {
        name: 'Juan',
        lastName: 'Pérez',
        roll: 'musico',
        userEmail: 'invalid-email',
        userPassword: 'Password123!'
      };

      const middleware = validate(musicianRegisterSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de validación',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'userEmail',
            message: expect.stringContaining('email')
          })
        ])
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when password is too weak', () => {
      mockRequest.body = {
        name: 'Juan',
        lastName: 'Pérez',
        roll: 'musico',
        userEmail: 'juan@example.com',
        userPassword: 'weak'
      };

      const middleware = validate(musicianRegisterSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de validación',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'userPassword',
            message: expect.any(String)
          })
        ])
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when roll is invalid', () => {
      mockRequest.body = {
        name: 'Juan',
        lastName: 'Pérez',
        roll: 'invalid-role',
        userEmail: 'juan@example.com',
        userPassword: 'Password123!'
      };

      const middleware = validate(musicianRegisterSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de validación',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'roll',
            message: expect.stringContaining('musico')
          })
        ])
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when name is too short', () => {
      mockRequest.body = {
        name: 'J', // Muy corto
        lastName: 'Pérez',
        roll: 'musico',
        userEmail: 'juan@example.com',
        userPassword: 'Password123!'
      };

      const middleware = validate(musicianRegisterSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de validación',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.any(String)
          })
        ])
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when lastName is too short', () => {
      mockRequest.body = {
        name: 'Juan',
        lastName: 'P', // Muy corto
        roll: 'musico',
        userEmail: 'juan@example.com',
        userPassword: 'Password123!'
      };

      const middleware = validate(musicianRegisterSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de validación',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'lastName',
            message: expect.any(String)
          })
        ])
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle multiple validation errors', () => {
      mockRequest.body = {
        name: 'J', // Muy corto
        lastName: 'P', // Muy corto
        roll: 'invalid-role',
        userEmail: 'invalid-email',
        userPassword: 'weak'
      };

      const middleware = validate(musicianRegisterSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de validación',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'lastName' }),
          expect.objectContaining({ field: 'roll' }),
          expect.objectContaining({ field: 'userEmail' }),
          expect.objectContaining({ field: 'userPassword' })
        ])
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle empty body', () => {
      mockRequest.body = {};

      const middleware = validate(musicianRegisterSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de validación',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'lastName' }),
          expect.objectContaining({ field: 'roll' }),
          expect.objectContaining({ field: 'userEmail' }),
          expect.objectContaining({ field: 'userPassword' })
        ])
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle null body', () => {
      mockRequest.body = null;

      const middleware = validate(musicianRegisterSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de validación',
        errors: expect.any(Array)
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 