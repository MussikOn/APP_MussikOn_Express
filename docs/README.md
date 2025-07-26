# 📚 Documentación de MusikOn API

Esta carpeta contiene toda la documentación detallada del proyecto MusikOn API, organizada por temas específicos para facilitar la navegación y comprensión del sistema.

## 📋 Índice de Documentación

### 🎯 Documentación Principal
- **[README.md](../README.md)** - Documentación general del proyecto
- **[PROJECT_DOCUMENTATION.md](../PROJECT_DOCUMENTATION.md)** - Documentación técnica completa

### 🔐 Seguridad y Autenticación
- **[SECURITY.md](SECURITY.md)** - Guía completa de seguridad, roles y permisos
- **[ERROR_HANDLING.md](ERROR_HANDLING.md)** - Manejo de errores y excepciones

### 🎭 APIs Específicas
- **[EVENTS_API.md](EVENTS_API.md)** - API de eventos y sistema de matching
- **[MUSICIAN_REQUESTS_API.md](MUSICIAN_REQUESTS_API.md)** - Solicitudes directas de músicos
- **[IMAGES_API.md](IMAGES_API.md)** - Gestión de imágenes y almacenamiento
- **[ADMIN_SYSTEM.md](ADMIN_SYSTEM.md)** - Sistema de administración centralizada

### 📱 Integración y Desarrollo
- **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** - Guía completa de integración frontend
- **[API_DOCUMENTATION_UI.md](API_DOCUMENTATION_UI.md)** - Interfaces de documentación interactiva

## 🚀 Inicio Rápido

### Para Desarrolladores Nuevos

1. **Lee el [README principal](../README.md)** para entender el proyecto
2. **Revisa [PROJECT_DOCUMENTATION.md](../PROJECT_DOCUMENTATION.md)** para la arquitectura completa
3. **Consulta [SECURITY.md](SECURITY.md)** para entender roles y permisos
4. **Usa [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** para integración frontend

### Para Integración Frontend

1. **Configuración base:** [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md#configuración-base)
2. **Autenticación:** [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md#autenticación)
3. **Eventos:** [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md#gestión-de-eventos)
4. **Notificaciones:** [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md#notificaciones-en-tiempo-real)

### Para Administradores

1. **Sistema de administración:** [ADMIN_SYSTEM.md](ADMIN_SYSTEM.md)
2. **Roles y permisos:** [SECURITY.md](SECURITY.md#roles-y-permisos)
3. **Endpoints administrativos:** [ADMIN_SYSTEM.md](ADMIN_SYSTEM.md#endpoints-restful-de-administración)

## 📡 APIs Disponibles

### 🔐 Autenticación
- Registro y login de usuarios
- Verificación por email
- Gestión de tokens JWT
- Actualización de perfiles

### 🎭 Eventos
- Creación de solicitudes de músicos
- Matching automático
- Gestión de estados de eventos
- Historial de actuaciones

### 🎵 Solicitudes Directas
- Solicitudes rápidas de músicos
- Aceptación y cancelación
- Consulta de estados
- Notificaciones en tiempo real

### 🖼️ Imágenes
- Subida y gestión de imágenes
- URLs firmadas con expiración
- Metadatos personalizables
- Optimización automática

### 👨‍💼 Administración
- Gestión completa de usuarios
- Administración de eventos
- Panel de control centralizado
- Roles granulares

## 🔧 Herramientas de Desarrollo

### Documentación Interactiva
- **Swagger UI:** `http://localhost:1000/api-docs`
- **Redoc:** `http://localhost:1000/redoc`
- **JSON de Swagger:** `http://localhost:1000/api-docs/swagger.json`

### Testing
- Pruebas unitarias con Jest
- Tests de integración
- Validación de endpoints
- Testing de autenticación

### Debugging
- Logs detallados
- Manejo de errores centralizado
- Validaciones de datos
- Sanitización de inputs

## 🛡️ Seguridad

### Autenticación
- JWT tokens seguros
- Expiración automática
- Refresh tokens (próximamente)
- Validación de roles

### Validaciones
- Sanitización de datos
- Validación de tipos
- Límites de tamaño de archivos
- Protección contra inyección

### CORS y Headers
- Configuración segura de CORS
- Headers de seguridad
- Rate limiting
- Protección CSRF

## 📊 Modelos de Datos

### Usuario
```typescript
interface User {
  name: string;
  lastName: string;
  userEmail: string;
  userPassword: string;
  roll: string;
  status: boolean;
  create_at: string;
  update_at: string;
}
```

### Evento
```typescript
interface Event {
  id: string;
  user: string;
  eventName: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  instrument: string;
  budget: string;
  status: 'pending_musician' | 'musician_assigned' | 'completed' | 'cancelled';
  assignedMusicianId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Solicitud de Músico
```typescript
interface MusicianRequest {
  id?: string;
  userId: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  instrument: string;
  budget: number;
  status: 'pendiente' | 'asignada' | 'cancelada' | 'completada';
  assignedMusicianId?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

## 🔄 Estados del Sistema

### Estados de Eventos
- `pending_musician` - Esperando que un músico acepte
- `musician_assigned` - Un músico ha aceptado
- `completed` - Evento realizado
- `cancelled` - Evento cancelado

### Estados de Solicitudes
- `pendiente` - Esperando que un músico acepte
- `asignada` - Un músico ha aceptado
- `cancelada` - Solicitud cancelada
- `completada` - Solicitud finalizada

### Roles de Usuario
- `musico` - Músicos que pueden aceptar eventos
- `eventCreator` - Organizadores que crean eventos
- `usuario` - Usuario general
- `adminJunior` - Administrador junior
- `adminMidLevel` - Administrador medio
- `adminSenior` - Administrador senior
- `superAdmin` - Super administrador

## 📡 Eventos de Socket.IO

| Evento | Descripción | Payload |
|--------|-------------|---------|
| `new_event_request` | Nueva solicitud de músico | `{ id, userId, eventType, ... }` |
| `musician_accepted` | Músico aceptó solicitud | `{ requestId, musician: { id } }` |
| `musician_request_taken` | Solicitud tomada | `{ requestId }` |
| `request_cancelled` | Solicitud cancelada | `{ requestId }` |
| `notification` | Notificación personalizada | `{ title, message, ... }` |

## 🚀 Despliegue

### Variables de Entorno Requeridas

```bash
# Firebase
FIREBASE_CREDENTIALS=path/to/credentials.json

# S3 Storage
IDRIVE_E2_ENDPOINT=https://your-endpoint.com
IDRIVE_E2_ACCESS_KEY=your-access-key
IDRIVE_E2_SECRET_KEY=your-secret-key
IDRIVE_E2_REGION=your-region
IDRIVE_E2_BUCKET_NAME=your-bucket-name

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Server
PORT=1000
TOKEN_SECRET=your-secret-key
```

### Scripts de Despliegue

```bash
npm run build    # Compilar TypeScript
npm start        # Iniciar en producción
npm run dev      # Desarrollo con nodemon
```

## 🤝 Contribución

### Guías para Contribuir

1. **Lee toda la documentación** antes de contribuir
2. **Sigue las convenciones** de código establecidas
3. **Actualiza la documentación** para nuevas funcionalidades
4. **Incluye pruebas** para nuevos endpoints
5. **Mantén la seguridad** en mente

### Estructura de Commits

```
feat: agregar autenticación con Google
fix: corregir validación de email
docs: actualizar documentación de API
test: agregar pruebas para eventos
refactor: optimizar consultas de Firestore
```

## 📞 Soporte

### Recursos de Ayuda

- **Documentación interactiva:** `http://localhost:1000/api-docs`
- **Issues de GitHub:** Para reportar bugs
- **Discussions:** Para preguntas y discusiones
- **Email:** Contacto directo para consultas urgentes

### Contacto

- **Desarrollador:** Jefry Astacio
- **Email:** jasbootstudios@gmail.com
- **GitHub:** [JASBOOTSTUDIOS](https://github.com/JASBOOTSTUDIOS)

---

> **"La documentación es como el sexo: cuando es buena, es muy buena; cuando es mala, es mejor que nada."** 📚 