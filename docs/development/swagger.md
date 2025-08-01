# Documentación Swagger Completa - MussikOn API

## Resumen Ejecutivo

API completa de MussikOn para conectar músicos con organizadores de eventos. Construida con Node.js, Express, TypeScript y Firebase.

## Información General

- **Título**: MussikOn API
- **Versión**: 1.0.0
- **Descripción**: API completa para gestión de músicos y eventos
- **Contacto**: soporte@mussikon.com
- **Licencia**: MIT

## Servidores

- **Desarrollo**: http://localhost:1000
- **Producción**: https://api.mussikon.com

## Autenticación

JWT Bearer Token en header `Authorization: Bearer <token>`

### Roles de Usuario
- `admin`: Administrador del sistema
- `superadmin`: Super administrador  
- `eventCreator`: Organizador de eventos
- `musician`: Músico

## Esquemas de Datos

### Usuario (User)
```yaml
User:
  type: object
  properties:
    name: { type: string }
    lastName: { type: string }
    userEmail: { type: string, format: email }
    userPassword: { type: string }
    roll: { type: string, enum: [admin, superadmin, eventCreator, musician] }
    create_at: { type: string, format: date-time }
    update_at: { type: string, format: date-time }
    delete_at: { type: string, format: date-time }
    status: { type: boolean }
```

### Evento (Event)
```yaml
Event:
  type: object
  properties:
    id: { type: string }
    user: { type: string }
    eventName: { type: string }
    eventType: { type: string, enum: [concierto, boda, culto, evento_corporativo, festival, fiesta_privada, graduacion, cumpleanos, otro] }
    date: { type: string, format: date }
    time: { type: string }
    location: { type: string }
    duration: { type: string }
    instrument: { type: string, enum: [guitarra, piano, bajo, bateria, saxofon, trompeta, violin, canto, teclado, flauta, otro] }
    bringInstrument: { type: boolean }
    comment: { type: string }
    budget: { type: string }
    flyerUrl: { type: string }
    songs: { type: array, items: { type: string } }
    recommendations: { type: array, items: { type: string } }
    mapsLink: { type: string }
    status: { type: string, enum: [pending_musician, musician_assigned, completed, cancelled, musician_cancelled] }
    assignedMusicianId: { type: string }
    interestedMusicians: { type: array, items: { type: string } }
    createdAt: { type: string, format: date-time }
    updatedAt: { type: string, format: date-time }
```

### Solicitud de Músico (MusicianRequest)
```yaml
MusicianRequest:
  type: object
  properties:
    id: { type: string }
    userId: { type: string }
    eventType: { type: string, enum: [concierto, boda, culto, evento_corporativo, festival, fiesta_privada, graduacion, cumpleanos, otro] }
    date: { type: string, format: date }
    time: { type: string }
    location: { type: string }
    instrument: { type: string, enum: [guitarra, piano, bajo, bateria, saxofon, trompeta, violin, canto, teclado, flauta, otro] }
    budget: { type: number }
    status: { type: string, enum: [pendiente, asignada, cancelada, completada, no_asignada] }
    assignedMusicianId: { type: string }
    description: { type: string }
    requirements: { type: string }
    contactPhone: { type: string }
    contactEmail: { type: string }
    createdAt: { type: string, format: date-time }
    updatedAt: { type: string, format: date-time }
```

### Imagen (Image)
```yaml
Image:
  type: object
  properties:
    id: { type: string }
    key: { type: string }
    url: { type: string }
    originalName: { type: string }
    fileName: { type: string }
    size: { type: number }
    mimetype: { type: string }
    category: { type: string, enum: [profile, post, event, gallery, admin] }
    userId: { type: string }
    description: { type: string }
    tags: { type: array, items: { type: string } }
    metadata: { type: object }
    isPublic: { type: boolean }
    isActive: { type: boolean }
    createdAt: { type: string, format: date-time }
    updatedAt: { type: string, format: date-time }
    expiresAt: { type: string, format: date-time }
```

### Mensaje (Message)
```yaml
Message:
  type: object
  properties:
    id: { type: string }
    conversationId: { type: string }
    senderId: { type: string }
    senderName: { type: string }
    content: { type: string }
    timestamp: { type: string, format: date-time }
    status: { type: string, enum: [sent, delivered, read] }
    type: { type: string, enum: [text, image, audio, file] }
```

### Conversación (Conversation)
```yaml
Conversation:
  type: object
  properties:
    id: { type: string }
    participants: { type: array, items: { type: string } }
    lastMessage: { $ref: '#/components/schemas/Message' }
    unreadCount: { type: number }
    updatedAt: { type: string, format: date-time }
    isActive: { type: boolean }
    createdAt: { type: string, format: date-time }
```

## Endpoints por Categoría

### 1. Autenticación (Auth)

#### POST /auth/Register
- **Descripción**: Registro de nuevo usuario
- **Body**: name, lastName, roll, userEmail, userPassword
- **Respuesta**: 200 (éxito) o 409 (usuario ya existe)

#### POST /auth/login
- **Descripción**: Inicio de sesión
- **Body**: userEmail, userPassword
- **Respuesta**: Token JWT

#### GET /auth/verToken
- **Descripción**: Verificar token JWT
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Datos del usuario autenticado

#### PUT /auth/update/:userEmail
- **Descripción**: Actualizar datos del usuario
- **Headers**: Authorization: Bearer <token>
- **Body**: Datos a actualizar
- **Respuesta**: Usuario actualizado

#### POST /auth/authEmail
- **Descripción**: Enviar email de verificación
- **Body**: userEmail
- **Respuesta**: Email enviado

#### POST /auth/validEmail/:validNumber
- **Descripción**: Validar código de email
- **Body**: validNumber
- **Respuesta**: Validación exitosa

#### POST /auth/addEvent
- **Descripción**: Agregar evento al usuario
- **Headers**: Authorization: Bearer <token>
- **Body**: Datos del evento
- **Respuesta**: Evento guardado

#### DELETE /auth/delete
- **Descripción**: Eliminar usuario
- **Headers**: Authorization: Bearer <token>
- **Body**: userEmail
- **Respuesta**: Usuario eliminado

### 2. Eventos (Events)

#### POST /events/request-musician
- **Descripción**: Crear solicitud de músico (Organizador)
- **Headers**: Authorization: Bearer <token>
- **Body**: Datos del evento
- **Respuesta**: Evento creado

#### GET /events/my-pending
- **Descripción**: Ver eventos pendientes del organizador
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Lista de eventos pendientes

#### GET /events/my-assigned
- **Descripción**: Ver eventos asignados del organizador
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Lista de eventos asignados

#### GET /events/my-completed
- **Descripción**: Ver eventos completados del organizador
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Lista de eventos completados

#### GET /events/available-requests
- **Descripción**: Ver solicitudes disponibles para músicos
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Lista de solicitudes disponibles

#### POST /events/:eventId/accept
- **Descripción**: Aceptar solicitud de evento (Músico)
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Evento aceptado

#### GET /events/my-scheduled
- **Descripción**: Ver eventos agendados del músico
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Lista de eventos agendados

#### GET /events/my-past-performances
- **Descripción**: Ver historial de actuaciones del músico
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Lista de eventos pasados

#### GET /events/my-events
- **Descripción**: Ver todos los eventos del usuario
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Lista de eventos del usuario

#### GET /events/my-cancelled
- **Descripción**: Ver eventos cancelados del usuario
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Lista de eventos cancelados

#### GET /events/:eventId
- **Descripción**: Obtener evento por ID
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Evento encontrado

#### PATCH /events/:eventId/cancel
- **Descripción**: Cancelar evento
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Evento cancelado

#### PATCH /events/:eventId/complete
- **Descripción**: Marcar evento como completado
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Evento completado

#### DELETE /events/:eventId
- **Descripción**: Eliminar evento
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Evento eliminado

### 3. Solicitudes de Músico (MusicianRequests)

#### POST /musician-requests
- **Descripción**: Crear solicitud de músico
- **Headers**: Authorization: Bearer <token>
- **Body**: Datos de la solicitud
- **Respuesta**: Solicitud creada

#### GET /musician-requests/:id
- **Descripción**: Obtener solicitud por ID
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Solicitud encontrada

#### PUT /musician-requests/:id
- **Descripción**: Actualizar solicitud
- **Headers**: Authorization: Bearer <token>
- **Body**: Datos a actualizar
- **Respuesta**: Solicitud actualizada

#### DELETE /musician-requests/:id
- **Descripción**: Eliminar solicitud
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Solicitud eliminada

#### POST /musician-requests/accept
- **Descripción**: Aceptar solicitud de músico
- **Headers**: Authorization: Bearer <token>
- **Body**: requestId, musicianId
- **Respuesta**: Solicitud aceptada

#### POST /musician-requests/cancel
- **Descripción**: Cancelar solicitud de músico
- **Headers**: Authorization: Bearer <token>
- **Body**: requestId, reason
- **Respuesta**: Solicitud cancelada

#### GET /musician-requests/:id/status
- **Descripción**: Consultar estado de solicitud
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Estado de la solicitud

### 4. Chat

#### GET /chat/conversations
- **Descripción**: Obtener conversaciones del usuario
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Lista de conversaciones

#### GET /chat/conversations/search
- **Descripción**: Buscar conversaciones con filtros
- **Headers**: Authorization: Bearer <token>
- **Query**: search, unreadOnly, dateFrom, dateTo
- **Respuesta**: Lista de conversaciones filtradas

#### GET /chat/stats
- **Descripción**: Obtener estadísticas de chat
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Estadísticas del chat

#### POST /chat/conversations
- **Descripción**: Crear nueva conversación
- **Headers**: Authorization: Bearer <token>
- **Body**: participants
- **Respuesta**: Conversación creada

#### GET /chat/conversations/:conversationId
- **Descripción**: Obtener conversación por ID
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Conversación encontrada

#### GET /chat/conversations/:conversationId/messages
- **Descripción**: Obtener mensajes de una conversación
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Lista de mensajes

#### POST /chat/conversations/:conversationId/messages
- **Descripción**: Enviar mensaje
- **Headers**: Authorization: Bearer <token>
- **Body**: content, type
- **Respuesta**: Mensaje enviado

#### PATCH /chat/messages/:messageId/read
- **Descripción**: Marcar mensaje como leído
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Mensaje marcado como leído

#### PATCH /chat/conversations/:conversationId/archive
- **Descripción**: Archivar conversación
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Conversación archivada

#### DELETE /chat/conversations/:conversationId
- **Descripción**: Eliminar conversación
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Conversación eliminada

### 5. Imágenes (Images)

#### POST /images/upload
- **Descripción**: Subir imagen
- **Headers**: Authorization: Bearer <token>
- **Body**: multipart/form-data con imagen
- **Respuesta**: Imagen subida

#### GET /images
- **Descripción**: Listar imágenes con filtros
- **Query**: category, userId, isPublic, isActive, tags, dateFrom, dateTo, search, limit, offset
- **Respuesta**: Lista de imágenes

#### GET /images/:imageId
- **Descripción**: Obtener imagen por ID
- **Respuesta**: Imagen encontrada

#### PUT /images/:imageId
- **Descripción**: Actualizar imagen
- **Headers**: Authorization: Bearer <token>
- **Body**: Datos a actualizar
- **Respuesta**: Imagen actualizada

#### DELETE /images/:imageId
- **Descripción**: Eliminar imagen
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Imagen eliminada

#### GET /images/profile/:userId
- **Descripción**: Obtener imágenes de perfil de usuario
- **Respuesta**: Lista de imágenes de perfil

#### GET /images/posts
- **Descripción**: Obtener imágenes de posts
- **Respuesta**: Lista de imágenes de posts

#### GET /images/events
- **Descripción**: Obtener imágenes de eventos
- **Respuesta**: Lista de imágenes de eventos

#### GET /images/stats
- **Descripción**: Obtener estadísticas de imágenes (Admin)
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Estadísticas de imágenes

#### POST /images/cleanup
- **Descripción**: Limpiar imágenes expiradas (Admin)
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Imágenes limpiadas

### 6. Media (Perfil de Músico)

#### POST /media/saveImage
- **Descripción**: Subir imagen de perfil de músico
- **Body**: multipart/form-data con archivo
- **Respuesta**: Imagen subida

#### GET /media/getImage/:key
- **Descripción**: Obtener URL firmada de imagen
- **Respuesta**: URL de la imagen

### 7. Administración (Admin)

#### Usuarios

##### GET /admin/admin/users
- **Descripción**: Obtener todos los usuarios
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Lista de usuarios

##### GET /admin/admin/users/:id
- **Descripción**: Obtener usuario por ID
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Usuario encontrado

##### POST /admin/admin/users
- **Descripción**: Crear usuario
- **Headers**: Authorization: Bearer <token> (Admin)
- **Body**: Datos del usuario
- **Respuesta**: Usuario creado

##### PUT /admin/admin/users/:id
- **Descripción**: Actualizar usuario
- **Headers**: Authorization: Bearer <token> (Admin)
- **Body**: Datos a actualizar
- **Respuesta**: Usuario actualizado

##### DELETE /admin/admin/users/:id
- **Descripción**: Eliminar usuario
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Usuario eliminado

##### GET /admin/admin/users/stats
- **Descripción**: Obtener estadísticas de usuarios
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Estadísticas de usuarios

#### Eventos

##### GET /admin/admin/events
- **Descripción**: Obtener todos los eventos
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Lista de eventos

##### GET /admin/admin/events/:id
- **Descripción**: Obtener evento por ID
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Evento encontrado

##### POST /admin/admin/events
- **Descripción**: Crear evento
- **Headers**: Authorization: Bearer <token> (Admin)
- **Body**: Datos del evento
- **Respuesta**: Evento creado

##### PUT /admin/admin/events/:id
- **Descripción**: Actualizar evento
- **Headers**: Authorization: Bearer <token> (Admin)
- **Body**: Datos a actualizar
- **Respuesta**: Evento actualizado

##### DELETE /admin/admin/events/:id
- **Descripción**: Eliminar evento
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Evento eliminado

#### Músicos

##### GET /admin/admin/musicians
- **Descripción**: Obtener todos los músicos
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Lista de músicos

##### GET /admin/admin/musicians/:id
- **Descripción**: Obtener músico por ID
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Músico encontrado

##### PUT /admin/admin/musicians/:id
- **Descripción**: Actualizar músico
- **Headers**: Authorization: Bearer <token> (Admin)
- **Body**: Datos a actualizar
- **Respuesta**: Músico actualizado

##### DELETE /admin/admin/musicians/:id
- **Descripción**: Eliminar músico
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Músico eliminado

#### Imágenes

##### GET /admin/admin/images
- **Descripción**: Obtener todas las imágenes
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Lista de imágenes

##### GET /admin/admin/images/:id
- **Descripción**: Obtener imagen por ID
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Imagen encontrada

##### DELETE /admin/admin/images/:id
- **Descripción**: Eliminar imagen
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Imagen eliminada

#### Solicitudes de Músico

##### GET /admin/admin/musician-requests
- **Descripción**: Obtener todas las solicitudes de músico
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Lista de solicitudes

##### GET /admin/admin/musician-requests/:id
- **Descripción**: Obtener solicitud de músico por ID
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Solicitud encontrada

##### POST /admin/admin/musician-requests
- **Descripción**: Crear solicitud de músico
- **Headers**: Authorization: Bearer <token> (Admin)
- **Body**: Datos de la solicitud
- **Respuesta**: Solicitud creada

##### PUT /admin/admin/musician-requests/:id
- **Descripción**: Actualizar solicitud de músico
- **Headers**: Authorization: Bearer <token> (Admin)
- **Body**: Datos a actualizar
- **Respuesta**: Solicitud actualizada

##### DELETE /admin/admin/musician-requests/:id
- **Descripción**: Eliminar solicitud de músico
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Solicitud eliminada

##### GET /admin/admin/musician-requests/stats
- **Descripción**: Obtener estadísticas de solicitudes de músico
- **Headers**: Authorization: Bearer <token> (Admin)
- **Respuesta**: Estadísticas de solicitudes

### 8. Super Administración

#### DELETE /superAdmin/deleteAllUsers
- **Descripción**: Eliminar todos los usuarios (Super Admin)
- **Headers**: Authorization: Bearer <token> (Super Admin)
- **Respuesta**: Todos los usuarios eliminados

### 9. Endpoints de Prueba

#### GET /test
- **Descripción**: Verificar funcionamiento del backend
- **Respuesta**: Mensaje de confirmación

#### GET /test/token-info
- **Descripción**: Verificar estructura del token
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Información del token

#### GET /test/generate-token
- **Descripción**: Generar token de prueba (Admin)
- **Respuesta**: Token de prueba

#### GET /test/generate-organizer-token
- **Descripción**: Generar token de prueba (Organizador)
- **Respuesta**: Token de organizador

#### GET /test/musician-requests
- **Descripción**: Obtener solicitudes de prueba
- **Respuesta**: Lista de solicitudes de prueba

#### GET /test/musician-requests/:id
- **Descripción**: Obtener solicitud de prueba por ID
- **Respuesta**: Solicitud de prueba

#### GET /auth-test/musician-requests
- **Descripción**: Obtener solicitudes con autenticación
- **Headers**: Authorization: Bearer <token>
- **Respuesta**: Lista de solicitudes autenticadas

#### POST /test/musician-requests
- **Descripción**: Crear solicitud de prueba
- **Body**: Datos de la solicitud
- **Respuesta**: Solicitud creada

#### PUT /test/musician-requests/:id
- **Descripción**: Actualizar solicitud de prueba
- **Body**: Datos a actualizar
- **Respuesta**: Solicitud actualizada

#### DELETE /test/musician-requests/:id
- **Descripción**: Eliminar solicitud de prueba
- **Respuesta**: Solicitud eliminada

#### POST /test/musician-requests/accept
- **Descripción**: Aceptar solicitud de prueba
- **Body**: requestId, musicianId
- **Respuesta**: Solicitud aceptada

#### POST /test/musician-requests/cancel
- **Descripción**: Cancelar solicitud de prueba
- **Body**: requestId
- **Respuesta**: Solicitud cancelada

#### Chat de Prueba

##### GET /test/chat/conversations
- **Descripción**: Obtener conversaciones de prueba
- **Respuesta**: Lista de conversaciones de prueba

##### GET /test/chat/conversations/:conversationId/messages
- **Descripción**: Obtener mensajes de conversación de prueba
- **Respuesta**: Lista de mensajes de prueba

##### POST /test/chat/conversations/:conversationId/messages
- **Descripción**: Enviar mensaje de prueba
- **Body**: content, type
- **Respuesta**: Mensaje enviado

##### POST /test/chat/conversations
- **Descripción**: Crear conversación de prueba
- **Body**: participants
- **Respuesta**: Conversación creada

### 10. Endpoints Legacy

#### GET /imgs/getAllImg
- **Descripción**: Obtener galería de imágenes (Legacy)
- **Respuesta**: Lista de imágenes

#### GET /imgs/url/:key
- **Descripción**: Obtener URL de imagen por clave (Legacy)
- **Respuesta**: URL de la imagen

#### GET /getAllUsers
- **Descripción**: Obtener todos los usuarios (Legacy)
- **Respuesta**: Lista de usuarios

#### POST /getAllUsers/:userEmail
- **Descripción**: Enviar notificación y obtener usuarios (Legacy)
- **Body**: userData
- **Respuesta**: Lista de usuarios

#### GET /auth/check-user/:userEmail
- **Descripción**: Verificar si usuario existe
- **Respuesta**: Información del usuario

## Códigos de Estado HTTP

- **200**: OK - Operación exitosa
- **201**: Created - Recurso creado exitosamente
- **400**: Bad Request - Datos de entrada inválidos
- **401**: Unauthorized - No autorizado
- **403**: Forbidden - Acceso denegado
- **404**: Not Found - Recurso no encontrado
- **409**: Conflict - Conflicto (ej: usuario ya existe)
- **500**: Internal Server Error - Error interno del servidor

## Manejo de Errores

```json
{
  "error": "Descripción del error",
  "code": "CÓDIGO_ERROR",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

## WebSockets

Soporte para funcionalidades en tiempo real:
- Chat en tiempo real
- Notificaciones
- Actualizaciones de estado

## Configuración de CORS

Orígenes permitidos:
- http://localhost:5173
- http://192.168.54.59:5173
- http://192.168.54.59:1000
- http://172.20.10.2:5173
- http://192.168.100.101:5173

## Almacenamiento de Imágenes

- **Servicio**: idriveE2 (S3-compatible)
- **Tamaño máximo**: 10MB
- **Tipos permitidos**: JPEG, PNG, GIF, WebP, SVG
- **URLs firmadas**: Acceso temporal con expiración
- **Categorías**: profile, post, event, gallery, admin

## Base de Datos

Firebase Firestore con colecciones:
- **users**: Usuarios del sistema
- **events**: Eventos y solicitudes
- **conversations**: Conversaciones de chat
- **messages**: Mensajes de chat
- **images**: Metadatos de imágenes

## Seguridad

- Autenticación JWT con expiración
- Middleware de autorización por roles
- Validación de entrada
- CORS configurado
- Soft delete para recursos

## Documentación Interactiva

- **Swagger UI**: http://localhost:1000/api-docs
- **Redoc**: http://localhost:1000/redoc
- **JSON de Swagger**: http://localhost:1000/api-docs/swagger.json

## Ejemplos de Uso

### Registro de Usuario
```bash
curl -X POST http://localhost:1000/auth/Register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan",
    "lastName": "Pérez",
    "userEmail": "juan@example.com",
    "userPassword": "password123",
    "roll": "eventCreator"
  }'
```

### Login
```bash
curl -X POST http://localhost:1000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "juan@example.com",
    "userPassword": "password123"
  }'
```

### Crear Solicitud de Músico
```bash
curl -X POST http://localhost:1000/events/request-musician \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "Boda de María y Juan",
    "eventType": "boda",
    "date": "2024-12-25",
    "time": "18:00 - 20:00",
    "location": "Salón de Eventos ABC",
    "duration": "120",
    "instrument": "piano",
    "bringInstrument": false,
    "comment": "Necesitamos un pianista para ceremonia y recepción",
    "budget": "500",
    "songs": ["Canción de entrada", "Vals de novios"],
    "recommendations": ["Música romántica"],
    "mapsLink": "https://maps.google.com/?q=Salon+ABC"
  }'
```

### Subir Imagen
```bash
curl -X POST http://localhost:1000/images/upload \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/image.jpg" \
  -F "category=profile" \
  -F "description=Mi foto de perfil" \
  -F "isPublic=true"
```

## Notas de Implementación

1. **CRUD Completo**: Todos los endpoints principales incluyen operaciones Create, Read, Update, Delete
2. **Validación**: Todos los endpoints incluyen validación de entrada
3. **Autenticación**: La mayoría de endpoints requieren autenticación JWT
4. **Autorización**: Endpoints de administración requieren roles específicos
5. **Manejo de Errores**: Errores consistentes y descriptivos
6. **Documentación**: Swagger completo y actualizado
7. **WebSockets**: Soporte para funcionalidades en tiempo real
8. **Almacenamiento**: Integración con idriveE2 para imágenes
9. **Base de Datos**: Firebase Firestore como base de datos principal
10. **Testing**: Endpoints de prueba para desarrollo

Esta documentación representa el estado actual y completo de la API de MussikOn, incluyendo todos los endpoints, modelos de datos, autenticación, autorización y funcionalidades implementadas. 