# 🎵 MussikOn API - Backend

> **API RESTful completa para conectar músicos y organizadores de eventos**

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Endpoints](#-endpoints)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Seguridad](#-seguridad)
- [Socket.IO Events](#-socketio-events)
- [Testing](#-testing)
- [Documentación](#-documentación)
- [Contribución](#-contribución)

## ✨ Características

### 🔐 Autenticación y Autorización
- **JWT (JSON Web Tokens)** para autenticación segura
- **Roles de usuario**: `musico`, `eventCreator`, `usuario`, `adminJunior`, `adminMidLevel`, `adminSenior`, `superAdmin`
- **Middleware de autorización** por roles
- **Sesiones persistentes** con refresh tokens

### 🎵 Gestión de Eventos
- **CRUD completo** de eventos
- **Búsqueda y filtros** avanzados
- **Estados de eventos**: `borrador`, `publicado`, `cancelado`, `completado`
- **Categorías**: concierto, boda, culto, evento corporativo, festival, etc.

### 🎼 Solicitudes de Músicos
- **CRUD completo** de solicitudes de músicos ✅ **IMPLEMENTADO**
- **Estados**: `pendiente`, `asignada`, `cancelada`, `completada`, `no_asignada`
- **Aceptación automática** (primer músico que acepta)
- **Notificaciones en tiempo real**

### 👥 Gestión de Usuarios
- **CRUD completo** de usuarios
- **Perfiles de músicos** con especialidades
- **Sistema de roles** jerárquico
- **Validación de datos** robusta

### 🖼️ Gestión de Imágenes
- **Almacenamiento en AWS S3** (idriveE2)
- **Optimización automática** de imágenes
- **CDN integrado** para distribución global
- **Múltiples formatos** soportados

### 🔔 Notificaciones en Tiempo Real
- **Socket.IO** para comunicación instantánea
- **Notificaciones push** para eventos importantes
- **Chat en tiempo real** entre usuarios ✅ **IMPLEMENTADO**
- **Estados de conexión** en vivo
- **Indicadores de escritura** (typing indicators)
- **Marcado de mensajes leídos**
- **Conversaciones privadas y grupales**

### 📊 Sistema Administrativo
- **Panel de administración** completo
- **Métricas y analytics** en tiempo real
- **Gestión de usuarios** avanzada
- **Logs de auditoría** detallados

## 🛠️ Tecnologías

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **Firebase Firestore** - Base de datos NoSQL
- **JWT** - Autenticación
- **Socket.IO** - Comunicación en tiempo real
- **AWS S3** - Almacenamiento de archivos
- **Nodemailer** - Envío de emails
- **bcrypt** - Hash de contraseñas

### Documentación
- **Swagger/OpenAPI** - Documentación interactiva
- **Redoc** - Documentación legible
- **JSDoc** - Documentación de código

### Desarrollo
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Nodemon** - Hot reloading

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Firebase
- Cuenta de AWS S3 (opcional)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd APP_MussikOn_Express
```

2. **Instalar dependencias**
```bash
   npm install
```

3. **Configurar variables de entorno**
```bash
   cp ENV_example.ts ENV.ts
# Editar ENV.ts con tus credenciales
```

4. **Compilar TypeScript**
```bash
npm run build
```

5. **Iniciar servidor**
```bash
   npm start
```

## ⚙️ Configuración

### Variables de Entorno (ENV.ts)

```typescript
export const ENV = {
  // Servidor
  PORT: process.env.PORT || 1000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Firebase
  FIREBASE_PROJECT_ID: 'tu-proyecto-firebase',
  FIREBASE_PRIVATE_KEY: 'tu-clave-privada',
  FIREBASE_CLIENT_EMAIL: 'tu-email-cliente',
  
  // JWT
  JWT_SECRET: 'tu-secreto-jwt',
  JWT_EXPIRES_IN: '24h',
  
  // AWS S3
  AWS_ACCESS_KEY_ID: 'tu-access-key',
  AWS_SECRET_ACCESS_KEY: 'tu-secret-key',
  AWS_REGION: 'us-east-1',
  AWS_BUCKET_NAME: 'tu-bucket',
  
  // Email
  EMAIL_HOST: 'smtp.gmail.com',
  EMAIL_PORT: 587,
  EMAIL_USER: 'tu-email@gmail.com',
  EMAIL_PASS: 'tu-password-app',
  
  // CORS
  CORS_ORIGIN: 'http://localhost:3000',
  
  // Swagger
  SWAGGER_TITLE: 'MusikOn API',
  SWAGGER_VERSION: '1.0.0',
  SWAGGER_DESCRIPTION: 'API para conectar músicos y organizadores'
};
```

## 📡 Endpoints

### 🔐 Autenticación (`/auth`)
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/verify` - Verificar token
- `PUT /auth/update` - Actualizar perfil

### 🎵 Eventos (`/events`)
- `GET /events` - Listar eventos
- `POST /events` - Crear evento
- `GET /events/:id` - Obtener evento
- `PUT /events/:id` - Actualizar evento
- `DELETE /events/:id` - Eliminar evento
- `GET /events/my-events` - Mis eventos

### 🎼 Solicitudes de Músicos (`/musician-requests`)
- `POST /musician-requests` - Crear solicitud ✅
- `GET /musician-requests/:id` - Obtener solicitud ✅
- `PUT /musician-requests/:id` - Actualizar solicitud ✅
- `DELETE /musician-requests/:id` - Eliminar solicitud ✅
- `GET /musician-requests/:id/status` - Consultar estado ✅
- `POST /musician-requests/accept` - Aceptar solicitud ✅
- `POST /musician-requests/cancel` - Cancelar solicitud ✅

### 👥 Usuarios (`/users`)
- `GET /users` - Listar usuarios
- `POST /users` - Crear usuario
- `GET /users/:id` - Obtener usuario
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

### 🖼️ Imágenes (`/imgs`, `/media`)
- `POST /imgs/upload` - Subir imagen
- `GET /imgs/:id` - Obtener imagen
- `DELETE /imgs/:id` - Eliminar imagen
- `GET /media/:filename` - Servir archivos

### 🔧 Administración (`/admin`)
- `GET /admin/users` - Gestión de usuarios
- `GET /admin/events` - Gestión de eventos
- `GET /admin/musician-requests` - Gestión de solicitudes
- `GET /admin/images` - Gestión de imágenes

## 📁 Estructura del Proyecto

```
APP_MussikOn_Express/
├── src/
│   ├── controllers/          # Lógica de negocio
│   │   ├── authController.ts
│   │   ├── eventControllers.ts
│   │   ├── musicianRequestController.ts
│   │   ├── imagesController.ts
│   │   └── adminController.ts
│   ├── models/              # Modelos de datos
│   │   ├── authModel.ts
│   │   ├── eventModel.ts
│   │   ├── musicianRequestModel.ts
│   │   └── imagesModel.ts
│   ├── routes/              # Definición de rutas
│   │   ├── authRutes.ts
│   │   ├── eventsRoutes.ts
│   │   ├── musicianRequestRoutes.ts
│   │   ├── imagesRoutes.ts
│   │   └── adminRoutes.ts
│   ├── middleware/          # Middleware personalizado
│   │   ├── authMiddleware.ts
│   │   └── adminOnly.ts
│   ├── utils/              # Utilidades y configuraciones
│   │   ├── firebase.ts
│   │   ├── jwt.ts
│   │   ├── mailer.ts
│   │   ├── idriveE2.ts
│   │   └── functions.ts
│   └── sockets/            # Eventos de Socket.IO
│       └── eventSocket.ts
├── docs/                   # Documentación
│   ├── README.md
│   ├── API_DOCUMENTATION_UI.md
│   ├── EVENTS_API.md
│   ├── IMAGES_API.md
│   ├── MUSICIAN_REQUESTS_API.md
│   ├── ADMIN_SYSTEM.md
│   ├── FRONTEND_INTEGRATION.md
│   ├── ERROR_HANDLING.md
│   └── SECURITY.md
├── dist/                   # Código compilado
├── index.ts               # Punto de entrada
├── ENV.ts                # Variables de entorno
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Seguridad

### Autenticación
- **JWT tokens** con expiración configurable
- **Refresh tokens** para renovación automática
- **Validación de roles** en cada endpoint
- **Sanitización de inputs** para prevenir inyecciones

### Autorización
- **Middleware de roles** para proteger rutas
- **Validación de permisos** por operación
- **Auditoría de acciones** administrativas
- **Rate limiting** para prevenir abuso

### Datos
- **Encriptación de contraseñas** con bcrypt
- **Validación de esquemas** con Joi
- **Sanitización de datos** de entrada
- **Logs de seguridad** detallados

## 🔌 Socket.IO Events

### Eventos de Usuario
- `user_connected` - Usuario conectado
- `user_disconnected` - Usuario desconectado
- `user_typing` - Usuario escribiendo

### Eventos de Eventos
- `event_created` - Nuevo evento creado
- `event_updated` - Evento actualizado
- `event_deleted` - Evento eliminado
- `event_status_changed` - Estado de evento cambiado

### Eventos de Solicitudes
- `new_event_request` - Nueva solicitud de músico
- `musician_accepted` - Músico aceptó solicitud
- `request_cancelled` - Solicitud cancelada
- `request_updated` - Solicitud actualizada
- `request_deleted` - Solicitud eliminada

### Eventos de Chat y Comunicación
- `chat-register` - Registrar usuario en chat
- `authenticate` - Autenticar usuario
- `join-conversation` - Unirse a conversación
- `leave-conversation` - Salir de conversación
- `send-message` - Enviar mensaje
- `new-message` - Nuevo mensaje recibido
- `mark-message-read` - Marcar mensaje como leído
- `typing` - Indicador de escritura
- `user-typing` - Usuario escribiendo
- `online-status` - Estado de conexión
- `user-status-changed` - Cambio de estado de usuario
- `message-notification` - Notificación de mensaje nuevo
- `notification` - Notificación personalizada

## 🧪 Testing

### Scripts Disponibles
```bash
npm run build      # Compilar TypeScript
npm start          # Iniciar servidor
npm run dev        # Modo desarrollo
npm run lint       # Linting de código
```

### Pruebas Manuales
1. **Probar autenticación** con Postman
2. **Verificar CRUD** de eventos
3. **Probar solicitudes** de músicos
4. **Comprobar Socket.IO** con cliente de prueba
5. **Validar documentación** en Swagger UI

## 📚 Documentación

### Documentación Interactiva
- **Swagger UI**: `http://localhost:1000/api-docs`
- **Redoc**: `http://localhost:1000/redoc`

### Documentación Detallada
- [API Documentation](./docs/API_DOCUMENTATION_UI.md)
- [Events API](./docs/EVENTS_API.md)
- [Images API](./docs/IMAGES_API.md)
- [Musician Requests API](./docs/MUSICIAN_REQUESTS_API.md)
- [Admin System](./docs/ADMIN_SYSTEM.md)
- [Frontend Integration](./docs/FRONTEND_INTEGRATION.md)
- [Error Handling](./docs/ERROR_HANDLING.md)
- [Security](./docs/SECURITY.md)

## 🤝 Contribución

### Guías de Desarrollo
1. **Fork** el repositorio
2. **Crear** una rama para tu feature
3. **Implementar** cambios con TypeScript
4. **Probar** exhaustivamente
5. **Documentar** cambios
6. **Crear** Pull Request

### Estándares de Código
- **TypeScript** estricto
- **ESLint** para linting
- **Prettier** para formateo
- **JSDoc** para documentación
- **Commits** semánticos

### Estructura de Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

- **Documentación**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/APP_MussikOn_Express/issues)
- **Email**: soporte@mussikon.com

---

**Desarrollado con ❤️ para conectar músicos y organizadores de eventos**

