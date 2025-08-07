# 🔐 Sistema de Actualización Automática de URLs Firmadas - MussikOn API

## 📋 Índice

- [Descripción General](#descripción-general)
- [Problema Resuelto](#problema-resuelto)
- [Solución Implementada](#solución-implementada)
- [Funcionalidades](#funcionalidades)
- [Endpoints Nuevos](#endpoints-nuevos)
- [Middleware Automático](#middleware-automático)
- [Scripts de Gestión](#scripts-de-gestión)
- [Configuración](#configuración)
- [Uso y Ejemplos](#uso-y-ejemplos)

## 🎯 Descripción General

Se ha implementado un sistema completo de actualización automática de URLs firmadas que garantiza que todas las imágenes en el sistema tengan URLs firmadas válidas, seguras y actualizadas en cada consulta. Este sistema resuelve el problema de URLs expiradas que podrían causar que las imágenes no se muestren correctamente en el frontend.

## ❌ Problema Resuelto

### **Problema Original**
- Las URLs firmadas expiraban después de 1 hora
- No había un sistema automático para renovarlas
- Las imágenes podían dejar de ser visibles en el frontend
- No había monitoreo del estado de las URLs firmadas

### **Impacto**
- Imágenes rotas en el frontend
- Experiencia de usuario degradada
- Necesidad de intervención manual para renovar URLs
- Falta de visibilidad del estado del sistema

## ✅ Solución Implementada

### **Arquitectura del Sistema**

```
┌─────────────────────────────────────────────────────────────┐
│                    Sistema de URLs Firmadas                 │
├─────────────────────────────────────────────────────────────┤
│  🔄 Middleware Automático                                   │
│  ├── autoUpdateSignedUrls()                                 │
│  ├── ensureSignedUrlsInResponse()                          │
│  └── scheduledSignedUrlUpdate()                            │
├─────────────────────────────────────────────────────────────┤
│  🛠️ Servicios de Actualización                             │
│  ├── updateAllSignedUrls()                                  │
│  ├── refreshExpiredSignedUrls()                            │
│  ├── getImageWithGuaranteedSignedUrl()                     │
│  └── getMultipleImagesWithGuaranteedSignedUrls()           │
├─────────────────────────────────────────────────────────────┤
│  📡 Endpoints de Gestión                                   │
│  ├── POST /images/update-all-signed-urls                   │
│  ├── POST /images/refresh-expired-signed-urls              │
│  ├── GET /images/{id}/guaranteed-signed-url                │
│  ├── POST /images/multiple-guaranteed-signed-urls          │
│  └── GET /images/health/signed-urls                        │
├─────────────────────────────────────────────────────────────┤
│  🔧 Scripts de Gestión                                     │
│  ├── update-signed-urls.js                                 │
│  └── Comandos npm                                          │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Funcionalidades

### **1. Actualización Automática**
- ✅ **Middleware automático** que se ejecuta en cada consulta de imágenes
- ✅ **Verificación en tiempo real** de URLs expiradas
- ✅ **Renovación automática** de URLs próximas a expirar (30 minutos antes)
- ✅ **Actualización programada** cada 30 minutos

### **2. Gestión Manual**
- ✅ **Actualización masiva** de todas las URLs firmadas
- ✅ **Verificación selectiva** de URLs expiradas
- ✅ **Health check** del sistema de URLs firmadas
- ✅ **Scripts de línea de comandos** para gestión

### **3. Monitoreo y Logging**
- ✅ **Logging detallado** de todas las operaciones
- ✅ **Métricas de rendimiento** y estado
- ✅ **Alertas automáticas** para problemas críticos
- ✅ **Reportes de salud** del sistema

### **4. Seguridad**
- ✅ **URLs firmadas con expiración** de 1 hora
- ✅ **Renovación proactiva** antes de la expiración
- ✅ **Control de acceso** basado en roles
- ✅ **Validación de permisos** para operaciones administrativas

## 📡 Endpoints Nuevos

### **1. Actualización Masiva**
```http
POST /images/update-all-signed-urls
Authorization: Bearer <admin_token>
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Actualización de URLs firmadas completada",
  "data": {
    "totalImages": 150,
    "updatedImages": 145,
    "failedImages": 5,
    "errors": ["Error actualizando imagen 123: ..."]
  }
}
```

### **2. Verificación de URLs Expiradas**
```http
POST /images/refresh-expired-signed-urls
Authorization: Bearer <admin_token>
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Verificación de URLs expiradas completada",
  "data": {
    "checkedImages": 150,
    "expiredImages": 12,
    "refreshedImages": 12,
    "errors": []
  }
}
```

### **3. Imagen con URL Garantizada**
```http
GET /images/{imageId}/guaranteed-signed-url
Authorization: Bearer <user_token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "image_123",
    "url": "https://s3.amazonaws.com/...",
    "filename": "profile_123.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg",
    "uploadedAt": "2024-01-15T10:30:00Z",
    "urlExpiresAt": "2024-01-15T11:30:00Z",
    "lastUrlUpdate": "2024-01-15T10:30:00Z"
  }
}
```

### **4. Múltiples Imágenes con URLs Garantizadas**
```http
POST /images/multiple-guaranteed-signed-urls
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "imageIds": ["image_123", "image_456", "image_789"]
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "image_123",
        "url": "https://s3.amazonaws.com/...",
        "filename": "profile_123.jpg"
      }
    ],
    "failedImages": ["image_456"],
    "errors": ["Error procesando imagen image_456: ..."]
  }
}
```

### **5. Health Check**
```http
GET /images/health/signed-urls
Authorization: Bearer <admin_token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "checkedImages": 150,
    "expiredImages": 0,
    "refreshedImages": 0,
    "errorCount": 0,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## 🔄 Middleware Automático

### **1. autoUpdateSignedUrls**
```typescript
// Se ejecuta automáticamente en cada consulta de imágenes
app.use(autoUpdateSignedUrls);
```

**Funcionalidades:**
- Detecta endpoints de imágenes automáticamente
- Verifica URLs expiradas en segundo plano
- No bloquea las respuestas del usuario
- Logging detallado de operaciones

### **2. ensureSignedUrlsInResponse**
```typescript
// Intercepta respuestas y verifica URLs firmadas
app.use(ensureSignedUrlsInResponse);
```

**Funcionalidades:**
- Intercepta respuestas JSON que contienen imágenes
- Verifica que todas las URLs estén actualizadas
- Renueva URLs expiradas automáticamente
- Mantiene la integridad de las respuestas

### **3. scheduledSignedUrlUpdate**
```typescript
// Actualización programada cada 30 minutos
scheduledSignedUrlUpdate();
```

**Funcionalidades:**
- Se ejecuta automáticamente al iniciar el servidor
- Actualiza URLs cada 30 minutos
- Logging de resultados de actualización
- Manejo robusto de errores

## 🔧 Scripts de Gestión

### **Script Principal**
```bash
# Actualización masiva (por defecto)
npm run signed-urls:update

# Verificar URLs expiradas
npm run signed-urls:refresh

# Health check del sistema
npm run signed-urls:health

# Ejecutar todas las operaciones
npm run signed-urls:all
```

### **Uso Directo del Script**
```bash
# Actualización masiva
node scripts/update-signed-urls.js

# Verificar URLs expiradas
node scripts/update-signed-urls.js --refresh-expired

# Health check
node scripts/update-signed-urls.js --health-check

# Todas las operaciones
node scripts/update-signed-urls.js --all
```

### **Variables de Entorno Requeridas**
```env
# URL de la API
API_BASE_URL=http://localhost:3000

# Token de administrador (opcional)
ADMIN_TOKEN=your_admin_jwt_token
```

## ⚙️ Configuración

### **1. Variables de Entorno**
```env
# Configuración de IDrive E2 (ya existente)
IDRIVE_E2_ENDPOINT=https://s3.us-east-1.amazonaws.com
IDRIVE_E2_ACCESS_KEY=your_access_key
IDRIVE_E2_SECRET_KEY=your_secret_key
IDRIVE_E2_REGION=us-east-1
IDRIVE_E2_BUCKET_NAME=musikon-media

# Configuración de URLs firmadas (nuevo)
SIGNED_URL_EXPIRATION=3600  # 1 hora en segundos
SIGNED_URL_REFRESH_THRESHOLD=1800  # 30 minutos en segundos
SIGNED_URL_UPDATE_INTERVAL=1800000  # 30 minutos en milisegundos
```

### **2. Integración en la Aplicación**
```typescript
// index.ts
import { autoUpdateSignedUrls, ensureSignedUrlsInResponse, scheduledSignedUrlUpdate } from './src/middleware/signedUrlMiddleware';

// Middleware automático
app.use(autoUpdateSignedUrls);
app.use(ensureSignedUrlsInResponse);

// Actualización programada
scheduledSignedUrlUpdate();
```

## 📊 Uso y Ejemplos

### **1. Verificación de Estado**
```bash
# Verificar salud del sistema
npm run signed-urls:health

# Salida esperada:
# ✅ Verificación de salud completada
# 📊 Estado de salud: HEALTHY
#    • Imágenes verificadas: 150
#    • URLs expiradas: 0
#    • URLs renovadas: 0
#    • Errores: 0
```

### **2. Actualización Manual**
```bash
# Actualizar todas las URLs
npm run signed-urls:update

# Salida esperada:
# ✅ Actualización masiva completada exitosamente
# 📊 Resultados:
#    • Total de imágenes: 150
#    • Imágenes actualizadas: 150
#    • Imágenes fallidas: 0
```

### **3. Verificación de URLs Expiradas**
```bash
# Verificar URLs expiradas
npm run signed-urls:refresh

# Salida esperada:
# ✅ Verificación de URLs expiradas completada
# 📊 Resultados:
#    • Imágenes verificadas: 150
#    • URLs expiradas: 5
#    • URLs renovadas: 5
```

### **4. Uso en el Frontend**
```javascript
// Obtener imagen con URL garantizada
const response = await fetch('/images/image_123/guaranteed-signed-url', {
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});

const imageData = await response.json();
// imageData.data.url siempre estará actualizada
```

## 🎯 Beneficios Implementados

### **✅ Para el Frontend**
- **Imágenes siempre visibles** - URLs firmadas siempre actualizadas
- **Sin interrupciones** - Renovación automática en segundo plano
- **Mejor experiencia de usuario** - No más imágenes rotas
- **Carga más rápida** - URLs optimizadas y válidas

### **✅ Para el Backend**
- **Monitoreo automático** - Sistema de health check integrado
- **Gestión centralizada** - Control total sobre URLs firmadas
- **Logging detallado** - Visibilidad completa del sistema
- **Escalabilidad** - Manejo eficiente de grandes volúmenes

### **✅ Para Administradores**
- **Scripts de gestión** - Herramientas de línea de comandos
- **Reportes de estado** - Información detallada del sistema
- **Intervención manual** - Capacidad de actualización manual
- **Alertas automáticas** - Notificaciones de problemas

## 🔍 Monitoreo y Alertas

### **Estados de Salud**
- **🟢 Healthy**: Sistema funcionando correctamente
- **🟡 Warning**: Algunos problemas menores detectados
- **🔴 Critical**: Más del 10% de URLs expiradas
- **⚫ Error**: Error en el sistema de verificación

### **Métricas Clave**
- Total de imágenes verificadas
- Número de URLs expiradas
- Número de URLs renovadas
- Tiempo de respuesta de actualización
- Tasa de éxito de renovaciones

## 🚀 Próximas Mejoras

### **Futuras Implementaciones**
- [ ] **Dashboard web** para monitoreo en tiempo real
- [ ] **Alertas por email** para problemas críticos
- [ ] **Métricas avanzadas** con gráficos y tendencias
- [ ] **Optimización de rendimiento** para grandes volúmenes
- [ ] **Integración con CDN** para distribución global

---

**✅ Sistema implementado y funcionando al 100%**

El sistema de actualización automática de URLs firmadas está completamente implementado y garantiza que todas las imágenes en MussikOn tengan URLs firmadas válidas, seguras y actualizadas en cada consulta, resolviendo completamente el problema de imágenes rotas en el frontend. 