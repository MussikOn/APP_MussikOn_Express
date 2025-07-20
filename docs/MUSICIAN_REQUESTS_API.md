# API de Solicitudes de Músicos - MusikOn

## Descripción General

Esta API maneja el sistema de solicitudes de músicos para eventos religiosos. Los organizadores pueden crear solicitudes que expiran en 30 minutos si no encuentran un músico disponible. El sistema calcula automáticamente las tarifas basándose en la duración y tipo de evento.

## Base URL
```
http://localhost:1000/musician-requests
```

## Autenticación

Todos los endpoints requieren autenticación JWT. Incluye el token en el header:
```
Authorization: Bearer <JWT_TOKEN>
```

## Endpoints

### 1. Crear Solicitud de Músico

**POST** `/create`

Crea una nueva solicitud de músico con cálculo automático de tarifas.

#### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

#### Body (Form Data)
```json
{
  "organizerId": "organizador@email.com",
  "organizerName": "Juan Pérez",
  "eventName": "Culto de Domingo",
  "eventType": "culto",
  "eventDate": "2024-02-15",
  "startTime": "09:00",
  "endTime": "12:00",
  "location": "Iglesia Central, Santo Domingo",
  "locationCoordinates": {
    "latitude": 18.4861,
    "longitude": -69.9312
  },
  "instrumentType": "Piano",
  "eventDescription": "Culto dominical con música en vivo",
  "flyer": [archivo de imagen opcional]
}
```

#### Tipos de Eventos Válidos
- `culto`: Culto regular
- `campana_dentro_templo`: Campaña dentro del templo
- `otro`: Otros tipos de eventos

#### Tipos de Instrumentos Válidos
- Piano
- Guitarra
- Bajo
- Batería
- Teclado
- Saxofón
- Trompeta
- Violín
- Flauta
- Vocalista
- Coro
- Otro

#### Cálculo de Tarifas

**Para Culto:**
- Base: RD$ 800 por 2 horas
- Adicional: RD$ 650 por hora
- Gracias: 30 minutos
- Mínimo cobro: 10 minutos

**Para Campaña:**
- Base: RD$ 1,200 por 2 horas
- Adicional: RD$ 850 por hora
- Gracias: 30 minutos
- Mínimo cobro: 10 minutos

#### Ejemplo de Cálculo
- Evento de 2 horas: RD$ 800
- Evento de 2.5 horas: RD$ 800 + (RD$ 650/2) = RD$ 1,125
- Evento de 3 horas: RD$ 800 + RD$ 650 = RD$ 1,450

#### Response (201)
```json
{
  "success": true,
  "message": "Solicitud de músico creada exitosamente",
  "data": {
    "request": {
      "id": "request_123",
      "organizerId": "organizador@email.com",
      "organizerName": "Juan Pérez",
      "eventName": "Culto de Domingo",
      "eventType": "culto",
      "eventDate": "2024-02-15",
      "startTime": "09:00",
      "endTime": "12:00",
      "location": "Iglesia Central, Santo Domingo",
      "instrumentType": "Piano",
      "eventDescription": "Culto dominical con música en vivo",
      "flyerUrl": "https://example.com/flyer.jpg",
      "calculatedPrice": 1125,
      "status": "searching_musician",
      "searchExpiryTime": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    "searchExpiryTime": "2024-01-15T10:30:00.000Z",
    "calculatedPrice": 1125
  }
}
```

### 2. Obtener Solicitudes Disponibles

**GET** `/available`

Obtiene todas las solicitudes disponibles para músicos.

#### Query Parameters
- `instrumentType` (opcional): Filtrar por tipo de instrumento

#### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

#### Ejemplo de Request
```
GET /available?instrumentType=Piano
```

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "request_123",
      "organizerId": "organizador@email.com",
      "organizerName": "Juan Pérez",
      "eventName": "Culto de Domingo",
      "eventType": "culto",
      "eventDate": "2024-02-15",
      "startTime": "09:00",
      "endTime": "12:00",
      "location": "Iglesia Central, Santo Domingo",
      "instrumentType": "Piano",
      "eventDescription": "Culto dominical con música en vivo",
      "flyerUrl": "https://example.com/flyer.jpg",
      "calculatedPrice": 1125,
      "status": "searching_musician",
      "searchExpiryTime": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### 3. Responder a Solicitud

**POST** `/respond/:requestId`

Permite a un músico responder a una solicitud disponible.

#### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Body
```json
{
  "musicianId": "musico@email.com",
  "musicianName": "María García",
  "message": "Estoy disponible para tocar el piano",
  "proposedPrice": 750
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Respuesta enviada exitosamente",
  "data": {
    "id": "response_456",
    "requestId": "request_123",
    "musicianId": "musico@email.com",
    "musicianName": "María García",
    "status": "pending",
    "message": "Estoy disponible para tocar el piano",
    "proposedPrice": 750,
    "createdAt": "2024-01-15T10:15:00.000Z"
  }
}
```

### 4. Aceptar Músico

**POST** `/accept/:requestId/:musicianId`

Permite al organizador aceptar la respuesta de un músico.

#### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

#### Response (200)
```json
{
  "success": true,
  "message": "Músico aceptado exitosamente",
  "data": {
    "request": {
      "id": "request_123",
      "status": "musician_found",
      "assignedMusicianId": "musico@email.com"
    },
    "response": {
      "id": "response_456",
      "status": "accepted"
    }
  }
}
```

### 5. Obtener Solicitudes del Organizador

**GET** `/organizer/:organizerId`

Obtiene todas las solicitudes creadas por un organizador.

#### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "request_123",
      "organizerId": "organizador@email.com",
      "eventName": "Culto de Domingo",
      "eventType": "culto",
      "status": "musician_found",
      "calculatedPrice": 1125,
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": "request_124",
      "organizerId": "organizador@email.com",
      "eventName": "Campaña de Jóvenes",
      "eventType": "campana_dentro_templo",
      "status": "expired",
      "calculatedPrice": 1200,
      "createdAt": "2024-01-14T15:00:00.000Z"
    }
  ]
}
```

### 6. Cancelar Solicitud

**POST** `/cancel/:requestId`

Cancela una solicitud activa.

#### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Body
```json
{
  "organizerId": "organizador@email.com"
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Solicitud cancelada exitosamente",
  "data": {
    "id": "request_123",
    "status": "cancelled"
  }
}
```

### 7. Renviar Solicitud Expirada

**POST** `/resend/:requestId`

Renvia una solicitud que expiró sin encontrar músico.

#### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Body
```json
{
  "organizerId": "organizador@email.com"
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Solicitud renviada exitosamente",
  "data": {
    "request": {
      "id": "request_123",
      "status": "searching_musician"
    },
    "searchExpiryTime": "2024-01-15T11:00:00.000Z"
  }
}
```

## Estados de Solicitud

| Estado | Descripción |
|--------|-------------|
| `searching_musician` | Buscando músico (activo) |
| `musician_found` | Músico encontrado y aceptado |
| `completed` | Evento completado |
| `expired` | Solicitud expirada (30 minutos) |
| `cancelled` | Solicitud cancelada por organizador |

## Códigos de Error

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": [
    "La hora de fin debe ser después de la hora de inicio",
    "eventName is required"
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Token de acceso inválido"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Solicitud no encontrada o ya no está disponible"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

## Validaciones

### Fechas y Horarios
- La fecha del evento debe ser futura
- La hora de fin debe ser posterior a la hora de inicio
- Formato de hora: HH:mm (24 horas)

### Campos Requeridos
- `organizerId`: Email válido
- `organizerName`: 2-100 caracteres
- `eventName`: 3-200 caracteres
- `eventType`: Uno de los tipos válidos
- `eventDate`: Fecha ISO válida
- `startTime`: Formato HH:mm
- `endTime`: Formato HH:mm
- `location`: 5-500 caracteres
- `instrumentType`: 2-100 caracteres
- `eventDescription`: 10-1000 caracteres

### Archivos
- Solo se aceptan imágenes (JPG, PNG)
- Tamaño máximo: 5MB
- Campo opcional: `flyer`

## Notas Importantes

1. **Expiración Automática**: Las solicitudes expiran automáticamente después de 30 minutos si no encuentran un músico.

2. **Cálculo de Tarifas**: El sistema calcula automáticamente las tarifas basándose en la duración y tipo de evento.

3. **Subida de Imágenes**: Se aceptan archivos de imagen (JPG, PNG) hasta 5MB.

4. **Validación de Horarios**: La hora de fin debe ser posterior a la hora de inicio.

5. **Autenticación**: Todos los endpoints requieren autenticación JWT válida.

6. **Coordenadas**: Las coordenadas de ubicación son opcionales pero recomendadas para funcionalidades de mapa.

## Ejemplos de Uso Frontend

### Crear Solicitud
```javascript
const formData = new FormData();
formData.append('organizerId', 'user@email.com');
formData.append('organizerName', 'Juan Pérez');
formData.append('eventName', 'Culto de Domingo');
formData.append('eventType', 'culto');
formData.append('eventDate', '2024-02-15');
formData.append('startTime', '09:00');
formData.append('endTime', '12:00');
formData.append('location', 'Iglesia Central');
formData.append('instrumentType', 'Piano');
formData.append('eventDescription', 'Culto dominical con música en vivo');

if (flyerImage) {
  formData.append('flyer', flyerImage);
}

const response = await fetch('/musician-requests/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Obtener Solicitudes Disponibles
```javascript
const response = await fetch('/musician-requests/available?instrumentType=Piano', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Responder a Solicitud
```javascript
const response = await fetch('/musician-requests/respond/request_123', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    musicianId: 'musico@email.com',
    musicianName: 'María García',
    message: 'Estoy disponible',
    proposedPrice: 750
  })
});
``` 