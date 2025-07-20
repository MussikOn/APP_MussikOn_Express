# Seguridad en MusikOn API

## Descripción General

Este documento describe las medidas de seguridad implementadas en la API de MusikOn, incluyendo autenticación, autorización, validación de datos y protección contra vulnerabilidades comunes. El sistema evolucionó para soportar el nuevo sistema de solicitudes de músicos con medidas de seguridad mejoradas.

## 1. Autenticación y Autorización (JWT)

### Configuración de JWT
```typescript
// Configuración de JWT
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: '24h',
  algorithm: 'HS256'
};

// Middleware de autenticación
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token de autenticación requerido"
    });
  }

  jwt.verify(token, jwtConfig.secret, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Token inválido o expirado"
      });
    }
    req.user = user;
    next();
  });
};
```

### Uso en Frontend
```javascript
// Ejemplo de uso en React Native
const apiCall = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('userToken');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  return response.json();
};
```

## 2. Roles y Permisos

### Sistema de Roles
```typescript
// Roles disponibles
enum UserRole {
  MUSICIAN = 'musician',
  ORGANIZER = 'organizer',
  ADMIN = 'admin'
}

// Middleware de autorización por rol
const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Autenticación requerida"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para realizar esta acción"
      });
    }

    next();
  };
};
```

### Aplicación en Endpoints
```typescript
// Endpoints específicos por rol
// Solo organizadores pueden crear solicitudes
app.post('/musician-requests/create', 
  authenticateToken, 
  requireRole([UserRole.ORGANIZER]), 
  createMusicianRequest
);

// Solo músicos pueden responder a solicitudes
app.post('/musician-requests/respond/:requestId', 
  authenticateToken, 
  requireRole([UserRole.MUSICIAN]), 
  respondToRequest
);
```

## 3. Validación de Datos (Joi)

### Esquemas de Validación
```typescript
// Validación de solicitudes de músicos
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

// Sanitización de datos
const sanitizeInput = (data: any) => {
  return {
    ...data,
    eventName: data.eventName.trim(),
    eventDescription: data.eventDescription.trim(),
    location: data.location.trim()
  };
};
```

### Protección contra Inyección
```typescript
// Validación de coordenadas
const locationCoordinatesSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

// Validación de archivos
const fileValidation = (file: Express.Multer.File) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Tipo de archivo no permitido');
  }

  if (file.size > maxSize) {
    throw new Error('Archivo demasiado grande');
  }
};
```

## 4. HTTPS y CORS

### Configuración de CORS
```typescript
// Configuración de CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://musikon.com', 'https://app.musikon.com']
    : ['http://localhost:3000', 'http://localhost:19006'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count']
};

app.use(cors(corsOptions));
```

### Configuración de Helmet
```typescript
// Configuración de Helmet para seguridad
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

## 5. Rate Limiting

### Implementación de Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

// Rate limiting para endpoints críticos
const createRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 solicitudes por ventana
  message: {
    success: false,
    message: "Demasiadas solicitudes. Intenta de nuevo en 15 minutos."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar a endpoints de creación
app.use('/musician-requests/create', createRequestLimiter);
app.use('/auth/login', createRequestLimiter);
```

## 6. Validación de Archivos

### Subida Segura de Imágenes
```typescript
// Configuración de Multer con validaciones
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Validar tipo de archivo
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten archivos de imagen'));
    }
    
    // Validar extensión
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new Error('Extensión de archivo no permitida'));
    }
    
    cb(null, true);
  }
});
```

## 7. Reglas de Firestore

### Reglas de Seguridad
```javascript
// Reglas de Firestore para solicitudes de músicos
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios solo pueden acceder a sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.token.email == userId;
    }
    
    // Solicitudes de músicos
    match /musicianRequests/{requestId} {
      // Organizadores pueden crear y gestionar sus solicitudes
      allow create: if request.auth != null && 
        request.auth.token.role == 'organizer' &&
        request.auth.token.email == resource.data.organizerId;
      
      // Músicos pueden leer solicitudes disponibles
      allow read: if request.auth != null && 
        request.auth.token.role == 'musician' &&
        resource.data.status == 'searching_musician';
      
      // Organizadores pueden actualizar sus solicitudes
      allow update: if request.auth != null && 
        request.auth.token.role == 'organizer' &&
        request.auth.token.email == resource.data.organizerId;
    }
    
    // Respuestas de músicos
    match /musicianResponses/{responseId} {
      // Músicos pueden crear respuestas
      allow create: if request.auth != null && 
        request.auth.token.role == 'musician';
      
      // Organizadores pueden leer respuestas de sus solicitudes
      allow read: if request.auth != null && 
        request.auth.token.role == 'organizer' &&
        request.auth.token.email == get(/databases/$(database)/documents/musicianRequests/$(resource.data.requestId)).data.organizerId;
    }
  }
}
```

## 8. Protección contra Vulnerabilidades

### SQL Injection (Firestore)
```typescript
// Uso seguro de consultas Firestore
const getAvailableRequests = async (instrumentType?: string) => {
  let query = db.collection('musicianRequests')
    .where('status', '==', 'searching_musician')
    .where('searchExpiryTime', '>', new Date());

  if (instrumentType) {
    query = query.where('instrumentType', '==', instrumentType);
  }

  return await query.get();
};
```

### XSS Protection
```typescript
// Sanitización de contenido
import DOMPurify from 'isomorphic-dompurify';

const sanitizeContent = (content: string) => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
};
```

## 9. Logging de Seguridad

### Auditoría de Acciones
```typescript
// Logger de seguridad
const securityLogger = {
  logAccess: (req: Request, action: string) => {
    console.log(`[SECURITY] ${new Date().toISOString()} - User: ${req.user?.email} - Action: ${action} - IP: ${req.ip}`);
  },
  
  logViolation: (req: Request, violation: string) => {
    console.error(`[SECURITY_VIOLATION] ${new Date().toISOString()} - User: ${req.user?.email} - Violation: ${violation} - IP: ${req.ip}`);
  }
};
```

## 10. Configuración de Entorno

### Variables de Entorno
```bash
# .env.example
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
FIREBASE_PROJECT_ID=musikon-app
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=musikon-images
CORS_ORIGIN=https://musikon.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
```

## 11. Próximos Pasos de Seguridad

### Implementaciones Futuras
1. **Autenticación de dos factores** (2FA)
2. **Encriptación de datos sensibles** en tránsito y reposo
3. **Monitoreo de seguridad** en tiempo real
4. **Backup automático** de datos críticos
5. **Penetration testing** regular

### Mejoras de Seguridad
1. **Implementar CSRF tokens** para formularios críticos
2. **Agregar validación de IP** para endpoints sensibles
3. **Implementar session management** más robusto
4. **Agregar detección de anomalías** en el comportamiento

## 12. Checklist de Seguridad

### Antes de Deploy
- [ ] **JWT_SECRET** configurado y seguro
- [ ] **CORS** configurado correctamente
- [ ] **Helmet** implementado
- [ ] **Rate limiting** activo
- [ ] **Validaciones** Joi implementadas
- [ ] **Reglas de Firestore** configuradas
- [ ] **HTTPS** habilitado en producción
- [ ] **Variables de entorno** seguras
- [ ] **Logging** de seguridad activo

### Monitoreo Continuo
- [ ] **Revisar logs** de seguridad diariamente
- [ ] **Monitorear rate limiting** y bloqueos
- [ ] **Verificar reglas de Firestore** regularmente
- [ ] **Actualizar dependencias** de seguridad
- [ ] **Revisar accesos** sospechosos

---

**Nota**: La seguridad es fundamental para proteger los datos de usuarios y mantener la confianza en la plataforma, especialmente en el sistema de solicitudes de músicos donde se manejan datos sensibles de eventos y pagos. 