# Dokumentación del Proyecto MusikOn API

## Índice
1. [Descripción General](#descripción-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Instalación y Puesta en Marcha](#instalación-y-puesta-en-marcha)
4. [Variables de Entorno](#variables-de-entorno)
5. [Flujo de Matching y Gestión de Eventos](#flujo-de-matching-y-gestión-de-eventos)
6. [Endpoints Principales](#endpoints-principales)
7. [Modelos de Datos](#modelos-de-datos)
8. [Autenticación y Seguridad](#autenticación-y-seguridad)
9. [Documentación Interactiva (Swagger)](#documentación-interactiva-swagger)
10. [Cómo Contribuir](#cómo-contribuir)
11. [Contacto](#contacto)

---

## Flujo de Matching y Gestión de Eventos

### 1. Creación de Solicitud de Músico (Organizador)
- El organizador crea una solicitud de evento con todos los detalles necesarios.
- El backend guarda la solicitud y la pone en estado `pending_musician`.
- Se emite una notificación en tiempo real a todos los músicos conectados (`io.emit('new_event_request', eventData)`).

### 2. Notificaciones y Listado para Músicos
- Los músicos reciben la notificación en tiempo real y pueden ver todas las solicitudes pendientes en `/events/available-requests`.
- Pueden filtrar por instrumento, ubicación, etc.

### 3. Aceptación de Solicitud (Músico)
- El músico acepta una solicitud (`POST /events/:eventId/accept`).
- El backend actualiza el evento a `musician_assigned` y asigna el músico.
- Se notifica al organizador en tiempo real (`io.to(organizerSocketId).emit('musician_accepted', eventData)`).

### 4. Gestión de Eventos para Organizadores y Músicos
- Organizadores pueden ver:
  - Eventos pendientes (`/events/my-pending`)
  - Eventos asignados (`/events/my-assigned`)
  - Eventos completados (`/events/my-completed`)
- Músicos pueden ver:
  - Solicitudes disponibles (`/events/available-requests`)
  - Eventos agendados (`/events/my-scheduled`)
  - Historial de actuaciones (`/events/my-past-performances`)

### 5. Estados de los Eventos
- `pending_musician`: Esperando que un músico acepte.
- `musician_assigned`: Un músico ha aceptado.
- `completed`: Evento realizado.
- `cancelled`: Evento cancelado.

### 6. Roles y Seguridad
- Solo los organizadores pueden crear solicitudes.
- Solo los músicos pueden aceptar solicitudes.
- El middleware valida el rol del usuario.

---

## Descripción General
MusikOn es una API que conecta músicos con organizadores de eventos, permitiendo la gestión de usuarios, eventos, imágenes y notificaciones en tiempo real.

- **Backend:** Node.js + Express + TypeScript
- **Base de datos:** Firebase Firestore
- **Almacenamiento de archivos:** AWS S3 compatible (idriveE2)
- **Autenticación:** JWT
- **Documentación:** Swagger (OpenAPI)

---

## Estructura del Proyecto

```
APP_MussikOn_Express/
├── ENV_example.ts         # Ejemplo de variables de entorno
├── ENV.ts                # Variables de entorno reales (no subir a git)
├── index.ts              # Punto de entrada principal (Express, Swagger, Sockets)
├── package.json          # Dependencias y scripts
├── README.md             # Resumen rápido
├── PROJECT_DOCUMENTATION.md # (Este archivo)
└── src/
    ├── controllers/      # Lógica de negocio y endpoints
    ├── middleware/       # Middlewares (autenticación, etc.)
    ├── models/           # Acceso a datos y lógica de Firestore
    ├── routes/           # Definición de rutas Express
    ├── sockets/          # Lógica de sockets y notificaciones
    └── utils/            # Utilidades, validaciones, JWT, mailer, etc.
```

---

## Instalación y Puesta en Marcha

1. Clona el repositorio:
   ```bash
   git clone https://github.com/JASBOOTSTUDIOS/Express_MusikOn_Backend.git
   cd Express_MusikOn_Backend
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Copia y configura las variables de entorno:
   ```bash
   cp ENV_example.ts ENV.ts
   # Edita ENV.ts y agrega tus credenciales
   ```
4. Inicia el servidor:
   ```bash
   npm start
   ```
5. Accede a la documentación interactiva en:
   - [http://localhost:1000/api-docs](http://localhost:1000/api-docs)

---

## Variables de Entorno
Configura tus credenciales en `ENV.ts` siguiendo el ejemplo de `ENV_example.ts`.

- FIREBASE_CREDENTIALS
- IDRIVE_E2_ENDPOINT, IDRIVE_E2_ACCESS_KEY, IDRIVE_E2_SECRET_KEY, IDRIVE_E2_REGION
- EMAIL_USER, EMAIL_PASSWORD
- TOKEN_SECRET
- SERVER_PORT, URL_API

---

## Endpoints Principales (Actualizados)

### Para Organizadores
- `POST /events/request-musician` — Crear solicitud de músico
- `GET /events/my-pending` — Ver eventos pendientes
- `GET /events/my-assigned` — Ver eventos asignados
- `GET /events/my-completed` — Ver eventos completados

### Para Músicos
- `GET /events/available-requests` — Ver solicitudes disponibles
- `POST /events/:eventId/accept` — Aceptar una solicitud
- `GET /events/my-scheduled` — Ver eventos agendados
- `GET /events/my-past-performances` — Ver historial de actuaciones

---

## Modelos de Datos

### Usuario (`