# 🚀 Guía de Configuración - Sistema de Búsqueda Avanzada de Músicos

## 📋 Resumen

Esta guía te llevará paso a paso a través de la configuración e implementación completa del sistema de búsqueda avanzada de músicos para MussikOn.

## 🎯 Prerrequisitos

### **💻 Requisitos del Sistema**

- **Node.js** 18.x o superior
- **npm** 9.x o superior
- **Git** 2.x o superior
- **Firebase CLI** 12.x o superior
- **TypeScript** 5.x o superior

### **☁️ Servicios Requeridos**

- **Firebase Project** (Firestore, Functions, Hosting)
- **Google Cloud Platform** (para servicios adicionales)
- **AWS S3** o **iDrive E2** (para almacenamiento de archivos)
- **Stripe** (para pagos)
- **Google Maps API** (para geolocalización)

## 📦 Instalación Inicial

### **1. Clonar el Repositorio**

```bash
# Clonar el repositorio principal
git clone https://github.com/tu-usuario/APP_MussikOn_Express.git
cd APP_MussikOn_Express

# Verificar que estás en la rama correcta
git checkout main
git pull origin main
```

### **2. Instalar Dependencias**

```bash
# Instalar dependencias del backend
npm install

# Verificar instalación
npm run build
```

### **3. Configurar Variables de Entorno**

```bash
# Copiar archivo de ejemplo
cp ENV_example.ts ENV.ts

# Editar variables de entorno
nano ENV.ts
```

## 🔧 Configuración Detallada

### **🔥 Firebase Configuration**

#### **1. Crear Proyecto Firebase**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto: `mus1k0n-advanced`
3. Habilita los siguientes servicios:
   - **Firestore Database**
   - **Cloud Functions**
   - **Authentication**
   - **Storage**
   - **Hosting**

#### **2. Configurar Firestore**

```typescript
// ENV.ts - Configuración de Firebase
export const FIREBASE_CONFIG = {
  apiKey: "tu-api-key",
  authDomain: "mus1k0n-advanced.firebaseapp.com",
  projectId: "mus1k0n-advanced",
  storageBucket: "mus1k0n-advanced.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Configuración de Admin SDK
export const FIREBASE_ADMIN_CONFIG = {
  projectId: "mus1k0n-advanced",
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
};
```

#### **3. Configurar Reglas de Firestore**

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && resource.data.roll == 'musico';
    }
    
    // Reglas para estado de músicos
    match /musicianStatus/{musicianId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == musicianId;
    }
    
    // Reglas para calendario
    match /musicianCalendar/{musicianId} {
      allow read, write: if request.auth != null && request.auth.uid == musicianId;
    }
    
    // Reglas para tarifas
    match /musicianRates/{musicianId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == musicianId;
    }
    
    // Reglas para notificaciones
    match /intelligentNotifications/{notificationId} {
      allow read, write: if request.auth != null && 
        (resource.data.recipientId == request.auth.uid || 
         request.auth.token.role == 'admin');
    }
    
    // Reglas para búsquedas
    match /searchIndexes/{musicianId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == musicianId;
    }
  }
}
```

### **💾 Base de Datos - Colecciones Requeridas**

#### **1. Crear Índices de Firestore**

```bash
# Ejecutar script para crear índices
npm run create-indexes
```

**Índices Requeridos:**

```javascript
// Índices para búsqueda de músicos
{
  collection: "searchIndexes",
  fields: [
    { fieldPath: "searchMetadata.isActive", order: "ASCENDING" },
    { fieldPath: "skills.instruments", order: "ASCENDING" },
    { fieldPath: "basic.location", order: "ASCENDING" },
    { fieldPath: "basic.rating", order: "DESCENDING" },
    { fieldPath: "basic.experienceYears", order: "DESCENDING" }
  ]
}

// Índices para estado de músicos
{
  collection: "musicianStatus",
  fields: [
    { fieldPath: "isOnline", order: "ASCENDING" },
    { fieldPath: "isAvailable", order: "ASCENDING" },
    { fieldPath: "lastSeen", order: "DESCENDING" }
  ]
}

// Índices para calendario
{
  collection: "musicianCalendar",
  fields: [
    { fieldPath: "musicianId", order: "ASCENDING" },
    { fieldPath: "events.startTime", order: "ASCENDING" },
    { fieldPath: "events.endTime", order: "ASCENDING" }
  ]
}
```

#### **2. Estructura de Datos Inicial**

```typescript
// Script para inicializar datos de ejemplo
// scripts/init-database.ts

import { admin } from '../src/utils/firebase';

async function initializeDatabase() {
  const db = admin.firestore();
  
  // Crear datos de ejemplo para músicos
  const sampleMusicians = [
    {
      musicianId: 'musician-001',
      basic: {
        name: 'Juan Pérez',
        instrument: 'piano',
        location: 'Santo Domingo',
        experienceYears: 5,
        rating: 4.8
      },
      availability: {
        isOnline: true,
        isAvailable: true,
        workingHours: {
          start: '09:00',
          end: '18:00',
          days: [1, 2, 3, 4, 5, 6, 7]
        }
      },
      rates: {
        baseHourlyRate: 50,
        currency: 'USD'
      },
      skills: {
        instruments: ['piano', 'teclado'],
        genres: ['clásico', 'jazz', 'pop'],
        languages: ['español', 'inglés'],
        specializations: ['boda', 'concierto', 'corporativo']
      }
    }
    // Agregar más músicos de ejemplo...
  ];
  
  // Insertar datos
  for (const musician of sampleMusicians) {
    await db.collection('searchIndexes').doc(musician.musicianId).set(musician);
    await db.collection('musicianStatus').doc(musician.musicianId).set({
      musicianId: musician.musicianId,
      isOnline: musician.availability.isOnline,
      isAvailable: musician.availability.isAvailable,
      lastSeen: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  console.log('✅ Base de datos inicializada correctamente');
}

initializeDatabase().catch(console.error);
```

### **🔐 Configuración de Autenticación**

#### **1. Configurar JWT**

```typescript
// ENV.ts - Configuración JWT
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'tu-jwt-secret-super-seguro',
  expiresIn: '24h',
  refreshExpiresIn: '7d'
};
```

#### **2. Configurar Google OAuth**

```typescript
// ENV.ts - Configuración Google OAuth
export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
};
```

### **💰 Configuración de Pagos (Stripe)**

```typescript
// ENV.ts - Configuración Stripe
export const STRIPE_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: 'usd'
};
```

### **🗺️ Configuración de Google Maps**

```typescript
// ENV.ts - Configuración Google Maps
export const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
  geocodingApiKey: process.env.GOOGLE_GEOCODING_API_KEY
};
```

### **📧 Configuración de Email**

```typescript
// ENV.ts - Configuración Email
export const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};
```

## 🚀 Implementación por Fases

### **📋 Fase 1: Sistema de Estado de Músicos**

```bash
# 1. Crear servicios de estado
mkdir -p src/services/musician-status
touch src/services/musician-status/MusicianStatusService.ts
touch src/services/musician-status/HeartbeatService.ts

# 2. Crear middleware
touch src/middleware/heartbeatMiddleware.ts
touch src/middleware/statusMiddleware.ts

# 3. Crear rutas
touch src/routes/musicianStatusRoutes.ts

# 4. Implementar código según documentación de Fase 1
# Ver: docs/phases/phase1-musician-status.md
```

### **📋 Fase 2: Sistema de Calendario**

```bash
# 1. Crear servicios de calendario
mkdir -p src/services/calendar
touch src/services/calendar/CalendarService.ts
touch src/services/calendar/ConflictDetectionService.ts

# 2. Crear rutas
touch src/routes/calendarRoutes.ts

# 3. Implementar código según documentación de Fase 2
# Ver: docs/phases/phase2-calendar-conflicts.md
```

### **📋 Fase 3: Sistema de Tarifas**

```bash
# 1. Crear servicios de tarifas
mkdir -p src/services/rates
touch src/services/rates/RateCalculationService.ts
touch src/services/rates/MarketAnalysisService.ts

# 2. Crear rutas
touch src/routes/rateRoutes.ts

# 3. Implementar código según documentación de Fase 3
# Ver: docs/phases/phase3-rate-calculation.md
```

### **📋 Fase 4: Sistema de Notificaciones**

```bash
# 1. Crear servicios de notificaciones
mkdir -p src/services/notifications
touch src/services/notifications/IntelligentNotificationService.ts
touch src/services/notifications/NotificationPriorityService.ts

# 2. Crear rutas
touch src/routes/notificationRoutes.ts

# 3. Implementar código según documentación de Fase 4
# Ver: docs/phases/phase4-intelligent-notifications.md
```

### **📋 Fase 5: Búsqueda Inteligente**

```bash
# 1. Crear servicios de búsqueda
mkdir -p src/services/search
touch src/services/search/IntelligentSearchService.ts
touch src/services/search/SearchScoringService.ts

# 2. Crear rutas
touch src/routes/intelligentSearchRoutes.ts

# 3. Implementar código según documentación de Fase 5
# Ver: docs/phases/phase5-intelligent-search.md
```

### **📋 Fase 6: Integración y Testing**

```bash
# 1. Crear servicio de integración
mkdir -p src/services/integration
touch src/services/integration/SystemIntegrationService.ts

# 2. Crear middleware de integración
touch src/middleware/integrationMiddleware.ts

# 3. Crear tests
mkdir -p src/__tests__
touch src/__tests__/integration.test.ts
touch src/__tests__/performance.test.ts

# 4. Implementar código según documentación de Fase 6
# Ver: docs/phases/phase6-integration-testing.md
```

## 🧪 Testing y Validación

### **1. Tests Unitarios**

```bash
# Ejecutar tests unitarios
npm run test:unit

# Ejecutar tests con coverage
npm run test:coverage
```

### **2. Tests de Integración**

```bash
# Ejecutar tests de integración
npm run test:integration

# Ejecutar tests de API
npm run test:api
```

### **3. Tests de Performance**

```bash
# Ejecutar tests de performance
npm run test:performance

# Ejecutar load testing
npm run test:load
```

### **4. Tests End-to-End**

```bash
# Ejecutar tests E2E
npm run test:e2e

# Ejecutar tests con navegador
npm run test:browser
```

## 🚀 Deployment

### **1. Configuración de Producción**

```bash
# Configurar variables de entorno de producción
cp ENV.ts ENV.prod.ts

# Editar configuración de producción
nano ENV.prod.ts
```

### **2. Build de Producción**

```bash
# Build optimizado
npm run build:prod

# Verificar build
npm run build:check
```

### **3. Deploy a Firebase**

```bash
# Login a Firebase
firebase login

# Inicializar proyecto (si es necesario)
firebase init

# Deploy a Firebase Functions
firebase deploy --only functions

# Deploy a Firebase Hosting
firebase deploy --only hosting
```

### **4. Verificar Deployment**

```bash
# Verificar health check
curl https://us-central1-mus1k0n-advanced.cloudfunctions.net/api/health

# Verificar endpoints principales
curl https://us-central1-mus1k0n-advanced.cloudfunctions.net/api/search/available-musicians
```

## 📊 Monitoreo y Logs

### **1. Configurar Logging**

```typescript
// src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### **2. Configurar Métricas**

```typescript
// src/utils/metrics.ts
import { register, Counter, Histogram } from 'prom-client';

// Métricas de búsqueda
export const searchCounter = new Counter({
  name: 'musician_searches_total',
  help: 'Total number of musician searches'
});

export const searchDuration = new Histogram({
  name: 'musician_search_duration_seconds',
  help: 'Duration of musician searches'
});

// Métricas de notificaciones
export const notificationCounter = new Counter({
  name: 'notifications_sent_total',
  help: 'Total number of notifications sent'
});
```

## 🔧 Scripts Útiles

### **1. Scripts de Desarrollo**

```json
// package.json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "type-check": "tsc --noEmit"
  }
}
```

### **2. Scripts de Base de Datos**

```bash
#!/bin/bash
# scripts/db-setup.sh

echo "🔧 Configurando base de datos..."

# Crear índices
echo "📊 Creando índices de Firestore..."
firebase firestore:indexes

# Inicializar datos de ejemplo
echo "📝 Inicializando datos de ejemplo..."
npm run db:init

# Verificar configuración
echo "✅ Verificando configuración..."
npm run db:verify

echo "🎉 Base de datos configurada correctamente!"
```

### **3. Scripts de Deployment**

```bash
#!/bin/bash
# scripts/deploy.sh

echo "🚀 Iniciando deployment..."

# Verificar configuración
echo "🔍 Verificando configuración..."
npm run config:check

# Ejecutar tests
echo "🧪 Ejecutando tests..."
npm run test:ci

# Build
echo "🔨 Compilando..."
npm run build

# Deploy
echo "☁️ Deployando..."
firebase deploy

# Verificar
echo "✅ Verificando deployment..."
npm run health:check

echo "🎉 Deployment completado!"
```

## 🆘 Troubleshooting

### **Problemas Comunes**

#### **1. Error de Firebase**

```bash
# Verificar configuración de Firebase
firebase projects:list
firebase use mus1k0n-advanced

# Verificar permisos
firebase login --reauth
```

#### **2. Error de TypeScript**

```bash
# Limpiar cache
rm -rf node_modules
npm install

# Verificar tipos
npm run type-check
```

#### **3. Error de Tests**

```bash
# Limpiar cache de Jest
npm run test:clear

# Ejecutar tests en modo verbose
npm run test -- --verbose
```

#### **4. Error de Deployment**

```bash
# Verificar variables de entorno
npm run env:check

# Verificar build local
npm run build:local

# Verificar logs de Firebase
firebase functions:log
```

## 📚 Recursos Adicionales

### **Documentación**

- [Plan de Implementación](./IMPLEMENTATION_PLAN.md)
- [Fase 1: Sistema de Estado](./phases/phase1-musician-status.md)
- [Fase 2: Sistema de Calendario](./phases/phase2-calendar-conflicts.md)
- [Fase 3: Sistema de Tarifas](./phases/phase3-rate-calculation.md)
- [Fase 4: Sistema de Notificaciones](./phases/phase4-intelligent-notifications.md)
- [Fase 5: Búsqueda Inteligente](./phases/phase5-intelligent-search.md)
- [Fase 6: Integración y Testing](./phases/phase6-integration-testing.md)

### **Enlaces Útiles**

- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

**📅 Fecha de Creación**: $(date)
**👨‍💻 Autor**: Sistema de Documentación Automática
**📋 Versión**: 1.0.0
**🎯 Estado**: Listo para Implementación 