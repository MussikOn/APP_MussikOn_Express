# 🎵 MusikOn API Backend

**MusikOn** es una plataforma que conecta músicos con organizadores de eventos, facilitando la búsqueda, contratación y gestión musical en tiempo real.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Documentación](#documentación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Seguridad](#seguridad)
- [Contribución](#contribución)
- [Licencia](#licencia)

## ✨ Características

- 🔐 **Autenticación JWT** con roles y permisos
- 🎭 **Gestión de eventos** con matching en tiempo real
- 📱 **Notificaciones instantáneas** vía Socket.IO
- 🖼️ **Gestión de imágenes** con almacenamiento S3
- 👥 **Sistema de roles** (músico, organizador, admin)
- 📊 **Panel de administración** completo
- 📚 **Documentación interactiva** (Swagger + Redoc)
- 🔄 **Solicitudes directas** de músicos
- 📧 **Verificación por email**
- 🛡️ **Seguridad robusta** con validaciones

## 🛠️ Tecnologías

- **Backend:** Node.js + Express + TypeScript
- **Base de datos:** Firebase Firestore
- **Almacenamiento:** AWS S3 (idriveE2)
- **Autenticación:** JWT
- **Tiempo real:** Socket.IO
- **Documentación:** Swagger + Redoc
- **Email:** Nodemailer
- **Validación:** Joi

## 🚀 Instalación

1. **Clona el repositorio:**
```bash
git clone https://github.com/JASBOOTSTUDIOS/Express_MusikOn_Backend.git
cd Express_MusikOn_Backend
```

2. **Instala dependencias:**
```bash
npm install
```

3. **Configura las variables de entorno:**
```bash
cp ENV_example.ts ENV.ts
# Edita ENV.ts con tus credenciales
```

4. **Inicia el servidor:**
```bash
npm run dev    # Desarrollo
npm start      # Producción
```

## ⚙️ Configuración

### Variables de Entorno (`ENV.ts`)

```typescript
// Firebase
export const FIREBASE_CREDENTIALS = "path/to/firebase-credentials.json";

// Almacenamiento S3 (idriveE2)
export const IDRIVE_E2_ENDPOINT = "https://your-endpoint.com";
export const IDRIVE_E2_ACCESS_KEY = "your-access-key";
export const IDRIVE_E2_SECRET_KEY = "your-secret-key";
export const IDRIVE_E2_REGION = "your-region";

// Email
export const EMAIL_USER = "your-email@gmail.com";
export const EMAIL_PASSWORD = "your-app-password";

// Servidor
export const PORT = 1000;
export const TOKEN_SECRET = "your-secret-key";
```

## 🌐 Uso

### URLs de Acceso

- **API Base:** `http://localhost:1000`
- **Documentación Swagger:** `http://localhost:1000/api-docs`
- **Documentación Redoc:** `http://localhost:1000/redoc`
- **Página de inicio:** `http://localhost:1000/`

### Scripts Disponibles

```bash
npm run dev      # Desarrollo con nodemon
npm run build    # Compilar TypeScript
npm start        # Producción
npm test         # Ejecutar pruebas
```

## 📡 API Endpoints

### 🔐 Autenticación (`/auth`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/auth/Register` | Registro de usuario |
| `POST` | `/auth/login` | Login de usuario |
| `GET` | `/auth/verToken` | Verificar token JWT |
| `PUT` | `/auth/update/:userEmail` | Actualizar usuario |
| `POST` | `/auth/authEmail` | Enviar email de verificación |
| `POST` | `/auth/validEmail/:code` | Validar código de email |
| `POST` | `/auth/addEvent` | Agregar evento al usuario |
| `DELETE` | `/auth/delete` | Eliminar usuario |

### 🎭 Eventos (`/events`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/events/request-musician` | Crear solicitud de músico |
| `GET` | `/events/my-pending` | Eventos pendientes (organizador) |
| `GET` | `/events/my-assigned` | Eventos asignados (organizador) |
| `GET` | `/events/my-completed` | Eventos completados (organizador) |
| `GET` | `/events/available-requests` | Solicitudes disponibles (músico) |
| `POST` | `/events/:eventId/accept` | Aceptar solicitud (músico) |
| `GET` | `/events/my-scheduled` | Eventos agendados (músico) |
| `GET` | `/events/my-past-performances` | Historial de actuaciones (músico) |
| `GET` | `/events/my-events` | Todos los eventos del usuario |

## Endpoints de Solicitudes de Músicos

- `POST   /musician-requests`         → Crear solicitud
- `POST   /musician-requests/accept`  → Aceptar solicitud
- `POST   /musician-requests/cancel`  → Cancelar solicitud
- `GET    /musician-requests/:id/status` → Consultar estado
- `GET    /musician-requests/:id`     → Obtener solicitud por ID
- `PUT    /musician-requests/:id`     → Actualizar solicitud
- `DELETE /musician-requests/:id`     → Eliminar solicitud

> Los endpoints de filtrado y búsqueda avanzada están temporalmente deshabilitados por compatibilidad con Express 5.

### Ejemplo de flujo CRUD
1. Crear solicitud
2. Consultar por ID
3. Actualizar o cancelar
4. Aceptar (por músico)
5. Eliminar (admin o usuario)

---

**Estado:**
- CRUD funcional y probado
- Filtros y búsqueda avanzada: pendiente de reactivación
- Documentación y ejemplos actualizados

### 🖼️ Imágenes (`/imgs`, `/media`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/imgs/getAllImg` | Obtener galería de imágenes |
| `GET` | `/imgs/getUrl/:key` | Obtener URL firmada |
| `POST` | `/imgs/upload` | Subir imagen |
| `DELETE` | `/imgs/delete/:key` | Eliminar imagen |
| `PUT` | `/imgs/update-metadata/:key` | Actualizar metadatos |
| `POST` | `/media/saveImage` | Subir imagen de perfil |
| `GET` | `/media/getImage/:key` | Obtener imagen de perfil |

### 👨‍💼 Administración (`/admin`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/admin/users` | Listar usuarios |
| `POST` | `/admin/users` | Crear usuario |
| `GET` | `/admin/users/:id` | Obtener usuario |
| `PUT` | `/admin/users/:id` | Actualizar usuario |
| `DELETE` | `/admin/users/:id` | Eliminar usuario |
| `GET` | `/admin/events` | Listar eventos |
| `POST` | `/admin/events` | Crear evento |
| `GET` | `/admin/events/:id` | Obtener evento |
| `PUT` | `/admin/events/:id` | Actualizar evento |
| `DELETE` | `/admin/events/:id` | Eliminar evento |

### 🔧 SuperAdmin (`/superAdmin`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `DELETE` | `/superAdmin/deleteAllUsers` | Eliminar todos los usuarios |

## 📚 Documentación

### Documentación Interactiva

- **Swagger UI:** `http://localhost:1000/api-docs`
- **Redoc:** `http://localhost:1000/redoc`
- **JSON de Swagger:** `http://localhost:1000/api-docs/swagger.json`

### Documentación Detallada

- [📖 Documentación del Proyecto](PROJECT_DOCUMENTATION.md)
- [🔐 Seguridad](docs/SECURITY.md)
- [🎭 API de Eventos](docs/EVENTS_API.md)
- [🎵 Solicitudes de Músicos](docs/MUSICIAN_REQUESTS_API.md)
- [🖼️ API de Imágenes](docs/IMAGES_API.md)
- [👨‍💼 Sistema de Administración](docs/ADMIN_SYSTEM.md)
- [📱 Integración Frontend](docs/FRONTEND_INTEGRATION.md)
- [⚠️ Manejo de Errores](docs/ERROR_HANDLING.md)
- [📚 Interfaces de Documentación](docs/API_DOCUMENTATION_UI.md)

## 📁 Estructura del Proyecto

```
APP_MussikOn_Express/
├── 📄 Archivos de configuración
│   ├── package.json              # Dependencias y scripts
│   ├── tsconfig.json            # Configuración TypeScript
│   ├── ENV.ts                   # Variables de entorno
│   └── ENV_example.ts           # Ejemplo de variables
├── 📄 Documentación
│   ├── README.md                # Este archivo
│   ├── PROJECT_DOCUMENTATION.md # Documentación completa
│   └── docs/                    # Documentación detallada
├── 🚀 Punto de entrada
│   └── index.ts                 # Servidor principal
└── 📦 Código fuente (src/)
    ├── 🎮 Controllers           # Lógica de negocio
    │   ├── authController.ts     # Autenticación
    │   ├── eventControllers.ts   # Eventos
    │   ├── musicianRequestController.ts # Solicitudes
    │   ├── imagesController.ts   # Imágenes
    │   ├── adminController.ts    # Administración
    │   └── musicianProfileController.ts # Perfiles
    ├── 🛡️ Middleware            # Interceptores
    │   ├── authMiddleware.ts     # Autenticación JWT
    │   └── adminOnly.ts         # Acceso admin
    ├── 📊 Models                # Acceso a datos
    │   ├── authModel.ts         # Usuarios
    │   ├── eventModel.ts        # Eventos
    │   ├── musicianRequestModel.ts # Solicitudes
    │   └── imagesModel.ts       # Imágenes
    ├── 🛣️ Routes                # Definición de rutas
    │   ├── authRutes.ts         # Autenticación
    │   ├── eventsRoutes.ts      # Eventos
    │   ├── musicianRequestRoutes.ts # Solicitudes
    │   ├── imagesRoutes.ts      # Imágenes
    │   ├── adminRoutes.ts       # Administración
    │   ├── musicianProfileRoutes.ts # Perfiles
    │   └── superAdminRouter.ts  # SuperAdmin
    ├── 🔌 Sockets               # Tiempo real
    │   └── eventSocket.ts       # Eventos de socket
    └── 🛠️ Utils                 # Utilidades
        ├── DataTypes.ts         # Tipos TypeScript
        ├── firebase.ts          # Configuración Firebase
        ├── jwt.ts              # JWT
        ├── mailer.ts           # Email
        ├── socket.Io.ts        # Socket.IO
        ├── validatios.ts       # Validaciones
        ├── functions.ts        # Funciones auxiliares
        └── idriveE2.ts        # Almacenamiento S3
```

## 🛡️ Seguridad

### Autenticación y Autorización

- **JWT Tokens** para autenticación
- **Roles y permisos** granulares
- **Validación de datos** en todos los endpoints
- **Middleware de seguridad** para rutas protegidas

### Roles Disponibles

- `musico` - Músicos que pueden aceptar eventos
- `eventCreator` - Organizadores que crean eventos
- `usuario` - Usuario general
- `adminJunior` - Administrador junior
- `adminMidLevel` - Administrador medio
- `adminSenior` - Administrador senior
- `superAdmin` - Super administrador

### Validaciones

- **Email:** Formato válido
- **Password:** Mínimo 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales
- **Datos de entrada:** Sanitización y validación
- **Archivos:** Tipos y tamaños permitidos

## 🔄 Estados de Eventos

- `pending_musician` - Esperando que un músico acepte
- `musician_assigned` - Un músico ha aceptado
- `completed` - Evento realizado
- `cancelled` - Evento cancelado

## 📡 Eventos de Socket.IO

| Evento | Descripción | Payload |
|--------|-------------|---------|
| `new_event_request` | Nueva solicitud de músico | `{ id, userId, eventType, ... }` |
| `musician_accepted` | Músico aceptó solicitud | `{ requestId, musician: { id } }` |
| `musician_request_taken` | Solicitud tomada | `{ requestId }` |
| `request_cancelled` | Solicitud cancelada | `{ requestId }` |
| `notification` | Notificación personalizada | `{ title, message, ... }` |

## 🧪 Pruebas

```bash
# Ejecutar pruebas
npm test

# Pruebas en modo watch
npm run test:watch
```

## 🤝 Contribución

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Guías de Contribución

- Sigue las convenciones de código existentes
- Agrega documentación para nuevas funcionalidades
- Incluye pruebas para nuevos endpoints
- Actualiza la documentación Swagger

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Desarrollador:** Jefry Astacio
- **Email:** jasbootstudios@gmail.com
- **GitHub:** [JASBOOTSTUDIOS](https://github.com/JASBOOTSTUDIOS)
- **Proyecto:** [MusikOn Backend](https://github.com/JASBOOTSTUDIOS/Express_MusikOn_Backend)

---

> **"La música conecta lo que las palabras no pueden expresar."** 🎵

