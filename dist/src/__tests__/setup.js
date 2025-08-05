"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIdFormat = exports.validateEmailFormat = exports.validateSafeString = exports.delay = exports.createTestData = exports.validateApiResponse = exports.createFirebaseMock = exports.cleanupMocks = exports.mockErrorHandler = exports.mockAuthMiddleware = exports.createMockResponse = exports.createMockRequest = void 0;
// Jest setup file for MussikOn API tests
const dotenv_1 = __importDefault(require("dotenv"));
const loggerService_1 = require("../services/loggerService");
// Load environment variables for testing
dotenv_1.default.config({ path: '.env.test' });
// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
    initializeApp: jest.fn(),
    getApps: jest.fn(() => []),
    getApp: jest.fn(),
    apps: [], // Agregar esta propiedad
    credential: {
        cert: jest.fn()
    },
    auth: jest.fn(() => ({
        verifyIdToken: jest.fn(),
        createCustomToken: jest.fn(),
        getUser: jest.fn(),
        getUserByEmail: jest.fn(),
        listUsers: jest.fn(),
        createUser: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn(),
        setCustomUserClaims: jest.fn()
    })),
    firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn(),
                set: jest.fn(),
                update: jest.fn(),
                delete: jest.fn()
            })),
            where: jest.fn(() => ({
                get: jest.fn(),
                orderBy: jest.fn(() => ({
                    get: jest.fn(),
                    limit: jest.fn(() => ({
                        get: jest.fn()
                    }))
                }))
            })),
            orderBy: jest.fn(() => ({
                get: jest.fn(),
                limit: jest.fn(() => ({
                    get: jest.fn()
                }))
            })),
            limit: jest.fn(() => ({
                get: jest.fn()
            })),
            get: jest.fn()
        }))
    })),
    getFirestore: jest.fn(() => ({
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn(),
                set: jest.fn(),
                update: jest.fn(),
                delete: jest.fn()
            })),
            where: jest.fn(() => ({
                get: jest.fn(),
                orderBy: jest.fn(() => ({
                    get: jest.fn(),
                    limit: jest.fn(() => ({
                        get: jest.fn()
                    }))
                }))
            })),
            orderBy: jest.fn(() => ({
                get: jest.fn(),
                limit: jest.fn(() => ({
                    get: jest.fn()
                }))
            })),
            limit: jest.fn(() => ({
                get: jest.fn()
            })),
            get: jest.fn()
        }))
    }))
}));
// 🆕 CONFIGURACIÓN MEJORADA DEL SETUP
// Setup any global test configuration
loggerService_1.logger.info('Setting up test environment...', { context: 'TestSetup' });
// Mock console methods to reduce noise in tests
jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'info').mockImplementation(() => { });
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });
// Global test utilities
const createMockRequest = (overrides = {}) => (Object.assign({ body: {}, params: {}, query: {}, headers: {}, user: null }, overrides));
exports.createMockRequest = createMockRequest;
const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    return res;
};
exports.createMockResponse = createMockResponse;
// Mock middleware
const mockAuthMiddleware = (req, res, next) => {
    req.user = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'usuario'
    };
    next();
};
exports.mockAuthMiddleware = mockAuthMiddleware;
// Mock error handler
const mockErrorHandler = (err, req, res, next) => {
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
};
exports.mockErrorHandler = mockErrorHandler;
// 🆕 UTILIDADES ADICIONALES PARA TESTS MEJORADOS
// Función para limpiar mocks después de cada test
const cleanupMocks = () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
};
exports.cleanupMocks = cleanupMocks;
// Función para crear un mock de Firebase más realista
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
// Función para validar respuestas de API
const validateApiResponse = (response, expectedSuccess, expectedMessage) => {
    expect(response).toHaveProperty('success', expectedSuccess);
    if (expectedMessage) {
        expect(response).toHaveProperty('message', expectedMessage);
    }
};
exports.validateApiResponse = validateApiResponse;
// Función para crear datos de prueba válidos
exports.createTestData = {
    user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'usuario',
        name: 'Test User'
    },
    rating: {
        eventId: 'event123',
        musicianId: 'musician123',
        rating: 5,
        review: 'Excellent performance!',
        category: 'musician'
    },
    payment: {
        amount: 1000,
        currency: 'RD$',
        description: 'Test payment'
    }
};
// Función para simular delays en tests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.delay = delay;
// Función para validar que un string no contenga caracteres peligrosos
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
// Función para validar formato de email
const validateEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmailFormat = validateEmailFormat;
// Función para validar formato de ID
const validateIdFormat = (id) => {
    const idRegex = /^[a-zA-Z0-9_-]{3,50}$/;
    return idRegex.test(id);
};
exports.validateIdFormat = validateIdFormat;
