# Guía Completa de IDrive E2 para MussikOn

## ¿Qué es IDrive E2?

**IDrive E2** es un servicio de almacenamiento en la nube compatible con S3 que ofrece:

- **Compatibilidad total con S3**: Usa la misma API que Amazon S3
- **Almacenamiento económico**: Más barato que AWS S3
- **Alta disponibilidad**: 99.9% de tiempo de actividad
- **Escalabilidad**: Sin límites de almacenamiento
- **Seguridad**: Encriptación en tránsito y en reposo

## Configuración Inicial

### 1. Variables de Entorno

Configura las siguientes variables en tu archivo `.env`:

```bash
# IDrive E2 Configuration
IDRIVE_E2_ACCESS_KEY=tu_access_key_aqui
IDRIVE_E2_SECRET_KEY=tu_secret_key_aqui
IDRIVE_E2_REGION=us-east-1
IDRIVE_E2_ENDPOINT=https://s3.us-east-1.amazonaws.com
IDRIVE_E2_BUCKET_NAME=musikon-media
```

### 2. Ejecutar Script de Configuración

```bash
# Verificar configuración
node scripts/setup-idrive.js

# Crear bucket automáticamente
node scripts/setup-idrive.js --create-bucket
```

## Problema de Tokens que se Vencen

### ¿Por qué ocurre?

Los tokens de acceso pueden vencer por varias razones:

1. **Tokens temporales**: Algunos servicios usan tokens que expiran automáticamente
2. **Renovación automática**: No se renuevan automáticamente
3. **Configuración incorrecta**: Credenciales mal configuradas
4. **Problemas de red**: Interrupciones en la conectividad

### Solución Implementada

Hemos implementado un **sistema de renovación automática de tokens** que:

#### 1. TokenManager Class

```typescript
class TokenManager {
  private currentToken: AccessToken | null = null;
  private tokenExpirationBuffer = 5 * 60 * 1000; // 5 minutos antes de expirar

  async getValidToken(): Promise<AccessToken> {
    if (!this.currentToken || this.isTokenExpiringSoon()) {
      await this.refreshToken();
    }
    return this.currentToken!;
  }
}
```

#### 2. Renovación Automática

- **Detección proactiva**: Verifica si el token está próximo a expirar
- **Renovación automática**: Renueva tokens antes de que expiren
- **Manejo de errores**: Captura y maneja errores de renovación
- **Logging detallado**: Registra todas las operaciones de renovación

#### 3. Funciones Mejoradas

```typescript
// Subida con token renovado
export const uploadToS3 = async (file: Buffer, fileName: string, contentType: string, folder: string = 'uploads'): Promise<string> => {
  const s3Client = await getS3Client(); // Obtiene cliente con token renovado
  // ... resto de la lógica
};

// Descarga con token renovado
export const downloadFromS3 = async (key: string): Promise<Buffer> => {
  const s3Client = await getS3Client(); // Obtiene cliente con token renovado
  // ... resto de la lógica
};
```

## Monitoreo de Salud

### Servicio de Monitoreo

Hemos implementado un **servicio de monitoreo** que verifica:

- ✅ Conectividad con IDrive E2
- ✅ Acceso al bucket
- ✅ Capacidad de subida
- ✅ Capacidad de descarga
- ✅ Tiempo de respuesta

### Endpoints de Monitoreo

```bash
# Estado de salud actual
GET /api/idrive/health

# Verificación forzada
POST /api/idrive/health/check

# Problemas específicos de tokens
GET /api/idrive/health/tokens

# Reporte completo
GET /api/idrive/health/report

# Estadísticas de uso
GET /api/idrive/stats

# Reiniciar conexión
POST /api/idrive/restart

# Información de configuración
GET /api/idrive/config
```

### Ejemplo de Respuesta

```json
{
  "success": true,
  "data": {
    "isHealthy": true,
    "lastCheck": "2024-01-15T10:30:00.000Z",
    "responseTime": 1250,
    "errors": [],
    "warnings": [],
    "bucketAccessible": true,
    "uploadTest": true,
    "downloadTest": true
  },
  "message": "IDrive E2 está funcionando correctamente"
}
```

## Mejores Prácticas

### 1. Configuración de Credenciales

```bash
# ✅ Correcto - Usar credenciales permanentes
IDRIVE_E2_ACCESS_KEY=tu_access_key_permanente
IDRIVE_E2_SECRET_KEY=tu_secret_key_permanente

# ❌ Incorrecto - No usar tokens temporales
IDRIVE_E2_ACCESS_KEY=token_temporal_que_expira
```

### 2. Manejo de Errores

```typescript
try {
  const result = await uploadToS3(file, fileName, contentType);
  // Manejar éxito
} catch (error) {
  if (error.message.includes('token')) {
    // Error de token - se maneja automáticamente
    logger.error('Error de token detectado y manejado automáticamente');
  } else {
    // Otro tipo de error
    logger.error('Error de subida:', error);
  }
}
```

### 3. Monitoreo Continuo

```typescript
// Verificar salud periódicamente
setInterval(async () => {
  const health = await idriveHealthService.getHealthStatusWithCheck();
  if (!health.isHealthy) {
    logger.warn('Problemas detectados con IDrive E2:', health.errors);
  }
}, 5 * 60 * 1000); // Cada 5 minutos
```

## Troubleshooting

### Problemas Comunes

#### 1. Error: "Token expired"

**Síntomas:**
- Error 401 Unauthorized
- Mensaje "Token expired" en logs

**Solución:**
- El sistema renueva automáticamente los tokens
- Verificar configuración de credenciales
- Revisar logs para detalles

#### 2. Error: "Access Denied"

**Síntomas:**
- Error 403 Forbidden
- No se pueden subir archivos

**Solución:**
- Verificar permisos del bucket
- Confirmar que las credenciales tienen permisos de escritura
- Ejecutar script de configuración

#### 3. Error: "Bucket not found"

**Síntomas:**
- Error 404 Not Found
- No se puede acceder al bucket

**Solución:**
- Verificar nombre del bucket
- Crear bucket si no existe: `node scripts/setup-idrive.js --create-bucket`

### Comandos de Diagnóstico

```bash
# Verificar configuración
node scripts/setup-idrive.js

# Verificar salud via API
curl -X GET http://localhost:10000/api/idrive/health

# Verificar problemas de tokens
curl -X GET http://localhost:10000/api/idrive/health/tokens

# Generar reporte completo
curl -X GET http://localhost:10000/api/idrive/health/report
```

## Optimización de Rendimiento

### 1. Caché de Tokens

- Los tokens se almacenan en memoria
- Se renuevan automáticamente antes de expirar
- Reduce latencia en operaciones

### 2. Conexiones Reutilizables

- Cliente S3 se reutiliza
- Evita overhead de crear nuevas conexiones
- Mejora rendimiento general

### 3. Manejo de Errores Inteligente

- Reintentos automáticos en errores temporales
- Backoff exponencial para reintentos
- Logging detallado para debugging

## Seguridad

### 1. Credenciales

- Nunca exponer credenciales en logs
- Usar variables de entorno
- Rotar credenciales periódicamente

### 2. Permisos

- Principio de menor privilegio
- Solo permisos necesarios para la aplicación
- Revisar permisos regularmente

### 3. Monitoreo

- Logs de todas las operaciones
- Alertas en errores de autenticación
- Auditoría de acceso

## Integración con la Aplicación

### 1. Subida de Imágenes

```typescript
// En el controlador de imágenes
const result = await imageService.uploadImage(file, userId, folder, metadata);
// El servicio usa automáticamente el sistema de renovación de tokens
```

### 2. Servir Imágenes

```typescript
// Las imágenes se sirven directamente desde IDrive E2
// URLs públicas para acceso rápido
```

### 3. Eliminación de Archivos

```typescript
// Eliminación segura con tokens renovados
await deleteFromS3(fileKey);
```

## Conclusión

Con esta implementación, hemos resuelto el problema de tokens que se vencen mediante:

1. **Renovación automática de tokens**
2. **Monitoreo continuo de salud**
3. **Manejo robusto de errores**
4. **Herramientas de diagnóstico**

El sistema ahora es más confiable y requiere menos intervención manual para mantener la conectividad con IDrive E2. 