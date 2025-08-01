# 🚀 Guía de Despliegue - MusikOn API

## 📋 Tabla de Contenidos

- [Requisitos del Sistema](#requisitos-del-sistema)
- [Configuración de Entorno](#configuración-de-entorno)
- [Despliegue Local](#despliegue-local)
- [Despliegue en Producción](#despliegue-en-producción)
- [Configuración de Servicios](#configuración-de-servicios)
- [Monitoreo y Logs](#monitoreo-y-logs)
- [Backup y Recuperación](#backup-y-recuperación)
- [Optimización de Rendimiento](#optimización-de-rendimiento)
- [Solución de Problemas](#solución-de-problemas)

---

## 💻 Requisitos del Sistema

### Requisitos Mínimos

- **Node.js:** v16.0.0 o superior
- **npm:** v8.0.0 o superior
- **RAM:** 512MB mínimo, 1GB recomendado
- **Almacenamiento:** 1GB mínimo
- **Sistema Operativo:** Linux, macOS, Windows

### Requisitos Recomendados

- **Node.js:** v18.0.0 o superior
- **RAM:** 2GB o más
- **CPU:** 2 cores o más
- **Almacenamiento:** 5GB o más
- **Red:** Conexión estable a internet

### Verificación de Requisitos

```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar espacio en disco
df -h

# Verificar memoria disponible
free -h
```

---

## ⚙️ Configuración de Entorno

### Variables de Entorno Requeridas

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Configuración del Servidor
NODE_ENV=production
PORT=1000
TOKEN_SECRET=tu-clave-secreta-muy-segura

# Firebase Configuration
FIREBASE_CREDENTIALS=./firebase-credentials.json

# S3 Storage (idriveE2)
IDRIVE_E2_ENDPOINT=https://tu-endpoint.com
IDRIVE_E2_ACCESS_KEY=tu-access-key
IDRIVE_E2_SECRET_KEY=tu-secret-key
IDRIVE_E2_REGION=tu-region
IDRIVE_E2_BUCKET_NAME=tu-bucket-name

# Email Configuration
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://tudominio.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Configuración de Firebase

1. **Crear proyecto en Firebase Console**
2. **Habilitar Firestore Database**
3. **Generar credenciales de servicio**
4. **Descargar archivo JSON de credenciales**

```bash
# Colocar el archivo de credenciales en la raíz del proyecto
cp firebase-credentials.json ./firebase-credentials.json
```

### Configuración de S3 (idriveE2)

1. **Crear cuenta en idriveE2**
2. **Crear bucket para almacenamiento**
3. **Generar Access Key y Secret Key**
4. **Configurar permisos del bucket**

```bash
# Verificar configuración S3
aws s3 ls s3://tu-bucket-name --endpoint-url=https://tu-endpoint.com
```

---

## 🏠 Despliegue Local

### Instalación y Configuración

```bash
# 1. Clonar el repositorio
git clone https://github.com/JASBOOTSTUDIOS/Express_MusikOn_Backend.git
cd Express_MusikOn_Backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Compilar TypeScript
npm run build

# 5. Iniciar en modo desarrollo
npm run dev

# 6. Verificar que el servidor esté funcionando
curl http://localhost:1000/
```

### Verificación de Funcionalidad

```bash
# Verificar endpoints principales
curl http://localhost:1000/api-docs
curl http://localhost:1000/redoc

# Verificar base de datos
curl http://localhost:1000/auth/verToken

# Verificar almacenamiento
curl -X POST http://localhost:1000/imgs/upload \
  -F "file=@test-image.jpg"
```

---

## 🌐 Despliegue en Producción

### Opción 1: Despliegue Manual

```bash
# 1. Preparar servidor
sudo apt update
sudo apt install nodejs npm nginx

# 2. Clonar y configurar
git clone https://github.com/JASBOOTSTUDIOS/Express_MusikOn_Backend.git
cd Express_MusikOn_Backend
npm install
npm run build

# 3. Configurar PM2
npm install -g pm2
pm2 start dist/index.js --name "musikon-api"

# 4. Configurar Nginx
sudo nano /etc/nginx/sites-available/musikon-api
```

### Configuración de Nginx

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:1000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Opción 2: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 1000

CMD ["npm", "start"]
```

```bash
# Construir imagen
docker build -t musikon-api .

# Ejecutar contenedor
docker run -d \
  --name musikon-api \
  -p 1000:1000 \
  --env-file .env \
  musikon-api
```

### Opción 3: Plataformas Cloud

#### Heroku

```bash
# Instalar Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login y crear app
heroku login
heroku create musikon-api

# Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set PORT=1000
# ... otras variables

# Desplegar
git push heroku main
```

#### Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y crear proyecto
railway login
railway init

# Configurar variables
railway variables set NODE_ENV=production

# Desplegar
railway up
```

#### DigitalOcean App Platform

1. **Conectar repositorio de GitHub**
2. **Configurar variables de entorno**
3. **Seleccionar rama y directorio**
4. **Configurar puerto 1000**
5. **Desplegar automáticamente**

---

## 🔧 Configuración de Servicios

### Configuración de SSL/HTTPS

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Configuración de PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'musikon-api',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 1000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

```bash
# Iniciar con PM2
pm2 start ecosystem.config.js

# Monitorear
pm2 monit

# Ver logs
pm2 logs musikon-api
```

### Configuración de Logs

```bash
# Crear directorio de logs
mkdir -p logs

# Configurar rotación de logs
sudo nano /etc/logrotate.d/musikon-api
```

```bash
# /etc/logrotate.d/musikon-api
/path/to/musikon-api/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

---

## 📊 Monitoreo y Logs

### Configuración de Logs

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'musikon-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Monitoreo de Rendimiento

```javascript
// middleware/performance.js
const logger = require('../utils/logger');

const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request processed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};

module.exports = performanceMiddleware;
```

### Health Checks

```javascript
// routes/health.js
const express = require('express');
const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Verificar conexión a Firebase
    const db = require('../utils/firebase').db;
    await db.collection('health').doc('check').get();
    
    // Verificar conexión a S3
    const s3 = require('../utils/idriveE2').s3;
    await s3.listBuckets().promise();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
```

---

## 💾 Backup y Recuperación

### Backup de Base de Datos

```bash
# Script de backup automático
#!/bin/bash
# backup-firestore.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/firestore"

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Exportar datos de Firestore
gcloud firestore export gs://tu-bucket-backup/firestore-backup-$DATE \
  --project=tu-proyecto-id

# Comprimir backup
tar -czf $BACKUP_DIR/firestore-backup-$DATE.tar.gz \
  -C /tmp firestore-backup-$DATE

# Limpiar backups antiguos (mantener últimos 30 días)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completado: firestore-backup-$DATE.tar.gz"
```

### Backup de Imágenes

```bash
# Script de backup de S3
#!/bin/bash
# backup-s3.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_BUCKET="tu-bucket-backup"

# Sincronizar bucket de imágenes con bucket de backup
aws s3 sync s3://tu-bucket-imagenes s3://$BACKUP_BUCKET/images-backup-$DATE \
  --endpoint-url=https://tu-endpoint.com

echo "Backup de imágenes completado: images-backup-$DATE"
```

### Recuperación de Datos

```bash
# Restaurar Firestore
gcloud firestore import gs://tu-bucket-backup/firestore-backup-20240101_120000 \
  --project=tu-proyecto-id

# Restaurar imágenes
aws s3 sync s3://tu-bucket-backup/images-backup-20240101_120000 \
  s3://tu-bucket-imagenes \
  --endpoint-url=https://tu-endpoint.com
```

---

## ⚡ Optimización de Rendimiento

### Configuración de Node.js

```bash
# Optimizar para producción
export NODE_OPTIONS="--max-old-space-size=2048 --optimize-for-size"

# Configurar garbage collector
export NODE_OPTIONS="$NODE_OPTIONS --expose-gc"
```

### Caché y Optimización

```javascript
// middleware/cache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutos

const cacheMiddleware = (duration = 600) => {
  return (req, res, next) => {
    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      return res.json(cachedResponse);
    }
    
    res.originalJson = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      res.originalJson(body);
    };
    
    next();
  };
};

module.exports = cacheMiddleware;
```

### Compresión

```javascript
// middleware/compression.js
const compression = require('compression');

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

module.exports = compressionMiddleware;
```

---

## 🔧 Solución de Problemas

### Problemas Comunes

#### 1. Error de Conexión a Firebase

```bash
# Verificar credenciales
cat firebase-credentials.json

# Verificar permisos
ls -la firebase-credentials.json

# Probar conexión
node -e "
const { db } = require('./src/utils/firebase');
db.collection('test').doc('test').get()
  .then(() => console.log('Conexión exitosa'))
  .catch(err => console.error('Error:', err));
"
```

#### 2. Error de Conexión a S3

```bash
# Verificar variables de entorno
echo $IDRIVE_E2_ENDPOINT
echo $IDRIVE_E2_ACCESS_KEY

# Probar conexión S3
aws s3 ls s3://tu-bucket-name --endpoint-url=https://tu-endpoint.com
```

#### 3. Error de Puerto en Uso

```bash
# Verificar puertos en uso
netstat -tulpn | grep :1000

# Matar proceso
sudo kill -9 $(lsof -t -i:1000)

# Cambiar puerto
export PORT=1001
```

#### 4. Error de Memoria

```bash
# Verificar uso de memoria
free -h
ps aux | grep node

# Aumentar memoria para Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Logs de Debug

```bash
# Ver logs de la aplicación
pm2 logs musikon-api

# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Ver logs del sistema
sudo journalctl -u nginx -f
sudo journalctl -u pm2-root -f
```

### Monitoreo en Tiempo Real

```bash
# Monitorear recursos del sistema
htop
iotop
nethogs

# Monitorear aplicación
pm2 monit
pm2 status
```

---

## 📈 Métricas y Analytics

### Configuración de Métricas

```javascript
// utils/metrics.js
const prometheus = require('prom-client');

// Contador de requests
const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Histograma de duración de requests
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route']
});

// Gauge de conexiones activas
const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

module.exports = {
  httpRequestsTotal,
  httpRequestDuration,
  activeConnections
};
```

### Endpoint de Métricas

```javascript
// routes/metrics.js
const express = require('express');
const prometheus = require('prom-client');
const router = express.Router();

router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', prometheus.register.contentType);
    res.end(await prometheus.register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

module.exports = router;
```

---

## 🔒 Seguridad en Producción

### Configuración de Seguridad

```javascript
// middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const securityMiddleware = [
  helmet(),
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite por IP
    message: 'Demasiadas requests desde esta IP'
  })
];

module.exports = securityMiddleware;
```

### Configuración de CORS

```javascript
// middleware/cors.js
const cors = require('cors');

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);
```

---

## 📞 Soporte y Contacto

### Recursos de Ayuda

- **Documentación:** `/docs/README.md`
- **Issues de GitHub:** Para reportar bugs
- **Stack Overflow:** Para preguntas técnicas
- **Email:** Contacto directo para emergencias

### Información de Contacto

- **Desarrollador:** Jefry Astacio
- **Email:** jasbootstudios@gmail.com
- **GitHub:** [JASBOOTSTUDIOS](https://github.com/JASBOOTSTUDIOS)

---

> **"El despliegue es como el sexo: cuando es bueno, es muy bueno; cuando es malo, es mejor que nada."** 🚀 