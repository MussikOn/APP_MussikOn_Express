"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockErrorHandler = exports.mockAuthMiddleware = exports.createMockResponse = exports.createMockRequest = void 0;
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
// Global test setup
beforeAll(() => {
    // Setup any global test configuration
    loggerService_1.logger.info('Setting up test environment...', { context: 'TestSetup' });
    // Mock console methods to reduce noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'info').mockImplementation(() => { });
    jest.spyOn(console, 'warn').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
});
afterAll(() => {
    // Cleanup after all tests
    loggerService_1.logger.info('Cleaning up test environment...', { context: 'TestSetup' });
    // Restore console methods
    jest.restoreAllMocks();
});
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
