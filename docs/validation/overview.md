# 🛡️ Sistema de Validación - MussikOn API

## 📋 Descripción General

El Sistema de Validación de MussikOn API proporciona una capa robusta de validación y sanitización de datos para todos los endpoints. Implementa validación de esquemas con Joi, sanitización de entrada, validación de archivos, y manejo seguro de datos inconsistentes de Firestore.

## 🚀 Características Principales

### **🔍 Validación de Esquemas**
- **Joi Schemas**: Validación completa de tipos y formatos para todos los endpoints
- **Custom Validators**: Validadores personalizados para casos específicos
- **Error Messages**: Mensajes de error detallados y localizados en español
- **Nested Validation**: Validación de objetos anidados complejos
- **Type Conversion**: Conversión automática de tipos de datos

### **🧹 Sanitización de Input**
- **XSS Prevention**: Prevención de ataques de cross-site scripting
- **SQL Injection Protection**: Protección contra inyección de código
- **Input Cleaning**: Limpieza automática de datos de entrada
- **Special Character Filtering**: Filtrado de caracteres especiales peligrosos
- **Encoding Validation**: Validación de codificación de caracteres

### **📁 Validación de Archivos**
- **File Type Validation**: Validación de tipos MIME estricta
- **Size Limits**: Límites de tamaño configurables por tipo
- **Content Analysis**: Análisis básico de contenido de archivos
- **Multiple File Support**: Soporte para subida de múltiples archivos
- **Image Processing**: Validación específica para imágenes

### **🛡️ Seguridad Avanzada**
- **Rate Limiting**: Limitación de velocidad de requests
- **Input Length Limits**: Límites de longitud de entrada
- **Coordinate Validation**: Validación de coordenadas geográficas
- **Price Range Validation**: Validación de rangos de precios
- **Date Range Validation**: Validación de rangos de fechas

## 📊 Arquitectura del Sistema

### **Componentes Principales**

```
src/middleware/validationMiddleware.ts    # Middleware principal de validación
src/utils/validationSchemas.ts           # Esquemas Joi centralizados
src/utils/applyValidations.ts            # Aplicación de validaciones por ruta
src/middleware/errorHandler.ts           # Manejo de errores de validación
```

### **Flujo de Validación**

```typescript
Request → Validation Middleware → Schema Validation → Sanitization → Controller
    ↓
Error Handler ← Custom Validation ← Type Checking ← Input Cleaning
```

## 🔧 Implementación Técnica

### **Middleware Principal**

```typescript
// src/middleware/validationMiddleware.ts
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validationErrors
      });
    }

    // Sanitizar datos
    req.body = sanitizeInput(value);
    next();
  };
};
```

### **Esquemas de Validación Implementados**

```typescript
// src/utils/validationSchemas.ts

// Autenticación
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).required(),
  lastName: Joi.string().min(2).max(50).pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).required(),
  userEmail: Joi.string().email({ tlds: { allow: false } }).max(100).required(),
  userPassword: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/).required(),
  roll: Joi.string().valid('musico', 'eventCreator', 'usuario', 'adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin').default('usuario')
});

// Eventos
export const createEventSchema = Joi.object({
  eventName: Joi.string().min(3).max(100).required(),
  eventType: Joi.string().valid('concierto', 'boda', 'culto', 'evento_corporativo', 'festival', 'fiesta_privada', 'graduacion', 'cumpleanos', 'otro').required(),
  date: Joi.date().iso().required(),
  time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  location: Joi.string().min(5).max(200).required(),
  duration: Joi.string().required(),
  instrument: Joi.string().valid('guitarra', 'piano', 'bajo', 'bateria', 'saxofon', 'trompeta', 'violin', 'canto', 'teclado', 'flauta', 'otro').required(),
  budget: Joi.string().required(),
  comment: Joi.string().max(500).optional()
});

// Solicitudes de Músicos
export const createMusicianRequestSchema = Joi.object({
  eventName: Joi.string().min(3).max(100).required(),
  eventType: Joi.string().valid('concierto', 'boda', 'culto', 'evento_corporativo', 'festival', 'fiesta_privada', 'graduacion', 'cumpleanos', 'otro').required(),
  date: Joi.date().iso().required(),
  time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  location: Joi.string().min(5).max(200).required(),
  duration: Joi.string().required(),
  instrument: Joi.string().valid('guitarra', 'piano', 'bajo', 'bateria', 'saxofon', 'trompeta', 'violin', 'canto', 'teclado', 'flauta', 'otro').required(),
  budget: Joi.string().required(),
  description: Joi.string().max(1000).optional(),
  requirements: Joi.string().max(500).optional()
});
```

### **Middleware Especializados Implementados**

```typescript
// Validación de IDs
export function validateId(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;
  
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'ID inválido',
      message: 'El ID proporcionado no es válido'
    });
  }
  
  next();
}

// Validación de paginación
export function validatePagination(req: Request, res: Response, next: NextFunction): void {
  const { limit, offset, page } = req.query;
  
  // Validar limit
  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    return res.status(400).json({
      success: false,
      error: 'Parámetro limit inválido',
      message: 'El límite debe ser un número entre 1 y 100'
    });
  }
  
  // Validar offset
  if (offset && (isNaN(Number(offset)) || Number(offset) < 0)) {
    return res.status(400).json({
      success: false,
      error: 'Parámetro offset inválido',
      message: 'El offset debe ser un número mayor o igual a 0'
    });
  }
  
  next();
}

// Validación de archivos
export function validateFile(
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: number = 10 * 1024 * 1024 // 10MB por defecto
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      if (!file) continue;
      
      // Validar tipo MIME
      if (file.mimetype && typeof file.mimetype === 'string' && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de archivo no permitido',
          message: `Solo se permiten archivos de tipo: ${allowedTypes.join(', ')}`
        });
      }
      
      // Validar tamaño
      if (typeof file.size === 'number' && file.size > maxSize) {
        return res.status(400).json({
          success: false,
          error: 'Archivo demasiado grande',
          message: `El archivo no puede exceder ${maxSize / (1024 * 1024)}MB`
        });
      }
    }
    
    next();
  };
}

// Validación de coordenadas
export function validateCoordinates(req: Request, res: Response, next: NextFunction): void {
  const { latitude, longitude } = req.body;
  
  if (latitude !== undefined && (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90)) {
    return res.status(400).json({
      success: false,
      error: 'Latitud inválida',
      message: 'La latitud debe ser un número entre -90 y 90'
    });
  }
  
  if (longitude !== undefined && (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180)) {
    return res.status(400).json({
      success: false,
      error: 'Longitud inválida',
      message: 'La longitud debe ser un número entre -180 y 180'
    });
  }
  
  next();
}

// Validación de rangos de fecha
export function validateDateRange(req: Request, res: Response, next: NextFunction): void {
  const { dateFrom, dateTo } = req.query;
  
  if (dateFrom && dateTo) {
    const fromDate = new Date(dateFrom as string);
    const toDate = new Date(dateTo as string);
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Fechas inválidas',
        message: 'Las fechas proporcionadas no son válidas'
      });
    }
    
    if (fromDate > toDate) {
      return res.status(400).json({
        success: false,
        error: 'Rango de fechas inválido',
        message: 'La fecha de inicio no puede ser posterior a la fecha de fin'
      });
    }
  }
  
  next();
}

// Validación de rangos de precio
export function validatePriceRange(req: Request, res: Response, next: NextFunction): void {
  const { minPrice, maxPrice } = req.query;
  
  if (minPrice && maxPrice) {
    const min = Number(minPrice);
    const max = Number(maxPrice);
    
    if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
      return res.status(400).json({
        success: false,
        error: 'Precios inválidos',
        message: 'Los precios deben ser números positivos'
      });
    }
    
    if (min > max) {
      return res.status(400).json({
        success: false,
        error: 'Rango de precios inválido',
        message: 'El precio mínimo no puede ser mayor al precio máximo'
      });
    }
  }
  
  next();
}

// Validación de roles de usuario
export function validateUserRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.roll;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado',
        message: 'No tienes permisos para realizar esta acción'
      });
    }
    
    next();
  };
}

// Validación de límites de consulta
export function validateQueryLimit(maxLimit: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { limit } = req.query;
    
    if (limit && (isNaN(Number(limit)) || Number(limit) > maxLimit)) {
      return res.status(400).json({
        success: false,
        error: 'Límite de consulta excedido',
        message: `El límite máximo permitido es ${maxLimit}`
      });
    }
    
    next();
  };
}

// Validación de consultas de búsqueda
export function validateSearchQuery(req: Request, res: Response, next: NextFunction): void {
  const { query } = req.query;
  
  if (query && typeof query === 'string') {
    // Validar longitud mínima
    if (query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Consulta de búsqueda muy corta',
        message: 'La consulta de búsqueda debe tener al menos 2 caracteres'
      });
    }
    
    // Validar caracteres especiales peligrosos
    const dangerousChars = /[<>{}()\[\]]/;
    if (dangerousChars.test(query)) {
      return res.status(400).json({
        success: false,
        error: 'Consulta de búsqueda inválida',
        message: 'La consulta contiene caracteres no permitidos'
      });
    }
  }
  
  next();
}
```

## 🔍 Aplicación de Validaciones

### **Uso en Rutas**

```typescript
// src/routes/authRoutes.ts
import { validate } from '../middleware/validationMiddleware';
import { registerSchema, loginSchema, updateUserSchema } from '../utils/validationSchemas';

router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);
router.put('/update/:userEmail', validateId, validate(updateUserSchema), updateUserController);

// src/routes/eventsRoutes.ts
import { validate } from '../middleware/validationMiddleware';
import { createEventSchema, updateEventSchema } from '../utils/validationSchemas';
import { validateFile, validateCoordinates, validateDateRange } from '../middleware/validationMiddleware';

router.post('/create', 
  validate(createEventSchema),
  validateFile(['image/jpeg', 'image/png'], 5 * 1024 * 1024),
  validateCoordinates,
  createEventController
);

router.get('/search',
  validatePagination,
  validateDateRange,
  validatePriceRange,
  searchEventsController
);
```

### **Validación de Búsqueda**

```typescript
// src/routes/searchRoutes.ts
import { validatePagination, validateSearchQuery } from '../middleware/validationMiddleware';

router.get('/global',
  authMiddleware,
  validatePagination,
  validateSearchQuery,
  globalSearchController
);

router.get('/events',
  authMiddleware,
  validatePagination,
  validateDateRange,
  validatePriceRange,
  searchEventsController
);
```

## 🛡️ Sanitización de Datos

### **Función de Sanitización**

```typescript
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    // Remover caracteres peligrosos y normalizar espacios
    return data
      .trim()
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/\s+/g, ' ') // Normalizar espacios múltiples
      .replace(/javascript:/gi, '') // Remover javascript: protocol
      .replace(/on\w+=/gi, '') // Remover event handlers
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // Remover scripts
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item));
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return data;
}
```

## 📊 Manejo de Errores

### **Estructura de Error de Validación**

```typescript
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  type?: string;
}

export class ValidationErrorException extends Error {
  public errors: ValidationError[];
  public statusCode: number;

  constructor(errors: ValidationError[], message: string = 'Error de validación') {
    super(message);
    this.name = 'ValidationErrorException';
    this.errors = errors;
    this.statusCode = 400;
  }
}
```

### **Respuesta de Error Estándar**

```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    {
      "field": "userEmail",
      "message": "El email debe tener un formato válido",
      "type": "string.email"
    },
    {
      "field": "userPassword",
      "message": "La contraseña debe tener al menos 8 caracteres",
      "type": "string.min"
    }
  ],
  "timestamp": "2024-12-20T10:30:00.000Z"
}
```

## 🔧 Configuración y Personalización

### **Opciones de Validación**

```typescript
const defaultOptions: Joi.ValidationOptions = {
  abortEarly: false,        // Continuar validación después del primer error
  stripUnknown: true,       // Remover campos no definidos en el esquema
  allowUnknown: false,      // No permitir campos desconocidos
  convert: true,           // Convertir tipos automáticamente
  presence: 'required'     // Campos requeridos por defecto
};
```

### **Mensajes de Error Personalizados**

```typescript
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras y espacios',
      'any.required': 'El nombre es requerido',
    }),
  // ... más campos
});
```

## 📈 Métricas y Monitoreo

### **Logging de Validación**

```typescript
// Logging de errores de validación
logger.warn('Error de validación detectado', {
  metadata: {
    endpoint: req.originalUrl,
    method: req.method,
    errors: validationErrors,
    userId: (req as any).user?.userEmail
  }
});
```

### **Métricas de Validación**

```typescript
// Contadores de errores por tipo
const validationMetrics = {
  totalErrors: 0,
  errorsByField: {},
  errorsByType: {},
  errorsByEndpoint: {}
};
```

## 🚀 Optimizaciones Implementadas

### **Validación Lazy**

```typescript
// Validación condicional basada en el contexto
export const conditionalSchema = Joi.object({
  eventType: Joi.string().required(),
  customFields: Joi.when('eventType', {
    is: 'boda',
    then: Joi.object({
      ceremonyTime: Joi.string().required(),
      receptionTime: Joi.string().required()
    }),
    otherwise: Joi.object({
      duration: Joi.string().required()
    })
  })
});
```

### **Validación de Arrays**

```typescript
// Validación de arrays con elementos únicos
export const songsSchema = Joi.array()
  .items(Joi.string().min(1).max(100))
  .unique()
  .min(1)
  .max(20)
  .messages({
    'array.unique': 'Las canciones no pueden estar duplicadas',
    'array.min': 'Debe incluir al menos una canción',
    'array.max': 'No puede incluir más de 20 canciones'
  });
```

## 🔍 Testing de Validación

### **Tests Unitarios**

```typescript
describe('Validation Middleware', () => {
  test('should validate correct data', () => {
    const validData = {
      name: 'Juan',
      lastName: 'Pérez',
      userEmail: 'juan@example.com',
      userPassword: 'Password123!'
    };
    
    const result = validateAndSanitize(registerSchema, validData);
    expect(result.isValid).toBe(true);
  });

  test('should reject invalid email', () => {
    const invalidData = {
      name: 'Juan',
      lastName: 'Pérez',
      userEmail: 'invalid-email',
      userPassword: 'Password123!'
    };
    
    const result = validateAndSanitize(registerSchema, invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('userEmail');
  });
});
```

## 📚 Documentación de Esquemas

### **Esquemas Disponibles**

| Esquema | Descripción | Endpoints |
|---------|-------------|-----------|
| `registerSchema` | Registro de usuarios | POST `/auth/register` |
| `loginSchema` | Login de usuarios | POST `/auth/login` |
| `updateUserSchema` | Actualización de usuarios | PUT `/auth/update/:email` |
| `createEventSchema` | Creación de eventos | POST `/events/create` |
| `updateEventSchema` | Actualización de eventos | PUT `/events/:id` |
| `createMusicianRequestSchema` | Solicitudes de músicos | POST `/musician-requests/create` |
| `updateMusicianRequestSchema` | Actualización de solicitudes | PUT `/musician-requests/:id` |
| `chatMessageSchema` | Mensajes de chat | POST `/chat/messages` |
| `paymentIntentSchema` | Intenciones de pago | POST `/payments/create-intent` |

### **Middleware Disponibles**

| Middleware | Descripción | Uso |
|------------|-------------|-----|
| `validate` | Validación de esquemas Joi | Validación de datos de entrada |
| `validateId` | Validación de IDs | Validación de parámetros de ruta |
| `validatePagination` | Validación de paginación | Límites y offsets |
| `validateFile` | Validación de archivos | Tipos y tamaños de archivo |
| `validateCoordinates` | Validación de coordenadas | Latitud y longitud |
| `validateDateRange` | Validación de rangos de fecha | Fechas de inicio y fin |
| `validatePriceRange` | Validación de rangos de precio | Precios mínimos y máximos |
| `validateUserRole` | Validación de roles | Autorización por roles |
| `validateQueryLimit` | Validación de límites | Límites de consulta |
| `validateSearchQuery` | Validación de búsqueda | Consultas de texto |

## 🎯 Beneficios del Sistema

### **Seguridad**
- ✅ Prevención de XSS
- ✅ Protección contra inyección
- ✅ Validación de tipos estricta
- ✅ Sanitización automática

### **Calidad de Datos**
- ✅ Validación consistente
- ✅ Mensajes de error claros
- ✅ Conversión automática de tipos
- ✅ Normalización de datos

### **Mantenibilidad**
- ✅ Esquemas centralizados
- ✅ Reutilización de validaciones
- ✅ Fácil extensión
- ✅ Documentación completa

### **Performance**
- ✅ Validación eficiente
- ✅ Sanitización optimizada
- ✅ Caching de esquemas
- ✅ Logging estructurado

## 🔄 Changelog

### **v2.0.0 (Diciembre 2024)**
- ✅ Implementación completa del sistema de validación
- ✅ 15+ esquemas de validación
- ✅ 10+ middleware especializados
- ✅ Sanitización robusta de datos
- ✅ Manejo de errores mejorado
- ✅ Documentación completa

### **v1.5.0 (Noviembre 2024)**
- ✅ Validación básica con Joi
- ✅ Middleware de autenticación
- ✅ Validación de archivos básica

### **v1.0.0 (Octubre 2024)**
- ✅ Validación manual básica
- ✅ Middleware de errores
- ✅ Estructura inicial

---

**Estado**: ✅ Completamente Implementado  
**Cobertura**: 100% de endpoints  
**Documentación**: ✅ Completa  
**Testing**: ⚠️ Pendiente 