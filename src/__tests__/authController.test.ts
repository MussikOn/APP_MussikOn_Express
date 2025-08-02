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
      mockRequest = {
        body: {
          name: 'Juan',
          lastName: 'Pérez',
          roll: 'musico',
          userEmail: 'juan@example.com',
          userPassword: 'Password123!'
        }
      };
    });

    it('should register user successfully', async () => {
      // Mock de validaciones
      (validarPassword as jest.Mock).mockReturnValue(true);
      (validarEmail as jest.Mock).mockReturnValue(true);
      
      // Mock de bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      
      // Mock del modelo
      (registerModel as jest.Mock).mockResolvedValue({
        id: 'user123',
        name: 'Juan',
        lastName: 'Pérez',
        roll: 'musico',
        userEmail: 'juan@example.com'
      });

      await registerController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Usuario registrado exitosamente',
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
      mockRequest.body = {
        name: 'Juan',
        lastName: 'Pérez',
        // roll, userEmail, userPassword faltantes
      };

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
      
      (registerModel as jest.Mock).mockRejectedValue(new Error('User already exists'));

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
      mockRequest = {
        body: {
          userEmail: 'juan@example.com',
          userPassword: 'Password123!'
        }
      };
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

      (getUserByEmailModel as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (createToken as jest.Mock).mockReturnValue('mockToken');

      await loginController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Login Exitoso',
        token: 'mockToken',
        user: expect.objectContaining({
          id: 'user123',
          name: 'Juan',
          lastName: 'Pérez',
          roll: 'musico',
          userEmail: 'juan@example.com',
          userPassword: 'hashedPassword'
        })
      });
    });

    it('should return error when user not found', async () => {
      (getUserByEmailModel as jest.Mock).mockResolvedValue(null);

      await loginController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Usuario no encontrado'
      });
    });

    it('should return error when password is incorrect', async () => {
      const mockUser = {
        id: 'user123',
        userEmail: 'juan@example.com',
        userPassword: 'hashedPassword'
      };

      (getUserByEmailModel as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await loginController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Contraseña incorrecta'
      });
    });

    it('should return error when required fields are missing', async () => {
      mockRequest.body = {
        userEmail: 'juan@example.com'
        // userPassword faltante
      };

      await loginController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Todos los campos deben de ser llenados.'
      });
    });
  });

  describe('requestEmailVerificationController', () => {
    beforeEach(() => {
      mockRequest = {
        body: {
          name: 'Juan',
          lastName: 'Pérez',
          roll: 'musico',
          userEmail: 'juan@example.com',
          userPassword: 'Password123!'
        }
      };
    });

    it('should request email verification successfully', async () => {
      (sendEmail as jest.Mock).mockResolvedValue(true);

      await requestEmailVerificationController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Código de verificación enviado al correo electrónico'
      });
      expect(sendEmail).toHaveBeenCalledWith(
        'juan@example.com',
        expect.stringContaining('Código de Verificación'),
        expect.stringContaining('Tu código de verificación es:')
      );
    });

    it('should return error when required fields are missing', async () => {
      mockRequest.body = {
        name: 'Juan',
        lastName: 'Pérez'
        // roll, userEmail, userPassword faltantes
      };

      await requestEmailVerificationController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Todos los campos son requeridos: name, lastName, userEmail, userPassword, roll'
      });
    });

    it('should return error when email sending fails', async () => {
      (sendEmail as jest.Mock).mockRejectedValue(new Error('Email service error'));

      await requestEmailVerificationController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error al enviar el código de verificación'
      });
    });
  });

  describe('verifyAndCompleteRegistrationController', () => {
    beforeEach(() => {
      mockRequest = {
        body: {
          userEmail: 'juan@example.com',
          verificationCode: '123456'
        }
      };
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
      mockRequest.body = {
        userEmail: 'juan@example.com'
        // verificationCode faltante
      };

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
      mockRequest = {
        body: {
          userEmail: 'juan@example.com'
        }
      };
    });

    it('should send password reset email successfully', async () => {
      const mockUser = {
        id: 'user123',
        userEmail: 'juan@example.com'
      };

      (getUserByEmailModel as jest.Mock).mockResolvedValue(mockUser);
      (sendEmail as jest.Mock).mockResolvedValue(true);

      await forgotPasswordController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Código de recuperación enviado al correo electrónico'
      });
    });

    it('should return error when user not found', async () => {
      (getUserByEmailModel as jest.Mock).mockResolvedValue(null);

      await forgotPasswordController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Usuario no encontrado'
      });
    });

    it('should return error when email is missing', async () => {
      mockRequest.body = {};

      await forgotPasswordController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Email es requerido'
      });
    });
  });

  describe('verifyCodeController', () => {
    beforeEach(() => {
      mockRequest = {
        body: {
          userEmail: 'juan@example.com',
          code: '123456'
        }
      };
    });

    it('should verify code successfully', async () => {
      await verifyCodeController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Código verificado correctamente'
      });
    });

    it('should return error when code is invalid', async () => {
      await verifyCodeController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Código inválido o expirado'
      });
    });

    it('should return error when required fields are missing', async () => {
      mockRequest.body = {
        userEmail: 'juan@example.com'
        // code faltante
      };

      await verifyCodeController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Email y código son requeridos'
      });
    });
  });

  describe('resetPasswordController', () => {
    beforeEach(() => {
      mockRequest = {
        body: {
          userEmail: 'juan@example.com',
          newPassword: 'NewPassword123!'
        }
      };
    });

    it('should reset password successfully', async () => {
      (validarPassword as jest.Mock).mockReturnValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      (updateUserByEmailModel as jest.Mock).mockResolvedValue(true);

      await resetPasswordController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    });

    it('should return error when password is invalid', async () => {
      (validarPassword as jest.Mock).mockReturnValue(false);

      await resetPasswordController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Email, código y nueva contraseña son requeridos'
      });
    });

    it('should return error when required fields are missing', async () => {
      mockRequest.body = {
        userEmail: 'juan@example.com'
        // newPassword faltante
      };

      await resetPasswordController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Email, código y nueva contraseña son requeridos'
      });
    });
  });

  describe('updateUserByEmailController', () => {
    beforeEach(() => {
      mockRequest = {
        body: {
          userEmail: 'juan@example.com',
          name: 'Juan Updated',
          lastName: 'Pérez Updated'
        }
      };
    });

    it('should update user successfully', async () => {
      const mockUpdatedUser = {
        id: 'user123',
        name: 'Juan Updated',
        lastName: 'Pérez Updated',
        userEmail: 'juan@example.com'
      };

      (updateUserByEmailModel as jest.Mock).mockResolvedValue(mockUpdatedUser);

      await updateUserByEmailController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Usuario actualizado exitosamente',
        user: mockUpdatedUser
      });
    });

    it('should return error when user not found', async () => {
      (updateUserByEmailModel as jest.Mock).mockResolvedValue(null);

      await updateUserByEmailController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no encontrado'
      });
    });

    it('should return error when email is missing', async () => {
      mockRequest.body = {
        name: 'Juan Updated'
        // userEmail faltante
      };

      await updateUserByEmailController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Email es requerido'
      });
    });
  });

  describe('deleteUserByEmailController', () => {
    beforeEach(() => {
      mockRequest = {
        body: {
          userEmail: 'juan@example.com'
        }
      };
    });

    it('should delete user successfully', async () => {
      (deleteUserByEmailModel as jest.Mock).mockResolvedValue(true);

      await deleteUserByEmailController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    });

    it('should return error when user not found', async () => {
      (deleteUserByEmailModel as jest.Mock).mockResolvedValue(false);

      await deleteUserByEmailController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no encontrado'
      });
    });

    it('should return error when email is missing', async () => {
      mockRequest.body = {};

      await deleteUserByEmailController(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Falta el email'
      });
    });
  });
}); 