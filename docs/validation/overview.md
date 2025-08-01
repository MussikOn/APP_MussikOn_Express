# 🛡️ Sistema de Validación - MussikOn API

## 📋 Descripción General

El Sistema de Validación de MussikOn API proporciona una capa robusta de validación y sanitización de datos para todos los endpoints. Implementa validación de esquemas con Joi, sanitización de entrada, validación de archivos, y manejo seguro de datos inconsistentes de Firestore.

## 🚀 Características Principales

### **🔍 Validación de Esquemas**
- **Joi Schemas**: Validación completa de tipos y formatos
- **Custom Validators**: Validadores personalizados para casos específicos
- **Error Messages**: Mensajes de error detallados y localizados
- **Nested Validation**: Validación de objetos anidados complejos

### **🧹 Sanitización de Input**
- **XSS Prevention**: Prevención de ataques de cross-site scripting
- **SQL Injection Protection**: Protección contra inyección de código
- **Input Cleaning**: Limpieza automática de datos de entrada
- **Type Conversion**: Conversión segura de tipos de datos

### **📁 Validación de Archivos**
- **File Type Validation**: Validación de tipos MIME
- **Size Limits**: Límites de tamaño configurables
- **Content Analysis**: Análisis de contenido de archivos
- **Virus Scanning**: Escaneo de malware (opcional)

### **🛡️ Seguridad Avanzada**
- **Rate Limiting**: Limitación de velocidad de requests
- **Input Length Limits**: Límites de longitud de entrada
- **Special Character Filtering**: Filtrado de caracteres especiales
- **Encoding Validation**: Validación de codificación

## 📊 Arquitectura del Sistema

### **Componentes Principales**

```
src/middleware/validationMiddleware.ts    # Middleware principal
src/utils/validationSchemas.ts           # Esquemas Joi
src/utils/applyValidations.ts            # Aplicación de validaciones
src/middleware/errorHandler.ts           # Manejo de errores
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

### **Esquemas de Validación**

```typescript
// src/utils/validationSchemas.ts
export const createEventSchema = Joi.object({
  eventName: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'El nombre del evento debe tener al menos 3 caracteres',
      'string.max': 'El nombre del evento no puede exceder 100 caracteres',
      'any.required': 'El nombre del evento es obligatorio'
    }),
  
  eventType: Joi.string()
    .valid('boda', 'concierto', 'fiesta', 'evento_corporativo')
    .required(),
  
  date: Joi.date()
    .greater('now')
    .required(),
  
  location: Joi.string()
    .min(5)
    .max(200)
    .required(),
  
  budget: Joi.number()
    .positive()
    .min(1000)
    .max(1000000)
    .required(),
  
  description: Joi.string()
    .max(1000)
    .optional(),
  
  instrument: Joi.string()
    .valid('piano', 'guitarra', 'bajo', 'bateria', 'saxofon', 'violin')
    .required()
});
```

### **Sanitización de Input**

```typescript
// Función de sanitización
export const sanitizeInput = (data: any): any => {
  if (typeof data === 'string') {
    return data
      .trim()
      .replace(/[<>]/g, '') // Prevenir XSS básico
      .replace(/\s+/g, ' '); // Normalizar espacios
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
};
```

## 🔌 Middlewares Especializados

### **1. Validación de Archivos**

```typescript
export const validateFile = (
  fieldName: string,
  allowedTypes: string[],
  maxSize: number
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const file = req.file || req.files?.[fieldName];
    
    if (!file) {
      return next();
    }
    
    // Validar tipo de archivo
    if (file.mimetype && !allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type',
        allowedTypes,
        receivedType: file.mimetype
      });
    }
    
    // Validar tamaño
    if (file.size && file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        maxSize: maxSize,
        receivedSize: file.size
      });
    }
    
    next();
  };
};
```

### **2. Validación de Paginación**

```typescript
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const { limit, page, offset } = req.query;
  
  // Validar límite
  if (limit) {
    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit parameter',
        message: 'Limit must be between 1 and 100'
      });
    }
  }
  
  // Validar página
  if (page) {
    const pageNum = parseInt(page as string);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page parameter',
        message: 'Page must be a positive number'
      });
    }
  }
  
  next();
};
```

### **3. Validación de Búsqueda**

```typescript
export const validateSearchQuery = (req: Request, res: Response, next: NextFunction) => {
  const { query, category, sortBy, sortOrder } = req.query;
  
  // Validar query
  if (query && typeof query === 'string') {
    if (query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query too short',
        message: 'Query must be at least 2 characters long'
      });
    }
    
    if (query.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Search query too long',
        message: 'Query cannot exceed 100 characters'
      });
    }
  }
  
  // Validar categoría
  if (category && !['all', 'events', 'users', 'requests'].includes(category as string)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid category',
      message: 'Category must be one of: all, events, users, requests'
    });
  }
  
  // Validar ordenamiento
  if (sortOrder && !['asc', 'desc'].includes(sortOrder as string)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid sort order',
      message: 'Sort order must be "asc" or "desc"'
    });
  }
  
  next();
};
```

## 📋 Esquemas por Endpoint

### **Autenticación**

```typescript
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Formato de email inválido',
      'any.required': 'El email es obligatorio'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es obligatoria'
    })
});

export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required(),
  
  lastName: Joi.string()
    .min(2)
    .max(50)
    .required(),
  
  email: Joi.string()
    .email()
    .required(),
  
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    }),
  
  roll: Joi.string()
    .valid('user', 'musician', 'admin', 'superadmin')
    .required()
});
```

### **Eventos**

```typescript
export const createEventSchema = Joi.object({
  eventName: Joi.string()
    .min(3)
    .max(100)
    .required(),
  
  eventType: Joi.string()
    .valid('boda', 'concierto', 'fiesta', 'evento_corporativo', 'otro')
    .required(),
  
  date: Joi.date()
    .greater('now')
    .required(),
  
  time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  
  location: Joi.string()
    .min(5)
    .max(200)
    .required(),
  
  duration: Joi.string()
    .pattern(/^[0-9]+$/)
    .required(),
  
  instrument: Joi.string()
    .valid('piano', 'guitarra', 'bajo', 'bateria', 'saxofon', 'violin', 'canto', 'teclado', 'flauta', 'otro')
    .required(),
  
  budget: Joi.number()
    .positive()
    .min(1000)
    .max(1000000)
    .required(),
  
  description: Joi.string()
    .max(1000)
    .optional()
});
```

### **Solicitudes de Músicos**

```typescript
export const createMusicianRequestSchema = Joi.object({
  eventName: Joi.string()
    .min(3)
    .max(100)
    .required(),
  
  eventType: Joi.string()
    .valid('boda', 'concierto', 'fiesta', 'evento_corporativo', 'otro')
    .required(),
  
  date: Joi.date()
    .greater('now')
    .required(),
  
  time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  
  location: Joi.string()
    .min(5)
    .max(200)
    .required(),
  
  duration: Joi.string()
    .pattern(/^[0-9]+$/)
    .required(),
  
  instrument: Joi.string()
    .valid('piano', 'guitarra', 'bajo', 'bateria', 'saxofon', 'violin', 'canto', 'teclado', 'flauta', 'otro')
    .required(),
  
  bringInstrument: Joi.boolean()
    .required(),
  
  budget: Joi.number()
    .positive()
    .min(1000)
    .max(1000000)
    .required(),
  
  description: Joi.string()
    .max(1000)
    .optional(),
  
  songs: Joi.array()
    .items(Joi.string())
    .max(20)
    .optional(),
  
  recommendations: Joi.array()
    .items(Joi.string())
    .max(10)
    .optional()
});
```

## 🛡️ Validación de Datos de Firestore

### **Manejo de Datos Inconsistentes**

```typescript
// Función auxiliar para validación segura de strings
export const validateStringField = (field: any): string | null => {
  if (typeof field === 'string') {
    return field.trim();
  }
  if (field === null || field === undefined) {
    return null;
  }
  return String(field).trim();
};

// Función para búsqueda segura en campos de texto
export const searchInField = (field: any, searchTerm: string): boolean => {
  if (typeof field !== 'string') {
    return false;
  }
  return field.toLowerCase().includes(searchTerm.toLowerCase());
};

// Uso en servicios de búsqueda
const filteredResults = results.filter(item => 
  searchInField(item.name, searchTerm) ||
  searchInField(item.description, searchTerm) ||
  searchInField(item.location, searchTerm)
);
```

### **Validación de Tipos de Datos**

```typescript
// Validación de tipos antes de operaciones
export const validateEventData = (event: any): Event => {
  return {
    id: validateStringField(event.id) || '',
    eventName: validateStringField(event.eventName) || 'Evento sin nombre',
    eventType: validateStringField(event.eventType) || 'otro',
    date: validateStringField(event.date) || '',
    time: validateStringField(event.time) || '',
    location: validateStringField(event.location) || '',
    duration: validateStringField(event.duration) || '',
    instrument: validateStringField(event.instrument) || '',
    budget: typeof event.budget === 'number' ? event.budget : 0,
    description: validateStringField(event.description) || '',
    status: validateStringField(event.status) || 'pending',
    createdAt: validateStringField(event.createdAt) || new Date().toISOString(),
    updatedAt: validateStringField(event.updatedAt) || new Date().toISOString()
  };
};
```

## 🔧 Aplicación de Validaciones

### **Utilidad de Aplicación**

```typescript
// src/utils/applyValidations.ts
export const applyAuthValidations = (router: Router) => {
  router.post('/register', validate(registerSchema), authController.register);
  router.post('/login', validate(loginSchema), authController.login);
  router.post('/google', validate(googleAuthSchema), authController.googleAuth);
  router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
};

export const applyEventValidations = (router: Router) => {
  router.post('/', 
    validate(createEventSchema),
    validateFile('image', ['image/jpeg', 'image/png'], 5 * 1024 * 1024),
    eventController.createEvent
  );
  
  router.put('/:id', 
    validateId,
    validate(updateEventSchema),
    eventController.updateEvent
  );
  
  router.delete('/:id', 
    validateId,
    eventController.deleteEvent
  );
};

export const applySearchValidations = (router: Router) => {
  router.get('/global', 
    validatePagination,
    validateSearchQuery,
    searchController.globalSearch
  );
  
  router.get('/events', 
    validatePagination,
    validateSearchQuery,
    searchController.searchEvents
  );
  
  router.get('/users', 
    validatePagination,
    validateSearchQuery,
    searchController.searchUsers
  );
};
```

## 📊 Manejo de Errores

### **Estructura de Error**

```typescript
interface ValidationError {
  field: string;
  message: string;
  type: string;
  value?: any;
}

interface ValidationResponse {
  success: false;
  error: 'Validation Error';
  details: ValidationError[];
  timestamp: string;
  path: string;
}
```

### **Middleware de Manejo de Errores**

```typescript
// src/middleware/errorHandler.ts
export const validationErrorHandler = (
  error: Joi.ValidationError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationErrors = error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message,
    type: detail.type,
    value: detail.context?.value
  }));

  return res.status(400).json({
    success: false,
    error: 'Validation Error',
    details: validationErrors,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);
  
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};
```

## 🧪 Testing

### **Tests de Validación**

```typescript
describe('Validation Middleware', () => {
  it('should validate required fields', () => {
    const invalidData = {
      email: 'invalid-email',
      password: '123'
    };
    
    const { error } = loginSchema.validate(invalidData);
    expect(error).toBeDefined();
    expect(error?.details).toHaveLength(2);
  });
  
  it('should sanitize input data', () => {
    const dirtyData = {
      name: '  John Doe  ',
      email: 'john@example.com',
      description: '<script>alert("xss")</script>'
    };
    
    const sanitized = sanitizeInput(dirtyData);
    expect(sanitized.name).toBe('John Doe');
    expect(sanitized.description).not.toContain('<script>');
  });
  
  it('should handle null values safely', () => {
    const dataWithNulls = {
      name: 'John',
      location: null,
      description: undefined
    };
    
    const result = searchInField(dataWithNulls.location, 'test');
    expect(result).toBe(false);
  });
});
```

## 📈 Métricas y Monitoreo

### **Logging de Validación**

```typescript
// Logging de errores de validación
export const logValidationError = (error: ValidationError, req: Request) => {
  logger.error('Validation Error', {
    field: error.field,
    message: error.message,
    type: error.type,
    value: error.value,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

// Métricas de validación
export const trackValidationMetrics = (success: boolean, endpoint: string) => {
  const metric = success ? 'validation_success' : 'validation_failure';
  // Enviar métrica a sistema de monitoreo
  metrics.increment(metric, { endpoint });
};
```

## 🚀 Optimización y Performance

### **Validación Lazy**

```typescript
// Validación solo cuando es necesario
export const conditionalValidation = (condition: boolean, schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (condition) {
      return validate(schema)(req, res, next);
    }
    next();
  };
};
```

### **Cache de Esquemas**

```typescript
// Cache de esquemas compilados
const schemaCache = new Map<string, Joi.ObjectSchema>();

export const getCachedSchema = (schemaName: string): Joi.ObjectSchema => {
  if (!schemaCache.has(schemaName)) {
    const schema = getSchemaByName(schemaName);
    schemaCache.set(schemaName, schema);
  }
  return schemaCache.get(schemaName)!;
};
```

## 🔄 Changelog

### **v2.0.0 (Diciembre 2024)**
- ✅ **Validación Robusta**: Manejo seguro de datos inconsistentes de Firestore
- ✅ **Sanitización Avanzada**: Prevención mejorada de XSS e inyección
- ✅ **Esquemas Completos**: Validación exhaustiva para todos los endpoints
- ✅ **Manejo de Errores**: Estructura de errores mejorada y logging
- ✅ **Performance**: Optimización de validación y cache de esquemas

### **v1.5.0 (Noviembre 2024)**
- ✅ **Sistema de Validación**: Implementación inicial con Joi
- ✅ **Middleware Básico**: Validación de esquemas y sanitización
- ✅ **Esquemas Principales**: Para autenticación y eventos
- ✅ **Manejo de Errores**: Estructura básica de errores

## 🚀 Próximas Mejoras

### **En Desarrollo**
- [ ] **Validación Asíncrona**: Validación de datos únicos en base de datos
- [ ] **Validación de Imágenes**: Análisis de contenido y detección de malware
- [ ] **Validación de Geolocalización**: Validación de coordenadas y direcciones
- [ ] **Validación de Pagos**: Validación de métodos de pago y montos

### **Roadmap**
- [ ] **Machine Learning**: Detección automática de datos anómalos
- [ ] **Validación de Voz**: Validación de archivos de audio
- [ ] **Validación de Documentos**: Validación de PDFs y documentos
- [ ] **Validación de Video**: Validación de archivos de video

---

**Estado**: ✅ Producción Ready  
**Versión**: 2.0.0  
**Última Actualización**: Diciembre 2024 