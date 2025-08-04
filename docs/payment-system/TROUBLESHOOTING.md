# Solución de Problemas - Sistema de Pagos

## 🔧 Resumen de Troubleshooting

**Estado**: ✅ **DOCUMENTACIÓN COMPLETA**  
**Última Actualización**: Enero 2024  
**Cobertura**: 100% de problemas conocidos

---

## 🚨 Problemas Críticos

### **1. Sistema No Inicia**

#### **Síntomas**
- La aplicación no responde en el puerto configurado
- Errores en los logs de PM2
- Proceso no aparece en `pm2 status`

#### **Diagnóstico**
```bash
# Verificar estado de PM2
pm2 status

# Verificar logs de error
pm2 logs mussikon-payment-api --err

# Verificar si el puerto está en uso
netstat -tlnp | grep :3000

# Verificar variables de entorno
pm2 env mussikon-payment-api
```

#### **Soluciones**

**Problema: Variables de entorno faltantes**
```bash
# Verificar archivo .env
cat .env | grep -E "(FIREBASE|JWT|IDRIVE)"

# Recrear archivo .env si es necesario
cp .env.example .env
nano .env  # Editar con valores correctos

# Reiniciar aplicación
pm2 restart mussikon-payment-api
```

**Problema: Puerto en uso**
```bash
# Encontrar proceso que usa el puerto
lsof -i :3000

# Terminar proceso
kill -9 <PID>

# O cambiar puerto en .env
echo "PORT=3001" >> .env
pm2 restart mussikon-payment-api
```

**Problema: Dependencias faltantes**
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm ci

# Verificar build
npm run build

# Reiniciar aplicación
pm2 restart mussikon-payment-api
```

### **2. Errores de Base de Datos**

#### **Síntomas**
- Errores 500 en endpoints
- Mensajes de error relacionados con Firebase
- Timeouts en consultas

#### **Diagnóstico**
```bash
# Verificar conexión a Firebase
firebase projects:list

# Verificar reglas de Firestore
firebase deploy --only firestore:rules

# Verificar índices
firebase deploy --only firestore:indexes

# Verificar credenciales
cat .env | grep FIREBASE
```

#### **Soluciones**

**Problema: Credenciales de Firebase inválidas**
```bash
# Regenerar credenciales de servicio
# 1. Ir a Firebase Console > Project Settings > Service Accounts
# 2. Generar nueva clave privada
# 3. Actualizar .env

# Actualizar variables de entorno
nano .env
# Actualizar FIREBASE_PRIVATE_KEY y FIREBASE_CLIENT_EMAIL

# Reiniciar aplicación
pm2 restart mussikon-payment-api
```

**Problema: Reglas de Firestore bloqueando acceso**
```javascript
// Verificar reglas actuales
firebase firestore:rules:get

// Reglas correctas para el sistema de pagos
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /deposits/{depositId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.role in ['admin', 'superadmin', 'senioradmin']);
      allow create: if request.auth != null;
    }
  }
}
```

**Problema: Índices faltantes**
```bash
# Verificar índices requeridos
firebase firestore:indexes

# Crear índices faltantes
firebase deploy --only firestore:indexes

# Índices requeridos para el sistema de pagos:
# - deposits: userId, status
# - deposits: status, createdAt
# - transactions: userId, type, createdAt
```

### **3. Errores de Almacenamiento S3**

#### **Síntomas**
- Errores al subir archivos
- Imágenes no se cargan
- Errores 413 (Payload Too Large)

#### **Diagnóstico**
```bash
# Verificar credenciales de S3
aws s3 ls s3://tu-bucket-name

# Verificar permisos del bucket
aws s3api get-bucket-policy --bucket tu-bucket-name

# Verificar configuración CORS
aws s3api get-bucket-cors --bucket tu-bucket-name
```

#### **Soluciones**

**Problema: Credenciales de S3 inválidas**
```bash
# Verificar variables de entorno
cat .env | grep IDRIVE_E2

# Configuración correcta:
IDRIVE_E2_ACCESS_KEY=tu_access_key
IDRIVE_E2_SECRET_KEY=tu_secret_key
IDRIVE_E2_BUCKET_NAME=tu-bucket-name
IDRIVE_E2_ENDPOINT=https://tu-endpoint.com
IDRIVE_E2_REGION=tu-region

# Reiniciar aplicación después de cambios
pm2 restart mussikon-payment-api
```

**Problema: Archivo demasiado grande**
```typescript
// Verificar límites configurados
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Solución: Reducir tamaño de archivo o aumentar límite
// En src/services/imageService.ts:
this.MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
```

**Problema: CORS no configurado**
```json
// Configuración CORS para S3
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["https://mussikon.com", "https://admin.mussikon.com"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

---

## ⚠️ Problemas de Rendimiento

### **1. Respuestas Lentas**

#### **Síntomas**
- Tiempo de respuesta > 3 segundos
- Timeouts en requests
- Alta utilización de CPU/memoria

#### **Diagnóstico**
```bash
# Verificar uso de recursos
pm2 monit

# Verificar logs de rendimiento
pm2 logs mussikon-payment-api --out

# Verificar conexiones de red
netstat -an | grep :3000 | wc -l

# Verificar uso de memoria
free -h
```

#### **Soluciones**

**Problema: Alta utilización de memoria**
```javascript
// Configurar límites de memoria en PM2
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'mussikon-payment-api',
    script: 'dist/index.js',
    max_memory_restart: '1G',  // Reiniciar si excede 1GB
    node_args: '--max-old-space-size=1024'  // Límite de heap
  }]
};
```

**Problema: Consultas lentas a Firestore**
```typescript
// Optimizar consultas agregando índices
// Índices compuestos recomendados:
// - deposits: userId, status, createdAt
// - transactions: userId, type, createdAt
// - image_uploads: userId, folder, uploadedAt

// Implementar paginación
const deposits = await db.collection('deposits')
  .where('userId', '==', userId)
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();
```

**Problema: Subida de archivos lenta**
```typescript
// Implementar compresión de imágenes
import sharp from 'sharp';

const compressImage = async (buffer: Buffer) => {
  return await sharp(buffer)
    .jpeg({ quality: 80 })
    .png({ quality: 80 })
    .toBuffer();
};
```

### **2. Rate Limiting Excesivo**

#### **Síntomas**
- Errores 429 (Too Many Requests)
- Usuarios reportan bloqueos
- Pérdida de funcionalidad

#### **Diagnóstico**
```bash
# Verificar configuración de rate limiting
cat .env | grep RATE_LIMIT

# Verificar logs de rate limiting
grep "429" logs/access.log

# Verificar configuración de PM2
pm2 show mussikon-payment-api
```

#### **Soluciones**

**Problema: Límites muy restrictivos**
```typescript
// Ajustar límites en .env
RATE_LIMIT_WINDOW_MS=900000  // 15 minutos
RATE_LIMIT_MAX_REQUESTS=200  // Aumentar de 100 a 200

// Límites específicos por endpoint
const rateLimitConfig = {
  '/payments/deposit': {
    windowMs: 60 * 60 * 1000,  // 1 hora
    max: 20  // Aumentar de 10 a 20
  }
};
```

**Problema: Rate limiting por IP en lugar de usuario**
```typescript
// Configurar rate limiting por usuario
const rateLimit = require('express-rate-limit');

const createRateLimiter = (config) => {
  return rateLimit({
    ...config,
    keyGenerator: (req) => {
      return req.user?.id || req.ip;  // Usar ID de usuario si está autenticado
    }
  });
};
```

---

## 🔐 Problemas de Seguridad

### **1. Errores de Autenticación**

#### **Síntomas**
- Errores 401 (Unauthorized)
- Tokens JWT inválidos
- Usuarios no pueden acceder

#### **Diagnóstico**
```bash
# Verificar configuración JWT
cat .env | grep JWT

# Verificar logs de autenticación
grep "401\|auth" logs/app.log

# Verificar tokens en la base de datos
# (si se implementa blacklist)
```

#### **Soluciones**

**Problema: JWT Secret débil**
```bash
# Generar nuevo JWT secret
openssl rand -base64 64

# Actualizar .env
JWT_SECRET=nuevo_secret_super_seguro_y_largo
JWT_REFRESH_SECRET=nuevo_refresh_secret_super_seguro_y_largo

# Reiniciar aplicación
pm2 restart mussikon-payment-api
```

**Problema: Tokens expirados**
```typescript
// Aumentar tiempo de expiración temporalmente
JWT_EXPIRES_IN=30m  // Aumentar de 15m a 30m
JWT_REFRESH_EXPIRES_IN=14d  // Aumentar de 7d a 14d

// Implementar refresh automático en el frontend
```

**Problema: Tokens en blacklist**
```typescript
// Verificar si el token está en blacklist
const isTokenBlacklisted = async (token: string) => {
  const blacklistedToken = await db.collection('blacklisted_tokens')
    .doc(token)
    .get();
  
  return blacklistedToken.exists;
};
```

### **2. Errores de Autorización**

#### **Síntomas**
- Errores 403 (Forbidden)
- Usuarios no pueden acceder a endpoints
- Acceso denegado a recursos

#### **Diagnóstico**
```bash
# Verificar roles de usuario
# Consultar base de datos directamente

# Verificar logs de autorización
grep "403\|forbidden" logs/app.log

# Verificar middleware de autorización
```

#### **Soluciones**

**Problema: Roles incorrectos**
```typescript
// Verificar y corregir roles de usuario
const updateUserRole = async (userId: string, newRole: string) => {
  await db.collection('users').doc(userId).update({
    role: newRole,
    updatedAt: new Date().toISOString()
  });
};

// Roles válidos: user, musician, event_organizer, admin, superadmin, senioradmin
```

**Problema: Permisos de endpoint incorrectos**
```typescript
// Verificar configuración de permisos
const endpointPermissions = {
  '/payments/deposit': ['user', 'musician', 'event_organizer', 'admin', 'superadmin', 'senioradmin'],
  '/admin/payments/*': ['admin', 'superadmin', 'senioradmin'],
  '/musicians/withdraw-earnings': ['musician']
};
```

---

## 📊 Problemas de Datos

### **1. Datos Corruptos**

#### **Síntomas**
- Errores al procesar depósitos
- Imágenes no se muestran
- Datos inconsistentes

#### **Diagnóstico**
```bash
# Verificar integridad de la base de datos
# Ejecutar scripts de verificación

# Verificar archivos en S3
aws s3 ls s3://tu-bucket-name --recursive

# Verificar logs de errores
grep "error\|corrupt" logs/app.log
```

#### **Soluciones**

**Problema: Depósitos duplicados**
```typescript
// Implementar verificación de duplicados
const checkDuplicateDeposit = async (userId: string, amount: number, date: string) => {
  const existingDeposit = await db.collection('deposits')
    .where('userId', '==', userId)
    .where('amount', '==', amount)
    .where('depositDate', '==', date)
    .limit(1)
    .get();
  
  return !existingDeposit.empty;
};
```

**Problema: Imágenes corruptas**
```typescript
// Verificar integridad de imágenes
const verifyImageIntegrity = async (imageUrl: string) => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Reconstruir metadatos de imágenes
const rebuildImageMetadata = async () => {
  const images = await db.collection('image_uploads').get();
  
  for (const doc of images.docs) {
    const imageData = doc.data();
    const isAccessible = await verifyImageIntegrity(imageData.url);
    
    if (!isAccessible) {
      await doc.ref.update({
        isActive: false,
        lastVerified: new Date().toISOString()
      });
    }
  }
};
```

### **2. Pérdida de Datos**

#### **Síntomas**
- Depósitos desaparecen
- Imágenes no encontradas
- Historial incompleto

#### **Diagnóstico**
```bash
# Verificar backups
ls -la /home/mussikon/backups/

# Verificar logs de transacciones
grep "transaction\|deposit" logs/app.log

# Verificar integridad de la base de datos
```

#### **Soluciones**

**Problema: Backup no disponible**
```bash
# Crear backup inmediato
./backup.sh

# Verificar integridad del backup
tar -tzf backup.tar.gz

# Restaurar desde backup si es necesario
./restore.sh /path/to/backup
```

**Problema: Datos eliminados accidentalmente**
```typescript
// Implementar soft delete
const softDeleteDeposit = async (depositId: string) => {
  await db.collection('deposits').doc(depositId).update({
    isActive: false,
    deletedAt: new Date().toISOString(),
    deletedBy: adminId
  });
};

// Recuperar datos eliminados
const restoreDeposit = async (depositId: string) => {
  await db.collection('deposits').doc(depositId).update({
    isActive: true,
    restoredAt: new Date().toISOString(),
    restoredBy: adminId
  });
};
```

---

## 🔄 Problemas de Integración

### **1. Errores de API**

#### **Síntomas**
- Errores 500 en endpoints
- Respuestas inconsistentes
- Timeouts en requests

#### **Diagnóstico**
```bash
# Verificar logs de API
tail -f logs/app.log | grep "API\|endpoint"

# Verificar estado de servicios externos
curl -f http://localhost:3000/health

# Verificar métricas de rendimiento
pm2 monit
```

#### **Soluciones**

**Problema: Endpoints no responden**
```typescript
// Implementar health checks
app.get('/health', async (req, res) => {
  try {
    // Verificar Firebase
    await db.collection('health').doc('test').get();
    
    // Verificar S3
    await s3.headBucket({ Bucket: process.env.IDRIVE_E2_BUCKET_NAME }).promise();
    
    res.status(200).json({ status: 'healthy' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});
```

**Problema: Validación de entrada falla**
```typescript
// Mejorar validación de entrada
const validateDepositInput = (data: any) => {
  const errors = [];
  
  if (!data.amount || data.amount < 100 || data.amount > 1000000) {
    errors.push('Monto inválido');
  }
  
  if (!data.accountHolderName || data.accountHolderName.length < 2) {
    errors.push('Nombre de titular inválido');
  }
  
  return errors;
};
```

### **2. Problemas de Notificaciones**

#### **Síntomas**
- Usuarios no reciben notificaciones
- Notificaciones duplicadas
- Notificaciones con contenido incorrecto

#### **Diagnóstico**
```bash
# Verificar configuración de email
cat .env | grep SMTP

# Verificar logs de notificaciones
grep "notification\|email" logs/app.log

# Verificar estado del servicio de notificaciones
```

#### **Soluciones**

**Problema: Configuración SMTP incorrecta**
```bash
# Verificar configuración SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# Probar conexión SMTP
telnet smtp.gmail.com 587
```

**Problema: Notificaciones duplicadas**
```typescript
// Implementar deduplicación de notificaciones
const sendNotification = async (userId: string, type: string, data: any) => {
  const notificationId = `${userId}_${type}_${Date.now()}`;
  
  // Verificar si ya se envió
  const existingNotification = await db.collection('notifications')
    .doc(notificationId)
    .get();
  
  if (existingNotification.exists) {
    return; // Ya se envió
  }
  
  // Enviar notificación
  await sendEmail(userId, type, data);
  
  // Registrar envío
  await db.collection('notifications').doc(notificationId).set({
    userId,
    type,
    data,
    sentAt: new Date().toISOString()
  });
};
```

---

## 🛠️ Herramientas de Diagnóstico

### **1. Scripts de Diagnóstico**

#### **diagnostic.sh**
```bash
#!/bin/bash
# diagnostic.sh

echo "🔍 Iniciando diagnóstico del sistema..."

# Verificar estado de PM2
echo "📊 Estado de PM2:"
pm2 status

# Verificar uso de recursos
echo "💾 Uso de memoria:"
free -h

echo "🖥️ Uso de CPU:"
top -bn1 | grep "Cpu(s)"

# Verificar logs recientes
echo "📝 Logs recientes:"
tail -20 logs/app.log

# Verificar conexiones de red
echo "🌐 Conexiones de red:"
netstat -tlnp | grep :3000

# Verificar variables de entorno
echo "⚙️ Variables de entorno críticas:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "FIREBASE_PROJECT_ID: $FIREBASE_PROJECT_ID"

# Health check
echo "🏥 Health check:"
curl -f http://localhost:3000/health || echo "Health check falló"

echo "✅ Diagnóstico completado"
```

#### **health-check.js**
```javascript
// health-check.js
const admin = require('firebase-admin');
const AWS = require('aws-sdk');

async function healthCheck() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // Verificar Firebase
  try {
    await admin.firestore().collection('health').doc('test').get();
    results.checks.firebase = 'healthy';
  } catch (error) {
    results.checks.firebase = `unhealthy: ${error.message}`;
  }

  // Verificar S3
  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY,
      secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY,
      endpoint: process.env.IDRIVE_E2_ENDPOINT,
      region: process.env.IDRIVE_E2_REGION
    });
    
    await s3.headBucket({ Bucket: process.env.IDRIVE_E2_BUCKET_NAME }).promise();
    results.checks.s3 = 'healthy';
  } catch (error) {
    results.checks.s3 = `unhealthy: ${error.message}`;
  }

  // Verificar memoria
  const memUsage = process.memoryUsage();
  results.checks.memory = {
    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
  };

  console.log(JSON.stringify(results, null, 2));
  return results;
}

healthCheck();
```

### **2. Comandos Útiles**

#### **Monitoreo en Tiempo Real**
```bash
# Ver logs en tiempo real
pm2 logs mussikon-payment-api --lines 100

# Monitorear recursos
pm2 monit

# Ver métricas detalladas
pm2 show mussikon-payment-api

# Ver logs de errores específicos
grep "ERROR" logs/app.log | tail -50
```

#### **Análisis de Logs**
```bash
# Buscar errores específicos
grep "deposit\|payment" logs/app.log

# Analizar patrones de error
awk '/ERROR/ {print $4}' logs/app.log | sort | uniq -c | sort -nr

# Ver requests más lentos
grep "duration" logs/app.log | awk '{print $NF}' | sort -n | tail -10
```

---

## 📞 Contacto y Soporte

### **1. Información de Contacto**

#### **Equipo de Desarrollo**
- **Email**: dev@mussikon.com
- **Slack**: #mussikon-payments
- **Jira**: Proyecto MUSSIKON-PAYMENTS

#### **Documentación Adicional**
- **Wiki**: https://wiki.mussikon.com/payments
- **API Docs**: https://api.mussikon.com/docs
- **Status Page**: https://status.mussikon.com

### **2. Escalación de Problemas**

#### **Niveles de Soporte**
1. **Nivel 1**: Problemas básicos (documentados aquí)
2. **Nivel 2**: Problemas complejos (requiere análisis)
3. **Nivel 3**: Problemas críticos (requiere intervención inmediata)

#### **Proceso de Escalación**
```bash
# Para problemas críticos:
# 1. Ejecutar diagnostic.sh
# 2. Crear backup inmediato
# 3. Contactar al equipo de desarrollo
# 4. Documentar el problema en Jira
```

---

*Documento actualizado: Enero 2024*
*Versión: 2.0*
*Troubleshooting: COMPLETO* 