# 📚 Documentación MusikOn API

> **Documentación completa y detallada del backend MusikOn**

## 📋 Índice de Documentación

### 🎯 Documentación Principal
- **[API Documentation UI](./API_DOCUMENTATION_UI.md)** - Documentación completa de endpoints con ejemplos
- **[Executive Summary](./EXECUTIVE_SUMMARY.md)** - Resumen ejecutivo del proyecto
- **[Deployment Guide](./DEPLOYMENT.md)** - Guía completa de despliegue

### 🔧 APIs Específicas
- **[Events API](./EVENTS_API.md)** - Gestión completa de eventos ✅ **IMPLEMENTADO**
- **[Images API](./IMAGES_API.md)** - Gestión de imágenes con idriveE2 ✅ **IMPLEMENTADO**
- **[Musician Requests API](./MUSICIAN_REQUESTS_API.md)** - CRUD de solicitudes de músicos ✅ **IMPLEMENTADO**
- **[Chat System](./CHAT_SYSTEM.md)** - Sistema de chat en tiempo real ✅ **IMPLEMENTADO**
- **[Admin System](./ADMIN_SYSTEM.md)** - Sistema administrativo ✅ **IMPLEMENTADO**

### 🔗 Integración y Desarrollo
- **[Frontend Integration](./FRONTEND_INTEGRATION.md)** - Integración con frontend ✅ **IMPLEMENTADO**
- **[Error Handling](./ERROR_HANDLING.md)** - Manejo de errores y debugging ✅ **IMPLEMENTADO**
- **[Security](./SECURITY.md)** - Seguridad y autenticación ✅ **IMPLEMENTADO**

## 🚀 Estado Actual del Proyecto

### ✅ Funcionalidades Implementadas

#### 🔐 Autenticación y Autorización
- **JWT Authentication** - Sistema completo de tokens
- **Role-based Access Control** - Roles: `musico`, `eventCreator`, `usuario`, `adminJunior`, `adminMidLevel`, `adminSenior`, `superAdmin`
- **Session Management** - Gestión de sesiones persistentes
- **Email Verification** - Verificación por email
- **Google OAuth** - Autenticación con Google ✅ **IMPLEMENTADO**

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

#### 💬 Sistema de Chat en Tiempo Real ✅ **COMPLETAMENTE IMPLEMENTADO**
- **Chat Privado y Grupal** - Conversaciones entre usuarios y grupos
- **Mensajes en Tiempo Real** - Socket.IO para comunicación instantánea
- **Tipos de Mensaje** - Texto, imagen, audio, archivo
- **Indicadores de Escritura** - Mostrar cuando alguien está escribiendo
- **Estado de Mensajes** - Enviado, entregado, leído
- **Notificaciones Push** - Alertas para mensajes nuevos
- **Historial Persistente** - Mensajes guardados en base de datos
- **Endpoints Implementados**:
  - `POST /chat/conversations` - Crear conversación
  - `GET /chat/conversations` - Obtener conversaciones
  - `GET /chat/conversations/:id` - Obtener conversación específica
  - `GET /chat/conversations/:id/messages` - Obtener mensajes
  - `PUT /chat/conversations/:id/messages/read` - Marcar como leído

#### 🖼️ Sistema de Imágenes CRUD ✅ **COMPLETAMENTE IMPLEMENTADO**
- **idriveE2 Integration** - Almacenamiento en la nube (AWS S3 compatible)
- **URLs Firmadas** - Acceso seguro y temporal a imágenes
- **Categorización** - Perfil, post, evento, galería, administración
- **Metadatos Avanzados** - Descripción, etiquetas, visibilidad
- **Control de Acceso** - Permisos granulares por usuario y rol
- **Optimización Automática** - Procesamiento de imágenes
- **Estadísticas en Tiempo Real** - Métricas del sistema de imágenes
- **Limpieza Automática** - Eliminación de imágenes expiradas
- **Endpoints Implementados**:
  - `POST /images/upload` - Subir imagen
  - `GET /images` - Listar imágenes con filtros
  - `GET /images/:id` - Obtener imagen por ID
  - `PUT /images/:id` - Actualizar metadatos
  - `DELETE /images/:id` - Eliminar imagen
  - `GET /images/stats` - Estadísticas del sistema
  - `POST /images/cleanup` - Limpiar imágenes expiradas
  - `GET /images/profile/:userId` - Imágenes de perfil
  - `GET /images/posts` - Imágenes de posts
  - `GET /images/events` - Imágenes de eventos

#### 🔔 Comunicación en Tiempo Real ✅ **IMPLEMENTADO**
- **Socket.IO Integration** - Comunicación instantánea
- **Real-time Notifications** - Notificaciones push
- **Live Chat** - Chat en tiempo real entre usuarios ✅
- **Connection Status** - Estados de conexión en vivo
- **Typing Indicators** - Indicadores de escritura ✅
- **Message Read Status** - Estado de mensajes leídos ✅
- **Private & Group Conversations** - Conversaciones privadas y grupales ✅
- **Image Upload Events** - Notificaciones de subida de imágenes ✅

#### 📊 Sistema Administrativo ✅ **IMPLEMENTADO**
- **Admin Panel** - Panel de administración completo
- **User Management** - Gestión avanzada de usuarios
- **Event Management** - Gestión de eventos desde admin
- **Request Management** - Gestión de solicitudes de músicos
- **Image Management** - Gestión completa de imágenes
- **Analytics** - Métricas y estadísticas en tiempo real

### 🔄 Funcionalidades en Desarrollo

#### 🔍 Búsqueda y Filtros Avanzados
- **Search Endpoints** - Búsqueda por texto libre
- **Filter by Status** - Filtrado por estado de solicitud
- **Filter by Instrument** - Filtrado por instrumento
- **Date Range Filtering** - Filtrado por rango de fechas
- **Advanced Queries** - Consultas complejas con múltiples criterios

#### 📱 Notificaciones Push Móviles
- **Push Notifications** - Notificaciones push para dispositivos móviles
- **Firebase Cloud Messaging** - Integración con FCM
- **Custom Notifications** - Notificaciones personalizadas por usuario

#### 💳 Sistema de Pagos
- **Payment Integration** - Integración con pasarelas de pago
- **Subscription Management** - Gestión de suscripciones
- **Payment History** - Historial de pagos
- **Refund Management** - Gestión de reembolsos

#### 📍 Geolocalización
- **Location Services** - Servicios de ubicación
- **Distance Calculation** - Cálculo de distancias
- **Nearby Events** - Eventos cercanos
- **Location-based Search** - Búsqueda por ubicación

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

### Frontend
- **React** - Biblioteca de UI
- **Material-UI** - Componentes de UI
- **TypeScript** - Tipado estático
- **Axios** - Cliente HTTP
- **Socket.IO Client** - Comunicación en tiempo real
- **Vite** - Build tool

### Documentación
- **Swagger/OpenAPI** - Documentación interactiva
- **Redoc** - Documentación legible
- **JSDoc** - Documentación de código

## 📊 Métricas del Proyecto

### Código
- **Líneas de código**: ~8,000+
- **Archivos TypeScript**: ~60
- **Endpoints API**: ~40
- **Eventos Socket.IO**: ~20

### Funcionalidades
- **CRUDs completos**: 5 (usuarios, eventos, solicitudes, chat, imágenes)
- **Sistemas de autenticación**: 2 (JWT, Google OAuth)
- **Integraciones externas**: 4 (Firebase, AWS S3, idriveE2, Email)
- **Documentación**: 13 archivos detallados

### Estado de Implementación
- **Autenticación**: 100% ✅
- **Eventos**: 100% ✅
- **Solicitudes de Músicos**: 100% ✅
- **Chat System**: 100% ✅
- **Sistema de Imágenes**: 100% ✅
- **Administración**: 100% ✅
- **Socket.IO**: 100% ✅
- **Frontend Integration**: 100% ✅
- **Documentación**: 100% ✅

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

### Contacto
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/APP_MussikOn_Express/issues)
- **Email**: soporte@mussikon.com

---

**Última actualización**: Sistema de imágenes CRUD con idriveE2 completamente implementado ✅

**Documentación actualizada al**: $(date) 