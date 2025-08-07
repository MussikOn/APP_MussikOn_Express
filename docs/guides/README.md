# ⚙️ Guías de Configuración - MussikOn API

## 📋 Índice

- [Descripción General](#descripción-general)
- [Configuración Inicial](#configuración-inicial)
- [Firebase Setup](#firebase-setup)
- [IDrive E2 Setup](#idrive-e2-setup)
- [Stripe Setup](#stripe-setup)
- [Variables de Entorno](#variables-de-entorno)
- [Base de Datos](#base-de-datos)
- [Autenticación](#autenticación)
- [Notificaciones](#notificaciones)
- [Monitoreo](#monitoreo)
- [Deployment](#deployment)
- [Siguiente: Documentación de API](#siguiente-documentación-de-api)

## Descripción General

Esta sección contiene guías detalladas para configurar todos los componentes del sistema MussikOn API. Cada guía incluye pasos paso a paso, ejemplos de configuración y verificación de instalación.

## Configuración Inicial

### 1. Requisitos Previos

```bash
# Verificar Node.js (versión 18 o superior)
node --version
npm --version

# Verificar Git
git --version

# Verificar Firebase CLI
firebase --version

# Verificar TypeScript
npx tsc --version
```

### 2. Instalación del Proyecto

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/mussikon-api.git
cd mussikon-api

# Instalar dependencias
npm install

# Instalar dependencias de desarrollo
npm install --save-dev

# Verificar instalación
npm run test
```

### 3. Estructura de Directorios

```
mussikon-api/
├── src/
│   ├── config/          # Configuraciones
│   ├── controllers/     # Controladores
│   ├── middleware/      # Middlewares
│   ├── models/          # Modelos
│   ├── routes/          # Rutas
│   ├── services/        # Servicios
│   ├── sockets/         # WebSockets
│   ├── types/           # Tipos TypeScript
│   └── utils/           # Utilidades
├── docs/                # Documentación
├── scripts/             # Scripts de utilidad
├── tests/               # Tests
└── public/              # Archivos públicos
```

## Firebase Setup

### 1. Crear Proyecto Firebase

```bash
# 1. Ir a Firebase Console
# https://console.firebase.google.com/

# 2. Crear nuevo proyecto
# - Nombre: "mussikon-api"
# - ID: "mussikon-api-xxxxx"
# - Habilitar Google Analytics (opcional)

# 3. Configurar proyecto
firebase login
firebase init
```

### 2. Configurar Firestore

```typescript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Músicos
    match /musicians/{musicianId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == musicianId;
    }
    
    // Eventos
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.organizerId;
    }
    
    // Mensajes
    match /conversations/{conversationId}/messages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
  }
}
```

### 3. Configurar Storage

```typescript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Imágenes de perfil
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Imágenes de eventos
    match /events/{eventId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Vouchers
    match /vouchers/{voucherId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Configurar Authentication

```typescript
// Habilitar proveedores en Firebase Console:
// - Email/Password
// - Google
// - Phone (opcional)

// Configurar plantillas de email
const emailTemplates = {
  verification: {
    subject: 'Verifica tu cuenta de MussikOn',
    body: 'Haz clic en el enlace para verificar tu cuenta: {{link}}'
  },
  passwordReset: {
    subject: 'Restablece tu contraseña de MussikOn',
    body: 'Haz clic en el enlace para restablecer tu contraseña: {{link}}'
  }
};
```

### 5. Configurar Functions

```bash
# Inicializar Firebase Functions
firebase init functions

# Configurar TypeScript
cd functions
npm install typescript @types/node
```

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Exportar funciones
export const api = functions.https.onRequest(require('./api'));
export const scheduledBackup = functions.pubsub.schedule('every 24 hours').onRun(require('./scheduledBackup'));
```

## IDrive E2 Setup

### 1. Crear Cuenta IDrive E2

```bash
# 1. Ir a IDrive E2 Console
# https://www.idrive.com/e2/

# 2. Crear cuenta y obtener credenciales
# - Access Key ID
# - Secret Access Key
# - Endpoint URL
# - Region
```

### 2. Configurar Bucket

```typescript
// Configuración del bucket
const bucketConfig = {
  name: 'mussikon-images',
  region: 'us-east-1',
  versioning: true,
  encryption: 'AES256',
  lifecycle: {
    rules: [
      {
        id: 'delete-old-versions',
        status: 'Enabled',
        noncurrentVersionExpiration: {
          noncurrentDays: 30
        }
      }
    ]
  }
};
```

### 3. Configurar CORS

```typescript
// Configuración CORS para IDrive E2
const corsConfig = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
      AllowedOrigins: [
        'https://mussikon.com',
        'https://admin.mussikon.com',
        'http://localhost:3000'
      ],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3000
    }
  ]
};
```

### 4. Configurar Políticas de Bucket

```typescript
// Política de bucket para acceso público a imágenes
const bucketPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'PublicReadGetObject',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: 'arn:aws:s3:::mussikon-images/public/*'
    }
  ]
};
```

### 5. Verificar Configuración

```typescript
// Script de verificación
import { S3Client, ListBucketsCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const verifyIDriveSetup = async () => {
  const client = new S3Client({
    endpoint: process.env.IDRIVE_ENDPOINT,
    region: process.env.IDRIVE_REGION,
    credentials: {
      accessKeyId: process.env.IDRIVE_ACCESS_KEY!,
      secretAccessKey: process.env.IDRIVE_SECRET_KEY!
    }
  });

  try {
    // Verificar conexión
    const buckets = await client.send(new ListBucketsCommand({}));
    console.log('Buckets disponibles:', buckets.Buckets?.map(b => b.Name));

    // Verificar bucket específico
    const testKey = 'test/connection-test.txt';
    await client.send(new PutObjectCommand({
      Bucket: process.env.IDRIVE_BUCKET,
      Key: testKey,
      Body: 'Connection test successful'
    }));

    console.log('IDrive E2 configurado correctamente');
  } catch (error) {
    console.error('Error en configuración IDrive:', error);
  }
};
```

## Stripe Setup

### 1. Crear Cuenta Stripe

```bash
# 1. Ir a Stripe Dashboard
# https://dashboard.stripe.com/

# 2. Crear cuenta y obtener claves
# - Publishable Key (pk_test_...)
# - Secret Key (sk_test_...)
# - Webhook Secret (whsec_...)
```

### 2. Configurar Productos

```typescript
// Configurar productos en Stripe Dashboard
const products = [
  {
    name: 'Músico Premium',
    description: 'Acceso premium para músicos',
    price: 999, // $9.99 USD
    currency: 'usd',
    interval: 'month'
  },
  {
    name: 'Organizador Premium',
    description: 'Acceso premium para organizadores',
    price: 1499, // $14.99 USD
    currency: 'usd',
    interval: 'month'
  }
];
```

### 3. Configurar Webhooks

```typescript
// Endpoints de webhook necesarios
const webhookEndpoints = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
];

// URL del webhook
const webhookUrl = 'https://tu-dominio.com/api/webhooks/stripe';
```

### 4. Configurar Métodos de Pago

```typescript
// Configurar métodos de pago soportados
const paymentMethods = [
  'card', // Tarjetas de crédito/débito
  'sepa_debit', // Transferencias SEPA (Europa)
  'sofort', // Sofort (Alemania)
  'ideal', // iDEAL (Países Bajos)
  'bancontact' // Bancontact (Bélgica)
];

// Configurar monedas soportadas
const supportedCurrencies = [
  'usd', // Dólar estadounidense
  'eur', // Euro
  'mxn', // Peso mexicano
  'cop', // Peso colombiano
  'ars'  // Peso argentino
];
```

### 5. Verificar Configuración

```typescript
// Script de verificación Stripe
import Stripe from 'stripe';

const verifyStripeSetup = async () => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    // Verificar cuenta
    const account = await stripe.accounts.retrieve();
    console.log('Cuenta Stripe:', account.id);
    console.log('Cobros habilitados:', account.charges_enabled);
    console.log('Pagos habilitados:', account.payouts_enabled);

    // Verificar productos
    const products = await stripe.products.list({ limit: 10 });
    console.log('Productos configurados:', products.data.length);

    // Verificar webhooks
    const webhooks = await stripe.webhookEndpoints.list();
    console.log('Webhooks configurados:', webhooks.data.length);

    console.log('Stripe configurado correctamente');
  } catch (error) {
    console.error('Error en configuración Stripe:', error);
  }
};
```

## Variables de Entorno

### 1. Archivo .env

```bash
# .env
# ===== CONFIGURACIÓN GENERAL =====
NODE_ENV=development
PORT=3000
API_VERSION=v1

# ===== FIREBASE =====
FIREBASE_PROJECT_ID=mussikon-api-xxxxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@mussikon-api-xxxxx.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=mussikon-api-xxxxx.appspot.com

# ===== IDRIVE E2 =====
IDRIVE_ENDPOINT=https://s3.us-east-1.idrive.com
IDRIVE_REGION=us-east-1
IDRIVE_ACCESS_KEY=tu-access-key
IDRIVE_SECRET_KEY=tu-secret-key
IDRIVE_BUCKET=mussikon-images

# ===== STRIPE =====
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ===== JWT =====
JWT_SECRET=tu-jwt-secret-super-seguro
JWT_EXPIRES_IN=7d

# ===== EMAIL =====
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# ===== PUSH NOTIFICATIONS =====
EXPO_ACCESS_TOKEN=tu-expo-access-token

# ===== REDIS (opcional) =====
REDIS_URL=redis://localhost:6379

# ===== MONITORING =====
SENTRY_DSN=https://...
LOG_LEVEL=debug
```

### 2. Configuración por Entorno

```typescript
// config/environments.ts
export const environments = {
  development: {
    port: 3000,
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    },
    database: {
      host: 'localhost',
      port: 6379
    }
  },
  
  staging: {
    port: process.env.PORT || 3000,
    cors: {
      origin: ['https://staging.mussikon.com'],
      credentials: true
    },
    database: {
      host: process.env.REDIS_URL
    }
  },
  
  production: {
    port: process.env.PORT || 3000,
    cors: {
      origin: ['https://mussikon.com', 'https://admin.mussikon.com'],
      credentials: true
    },
    database: {
      host: process.env.REDIS_URL
    }
  }
};
```

### 3. Validación de Variables

```typescript
// utils/validateEnv.ts
import { config } from 'dotenv';

config();

const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'IDRIVE_ENDPOINT',
  'IDRIVE_ACCESS_KEY',
  'IDRIVE_SECRET_KEY',
  'STRIPE_SECRET_KEY',
  'JWT_SECRET'
];

const validateEnvironment = () => {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
  }
  
  console.log('✅ Todas las variables de entorno están configuradas');
};

export { validateEnvironment };
```

## Base de Datos

### 1. Configurar Firestore

```typescript
// config/firebase.ts
import * as admin from 'firebase-admin';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
```

### 2. Crear Índices

```typescript
// scripts/createIndexes.ts
import { db } from '../config/firebase';

const createIndexes = async () => {
  const indexes = [
    // Índice para búsqueda de músicos
    {
      collectionGroup: 'musicians',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'rating', order: 'DESCENDING' },
        { fieldPath: 'location', order: 'ASCENDING' }
      ]
    },
    
    // Índice para eventos por organizador
    {
      collectionGroup: 'events',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'organizerId', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'ASCENDING' }
      ]
    },
    
    // Índice para mensajes por conversación
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
      await db.createIndex(index);
      console.log(`✅ Índice creado: ${index.collectionGroup}`);
    } catch (error) {
      if (error.code !== 6) { // Already exists
        console.error(`❌ Error creando índice: ${error.message}`);
      }
    }
  }
};

createIndexes();
```

### 3. Configurar Reglas de Seguridad

```typescript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Función helper para verificar autenticación
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función helper para verificar rol
    function hasRole(role) {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    // Función helper para verificar propiedad
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Usuarios
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      allow read: if hasRole('admin');
    }
    
    // Músicos
    match /musicians/{musicianId} {
      allow read: if true;
      allow write: if isOwner(musicianId);
      allow update: if hasRole('admin');
    }
    
    // Eventos
    match /events/{eventId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource.data.organizerId);
    }
    
    // Conversaciones
    match /conversations/{conversationId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid in resource.data.participants;
    }
    
    // Mensajes
    match /conversations/{conversationId}/messages/{messageId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
    }
  }
}
```

## Autenticación

### 1. Configurar JWT

```typescript
// config/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (payload: any): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'mussikon-api',
    audience: 'mussikon-users'
  });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'mussikon-api',
      audience: 'mussikon-users'
    });
  } catch (error) {
    throw new Error('Token inválido');
  }
};
```

### 2. Configurar Middleware de Autenticación

```typescript
// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { verifyToken } from '../config/jwt';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
        code: 'AUTH_001'
      });
    }

    // Verificar JWT
    const decoded = verifyToken(token);
    
    // Verificar usuario en Firebase
    const userRecord = await auth.getUser(decoded.uid);
    
    // Agregar usuario a request
    req.user = {
      uid: userRecord.uid,
      email: userRecord.email,
      role: decoded.role || 'user'
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid token',
      code: 'AUTH_002'
    });
  }
};
```

### 3. Configurar Roles y Permisos

```typescript
// middleware/requireRole.ts
import { Request, Response, NextFunction } from 'express';

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_003'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'AUTH_004'
      });
    }

    next();
  };
};

// Uso
app.get('/admin/users', 
  authMiddleware, 
  requireRole(['admin', 'super_admin']), 
  adminController.getUsers
);
```

## Notificaciones

### 1. Configurar Email

```typescript
// config/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
};
```

### 2. Configurar Push Notifications

```typescript
// config/pushNotifications.ts
import { Expo } from 'expo-server-sdk';

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN
});

export const sendPushNotification = async (
  tokens: string[],
  message: {
    title: string;
    body: string;
    data?: any;
  }
) => {
  const messages = tokens
    .filter(token => Expo.isExpoPushToken(token))
    .map(token => ({
      to: token,
      sound: 'default',
      title: message.title,
      body: message.body,
      data: message.data
    }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error enviando notificaciones:', error);
    }
  }

  return tickets;
};
```

### 3. Configurar Templates

```typescript
// templates/emailTemplates.ts
export const emailTemplates = {
  welcome: (userName: string) => ({
    subject: '¡Bienvenido a MussikOn!',
    html: `
      <h1>¡Hola ${userName}!</h1>
      <p>Gracias por registrarte en MussikOn.</p>
      <p>Ya puedes comenzar a explorar músicos y crear eventos.</p>
    `
  }),
  
  eventReminder: (eventName: string, date: string) => ({
    subject: 'Recordatorio de Evento',
    html: `
      <h1>Recordatorio</h1>
      <p>Tu evento "${eventName}" está programado para ${date}.</p>
      <p>¡No olvides prepararte!</p>
    `
  }),
  
  newMessage: (senderName: string) => ({
    subject: 'Nuevo mensaje',
    html: `
      <h1>Nuevo mensaje</h1>
      <p>${senderName} te ha enviado un mensaje.</p>
      <p>Inicia sesión para verlo.</p>
    `
  })
};
```

## Monitoreo

### 1. Configurar Logging

```typescript
// config/logging.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
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

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export { logger };
```

### 2. Configurar Métricas

```typescript
// config/metrics.ts
import { logger } from './logging';

class MetricsCollector {
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

  async saveMetrics() {
    const metricsData = {
      timestamp: new Date(),
      metrics: Object.fromEntries(
        Array.from(this.metrics.entries()).map(([key, values]) => [
          key,
          {
            average: this.getAverage(key),
            count: values.length,
            min: Math.min(...values),
            max: Math.max(...values)
          }
        ])
      )
    };

    logger.info('Métricas guardadas', metricsData);
    return metricsData;
  }
}

export const metrics = new MetricsCollector();
```

### 3. Configurar Health Checks

```typescript
// config/health.ts
import { db, auth } from './firebase';
import { verifyStripeConnection } from '../services/stripeService';
import { verifyIDriveConnection } from '../services/idriveService';

export const healthCheck = async () => {
  const checks = {
    database: false,
    authentication: false,
    stripe: false,
    idrive: false,
    timestamp: new Date()
  };

  try {
    // Verificar Firestore
    await db.collection('health').doc('test').get();
    checks.database = true;
  } catch (error) {
    console.error('Database check failed:', error);
  }

  try {
    // Verificar Auth
    await auth.listUsers(1);
    checks.authentication = true;
  } catch (error) {
    console.error('Auth check failed:', error);
  }

  try {
    // Verificar Stripe
    const stripeStatus = await verifyStripeConnection();
    checks.stripe = stripeStatus.status === 'connected';
  } catch (error) {
    console.error('Stripe check failed:', error);
  }

  try {
    // Verificar IDrive
    const idriveStatus = await verifyIDriveConnection();
    checks.idrive = idriveStatus.status === 'connected';
  } catch (error) {
    console.error('IDrive check failed:', error);
  }

  return checks;
};
```

## Deployment

### 1. Configurar Firebase Functions

```typescript
// functions/package.json
{
  "name": "functions",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "lib/index.js",
  "dependencies": {
    "firebase-admin": "^11.8.0",
    "firebase-functions": "^4.3.1",
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "typescript": "^4.9.0",
    "@types/node": "^18.0.0"
  },
  "private": true
}
```

### 2. Configurar Firebase Hosting

```json
// firebase.json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### 3. Scripts de Deployment

```bash
#!/bin/bash
# scripts/deploy.sh

echo "🚀 Iniciando deployment..."

# Verificar variables de entorno
if [ -z "$FIREBASE_PROJECT_ID" ]; then
  echo "❌ FIREBASE_PROJECT_ID no está configurado"
  exit 1
fi

# Ejecutar tests
echo "🧪 Ejecutando tests..."
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests fallaron"
  exit 1
fi

# Build del proyecto
echo "🔨 Construyendo proyecto..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build falló"
  exit 1
fi

# Deploy a Firebase
echo "📤 Desplegando a Firebase..."
firebase deploy --project $FIREBASE_PROJECT_ID

if [ $? -eq 0 ]; then
  echo "✅ Deployment completado exitosamente"
else
  echo "❌ Deployment falló"
  exit 1
fi
```

### 4. Configurar CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        channelId: live
        projectId: mussikon-api-xxxxx
```

## Siguiente: Documentación de API

Para continuar con la documentación, ve a [Documentación de API](../api/README.md) donde encontrarás la documentación completa de todos los endpoints de la API.

---

**Nota**: Esta documentación se actualiza regularmente. Asegúrate de revisar la versión más reciente antes de realizar configuraciones en producción. 