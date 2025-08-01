# 🎵 MussikOn API - Backend

## 📋 Descripción General

MussikOn API es una plataforma backend robusta y escalable para conectar músicos, organizadores de eventos y usuarios en el ecosistema musical. Proporciona APIs RESTful completas con autenticación JWT, validación exhaustiva, búsqueda avanzada, y funcionalidades en tiempo real.

## 🚀 Características Principales

### 🔐 **Autenticación y Seguridad**
- **JWT Authentication** con refresh tokens
- **Google OAuth 2.0** integrado
- **Role-Based Access Control** (RBAC)
- **Rate Limiting** y protección contra ataques
- **Input Sanitization** y validación exhaustiva
- **CORS** configurado para producción

### 🔍 **Sistema de Búsqueda Avanzado**
- **Búsqueda Global** en todas las colecciones
- **Búsqueda por Filtros** (eventos, usuarios, solicitudes)
- **Búsqueda Geográfica** con algoritmos de proximidad
- **Búsqueda de Disponibilidad** para músicos y eventos
- **Validación Robusta** de datos de entrada

### 📊 **Analytics y Reportes**
- **Métricas en Tiempo Real** de la plataforma
- **Análisis de Eventos** y tendencias
- **Reportes de Usuarios** y actividad
- **Exportación CSV/JSON** de datos
- **Dashboard Analytics** completo

### 💬 **Comunicación en Tiempo Real**
- **Socket.IO** para chat en vivo
- **Notificaciones Push** integradas
- **Eventos en Tiempo Real** para actualizaciones
- **Sistema de Mensajería** robusto

### 🎵 **Gestión Musical**
- **Eventos Musicales** con gestión completa
- **Solicitudes de Músicos** con workflow
- **Perfiles de Músicos** detallados
- **Gestión de Instrumentos** y especialidades

### 📱 **Integración Móvil**
- **APIs Optimizadas** para aplicaciones móviles
- **Push Notifications** para iOS/Android
- **Geolocalización** avanzada
- **Sincronización Offline**

## 🛠️ Stack Tecnológico

### **Backend Core**
- **Node.js** (v18+) - Runtime de JavaScript
- **Express.js** (v4.18+) - Framework web
- **TypeScript** (v5+) - Tipado estático
- **Firebase Firestore** - Base de datos NoSQL
- **Firebase Admin SDK** - Autenticación y servicios

### **Autenticación y Seguridad**
- **JWT** (jsonwebtoken) - Tokens de autenticación
- **bcrypt** - Hashing de contraseñas
- **Google OAuth 2.0** - Autenticación social
- **Helmet** - Headers de seguridad
- **CORS** - Cross-Origin Resource Sharing

### **Validación y Sanitización**
- **Joi** - Validación de esquemas
- **Custom Validation Middleware** - Validación personalizada
- **Input Sanitization** - Prevención XSS
- **File Type Validation** - Validación de archivos

### **Comunicación en Tiempo Real**
- **Socket.IO** - WebSockets
- **Push Notifications** - Notificaciones móviles
- **Event Emitters** - Eventos internos

### **Almacenamiento y Archivos**
- **AWS S3 (iDrive E2)** - Almacenamiento de archivos
- **Multer** - Middleware de subida de archivos
- **Image Processing** - Procesamiento de imágenes

### **Pagos y Transacciones**
- **Stripe** - Procesamiento de pagos
- **PayPal** - Pagos alternativos
- **Invoice Generation** - Generación de facturas

### **Geolocalización**
- **Google Maps API** - Servicios de mapas
- **Haversine Algorithm** - Cálculo de distancias
- **Geocoding** - Conversión de direcciones

### **Monitoreo y Logging**
- **Custom Logger Service** - Sistema de logs
- **Error Tracking** - Seguimiento de errores
- **Performance Monitoring** - Monitoreo de rendimiento

## 📁 Estructura del Proyecto

```
src/
├── config/                 # Configuraciones
│   └── ENV.ts             # Variables de entorno
├── controllers/           # Controladores de la API
│   ├── adminController.ts
│   ├── analyticsController.ts
│   ├── authController.ts
│   ├── chatController.ts
│   ├── eventControllers.ts
│   ├── imagesController.ts
│   ├── musicianProfileController.ts
│   ├── musicianRequestController.ts
│   ├── notificationController.ts
│   ├── paymentController.ts
│   ├── pushNotificationController.ts
│   ├── registerAuthController.ts
│   └── searchController.ts
├── middleware/            # Middlewares personalizados
│   ├── adminOnly.ts
│   ├── authMiddleware.ts
│   ├── errorHandler.ts
│   ├── requireRole.ts
│   ├── uploadMiddleware.ts
│   └── validationMiddleware.ts
├── models/               # Modelos de datos
│   ├── authModel.ts
│   ├── chatModel.ts
│   ├── eventModel.ts
│   ├── imagesModel.ts
│   └── musicianRequestModel.ts
├── routes/               # Rutas de la API
│   ├── adminRoutes.ts
│   ├── analyticsRoutes.ts
│   ├── authRoutes.ts
│   ├── chatRoutes.ts
│   ├── eventsRoutes.ts
│   ├── geolocationRoutes.ts
│   ├── imagesRoutes.ts
│   ├── musicianProfileRoutes.ts
│   ├── musicianRequestRoutes.ts
│   ├── notificationRoutes.ts
│   ├── paymentRoutes.ts
│   ├── pushNotificationRoutes.ts
│   ├── searchRoutes.ts
│   └── superAdminRouter.ts
├── services/             # Servicios de negocio
│   ├── analyticsService.ts
│   ├── chatService.ts
│   ├── geolocationService.ts
│   ├── imageService.ts
│   ├── loggerService.ts
│   ├── paymentService.ts
│   ├── pushNotificationService.ts
│   └── searchService.ts
├── sockets/              # Configuración de WebSockets
│   ├── chatSocket.ts
│   └── eventSocket.ts
├── types/                # Definiciones de tipos TypeScript
│   ├── dtos.ts
│   ├── express.d.ts
│   └── index.d.ts
├── utils/                # Utilidades y helpers
│   ├── DataTypes.ts
│   ├── dtos.ts
│   ├── firebase.ts
│   ├── functions.ts
│   ├── idriveE2.ts
│   ├── jwt.ts
│   ├── mailer.ts
│   ├── socket.Io.ts
│   ├── validatios.ts
│   ├── validationSchemas.ts
│   └── applyValidations.ts
└── index.ts              # Punto de entrada de la aplicación
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js (v18 o superior)
- npm o yarn
- Cuenta de Firebase
- Cuenta de AWS S3 (iDrive E2)
- Cuenta de Stripe (opcional)
- Cuenta de Google Cloud (opcional)

### **Instalación**

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

4. **Configurar Firebase**
```bash
# Descargar service account key de Firebase Console
# Colocar en la raíz del proyecto como 'serviceAccountKey.json'
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

6. **Ejecutar en producción**
```bash
npm run build
npm start
```

## 📚 Documentación Completa

### **📖 Guías de Instalación y Configuración**
- [Guía de Instalación](docs/guides/installation.md) - Instalación paso a paso
- [Guía de Configuración](docs/guides/configuration.md) - Configuración de servicios
- [Guía de Desarrollo](docs/development/) - Desarrollo y contribución

### **🔌 APIs y Endpoints**
- [Autenticación](docs/api/authentication.md) - JWT, OAuth, RBAC
- [Eventos](docs/api/events.md) - Gestión de eventos musicales
- [Solicitudes de Músicos](docs/api/musician-requests.md) - Workflow de solicitudes
- [Búsqueda](docs/api/search.md) - Sistema de búsqueda avanzado
- [Analytics](docs/api/analytics.md) - Métricas y reportes
- [Imágenes](docs/api/images.md) - Gestión de archivos multimedia
- [Notificaciones Push](docs/api/push-notifications.md) - Sistema de notificaciones

### **🔒 Seguridad y Validación**
- [Sistema de Validación](docs/validation/overview.md) - Validación exhaustiva
- [Guía de Seguridad](docs/security/) - Mejores prácticas de seguridad
- [Middleware de Validación](docs/validation/middleware.md) - Validación personalizada

### **🚀 Despliegue y Producción**
- [Guía de Despliegue](docs/deployment/) - Despliegue en producción
- [Configuración de Producción](docs/deployment/production.md) - Optimizaciones
- [Monitoreo](docs/system/monitoring.md) - Monitoreo y logs

### **🛠️ Solución de Problemas**
- [Guía de Troubleshooting](docs/troubleshooting.md) - Problemas comunes
- [Logs y Debugging](docs/development/debugging.md) - Debugging avanzado

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con hot reload
npm run build        # Compilar TypeScript
npm run start        # Servidor de producción

# Linting y Formateo
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores de linting automáticamente
npm run format       # Formatear código con Prettier

# Testing
npm run test         # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con cobertura

# Utilidades
npm run clean        # Limpiar archivos generados
npm run docs         # Generar documentación
```

## 🔍 Sistema de Búsqueda

### **Características**
- **Búsqueda Global**: Búsqueda unificada en todas las colecciones
- **Filtros Avanzados**: Por tipo, estado, fecha, ubicación, etc.
- **Búsqueda Geográfica**: Por proximidad usando algoritmos de distancia
- **Búsqueda de Disponibilidad**: Músicos disponibles para eventos
- **Validación Robusta**: Manejo seguro de datos inconsistentes

### **Endpoints Principales**
```typescript
GET /api/search/global          // Búsqueda global
GET /api/search/events          // Búsqueda de eventos
GET /api/search/users           // Búsqueda de usuarios
GET /api/search/musician-requests // Búsqueda de solicitudes
GET /api/search/location        // Búsqueda por ubicación
```

## 🔐 Sistema de Validación

### **Características**
- **Validación de Esquemas**: Joi schemas para todos los endpoints
- **Sanitización de Input**: Prevención de XSS y inyección
- **Validación de Archivos**: Tipos, tamaños, contenido
- **Validación Geográfica**: Coordenadas y rangos de ubicación
- **Validación de Pagos**: Montos, divisas, métodos de pago

### **Middleware de Validación**
```typescript
// Ejemplo de uso
app.post('/api/events', 
  validate(createEventSchema),
  validateFile('image', ['jpg', 'png'], 5 * 1024 * 1024),
  eventController.createEvent
);
```

## 📊 Analytics y Métricas

### **Métricas Disponibles**
- **Eventos**: Creación, participación, tendencias
- **Usuarios**: Registro, actividad, roles
- **Solicitudes**: Estado, asignación, completitud
- **Plataforma**: Uso general, rendimiento, errores

### **Exportación de Datos**
- **CSV**: Para análisis en Excel/Google Sheets
- **JSON**: Para integración con otras APIs
- **Filtros Avanzados**: Por fecha, tipo, usuario, etc.

## 🚀 Despliegue

### **Entornos Soportados**
- **Desarrollo Local**: Node.js con hot reload
- **Docker**: Contenedores para desarrollo y producción
- **Firebase Functions**: Serverless deployment
- **VPS/Cloud**: Despliegue tradicional con PM2

### **Variables de Entorno Requeridas**
```bash
# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# AWS S3 (iDrive E2)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=

# JWT
JWT_SECRET=
JWT_REFRESH_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe (opcional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

## 🤝 Contribución

### **Proceso de Contribución**
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### **Estándares de Código**
- **TypeScript**: Tipado estricto obligatorio
- **ESLint**: Reglas de linting configuradas
- **Prettier**: Formateo automático de código
- **Tests**: Cobertura mínima del 80%

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

- **Desarrollador**: Equipo MussikOn
- **Email**: contacto@mussikon.com
- **Documentación**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/mussikon/api/issues)

## 🔄 Estado del Proyecto

### **✅ Funcionalidades Completadas**
- [x] Sistema de autenticación JWT + OAuth
- [x] API RESTful completa
- [x] Sistema de búsqueda avanzado
- [x] Validación exhaustiva de datos
- [x] Sistema de notificaciones push
- [x] Analytics y reportes
- [x] Gestión de archivos multimedia
- [x] WebSockets para tiempo real
- [x] Sistema de pagos integrado
- [x] Geolocalización avanzada

### **🚧 En Desarrollo**
- [ ] Tests unitarios completos
- [ ] Documentación de API con Swagger
- [ ] Optimizaciones de rendimiento
- [ ] Cache layer con Redis

### **📋 Roadmap**
- [ ] Microservicios architecture
- [ ] GraphQL API
- [ ] Machine Learning para recomendaciones
- [ ] Integración con redes sociales
- [ ] Sistema de streaming de audio

---

**Versión**: 2.0.0  
**Última Actualización**: Diciembre 2024  
**Estado**: ✅ Producción Ready

