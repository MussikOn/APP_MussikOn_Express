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
- **Google OAuth** para autenticación con Google ✅
- **Roles de usuario**: `musico`, `eventCreator`, `usuario`, `adminJunior`, `adminMidLevel`, `adminSenior`, `superAdmin`
- **Middleware de autorización** por roles
- **Sesiones persistentes** con refresh tokens

### 🎵 Gestión de Eventos
- **CRUD completo** de eventos
- **Búsqueda y filtros** avanzados
- **Estados de eventos**: `borrador`, `publicado`, `cancelado`, `completado`
- **Categorías**: concierto, boda, culto, evento corporativo, festival, etc.

### 🎼 Solicitudes de Músicos ✅ **IMPLEMENTADO**
- **CRUD completo** de solicitudes de músicos
- **Estados**: `pendiente`, `asignada`, `cancelada`, `completada`, `no_asignada`
- **Aceptación automática** (primer músico que acepta)
- **Notificaciones en tiempo real**

### 💬 Sistema de Chat en Tiempo Real ✅ **IMPLEMENTADO**
- **Chat privado** entre dos usuarios
- **Conversaciones grupales** para eventos
- **Mensajes en tiempo real** con Socket.IO
- **Múltiples tipos de mensaje**: texto, imagen, audio, archivo
- **Indicadores de escritura** (typing indicators)
- **Estado de mensajes**: enviado, entregado, leído
- **Notificaciones push** para mensajes nuevos
- **Historial persistente** de conversaciones

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

### 🔔 Notificaciones en Tiempo Real ✅ **IMPLEMENTADO**
- **Socket.IO** para comunicación instantánea
- **Notificaciones push** para eventos importantes
- **Chat en tiempo real** entre usuarios ✅
- **Estados de conexión** en vivo
- **Indicadores de escritura** (typing indicators) ✅
- **Marcado de mensajes leídos** ✅
- **Conversaciones privadas y grupales** ✅

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
git clone https://github.com/tu-usuario/APP_MussikOn_Express.git
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

### URLs de Acceso
- **API Base**: `http://localhost:1000`
- **Swagger UI**: `http://localhost:1000/api-docs`
- **Redoc**: `http://localhost:1000/redoc`

## 📡 Endpoints Principales

### 🔐 Autenticación (`/auth`)
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión
- `POST /auth/google` - Autenticación con Google ✅
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/verify` - Verificar token

### 🎵 Eventos (`/events`)
- `GET /events` - Listar eventos
- `POST /events` - Crear evento
- `GET /events/:id` - Obtener evento
- `PUT /events/:id` - Actualizar evento
- `DELETE /events/:id` - Eliminar evento

### 🎼 Solicitudes de Músicos (`/musician-requests`)
- `POST /musician-requests` - Crear solicitud ✅
- `GET /musician-requests/:id` - Obtener solicitud ✅
- `PUT /musician-requests/:id` - Actualizar solicitud ✅
- `DELETE /musician-requests/:id` - Eliminar solicitud ✅
- `POST /musician-requests/accept` - Aceptar solicitud ✅
- `POST /musician-requests/cancel` - Cancelar solicitud ✅

### 💬 Chat (`/chat`)
- `POST /chat/conversations` - Crear conversación ✅
- `GET /chat/conversations` - Obtener conversaciones ✅
- `GET /chat/conversations/:id` - Obtener conversación ✅
- `GET /chat/conversations/:id/messages` - Obtener mensajes ✅
- `PUT /chat/conversations/:id/messages/read` - Marcar como leído ✅

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

## 🔌 Eventos de Socket.IO

### Eventos de Chat ✅ **IMPLEMENTADO**
- `chat-register` - Registrar usuario en chat
- `join-conversation` - Unirse a conversación
- `leave-conversation` - Salir de conversación
- `send-message` - Enviar mensaje
- `new-message` - Nuevo mensaje recibido
- `message-notification` - Notificación de mensaje
- `mark-message-read` - Marcar mensaje como leído
- `message-read` - Mensaje marcado como leído
- `typing` - Usuario escribiendo
- `user-typing` - Indicador de escritura
- `online-status` - Estado de conexión
- `user-status-changed` - Cambio de estado de usuario

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

## 🏗️ Estructura del Proyecto

```
APP_MussikOn_Express/
├── src/
│   ├── controllers/          # Controladores de la API
│   ├── middleware/           # Middleware personalizado
│   ├── models/              # Modelos de datos
│   ├── routes/              # Rutas de la API
│   ├── services/            # Lógica de negocio
│   ├── sockets/             # Eventos de Socket.IO
│   ├── types/               # Tipos TypeScript
│   └── utils/               # Utilidades y helpers
├── docs/                    # Documentación completa
├── ENV_example.ts          # Variables de entorno de ejemplo
├── ENV.ts                  # Variables de entorno (no commitear)
├── index.ts                # Punto de entrada
├── package.json            # Dependencias y scripts
└── tsconfig.json           # Configuración TypeScript
```

## 🔒 Seguridad

### Autenticación
- **JWT tokens** con expiración configurable
- **Google OAuth** para autenticación social
- **Refresh tokens** para sesiones persistentes
- **Validación de roles** en cada endpoint

### Autorización
- **Roles granulares** (7 niveles de acceso)
- **Middleware de autorización** por ruta
- **Validación de permisos** en tiempo real

### Protección de Datos
- **Sanitización** de inputs
- **Validación** de tipos de archivo
- **Límites** de tamaño de archivos
- **Encriptación** de contraseñas con bcrypt

## 🧪 Testing

### Scripts Disponibles
```bash
npm run build      # Compilar TypeScript
npm start          # Iniciar servidor
npm run dev        # Modo desarrollo
npm run lint       # Linting de código
```

### Pruebas Manuales
1. **Autenticación** - Probar login/registro con Postman
2. **CRUD de Eventos** - Crear, leer, actualizar, eliminar eventos
3. **CRUD de Solicitudes** - Probar todas las operaciones de solicitudes
4. **Socket.IO** - Verificar comunicación en tiempo real
5. **Chat System** - Probar chat en tiempo real ✅
6. **Documentación** - Validar Swagger UI

## 📚 Documentación

### Documentación Completa
- **[Índice de Documentación](./docs/INDEX.md)** - Navegación rápida
- **[README Principal](./docs/README.md)** - Documentación general
- **[Resumen Ejecutivo](./docs/EXECUTIVE_SUMMARY.md)** - Estado del proyecto
- **[API Documentation UI](./docs/API_DOCUMENTATION_UI.md)** - Documentación interactiva

### APIs Específicas
- **[Sistema de Chat](./docs/CHAT_SYSTEM.md)** - Chat en tiempo real ✅
- **[Solicitudes de Músicos](./docs/MUSICIAN_REQUESTS_API.md)** - CRUD completo ✅
- **[API de Eventos](./docs/EVENTS_API.md)** - Gestión de eventos
- **[API de Imágenes](./docs/IMAGES_API.md)** - Gestión de archivos
- **[Sistema Administrativo](./docs/ADMIN_SYSTEM.md)** - Panel de admin

### Integración y Desarrollo
- **[Integración Frontend](./docs/FRONTEND_INTEGRATION.md)** - Guías de integración
- **[Seguridad](./docs/SECURITY.md)** - Autenticación y autorización
- **[Manejo de Errores](./docs/ERROR_HANDLING.md)** - Debugging y troubleshooting
- **[Guía de Despliegue](./docs/DEPLOYMENT.md)** - Despliegue en producción

## 📊 Estado de Implementación

### ✅ Funcionalidades Completadas
- **Autenticación**: 100% ✅ (JWT + Google OAuth)
- **Eventos**: 100% ✅
- **Solicitudes de Músicos**: 100% ✅
- **Chat System**: 100% ✅
- **Imágenes**: 100% ✅
- **Administración**: 100% ✅
- **Socket.IO**: 100% ✅
- **Documentación**: 100% ✅

### 🔄 Funcionalidades en Desarrollo
- **Búsqueda Avanzada** - Filtros y búsqueda compleja
- **Analytics y Reportes** - Métricas de uso
- **Notificaciones Push Móviles** - Alertas para dispositivos móviles
- **Sistema de Pagos** - Integración con pasarelas de pago
- **Geolocalización** - Búsqueda por ubicación

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

## 📞 Soporte

### Documentación
- **Índice**: [docs/INDEX.md](./docs/INDEX.md)
- **API Documentation**: [docs/API_DOCUMENTATION_UI.md](./docs/API_DOCUMENTATION_UI.md)
- **Guías de Integración**: [docs/FRONTEND_INTEGRATION.md](./docs/FRONTEND_INTEGRATION.md)

### Contacto
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/APP_MussikOn_Express/issues)
- **Email**: soporte@mussikon.com

---

**Última actualización**: Sistema de chat en tiempo real completamente implementado ✅

**Documentación actualizada al**: $(date)

