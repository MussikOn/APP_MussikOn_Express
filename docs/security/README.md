# 🔐 Seguridad - MussikOn API

## 📋 Índice

- [Descripción General](#descripción-general)
- [Autenticación y Autorización](#autenticación-y-autorización)
- [Validación de Datos](#validación-de-datos)
- [Protección de Endpoints](#protección-de-endpoints)
- [Auditoría de Seguridad](#auditoría-de-seguridad)

## 🎯 Descripción General

El Sistema de Seguridad de MussikOn implementa múltiples capas de protección para garantizar la integridad, confidencialidad y disponibilidad de la plataforma.

### Características Principales

- **Autenticación Multi-Factor**: JWT + Firebase Auth
- **Autorización por Roles**: Sistema granular de permisos
- **Validación Robusta**: Validación de entrada y sanitización
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Auditoría Completa**: Logs de seguridad y auditoría

## 🔑 Autenticación y Autorización

### Sistema de Autenticación

```typescript
// middleware/authMiddleware.ts
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    // Verificar usuario en Firebase
    const userRecord = await admin.auth().getUser(decoded.uid);
    
    if (!userRecord.emailVerified) {
      return res.status(401).json({ error: 'Email no verificado' });
    }
    
    // Agregar información del usuario a la request
    req.user = {
      uid: userRecord.uid,
      email: userRecord.email!,
      role: decoded.role || 'user',
      permissions: decoded.permissions || []
    };
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};
```

### Sistema de Autorización

```typescript
// middleware/requireRole.ts
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    next();
  };
};

// middleware/requirePermission.ts
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Permiso insuficiente' });
    }
    
    next();
  };
};
```

## ✅ Validación de Datos

### Validación de Entrada

```typescript
// middleware/validationMiddleware.ts
import { body, validationResult } from 'express-validator';

export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'),
  
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Nombre inválido'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Apellido inválido'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: errors.array()
      });
    }
    next();
  }
];

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitizar parámetros de consulta
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = this.sanitizeString(req.query[key] as string);
      }
    });
  }
  
  // Sanitizar cuerpo de la request
  if (req.body) {
    this.sanitizeObject(req.body);
  }
  
  next();
};

private sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remover caracteres peligrosos
    .trim()
    .substring(0, 1000); // Limitar longitud
}
```

## 🛡️ Protección de Endpoints

### Rate Limiting

```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por ventana
  message: {
    error: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // máximo 100 requests por minuto
  message: {
    error: 'Demasiadas requests. Intenta de nuevo en 1 minuto.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 uploads por minuto
  message: {
    error: 'Demasiados uploads. Intenta de nuevo en 1 minuto.'
  }
});
```

### Protección CORS

```typescript
// middleware/corsMiddleware.ts
import cors from 'cors';

const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://mussikon.com',
      'https://app.mussikon.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

export const corsMiddleware = cors(corsOptions);
```

### Headers de Seguridad

```typescript
// middleware/securityHeaders.ts
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Habilitar XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https:; " +
    "connect-src 'self' https:;"
  );
  
  next();
};
```

## 📋 Auditoría de Seguridad

### Sistema de Logs

```typescript
// services/auditService.ts
export class AuditService {
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const auditLog = {
        id: this.generateId(),
        timestamp: new Date(),
        eventType: event.type,
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        action: event.action,
        resource: event.resource,
        details: event.details,
        severity: event.severity || 'info',
        success: event.success
      };
      
      // Guardar en Firestore
      await admin.firestore()
        .collection('audit_logs')
        .doc(auditLog.id)
        .set(auditLog);
      
      // Enviar alerta si es crítico
      if (event.severity === 'critical') {
        await this.sendSecurityAlert(auditLog);
      }
    } catch (error) {
      logger.error('Error logging security event:', error);
    }
  }
  
  async getSecurityEvents(
    filters: AuditFilters,
    limit: number = 100
  ): Promise<SecurityEvent[]> {
    try {
      let query = admin.firestore()
        .collection('audit_logs')
        .orderBy('timestamp', 'desc');
      
      if (filters.eventType) {
        query = query.where('eventType', '==', filters.eventType);
      }
      
      if (filters.severity) {
        query = query.where('severity', '==', filters.severity);
      }
      
      if (filters.userId) {
        query = query.where('userId', '==', filters.userId);
      }
      
      const snapshot = await query.limit(limit).get();
      
      return snapshot.docs.map(doc => doc.data() as SecurityEvent);
    } catch (error) {
      logger.error('Error getting security events:', error);
      throw new Error('Error al obtener eventos de seguridad');
    }
  }
  
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    try {
      const alert = {
        title: 'Alerta de Seguridad',
        message: `Evento crítico detectado: ${event.action}`,
        event: event,
        timestamp: new Date()
      };
      
      // Enviar a administradores
      await this.notifyAdmins(alert);
      
      // Enviar a sistema de monitoreo
      await this.sendToMonitoringSystem(alert);
    } catch (error) {
      logger.error('Error sending security alert:', error);
    }
  }
}
```

### Monitoreo de Actividad Sospechosa

```typescript
// services/securityMonitoringService.ts
export class SecurityMonitoringService {
  async detectSuspiciousActivity(userId: string): Promise<SuspiciousActivity[]> {
    try {
      const suspiciousActivities: SuspiciousActivity[] = [];
      
      // Obtener actividad reciente del usuario
      const recentActivity = await this.getRecentUserActivity(userId, 24); // últimas 24 horas
      
      // Detectar múltiples intentos de login fallidos
      const failedLogins = recentActivity.filter(activity => 
        activity.action === 'login_failed'
      );
      
      if (failedLogins.length >= 5) {
        suspiciousActivities.push({
          type: 'multiple_failed_logins',
          severity: 'high',
          description: `${failedLogins.length} intentos de login fallidos`,
          recommendations: ['Verificar credenciales', 'Considerar bloqueo temporal']
        });
      }
      
      // Detectar actividad en horarios inusuales
      const unusualHours = recentActivity.filter(activity => {
        const hour = new Date(activity.timestamp).getHours();
        return hour < 6 || hour > 23;
      });
      
      if (unusualHours.length >= 3) {
        suspiciousActivities.push({
          type: 'unusual_hours_activity',
          severity: 'medium',
          description: 'Actividad en horarios inusuales',
          recommendations: ['Verificar si es actividad legítima']
        });
      }
      
      // Detectar múltiples ubicaciones
      const locations = [...new Set(recentActivity.map(activity => activity.ipAddress))];
      if (locations.length >= 3) {
        suspiciousActivities.push({
          type: 'multiple_locations',
          severity: 'medium',
          description: `Actividad desde ${locations.length} ubicaciones diferentes`,
          recommendations: ['Verificar si es actividad legítima']
        });
      }
      
      return suspiciousActivities;
    } catch (error) {
      logger.error('Error detecting suspicious activity:', error);
      throw new Error('Error al detectar actividad sospechosa');
    }
  }
  
  async blockUserTemporarily(userId: string, reason: string): Promise<void> {
    try {
      // Actualizar estado del usuario
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update({
          status: 'temporarily_blocked',
          blockedAt: new Date(),
          blockReason: reason,
          blockExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        });
      
      // Registrar evento de auditoría
      await this.auditService.logSecurityEvent({
        type: 'user_blocked',
        userId,
        action: 'temporary_block',
        resource: `users/${userId}`,
        details: { reason },
        severity: 'high',
        success: true
      });
      
      // Notificar al usuario
      await this.notifyUserOfBlock(userId, reason);
    } catch (error) {
      logger.error('Error blocking user:', error);
      throw new Error('Error al bloquear usuario');
    }
  }
}
```

---

**Anterior**: [Búsqueda Avanzada](../search-system/README.md)  
**Siguiente**: [Despliegue](../deployment/README.md) 