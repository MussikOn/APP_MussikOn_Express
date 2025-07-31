# 🔍 API de Búsqueda Avanzada

> **Sistema completo de búsqueda con filtros avanzados, geolocalización y búsqueda inteligente**

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Endpoints](#endpoints)
- [Filtros y Parámetros](#filtros-y-parámetros)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Respuestas](#respuestas)
- [Casos de Uso](#casos-de-uso)
- [Integración](#integración)

## 🎯 Descripción General

La API de Búsqueda Avanzada proporciona capacidades de búsqueda sofisticadas para eventos, solicitudes de músicos y usuarios. Incluye filtros por ubicación, fecha, instrumento, especialidades y disponibilidad.

### Características Principales

- **Búsqueda global** en múltiples entidades
- **Filtros por ubicación** con geolocalización
- **Búsqueda por instrumento** y especialidades
- **Filtros temporales** y de disponibilidad
- **Búsqueda inteligente** con coincidencias parciales
- **Paginación** y ordenamiento
- **Búsqueda de disponibilidad** cruzada

## 📡 Endpoints

### 1. Búsqueda de Eventos

**GET** `/search/events`

Búsqueda avanzada de eventos con múltiples filtros.

### 2. Búsqueda de Solicitudes de Músicos

**GET** `/search/musician-requests`

Búsqueda de solicitudes de músicos con filtros específicos.

### 3. Búsqueda de Usuarios

**GET** `/search/users`

Búsqueda de usuarios por nombre, email, rol y especialidades.

### 4. Búsqueda Global

**GET** `/search/global`

Búsqueda simultánea en eventos, solicitudes y usuarios.

### 5. Búsqueda por Ubicación

**GET** `/search/location`

Búsqueda basada en coordenadas geográficas y radio.

### 6. Eventos Disponibles para Músico

**GET** `/search/available-events`

Encuentra eventos disponibles para un músico específico.

### 7. Músicos Disponibles para Evento

**GET** `/search/available-musicians`

Encuentra músicos disponibles para un evento específico.

## 🔧 Filtros y Parámetros

### Parámetros Comunes

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `query` | string | Término de búsqueda general | `"piano"` |
| `limit` | number | Número máximo de resultados | `20` |
| `offset` | number | Desplazamiento para paginación | `0` |
| `sortBy` | string | Campo para ordenar | `"date"` |
| `order` | string | Orden ascendente/descendente | `"asc"` |

### Filtros de Eventos

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `eventType` | string | Tipo de evento | `"boda"` |
| `instrument` | string | Instrumento requerido | `"piano"` |
| `dateFrom` | string | Fecha mínima (ISO) | `"2024-01-01"` |
| `dateTo` | string | Fecha máxima (ISO) | `"2024-12-31"` |
| `location` | string | Ubicación | `"Madrid"` |
| `budgetMin` | number | Presupuesto mínimo | `10000` |
| `budgetMax` | number | Presupuesto máximo | `100000` |
| `status` | string | Estado del evento | `"pending_musician"` |

### Filtros de Solicitudes

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `eventType` | string | Tipo de evento | `"concierto"` |
| `instrument` | string | Instrumento requerido | `"guitarra"` |
| `dateFrom` | string | Fecha mínima | `"2024-01-01"` |
| `dateTo` | string | Fecha máxima | `"2024-12-31"` |
| `location` | string | Ubicación | `"Barcelona"` |
| `budgetMin` | number | Presupuesto mínimo | `5000` |
| `budgetMax` | number | Presupuesto máximo | `50000` |
| `status` | string | Estado de la solicitud | `"pendiente"` |

### Filtros de Usuarios

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `name` | string | Nombre del usuario | `"Juan"` |
| `roll` | string | Rol del usuario | `"musico"` |
| `instrument` | string | Instrumento principal | `"piano"` |
| `specialties` | string | Especialidades | `"jazz,clasico"` |
| `location` | string | Ubicación | `"Valencia"` |
| `status` | boolean | Estado activo/inactivo | `true` |

### Filtros de Ubicación

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `lat` | number | Latitud | `40.4168` |
| `lng` | number | Longitud | `-3.7038` |
| `radius` | number | Radio en kilómetros | `50` |
| `type` | string | Tipo de entidad | `"events"` |

## 💡 Ejemplos de Uso

### 1. Búsqueda de Eventos

**Request:**
```bash
GET /search/events?query=boda&location=Madrid&dateFrom=2024-01-01&dateTo=2024-12-31&instrument=piano&budgetMin=10000&budgetMax=100000&limit=20&offset=0&sortBy=date&order=asc
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event_123",
        "eventName": "Boda de María y Juan",
        "eventType": "boda",
        "date": "2024-12-25",
        "time": "18:00",
        "location": "Madrid, España",
        "instrument": "piano",
        "budget": 50000,
        "status": "pending_musician",
        "description": "Ceremonia y recepción",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 1,
    "filters": {
      "query": "boda",
      "location": "Madrid",
      "dateFrom": "2024-01-01",
      "dateTo": "2024-12-31",
      "instrument": "piano",
      "budgetMin": 10000,
      "budgetMax": 100000
    },
    "pagination": {
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### 2. Búsqueda Global

**Request:**
```bash
GET /search/global?query=piano&type=all&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event_123",
        "eventName": "Boda de María y Juan",
        "eventType": "boda",
        "instrument": "piano"
      }
    ],
    "musicianRequests": [
      {
        "id": "request_456",
        "eventType": "concierto",
        "instrument": "piano",
        "location": "Barcelona"
      }
    ],
    "users": [
      {
        "id": "user_789",
        "name": "Carlos",
        "lastName": "Rodríguez",
        "roll": "musico",
        "instrument": "piano"
      }
    ],
    "total": {
      "events": 5,
      "musicianRequests": 3,
      "users": 2
    }
  }
}
```

### 3. Búsqueda por Ubicación

**Request:**
```bash
GET /search/location?lat=40.4168&lng=-3.7038&radius=50&type=events
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "event_123",
        "eventName": "Boda en Madrid",
        "location": "Madrid, España",
        "distance": 2.5,
        "coordinates": {
          "lat": 40.4168,
          "lng": -3.7038
        }
      }
    ],
    "location": {
      "lat": 40.4168,
      "lng": -3.7038,
      "radius": 50
    },
    "total": 1
  }
}
```

### 4. Eventos Disponibles para Músico

**Request:**
```bash
GET /search/available-events?musicianId=user_789&dateFrom=2024-01-01&dateTo=2024-12-31&instrument=piano
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event_123",
        "eventName": "Boda de María y Juan",
        "eventType": "boda",
        "date": "2024-12-25",
        "location": "Madrid, España",
        "budget": 50000,
        "compatibility": 0.95,
        "reasons": [
          "Instrumento coincide",
          "Fecha disponible",
          "Ubicación accesible"
        ]
      }
    ],
    "musicianId": "user_789",
    "total": 1
  }
}
```

### 5. Músicos Disponibles para Evento

**Request:**
```bash
GET /search/available-musicians?eventId=event_123&instrument=piano&date=2024-12-25&location=Madrid
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "musicians": [
      {
        "id": "user_789",
        "name": "Carlos",
        "lastName": "Rodríguez",
        "instrument": "piano",
        "specialties": ["jazz", "clasico"],
        "rating": 4.8,
        "compatibility": 0.95,
        "reasons": [
          "Instrumento coincide",
          "Fecha disponible",
          "Especialidad apropiada"
        ]
      }
    ],
    "eventId": "event_123",
    "total": 1
  }
}
```

## 📊 Respuestas

### Estructura de Respuesta Estándar

```json
{
  "success": boolean,
  "data": {
    "results": array,
    "total": number,
    "filters": object,
    "pagination": {
      "limit": number,
      "offset": number,
      "hasMore": boolean
    }
  }
}
```

### Códigos de Estado

| Código | Descripción |
|--------|-------------|
| `200` | Búsqueda exitosa |
| `400` | Parámetros inválidos |
| `401` | No autenticado |
| `403` | No autorizado |
| `500` | Error interno |

## 🎯 Casos de Uso

### 1. Búsqueda de Eventos por Organizador

```javascript
// Buscar eventos de bodas en Madrid para piano
const searchEvents = async () => {
  const response = await fetch('/search/events?eventType=boda&location=Madrid&instrument=piano&dateFrom=2024-01-01&dateTo=2024-12-31', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.data.events;
};
```

### 2. Búsqueda de Músicos por Especialidad

```javascript
// Buscar músicos de piano especializados en jazz
const searchMusicians = async () => {
  const response = await fetch('/search/users?roll=musico&instrument=piano&specialties=jazz', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.data.users;
};
```

### 3. Búsqueda por Ubicación

```javascript
// Buscar eventos cercanos a una ubicación
const searchNearbyEvents = async (lat, lng, radius = 50) => {
  const response = await fetch(`/search/location?lat=${lat}&lng=${lng}&radius=${radius}&type=events`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.data.results;
};
```

### 4. Búsqueda de Disponibilidad

```javascript
// Encontrar eventos disponibles para un músico
const findAvailableEvents = async (musicianId, dateFrom, dateTo) => {
  const response = await fetch(`/search/available-events?musicianId=${musicianId}&dateFrom=${dateFrom}&dateTo=${dateTo}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.data.events;
};
```

## 🔗 Integración

### Configuración del Cliente

```javascript
class SearchAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async searchEvents(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/search/events?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  }

  async searchGlobal(query, type = 'all', limit = 10) {
    const response = await fetch(`${this.baseURL}/search/global?query=${query}&type=${type}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  }

  async searchByLocation(lat, lng, radius, type) {
    const response = await fetch(`${this.baseURL}/search/location?lat=${lat}&lng=${lng}&radius=${radius}&type=${type}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  }
}

// Uso
const searchAPI = new SearchAPI('https://api.mussikon.com', token);

// Buscar eventos
const events = await searchAPI.searchEvents({
  eventType: 'boda',
  location: 'Madrid',
  instrument: 'piano'
});

// Búsqueda global
const results = await searchAPI.searchGlobal('piano', 'all', 20);

// Búsqueda por ubicación
const nearbyEvents = await searchAPI.searchByLocation(40.4168, -3.7038, 50, 'events');
```

### Manejo de Errores

```javascript
const handleSearchError = (error) => {
  if (error.response?.status === 400) {
    console.error('Parámetros de búsqueda inválidos:', error.response.data.error.details);
  } else if (error.response?.status === 401) {
    console.error('Token de autenticación inválido');
    // Redirigir a login
  } else if (error.response?.status === 403) {
    console.error('No tienes permisos para realizar esta búsqueda');
  } else {
    console.error('Error en la búsqueda:', error.message);
  }
};

// Uso con try-catch
try {
  const results = await searchAPI.searchEvents(filters);
  // Procesar resultados
} catch (error) {
  handleSearchError(error);
}
```

### Paginación

```javascript
const loadMoreResults = async (currentOffset, limit = 20) => {
  const newFilters = {
    ...currentFilters,
    offset: currentOffset,
    limit
  };
  
  const response = await searchAPI.searchEvents(newFilters);
  
  if (response.data.pagination.hasMore) {
    // Cargar más resultados
    return response.data.events;
  } else {
    // No hay más resultados
    return [];
  }
};
```

---

**Documentación actualizada al**: $(date)

**Versión**: 1.0.0 - API de búsqueda avanzada implementada ✅ 