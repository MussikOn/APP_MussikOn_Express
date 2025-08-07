# 📚 Documentación de API - MussikOn API

## 📋 Índice

- [Descripción General](#descripción-general)
- [Autenticación](#autenticación)
- [Códigos de Estado](#códigos-de-estado)
- [Estructura de Respuesta](#estructura-de-respuesta)
- [Endpoints de Autenticación](#endpoints-de-autenticación)
- [Endpoints de Usuarios](#endpoints-de-usuarios)
- [Endpoints de Músicos](#endpoints-de-músicos)
- [Endpoints de Eventos](#endpoints-de-eventos)
- [Endpoints de Chat](#endpoints-de-chat)
- [Endpoints de Pagos](#endpoints-de-pagos)
- [Endpoints de Imágenes](#endpoints-de-imágenes)
- [Endpoints de Búsqueda](#endpoints-de-búsqueda)
- [Endpoints de Administración](#endpoints-de-administración)
- [WebSockets](#websockets)
- [Webhooks](#webhooks)
- [Rate Limiting](#rate-limiting)
- [Siguiente: Documentación de Swagger](#siguiente-documentación-de-swagger)

## Descripción General

La API de MussikOn es una API RESTful que proporciona acceso a todas las funcionalidades de la plataforma. La API utiliza JSON para el intercambio de datos y requiere autenticación para la mayoría de endpoints.

### Base URL
```
Development: http://localhost:3000/api/v1
Staging: https://staging-api.mussikon.com/api/v1
Production: https://api.mussikon.com/api/v1
```

### Versiones
- **v1**: Versión actual (estable)
- **v2**: En desarrollo (beta)

## Autenticación

### JWT Bearer Token
La API utiliza JWT (JSON Web Tokens) para la autenticación. Los tokens deben incluirse en el header `Authorization` de todas las peticiones autenticadas.

```http
Authorization: Bearer <token>
```

### Obtener Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

### Respuesta de Autenticación
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user123",
      "email": "usuario@ejemplo.com",
      "name": "Juan Pérez",
      "role": "musician"
    }
  }
}
```

## Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | OK - Petición exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

## Estructura de Respuesta

### Respuesta Exitosa
```json
{
  "success": true,
  "data": {
    // Datos de la respuesta
  },
  "message": "Operación exitosa",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Respuesta de Error
```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Token inválido",
    "details": "El token proporcionado ha expirado"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Endpoints de Autenticación

### POST /auth/register
Registra un nuevo usuario.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Contraseña123!",
  "name": "Juan Pérez",
  "role": "musician",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "usuario@ejemplo.com",
      "name": "Juan Pérez",
      "role": "musician",
      "verified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Usuario registrado exitosamente"
}
```

### POST /auth/login
Inicia sesión de un usuario.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Contraseña123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "usuario@ejemplo.com",
      "name": "Juan Pérez",
      "role": "musician",
      "verified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/logout
Cierra la sesión del usuario.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

### POST /auth/refresh
Renueva el token de acceso.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/forgot-password
Solicita restablecimiento de contraseña.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email de restablecimiento enviado"
}
```

### POST /auth/reset-password
Restablece la contraseña con token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "NuevaContraseña123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

## Endpoints de Usuarios

### GET /users/profile
Obtiene el perfil del usuario autenticado.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "role": "musician",
    "phone": "+1234567890",
    "verified": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /users/profile
Actualiza el perfil del usuario.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Juan Carlos Pérez",
  "phone": "+1234567891",
  "bio": "Músico profesional con 10 años de experiencia"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "name": "Juan Carlos Pérez",
    "phone": "+1234567891",
    "bio": "Músico profesional con 10 años de experiencia",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Perfil actualizado exitosamente"
}
```

### DELETE /users/profile
Elimina la cuenta del usuario.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cuenta eliminada exitosamente"
}
```

## Endpoints de Músicos

### GET /musicians
Obtiene lista de músicos con filtros.

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Límite por página (default: 20, max: 100)
- `genre` (string): Género musical
- `instrument` (string): Instrumento
- `location` (string): Ubicación
- `minRating` (number): Rating mínimo
- `maxPrice` (number): Precio máximo por hora
- `available` (boolean): Solo disponibles
- `verified` (boolean): Solo verificados

**Response (200):**
```json
{
  "success": true,
  "data": {
    "musicians": [
      {
        "id": "musician123",
        "name": "María García",
        "genres": ["jazz", "blues"],
        "instruments": ["piano", "saxophone"],
        "rating": 4.8,
        "reviewCount": 45,
        "hourlyRate": 150,
        "location": {
          "city": "Madrid",
          "country": "España",
          "coordinates": [40.4168, -3.7038]
        },
        "verified": true,
        "available": true,
        "profileImage": "https://example.com/image.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### GET /musicians/:id
Obtiene detalles de un músico específico.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "musician123",
    "name": "María García",
    "email": "maria@ejemplo.com",
    "phone": "+1234567890",
    "bio": "Pianista profesional con 15 años de experiencia...",
    "genres": ["jazz", "blues", "classical"],
    "instruments": ["piano", "saxophone"],
    "rating": 4.8,
    "reviewCount": 45,
    "hourlyRate": 150,
    "location": {
      "city": "Madrid",
      "country": "España",
      "coordinates": [40.4168, -3.7038]
    },
    "verified": true,
    "available": true,
    "profileImage": "https://example.com/image.jpg",
    "gallery": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "reviews": [
      {
        "id": "review123",
        "rating": 5,
        "comment": "Excelente músico, muy profesional",
        "reviewer": "Carlos López",
        "date": "2024-01-10T15:30:00Z"
      }
    ],
    "availability": {
      "schedule": {
        "monday": ["09:00-12:00", "14:00-18:00"],
        "tuesday": ["09:00-12:00", "14:00-18:00"]
      },
      "travelRadius": 50
    }
  }
}
```

### POST /musicians
Crea un perfil de músico (requiere autenticación).

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "María García",
  "bio": "Pianista profesional con 15 años de experiencia...",
  "genres": ["jazz", "blues"],
  "instruments": ["piano", "saxophone"],
  "hourlyRate": 150,
  "location": {
    "city": "Madrid",
    "country": "España",
    "coordinates": [40.4168, -3.7038]
  },
  "availability": {
    "schedule": {
      "monday": ["09:00-12:00", "14:00-18:00"],
      "tuesday": ["09:00-12:00", "14:00-18:00"]
    },
    "travelRadius": 50
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "musician123",
    "name": "María García",
    "status": "pending_verification"
  },
  "message": "Perfil de músico creado exitosamente"
}
```

### PUT /musicians/:id
Actualiza el perfil de músico.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "hourlyRate": 175,
  "bio": "Pianista profesional con 15 años de experiencia en jazz y blues...",
  "availability": {
    "schedule": {
      "monday": ["10:00-13:00", "15:00-19:00"],
      "tuesday": ["10:00-13:00", "15:00-19:00"]
    },
    "travelRadius": 60
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "musician123",
    "hourlyRate": 175,
    "updatedAt": "2024-01-15T12:00:00Z"
  },
  "message": "Perfil actualizado exitosamente"
}
```

### POST /musicians/:id/reviews
Agrega una reseña a un músico.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excelente músico, muy profesional y puntual"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "review456",
    "rating": 5,
    "comment": "Excelente músico, muy profesional y puntual",
    "createdAt": "2024-01-15T12:30:00Z"
  },
  "message": "Reseña agregada exitosamente"
}
```

## Endpoints de Eventos

### GET /events
Obtiene lista de eventos con filtros.

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Límite por página (default: 20)
- `type` (string): Tipo de evento
- `date` (string): Fecha específica (YYYY-MM-DD)
- `location` (string): Ubicación
- `status` (string): Estado del evento
- `organizerId` (string): ID del organizador

**Response (200):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event123",
        "title": "Boda de Ana y Carlos",
        "type": "wedding",
        "date": "2024-06-15T18:00:00Z",
        "location": {
          "address": "Calle Mayor 123",
          "city": "Madrid",
          "coordinates": [40.4168, -3.7038]
        },
        "status": "active",
        "budget": {
          "min": 500,
          "max": 1000,
          "currency": "EUR"
        },
        "organizer": {
          "id": "organizer123",
          "name": "Ana García"
        },
        "hiredMusicians": [
          {
            "id": "musician123",
            "name": "María García",
            "instrument": "piano"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 75,
      "pages": 4
    }
  }
}
```

### GET /events/:id
Obtiene detalles de un evento específico.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "event123",
    "title": "Boda de Ana y Carlos",
    "description": "Celebración de boda con música en vivo...",
    "type": "wedding",
    "date": "2024-06-15T18:00:00Z",
    "duration": 4,
    "location": {
      "address": "Calle Mayor 123",
      "city": "Madrid",
      "country": "España",
      "coordinates": [40.4168, -3.7038]
    },
    "status": "active",
    "budget": {
      "min": 500,
      "max": 1000,
      "currency": "EUR"
    },
    "organizer": {
      "id": "organizer123",
      "name": "Ana García",
      "email": "ana@ejemplo.com",
      "phone": "+1234567890"
    },
    "hiredMusicians": [
      {
        "id": "musician123",
        "name": "María García",
        "instrument": "piano",
        "hourlyRate": 150,
        "status": "confirmed"
      }
    ],
    "requirements": [
      "Música romántica",
      "Repertorio clásico y moderno",
      "Equipo de sonido incluido"
    ],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### POST /events
Crea un nuevo evento.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Boda de Ana y Carlos",
  "description": "Celebración de boda con música en vivo...",
  "type": "wedding",
  "date": "2024-06-15T18:00:00Z",
  "duration": 4,
  "location": {
    "address": "Calle Mayor 123",
    "city": "Madrid",
    "country": "España",
    "coordinates": [40.4168, -3.7038]
  },
  "budget": {
    "min": 500,
    "max": 1000,
    "currency": "EUR"
  },
  "requirements": [
    "Música romántica",
    "Repertorio clásico y moderno",
    "Equipo de sonido incluido"
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "event123",
    "title": "Boda de Ana y Carlos",
    "status": "active"
  },
  "message": "Evento creado exitosamente"
}
```

### PUT /events/:id
Actualiza un evento.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Boda de Ana y Carlos - Actualizado",
  "description": "Celebración de boda con música en vivo y DJ...",
  "budget": {
    "min": 600,
    "max": 1200,
    "currency": "EUR"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "event123",
    "title": "Boda de Ana y Carlos - Actualizado",
    "updatedAt": "2024-01-15T13:00:00Z"
  },
  "message": "Evento actualizado exitosamente"
}
```

### DELETE /events/:id
Elimina un evento.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Evento eliminado exitosamente"
}
```

### POST /events/:id/hire
Contrata un músico para un evento.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "musicianId": "musician123",
  "hours": 4,
  "requirements": "Música romántica y clásica"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "contractId": "contract123",
    "status": "pending",
    "totalAmount": 600
  },
  "message": "Solicitud de contratación enviada"
}
```

## Endpoints de Chat

### GET /conversations
Obtiene las conversaciones del usuario.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv123",
        "type": "direct",
        "participants": [
          {
            "id": "user123",
            "name": "Juan Pérez",
            "profileImage": "https://example.com/user.jpg"
          },
          {
            "id": "musician123",
            "name": "María García",
            "profileImage": "https://example.com/musician.jpg"
          }
        ],
        "lastMessage": {
          "id": "msg456",
          "content": "Hola, ¿estás disponible para el evento?",
          "sender": "user123",
          "timestamp": "2024-01-15T14:30:00Z",
          "read": false
        },
        "unreadCount": 1
      }
    ]
  }
}
```

### GET /conversations/:id/messages
Obtiene los mensajes de una conversación.

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Límite por página (default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg123",
        "content": "Hola, ¿estás disponible para el evento?",
        "type": "text",
        "sender": {
          "id": "user123",
          "name": "Juan Pérez"
        },
        "timestamp": "2024-01-15T14:30:00Z",
        "read": true
      },
      {
        "id": "msg124",
        "content": "Sí, estoy disponible. ¿Qué fecha tienes en mente?",
        "type": "text",
        "sender": {
          "id": "musician123",
          "name": "María García"
        },
        "timestamp": "2024-01-15T14:32:00Z",
        "read": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 2,
      "pages": 1
    }
  }
}
```

### POST /conversations/:id/messages
Envía un mensaje en una conversación.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Perfecto, el evento es el 15 de junio",
  "type": "text"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "msg125",
    "content": "Perfecto, el evento es el 15 de junio",
    "type": "text",
    "timestamp": "2024-01-15T14:35:00Z"
  },
  "message": "Mensaje enviado exitosamente"
}
```

### POST /conversations
Crea una nueva conversación.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "participantIds": ["musician123"],
  "type": "direct",
  "initialMessage": "Hola, me interesa contratarte para un evento"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "conv124",
    "type": "direct",
    "participants": [
      {
        "id": "user123",
        "name": "Juan Pérez"
      },
      {
        "id": "musician123",
        "name": "María García"
      }
    ]
  },
  "message": "Conversación creada exitosamente"
}
```

## Endpoints de Pagos

### POST /payments/create-intent
Crea un intent de pago.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 60000,
  "currency": "eur",
  "description": "Pago por servicios musicales",
  "metadata": {
    "eventId": "event123",
    "musicianId": "musician123"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_abcdef",
    "paymentIntentId": "pi_1234567890"
  }
}
```

### GET /payments/history
Obtiene el historial de pagos del usuario.

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Límite por página (default: 20)
- `status` (string): Estado del pago

**Response (200):**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "pay_1234567890",
        "amount": 60000,
        "currency": "eur",
        "status": "succeeded",
        "description": "Pago por servicios musicales",
        "createdAt": "2024-01-15T15:00:00Z",
        "metadata": {
          "eventId": "event123",
          "musicianId": "musician123"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

### POST /payments/refund
Solicita un reembolso.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "paymentIntentId": "pi_1234567890",
  "reason": "Evento cancelado"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "refundId": "re_1234567890",
    "status": "pending"
  },
  "message": "Reembolso solicitado exitosamente"
}
```

## Endpoints de Imágenes

### POST /images/upload
Sube una imagen.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Archivo de imagen
- `type`: Tipo de imagen (profile, event, voucher)
- `metadata`: Metadatos adicionales (opcional)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "img123",
    "url": "https://example.com/image.jpg",
    "signedUrl": "https://example.com/signed-url",
    "type": "profile",
    "size": 1024000,
    "dimensions": {
      "width": 800,
      "height": 600
    }
  },
  "message": "Imagen subida exitosamente"
}
```

### GET /images/:id
Obtiene una imagen específica.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "img123",
    "url": "https://example.com/image.jpg",
    "signedUrl": "https://example.com/signed-url",
    "type": "profile",
    "metadata": {
      "userId": "user123",
      "uploadedAt": "2024-01-15T16:00:00Z"
    }
  }
}
```

### DELETE /images/:id
Elimina una imagen.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Imagen eliminada exitosamente"
}
```

## Endpoints de Búsqueda

### GET /search/musicians
Búsqueda avanzada de músicos.

**Query Parameters:**
- `q` (string): Término de búsqueda
- `genres` (string[]): Géneros musicales
- `instruments` (string[]): Instrumentos
- `location` (string): Ubicación
- `radius` (number): Radio de búsqueda en km
- `minRating` (number): Rating mínimo
- `maxPrice` (number): Precio máximo
- `available` (boolean): Solo disponibles
- `verified` (boolean): Solo verificados
- `sortBy` (string): Campo de ordenación
- `sortOrder` (string): Orden (asc/desc)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "musician123",
        "name": "María García",
        "genres": ["jazz", "blues"],
        "instruments": ["piano", "saxophone"],
        "rating": 4.8,
        "hourlyRate": 150,
        "location": {
          "city": "Madrid",
          "distance": 2.5
        },
        "relevanceScore": 0.95
      }
    ],
    "filters": {
      "applied": {
        "genres": ["jazz"],
        "location": "Madrid",
        "radius": 10
      },
      "available": {
        "genres": ["jazz", "blues", "classical", "rock"],
        "instruments": ["piano", "guitar", "drums", "saxophone"]
      }
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "pages": 2
    }
  }
}
```

### GET /search/events
Búsqueda de eventos.

**Query Parameters:**
- `q` (string): Término de búsqueda
- `type` (string): Tipo de evento
- `date` (string): Fecha
- `location` (string): Ubicación
- `status` (string): Estado

**Response (200):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "event123",
        "title": "Boda de Ana y Carlos",
        "type": "wedding",
        "date": "2024-06-15T18:00:00Z",
        "location": {
          "city": "Madrid",
          "distance": 5.2
        },
        "budget": {
          "min": 500,
          "max": 1000,
          "currency": "EUR"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

## Endpoints de Administración

### GET /admin/users
Obtiene lista de usuarios (solo admin).

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Página
- `limit` (number): Límite por página
- `role` (string): Rol de usuario
- `status` (string): Estado del usuario

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user123",
        "email": "usuario@ejemplo.com",
        "name": "Juan Pérez",
        "role": "musician",
        "status": "active",
        "verified": true,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### PUT /admin/users/:id/status
Actualiza el estado de un usuario (solo admin).

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "suspended",
  "reason": "Violación de términos de servicio"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "status": "suspended",
    "updatedAt": "2024-01-15T17:00:00Z"
  },
  "message": "Estado de usuario actualizado"
}
```

### GET /admin/analytics
Obtiene estadísticas del sistema (solo admin).

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (string): Período (day, week, month, year)
- `startDate` (string): Fecha de inicio
- `endDate` (string): Fecha de fin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1500,
      "newThisPeriod": 45,
      "active": 1200
    },
    "events": {
      "total": 300,
      "completed": 250,
      "cancelled": 20
    },
    "revenue": {
      "total": 50000,
      "thisPeriod": 5000,
      "currency": "EUR"
    },
    "musicians": {
      "total": 200,
      "verified": 180,
      "active": 150
    }
  }
}
```

## WebSockets

### Conexión
```javascript
const socket = io('https://api.mussikon.com', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Eventos Disponibles

#### Chat
- `join_conversation`: Unirse a una conversación
- `leave_conversation`: Salir de una conversación
- `send_message`: Enviar mensaje
- `typing`: Indicar que está escribiendo
- `read_messages`: Marcar mensajes como leídos

#### Eventos
- `join_event`: Unirse a un evento
- `event_update`: Actualización de evento
- `musician_hired`: Músico contratado
- `event_cancelled`: Evento cancelado

#### Notificaciones
- `notification`: Nueva notificación
- `payment_update`: Actualización de pago

### Ejemplo de Uso
```javascript
// Conectar al chat
socket.emit('join_conversation', { conversationId: 'conv123' });

// Escuchar mensajes
socket.on('new_message', (message) => {
  console.log('Nuevo mensaje:', message);
});

// Enviar mensaje
socket.emit('send_message', {
  conversationId: 'conv123',
  content: 'Hola, ¿cómo estás?',
  type: 'text'
});
```

## Webhooks

### Stripe Webhooks
```http
POST /webhooks/stripe
Content-Type: application/json
Stripe-Signature: t=1234567890,v1=abc123...

{
  "id": "evt_1234567890",
  "object": "event",
  "api_version": "2020-08-27",
  "created": 1642248000,
  "data": {
    "object": {
      "id": "pi_1234567890",
      "object": "payment_intent",
      "amount": 60000,
      "currency": "eur",
      "status": "succeeded"
    }
  },
  "livemode": false,
  "pending_webhooks": 1,
  "request": {
    "id": "req_1234567890",
    "idempotency_key": null
  },
  "type": "payment_intent.succeeded"
}
```

### Respuesta
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

## Rate Limiting

La API implementa rate limiting para proteger contra abuso:

- **Autenticación**: 5 intentos por 15 minutos
- **API General**: 100 requests por minuto
- **Uploads**: 10 uploads por minuto
- **Búsquedas**: 50 búsquedas por minuto

### Headers de Rate Limiting
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

### Respuesta cuando se excede el límite
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

## Siguiente: Documentación de Swagger

Para continuar con la documentación, ve a [Documentación de Swagger](../swagger/README.md) donde encontrarás la documentación interactiva de la API con ejemplos de código.

---

**Nota**: Esta documentación se actualiza regularmente. Para la versión más reciente, consulta la documentación interactiva en Swagger UI. 