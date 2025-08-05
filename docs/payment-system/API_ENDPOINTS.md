# API Endpoints - Sistema de Pagos

## 📋 Resumen de Endpoints

**Base URL**: `https://api.mussikon.com/v1`  
**Autenticación**: Bearer Token (JWT)  
**Content-Type**: `application/json` (excepto para uploads: `multipart/form-data`)

---

## 🔐 Autenticación

Todos los endpoints requieren autenticación JWT excepto los marcados como públicos.

```http
Authorization: Bearer <jwt_token>
```

---

## 👤 Endpoints de Usuario

### **1. Subir Comprobante de Depósito**

```http
POST /payments/deposit
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Descripción**: Permite a un usuario subir un comprobante de depósito bancario.

**Parámetros del Formulario**:
- `voucherFile` (file, requerido): Archivo del comprobante (imagen o PDF)
- `amount` (number, requerido): Monto del depósito (RD$ 100 - RD$ 1,000,000)
- `accountHolderName` (string, requerido): Nombre del titular de la cuenta
- `bankName` (string, requerido): Nombre del banco
- `depositDate` (string, requerido): Fecha del depósito (YYYY-MM-DD)
- `depositTime` (string, opcional): Hora del depósito (HH:MM)
- `referenceNumber` (string, opcional): Número de referencia
- `comments` (string, opcional): Comentarios adicionales

**Respuesta Exitosa** (201):
```json
{
  "success": true,
  "message": "Depósito creado exitosamente",
  "data": {
    "id": "dep_123456789",
    "userId": "user_123",
    "amount": 1000,
    "currency": "DOP",
    "status": "pending",
    "voucherFile": {
      "url": "https://s3.amazonaws.com/bucket/uploads/user_123/voucher.jpg",
      "filename": "1703123456789_abc123_voucher.jpg",
      "size": 1024000,
      "mimeType": "image/jpeg"
    },
    "accountHolderName": "Juan Pérez",
    "bankName": "Banco Popular",
    "depositDate": "2024-01-15",
    "depositTime": "14:30",
    "referenceNumber": "REF123456",
    "comments": "Pago por suscripción Premium",
    "createdAt": "2024-01-15T14:30:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

**Errores Posibles**:
- `400`: Datos inválidos o archivo no proporcionado
- `401`: No autenticado
- `413`: Archivo demasiado grande (> 10MB)
- `500`: Error interno del servidor

---

### **2. Obtener Balance del Usuario**

```http
GET /payments/my-balance
Authorization: Bearer <token>
```

**Descripción**: Obtiene el balance actual del usuario autenticado.

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "balance": 2500.50,
    "currency": "DOP",
    "lastUpdated": "2024-01-15T14:30:00.000Z"
  }
}
```

---

### **3. Obtener Historial de Depósitos**

```http
GET /payments/my-deposits
Authorization: Bearer <token>
```

**Parámetros de Query**:
- `status` (string, opcional): Filtrar por estado (pending, approved, rejected)
- `limit` (number, opcional): Límite de resultados (default: 20)
- `offset` (number, opcional): Offset para paginación (default: 0)

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": {
    "deposits": [
      {
        "id": "dep_123456789",
        "amount": 1000,
        "currency": "DOP",
        "status": "approved",
        "voucherFile": {
          "url": "https://s3.amazonaws.com/bucket/uploads/user_123/voucher.jpg",
          "filename": "voucher.jpg"
        },
        "accountHolderName": "Juan Pérez",
        "bankName": "Banco Popular",
        "depositDate": "2024-01-15",
        "createdAt": "2024-01-15T14:30:00.000Z",
        "updatedAt": "2024-01-15T16:45:00.000Z"
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

---

### **4. Registrar Cuenta Bancaria**

```http
POST /bank-accounts/register
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "accountHolder": "Juan Pérez",
  "accountNumber": "1234567890",
  "bankName": "Banco Popular",
  "accountType": "savings",
  "routingNumber": "123456789"
}
```

**Respuesta Exitosa** (201):
```json
{
  "success": true,
  "message": "Cuenta bancaria registrada exitosamente",
  "data": {
    "id": "bank_123456789",
    "userId": "user_123",
    "accountHolder": "Juan Pérez",
    "accountNumber": "1234567890",
    "bankName": "Banco Popular",
    "accountType": "savings",
    "routingNumber": "123456789",
    "isActive": true,
    "createdAt": "2024-01-15T14:30:00.000Z"
  }
}
```

---

### **5. Obtener Cuentas Bancarias**

```http
GET /bank-accounts/my-accounts
Authorization: Bearer <token>
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "bank_123456789",
      "accountHolder": "Juan Pérez",
      "accountNumber": "1234567890",
      "bankName": "Banco Popular",
      "accountType": "savings",
      "isActive": true,
      "createdAt": "2024-01-15T14:30:00.000Z"
    }
  ]
}
```

---

### **6. Solicitar Retiro (Músicos)**

```http
POST /musicians/withdraw-earnings
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "amount": 500,
  "bankAccountId": "bank_123456789",
  "reason": "Retiro de ganancias por eventos"
}
```

**Respuesta Exitosa** (201):
```json
{
  "success": true,
  "message": "Solicitud de retiro creada exitosamente",
  "data": {
    "id": "with_123456789",
    "userId": "user_123",
    "amount": 500,
    "currency": "DOP",
    "status": "pending",
    "bankAccountId": "bank_123456789",
    "reason": "Retiro de ganancias por eventos",
    "createdAt": "2024-01-15T14:30:00.000Z"
  }
}
```

---

## 🔧 Endpoints de Administrador

### **1. Obtener Depósitos Pendientes**

```http
GET /admin/payments/pending-deposits
Authorization: Bearer <admin_token>
```

**Parámetros de Query**:
- `limit` (number, opcional): Límite de resultados (default: 50)
- `offset` (number, opcional): Offset para paginación (default: 0)

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": {
    "deposits": [
      {
        "id": "dep_123456789",
        "userId": "user_123",
        "userEmail": "usuario@example.com",
        "userName": "Juan Pérez",
        "amount": 1000,
        "currency": "DOP",
        "status": "pending",
        "voucherFile": {
          "url": "https://s3.amazonaws.com/bucket/uploads/user_123/voucher.jpg",
          "filename": "voucher.jpg",
          "size": 1024000
        },
        "accountHolderName": "Juan Pérez",
        "bankName": "Banco Popular",
        "depositDate": "2024-01-15",
        "depositTime": "14:30",
        "referenceNumber": "REF123456",
        "comments": "Pago por suscripción Premium",
        "createdAt": "2024-01-15T14:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

---

### **2. Verificar Depósito**

```http
PUT /admin/payments/verify-deposit/{depositId}
Content-Type: application/json
Authorization: Bearer <admin_token>
```

**Body**:
```json
{
  "approved": true,
  "notes": "Depósito verificado correctamente",
  "verificationData": {
    "bankDepositDate": "2024-01-15",
    "bankDepositTime": "14:30",
    "referenceNumber": "REF123456",
    "accountLastFourDigits": "7890"
  }
}
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "message": "Depósito verificado exitosamente",
  "data": {
    "id": "dep_123456789",
    "status": "approved",
    "verifiedBy": "admin_123",
    "verifiedAt": "2024-01-15T16:45:00.000Z",
    "adminNotes": "Depósito verificado correctamente",
    "userBalanceUpdated": 3500.50
  }
}
```

---

### **3. Obtener Estadísticas de Pagos**

```http
GET /admin/payments/statistics
Authorization: Bearer <admin_token>
```

**Parámetros de Query**:
- `period` (string, opcional): Período (today, week, month, year)
- `startDate` (string, opcional): Fecha de inicio (YYYY-MM-DD)
- `endDate` (string, opcional): Fecha de fin (YYYY-MM-DD)

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": {
    "period": "month",
    "totalDeposits": 150,
    "totalAmount": 75000,
    "pendingDeposits": 25,
    "approvedDeposits": 120,
    "rejectedDeposits": 5,
    "averageAmount": 500,
    "currency": "DOP",
    "topBanks": [
      {
        "bankName": "Banco Popular",
        "count": 45,
        "amount": 22500
      },
      {
        "bankName": "Banco de Reservas",
        "count": 35,
        "amount": 17500
      }
    ],
    "dailyStats": [
      {
        "date": "2024-01-15",
        "deposits": 5,
        "amount": 2500
      }
    ]
  }
}
```

---

### **4. Obtener Imagen del Voucher**

```http
GET /admin/payments/voucher-image/{depositId}
Authorization: Bearer <admin_token>
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://s3.amazonaws.com/bucket/uploads/user_123/voucher.jpg",
    "filename": "voucher.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg",
    "uploadedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

---

### **5. Obtener Información Detallada del Depósito**

```http
GET /admin/payments/deposit-info/{depositId}
Authorization: Bearer <admin_token>
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": {
    "id": "dep_123456789",
    "userId": "user_123",
    "userEmail": "usuario@example.com",
    "userName": "Juan Pérez",
    "userRole": "user",
    "amount": 1000,
    "currency": "DOP",
    "status": "pending",
    "voucherFile": {
      "url": "https://s3.amazonaws.com/bucket/uploads/user_123/voucher.jpg",
      "filename": "voucher.jpg",
      "size": 1024000,
      "mimeType": "image/jpeg"
    },
    "accountHolderName": "Juan Pérez",
    "bankName": "Banco Popular",
    "depositDate": "2024-01-15",
    "depositTime": "14:30",
    "referenceNumber": "REF123456",
    "comments": "Pago por suscripción Premium",
    "createdAt": "2024-01-15T14:30:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z",
    "userBalance": 2500.50,
    "userTotalDeposits": 5,
    "userTotalWithdrawals": 2
  }
}
```

---

## 🖼️ Endpoints de Imágenes

### **1. Subir Imagen**

```http
POST /images/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Parámetros del Formulario**:
- `file` (file, requerido): Archivo de imagen
- `folder` (string, opcional): Carpeta de destino (default: "uploads")
- `description` (string, opcional): Descripción de la imagen

**Respuesta Exitosa** (201):
```json
{
  "success": true,
  "message": "Imagen subida exitosamente",
  "data": {
    "url": "https://s3.amazonaws.com/bucket/uploads/user_123/image.jpg",
    "filename": "1703123456789_abc123_image.jpg",
    "size": 512000,
    "mimeType": "image/jpeg",
    "uploadedAt": "2024-01-15T14:30:00.000Z",
    "metadata": {
      "description": "Imagen de perfil"
    }
  }
}
```

---

### **2. Obtener Imagen**

```http
GET /images/{imageId}
Authorization: Bearer <token>
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": {
    "url": "https://s3.amazonaws.com/bucket/uploads/user_123/image.jpg",
    "filename": "1703123456789_abc123_image.jpg",
    "size": 512000,
    "mimeType": "image/jpeg",
    "uploadedAt": "2024-01-15T14:30:00.000Z",
    "lastAccessed": "2024-01-15T16:45:00.000Z",
    "accessCount": 5
  }
}
```

---

### **3. Validar Archivo de Imagen**

```http
POST /images/validate
Content-Type: multipart/form-data
```

**Parámetros del Formulario**:
- `file` (file, requerido): Archivo a validar

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": ["El archivo es grande, puede tardar en subirse"],
    "fileInfo": {
      "size": 5120000,
      "mimeType": "image/jpeg",
      "originalName": "image.jpg"
    }
  }
}
```

---

### **4. Verificar Integridad de Imagen**

```http
GET /images/{imageId}/integrity
Authorization: Bearer <token>
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": {
    "exists": true,
    "accessible": true,
    "size": 512000,
    "lastAccessed": "2024-01-15T16:45:00.000Z",
    "accessCount": 5
  }
}
```

---

### **5. Obtener Estadísticas de Imágenes**

```http
GET /images/statistics
Authorization: Bearer <admin_token>
```

**Parámetros de Query**:
- `userId` (string, opcional): Filtrar por usuario específico

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": {
    "totalImages": 150,
    "totalSize": 75000000,
    "averageSize": 500000,
    "mostUsedMimeTypes": {
      "image/jpeg": 100,
      "image/png": 30,
      "image/gif": 15,
      "application/pdf": 5
    },
    "recentUploads": 25
  }
}
```

---

### **6. Limpiar Imágenes No Utilizadas**

```http
POST /images/cleanup
Content-Type: application/json
Authorization: Bearer <admin_token>
```

**Body**:
```json
{
  "daysOld": 30
}
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "message": "Limpieza completada exitosamente",
  "data": {
    "deletedCount": 15,
    "daysOld": 30
  }
}
```

---

## 📊 Códigos de Error

### **Códigos HTTP Comunes**

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Acceso denegado |
| 404 | Not Found - Recurso no encontrado |
| 413 | Payload Too Large - Archivo demasiado grande |
| 422 | Unprocessable Entity - Datos válidos pero no procesables |
| 500 | Internal Server Error - Error interno del servidor |

### **Formato de Error**

```json
{
  "success": false,
  "error": "Descripción del error",
  "code": "ERROR_CODE",
  "details": {
    "field": "Campo específico con error",
    "value": "Valor que causó el error"
  },
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

---

## 🔒 Roles y Permisos

### **Roles de Usuario**

| Rol | Descripción | Endpoints Accesibles |
|-----|-------------|---------------------|
| `user` | Usuario básico | Depósitos, balance, historial |
| `musician` | Músico | + Retiros de ganancias |
| `event_organizer` | Organizador de eventos | + Gestión de eventos |
| `admin` | Administrador | + Panel de administración |
| `superadmin` | Super administrador | + Configuraciones del sistema |
| `senioradmin` | Administrador senior | + Todas las funciones |

### **Permisos por Endpoint**

| Endpoint | Roles Permitidos |
|----------|------------------|
| `/payments/deposit` | user, musician, event_organizer, admin, superadmin, senioradmin |
| `/payments/my-balance` | user, musician, event_organizer, admin, superadmin, senioradmin |
| `/payments/my-deposits` | user, musician, event_organizer, admin, superadmin, senioradmin |
| `/admin/payments/*` | admin, superadmin, senioradmin |
| `/images/*` | user, musician, event_organizer, admin, superadmin, senioradmin |
| `/musicians/withdraw-earnings` | musician |

---

## 📝 Ejemplos de Uso

### **Ejemplo: Subir Depósito con cURL**

```bash
curl -X POST "https://api.mussikon.com/v1/payments/deposit" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "voucherFile=@/path/to/voucher.jpg" \
  -F "amount=1000" \
  -F "accountHolderName=Juan Pérez" \
  -F "bankName=Banco Popular" \
  -F "depositDate=2024-01-15" \
  -F "depositTime=14:30" \
  -F "referenceNumber=REF123456" \
  -F "comments=Pago por suscripción Premium"
```

### **Ejemplo: Verificar Depósito con JavaScript**

```javascript
const response = await fetch('/admin/payments/verify-deposit/dep_123456789', {
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

---

## 🔄 Rate Limiting

### **Límites por Usuario**

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/payments/deposit` | 10 requests | 1 hora |
| `/images/upload` | 20 requests | 1 hora |
| `/admin/payments/*` | 100 requests | 1 hora |
| Todos los demás | 1000 requests | 1 hora |

### **Headers de Rate Limiting**

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1642248600
```

---

*Documento actualizado: Enero 2024*
*Versión: 2.0*
*API: COMPLETA* 