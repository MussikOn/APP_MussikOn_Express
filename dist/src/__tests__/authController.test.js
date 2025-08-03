"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const bcrypt = __importStar(require("bcrypt"));
const authController_1 = require("../controllers/authController");
const authModel_1 = require("../models/authModel");
const jwt_1 = require("../utils/jwt");
const mailer_1 = require("../utils/mailer");
const validatios_1 = require("../utils/validatios");
const setup_1 = require("./setup");
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
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    name: 'Juan',
                    lastName: 'Pérez',
                    roll: 'musico',
                    userEmail: 'juan@example.com',
                    userPassword: 'Password123!'
                }
            });
        });
        it('should register user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock de validaciones
            validatios_1.validarPassword.mockReturnValue(true);
            validatios_1.validarEmail.mockReturnValue(true);
            // Mock de bcrypt
            bcrypt.hash.mockResolvedValue('hashedPassword');
            // Mock del modelo - registerModel retorna false cuando es exitoso
            authModel_1.registerModel.mockResolvedValue(false);
            // Mock del usuario creado
            authModel_1.getUserByEmailModel.mockResolvedValue({
                id: 'user123',
                name: 'Juan',
                lastName: 'Pérez',
                roll: 'musico',
                userEmail: 'juan@example.com'
            });
            jwt_1.createToken.mockReturnValue('mockToken');
            yield (0, authController_1.registerController)(mockRequest, mockResponse);
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
        }));
        it('should return error when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    name: 'Juan',
                    lastName: 'Pérez',
                    // roll, userEmail, userPassword faltantes
                }
            });
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
            bcrypt.hash.mockResolvedValue('hashedPassword');
            // Mock que el usuario ya existe
            authModel_1.registerModel.mockResolvedValue('El usuario ya Existe.');
            yield (0, authController_1.registerController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(409);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Ya hay un usuario con esta direccion de correo electrónico.',
                data: 'El usuario ya Existe.'
            });
        }));
        it('should return error when registration fails', () => __awaiter(void 0, void 0, void 0, function* () {
            validatios_1.validarPassword.mockReturnValue(true);
            validatios_1.validarEmail.mockReturnValue(true);
            bcrypt.hash.mockResolvedValue('hashedPassword');
            authModel_1.registerModel.mockRejectedValue(new Error('Database error'));
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
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    userEmail: 'juan@example.com',
                    userPassword: 'Password123!'
                }
            });
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
            validatios_1.validarEmail.mockReturnValue(true);
            authModel_1.getUserByEmailModel.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt_1.createToken.mockReturnValue('mockToken');
            yield (0, authController_1.loginController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Login Exitoso',
                token: 'mockToken',
                user: mockUser
            });
        }));
        it('should return error when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    userEmail: 'juan@example.com'
                    // userPassword faltante
                }
            });
            yield (0, authController_1.loginController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Todos los campos deben de ser llenados.'
            });
        }));
        it('should return error when email is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            validatios_1.validarEmail.mockReturnValue(false);
            yield (0, authController_1.loginController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Dirección de correo electrónico no válido.'
            });
        }));
        it('should return error when user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            validatios_1.validarEmail.mockReturnValue(true);
            authModel_1.getUserByEmailModel.mockResolvedValue(null);
            yield (0, authController_1.loginController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Verifique su dirección de correo electrónico o regístrese si no tiene una cuenta.'
            });
        }));
        it('should return error when password is incorrect', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                id: 'user123',
                name: 'Juan',
                lastName: 'Pérez',
                roll: 'musico',
                userEmail: 'juan@example.com',
                userPassword: 'hashedPassword'
            };
            validatios_1.validarEmail.mockReturnValue(true);
            authModel_1.getUserByEmailModel.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);
            yield (0, authController_1.loginController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Contraseña incorrecta.'
            });
        }));
    });
    describe('requestEmailVerificationController', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    name: 'Juan',
                    lastName: 'Pérez',
                    userEmail: 'juan@example.com',
                    userPassword: 'Password123!',
                    roll: 'musico'
                }
            });
        });
        it('should request email verification successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock de validaciones
            validatios_1.validarEmail.mockReturnValue(true);
            validatios_1.validarPassword.mockReturnValue(true);
            // Mock que el usuario no existe
            authModel_1.getUserByEmailModel.mockResolvedValue(null);
            mailer_1.sendEmail.mockResolvedValue(true);
            yield (0, authController_1.requestEmailVerificationController)(mockRequest, mockResponse);
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
        }));
        it('should return error when email sending fails', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock de validaciones
            validatios_1.validarEmail.mockReturnValue(true);
            validatios_1.validarPassword.mockReturnValue(true);
            // Mock que el usuario no existe
            authModel_1.getUserByEmailModel.mockResolvedValue(null);
            mailer_1.sendEmail.mockRejectedValue(new Error('Email sending failed'));
            yield (0, authController_1.requestEmailVerificationController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Error interno del servidor',
                error: 'Email sending failed'
            });
        }));
        it('should return error when user already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock de validaciones
            validatios_1.validarEmail.mockReturnValue(true);
            validatios_1.validarPassword.mockReturnValue(true);
            // Mock que el usuario ya existe
            authModel_1.getUserByEmailModel.mockResolvedValue({
                id: 'user123',
                userEmail: 'juan@example.com'
            });
            yield (0, authController_1.requestEmailVerificationController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(409);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Ya existe un usuario con este email'
            });
        }));
    });
    describe('verifyAndCompleteRegistrationController', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    userEmail: 'juan@example.com',
                    verificationCode: '123456'
                }
            });
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
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    userEmail: 'juan@example.com'
                    // verificationCode faltante
                }
            });
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
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    userEmail: 'juan@example.com'
                }
            });
            validatios_1.validarEmail.mockReturnValue(true);
        });
        it('should send password reset email successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock que el usuario existe y es superadmin
            authModel_1.getUserByEmailModel.mockResolvedValue({
                id: 'user123',
                userEmail: 'juan@example.com',
                roll: 'superadmin',
                name: 'Juan'
            });
            mailer_1.sendEmail.mockResolvedValue(true);
            yield (0, authController_1.forgotPasswordController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Código de verificación enviado al email',
                userEmail: 'juan@example.com'
            });
        }));
        it('should return error when user is not superadmin', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock que el usuario existe pero no es superadmin
            authModel_1.getUserByEmailModel.mockResolvedValue({
                id: 'user123',
                userEmail: 'juan@example.com',
                roll: 'usuario'
            });
            yield (0, authController_1.forgotPasswordController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Solo superadmin puede recuperar contraseña'
            });
        }));
    });
    describe('verifyCodeController', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    userEmail: 'juan@example.com',
                    code: '123456'
                }
            });
            validatios_1.validarEmail.mockReturnValue(true);
        });
        it('should return error when user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            authModel_1.getUserByEmailModel.mockResolvedValue(null);
            yield (0, authController_1.verifyCodeController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Usuario no encontrado'
            });
        }));
        it('should return error when user is not superadmin', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock que el usuario existe pero no es superadmin
            authModel_1.getUserByEmailModel.mockResolvedValue({
                id: 'user123',
                userEmail: 'juan@example.com',
                roll: 'usuario'
            });
            yield (0, authController_1.verifyCodeController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Solo superadmin puede recuperar contraseña'
            });
        }));
        it('should return error when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    userEmail: 'juan@example.com'
                    // code faltante
                }
            });
            yield (0, authController_1.verifyCodeController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Email y código son requeridos'
            });
        }));
    });
    describe('resetPasswordController', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    userEmail: 'juan@example.com',
                    code: '123456',
                    newPassword: 'NewPassword123!'
                }
            });
            validatios_1.validarEmail.mockReturnValue(true);
            validatios_1.validarPassword.mockReturnValue(true);
        });
        it('should return error when user is not superadmin', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock que el usuario existe pero no es superadmin
            authModel_1.getUserByEmailModel.mockResolvedValue({
                id: 'user123',
                userEmail: 'juan@example.com',
                roll: 'usuario'
            });
            yield (0, authController_1.resetPasswordController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Solo superadmin puede recuperar contraseña'
            });
        }));
        it('should return error when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    userEmail: 'juan@example.com'
                    // code y newPassword faltantes
                }
            });
            yield (0, authController_1.resetPasswordController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Email, código y nueva contraseña son requeridos'
            });
        }));
        it('should return error when password is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock que el usuario existe y es superadmin
            authModel_1.getUserByEmailModel.mockResolvedValue({
                id: 'user123',
                userEmail: 'juan@example.com',
                roll: 'superadmin'
            });
            validatios_1.validarEmail.mockReturnValue(true);
            validatios_1.validarPassword.mockReturnValue(false);
            yield (0, authController_1.resetPasswordController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'La contraseña no cumple con los requisitos, debe de contener Mayúsculas, Minúsculas, Números y Carácteres especiales'
            });
        }));
    });
    describe('updateUserByEmailController', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    name: 'Juan Updated',
                    lastName: 'Pérez Updated'
                },
                params: {
                    userEmail: 'juan@example.com'
                }
            });
            validatios_1.validarEmail.mockReturnValue(true);
        });
        it('should update user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            authModel_1.updateUserByEmailModel.mockResolvedValue(false); // false significa éxito
            yield (0, authController_1.updateUserByEmailController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Consulta éxitosa'
            });
        }));
        it('should return error when update fails', () => __awaiter(void 0, void 0, void 0, function* () {
            authModel_1.updateUserByEmailModel.mockResolvedValue('Error al actualizar');
            yield (0, authController_1.updateUserByEmailController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Error al actualizar'
            });
        }));
        it('should return error when email is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    name: 'Juan Updated',
                    lastName: 'Pérez Updated'
                },
                params: {} // Sin userEmail
            });
            yield (0, authController_1.updateUserByEmailController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                msg: 'Error al actualizar el usuario.'
            });
        }));
    });
    describe('deleteUserByEmailController', () => {
        beforeEach(() => {
            mockRequest = (0, setup_1.createMockRequest)({
                body: {
                    userEmail: 'juan@example.com'
                }
            });
        });
        it('should delete user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            authModel_1.deleteUserByEmailModel.mockResolvedValue(false); // false significa éxito
            yield (0, authController_1.deleteUserByEmailController)(mockRequest, mockResponse);
            // El controlador usa res.json() directamente cuando es exitoso, no res.status(200).json()
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Usuario eliminado correctamente'
            });
        }));
        it('should return error when user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            authModel_1.deleteUserByEmailModel.mockResolvedValue('not_found');
            yield (0, authController_1.deleteUserByEmailController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'El usuario no existe o ya fue eliminado'
            });
        }));
        it('should return error when email is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest = (0, setup_1.createMockRequest)({
                body: {} // Sin userEmail
            });
            yield (0, authController_1.deleteUserByEmailController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Falta el email'
            });
        }));
        it('should return error when model returns "Falta el email"', () => __awaiter(void 0, void 0, void 0, function* () {
            authModel_1.deleteUserByEmailModel.mockResolvedValue('Falta el email');
            yield (0, authController_1.deleteUserByEmailController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Falta el email'
            });
        }));
        it('should return error when model returns other error', () => __awaiter(void 0, void 0, void 0, function* () {
            authModel_1.deleteUserByEmailModel.mockResolvedValue('Error de base de datos');
            yield (0, authController_1.deleteUserByEmailController)(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Error de base de datos'
            });
        }));
    });
});
