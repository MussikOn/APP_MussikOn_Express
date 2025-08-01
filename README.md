# 🎵 MussikOn API - Backend de Conectividad Musical

## 📋 Descripción

MussikOn es una API backend integral que conecta músicos con organizadores de eventos, facilitando la gestión completa del proceso desde la búsqueda hasta el pago. Esta es una **API pura de Node.js/Express** que proporciona funcionalidades avanzadas de búsqueda, geolocalización, pagos y comunicación en tiempo real.

> **⚠️ Importante**: Este proyecto es un **backend puro** sin código de frontend. Todo el código de React/React Native ha sido eliminado para mantener una arquitectura limpia de API.

## 🚀 Características Principales

### 🔐 Autenticación y Autorización
- **JWT Authentication**: Sistema robusto de autenticación con tokens JWT
- **Google OAuth**: Integración con Google para autenticación social
- **Role-Based Access Control**: Control de acceso basado en roles (user, musician, admin, super_admin)
- **Middleware de Seguridad**: Validación de tokens y permisos

### 🎯 Gestión de Eventos
- **CRUD Completo**: Crear, leer, actualizar y eliminar eventos
- **Búsqueda Avanzada**: Filtros por tipo, ubicación, fecha, presupuesto
- **Estados de Evento**: Seguimiento del ciclo de vida del evento
- **Imágenes y Multimedia**: Gestión de archivos con AWS S3

### 👥 Gestión de Usuarios
- **Perfiles de Músicos**: Información detallada, instrumentos, experiencia
- **Perfiles de Organizadores**: Historial de eventos y preferencias
- **Sistema de Roles**: Diferentes niveles de acceso y permisos
- **Verificación de Identidad**: Proceso de validación de usuarios

### 💰 Sistema de Pagos
- **Múltiples Métodos de Pago**: Tarjetas, cuentas bancarias, PayPal
- **Procesamiento de Pagos**: Intents, confirmaciones y reembolsos
- **Facturación**: Generación automática de invoices
- **Validación de Métodos**: Verificación de tarjetas y datos bancarios
- **Estadísticas de Pagos**: Reportes y análisis financieros

### 📍 Geolocalización Avanzada
- **Búsqueda por Proximidad**: Encontrar eventos y músicos cercanos
- **Optimización de Rutas**: Cálculo de rutas óptimas
- **Geocodificación**: Conversión de direcciones a coordenadas
- **Cálculo de Distancias**: Algoritmo de Haversine para distancias precisas
- **Filtros Geográficos**: Búsqueda por radio y ubicación

### 🔍 Búsqueda Inteligente
- **Búsqueda Global**: Búsqueda en toda la plataforma
- **Filtros Avanzados**: Múltiples criterios de búsqueda
- **Búsqueda por Ubicación**: Eventos y músicos por proximidad
- **Búsqueda de Disponibilidad**: Eventos disponibles para músicos
- **Ranking Inteligente**: Resultados ordenados por relevancia

### 📊 Analytics y Reportes
- **Métricas de Eventos**: Estadísticas de participación y éxito
- **Análisis de Usuarios**: Comportamiento y patrones de uso
- **Reportes de Pagos**: Análisis financiero y transacciones
- **Dashboard Administrativo**: Panel de control para administradores

### 💬 Sistema de Chat
- **Chat en Tiempo Real**: Comunicación instantánea entre usuarios
- **Salas de Chat**: Conversaciones grupales y privadas
- **Notificaciones**: Alertas en tiempo real
- **Historial de Mensajes**: Persistencia de conversaciones

## 🛠️ Tecnologías Utilizadas

### Backend (API Pura)
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **TypeScript** - Lenguaje de programación tipado
- **Firebase Firestore** - Base de datos NoSQL
- **Firebase Admin SDK** - Integración con servicios de Firebase
- **Socket.io** - Comunicación en tiempo real

### Autenticación y Seguridad
- **JWT** - JSON Web Tokens
- **Google OAuth 2.0** - Autenticación social
- **bcrypt** - Hashing de contraseñas
- **CORS** - Cross-Origin Resource Sharing

### Almacenamiento y Archivos
- **AWS S3 (iDrive E2)** - Almacenamiento de archivos
- **Multer** - Middleware para subida de archivos
- **Sharp** - Procesamiento de imágenes

### Documentación y Testing
- **Swagger/OpenAPI 3.0** - Documentación de API
- **Joi** - Validación de esquemas
- **Jest** - Framework de testing
- **ESLint** - Linting de código
- **Prettier** - Formateo de código

### Pagos y Transacciones
- **Stripe/PayPal Integration** - Procesamiento de pagos
- **Validación de Tarjetas** - Verificación de métodos de pago
- **Sistema de Facturación** - Generación de invoices

### Geolocalización
- **Algoritmo de Haversine** - Cálculo de distancias
- **Google Maps API** - Geocodificación y rutas
- **Índices Geoespaciales** - Búsqueda por proximidad

## 📁 Estructura del Proyecto

```
APP_MussikOn_Express/
├── src/
│   ├── config/                 # Configuraciones
│   ├── controllers/            # Controladores de la API
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
│   ├── middleware/             # Middlewares personalizados
│   │   ├── adminOnly.ts
│   │   ├── authMiddleware.ts
│   │   ├── errorHandler.ts
│   │   ├── requireRole.ts
│   │   ├── uploadMiddleware.ts
│   │   └── validationMiddleware.ts
│   ├── models/                 # Modelos de datos
│   │   ├── authModel.ts
│   │   ├── chatModel.ts
│   │   ├── eventModel.ts
│   │   ├── imagesModel.ts
│   │   └── musicianRequestModel.ts
│   ├── routes/                 # Rutas de la API
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
│   ├── services/               # Servicios de negocio
│   │   ├── analyticsService.ts
│   │   ├── chatService.ts
│   │   ├── geolocationService.ts
│   │   ├── imageService.ts
│   │   ├── loggerService.ts
│   │   ├── paymentService.ts
│   │   ├── pushNotificationService.ts
│   │   └── searchService.ts
│   ├── types/                  # Definiciones de tipos
│   │   ├── dtos.ts
│   │   ├── express.d.ts
│   │   └── index.d.ts
│   ├── utils/                  # Utilidades
│   │   ├── DataTypes.ts
│   │   ├── dtos.ts
│   │   ├── firebase.ts
│   │   ├── functions.ts
│   │   ├── idriveE2.ts
│   │   ├── jwt.ts
│   │   ├── mailer.ts
│   │   ├── socket.Io.ts
│   │   └── validatios.ts
│   └── sockets/                # WebSockets
│       ├── chatSocket.ts
│       └── eventSocket.ts
├── docs/                       # Documentación completa
├── functions/                  # Firebase Cloud Functions
├── dist/                       # Código compilado
├── public/                     # Archivos públicos
├── index.ts                    # Punto de entrada
├── package.json
├── tsconfig.json
└── README.md
```

> **🧹 Limpieza Completada**: Se eliminaron todos los directorios y archivos relacionados con React/React Native:
> - ❌ `src/components/` - Componentes de React
> - ❌ `src/hooks/` - Hooks de React  
> - ❌ `src/appTypes/` - Tipos específicos de React
> - ❌ `src/screens/` - Pantallas de React Native

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- Firebase CLI
- Cuenta de Firebase
- Cuenta de AWS S3 (iDrive E2)

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd APP_MussikOn_Express
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp ENV_example.ts ENV.ts
# Editar ENV.ts con tus credenciales
```

### 4. Configurar Firebase
```bash
firebase login
firebase init
```

### 5. Compilar el proyecto
```bash
npm run build
```

### 6. Ejecutar en desarrollo
```bash
npm run dev
```

## 📚 Documentación Completa

### 🔍 [Documentación Principal](./docs/README.md)
Documentación completa y organizada con navegación clara y búsqueda funcional.

### 📖 Guías Rápidas
- [🚀 Instalación](./docs/guides/installation.md) - Configuración en 5 minutos
- [🔧 Configuración](./docs/guides/configuration.md) - Configuración completa de servicios
- [🎨 Integración Frontend](./docs/guides/frontend-integration.md) - Guías de integración

### 🔧 APIs Específicas
- [🔐 Autenticación](./docs/api/authentication.md) - JWT, OAuth, roles
- [🎵 Eventos](./docs/api/events.md) - CRUD de eventos musicales
- [💰 Pagos](./docs/api/payments.md) - Stripe, facturación
- [📍 Geolocalización](./docs/api/geolocation.md) - Búsqueda por proximidad
- [🔍 Búsqueda](./docs/api/search.md) - Búsqueda avanzada
- [📊 Analytics](./docs/api/analytics.md) - Métricas y reportes

### 🛠️ Desarrollo
- [🏗️ Arquitectura](./docs/development/architecture.md) - Estructura del proyecto
- [🧪 Testing](./docs/development/testing.md) - Tests y debugging
- [📝 Documentación](./docs/development/api-documentation.md) - Swagger y ReDoc

### 🚀 Despliegue
- [☁️ Firebase](./docs/deployment/firebase.md) - Despliegue en Firebase
- [📊 Monitoreo](./docs/deployment/monitoring.md) - Logs y métricas

### 🔒 Seguridad
- [🛡️ Autenticación](./docs/security/authentication.md) - JWT y OAuth
- [🔒 Validación](./docs/validation/overview.md) - Sistema de validación

### 📱 Documentación Interactiva
- **Swagger UI**: `http://localhost:3001/api-docs`
- **ReDoc**: `http://localhost:3001/redoc`

### Endpoints Principales

#### 🔐 Autenticación
- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Inicio de sesión
- `POST /auth/google` - Autenticación con Google
- `POST /auth/refresh` - Renovar token

#### 🎯 Eventos
- `GET /events` - Listar eventos
- `POST /events` - Crear evento
- `GET /events/:id` - Obtener evento
- `PUT /events/:id` - Actualizar evento
- `DELETE /events/:id` - Eliminar evento

#### 💰 Pagos
- `POST /payments/methods` - Crear método de pago
- `GET /payments/methods` - Listar métodos de pago
- `POST /payments/intents` - Crear intent de pago
- `POST /payments/process` - Procesar pago
- `POST /payments/invoices` - Crear factura
- `GET /payments/stats` - Estadísticas de pagos

#### 📍 Geolocalización
- `GET /geolocation/search` - Búsqueda por proximidad
- `GET /geolocation/nearby-events` - Eventos cercanos
- `GET /geolocation/nearby-musicians` - Músicos cercanos
- `POST /geolocation/optimize-route` - Optimizar ruta
- `POST /geolocation/geocode` - Geocodificar dirección

#### 🔍 Búsqueda
- `GET /search/events` - Búsqueda de eventos
- `GET /search/musician-requests` - Búsqueda de solicitudes
- `GET /search/users` - Búsqueda de usuarios
- `GET /search/global` - Búsqueda global
- `GET /search/location` - Búsqueda por ubicación

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Ejecutar en modo desarrollo
npm run start        # Ejecutar en producción

# Construcción
npm run build        # Compilar TypeScript
npm run clean        # Limpiar archivos compilados

# Testing
npm run test         # Ejecutar tests
npm run test:watch   # Tests en modo watch

# Linting
npm run lint         # Verificar código
npm run lint:fix     # Corregir problemas de linting

# Formateo
npm run format       # Formatear código con Prettier
```

## 🚀 Despliegue

### Firebase Cloud Functions
```bash
# Desplegar funciones
firebase deploy --only functions

# Desplegar hosting
firebase deploy --only hosting
```

### Variables de Entorno Requeridas

```typescript
// ENV.ts
export const ENV = {
  // Firebase
  FIREBASE_PROJECT_ID: 'your-project-id',
  FIREBASE_PRIVATE_KEY: 'your-private-key',
  FIREBASE_CLIENT_EMAIL: 'your-client-email',
  
  // JWT
  JWT_SECRET: 'your-jwt-secret',
  JWT_EXPIRES_IN: '24h',
  
  // AWS S3
  AWS_ACCESS_KEY_ID: 'your-access-key',
  AWS_SECRET_ACCESS_KEY: 'your-secret-key',
  AWS_REGION: 'your-region',
  AWS_BUCKET_NAME: 'your-bucket-name',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: 'your-google-client-id',
  GOOGLE_CLIENT_SECRET: 'your-google-client-secret',
  
  // Stripe (para pagos)
  STRIPE_SECRET_KEY: 'your-stripe-secret-key',
  STRIPE_PUBLISHABLE_KEY: 'your-stripe-publishable-key',
  
  // Google Maps (para geolocalización)
  GOOGLE_MAPS_API_KEY: 'your-google-maps-api-key',
  
  // Servidor
  PORT: 3001,
  NODE_ENV: 'development'
};
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Desarrollador**: Jefry Agustin Astacio Sanchez
- **Email**: jesanchez@DCTIC.GC
- **Proyecto**: [MussikOn API](https://github.com/your-username/APP_MussikOn_Express)

## 🎯 Roadmap

### ✅ Completado
- [x] Sistema de autenticación JWT
- [x] CRUD de eventos
- [x] Gestión de usuarios y roles
- [x] Sistema de solicitudes de músicos
- [x] Subida y gestión de imágenes
- [x] Documentación Swagger
- [x] Sistema de chat en tiempo real
- [x] Búsqueda avanzada
- [x] Analytics y reportes
- [x] Geolocalización avanzada
- [x] Sistema de pagos completo
- [x] **Limpieza completa de código React** 🧹
- [x] **API backend pura** ✅

### 🔄 En Desarrollo
- [ ] Optimización de performance
- [ ] Tests unitarios completos
- [ ] Integración con más gateways de pago
- [ ] Documentación de API mejorada

### 📋 Próximas Funcionalidades
- [ ] Sistema de calificaciones y reseñas
- [ ] Integración con redes sociales
- [ ] Dashboard de analytics avanzado
- [ ] API para aplicaciones móviles
- [ ] Sistema de recomendaciones IA

---

**🎵 Conectando músicos con el mundo, una nota a la vez.**

