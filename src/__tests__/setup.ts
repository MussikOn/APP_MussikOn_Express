// Jest setup file for MussikOn API tests
import dotenv from 'dotenv';
import { logger } from '../services/loggerService';

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

// Global test setup
beforeAll(() => {
  // Setup any global test configuration
  logger.info('Setting up test environment...', { context: 'TestSetup' });
  
  // Mock console methods to reduce noise in tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  // Cleanup after all tests
  logger.info('Cleaning up test environment...', { context: 'TestSetup' });
  
  // Restore console methods
  jest.restoreAllMocks();
});

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