# 🧪 Testing - MussikOn API

## 📋 Índice

- [Descripción General](#descripción-general)
- [Tests Unitarios](#tests-unitarios)
- [Tests de Integración](#tests-de-integración)
- [Tests de API](#tests-de-api)
- [Tests de Rendimiento](#tests-de-rendimiento)

## 🎯 Descripción General

El Sistema de Testing de MussikOn implementa una estrategia completa de pruebas para garantizar la calidad, confiabilidad y rendimiento de la API.

### Características Principales

- **Tests Unitarios**: Pruebas de funciones individuales
- **Tests de Integración**: Pruebas de interacción entre componentes
- **Tests de API**: Pruebas de endpoints completos
- **Tests de Rendimiento**: Pruebas de carga y estrés
- **Cobertura Automática**: Reportes de cobertura de código

## 🔬 Tests Unitarios

### Configuración de Jest

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts']
};
```

### Ejemplo de Test Unitario

```typescript
// __tests__/services/userService.test.ts
import { UserService } from '../../services/userService';
import { UserModel } from '../../models/userModel';

// Mock del modelo
jest.mock('../../models/userModel');

describe('UserService', () => {
  let userService: UserService;
  let mockUserModel: jest.Mocked<UserModel>;

  beforeEach(() => {
    mockUserModel = new UserModel() as jest.Mocked<UserModel>;
    userService = new UserService(mockUserModel);
  });

  describe('getUserById', () => {
    it('should return user when valid ID is provided', async () => {
      // Arrange
      const userId = 'user_123';
      const expectedUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User'
      };
      
      mockUserModel.findById.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 'nonexistent_user';
      mockUserModel.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById(userId))
        .rejects
        .toThrow('Usuario no encontrado');
    });
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User'
      };
      
      const expectedUser = {
        id: 'user_456',
        ...userData,
        createdAt: new Date()
      };
      
      mockUserModel.create.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserModel.create).toHaveBeenCalledWith(userData);
    });

    it('should validate email format', async () => {
      // Arrange
      const invalidUserData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      };

      // Act & Assert
      await expect(userService.createUser(invalidUserData))
        .rejects
        .toThrow('Email inválido');
    });
  });
});
```

## 🔗 Tests de Integración

### Configuración de Tests de Integración

```typescript
// __tests__/integration/setup.ts
import { admin } from '../../utils/firebase';

beforeAll(async () => {
  // Configurar Firebase para testing
  process.env.FIREBASE_PROJECT_ID = 'mussikon-test';
});

afterEach(async () => {
  // Limpiar datos después de cada test
  await cleanupTestData();
});

afterAll(async () => {
  // Limpiar recursos
  await admin.app().delete();
});

async function cleanupTestData() {
  const collections = ['users', 'musicians', 'events', 'payments'];
  
  for (const collection of collections) {
    const snapshot = await admin.firestore()
      .collection(collection)
      .where('_test', '==', true)
      .get();
    
    const batch = admin.firestore().batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }
}
```

### Test de Integración Completo

```typescript
// __tests__/integration/userWorkflow.test.ts
import request from 'supertest';
import { app } from '../../index';
import { createTestUser, createTestMusician } from '../utils/testHelpers';

describe('User Workflow Integration', () => {
  let testUser: any;
  let testMusician: any;
  let authToken: string;

  beforeEach(async () => {
    // Crear datos de prueba
    testUser = await createTestUser();
    testMusician = await createTestMusician();
    
    // Autenticar usuario
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'password123'
      });
    
    authToken = loginResponse.body.token;
  });

  describe('Complete User Journey', () => {
    it('should allow user to search, hire, and pay musician', async () => {
      // 1. Buscar músicos
      const searchResponse = await request(app)
        .get('/api/musicians/search')
        .query({ genres: ['jazz'], location: 'New York' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(searchResponse.body.musicians).toHaveLength(1);
      expect(searchResponse.body.musicians[0].id).toBe(testMusician.id);

      // 2. Crear evento
      const eventData = {
        title: 'Jazz Night',
        date: '2024-12-25',
        startTime: '20:00',
        endTime: '23:00',
        location: {
          venue: 'Jazz Club',
          address: '123 Jazz St, New York'
        }
      };

      const eventResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(201);

      const eventId = eventResponse.body.id;

      // 3. Contratar músico
      const hiringResponse = await request(app)
        .post(`/api/events/${eventId}/hire`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          musicianId: testMusician.id,
          amount: 300
        })
        .expect(200);

      // 4. Procesar pago
      const paymentResponse = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hiringId: hiringResponse.body.id,
          paymentMethod: 'card',
          cardToken: 'tok_visa'
        })
        .expect(200);

      expect(paymentResponse.body.status).toBe('completed');

      // 5. Verificar estado del evento
      const eventStatusResponse = await request(app)
        .get(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(eventStatusResponse.body.status).toBe('confirmed');
      expect(eventStatusResponse.body.musicians).toHaveLength(1);
    });
  });
});
```

## 🌐 Tests de API

### Tests de Endpoints

```typescript
// __tests__/api/auth.test.ts
import request from 'supertest';
import { app } from '../../index';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.firstName).toBe(userData.firstName);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123' // Too short
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toHaveLength(2);
    });

    it('should prevent duplicate email registration', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      // Primera registración
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Segunda registración con mismo email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error).toContain('Email ya registrado');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(credentials.email);
    });

    it('should reject invalid credentials', async () => {
      const invalidCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidCredentials)
        .expect(401);

      expect(response.body.error).toContain('Credenciales inválidas');
    });
  });
});
```

### Tests de Middleware

```typescript
// __tests__/middleware/authMiddleware.test.ts
import request from 'supertest';
import { app } from '../../index';

describe('Auth Middleware', () => {
  describe('Protected Routes', () => {
    it('should allow access with valid token', async () => {
      // Obtener token válido
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      const token = loginResponse.body.token;

      // Acceder a ruta protegida
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('email');
    });

    it('should reject access without token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.error).toContain('Token no proporcionado');
    });

    it('should reject access with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.error).toContain('Token inválido');
    });
  });

  describe('Role-based Access', () => {
    it('should allow admin access to admin routes', async () => {
      // Login como admin
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@mussikon.com',
          password: 'admin123'
        });

      const adminToken = adminLogin.body.token;

      // Acceder a ruta de admin
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
    });

    it('should reject non-admin access to admin routes', async () => {
      // Login como usuario regular
      const userLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'Password123!'
        });

      const userToken = userLogin.body.token;

      // Intentar acceder a ruta de admin
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.error).toContain('Acceso denegado');
    });
  });
});
```

## ⚡ Tests de Rendimiento

### Tests de Carga

```typescript
// __tests__/performance/loadTest.test.ts
import autocannon from 'autocannon';

describe('Performance Tests', () => {
  describe('API Load Testing', () => {
    it('should handle 100 concurrent users', async () => {
      const result = await autocannon({
        url: 'http://localhost:10000/api/musicians/search',
        connections: 100,
        duration: 10,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(result.errors).toBe(0);
      expect(result.timeouts).toBe(0);
      expect(result.latency.p99).toBeLessThan(1000); // 99% bajo 1 segundo
      expect(result.requests.average).toBeGreaterThan(100); // Más de 100 req/s
    });

    it('should handle database queries efficiently', async () => {
      const result = await autocannon({
        url: 'http://localhost:10000/api/musicians/search?genres=jazz&location=New%20York',
        connections: 50,
        duration: 30,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(result.errors).toBe(0);
      expect(result.latency.p95).toBeLessThan(500); // 95% bajo 500ms
    });
  });

  describe('Database Performance', () => {
    it('should handle concurrent writes', async () => {
      const promises = [];
      
      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .post('/api/users')
            .send({
              email: `user${i}@test.com`,
              password: 'Password123!',
              firstName: `User${i}`,
              lastName: 'Test'
            })
        );
      }

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();

      const successCount = results.filter(r => r.status === 201).length;
      const totalTime = endTime - startTime;

      expect(successCount).toBe(100);
      expect(totalTime).toBeLessThan(10000); // Menos de 10 segundos
    });
  });
});
```

### Tests de Estrés

```typescript
// __tests__/performance/stressTest.test.ts
describe('Stress Tests', () => {
  it('should handle high load gracefully', async () => {
    const result = await autocannon({
      url: 'http://localhost:10000/api/musicians/search',
      connections: 1000,
      duration: 60,
      pipelining: 10,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Verificar que el sistema no se cae
    expect(result.errors).toBeLessThan(10); // Menos del 1% de errores
    expect(result.timeouts).toBeLessThan(5); // Pocos timeouts
    
    // Verificar degradación graceful
    expect(result.latency.p99).toBeLessThan(5000); // 99% bajo 5 segundos
  });

  it('should recover after high load', async () => {
    // Aplicar carga alta
    await autocannon({
      url: 'http://localhost:10000/api/musicians/search',
      connections: 500,
      duration: 30
    });

    // Esperar recuperación
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verificar rendimiento normal
    const result = await autocannon({
      url: 'http://localhost:10000/api/musicians/search',
      connections: 10,
      duration: 10
    });

    expect(result.latency.p99).toBeLessThan(1000);
    expect(result.errors).toBe(0);
  });
});
```

---

**Anterior**: [Integración Móvil](../mobile-integration/README.md)  
**Siguiente**: [Troubleshooting](../troubleshooting/README.md) 