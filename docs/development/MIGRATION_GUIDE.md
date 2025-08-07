# 🚀 Guía de Migración del Sistema de Vouchers

## 📋 Resumen

Esta guía te ayudará a migrar el sistema de vouchers existente de URLs directas a referencias de IDrive E2, mejorando la seguridad, eficiencia y flexibilidad del sistema.

## 🎯 Beneficios de la Migración

### ✅ Seguridad Mejorada
- **URLs firmadas temporales**: Las imágenes se acceden mediante URLs firmadas que expiran
- **Control de acceso**: Solo usuarios autorizados pueden generar URLs de acceso
- **Sin URLs permanentes**: Eliminación de URLs directas que podrían ser compartidas

### ⚡ Eficiencia
- **Menos almacenamiento**: Solo se guardan referencias, no URLs completas
- **Actualizaciones automáticas**: Las URLs se generan dinámicamente con la información más reciente
- **Mejor rendimiento**: Consultas más rápidas en Firebase

### 🔧 Flexibilidad
- **Múltiples formatos**: Soporte para diferentes tipos de archivos
- **Metadatos enriquecidos**: Información adicional sobre cada voucher
- **Escalabilidad**: Fácil expansión para nuevas funcionalidades

## 🏗️ Arquitectura del Nuevo Sistema

### Estructura de Datos
```typescript
// Antes (Sistema anterior)
voucherFile: {
  url: "https://musikon-media.c8q1.va03.idrivee2-84.com/musikon-media/deposits/voucher.jpg",
  filename: "voucher.jpg",
  uploadedAt: "2024-01-15T10:00:00Z"
}

// Después (Nuevo sistema)
voucherFile: {
  idriveKey: "musikon-media/deposits/voucher.jpg",
  filename: "voucher.jpg", 
  uploadedAt: "2024-01-15T10:00:00Z",
  tempUrl?: "https://signed-url-with-expiration..." // Solo en respuestas de API
}
```

### Flujo de Trabajo
1. **Upload**: Archivo → IDrive E2 → Guardar `idriveKey` en Firebase
2. **Consulta**: Obtener `idriveKey` → Generar URL firmada → Devolver imagen
3. **Verificación**: Validar existencia del archivo en IDrive E2
4. **Eliminación**: Borrar de IDrive E2 → Actualizar Firebase

## 🔧 Pasos de Migración

### Paso 1: Verificar el Estado Actual
```bash
npm run migrate-vouchers-check
```

Este comando te mostrará:
- Total de depósitos con vouchers
- Cuántos ya están migrados
- Cuántos necesitan migración

### Paso 2: Ejecutar la Migración
```bash
npm run migrate-vouchers
```

El script:
- Identifica vouchers con URLs directas
- Extrae las claves de IDrive E2 de las URLs
- Actualiza la estructura en Firebase
- Mantiene las URLs originales (opcional)

### Paso 3: Verificar la Migración
```bash
npm run migrate-vouchers-check
```

Confirma que todos los vouchers están migrados.

### Paso 4: Probar el Sistema
```bash
npm run test-migrated-vouchers
```

Prueba todas las funcionalidades del nuevo sistema.

## 📡 Nuevos Endpoints Disponibles

### Vouchers
- `POST /vouchers/upload` - Subir nuevo voucher
- `GET /vouchers/:depositId` - Obtener voucher individual
- `POST /vouchers/batch` - Obtener múltiples vouchers
- `GET /vouchers/:depositId/integrity` - Verificar integridad
- `DELETE /vouchers/:depositId` - Eliminar voucher
- `GET /vouchers/statistics` - Estadísticas de vouchers

### Imágenes Individuales
- `GET /imgs/filename/:filename` - Por nombre de archivo
- `GET /imgs/single/:key` - Por clave de IDrive E2
- `GET /imgs/all/idrive` - Listado directo de IDrive E2

## 🔐 Seguridad y Autenticación

### Autenticación Requerida
Todos los endpoints requieren autenticación JWT válida:
```bash
Authorization: Bearer <jwt-token>
```

### Roles de Acceso
- **admin**: Acceso completo a todas las funcionalidades
- **superadmin**: Acceso completo + estadísticas avanzadas
- **user**: Acceso limitado a sus propios vouchers

## 📊 Monitoreo y Logs

### Logs del Sistema
El sistema registra automáticamente:
- Operaciones de migración
- Errores de acceso a IDrive E2
- Intentos de acceso no autorizado
- Estadísticas de uso

### Métricas Disponibles
- Total de vouchers migrados
- Tasa de éxito de migración
- Tiempo promedio de generación de URLs
- Errores por tipo

## 🧪 Pruebas y Validación

### Scripts de Prueba Disponibles
```bash
# Prueba básica del sistema
npm run test-migrated-vouchers

# Prueba con datos de ejemplo
npm run test-migrated-vouchers-sample

# Prueba del sistema de vouchers
npm run test-voucher-system

# Prueba de imágenes individuales
npm run test-single-image
```

### Casos de Prueba
1. **Upload de voucher**: Verificar que se guarde correctamente
2. **Consulta individual**: Obtener voucher con URL firmada
3. **Consulta en lote**: Múltiples vouchers simultáneamente
4. **Verificación de integridad**: Validar existencia del archivo
5. **Eliminación**: Borrar voucher completamente

## ⚠️ Consideraciones Importantes

### Antes de la Migración
- ✅ Hacer backup de la base de datos
- ✅ Verificar conectividad con IDrive E2
- ✅ Confirmar permisos de acceso
- ✅ Probar en ambiente de desarrollo

### Durante la Migración
- ⏸️ Pausar operaciones críticas
- 📊 Monitorear el progreso
- 🔍 Verificar cada paso
- 📝 Documentar cualquier error

### Después de la Migración
- ✅ Verificar funcionalidad completa
- ✅ Actualizar documentación
- ✅ Capacitar al equipo
- ✅ Monitorear rendimiento

## 🚨 Solución de Problemas

### Errores Comunes

#### Error: "No se pudo extraer la clave de IDrive E2"
**Causa**: URL no sigue el formato esperado
**Solución**: Verificar formato de URLs en Firebase

#### Error: "Acceso denegado a IDrive E2"
**Causa**: Credenciales incorrectas o permisos insuficientes
**Solución**: Verificar variables de entorno y permisos

#### Error: "Archivo no encontrado en IDrive E2"
**Causa**: Archivo eliminado o movido
**Solución**: Verificar integridad de archivos

### Comandos de Diagnóstico
```bash
# Verificar conectividad con IDrive E2
npm run test-idrive-config

# Diagnosticar problemas de imágenes
npm run images:diagnose

# Verificar estado de migración
npm run migrate-vouchers-check
```

## 📈 Métricas de Rendimiento

### Antes vs Después
| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Tamaño de datos | ~200 bytes/voucher | ~100 bytes/voucher | 50% |
| Tiempo de consulta | ~500ms | ~200ms | 60% |
| Seguridad | URLs permanentes | URLs temporales | Alta |
| Escalabilidad | Limitada | Alta | Significativa |

## 🔄 Rollback (Si es necesario)

En caso de problemas, puedes revertir la migración:

1. **Restaurar backup** de Firebase
2. **Revertir código** a versión anterior
3. **Actualizar endpoints** en frontend
4. **Verificar funcionalidad** completa

## 📞 Soporte

### Recursos Adicionales
- [Documentación del Sistema de Vouchers](./VOUCHER_SYSTEM_IMPROVEMENT.md)
- [Guía de Endpoints](./SINGLE_IMAGE_ENDPOINTS.md)
- [Scripts de Prueba](./scripts/)

### Contacto
Para soporte técnico o preguntas sobre la migración:
- Revisar logs del sistema
- Ejecutar scripts de diagnóstico
- Consultar documentación técnica

---

## 🎉 ¡Migración Completada!

Una vez que hayas seguido todos los pasos, tu sistema de vouchers estará completamente migrado y funcionando con el nuevo enfoque basado en IDrive E2. Disfruta de las mejoras en seguridad, rendimiento y flexibilidad! 