# API de Imágenes en MusikOn

## Endpoints CRUD
- `GET /imgs/getAllImg` — Lista todas las imágenes.
- `GET /imgs/getUrl/:key` — Obtiene la URL firmada de una imagen.
- `POST /imgs/upload` — Sube una imagen (form-data, campo `file`).
- `DELETE /imgs/delete/:key` — Elimina una imagen.
- `PUT /imgs/update-metadata/:key` — Actualiza metadatos de una imagen.

## Ejemplo de subida de imagen
```bash
curl -F "file=@/ruta/a/imagen.jpg" http://localhost:1000/imgs/upload
```

## Validaciones y buenas prácticas
- Solo se deben aceptar imágenes (jpg, png, webp, etc.).
- Limitar el tamaño máximo de archivo (ejemplo: 5MB).
- Usar URLs firmadas con expiración corta para acceso temporal.
- No exponer claves de acceso S3 en el frontend.

## Ejemplo de respuesta
```json
{
  "message": "File uploaded successfully",
  "key": "1681234567890_imagen.jpg",
  "url": "https://..."
}
```

---

Consulta este archivo para detalles de integración y restricciones de la API de imágenes. 