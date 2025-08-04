"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockUser = createMockUser;
exports.createMockRequest = createMockRequest;
exports.createMockResponse = createMockResponse;
exports.cleanupMocks = cleanupMocks;
exports.createFirebaseMock = createFirebaseMock;
exports.createServiceMock = createServiceMock;
exports.simulateError = simulateError;
exports.createTestToken = createTestToken;
exports.validateResponseStructure = validateResponseStructure;
exports.validatePagination = validatePagination;
exports.validateSorting = validateSorting;
exports.createTestData = createTestData;
exports.expectSuccessResponse = expectSuccessResponse;
exports.expectErrorResponse = expectErrorResponse;
const globals_1 = require("@jest/globals");
// Función para crear un mock de usuario
function createMockUser(overrides = {}) {
    return Object.assign({ userId: 'test-user-id', userEmail: 'test@example.com', email: 'test@example.com', role: 'user', name: 'Test User' }, overrides);
}
// Función para crear un mock de request
function createMockRequest(options = {}) {
    return {
        user: options.user,
        body: options.body || {},
        params: options.params || {},
        query: options.query || {},
        headers: options.headers || {},
        url: options.url || '/test',
        method: options.method || 'GET',
        path: options.url || '/test',
        get: globals_1.jest.fn(),
        header: globals_1.jest.fn(),
        accepts: globals_1.jest.fn(),
        acceptsCharsets: globals_1.jest.fn(),
        acceptsEncodings: globals_1.jest.fn(),
        acceptsLanguages: globals_1.jest.fn(),
        range: globals_1.jest.fn(),
        param: globals_1.jest.fn(),
        is: globals_1.jest.fn(),
        protocol: 'http',
        secure: false,
        ip: '127.0.0.1',
        ips: [],
        subdomains: [],
        originalUrl: options.url || '/test',
        baseUrl: ''
    };
}
// Función para crear un mock de response
function createMockResponse() {
    const mockStatus = globals_1.jest.fn().mockReturnThis();
    const mockJson = globals_1.jest.fn().mockReturnThis();
    const mockSend = globals_1.jest.fn().mockReturnThis();
    const mockEnd = globals_1.jest.fn().mockReturnThis();
    const mockSet = globals_1.jest.fn().mockReturnThis();
    const mockHeader = globals_1.jest.fn().mockReturnThis();
    return {
        status: mockStatus,
        json: mockJson,
        send: mockSend,
        end: mockEnd,
        set: mockSet,
        header: mockHeader,
        cookie: globals_1.jest.fn().mockReturnThis(),
        clearCookie: globals_1.jest.fn().mockReturnThis(),
        redirect: globals_1.jest.fn().mockReturnThis(),
        sendStatus: globals_1.jest.fn().mockReturnThis(),
        type: globals_1.jest.fn().mockReturnThis(),
        format: globals_1.jest.fn().mockReturnThis(),
        attachment: globals_1.jest.fn().mockReturnThis(),
        links: globals_1.jest.fn().mockReturnThis(),
        location: globals_1.jest.fn().mockReturnThis(),
        vary: globals_1.jest.fn().mockReturnThis(),
        render: globals_1.jest.fn().mockReturnThis(),
        locals: {}
    };
}
// Función para limpiar mocks
function cleanupMocks() {
    globals_1.jest.clearAllMocks();
}
// Función para crear mock de Firebase
function createFirebaseMock() {
    return {
        collection: globals_1.jest.fn().mockReturnValue({
            doc: globals_1.jest.fn().mockReturnValue({
                get: globals_1.jest.fn(),
                set: globals_1.jest.fn(),
                update: globals_1.jest.fn(),
                delete: globals_1.jest.fn()
            }),
            where: globals_1.jest.fn().mockReturnThis(),
            orderBy: globals_1.jest.fn().mockReturnThis(),
            limit: globals_1.jest.fn().mockReturnThis(),
            offset: globals_1.jest.fn().mockReturnThis(),
            get: globals_1.jest.fn(),
            add: globals_1.jest.fn(),
            onSnapshot: globals_1.jest.fn()
        })
    };
}
// Función para crear mock de servicio
function createServiceMock() {
    return {
        method1: globals_1.jest.fn(),
        method2: globals_1.jest.fn(),
        method3: globals_1.jest.fn()
    };
}
// Función para simular error
function simulateError(error) {
    throw error;
}
// Función para crear token de test
function createTestToken(payload = {}) {
    return `test-token-${JSON.stringify(payload)}`;
}
// Función para validar estructura de respuesta
function validateResponseStructure(response, expectedKeys) {
    expect(response).toHaveProperty('success');
    expectedKeys.forEach(key => {
        expect(response).toHaveProperty(key);
    });
}
// Función para validar paginación
function validatePagination(response) {
    expect(response.pagination).toHaveProperty('page');
    expect(response.pagination).toHaveProperty('limit');
    expect(response.pagination).toHaveProperty('total');
    expect(response.pagination).toHaveProperty('pages');
}
// Función para validar ordenamiento
function validateSorting(items, sortField, sortOrder = 'asc') {
    for (let i = 1; i < items.length; i++) {
        const prev = items[i - 1][sortField];
        const curr = items[i][sortField];
        if (sortOrder === 'asc') {
            expect(prev <= curr).toBe(true);
        }
        else {
            expect(prev >= curr).toBe(true);
        }
    }
}
// Factory para crear datos de test
function createTestData(factory, count = 1) {
    return Array.from({ length: count }, factory);
}
// Función para esperar respuesta exitosa
function expectSuccessResponse(response, statusCode = 200) {
    expect(response.status).toHaveBeenCalledWith(statusCode);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true
    }));
}
// Función para esperar respuesta de error
function expectErrorResponse(response, statusCode, message) {
    var _a;
    expect(response.status).toHaveBeenCalledWith(statusCode);
    const jsonCall = (_a = response.json.mock.calls[0]) === null || _a === void 0 ? void 0 : _a[0];
    expect(jsonCall).toHaveProperty('success', false);
    if (message && jsonCall) {
        expect(jsonCall.message).toContain(message);
    }
}
