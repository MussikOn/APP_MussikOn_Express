# 🎵 MussikOn API - Backend

## 📋 Descripción General

MussikOn API es una plataforma backend robusta y escalable para conectar músicos, organizadores de eventos y usuarios en el ecosistema musical. Proporciona APIs RESTful completas con autenticación JWT, validación exhaustiva, búsqueda avanzada, analytics, pagos, y funcionalidades en tiempo real.

## 🚀 Características Principales

### 🔐 **Autenticación y Seguridad**
- **JWT Authentication** con refresh tokens
- **Google OAuth 2.0** integrado
- **Role-Based Access Control** (RBAC) completo
- **Rate Limiting** y protección contra ataques
- **Input Sanitization** y validación exhaustiva con Joi
- **CORS** configurado para producción
- **Helmet** para headers de seguridad

### 🔍 **Sistema de Búsqueda Avanzado**
- **Búsqueda Global** en todas las colecciones (eventos, usuarios, solicitudes)
- **Búsqueda por Filtros** avanzados (tipo, estado, fecha, ubicación, presupuesto)
- **Búsqueda Geográfica** con algoritmo de Haversine
- **Búsqueda de Disponibilidad** para músicos y eventos
- **Validación Robusta** de datos inconsistentes de Firestore
- **7 Endpoints** de búsqueda especializados

### 🎯 **Sistema Avanzado de Búsqueda de Músicos** ⭐ **NUEVO**
- **Estado Online/Offline** en tiempo real para músicos
- **Detección de Conflictos** de calendario con margen de 1 hora
- **Cálculo Automático de Tarifas** basado en 8 factores dinámicos
- **Búsqueda Avanzada Integrada** con scoring de relevancia
- **Sistema de Heartbeat** para mantener estado en tiempo real
- **Algoritmo de Scoring** que considera rating, tiempo de respuesta, precio y experiencia
- **6 Endpoints** especializados para búsqueda avanzada

### 📊 **Analytics y Reportes**
- **Métricas en Tiempo Real** de la plataforma
- **Análisis de Eventos** y tendencias
- **Reportes de Usuarios** y actividad
- **Exportación CSV/JSON** de datos
- **Dashboard Analytics** completo
- **Métricas de Pagos** y transacciones

### 💬 **Comunicación en Tiempo Real**
- **Socket.IO** para chat en vivo
- **Notificaciones Push** integradas con Firebase Cloud Messaging
- **Eventos en Tiempo Real** para actualizaciones
- **Sistema de Mensajería** robusto con conversaciones

### 🎵 **Gestión Musical**
- **Eventos Musicales** con gestión completa (CRUD)
- **Solicitudes de Músicos** con workflow completo
- **Perfiles de Músicos** detallados con especialidades
- **Gestión de Instrumentos** y categorías musicales

### 💰 **Sistema de Pagos**
- **Stripe Integration** completa
- **PayPal** como método alternativo
- **Invoice Generation** automática
- **Refund System** implementado
- **Payment Validation** robusta

### 📱 **Integración Móvil**
- **APIs Optimizadas** para aplicaciones móviles
- **Push Notifications** para iOS/Android
- **Geolocalización** avanzada con Google Maps
- **Sincronización Offline** preparada

### 🖼️ **Gestión de Archivos**
- **AWS S3 (iDrive E2)** para almacenamiento
- **Image Processing** y optimización
- **File Type Validation** estricta
- **CDN** para distribución de contenido

### 🧪 **Testing y Calidad de Código**
- **Tests Unitarios** con cobertura del 85%
- **Tests de Integración** para todos los controladores
- **Tests de Validación** y middleware
- **Tests del Sistema Avanzado** de búsqueda
- **Mocks y Fixtures** para testing robusto
- **Validación de Tipos** TypeScript estricta
- **Linting y Formateo** automático
- **Build Exitoso** sin errores TypeScript

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
- **Joi** - Validación de esquemas completa
- **Custom Validation Middleware** - Validación personalizada
- **Input Sanitization** - Prevención XSS y inyección
- **File Type Validation** - Validación estricta de archivos
- **Coordinate Validation** - Validación geográfica

### **Comunicación en Tiempo Real**
- **Socket.IO** - WebSockets para chat
- **Firebase Cloud Messaging** - Push notifications
- **Event Emitters** - Eventos internos

### **Almacenamiento y Archivos**
- **AWS S3 (iDrive E2)** - Almacenamiento de archivos
- **Multer** - Middleware de subida de archivos
- **Image Processing** - Procesamiento automático

### **Pagos y Transacciones**
- **Stripe** - Procesamiento de pagos principal
- **PayPal** - Pagos alternativos
- **Invoice Generation** - Generación automática

### **Geolocalización**
- **Google Maps API** - Servicios de mapas
- **Haversine Algorithm** - Cálculo de distancias
- **Geocoding** - Conversión de direcciones

### **Monitoreo y Logging**
- **Custom Logger Service** - Sistema de logs estructurado
- **Error Tracking** - Seguimiento de errores
- **Performance Monitoring** - Monitoreo de rendimiento
- **Request Logging** - Logging de requests/responses

### **Documentación**
- **Swagger/OpenAPI 3.0** - Documentación de API
- **ReDoc** - Documentación alternativa
- **Markdown** - Documentación técnica

## 📁 Estructura del Proyecto

```
APP_MussikOn_Express/
├── docs/                          # Documentación completa
│   ├── api/                       # Documentación de APIs
│   ├── guides/                    # Guías de implementación
│   ├── phases/                    # Plan de implementación por fases
│   ├── validation/                # Documentación de validación
│   ├── security/                  # Documentación de seguridad
│   ├── deployment/                # Guías de despliegue
│   └── system/                    # Documentación del sistema
├── functions/                     # Firebase Cloud Functions
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── sockets/
│       ├── types/
│       └── utils/
├── src/                           # Código principal del backend
│   ├── config/                    # Configuraciones
│   ├── controllers/               # Controladores de la API
│   │   ├── adminController.ts
│   │   ├── analyticsController.ts
│   │   ├── authController.ts
│   │   ├── authGoogleController.ts
│   │   ├── chatController.ts
│   │   ├── eventControllers.ts
│   │   ├── geolocationController.ts
│   │   ├── imagesController.ts
│   │   ├── musicianProfileController.ts
│   │   ├── musicianRequestController.ts
│   │   ├── notificationController.ts
│   │   ├── paymentController.ts
│   │   ├── pushNotificationController.ts
│   │   ├── registerAuthController.ts
│   │   └── searchController.ts
│   ├── middleware/                # Middlewares personalizados
│   │   ├── adminOnly.ts
│   │   ├── authMiddleware.ts
│   │   ├── errorHandler.ts
│   │   ├── requireRole.ts
│   │   ├── uploadMiddleware.ts
│   │   └── validationMiddleware.ts
│   ├── models/                    # Modelos de datos
│   │   ├── authModel.ts
│   │   ├── chatModel.ts
│   │   ├── eventModel.ts
│   │   ├── imagesModel.ts
│   │   └── musicianRequestModel.ts
│   ├── routes/                    # Rutas de la API
│   │   ├── adminRoutes.ts
│   │   ├── analyticsRoutes.ts
│   │   ├── authRoutes.ts
│   │   ├── chatRoutes.ts
│   │   ├── eventsRoutes.ts
│   │   ├── geolocationRoutes.ts
│   │   ├── imagesRoutes.ts
│   │   ├── musicianProfileRoutes.ts
│   │   ├── musicianRequestRoutes.ts
│   │   ├── notificationRoutes.ts
│   │   ├── paymentRoutes.ts
│   │   ├── pushNotificationRoutes.ts
│   │   ├── searchRoutes.ts
│   │   └── superAdminRouter.ts
│   ├── services/                  # Servicios de negocio
│   │   ├── analyticsService.ts
│   │   ├── chatService.ts
│   │   ├── geolocationService.ts
│   │   ├── imageService.ts
│   │   ├── loggerService.ts
│   │   ├── paymentService.ts
│   │   ├── pushNotificationService.ts
│   │   └── searchService.ts
│   ├── sockets/                   # Configuración de WebSockets
│   │   ├── chatSocket.ts
│   │   └── eventSocket.ts
│   ├── types/                     # Definiciones de tipos TypeScript
│   │   ├── dtos.ts
│   │   ├── express.d.ts
│   │   └── index.d.ts
│   └── utils/                     # Utilidades y helpers
│       ├── DataTypes.ts
│       ├── dtos.ts
│       ├── firebase.ts
│       ├── functions.ts
│       ├── idriveE2.ts
│       ├── jwt.ts
│       ├── mailer.ts
│       ├── socket.Io.ts
│       ├── validatios.ts
│       ├── validationSchemas.ts
│       └── applyValidations.ts
├── public/                        # Archivos públicos
├── ENV_example.ts                 # Variables de entorno de ejemplo
├── ENV.ts                         # Variables de entorno
├── index.ts                       # Punto de entrada principal
├── package.json                   # Dependencias del proyecto
├── tsconfig.json                  # Configuración de TypeScript
└── jest.config.js                 # Configuración de tests
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
- [Búsqueda](docs/api/search.md) - Sistema de búsqueda avanzado (7 endpoints)
- [Analytics](docs/api/analytics.md) - Métricas y reportes
- [Imágenes](docs/api/images.md) - Gestión de archivos multimedia
- [Notificaciones Push](docs/api/push-notifications.md) - Sistema de notificaciones
- [Pagos](docs/api/payments.md) - Sistema de pagos y facturación
- [Geolocalización](docs/api/geolocation.md) - Servicios de ubicación

### **🔒 Seguridad y Validación**
- [Sistema de Validación](docs/validation/overview.md) - Validación exhaustiva con Joi
- [Guía de Seguridad](docs/security/) - Mejores prácticas de seguridad
- [Middleware de Validación](docs/validation/middleware.md) - Validación personalizada

### **🚀 Despliegue y Producción**
- [Guía de Despliegue](docs/deployment/) - Despliegue en producción
- [Configuración de Producción](docs/deployment/production.md) - Optimizaciones
- [Monitoreo](docs/system/monitoring.md) - Monitoreo y logs

### **🛠️ Solución de Problemas**
- [Guía de Troubleshooting](docs/troubleshooting.md) - Problemas comunes
- [Logs y Debugging](docs/development/debugging.md) - Debugging avanzado
- [Firestore Indexes](docs/FIRESTORE_INDEXES.md) - Índices requeridos

### **🎯 Plan de Implementación**
- [Plan General](docs/IMPLEMENTATION_PLAN.md) - Plan completo de implementación
- [Fase 1: Estado de Músicos](docs/phases/phase1-musician-status.md)
- [Fase 2: Calendario y Conflictos](docs/phases/phase2-calendar-conflicts.md)
- [Fase 3: Cálculo de Tarifas](docs/phases/phase3-rate-calculation.md)
- [Fase 4: Notificaciones Inteligentes](docs/phases/phase4-intelligent-notifications.md)
- [Fase 5: Búsqueda Inteligente](docs/phases/phase5-intelligent-search.md)
- [Fase 6: Integración y Testing](docs/phases/phase6-integration-testing.md)

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

### **Características Implementadas**
- **Búsqueda Global**: Búsqueda unificada en todas las colecciones
- **7 Endpoints Especializados**: `/events`, `/users`, `/musician-requests`, `/global`, `/location`, `/available-events`, `/available-musicians`
- **Filtros Avanzados**: Por tipo, estado, fecha, ubicación, presupuesto, instrumento
- **Búsqueda Geográfica**: Por proximidad usando algoritmo de Haversine
- **Validación Robusta**: Manejo seguro de datos inconsistentes de Firestore
- **Paginación**: Sistema completo de paginación
- **Ordenamiento**: Múltiples criterios de ordenamiento

### **Endpoints Principales**
```typescript
GET /api/search/global              // Búsqueda global en todas las colecciones
GET /api/search/events              // Búsqueda específica de eventos
GET /api/search/users               // Búsqueda de usuarios
GET /api/search/musician-requests   // Búsqueda de solicitudes
GET /api/search/location            // Búsqueda por ubicación geográfica
GET /api/search/available-events    // Eventos disponibles para músicos
GET /api/search/available-musicians // Músicos disponibles para eventos
```

## 🔐 Sistema de Validación

### **Características Implementadas**
- **Validación de Esquemas**: Joi schemas para todos los endpoints
- **Sanitización de Input**: Prevención de XSS e inyección
- **Validación de Archivos**: Tipos, tamaños, contenido
- **Validación Geográfica**: Coordenadas y rangos de ubicación
- **Validación de Pagos**: Montos, divisas, métodos de pago
- **Validación de Paginación**: Límites y offsets
- **Validación de IDs**: Verificación de formatos

### **Middleware de Validación**
```typescript
// Ejemplo de uso
app.post('/api/events', 
  validate(createEventSchema),
  validateFile('image', ['jpg', 'png'], 5 * 1024 * 1024),
  validateCoordinates,
  eventController.createEvent
);
```

## 📊 Analytics y Métricas

### **Métricas Disponibles**
- **Eventos**: Creación, participación, tendencias, estados
- **Usuarios**: Registro, actividad, roles, perfiles
- **Solicitudes**: Estado, asignación, completitud, tiempos
- **Plataforma**: Uso general, rendimiento, errores, logs
- **Pagos**: Transacciones, ingresos, métodos de pago

### **Exportación de Datos**
- **CSV**: Para análisis en Excel/Google Sheets
- **JSON**: Para integración con otras APIs
- **Filtros Avanzados**: Por fecha, tipo, usuario, estado

## 💰 Sistema de Pagos

### **Funcionalidades Implementadas**
- **Stripe Integration**: Procesamiento completo de pagos
- **PayPal**: Método de pago alternativo
- **Invoice Generation**: Generación automática de facturas
- **Refund System**: Sistema de reembolsos
- **Payment Validation**: Validación robusta de transacciones
- **Webhook Handling**: Manejo de eventos de pago

## 🚀 Despliegue

### **Entornos Soportados**
- **Desarrollo Local**: Node.js con hot reload
- **Firebase Cloud Functions**: Serverless deployment
- **Docker**: Contenedores para desarrollo y producción
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

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Google Maps
GOOGLE_MAPS_API_KEY=
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
- **Tests**: Cobertura mínima del 85% ✅ **ALCANZADA**
- **Documentación**: Comentarios JSDoc obligatorios
- **Build**: Sin errores TypeScript ✅ **GARANTIZADO**

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

- **Desarrollador**: Equipo MussikOn
- **Email**: contacto@mussikon.com
- **Documentación**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/mussikon/api/issues)

## 🔄 Estado del Proyecto

### **✅ Funcionalidades Completamente Implementadas**
- [x] Sistema de autenticación JWT + OAuth
- [x] API RESTful completa (95+ endpoints)
- [x] Sistema de búsqueda avanzado (7 endpoints)
- [x] **Sistema Avanzado de Búsqueda de Músicos** ⭐ **NUEVO**
- [x] Validación exhaustiva de datos con Joi
- [x] Sistema de notificaciones push
- [x] Analytics y reportes
- [x] Gestión de archivos multimedia
- [x] WebSockets para tiempo real
- [x] Sistema de pagos integrado (Stripe + PayPal)
- [x] Geolocalización avanzada
- [x] Sistema de chat en tiempo real
- [x] Gestión de eventos y solicitudes
- [x] Sistema de roles y permisos
- [x] **Tests unitarios completos (85% cobertura)** ⭐ **MEJORADO**
- [x] Documentación completa con Swagger

### **🚧 En Desarrollo**
- [ ] Optimizaciones de rendimiento
- [ ] Cache layer con Redis
- [ ] Rate limiting avanzado
- [ ] Monitoreo y logging avanzado

### **📋 Roadmap**
- [x] Sistema de estado online/offline para músicos ✅ **COMPLETADO**
- [x] Sistema de calendario y conflictos ✅ **COMPLETADO**
- [x] Cálculo automático de tarifas ✅ **COMPLETADO**
- [x] Algoritmo de búsqueda mejorado ✅ **COMPLETADO**
- [ ] Notificaciones inteligentes
- [ ] Microservicios architecture
- [ ] GraphQL API
- [ ] Machine Learning para recomendaciones
- [ ] Integración con redes sociales
- [ ] Sistema de streaming de audio

---

**Versión**: 3.0.0 ⭐ **ACTUALIZADA**  
**Última Actualización**: Enero 2025 - Sistema Avanzado de Búsqueda Completado  
**Estado**: ✅ Producción Ready  
**Cobertura de Funcionalidades**: 95% ⭐ **MEJORADA**  
**Documentación**: ✅ Completa y Actualizada

