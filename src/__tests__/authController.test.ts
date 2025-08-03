import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import {
  registerController,
  loginController,
  requestEmailVerificationController,
  verifyAndCompleteRegistrationController,
  forgotPasswordController,
  verifyCodeController,
  resetPasswordController,
  updateUserByEmailController,
  deleteUserByEmailController
} from '../controllers/authController';
import {
  getUserByEmailModel,
  registerModel,
  updateUserByEmailModel,
  deleteUserByEmailModel
} from '../models/authModel';
import { createToken } from '../utils/jwt';
import { sendEmail } from '../utils/mailer';
import { validarEmail, validarPassword } from '../utils/validatios';
import { createMockRequest, createMockResponse } from './setup';

// Mock de todas las dependencias
jest.mock('../models/authModel');
jest.mock('../utils/jwt');
jest.mock('../utils/mailer');
jest.mock('../utils/validatios');
jest.mock('bcrypt');

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

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

  describe('registerController', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        body: {
          name: 'Juan',
          lastName: 'Pérez',
          roll: 'musico',
          userEmail: 'juan@example.com',
          userPassword: 'Password123!'
        }
      });
    });

    it('should register user successfully', async () => {
      // Mock de validaciones
      (validarPassword as jest.Mock).mockReturnValue(true);
      (validarEmail as jest.Mock).mockReturnValue(true);
      
      // Mock de bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      
      // Mock del modelo - registerModel retorna false cuando es exitoso
      (registerModel as jest.Mock).mockResolvedValue(false);
      
      // Mock del usuario creado
      (getUserByEmailModel as jest.Mock).mockResolvedValue({
        id: 'user123',
        name: 'Juan',
        lastName: 'Pérez',
        roll: 'musico',
        userEmail: 'juan@example.com'
      });
      
      (createToken as jest.Mock).mockReturnValue('mockToken');

      await registerController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Usuario Registrado con éxito.',
        token: 'mockToken',
        user: expect.objectContaining({
          id: 'user123',
          name: 'Juan',
          lastName: 'Pérez',
          roll: 'musico',
          userEmail: 'juan@example.com'
        })
      });
    });

    it('should return error when required fields are missing', async () => {
      mockRequest = createMockRequest({
        body: {
          name: 'Juan',
          lastName: 'Pérez',
          // roll, userEmail, userPassword faltantes
        }
      });

      await registerController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Error al registrarse, todos los campos deben de ser llenados'
      });
    });

    it('should return error when password is invalid', async () => {
      (validarPassword as jest.Mock).mockReturnValue(false);

      await registerController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        msg: expect.stringContaining('La contraseña no cumple con los requisitos')
      });
    });

    it('should return error when email is invalid', async () => {
      (validarPassword as jest.Mock).mockReturnValue(true);
      (validarEmail as jest.Mock).mockReturnValue(false);

      await registerController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Correo Electrónico inválido.'
      });
    });

    it('should return error when user already exists', async () => {
      (validarPassword as jest.Mock).mockReturnValue(true);
      (validarEmail as jest.Mock).mockReturnValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      
      // Mock que el usuario ya existe
      (registerModel as jest.Mock).mockResolvedValue('El usuario ya Existe.');

      await registerController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Ya hay un usuario con esta direccion de correo electrónico.',
        data: 'El usuario ya Existe.'
      });
    });

    it('should return error when registration fails', async () => {
      (validarPassword as jest.Mock).mockReturnValue(true);
      (validarEmail as jest.Mock).mockReturnValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      
      (registerModel as jest.Mock).mockRejectedValue(new Error('Database error'));

      await registerController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Error al registrarse.',
        error: expect.any(Error)
      });
    });
  });

  describe('loginController', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        body: {
          userEmail: 'juan@example.com',
          userPassword: 'Password123!'
        }
      });
    });

    it('should login user successfully', async () => {
      const mockUser = {
        id: 'user123',
        name: 'Juan',
        lastName: 'Pérez',
        roll: 'musico',
        userEmail: 'juan@example.com',
        userPassword: 'hashedPassword'
      };

      (validarEmail as jest.Mock).mockReturnValue(true);
      (getUserByEmailModel as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (createToken as jest.Mock).mockReturnValue('mockToken');

      await loginController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Login Exitoso',
        token: 'mockToken',
        user: mockUser
      });
    });

    it('should return error when required fields are missing', async () => {
      mockRequest = createMockRequest({
        body: {
          userEmail: 'juan@example.com'
          // userPassword faltante
        }
      });

      await loginController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Todos los campos deben de ser llenados.'
      });
    });

    it('should return error when email is invalid', async () => {
      (validarEmail as jest.Mock).mockReturnValue(false);

      await loginController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Dirección de correo electrónico no válido.'
      });
    });

    it('should return error when user not found', async () => {
      (validarEmail as jest.Mock).mockReturnValue(true);
      (getUserByEmailModel as jest.Mock).mockResolvedValue(null);

      await loginController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Verifique su dirección de correo electrónico o regístrese si no tiene una cuenta.'
      });
    });

    it('should return error when password is incorrect', async () => {
      const mockUser = {
        id: 'user123',
        name: 'Juan',
        lastName: 'Pérez',
        roll: 'musico',
        userEmail: 'juan@example.com',
        userPassword: 'hashedPassword'
      };

      (validarEmail as jest.Mock).mockReturnValue(true);
      (getUserByEmailModel as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await loginController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Contraseña incorrecta.'
      });
    });
  });

  describe('requestEmailVerificationController', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        body: {
          name: 'Juan',
          lastName: 'Pérez',
          userEmail: 'juan@example.com',
          userPassword: 'Password123!',
          roll: 'musico'
        }
      });
    });

    it('should request email verification successfully', async () => {
      // Mock de validaciones
      (validarEmail as jest.Mock).mockReturnValue(true);
      (validarPassword as jest.Mock).mockReturnValue(true);
      
      // Mock que el usuario no existe
      (getUserByEmailModel as jest.Mock).mockResolvedValue(null);
      (sendEmail as jest.Mock).mockResolvedValue(true);

      await requestEmailVerificationController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Email de verificación enviado exitosamente. Revisa tu bandeja de entrada.',
        data: expect.objectContaining({
          userEmail: 'juan@example.com',
          roll: 'musico',
          expiresIn: '15 minutos'
        })
      });
    });

    it('should return error when email sending fails', async () => {
      // Mock de validaciones
      (validarEmail as jest.Mock).mockReturnValue(true);
      (validarPassword as jest.Mock).mockReturnValue(true);
      
      // Mock que el usuario no existe
      (getUserByEmailModel as jest.Mock).mockResolvedValue(null);
      (sendEmail as jest.Mock).mockRejectedValue(new Error('Email sending failed'));

      await requestEmailVerificationController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor',
        error: 'Email sending failed'
      });
    });

    it('should return error when user already exists', async () => {
      // Mock de validaciones
      (validarEmail as jest.Mock).mockReturnValue(true);
      (validarPassword as jest.Mock).mockReturnValue(true);
      
      // Mock que el usuario ya existe
      (getUserByEmailModel as jest.Mock).mockResolvedValue({
        id: 'user123',
        userEmail: 'juan@example.com'
      });

      await requestEmailVerificationController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
    });
  });

  describe('verifyAndCompleteRegistrationController', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        body: {
          userEmail: 'juan@example.com',
          verificationCode: '123456'
        }
      });
    });

    it('should complete registration successfully', async () => {
      const mockUser = {
        id: 'user123',
        name: 'Juan',
        lastName: 'Pérez',
        roll: 'musico',
        userEmail: 'juan@example.com'
      };

      (registerModel as jest.Mock).mockResolvedValue(mockUser);
      (createToken as jest.Mock).mockReturnValue('mockToken');

      await verifyAndCompleteRegistrationController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Email y código son requeridos'
      });
    });

    it('should return error when verification code is invalid', async () => {
      await verifyAndCompleteRegistrationController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Email y código son requeridos'
      });
    });

    it('should return error when required fields are missing', async () => {
      mockRequest = createMockRequest({
        body: {
          userEmail: 'juan@example.com'
          // verificationCode faltante
        }
      });

      await verifyAndCompleteRegistrationController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Email y código son requeridos'
      });
    });
  });

  describe('forgotPasswordController', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        body: {
          userEmail: 'juan@example.com'
        }
      });
    });

    it('should send password reset email successfully', async () => {
      // Mock que el usuario existe y es superadmin
      (getUserByEmailModel as jest.Mock).mockResolvedValue({
        id: 'user123',
        userEmail: 'juan@example.com',
        roll: 'superadmin'
      });
      (sendEmail as jest.Mock).mockResolvedValue(true);

      await forgotPasswordController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Código de verificación enviado al email',
        userEmail: 'juan@example.com'
      });
    });

    it('should return error when user is not superadmin', async () => {
      // Mock que el usuario existe pero no es superadmin
      (getUserByEmailModel as jest.Mock).mockResolvedValue({
        id: 'user123',
        userEmail: 'juan@example.com',
        roll: 'usuario'
      });

      await forgotPasswordController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Solo superadmin puede recuperar contraseña'
      });
    });
  });

  describe('verifyCodeController', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        body: {
          userEmail: 'juan@example.com',
          code: '123456'
        }
      });
    });

    it('should return error when user not found', async () => {
      (getUserByEmailModel as jest.Mock).mockResolvedValue(null);

      await verifyCodeController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Usuario no encontrado'
      });
    });

    it('should return error when user is not superadmin', async () => {
      // Mock que el usuario existe pero no es superadmin
      (getUserByEmailModel as jest.Mock).mockResolvedValue({
        id: 'user123',
        userEmail: 'juan@example.com',
        roll: 'usuario'
      });

      await verifyCodeController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Solo superadmin puede recuperar contraseña'
      });
    });

    it('should return error when required fields are missing', async () => {
      mockRequest = createMockRequest({
        body: {
          userEmail: 'juan@example.com'
          // code faltante
        }
      });

      await verifyCodeController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Email y código son requeridos'
      });
    });
  });

  describe('resetPasswordController', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        body: {
          userEmail: 'juan@example.com',
          code: '123456',
          newPassword: 'NewPassword123!'
        }
      });
    });

    it('should return error when user is not superadmin', async () => {
      // Mock que el usuario existe pero no es superadmin
      (getUserByEmailModel as jest.Mock).mockResolvedValue({
        id: 'user123',
        userEmail: 'juan@example.com',
        roll: 'usuario'
      });

      await resetPasswordController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Solo superadmin puede recuperar contraseña'
      });
    });

    it('should return error when required fields are missing', async () => {
      mockRequest = createMockRequest({
        body: {
          userEmail: 'juan@example.com'
          // code y newPassword faltantes
        }
      });

      await resetPasswordController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Email, código y nueva contraseña son requeridos'
      });
    });

    it('should return error when password is invalid', async () => {
      // Mock que el usuario existe y es superadmin
      (getUserByEmailModel as jest.Mock).mockResolvedValue({
        id: 'user123',
        userEmail: 'juan@example.com',
        roll: 'superadmin'
      });
      (validarPassword as jest.Mock).mockReturnValue(false);

      await resetPasswordController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'La contraseña no cumple con los requisitos, debe de contener Mayúsculas, Minúsculas, Números y Carácteres especiales'
      });
    });
  });

  describe('updateUserByEmailController', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        body: {
          name: 'Juan Updated',
          lastName: 'Pérez Updated'
        },
        params: {
          userEmail: 'juan@example.com'
        }
      });
    });

    it('should update user successfully', async () => {
      (updateUserByEmailModel as jest.Mock).mockResolvedValue(false); // false significa éxito

      await updateUserByEmailController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Consulta éxitosa'
      });
    });

    it('should return error when update fails', async () => {
      (updateUserByEmailModel as jest.Mock).mockResolvedValue('Error al actualizar');

      await updateUserByEmailController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Error al actualizar'
      });
    });

    it('should return error when email is missing', async () => {
      mockRequest = createMockRequest({
        body: {
          name: 'Juan Updated',
          lastName: 'Pérez Updated'
        },
        params: {} // Sin userEmail
      });

      await updateUserByEmailController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Error al actualizar el usuario.'
      });
    });
  });

  describe('deleteUserByEmailController', () => {
    beforeEach(() => {
      mockRequest = createMockRequest({
        body: {
          userEmail: 'juan@example.com'
        }
      });
    });

    it('should delete user successfully', async () => {
      (deleteUserByEmailModel as jest.Mock).mockResolvedValue(false); // false significa éxito

      await deleteUserByEmailController(mockRequest as Request, mockResponse as Response);

      // El controlador usa res.json() directamente cuando es exitoso, no res.status(200).json()
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Usuario eliminado correctamente'
      });
    });

    it('should return error when user not found', async () => {
      (deleteUserByEmailModel as jest.Mock).mockResolvedValue('not_found');

      await deleteUserByEmailController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'El usuario no existe o ya fue eliminado'
      });
    });

    it('should return error when email is missing', async () => {
      mockRequest = createMockRequest({
        body: {} // Sin userEmail
      });

      await deleteUserByEmailController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Falta el email'
      });
    });

    it('should return error when model returns "Falta el email"', async () => {
      (deleteUserByEmailModel as jest.Mock).mockResolvedValue('Falta el email');

      await deleteUserByEmailController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Falta el email'
      });
    });

    it('should return error when model returns other error', async () => {
      (deleteUserByEmailModel as jest.Mock).mockResolvedValue('Error de base de datos');

      await deleteUserByEmailController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error de base de datos'
      });
    });
  });
}); 