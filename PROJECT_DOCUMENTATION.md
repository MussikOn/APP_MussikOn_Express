# 📖 Documentación Completa del Proyecto MusikOn API

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [API Endpoints](#api-endpoints)
6. [Modelos de Datos](#modelos-de-datos)
7. [Autenticación y Seguridad](#autenticación-y-seguridad)
8. [Sistema de Eventos y Matching](#sistema-de-eventos-y-matching)
9. [Solicitudes Directas de Músicos](#solicitudes-directas-de-músicos)
10. [Sistema de Administración](#sistema-de-administración)
11. [Gestión de Imágenes](#gestión-de-imágenes)
12. [Notificaciones en Tiempo Real](#notificaciones-en-tiempo-real)
13. [Documentación Interactiva](#documentación-interactiva)
14. [Manejo de Errores](#manejo-de-errores)
15. [Pruebas y Testing](#pruebas-y-testing)
16. [Despliegue](#despliegue)
17. [Roadmap y Mejoras](#roadmap-y-mejoras)
18. [Contribución](#contribución)

---

## 🎯 Descripción General

**MusikOn** es una plataforma integral que conecta músicos con organizadores de eventos, facilitando la búsqueda, contratación y gestión musical en tiempo real. La API proporciona un ecosistema completo para la gestión de usuarios, eventos, solicitudes y notificaciones instantáneas.

### Características Principales

- 🔐 **Autenticación robusta** con JWT y roles granulares
- 🎭 **Sistema de eventos** con matching automático
- 📱 **Notificaciones en tiempo real** vía Socket.IO
- 🖼️ **Gestión de imágenes** con almacenamiento S3
- 👥 **Sistema de roles** completo (músico, organizador, admin)
- 📊 **Panel de administración** centralizado
- 📚 **Documentación interactiva** (Swagger + Redoc)
- 🔄 **Solicitudes directas** de músicos
- 📧 **Verificación por email**
- 🛡️ **Seguridad avanzada** con validaciones

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

- **Backend:** Node.js + Express + TypeScript
- **Base de datos:** Firebase Firestore
- **Almacenamiento:** AWS S3 (idriveE2)
- **Autenticación:** JWT
- **Tiempo real:** Socket.IO
- **Documentación:** Swagger + Redoc
- **Email:** Nodemailer
- **Validación:** Joi

### Patrón de Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Data Layer    │
│   (React/Vue)   │◄──►│   (Express)     │◄──►│   (Firestore)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Socket.IO     │    │   Middleware    │    │   Storage S3    │
│   (Real-time)   │    │   (Auth/Admin)  │    │   (Images)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Cuenta de Firebase
- Cuenta de idriveE2 (S3 compatible)

### Pasos de Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/JASBOOTSTUDIOS/Express_MusikOn_Backend.git
cd Express_MusikOn_Backend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp ENV_example.ts ENV.ts
# Editar ENV.ts con tus credenciales
```

4. **Iniciar el servidor:**
```bash
npm run dev    # Desarrollo
npm start      # Producción
```

### Variables de Entorno

```typescript
// Firebase Configuration
export const FIREBASE_CREDENTIALS = "path/to/firebase-credentials.json";

// S3 Storage (idriveE2)
export const IDRIVE_E2_ENDPOINT = "https://your-endpoint.com";
export const IDRIVE_E2_ACCESS_KEY = "your-access-key";
export const IDRIVE_E2_SECRET_KEY = "your-secret-key";
export const IDRIVE_E2_REGION = "your-region";
export const IDRIVE_E2_BUCKET_NAME = "your-bucket-name";

// Email Configuration
export const EMAIL_USER = "your-email@gmail.com";
export const EMAIL_PASSWORD = "your-app-password";

// Server Configuration
export const PORT = 1000;
export const TOKEN_SECRET = "your-secret-key";
export const URL_API = "http://localhost:";
```

---

## 📁 Estructura del Proyecto

```
APP_MussikOn_Express/
├── 📄 Configuración
│   ├── package.json              # Dependencias y scripts
│   ├── tsconfig.json            # Configuración TypeScript
│   ├── ENV.ts                   # Variables de entorno
│   └── ENV_example.ts           # Ejemplo de variables
├── 📄 Documentación
│   ├── README.md                # Documentación principal
│   ├── PROJECT_DOCUMENTATION.md # Este archivo
│   └── docs/                    # Documentación detallada
├── 🚀 Punto de entrada
│   └── index.ts                 # Servidor principal
└── 📦 Código fuente (src/)
    ├── 🎮 Controllers           # Lógica de negocio
    │   ├── authController.ts     # Autenticación y usuarios
    │   ├── eventControllers.ts   # Gestión de eventos
    │   ├── musicianRequestController.ts # Solicitudes directas
    │   ├── imagesController.ts   # Gestión de imágenes
    │   ├── adminController.ts    # Panel de administración
    │   ├── musicianProfileController.ts # Perfiles de músicos
    │   ├── registerAuthController.ts # Registro adicional
    │   └── authGoogleController.ts # Auth con Google (pendiente)
    ├── 🛡️ Middleware            # Interceptores
    │   ├── authMiddleware.ts     # Autenticación JWT
    │   └── adminOnly.ts         # Acceso administrativo
    ├── 📊 Models                # Acceso a datos
    │   ├── authModel.ts         # Modelo de usuarios
    │   ├── eventModel.ts        # Modelo de eventos
    │   ├── musicianRequestModel.ts # Modelo de solicitudes
    │   └── imagesModel.ts       # Modelo de imágenes
    ├── 🛣️ Routes                # Definición de rutas
    │   ├── authRutes.ts         # Rutas de autenticación
    │   ├── eventsRoutes.ts      # Rutas de eventos
    │   ├── musicianRequestRoutes.ts # Rutas de solicitudes
    │   ├── imagesRoutes.ts      # Rutas de imágenes
    │   ├── adminRoutes.ts       # Rutas de administración
    │   ├── musicianProfileRoutes.ts # Rutas de perfiles
    │   └── superAdminRouter.ts  # Rutas de superadmin
    ├── 🔌 Sockets               # Tiempo real
    │   └── eventSocket.ts       # Eventos de socket
    └── 🛠️ Utils                 # Utilidades
        ├── DataTypes.ts         # Tipos TypeScript
        ├── firebase.ts          # Configuración Firebase
        ├── jwt.ts              # Gestión de JWT
        ├── mailer.ts           # Envío de emails
        ├── socket.Io.ts        # Configuración Socket.IO
        ├── validatios.ts       # Validaciones
        ├── functions.ts        # Funciones auxiliares
        ├── idriveE2.ts        # Configuración S3
        └── index.html          # Página de inicio
```

---

## 📡 API Endpoints

### 🔐 Autenticación (`/auth`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/auth/Register` | Registro de usuario | No |
| `POST` | `/auth/login` | Login de usuario | No |
| `GET` | `/auth/verToken` | Verificar token JWT | Sí |
| `PUT` | `/auth/update/:userEmail` | Actualizar usuario | Sí |
| `POST` | `/auth/authEmail` | Enviar email de verificación | No |
| `POST` | `/auth/validEmail/:code` | Validar código de email | No |
| `POST` | `/auth/addEvent` | Agregar evento al usuario | Sí |
| `DELETE` | `/auth/delete` | Eliminar usuario | Sí |

### 🎭 Eventos (`/events`)

| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|----------------|
| `POST` | `/events/request-musician` | Crear solicitud de músico | eventCreator |
| `GET` | `/events/my-pending` | Eventos pendientes | eventCreator |
| `GET` | `/events/my-assigned` | Eventos asignados | eventCreator |
| `GET` | `/events/my-completed` | Eventos completados | eventCreator |
| `GET` | `/events/available-requests` | Solicitudes disponibles | musico |
| `POST` | `/events/:eventId/accept` | Aceptar solicitud | musico |
| `GET` | `/events/my-scheduled` | Eventos agendados | musico |
| `GET` | `/events/my-past-performances` | Historial de actuaciones | musico |
| `GET` | `/events/my-events` | Todos los eventos del usuario | Cualquiera |

### 🎵 Solicitudes Directas (`/musician-requests`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/musician-requests/` | Crear solicitud directa | Sí |
| `POST` | `/musician-requests/accept` | Aceptar solicitud | Sí |
| `POST` | `/musician-requests/cancel` | Cancelar solicitud | Sí |
| `GET` | `/musician-requests/:id/status` | Consultar estado | No |

### 🖼️ Imágenes (`/imgs`, `/media`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/imgs/getAllImg` | Obtener galería de imágenes | No |
| `GET` | `/imgs/getUrl/:key` | Obtener URL firmada | No |
| `POST` | `/imgs/upload` | Subir imagen | Sí |
| `DELETE` | `/imgs/delete/:key` | Eliminar imagen | Sí |
| `PUT` | `/imgs/update-metadata/:key` | Actualizar metadatos | Sí |
| `POST` | `/media/saveImage` | Subir imagen de perfil | Sí |
| `GET` | `/media/getImage/:key` | Obtener imagen de perfil | No |

### 👨‍💼 Administración (`/admin`)

| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|----------------|
| `GET` | `/admin/users` | Listar usuarios | Admin |
| `POST` | `/admin/users` | Crear usuario | Admin |
| `GET` | `/admin/users/:id` | Obtener usuario | Admin |
| `PUT` | `/admin/users/:id` | Actualizar usuario | Admin |
| `DELETE` | `/admin/users/:id` | Eliminar usuario | Admin |
| `GET` | `/admin/events` | Listar eventos | Admin |
| `POST` | `/admin/events` | Crear evento | Admin |
| `GET` | `/admin/events/:id` | Obtener evento | Admin |
| `PUT` | `/admin/events/:id` | Actualizar evento | Admin |
| `DELETE` | `/admin/events/:id` | Eliminar evento | Admin |

### 🔧 SuperAdmin (`/superAdmin`)

| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|----------------|
| `DELETE` | `/superAdmin/deleteAllUsers` | Eliminar todos los usuarios | superAdmin |

---

## 📊 Modelos de Datos

### Usuario (User)

```typescript
interface User {
  name: string;
  lastName: string;
  userEmail: string;
  userPassword: string;
  roll: string;
  create_at?: string;
  update_at?: string;
  delete_at?: string;
  status?: boolean;
}
```

### Evento (Event)

```typescript
interface Event {
  id: string;
  user: string;
  eventName: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  duration: string;
  instrument: string;
  bringInstrument: boolean;
  comment: string;
  budget: string;
  flyerUrl?: string;
  songs: string[];
  recommendations: string[];
  mapsLink: string;
  status: 'pending_musician' | 'musician_assigned' | 'completed' | 'cancelled';
  assignedMusicianId?: string;
  interestedMusicians?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Solicitud de Músico (MusicianRequest)

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
  comments?: string;
  status: 'pendiente' | 'asignada' | 'no_asignada' | 'cancelada' | 'completada';
  assignedMusicianId?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

---

## 🛡️ Autenticación y Seguridad

### Sistema de Roles

- `musico` - Músicos que pueden aceptar eventos
- `eventCreator` - Organizadores que crean eventos
- `usuario` - Usuario general
- `adminJunior` - Administrador junior
- `adminMidLevel` - Administrador medio
- `adminSenior` - Administrador senior
- `superAdmin` - Super administrador

### Autenticación JWT

```typescript
// Generación de token
const token = jwt.sign({
  name, lastName, userEmail, roll
}, TOKEN_SECRET, { expiresIn: "1h" });

// Verificación de token
const decoded = jwt.verify(token, TOKEN_SECRET);
```

### Middleware de Autenticación

```typescript
// Verificar token
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }
  // ... verificación del token
}

// Verificar rol
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.roll)) {
      return res.status(403).json({ msg: 'No autorizado. Rol insuficiente.' });
    }
    next();
  };
}
```

### Validaciones

- **Email:** Formato válido con regex
- **Password:** Mínimo 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales
- **Datos de entrada:** Sanitización y validación en todos los endpoints
- **Archivos:** Tipos y tamaños permitidos para imágenes

---

## 🎭 Sistema de Eventos y Matching

### Flujo de Eventos

1. **Creación de Solicitud** (Organizador)
   - El organizador crea una solicitud de músico
   - Se guarda en Firestore con estado `pending_musician`
   - Se emite notificación en tiempo real a todos los músicos

2. **Visualización de Solicitudes** (Músico)
   - Los músicos ven las solicitudes disponibles
   - Pueden filtrar por instrumento, ubicación, fecha
   - Reciben notificaciones instantáneas de nuevas solicitudes

3. **Aceptación de Solicitud** (Músico)
   - El músico acepta una solicitud
   - Se actualiza el estado a `musician_assigned`
   - Se notifica al organizador en tiempo real

4. **Gestión de Eventos**
   - Organizadores pueden ver eventos pendientes, asignados y completados
   - Músicos pueden ver eventos agendados y historial de actuaciones

### Estados de Eventos

- `pending_musician` - Esperando que un músico acepte
- `musician_assigned` - Un músico ha aceptado
- `completed` - Evento realizado
- `cancelled` - Evento cancelado

---

## 🎵 Solicitudes Directas de Músicos

### Características

- **Flujo alternativo** al sistema de eventos tradicional
- **Solicitudes rápidas** para necesidades inmediatas
- **Notificaciones instantáneas** a músicos conectados
- **Primero en llegar, primero en servir**

### Estados de Solicitudes

- `pendiente` - Esperando que un músico acepte
- `asignada` - Un músico ha aceptado
- `cancelada` - Solicitud cancelada por el organizador
- `completada` - Solicitud finalizada

---

## 👨‍💼 Sistema de Administración

### Panel de Administración

- **Gestión de usuarios** - CRUD completo de usuarios
- **Gestión de eventos** - CRUD completo de eventos
- **Gestión de imágenes** - Listado y eliminación de imágenes
- **Gestión de solicitudes** - Listado y eliminación de solicitudes

### Roles Administrativos

- `adminJunior` - Acceso básico a lectura
- `adminMidLevel` - Acceso a lectura y escritura
- `adminSenior` - Acceso completo excepto eliminación masiva
- `superAdmin` - Acceso total, incluyendo eliminación masiva

---

## 🖼️ Gestión de Imágenes

### Características

- **Almacenamiento S3** compatible con idriveE2
- **URLs firmadas** con expiración temporal
- **Metadatos personalizables** para cada imagen
- **Optimización automática** de formatos

### Tipos de Imágenes

- **Galería general** - Imágenes públicas del sistema
- **Imágenes de perfil** - Fotos de perfil de músicos
- **Flyers de eventos** - Material promocional de eventos

---

## 📡 Notificaciones en Tiempo Real

### Eventos de Socket.IO

| Evento | Descripción | Emisor | Receptor | Payload |
|--------|-------------|--------|----------|---------|
| `new_event_request` | Nueva solicitud de músico | Backend | Músicos | `{ id, userId, eventType, ... }` |
| `musician_accepted` | Músico aceptó solicitud | Backend | Organizador/Músicos | `{ requestId, musician: { id } }` |
| `musician_request_taken` | Solicitud tomada | Backend | Músicos | `{ requestId }` |
| `request_cancelled` | Solicitud cancelada | Backend | Músicos | `{ requestId }` |
| `notification` | Notificación personalizada | Backend | Usuario específico | `{ title, message, ... }` |

### Eventos de Chat

| Evento | Descripción | Emisor | Receptor | Payload |
|--------|-------------|--------|----------|---------|
| `chat-register` | Registrar usuario en chat | Cliente | Servidor | `{ userEmail, userName }` |
| `authenticate` | Autenticar usuario | Cliente | Servidor | `{ userEmail, userId }` |
| `join-conversation` | Unirse a conversación | Cliente | Servidor | `conversationId` |
| `send-message` | Enviar mensaje | Cliente | Servidor | `{ conversationId, senderId, content, type }` |
| `new-message` | Nuevo mensaje | Servidor | Participantes | `{ id, conversationId, senderId, content, ... }` |
| `mark-message-read` | Marcar como leído | Cliente | Servidor | `{ messageId, conversationId }` |
| `typing` | Indicador de escritura | Cliente | Servidor | `{ conversationId, userEmail, isTyping }` |
| `user-typing` | Usuario escribiendo | Servidor | Participantes | `{ conversationId, userEmail, isTyping }` |
| `message-notification` | Notificación de mensaje | Servidor | Usuario | `{ conversationId, message, unreadCount }` |

### Configuración de Socket.IO

```typescript
// Inicialización
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});

// Manejo de conexiones
io.on("connection", (socket) => {
  // Registrar usuario
  socket.on("register", (userEmail: string) => {
    users[userEmail.toLowerCase()] = socket.id;
  });
  
  // Enviar notificación
  socket.on("send-notification", ({ toUserId: email, data }) => {
    const receiverSocket = users[email];
    if (receiverSocket) {
      io.to(receiverSocket).emit("notification", data);
    }
  });
});
```

---

## 💬 Sistema de Chat en Tiempo Real

### Características

- **Conversaciones privadas** entre dos usuarios
- **Conversaciones grupales** para eventos
- **Múltiples tipos de mensaje**: texto, imagen, audio, archivo
- **Indicadores de escritura** en tiempo real
- **Marcado de mensajes leídos**
- **Notificaciones push** para mensajes nuevos
- **Estados de conexión** en vivo
- **Historial persistente** en Firebase

### Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Socket.IO     │    │   Database      │
│   (React/Vue)   │◄──►│   Server        │◄──►│   (Firebase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         └──────────────►│   Chat API      │◄────────────┘
                        │   (REST)        │
                        └─────────────────┘
```

### Modelos de Datos

#### Conversación
```typescript
interface Conversation {
  id: string;
  participants: string[]; // Array de emails
  title: string;
  type: 'private' | 'group';
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: Message;
  unreadCount: number;
}
```

#### Mensaje
```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'file';
  status: 'sent' | 'delivered' | 'read';
  timestamp: Date;
  metadata?: {
    fileSize?: number;
    fileName?: string;
    mimeType?: string;
    duration?: number; // Para audio
  };
}
```

### Endpoints de Chat

- `POST /chat/conversations` - Crear conversación
- `GET /chat/conversations` - Obtener conversaciones del usuario
- `GET /chat/conversations/:id` - Obtener conversación específica
- `GET /chat/conversations/:id/messages` - Obtener mensajes de conversación
- `PUT /chat/conversations/:id/messages/read` - Marcar mensajes como leídos

### Casos de Uso

1. **Chat entre Organizador y Músico**: Comunicación directa sobre detalles del evento
2. **Notificaciones de Solicitudes**: Músicos reciben notificaciones de nuevas solicitudes
3. **Indicador de Escritura**: Mostrar cuando el otro usuario está escribiendo
4. **Conversaciones Grupales**: Para eventos con múltiples músicos

---

## 📚 Documentación Interactiva

### Swagger UI

- **URL:** `http://localhost:1000/api-docs`
- **Características:**
  - Interfaz interactiva para probar endpoints
  - Generación automática de código
  - Autenticación integrada
  - Filtros y búsqueda avanzada

### Redoc

- **URL:** `http://localhost:1000/redoc`
- **Características:**
  - Diseño moderno y limpio
  - Mejor legibilidad
  - Navegación intuitiva
  - Responsive design

### 📋 Documentación por Módulos

#### 💳 Sistema de Pagos
- **Backend API:** `/docs/api/payment-system.md` - Documentación completa del sistema de pagos por transferencia
- **App Móvil:** `/docs/mobile-app/payment-transfer-flow.md` - Flujo de pagos en la aplicación móvil
- **Panel Admin:** `/docs/admin-system/payment-verification.md` - Sistema de verificación de pagos para administradores

#### 🔔 Notificaciones
- **Push Notifications:** `/docs/api/push-notifications.md` - Sistema de notificaciones push
- **Integración:** `/docs/api/push-notifications-integration.md` - Guía de integración
- **Resumen:** `/docs/api/push-notifications-summary.md` - Resumen ejecutivo

#### 📊 Analytics y Reportes
- **Analytics API:** `/docs/api/analytics.md` - Sistema de análisis y métricas
- **Búsqueda Avanzada:** `/docs/api/search.md` - Sistema de búsqueda inteligente

#### 🖼️ Gestión de Imágenes
- **Images API:** `/docs/api/images.md` - Sistema de gestión de imágenes
- **Upload Service:** Documentación de subida y procesamiento de archivos

#### 👥 Gestión de Usuarios
- **Authentication:** `/docs/api/authentication.md` - Sistema de autenticación
- **Musician Requests:** `/docs/api/musician-requests.md` - Solicitudes de músicos

### Configuración

```typescript
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MussikOn API",
      version: "1.0.0",
      description: "API para gestión de músicos y eventos en MussikOn",
    },
    servers: [{ url: "http://localhost:1000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts", "./index.ts"],
};
```

---

## ⚠️ Manejo de Errores

### Middleware Global de Errores

```typescript
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error(err);
  res.status(err.status || 500).json({ 
    msg: err.message || 'Error interno', 
    error: err 
  });
});
```

### Códigos de Error

- `400` - Bad Request (datos inválidos)
- `401` - Unauthorized (token inválido o faltante)
- `403` - Forbidden (rol insuficiente)
- `404` - Not Found (recurso no encontrado)
- `409` - Conflict (recurso ya existe)
- `500` - Internal Server Error (error del servidor)

### Funciones de Manejo

```typescript
export function handleError(res: Response, error: any, message: string = "Error interno del servidor", status: number = 500) {
  console.error(error);
  return res.status(status).json({ msg: message, error });
}

export function handleSuccess(res: Response, data: any, message: string = "Operación exitosa", status: number = 200) {
  return res.status(status).json({ msg: message, data });
}
```

---

## 🧪 Pruebas y Testing

### Scripts de Pruebas

   ```bash
npm test              # Ejecutar pruebas
npm run test:watch    # Pruebas en modo watch
npm run test:coverage # Pruebas con cobertura
```

### Tipos de Pruebas

- **Pruebas unitarias** - Funciones individuales
- **Pruebas de integración** - Endpoints completos
- **Pruebas de autenticación** - JWT y roles
- **Pruebas de socket** - Notificaciones en tiempo real

---

## 🚀 Despliegue

### Variables de Producción

   ```bash
NODE_ENV=production
PORT=1000
FIREBASE_CREDENTIALS=path/to/production-credentials.json
IDRIVE_E2_ENDPOINT=https://production-endpoint.com
# ... otras variables de producción
```

### Scripts de Despliegue

   ```bash
npm run build    # Compilar TypeScript
npm start        # Iniciar en producción
```

### Consideraciones de Seguridad

- **HTTPS** obligatorio en producción
- **CORS** restringido a dominios específicos
- **Rate limiting** para prevenir abuso
- **Logging** de errores y acceso
- **Backup** automático de base de datos

---

## 🗺️ Roadmap y Mejoras

### Funcionalidades Implementadas ✅

- [x] Sistema de autenticación JWT
- [x] Gestión de usuarios y roles
- [x] Sistema de eventos con matching
- [x] Solicitudes directas de músicos
- [x] Notificaciones en tiempo real
- [x] Gestión de imágenes con S3
- [x] Panel de administración
- [x] Documentación interactiva
- [x] Validaciones de seguridad

### Funcionalidades Pendientes 🔄

- [ ] Autenticación con Google OAuth
- [ ] Sistema de pagos integrado
- [ ] Calificaciones y reseñas
- [ ] Chat en tiempo real
- [ ] Geolocalización avanzada
- [ ] Sistema de notificaciones push
- [ ] Analytics y métricas
- [ ] API para aplicaciones móviles
- [ ] Integración con redes sociales
- [ ] Sistema de recomendaciones

### Mejoras Técnicas 🔧

- [ ] Cache con Redis
- [ ] Rate limiting avanzado
- [ ] Logging estructurado
- [ ] Monitoreo y alertas
- [ ] Tests automatizados completos
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Microservicios

---

## 🤝 Contribución

### Guías de Contribución

1. **Fork** el proyecto
2. **Crea** una rama para tu feature
3. **Sigue** las convenciones de código
4. **Agrega** documentación para nuevas funcionalidades
5. **Incluye** pruebas para nuevos endpoints
6. **Actualiza** la documentación Swagger
7. **Commit** tus cambios con mensajes descriptivos
8. **Push** a tu rama
9. **Abre** un Pull Request

### Convenciones de Código

- **TypeScript** estricto
- **ESLint** para linting
- **Prettier** para formateo
- **JSDoc** para documentación
- **Commits** semánticos

### Estructura de Commits

```
feat: agregar autenticación con Google
fix: corregir validación de email
docs: actualizar documentación de API
test: agregar pruebas para eventos
refactor: optimizar consultas de Firestore
```

---

## 📞 Contacto y Soporte

### Información de Contacto

- **Desarrollador:** Jefry Astacio
- **Email:** jasbootstudios@gmail.com
- **GitHub:** [JASBOOTSTUDIOS](https://github.com/JASBOOTSTUDIOS)
- **Proyecto:** [MusikOn Backend](https://github.com/JASBOOTSTUDIOS/Express_MusikOn_Backend)

### Canales de Soporte

- **Issues:** GitHub Issues para reportar bugs
- **Discussions:** GitHub Discussions para preguntas
- **Email:** Contacto directo para consultas urgentes
- **Documentación:** Documentación completa en `/docs`

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

> **"La música conecta lo que las palabras no pueden expresar."** 🎵