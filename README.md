# 🎵 MussikOn API - Backend

> **API RESTful completa para conectar músicos y organizadores de eventos con búsqueda avanzada, analytics y chat en tiempo real**

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
- **Middleware de autorización** por roles con `requireRole`
- **Sesiones persistentes** con refresh tokens
- **Validación robusta** con Joi DTOs

### 🎵 Gestión de Eventos
- **CRUD completo** de eventos
- **Búsqueda y filtros** avanzados
- **Estados de eventos**: `borrador`, `publicado`, `cancelado`, `completado`
- **Categorías**: concierto, boda, culto, evento corporativo, festival, etc.

### 🔍 Búsqueda Avanzada ✅ **NUEVO**
- **Búsqueda global** en eventos, solicitudes y usuarios
- **Filtros por ubicación** y geolocalización
- **Búsqueda por instrumento** y especialidades
- **Filtros por fecha** y disponibilidad
- **Búsqueda de músicos disponibles** para eventos específicos
- **Búsqueda de eventos disponibles** para músicos específicos

### 📊 Analytics y Reportes ✅ **NUEVO**
- **Métricas de eventos** (creación, aceptación, cancelación)
- **Analytics de solicitudes** (tendencias, tasas de aceptación)
- **Estadísticas de usuarios** (registros, actividad)
- **Reportes de ubicación** y rendimiento geográfico
- **Tendencias temporales** y análisis de patrones
- **Dashboard administrativo** con métricas en tiempo real
- **Exportación de reportes** en CSV

### 🎼 Solicitudes de Músicos ✅ **IMPLEMENTADO**
- **CRUD completo** de solicitudes de músicos
- **Estados**: `pendiente`, `asignada`, `cancelada`, `completada`, `no_asignada`
- **Aceptación automática** (primer músico que acepta)
- **Notificaciones en tiempo real**

### 💬 Sistema de Chat en Tiempo Real ✅ **MEJORADO**
- **Chat privado** entre dos usuarios
- **Conversaciones grupales** para eventos
- **Mensajes en tiempo real** con Socket.IO
- **Múltiples tipos de mensaje**: texto, imagen, audio, archivo
- **Indicadores de escritura** (typing indicators)
- **Estado de mensajes**: enviado, entregado, leído
- **Notificaciones push** para mensajes nuevos
- **Historial persistente** de conversaciones
- **Búsqueda de mensajes** y conversaciones
- **Gestión de participantes** en grupos

### 👥 Gestión de Usuarios
- **CRUD completo** de usuarios
- **Perfiles de músicos** con especialidades
- **Sistema de roles** jerárquico
- **Validación de datos** robusta con DTOs

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

### 🛡️ Middlewares y Validaciones ✅ **NUEVO**
- **Middleware de autenticación** robusto
- **Validación de entrada** con Joi DTOs
- **Manejo global de errores** estructurado
- **Logging centralizado** con niveles
- **Rate limiting** y protección contra abuso
- **Sanitización** de datos de entrada

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
- **Joi** - Validación de esquemas
- **Helmet** - Seguridad HTTP
- **Morgan** - Logging de requests

### Documentación
- **Swagger/OpenAPI 3.0.0** - Documentación interactiva
- **Redoc** - Documentación legible
- **JSDoc** - Documentación de código

### Desarrollo
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Jest** - Testing framework
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
- `POST /auth/register` - Registro de usuario (con validación DTO)
- `POST /auth/login` - Inicio de sesión (con validación DTO)
- `POST /auth/google` - Autenticación con Google ✅
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/verify` - Verificar token
- `POST /auth/email-register` - Registro por email
- `GET /auth/validate-number/{userEmail}` - Validar número
- `POST /auth/add-event/{userEmail}` - Agregar evento
- `DELETE /auth/delete/{userEmail}` - Eliminar usuario

### 🎵 Eventos (`/events`)
- `GET /events` - Listar eventos
- `POST /events` - Crear evento
- `GET /events/:id` - Obtener evento
- `PUT /events/:id` - Actualizar evento
- `DELETE /events/:id` - Eliminar evento

### 🔍 Búsqueda (`/search`) ✅ **NUEVO**
- `GET /search/events` - Búsqueda avanzada de eventos
- `GET /search/musician-requests` - Búsqueda de solicitudes
- `GET /search/users` - Búsqueda de usuarios
- `GET /search/global` - Búsqueda global
- `GET /search/location` - Búsqueda por ubicación
- `GET /search/available-events` - Eventos disponibles para músico
- `GET /search/available-musicians` - Músicos disponibles para evento

### 📊 Analytics (`/analytics`) ✅ **NUEVO**
- `GET /analytics/events` - Métricas de eventos
- `GET /analytics/requests` - Métricas de solicitudes
- `GET /analytics/users` - Métricas de usuarios
- `GET /analytics/platform` - Métricas de plataforma
- `GET /analytics/trends` - Reporte de tendencias
- `GET /analytics/location-performance` - Rendimiento por ubicación
- `GET /analytics/top-users` - Usuarios más activos
- `GET /analytics/dashboard` - Dashboard administrativo
- `GET /analytics/export` - Exportar reportes

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
- `POST /chat/conversations/:id/messages` - Enviar mensaje ✅
- `PUT /chat/conversations/:id/messages/read` - Marcar como leído ✅
- `GET /chat/unread-count` - Contar mensajes no leídos ✅
- `GET /chat/search-conversations` - Buscar conversaciones ✅
- `GET /chat/search-messages` - Buscar mensajes ✅
- `DELETE /chat/messages/:id` - Eliminar mensaje ✅
- `POST /chat/conversations/:id/participants` - Agregar participante ✅
- `DELETE /chat/conversations/:id/participants/:userId` - Remover participante ✅
- `GET /chat/stats` - Estadísticas de chat ✅

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
│   │   ├── analyticsController.ts  # ✅ NUEVO - Analytics
│   │   ├── searchController.ts     # ✅ NUEVO - Búsqueda
│   │   └── ...
│   ├── middleware/           # Middleware personalizado
│   │   ├── authMiddleware.ts       # Autenticación JWT
│   │   ├── adminOnly.ts            # Autorización admin
│   │   ├── validationMiddleware.ts # ✅ NUEVO - Validaciones
│   │   └── errorHandler.ts         # ✅ NUEVO - Manejo de errores
│   ├── models/              # Modelos de datos
│   ├── routes/              # Rutas de la API
│   │   ├── analyticsRoutes.ts      # ✅ NUEVO - Analytics
│   │   ├── searchRoutes.ts         # ✅ NUEVO - Búsqueda
│   │   └── ...
│   ├── services/            # Lógica de negocio
│   │   ├── analyticsService.ts     # ✅ NUEVO - Analytics
│   │   ├── searchService.ts        # ✅ NUEVO - Búsqueda
│   │   ├── chatService.ts          # ✅ MEJORADO - Chat
│   │   └── loggerService.ts        # ✅ NUEVO - Logging
│   ├── sockets/             # Eventos de Socket.IO
│   ├── types/               # Tipos TypeScript
│   │   └── dtos.ts                 # ✅ NUEVO - DTOs
│   └── utils/               # Utilidades y helpers
├── docs/                    # Documentación completa
├── ENV_example.ts          # Variables de entorno de ejemplo
├── ENV.ts                  # Variables de entorno (no commitear)
├── index.ts                # Punto de entrada
├── package.json            # Dependencias y scripts
├── tsconfig.json           # Configuración TypeScript
├── .eslintrc.js            # ✅ NUEVO - Configuración ESLint
├── .prettierrc.json        # ✅ NUEVO - Configuración Prettier
└── jest.config.ts          # ✅ NUEVO - Configuración Jest
```

## 🔒 Seguridad

### Autenticación
- **JWT tokens** con expiración configurable
- **Google OAuth** para autenticación social
- **Refresh tokens** para sesiones persistentes
- **Validación de roles** en cada endpoint

### Autorización
- **Roles granulares** (7 niveles de acceso)
- **Middleware de autorización** por ruta con `requireRole`
- **Validación de permisos** en tiempo real

### Protección de Datos
- **Sanitización** de inputs con Joi
- **Validación** de tipos de archivo
- **Límites** de tamaño de archivos
- **Encriptación** de contraseñas con bcrypt
- **Rate limiting** y protección contra abuso
- **Logging estructurado** para auditoría

### Middlewares de Seguridad
- **Helmet** - Cabeceras HTTP seguras
- **CORS** - Control de acceso entre dominios
- **Rate Limiting** - Protección contra spam
- **Request Logging** - Auditoría de requests

## 🧪 Testing

### Scripts Disponibles
```bash
npm run build          # Compilar TypeScript
npm start              # Iniciar servidor
npm run dev            # Modo desarrollo
npm run lint           # Linting de código
npm run lint:fix       # Corregir errores de linting
npm run format         # Formatear código
npm run test           # Ejecutar tests
npm run test:watch     # Tests en modo watch
npm run test:coverage  # Tests con cobertura
npm run type-check     # Verificar tipos TypeScript
npm run clean          # Limpiar archivos generados
```

### Pruebas Manuales
1. **Autenticación** - Probar login/registro con validación DTO
2. **CRUD de Eventos** - Crear, leer, actualizar, eliminar eventos
3. **CRUD de Solicitudes** - Probar todas las operaciones de solicitudes
4. **Búsqueda Avanzada** - Probar filtros y búsqueda ✅
5. **Analytics** - Verificar métricas y reportes ✅
6. **Chat System** - Probar chat en tiempo real ✅
7. **Validaciones** - Probar middlewares de validación ✅
8. **Manejo de Errores** - Verificar respuestas de error estructuradas ✅
9. **Documentación** - Validar Swagger UI actualizado

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
- **[Búsqueda Avanzada](./docs/SEARCH_API.md)** - ✅ NUEVO - Sistema de búsqueda
- **[Analytics y Reportes](./docs/ANALYTICS_API.md)** - ✅ NUEVO - Métricas y reportes

### Integración y Desarrollo
- **[Integración Frontend](./docs/FRONTEND_INTEGRATION.md)** - Guías de integración
- **[Seguridad](./docs/SECURITY.md)** - Autenticación y autorización
- **[Manejo de Errores](./docs/ERROR_HANDLING.md)** - Debugging y troubleshooting
- **[Guía de Despliegue](./docs/DEPLOYMENT.md)** - Despliegue en producción

## 📊 Estado de Implementación

### ✅ Funcionalidades Completadas
- **Autenticación**: 100% ✅ (JWT + Google OAuth + Validaciones)
- **Eventos**: 100% ✅
- **Solicitudes de Músicos**: 100% ✅
- **Chat System**: 100% ✅ (Mejorado con búsqueda y gestión de grupos)
- **Imágenes**: 100% ✅
- **Administración**: 100% ✅
- **Socket.IO**: 100% ✅
- **Búsqueda Avanzada**: 100% ✅ (NUEVO)
- **Analytics y Reportes**: 100% ✅ (NUEVO)
- **Middlewares y Validaciones**: 100% ✅ (NUEVO)
- **Logging Estructurado**: 100% ✅ (NUEVO)
- **Manejo de Errores**: 100% ✅ (NUEVO)
- **Documentación**: 100% ✅ (Actualizada)

### 🔄 Funcionalidades en Desarrollo
- **Notificaciones Push Móviles** - Alertas para dispositivos móviles
- **Sistema de Pagos** - Integración con pasarelas de pago
- **Geolocalización Avanzada** - Búsqueda por ubicación con mapas
- **Optimización de Performance** - Caching y optimizaciones

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
- **Validación** con DTOs
- **Logging** estructurado

## 📞 Soporte

### Documentación
- **Índice**: [docs/INDEX.md](./docs/INDEX.md)
- **API Documentation**: [docs/API_DOCUMENTATION_UI.md](./docs/API_DOCUMENTATION_UI.md)
- **Guías de Integración**: [docs/FRONTEND_INTEGRATION.md](./docs/FRONTEND_INTEGRATION.md)

### Contacto
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/APP_MussikOn_Express/issues)
- **Email**: soporte@mussikon.com

---

**Última actualización**: Búsqueda avanzada, analytics, chat mejorado, middlewares, validaciones, DTOs y logging estructurado completamente implementados ✅

**Documentación actualizada al**: $(date)

