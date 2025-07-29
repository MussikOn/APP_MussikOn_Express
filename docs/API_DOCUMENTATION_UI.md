# 📚 API Documentation UI

> **Documentación completa de endpoints con ejemplos y casos de uso**

## 📋 Tabla de Contenidos

- [Autenticación](#autenticación)
- [Eventos](#eventos)
- [Solicitudes de Músicos](#solicitudes-de-músicos)
- [Chat y Comunicación](#chat-y-comunicación)
- [Usuarios](#usuarios)
- [Imágenes](#imágenes)
- [Administración](#administración)
- [Socket.IO Events](#socketio-events)

## 🔐 Autenticación

### Registro de Usuario

**POST** `/auth/register`

```json
{
  "name": "Juan",
  "lastName": "Pérez",
  "userEmail": "juan@example.com",
  "userPassword": "Password123!",
  "roll": "eventCreator"
}
```

**Response (201)**
```json
{
  "success": true,
  "message": "Usuario registrado correctamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "name": "Juan",
    "lastName": "Pérez",
    "userEmail": "juan@example.com",
    "roll": "eventCreator"
  }
}
```

### Login de Usuario

**POST** `/auth/login`

```json
{
  "userEmail": "juan@example.com",
  "userPassword": "Password123!"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "name": "Juan",
    "lastName": "Pérez",
    "userEmail": "juan@example.com",
    "roll": "eventCreator"
  }
}
```

### Verificar Token

**GET** `/auth/verify`

**Headers**: `Authorization: Bearer <token>`

**Response (200)**
```json
{
  "valid": true,
  "user": {
    "id": "user_123",
    "name": "Juan",
    "lastName": "Pérez",
    "userEmail": "juan@example.com",
    "roll": "eventCreator"
  }
}
```

## 🎵 Eventos

### Crear Evento

**POST** `/events`

```json
{
  "eventName": "Boda de María y Juan",
  "eventType": "boda",
  "date": "2024-12-25",
  "time": "18:00",
  "location": "Salón de Eventos ABC",
  "instrument": "piano",
  "budget": "50000",
  "description": "Ceremonia y recepción"
}
```

**Response (201)**
```json
{
  "success": true,
  "message": "Evento creado correctamente",
  "event": {
    "id": "event_123",
    "user": "user_123",
    "eventName": "Boda de María y Juan",
    "eventType": "boda",
    "date": "2024-12-25",
    "time": "18:00",
    "location": "Salón de Eventos ABC",
    "instrument": "piano",
    "budget": "50000",
    "status": "pending_musician",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Obtener Eventos

**GET** `/events`

**Response (200)**
```json
{
  "events": [
    {
      "id": "event_123",
      "user": "user_123",
      "eventName": "Boda de María y Juan",
      "eventType": "boda",
      "date": "2024-12-25",
      "time": "18:00",
      "location": "Salón de Eventos ABC",
      "instrument": "piano",
      "budget": "50000",
      "status": "pending_musician",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

### Obtener Evento por ID

**GET** `/events/:id`

**Response (200)**
```json
{
  "id": "event_123",
  "user": "user_123",
  "eventName": "Boda de María y Juan",
  "eventType": "boda",
  "date": "2024-12-25",
  "time": "18:00",
  "location": "Salón de Eventos ABC",
  "instrument": "piano",
  "budget": "50000",
  "status": "pending_musician",
  "assignedMusicianId": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Actualizar Evento

**PUT** `/events/:id`

```json
{
  "eventName": "Boda de María y Juan - Actualizado",
  "time": "19:00",
  "budget": "60000"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Evento actualizado correctamente",
  "event": {
    "id": "event_123",
    "updatedAt": "2024-01-15T11:45:00Z"
  }
}
```

### Eliminar Evento

**DELETE** `/events/:id`

**Response (200)**
```json
{
  "success": true,
  "message": "Evento eliminado correctamente"
}
```

## 🎼 Solicitudes de Músicos

### Crear Solicitud ✅

**POST** `/musician-requests`

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

**Response (201)**
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

### Obtener Solicitud por ID ✅

**GET** `/musician-requests/:id`

**Response (200)**
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

### Actualizar Solicitud ✅

**PUT** `/musician-requests/:id`

```json
{
  "date": "2024-12-26",
  "time": "19:00",
  "location": "Salón de Eventos XYZ",
  "budget": 60000,
  "description": "Actualización: Necesitamos un pianista para ceremonia, recepción y baile"
}
```

**Response (200)**
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

### Eliminar Solicitud ✅

**DELETE** `/musician-requests/:id`

**Response (200)**
```json
{
  "success": true,
  "message": "Solicitud eliminada correctamente"
}
```

### Consultar Estado ✅

**GET** `/musician-requests/:id/status`

**Response (200)**
```json
{
  "id": "request_123456",
  "status": "asignada",
  "assignedMusicianId": "musician_456",
  "assignedAt": "2024-01-15T12:00:00Z"
}
```

### Aceptar Solicitud ✅

**POST** `/musician-requests/accept`

```json
{
  "requestId": "request_123456",
  "musicianId": "musician_456",
  "message": "Estoy disponible para tocar en tu boda"
}
```

**Response (200)**
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

### Cancelar Solicitud ✅

**POST** `/musician-requests/cancel`

```json
{
  "requestId": "request_123456",
  "reason": "Evento cancelado por el cliente"
}
```

**Response (200)**
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

## 💬 Chat y Comunicación

### Crear Conversación

**POST** `/chat/conversations`

```json
{
  "participants": ["user1@example.com", "user2@example.com"],
  "title": "Conversación sobre evento",
  "type": "private"
}
```

**Response (201)**
```json
{
  "success": true,
  "conversation": {
    "id": "conversation_123",
    "participants": ["user1@example.com", "user2@example.com"],
    "title": "Conversación sobre evento",
    "type": "private",
    "createdAt": "2024-01-15T12:00:00Z",
    "lastMessage": null,
    "unreadCount": 0
  }
}
```

### Obtener Conversaciones del Usuario

**GET** `/chat/conversations`

**Response (200)**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "conversation_123",
      "participants": ["user1@example.com", "user2@example.com"],
      "title": "Conversación sobre evento",
      "type": "private",
      "lastMessage": {
        "content": "Hola, ¿cómo estás?",
        "senderName": "Juan Pérez",
        "timestamp": "2024-01-15T12:00:00Z"
      },
      "unreadCount": 2
    }
  ]
}
```

### Obtener Mensajes de Conversación

**GET** `/chat/conversations/:conversationId/messages?limit=50&offset=0`

**Response (200)**
```json
{
  "success": true,
  "messages": [
    {
      "id": "message_456",
      "conversationId": "conversation_123",
      "senderId": "user_123",
      "senderName": "Juan Pérez",
      "content": "Hola, ¿cómo estás?",
      "type": "text",
      "status": "sent",
      "timestamp": "2024-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Marcar Mensajes como Leídos

**PUT** `/chat/conversations/:conversationId/messages/read`

```json
{
  "messageIds": ["message_456", "message_789"]
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Mensajes marcados como leídos",
  "updatedCount": 2
}
```

## 👥 Usuarios

### Obtener Todos los Usuarios

**GET** `/users`

**Response (200)**
```json
{
  "users": [
    {
      "id": "user_123",
      "name": "Juan",
      "lastName": "Pérez",
      "userEmail": "juan@example.com",
      "roll": "eventCreator",
      "status": true,
      "create_at": "2024-01-15T10:30:00Z",
      "update_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

### Obtener Usuario por ID

**GET** `/users/:id`

**Response (200)**
```json
{
  "id": "user_123",
  "name": "Juan",
  "lastName": "Pérez",
  "userEmail": "juan@example.com",
  "roll": "eventCreator",
  "status": true,
  "create_at": "2024-01-15T10:30:00Z",
  "update_at": "2024-01-15T10:30:00Z"
}
```

### Crear Usuario

**POST** `/users`

```json
{
  "name": "María",
  "lastName": "García",
  "userEmail": "maria@example.com",
  "userPassword": "Password123!",
  "roll": "musico"
}
```

**Response (201)**
```json
{
  "success": true,
  "message": "Usuario creado correctamente",
  "user": {
    "id": "user_456",
    "name": "María",
    "lastName": "García",
    "userEmail": "maria@example.com",
    "roll": "musico"
  }
}
```

### Actualizar Usuario

**PUT** `/users/:id`

```json
{
  "name": "María Elena",
  "lastName": "García López"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Usuario actualizado correctamente",
  "user": {
    "id": "user_456",
    "update_at": "2024-01-15T11:45:00Z"
  }
}
```

### Eliminar Usuario

**DELETE** `/users/:id`

**Response (200)**
```json
{
  "success": true,
  "message": "Usuario eliminado correctamente"
}
```

## 🖼️ Imágenes

### Subir Imagen

**POST** `/imgs/upload`

**Content-Type**: `multipart/form-data`

**Body**:
- `file`: Archivo de imagen
- `folder`: Carpeta de destino (opcional)
- `metadata`: Metadatos adicionales (opcional)

**Response (201)**
```json
{
  "success": true,
  "message": "Imagen subida correctamente",
  "data": {
    "id": "img_123",
    "filename": "evento_boda.jpg",
    "url": "https://bucket.s3.amazonaws.com/images/evento_boda.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg",
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Obtener Imagen

**GET** `/imgs/:id`

**Response (200)**
```json
{
  "id": "img_123",
  "filename": "evento_boda.jpg",
  "url": "https://bucket.s3.amazonaws.com/images/evento_boda.jpg",
  "size": 1024000,
  "mimeType": "image/jpeg",
  "metadata": {
    "eventId": "event_123",
    "uploadedBy": "user_123"
  },
  "uploadedAt": "2024-01-15T10:30:00Z"
}
```

### Eliminar Imagen

**DELETE** `/imgs/:id`

**Response (200)**
```json
{
  "success": true,
  "message": "Imagen eliminada correctamente"
}
```

### Obtener URL Firmada

**GET** `/imgs/getUrl/:key`

**Response (200)**
```json
{
  "url": "https://bucket.s3.amazonaws.com/images/evento_boda.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
  "expiresIn": 3600
}
```

## 🔧 Administración

### Obtener Solicitudes de Músicos (Admin)

**GET** `/admin/musician-requests`

**Headers**: `Authorization: Bearer <admin_token>`

**Response (200)**
```json
{
  "requests": [
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
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "stats": {
    "pending": 5,
    "assigned": 3,
    "cancelled": 1,
    "completed": 10
  }
}
```

### Actualizar Solicitud (Admin)

**PUT** `/admin/musician-requests/:id`

**Headers**: `Authorization: Bearer <admin_token>`

```json
{
  "status": "completada",
  "notes": "Evento realizado exitosamente"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Solicitud actualizada",
  "data": {
    "id": "request_123456",
    "status": "completada",
    "updatedAt": "2024-01-15T14:00:00Z"
  }
}
```

### Obtener Usuarios (Admin)

**GET** `/admin/users`

**Headers**: `Authorization: Bearer <admin_token>`

**Response (200)**
```json
{
  "users": [
    {
      "id": "user_123",
      "name": "Juan",
      "lastName": "Pérez",
      "userEmail": "juan@example.com",
      "roll": "eventCreator",
      "status": true,
      "create_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "stats": {
    "total": 50,
    "active": 45,
    "inactive": 5,
    "byRole": {
      "musico": 20,
      "eventCreator": 15,
      "admin": 5,
      "usuario": 10
    }
  }
}
```

### Obtener Eventos (Admin)

**GET** `/admin/events`

**Headers**: `Authorization: Bearer <admin_token>`

**Response (200)**
```json
{
  "events": [
    {
      "id": "event_123",
      "user": "user_123",
      "eventName": "Boda de María y Juan",
      "eventType": "boda",
      "date": "2024-12-25",
      "time": "18:00",
      "location": "Salón de Eventos ABC",
      "instrument": "piano",
      "budget": "50000",
      "status": "pending_musician",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "stats": {
    "total": 25,
    "pending": 8,
    "assigned": 12,
    "completed": 5
  }
}
```

## 🔌 Socket.IO Events

### Eventos de Usuario

```javascript
// Usuario conectado
socket.emit('user_connected', {
  userId: 'user_123',
  name: 'Juan Pérez',
  timestamp: '2024-01-15T10:30:00Z'
});

// Usuario desconectado
socket.emit('user_disconnected', {
  userId: 'user_123',
  timestamp: '2024-01-15T11:30:00Z'
});

// Usuario escribiendo
socket.emit('user_typing', {
  userId: 'user_123',
  room: 'chat_456',
  timestamp: '2024-01-15T10:35:00Z'
});
```

### Eventos de Eventos

```javascript
// Nuevo evento creado
socket.emit('event_created', {
  id: 'event_123',
  eventName: 'Boda de María y Juan',
  eventType: 'boda',
  instrument: 'piano',
  location: 'Salón de Eventos ABC',
  date: '2024-12-25',
  budget: 50000,
  createdAt: '2024-01-15T10:30:00Z'
});

// Evento actualizado
socket.emit('event_updated', {
  id: 'event_123',
  changes: {
    time: '19:00',
    budget: 60000
  },
  updatedAt: '2024-01-15T11:45:00Z'
});

// Evento eliminado
socket.emit('event_deleted', {
  id: 'event_123',
  deletedAt: '2024-01-15T12:00:00Z'
});

// Estado de evento cambiado
socket.emit('event_status_changed', {
  id: 'event_123',
  oldStatus: 'pending_musician',
  newStatus: 'musician_assigned',
  assignedMusicianId: 'musician_456',
  changedAt: '2024-01-15T12:30:00Z'
});
```

### Eventos de Solicitudes

```javascript
// Nueva solicitud de músico
socket.emit('new_event_request', {
  id: 'request_123456',
  userId: 'user_789',
  eventType: 'boda',
  instrument: 'piano',
  location: 'Salón de Eventos ABC',
  date: '2024-12-25',
  budget: 50000,
  createdAt: '2024-01-15T10:30:00Z'
});

// Músico aceptó solicitud
socket.emit('musician_accepted', {
  requestId: 'request_123456',
  musician: {
    id: 'musician_456',
    name: 'Carlos Rodríguez',
    instrument: 'piano'
  },
  assignedAt: '2024-01-15T12:00:00Z'
});

// Solicitud cancelada
socket.emit('request_cancelled', {
  requestId: 'request_123456',
  reason: 'Evento cancelado por el cliente',
  cancelledAt: '2024-01-15T13:00:00Z'
});

// Solicitud actualizada
socket.emit('request_updated', {
  requestId: 'request_123456',
  changes: {
    time: '19:00',
    budget: 60000,
    description: 'Actualización: Necesitamos un pianista para ceremonia, recepción y baile'
  },
  updatedAt: '2024-01-15T11:45:00Z'
});

// Solicitud eliminada
socket.emit('request_deleted', {
  requestId: 'request_123456',
  deletedAt: '2024-01-15T14:00:00Z'
});
```

### Eventos de Chat y Comunicación

#### Eventos de Conexión y Registro

```javascript
// Registrar usuario en chat
socket.emit('chat-register', {
  userEmail: 'usuario@example.com',
  userName: 'Juan Pérez'
});

// Autenticar usuario
socket.emit('authenticate', {
  userEmail: 'usuario@example.com',
  userId: 'user_123'
});

// Confirmación de autenticación
socket.on('authenticated', {
  success: true,
  userEmail: 'usuario@example.com'
});
```

#### Eventos de Conversación

```javascript
// Unirse a conversación
socket.emit('join-conversation', 'conversation_123');

// Salir de conversación
socket.emit('leave-conversation', 'conversation_123');
```

#### Eventos de Mensajes

```javascript
// Enviar mensaje
socket.emit('send-message', {
  conversationId: 'conversation_123',
  senderId: 'user_123',
  senderName: 'Juan Pérez',
  content: 'Hola, ¿cómo estás?',
  type: 'text' // 'text', 'image', 'audio', 'file'
});

// Nuevo mensaje recibido
socket.on('new-message', {
  id: 'message_456',
  conversationId: 'conversation_123',
  senderId: 'user_123',
  senderName: 'Juan Pérez',
  content: 'Hola, ¿cómo estás?',
  type: 'text',
  status: 'sent',
  timestamp: '2024-01-15T12:00:00Z'
});

// Marcar mensaje como leído
socket.emit('mark-message-read', {
  messageId: 'message_456',
  conversationId: 'conversation_123'
});

// Confirmación de mensaje leído
socket.on('message-read', {
  messageId: 'message_456'
});
```

#### Eventos de Indicadores

```javascript
// Indicador de escritura
socket.emit('typing', {
  conversationId: 'conversation_123',
  userEmail: 'usuario@example.com',
  isTyping: true
});

// Recibir indicador de escritura
socket.on('user-typing', {
  conversationId: 'conversation_123',
  userEmail: 'usuario@example.com',
  isTyping: true
});

// Estado de conexión
socket.emit('online-status', {
  userEmail: 'usuario@example.com',
  isOnline: true
});

// Cambio de estado de usuario
socket.on('user-status-changed', {
  userEmail: 'usuario@example.com',
  isOnline: true
});
```

#### Eventos de Notificación

```javascript
// Notificación de mensaje nuevo
socket.on('message-notification', {
  conversationId: 'conversation_123',
  message: {
    id: 'message_456',
    senderName: 'Juan Pérez',
    content: 'Hola, ¿cómo estás?'
  },
  unreadCount: 3
});

// Notificación personalizada
socket.on('notification', {
  title: 'Nueva solicitud',
  message: 'Tienes una nueva solicitud de músico',
  type: 'info',
  timestamp: '2024-01-15T12:00:00Z'
});
```
  timestamp: '2024-01-15T10:40:00Z'
});
```

## 🔧 Configuración de Cliente

### Headers Requeridos

```javascript
// Para todas las peticiones autenticadas
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

### Configuración de Socket.IO

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:1000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  },
  transports: ['websocket', 'polling']
});

// Manejo de eventos de conexión
socket.on('connect', () => {
  console.log('Conectado al servidor');
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor');
});

socket.on('connect_error', (error) => {
  console.error('Error de conexión:', error);
});
```

### Manejo de Errores

```javascript
// Interceptor para manejar errores globalmente
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado, redirigir a login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 📊 Códigos de Estado HTTP

| Código | Descripción | Uso |
|--------|-------------|-----|
| `200` | OK | Respuesta exitosa |
| `201` | Created | Recurso creado exitosamente |
| `400` | Bad Request | Datos de entrada inválidos |
| `401` | Unauthorized | Token inválido o faltante |
| `403` | Forbidden | Sin permisos para la operación |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Conflicto con el estado actual |
| `422` | Unprocessable Entity | Validación fallida |
| `500` | Internal Server Error | Error interno del servidor |

## 🔒 Consideraciones de Seguridad

### Autenticación
- Todos los endpoints requieren JWT válido (excepto login/register)
- Tokens expiran en 24 horas por defecto
- Refresh tokens próximamente

### Autorización
- Validación de roles en cada endpoint
- Solo el propietario puede modificar sus recursos
- Administradores tienen acceso completo

### Validación de Datos
- Sanitización de inputs
- Validación de tipos y formatos
- Límites de tamaño para archivos
- Protección contra inyección

### Rate Limiting
- Límites por usuario y por IP
- Protección contra spam y abuso
- Timeouts configurables

---

**Documentación actualizada al: $(date)**

**Versión de la API**: 1.0.0

**Estado**: ✅ PRODUCCIÓN - CRUD completo implementado 