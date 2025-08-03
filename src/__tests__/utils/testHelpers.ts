import { Request, Response } from 'express';

// 🆕 UTILIDADES PARA TESTS - Reduce duplicación y mejora mantenibilidad

export interface MockUser {
  id: string;
  userId: string;
  userEmail: string;
  email: string;
  role: string;
  name: string;
}

export interface MockResponse {
  status: jest.Mock;
  json: jest.Mock;
}

export interface MockRequest {
  user?: MockUser;
  body?: any;
  params?: any;
  query?: any;
  file?: any;
  files?: any[];
}

/**
 * Crea un usuario mock válido con opciones de personalización
 */
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: 'user123',
  userId: 'user123',
  userEmail: 'user@example.com',
  email: 'user@example.com',
  role: 'user',
  name: 'Test User',
  ...overrides
});

/**
 * Crea una respuesta mock con métodos encadenables
 */
export const createMockResponse = (): MockResponse => {
  const mockStatus = jest.fn().mockReturnThis();
  const mockJson = jest.fn().mockReturnThis();
  
  return {
    status: mockStatus,
    json: mockJson
  };
};

/**
 * Crea una request mock con estructura completa
 */
export const createMockRequest = (overrides: Partial<MockRequest> = {}): Partial<Request> => ({
  user: createMockUser(),
  body: {},
  params: {},
  query: {},
  ...overrides
});

/**
 * Valida que una respuesta tenga el formato estándar de la API
 */
export const validateApiResponse = (
  mockJson: jest.Mock,
  expectedSuccess: boolean,
  expectedMessage?: string,
  expectedData?: any
) => {
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

/**
 * Valida que una respuesta de error tenga el formato correcto
 */
export const validateErrorResponse = (
  mockStatus: jest.Mock,
  mockJson: jest.Mock,
  expectedStatus: number,
  expectedMessage: string
) => {
  expect(mockStatus).toHaveBeenCalledWith(expectedStatus);
  validateApiResponse(mockJson, false, expectedMessage);
};

/**
 * Valida que una respuesta de éxito tenga el formato correcto
 */
export const validateSuccessResponse = (
  mockStatus: jest.Mock,
  mockJson: jest.Mock,
  expectedStatus: number,
  expectedMessage: string,
  expectedData?: any
) => {
  expect(mockStatus).toHaveBeenCalledWith(expectedStatus);
  validateApiResponse(mockJson, true, expectedMessage, expectedData);
};

/**
 * Crea datos de rating válidos con opciones de personalización
 */
export const createValidRatingData = (overrides: any = {}) => ({
  eventId: 'event123',
  musicianId: 'musician123',
  rating: 5,
  review: 'Excellent performance!',
  category: 'musician' as const,
  ...overrides
});

/**
 * Crea un rating mock completo con opciones de personalización
 */
export const createMockRating = (overrides: any = {}) => ({
  id: 'rating123',
  eventId: 'event123',
  musicianId: 'musician123',
  eventCreatorId: 'user123',
  rating: 5,
  review: 'Excellent performance!',
  category: 'musician' as const,
  isVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  helpfulCount: 0,
  reportedCount: 0,
  isActive: true,
  ...overrides
});

/**
 * Crea datos de pago válidos con opciones de personalización
 */
export const createValidPaymentData = (overrides: any = {}) => ({
  amount: 1000,
  currency: 'RD$',
  description: 'Test payment',
  ...overrides
});

/**
 * Crea un archivo mock para uploads
 */
export const createMockFile = (overrides: any = {}) => ({
  fieldname: 'file',
  originalname: 'test.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('test file content'),
  size: 1024,
  stream: {} as any,
  destination: '',
  filename: 'test.jpg',
  path: '',
  ...overrides
});

/**
 * Valida que un mock haya sido llamado con los parámetros correctos
 */
export const validateMockCall = (
  mock: jest.Mock,
  expectedCallCount: number = 1,
  expectedParams?: any
) => {
  expect(mock).toHaveBeenCalledTimes(expectedCallCount);
  
  if (expectedParams) {
    expect(mock).toHaveBeenCalledWith(expectedParams);
  }
};

/**
 * Limpia todos los mocks y restaura su estado original
 */
export const resetAllMocks = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
};

/**
 * Crea un error mock con propiedades personalizables
 */
export const createMockError = (message: string, name?: string, code?: string) => {
  const error = new Error(message);
  if (name) error.name = name;
  if (code) (error as any).code = code;
  return error;
};

/**
 * Valida que un servicio haya sido llamado correctamente
 */
export const validateServiceCall = (
  serviceMock: jest.Mock,
  expectedMethod: string,
  expectedParams?: any
) => {
  expect(serviceMock).toHaveBeenCalled();
  
  if (expectedParams) {
    expect(serviceMock).toHaveBeenCalledWith(expectedParams);
  }
};

/**
 * Crea un setup común para tests de controladores
 */
export const setupControllerTest = () => {
  const mockResponse = createMockResponse();
  const mockRequest = createMockRequest();
  
  return {
    mockRequest,
    mockResponse,
    mockStatus: mockResponse.status,
    mockJson: mockResponse.json
  };
};

/**
 * Valida que un controlador maneje correctamente los errores
 */
export const validateControllerErrorHandling = async (
  controllerMethod: (req: Request, res: Response) => Promise<void>,
  mockRequest: Partial<Request>,
  mockResponse: Partial<Response>,
  serviceMock: jest.Mock,
  errorToThrow: Error,
  expectedStatus: number = 500
) => {
  serviceMock.mockRejectedValue(errorToThrow);
  
  await controllerMethod(mockRequest as Request, mockResponse as Response);
  
  validateErrorResponse(
    mockResponse.status as jest.Mock,
    mockResponse.json as jest.Mock,
    expectedStatus,
    errorToThrow.message
  );
};

/**
 * Crea datos de prueba para diferentes escenarios
 */
export const createTestData = {
  // Datos para tests de autenticación
  auth: {
    validUser: createMockUser(),
    adminUser: createMockUser({ role: 'admin' }),
    seniorAdminUser: createMockUser({ role: 'adminSenior' }),
    unauthenticatedUser: undefined
  },
  
  // Datos para tests de rating
  rating: {
    validData: createValidRatingData(),
    invalidRating: createValidRatingData({ rating: 6 }),
    invalidCategory: createValidRatingData({ category: 'invalid' }),
    emptyFields: createValidRatingData({ eventId: '', musicianId: '' })
  },
  
  // Datos para tests de pago
  payment: {
    validData: createValidPaymentData(),
    invalidAmount: createValidPaymentData({ amount: -100 }),
    invalidCurrency: createValidPaymentData({ currency: 'INVALID' })
  },
  
  // Datos para tests de archivos
  file: {
    validImage: createMockFile(),
    invalidFile: createMockFile({ mimetype: 'text/plain' }),
    largeFile: createMockFile({ size: 10 * 1024 * 1024 }) // 10MB
  }
};

/**
 * Utilidad para crear tests parametrizados
 */
export const createParameterizedTest = <T>(
  testCases: Array<{ description: string; input: T; expected: any }>,
  testFunction: (input: T, expected: any) => void
) => {
  testCases.forEach(({ description, input, expected }) => {
    it(description, () => testFunction(input, expected));
  });
};

/**
 * Valida que un objeto tenga todas las propiedades requeridas
 */
export const validateRequiredProperties = (obj: any, requiredProps: string[]) => {
  requiredProps.forEach(prop => {
    expect(obj).toHaveProperty(prop);
  });
};

/**
 * Crea un mock de Firebase más realista
 */
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

/**
 * Utilidad para simular delays en tests
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Valida que un string no contenga caracteres peligrosos
 */
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

/**
 * Crea un mock de logger
 */
export const createLoggerMock = () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
});

/**
 * Valida que un email tenga formato válido
 */
export const validateEmailFormat = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida que un ID tenga formato válido
 */
export const validateIdFormat = (id: string) => {
  // Asumiendo que los IDs son alfanuméricos y tienen entre 3 y 50 caracteres
  const idRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return idRegex.test(id);
}; 