# 📸 Sistema de Imágenes CRUD - API Documentation

## 📋 Descripción General

El sistema de imágenes CRUD proporciona una gestión completa de imágenes para la aplicación MussikOn, incluyendo subida, almacenamiento en idriveE2, gestión de metadatos y control de acceso. El sistema soporta diferentes categorías de imágenes: perfiles, posts, eventos, galería y administración.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

- **Modelo (`src/models/imagesModel.ts`)**: Lógica de negocio y acceso a datos
- **Controlador (`src/controllers/imagesController.ts`)**: Manejo de requests HTTP
- **Rutas (`src/routes/imagesRoutes.ts`)**: Definición de endpoints
- **Servicio (`src/services/imageService.ts`)**: Utilidades y métodos de alto nivel
- **Middleware (`src/middleware/uploadMiddleware.ts`)**: Validación y manejo de archivos
- **Tipos (`src/utils/DataTypes.ts`)**: Interfaces TypeScript

### Tecnologías Utilizadas

- **idriveE2**: Almacenamiento de archivos
- **Firebase Firestore**: Base de datos para metadatos
- **Multer**: Procesamiento de archivos multipart
- **AWS SDK v3**: Cliente S3 para idriveE2

## 🔧 Configuración

### Variables de Entorno

```env
IDRIVE_E2_REGION=us-east-1
IDRIVE_E2_ENDPOINT=https://your-endpoint.idrivee2.com
IDRIVE_E2_ACCESS_KEY=your-access-key
IDRIVE_E2_SECRET_KEY=your-secret-key
IDRIVE_E2_BUCKET_NAME=your-bucket-name
```

### Límites de Configuración

- **Tamaño máximo**: 10MB por archivo
- **Tipos permitidos**: JPEG, PNG, GIF, WebP, SVG
- **Archivos por request**: 1
- **Expiración de URLs**: 1 hora (configurable)

## 📡 Endpoints de la API

### 🔐 Autenticación

Todos los endpoints que modifican datos requieren autenticación JWT:

```http
Authorization: Bearer <token>
```

### 📤 Subida de Imágenes

#### POST `/images/upload`

Sube una nueva imagen al sistema.

**Headers:**
```http
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Body (form-data):**
```
image: [archivo de imagen]
category: "profile" | "post" | "event" | "gallery" | "admin"
description: "Descripción opcional"
tags: ["tag1", "tag2"] (JSON string)
isPublic: true | false
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Imagen subida exitosamente",
  "image": {
    "id": "image-id",
    "key": "profile/user@email.com/1234567890_image.jpg",
    "url": "https://signed-url.com/image.jpg",
    "originalName": "image.jpg",
    "fileName": "profile/user@email.com/1234567890_image.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg",
    "category": "profile",
    "userId": "user@email.com",
    "description": "Foto de perfil",
    "tags": ["profile", "user"],
    "metadata": {},
    "isPublic": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 📥 Obtención de Imágenes

#### GET `/images`

Lista imágenes con filtros opcionales.

**Query Parameters:**
```
category: "profile" | "post" | "event" | "gallery" | "admin"
userId: "user@email.com"
isPublic: true | false
search: "texto de búsqueda"
limit: 20 (default)
offset: 0 (default)
```

**Respuesta (200):**
```json
{
  "success": true,
  "images": [...],
  "total": 50,
  "filters": {...}
}
```

#### GET `/images/:imageId`

Obtiene una imagen específica por ID.

**Respuesta (200):**
```json
{
  "success": true,
  "image": {...}
}
```

### 🔄 Actualización de Imágenes

#### PUT `/images/:imageId`

Actualiza metadatos de una imagen.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "description": "Nueva descripción",
  "tags": ["nuevo", "tag"],
  "isPublic": false,
  "isActive": true
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Imagen actualizada exitosamente",
  "image": {...}
}
```

### 🗑️ Eliminación de Imágenes

#### DELETE `/images/:imageId`

Elimina una imagen (marca como inactiva).

**Headers:**
```http
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Imagen eliminada exitosamente"
}
```

### 📊 Endpoints Específicos

#### GET `/images/profile/:userId`

Obtiene imágenes de perfil de un usuario específico.

#### GET `/images/posts`

Obtiene imágenes de posts (públicas).

**Query Parameters:**
```
userId: "user@email.com" (opcional)
```

#### GET `/images/events`

Obtiene imágenes de eventos.

**Query Parameters:**
```
eventId: "event-id" (opcional)
```

### 🔧 Endpoints de Administración

#### GET `/images/stats`

Obtiene estadísticas del sistema (solo administradores).

**Respuesta (200):**
```json
{
  "success": true,
  "stats": {
    "totalImages": 150,
    "totalSize": 1572864000,
    "imagesByCategory": {
      "profile": 50,
      "post": 80,
      "event": 15,
      "gallery": 5
    },
    "imagesByUser": {
      "user1@email.com": 25,
      "user2@email.com": 30
    },
    "recentUploads": [...]
  }
}
```

#### POST `/images/cleanup`

Limpia imágenes expiradas (solo administradores senior).

**Respuesta (200):**
```json
{
  "success": true,
  "deletedCount": 5,
  "message": "5 imágenes expiradas eliminadas"
}
```

## 🏷️ Categorías de Imágenes

### 📸 Profile
- **Descripción**: Fotos de perfil de usuarios
- **Visibilidad**: Pública
- **Estructura**: `profile/user@email.com/timestamp_filename.jpg`

### 📝 Post
- **Descripción**: Imágenes para posts y contenido
- **Visibilidad**: Pública
- **Estructura**: `post/user@email.com/timestamp_filename.jpg`

### 🎉 Event
- **Descripción**: Imágenes relacionadas con eventos
- **Visibilidad**: Pública
- **Estructura**: `event/user@email.com/timestamp_filename.jpg`

### 🖼️ Gallery
- **Descripción**: Imágenes de galería general
- **Visibilidad**: Pública
- **Estructura**: `gallery/user@email.com/timestamp_filename.jpg`

### ⚙️ Admin
- **Descripción**: Imágenes administrativas
- **Visibilidad**: Privada
- **Estructura**: `admin/user@email.com/timestamp_filename.jpg`

## 🔒 Control de Acceso

### Niveles de Permisos

1. **Público**: Cualquier usuario puede ver imágenes públicas
2. **Usuario**: Solo el propietario puede modificar/eliminar
3. **Admin Junior**: Puede ver estadísticas básicas
4. **Admin Senior**: Puede ejecutar limpieza y mantenimiento
5. **Super Admin**: Acceso completo al sistema

### Validaciones

- **Propiedad**: Solo el propietario puede modificar/eliminar
- **Categoría**: Validación de categorías permitidas
- **Tamaño**: Máximo 10MB por archivo
- **Formato**: Solo tipos de imagen permitidos
- **Autenticación**: JWT requerido para operaciones de escritura

## 🛠️ Uso del Servicio

### Ejemplo de Subida de Imagen de Perfil

```typescript
import { ImageService } from '../services/imageService';

// Subir imagen de perfil
const profileImage = await ImageService.uploadProfileImage(
  file,
  userEmail,
  "Mi foto de perfil"
);

// Obtener imágenes de perfil
const profileImages = await ImageService.getUserProfileImages(userEmail);

// Buscar imágenes
const searchResults = await ImageService.searchImages("música", {
  category: "post",
  isPublic: true
});
```

### Ejemplo de Listado con Paginación

```typescript
const result = await ImageService.listImagesWithPagination(
  { category: "post", isPublic: true },
  1, // página
  20 // límite
);

console.log(`Página ${result.page} de ${result.totalPages}`);
console.log(`${result.images.length} imágenes de ${result.total} total`);
```

## 🔍 Filtros Disponibles

### Filtros de Consulta

- **category**: Filtrar por categoría
- **userId**: Filtrar por propietario
- **isPublic**: Filtrar por visibilidad
- **isActive**: Filtrar por estado activo
- **search**: Búsqueda en descripción y nombre
- **tags**: Filtrar por etiquetas
- **dateFrom/dateTo**: Rango de fechas
- **limit/offset**: Paginación

### Ejemplo de Filtros

```typescript
const filters = {
  category: "post",
  userId: "user@email.com",
  isPublic: true,
  search: "música",
  limit: 10,
  offset: 0
};

const images = await listImages(filters);
```

## 📊 Estadísticas del Sistema

### Métricas Disponibles

- **Total de imágenes**: Conteo general
- **Tamaño total**: Espacio utilizado
- **Por categoría**: Distribución por tipo
- **Por usuario**: Distribución por propietario
- **Recientes**: Últimas subidas

### Ejemplo de Estadísticas

```typescript
const stats = await ImageService.getImageStats();

console.log(`Total imágenes: ${stats.totalImages}`);
console.log(`Tamaño total: ${stats.totalSize} bytes`);
console.log(`Imágenes por categoría:`, stats.imagesByCategory);
```

## 🚨 Manejo de Errores

### Códigos de Error Comunes

- **400**: Datos inválidos o archivo no proporcionado
- **401**: No autenticado
- **403**: Sin permisos
- **404**: Imagen no encontrada
- **413**: Archivo demasiado grande
- **415**: Tipo de archivo no soportado
- **500**: Error interno del servidor

### Respuestas de Error

```json
{
  "error": "Descripción del error",
  "details": "Detalles adicionales",
  "code": "ERROR_CODE"
}
```

## 🔄 Rutas Legacy

Para mantener compatibilidad, se incluyen rutas legacy:

- `GET /imgs/getAllImg` → `GET /images`
- `GET /imgs/url/:key` → `GET /images/:imageId`

## 📝 Notas de Implementación

### Características Destacadas

✅ **Almacenamiento seguro** en idriveE2  
✅ **URLs firmadas** con expiración automática  
✅ **Validación completa** de archivos  
✅ **Control de acceso** granular  
✅ **Metadatos ricos** con etiquetas  
✅ **Búsqueda avanzada** por texto y filtros  
✅ **Paginación** eficiente  
✅ **Estadísticas** en tiempo real  
✅ **Limpieza automática** de archivos expirados  
✅ **Compatibilidad** con sistema existente  

### Consideraciones de Rendimiento

- **Caché de URLs**: Las URLs se regeneran automáticamente
- **Lazy Loading**: Las imágenes se cargan bajo demanda
- **Compresión**: Optimización automática de archivos
- **CDN**: Distribución global a través de idriveE2

### Seguridad

- **Validación de tipos**: Solo imágenes permitidas
- **Límites de tamaño**: Prevención de ataques DoS
- **Autenticación**: JWT requerido para modificaciones
- **Autorización**: Verificación de propiedad
- **Sanitización**: Nombres de archivo seguros

---

**Última actualización**: Enero 2025  
**Versión**: 2.0.0  
**Estado**: ✅ IMPLEMENTADO 