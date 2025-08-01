# 🔧 Guía de Configuración - MussikOn API

## 📋 Configuración Completa del Proyecto

Esta guía te ayudará a configurar todos los servicios y componentes necesarios para que MussikOn API funcione correctamente.

## 🔐 Configuración de Autenticación

### JWT Configuration

```typescript
// ENV.ts
export const ENV = {
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
```

### Google OAuth Configuration

1. **Crear Proyecto en Google Cloud Console**:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente
   - Habilita la API de Google+ 

2. **Configurar OAuth 2.0**:
   - Ve a "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Tipo: "Web application"
   - URIs autorizados: `http://localhost:3001/auth/google/callback`
   - URIs de redirección: `http://localhost:3001/auth/google/callback`

3. **Configurar en ENV.ts**:
   ```typescript
   GOOGLE_CLIENT_ID: 'your-google-client-id',
   GOOGLE_CLIENT_SECRET: 'your-google-client-secret',
   ```

## 🔥 Configuración de Firebase

### 1. Configuración del Proyecto

```typescript
// ENV.ts
export const ENV = {
  FIREBASE_PROJECT_ID: 'your-project-id',
  FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
  FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com',
  FIREBASE_DATABASE_URL: 'https://your-project-id.firebaseio.com',
};
```

### 2. Configurar Firestore

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && request.auth.token.role == 'admin';
    }
    
    // Eventos
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.organizerId || 
         request.auth.token.role == 'admin');
    }
    
    // Solicitudes de músicos
    match /musicianRequests/{requestId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.musicianId || 
         request.auth.uid == resource.data.eventId);
    }
  }
}
```

### 3. Configurar Authentication

```javascript
// firebase.json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions"
  },
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

## ☁️ Configuración de AWS S3 (iDrive E2)

### 1. Configuración Básica

```typescript
// ENV.ts
export const ENV = {
  AWS_ACCESS_KEY_ID: 'your-access-key',
  AWS_SECRET_ACCESS_KEY: 'your-secret-key',
  AWS_REGION: 'us-east-1', // o tu región preferida
  AWS_BUCKET_NAME: 'mussikon-assets',
  AWS_BUCKET_URL: 'https://mussikon-assets.s3.amazonaws.com',
};
```

### 2. Configuración de CORS

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "HEAD"
    ],
    "AllowedOrigins": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ]
  }
]
```

### 3. Configuración de Bucket

```bash
# Crear bucket
aws s3 mb s3://mussikon-assets

# Configurar CORS
aws s3api put-bucket-cors --bucket mussikon-assets --cors-configuration file://cors.json

# Configurar política de bucket
aws s3api put-bucket-policy --bucket mussikon-assets --policy file://bucket-policy.json
```

## 💳 Configuración de Pagos (Stripe)

### 1. Configuración de Stripe

```typescript
// ENV.ts
export const ENV = {
  STRIPE_SECRET_KEY: 'sk_test_...',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_...',
  STRIPE_WEBHOOK_SECRET: 'whsec_...',
  STRIPE_CURRENCY: 'usd',
};
```

### 2. Configurar Webhooks

```bash
# Instalar Stripe CLI
stripe listen --forward-to localhost:3001/webhooks/stripe

# Configurar webhook en Stripe Dashboard
# URL: https://your-domain.com/webhooks/stripe
# Events: payment_intent.succeeded, payment_intent.payment_failed
```

### 3. Configuración de Productos

```typescript
// Configurar productos en Stripe Dashboard
const products = {
  eventBooking: {
    name: 'Event Booking',
    price: 5000, // $50.00
    currency: 'usd',
    recurring: false
  },
  subscription: {
    name: 'Premium Subscription',
    price: 999, // $9.99
    currency: 'usd',
    recurring: 'month'
  }
};
```

## 🗺️ Configuración de Google Maps

### 1. Configuración de API Key

```typescript
// ENV.ts
export const ENV = {
  GOOGLE_MAPS_API_KEY: 'your-google-maps-api-key',
  GOOGLE_MAPS_ENABLE_BILLING: true,
};
```

### 2. Habilitar APIs Necesarias

En Google Cloud Console, habilita las siguientes APIs:
- Maps JavaScript API
- Geocoding API
- Directions API
- Places API
- Distance Matrix API

### 3. Configurar Restricciones

```javascript
// Restricciones de API Key
{
  "applicationRestrictions": {
    "httpReferrers": [
      "http://localhost:3001/*",
      "https://your-domain.com/*"
    ]
  },
  "apiTargets": [
    {
      "target": "Maps JavaScript API"
    },
    {
      "target": "Geocoding API"
    },
    {
      "target": "Directions API"
    }
  ]
}
```

## 📧 Configuración de Email

### 1. Configuración de Nodemailer

```typescript
// ENV.ts
export const ENV = {
  EMAIL_HOST: 'smtp.gmail.com',
  EMAIL_PORT: 587,
  EMAIL_USER: 'your-email@gmail.com',
  EMAIL_PASS: 'your-app-password',
  EMAIL_FROM: 'noreply@mussikon.com',
};
```

### 2. Configurar Gmail App Password

1. Ve a tu cuenta de Google
2. Seguridad → Verificación en dos pasos
3. Contraseñas de aplicación
4. Generar nueva contraseña para "MussikOn API"

## 🔔 Configuración de Notificaciones Push

### 1. Configuración de Expo

```typescript
// ENV.ts
export const ENV = {
  EXPO_ACCESS_TOKEN: 'your-expo-access-token',
  EXPO_PROJECT_ID: 'your-expo-project-id',
};
```

### 2. Configurar Expo Push Notifications

```bash
# Instalar Expo CLI
npm install -g @expo/cli

# Iniciar sesión
expo login

# Configurar proyecto
expo init MussikOnMobile
```

## 🚀 Configuración de Producción

### 1. Variables de Entorno de Producción

```bash
# .env.production
NODE_ENV=production
PORT=3001
FIREBASE_PROJECT_ID=your-production-project
AWS_BUCKET_NAME=your-production-bucket
STRIPE_SECRET_KEY=sk_live_...
GOOGLE_MAPS_API_KEY=your-production-api-key
```

### 2. Configuración de Logging

```typescript
// ENV.ts
export const ENV = {
  LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  LOG_FILE: process.env.NODE_ENV === 'production' ? '/var/log/mussikon/app.log' : null,
};
```

### 3. Configuración de Rate Limiting

```typescript
// middleware/rateLimit.ts
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Demasiadas requests desde esta IP',
  standardHeaders: true,
  legacyHeaders: false,
};
```

## 🔒 Configuración de Seguridad

### 1. Configuración de CORS

```typescript
// ENV.ts
export const ENV = {
  CORS_ORIGIN: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com', 'https://www.your-domain.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  CORS_CREDENTIALS: true,
};
```

### 2. Configuración de Helmet

```typescript
// middleware/security.ts
import helmet from 'helmet';

export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
};
```

## 📊 Configuración de Monitoreo

### 1. Configuración de Logging

```typescript
// services/loggerService.ts
export const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
};
```

### 2. Configuración de Health Checks

```typescript
// routes/health.ts
export const healthCheckConfig = {
  timeout: 5000,
  interval: 30000,
  unhealthyThreshold: 2,
  healthyThreshold: 1,
};
```

## 🔧 Scripts de Configuración

### 1. Script de Inicialización

```bash
#!/bin/bash
# scripts/init.sh

echo "🚀 Inicializando MussikOn API..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Configurar variables de entorno
echo "🔧 Configurando variables de entorno..."
cp ENV_example.ts ENV.ts

# Compilar proyecto
echo "🔨 Compilando proyecto..."
npm run build

# Verificar configuración
echo "✅ Verificando configuración..."
npm run test:config

echo "🎉 Configuración completada!"
```

### 2. Script de Verificación

```bash
#!/bin/bash
# scripts/verify.sh

echo "🔍 Verificando configuración..."

# Verificar variables de entorno
if [ ! -f "ENV.ts" ]; then
    echo "❌ ENV.ts no encontrado"
    exit 1
fi

# Verificar Firebase
firebase projects:list | grep -q "$FIREBASE_PROJECT_ID" || {
    echo "❌ Configuración de Firebase incorrecta"
    exit 1
}

# Verificar AWS S3
aws s3 ls s3://$AWS_BUCKET_NAME || {
    echo "❌ Configuración de AWS S3 incorrecta"
    exit 1
}

echo "✅ Configuración verificada correctamente"
```

## 📚 Próximos Pasos

1. **Configurar Base de Datos**: [Guía de Firestore](../development/firestore-setup.md)
2. **Configurar Autenticación**: [Guía de JWT](../security/authentication.md)
3. **Configurar Pagos**: [Guía de Stripe](../api/payments.md)
4. **Desplegar en Producción**: [Guía de Despliegue](../deployment/firebase.md)

---

**¿Necesitas ayuda?** Consulta la [guía de solución de problemas](../troubleshooting.md) o contacta al equipo de desarrollo. 