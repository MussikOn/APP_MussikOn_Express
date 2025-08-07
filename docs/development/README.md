# 🔧 Guía de Desarrollo - MussikOn API

## 📋 Índice

- [Arquitectura del Código](#arquitectura-del-código)
- [Estándares de Código](#estándares-de-código)
- [Estructura de Archivos](#estructura-de-archivos)
- [Patrones de Desarrollo](#patrones-de-desarrollo)
- [Testing](#testing)
- [Debugging](#debugging)
- [Optimización](#optimización)
- [Git Workflow](#git-workflow)

## 🏗️ Arquitectura del Código

### Principios de Diseño

1. **Separación de Responsabilidades**: Cada capa tiene una responsabilidad específica
2. **Inyección de Dependencias**: Los servicios se inyectan en los controladores
3. **Middleware Pattern**: Uso extensivo de middlewares para funcionalidad transversal
4. **Error Handling Centralizado**: Manejo consistente de errores en toda la aplicación

### Capas de la Aplicación

```
┌─────────────────────────────────────┐
│           Controllers               │ ← Manejo de requests/responses
├─────────────────────────────────────┤
│            Services                 │ ← Lógica de negocio
├─────────────────────────────────────┤
│             Models                  │ ← Interacción con base de datos
├─────────────────────────────────────┤
│           Middleware                │ ← Validación, autenticación, etc.
├─────────────────────────────────────┤
│             Utils                   │ ← Funciones auxiliares
└─────────────────────────────────────┘
```

## 📝 Estándares de Código

### Convenciones de Nomenclatura

#### Archivos y Carpetas
- **PascalCase**: Para clases y componentes (`UserController.ts`)
- **camelCase**: Para funciones y variables (`getUserById`)
- **kebab-case**: Para archivos de configuración (`firebase-config.ts`)
- **UPPER_SNAKE_CASE**: Para constantes (`MAX_FILE_SIZE`)

#### Variables y Funciones
```typescript
// ✅ Correcto
const userProfile = getUserProfile();
const isAuthenticated = checkAuthStatus();
const MAX_RETRY_ATTEMPTS = 3;

// ❌ Incorrecto
const user_profile = getUserProfile();
const IsAuthenticated = checkAuthStatus();
const maxRetryAttempts = 3;
```

#### Clases e Interfaces
```typescript
// ✅ Correcto
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

class UserService {
  async getUserById(id: string): Promise<UserProfile> {
    // implementación
  }
}

// ❌ Incorrecto
interface userProfile {
  id: string;
  name: string;
  email: string;
}

class userService {
  async getuserbyid(id: string): Promise<userProfile> {
    // implementación
  }
}
```

### Estructura de Imports

```typescript
// 1. Imports de Node.js y librerías externas
import express from 'express';
import { Request, Response } from 'express';

// 2. Imports de Firebase y servicios externos
import { admin } from '../utils/firebase';

// 3. Imports internos (relativos)
import { UserService } from '../services/userService';
import { validateUser } from '../middleware/validationMiddleware';
import { UserProfile } from '../types/userTypes';

// 4. Imports de tipos y utilidades
import { logger } from '../utils/logger';
```

### Comentarios y Documentación

#### JSDoc para Funciones
```typescript
/**
 * Obtiene el perfil de un usuario por su ID
 * @param {string} userId - ID único del usuario
 * @param {boolean} includePrivate - Si incluir información privada
 * @returns {Promise<UserProfile>} Perfil del usuario
 * @throws {Error} Si el usuario no existe
 */
async function getUserProfile(userId: string, includePrivate: boolean = false): Promise<UserProfile> {
  // implementación
}
```

#### Comentarios de Código
```typescript
// ✅ Comentarios útiles
// Validar que el usuario tenga permisos de administrador
if (!user.roles.includes('admin')) {
  throw new Error('Acceso denegado');
}

// ❌ Comentarios obvios
// Incrementar contador
counter++;

// ✅ Comentarios para lógica compleja
// Algoritmo de búsqueda fuzzy para nombres de músicos
// Usa distancia de Levenshtein para encontrar coincidencias aproximadas
const searchResults = fuzzySearch(musicianName, musiciansList);
```

## 📁 Estructura de Archivos

### Organización por Funcionalidad

```
src/
├── controllers/           # Controladores de la API
│   ├── authController.ts
│   ├── userController.ts
│   └── eventController.ts
├── services/             # Lógica de negocio
│   ├── authService.ts
│   ├── userService.ts
│   └── eventService.ts
├── models/               # Modelos de datos
│   ├── userModel.ts
│   └── eventModel.ts
├── middleware/           # Middlewares
│   ├── authMiddleware.ts
│   ├── validationMiddleware.ts
│   └── errorHandler.ts
├── routes/               # Definición de rutas
│   ├── authRoutes.ts
│   ├── userRoutes.ts
│   └── eventRoutes.ts
├── types/                # Tipos TypeScript
│   ├── userTypes.ts
│   ├── eventTypes.ts
│   └── apiTypes.ts
├── utils/                # Utilidades
│   ├── firebase.ts
│   ├── logger.ts
│   └── helpers.ts
└── __tests__/            # Tests
    ├── controllers/
    ├── services/
    └── integration/
```

### Convenciones de Nomenclatura de Archivos

- **Controllers**: `[Entity]Controller.ts` (ej: `UserController.ts`)
- **Services**: `[Entity]Service.ts` (ej: `UserService.ts`)
- **Models**: `[Entity]Model.ts` (ej: `UserModel.ts`)
- **Routes**: `[Entity]Routes.ts` (ej: `UserRoutes.ts`)
- **Types**: `[Entity]Types.ts` (ej: `UserTypes.ts`)
- **Tests**: `[Entity].test.ts` (ej: `UserController.test.ts`)

## 🔄 Patrones de Desarrollo

### Patrón Controller-Service-Model

```typescript
// Controller
export class UserController {
  constructor(private userService: UserService) {}

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);
      res.json(user);
    } catch (error) {
      logger.error('Error en getUser:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

// Service
export class UserService {
  constructor(private userModel: UserModel) {}

  async getUserById(id: string): Promise<User> {
    return await this.userModel.findById(id);
  }
}

// Model
export class UserModel {
  async findById(id: string): Promise<User> {
    const doc = await admin.firestore().collection('users').doc(id).get();
    return doc.data() as User;
  }
}
```

### Middleware Pattern

```typescript
// Middleware de autenticación
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Uso en rutas
router.get('/profile', authMiddleware, userController.getProfile);
```

### Error Handling Pattern

```typescript
// Middleware de manejo de errores
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error no manejado:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  res.status(500).json({ error: 'Error interno del servidor' });
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

## 🧪 Testing

### Estructura de Tests

```typescript
// __tests__/controllers/userController.test.ts
import request from 'supertest';
import { app } from '../../index';
import { UserService } from '../../services/userService';

describe('UserController', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('GET /api/users/:id', () => {
    it('should return user when valid ID is provided', async () => {
      const response = await request(app)
        .get('/api/users/123')
        .expect(200);

      expect(response.body).toHaveProperty('id', '123');
    });

    it('should return 404 when user not found', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
```

### Tipos de Tests

1. **Unit Tests**: Prueban funciones individuales
2. **Integration Tests**: Prueban la interacción entre componentes
3. **API Tests**: Prueban endpoints completos
4. **Performance Tests**: Prueban rendimiento y escalabilidad

### Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests específicos
npm test -- --testNamePattern="UserController"

# Ejecutar tests de integración
npm test -- --testPathPattern="integration"
```

## 🐛 Debugging

### Logging

```typescript
// utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Uso en el código
logger.info('Usuario autenticado exitosamente', { userId: '123' });
logger.error('Error al procesar pago', { error: error.message, userId: '123' });
```

### Debugging en Desarrollo

```typescript
// Configuración de debugging
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Breakpoints en código
debugger; // Solo funciona en modo desarrollo

// Console.log con contexto
console.log('[UserController:getUser]', { userId, timestamp: new Date() });
```

### Herramientas de Debugging

1. **VS Code Debugger**: Configurar breakpoints y debugging
2. **Postman**: Probar endpoints de la API
3. **Firebase Console**: Monitorear Firestore
4. **Chrome DevTools**: Debugging del frontend

## ⚡ Optimización

### Optimización de Consultas

```typescript
// ❌ Consulta ineficiente
const users = await admin.firestore()
  .collection('users')
  .get()
  .then(snapshot => snapshot.docs.map(doc => doc.data()));

// ✅ Consulta optimizada con índices
const users = await admin.firestore()
  .collection('users')
  .where('status', '==', 'active')
  .where('role', '==', 'musician')
  .orderBy('rating', 'desc')
  .limit(20)
  .get();
```

### Caché

```typescript
// utils/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cacheService = {
  async get(key: string): Promise<any> {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  }
};

// Uso en servicios
export class UserService {
  async getUserById(id: string): Promise<User> {
    // Intentar obtener del caché
    const cached = await cacheService.get(`user:${id}`);
    if (cached) return cached;

    // Si no está en caché, obtener de la base de datos
    const user = await this.userModel.findById(id);
    
    // Guardar en caché
    await cacheService.set(`user:${id}`, user, 1800); // 30 minutos
    
    return user;
  }
}
```

### Compresión y Optimización

```typescript
// index.ts
import compression from 'compression';

// Habilitar compresión gzip
app.use(compression());

// Configurar headers de caché
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutos
  next();
});
```

## 🔄 Git Workflow

### Branching Strategy

```
main (producción)
├── develop (desarrollo)
│   ├── feature/user-authentication
│   ├── feature/payment-system
│   └── bugfix/login-error
└── hotfix/critical-security-fix
```

### Commit Messages

```bash
# Formato: <tipo>(<alcance>): <descripción>

feat(auth): agregar autenticación con Google OAuth
fix(payments): corregir error en procesamiento de pagos
docs(api): actualizar documentación de endpoints
test(users): agregar tests para UserController
refactor(services): refactorizar UserService para mejor rendimiento
style(controllers): formatear código según estándares
chore(deps): actualizar dependencias de desarrollo
```

### Pull Request Process

1. **Crear branch**: `git checkout -b feature/nueva-funcionalidad`
2. **Desarrollar**: Implementar cambios con commits descriptivos
3. **Tests**: Asegurar que todos los tests pasen
4. **Linting**: Ejecutar `npm run lint:fix`
5. **Documentación**: Actualizar documentación si es necesario
6. **Pull Request**: Crear PR con descripción detallada
7. **Code Review**: Revisión por parte del equipo
8. **Merge**: Merge a develop después de aprobación

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm test",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

## 📚 Recursos Adicionales

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [ESLint Rules](https://eslint.org/docs/rules/)

---

**Anterior**: [Inicio Rápido](../getting-started/README.md)  
**Siguiente**: [Sistema de Administración](../admin-system/README.md) 