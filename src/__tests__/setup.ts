// Jest setup file for MussikOn API tests
import dotenv from 'dotenv';
import { logger } from '../services/loggerService';

// Set test environment
process.env.NODE_ENV = 'test';

// Load environment variables for testing
dotenv.config({ path: '.env.test' });

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
logger.info('Setting up test environment...', { context: 'TestSetup' });

// Mock console methods to reduce noise in tests
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'info').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Global test utilities
export const createMockRequest = (overrides: any = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  ...overrides
});

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

// Mock middleware
export const mockAuthMiddleware = (req: any, res: any, next: any) => {
  req.user = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'usuario'
  };
  next();
};

// Mock error handler
export const mockErrorHandler = (err: any, req: any, res: any, next: any) => {
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

// 🆕 UTILIDADES ADICIONALES PARA TESTS MEJORADOS

// Función para limpiar mocks después de cada test
export const cleanupMocks = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
};

// Función para crear un mock de Firebase más realista
export const createFirebaseMock = () => ({
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

// Función para validar respuestas de API
export const validateApiResponse = (response: any, expectedSuccess: boolean, expectedMessage?: string) => {
  expect(response).toHaveProperty('success', expectedSuccess);
  if (expectedMessage) {
    expect(response).toHaveProperty('message', expectedMessage);
  }
};

// Función para crear datos de prueba válidos
export const createTestData = {
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
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Función para validar que un string no contenga caracteres peligrosos
export const validateSafeString = (str: string) => {
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

// Función para validar formato de email
export const validateEmailFormat = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función para validar formato de ID
export const validateIdFormat = (id: string) => {
  const idRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return idRegex.test(id);
}; 