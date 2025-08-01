# API de Eventos y Matching en MusikOn

## Flujo General
- Organizadores crean solicitudes de músicos (eventos).
- Músicos ven solicitudes disponibles y pueden aceptar.
- Ambos roles pueden ver sus eventos pendientes, asignados y completados.
- Notificaciones en tiempo real vía socket.io.

## Endpoints principales
- `POST /events/request-musician` — Crear solicitud de músico (organizador)
- `GET /events/my-pending` — Ver eventos pendientes (organizador)
- `GET /events/my-assigned` — Ver eventos asignados (organizador)
- `GET /events/my-completed` — Ver eventos completados (organizador)
- `GET /events/available-requests` — Ver solicitudes disponibles (músico)
- `POST /events/:eventId/accept` — Aceptar solicitud (músico)
- `GET /events/my-scheduled` — Ver eventos agendados (músico)
- `GET /events/my-past-performances` — Ver historial de actuaciones (músico)

## Estados de los eventos
- `pending_musician`: Esperando que un músico acepte.
- `musician_assigned`: Un músico ha aceptado.
- `completed`: Evento realizado.
- `cancelled`: Evento cancelado.

## Ejemplo de notificación en tiempo real
```js
// Músico escucha nuevas solicitudes
iosocket.on('new_event_request', (eventData) => { /* ... */ });
// Organizador escucha aceptación de músico
socket.on('musician_accepted', (eventData) => { /* ... */ });
```

---

Consulta este archivo para entender el flujo y la integración de eventos en la plataforma. 