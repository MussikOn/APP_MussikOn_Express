# API de Imágenes en MusikOn

## Descripción General

La API de imágenes maneja la subida, almacenamiento y gestión de archivos multimedia en la plataforma MusikOn. Se utiliza principalmente para flyers de eventos, fotos de perfil de usuarios y otros recursos visuales.

## Configuración

### Almacenamiento
- **Proveedor**: AWS S3 (iDrive E2)
- **Formato de URLs**: Firmadas con expiración
- **Tiempo de expiración**: 1 hora por defecto

### Límites y Restricciones
- **Tipos permitidos**: JPG, PNG, WebP, GIF
- **Tamaño máximo**: 5MB por archivo
- **Resolución recomendada**: Hasta 2048x2048px
- **Compresión automática**: Sí (calidad 0.8)

## Endpoints CRUD

### Listar Imágenes
```
GET /imgs/getAllImg
```
**Descripción**: Obtiene lista de todas las imágenes almacenadas
**Autenticación**: Requerida
**Respuesta**:
```json
[
  {
    "key": "1681234567890_imagen.jpg",
    "lastModified": "2024-01-15T10:00:00.000Z",
    "size": 1024000
  }
]
```

### Obtener URL Firmada
```
GET /imgs/getUrl/:key
```
**Descripción**: Obtiene URL firmada temporal para acceso a imagen
**Parámetros**: `key` - Clave única de la imagen
**Respuesta**:
```json
{
  "url": "https://bucket.s3.amazonaws.com/image.jpg?signature=...",
  "expiresIn": 3600
}
```

### Subir Imagen
```
POST /imgs/upload
```
**Descripción**: Sube una nueva imagen al almacenamiento
**Content-Type**: `multipart/form-data`
**Campos**:
- `file` (required): Archivo de imagen
- `metadata` (optional): Metadatos adicionales

**Ejemplo con curl**:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/ruta/a/imagen.jpg" \
  -F "metadata={\"category\":\"event_flyer\"}" \
  http://localhost:1000/imgs/upload
```

**Respuesta exitosa**:
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "key": "1681234567890_imagen.jpg",
    "url": "https://bucket.s3.amazonaws.com/1681234567890_imagen.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg",
    "originalName": "imagen.jpg"
  }
}
```

### Eliminar Imagen
```
DELETE /imgs/delete/:key
```
**Descripción**: Elimina una imagen del almacenamiento
**Parámetros**: `key` - Clave única de la imagen
**Autenticación**: Requerida
**Respuesta**:
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Actualizar Metadatos
```
PUT /imgs/update-metadata/:key
```
**Descripción**: Actualiza metadatos de una imagen existente
**Parámetros**: `key` - Clave única de la imagen
**Body**:
```json
{
  "category": "event_flyer",
  "description": "Flyer del evento de domingo",
  "tags": ["evento", "musica"]
}
```

## Integración con Solicitudes de Músicos

### Subida de Flyers
El nuevo sistema de solicitudes de músicos utiliza esta API para manejar flyers de eventos:

```javascript
// Ejemplo de subida en solicitud de músico
const formData = new FormData();
formData.append('organizerId', 'user@email.com');
formData.append('eventName', 'Culto de Domingo');
formData.append('flyer', {
  uri: imageUri,
  name: 'flyer.jpg',
  type: 'image/jpeg'
});

const response = await fetch('/musician-requests/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData
});
```

### Validaciones Específicas
- **Flyers de eventos**: Máximo 5MB, formato JPG/PNG
- **Fotos de perfil**: Máximo 2MB, formato JPG/PNG
- **Imágenes de galería**: Máximo 10MB, múltiples formatos

## Códigos de Error

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid file type. Only images are allowed."
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 413 - Payload Too Large
```json
{
  "success": false,
  "message": "File size exceeds maximum limit of 5MB"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error uploading file to storage"
}
```

## Buenas Prácticas

### Seguridad
1. **Validar tipos de archivo** en el frontend y backend
2. **Limitar tamaños** según el contexto de uso
3. **Usar URLs firmadas** para acceso temporal
4. **No exponer claves S3** en el frontend

### Rendimiento
1. **Comprimir imágenes** antes de subir
2. **Usar formatos optimizados** (WebP cuando sea posible)
3. **Implementar cache** para URLs firmadas
4. **Lazy loading** en el frontend

### UX
1. **Mostrar progreso** durante la subida
2. **Validar archivos** antes de enviar
3. **Proporcionar feedback** inmediato
4. **Permitir preview** antes de confirmar

## Ejemplos de Uso Frontend

### React Native
```javascript
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  });

  if (!result.canceled) {
    const formData = new FormData();
    formData.append('file', {
      uri: result.assets[0].uri,
      name: 'flyer.jpg',
      type: 'image/jpeg',
    });

    const response = await fetch('/imgs/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
  }
};
```

### Web
```javascript
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/imgs/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};
```

## Próximos Pasos

1. **Implementar CDN** para mejor rendimiento
2. **Agregar procesamiento** automático de imágenes
3. **Implementar versiones** (thumbnail, medium, large)
4. **Agregar compresión** automática más avanzada

---

**Nota**: Esta API es fundamental para el sistema de solicitudes de músicos, especialmente para la subida de flyers de eventos. 