import { Request, Response } from 'express';
import { jest } from '@jest/globals';

// Tipos para los mocks
export interface MockUser {
  userId: string;
  userEmail: string;
  email: string;
  role: string;
  name: string;
}

export interface MockRequestOptions {
  user?: MockUser;
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
  url?: string;
  method?: string;
}

// Función para crear un mock de usuario
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    userId: 'test-user-id',
    userEmail: 'test@example.com',
    email: 'test@example.com',
    role: 'user',
    name: 'Test User',
    ...overrides
  };
}

// Función para crear un mock de request
export function createMockRequest(options: MockRequestOptions = {}): Partial<Request> {
  return {
    user: options.user,
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    url: options.url || '/test',
    method: options.method || 'GET',
    path: options.url || '/test',
    get: jest.fn(),
    header: jest.fn(),
    accepts: jest.fn(),
    acceptsCharsets: jest.fn(),
    acceptsEncodings: jest.fn(),
    acceptsLanguages: jest.fn(),
    range: jest.fn(),
    param: jest.fn(),
    is: jest.fn(),
    protocol: 'http',
    secure: false,
    ip: '127.0.0.1',
    ips: [],
    subdomains: [],
    originalUrl: options.url || '/test',
    baseUrl: ''
  } as Partial<Request>;
}

// Función para crear un mock de response
export function createMockResponse(): Partial<Response> {
  const mockStatus = jest.fn().mockReturnThis();
  const mockJson = jest.fn().mockReturnThis();
  const mockSend = jest.fn().mockReturnThis();
  const mockEnd = jest.fn().mockReturnThis();
  const mockSet = jest.fn().mockReturnThis();
  const mockHeader = jest.fn().mockReturnThis();

  return {
    status: mockStatus,
    json: mockJson,
    send: mockSend,
    end: mockEnd,
    set: mockSet,
    header: mockHeader,
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
    type: jest.fn().mockReturnThis(),
    format: jest.fn().mockReturnThis(),
    attachment: jest.fn().mockReturnThis(),
    links: jest.fn().mockReturnThis(),
    location: jest.fn().mockReturnThis(),
    vary: jest.fn().mockReturnThis(),
    render: jest.fn().mockReturnThis(),
    locals: {}
  } as Partial<Response>;
}

// Función para limpiar mocks
export function cleanupMocks(): void {
  jest.clearAllMocks();
}

// Función para crear mock de Firebase
export function createFirebaseMock() {
  return {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      get: jest.fn(),
      add: jest.fn(),
      onSnapshot: jest.fn()
    })
  };
}

// Función para crear mock de servicio
export function createServiceMock() {
  return {
    method1: jest.fn(),
    method2: jest.fn(),
    method3: jest.fn()
  };
}

// Función para simular error
export function simulateError(error: Error): never {
  throw error;
}

// Función para crear token de test
export function createTestToken(payload: any = {}): string {
  return `test-token-${JSON.stringify(payload)}`;
}

// Función para validar estructura de respuesta
export function validateResponseStructure(response: any, expectedKeys: string[]): void {
  expect(response).toHaveProperty('success');
  expectedKeys.forEach(key => {
    expect(response).toHaveProperty(key);
  });
}

// Función para validar paginación
export function validatePagination(response: any): void {
  expect(response.pagination).toHaveProperty('page');
  expect(response.pagination).toHaveProperty('limit');
  expect(response.pagination).toHaveProperty('total');
  expect(response.pagination).toHaveProperty('pages');
}

// Función para validar ordenamiento
export function validateSorting(items: any[], sortField: string, sortOrder: 'asc' | 'desc' = 'asc'): void {
  for (let i = 1; i < items.length; i++) {
    const prev = items[i - 1][sortField];
    const curr = items[i][sortField];
    
    if (sortOrder === 'asc') {
      expect(prev <= curr).toBe(true);
    } else {
      expect(prev >= curr).toBe(true);
    }
  }
}

// Factory para crear datos de test
export function createTestData<T>(factory: () => T, count: number = 1): T[] {
  return Array.from({ length: count }, factory);
}

// Función para esperar respuesta exitosa
export function expectSuccessResponse(response: Partial<Response>, statusCode: number = 200): void {
  expect(response.status).toHaveBeenCalledWith(statusCode);
  expect(response.json).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true
    })
  );
}

// Función para esperar respuesta de error
export function expectErrorResponse(response: Partial<Response>, statusCode: number, message?: string): void {
  expect(response.status).toHaveBeenCalledWith(statusCode);
  const jsonCall = (response.json as jest.Mock).mock.calls[0]?.[0] as any;
  expect(jsonCall).toHaveProperty('success', false);
  if (message && jsonCall) {
    expect(jsonCall.message).toContain(message);
  }
} 