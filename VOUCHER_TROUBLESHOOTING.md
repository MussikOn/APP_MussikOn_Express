# Voucher Image Access Troubleshooting Guide

## 🚨 Problema Actual

El frontend está recibiendo datos correctamente, pero las imágenes de vouchers muestran error `Access Denied` cuando se intenta acceder directamente desde iDrive E2 (S3).

### Error Específico
```
<Error>
  <Code>AccessDenied</Code>
  <Message>Access Denied.</Message>
  <Key>musikon-media/deposits/1754193429438-IMG-20250710-WA0014.jpg</Key>
  <BucketName>musikon-media</BucketName>
</Error>
```

## ✅ Soluciones Implementadas

### 1. Endpoint de Fallback Funcionando

**URL:** `GET /imgs/voucher/{depositId}`

Este endpoint ya está implementado y funcionando. Actúa como proxy entre el frontend y S3:

```typescript
// Ejemplo de uso
const imageUrl = `http://172.20.10.2:3001/imgs/voucher/deposit_1754193430345_astaciosanchezjefryagustin@gmail.com`;
```

### 2. Mejoras en el Sistema de Subida

- ✅ Validación de variables de entorno
- ✅ ACL público configurado (`public-read`)
- ✅ URLs generadas correctamente
- ✅ Logging mejorado

### 3. Consistencia en IDs

- ✅ IDs de depósitos corregidos: `deposit_` en lugar de `dpt_deposit_`
- ✅ Frontend y backend sincronizados

## 🔧 Pasos para Resolver el Problema

### Opción 1: Usar el Endpoint de Fallback (Recomendado)

**Ventajas:**
- ✅ Funciona inmediatamente
- ✅ Evita problemas de CORS
- ✅ Control total desde el backend
- ✅ No requiere cambios en iDrive E2

**Implementación:**
```typescript
// En el frontend, cambiar:
const imageUrl = deposit.voucherFile.url;

// Por:
const imageUrl = `/imgs/voucher/${deposit.id}`;
```

### Opción 2: Configurar iDrive E2 Correctamente

Si prefieres acceso directo a S3, seguir estos pasos:

#### Paso 1: Verificar Bucket Policy
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

#### Paso 2: Deshabilitar Block Public Access
1. Ir al panel de control de iDrive E2
2. Seleccionar el bucket `musikon-media`
3. Ir a "Permissions" → "Block public access"
4. Deshabilitar todas las opciones

#### Paso 3: Configurar CORS
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

## 🧪 Pruebas Recomendadas

### 1. Probar el Endpoint de Fallback

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

### 2. Verificar Variables de Entorno

```bash
# En el backend, verificar que estas variables estén configuradas:
IDRIVE_E2_BUCKET_NAME=musikon-media
IDRIVE_E2_ENDPOINT=https://s3.us-east-1.amazonaws.com
IDRIVE_E2_ACCESS_KEY_ID=[tu_access_key]
IDRIVE_E2_SECRET_ACCESS_KEY=[tu_secret_key]
```

### 3. Probar Subida de Archivos

```bash
# Verificar logs durante la subida
[src/utils/idriveE2.ts] Archivo subido exitosamente: {
  bucket: "musikon-media",
  key: "deposits/1754193429438-IMG-20250710-WA0014.jpg",
  url: "https://musikon-media.c8q1.va03.idrivee2-84.com/musikon-media/deposits/1754193429438-IMG-20250710-WA0014.jpg"
}
```

## 📊 Estado del Sistema

### ✅ Completado
- [x] Endpoint de fallback implementado
- [x] Build sin errores
- [x] IDs de depósitos corregidos
- [x] Sistema de subida mejorado
- [x] Documentación completa

### ⚠️ Pendiente
- [ ] Configurar iDrive E2 (si se elige acceso directo)
- [ ] Actualizar frontend para usar endpoint de fallback
- [ ] Pruebas en producción

## 🎯 Recomendación Final

**Usar el endpoint de fallback** (`/imgs/voucher/{depositId}`) porque:

1. **Funciona inmediatamente** sin configuración adicional
2. **Evita problemas de CORS** y permisos de S3
3. **Proporciona control total** desde el backend
4. **Es más seguro** al no exponer URLs directas de S3
5. **Permite cache y optimización** desde el backend

## 📞 Soporte

Si necesitas ayuda adicional:

1. **Verificar logs del backend** para errores específicos
2. **Probar el endpoint de fallback** con curl
3. **Revisar la documentación** en `VOUCHER_S3_INTEGRATION.md`
4. **Contactar al administrador** para configuración de iDrive E2

---

**Última actualización:** 8 de Marzo, 2025  
**Estado:** ✅ Backend funcional, ⚠️ Configuración S3 pendiente 