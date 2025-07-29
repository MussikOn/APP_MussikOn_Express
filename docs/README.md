# 📚 Documentación MusikOn API

> **Documentación completa y detallada del backend MusikOn**

## 📋 Índice de Documentación

### 🎯 Documentación Principal
- **[API Documentation UI](./API_DOCUMENTATION_UI.md)** - Documentación completa de endpoints con ejemplos
- **[Executive Summary](./EXECUTIVE_SUMMARY.md)** - Resumen ejecutivo del proyecto
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Guía completa de despliegue

### 🔧 APIs Específicas
- **[Events API](./EVENTS_API.md)** - Gestión completa de eventos
- **[Images API](./IMAGES_API.md)** - Gestión de imágenes y archivos
- **[Musician Requests API](./MUSICIAN_REQUESTS_API.md)** - CRUD de solicitudes de músicos ✅ **IMPLEMENTADO**
- **[Admin System](./ADMIN_SYSTEM.md)** - Sistema administrativo

### 🔗 Integración y Desarrollo
- **[Frontend Integration](./FRONTEND_INTEGRATION.md)** - Integración con frontend
- **[Error Handling](./ERROR_HANDLING.md)** - Manejo de errores y debugging
- **[Security](./SECURITY.md)** - Seguridad y autenticación

## 🚀 Estado Actual del Proyecto

### ✅ Funcionalidades Implementadas

#### 🔐 Autenticación y Autorización
- **JWT Authentication** - Sistema completo de tokens
- **Role-based Access Control** - Roles: `musico`, `eventCreator`, `usuario`, `adminJunior`, `adminMidLevel`, `adminSenior`, `superAdmin`
- **Session Management** - Gestión de sesiones persistentes
- **Email Verification** - Verificación por email

#### 🎵 Gestión de Eventos
- **CRUD Completo** - Crear, leer, actualizar, eliminar eventos
- **Estado de Eventos** - `borrador`, `publicado`, `cancelado`, `completado`
- **Categorías** - Concierto, boda, culto, evento corporativo, festival
- **Búsqueda y Filtros** - Búsqueda avanzada por múltiples criterios

#### 🎼 Solicitudes de Músicos ✅ **COMPLETAMENTE IMPLEMENTADO**
- **CRUD Completo** - Crear, leer, actualizar, eliminar solicitudes
- **Estados de Solicitud** - `pendiente`, `asignada`, `cancelada`, `completada`, `no_asignada`
- **Aceptación Automática** - Primer músico que acepta se asigna automáticamente
- **Notificaciones en Tiempo Real** - Socket.IO para actualizaciones instantáneas
- **Endpoints Implementados**:
  - `POST /musician-requests` - Crear solicitud
  - `GET /musician-requests/:id` - Obtener solicitud por ID
  - `PUT /musician-requests/:id` - Actualizar solicitud
  - `DELETE /musician-requests/:id` - Eliminar solicitud
  - `GET /musician-requests/:id/status` - Consultar estado
  - `POST /musician-requests/accept` - Aceptar solicitud
  - `POST /musician-requests/cancel` - Cancelar solicitud

#### 🖼️ Gestión de Imágenes
- **AWS S3 Integration** - Almacenamiento en la nube (idriveE2)
- **Image Optimization** - Optimización automática de imágenes
- **CDN Support** - Distribución global de contenido
- **Multiple Formats** - Soporte para múltiples formatos de imagen

#### 🔔 Comunicación en Tiempo Real ✅ **IMPLEMENTADO**
- **Socket.IO Integration** - Comunicación instantánea
- **Real-time Notifications** - Notificaciones push
- **Live Chat** - Chat en tiempo real entre usuarios ✅
- **Connection Status** - Estados de conexión en vivo
- **Typing Indicators** - Indicadores de escritura ✅
- **Message Read Status** - Estado de mensajes leídos ✅
- **Private & Group Conversations** - Conversaciones privadas y grupales ✅

#### 📊 Sistema Administrativo
- **Admin Panel** - Panel de administración completo
- **User Management** - Gestión avanzada de usuarios
- **Event Management** - Gestión de eventos desde admin
- **Request Management** - Gestión de solicitudes de músicos
- **Analytics** - Métricas y estadísticas en tiempo real

### 🔄 Funcionalidades en Desarrollo

#### 🔍 Búsqueda y Filtros Avanzados
- **Search Endpoints** - Búsqueda por texto libre
- **Filter by Status** - Filtrado por estado de solicitud
- **Filter by Instrument** - Filtrado por instrumento
- **Date Range Filtering** - Filtrado por rango de fechas
- **Advanced Queries** - Consultas complejas con múltiples criterios

#### 📈 Analytics y Reportes
- **Usage Analytics** - Estadísticas de uso
- **Performance Metrics** - Métricas de rendimiento
- **User Behavior** - Análisis de comportamiento de usuarios
- **Event Statistics** - Estadísticas de eventos

#### 🔐 Seguridad Avanzada
- **Rate Limiting** - Limitación de velocidad de requests
- **Input Validation** - Validación robusta de entradas
- **SQL Injection Protection** - Protección contra inyección SQL
- **XSS Protection** - Protección contra XSS

## 🛠️ Tecnologías Utilizadas

### Backend Stack
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **Firebase Firestore** - Base de datos NoSQL
- **JWT** - Autenticación con tokens
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

## 📡 Endpoints Principales

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

### 💬 Chat y Comunicación (`/chat`)
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

### Eventos de Chat
- `message_sent` - Mensaje enviado
- `message_received` - Mensaje recibido
- `typing_start` - Usuario empezó a escribir
- `typing_stop` - Usuario dejó de escribir

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Firebase
- Cuenta de AWS S3 (opcional)

### Pasos de Instalación
1. **Clonar repositorio**
2. **Instalar dependencias** - `npm install`
3. **Configurar variables de entorno** - Copiar `ENV_example.ts` a `ENV.ts`
4. **Compilar TypeScript** - `npm run build`
5. **Iniciar servidor** - `npm start`

### URLs de Acceso
- **API Base**: `http://localhost:1000`
- **Swagger UI**: `http://localhost:1000/api-docs`
- **Redoc**: `http://localhost:1000/redoc`

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
5. **Documentación** - Validar Swagger UI

## 📊 Métricas del Proyecto

### Código
- **Líneas de código**: ~5,000+
- **Archivos TypeScript**: ~50
- **Endpoints API**: ~30
- **Eventos Socket.IO**: ~15

### Funcionalidades
- **CRUDs completos**: 4 (usuarios, eventos, solicitudes, imágenes)
- **Sistemas de autenticación**: 1 (JWT)
- **Integraciones externas**: 3 (Firebase, AWS S3, Email)
- **Documentación**: 8 archivos detallados

### Estado de Implementación
- **Autenticación**: 100% ✅
- **Eventos**: 100% ✅
- **Solicitudes de Músicos**: 100% ✅
- **Imágenes**: 100% ✅
- **Administración**: 100% ✅
- **Socket.IO**: 100% ✅
- **Documentación**: 100% ✅

## 🔄 Roadmap

### Fase 1: Core Features ✅ COMPLETADO
- [x] Autenticación JWT
- [x] CRUD de usuarios
- [x] CRUD de eventos
- [x] CRUD de solicitudes de músicos
- [x] CRUD de imágenes
- [x] Sistema administrativo
- [x] Socket.IO básico
- [x] Documentación completa

### Fase 2: Advanced Features 🚧 EN DESARROLLO
- [ ] Búsqueda y filtros avanzados
- [ ] Analytics y reportes
- [ ] Notificaciones push
- [ ] Chat en tiempo real
- [ ] Geolocalización
- [ ] Pagos y facturación

### Fase 3: Optimization 🚧 PENDIENTE
- [ ] Caching con Redis
- [ ] Rate limiting
- [ ] Performance optimization
- [ ] Microservices architecture
- [ ] CI/CD pipeline
- [ ] Monitoring y logging

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

- **Documentación**: [docs/](./)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/APP_MussikOn_Express/issues)
- **Email**: soporte@mussikon.com

---

**Documentación actualizada al: $(date)**

**Última actualización**: CRUD de solicitudes de músicos completamente implementado ✅ 