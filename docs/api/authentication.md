# 🔐 Autenticación - MussikOn API

## 📋 Descripción General

El sistema de autenticación de MussikOn API proporciona múltiples métodos de autenticación seguros y flexibles para diferentes tipos de usuarios.

## 🔑 Métodos de Autenticación

### 1. JWT (JSON Web Tokens)

**Endpoint**: `POST /auth/login`

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "role": "musician",
      "profile": {
        "name": "John Doe",
        "avatar": "https://...",
        "instruments": ["guitar", "piano"]
      }
    }
  }
}
```

### 2. Google OAuth 2.0

**Endpoint**: `POST /auth/google`

```json
{
  "idToken": "google-id-token-here"
}
```

### 3. Registro de Usuario

**Endpoint**: `POST /auth/register`

```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "musician",
  "profile": {
    "instruments": ["guitar", "piano"],
    "experience": "intermediate",
    "bio": "Passionate musician with 5 years of experience"
  }
}
```

## 👥 Roles y Permisos

### Roles Disponibles

1. **user** - Usuario básico
2. **musician** - Músico con perfil completo
3. **organizer** - Organizador de eventos
4. **admin** - Administrador del sistema
5. **super_admin** - Super administrador

### Permisos por Rol

| Endpoint | user | musician | organizer | admin | super_admin |
|----------|------|----------|-----------|-------|-------------|
| GET /events | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /events | ❌ | ❌ | ✅ | ✅ | ✅ |
| PUT /events/:id | ❌ | ❌ | ✅* | ✅ | ✅ |
| DELETE /events/:id | ❌ | ❌ | ✅* | ✅ | ✅ |
| GET /admin/users | ❌ | ❌ | ❌ | ✅ | ✅ |
| POST /admin/users | ❌ | ❌ | ❌ | ❌ | ✅ |

*Solo para eventos propios

## 🔒 Middleware de Autenticación

### Uso Básico

```typescript
import { authMiddleware } from '../middleware/authMiddleware';

// Proteger ruta
router.get('/profile', authMiddleware, (req, res) => {
  // req.user contiene la información del usuario autenticado
  res.json({ user: req.user });
});
```

### Verificar Rol Específico

```typescript
import { requireRole } from '../middleware/requireRole';

// Solo músicos
router.post('/musician-profile', 
  authMiddleware, 
  requireRole(['musician']), 
  (req, res) => {
    // Lógica específica para músicos
  }
);

// Solo administradores
router.get('/admin/dashboard', 
  authMiddleware, 
  requireRole(['admin', 'super_admin']), 
  (req, res) => {
    // Lógica de administración
  }
);
```

## 🔄 Renovación de Tokens

### Renovar Token

**Endpoint**: `POST /auth/refresh`

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token-here",
    "refreshToken": "new-refresh-token-here"
  }
}
```

### Invalidar Token

**Endpoint**: `POST /auth/logout`

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🛡️ Seguridad

### Configuración de JWT

```typescript
// ENV.ts
export const ENV = {
  JWT_SECRET: 'your-super-secret-key',
  JWT_EXPIRES_IN: '24h',
  JWT_REFRESH_SECRET: 'your-refresh-secret',
  JWT_REFRESH_EXPIRES_IN: '7d',
};
```

### Validación de Contraseñas

```typescript
// Validación de contraseña fuerte
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Ejemplo de validación
if (!passwordRegex.test(password)) {
  throw new Error('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
}
```

### Rate Limiting

```typescript
// middleware/rateLimit.ts
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login
  message: 'Demasiados intentos de login, intenta de nuevo en 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
});
```

## 📱 Integración con Frontend

### React/React Native

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
      
      return data;
    } catch (error) {
      console.error('Error de login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Error de logout:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) throw new Error('No refresh token');
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setToken(data.data.token);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
      
      return data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      throw error;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verificar token con el servidor
          const response = await fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(token);
          } else {
            // Token inválido, intentar refresh
            await refreshToken();
          }
        } catch (error) {
          console.error('Error verificando token:', error);
          logout();
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  return { user, token, loading, login, logout, refreshToken };
};
```

### Interceptor para Axios

```typescript
// utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', { refreshToken });
          
          if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
            
            // Reintentar request original
            error.config.headers.Authorization = `Bearer ${response.data.data.token}`;
            return axios(error.config);
          }
        }
      } catch (refreshError) {
        // Refresh falló, redirigir a login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

## 🧪 Testing

### Tests de Autenticación

```typescript
// tests/auth.test.ts
import request from 'supertest';
import app from '../src/app';

describe('Authentication', () => {
  test('should register a new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'TestPass123!',
        name: 'Test User',
        role: 'musician'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('test@example.com');
  });

  test('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPass123!'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  test('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
```

## 📚 Referencias

- [JWT.io](https://jwt.io/) - Documentación de JWT
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2) - Documentación de OAuth
- [Firebase Auth](https://firebase.google.com/docs/auth) - Documentación de Firebase Auth

---

**¿Necesitas ayuda?** Consulta la [guía de solución de problemas](../troubleshooting.md) o contacta al equipo de desarrollo. 