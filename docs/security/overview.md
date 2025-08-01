# 🔒 Seguridad en MusikOn API

> **Sistema completo de seguridad con autenticación, autorización, validaciones, middlewares y protección de datos**

## 📋 Tabla de Contenidos

- [Autenticación y Autorización](#autenticación-y-autorización)
- [Roles y Permisos](#roles-y-permisos)
- [Validaciones con DTOs](#validaciones-con-dtos) ✅ **NUEVO**
- [Middlewares de Seguridad](#middlewares-de-seguridad) ✅ **NUEVO**
- [Rate Limiting](#rate-limiting) ✅ **NUEVO**
- [Protección de Datos](#protección-de-datos)
- [HTTPS y CORS](#https-y-cors)
- [Cabeceras de Seguridad](#cabeceras-de-seguridad)
- [Reglas de Firestore](#reglas-de-firestore)
- [Logging de Seguridad](#logging-de-seguridad) ✅ **NUEVO**
- [Buenas Prácticas](#buenas-prácticas)

## 🔐 Autenticación y Autorización (JWT)

### Implementación Principal

Todos los endpoints protegidos requieren un token JWT en el header `Authorization: Bearer <token>`.

```typescript
// src/middleware/authMiddleware.ts
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new OperationalError('Token no proporcionado', 401, 'TOKEN_MISSING');
    }

    const decoded = jwt.verify(token, TOKEN_SECRET) as JwtPayload;
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new OperationalError('Token inválido', 401, 'INVALID_TOKEN');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new OperationalError('Token expirado', 401, 'TOKEN_EXPIRED');
    }
    throw new OperationalError('Error de autenticación', 401, 'AUTHENTICATION_ERROR');
  }
};
```

### Ejemplo de Uso en Frontend

```javascript
// Para todas las peticiones autenticadas
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
};

fetch('/events/my-pending', { headers })
  .then(response => response.json())
  .then(data => console.log(data));
```

### Google OAuth ✅

```typescript
// src/controllers/authGoogleController.ts
export const googleAuthController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;
    
    // Verificar token con Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const userEmail = payload?.email;
    
    // Buscar o crear usuario
    let user = await findUserByEmail(userEmail);
    
    if (!user) {
      user = await createUserFromGoogle(payload);
    }
    
    // Generar JWT
    const token = generateToken(user);
    
    res.status(200).json({
      success: true,
      message: 'Autenticación con Google exitosa',
      token,
      user
    });
  } catch (error) {
    throw new OperationalError('Error en autenticación con Google', 401, 'GOOGLE_AUTH_ERROR');
  }
};
```

## 👥 Roles y Permisos

### Sistema de Roles Jerárquico

Los roles principales son (en orden de privilegios ascendentes):

1. **`usuario`** - Usuario general
2. **`musico`** - Músico registrado
3. **`eventCreator`** - Organizador de eventos
4. **`adminJunior`** - Administrador junior
5. **`adminMidLevel`** - Administrador medio
6. **`adminSenior`** - Administrador senior
7. **`superAdmin`** - Super administrador

### Middleware de Autorización

```typescript
// src/middleware/adminOnly.ts
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new OperationalError('Usuario no autenticado', 401, 'NOT_AUTHENTICATED');
    }

    if (!allowedRoles.includes(req.user.roll)) {
      throw new OperationalError('No autorizado. Rol insuficiente.', 403, 'INSUFFICIENT_ROLE');
    }

    next();
  };
};

// Uso específico para administradores
export const adminOnly = requireRole('adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin');
```

### Ejemplos de Uso

```typescript
// Solo organizadores pueden crear eventos
router.post('/events', 
  authMiddleware, 
  requireRole('eventCreator'), 
  validate(createEventDTO),
  asyncHandler(createEventController)
);

// Solo músicos pueden aceptar eventos
router.post('/musician-requests/accept', 
  authMiddleware, 
  requireRole('musico'), 
  validate(acceptRequestDTO),
  asyncHandler(acceptRequestController)
);

// Solo administradores pueden acceder a analytics
router.get('/analytics/dashboard', 
  authMiddleware, 
  requireRole('adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin'),
  asyncHandler(getDashboardController)
);

// Solo super admin puede eliminar usuarios
router.delete('/admin/users/:id', 
  authMiddleware, 
  requireRole('superAdmin'),
  asyncHandler(deleteUserController)
);
```

## ✅ Validaciones con DTOs ✅ **NUEVO**

### Implementación con Joi

```typescript
// src/types/dtos.ts
import Joi from 'joi';

export const registerDTO = Joi.object({
  name: Joi.string().required().min(2).max(50),
  lastName: Joi.string().required().min(2).max(50),
  userEmail: Joi.string().email().required(),
  userPassword: Joi.string().required().min(8).pattern(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  ).message('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  roll: Joi.string().valid('usuario', 'musico', 'eventCreator').required()
});

export const loginDTO = Joi.object({
  userEmail: Joi.string().email().required(),
  userPassword: Joi.string().required()
});

export const createEventDTO = Joi.object({
  eventName: Joi.string().required().min(3).max(100),
  eventType: Joi.string().valid('boda', 'concierto', 'evento_corporativo', 'festival', 'culto').required(),
  date: Joi.date().iso().required().min('now'),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  location: Joi.string().required().min(5).max(200),
  instrument: Joi.string().required(),
  budget: Joi.number().positive().required(),
  description: Joi.string().optional().max(500)
});
```

### Middleware de Validación

```typescript
// src/middleware/validationMiddleware.ts
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      throw new OperationalError('Datos de entrada inválidos', 400, 'VALIDATION_ERROR', details);
    }

    req.body = value;
    next();
  };
};
```

### Uso en Rutas

```typescript
// src/routes/authRoutes.ts
router.post('/register', 
  validate(registerDTO),
  asyncHandler(registerController)
);

router.post('/login', 
  validate(loginDTO),
  asyncHandler(loginController)
);

// src/routes/eventsRoutes.ts
router.post('/events', 
  authMiddleware,
  requireRole('eventCreator'),
  validate(createEventDTO),
  asyncHandler(createEventController)
);
```

## 🛡️ Middlewares de Seguridad ✅ **NUEVO**

### Helmet - Cabeceras HTTP Seguras

```typescript
// index.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### CORS Configurado

```typescript
// index.ts
import cors from 'cors';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://mussikon.com', 'https://www.mussikon.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
};

app.use(cors(corsOptions));
```

### Rate Limiting

```typescript
// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_ERROR',
      message: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_ERROR',
      message: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.',
      timestamp: new Date().toISOString()
    }
  }
});
```

### Aplicación de Rate Limiting

```typescript
// index.ts
app.use('/auth', authLimiter); // Rate limiting específico para autenticación
app.use('/api', apiLimiter);   // Rate limiting general para API
```

## 🔒 Protección de Datos

### Sanitización de Inputs

```typescript
// src/middleware/sanitizationMiddleware.ts
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = DOMPurify.sanitize(req.body[key]);
      }
    });
  }
  
  next();
};
```

### Validación de Tipos de Archivo

```typescript
// src/middleware/uploadMiddleware.ts
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new OperationalError('Tipo de archivo no permitido', 400, 'INVALID_FILE_TYPE'), false);
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter
});
```

### Encriptación de Contraseñas

```typescript
// src/utils/functions.ts
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
```

## 🌐 HTTPS y CORS

### Configuración de Producción

```typescript
// En producción, la API debe estar detrás de HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### CORS Restringido en Producción

```typescript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://mussikon.com',
        'https://www.mussikon.com',
        'https://app.mussikon.com'
      ]
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Request-ID',
    'X-Client-Version'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};
```

## 🔒 Cabeceras de Seguridad

### Configuración de Helmet

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
  xssFilter: true
}));
```

## 🔥 Reglas de Firestore

### Reglas de Seguridad

```json
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios - Solo pueden leer/escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.email == userId || 
         request.auth.token.roll in ['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']);
    }
    
    // Eventos - Solo el creador o admins pueden modificar
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.token.roll in ['eventCreator', 'adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin'];
      allow update, delete: if request.auth != null && 
        (resource.data.user == request.auth.token.email || 
         request.auth.token.roll in ['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']);
    }
    
    // Solicitudes de músicos
    match /musicianRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.userId == request.auth.token.email || 
         request.auth.token.roll in ['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']);
    }
    
    // Chat - Solo participantes pueden acceder
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        request.auth.token.email in resource.data.participants;
    }
    
    // Imágenes - Solo propietario o admins
    match /images/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.uploadedBy == request.auth.token.email || 
         request.auth.token.roll in ['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']);
    }
  }
}
```

## 📝 Logging de Seguridad ✅ **NUEVO**

### Logging de Eventos de Seguridad

```typescript
// src/services/loggerService.ts
export class SecurityLogger {
  static logAuthAttempt(userEmail: string, success: boolean, ip: string): void {
    loggerService.info('Intento de autenticación', {
      userEmail,
      success,
      ip,
      timestamp: new Date().toISOString(),
      type: 'AUTH_ATTEMPT'
    });
  }

  static logUnauthorizedAccess(userId: string, endpoint: string, ip: string): void {
    loggerService.warn('Acceso no autorizado', {
      userId,
      endpoint,
      ip,
      timestamp: new Date().toISOString(),
      type: 'UNAUTHORIZED_ACCESS'
    });
  }

  static logRateLimitExceeded(ip: string, endpoint: string): void {
    loggerService.warn('Rate limit excedido', {
      ip,
      endpoint,
      timestamp: new Date().toISOString(),
      type: 'RATE_LIMIT_EXCEEDED'
    });
  }

  static logSuspiciousActivity(userId: string, activity: string, details: any): void {
    loggerService.error('Actividad sospechosa detectada', {
      userId,
      activity,
      details,
      timestamp: new Date().toISOString(),
      type: 'SUSPICIOUS_ACTIVITY'
    });
  }
}
```

### Integración en Middlewares

```typescript
// En authMiddleware
try {
  // ... validación de token
  SecurityLogger.logAuthAttempt(req.body.userEmail, true, req.ip);
} catch (error) {
  SecurityLogger.logAuthAttempt(req.body.userEmail, false, req.ip);
  throw error;
}

// En requireRole
if (!allowedRoles.includes(req.user.roll)) {
  SecurityLogger.logUnauthorizedAccess(req.user.id, req.url, req.ip);
  throw new OperationalError('No autorizado. Rol insuficiente.', 403, 'INSUFFICIENT_ROLE');
}
```

## 🛡️ Buenas Prácticas

### 1. Validación de Entrada

```typescript
// ✅ Siempre validar entrada con DTOs
router.post('/events', validate(createEventDTO), createEventController);

// ❌ Nunca confiar en datos de entrada sin validar
router.post('/events', createEventController);
```

### 2. Manejo de Errores Seguro

```typescript
// ✅ No exponer información sensible en errores
throw new OperationalError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');

// ❌ No exponer detalles internos
throw new Error('Password hash mismatch: abc123 vs def456');
```

### 3. Logging Seguro

```typescript
// ✅ Logging sin información sensible
loggerService.info('Usuario autenticado', { userId: user.id, timestamp: new Date() });

// ❌ No loggear contraseñas o tokens
loggerService.info('Login exitoso', { userEmail, password, token });
```

### 4. Sanitización de Datos

```typescript
// ✅ Sanitizar datos antes de procesar
const cleanName = DOMPurify.sanitize(req.body.name);

// ❌ Usar datos sin sanitizar
const name = req.body.name;
```

### 5. Rate Limiting

```typescript
// ✅ Aplicar rate limiting en endpoints sensibles
app.use('/auth', authLimiter);
app.use('/api', apiLimiter);

// ❌ Sin protección contra abuso
app.use('/auth', authRoutes);
```

### 6. Validación de Roles

```typescript
// ✅ Validar roles en cada endpoint
router.get('/admin/users', authMiddleware, requireRole('admin'), getUsersController);

// ❌ Confiar en validación del frontend
router.get('/admin/users', getUsersController);
```

---

**Documentación actualizada al**: $(date)

**Versión**: 2.0.0 - Sistema completo de seguridad implementado ✅ 