# ⚠️ Manejo de Errores en MussikOn API

> **Sistema completo de manejo de errores con middleware global, logging estructurado y respuestas estandarizadas**

## 📋 Tabla de Contenidos

- [Middleware Global de Errores](#middleware-global-de-errores)
- [Estructura de Errores](#estructura-de-errores)
- [Códigos de Error](#códigos-de-error)
- [Logging Estructurado](#logging-estructurado)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Buenas Prácticas](#buenas-prácticas)
- [Debugging y Troubleshooting](#debugging-y-troubleshooting)

## 🛡️ Middleware Global de Errores

### Implementación Principal

El sistema utiliza un middleware global de errores implementado en `src/middleware/errorHandler.ts` que captura todos los errores no manejados y proporciona respuestas estructuradas.

```typescript
// src/middleware/errorHandler.ts
export const errorHandler = (
  err: Error | OperationalError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err instanceof OperationalError ? err.statusCode : 500;
  const message = err.message || 'Error interno del servidor';
  
  // Logging estructurado
  loggerService.error('Error no manejado', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    requestId: req.headers['x-request-id']
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: err instanceof OperationalError ? err.code : 'INTERNAL_ERROR',
      message,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
```

### Clase de Error Personalizada

```typescript
// src/middleware/errorHandler.ts
export class OperationalError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Wrapper para Controladores Asíncronos

```typescript
// src/middleware/errorHandler.ts
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

## 📊 Estructura de Errores

### Respuesta de Error Estándar

Todas las respuestas de error siguen una estructura consistente:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "email",
        "message": "El email debe ser válido"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456",
    "stack": "Error: Validation failed..." // Solo en desarrollo
  }
}
```

### Campos de la Respuesta de Error

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `success` | boolean | Siempre `false` para errores |
| `error.code` | string | Código único del error |
| `error.message` | string | Mensaje descriptivo del error |
| `error.details` | array | Detalles específicos (opcional) |
| `error.timestamp` | string | Timestamp ISO del error |
| `error.requestId` | string | ID único de la request |
| `error.stack` | string | Stack trace (solo en desarrollo) |

## 🏷️ Códigos de Error

### Códigos Estándar

| Código | Descripción | HTTP Status | Ejemplo de Uso |
|--------|-------------|-------------|----------------|
| `VALIDATION_ERROR` | Error de validación de datos | 400 | DTOs inválidos |
| `AUTHENTICATION_ERROR` | Error de autenticación | 401 | Token inválido |
| `AUTHORIZATION_ERROR` | Error de autorización | 403 | Rol insuficiente |
| `NOT_FOUND_ERROR` | Recurso no encontrado | 404 | Usuario inexistente |
| `CONFLICT_ERROR` | Conflicto con estado actual | 409 | Email duplicado |
| `RATE_LIMIT_ERROR` | Límite de requests excedido | 429 | Demasiadas peticiones |
| `INTERNAL_ERROR` | Error interno del servidor | 500 | Error de base de datos |

### Ejemplos de Códigos Específicos

```typescript
// Errores de validación
throw new OperationalError('Email inválido', 400, 'INVALID_EMAIL');
throw new OperationalError('Contraseña muy débil', 400, 'WEAK_PASSWORD');

// Errores de autenticación
throw new OperationalError('Token expirado', 401, 'TOKEN_EXPIRED');
throw new OperationalError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');

// Errores de autorización
throw new OperationalError('Rol insuficiente', 403, 'INSUFFICIENT_ROLE');
throw new OperationalError('Acceso denegado', 403, 'ACCESS_DENIED');

// Errores de recursos
throw new OperationalError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
throw new OperationalError('Evento no encontrado', 404, 'EVENT_NOT_FOUND');

// Errores de conflicto
throw new OperationalError('Email ya registrado', 409, 'EMAIL_EXISTS');
throw new OperationalError('Evento ya asignado', 409, 'EVENT_ALREADY_ASSIGNED');
```

## 📝 Logging Estructurado

### Servicio de Logging

El sistema utiliza un servicio de logging centralizado (`src/services/loggerService.ts`) con diferentes niveles:

```typescript
// src/services/loggerService.ts
export class LoggerService {
  error(message: string, context?: any): void {
    console.error(`[ERROR] ${message}`, {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      ...context
    });
  }

  warn(message: string, context?: any): void {
    console.warn(`[WARN] ${message}`, {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      ...context
    });
  }

  info(message: string, context?: any): void {
    console.info(`[INFO] ${message}`, {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      ...context
    });
  }

  debug(message: string, context?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, {
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        ...context
      });
    }
  }
}
```

### Logging de Requests

```typescript
// Middleware de logging de requests
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  req.headers['x-request-id'] = requestId;

  loggerService.info('Request recibida', {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  next();
});
```

### Logging de Errores

```typescript
// En el middleware de errores
loggerService.error('Error no manejado', {
  requestId: req.headers['x-request-id'],
  error: err.message,
  stack: err.stack,
  url: req.url,
  method: req.method,
  userId: req.user?.id,
  userEmail: req.user?.userEmail
});
```

## 💡 Ejemplos de Uso

### 1. Error de Validación

**Request inválida:**
```json
POST /auth/register
{
  "name": "Juan",
  "userEmail": "invalid-email",
  "userPassword": "123"
}
```

**Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "userEmail",
        "message": "El email debe ser válido"
      },
      {
        "field": "userPassword",
        "message": "La contraseña debe tener al menos 8 caracteres"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

### 2. Error de Autenticación

**Token inválido:**
```json
GET /events
Authorization: Bearer invalid-token
```

**Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Token inválido o expirado",
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

### 3. Error de Autorización

**Usuario sin permisos:**
```json
GET /admin/users
Authorization: Bearer valid-token-of-regular-user
```

**Response (403):**
```json
{
  "success": false,
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "No autorizado. Rol insuficiente.",
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

### 4. Error de Recurso No Encontrado

**Usuario inexistente:**
```json
GET /users/non-existent-id
Authorization: Bearer valid-token
```

**Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND_ERROR",
    "message": "Usuario no encontrado",
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

### 5. Error de Conflicto

**Email duplicado:**
```json
POST /auth/register
{
  "name": "Juan",
  "userEmail": "existing@example.com",
  "userPassword": "Password123!"
}
```

**Response (409):**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT_ERROR",
    "message": "El email ya está registrado",
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

## 🛡️ Buenas Prácticas

### 1. Uso de asyncHandler

Siempre envuelve los controladores asíncronos con `asyncHandler`:

```typescript
// ✅ Correcto
router.get('/events', asyncHandler(async (req: Request, res: Response) => {
  const events = await eventService.getEvents();
  res.json({ success: true, events });
}));

// ❌ Incorrecto - Puede causar errores no manejados
router.get('/events', async (req: Request, res: Response) => {
  const events = await eventService.getEvents();
  res.json({ success: true, events });
});
```

### 2. Lanzar Errores Operacionales

Usa `OperationalError` para errores conocidos:

```typescript
// ✅ Correcto
if (!user) {
  throw new OperationalError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
}

// ❌ Incorrecto
if (!user) {
  throw new Error('Usuario no encontrado');
}
```

### 3. Logging Contextual

Incluye contexto relevante en los logs:

```typescript
// ✅ Correcto
loggerService.error('Error al crear evento', {
  userId: req.user?.id,
  eventData: req.body,
  error: err.message
});

// ❌ Incorrecto
console.error('Error:', err.message);
```

### 4. Validación de Entrada

Usa DTOs para validación:

```typescript
// ✅ Correcto
router.post('/events', 
  validate(createEventDTO), 
  asyncHandler(createEventController)
);

// ❌ Incorrecto
router.post('/events', asyncHandler(createEventController));
```

## 🔍 Debugging y Troubleshooting

### 1. Identificar Errores

Usa el `requestId` para rastrear errores:

```bash
# Buscar en logs por requestId
grep "req_123456" logs/app.log
```

### 2. Logs de Desarrollo

En desarrollo, los errores incluyen stack traces:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Error interno del servidor",
    "stack": "Error: Cannot read property 'id' of undefined\n    at createEventController (/app/src/controllers/eventController.ts:25:15)\n    ..."
  }
}
```

### 3. Monitoreo de Errores

Configura alertas para errores críticos:

```typescript
// En el middleware de errores
if (statusCode >= 500) {
  // Enviar alerta a sistema de monitoreo
  monitoringService.alert('Error crítico detectado', {
    statusCode,
    message,
    requestId
  });
}
```

### 4. Métricas de Errores

```typescript
// Contar errores por tipo
const errorMetrics = {
  validation: 0,
  authentication: 0,
  authorization: 0,
  notFound: 0,
  conflict: 0,
  internal: 0
};

// En el middleware de errores
errorMetrics[err.code] = (errorMetrics[err.code] || 0) + 1;
```

## 🔧 Configuración

### Variables de Entorno

```typescript
// ENV.ts
export const ERROR_CONFIG = {
  SHOW_STACK_TRACE: process.env.NODE_ENV === 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
  MAX_LOG_SIZE: parseInt(process.env.MAX_LOG_SIZE || '10485760') // 10MB
};
```

### Middleware de Timeout

```typescript
// Timeout para requests largas
app.use((req: Request, res: Response, next: NextFunction) => {
  const timeout = setTimeout(() => {
    res.status(408).json({
      success: false,
      error: {
        code: 'TIMEOUT_ERROR',
        message: 'Request timeout',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
      }
    });
  }, ERROR_CONFIG.REQUEST_TIMEOUT);

  res.on('finish', () => clearTimeout(timeout));
  next();
});
```

---

**Documentación actualizada al**: $(date)

**Versión**: 2.0.0 - Sistema completo de manejo de errores implementado ✅ 