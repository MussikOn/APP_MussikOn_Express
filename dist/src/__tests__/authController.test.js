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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const authController_1 = require("../controllers/authController");
const authModel_1 = require("../models/authModel");
const jwt_1 = require("../utils/jwt");
const mailer_1 = require("../utils/mailer");
const validatios_1 = require("../utils/validatios");
// Mock de todas las dependencias
jest.mock('../models/authModel');
jest.mock('../utils/jwt');
jest.mock('../utils/mailer');
jest.mock('../utils/validatios');
jest.mock('bcrypt');
describe('AuthController', () => {
    let mockRequest;
    let mockResponse;
    let mockJson;
    let mockStatus;
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
        it('should register user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock de validaciones
            validatios_1.validarPassword.mockReturnValue(true);
            validatios_1.validarEmail.mockReturnValue(true);
            // Mock de bcrypt
            bcrypt_1.default.hash.mockResolvedValue('hashedPassword');
            // Mock del modelo
            authModel_1.registerModel.mockResolvedValue({
                id: 'user123',
                name: 'Juan',
                lastName: 'Pérez',
                roll: 'musico',
                userEmail: 'juan@example.com'
            });
            yield (0, authController_1.registerController)(mockRequest, mockResponse);
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
        }));
        it('should return error when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {
                name: 'Juan',
                lastName: 'Pérez',
                // roll, userEmail, userPassword faltantes
            };
            yield (0, authController_1.registerController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Error al registrarse, todos los campos deben de ser llenados'
            });
        }));
        it('should return error when password is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            validatios_1.validarPassword.mockReturnValue(false);
            yield (0, authController_1.registerController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                msg: expect.stringContaining('La contraseña no cumple con los requisitos')
            });
        }));
        it('should return error when email is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            validatios_1.validarPassword.mockReturnValue(true);
            validatios_1.validarEmail.mockReturnValue(false);
            yield (0, authController_1.registerController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Correo Electrónico inválido.'
            });
        }));
        it('should return error when user already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            validatios_1.validarPassword.mockReturnValue(true);
            validatios_1.validarEmail.mockReturnValue(true);
            bcrypt_1.default.hash.mockResolvedValue('hashedPassword');
            authModel_1.registerModel.mockRejectedValue(new Error('User already exists'));
            yield (0, authController_1.registerController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Error al registrarse.',
                error: expect.any(Error)
            });
        }));
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
        it('should login user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                id: 'user123',
                name: 'Juan',
                lastName: 'Pérez',
                roll: 'musico',
                userEmail: 'juan@example.com',
                userPassword: 'hashedPassword'
            };
            authModel_1.getUserByEmailModel.mockResolvedValue(mockUser);
            bcrypt_1.default.compare.mockResolvedValue(true);
            jwt_1.createToken.mockReturnValue('mockToken');
            yield (0, authController_1.loginController)(mockRequest, mockResponse);
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
        }));
        it('should return error when user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            authModel_1.getUserByEmailModel.mockResolvedValue(null);
            yield (0, authController_1.loginController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Usuario no encontrado'
            });
        }));
        it('should return error when password is incorrect', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                id: 'user123',
                userEmail: 'juan@example.com',
                userPassword: 'hashedPassword'
            };
            authModel_1.getUserByEmailModel.mockResolvedValue(mockUser);
            bcrypt_1.default.compare.mockResolvedValue(false);
            yield (0, authController_1.loginController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Contraseña incorrecta'
            });
        }));
        it('should return error when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {
                userEmail: 'juan@example.com'
                // userPassword faltante
            };
            yield (0, authController_1.loginController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Todos los campos deben de ser llenados.'
            });
        }));
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
        it('should request email verification successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mailer_1.sendEmail.mockResolvedValue(true);
            yield (0, authController_1.requestEmailVerificationController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(409);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Código de verificación enviado al correo electrónico'
            });
            expect(mailer_1.sendEmail).toHaveBeenCalledWith('juan@example.com', expect.stringContaining('Código de Verificación'), expect.stringContaining('Tu código de verificación es:'));
        }));
        it('should return error when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {
                name: 'Juan',
                lastName: 'Pérez'
                // roll, userEmail, userPassword faltantes
            };
            yield (0, authController_1.requestEmailVerificationController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Todos los campos son requeridos: name, lastName, userEmail, userPassword, roll'
            });
        }));
        it('should return error when email sending fails', () => __awaiter(void 0, void 0, void 0, function* () {
            mailer_1.sendEmail.mockRejectedValue(new Error('Email service error'));
            yield (0, authController_1.requestEmailVerificationController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(409);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Error al enviar el código de verificación'
            });
        }));
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
        it('should complete registration successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                id: 'user123',
                name: 'Juan',
                lastName: 'Pérez',
                roll: 'musico',
                userEmail: 'juan@example.com'
            };
            authModel_1.registerModel.mockResolvedValue(mockUser);
            jwt_1.createToken.mockReturnValue('mockToken');
            yield (0, authController_1.verifyAndCompleteRegistrationController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Email y código son requeridos'
            });
        }));
        it('should return error when verification code is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, authController_1.verifyAndCompleteRegistrationController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Email y código son requeridos'
            });
        }));
        it('should return error when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {
                userEmail: 'juan@example.com'
                // verificationCode faltante
            };
            yield (0, authController_1.verifyAndCompleteRegistrationController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Email y código son requeridos'
            });
        }));
    });
    describe('forgotPasswordController', () => {
        beforeEach(() => {
            mockRequest = {
                body: {
                    userEmail: 'juan@example.com'
                }
            };
        });
        it('should send password reset email successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                id: 'user123',
                userEmail: 'juan@example.com'
            };
            authModel_1.getUserByEmailModel.mockResolvedValue(mockUser);
            mailer_1.sendEmail.mockResolvedValue(true);
            yield (0, authController_1.forgotPasswordController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Código de recuperación enviado al correo electrónico'
            });
        }));
        it('should return error when user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            authModel_1.getUserByEmailModel.mockResolvedValue(null);
            yield (0, authController_1.forgotPasswordController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Usuario no encontrado'
            });
        }));
        it('should return error when email is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {};
            yield (0, authController_1.forgotPasswordController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Email es requerido'
            });
        }));
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
        it('should verify code successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, authController_1.verifyCodeController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Código verificado correctamente'
            });
        }));
        it('should return error when code is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, authController_1.verifyCodeController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Código inválido o expirado'
            });
        }));
        it('should return error when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {
                userEmail: 'juan@example.com'
                // code faltante
            };
            yield (0, authController_1.verifyCodeController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Email y código son requeridos'
            });
        }));
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
        it('should reset password successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            validatios_1.validarPassword.mockReturnValue(true);
            bcrypt_1.default.hash.mockResolvedValue('newHashedPassword');
            authModel_1.updateUserByEmailModel.mockResolvedValue(true);
            yield (0, authController_1.resetPasswordController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });
        }));
        it('should return error when password is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            validatios_1.validarPassword.mockReturnValue(false);
            yield (0, authController_1.resetPasswordController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Email, código y nueva contraseña son requeridos'
            });
        }));
        it('should return error when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {
                userEmail: 'juan@example.com'
                // newPassword faltante
            };
            yield (0, authController_1.resetPasswordController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Email, código y nueva contraseña son requeridos'
            });
        }));
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
        it('should update user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUpdatedUser = {
                id: 'user123',
                name: 'Juan Updated',
                lastName: 'Pérez Updated',
                userEmail: 'juan@example.com'
            };
            authModel_1.updateUserByEmailModel.mockResolvedValue(mockUpdatedUser);
            yield (0, authController_1.updateUserByEmailController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Usuario actualizado exitosamente',
                user: mockUpdatedUser
            });
        }));
        it('should return error when user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            authModel_1.updateUserByEmailModel.mockResolvedValue(null);
            yield (0, authController_1.updateUserByEmailController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Usuario no encontrado'
            });
        }));
        it('should return error when email is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {
                name: 'Juan Updated'
                // userEmail faltante
            };
            yield (0, authController_1.updateUserByEmailController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Email es requerido'
            });
        }));
    });
    describe('deleteUserByEmailController', () => {
        beforeEach(() => {
            mockRequest = {
                body: {
                    userEmail: 'juan@example.com'
                }
            };
        });
        it('should delete user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            authModel_1.deleteUserByEmailModel.mockResolvedValue(true);
            yield (0, authController_1.deleteUserByEmailController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Usuario eliminado exitosamente'
            });
        }));
        it('should return error when user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            authModel_1.deleteUserByEmailModel.mockResolvedValue(false);
            yield (0, authController_1.deleteUserByEmailController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Usuario no encontrado'
            });
        }));
        it('should return error when email is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {};
            yield (0, authController_1.deleteUserByEmailController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Falta el email'
            });
        }));
    });
});
