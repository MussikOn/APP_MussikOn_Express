# 🔍 API de Búsqueda - MussikOn

## 📋 Descripción General

La API de Búsqueda de MussikOn proporciona funcionalidades avanzadas de búsqueda en toda la plataforma, incluyendo búsqueda global, filtros específicos, búsqueda geográfica y validación robusta de datos. El sistema está diseñado para manejar datos inconsistentes de Firestore de manera segura.

## 🚀 Características Principales

### **🔍 Búsqueda Global**
- Búsqueda unificada en todas las colecciones (eventos, usuarios, solicitudes)
- Resultados combinados con metadatos enriquecidos
- Ranking por relevancia y tipo de contenido

### **🎯 Filtros Avanzados**
- Filtros por tipo de contenido (eventos, usuarios, solicitudes)
- Filtros por estado, fecha, ubicación, presupuesto
- Filtros por instrumento, rol de usuario, categoría

### **📍 Búsqueda Geográfica**
- Búsqueda por proximidad usando algoritmos de distancia
- Filtros por radio de búsqueda
- Optimización de rutas y geocodificación

### **🛡️ Validación Robusta**
- Manejo seguro de datos inconsistentes de Firestore
- Validación de tipos antes de operaciones de string
- Prevención de errores de `toLowerCase()` en datos null/undefined

## 📊 Estructura de Respuesta

### **Respuesta Global**
```typescript
{
  success: boolean;
  data: {
    events: Event[];
    requests: MusicianRequest[];
    users: User[];
  };
  summary: {
    totalEvents: number;
    totalRequests: number;
    totalUsers: number;
  };
}
```

### **Respuesta de Búsqueda Específica**
```typescript
{
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

## 🔌 Endpoints Disponibles

### **1. Búsqueda Global**
```http
GET /api/search/global
```

**Descripción**: Búsqueda unificada en todas las colecciones de la plataforma.

**Parámetros de Query**:
- `query` (string, opcional): Término de búsqueda
- `category` (string, opcional): Categoría específica ('all', 'events', 'users', 'requests')
- `limit` (number, opcional): Límite de resultados (default: 20)
- `page` (number, opcional): Página de resultados (default: 1)

**Ejemplo de Request**:
```bash
curl -X GET "http://localhost:3001/api/search/global?query=jefry&category=all&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Ejemplo de Response**:
```json
{
  "success": true,
  "data": {
    "events": [],
    "requests": [],
    "users": [
      {
        "name": "Agustín ",
        "lastName": "Sánchez ",
        "userEmail": "astaciosanchezjefryagustin@gmail.com",
        "create_at": "Sun Jun 29 2025 12:27:40 GMT-0400 (hora de Bolivia)",
        "delete_at": "",
        "roll": "superadmin"
      },
      {
        "name": "Jefry Agustín ",
        "lastName": "Astacio Sánchez ",
        "userEmail": "jasbootstudios@gmail.com",
        "create_at": "Sun May 18 2025 12:31:31 GMT-0400 (hora estándar del Atlántico)",
        "delete_at": "",
        "roll": "superadmin"
      }
    ]
  },
  "summary": {
    "totalEvents": 0,
    "totalRequests": 0,
    "totalUsers": 2
  }
}
```

### **2. Búsqueda de Eventos**
```http
GET /api/search/events
```

**Descripción**: Búsqueda específica de eventos musicales.

**Parámetros de Query**:
- `query` (string, opcional): Término de búsqueda
- `status` (string, opcional): Estado del evento
- `eventType` (string, opcional): Tipo de evento
- `instrument` (string, opcional): Instrumento requerido
- `dateFrom` (string, opcional): Fecha de inicio (YYYY-MM-DD)
- `dateTo` (string, opcional): Fecha de fin (YYYY-MM-DD)
- `location` (string, opcional): Ubicación del evento
- `budget.min` (number, opcional): Presupuesto mínimo
- `budget.max` (number, opcional): Presupuesto máximo
- `limit` (number, opcional): Límite de resultados
- `offset` (number, opcional): Offset para paginación
- `sortBy` (string, opcional): Campo para ordenar
- `sortOrder` (string, opcional): Orden ('asc' o 'desc')

**Ejemplo de Request**:
```bash
curl -X GET "http://localhost:3001/api/search/events?query=concierto&eventType=musica&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **3. Búsqueda de Usuarios**
```http
GET /api/search/users
```

**Descripción**: Búsqueda de usuarios y músicos en la plataforma.

**Parámetros de Query**:
- `query` (string, opcional): Término de búsqueda
- `userRole` (string, opcional): Rol del usuario
- `limit` (number, opcional): Límite de resultados
- `offset` (number, opcional): Offset para paginación
- `sortBy` (string, opcional): Campo para ordenar
- `sortOrder` (string, opcional): Orden ('asc' o 'desc')

**Ejemplo de Request**:
```bash
curl -X GET "http://localhost:3001/api/search/users?query=juan&userRole=musician&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **4. Búsqueda de Solicitudes de Músicos**
```http
GET /api/search/musician-requests
```

**Descripción**: Búsqueda de solicitudes de músicos para eventos.

**Parámetros de Query**:
- `query` (string, opcional): Término de búsqueda
- `status` (string, opcional): Estado de la solicitud
- `eventType` (string, opcional): Tipo de evento
- `instrument` (string, opcional): Instrumento requerido
- `dateFrom` (string, opcional): Fecha de inicio
- `dateTo` (string, opcional): Fecha de fin
- `location` (string, opcional): Ubicación
- `budget.min` (number, opcional): Presupuesto mínimo
- `budget.max` (number, opcional): Presupuesto máximo
- `limit` (number, opcional): Límite de resultados
- `offset` (number, opcional): Offset para paginación

**Ejemplo de Request**:
```bash
curl -X GET "http://localhost:3001/api/search/musician-requests?status=pendiente&instrument=guitarra&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **5. Búsqueda por Ubicación**
```http
GET /api/search/location
```

**Descripción**: Búsqueda de eventos y músicos por proximidad geográfica.

**Parámetros de Query**:
- `location` (string, requerido): Ubicación de búsqueda
- `radius` (number, opcional): Radio de búsqueda en km (default: 50)
- `type` (string, opcional): Tipo de búsqueda ('events', 'musicians', 'all')

**Ejemplo de Request**:
```bash
curl -X GET "http://localhost:3001/api/search/location?location=Madrid&radius=30&type=events" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **6. Búsqueda de Eventos Disponibles**
```http
GET /api/search/available-events
```

**Descripción**: Búsqueda de eventos disponibles para un músico específico.

**Parámetros de Query**:
- `musicianId` (string, requerido): ID del músico
- `instrument` (string, opcional): Instrumento del músico
- `dateFrom` (string, opcional): Fecha de disponibilidad desde
- `dateTo` (string, opcional): Fecha de disponibilidad hasta
- `location` (string, opcional): Ubicación preferida
- `limit` (number, opcional): Límite de resultados

**Ejemplo de Request**:
```bash
curl -X GET "http://localhost:3001/api/search/available-events?musicianId=123&instrument=guitarra&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **7. Búsqueda de Músicos Disponibles**
```http
GET /api/search/available-musicians
```

**Descripción**: Búsqueda de músicos disponibles para un evento específico.

**Parámetros de Query**:
- `eventId` (string, requerido): ID del evento
- `instrument` (string, opcional): Instrumento requerido
- `date` (string, opcional): Fecha del evento
- `location` (string, opcional): Ubicación del evento
- `budget` (number, opcional): Presupuesto disponible
- `limit` (number, opcional): Límite de resultados

**Ejemplo de Request**:
```bash
curl -X GET "http://localhost:3001/api/search/available-musicians?eventId=456&instrument=guitarra&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔐 Autenticación

Todos los endpoints de búsqueda requieren autenticación JWT. Incluye el token en el header de autorización:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🛡️ Validación y Seguridad

### **Validación de Datos**
- Todos los parámetros de query son validados
- Sanitización de entrada para prevenir inyección
- Validación de tipos antes de operaciones de string
- Manejo seguro de datos inconsistentes de Firestore

### **Middleware de Validación**
```typescript
// Ejemplo de validación en el backend
app.get('/api/search/global', 
  authMiddleware,
  validatePagination,
  validateSearchQuery,
  searchController.globalSearch
);
```

### **Manejo de Errores**
```typescript
// Ejemplo de manejo de errores
try {
  const results = await searchService.globalSearch(filters);
  res.json(results);
} catch (error) {
  console.error('Error en búsqueda:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: error.message 
  });
}
```

## 📊 Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Búsqueda exitosa |
| 400 | Parámetros de búsqueda inválidos |
| 401 | No autenticado |
| 403 | No autorizado |
| 500 | Error interno del servidor |

## 🔧 Implementación Técnica

### **Servicio de Búsqueda**
```typescript
export class SearchService {
  async searchEvents(filters: SearchFilters): Promise<SearchResult<Event>> {
    try {
      let query: any = db.collection('events');
      
      // Aplicar filtros
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      // Validación robusta para búsqueda de texto
      if (filters.query) {
        const searchTerm = filters.query.toLowerCase();
        const events = await query.get();
        
        const filteredEvents = events.docs
          .map(doc => doc.data())
          .filter(event => {
            const searchInField = (field: any): boolean => {
              return typeof field === 'string' && field.toLowerCase().includes(searchTerm);
            };
            
            return (
              searchInField(event.eventName) ||
              searchInField(event.location) ||
              searchInField(event.comment)
            );
          });
        
        return {
          data: filteredEvents,
          total: filteredEvents.length,
          page: 1,
          limit: filters.limit || 20,
          hasMore: false
        };
      }
      
      // ... resto de la implementación
    } catch (error) {
      console.error('Error en búsqueda de eventos:', error);
      throw new Error('Error al buscar eventos');
    }
  }
}
```

### **Validación de Tipos**
```typescript
// Función auxiliar para validación segura
const searchInField = (field: any): boolean => {
  return typeof field === 'string' && field.toLowerCase().includes(searchTerm);
};

// Uso en filtros
filteredResults = results.filter(item => 
  searchInField(item.name) ||
  searchInField(item.description) ||
  searchInField(item.location)
);
```

## 📈 Optimización y Rendimiento

### **Índices de Firestore**
```typescript
// Índices recomendados para búsqueda
{
  "collectionGroup": "events",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "eventType", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "ASCENDING" }
  ]
}
```

### **Paginación Eficiente**
```typescript
// Implementación de paginación con cursor
const getPaginatedResults = async (query: any, limit: number, lastDoc?: any) => {
  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }
  
  const snapshot = await query.limit(limit).get();
  const results = snapshot.docs.map(doc => doc.data());
  const hasMore = snapshot.docs.length === limit;
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];
  
  return { results, hasMore, lastVisible };
};
```

## 🧪 Testing

### **Tests Unitarios**
```typescript
describe('SearchService', () => {
  it('should handle null values in search fields', async () => {
    const mockEvent = {
      eventName: 'Test Event',
      location: null,
      comment: undefined
    };
    
    const result = searchInField(mockEvent.location);
    expect(result).toBe(false);
  });
  
  it('should perform case-insensitive search', async () => {
    const mockEvent = {
      eventName: 'ROCK CONCERT',
      location: 'Madrid',
      comment: 'Great event'
    };
    
    const result = searchInField(mockEvent.eventName);
    expect(result).toBe(true);
  });
});
```

## 📝 Ejemplos de Uso

### **Búsqueda Completa con Filtros**
```javascript
// Ejemplo de búsqueda completa
const searchParams = {
  query: 'rock concert',
  category: 'events',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  location: 'Madrid',
  budget: { min: 1000, max: 5000 },
  limit: 20,
  page: 1
};

const response = await fetch('/api/search/global?' + new URLSearchParams(searchParams), {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const results = await response.json();
console.log('Resultados:', results);
```

### **Búsqueda Geográfica**
```javascript
// Ejemplo de búsqueda por ubicación
const locationSearch = {
  location: 'Barcelona, Spain',
  radius: 50,
  type: 'all'
};

const response = await fetch('/api/search/location?' + new URLSearchParams(locationSearch), {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const nearbyResults = await response.json();
console.log('Resultados cercanos:', nearbyResults);
```

## 🔄 Changelog

### **v2.0.0 (Diciembre 2024)**
- ✅ **Validación Robusta**: Manejo seguro de datos inconsistentes de Firestore
- ✅ **Búsqueda Global Mejorada**: Estructura de respuesta unificada
- ✅ **Filtros Avanzados**: Soporte para múltiples criterios de búsqueda
- ✅ **Búsqueda Geográfica**: Algoritmos de proximidad optimizados
- ✅ **Performance**: Optimización de consultas y paginación

### **v1.5.0 (Noviembre 2024)**
- ✅ **Sistema de Búsqueda**: Implementación inicial
- ✅ **Filtros Básicos**: Por tipo, estado, fecha
- ✅ **Autenticación**: Integración con JWT
- ✅ **Documentación**: Documentación inicial de endpoints

## 🚀 Próximas Mejoras

### **En Desarrollo**
- [ ] **Búsqueda Semántica**: Búsqueda por significado y contexto
- [ ] **Autocompletado**: Sugerencias de búsqueda inteligentes
- [ ] **Filtros Avanzados**: Filtros por rating, experiencia, disponibilidad
- [ ] **Búsqueda por Voz**: Integración con reconocimiento de voz

### **Roadmap**
- [ ] **Machine Learning**: Recomendaciones personalizadas
- [ ] **Búsqueda por Imagen**: Búsqueda visual de instrumentos/eventos
- [ ] **Analytics de Búsqueda**: Métricas de uso y popularidad
- [ ] **Cache Inteligente**: Cache de resultados frecuentes

---

**Estado**: ✅ Producción Ready  
**Versión**: 2.0.0  
**Última Actualización**: Diciembre 2024 