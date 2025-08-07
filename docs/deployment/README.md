# 🚀 Documentación de Deployment - MussikOn API

## 📋 Índice

- [Descripción General](#descripción-general)
- [Configuración de Firebase](#configuración-de-firebase)
- [Variables de Entorno](#variables-de-entorno)
- [Deployment a Firebase](#deployment-a-firebase)
- [Configuración de Dominio](#configuración-de-dominio)
- [Monitoreo y Logs](#monitoreo-y-logs)
- [Backup y Recuperación](#backup-y-recuperación)
- [CI/CD Pipeline](#cicd-pipeline)
- [Optimización de Performance](#optimización-de-performance)
- [Siguiente: Documentación de Seguridad](#siguiente-documentación-de-seguridad)

## Descripción General

Esta documentación cubre el proceso completo de deployment de la API de MussikOn utilizando Firebase como plataforma principal. Incluye configuración de entornos, monitoreo, backup y optimización para producción.

### Entornos Disponibles
- **Development**: `http://localhost:3000`
- **Staging**: `https://staging-api.mussikon.com`
- **Production**: `https://api.mussikon.com`

## Configuración de Firebase

### 1. Instalación de Firebase CLI

```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Verificar instalación
firebase --version

# Login a Firebase
firebase login
```

### 2. Configuración del Proyecto

```bash
# Inicializar proyecto Firebase
firebase init

# Seleccionar servicios:
# ✅ Firestore
# ✅ Functions
# ✅ Hosting
# ✅ Storage
# ✅ Emulators (opcional para desarrollo)
```

### 3. Configuración de firebase.json

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18",
    "codebase": "default"
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
        "source": "/api-docs/**",
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
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=86400"
          }
        ]
      }
    ]
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### 4. Configuración de .firebaserc

```json
{
  "projects": {
    "default": "mussikon-api-prod",
    "staging": "mussikon-api-staging",
    "development": "mussikon-api-dev"
  }
}
```

## Variables de Entorno

### 1. Configuración por Entorno

```bash
# Development
firebase functions:config:set development.firebase_project_id="mussikon-api-dev" \
  development.idrive_endpoint="https://s3.us-east-1.idrive.com" \
  development.stripe_secret_key="sk_test_..." \
  development.jwt_secret="dev-secret-key"

# Staging
firebase functions:config:set staging.firebase_project_id="mussikon-api-staging" \
  staging.idrive_endpoint="https://s3.us-east-1.idrive.com" \
  staging.stripe_secret_key="sk_test_..." \
  staging.jwt_secret="staging-secret-key"

# Production
firebase functions:config:set production.firebase_project_id="mussikon-api-prod" \
  production.idrive_endpoint="https://s3.us-east-1.idrive.com" \
  production.stripe_secret_key="sk_live_..." \
  production.jwt_secret="prod-secret-key"
```

### 2. Script de Configuración Automática

```bash
#!/bin/bash
# scripts/setup-env.sh

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
  echo "Uso: ./setup-env.sh [development|staging|production]"
  exit 1
fi

echo "🔧 Configurando variables de entorno para $ENVIRONMENT..."

case $ENVIRONMENT in
  "development")
    firebase use development
    firebase functions:config:set \
      firebase.project_id="mussikon-api-dev" \
      idrive.endpoint="https://s3.us-east-1.idrive.com" \
      idrive.access_key="$IDRIVE_ACCESS_KEY" \
      idrive.secret_key="$IDRIVE_SECRET_KEY" \
      stripe.secret_key="$STRIPE_SECRET_KEY" \
      jwt.secret="$JWT_SECRET" \
      smtp.host="$SMTP_HOST" \
      smtp.user="$SMTP_USER" \
      smtp.pass="$SMTP_PASS" \
      expo.access_token="$EXPO_ACCESS_TOKEN"
    ;;
  "staging")
    firebase use staging
    firebase functions:config:set \
      firebase.project_id="mussikon-api-staging" \
      idrive.endpoint="https://s3.us-east-1.idrive.com" \
      idrive.access_key="$IDRIVE_ACCESS_KEY" \
      idrive.secret_key="$IDRIVE_SECRET_KEY" \
      stripe.secret_key="$STRIPE_SECRET_KEY" \
      jwt.secret="$JWT_SECRET" \
      smtp.host="$SMTP_HOST" \
      smtp.user="$SMTP_USER" \
      smtp.pass="$SMTP_PASS" \
      expo.access_token="$EXPO_ACCESS_TOKEN"
    ;;
  "production")
    firebase use production
    firebase functions:config:set \
      firebase.project_id="mussikon-api-prod" \
      idrive.endpoint="https://s3.us-east-1.idrive.com" \
      idrive.access_key="$IDRIVE_ACCESS_KEY" \
      idrive.secret_key="$IDRIVE_SECRET_KEY" \
      stripe.secret_key="$STRIPE_SECRET_KEY" \
      jwt.secret="$JWT_SECRET" \
      smtp.host="$SMTP_HOST" \
      smtp.user="$SMTP_USER" \
      smtp.pass="$SMTP_PASS" \
      expo.access_token="$EXPO_ACCESS_TOKEN"
    ;;
  *)
    echo "❌ Entorno no válido: $ENVIRONMENT"
    exit 1
    ;;
esac

echo "✅ Variables de entorno configuradas para $ENVIRONMENT"
```

### 3. Configuración en Functions

```typescript
// functions/src/config/environment.ts
import * as functions from 'firebase-functions';

const config = functions.config();

export const environment = {
  firebase: {
    projectId: config.firebase?.project_id || process.env.FIREBASE_PROJECT_ID
  },
  idrive: {
    endpoint: config.idrive?.endpoint || process.env.IDRIVE_ENDPOINT,
    accessKey: config.idrive?.access_key || process.env.IDRIVE_ACCESS_KEY,
    secretKey: config.idrive?.secret_key || process.env.IDRIVE_SECRET_KEY
  },
  stripe: {
    secretKey: config.stripe?.secret_key || process.env.STRIPE_SECRET_KEY
  },
  jwt: {
    secret: config.jwt?.secret || process.env.JWT_SECRET
  },
  smtp: {
    host: config.smtp?.host || process.env.SMTP_HOST,
    user: config.smtp?.user || process.env.SMTP_USER,
    pass: config.smtp?.pass || process.env.SMTP_PASS
  },
  expo: {
    accessToken: config.expo?.access_token || process.env.EXPO_ACCESS_TOKEN
  }
};
```

## Deployment a Firebase

### 1. Script de Deployment Completo

```bash
#!/bin/bash
# scripts/deploy.sh

ENVIRONMENT=$1
VERSION=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$VERSION" ]; then
  echo "Uso: ./deploy.sh [development|staging|production] [version]"
  echo "Ejemplo: ./deploy.sh production v1.2.0"
  exit 1
fi

echo "🚀 Iniciando deployment a $ENVIRONMENT (v$VERSION)..."

# Verificar que estamos en el branch correcto
if [ "$ENVIRONMENT" = "production" ] && [ "$(git branch --show-current)" != "main" ]; then
  echo "❌ Error: Deploy a producción solo desde branch main"
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

# Cambiar a entorno correcto
echo "🔄 Cambiando a entorno $ENVIRONMENT..."
firebase use $ENVIRONMENT

# Deploy de Functions
echo "📤 Desplegando Functions..."
firebase deploy --only functions

# Deploy de Firestore Rules
echo "📤 Desplegando Firestore Rules..."
firebase deploy --only firestore:rules

# Deploy de Firestore Indexes
echo "📤 Desplegando Firestore Indexes..."
firebase deploy --only firestore:indexes

# Deploy de Storage Rules
echo "📤 Desplegando Storage Rules..."
firebase deploy --only storage

# Deploy de Hosting
echo "📤 Desplegando Hosting..."
firebase deploy --only hosting

# Crear tag de versión
echo "🏷️ Creando tag v$VERSION..."
git tag -a "v$VERSION" -m "Deploy v$VERSION to $ENVIRONMENT"
git push origin "v$VERSION"

# Registrar deployment
echo "📝 Registrando deployment..."
firebase functions:config:get > .firebaserc.$ENVIRONMENT.json

echo "✅ Deployment completado exitosamente!"
echo "🌐 URL: https://$(firebase projects:list | grep $ENVIRONMENT | awk '{print $2}').web.app"
```

### 2. Deployment Selectivo

```bash
# Deploy solo Functions
firebase deploy --only functions

# Deploy solo Hosting
firebase deploy --only hosting

# Deploy solo Firestore
firebase deploy --only firestore

# Deploy solo Storage
firebase deploy --only storage

# Deploy específico de Functions
firebase deploy --only functions:api,functions:auth
```

### 3. Rollback de Deployment

```bash
#!/bin/bash
# scripts/rollback.sh

ENVIRONMENT=$1
VERSION=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$VERSION" ]; then
  echo "Uso: ./rollback.sh [environment] [version]"
  echo "Ejemplo: ./rollback.sh production v1.1.0"
  exit 1
fi

echo "🔄 Iniciando rollback a v$VERSION en $ENVIRONMENT..."

# Cambiar a entorno correcto
firebase use $ENVIRONMENT

# Checkout a versión anterior
git checkout "v$VERSION"

# Deploy de Functions
firebase deploy --only functions

# Deploy de Hosting
firebase deploy --only hosting

# Volver a branch original
git checkout main

echo "✅ Rollback completado a v$VERSION"
```

## Configuración de Dominio

### 1. Configuración de Dominio Personalizado

```bash
# Agregar dominio personalizado
firebase hosting:channel:deploy production --expires 30d

# Configurar dominio
firebase hosting:sites:add api.mussikon.com

# Verificar configuración
firebase hosting:sites:list
```

### 2. Configuración de SSL

```json
// firebase.json
{
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
        "source": "**",
        "headers": [
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          }
        ]
      }
    ]
  }
}
```

### 3. Configuración de DNS

```bash
# Verificar configuración DNS
firebase hosting:sites:get api.mussikon.com

# Configurar registros DNS:
# A     api.mussikon.com    151.101.1.195
# A     api.mussikon.com    151.101.65.195
# CNAME www.api.mussikon.com api.mussikon.com
```

## Monitoreo y Logs

### 1. Configuración de Logging

```typescript
// functions/src/utils/logger.ts
import * as functions from 'firebase-functions';

export const logger = {
  info: (message: string, data?: any) => {
    functions.logger.info(message, data);
  },
  warn: (message: string, data?: any) => {
    functions.logger.warn(message, data);
  },
  error: (message: string, error?: any) => {
    functions.logger.error(message, error);
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      functions.logger.debug(message, data);
    }
  }
};
```

### 2. Monitoreo de Functions

```typescript
// functions/src/middleware/monitoring.ts
import * as functions from 'firebase-functions';
import { logger } from '../utils/logger';

export const monitorFunction = (functionName: string) => {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    // Log inicio de función
    logger.info(`Function ${functionName} started`, {
      functionName,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
    
    // Interceptar respuesta
    const originalSend = res.send;
    res.send = function(data: any) {
      const duration = Date.now() - startTime;
      
      // Log fin de función
      logger.info(`Function ${functionName} completed`, {
        functionName,
        duration,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      });
      
      // Alertar si la función es lenta
      if (duration > 5000) {
        logger.warn(`Function ${functionName} is slow`, {
          functionName,
          duration,
          threshold: 5000
        });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};
```

### 3. Métricas de Performance

```typescript
// functions/src/services/metrics.ts
import * as admin from 'firebase-admin';

export class MetricsService {
  private db = admin.firestore();
  
  async recordMetric(name: string, value: number, tags: any = {}) {
    const metric = {
      name,
      value,
      tags,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await this.db.collection('metrics').add(metric);
  }
  
  async recordFunctionExecution(functionName: string, duration: number, success: boolean) {
    await this.recordMetric('function_execution', duration, {
      function: functionName,
      success,
      environment: process.env.NODE_ENV
    });
  }
  
  async recordAPICall(endpoint: string, duration: number, statusCode: number) {
    await this.recordMetric('api_call', duration, {
      endpoint,
      statusCode,
      environment: process.env.NODE_ENV
    });
  }
  
  async getMetrics(name: string, timeRange: { start: Date; end: Date }) {
    const snapshot = await this.db
      .collection('metrics')
      .where('name', '==', name)
      .where('timestamp', '>=', timeRange.start)
      .where('timestamp', '<=', timeRange.end)
      .orderBy('timestamp', 'desc')
      .get();
    
    return snapshot.docs.map(doc => doc.data());
  }
}
```

### 4. Alertas Automáticas

```typescript
// functions/src/services/alerts.ts
import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

export class AlertService {
  private db = admin.firestore();
  
  async sendAlert(type: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical') {
    const alert = {
      type,
      message,
      severity,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      environment: process.env.NODE_ENV
    };
    
    // Guardar alerta en Firestore
    await this.db.collection('alerts').add(alert);
    
    // Log de alerta
    logger.warn(`Alert: ${type}`, alert);
    
    // Enviar notificación si es crítica
    if (severity === 'critical') {
      await this.sendCriticalNotification(alert);
    }
  }
  
  private async sendCriticalNotification(alert: any) {
    // Implementar envío de email/Slack
    logger.error('Critical alert requires immediate attention', alert);
  }
  
  async checkFunctionHealth() {
    const functions = await this.db
      .collection('metrics')
      .where('name', '==', 'function_execution')
      .where('timestamp', '>=', new Date(Date.now() - 5 * 60 * 1000)) // Últimos 5 minutos
      .get();
    
    const avgDuration = functions.docs.reduce((sum, doc) => {
      return sum + doc.data().value;
    }, 0) / functions.docs.length;
    
    if (avgDuration > 3000) { // Más de 3 segundos promedio
      await this.sendAlert(
        'function_performance',
        `Average function execution time is ${avgDuration}ms`,
        'high'
      );
    }
  }
}
```

## Backup y Recuperación

### 1. Backup Automático de Firestore

```typescript
// functions/src/services/backup.ts
import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

export class BackupService {
  private db = admin.firestore();
  private storage = admin.storage();
  
  async createBackup(collection: string) {
    try {
      logger.info(`Starting backup for collection: ${collection}`);
      
      const snapshot = await this.db.collection(collection).get();
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const backup = {
        collection,
        timestamp: new Date().toISOString(),
        count: data.length,
        data
      };
      
      // Guardar en Cloud Storage
      const bucket = this.storage.bucket();
      const fileName = `backups/${collection}_${Date.now()}.json`;
      const file = bucket.file(fileName);
      
      await file.save(JSON.stringify(backup, null, 2), {
        metadata: {
          contentType: 'application/json'
        }
      });
      
      logger.info(`Backup completed for ${collection}: ${fileName}`);
      return backup;
    } catch (error) {
      logger.error(`Backup failed for ${collection}`, error);
      throw error;
    }
  }
  
  async createFullBackup() {
    const collections = ['users', 'musicians', 'events', 'conversations', 'payments'];
    const backups = [];
    
    for (const collection of collections) {
      const backup = await this.createBackup(collection);
      backups.push(backup);
    }
    
    return backups;
  }
  
  async restoreFromBackup(collection: string, backupFile: string) {
    try {
      logger.info(`Starting restore for collection: ${collection}`);
      
      const bucket = this.storage.bucket();
      const file = bucket.file(backupFile);
      
      const [content] = await file.download();
      const backup = JSON.parse(content.toString());
      
      const batch = this.db.batch();
      
      backup.data.forEach((doc: any) => {
        const { id, ...data } = doc;
        const ref = this.db.collection(collection).doc(id);
        batch.set(ref, data);
      });
      
      await batch.commit();
      
      logger.info(`Restore completed for ${collection}: ${backup.data.length} documents`);
      return { restored: backup.data.length };
    } catch (error) {
      logger.error(`Restore failed for ${collection}`, error);
      throw error;
    }
  }
}
```

### 2. Función Programada de Backup

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import { BackupService } from './services/backup';

const backupService = new BackupService();

// Backup diario a las 2 AM
export const scheduledBackup = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('America/Mexico_City')
  .onRun(async (context) => {
    try {
      await backupService.createFullBackup();
      return { success: true, message: 'Daily backup completed' };
    } catch (error) {
      console.error('Scheduled backup failed:', error);
      return { success: false, error: error.message };
    }
  });

// Limpiar backups antiguos (mantener solo 30 días)
export const cleanupOldBackups = functions.pubsub
  .schedule('0 3 * * *')
  .timeZone('America/Mexico_City')
  .onRun(async (context) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const bucket = admin.storage().bucket();
      const [files] = await bucket.getFiles({ prefix: 'backups/' });
      
      const oldFiles = files.filter(file => {
        const createdAt = new Date(file.metadata.timeCreated);
        return createdAt < thirtyDaysAgo;
      });
      
      for (const file of oldFiles) {
        await file.delete();
      }
      
      return { success: true, deleted: oldFiles.length };
    } catch (error) {
      console.error('Backup cleanup failed:', error);
      return { success: false, error: error.message };
    }
  });
```

## CI/CD Pipeline

### 1. GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
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
    
    - name: Run linting
      run: npm run lint
    
    - name: Build
      run: npm run build

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Firebase Staging
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_STAGING }}'
        channelId: live
        projectId: mussikon-api-staging

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Firebase Production
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_PROD }}'
        channelId: live
        projectId: mussikon-api-prod
    
    - name: Create Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: v${{ github.run_number }}
        release_name: Release v${{ github.run_number }}
        body: |
          Automated deployment from main branch
          - Build: ${{ github.run_number }}
          - Commit: ${{ github.sha }}
        draft: false
        prerelease: false
```

### 2. Configuración de Secrets

```bash
# Configurar secrets en GitHub
# FIREBASE_SERVICE_ACCOUNT_STAGING
# FIREBASE_SERVICE_ACCOUNT_PROD
# IDRIVE_ACCESS_KEY
# IDRIVE_SECRET_KEY
# STRIPE_SECRET_KEY
# JWT_SECRET
# SMTP_HOST
# SMTP_USER
# SMTP_PASS
# EXPO_ACCESS_TOKEN
```

## Optimización de Performance

### 1. Configuración de Caching

```typescript
// functions/src/middleware/cache.ts
import * as admin from 'firebase-admin';

export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: any, res: any, next: any) => {
    const cacheKey = `cache:${req.originalUrl}`;
    const cacheRef = admin.firestore().collection('cache').doc(cacheKey);
    
    try {
      const cacheDoc = await cacheRef.get();
      
      if (cacheDoc.exists) {
        const cached = cacheDoc.data();
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < (ttl * 1000)) {
          return res.json(cached.data);
        }
      }
      
      // Interceptar respuesta para cachear
      const originalSend = res.send;
      res.send = function(data: any) {
        // Guardar en cache
        cacheRef.set({
          data: JSON.parse(data),
          timestamp: Date.now()
        });
        
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      // Si falla el cache, continuar sin cache
      next();
    }
  };
};
```

### 2. Optimización de Consultas

```typescript
// functions/src/services/queryOptimizer.ts
export class QueryOptimizer {
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

### 3. Compresión de Respuestas

```typescript
// functions/src/middleware/compression.ts
import compression from 'compression';

export const compressionMiddleware = compression({
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

## Siguiente: Documentación de Seguridad

Para continuar con la documentación, ve a [Documentación de Seguridad](../security/README.md) donde encontrarás información detallada sobre las medidas de seguridad implementadas en la API.

---

**Nota**: Esta documentación se actualiza regularmente. Asegúrate de revisar la versión más reciente antes de realizar deployments en producción. 
**Siguiente**: [Integración Móvil](../mobile-integration/README.md) 