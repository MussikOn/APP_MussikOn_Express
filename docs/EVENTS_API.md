# API de Eventos y Solicitudes de Músicos - MusikOn

## Descripción General

Este documento describe tanto el sistema de eventos existente como el nuevo sistema de solicitudes de músicos implementado. El sistema evolucionó de un modelo de eventos simples a un sistema tipo "Uber para músicos" con cálculo automático de tarifas.

## Sistemas Disponibles

### 1. Sistema de Eventos (Legacy)
Sistema original para gestión de eventos con músicos.

### 2. Sistema de Solicitudes de Músicos (Nuevo)
Sistema avanzado tipo "Uber para músicos" con cálculo automático de tarifas y expiración de solicitudes.

## Sistema de Solicitudes de Músicos (Recomendado)

### Base URL
```
http://localhost:1000/musician-requests
```

### Endpoints Principales

#### Para Organizadores
- `POST /create` — Crear solicitud de músico con cálculo automático de tarifas
- `GET /organizer/{organizerId}` — Ver solicitudes del organizador
- `POST /cancel/{requestId}` — Cancelar solicitud activa
- `POST /resend/{requestId}` — Renviar solicitud expirada
- `POST /accept/{requestId}/{musicianId}` — Aceptar propuesta de músico

#### Para Músicos
- `GET /available` — Ver solicitudes disponibles (con filtro por instrumento)
- `POST /respond/{requestId}` — Responder a una solicitud

### Características del Nuevo Sistema

#### Cálculo Automático de Tarifas
- **Culto**: RD$ 800 base (2h) + RD$ 650/hora adicional
- **Campaña**: RD$ 1,200 base (2h) + RD$ 850/hora adicional
- **Gracias**: 30 minutos
- **Mínimo cobro**: 10 minutos

#### Estados de Solicitud
- `searching_musician`: Buscando músico (activo)
- `musician_found`: Músico encontrado y aceptado
- `completed`: Evento completado
- `expired`: Solicitud expirada (30 minutos)
- `cancelled`: Solicitud cancelada

#### Expiración Automática
Las solicitudes expiran automáticamente después de 30 minutos si no encuentran un músico disponible.

### Ejemplo de Uso

```javascript
// Crear solicitud de músico
const response = await fetch('/musician-requests/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData // multipart/form-data
});

// Obtener solicitudes disponibles
const requests = await fetch('/musician-requests/available?instrumentType=Piano', {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});
```

## Sistema de Eventos (Legacy)

### Base URL
```
http://localhost:1000/events
```

### Endpoints Legacy

#### Para Organizadores
- `POST /request-musician` — Crear solicitud de músico
- `GET /my-pending` — Ver eventos pendientes
- `GET /my-assigned` — Ver eventos asignados
- `GET /my-completed` — Ver eventos completados

#### Para Músicos
- `GET /available-requests` — Ver solicitudes disponibles
- `POST /:eventId/accept` — Aceptar solicitud
- `GET /my-scheduled` — Ver eventos agendados
- `GET /my-past-performances` — Ver historial de actuaciones

### Estados Legacy
- `pending_musician`: Esperando que un músico acepte
- `musician_assigned`: Un músico ha aceptado
- `completed`: Evento realizado
- `cancelled`: Evento cancelado

## Migración y Compatibilidad

### Recomendaciones
1. **Usar el nuevo sistema** para nuevas funcionalidades
2. **Mantener compatibilidad** con el sistema legacy
3. **Migrar gradualmente** funcionalidades existentes

### Diferencias Clave

| Característica | Sistema Legacy | Nuevo Sistema |
|----------------|----------------|---------------|
| Cálculo de tarifas | Manual | Automático |
| Expiración | No aplica | 30 minutos |
| Tipos de evento | Genérico | Específicos (culto, campaña) |
| Validaciones | Básicas | Avanzadas con Joi |
| Documentación | Básica | Swagger completa |

## Notificaciones en Tiempo Real

### Sistema Legacy
```javascript
// Músico escucha nuevas solicitudes
socket.on('new_event_request', (eventData) => {
  console.log('Nueva solicitud:', eventData);
});

// Organizador escucha aceptación de músico
socket.on('musician_accepted', (eventData) => {
  console.log('Músico aceptó:', eventData);
});
```

### Nuevo Sistema (Próximamente)
```javascript
// Notificaciones de expiración
socket.on('request_expired', (requestId) => {
  console.log('Solicitud expirada:', requestId);
});

// Notificaciones de respuesta
socket.on('musician_response', (responseData) => {
  console.log('Nueva respuesta:', responseData);
});
```

## Documentación Adicional

- [API de Solicitudes de Músicos](./MUSICIAN_REQUESTS_API.md) - Documentación completa del nuevo sistema
- [Integración Frontend](./FRONTEND_INTEGRATION.md) - Guía de integración
- [Manejo de Errores](./ERROR_HANDLING.md) - Estrategias de error handling
- [Seguridad](./SECURITY.md) - Medidas de seguridad implementadas

## Próximos Pasos

1. **Implementar notificaciones en tiempo real** para el nuevo sistema
2. **Migrar funcionalidades legacy** al nuevo sistema
3. **Agregar funcionalidades avanzadas** (mapas, chat, pagos)
4. **Optimizar rendimiento** y escalabilidad

---

**Nota**: Se recomienda usar el nuevo sistema de solicitudes de músicos para todas las nuevas funcionalidades, ya que proporciona mejor UX, validaciones más robustas y cálculo automático de tarifas. 