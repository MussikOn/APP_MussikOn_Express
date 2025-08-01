# 🧪 Guía de Testing - Sistema de Búsqueda Avanzada de Músicos

## 📋 Resumen

Esta guía detalla las estrategias de testing para el sistema de búsqueda avanzada de músicos, incluyendo tests unitarios, de integración, end-to-end y de performance.

## 🎯 Estrategia de Testing

### **🏗️ Pirámide de Testing**

```
    /\
   /  \     E2E Tests (Pocos, lentos, costosos)
  /____\    
 /      \   Integration Tests (Algunos, medios)
/________\  Unit Tests (Muchos, rápidos, baratos)
```

### **📊 Cobertura Objetivo**

- **Unit Tests**: 90%+ cobertura
- **Integration Tests**: 80%+ cobertura
- **E2E Tests**: 70%+ cobertura
- **Performance Tests**: 100% de endpoints críticos

## 🛠️ Configuración del Entorno de Testing

### **1. Instalar Dependencias**

```bash
# Dependencias de testing
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev supertest @types/supertest
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev cypress
npm install --save-dev artillery
npm install --save-dev faker @types/faker
npm install --save-dev nock
npm install --save-dev testcontainers
```

### **2. Configurar Jest**

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/**/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 30000,
  verbose: true,
};
```

### **3. Configurar Cypress**

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
});
```

### **4. Configurar Artillery (Performance)**

```yaml
# artillery.config.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Ramp up load"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"
  defaults:
    headers:
      Content-Type: 'application/json'
      Authorization: 'Bearer {{ $randomString() }}'
  processor: './artillery/processors.js'
```

## 🧪 Tests Unitarios

### **1. Estructura de Tests Unitarios**

```typescript
// src/__tests__/unit/services/MusicianStatusService.test.ts
import { MusicianStatusService } from '../../../services/musician-status/MusicianStatusService';
import { admin } from '../../../utils/firebase';

// Mock Firebase
jest.mock('../../../utils/firebase', () => ({
  admin: {
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          set: jest.fn(),
          get: jest.fn(),
          update: jest.fn(),
        })),
        where: jest.fn(() => ({
          get: jest.fn(),
        })),
      })),
    })),
  },
}));

describe('MusicianStatusService', () => {
  let service: MusicianStatusService;
  let mockDb: any;

  beforeEach(() => {
    service = new MusicianStatusService();
    mockDb = admin.firestore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStatus', () => {
    it('should update musician status successfully', async () => {
      // Arrange
      const musicianId = 'musician-123';
      const statusData = {
        isOnline: true,
        isAvailable: true,
        currentStatus: 'online' as const,
      };

      const mockSet = jest.fn().mockResolvedValue(undefined);
      mockDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({ set: mockSet }),
      });

      // Act
      await service.updateStatus(musicianId, statusData);

      // Assert
      expect(mockSet).toHaveBeenCalledWith({
        ...statusData,
        lastSeen: expect.any(Object),
        updatedAt: expect.any(Object),
      });
    });

    it('should throw error when musicianId is invalid', async () => {
      // Arrange
      const invalidMusicianId = '';
      const statusData = { isOnline: true };

      // Act & Assert
      await expect(
        service.updateStatus(invalidMusicianId, statusData)
      ).rejects.toThrow('ID de músico inválido');
    });
  });

  describe('checkAvailability', () => {
    it('should return true for available musician', async () => {
      // Arrange
      const musicianId = 'musician-123';
      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          isOnline: true,
          isAvailable: true,
          currentStatus: 'online',
        }),
      });

      mockDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet }),
      });

      // Act
      const result = await service.checkAvailability(musicianId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for unavailable musician', async () => {
      // Arrange
      const musicianId = 'musician-123';
      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          isOnline: false,
          isAvailable: false,
          currentStatus: 'offline',
        }),
      });

      mockDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet }),
      });

      // Act
      const result = await service.checkAvailability(musicianId);

      // Assert
      expect(result).toBe(false);
    });
  });
});
```

### **2. Tests de Validación**

```typescript
// src/__tests__/unit/middleware/validationMiddleware.test.ts
import request from 'supertest';
import express from 'express';
import { validateAndSanitize } from '../../../middleware/validationMiddleware';
import { authValidationSchema } from '../../../utils/validationSchemas';

const app = express();
app.use(express.json());

// Ruta de prueba
app.post('/test-auth', 
  validateAndSanitize(authValidationSchema.login),
  (req, res) => {
    res.json({ success: true, data: req.body });
  }
);

describe('Validation Middleware', () => {
  describe('validateAndSanitize', () => {
    it('should pass validation for valid data', async () => {
      // Arrange
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/test-auth')
        .send(validData)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should fail validation for invalid email', async () => {
      // Arrange
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      // Act & Assert
      const response = await request(app)
        .post('/test-auth')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0].field).toBe('email');
    });

    it('should sanitize input data', async () => {
      // Arrange
      const dataWithXSS = {
        email: 'test@example.com<script>alert("xss")</script>',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/test-auth')
        .send(dataWithXSS)
        .expect(200);

      // Assert
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.email).not.toContain('<script>');
    });
  });
});
```

### **3. Tests de Cálculo de Tarifas**

```typescript
// src/__tests__/unit/services/RateCalculationService.test.ts
import { RateCalculationService } from '../../../services/rates/RateCalculationService';

describe('RateCalculationService', () => {
  let service: RateCalculationService;

  beforeEach(() => {
    service = new RateCalculationService();
  });

  describe('calculateEventRate', () => {
    it('should calculate rate for wedding event', async () => {
      // Arrange
      const eventDetails = {
        eventType: 'wedding',
        durationHours: 4,
        distanceKm: 25,
        eventDate: new Date('2024-06-15'),
        urgency: 'normal',
        location: 'Santo Domingo',
      };

      const musicianRates = {
        baseHourlyRate: 50,
        multipliers: {
          eventType: { wedding: 1.5 },
          duration: { '4': 1.2 },
          distance: { '25': 1.1 },
        },
      };

      // Act
      const result = await service.calculateEventRate(
        'musician-123',
        eventDetails,
        musicianRates
      );

      // Assert
      expect(result.calculation.totalRate).toBe(396); // 50 * 1.5 * 1.2 * 1.1 * 4
      expect(result.calculation.hourlyRate).toBe(99); // 396 / 4
      expect(result.breakdown.eventTypeMultiplier).toBe(1.5);
    });

    it('should apply urgency multiplier for urgent requests', async () => {
      // Arrange
      const eventDetails = {
        eventType: 'corporate',
        durationHours: 2,
        distanceKm: 10,
        eventDate: new Date('2024-06-15'),
        urgency: 'urgent',
        location: 'Santo Domingo',
      };

      const musicianRates = {
        baseHourlyRate: 40,
        multipliers: {
          urgency: { urgent: 1.8 },
        },
      };

      // Act
      const result = await service.calculateEventRate(
        'musician-123',
        eventDetails,
        musicianRates
      );

      // Assert
      expect(result.calculation.totalRate).toBe(144); // 40 * 1.8 * 2
      expect(result.breakdown.urgencyMultiplier).toBe(1.8);
    });
  });
});
```

## 🔗 Tests de Integración

### **1. Tests de API Endpoints**

```typescript
// src/__tests__/integration/api/musicianStatus.test.ts
import request from 'supertest';
import { app } from '../../../index';
import { admin } from '../../../utils/firebase';

describe('Musician Status API', () => {
  let authToken: string;
  let testMusicianId: string;

  beforeAll(async () => {
    // Setup test data
    testMusicianId = 'test-musician-123';
    
    // Create test musician
    await admin.firestore().collection('users').doc(testMusicianId).set({
      name: 'Test Musician',
      roll: 'musico',
      status: true,
    });

    // Get auth token (simulate login)
    authToken = 'test-token-123';
  });

  afterAll(async () => {
    // Cleanup test data
    await admin.firestore().collection('users').doc(testMusicianId).delete();
    await admin.firestore().collection('musicianStatus').doc(testMusicianId).delete();
  });

  describe('POST /api/musician/status/update', () => {
    it('should update musician status', async () => {
      // Arrange
      const statusData = {
        isOnline: true,
        isAvailable: true,
        currentStatus: 'online',
      };

      // Act
      const response = await request(app)
        .post('/api/musician/status/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          musicianId: testMusicianId,
          ...statusData,
        })
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.isOnline).toBe(true);
      expect(response.body.data.isAvailable).toBe(true);
    });

    it('should return 401 for unauthorized request', async () => {
      // Act & Assert
      await request(app)
        .post('/api/musician/status/update')
        .send({
          musicianId: testMusicianId,
          isOnline: true,
        })
        .expect(401);
    });
  });

  describe('GET /api/musician/available', () => {
    it('should return available musicians', async () => {
      // Arrange
      // Create multiple test musicians
      const musicians = [
        { id: 'musician-1', isOnline: true, isAvailable: true },
        { id: 'musician-2', isOnline: false, isAvailable: false },
        { id: 'musician-3', isOnline: true, isAvailable: true },
      ];

      for (const musician of musicians) {
        await admin.firestore()
          .collection('musicianStatus')
          .doc(musician.id)
          .set(musician);
      }

      // Act
      const response = await request(app)
        .get('/api/musician/available')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((m: any) => m.isOnline && m.isAvailable)).toBe(true);

      // Cleanup
      for (const musician of musicians) {
        await admin.firestore()
          .collection('musicianStatus')
          .doc(musician.id)
          .delete();
      }
    });
  });
});
```

### **2. Tests de Búsqueda Inteligente**

```typescript
// src/__tests__/integration/services/IntelligentSearchService.test.ts
import { IntelligentSearchService } from '../../../services/search/IntelligentSearchService';
import { MusicianStatusService } from '../../../services/musician-status/MusicianStatusService';
import { CalendarService } from '../../../services/calendar/CalendarService';
import { RateCalculationService } from '../../../services/rates/RateCalculationService';

describe('IntelligentSearchService Integration', () => {
  let searchService: IntelligentSearchService;
  let statusService: MusicianStatusService;
  let calendarService: CalendarService;
  let rateService: RateCalculationService;

  beforeEach(() => {
    statusService = new MusicianStatusService();
    calendarService = new CalendarService();
    rateService = new RateCalculationService();
    searchService = new IntelligentSearchService(
      statusService,
      calendarService,
      rateService
    );
  });

  describe('searchAvailableMusiciansForEvent', () => {
    it('should find available musicians with full integration', async () => {
      // Arrange
      const eventDetails = {
        eventId: 'event-123',
        eventType: 'wedding',
        durationHours: 4,
        date: new Date('2024-06-15T18:00:00Z'),
        location: { latitude: 18.4861, longitude: -69.9312 },
        budget: 500,
        instrument: 'piano',
      };

      // Mock available musicians
      const availableMusicians = [
        {
          musicianId: 'musician-1',
          isOnline: true,
          isAvailable: true,
          instrument: 'piano',
          baseHourlyRate: 50,
        },
        {
          musicianId: 'musician-2',
          isOnline: true,
          isAvailable: true,
          instrument: 'piano',
          baseHourlyRate: 60,
        },
      ];

      // Mock services
      jest.spyOn(statusService, 'getAvailableMusicians').mockResolvedValue(availableMusicians);
      jest.spyOn(calendarService, 'checkAvailability').mockResolvedValue(true);
      jest.spyOn(rateService, 'calculateEventRate').mockResolvedValue({
        calculation: { totalRate: 200, hourlyRate: 50 },
        breakdown: {},
      });

      // Act
      const result = await searchService.searchAvailableMusiciansForEvent(
        eventDetails.eventId,
        { instrument: 'piano', limit: 10 }
      );

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data[0].musicianId).toBe('musician-1');
      expect(result.data[0].score).toBeGreaterThan(0);
      expect(result.total).toBe(2);
    });

    it('should filter out unavailable musicians', async () => {
      // Arrange
      const eventDetails = {
        eventId: 'event-123',
        eventType: 'wedding',
        durationHours: 4,
        date: new Date('2024-06-15T18:00:00Z'),
        location: { latitude: 18.4861, longitude: -69.9312 },
        budget: 500,
        instrument: 'piano',
      };

      const musicians = [
        {
          musicianId: 'musician-1',
          isOnline: true,
          isAvailable: true,
          instrument: 'piano',
        },
        {
          musicianId: 'musician-2',
          isOnline: false,
          isAvailable: false,
          instrument: 'piano',
        },
      ];

      jest.spyOn(statusService, 'getAvailableMusicians').mockResolvedValue(musicians);
      jest.spyOn(calendarService, 'checkAvailability').mockResolvedValue(true);

      // Act
      const result = await searchService.searchAvailableMusiciansForEvent(
        eventDetails.eventId,
        { instrument: 'piano' }
      );

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].musicianId).toBe('musician-1');
    });
  });
});
```

## 🌐 Tests End-to-End

### **1. Tests de Flujo Completo**

```typescript
// cypress/e2e/musician-hiring-flow.cy.ts
describe('Musician Hiring Flow', () => {
  beforeEach(() => {
    // Setup test data
    cy.fixture('test-event').then((eventData) => {
      cy.wrap(eventData).as('eventData');
    });

    cy.fixture('test-musician').then((musicianData) => {
      cy.wrap(musicianData).as('musicianData');
    });

    // Login as event organizer
    cy.login('event-organizer@test.com', 'password123');
  });

  it('should complete full musician hiring process', () => {
    cy.get('@eventData').then((eventData: any) => {
      // 1. Create event
      cy.visit('/events/create');
      cy.get('[data-testid=event-name]').type(eventData.name);
      cy.get('[data-testid=event-date]').type(eventData.date);
      cy.get('[data-testid=event-location]').type(eventData.location);
      cy.get('[data-testid=event-type]').select(eventData.type);
      cy.get('[data-testid=event-instrument]').select(eventData.instrument);
      cy.get('[data-testid=event-budget]').type(eventData.budget);
      cy.get('[data-testid=save-event]').click();

      // 2. Search for musicians
      cy.visit('/musicians/search');
      cy.get('[data-testid=search-instrument]').select(eventData.instrument);
      cy.get('[data-testid=search-location]').type(eventData.location);
      cy.get('[data-testid=search-date]').type(eventData.date);
      cy.get('[data-testid=search-button]').click();

      // 3. Verify search results
      cy.get('[data-testid=musician-card]').should('have.length.at.least', 1);
      cy.get('[data-testid=musician-card]').first().within(() => {
        cy.get('[data-testid=musician-name]').should('be.visible');
        cy.get('[data-testid=musician-rating]').should('be.visible');
        cy.get('[data-testid=musician-rate]').should('be.visible');
        cy.get('[data-testid=musician-availability]').should('contain', 'Disponible');
      });

      // 4. Select musician and request
      cy.get('[data-testid=musician-card]').first().click();
      cy.get('[data-testid=request-musician]').click();

      // 5. Fill request form
      cy.get('[data-testid=request-message]').type('Necesito un músico para mi evento');
      cy.get('[data-testid=request-budget]').type(eventData.budget);
      cy.get('[data-testid=send-request]').click();

      // 6. Verify request sent
      cy.get('[data-testid=success-message]').should('contain', 'Solicitud enviada');
      cy.get('[data-testid=request-status]').should('contain', 'Pendiente');
    });
  });

  it('should show no musicians available message', () => {
    // Arrange - Set all musicians as unavailable
    cy.intercept('GET', '/api/musician/available', {
      statusCode: 200,
      body: { success: true, data: [] }
    }).as('getAvailableMusicians');

    // Act
    cy.visit('/musicians/search');
    cy.get('[data-testid=search-button]').click();

    // Assert
    cy.wait('@getAvailableMusicians');
    cy.get('[data-testid=no-musicians-message]').should('contain', 'No hay músicos disponibles');
    cy.get('[data-testid=alternative-suggestions]').should('be.visible');
  });

  it('should calculate rates correctly', () => {
    cy.get('@eventData').then((eventData: any) => {
      // Arrange
      cy.intercept('POST', '/api/rates/calculate', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            calculation: {
              totalRate: 400,
              hourlyRate: 100,
              totalForEvent: 400
            },
            breakdown: {
              baseRate: 50,
              eventTypeMultiplier: 1.5,
              durationMultiplier: 1.2,
              distanceMultiplier: 1.1
            }
          }
        }
      }).as('calculateRate');

      // Act
      cy.visit('/musicians/search');
      cy.get('[data-testid=search-instrument]').select(eventData.instrument);
      cy.get('[data-testid=search-date]').type(eventData.date);
      cy.get('[data-testid=search-button]').click();

      // Assert
      cy.wait('@calculateRate');
      cy.get('[data-testid=rate-breakdown]').should('be.visible');
      cy.get('[data-testid=total-rate]').should('contain', '$400');
      cy.get('[data-testid=hourly-rate]').should('contain', '$100');
    });
  });
});
```

### **2. Tests de Notificaciones**

```typescript
// cypress/e2e/notifications.cy.ts
describe('Notification System', () => {
  beforeEach(() => {
    cy.login('musician@test.com', 'password123');
  });

  it('should receive and display notifications', () => {
    // Arrange - Mock notification
    cy.intercept('GET', '/api/notifications/user/*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            notificationId: 'notif-1',
            type: 'musician_request',
            content: {
              title: 'Nueva solicitud de evento',
              message: 'Tienes una nueva solicitud para tocar en una boda'
            },
            status: 'unread'
          }
        ]
      }
    }).as('getNotifications');

    // Act
    cy.visit('/notifications');

    // Assert
    cy.wait('@getNotifications');
    cy.get('[data-testid=notification-item]').should('have.length', 1);
    cy.get('[data-testid=notification-title]').should('contain', 'Nueva solicitud de evento');
    cy.get('[data-testid=notification-message]').should('contain', 'Tienes una nueva solicitud');
  });

  it('should mark notification as read', () => {
    // Arrange
    cy.intercept('PUT', '/api/notifications/*/read', {
      statusCode: 200,
      body: { success: true }
    }).as('markAsRead');

    // Act
    cy.visit('/notifications');
    cy.get('[data-testid=notification-item]').first().click();

    // Assert
    cy.wait('@markAsRead');
    cy.get('[data-testid=notification-item]').first()
      .should('not.have.class', 'unread');
  });
});
```

## ⚡ Tests de Performance

### **1. Tests de Carga**

```javascript
// artillery/search-performance.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 20
      name: "Normal load"
    - duration: 60
      arrivalRate: 50
      name: "Peak load"
    - duration: 60
      arrivalRate: 100
      name: "Stress test"
  defaults:
    headers:
      Content-Type: 'application/json'
      Authorization: 'Bearer {{ $randomString() }}'
  processor: './artillery/processors.js'

scenarios:
  - name: "Search Available Musicians"
    weight: 40
    flow:
      - get:
          url: "/api/search/available-musicians"
          expect:
            - statusCode: 200
            - contentType: json
      - think: 2
      - post:
          url: "/api/search/available-musicians-advanced"
          json:
            filters:
              instrument: "piano"
              location: "Santo Domingo"
              date: "2024-06-15"
              budget: 500
          expect:
            - statusCode: 200
            - contentType: json

  - name: "Rate Calculation"
    weight: 30
    flow:
      - post:
          url: "/api/rates/calculate"
          json:
            musicianId: "musician-123"
            eventDetails:
              eventType: "wedding"
              durationHours: 4
              distanceKm: 25
          expect:
            - statusCode: 200
            - contentType: json

  - name: "Status Updates"
    weight: 20
    flow:
      - post:
          url: "/api/musician/status/update"
          json:
            musicianId: "musician-123"
            isOnline: true
            isAvailable: true
          expect:
            - statusCode: 200

  - name: "Notifications"
    weight: 10
    flow:
      - get:
          url: "/api/notifications/user/musician-123"
          expect:
            - statusCode: 200
```

### **2. Tests de Latencia**

```typescript
// src/__tests__/performance/latency.test.ts
import request from 'supertest';
import { app } from '../../index';

describe('API Latency Tests', () => {
  const maxLatency = 2000; // 2 seconds

  it('should respond to search within acceptable latency', async () => {
    const startTime = Date.now();

    const response = await request(app)
      .get('/api/search/available-musicians')
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    const endTime = Date.now();
    const latency = endTime - startTime;

    expect(latency).toBeLessThan(maxLatency);
    expect(response.body.success).toBe(true);
  });

  it('should calculate rates within acceptable latency', async () => {
    const startTime = Date.now();

    const response = await request(app)
      .post('/api/rates/calculate')
      .set('Authorization', 'Bearer test-token')
      .send({
        musicianId: 'musician-123',
        eventDetails: {
          eventType: 'wedding',
          durationHours: 4,
          distanceKm: 25,
        },
      })
      .expect(200);

    const endTime = Date.now();
    const latency = endTime - startTime;

    expect(latency).toBeLessThan(maxLatency);
    expect(response.body.success).toBe(true);
  });
});
```

## 🔧 Scripts de Testing

### **1. Package.json Scripts**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:performance": "artillery run artillery/search-performance.yml",
    "test:load": "artillery run artillery/load-test.yml",
    "test:stress": "artillery run artillery/stress-test.yml",
    "test:ci": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:all": "npm run test:ci && npm run test:performance"
  }
}
```

### **2. GitHub Actions Workflow**

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage

  integration-tests:
    runs-on: ubuntu-latest
    services:
      firebase:
        image: gcr.io/google.com/cloudsdktool/cloud-sdk:latest
        options: >-
          --health-cmd "gcloud auth list"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm start &
      - run: npm run test:e2e

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm start &
      - run: npm run test:performance
```

## 📊 Métricas de Testing

### **1. Cobertura de Código**

```typescript
// jest.config.js - Configuración de cobertura
module.exports = {
  // ... otras configuraciones
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90,
    },
    './src/services/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  coverageReporters: ['text', 'lcov', 'html', 'json'],
};
```

### **2. Métricas de Performance**

```typescript
// src/utils/performanceMetrics.ts
import { performance } from 'perf_hooks';

export class PerformanceMetrics {
  private static metrics: Map<string, number[]> = new Map();

  static startTimer(operation: string): string {
    const id = `${operation}_${Date.now()}_${Math.random()}`;
    performance.mark(`${id}_start`);
    return id;
  }

  static endTimer(id: string): number {
    performance.mark(`${id}_end`);
    performance.measure(id, `${id}_start`, `${id}_end`);
    
    const measure = performance.getEntriesByName(id)[0];
    const duration = measure.duration;
    
    // Store metric
    const operation = id.split('_')[0];
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);
    
    return duration;
  }

  static getAverageTime(operation: string): number {
    const times = this.metrics.get(operation) || [];
    if (times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  static getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [operation, times] of this.metrics) {
      result[operation] = {
        count: times.length,
        average: this.getAverageTime(operation),
        min: Math.min(...times),
        max: Math.max(...times),
        p95: this.getPercentile(times, 95),
        p99: this.getPercentile(times, 99),
      };
    }
    
    return result;
  }

  private static getPercentile(times: number[], percentile: number): number {
    const sorted = [...times].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }
}
```

## 🚨 Troubleshooting

### **1. Problemas Comunes**

#### **Tests Fallando por Timeout**

```bash
# Aumentar timeout en Jest
# jest.config.js
module.exports = {
  testTimeout: 30000, // 30 segundos
};

# O en el test específico
describe('Slow Test', () => {
  it('should complete within timeout', async () => {
    // Test code
  }, 60000); // 60 segundos
});
```

#### **Tests de Integración Fallando**

```bash
# Verificar que Firebase esté configurado
firebase emulators:start

# Verificar variables de entorno
npm run test:integration -- --verbose

# Limpiar cache
npm run test:clear
```

#### **Tests E2E Fallando**

```bash
# Verificar que la app esté corriendo
npm start

# Ejecutar tests en modo headed
npm run test:e2e:open

# Verificar screenshots
cypress/screenshots/
```

### **2. Debugging**

#### **Debug Tests Unitarios**

```typescript
// Agregar debugger en el test
it('should debug this test', () => {
  debugger;
  // Test code
});

// Ejecutar con Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

#### **Debug Tests E2E**

```typescript
// Agregar pausa en Cypress
cy.pause();

// O usar debugger
cy.get('[data-testid=element]').then(($el) => {
  debugger;
});
```

## 📚 Recursos Adicionales

### **Documentación**

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io/)
- [Artillery Documentation](https://www.artillery.io/docs)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

### **Mejores Prácticas**

1. **Tests Unitarios**: Mantener tests rápidos y aislados
2. **Tests de Integración**: Usar base de datos de prueba
3. **Tests E2E**: Usar datos de prueba consistentes
4. **Tests de Performance**: Monitorear métricas en CI/CD

---

**📅 Fecha de Creación**: $(date)
**👨‍💻 Autor**: Sistema de Documentación Automática
**📋 Versión**: 1.0.0
**🎯 Estado**: Listo para Implementación 