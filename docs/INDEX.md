# 📚 Índice de Documentación - MusikOn API

> **Navegación rápida y completa de toda la documentación del proyecto actualizada**

## 🎯 Documentación Principal

### 📖 [README Principal](./README.md)
Documentación general del proyecto con estado actual, tecnologías, endpoints y roadmap actualizado.

### 📋 [Resumen Ejecutivo](./EXECUTIVE_SUMMARY.md)
Resumen ejecutivo del proyecto con métricas, funcionalidades implementadas y próximos pasos.

### 🚀 [Guía de Despliegue](./DEPLOYMENT.md)
Guía completa para desplegar la aplicación en diferentes entornos.

## 🔧 APIs Específicas

### 🔍 [API de Búsqueda Avanzada](./SEARCH_API.md) ✅ **NUEVO**
- Búsqueda global en eventos, solicitudes y usuarios
- Filtros por ubicación y geolocalización
- Búsqueda por instrumento y especialidades
- Filtros por fecha y disponibilidad
- Búsqueda de músicos disponibles para eventos específicos
- Búsqueda de eventos disponibles para músicos específicos

### 📊 [API de Analytics y Reportes](./ANALYTICS_API.md) ✅ **NUEVO**
- Métricas de eventos (creación, aceptación, cancelación)
- Analytics de solicitudes (tendencias, tasas de aceptación)
- Estadísticas de usuarios (registros, actividad)
- Reportes de ubicación y rendimiento geográfico
- Tendencias temporales y análisis de patrones
- Dashboard administrativo con métricas en tiempo real
- Exportación de reportes en CSV

### 🎼 [API de Solicitudes de Músicos](./MUSICIAN_REQUESTS_API.md) ✅ **IMPLEMENTADO**
- CRUD completo de solicitudes
- Estados de solicitud (pendiente, asignada, cancelada, completada)
- Aceptación automática de músicos
- Notificaciones en tiempo real

### 💬 [Sistema de Chat](./CHAT_SYSTEM.md) ✅ **MEJORADO**
- Chat privado y grupal
- Mensajes en tiempo real con Socket.IO
- Múltiples tipos de mensaje (texto, imagen, audio, archivo)
- Indicadores de escritura y estado de mensajes
- Notificaciones push
- Búsqueda de mensajes y conversaciones ✅ **NUEVO**
- Gestión de participantes en grupos ✅ **NUEVO**

### 🎵 [API de Eventos](./EVENTS_API.md) ✅ **IMPLEMENTADO**
- Gestión completa de eventos
- Estados de eventos (borrador, publicado, cancelado, completado)
- Categorías y filtros avanzados

### 🖼️ [API de Imágenes](./IMAGES_API.md) ✅ **IMPLEMENTADO**
- Almacenamiento en idriveE2 (AWS S3 compatible)
- URLs firmadas para acceso seguro
- Categorización de imágenes (perfil, post, evento, galería, admin)
- Metadatos y etiquetas
- Control de acceso y permisos
- Optimización automática de imágenes

### 👥 [Sistema Administrativo](./ADMIN_SYSTEM.md) ✅ **IMPLEMENTADO**
- Panel de administración completo
- Gestión de usuarios y eventos
- Roles granulares (7 niveles)

## 🔗 Integración y Desarrollo

### 🎨 [Integración Frontend](./FRONTEND_INTEGRATION.md) ✅ **IMPLEMENTADO**
- Guías de integración con React/Material-UI
- Ejemplos de código
- Manejo de estados y autenticación
- Sistema de imágenes CRUD en frontend

### 🔒 [Seguridad](./SECURITY.md) ✅ **MEJORADO**
- Autenticación JWT y Google OAuth
- Roles y permisos con `requireRole`
- Validaciones con Joi DTOs ✅ **NUEVO**
- Middlewares de seguridad ✅ **NUEVO**
- Rate limiting y protección ✅ **NUEVO**

### ⚠️ [Manejo de Errores](./ERROR_HANDLING.md) ✅ **MEJORADO**
- Middleware global de errores estructurado ✅ **NUEVO**
- Códigos de error estandarizados ✅ **NUEVO**
- Logging centralizado ✅ **NUEVO**
- Debugging y troubleshooting
- Logs y monitoreo

### 📡 [API Documentation UI](./API_DOCUMENTATION_UI.md) ✅ **ACTUALIZADO**
- Documentación interactiva con Swagger
- Ejemplos de endpoints actualizados
- Nuevas secciones de búsqueda y analytics ✅ **NUEVO**
- Middlewares y validaciones ✅ **NUEVO**
- Manejo de errores ✅ **NUEVO**
- Testing de API

## 🚀 Estado Actual del Proyecto

### ✅ Funcionalidades Completamente Implementadas

| Funcionalidad | Estado | Documentación | Backend | Frontend |
|---------------|--------|---------------|---------|----------|
| **Autenticación JWT** | ✅ Completo | [README](./README.md) | ✅ | ✅ |
| **Autenticación Google OAuth** | ✅ Completo | [README](./README.md) | ✅ | ✅ |
| **CRUD de Usuarios** | ✅ Completo | [README](./README.md) | ✅ | ✅ |
| **CRUD de Eventos** | ✅ Completo | [EVENTS_API](./EVENTS_API.md) | ✅ | ✅ |
| **CRUD de Solicitudes de Músicos** | ✅ Completo | [MUSICIAN_REQUESTS_API](./MUSICIAN_REQUESTS_API.md) | ✅ | ✅ |
| **Sistema de Chat** | ✅ Completo | [CHAT_SYSTEM](./CHAT_SYSTEM.md) | ✅ | ✅ |
| **Sistema de Imágenes** | ✅ Completo | [IMAGES_API](./IMAGES_API.md) | ✅ | ✅ |
| **Sistema Administrativo** | ✅ Completo | [ADMIN_SYSTEM](./ADMIN_SYSTEM.md) | ✅ | ✅ |
| **Socket.IO** | ✅ Completo | [CHAT_SYSTEM](./CHAT_SYSTEM.md) | ✅ | ✅ |
| **Búsqueda Avanzada** | ✅ Completo | [SEARCH_API](./SEARCH_API.md) | ✅ | ✅ |
| **Analytics y Reportes** | ✅ Completo | [ANALYTICS_API](./ANALYTICS_API.md) | ✅ | ✅ |
| **Middlewares y Validaciones** | ✅ Completo | [SECURITY](./SECURITY.md) | ✅ | ✅ |
| **Logging Estructurado** | ✅ Completo | [ERROR_HANDLING](./ERROR_HANDLING.md) | ✅ | ✅ |
| **Manejo de Errores** | ✅ Completo | [ERROR_HANDLING](./ERROR_HANDLING.md) | ✅ | ✅ |
| **Documentación** | ✅ Completo | Todos los archivos | ✅ | ✅ |

### 🔄 Funcionalidades en Desarrollo

| Funcionalidad | Estado | Prioridad | Documentación |
|---------------|--------|-----------|---------------|
| **Notificaciones Push Móviles** | 🚧 En desarrollo | Media | [README](./README.md) |
| **Sistema de Pagos** | 📋 Pendiente | Alta | [README](./README.md) |
| **Geolocalización Avanzada** | 📋 Pendiente | Baja | [README](./README.md) |
| **Optimización de Performance** | 📋 Pendiente | Media | [README](./README.md) |

## 📊 Métricas del Proyecto

### Código
- **Líneas de código**: ~12,000+
- **Archivos TypeScript**: ~80
- **Endpoints API**: ~60
- **Eventos Socket.IO**: ~25
- **Middlewares**: ~8
- **Servicios**: ~10

### Funcionalidades
- **CRUDs completos**: 7 (usuarios, eventos, solicitudes, chat, imágenes, búsqueda, analytics)
- **Sistemas de autenticación**: 2 (JWT, Google OAuth)
- **Integraciones externas**: 4 (Firebase, AWS S3, idriveE2, Email)
- **Documentación**: 15 archivos detallados
- **Middlewares**: 8 tipos diferentes
- **Validaciones**: DTOs completos con Joi

### Estado de Implementación
- **Autenticación**: 100% ✅
- **Eventos**: 100% ✅
- **Solicitudes de Músicos**: 100% ✅
- **Chat System**: 100% ✅
- **Sistema de Imágenes**: 100% ✅
- **Administración**: 100% ✅
- **Socket.IO**: 100% ✅
- **Búsqueda Avanzada**: 100% ✅
- **Analytics y Reportes**: 100% ✅
- **Middlewares y Validaciones**: 100% ✅
- **Logging Estructurado**: 100% ✅
- **Manejo de Errores**: 100% ✅
- **Frontend Integration**: 100% ✅
- **Documentación**: 100% ✅

## 🔌 Endpoints Principales

### Autenticación (`/auth`)
- `POST /auth/register` - Registro de usuario (con validación DTO)
- `POST /auth/login` - Inicio de sesión (con validación DTO)
- `POST /auth/google` - Autenticación con Google ✅
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/verify` - Verificar token
- `POST /auth/email-register` - Registro por email ✅ **NUEVO**
- `GET /auth/validate-number/{userEmail}` - Validar número ✅ **NUEVO**
- `POST /auth/add-event/{userEmail}` - Agregar evento ✅ **NUEVO**
- `DELETE /auth/delete/{userEmail}` - Eliminar usuario ✅ **NUEVO**

### Eventos (`/events`)
- `GET /events` - Listar eventos
- `POST /events` - Crear evento (con validación DTO)
- `GET /events/:id` - Obtener evento
- `PUT /events/:id` - Actualizar evento
- `DELETE /events/:id` - Eliminar evento

### Búsqueda (`/search`) ✅ **NUEVO**
- `GET /search/events` - Búsqueda avanzada de eventos
- `GET /search/musician-requests` - Búsqueda de solicitudes
- `GET /search/users` - Búsqueda de usuarios
- `GET /search/global` - Búsqueda global
- `GET /search/location` - Búsqueda por ubicación
- `GET /search/available-events` - Eventos disponibles para músico
- `GET /search/available-musicians` - Músicos disponibles para evento

### Analytics (`/analytics`) ✅ **NUEVO**
- `GET /analytics/events` - Métricas de eventos
- `GET /analytics/requests` - Métricas de solicitudes
- `GET /analytics/users` - Métricas de usuarios
- `GET /analytics/platform` - Métricas de plataforma
- `GET /analytics/trends` - Reporte de tendencias
- `GET /analytics/location-performance` - Rendimiento por ubicación
- `GET /analytics/top-users` - Usuarios más activos
- `GET /analytics/dashboard` - Dashboard administrativo
- `GET /analytics/export` - Exportar reportes

### Solicitudes de Músicos (`/musician-requests`)
- `POST /musician-requests` - Crear solicitud ✅
- `GET /musician-requests/:id` - Obtener solicitud ✅
- `PUT /musician-requests/:id` - Actualizar solicitud ✅
- `DELETE /musician-requests/:id` - Eliminar solicitud ✅
- `POST /musician-requests/accept` - Aceptar solicitud ✅
- `POST /musician-requests/cancel` - Cancelar solicitud ✅

### Chat (`/chat`)
- `POST /chat/conversations` - Crear conversación ✅
- `GET /chat/conversations` - Obtener conversaciones ✅
- `GET /chat/conversations/:id` - Obtener conversación ✅
- `GET /chat/conversations/:id/messages` - Obtener mensajes ✅
- `POST /chat/conversations/:id/messages` - Enviar mensaje ✅ **NUEVO**
- `PUT /chat/conversations/:id/messages/read` - Marcar como leído ✅
- `GET /chat/unread-count` - Contar mensajes no leídos ✅ **NUEVO**
- `GET /chat/search-conversations` - Buscar conversaciones ✅ **NUEVO**
- `GET /chat/search-messages` - Buscar mensajes ✅ **NUEVO**
- `DELETE /chat/messages/:id` - Eliminar mensaje ✅ **NUEVO**
- `POST /chat/conversations/:id/participants` - Agregar participante ✅ **NUEVO**
- `DELETE /chat/conversations/:id/participants/:userId` - Remover participante ✅ **NUEVO**
- `GET /chat/stats` - Estadísticas de chat ✅ **NUEVO**

### Imágenes (`/images`) ✅ **IMPLEMENTADO**
- `POST /images/upload` - Subir imagen ✅
- `GET /images` - Listar imágenes con filtros ✅
- `GET /images/:id` - Obtener imagen por ID ✅
- `PUT /images/:id` - Actualizar metadatos ✅
- `DELETE /images/:id` - Eliminar imagen ✅
- `GET /images/stats` - Estadísticas del sistema ✅
- `POST /images/cleanup` - Limpiar imágenes expiradas ✅
- `GET /images/profile/:userId` - Imágenes de perfil ✅
- `GET /images/posts` - Imágenes de posts ✅
- `GET /images/events` - Imágenes de eventos ✅

## 🔌 Eventos de Socket.IO

### Chat ✅ **IMPLEMENTADO**
- `chat-register` - Registrar usuario en chat
- `join-conversation` - Unirse a conversación
- `leave-conversation` - Salir de conversación
- `send-message` - Enviar mensaje
- `new-message` - Nuevo mensaje recibido
- `message-notification` - Notificación de mensaje
- `mark-message-read` - Marcar mensaje como leído
- `typing` - Usuario escribiendo
- `user-typing` - Indicador de escritura
- `online-status` - Estado de conexión

### Eventos y Solicitudes ✅ **IMPLEMENTADO**
- `event_created` - Nuevo evento creado
- `event_updated` - Evento actualizado
- `new_event_request` - Nueva solicitud de músico
- `musician_accepted` - Músico aceptó solicitud
- `request_cancelled` - Solicitud cancelada

### Imágenes ✅ **IMPLEMENTADO**
- `image_uploaded` - Nueva imagen subida
- `image_deleted` - Imagen eliminada
- `image_updated` - Imagen actualizada

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **Firebase Firestore** - Base de datos NoSQL
- **JWT** - Autenticación con tokens
- **Socket.IO** - Comunicación en tiempo real
- **idriveE2** - Almacenamiento de archivos (AWS S3 compatible)
- **Nodemailer** - Envío de emails
- **bcrypt** - Hash de contraseñas
- **Multer** - Procesamiento de archivos
- **Joi** - Validación de esquemas ✅ **NUEVO**
- **Helmet** - Seguridad HTTP ✅ **NUEVO**
- **Morgan** - Logging de requests ✅ **NUEVO**

### Frontend
- **React** - Biblioteca de UI
- **Material-UI** - Componentes de UI
- **TypeScript** - Tipado estático
- **Axios** - Cliente HTTP
- **Socket.IO Client** - Comunicación en tiempo real
- **Vite** - Build tool

### Documentación
- **Swagger/OpenAPI 3.0.0** - Documentación interactiva
- **Redoc** - Documentación legible
- **JSDoc** - Documentación de código

### Desarrollo
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Jest** - Testing framework ✅ **NUEVO**
- **Nodemon** - Hot reloading

## 🚀 Instalación Rápida

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Firebase
- Cuenta de idriveE2 (AWS S3 compatible)

### Pasos
1. **Clonar repositorio**
2. **Instalar dependencias** - `npm install`
3. **Configurar variables** - Copiar `ENV_example.ts` a `ENV.ts`
4. **Compilar** - `npm run build`
5. **Iniciar** - `npm start`

### URLs de Acceso
- **API Base**: `http://localhost:1000`
- **Swagger UI**: `http://localhost:1000/api-docs`
- **Redoc**: `http://localhost:1000/redoc`

## 📞 Soporte

### Documentación
- **README Principal**: [docs/README.md](./README.md)
- **API Documentation**: [docs/API_DOCUMENTATION_UI.md](./API_DOCUMENTATION_UI.md)
- **Guías de Integración**: [docs/FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)
- **Sistema de Imágenes**: [docs/IMAGES_API.md](./IMAGES_API.md)
- **Búsqueda Avanzada**: [docs/SEARCH_API.md](./SEARCH_API.md) ✅ **NUEVO**
- **Analytics y Reportes**: [docs/ANALYTICS_API.md](./ANALYTICS_API.md) ✅ **NUEVO**

### Contacto
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/APP_MussikOn_Express/issues)
- **Email**: soporte@mussikon.com

---

**Última actualización**: Búsqueda avanzada, analytics, chat mejorado, middlewares, validaciones, DTOs y logging estructurado completamente implementados ✅

**Documentación actualizada al**: $(date) 