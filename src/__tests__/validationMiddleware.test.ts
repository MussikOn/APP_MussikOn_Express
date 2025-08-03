import { Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validationMiddleware';
import { registerSchema } from '../utils/validationSchemas';
import { createMockRequest, createMockResponse } from './setup';

describe('ValidationMiddleware', () => {
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

  describe('validate', () => {
    it('should return 400 when validation fails with missing required fields', () => {
      mockRequest = createMockRequest({
        body: {
          name: 'Juan',
          lastName: 'Pérez'
          // userEmail, userPassword, roll faltantes
        }
      });

      const middleware = validate(registerSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'userEmail',
            message: 'El email es requerido',
            type: 'any.required',
            value: undefined
          }),
          expect.objectContaining({
            field: 'userPassword',
            message: 'La contraseña es requerida',
            type: 'any.required',
            value: undefined
          }),
          expect.objectContaining({
            field: 'roll',
            message: '"roll" is required',
            type: 'any.required',
            value: undefined
          })
        ]),
        path: undefined,
        timestamp: expect.any(String)
      });
    });

    it('should return 400 when email format is invalid', () => {
      mockRequest = createMockRequest({
        body: {
          name: 'Juan',
          lastName: 'Pérez',
          userEmail: 'invalid-email',
          userPassword: 'Password123!',
          roll: 'musico'
        }
      });

      const middleware = validate(registerSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'userEmail',
            message: 'El email debe tener un formato válido',
            type: 'string.email',
            value: 'invalid-email'
          })
        ]),
        path: undefined,
        timestamp: expect.any(String)
      });
    });

    it('should return 400 when password is too weak', () => {
      mockRequest = createMockRequest({
        body: {
          name: 'Juan',
          lastName: 'Pérez',
          userEmail: 'juan@example.com',
          userPassword: 'weak',
          roll: 'musico'
        }
      });

      const middleware = validate(registerSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'userPassword',
            message: 'La contraseña debe tener al menos 8 caracteres',
            type: 'string.min',
            value: 'weak'
          }),
          expect.objectContaining({
            field: 'userPassword',
            message: 'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial',
            type: 'string.pattern.base',
            value: 'weak'
          })
        ]),
        path: undefined,
        timestamp: expect.any(String)
      });
    });

    it('should return 400 when roll is invalid', () => {
      mockRequest = createMockRequest({
        body: {
          name: 'Juan',
          lastName: 'Pérez',
          userEmail: 'juan@example.com',
          userPassword: 'Password123!',
          roll: 'invalid-role'
        }
      });

      const middleware = validate(registerSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'roll',
            message: 'El rol debe ser uno de los valores permitidos',
            type: 'any.only',
            value: 'invalid-role'
          })
        ]),
        path: undefined,
        timestamp: expect.any(String)
      });
    });

    it('should return 400 when name is too short', () => {
      mockRequest = createMockRequest({
        body: {
          name: 'J',
          lastName: 'Pérez',
          userEmail: 'juan@example.com',
          userPassword: 'Password123!',
          roll: 'musico'
        }
      });

      const middleware = validate(registerSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: 'El nombre debe tener al menos 2 caracteres',
            type: 'string.min',
            value: 'J'
          })
        ]),
        path: undefined,
        timestamp: expect.any(String)
      });
    });

    it('should return 400 when lastName is too short', () => {
      mockRequest = createMockRequest({
        body: {
          name: 'Juan',
          lastName: 'P',
          userEmail: 'juan@example.com',
          userPassword: 'Password123!',
          roll: 'musico'
        }
      });

      const middleware = validate(registerSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'lastName',
            message: 'El apellido debe tener al menos 2 caracteres',
            type: 'string.min',
            value: 'P'
          })
        ]),
        path: undefined,
        timestamp: expect.any(String)
      });
    });

    it('should handle multiple validation errors', () => {
      mockRequest = createMockRequest({
        body: {
          name: 'J',
          lastName: 'P',
          userEmail: 'invalid-email',
          userPassword: 'weak',
          roll: 'invalid-role'
        }
      });

      const middleware = validate(registerSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: 'El nombre debe tener al menos 2 caracteres',
            type: 'string.min',
            value: 'J'
          }),
          expect.objectContaining({
            field: 'lastName',
            message: 'El apellido debe tener al menos 2 caracteres',
            type: 'string.min',
            value: 'P'
          }),
          expect.objectContaining({
            field: 'userEmail',
            message: 'El email debe tener un formato válido',
            type: 'string.email',
            value: 'invalid-email'
          }),
          expect.objectContaining({
            field: 'userPassword',
            message: 'La contraseña debe tener al menos 8 caracteres',
            type: 'string.min',
            value: 'weak'
          }),
          expect.objectContaining({
            field: 'userPassword',
            message: 'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial',
            type: 'string.pattern.base',
            value: 'weak'
          }),
          expect.objectContaining({
            field: 'roll',
            message: 'El rol debe ser uno de los valores permitidos',
            type: 'any.only',
            value: 'invalid-role'
          })
        ]),
        path: undefined,
        timestamp: expect.any(String)
      });
    });

    it('should handle empty body', () => {
      mockRequest = createMockRequest({
        body: {}
      });

      const middleware = validate(registerSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: 'El nombre es requerido',
            type: 'any.required',
            value: undefined
          }),
          expect.objectContaining({
            field: 'lastName',
            message: 'El apellido es requerido',
            type: 'any.required',
            value: undefined
          }),
          expect.objectContaining({
            field: 'userEmail',
            message: 'El email es requerido',
            type: 'any.required',
            value: undefined
          }),
          expect.objectContaining({
            field: 'userPassword',
            message: 'La contraseña es requerida',
            type: 'any.required',
            value: undefined
          }),
          expect.objectContaining({
            field: 'roll',
            message: '"roll" is required',
            type: 'any.required',
            value: undefined
          })
        ]),
        path: undefined,
        timestamp: expect.any(String)
      });
    });

    it('should handle null body', () => {
      mockRequest = createMockRequest({
        body: null
      });

      const middleware = validate(registerSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: '',
            message: '"value" must be of type object',
            type: 'object.base',
            value: null
          })
        ]),
        path: undefined,
        timestamp: expect.any(String)
      });
    });

    it('should call next() when validation passes', () => {
      mockRequest = createMockRequest({
        body: {
          name: 'Juan',
          lastName: 'Pérez',
          userEmail: 'juan@example.com',
          userPassword: 'Password123!',
          roll: 'musico'
        }
      });

      const middleware = validate(registerSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
}); 