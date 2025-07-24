# API de Solicitudes de Músicos (`/musician-requests`)

Esta API permite a los usuarios crear, aceptar, cancelar y consultar el estado de solicitudes para músicos. Es un flujo alternativo al de eventos, pensado para solicitudes directas y rápidas.

---

## Endpoints

### 1. Crear solicitud de músico
- **POST** `/musician-requests/`
- **Body:**
```json
{
  "userId": "string",           // ID o email del organizador
  "eventType": "string",        // Tipo de evento
  "date": "YYYY-MM-DD",         // Fecha del evento
  "startTime": "HH:mm",
  "endTime": "HH:mm",
  "location": "string",
  "instrument": "string",
  "budget": "string",
  "comments": "string"
}
```
- **Response 201:**
```json
{
  "id": "string",               // ID de la solicitud
  "userId": "string",
  "eventType": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:mm - HH:mm",
  "location": "string",
  "instrument": "string",
  "budget": "string",
  "comments": "string",
  "status": "pendiente"
}
```
- **Errores:** 500 (error de validación o servidor)

---

### 2. Aceptar solicitud de músico
- **POST** `/musician-requests/accept`
- **Body:**
```json
{
  "requestId": "string",        // ID de la solicitud
  "musicianId": "string"        // ID o email del músico
}
```
- **Response 200:**
```json
{ "success": true }
```
- **Errores:**
  - 404: Solicitud no encontrada
  - 400: Solicitud ya tomada o no disponible
  - 500: Error de servidor

---

### 3. Cancelar solicitud de músico
- **POST** `/musician-requests/cancel`
- **Body:**
```json
{
  "requestId": "string"
}
```
- **Response 200:**
```json
{ "success": true }
```
- **Errores:**
  - 404: Solicitud no encontrada
  - 500: Error de servidor

---

### 4. Consultar estado de solicitud
- **GET** `/musician-requests/:id/status`
- **Response 200:**
```json
{
  "userId": "string",
  "eventType": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:mm - HH:mm",
  "location": "string",
  "instrument": "string",
  "budget": "string",
  "comments": "string",
  "status": "pendiente" | "asignada" | "cancelada",
  "assignedMusicianId"?: "string"
}
```
- **Errores:**
  - 404: Solicitud no encontrada
  - 500: Error de servidor

---

## Flujo de negocio
1. El organizador crea una solicitud de músico.
2. Todos los músicos conectados reciben una notificación en tiempo real (`io.emit('new_event_request', ...)`).
3. El primer músico que acepte la solicitud la toma y se notifica a todos (`io.emit('musician_accepted', ...)`).
4. El organizador puede cancelar la solicitud si aún está pendiente.
5. Cualquier usuario puede consultar el estado de la solicitud por ID.

---

## Seguridad y roles
- Solo usuarios autenticados pueden crear, aceptar o cancelar solicitudes.
- El backend debe validar el rol del usuario (organizador/músico) según corresponda.
- El middleware de autenticación debe estar activo en producción.

---

## Manejo de errores
- 404: Cuando la solicitud no existe.
- 400: Cuando la solicitud ya fue tomada o está cancelada.
- 500: Errores internos del servidor o de validación.

---

## Notas
- Los eventos de socket permiten notificaciones en tiempo real a músicos y organizadores.
- El endpoint `/musician-requests` es independiente del flujo de `/events`, pero ambos pueden coexistir.
- Si necesitas ejemplos de integración frontend, revisa `docs/FRONTEND_INTEGRATION.md`. 