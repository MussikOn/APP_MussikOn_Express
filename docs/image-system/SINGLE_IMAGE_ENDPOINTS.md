# Endpoints para Consulta de Una Sola Imagen en IDrive E2

## 📋 Resumen

Este documento describe los endpoints disponibles para consultar una sola imagen específica desde IDrive E2 con URLs firmadas y actualizadas.

## 🚀 Endpoints Disponibles

### 1. Obtener Imagen por Nombre de Archivo

#### Endpoint Público (Desarrollo)
```http
GET /imgs/filename/{nombre_archivo}/public
```

#### Endpoint Autenticado
```http
GET /imgs/filename/{nombre_archivo}
Authorization: Bearer {token}
```

#### Parámetros
- `{nombre_archivo}`: Nombre exacto del archivo (ej: `1754188088046-test_voucher.png`)
- `category` (query parameter, opcional): Categoría específica para buscar (ej: `deposits`, `profile`, `post`, `gallery`)

#### Ejemplo de Uso
```bash
# Obtener imagen por nombre
curl "http://localhost:3001/imgs/filename/1754188088046-test_voucher.png/public"

# Obtener imagen por nombre con categoría específica
curl "http://localhost:3001/imgs/filename/1754188088046-test_voucher.png/public?category=deposits"
```

#### Respuesta Exitosa
```json
{
  "success": true,
  "image": {
    "id": "idrive_filename_1754500267438_5nkfq0",
    "filename": "1754188088046-test_voucher.png",
    "url": "https://c8q1.va03.idrivee2-84.com/musikon-media/musikon-media/deposits/1754188088046-test_voucher.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=...",
    "size": 70,
    "uploadedAt": "2025-08-03T02:28:08.520Z",
    "category": "deposits",
    "isPublic": true,
    "isActive": true,
    "mimeType": "image/png",
    "metadata": {
      "key": "musikon-media/deposits/1754188088046-test_voucher.png",
      "lastModified": "2025-08-03T02:28:08.520Z",
      "category": "deposits"
    }
  },
  "message": "Imagen encontrada por nombre desde IDrive E2"
}
```

### 2. Obtener Imagen por Clave Específica

#### Endpoint Público (Desarrollo)
```http
GET /imgs/single/{clave_codificada}/public
```

#### Endpoint Autenticado
```http
GET /imgs/single/{clave_codificada}
Authorization: Bearer {token}
```

#### Parámetros
- `{clave_codificada}`: Clave completa del archivo en IDrive E2, codificada en URL (ej: `musikon-media%2Fdeposits%2Farchivo.png`)

#### Ejemplo de Uso
```bash
# Obtener imagen por clave específica
curl "http://localhost:3001/imgs/single/musikon-media%2Fdeposits%2F1754188088046-test_voucher.png/public"
```

#### Respuesta Exitosa
```json
{
  "success": true,
  "image": {
    "id": "idrive_single_1754500267438_abc123",
    "filename": "1754188088046-test_voucher.png",
    "url": "https://c8q1.va03.idrivee2-84.com/musikon-media/musikon-media/deposits/1754188088046-test_voucher.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=...",
    "size": 70,
    "uploadedAt": "2025-08-03T02:28:08.520Z",
    "category": "deposits",
    "isPublic": true,
    "isActive": true,
    "mimeType": "image/png",
    "metadata": {
      "key": "musikon-media/deposits/1754188088046-test_voucher.png",
      "lastModified": "2025-08-03T02:28:08.520Z",
      "category": "deposits"
    }
  },
  "message": "Imagen obtenida exitosamente desde IDrive E2"
}
```

## 🔧 Códigos de Respuesta

### Respuestas Exitosas
- **200 OK**: Imagen encontrada y devuelta correctamente

### Respuestas de Error
- **400 Bad Request**: Parámetros faltantes o inválidos
- **404 Not Found**: Imagen no encontrada
- **401 Unauthorized**: Token de autenticación requerido (solo para endpoints autenticados)
- **500 Internal Server Error**: Error interno del servidor

## 📝 Ejemplos de Uso en JavaScript

### Usando fetch
```javascript
// Obtener imagen por nombre
async function getImageByFilename(filename, category = null) {
  const url = category 
    ? `http://localhost:3001/imgs/filename/${filename}/public?category=${category}`
    : `http://localhost:3001/imgs/filename/${filename}/public`;
    
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.success) {
    return data.image;
  } else {
    throw new Error(data.error);
  }
}

// Obtener imagen por clave
async function getImageByKey(key) {
  const encodedKey = encodeURIComponent(key);
  const response = await fetch(`http://localhost:3001/imgs/single/${encodedKey}/public`);
  const data = await response.json();
  
  if (data.success) {
    return data.image;
  } else {
    throw new Error(data.error);
  }
}

// Ejemplo de uso
try {
  const image = await getImageByFilename('1754188088046-test_voucher.png', 'deposits');
  console.log('Imagen encontrada:', image.url);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Usando axios
```javascript
const axios = require('axios');

// Obtener imagen por nombre
async function getImageByFilename(filename, category = null) {
  const params = category ? { category } : {};
  const response = await axios.get(`http://localhost:3001/imgs/filename/${filename}/public`, { params });
  return response.data.image;
}

// Obtener imagen por clave
async function getImageByKey(key) {
  const encodedKey = encodeURIComponent(key);
  const response = await axios.get(`http://localhost:3001/imgs/single/${encodedKey}/public`);
  return response.data.image;
}
```

## 🔐 Autenticación

Para usar los endpoints autenticados, incluye el token JWT en el header:

```javascript
const response = await fetch('http://localhost:3001/imgs/filename/archivo.png', {
  headers: {
    'Authorization': 'Bearer tu_token_jwt_aqui'
  }
});
```

## 📂 Estructura de Categorías

Las imágenes se organizan en las siguientes categorías basadas en su ubicación en IDrive E2:

- **deposits**: `musikon-media/deposits/`
- **profile**: `musikon-media/profile/`
- **post**: `musikon-media/post/`
- **gallery**: `musikon-media/gallery/`
- **general**: Otras ubicaciones

## 🚀 Características

- ✅ **URLs firmadas**: Acceso seguro y temporal a las imágenes
- ✅ **Categorización automática**: Detección automática de categorías
- ✅ **Validación de existencia**: Verificación de que la imagen existe en IDrive E2
- ✅ **Manejo de errores**: Respuestas claras para diferentes tipos de errores
- ✅ **Flexibilidad**: Búsqueda por nombre o clave específica
- ✅ **Filtrado por categoría**: Opción de filtrar por categoría específica

## 🧪 Pruebas

Para probar los endpoints, ejecuta el script de pruebas:

```bash
node scripts/test-single-image.js
```

Este script probará todos los endpoints y mostrará ejemplos de uso. 