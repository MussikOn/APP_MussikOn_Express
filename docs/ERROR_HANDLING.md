# Manejo de Errores en MusikOn API

## Descripción General

Este documento describe las estrategias y patrones de manejo de errores implementados en la API de MusikOn, incluyendo el nuevo sistema de solicitudes de músicos y las mejores prácticas para mantener consistencia en toda la aplicación.

## Estructura de Respuestas de Error

### Formato Estándar
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [
    "Detalle específico del error 1",
    "Detalle específico del error 2"
  ],
  "code": "ERROR_CODE_OPTIONAL"
}
```

### Formato para Validaciones (Joi)
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": [
    "organizerId must be a valid email",
    "eventName must be at least 3 characters long"
  ]
}
```

## Middleware Global de Errores

### Implementación
```typescript
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  // Errores de validación Joi
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: "Datos de entrada inválidos",
      errors: err.details.map((detail: any) => detail.message)
    });
  }
  
  // Errores de autenticación
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado"
    });
  }
  
  // Errores de Firebase
  if (err.code && err.code.startsWith('auth/')) {
    return res.status(401).json({
      success: false,
      message: "Error de autenticación",
      code: err.code
    });
  }
  
  // Error por defecto
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

## Códigos de Error Específicos

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": [
    "eventDate must be a valid date",
    "startTime must be before endTime"
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Token de autenticación requerido"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "No tienes permisos para realizar esta acción"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Solicitud no encontrada"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "message": "Ya existe una solicitud activa para este evento"
}
```

### 422 - Unprocessable Entity
```json
{
  "success": false,
  "message": "La solicitud ha expirado",
  "code": "REQUEST_EXPIRED"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

## Errores Específicos del Sistema de Solicitudes de Músicos

### Validación de Solicitudes
```typescript
// Ejemplo de validación en createMusicianRequest
const { error, value } = createMusicianRequestSchema.validate(req.body);
if (error) {
  return res.status(400).json({
    success: false,
    message: "Datos de entrada inválidos",
    errors: error.details.map(detail => detail.message)
  });
}

// Validación de horarios
if (startTime >= endTime) {
  return res.status(400).json({
    success: false,
    message: "La hora de fin debe ser después de la hora de inicio"
  });
}
```

### Errores de Expiración
```typescript
// Solicitud expirada
if (request.status === 'expired') {
  return res.status(422).json({
    success: false,
    message: "La solicitud ha expirado",
    code: "REQUEST_EXPIRED"
  });
}
```

### Errores de Estado
```typescript
// Solicitud ya no está disponible
if (request.status !== 'searching_musician') {
  return res.status(409).json({
    success: false,
    message: "La solicitud ya no está disponible",
    code: "REQUEST_NOT_AVAILABLE"
  });
}
```

## Manejo de Errores en Controladores

### Patrón Recomendado
```typescript
export const createMusicianRequest = async (req: Request, res: Response) => {
  try {
    // 1. Validar datos de entrada
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Datos de entrada inválidos",
        errors: error.details.map(detail => detail.message)
      });
    }

    // 2. Validar lógica de negocio
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "La hora de fin debe ser después de la hora de inicio"
      });
    }

    // 3. Procesar solicitud
    const request = await createMusicianRequestModel(value);

    // 4. Respuesta exitosa
    return res.status(201).json({
      success: true,
      message: "Solicitud creada exitosamente",
      data: request
    });

  } catch (error) {
    // 5. Manejo de errores específicos
    if (error.code === 'REQUEST_EXISTS') {
      return res.status(409).json({
        success: false,
        message: "Ya existe una solicitud activa para este evento"
      });
    }

    // 6. Error genérico
    console.error("Error al crear solicitud:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};
```

## Errores de Validación Joi

### Esquemas de Validación
```typescript
const createMusicianRequestSchema = Joi.object({
  organizerId: Joi.string().email().required(),
  organizerName: Joi.string().min(2).max(100).required(),
  eventName: Joi.string().min(3).max(200).required(),
  eventType: Joi.string().valid('culto', 'campana_dentro_templo', 'otro').required(),
  eventDate: Joi.string().isoDate().required(),
  startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  location: Joi.string().min(5).max(500).required(),
  instrumentType: Joi.string().min(2).max(100).required(),
  eventDescription: Joi.string().min(10).max(1000).required(),
});
```

### Mensajes de Error Personalizados
```typescript
const schema = Joi.object({
  eventDate: Joi.string().isoDate().required()
    .messages({
      'string.empty': 'La fecha del evento es requerida',
      'string.isoDate': 'La fecha debe tener formato ISO (YYYY-MM-DD)',
      'any.required': 'La fecha del evento es obligatoria'
    })
});
```

## Errores de Autenticación

### Token Inválido
```json
{
  "success": false,
  "message": "Token inválido o expirado",
  "code": "INVALID_TOKEN"
}
```

### Token Expirado
```json
{
  "success": false,
  "message": "Token expirado",
  "code": "TOKEN_EXPIRED"
}
```

### Usuario No Autorizado
```json
{
  "success": false,
  "message": "No tienes permisos para realizar esta acción",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

## Errores de Archivos

### Subida de Imágenes
```typescript
// Archivo muy grande
if (file.size > 5 * 1024 * 1024) {
  return res.status(413).json({
    success: false,
    message: "El archivo excede el tamaño máximo de 5MB"
  });
}

// Tipo de archivo no permitido
if (!allowedTypes.includes(file.mimetype)) {
  return res.status(400).json({
    success: false,
    message: "Solo se permiten archivos de imagen (JPG, PNG, WebP)"
  });
}
```

## Logging y Monitoreo

### Configuración de Logs
```typescript
// Logger para errores
const logError = (error: any, context: string) => {
  console.error(`[${context}] Error:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userId: req.user?.id,
    endpoint: req.path,
    method: req.method
  });
};
```

### Métricas de Error
```typescript
// Contador de errores por tipo
const errorCounts = {
  validation: 0,
  authentication: 0,
  notFound: 0,
  serverError: 0
};
```

## Buenas Prácticas

### Seguridad
1. **No exponer stack traces** en producción
2. **Validar todos los inputs** con Joi
3. **Sanitizar mensajes de error** antes de enviar
4. **Usar códigos de error** consistentes

### UX
1. **Mensajes claros** y específicos
2. **Sugerencias de solución** cuando sea apropiado
3. **Códigos de error** para el frontend
4. **Logging detallado** para debugging

### Mantenimiento
1. **Documentar errores** en Swagger
2. **Monitorear errores** en producción
3. **Actualizar mensajes** según feedback
4. **Revisar logs** regularmente

## Próximos Pasos

1. **Implementar sistema de notificaciones** de errores
2. **Agregar métricas** de rendimiento
3. **Crear dashboard** de monitoreo
4. **Automatizar respuestas** a errores comunes

---

**Nota**: Este sistema de manejo de errores es fundamental para la experiencia del usuario y la estabilidad de la aplicación, especialmente en el nuevo sistema de solicitudes de músicos. 