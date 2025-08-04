# 🔍 Guía de Solución de Problemas - Imágenes de Vouchers

## 📋 **Problema: Las imágenes de vouchers no se muestran en el Admin System**

### **🔧 Soluciones Implementadas:**

#### **1. Rutas Disponibles:**

```typescript
// Ruta principal (con redirección)
GET /admin/payments/voucher-image/:depositId

// Ruta alternativa (sin redirección)
GET /admin/payments/voucher-image-direct/:depositId

// Ruta de información (para debugging)
GET /admin/payments/deposit-info/:depositId
```

#### **2. Verificación de Datos:**

**Paso 1: Verificar que el depósito existe**
```bash
curl -X GET "http://localhost:3001/admin/payments/deposit-info/DEPOSIT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "id": "deposit_1234567890_user123",
    "userId": "user123",
    "amount": 1000,
    "currency": "RD$",
    "status": "pending",
    "voucherFile": {
      "url": "https://s3.idrive.com/bucket/deposits/1234567890-voucher.jpg",
      "filename": "voucher.jpg",
      "uploadedAt": "2024-01-15T10:30:00Z"
    },
    "hasVoucherFile": true,
    "voucherUrl": "https://s3.idrive.com/bucket/deposits/1234567890-voucher.jpg"
  }
}
```

#### **3. Pruebas de Imágenes:**

**Opción A: Redirección (actual)**
```bash
curl -I "http://localhost:3001/admin/payments/voucher-image/DEPOSIT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Opción B: Imagen Directa (recomendada)**
```bash
curl -I "http://localhost:3001/admin/payments/voucher-image-direct/DEPOSIT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **🐛 Posibles Problemas y Soluciones:**

#### **Problema 1: Error 404 - Depósito no encontrado**
```json
{
  "error": "Depósito no encontrado"
}
```

**Solución:**
- Verificar que el `depositId` es correcto
- Verificar que el depósito existe en Firestore
- Verificar permisos de administrador

#### **Problema 2: Error 404 - Voucher no encontrado**
```json
{
  "error": "Imagen del voucher no encontrada"
}
```

**Solución:**
- Verificar que el depósito tiene `voucherFile.url`
- Verificar que la URL de S3 es válida
- Verificar permisos de S3

#### **Problema 3: Error 500 - Error del servidor**
```json
{
  "error": "Error obteniendo imagen del voucher"
}
```

**Solución:**
- Verificar logs del servidor
- Verificar conexión a S3
- Verificar variables de entorno

#### **Problema 4: CORS Error en Frontend**
```
Access to image at '...' from origin '...' has been blocked by CORS policy
```

**Solución:**
- Usar la ruta `/voucher-image-direct/` en lugar de `/voucher-image/`
- Verificar configuración de CORS en el backend

### **🔧 Configuración del Frontend:**

#### **Opción 1: Usar Redirección (actual)**
```typescript
// En el componente React
const VoucherImage = ({ depositId }) => {
  return (
    <img 
      src={`/admin/payments/voucher-image/${depositId}`}
      alt="Voucher de depósito"
      onError={(e) => {
        console.error('Error cargando imagen:', e);
        e.target.src = '/placeholder-voucher.png';
      }}
    />
  );
};
```

#### **Opción 2: Usar Imagen Directa (recomendada)**
```typescript
// En el componente React
const VoucherImage = ({ depositId }) => {
  return (
    <img 
      src={`/admin/payments/voucher-image-direct/${depositId}`}
      alt="Voucher de depósito"
      onError={(e) => {
        console.error('Error cargando imagen:', e);
        e.target.src = '/placeholder-voucher.png';
      }}
    />
  );
};
```

#### **Opción 3: Con Manejo de Errores**
```typescript
// En el componente React
const VoucherImage = ({ depositId }) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Intentar cargar la imagen
    const img = new Image();
    img.onload = () => {
      setImageUrl(`/admin/payments/voucher-image-direct/${depositId}`);
      setImageError(false);
    };
    img.onerror = () => {
      setImageError(true);
    };
    img.src = `/admin/payments/voucher-image-direct/${depositId}`;
  }, [depositId]);

  if (imageError) {
    return (
      <div className="voucher-error">
        <p>Error cargando voucher</p>
        <button onClick={() => window.open(`/admin/payments/voucher-image/${depositId}`, '_blank')}>
          Ver en nueva pestaña
        </button>
      </div>
    );
  }

  return (
    <img 
      src={imageUrl}
      alt="Voucher de depósito"
      className="voucher-image"
    />
  );
};
```

### **🔍 Debugging:**

#### **1. Verificar Logs del Servidor:**
```bash
# Buscar logs relacionados con vouchers
grep "voucher" logs/server.log
```

#### **2. Verificar Variables de Entorno:**
```bash
# Verificar configuración de S3
echo $IDRIVE_E2_ENDPOINT
echo $IDRIVE_E2_BUCKET_NAME
echo $IDRIVE_E2_ACCESS_KEY
```

#### **3. Probar URL de S3 Directamente:**
```bash
# Probar acceso directo a S3
curl -I "https://s3.idrive.com/bucket/deposits/1234567890-voucher.jpg"
```

### **📝 Checklist de Verificación:**

- [ ] El depósito existe en Firestore
- [ ] El depósito tiene `voucherFile.url`
- [ ] La URL de S3 es accesible
- [ ] El token de autenticación es válido
- [ ] El usuario tiene permisos de administrador
- [ ] No hay errores de CORS
- [ ] El servidor está funcionando correctamente

### **🚀 Próximos Pasos:**

1. **Probar las rutas** con el script de prueba
2. **Verificar logs** del servidor para errores
3. **Actualizar el frontend** para usar la ruta directa
4. **Implementar manejo de errores** en el frontend
5. **Agregar cache** para mejorar rendimiento

### **📞 Contacto:**

Si los problemas persisten, revisar:
- Logs del servidor
- Configuración de S3
- Permisos de Firestore
- Configuración de CORS 