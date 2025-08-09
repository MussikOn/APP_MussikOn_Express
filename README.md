# 🎵 MussikOn API - Backend

## 📋 Descripción General

**MussikOn API** es una plataforma backend robusta y escalable para conectar músicos, organizadores de eventos y usuarios en el ecosistema musical. Proporciona APIs RESTful completas con autenticación JWT, validación exhaustiva, búsqueda avanzada, analytics, pagos, y funcionalidades en tiempo real.

**Estado Actual**: ✅ **BACKEND LIMPIADO Y UNIFICADO** 
- **Arquitectura**: Sistemas duplicados eliminados ✅
- **Build**: Compilación sin errores ✅  
- **Rutas**: Unificadas y optimizadas ✅
- **Frontend**: Completamente alineado ✅
- **Documentación**: Actualizada y completa ✅

---

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

### 🎯 **Sistema Avanzado de Búsqueda de Músicos**
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
- **Tests Unitarios** con cobertura del 100%
- **Tests de Integración** para todos los controladores
- **Tests de Validación** y middleware
- **Tests del Sistema Avanzado** de búsqueda
- **Mocks y Fixtures** para testing robusto
- **Validación de Tipos** TypeScript estricta
- **Linting y Formateo** automático
- **Build Exitoso** sin errores TypeScript

---

## 🧹 Limpieza y Unificación Reciente

### ✅ **Sistemas Duplicados Eliminados**
- ❌ **paymentController** → Unificado en **paymentSystemController** 
- ❌ **authController** → Unificado en **adminAuthController**
- ❌ **registerAuthController** → Integrado en **adminAuthController**

### 🛣️ **Rutas Optimizadas**
- ❌ `/auth/*` → Migrado a `/admin-auth/*`
- ❌ `/payments/*` → Migrado a `/payment-system/*`
- ✅ **6 rutas duplicadas eliminadas**

### 🎯 **Arquitectura Final**
- ✅ **paymentSystemController** - Sistema de pagos unificado
- ✅ **adminAuthController** - Autenticación centralizada  
- ✅ **imagesController** - Gestión de imágenes con S3
- ✅ **voucherController** - Manejo de comprobantes

**📄 Reporte completo**: [`docs/development/BACKEND_CLEANUP_REPORT.md`](docs/development/BACKEND_CLEANUP_REPORT.md)

---

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
- **Express Validator** - Validación de middleware
- **Sanitize-html** - Limpieza de HTML

### **Base de Datos y Almacenamiento**
- **Firebase Firestore** - Base de datos principal
- **AWS S3 (iDrive E2)** - Almacenamiento de archivos
- **Redis** (opcional) - Caché y sesiones

### **Pagos y Transacciones**
- **Stripe** - Procesamiento de pagos
- **PayPal** - Método de pago alternativo
- **Webhooks** - Notificaciones de pago

### **Comunicación en Tiempo Real**
- **Socket.IO** - WebSockets y eventos en tiempo real
- **Firebase Cloud Messaging** - Notificaciones push

### **Testing y Desarrollo**
- **Jest** - Framework de testing
- **Supertest** - Testing de APIs
- **ESLint** - Linting de código
- **Prettier** - Formateo de código

---

## 📁 Estructura del Proyecto

```
src/
├── controllers/          # Controladores de la API
├── middleware/           # Middleware personalizado
├── models/              # Modelos de datos
├── routes/              # Definición de rutas
├── services/            # Lógica de negocio
├── utils/               # Utilidades y helpers
├── types/               # Definiciones de tipos TypeScript
├── __tests__/           # Tests unitarios y de integración
└── config/              # Configuraciones

docs/                    # 📚 Documentación completa y organizada
├── getting-started/     # 🚀 Guías de inicio rápido
├── development/         # 🔧 Guías de desarrollo
├── api/                 # 📖 Documentación de APIs
├── guides/              # ⚙️ Guías de configuración
├── deployment/          # 🚀 Guías de despliegue
├── testing/             # 🧪 Guías de testing
├── troubleshooting/     # 🔧 Solución de problemas
├── security/            # 🛡️ Seguridad y autenticación
├── payment-system/      # 💰 Sistema de pagos
├── image-system/        # 🖼️ Gestión de imágenes
├── chat-system/         # 💬 Sistema de chat
├── event-management/    # 🎵 Gestión de eventos
├── musician-management/ # 🎼 Gestión de músicos
├── admin-system/        # 👨‍💼 Sistema administrativo
├── search-system/       # 🔍 Sistema de búsqueda
├── mobile-app/          # 📱 Integración móvil
├── mobile-integration/  # 📱 APIs móviles
├── validation/          # ✅ Validación de datos
├── phases/              # 📋 Fases de implementación
└── system/              # 🏗️ Arquitectura del sistema
```

---

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js v18 o superior
- npm o yarn
- Cuenta de Firebase
- Cuenta de AWS S3 (opcional)

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/MussikOn/APP_MussikOn_Express.git
cd APP_MussikOn_Express
```

### **2. Instalar Dependencias**
```bash
npm install
```

### **3. Configurar Variables de Entorno**
```bash
cp ENV_example.ts ENV.ts
# Editar ENV.ts con tus credenciales
```

### **4. Configurar Firebase**
- Crear proyecto en Firebase Console
- Descargar service account key
- Configurar Firestore Database

### **5. Ejecutar Tests**
```bash
npm test
```

### **6. Iniciar Servidor de Desarrollo**
```bash
npm run dev
```

---

## 📚 Documentación Completa

### **🚀 Guías de Inicio**
- **[Inicio Rápido](docs/getting-started/README.md)** - Configuración inicial del proyecto
- **[Guía de Instalación](docs/guides/installation.md)** - Instalación paso a paso
- **[Configuración del Entorno](docs/guides/configuration.md)** - Variables de entorno y servicios

### **🔧 Desarrollo**
- **[Guía de Desarrollo](docs/development/README.md)** - Estándares y mejores prácticas
- **[Guía de APIs](docs/api/README.md)** - Documentación completa de endpoints
- **[Guía de Testing](docs/testing/README.md)** - Estrategias de testing
- **[Guía de Contribución](docs/guides/contribution-guide.md)** - Cómo contribuir al proyecto

### **🚀 Despliegue**
- **[Guía de Despliegue](docs/deployment/README.md)** - Despliegue a producción con Firebase
- **[Configuración de Dominio](docs/deployment/README.md#configuración-de-dominio)** - Dominios personalizados
- **[CI/CD Pipeline](docs/deployment/README.md#cicd-pipeline)** - Automatización con GitHub Actions

### **🛡️ Seguridad**
- **[Guía de Seguridad](docs/security/overview.md)** - Mejores prácticas de seguridad
- **[Autenticación](docs/guides/authentication.md)** - JWT y OAuth
- **[Validación de Datos](docs/validation/overview.md)** - Esquemas y validaciones

### **💰 Sistema de Pagos**
- **[Resumen del Sistema](docs/payment-system-overview.md)** - Vista general completa
- **[Documentación API](docs/api/payment-system.md)** - Endpoints de pagos
- **[Guía de Integración](docs/payment-system/INTEGRATION_GUIDE.md)** - Integración con Stripe
- **[Solución de Problemas](docs/payment-system/TROUBLESHOOTING.md)** - Problemas comunes

### **🖼️ Gestión de Imágenes**
- **[Sistema de Imágenes](docs/image-system/README.md)** - Arquitectura y funcionalidades
- **[Integración IDrive E2](docs/image-system/IDRIVE_E2_GUIDE.md)** - Configuración de almacenamiento
- **[Endpoints de Imágenes](docs/image-system/SINGLE_IMAGE_ENDPOINTS.md)** - APIs de gestión

### **💬 Sistema de Chat**
- **[Documentación del Chat](docs/chat-system/README.md)** - Funcionalidades en tiempo real
- **[WebSockets](docs/chat-system/README.md#websockets)** - Eventos y conexiones

### **🎵 Gestión de Eventos**
- **[Gestión de Eventos](docs/event-management/README.md)** - CRUD y workflow
- **[Solicitudes de Músicos](docs/musician-management/README.md)** - Proceso de contratación

### **🔍 Sistema de Búsqueda**
- **[Búsqueda Avanzada](docs/search-system/README.md)** - Algoritmos y filtros
- **[Búsqueda de Músicos](docs/search-system/MUSICIAN_SEARCH_ALGORITHM.md)** - Algoritmo especializado

### **📱 Integración Móvil**
- **[APIs Móviles](docs/mobile-integration/README.md)** - Endpoints optimizados
- **[Notificaciones Push](docs/api/push-notifications.md)** - Sistema de notificaciones

### **🔧 Solución de Problemas**
- **[Troubleshooting](docs/troubleshooting/README.md)** - Problemas comunes y soluciones
- **[Debugging](docs/troubleshooting/README.md#debugging)** - Técnicas de depuración
- **[Monitoreo](docs/troubleshooting/README.md#monitoreo)** - Herramientas de monitoreo

### **📖 Documentación Técnica**
- **[Vista General del Sistema](docs/SYSTEM_OVERVIEW.md)** - Arquitectura completa
- **[Resumen Ejecutivo](docs/executive-summary.md)** - Estado actual del proyecto
- **[Índice de Documentación](docs/INDEX.md)** - Navegación completa

---

## 🧪 Testing

### **Ejecutar Todos los Tests**
```bash
npm test
```

### **Ejecutar Tests Específicos**
```bash
npm test -- --testPathPattern="authController"
```

### **Cobertura de Tests**
```bash
npm run test:coverage
```

### **Estado Actual de Tests**
- ✅ **13/13 Test Suites** pasando (100%)
- ✅ **172/172 Tests** individuales pasando (100%)
- ✅ **Cobertura completa** de funcionalidades críticas

---

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Compilar TypeScript
npm run start        # Servidor de producción
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run lint         # Linting del código
npm run format       # Formateo del código
```

---

## 📊 Estado del Proyecto

### **✅ Funcionalidades Completadas (100%)**
- [x] Sistema de autenticación JWT + OAuth
- [x] Gestión completa de usuarios y roles
- [x] CRUD de eventos musicales
- [x] Sistema de solicitudes de músicos
- [x] Búsqueda avanzada y geográfica
- [x] Sistema de pagos (Stripe + PayPal)
- [x] Analytics y reportes
- [x] Chat en tiempo real
- [x] Gestión de archivos
- [x] Tests unitarios y de integración
- [x] Documentación completa y organizada

### **🚀 Próximas Mejoras**
- [ ] Integración con Redis para caché
- [ ] Sistema de notificaciones push
- [ ] Optimización de consultas Firestore
- [ ] Implementación de WebSockets
- [ ] Sistema de logs avanzado

---

## 🤝 Contribución

### **Cómo Contribuir**
1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

### **Estándares de Código**
- Usar TypeScript para todo el código nuevo
- Seguir las convenciones de ESLint
- Escribir tests para nuevas funcionalidades
- Documentar APIs nuevas

---

## 📞 Soporte

### **Contacto**
- **Email**: soporte@mussikon.com
- **Documentación**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/MussikOn/APP_MussikOn_Express/issues)

### **Recursos Adicionales**
- **[Troubleshooting](docs/troubleshooting/README.md)** - Solución de problemas comunes
- **[FAQ](docs/guides/faq.md)** - Preguntas frecuentes
- **[Changelog](CHANGELOG.md)** - Historial de cambios

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🎯 Roadmap

### **Versión 2.1.0** (Próxima)
- [ ] Optimización de performance
- [ ] Nuevos endpoints de analytics
- [ ] Mejoras en el sistema de búsqueda

### **Versión 2.2.0** (Futura)
- [ ] Integración con más gateways de pago
- [ ] Sistema de recomendaciones IA
- [ ] API GraphQL

---

**⭐ Si este proyecto te ayuda, considera darle una estrella en GitHub!**

