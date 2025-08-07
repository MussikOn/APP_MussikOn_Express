# Sistema de Imágenes IDrive E2 - Guía de Uso

## 🎯 Descripción

Este documento describe el sistema de imágenes mejorado para MussikOn que utiliza IDrive E2 como almacenamiento en la nube. El sistema proporciona funcionalidades robustas para subir, almacenar y servir imágenes de manera eficiente y segura.

## 🚀 Características Principales

### ✅ Funcionalidades Implementadas
- **Subida de imágenes** con validación automática
- **Almacenamiento seguro** en IDrive E2
- **Servir imágenes** con múltiples métodos
- **URLs firmadas** para acceso seguro
- **Sistema de fallback** robusto
- **Logging detallado** para debugging
- **Optimización de cache** automática
- **Validación de archivos** antes de subir

### 🔧 Mejoras Técnicas
- Soporte para múltiples proveedores S3
- Manejo automático de tokens
- Generación correcta de URLs
- Headers de cache optimizados
- CORS configurado correctamente
- Manejo robusto de errores

## 📋 Configuración Inicial

### 1. Variables de Entorno

Crear o actualizar el archivo `.env` con las siguientes variables:

```env
# IDrive E2 Configuration
IDRIVE_E2_ENDPOINT=https://s3.us-east-1.amazonaws.com
IDRIVE_E2_ACCESS_KEY=tu_access_key_aqui
IDRIVE_E2_SECRET_KEY=tu_secret_key_aqui
IDRIVE_E2_REGION=us-east-1
IDRIVE_E2_BUCKET_NAME=musikon-media
```

### 2. Verificar Configuración

Ejecutar el script de verificación:

```bash
node scripts/setup-idrive.js
```

### 3. Probar Sistema

Ejecutar las pruebas completas:

```bash
node scripts/test-idrive-system.js
```

## 🔌 Endpoints Disponibles

### 1. Subir Imagen
```http
POST /images/upload
Content-Type: multipart/form-data

Body:
- file: [archivo de imagen]
- folder: [carpeta opcional, default: uploads]
- description: [descripción opcional]
- tags: [etiquetas separadas por comas]
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "url": "https://endpoint.com/bucket/folder/filename.jpg",
    "filename": "folder/filename.jpg",
    "size": 12345,
    "mimeType": "image/jpeg",
    "uploadedAt": "2025-03-08T10:30:00.000Z"
  },
  "message": "Imagen subida exitosamente"
}
```

### 2. Obtener Imagen por ID
```http
GET /images/{imageId}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "url": "https://endpoint.com/bucket/folder/filename.jpg",
    "filename": "folder/filename.jpg",
    "size": 12345,
    "mimeType": "image/jpeg",
    "uploadedAt": "2025-03-08T10:30:00.000Z"
  }
}
```

### 3. Servir Imagen de Voucher
```http
GET /imgs/voucher/{depositId}
```

**Respuesta:** Imagen directamente como archivo binario con headers apropiados.

### 4. Generar URL Firmada
```http
GET /images/{imageId}/presigned?expiresIn=3600
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "presignedUrl": "https://endpoint.com/bucket/file?signature=...",
    "expiresIn": 3600,
    "originalUrl": "https://endpoint.com/bucket/file"
  }
}
```

### 5. Obtener Todas las Imágenes
```http
GET /images?page=1&limit=20&category=profile&isPublic=true
```

**Parámetros opcionales:**
- `page`: Número de página (default: 1)
- `limit`: Límite por página (default: 20)
- `category`: Filtrar por categoría
- `isPublic`: Filtrar por visibilidad pública
- `isActive`: Filtrar por estado activo
- `search`: Buscar en descripción y tags

### 6. Validar Archivo
```http
POST /images/validate
Content-Type: multipart/form-data

Body:
- file: [archivo a validar]
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": ["El archivo es grande, puede tardar en subirse"]
  },
  "message": "Archivo válido"
}
```

## 💻 Uso en el Frontend

### 1. Subir Imagen

```typescript
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'profiles');
  formData.append('description', 'Foto de perfil');
  formData.append('tags', 'profile,user');

  const response = await fetch('/images/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  return result.data.url;
};
```

### 2. Mostrar Imagen de Voucher

```typescript
// Opción 1: Usar endpoint de fallback (recomendado)
const VoucherImage = ({ depositId }: { depositId: string }) => {
  const imageUrl = `/imgs/voucher/${depositId}`;
  
  return (
    <img 
      src={imageUrl} 
      alt="Voucher de depósito"
      onError={(e) => {
        console.error('Error cargando imagen de voucher');
        e.target.style.display = 'none';
      }}
    />
  );
};

// Opción 2: Usar URL firmada
const VoucherImageWithPresigned = ({ depositId }: { depositId: string }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    const getPresignedUrl = async () => {
      try {
        const response = await fetch(`/images/${depositId}/presigned`);
        const { presignedUrl } = await response.json();
        setImageUrl(presignedUrl);
      } catch (error) {
        console.error('Error obteniendo URL firmada:', error);
      }
    };

    getPresignedUrl();
  }, [depositId]);

  return imageUrl ? (
    <img src={imageUrl} alt="Voucher de depósito" />
  ) : (
    <div>Cargando imagen...</div>
  );
};
```

### 3. Mostrar Imagen General

```typescript
const ImageDisplay = ({ imageId }: { imageId: string }) => {
  const [imageData, setImageData] = useState<any>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`/images/${imageId}`);
        const result = await response.json();
        setImageData(result.data);
      } catch (error) {
        console.error('Error obteniendo imagen:', error);
      }
    };

    fetchImage();
  }, [imageId]);

  return imageData ? (
    <img 
      src={imageData.url} 
      alt={imageData.description || 'Imagen'}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  ) : (
    <div>Cargando imagen...</div>
  );
};
```

## 🔍 Debugging y Troubleshooting

### 1. Verificar Logs

Los logs del sistema incluyen referencias de archivo y línea para facilitar el debugging:

```bash
# Ver logs de IDrive E2
tail -f logs/app.log | grep "idriveE2"

# Ver logs de imágenes
tail -f logs/app.log | grep "imagesController"
```

### 2. Logs Importantes

```typescript
// Subida exitosa
[src/utils/idriveE2.ts] Archivo subido exitosamente: { bucket, key, url, contentType, size }

// Acceso a imagen
[src/controllers/imagesController.ts] Imagen de voucher servida exitosamente: { depositId, key, contentType, size }

// Errores
[src/utils/idriveE2.ts] Error al subir archivo a S3: { error }
```

### 3. Probar Endpoints Manualmente

```bash
# Probar endpoint de voucher
curl -I "http://localhost:10000/imgs/voucher/deposit_123"

# Probar endpoint de URL firmada
curl "http://localhost:10000/images/image_123/presigned"

# Probar subida de imagen
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "folder=test" \
  "http://localhost:10000/images/upload"
```

### 4. Verificar Configuración

```bash
# Verificar variables de entorno
node scripts/setup-idrive.js

# Probar sistema completo
node scripts/test-idrive-system.js
```

## 🔒 Seguridad

### Medidas Implementadas:
- ✅ Validación de tipos de archivo
- ✅ Límites de tamaño de archivo (10MB máximo)
- ✅ URLs firmadas con expiración
- ✅ ACL configurado correctamente
- ✅ Logging sin información sensible
- ✅ Manejo seguro de errores

### Tipos de Archivo Permitidos:
- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`
- `image/svg+xml`
- `application/pdf` (para documentos)

## 📊 Rendimiento

### Optimizaciones:
- ✅ Cache control headers (`public, max-age=3600`)
- ✅ Compresión automática
- ✅ URLs firmadas para acceso directo
- ✅ Sistema de fallback para alta disponibilidad
- ✅ Logging optimizado

### Métricas Esperadas:
- ⚡ Tiempo de respuesta: < 500ms
- 📊 Tasa de éxito: > 99%
- 🔄 Disponibilidad: > 99.9%

## 🚀 Deployment

### 1. Configurar Variables de Entorno en Producción

```bash
# En el servidor de producción
export IDRIVE_E2_ENDPOINT="https://s3.us-east-1.amazonaws.com"
export IDRIVE_E2_ACCESS_KEY="tu_access_key_produccion"
export IDRIVE_E2_SECRET_KEY="tu_secret_key_produccion"
export IDRIVE_E2_REGION="us-east-1"
export IDRIVE_E2_BUCKET_NAME="musikon-media-prod"
```

### 2. Verificar Configuración

```bash
# Ejecutar script de verificación
node scripts/setup-idrive.js
```

### 3. Reiniciar Servidor

```bash
# Reiniciar el servidor para aplicar cambios
npm run build
npm start
```

## 📞 Soporte

### En Caso de Problemas:
1. **Verificar logs** del servidor
2. **Ejecutar script de diagnóstico**: `node scripts/setup-idrive.js`
3. **Probar endpoints** manualmente
4. **Verificar configuración** de IDrive E2
5. **Contactar administrador** si persisten los problemas

### Información de Contacto:
- 📧 Email: admin@mussikon.com
- 📱 Teléfono: +1-800-MUSIKON
- 💬 Chat: Disponible en el panel de administración

---

**Última actualización:** 8 de Marzo, 2025  
**Versión:** 2.0.0  
**Autor:** Sistema de Desarrollo MussikOn 