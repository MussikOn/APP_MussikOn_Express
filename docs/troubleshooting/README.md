# 🔧 Troubleshooting - MussikOn API

## 📋 Índice

- [Descripción General](#descripción-general)
- [Problemas Comunes](#problemas-comunes)
- [Códigos de Error](#códigos-de-error)
- [Debugging](#debugging)
- [Logs y Monitoreo](#logs-y-monitoreo)
- [Performance](#performance)
- [Seguridad](#seguridad)
- [Base de Datos](#base-de-datos)
- [Integraciones](#integraciones)
- [Deployment](#deployment)
- [Siguiente: Guías de Configuración](#siguiente-guías-de-configuración)

## Descripción General

Esta guía de troubleshooting cubre los problemas más comunes que pueden surgir durante el desarrollo, testing y producción de la API de MussikOn. Incluye técnicas de debugging, códigos de error, y soluciones paso a paso.

## Problemas Comunes

### 1. Errores de Autenticación

#### Problema: Token JWT Inválido
```typescript
// Error común
{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "code": "AUTH_001"
}
```

**Solución:**
```typescript
// Verificar configuración JWT
import jwt from 'jsonwebtoken';

const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw new Error('Invalid token');
  }
};
```

#### Problema: Firebase Auth No Configurado
```typescript
// Error en authMiddleware
{
  "error": "Firebase configuration missing",
  "message": "FIREBASE_PROJECT_ID not set",
  "code": "AUTH_002"
}
```

**Solución:**
```bash
# Verificar variables de entorno
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_PRIVATE_KEY
echo $FIREBASE_CLIENT_EMAIL

# Configurar si faltan
export FIREBASE_PROJECT_ID="tu-proyecto-id"
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
export FIREBASE_CLIENT_EMAIL="firebase-adminsdk@..."
```

### 2. Errores de Base de Datos

#### Problema: Firestore Indexes Faltantes
```typescript
// Error en consultas complejas
{
  "error": "Missing index",
  "message": "The query requires an index that is not available",
  "code": "DB_001"
}
```

**Solución:**
```typescript
// Crear índices automáticamente
import { FirestoreIndexManager } from '../services/firestoreOptimizationService';

const createMissingIndexes = async () => {
  const indexManager = new FirestoreIndexManager();
  await indexManager.createIndexes();
  console.log('Indexes created successfully');
};
```

#### Problema: Timeout en Consultas
```typescript
// Error de timeout
{
  "error": "Query timeout",
  "message": "Database query exceeded 30 second limit",
  "code": "DB_002"
}
```

**Solución:**
```typescript
// Optimizar consultas
const optimizeQuery = (query: any) => {
  return query
    .limit(50) // Limitar resultados
    .orderBy('createdAt', 'desc') // Ordenar por campo indexado
    .where('status', '==', 'active'); // Filtrar por campo indexado
};
```

### 3. Errores de Imágenes

#### Problema: IDrive E2 No Responde
```typescript
// Error de conexión
{
  "error": "IDrive connection failed",
  "message": "Unable to connect to IDrive E2",
  "code": "IMG_001"
}
```

**Solución:**
```typescript
// Verificar configuración IDrive
import { S3Client } from '@aws-sdk/client-s3';

const testIDriveConnection = async () => {
  const client = new S3Client({
    endpoint: process.env.IDRIVE_ENDPOINT,
    region: process.env.IDRIVE_REGION,
    credentials: {
      accessKeyId: process.env.IDRIVE_ACCESS_KEY!,
      secretAccessKey: process.env.IDRIVE_SECRET_KEY!
    }
  });

  try {
    await client.send(new ListBucketsCommand({}));
    console.log('IDrive connection successful');
  } catch (error) {
    console.error('IDrive connection failed:', error);
  }
};
```

#### Problema: URLs Firmadas Expiradas
```typescript
// Error de URL expirada
{
  "error": "Signed URL expired",
  "message": "The signed URL has expired",
  "code": "IMG_002"
}
```

**Solución:**
```typescript
// Renovar URLs automáticamente
const refreshSignedUrl = async (imageId: string) => {
  const imageService = new ImageService();
  const newUrl = await imageService.getSignedImageUrl(imageId, 3600); // 1 hora
  return newUrl;
};
```

### 4. Errores de Pagos

#### Problema: Stripe Webhook No Recibido
```typescript
// Error de webhook
{
  "error": "Webhook verification failed",
  "message": "Invalid webhook signature",
  "code": "PAY_001"
}
```

**Solución:**
```typescript
// Verificar webhook
import Stripe from 'stripe';

const verifyWebhook = (payload: string, signature: string) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    return event;
  } catch (error) {
    console.error('Webhook verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
};
```

#### Problema: Pago Fallido
```typescript
// Error de pago
{
  "error": "Payment failed",
  "message": "Insufficient funds",
  "code": "PAY_002"
}
```

**Solución:**
```typescript
// Manejar errores de pago
const handlePaymentError = async (error: any) => {
  switch (error.code) {
    case 'card_declined':
      return { message: 'Tarjeta rechazada', retry: false };
    case 'insufficient_funds':
      return { message: 'Fondos insuficientes', retry: false };
    case 'expired_card':
      return { message: 'Tarjeta expirada', retry: false };
    default:
      return { message: 'Error de pago', retry: true };
  }
};
```

## Códigos de Error

### Códigos de Autenticación (AUTH_XXX)
- `AUTH_001`: Token JWT inválido o expirado
- `AUTH_002`: Configuración de Firebase faltante
- `AUTH_003`: Usuario no encontrado
- `AUTH_004`: Permisos insuficientes
- `AUTH_005`: MFA requerido

### Códigos de Base de Datos (DB_XXX)
- `DB_001`: Índice faltante
- `DB_002`: Timeout de consulta
- `DB_003`: Error de conexión
- `DB_004`: Datos corruptos
- `DB_005`: Límite de cuota excedido

### Códigos de Imágenes (IMG_XXX)
- `IMG_001`: Error de conexión IDrive
- `IMG_002`: URL firmada expirada
- `IMG_003`: Archivo no encontrado
- `IMG_004`: Formato no soportado
- `IMG_005`: Tamaño excede límite

### Códigos de Pagos (PAY_XXX)
- `PAY_001`: Webhook inválido
- `PAY_002`: Pago fallido
- `PAY_003`: Saldo insuficiente
- `PAY_004`: Transacción duplicada
- `PAY_005`: Moneda no soportada

### Códigos de Chat (CHAT_XXX)
- `CHAT_001`: Conversación no encontrada
- `CHAT_002`: Mensaje no enviado
- `CHAT_003`: Usuario bloqueado
- `CHAT_004`: Límite de mensajes excedido
- `CHAT_005`: Archivo adjunto muy grande

## Debugging

### 1. Logs Detallados

```typescript
// Configurar logging detallado
import winston from 'winston';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### 2. Debug de Middleware

```typescript
// Middleware de debug
const debugMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('=== REQUEST DEBUG ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('Params:', req.params);
  console.log('User:', req.user);
  console.log('====================');
  next();
};
```

### 3. Debug de Base de Datos

```typescript
// Debug de consultas Firestore
const debugQuery = async (query: any) => {
  console.log('=== QUERY DEBUG ===');
  console.log('Query:', query);
  
  const startTime = Date.now();
  const result = await query.get();
  const endTime = Date.now();
  
  console.log('Execution time:', endTime - startTime, 'ms');
  console.log('Results count:', result.size);
  console.log('==================');
  
  return result;
};
```

### 4. Debug de Performance

```typescript
// Middleware de performance
const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration.toFixed(2)}ms`);
    
    if (duration > 1000) {
      console.warn(`SLOW REQUEST: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
};
```

## Logs y Monitoreo

### 1. Configuración de Logs

```typescript
// Configuración avanzada de logs
const configureLogging = () => {
  const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
  
  winston.configure({
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.metadata(),
      winston.format.json()
    ),
    defaultMeta: { service: 'mussikon-api' },
    transports: [
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 5242880,
        maxFiles: 5
      })
    ]
  });
};
```

### 2. Monitoreo de Errores

```typescript
// Servicio de monitoreo
class ErrorMonitoringService {
  async logError(error: Error, context: any = {}) {
    const errorLog = {
      timestamp: new Date(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      environment: process.env.NODE_ENV
    };
    
    // Guardar en Firestore
    await admin.firestore()
      .collection('error_logs')
      .add(errorLog);
    
    // Enviar alerta si es crítico
    if (this.isCriticalError(error)) {
      await this.sendAlert(errorLog);
    }
  }
  
  private isCriticalError(error: Error): boolean {
    const criticalPatterns = [
      /database connection/i,
      /authentication failed/i,
      /payment processing/i
    ];
    
    return criticalPatterns.some(pattern => pattern.test(error.message));
  }
  
  private async sendAlert(errorLog: any) {
    // Enviar email o Slack
    console.error('CRITICAL ERROR:', errorLog);
  }
}
```

### 3. Métricas de Performance

```typescript
// Servicio de métricas
class MetricsService {
  private metrics: Map<string, number[]> = new Map();
  
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }
  
  getAverage(name: string): number {
    const values = this.metrics.get(name) || [];
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
  
  getPercentile(name: string, percentile: number): number {
    const values = this.metrics.get(name) || [];
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }
  
  async saveMetrics() {
    const metricsData = {
      timestamp: new Date(),
      averages: Object.fromEntries(
        Array.from(this.metrics.keys()).map(key => [
          key, 
          this.getAverage(key)
        ])
      ),
      p95: Object.fromEntries(
        Array.from(this.metrics.keys()).map(key => [
          key, 
          this.getPercentile(key, 95)
        ])
      )
    };
    
    await admin.firestore()
      .collection('metrics')
      .add(metricsData);
  }
}
```

## Performance

### 1. Optimización de Consultas

```typescript
// Optimizador de consultas
class QueryOptimizer {
  optimizeQuery(query: any, filters: any) {
    // Aplicar filtros que usen índices primero
    const indexedFilters = this.getIndexedFilters(filters);
    indexedFilters.forEach(filter => {
      query = query.where(filter.field, filter.operator, filter.value);
    });
    
    // Ordenar por campos indexados
    if (filters.sortBy && this.isIndexed(filters.sortBy)) {
      query = query.orderBy(filters.sortBy, filters.sortOrder || 'asc');
    }
    
    // Limitar resultados
    query = query.limit(filters.limit || 50);
    
    return query;
  }
  
  private getIndexedFilters(filters: any) {
    const indexedFields = ['status', 'category', 'createdAt', 'userId'];
    return Object.entries(filters)
      .filter(([key]) => indexedFields.includes(key))
      .map(([field, value]) => ({ field, operator: '==', value }));
  }
  
  private isIndexed(field: string): boolean {
    const indexedFields = ['createdAt', 'updatedAt', 'status', 'userId'];
    return indexedFields.includes(field);
  }
}
```

### 2. Caching

```typescript
// Servicio de cache
class CacheService {
  private cache = new Map<string, { data: any; expiry: number }>();
  
  async get(key: string): Promise<any | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  async set(key: string, data: any, ttl: number = 300000): Promise<void> {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }
}
```

### 3. Compresión

```typescript
// Middleware de compresión
import compression from 'compression';

const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
});
```

## Seguridad

### 1. Rate Limiting

```typescript
// Rate limiter avanzado
import rateLimit from 'express-rate-limit';

const createRateLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message: 'Rate limit exceeded',
      code: 'SEC_001'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests from this IP',
        code: 'SEC_001',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Diferentes límites para diferentes endpoints
const authLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 intentos por 15 min
const apiLimiter = createRateLimiter(60 * 1000, 100); // 100 requests por minuto
const uploadLimiter = createRateLimiter(60 * 1000, 10); // 10 uploads por minuto
```

### 2. Validación de Input

```typescript
// Validación estricta
import { body, validationResult } from 'express-validator';

const validateUserInput = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombre inválido'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Input validation errors',
        code: 'SEC_002',
        details: errors.array()
      });
    }
    next();
  }
];
```

### 3. Sanitización

```typescript
// Sanitización de datos
import DOMPurify from 'isomorphic-dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

const sanitizeObject = (obj: any): any => {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
```

## Base de Datos

### 1. Verificación de Conexión

```typescript
// Verificar estado de Firestore
const checkFirestoreHealth = async () => {
  try {
    const startTime = Date.now();
    await admin.firestore().collection('health_check').doc('test').get();
    const endTime = Date.now();
    
    return {
      status: 'healthy',
      responseTime: endTime - startTime,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date()
    };
  }
};
```

### 2. Backup y Recuperación

```typescript
// Servicio de backup
class BackupService {
  async createBackup(collection: string) {
    const snapshot = await admin.firestore()
      .collection(collection)
      .get();
    
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const backup = {
      collection,
      timestamp: new Date(),
      count: data.length,
      data
    };
    
    // Guardar en Cloud Storage
    const bucket = admin.storage().bucket();
    const file = bucket.file(`backups/${collection}_${Date.now()}.json`);
    
    await file.save(JSON.stringify(backup, null, 2), {
      metadata: {
        contentType: 'application/json'
      }
    });
    
    return backup;
  }
  
  async restoreFromBackup(collection: string, backupFile: string) {
    const bucket = admin.storage().bucket();
    const file = bucket.file(backupFile);
    
    const [content] = await file.download();
    const backup = JSON.parse(content.toString());
    
    const batch = admin.firestore().batch();
    
    backup.data.forEach((doc: any) => {
      const { id, ...data } = doc;
      const ref = admin.firestore().collection(collection).doc(id);
      batch.set(ref, data);
    });
    
    await batch.commit();
    
    return { restored: backup.data.length };
  }
}
```

### 3. Optimización de Índices

```typescript
// Gestor de índices
class IndexManager {
  async createIndexes() {
    const indexes = [
      {
        collectionGroup: 'musicians',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'status', order: 'ASCENDING' },
          { fieldPath: 'rating', order: 'DESCENDING' }
        ]
      },
      {
        collectionGroup: 'events',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'organizerId', order: 'ASCENDING' },
          { fieldPath: 'date', order: 'ASCENDING' }
        ]
      },
      {
        collectionGroup: 'messages',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'conversationId', order: 'ASCENDING' },
          { fieldPath: 'timestamp', order: 'DESCENDING' }
        ]
      }
    ];
    
    for (const index of indexes) {
      try {
        await admin.firestore().createIndex(index);
        console.log(`Index created for ${index.collectionGroup}`);
      } catch (error) {
        if (error.code !== 6) { // Already exists
          console.error(`Failed to create index for ${index.collectionGroup}:`, error);
        }
      }
    }
  }
  
  async checkIndexStatus() {
    const indexes = await admin.firestore().listIndexes();
    
    return indexes.map(index => ({
      name: index.name,
      state: index.state,
      collectionGroup: index.collectionGroup
    }));
  }
}
```

## Integraciones

### 1. Stripe

```typescript
// Verificación de Stripe
const verifyStripeConnection = async () => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  
  try {
    const account = await stripe.accounts.retrieve();
    return {
      status: 'connected',
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
};
```

### 2. Firebase

```typescript
// Verificación de Firebase
const verifyFirebaseConnection = async () => {
  try {
    // Verificar Auth
    const auth = admin.auth();
    await auth.listUsers(1);
    
    // Verificar Firestore
    const firestore = admin.firestore();
    await firestore.collection('test').doc('test').get();
    
    // Verificar Storage
    const storage = admin.storage();
    await storage.bucket().getFiles({ maxResults: 1 });
    
    return {
      status: 'connected',
      services: ['auth', 'firestore', 'storage']
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
};
```

### 3. IDrive E2

```typescript
// Verificación de IDrive
const verifyIDriveConnection = async () => {
  const client = new S3Client({
    endpoint: process.env.IDRIVE_ENDPOINT,
    region: process.env.IDRIVE_REGION,
    credentials: {
      accessKeyId: process.env.IDRIVE_ACCESS_KEY!,
      secretAccessKey: process.env.IDRIVE_SECRET_KEY!
    }
  });
  
  try {
    const command = new ListBucketsCommand({});
    const response = await client.send(command);
    
    return {
      status: 'connected',
      buckets: response.Buckets?.length || 0
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
};
```

## Deployment

### 1. Verificación Pre-Deployment

```typescript
// Script de verificación
const preDeploymentCheck = async () => {
  const checks = [
    { name: 'Environment Variables', check: checkEnvironmentVariables },
    { name: 'Database Connection', check: checkFirestoreHealth },
    { name: 'Stripe Connection', check: verifyStripeConnection },
    { name: 'IDrive Connection', check: verifyIDriveConnection },
    { name: 'Firebase Connection', check: verifyFirebaseConnection }
  ];
  
  const results = [];
  
  for (const { name, check } of checks) {
    try {
      const result = await check();
      results.push({ name, status: 'passed', result });
    } catch (error) {
      results.push({ name, status: 'failed', error: error.message });
    }
  }
  
  const failedChecks = results.filter(r => r.status === 'failed');
  
  if (failedChecks.length > 0) {
    console.error('Pre-deployment checks failed:');
    failedChecks.forEach(check => {
      console.error(`- ${check.name}: ${check.error}`);
    });
    process.exit(1);
  }
  
  console.log('All pre-deployment checks passed');
  return results;
};
```

### 2. Rollback

```typescript
// Script de rollback
const rollbackDeployment = async (version: string) => {
  try {
    // Revertir a versión anterior
    await admin.firestore()
      .collection('deployments')
      .doc(version)
      .update({
        status: 'rolled_back',
        rollbackTime: new Date()
      });
    
    // Notificar equipo
    await sendRollbackNotification(version);
    
    console.log(`Rollback to version ${version} completed`);
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
};
```

### 3. Health Check

```typescript
// Endpoint de health check
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    checks: {
      database: await checkFirestoreHealth(),
      stripe: await verifyStripeConnection(),
      idrive: await verifyIDriveConnection(),
      firebase: await verifyFirebaseConnection()
    }
  };
  
  const allHealthy = Object.values(health.checks)
    .every(check => check.status === 'healthy' || check.status === 'connected');
  
  if (!allHealthy) {
    health.status = 'unhealthy';
    res.status(503);
  }
  
  res.json(health);
});
```

## Siguiente: Guías de Configuración

Para continuar con la documentación, ve a [Guías de Configuración](../guides/README.md) donde encontrarás instrucciones detalladas para configurar cada componente del sistema.

---

**Nota**: Esta documentación se actualiza regularmente. Si encuentras un problema no cubierto aquí, consulta los logs del sistema o contacta al equipo de desarrollo. 