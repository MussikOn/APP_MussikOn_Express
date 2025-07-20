# MusikOn - Plataforma de Solicitudes de Músicos

## Descripción General

MusikOn es una plataforma tipo "Uber para músicos" que conecta organizadores de eventos religiosos con músicos disponibles. El sistema evolucionó de un modelo simple de eventos a un sistema avanzado con cálculo automático de tarifas, expiración de solicitudes y gestión completa del flujo de trabajo.

## Características Principales

### 🎯 Sistema de Solicitudes de Músicos (Nuevo)
- **Cálculo automático de tarifas** basado en tipo de evento y duración
- **Expiración automática** de solicitudes (30 minutos)
- **Validación robusta** con Joi y TypeScript
- **Subida de flyers** con AWS S3
- **Documentación Swagger** completa
- **Sistema de roles** (organizador/músico)

### 🎵 Sistema de Eventos (Legacy)
- **Gestión de eventos** tradicional
- **Compatibilidad** con funcionalidades existentes
- **Migración gradual** al nuevo sistema

## Arquitectura del Sistema

### Backend (Node.js + Express + TypeScript)
```
├── src/
│   ├── controllers/          # Controladores de la API
│   ├── models/              # Modelos de datos
│   ├── routes/              # Definición de rutas
│   ├── middleware/          # Middlewares personalizados
│   ├── utils/               # Utilidades y helpers
│   └── sockets/             # Configuración de WebSockets
├── docs/                    # Documentación completa
└── index.ts                 # Punto de entrada
```

**Tecnologías:**
- **Framework**: Express.js con TypeScript
- **Base de Datos**: Firebase Firestore
- **Autenticación**: JWT con roles
- **Validación**: Joi con esquemas personalizados
- **Subida de Archivos**: Multer + AWS S3 (iDrive E2)
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest (próximamente)

### Frontend (React Native + Expo)
```
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── screens/             # Pantallas de la aplicación
│   ├── services/            # Servicios de API
│   ├── hooks/               # Custom hooks
│   ├── store/               # Estado global (Redux)
│   └── utils/               # Utilidades
```

**Tecnologías:**
- **Framework**: React Native con Expo
- **Navegación**: React Navigation v6
- **Formularios**: Formik + Yup
- **Estado**: Redux Toolkit
- **UI**: Componentes nativos + librerías
- **Maps**: React Native Maps
- **Notificaciones**: Expo Notifications

## Funcionalidades por Rol

### 👨‍💼 Para Organizadores (Creadores de Eventos)

#### 1. Crear Solicitud de Músico
- ✅ **Formulario completo** con validación en tiempo real
- ✅ **Cálculo automático** de tarifas según tipo de evento
- ✅ **Subida de flyer** del evento (JPG, PNG, hasta 5MB)
- ✅ **Selección de fecha** con calendario integrado
- ✅ **Selección de horarios** con time picker
- ✅ **Especificación de instrumento** requerido
- ✅ **Ubicación** con coordenadas opcionales

#### 2. Gestionar Solicitudes
- ✅ **Ver historial** de solicitudes (activas, completadas, expiradas)
- ✅ **Cancelar solicitudes** activas
- ✅ **Renviar solicitudes** expiradas
- ✅ **Aceptar propuestas** de músicos
- ✅ **Seguimiento de estado** en tiempo real

#### 3. Dashboard de Organizador
- 📊 **Estadísticas** de solicitudes
- 📈 **Gráficos** de actividad
- 💰 **Resumen de gastos** por período

### 🎸 Para Músicos

#### 1. Ver Solicitudes Disponibles
- ✅ **Lista filtrable** de solicitudes activas
- ✅ **Filtrado por instrumento** y ubicación
- ✅ **Información detallada** del evento
- ✅ **Precio calculado** automáticamente
- ✅ **Tiempo restante** de la solicitud

#### 2. Responder a Solicitudes
- ✅ **Enviar propuesta** con precio personalizado
- ✅ **Incluir mensaje** personalizado
- ✅ **Especificar disponibilidad** y experiencia
- ✅ **Adjuntar portafolio** (opcional)

#### 3. Gestionar Respuestas
- ✅ **Ver estado** de propuestas enviadas
- ✅ **Recibir notificaciones** de aceptación
- ✅ **Historial** de eventos realizados

## Cálculo de Tarifas Automático

### 🏛️ Culto Regular
- **Base**: RD$ 800 por 2 horas
- **Adicional**: RD$ 650 por hora extra
- **Gracias**: 30 minutos incluidos
- **Mínimo cobro**: 10 minutos

### ⛪ Campaña dentro del Templo
- **Base**: RD$ 1,200 por 2 horas
- **Adicional**: RD$ 850 por hora extra
- **Gracias**: 30 minutos incluidos
- **Mínimo cobro**: 10 minutos

### 📊 Ejemplos de Cálculo
| Duración | Culto | Campaña |
|----------|-------|---------|
| 1.5 horas | RD$ 800 | RD$ 1,200 |
| 2.5 horas | RD$ 1,125 | RD$ 1,625 |
| 3 horas | RD$ 1,450 | RD$ 2,050 |
| 4 horas | RD$ 2,100 | RD$ 2,900 |

## Estados de Solicitud

| Estado | Descripción | Acciones Disponibles | Color |
|--------|-------------|---------------------|-------|
| `searching_musician` | Buscando músico (activo) | Cancelar, Renviar | 🟢 Verde |
| `musician_found` | Músico encontrado y aceptado | Completar | 🟡 Amarillo |
| `completed` | Evento completado | Ver detalles | 🔵 Azul |
| `expired` | Solicitud expirada (30 min) | Renviar | 🔴 Rojo |
| `cancelled` | Solicitud cancelada | Ver detalles | ⚫ Gris |

## API Endpoints

### 🆕 Sistema de Solicitudes de Músicos
```
POST   /musician-requests/create              # Crear nueva solicitud
GET    /musician-requests/available           # Obtener solicitudes disponibles
POST   /musician-requests/respond/:requestId  # Responder a solicitud
POST   /musician-requests/accept/:requestId/:musicianId  # Aceptar músico
GET    /musician-requests/organizer/:organizerId  # Solicitudes del organizador
POST   /musician-requests/cancel/:requestId   # Cancelar solicitud
POST   /musician-requests/resend/:requestId   # Renviar solicitud expirada
```

### 📁 Sistema de Archivos
```
GET    /imgs/getAllImg                        # Listar imágenes
GET    /imgs/getUrl/:key                      # Obtener URL firmada
POST   /imgs/upload                           # Subir imagen
DELETE /imgs/delete/:key                      # Eliminar imagen
PUT    /imgs/update-metadata/:key             # Actualizar metadatos
```

### 🔐 Autenticación
```
POST   /auth/login                            # Iniciar sesión
POST   /auth/register                         # Registrarse
POST   /auth/google                           # Login con Google
GET    /auth/profile                          # Obtener perfil
PUT    /auth/profile                          # Actualizar perfil
```

### 📅 Sistema de Eventos (Legacy)
```
POST   /events/request-musician               # Crear solicitud (legacy)
GET    /events/my-pending                     # Eventos pendientes
GET    /events/my-assigned                    # Eventos asignados
GET    /events/available-requests             # Solicitudes disponibles
```

## Estructura de Datos

### MusicianRequest
```typescript
{
  id: string;                                    // ID único
  organizerId: string;                          // Email del organizador
  organizerName: string;                        // Nombre del organizador
  eventName: string;                            // Nombre del evento
  eventType: 'culto' | 'campana_dentro_templo' | 'otro';
  eventDate: string;                            // Fecha ISO
  startTime: string;                            // HH:mm
  endTime: string;                              // HH:mm
  location: string;                             // Ubicación
  locationCoordinates?: {                       // Coordenadas opcionales
    latitude: number;
    longitude: number;
  };
  instrumentType: string;                       // Instrumento requerido
  eventDescription: string;                     // Descripción
  flyerUrl?: string;                           // URL del flyer
  calculatedPrice: number;                      // Precio calculado
  status: 'searching_musician' | 'musician_found' | 'completed' | 'expired' | 'cancelled';
  assignedMusicianId?: string;                 // ID del músico asignado
  interestedMusicians: string[];               // Lista de músicos interesados
  searchExpiryTime: string;                    // Tiempo de expiración
  createdAt: string;                           // Fecha de creación
  updatedAt: string;                           // Fecha de actualización
}
```

### MusicianRequestResponse
```typescript
{
  id: string;                                   // ID único
  requestId: string;                           // ID de la solicitud
  musicianId: string;                          // Email del músico
  musicianName: string;                        // Nombre del músico
  status: 'pending' | 'accepted' | 'declined'; // Estado de la respuesta
  message?: string;                            // Mensaje opcional
  proposedPrice?: number;                      // Precio propuesto
  createdAt: string;                           // Fecha de creación
}
```

## Validaciones y Seguridad

### ✅ Validaciones de Entrada
- **Email**: Formato válido para organizador y músico
- **Nombres**: 2-100 caracteres, sin caracteres especiales
- **Evento**: 3-200 caracteres, descripción 10-1000 caracteres
- **Fechas**: Formato ISO, fecha futura obligatoria
- **Horarios**: Formato HH:mm, fin después del inicio
- **Ubicación**: 5-500 caracteres
- **Instrumento**: 2-100 caracteres
- **Archivos**: Solo imágenes (JPG, PNG, WebP), máximo 5MB

### 🔒 Medidas de Seguridad
- **JWT**: Autenticación con tokens
- **Roles**: Autorización por tipo de usuario
- **Rate Limiting**: Protección contra spam
- **CORS**: Configuración segura
- **Helmet**: Headers de seguridad
- **Validación**: Joi para todos los inputs
- **Sanitización**: Limpieza de datos de entrada

## Configuración de Desarrollo

### 🚀 Backend
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/musikon-backend.git
cd APP_MussikOn_Express

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar en desarrollo
npm run dev

# Verificar TypeScript
npm run type-check

# Ejecutar tests (próximamente)
npm test
```

### 📱 Frontend
```bash
# Navegar al directorio del frontend
cd APP_MussikOn_React_Native_Expo

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npx expo start

# Para Android
npx expo run:android

# Para iOS
npx expo run:ios
```

### 🔧 Variables de Entorno
Crear archivo `.env` en el backend:
```env
# Servidor
PORT=1000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Firebase
FIREBASE_PROJECT_ID=musikon-app
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# AWS S3 (iDrive E2)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=musikon-images

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:19006

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
```

## Documentación Adicional

### 📚 Guías Detalladas
- [API de Solicitudes de Músicos](./MUSICIAN_REQUESTS_API.md) - Documentación completa de la API
- [Integración Frontend](./FRONTEND_INTEGRATION.md) - Guía de integración del frontend
- [API de Eventos](./EVENTS_API.md) - Sistema de eventos existente
- [API de Imágenes](./IMAGES_API.md) - Gestión de archivos multimedia
- [Manejo de Errores](./ERROR_HANDLING.md) - Estrategias de error handling
- [Seguridad](./SECURITY.md) - Medidas de seguridad implementadas

### 🔗 Enlaces Útiles
- **Swagger UI**: `http://localhost:1000/api-docs`
- **API Base URL**: `http://localhost:1000`
- **Frontend Dev**: `http://localhost:19006`
- **Documentación**: `./docs/`

## Roadmap de Desarrollo

### ✅ Fase 1: Sistema Base (Completado)
- [x] Arquitectura del backend con TypeScript
- [x] Sistema de autenticación JWT
- [x] API de solicitudes de músicos
- [x] Cálculo automático de tarifas
- [x] Subida de imágenes con AWS S3
- [x] Validaciones con Joi
- [x] Documentación Swagger
- [x] Formularios en React Native

### 🔄 Fase 2: Funcionalidades Avanzadas (En Progreso)
- [ ] Notificaciones en tiempo real (Socket.io)
- [ ] Integración de mapas y geolocalización
- [ ] Sistema de calificaciones y reviews
- [ ] Chat entre organizador y músico
- [ ] Sistema de pagos integrado
- [ ] Push notifications

### 📋 Fase 3: Optimizaciones (Planificado)
- [ ] Cache de solicitudes con Redis
- [ ] Búsqueda avanzada con filtros
- [ ] Analytics y reportes detallados
- [ ] Sistema de recomendaciones
- [ ] Optimización de rendimiento
- [ ] Tests automatizados

### 🚀 Fase 4: Escalabilidad (Futuro)
- [ ] Microservicios
- [ ] Load balancing
- [ ] CDN para imágenes
- [ ] Monitoreo y alertas
- [ ] Backup automático
- [ ] CI/CD pipeline

## Contribución

### 🤝 Cómo Contribuir
1. **Fork** el repositorio
2. **Crea una rama** para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Crea un Pull Request**

### 📝 Guías de Contribución
- **Código**: Seguir estándares de TypeScript/ESLint
- **Commits**: Usar mensajes descriptivos
- **Tests**: Agregar tests para nuevas funcionalidades
- **Documentación**: Actualizar docs cuando sea necesario

### 🐛 Reportar Bugs
- Usar el sistema de Issues de GitHub
- Incluir pasos para reproducir
- Adjuntar logs y screenshots si es necesario

## Licencia

Este proyecto está bajo la **Licencia MIT**. Ver el archivo `LICENSE` para más detalles.

## Contacto

- **Desarrollador**: [Tu Nombre]
- **Email**: [tu-email@ejemplo.com]
- **GitHub**: [@tu-usuario]
- **LinkedIn**: [tu-perfil-linkedin]

---

**🎵 MusikOn - Conectando músicos con eventos religiosos de manera eficiente y segura** 