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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIdFormat = exports.validateEmailFormat = exports.createLoggerMock = exports.validateSafeString = exports.delay = exports.createFirebaseMock = exports.validateRequiredProperties = exports.createParameterizedTest = exports.createTestData = exports.validateControllerErrorHandling = exports.setupControllerTest = exports.validateServiceCall = exports.createMockError = exports.resetAllMocks = exports.validateMockCall = exports.createMockFile = exports.createValidPaymentData = exports.createMockRating = exports.createValidRatingData = exports.validateSuccessResponse = exports.validateErrorResponse = exports.validateApiResponse = exports.createMockRequest = exports.createMockResponse = exports.createMockUser = void 0;
/**
 * Crea un usuario mock válido con opciones de personalización
 */
const createMockUser = (overrides = {}) => (Object.assign({ id: 'user123', userId: 'user123', userEmail: 'user@example.com', email: 'user@example.com', role: 'user', name: 'Test User' }, overrides));
exports.createMockUser = createMockUser;
/**
 * Crea una respuesta mock con métodos encadenables
 */
const createMockResponse = () => {
    const mockStatus = jest.fn().mockReturnThis();
    const mockJson = jest.fn().mockReturnThis();
    return {
        status: mockStatus,
        json: mockJson
    };
};
exports.createMockResponse = createMockResponse;
/**
 * Crea una request mock con estructura completa
 */
const createMockRequest = (overrides = {}) => (Object.assign({ user: (0, exports.createMockUser)(), body: {}, params: {}, query: {} }, overrides));
exports.createMockRequest = createMockRequest;
/**
 * Valida que una respuesta tenga el formato estándar de la API
 */
const validateApiResponse = (mockJson, expectedSuccess, expectedMessage, expectedData) => {
    const calls = mockJson.mock.calls;
    expect(calls).toHaveLength(1);
    const response = calls[0][0];
    expect(response).toHaveProperty('success', expectedSuccess);
    if (expectedMessage) {
        expect(response).toHaveProperty('message', expectedMessage);
    }
    if (expectedData) {
        expect(response).toHaveProperty('data', expectedData);
    }
    return response;
};
exports.validateApiResponse = validateApiResponse;
/**
 * Valida que una respuesta de error tenga el formato correcto
 */
const validateErrorResponse = (mockStatus, mockJson, expectedStatus, expectedMessage) => {
    expect(mockStatus).toHaveBeenCalledWith(expectedStatus);
    (0, exports.validateApiResponse)(mockJson, false, expectedMessage);
};
exports.validateErrorResponse = validateErrorResponse;
/**
 * Valida que una respuesta de éxito tenga el formato correcto
 */
const validateSuccessResponse = (mockStatus, mockJson, expectedStatus, expectedMessage, expectedData) => {
    expect(mockStatus).toHaveBeenCalledWith(expectedStatus);
    (0, exports.validateApiResponse)(mockJson, true, expectedMessage, expectedData);
};
exports.validateSuccessResponse = validateSuccessResponse;
/**
 * Crea datos de rating válidos con opciones de personalización
 */
const createValidRatingData = (overrides = {}) => (Object.assign({ eventId: 'event123', musicianId: 'musician123', rating: 5, review: 'Excellent performance!', category: 'musician' }, overrides));
exports.createValidRatingData = createValidRatingData;
/**
 * Crea un rating mock completo con opciones de personalización
 */
const createMockRating = (overrides = {}) => (Object.assign({ id: 'rating123', eventId: 'event123', musicianId: 'musician123', eventCreatorId: 'user123', rating: 5, review: 'Excellent performance!', category: 'musician', isVerified: false, createdAt: new Date(), updatedAt: new Date(), helpfulCount: 0, reportedCount: 0, isActive: true }, overrides));
exports.createMockRating = createMockRating;
/**
 * Crea datos de pago válidos con opciones de personalización
 */
const createValidPaymentData = (overrides = {}) => (Object.assign({ amount: 1000, currency: 'RD$', description: 'Test payment' }, overrides));
exports.createValidPaymentData = createValidPaymentData;
/**
 * Crea un archivo mock para uploads
 */
const createMockFile = (overrides = {}) => (Object.assign({ fieldname: 'file', originalname: 'test.jpg', encoding: '7bit', mimetype: 'image/jpeg', buffer: Buffer.from('test file content'), size: 1024, stream: {}, destination: '', filename: 'test.jpg', path: '' }, overrides));
exports.createMockFile = createMockFile;
/**
 * Valida que un mock haya sido llamado con los parámetros correctos
 */
const validateMockCall = (mock, expectedCallCount = 1, expectedParams) => {
    expect(mock).toHaveBeenCalledTimes(expectedCallCount);
    if (expectedParams) {
        expect(mock).toHaveBeenCalledWith(expectedParams);
    }
};
exports.validateMockCall = validateMockCall;
/**
 * Limpia todos los mocks y restaura su estado original
 */
const resetAllMocks = () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
};
exports.resetAllMocks = resetAllMocks;
/**
 * Crea un error mock con propiedades personalizables
 */
const createMockError = (message, name, code) => {
    const error = new Error(message);
    if (name)
        error.name = name;
    if (code)
        error.code = code;
    return error;
};
exports.createMockError = createMockError;
/**
 * Valida que un servicio haya sido llamado correctamente
 */
const validateServiceCall = (serviceMock, expectedMethod, expectedParams) => {
    expect(serviceMock).toHaveBeenCalled();
    if (expectedParams) {
        expect(serviceMock).toHaveBeenCalledWith(expectedParams);
    }
};
exports.validateServiceCall = validateServiceCall;
/**
 * Crea un setup común para tests de controladores
 */
const setupControllerTest = () => {
    const mockResponse = (0, exports.createMockResponse)();
    const mockRequest = (0, exports.createMockRequest)();
    return {
        mockRequest,
        mockResponse,
        mockStatus: mockResponse.status,
        mockJson: mockResponse.json
    };
};
exports.setupControllerTest = setupControllerTest;
/**
 * Valida que un controlador maneje correctamente los errores
 */
const validateControllerErrorHandling = (controllerMethod_1, mockRequest_1, mockResponse_1, serviceMock_1, errorToThrow_1, ...args_1) => __awaiter(void 0, [controllerMethod_1, mockRequest_1, mockResponse_1, serviceMock_1, errorToThrow_1, ...args_1], void 0, function* (controllerMethod, mockRequest, mockResponse, serviceMock, errorToThrow, expectedStatus = 500) {
    serviceMock.mockRejectedValue(errorToThrow);
    yield controllerMethod(mockRequest, mockResponse);
    (0, exports.validateErrorResponse)(mockResponse.status, mockResponse.json, expectedStatus, errorToThrow.message);
});
exports.validateControllerErrorHandling = validateControllerErrorHandling;
/**
 * Crea datos de prueba para diferentes escenarios
 */
exports.createTestData = {
    // Datos para tests de autenticación
    auth: {
        validUser: (0, exports.createMockUser)(),
        adminUser: (0, exports.createMockUser)({ role: 'admin' }),
        seniorAdminUser: (0, exports.createMockUser)({ role: 'adminSenior' }),
        unauthenticatedUser: undefined
    },
    // Datos para tests de rating
    rating: {
        validData: (0, exports.createValidRatingData)(),
        invalidRating: (0, exports.createValidRatingData)({ rating: 6 }),
        invalidCategory: (0, exports.createValidRatingData)({ category: 'invalid' }),
        emptyFields: (0, exports.createValidRatingData)({ eventId: '', musicianId: '' })
    },
    // Datos para tests de pago
    payment: {
        validData: (0, exports.createValidPaymentData)(),
        invalidAmount: (0, exports.createValidPaymentData)({ amount: -100 }),
        invalidCurrency: (0, exports.createValidPaymentData)({ currency: 'INVALID' })
    },
    // Datos para tests de archivos
    file: {
        validImage: (0, exports.createMockFile)(),
        invalidFile: (0, exports.createMockFile)({ mimetype: 'text/plain' }),
        largeFile: (0, exports.createMockFile)({ size: 10 * 1024 * 1024 }) // 10MB
    }
};
/**
 * Utilidad para crear tests parametrizados
 */
const createParameterizedTest = (testCases, testFunction) => {
    testCases.forEach(({ description, input, expected }) => {
        it(description, () => testFunction(input, expected));
    });
};
exports.createParameterizedTest = createParameterizedTest;
/**
 * Valida que un objeto tenga todas las propiedades requeridas
 */
const validateRequiredProperties = (obj, requiredProps) => {
    requiredProps.forEach(prop => {
        expect(obj).toHaveProperty(prop);
    });
};
exports.validateRequiredProperties = validateRequiredProperties;
/**
 * Crea un mock de Firebase más realista
 */
const createFirebaseMock = () => ({
    collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
                exists: true,
                data: jest.fn().mockReturnValue({})
            }),
            set: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue({})
        }),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
            docs: [],
            size: 0
        }),
        add: jest.fn().mockResolvedValue({
            id: 'generated-id'
        })
    })
});
exports.createFirebaseMock = createFirebaseMock;
/**
 * Utilidad para simular delays en tests
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.delay = delay;
/**
 * Valida que un string no contenga caracteres peligrosos
 */
const validateSafeString = (str) => {
    const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS scripts
        /javascript:/gi, // JavaScript protocol
        /on\w+\s*=/gi, // Event handlers
        /data:text\/html/gi, // Data URLs
        /vbscript:/gi, // VBScript
        /expression\s*\(/gi, // CSS expressions
    ];
    return !dangerousPatterns.some(pattern => pattern.test(str));
};
exports.validateSafeString = validateSafeString;
/**
 * Crea un mock de logger
 */
const createLoggerMock = () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
});
exports.createLoggerMock = createLoggerMock;
/**
 * Valida que un email tenga formato válido
 */
const validateEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmailFormat = validateEmailFormat;
/**
 * Valida que un ID tenga formato válido
 */
const validateIdFormat = (id) => {
    // Asumiendo que los IDs son alfanuméricos y tienen entre 3 y 50 caracteres
    const idRegex = /^[a-zA-Z0-9_-]{3,50}$/;
    return idRegex.test(id);
};
exports.validateIdFormat = validateIdFormat;
