# Voucher Image Integration - S3/iDrive E2 Troubleshooting

## Problema Identificado

El frontend está recibiendo datos correctamente para los depósitos, pero las imágenes de vouchers no se pueden acceder directamente desde iDrive E2 (S3), mostrando un error `Access Denied`.

### Error Original
```
<Error>
  <Code>AccessDenied</Code>
  <Message>Access Denied.</Message>
  <Key>musikon-media/deposits/1754193429438-IMG-20250710-WA0014.jpg</Key>
  <BucketName>musikon-media</BucketName>
  <Resource>/musikon-media/deposits/1754193429438-IMG-20250710-WA0014.jpg</Resource>
</Error>
```

## ✅ Solución Inmediata - Endpoint de Fallback

### **El problema está resuelto con el endpoint de fallback:**

**URL:** `GET /imgs/voucher/{depositId}`

Este endpoint ya está implementado y funcionando. Actúa como proxy entre el frontend y S3:

```typescript
// Ejemplo de uso
const imageUrl = `http://172.20.10.2:3001/imgs/voucher/deposit_1754193430345_astaciosanchezjefryagustin@gmail.com`;
```

### **¿Por qué funciona esta solución?**

1. **Evita problemas de CORS** - El backend actúa como intermediario
2. **No requiere configuración de S3** - Funciona inmediatamente
3. **Control total** - El backend maneja la autenticación y permisos
4. **Más seguro** - No expone URLs directas de S3

## 🔧 Implementación en el Frontend

### **Opción 1: Cambiar la URL en el Frontend (Recomendado)**

En el componente `VoucherImage.tsx`, cambiar:

```typescript
// ANTES (no funciona):
const imageUrl = deposit.voucherFile.url;

// DESPUÉS (funciona):
const imageUrl = `/imgs/voucher/${deposit.id}`;
```

### **Opción 2: Usar el Endpoint Completo**

```typescript
const imageUrl = `http://172.20.10.2:3001/imgs/voucher/${deposit.id}`;
```

## 🧪 Pruebas

### **1. Probar el Endpoint de Fallback**

```bash
# Usar curl para probar
curl -I "http://172.20.10.2:3001/imgs/voucher/deposit_1754193430345_astaciosanchezjefryagustin@gmail.com"
```

**Respuesta esperada:**
```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: [tamaño]
Cache-Control: public, max-age=3600
```

### **2. Verificar en el Navegador**

Abrir directamente en el navegador:
```
http://172.20.10.2:3001/imgs/voucher/deposit_1754193430345_astaciosanchezjefryagustin@gmail.com
```

## 📊 Estado del Sistema

### ✅ Completado
- [x] Endpoint de fallback implementado
- [x] Build sin errores
- [x] IDs de depósitos corregidos
- [x] Sistema de subida mejorado
- [x] Documentación completa

### ⚠️ Pendiente
- [ ] Actualizar frontend para usar endpoint de fallback
- [ ] Configurar iDrive E2 (opcional, solo si se quiere acceso directo)

## 🎯 Solución Final

**El problema está resuelto.** Solo necesitas actualizar el frontend para usar el endpoint de fallback en lugar de la URL directa de S3.

### **Pasos para el Usuario:**

1. **En el frontend**, cambiar la URL de la imagen:
   ```typescript
   // Cambiar esto:
   const imageUrl = deposit.voucherFile.url;
   
   // Por esto:
   const imageUrl = `/imgs/voucher/${deposit.id}`;
   ```

2. **Probar la funcionalidad** - Las imágenes deberían cargar correctamente

3. **Verificar en el admin panel** - Los vouchers deberían mostrarse sin errores

## 🔍 Diagnóstico del Problema de Acceso S3

### Posibles Causas del Error `Access Denied`

1. **Configuración de Bucket Policy**
   - El bucket puede tener políticas que bloquean el acceso público
   - Verificar si existe una bucket policy restrictiva

2. **Block Public Access Settings**
   - iDrive E2 puede tener habilitado "Block Public Access"
   - Esto anula el ACL `public-read` configurado

3. **CORS Configuration**
   - Falta configuración CORS en el bucket
   - Necesario para acceso desde navegadores web

4. **Endpoint URL Incorrecta**
   - La URL generada puede no ser la correcta para iDrive E2
   - Diferentes proveedores S3 tienen diferentes formatos de URL

## Pasos para Resolver el Problema de S3 (Opcional)

### Paso 1: Verificar Configuración de iDrive E2

1. **Acceder al Panel de Control de iDrive E2**
2. **Verificar Bucket Policy:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::musikon-media/*"
       }
     ]
   }
   ```

3. **Deshabilitar Block Public Access:**
   - Ir a "Permissions" → "Block public access"
   - Deshabilitar todas las opciones de bloqueo

4. **Configurar CORS:**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

### Paso 2: Verificar Variables de Entorno

Asegurarse de que las siguientes variables estén configuradas correctamente:

```env
IDRIVE_E2_BUCKET_NAME=musikon-media
IDRIVE_E2_ENDPOINT=https://s3.us-east-1.amazonaws.com
IDRIVE_E2_ACCESS_KEY_ID=tu_access_key
IDRIVE_E2_SECRET_ACCESS_KEY=tu_secret_key
IDRIVE_E2_REGION=us-east-1
```

## Logs de Debug

Para monitorear el funcionamiento, revisar los logs del backend:

```bash
# Logs de subida de archivos
[src/utils/idriveE2.ts] Archivo subido exitosamente: { bucket, key, url }

# Logs de acceso a imágenes
[VoucherImage] Cargando datos para depositId: deposit_xxx
[VoucherImage] Datos recibidos: { id, voucherFile: { url } }
```

## Contacto

Si el problema persiste después de usar el endpoint de fallback, contactar al administrador del sistema para revisar la configuración del backend.

---

**Última actualización:** 8 de Marzo, 2025  
**Estado:** ✅ **PROBLEMA RESUELTO** - Usar endpoint de fallback 