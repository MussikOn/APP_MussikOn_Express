# 🚀 Guía de Deployment - Sistema de Búsqueda Avanzada de Músicos

## 📋 Resumen

Esta guía detalla el proceso completo de deployment del sistema de búsqueda avanzada de músicos, incluyendo configuración de producción, variables de entorno, monitoreo y estrategias de backup.

## 🎯 Estrategia de Deployment

### **🏗️ Arquitectura de Producción**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   CDN (CloudFlare) │    │   Firebase Hosting │
│   (Nginx/Cloud) │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │   Static Assets │    │   Frontend App  │
│   (Firebase)    │    │   (S3/CDN)      │    │   (React)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Backend API   │    │   Firestore DB  │    │   Cloud Storage │
│   (Node.js)     │    │   (Firebase)    │    │   (S3/Firebase) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Monitoring    │    │   Logging       │    │   Analytics     │
│   (Prometheus)  │    │   (Winston)     │    │   (Google)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **📊 Entornos de Deployment**

- **Development**: `dev.mus1k0n.com`
- **Staging**: `staging.mus1k0n.com`
- **Production**: `mus1k0n.com`

## 🛠️ Configuración de Producción

### **1. Variables de Entorno de Producción**

```bash
# .env.production
# ========================================
# CONFIGURACIÓN DE PRODUCCIÓN
# ========================================

# Servidor
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Firebase
FIREBASE_PROJECT_ID=mus1k0n-production
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@mus1k0n-production.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=mus1k0n-production.appspot.com

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro-para-produccion
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id-produccion
GOOGLE_CLIENT_SECRET=tu-google-client-secret-produccion
GOOGLE_REDIRECT_URI=https://mus1k0n.com/auth/google/callback

# AWS S3 / iDrive E2
AWS_ACCESS_KEY_ID=tu-aws-access-key
AWS_SECRET_ACCESS_KEY=tu-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=mus1k0n-production-files
AWS_S3_ENDPOINT=https://s3.us-east-1.amazonaws.com

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Google Maps
GOOGLE_MAPS_API_KEY=tu-google-maps-api-key-produccion
GOOGLE_GEOCODING_API_KEY=tu-google-geocoding-api-key-produccion

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=notifications@mus1k0n.com
EMAIL_PASS=tu-email-password-seguro

# Push Notifications
FIREBASE_MESSAGING_SERVER_KEY=tu-firebase-messaging-server-key

# Monitoreo
PROMETHEUS_PORT=9090
LOG_LEVEL=info
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxx@sentry.io/xxxxx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://mus1k0n.com,https://www.mus1k0n.com

# Cache
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# Database
FIRESTORE_EMULATOR_HOST=
FIRESTORE_PROJECT_ID=mus1k0n-production
```

### **2. Configuración de Firebase**

```javascript
// firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
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
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": ".",
    "runtime": "nodejs18",
    "codebase": "default",
    "ignore": [
      "node_modules",
      ".git",
      "firebase-debug.log",
      "firebase-debug.*.log"
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
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
      "enabled": true
    }
  }
}
```

### **3. Configuración de Nginx**

```nginx
# /etc/nginx/sites-available/mus1k0n.com
server {
    listen 80;
    server_name mus1k0n.com www.mus1k0n.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mus1k0n.com www.mus1k0n.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/mus1k0n.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mus1k0n.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.mus1k0n.com wss://mus1k0n.com;";

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Root Directory
    root /var/www/mus1k0n.com/dist;
    index index.html;

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket Support
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static Files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health Check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Error Pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

## 🚀 Proceso de Deployment

### **1. Script de Deployment Automatizado**

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Iniciando deployment de MussikOn..."

# Variables
ENVIRONMENT=${1:-production}
BRANCH=${2:-main}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_PATH="/var/www/mus1k0n.com"
BACKUP_PATH="/var/backups/mus1k0n.com"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función de logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar que estamos en la rama correcta
log "Verificando rama actual..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    error "Debes estar en la rama $BRANCH para hacer deployment"
fi

# Verificar que no hay cambios pendientes
log "Verificando cambios pendientes..."
if [ -n "$(git status --porcelain)" ]; then
    error "Hay cambios pendientes. Haz commit o stash antes de continuar"
fi

# Pull de los últimos cambios
log "Actualizando código desde $BRANCH..."
git pull origin $BRANCH

# Verificar que los tests pasan
log "Ejecutando tests..."
npm run test:ci || error "Los tests fallaron"

# Build de producción
log "Compilando aplicación..."
npm run build:prod || error "El build falló"

# Crear backup
log "Creando backup..."
if [ -d "$DEPLOY_PATH" ]; then
    mkdir -p "$BACKUP_PATH"
    tar -czf "$BACKUP_PATH/backup_$TIMESTAMP.tar.gz" -C "$DEPLOY_PATH" . || warning "No se pudo crear backup"
fi

# Deploy a Firebase
log "Deployando a Firebase..."
firebase deploy --project mus1k0n-$ENVIRONMENT || error "Deploy a Firebase falló"

# Deploy del backend
log "Deployando backend..."
if [ "$ENVIRONMENT" = "production" ]; then
    # Deploy a servidor de producción
    rsync -avz --delete dist/ user@mus1k0n.com:$DEPLOY_PATH/ || error "Deploy del backend falló"
    
    # Reiniciar servicios
    ssh user@mus1k0n.com "sudo systemctl restart mus1k0n-api" || error "No se pudo reiniciar el servicio"
    ssh user@mus1k0n.com "sudo systemctl restart nginx" || error "No se pudo reiniciar Nginx"
else
    # Deploy a staging
    rsync -avz --delete dist/ user@staging.mus1k0n.com:$DEPLOY_PATH/ || error "Deploy del backend falló"
fi

# Verificar health check
log "Verificando health check..."
sleep 10
if curl -f https://mus1k0n.com/health > /dev/null 2>&1; then
    log "✅ Health check exitoso"
else
    error "❌ Health check falló"
fi

# Limpiar backups antiguos (mantener solo los últimos 7 días)
log "Limpiando backups antiguos..."
find "$BACKUP_PATH" -name "backup_*.tar.gz" -mtime +7 -delete

# Notificar deployment exitoso
log "🎉 Deployment completado exitosamente!"
log "📊 URL: https://mus1k0n.com"
log "📈 Monitoreo: https://monitoring.mus1k0n.com"

# Enviar notificación a Slack/Discord
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🎉 Deployment completado: $ENVIRONMENT - $BRANCH - $(date)\"}" \
        $SLACK_WEBHOOK_URL
fi
```

### **2. Configuración de PM2**

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'mus1k0n-api',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      // Logging
      log_file: '/var/log/mus1k0n/combined.log',
      out_file: '/var/log/mus1k0n/out.log',
      error_file: '/var/log/mus1k0n/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Monitoring
      pmx: true,
      monitoring: true,
      
      // Restart policy
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Environment variables
      env_file: '.env.production',
      
      // Watch mode (development only)
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      
      // Cron jobs
      cron_restart: '0 2 * * *', // Restart at 2 AM daily
      
      // Kill timeout
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Merge logs
      merge_logs: true,
      
      // Source map support
      source_map_support: true,
      
      // Node options
      node_args: '--max-old-space-size=4096'
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'mus1k0n.com',
      ref: 'origin/main',
      repo: 'git@github.com:tu-usuario/APP_MussikOn_Express.git',
      path: '/var/www/mus1k0n.com',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    staging: {
      user: 'deploy',
      host: 'staging.mus1k0n.com',
      ref: 'origin/develop',
      repo: 'git@github.com:tu-usuario/APP_MussikOn_Express.git',
      path: '/var/www/mus1k0n.com',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': ''
    }
  }
};
```

### **3. Configuración de Docker**

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

# Instalar dependencias del sistema
RUN apk add --no-cache python3 make g++

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Imagen de producción
FROM node:18-alpine AS production

# Instalar dumb-init para manejo de señales
RUN apk add --no-cache dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar dependencias y build desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Exponer puerto
EXPOSE 3001

# Cambiar a usuario no-root
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# Comando de inicio
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    depends_on:
      - redis
    networks:
      - mus1k0n-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "dist/health-check.js"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - mus1k0n-network
    restart: unless-stopped
    command: redis-server --appendonly yes

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - api
    networks:
      - mus1k0n-network
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    networks:
      - mus1k0n-network
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - mus1k0n-network
    restart: unless-stopped

volumes:
  redis-data:
  prometheus-data:
  grafana-data:

networks:
  mus1k0n-network:
    driver: bridge
```

## 📊 Monitoreo y Logging

### **1. Configuración de Prometheus**

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert.rules"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'mus1k0n-api'
    static_configs:
      - targets: ['api:3001']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'mus1k0n-nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/nginx_status'
    scrape_interval: 10s

  - job_name: 'mus1k0n-redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 10s
```

### **2. Configuración de Winston**

```typescript
// src/utils/logger.ts
import winston from 'winston';
import { format } from 'winston';

const { combine, timestamp, errors, json, printf, colorize } = format;

// Custom format
const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Production logger
const productionLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'mus1k0n-api' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: '/var/log/mus1k0n/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined logs
    new winston.transports.File({
      filename: '/var/log/mus1k0n/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Console (only in development)
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: combine(
          colorize(),
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          customFormat
        )
      })
    ] : [])
  ],
  
  // Exception handling
  exceptionHandlers: [
    new winston.transports.File({
      filename: '/var/log/mus1k0n/exceptions.log'
    })
  ],
  
  // Rejection handling
  rejectionHandlers: [
    new winston.transports.File({
      filename: '/var/log/mus1k0n/rejections.log'
    })
  ]
});

// Development logger
const developmentLogger = winston.createLogger({
  level: 'debug',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    new winston.transports.Console()
  ]
});

export const logger = process.env.NODE_ENV === 'production' 
  ? productionLogger 
  : developmentLogger;
```

### **3. Métricas de Aplicación**

```typescript
// src/utils/metrics.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

// Métricas de búsqueda
export const searchCounter = new Counter({
  name: 'musician_searches_total',
  help: 'Total number of musician searches',
  labelNames: ['type', 'status']
});

export const searchDuration = new Histogram({
  name: 'musician_search_duration_seconds',
  help: 'Duration of musician searches',
  labelNames: ['type'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

// Métricas de notificaciones
export const notificationCounter = new Counter({
  name: 'notifications_sent_total',
  help: 'Total number of notifications sent',
  labelNames: ['type', 'status', 'channel']
});

// Métricas de usuarios
export const activeUsersGauge = new Gauge({
  name: 'active_users_total',
  help: 'Total number of active users'
});

// Métricas de eventos
export const eventCounter = new Counter({
  name: 'events_created_total',
  help: 'Total number of events created',
  labelNames: ['type', 'status']
});

// Métricas de pagos
export const paymentCounter = new Counter({
  name: 'payments_processed_total',
  help: 'Total number of payments processed',
  labelNames: ['status', 'method']
});

// Métricas de errores
export const errorCounter = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'endpoint']
});

// Métricas de rendimiento
export const responseTimeHistogram = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

// Endpoint para métricas
export const metricsEndpoint = async (req: any, res: any) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
};
```

## 🔒 Seguridad

### **1. Configuración de Helmet**

```typescript
// src/middleware/securityMiddleware.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

export const securityMiddleware = [
  // Helmet para headers de seguridad
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com"],
        connectSrc: ["'self'", "wss://mus1k0n.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }),

  // Rate limiting
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: {
      error: 'Demasiadas requests desde esta IP, intenta de nuevo en 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // CORS
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['https://mus1k0n.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
];
```

### **2. Configuración de SSL**

```bash
#!/bin/bash
# scripts/setup-ssl.sh

# Instalar Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d mus1k0n.com -d www.mus1k0n.com

# Configurar renovación automática
sudo crontab -e

# Agregar esta línea:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 💾 Backup y Recuperación

### **1. Script de Backup**

```bash
#!/bin/bash
# scripts/backup.sh

# Configuración
BACKUP_DIR="/var/backups/mus1k0n"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Crear directorio de backup si no existe
mkdir -p "$BACKUP_DIR"

# Backup de Firestore
echo "📊 Creando backup de Firestore..."
gcloud firestore export gs://mus1k0n-backups/firestore/$TIMESTAMP \
  --project=mus1k0n-production \
  --collection-ids=users,events,musicianRequests,conversations

# Backup de Storage
echo "📁 Creando backup de Storage..."
gsutil -m rsync -r gs://mus1k0n-production-files gs://mus1k0n-backups/storage/$TIMESTAMP

# Backup de logs
echo "📝 Creando backup de logs..."
tar -czf "$BACKUP_DIR/logs_$TIMESTAMP.tar.gz" -C /var/log mus1k0n/

# Backup de configuración
echo "⚙️ Creando backup de configuración..."
tar -czf "$BACKUP_DIR/config_$TIMESTAMP.tar.gz" \
  /etc/nginx/sites-available/mus1k0n.com \
  /etc/systemd/system/mus1k0n-api.service \
  .env.production

# Limpiar backups antiguos
echo "🧹 Limpiando backups antiguos..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
gsutil ls gs://mus1k0n-backups/firestore/ | head -n -$RETENTION_DAYS | xargs -I {} gsutil -m rm -r {}

echo "✅ Backup completado: $TIMESTAMP"
```

### **2. Script de Recuperación**

```bash
#!/bin/bash
# scripts/restore.sh

# Configuración
BACKUP_TIMESTAMP=$1
BACKUP_DIR="/var/backups/mus1k0n"

if [ -z "$BACKUP_TIMESTAMP" ]; then
    echo "❌ Debes especificar el timestamp del backup"
    echo "Uso: ./restore.sh YYYYMMDD_HHMMSS"
    exit 1
fi

echo "🔄 Iniciando recuperación desde backup: $BACKUP_TIMESTAMP"

# Verificar que el backup existe
if [ ! -f "$BACKUP_DIR/logs_$BACKUP_TIMESTAMP.tar.gz" ]; then
    echo "❌ Backup no encontrado: $BACKUP_TIMESTAMP"
    exit 1
fi

# Restaurar logs
echo "📝 Restaurando logs..."
tar -xzf "$BACKUP_DIR/logs_$BACKUP_TIMESTAMP.tar.gz" -C /var/log/

# Restaurar configuración
echo "⚙️ Restaurando configuración..."
tar -xzf "$BACKUP_DIR/config_$BACKUP_TIMESTAMP.tar.gz" -C /

# Restaurar Firestore (si es necesario)
read -p "¿Restaurar Firestore desde backup? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📊 Restaurando Firestore..."
    gcloud firestore import gs://mus1k0n-backups/firestore/$BACKUP_TIMESTAMP \
      --project=mus1k0n-production
fi

# Restaurar Storage (si es necesario)
read -p "¿Restaurar Storage desde backup? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📁 Restaurando Storage..."
    gsutil -m rsync -r gs://mus1k0n-backups/storage/$BACKUP_TIMESTAMP gs://mus1k0n-production-files
fi

# Reiniciar servicios
echo "🔄 Reiniciando servicios..."
sudo systemctl restart nginx
sudo systemctl restart mus1k0n-api

echo "✅ Recuperación completada"
```

## 📈 Monitoreo de Performance

### **1. Dashboard de Grafana**

```json
// grafana-dashboard.json
{
  "dashboard": {
    "title": "MussikOn API Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(errors_total[5m])",
            "legendFormat": "{{type}}"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "active_users_total"
          }
        ]
      }
    ]
  }
}
```

### **2. Alertas**

```yaml
# alert.rules
groups:
  - name: mus1k0n-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "Service {{ $labels.instance }} is down"
```

## 🔧 Scripts de Mantenimiento

### **1. Script de Limpieza**

```bash
#!/bin/bash
# scripts/cleanup.sh

echo "🧹 Iniciando limpieza del sistema..."

# Limpiar logs antiguos
find /var/log/mus1k0n -name "*.log" -mtime +30 -delete

# Limpiar archivos temporales
rm -rf /tmp/mus1k0n-*

# Limpiar cache de npm
npm cache clean --force

# Limpiar backups antiguos
find /var/backups/mus1k0n -name "*.tar.gz" -mtime +7 -delete

# Limpiar Docker (si se usa)
docker system prune -f

echo "✅ Limpieza completada"
```

### **2. Script de Health Check**

```bash
#!/bin/bash
# scripts/health-check.sh

# Configuración
HEALTH_URL="https://mus1k0n.com/health"
SLACK_WEBHOOK_URL="$SLACK_WEBHOOK_URL"

# Función para enviar alerta
send_alert() {
    local message="$1"
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 $message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
}

# Verificar health check
response=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$response" = "200" ]; then
    echo "✅ Health check exitoso"
else
    echo "❌ Health check falló: $response"
    send_alert "Health check falló con código $response"
    
    # Intentar reiniciar el servicio
    sudo systemctl restart mus1k0n-api
    sleep 30
    
    # Verificar nuevamente
    response=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")
    if [ "$response" != "200" ]; then
        send_alert "Servicio no responde después del reinicio"
    fi
fi
```

## 📚 Recursos Adicionales

### **Documentación**

- [Firebase Deployment](https://firebase.google.com/docs/hosting/deploying)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)

### **Mejores Prácticas**

1. **Seguridad**: Usar HTTPS, headers de seguridad, rate limiting
2. **Monitoreo**: Implementar métricas, logs, alertas
3. **Backup**: Backup regular de datos y configuración
4. **CI/CD**: Automatizar deployment y testing
5. **Escalabilidad**: Usar load balancers y auto-scaling

---

**📅 Fecha de Creación**: $(date)
**👨‍💻 Autor**: Sistema de Documentación Automática
**📋 Versión**: 1.0.0
**🎯 Estado**: Listo para Implementación 