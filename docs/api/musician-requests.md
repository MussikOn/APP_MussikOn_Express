# 🎼 API de Solicitudes de Músicos

> **Documentación completa de la API para gestión de solicitudes de músicos**

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Modelo de Datos](#modelo-de-datos)
- [Endpoints](#endpoints)
- [Estados de Solicitud](#estados-de-solicitud)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Eventos Socket.IO](#eventos-socketio)
- [Errores y Códigos](#errores-y-códigos)
- [Consideraciones de Seguridad](#consideraciones-de-seguridad)

## 🎯 Descripción General

La API de Solicitudes de Músicos permite a los organizadores de eventos crear solicitudes para contratar músicos, y a los músicos aceptar o rechazar estas solicitudes. El sistema incluye notificaciones en tiempo real y gestión completa del ciclo de vida de las solicitudes.

### ✅ Estado de Implementación

**CRUD COMPLETAMENTE IMPLEMENTADO** ✅

- ✅ **Crear solicitud** - `POST /musician-requests`
- ✅ **Obtener solicitud** - `GET /musician-requests/:id`
- ✅ **Actualizar solicitud** - `PUT /musician-requests/:id`
- ✅ **Eliminar solicitud** - `DELETE /musician-requests/:id`
- ✅ **Consultar estado** - `GET /musician-requests/:id/status`
- ✅ **Aceptar solicitud** - `POST /musician-requests/accept`
- ✅ **Cancelar solicitud** - `POST /musician-requests/cancel`

## 📊 Modelo de Datos

### Interface MusicianRequest

```typescript
interface MusicianRequest {
  id?: string;                                    // ID único de la solicitud
  userId: string;                                 // ID del usuario que crea la solicitud
  eventType: string;                              // Tipo de evento (concierto, boda, etc.)
  date: string;                                   // Fecha del evento (YYYY-MM-DD)
  time: string;                                   // Hora del evento (HH:MM)
  location: string;                               // Ubicación del evento
  instrument: string;                             // Instrumento requerido
  budget: number;                                 // Presupuesto disponible
  status: 'pendiente' | 'asignada' | 'cancelada' | 'completada' | 'no_asignada';
  assignedMusicianId?: string;                    // ID del músico asignado
  createdAt: FirebaseFirestore.Timestamp;         // Fecha de creación
  updatedAt: FirebaseFirestore.Timestamp;         // Fecha de última actualización
  description?: string;                           // Descripción adicional
  requirements?: string;                          // Requisitos específicos
  contactPhone?: string;                          // Teléfono de contacto
  contactEmail?: string;                          // Email de contacto
}
```

### Tipos de Evento

```typescript
type EventType = 
  | 'concierto'
  | 'boda'
  | 'culto'
  | 'evento_corporativo'
  | 'festival'
  | 'fiesta_privada'
  | 'graduacion'
  | 'cumpleanos'
  | 'otro';
```

### Instrumentos Soportados

```typescript
type Instrument = 
  | 'guitarra'
  | 'piano'
  | 'bajo'
  | 'bateria'
  | 'saxofon'
  | 'trompeta'
  | 'violin'
  | 'canto'
  | 'teclado'
  | 'flauta'
  | 'otro';
```

## 📡 Endpoints

### 🆕 Crear Solicitud

**POST** `/musician-requests`

Crea una nueva solicitud de músico.

#### Request Body

```json
{
  "eventType": "boda",
  "date": "2024-12-25",
  "time": "18:00",
  "location": "Salón de Eventos ABC",
  "instrument": "piano",
  "budget": 50000,
  "description": "Necesitamos un pianista para ceremonia y recepción",
  "requirements": "Repertorio romántico y clásico",
  "contactPhone": "+1234567890",
  "contactEmail": "organizador@evento.com"
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Solicitud creada correctamente",
  "data": {
    "id": "request_123456",
    "userId": "user_789",
    "eventType": "boda",
    "date": "2024-12-25",
    "time": "18:00",
    "location": "Salón de Eventos ABC",
    "instrument": "piano",
    "budget": 50000,
    "status": "pendiente",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 📖 Obtener Solicitud

**GET** `/musician-requests/:id`

Obtiene una solicitud específica por su ID.

#### Response (200 OK)

```json
{
  "id": "request_123456",
  "userId": "user_789",
  "eventType": "boda",
  "date": "2024-12-25",
  "time": "18:00",
  "location": "Salón de Eventos ABC",
  "instrument": "piano",
  "budget": 50000,
  "status": "pendiente",
  "assignedMusicianId": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "description": "Necesitamos un pianista para ceremonia y recepción",
  "requirements": "Repertorio romántico y clásico",
  "contactPhone": "+1234567890",
  "contactEmail": "organizador@evento.com"
}
```

### ✏️ Actualizar Solicitud

**PUT** `/musician-requests/:id`

Actualiza una solicitud existente.

#### Request Body

```json
{
  "date": "2024-12-26",
  "time": "19:00",
  "location": "Salón de Eventos XYZ",
  "budget": 60000,
  "description": "Actualización: Necesitamos un pianista para ceremonia, recepción y baile"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Solicitud actualizada correctamente",
  "data": {
    "id": "request_123456",
    "updatedAt": "2024-01-15T11:45:00Z"
  }
}
```

### 🗑️ Eliminar Solicitud

**DELETE** `/musician-requests/:id`

Elimina una solicitud específica.

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Solicitud eliminada correctamente"
}
```

### 📊 Consultar Estado

**GET** `/musician-requests/:id/status`

Obtiene solo el estado actual de una solicitud.

#### Response (200 OK)

```json
{
  "id": "request_123456",
  "status": "asignada",
  "assignedMusicianId": "musician_456",
  "assignedAt": "2024-01-15T12:00:00Z"
}
```

### ✅ Aceptar Solicitud

**POST** `/musician-requests/accept`

Permite a un músico aceptar una solicitud.

#### Request Body

```json
{
  "requestId": "request_123456",
  "musicianId": "musician_456",
  "message": "Estoy disponible para tocar en tu boda"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Solicitud aceptada correctamente",
  "data": {
    "requestId": "request_123456",
    "musicianId": "musician_456",
    "status": "asignada",
    "assignedAt": "2024-01-15T12:00:00Z"
  }
}
```

### ❌ Cancelar Solicitud

**POST** `/musician-requests/cancel`

Cancela una solicitud (solo el creador o admin).

#### Request Body

```json
{
  "requestId": "request_123456",
  "reason": "Evento cancelado por el cliente"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Solicitud cancelada correctamente",
  "data": {
    "requestId": "request_123456",
    "status": "cancelada",
    "cancelledAt": "2024-01-15T13:00:00Z",
    "reason": "Evento cancelado por el cliente"
  }
}
```

## 🔄 Estados de Solicitud

### Estados Disponibles

| Estado | Descripción | Acciones Permitidas |
|--------|-------------|-------------------|
| `pendiente` | Solicitud creada, esperando músico | Aceptar, Cancelar, Actualizar |
| `asignada` | Músico asignado al evento | Completar, Cancelar |
| `cancelada` | Solicitud cancelada | Solo consulta |
| `completada` | Evento realizado exitosamente | Solo consulta |
| `no_asignada` | No se encontró músico disponible | Solo consulta |

### Flujo de Estados

```
pendiente → asignada → completada
    ↓
cancelada
    ↓
no_asignada
```

## 💡 Ejemplos de Uso

### Ejemplo 1: Crear Solicitud para Boda

```bash
curl -X POST http://localhost:1000/musician-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventType": "boda",
    "date": "2024-12-25",
    "time": "18:00",
    "location": "Salón de Eventos ABC",
    "instrument": "piano",
    "budget": 50000,
    "description": "Necesitamos un pianista para ceremonia y recepción",
    "requirements": "Repertorio romántico y clásico"
  }'
```

### Ejemplo 2: Aceptar Solicitud

```bash
curl -X POST http://localhost:1000/musician-requests/accept \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "requestId": "request_123456",
    "musicianId": "musician_456",
    "message": "Estoy disponible para tocar en tu boda"
  }'
```

### Ejemplo 3: Consultar Estado

```bash
curl -X GET http://localhost:1000/musician-requests/request_123456/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Ejemplo 4: Actualizar Solicitud

```bash
curl -X PUT http://localhost:1000/musician-requests/request_123456 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "time": "19:00",
    "budget": 60000,
    "description": "Actualización: Necesitamos un pianista para ceremonia, recepción y baile"
  }'
```

## 🔌 Eventos Socket.IO

### Eventos Emitidos

#### Nueva Solicitud Creada
```javascript
// Emitido cuando se crea una nueva solicitud
socket.emit('new_event_request', {
  id: 'request_123456',
  userId: 'user_789',
  eventType: 'boda',
  instrument: 'piano',
  location: 'Salón de Eventos ABC',
  date: '2024-12-25',
  budget: 50000
});
```

#### Solicitud Aceptada
```javascript
// Emitido cuando un músico acepta la solicitud
socket.emit('musician_accepted', {
  requestId: 'request_123456',
  musician: {
    id: 'musician_456',
    name: 'Juan Pérez',
    instrument: 'piano'
  },
  assignedAt: '2024-01-15T12:00:00Z'
});
```

#### Solicitud Cancelada
```javascript
// Emitido cuando se cancela una solicitud
socket.emit('request_cancelled', {
  requestId: 'request_123456',
  reason: 'Evento cancelado por el cliente',
  cancelledAt: '2024-01-15T13:00:00Z'
});
```

#### Solicitud Actualizada
```javascript
// Emitido cuando se actualiza una solicitud
socket.emit('request_updated', {
  requestId: 'request_123456',
  changes: {
    time: '19:00',
    budget: 60000,
    description: 'Actualización: Necesitamos un pianista para ceremonia, recepción y baile'
  },
  updatedAt: '2024-01-15T11:45:00Z'
});
```

#### Solicitud Eliminada
```javascript
// Emitido cuando se elimina una solicitud
socket.emit('request_deleted', {
  requestId: 'request_123456',
  deletedAt: '2024-01-15T14:00:00Z'
});
```

### Eventos de Escucha

```javascript
// Escuchar nuevas solicitudes (para músicos)
socket.on('new_event_request', (data) => {
  console.log('Nueva solicitud disponible:', data);
  // Mostrar notificación al músico
});

// Escuchar cuando se acepta una solicitud (para organizadores)
socket.on('musician_accepted', (data) => {
  console.log('Solicitud aceptada:', data);
  // Mostrar notificación al organizador
});

// Escuchar cancelaciones
socket.on('request_cancelled', (data) => {
  console.log('Solicitud cancelada:', data);
  // Actualizar UI
});
```

## ⚠️ Errores y Códigos

### Códigos de Error Comunes

| Código | Descripción | Solución |
|--------|-------------|----------|
| `400` | Bad Request - Datos inválidos | Verificar formato de datos |
| `401` | Unauthorized - Token inválido | Renovar token de autenticación |
| `403` | Forbidden - Sin permisos | Verificar rol de usuario |
| `404` | Not Found - Solicitud no encontrada | Verificar ID de solicitud |
| `409` | Conflict - Solicitud ya asignada | Verificar estado actual |
| `422` | Unprocessable Entity - Validación fallida | Verificar datos requeridos |
| `500` | Internal Server Error | Contactar soporte |

### Ejemplos de Respuestas de Error

#### 404 - Solicitud No Encontrada
```json
{
  "error": "Solicitud no encontrada",
  "code": "REQUEST_NOT_FOUND",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 409 - Solicitud Ya Asignada
```json
{
  "error": "La solicitud ya ha sido asignada a otro músico",
  "code": "REQUEST_ALREADY_ASSIGNED",
  "assignedMusicianId": "musician_456",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 422 - Validación Fallida
```json
{
  "error": "Datos de entrada inválidos",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "date",
      "message": "La fecha debe ser futura"
    },
    {
      "field": "budget",
      "message": "El presupuesto debe ser mayor a 0"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔒 Consideraciones de Seguridad

### Autenticación y Autorización

- **JWT Required**: Todos los endpoints requieren token JWT válido
- **Role-based Access**: Diferentes permisos según rol de usuario
- **Owner Validation**: Solo el creador puede modificar/eliminar su solicitud
- **Admin Override**: Administradores pueden gestionar todas las solicitudes

### Validaciones de Datos

- **Date Validation**: Fechas deben ser futuras
- **Budget Validation**: Presupuesto debe ser positivo
- **Instrument Validation**: Instrumento debe estar en lista permitida
- **Location Sanitization**: Ubicación se sanitiza para prevenir XSS

### Rate Limiting

- **Create Requests**: Máximo 10 solicitudes por hora por usuario
- **Accept Requests**: Máximo 5 aceptaciones por hora por músico
- **Status Queries**: Máximo 100 consultas por hora por usuario

### Auditoría

- **Action Logging**: Todas las acciones se registran
- **User Tracking**: Se registra quién realiza cada acción
- **Timestamp Recording**: Todas las acciones tienen timestamp
- **Change History**: Se mantiene historial de cambios

## 📊 Métricas y Analytics

### Métricas Disponibles

- **Total de solicitudes** por período
- **Solicitudes por estado** (pendiente, asignada, cancelada, completada)
- **Solicitudes por instrumento** más solicitados
- **Solicitudes por tipo de evento** más populares
- **Tiempo promedio** de asignación
- **Tasa de aceptación** de solicitudes

### Endpoints de Analytics

```bash
# Obtener estadísticas generales
GET /admin/musician-requests/stats

# Obtener solicitudes por estado
GET /admin/musician-requests/status/:status

# Obtener solicitudes por instrumento
GET /admin/musician-requests/instrument/:instrument

# Obtener solicitudes por rango de fechas
GET /admin/musician-requests/date-range?start=2024-01-01&end=2024-01-31
```

## 🚀 Próximas Funcionalidades

### 🔍 Búsqueda y Filtros Avanzados
- [ ] Búsqueda por texto libre
- [ ] Filtrado por rango de presupuesto
- [ ] Filtrado por ubicación geográfica
- [ ] Filtrado por disponibilidad de músicos

### 📱 Notificaciones Push
- [ ] Notificaciones push para nuevas solicitudes
- [ ] Recordatorios de eventos próximos
- [ ] Notificaciones de cambios de estado

### 💬 Chat Integrado
- [ ] Chat en tiempo real entre organizador y músico
- [ ] Compartir archivos y documentos
- [ ] Historial de conversaciones

### 📍 Geolocalización
- [ ] Búsqueda por proximidad geográfica
- [ ] Mapa de eventos y músicos
- [ ] Cálculo de distancias

---

**Última actualización**: CRUD completo implementado ✅

**Versión de la API**: 1.0.0

**Estado**: ✅ PRODUCCIÓN 