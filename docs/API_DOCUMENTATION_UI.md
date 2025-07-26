# 🎵 MussikOn API - Interfaces de Documentación

## 📋 Resumen

MussikOn API ahora ofrece **dos interfaces de documentación** con sidebar lateral avanzado:

1. **Swagger UI** - Interfaz interactiva tradicional
2. **Redoc** - Interfaz moderna con mejor UX

## 🚀 URLs de Acceso

- **Página de inicio**: `http://localhost:1000/`
- **Swagger UI**: `http://localhost:1000/api-docs`
- **Redoc**: `http://localhost:1000/redoc`
- **JSON de Swagger**: `http://localhost:1000/api-docs/swagger.json`

## 📚 Swagger UI

### Características
- ✅ **Sidebar lateral organizado** por tags
- ✅ **Prueba endpoints en vivo** con autenticación
- ✅ **Generación automática de código**
- ✅ **Interfaz interactiva** para desarrolladores
- ✅ **Filtros y búsqueda** avanzada

### Tags Organizados
- **Auth** - Autenticación y usuarios
- **Events** - Eventos y matching
- **Images** - Galería de imágenes
- **MusicianRequests** - Solicitudes de músicos
- **Admin** - Administración de usuarios
- **AdminEvents** - Administración de eventos
- **AdminMusicians** - Administración de músicos
- **AdminImages** - Administración de imágenes
- **AdminMusicianRequests** - Administración de solicitudes

### Configuración Personalizada
```typescript
const swaggerUiOptions = {
  explorer: true,
  customCss: `/* Estilos personalizados */`,
  customSiteTitle: "MussikOn API Documentation",
  swaggerOptions: {
    docExpansion: "list",
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
};
```

## 🎨 Redoc

### Características
- ✅ **Diseño moderno y limpio**
- ✅ **Sidebar lateral avanzado** con navegación mejorada
- ✅ **Responsive design** para móviles
- ✅ **Mejor legibilidad** y UX
- ✅ **Tema personalizable**

### Configuración
```typescript
redoc({
  title: 'MussikOn API Documentation',
  specUrl: '/api-docs/swagger.json',
  redocOptions: {
    theme: {
      colors: { primary: { main: '#007bff' } },
      sidebar: { width: '300px' }
    },
    hideDownloadButton: false,
    pathInMiddlePanel: true,
    requiredPropsFirst: true
  }
});
```

## 🏠 Página de Inicio

### Características
- ✅ **Interfaz moderna** con gradientes
- ✅ **Selección de documentación** (Swagger UI vs Redoc)
- ✅ **Comparación de características**
- ✅ **Diseño responsive**
- ✅ **Animaciones suaves**

### Estructura
```
/
├── 📚 Swagger UI (Interactivo)
├── 🎨 Redoc (Moderno)
└── 📋 Comparación de características
```

## 🔧 Configuración Técnica

### Dependencias
```json
{
  "swagger-ui-express": "^5.0.0",
  "swagger-jsdoc": "^6.2.8",
  "redoc-express": "^1.0.0"
}
```

### Estructura de Archivos
```
src/
├── utils/
│   └── index.html          # Página de inicio
├── routes/
│   └── adminRoutes.ts      # Documentación Swagger
└── controllers/
    └── adminController.ts  # Controladores documentados

index.ts                    # Configuración principal
```

## 🎯 Ventajas de Cada Interfaz

### Swagger UI
- **Ideal para**: Desarrolladores que necesitan probar endpoints
- **Fortalezas**: Interactividad, generación de código, autenticación integrada
- **Casos de uso**: Desarrollo, testing, debugging

### Redoc
- **Ideal para**: Documentación para stakeholders, clientes
- **Fortalezas**: Legibilidad, diseño moderno, navegación intuitiva
- **Casos de uso**: Presentaciones, documentación para equipos

## 🚀 Uso Recomendado

1. **Desarrollo**: Usar Swagger UI para probar endpoints
2. **Documentación**: Usar Redoc para presentar la API
3. **Inicio**: Usar la página principal para elegir la interfaz

## 📝 Notas de Implementación

- ✅ **Sidebar lateral** configurado en ambas interfaces
- ✅ **Tags organizados** para mejor navegación
- ✅ **Estilos personalizados** para consistencia de marca
- ✅ **Responsive design** para todos los dispositivos
- ✅ **Configuración optimizada** para mejor rendimiento

## 🔄 Próximas Mejoras

- [ ] **Tema oscuro** para ambas interfaces
- [ ] **Exportación de documentación** en PDF
- [ ] **Integración con Postman** para colecciones
- [ ] **Métricas de uso** de la documentación
- [ ] **Búsqueda avanzada** con filtros múltiples 

# API - Solicitudes de Músicos

## Endpoints Disponibles

### Crear solicitud
POST `/musician-requests`
```json
{
  "userId": "string",
  "eventType": "string",
  "date": "YYYY-MM-DD",
  "startTime": "HH:mm",
  "endTime": "HH:mm",
  "location": "string",
  "instrument": "string",
  "budget": 500,
  "comments": "string"
}
```
**Respuesta:**
```json
{
  "id": "string",
  ...datos de la solicitud...
}
```

### Aceptar solicitud
POST `/musician-requests/accept`
```json
{
  "requestId": "string",
  "musicianId": "string"
}
```
**Respuesta:**
```json
{ "success": true }
```

### Cancelar solicitud
POST `/musician-requests/cancel`
```json
{
  "requestId": "string"
}
```
**Respuesta:**
```json
{ "success": true }
```

### Consultar estado de solicitud
GET `/musician-requests/:id/status`
**Respuesta:**
```json
{
  "id": "string",
  "status": "pendiente | asignada | cancelada | completada | no_asignada",
  ...otros campos...
}
```

### Obtener solicitud por ID
GET `/musician-requests/:id`
**Respuesta:**
```json
{
  "id": "string",
  ...datos de la solicitud...
}
```

### Actualizar solicitud
PUT `/musician-requests/:id`
**Body:** (campos editables)
```json
{
  "eventType": "string",
  "date": "YYYY-MM-DD",
  "startTime": "HH:mm",
  "endTime": "HH:mm",
  "location": "string",
  "instrument": "string",
  "budget": 500,
  "comments": "string",
  "status": "pendiente | asignada | cancelada | completada | no_asignada",
  "assignedMusicianId": "string"
}
```
**Respuesta:**
```json
{ "success": true, "message": "Solicitud actualizada correctamente" }
```

### Eliminar solicitud
DELETE `/musician-requests/:id`
**Respuesta:**
```json
{ "success": true, "message": "Solicitud eliminada correctamente" }
```

---

## Notas
- Los endpoints de filtrado y búsqueda avanzada están pendientes de reactivación.
- Todos los endpoints devuelven errores estructurados en caso de fallo.
- El modelo de datos está documentado en `docs/MUSICIAN_REQUESTS_API.md`. 