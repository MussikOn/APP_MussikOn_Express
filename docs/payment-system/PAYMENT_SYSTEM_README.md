# Sistema de Pagos de Mussikon - README

## 🎯 Descripción

El Sistema de Pagos de Mussikon es una solución completa y robusta para la gestión de pagos, depósitos y retiros en la plataforma. Incluye manejo mejorado de imágenes, validaciones de seguridad y un panel de administración completo.

## 🚀 Características Principales

### ✅ Funcionalidades Implementadas

- **Subida de Comprobantes de Depósito**
  - Validación de archivos (imágenes y PDFs)
  - Límite de tamaño: 10MB
  - Generación de nombres únicos
  - Almacenamiento seguro en S3

- **Verificación Administrativa**
  - Panel de administración para revisar depósitos
  - Verificación de vouchers contra movimientos bancarios
  - Aprobación/rechazo con notas
  - Notificaciones automáticas

- **Gestión de Balances**
  - Balance en tiempo real
  - Historial de transacciones
  - Estadísticas detalladas
  - Actualización automática

- **Sistema de Retiros**
  - Solicitudes de retiro para músicos
  - Validación de saldo suficiente
  - Procesamiento administrativo
  - Notificaciones de estado

- **Manejo Mejorado de Imágenes**
  - Validación robusta de archivos
  - Tracking de integridad
  - Limpieza automática
  - Estadísticas de uso

## 📁 Estructura del Proyecto

```
src/
├── controllers/
│   ├── paymentSystemController.ts    # Controlador principal de pagos
│   └── imagesController.ts           # Controlador de imágenes
├── services/
│   ├── paymentSystemService.ts       # Lógica de negocio de pagos
│   └── imageService.ts              # Servicio de imágenes
├── routes/
│   ├── paymentSystemRoutes.ts        # Rutas de pagos
│   └── imagesRoutes.ts              # Rutas de imágenes
├── middleware/
│   └── uploadMiddleware.ts           # Middleware de subida
├── types/
│   └── paymentTypes.ts              # Tipos TypeScript
└── utils/
    └── idriveE2.ts                  # Utilidad de S3
```

## 🔧 Instalación y Configuración

### 1. Dependencias

```bash
npm install
```

### 2. Variables de Entorno

Crear archivo `.env` con las siguientes variables:

```env
# S3 Storage (idriveE2)
IDRIVE_E2_ACCESS_KEY=tu_access_key
IDRIVE_E2_SECRET_KEY=tu_secret_key
IDRIVE_E2_BUCKET_NAME=tu_bucket
IDRIVE_E2_ENDPOINT=https://tu-endpoint.com
IDRIVE_E2_REGION=tu_region

# Firebase
FIREBASE_PROJECT_ID=tu_proyecto
FIREBASE_PRIVATE_KEY=tu_private_key
FIREBASE_CLIENT_EMAIL=tu_client_email

# JWT
JWT_SECRET=tu_jwt_secret

# Servidor
PORT=3000
NODE_ENV=development
```

### 3. Configuración de Firebase

Asegúrate de tener configurados los índices de Firestore:

```javascript
// Índices necesarios
- user_deposits: userId, status, createdAt
- user_balances: userId
- bank_accounts: userId, accountNumber
- withdrawal_requests: status, createdAt
- image_uploads: userId, url
```

## 🚀 Uso

### Endpoints Principales

#### Para Usuarios

```bash
# Obtener balance
GET /payments/my-balance

# Subir depósito
POST /payments/deposit
Content-Type: multipart/form-data

# Obtener depósitos
GET /payments/my-deposits

# Registrar cuenta bancaria
POST /bank-accounts/register

# Solicitar retiro
POST /musicians/withdraw-earnings
```

#### Para Administradores

```bash
# Ver depósitos pendientes
GET /admin/payments/pending-deposits

# Verificar depósito
PUT /admin/payments/verify-deposit/{id}

# Ver imagen del voucher
GET /admin/payments/voucher-image/{id}

# Obtener estadísticas
GET /admin/payments/statistics
```

#### Para Imágenes

```bash
# Subir imagen
POST /images/upload

# Obtener imagen
GET /images/{imageId}

# Verificar integridad
GET /images/{imageId}/integrity

# Validar archivo
POST /images/validate
```

### Ejemplo de Uso

#### Subir un Depósito

```javascript
const formData = new FormData();
formData.append('voucherFile', fileBuffer, 'voucher.jpg');
formData.append('amount', '1000');
formData.append('accountHolderName', 'Juan Pérez');
formData.append('bankName', 'Banco Popular');
formData.append('depositDate', '2024-01-15');
formData.append('depositTime', '14:30');
formData.append('referenceNumber', 'REF123456');
formData.append('comments', 'Pago por suscripción Premium');

const response = await fetch('/payments/deposit', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('Depósito creado:', result.data);
```

#### Verificar un Depósito (Admin)

```javascript
const response = await fetch('/admin/payments/verify-deposit/deposit_123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    approved: true,
    notes: 'Depósito verificado correctamente',
    verificationData: {
      bankDepositDate: '2024-01-15',
      bankDepositTime: '14:30',
      referenceNumber: 'REF123456',
      accountLastFourDigits: '7890'
    }
  })
});

const result = await response.json();
console.log('Depósito verificado:', result.data);
```

## 🧪 Pruebas

### Ejecutar Pruebas Automáticas

```bash
# Configurar variables de entorno para pruebas
export TEST_USER_TOKEN="tu_token_usuario"
export TEST_ADMIN_TOKEN="tu_token_admin"
export API_BASE_URL="http://localhost:3000"

# Ejecutar script de pruebas
node scripts/test-payment-system.js
```

### Pruebas Manuales

```bash
# Probar subida de imagen
curl -X POST "http://localhost:3000/images/upload" \
  -H "Authorization: Bearer $TEST_USER_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "folder=test"

# Probar subida de depósito
curl -X POST "http://localhost:3000/payments/deposit" \
  -H "Authorization: Bearer $TEST_USER_TOKEN" \
  -F "voucherFile=@voucher.jpg" \
  -F "amount=1000" \
  -F "accountHolderName=Usuario Test" \
  -F "bankName=Banco Test"

# Verificar depósito (admin)
curl -X PUT "http://localhost:3000/admin/payments/verify-deposit/deposit_id" \
  -H "Authorization: Bearer $TEST_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"approved": true, "notes": "Test"}'
```

## 🔒 Seguridad

### Validaciones Implementadas

- **Archivos**: Tipo MIME, tamaño máximo, contenido válido
- **Montos**: Límites mínimo y máximo, formato numérico
- **Datos bancarios**: Validación de formato, duplicados
- **Autenticación**: JWT tokens, roles de usuario
- **Autorización**: Permisos granulares por endpoint

### Medidas Anti-Fraude

- Detección de vouchers duplicados
- Validación de montos razonables
- Tracking de intentos de fraude
- Verificación de datos bancarios
- Auditoría completa de transacciones

## 📊 Monitoreo

### Logs Importantes

```javascript
// Subida de depósito
logger.info('Depósito creado', { depositId, userId, amount });

// Verificación de depósito
logger.info('Depósito verificado', { depositId, adminId, approved });

// Error de subida
logger.error('Error subiendo imagen', error, { userId });

// Posible fraude
logger.warn('Posible duplicado detectado', { userId, amount });
```

### Métricas a Monitorear

- Tiempo de respuesta de subida
- Tasa de éxito de subidas
- Uso de almacenamiento
- Errores de validación
- Intentos de fraude

## 🛠️ Mantenimiento

### Limpieza Automática

```bash
# Limpiar imágenes no utilizadas (30 días)
curl -X POST "http://localhost:3000/images/cleanup" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"daysOld": 30}'
```

### Verificar Integridad

```bash
# Verificar integridad de imagen
curl -X GET "http://localhost:3000/images/{imageId}/integrity"
```

### Estadísticas

```bash
# Obtener estadísticas de imágenes
curl -X GET "http://localhost:3000/images/statistics" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Obtener estadísticas de pagos
curl -X GET "http://localhost:3000/admin/payments/statistics" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. Error al subir imagen
```bash
# Verificar configuración de S3
- Revisar credenciales de idriveE2
- Verificar permisos del bucket
- Comprobar conectividad de red
```

#### 2. Imagen no se muestra
```bash
# Verificar integridad
curl -X GET "http://localhost:3000/images/{imageId}/integrity"

# Verificar permisos de S3
- Comprobar ACL del archivo
- Verificar URL de acceso público
```

#### 3. Depósito no aparece en panel admin
```bash
# Verificar índices de Firestore
- Comprobar índices compuestos
- Verificar permisos de lectura
- Revisar logs de notificación
```

### Logs de Debug

```javascript
// Habilitar logs detallados
DEBUG=payment-system:* npm start

// Ver logs específicos
tail -f logs/payment-system.log
```

## 📈 Métricas de Rendimiento

### Objetivos

- **Tiempo de respuesta**: < 2 segundos
- **Tasa de éxito**: > 95%
- **Uptime**: > 99.9%
- **Tiempo de verificación**: < 24 horas

### Monitoreo

```bash
# Ver métricas en tiempo real
curl -X GET "http://localhost:3000/admin/payments/statistics"

# Ver logs de rendimiento
grep "performance" logs/app.log
```

## 🔄 Actualizaciones

### Versión Actual: 2.0

#### Cambios Recientes

- ✅ Manejo mejorado de imágenes
- ✅ Validaciones de seguridad robustas
- ✅ Notificaciones en tiempo real
- ✅ Panel de administración completo
- ✅ Script de pruebas automáticas

#### Próximas Mejoras

- 🔄 Integración bancaria directa
- 🔄 Pagos con tarjeta de crédito
- 🔄 Sistema de reembolsos
- 🔄 Reportes avanzados
- 🔄 API para terceros

## 📞 Soporte

### Contacto

- **Email**: soporte@mussikon.com
- **Documentación**: https://docs.mussikon.com/payments
- **API Docs**: https://api.mussikon.com/docs
- **Status Page**: https://status.mussikon.com

### Recursos

- [Documentación Completa](./docs/payment-system-overview.md)
- [Guía de API](./docs/api-documentation.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Ejemplos de Código](./examples/)

---

*Última actualización: Enero 2024*
*Versión: 2.0*
*Mantenido por: Equipo de Desarrollo Mussikon* 