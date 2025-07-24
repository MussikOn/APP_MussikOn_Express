# Dokumentación del Proyecto MusikOn API

## Índice
1. [Descripción General](#descripción-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Instalación y Puesta en Marcha](#instalación-y-puesta-en-marcha)
4. [Variables de Entorno](#variables-de-entorno)
5. [Flujo de Matching y Gestión de Eventos](#flujo-de-matching-y-gestión-de-eventos)
6. [Checklist de Progreso y Pendientes](#checklist-de-progreso-y-pendientes)
7. [Endpoints Principales](#endpoints-principales)
8. [Modelos de Datos](#modelos-de-datos)
9. [Autenticación y Seguridad](#autenticación-y-seguridad)
10. [Documentación Interactiva (Swagger)](#documentación-interactiva-swagger)
11. [Cómo Contribuir](#cómo-contribuir)
12. [Contacto](#contacto)

---

## Flujo de Matching y Gestión de Eventos

> **Nota:** El flujo alternativo de solicitudes directas de músicos está documentado en [`docs/MUSICIAN_REQUESTS_API.md`](docs/MUSICIAN_REQUESTS_API.md)

### 1. Creación de Solicitud de Músico (Organizador)
- El organizador puede crear una solicitud de evento tradicional o una solicitud directa de músico usando `/musician-requests/`.
- El backend guarda la solicitud y la pone en estado `pending_musician` o `pendiente`.
- Se emite una notificación en tiempo real a todos los músicos conectados (`io.emit('new_event_request', eventData)`).

### 2. Notificaciones y Listado para Músicos
- [x] Los músicos reciben la notificación en tiempo real.
- [ ] Los músicos pueden ver todas las solicitudes pendientes en `/events/available-requests` desde el frontend.
- [ ] Permitir filtrar por instrumento, ubicación, etc. (frontend y backend).

### 3. Aceptación de Solicitud (Músico)
- [ ] El músico puede aceptar una solicitud desde la app (`POST /events/:eventId/accept`).
- [x] El backend actualiza el evento a `musician_assigned` y asigna el músico.
- [ ] Se notifica al organizador en tiempo real en el frontend.

### 4. Gestión de Eventos para Organizadores y Músicos
- [ ] Organizadores pueden ver:
  - [ ] Eventos pendientes (`/events/my-pending`)
  - [ ] Eventos asignados (`/events/my-assigned`)
  - [ ] Eventos completados (`/events/my-completed`)
- [ ] Músicos pueden ver:
  - [ ] Solicitudes disponibles (`/events/available-requests`)
  - [ ] Eventos agendados (`/events/my-scheduled`)
  - [ ] Historial de actuaciones (`/events/my-past-performances`)

### 5. Estados de los Eventos
- [x] `pending_musician`: Esperando que un músico acepte.
- [x] `musician_assigned`: Un músico ha aceptado.
- [x] `completed`: Evento realizado.
- [x] `cancelled`: Evento cancelado.

### 6. Roles y Seguridad
- [x] Solo los organizadores pueden crear solicitudes.
- [x] Solo los músicos pueden aceptar solicitudes.
- [ ] El middleware valida el rol del usuario en todos los endpoints.

---

## Checklist de Progreso y Pendientes

### Funcionalidades Implementadas
- [x] Creación de solicitudes de músico (organizador)
- [x] Guardado y notificación en tiempo real de nuevas solicitudes
- [x] Asignación de músico a solicitud (backend)
- [x] Estados de evento y notificaciones básicas por socket
- [x] Autenticación JWT y roles básicos

### Funcionalidades Pendientes / Mejoras
- [ ] Listado de solicitudes disponibles para músicos en el frontend
- [ ] Acción de aceptar solicitud desde la app (músico)
- [ ] Feedback en tiempo real al organizador cuando un músico acepta
- [ ] Pantallas de gestión de eventos para ambos roles (pendientes, asignados, completados)
- [ ] Filtros avanzados en solicitudes (instrumento, ubicación, fecha)
- [ ] Validación de roles y permisos en todos los endpoints
- [ ] Mejoras de UX/UI: validaciones, feedback visual, loading, errores claros
- [ ] Pruebas automáticas (unitarias y de integración)
- [ ] Documentación Swagger actualizada y ejemplos de uso

---

## Orden Recomendado de Desarrollo
1. Implementar listado y filtrado de solicitudes disponibles para músicos en el frontend.
2. Permitir aceptar solicitudes desde la app y notificar en tiempo real al organizador.
3. Implementar pantallas de gestión de eventos para ambos roles.
4. Mejorar validaciones, feedback visual y robustez general.
5. Agregar pruebas automáticas y actualizar documentación.

---

## Estado Actual
- El flujo de creación y notificación de solicitudes está **funcionando**.
- El backend acepta y guarda correctamente los datos.
- Falta completar la experiencia del músico y la gestión de eventos en el frontend.
- Faltan validaciones de roles y pruebas automáticas para robustez total.

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

> **¿Solicitudes directas de músicos?** Consulta la documentación detallada en [`docs/MUSICIAN_REQUESTS_API.md`](docs/MUSICIAN_REQUESTS_API.md)

### Para Organizadores
- `POST /events/request-musician` — Crear solicitud de músico
- `GET /events/my-pending` — Ver eventos pendientes
- `GET /events/my-assigned` — Ver eventos asignados
- `GET /events/my-completed` — Ver eventos completados
- `POST /musician-requests/` — Crear solicitud de músico (flujo alternativo)
- `POST /musician-requests/cancel` — Cancelar solicitud de músico

### Para Músicos
- `GET /events/available-requests` — Ver solicitudes disponibles
- `POST /events/:eventId/accept` — Aceptar una solicitud
- `GET /events/my-scheduled` — Ver eventos agendados
- `GET /events/my-past-performances` — Ver historial de actuaciones
- `POST /musician-requests/accept` — Aceptar solicitud de músico (flujo alternativo)
- `GET /musician-requests/:id/status` — Consultar estado de solicitud de músico

---

## Modelos de Datos

### Usuario (`