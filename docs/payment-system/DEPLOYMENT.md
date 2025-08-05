# Guía de Despliegue - Sistema de Pagos

## 🚀 Resumen de Despliegue

**Estado**: ✅ **LISTO PARA PRODUCCIÓN**  
**Plataforma**: AWS/GCP/Hosting Personalizado  
**Último Despliegue**: Enero 2024  
**Versión**: 2.0

---

## 📋 Requisitos Previos

### **1. Requisitos del Sistema**

#### **Servidor**
```bash
# Especificaciones mínimas recomendadas
CPU: 2 cores
RAM: 4GB
Storage: 20GB SSD
OS: Ubuntu 20.04 LTS / CentOS 8 / Debian 11
```

#### **Software Requerido**
```bash
# Node.js
Node.js >= 16.x
npm >= 8.x

# Base de datos
Firebase CLI >= 11.x

# Herramientas adicionales
Git >= 2.x
PM2 >= 5.x (para producción)
Nginx >= 1.18 (opcional, para reverse proxy)
```

### **2. Configuración de Servicios**

#### **Firebase**
- Proyecto Firebase configurado
- Firestore habilitado
- Reglas de seguridad configuradas
- Índices creados

#### **AWS S3 (idriveE2)**
- Bucket creado y configurado
- Credenciales de acceso configuradas
- Políticas de CORS configuradas
- Encriptación habilitada

---

## 🔧 Configuración del Entorno

### **1. Variables de Entorno**

#### **Archivo .env**
```bash
# Configuración del servidor
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Firebase Configuration
FIREBASE_PROJECT_ID=tu-proyecto-mussikon
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com

# S3 Configuration (idriveE2)
IDRIVE_E2_ACCESS_KEY=tu_access_key
IDRIVE_E2_SECRET_KEY=tu_secret_key
IDRIVE_E2_BUCKET_NAME=tu-bucket-name
IDRIVE_E2_ENDPOINT=https://tu-endpoint.com
IDRIVE_E2_REGION=tu-region

# JWT Configuration
JWT_SECRET=tu_jwt_secret_super_seguro_y_largo
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro_y_largo
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log

# Security
CORS_ORIGIN=https://mussikon.com,https://admin.mussikon.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=tu_sentry_dsn (opcional)
```

#### **Archivo .env.production**
```bash
# Configuración específica de producción
NODE_ENV=production
PORT=3000

# Configuraciones de seguridad adicionales
HELMET_ENABLED=true
COMPRESSION_ENABLED=true
CACHE_CONTROL_ENABLED=true

# Configuraciones de rendimiento
CLUSTER_MODE=true
WORKER_PROCESSES=4

# Configuraciones de monitoreo
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true
```

### **2. Configuración de Firebase**

#### **firebase.json**
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  },
  "emulators": {
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true
    }
  }
}
```

#### **firestore.rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas de seguridad implementadas
    // Ver documentación de seguridad para detalles
  }
}
```

### **3. Configuración de PM2**

#### **ecosystem.config.js**
```javascript
module.exports = {
  apps: [{
    name: 'mussikon-payment-api',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Configuración de logs
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Configuración de monitoreo
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    
    // Configuración de reinicio
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    
    // Configuración de health check
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true,
    
    // Configuración de variables de entorno
    env_file: '.env.production'
  }]
};
```

---

## 🚀 Proceso de Despliegue

### **1. Despliegue Manual**

#### **Paso 1: Preparación del Servidor**
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar Nginx (opcional)
sudo apt install nginx -y

# Crear usuario para la aplicación
sudo useradd -m -s /bin/bash mussikon
sudo usermod -aG sudo mussikon
```

#### **Paso 2: Configuración del Proyecto**
```bash
# Cambiar al usuario de la aplicación
sudo su - mussikon

# Clonar el repositorio
git clone https://github.com/tu-usuario/mussikon-payment-api.git
cd mussikon-payment-api

# Instalar dependencias
npm ci --only=production

# Configurar variables de entorno
cp .env.example .env
nano .env  # Editar con valores reales

# Crear directorio de logs
mkdir -p logs
```

#### **Paso 3: Build y Configuración**
```bash
# Compilar TypeScript
npm run build

# Verificar que el build fue exitoso
ls -la dist/

# Configurar Firebase
firebase login
firebase use production
firebase deploy --only firestore:rules,firestore:indexes
```

#### **Paso 4: Despliegue con PM2**
```bash
# Iniciar la aplicación con PM2
pm2 start ecosystem.config.js --env production

# Guardar configuración de PM2
pm2 save

# Configurar PM2 para iniciar con el sistema
pm2 startup

# Verificar estado
pm2 status
pm2 logs mussikon-payment-api
```

### **2. Despliegue Automatizado (CI/CD)**

#### **GitHub Actions Workflow**
```yaml
name: Deploy to Production

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
      run: npm run test:all
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /home/mussikon/mussikon-payment-api
          git pull origin main
          npm ci --only=production
          npm run build
          pm2 reload ecosystem.config.js --env production
          pm2 save
    
    - name: Deploy Firebase
      run: |
        echo "${{ secrets.FIREBASE_PRIVATE_KEY }}" > firebase-key.json
        firebase deploy --token "${{ secrets.FIREBASE_TOKEN }}"
```

#### **Script de Despliegue**
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Iniciando despliegue..."

# Variables
APP_NAME="mussikon-payment-api"
DEPLOY_PATH="/home/mussikon/mussikon-payment-api"
BACKUP_PATH="/home/mussikon/backups"

# Crear backup
echo "📦 Creando backup..."
mkdir -p $BACKUP_PATH
cp -r $DEPLOY_PATH $BACKUP_PATH/$(date +%Y%m%d_%H%M%S)

# Actualizar código
echo "📥 Actualizando código..."
cd $DEPLOY_PATH
git pull origin main

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci --only=production

# Compilar
echo "🔨 Compilando aplicación..."
npm run build

# Verificar build
if [ ! -d "dist" ]; then
    echo "❌ Error: Build falló"
    exit 1
fi

# Reiniciar aplicación
echo "🔄 Reiniciando aplicación..."
pm2 reload ecosystem.config.js --env production

# Verificar estado
echo "✅ Verificando estado..."
sleep 5
pm2 status

# Health check
echo "🏥 Realizando health check..."
curl -f http://localhost:3000/health || {
    echo "❌ Health check falló"
    exit 1
}

echo "🎉 Despliegue completado exitosamente!"
```

---

## 🔒 Configuración de Seguridad

### **1. Configuración de Nginx (Opcional)**

#### **nginx.conf**
```nginx
server {
    listen 80;
    server_name api.mussikon.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.mussikon.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.mussikon.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.mussikon.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Proxy Configuration
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health Check
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }

    # Static Files (if any)
    location /static/ {
        alias /home/mussikon/mussikon-payment-api/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### **2. Configuración de Firewall**

#### **UFW Configuration**
```bash
# Habilitar UFW
sudo ufw enable

# Configurar reglas básicas
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH
sudo ufw allow ssh

# Permitir HTTP y HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Permitir puerto de la aplicación (si no usa Nginx)
sudo ufw allow 3000

# Verificar estado
sudo ufw status verbose
```

### **3. Configuración de SSL**

#### **Let's Encrypt**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d api.mussikon.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 Monitoreo y Logging

### **1. Configuración de Logs**

#### **Estructura de Logs**
```bash
/home/mussikon/mussikon-payment-api/
├── logs/
│   ├── app.log          # Logs de la aplicación
│   ├── error.log        # Logs de errores
│   ├── access.log       # Logs de acceso
│   ├── combined.log     # Logs combinados
│   └── archive/         # Logs archivados
```

#### **Rotación de Logs**
```bash
# /etc/logrotate.d/mussikon-payment-api
/home/mussikon/mussikon-payment-api/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 mussikon mussikon
    postrotate
        pm2 reloadLogs
    endscript
}
```

### **2. Monitoreo con PM2**

#### **Comandos de Monitoreo**
```bash
# Ver estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs mussikon-payment-api

# Ver métricas de rendimiento
pm2 monit

# Ver información detallada
pm2 show mussikon-payment-api

# Ver logs de errores
pm2 logs mussikon-payment-api --err

# Ver logs de salida
pm2 logs mussikon-payment-api --out
```

#### **Dashboard de PM2**
```bash
# Instalar PM2 Plus (opcional)
pm2 install pm2-server-monit

# Acceder al dashboard web
pm2 plus
```

### **3. Health Checks**

#### **Endpoint de Health Check**
```typescript
// Implementado en la aplicación
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a Firebase
    await db.collection('health').doc('test').get();
    
    // Verificar conexión a S3
    await s3.headBucket({ Bucket: process.env.IDRIVE_E2_BUCKET_NAME }).promise();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

---

## 🔄 Mantenimiento y Actualizaciones

### **1. Actualizaciones de Código**

#### **Script de Actualización**
```bash
#!/bin/bash
# update.sh

echo "🔄 Iniciando actualización..."

# Crear backup
./deploy.sh

# Verificar cambios
git log --oneline -10

# Aplicar migraciones de base de datos (si las hay)
# firebase deploy --only firestore:rules,firestore:indexes

# Reiniciar servicios
pm2 reload all

echo "✅ Actualización completada"
```

### **2. Backup y Recuperación**

#### **Script de Backup**
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/home/mussikon/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

echo "📦 Creando backup en $BACKUP_DIR"

# Backup del código
cp -r /home/mussikon/mussikon-payment-api $BACKUP_DIR/code

# Backup de logs
cp -r /home/mussikon/mussikon-payment-api/logs $BACKUP_DIR/logs

# Backup de configuración
cp /home/mussikon/mussikon-payment-api/.env $BACKUP_DIR/env

# Backup de PM2
pm2 save
cp ~/.pm2/dump.pm2 $BACKUP_DIR/pm2-dump.pm2

echo "✅ Backup completado en $BACKUP_DIR"
```

#### **Script de Recuperación**
```bash
#!/bin/bash
# restore.sh

BACKUP_PATH=$1

if [ -z "$BACKUP_PATH" ]; then
    echo "❌ Especifica la ruta del backup"
    exit 1
fi

echo "🔄 Restaurando desde $BACKUP_PATH"

# Detener aplicación
pm2 stop mussikon-payment-api

# Restaurar código
cp -r $BACKUP_PATH/code/* /home/mussikon/mussikon-payment-api/

# Restaurar configuración
cp $BACKUP_PATH/env /home/mussikon/mussikon-payment-api/.env

# Restaurar PM2
cp $BACKUP_PATH/pm2-dump.pm2 ~/.pm2/dump.pm2
pm2 resurrect

# Reiniciar aplicación
pm2 start mussikon-payment-api

echo "✅ Recuperación completada"
```

### **3. Limpieza y Mantenimiento**

#### **Script de Limpieza**
```bash
#!/bin/bash
# cleanup.sh

echo "🧹 Iniciando limpieza..."

# Limpiar logs antiguos (más de 30 días)
find /home/mussikon/mussikon-payment-api/logs -name "*.log" -mtime +30 -delete

# Limpiar backups antiguos (más de 7 días)
find /home/mussikon/backups -type d -mtime +7 -exec rm -rf {} \;

# Limpiar cache de npm
npm cache clean --force

# Limpiar archivos temporales
rm -rf /tmp/mussikon-*

echo "✅ Limpieza completada"
```

---

## 🚨 Troubleshooting

### **1. Problemas Comunes**

#### **Aplicación no inicia**
```bash
# Verificar logs
pm2 logs mussikon-payment-api --err

# Verificar variables de entorno
pm2 env mussikon-payment-api

# Verificar puerto
netstat -tlnp | grep :3000

# Reiniciar aplicación
pm2 restart mussikon-payment-api
```

#### **Errores de conexión a Firebase**
```bash
# Verificar credenciales
firebase projects:list

# Verificar reglas
firebase deploy --only firestore:rules

# Verificar índices
firebase deploy --only firestore:indexes
```

#### **Errores de S3**
```bash
# Verificar credenciales
aws s3 ls s3://tu-bucket-name

# Verificar permisos
aws s3api get-bucket-policy --bucket tu-bucket-name

# Verificar CORS
aws s3api get-bucket-cors --bucket tu-bucket-name
```

### **2. Logs de Diagnóstico**

#### **Comandos de Diagnóstico**
```bash
# Ver uso de memoria
free -h

# Ver uso de CPU
top

# Ver espacio en disco
df -h

# Ver procesos
ps aux | grep node

# Ver conexiones de red
netstat -tlnp

# Ver logs del sistema
sudo journalctl -u nginx -f
```

---

## 📈 Escalabilidad

### **1. Configuración de Clúster**

#### **PM2 Cluster Mode**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'mussikon-payment-api',
    script: 'dist/index.js',
    instances: 'max', // Usar todos los cores disponibles
    exec_mode: 'cluster',
    // ... otras configuraciones
  }]
};
```

### **2. Load Balancer**

#### **Configuración de Nginx como Load Balancer**
```nginx
upstream mussikon_backend {
    least_conn;
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name api.mussikon.com;
    
    location / {
        proxy_pass http://mussikon_backend;
        # ... otras configuraciones de proxy
    }
}
```

---

*Documento actualizado: Enero 2024*
*Versión: 2.0*
*Despliegue: COMPLETO* 