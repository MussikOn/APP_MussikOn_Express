# 💳 Sistema de Pagos por Transferencia - Backend API

## 📋 Descripción General

El sistema de pagos por transferencia permite a los usuarios realizar depósitos mediante transferencias bancarias, subir comprobantes (bouchers) y que los administradores verifiquen y aprueben estos pagos.

## 🔄 Flujo Completo del Sistema

### 1. **Depósito por Transferencia (App Móvil → Backend)**
```
Usuario App Móvil → Sube Boucher + Datos → Backend → Almacena en Firestore/S3
```

### 2. **Notificación a Administradores**
```
Backend → Crea Notificación → Envía a Admins → Panel Admin Recibe
```

### 3. **Verificación por Administrador**
```
Admin → Revisa Datos → Aprueba/Rechaza → Backend → Actualiza Estado + Notifica Usuario
```

## 🏗️ Arquitectura del Sistema

### Componentes Principales

- **Controlador:** `src/controllers/paymentSystemController.ts`
- **Servicio:** `src/services/paymentSystemService.ts`
- **Tipos:** `src/types/paymentTypes.ts`
- **Rutas:** `src/routes/paymentSystemRoutes.ts`
- **Notificaciones:** `src/controllers/notificationController.ts`
- **Push Notifications:** `src/services/pushNotificationService.ts`

### Base de Datos (Firestore)

#### Colecciones Principales
- `user_deposits` - Depósitos de usuarios
- `user_balances` - Balances de usuarios
- `bank_accounts` - Cuentas bancarias registradas
- `notifications` - Notificaciones del sistema
- `event_payments` - Pagos de eventos
- `musician_earnings` - Ganancias de músicos
- `withdrawal_requests` - Solicitudes de retiro

## 📡 Endpoints API

### Depósitos por Transferencia

#### POST `/api/payments/deposits/upload`
**Descripción:** Subir comprobante de depósito por transferencia

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```json
{
  "amount": "1000.00",
  "voucherFile": "<archivo_boucher>",
  "accountHolderName": "Juan Pérez",
  "accountNumber": "1234567890",
  "bankName": "Banco Popular",
  "depositDate": "2024-01-15",
  "depositTime": "14:30",
  "referenceNumber": "REF123456",
  "comments": "Pago para evento del 20 de enero"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "deposit_1705320000000_user123",
    "userId": "user123@email.com",
    "amount": 1000.00,
    "currency": "RD$",
    "voucherFile": {
      "url": "https://storage.example.com/deposits/boucher_123.jpg",
      "filename": "boucher_123.jpg",
      "uploadedAt": "2024-01-15T14:30:00.000Z"
    },
    "accountHolderName": "Juan Pérez",
    "accountNumber": "1234567890",
    "bankName": "Banco Popular",
    "depositDate": "2024-01-15",
    "depositTime": "14:30",
    "referenceNumber": "REF123456",
    "comments": "Pago para evento del 20 de enero",
    "status": "pending",
    "createdAt": "2024-01-15T14:30:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  },
  "message": "Depósito subido exitosamente. Pendiente de verificación por administrador."
}
```

**Notificación Automática a Administradores:**
```json
{
  "type": "new_deposit",
  "title": "Nuevo Depósito Pendiente",
  "message": "Usuario user123@email.com ha subido un depósito de RD$ 1,000.00",
  "category": "payment",
  "metadata": {
    "depositId": "deposit_1705320000000_user123",
    "userId": "user123@email.com",
    "amount": 1000.00,
    "voucherUrl": "https://storage.example.com/deposits/boucher_123.jpg"
  }
}
```

#### GET `/api/payments/deposits/user`
**Descripción:** Obtener depósitos del usuario autenticado

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "deposit_1705320000000_user123",
      "amount": 1000.00,
      "status": "pending",
      "createdAt": "2024-01-15T14:30:00.000Z",
      "verifiedAt": null,
      "notes": null
    }
  ]
}
```

### Administración de Depósitos

#### GET `/api/admin/payments/deposits/pending`
**Descripción:** Obtener depósitos pendientes (solo admin)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "deposit_1705320000000_user123",
      "userId": "user123@email.com",
      "user": {
        "name": "Juan",
        "lastName": "Pérez",
        "userEmail": "user123@email.com"
      },
      "amount": 1000.00,
      "voucherFile": {
        "url": "https://storage.example.com/deposits/boucher_123.jpg",
        "filename": "boucher_123.jpg"
      },
      "accountHolderName": "Juan Pérez",
      "accountNumber": "1234567890",
      "bankName": "Banco Popular",
      "depositDate": "2024-01-15",
      "depositTime": "14:30",
      "referenceNumber": "REF123456",
      "comments": "Pago para evento del 20 de enero",
      "status": "pending",
      "createdAt": "2024-01-15T14:30:00.000Z"
    }
  ]
}
```

#### POST `/api/admin/payments/deposits/:id/verify`
**Descripción:** Verificar depósito (aprobar/rechazar)

**Body:**
```json
{
  "approved": true,
  "adminNotes": "Depósito verificado correctamente",
  "verificationData": {
    "bankDepositDate": "2024-01-15",
    "bankDepositTime": "14:30",
    "referenceNumber": "REF123456",
    "accountLastFourDigits": "7890",
    "verifiedBy": "admin@mussikon.com"
  }
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "data": {
    "depositId": "deposit_1705320000000_user123",
    "status": "approved",
    "verifiedBy": "admin@mussikon.com",
    "verifiedAt": "2024-01-15T15:00:00.000Z",
    "userBalanceUpdated": true
  },
  "message": "Depósito aprobado exitosamente"
}
```

**Notificación al Usuario:**
```json
{
  "type": "deposit_approved",
  "title": "Depósito Aprobado",
  "message": "Tu depósito de RD$ 1,000.00 ha sido aprobado y agregado a tu balance",
  "category": "payment",
  "metadata": {
    "depositId": "deposit_1705320000000_user123",
    "amount": 1000.00,
    "newBalance": 1500.00
  }
}
```

#### POST `/api/admin/payments/deposits/:id/reject`
**Descripción:** Rechazar depósito

**Body:**
```json
{
  "rejectionReason": "Comprobante no legible",
  "adminNotes": "Por favor, sube una imagen más clara del comprobante"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "depositId": "deposit_1705320000000_user123",
    "status": "rejected",
    "rejectedBy": "admin@mussikon.com",
    "rejectedAt": "2024-01-15T15:00:00.000Z"
  },
  "message": "Depósito rechazado"
}
```

### Balance y Cuentas Bancarias

#### GET `/api/payments/balance`
**Descripción:** Obtener balance del usuario

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "userId": "user123@email.com",
    "balance": 1500.00,
    "currency": "RD$",
    "lastUpdated": "2024-01-15T15:00:00.000Z",
    "totalDeposits": 2000.00,
    "totalWithdrawals": 500.00,
    "totalEarnings": 0.00
  }
}
```

#### POST `/api/payments/bank-accounts`
**Descripción:** Registrar cuenta bancaria

**Body:**
```json
{
  "accountHolder": "Juan Pérez",
  "accountNumber": "1234567890",
  "bankName": "Banco Popular",
  "accountType": "savings",
  "routingNumber": "123456789"
}
```

## 🔔 Sistema de Notificaciones

### Notificaciones Automáticas

#### 1. Nuevo Depósito → Administradores
```typescript
// Se crea automáticamente al subir un depósito
{
  userId: "admin@mussikon.com",
  title: "Nuevo Depósito Pendiente",
  message: `Usuario ${userEmail} ha subido un depósito de ${currency} ${amount}`,
  type: "info",
  category: "payment",
  metadata: {
    depositId,
    userId: userEmail,
    amount,
    voucherUrl
  }
}
```

#### 2. Depósito Aprobado → Usuario
```typescript
// Se crea cuando el admin aprueba
{
  userId: userEmail,
  title: "Depósito Aprobado",
  message: `Tu depósito de ${currency} ${amount} ha sido aprobado`,
  type: "success",
  category: "payment",
  metadata: {
    depositId,
    amount,
    newBalance
  }
}
```

#### 3. Depósito Rechazado → Usuario
```typescript
// Se crea cuando el admin rechaza
{
  userId: userEmail,
  title: "Depósito Rechazado",
  message: `Tu depósito ha sido rechazado: ${reason}`,
  type: "error",
  category: "payment",
  metadata: {
    depositId,
    reason
  }
}
```

### Push Notifications

El sistema también envía push notifications a dispositivos móviles usando Expo:

```typescript
// Para administradores
await pushNotificationService.sendNotificationToUser(adminEmail, {
  title: "Nuevo Depósito Pendiente",
  body: `Usuario ${userEmail} ha subido un depósito de ${currency} ${amount}`,
  data: { depositId, type: "new_deposit" }
});

// Para usuarios
await pushNotificationService.sendNotificationToUser(userEmail, {
  title: "Depósito Aprobado",
  body: `Tu depósito de ${currency} ${amount} ha sido aprobado`,
  data: { depositId, type: "deposit_approved" }
});
```

## 🛡️ Validaciones y Seguridad

### Validaciones de Entrada

#### Depósito
- Monto: Número positivo, máximo RD$ 100,000
- Archivo: JPG, PNG, PDF, máximo 5MB
- Campos obligatorios: amount, voucherFile, accountHolderName, bankName
- Campos opcionales: comments, referenceNumber

#### Verificación Admin
- Solo usuarios con rol 'admin' o 'superadmin'
- Depósito debe estar en estado 'pending'
- Campos obligatorios: approved, verificationData (si approved=true)

### Seguridad
- Autenticación JWT requerida
- Validación de roles para endpoints admin
- Sanitización de archivos subidos
- Rate limiting en endpoints críticos
- Logging de todas las operaciones

## 📊 Monitoreo y Logs

### Logs Importantes

```typescript
// Subida de depósito
logger.info('Depósito subido', { 
  metadata: { userId, amount, depositId } 
});

// Verificación por admin
logger.info('Depósito verificado', { 
  metadata: { depositId, adminId, approved } 
});

// Error en verificación
logger.error('Error verificando depósito', error as Error, { 
  metadata: { depositId, adminId } 
});
```

### Métricas a Monitorear
- Tiempo promedio de verificación de depósitos
- Tasa de aprobación/rechazo
- Volumen de depósitos por día
- Errores en subida de archivos
- Tiempo de respuesta de endpoints

## 🔧 Configuración

### Variables de Entorno

```typescript
// S3 Storage (idriveE2)
IDRIVE_E2_ENDPOINT=https://your-endpoint.com
IDRIVE_E2_ACCESS_KEY=your-access-key
IDRIVE_E2_SECRET_KEY=your-secret-key
IDRIVE_E2_BUCKET_NAME=your-bucket-name

// Comisión de plataforma
PAYMENT_COMMISSION_RATE=0.10 // 10%

// Límites
MAX_DEPOSIT_AMOUNT=100000
MAX_FILE_SIZE=5242880 // 5MB
```

### Índices de Firestore

```json
{
  "indexes": [
    {
      "collectionGroup": "user_deposits",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "user_deposits",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## 🚀 Próximas Mejoras

### Fase 1 (Prioridad Alta)
- [ ] Notificación automática a administradores al recibir depósito
- [ ] Validación completa de campos en el DTO
- [ ] Mejora en la UX del panel admin

### Fase 2 (Prioridad Media)
- [ ] Auditoría avanzada (IP, dispositivo)
- [ ] Filtros y búsqueda en panel admin
- [ ] Reportes de depósitos

### Fase 3 (Prioridad Baja)
- [ ] Integración con APIs bancarias
- [ ] Verificación automática de depósitos
- [ ] Sistema de alertas por montos sospechosos

## 📞 Soporte

Para dudas sobre el sistema de pagos:
- **Desarrollador:** Jefry Astacio
- **Email:** jefry.astacio@mussikon.com
- **Documentación:** `/docs/api/payment-system.md` 