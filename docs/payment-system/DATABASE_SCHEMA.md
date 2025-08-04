# Esquema de Base de Datos - Sistema de Pagos

## 📋 Resumen del Esquema

**Base de Datos**: Firebase Firestore  
**Almacenamiento de Archivos**: AWS S3 (idriveE2)  
**Índices**: Optimizados para consultas frecuentes  
**Backup**: Automático y configurado

---

## 🗄️ Colecciones de Firestore

### **1. Colección: `users`**

#### **Descripción**
Almacena información de usuarios del sistema con sus balances y roles.

#### **Estructura**
```typescript
interface User {
  id: string;                    // ID único del usuario
  email: string;                 // Email del usuario
  name: string;                  // Nombre completo
  role: UserRole;                // Rol del usuario
  balance: number;               // Balance actual en centavos
  currency: string;              // Moneda (DOP)
  isActive: boolean;             // Estado activo/inactivo
  profileImage?: string;         // URL de imagen de perfil
  phoneNumber?: string;          // Número de teléfono
  address?: string;              // Dirección
  createdAt: string;             // Fecha de creación (ISO)
  updatedAt: string;             // Fecha de última actualización (ISO)
  lastLoginAt?: string;          // Último login
  emailVerified: boolean;        // Email verificado
  twoFactorEnabled: boolean;     // 2FA habilitado
  preferences: {                 // Preferencias del usuario
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    language: string;
    timezone: string;
  };
}
```

#### **Tipos de Rol**
```typescript
type UserRole = 
  | 'user'              // Usuario básico
  | 'musician'          // Músico
  | 'event_organizer'   // Organizador de eventos
  | 'admin'             // Administrador
  | 'superadmin'        // Super administrador
  | 'senioradmin';      // Administrador senior
```

#### **Índices**
```javascript
// Índices compuestos para consultas eficientes
users: [
  { fields: ['email'], mode: 'ASCENDING' },
  { fields: ['role', 'isActive'], mode: 'ASCENDING' },
  { fields: ['createdAt'], mode: 'DESCENDING' },
  { fields: ['balance'], mode: 'DESCENDING' }
]
```

---

### **2. Colección: `deposits`**

#### **Descripción**
Registra todos los depósitos bancarios realizados por los usuarios.

#### **Estructura**
```typescript
interface Deposit {
  id: string;                    // ID único del depósito
  userId: string;                // ID del usuario
  amount: number;                // Monto en centavos
  currency: string;              // Moneda (DOP)
  status: DepositStatus;         // Estado del depósito
  voucherFile: {                 // Información del comprobante
    url: string;                 // URL del archivo en S3
    filename: string;            // Nombre del archivo
    size: number;                // Tamaño en bytes
    mimeType: string;            // Tipo MIME
    imageId: string;             // ID de la imagen en image_uploads
  };
  accountHolderName: string;     // Nombre del titular de la cuenta
  bankName: string;              // Nombre del banco
  depositDate: string;           // Fecha del depósito (YYYY-MM-DD)
  depositTime?: string;          // Hora del depósito (HH:MM)
  referenceNumber?: string;      // Número de referencia
  comments?: string;             // Comentarios del usuario
  adminNotes?: string;           // Notas del administrador
  verifiedBy?: string;           // ID del admin que verificó
  verifiedAt?: string;           // Fecha de verificación
  rejectionReason?: string;      // Razón del rechazo
  createdAt: string;             // Fecha de creación
  updatedAt: string;             // Fecha de última actualización
  metadata?: {                   // Metadatos adicionales
    ipAddress?: string;          // IP del usuario
    userAgent?: string;          // User agent del navegador
    deviceInfo?: string;         // Información del dispositivo
  };
}
```

#### **Estados de Depósito**
```typescript
type DepositStatus = 
  | 'pending'    // Pendiente de revisión
  | 'approved'   // Aprobado
  | 'rejected';  // Rechazado
```

#### **Índices**
```javascript
deposits: [
  { fields: ['userId', 'status'], mode: 'ASCENDING' },
  { fields: ['status', 'createdAt'], mode: 'DESCENDING' },
  { fields: ['amount'], mode: 'ASCENDING' },
  { fields: ['bankName'], mode: 'ASCENDING' },
  { fields: ['depositDate'], mode: 'DESCENDING' },
  { fields: ['verifiedBy'], mode: 'ASCENDING' }
]
```

---

### **3. Colección: `withdrawals`**

#### **Descripción**
Registra las solicitudes de retiro de ganancias de los músicos.

#### **Estructura**
```typescript
interface Withdrawal {
  id: string;                    // ID único del retiro
  userId: string;                // ID del usuario
  amount: number;                // Monto en centavos
  currency: string;              // Moneda (DOP)
  status: WithdrawalStatus;      // Estado del retiro
  bankAccountId: string;         // ID de la cuenta bancaria
  reason?: string;               // Razón del retiro
  adminNotes?: string;           // Notas del administrador
  processedBy?: string;          // ID del admin que procesó
  processedAt?: string;          // Fecha de procesamiento
  rejectionReason?: string;      // Razón del rechazo
  createdAt: string;             // Fecha de creación
  updatedAt: string;             // Fecha de última actualización
  metadata?: {                   // Metadatos adicionales
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
  };
}
```

#### **Estados de Retiro**
```typescript
type WithdrawalStatus = 
  | 'pending'    // Pendiente de procesamiento
  | 'approved'   // Aprobado
  | 'rejected'   // Rechazado
  | 'processing' // En procesamiento
  | 'completed'; // Completado
```

#### **Índices**
```javascript
withdrawals: [
  { fields: ['userId', 'status'], mode: 'ASCENDING' },
  { fields: ['status', 'createdAt'], mode: 'DESCENDING' },
  { fields: ['amount'], mode: 'ASCENDING' },
  { fields: ['processedBy'], mode: 'ASCENDING' }
]
```

---

### **4. Colección: `bank_accounts`**

#### **Descripción**
Almacena las cuentas bancarias registradas por los usuarios.

#### **Estructura**
```typescript
interface BankAccount {
  id: string;                    // ID único de la cuenta
  userId: string;                // ID del usuario
  accountHolder: string;         // Nombre del titular
  accountNumber: string;         // Número de cuenta (encriptado)
  bankName: string;              // Nombre del banco
  accountType: AccountType;      // Tipo de cuenta
  routingNumber?: string;        // Número de ruta (encriptado)
  isActive: boolean;             // Estado activo/inactivo
  isDefault: boolean;            // Cuenta por defecto
  createdAt: string;             // Fecha de creación
  updatedAt: string;             // Fecha de última actualización
  lastUsedAt?: string;           // Última vez utilizada
  metadata?: {                   // Metadatos adicionales
    lastFourDigits?: string;     // Últimos 4 dígitos (para mostrar)
    bankCode?: string;           // Código del banco
  };
}
```

#### **Tipos de Cuenta**
```typescript
type AccountType = 
  | 'savings'    // Cuenta de ahorros
  | 'checking';  // Cuenta corriente
```

#### **Índices**
```javascript
bank_accounts: [
  { fields: ['userId', 'isActive'], mode: 'ASCENDING' },
  { fields: ['bankName'], mode: 'ASCENDING' },
  { fields: ['accountType'], mode: 'ASCENDING' },
  { fields: ['isDefault'], mode: 'ASCENDING' }
]
```

---

### **5. Colección: `image_uploads`**

#### **Descripción**
Registra todas las imágenes subidas al sistema con metadatos y tracking.

#### **Estructura**
```typescript
interface ImageUpload {
  id: string;                    // ID único de la imagen
  url: string;                   // URL completa en S3
  filename: string;              // Nombre del archivo en S3
  originalName: string;          // Nombre original del archivo
  size: number;                  // Tamaño en bytes
  mimeType: string;              // Tipo MIME
  userId: string;                // ID del usuario que subió
  folder: string;                // Carpeta en S3
  metadata?: Record<string, any>; // Metadatos adicionales
  uploadedAt: string;            // Fecha de subida
  lastAccessed: string;          // Último acceso
  accessCount: number;           // Contador de accesos
  isPublic: boolean;             // Si es público
  isActive: boolean;             // Estado activo/inactivo
  expiresAt?: string;            // Fecha de expiración (opcional)
  tags?: string[];               // Etiquetas para búsqueda
  description?: string;          // Descripción de la imagen
}
```

#### **Índices**
```javascript
image_uploads: [
  { fields: ['userId', 'folder'], mode: 'ASCENDING' },
  { fields: ['mimeType'], mode: 'ASCENDING' },
  { fields: ['uploadedAt'], mode: 'DESCENDING' },
  { fields: ['lastAccessed'], mode: 'DESCENDING' },
  { fields: ['isActive'], mode: 'ASCENDING' },
  { fields: ['tags'], mode: 'ASCENDING' }
]
```

---

### **6. Colección: `transactions`**

#### **Descripción**
Registra todas las transacciones del sistema (depósitos, retiros, pagos).

#### **Estructura**
```typescript
interface Transaction {
  id: string;                    // ID único de la transacción
  userId: string;                // ID del usuario
  type: TransactionType;         // Tipo de transacción
  amount: number;                // Monto en centavos
  currency: string;              // Moneda (DOP)
  status: TransactionStatus;     // Estado de la transacción
  balanceBefore: number;         // Balance antes de la transacción
  balanceAfter: number;          // Balance después de la transacción
  referenceId?: string;          // ID de referencia (depósito, retiro, etc.)
  description: string;           // Descripción de la transacción
  metadata?: Record<string, any>; // Metadatos adicionales
  createdAt: string;             // Fecha de creación
  updatedAt: string;             // Fecha de última actualización
  processedAt?: string;          // Fecha de procesamiento
  processedBy?: string;          // ID del admin que procesó
}
```

#### **Tipos de Transacción**
```typescript
type TransactionType = 
  | 'deposit'           // Depósito bancario
  | 'withdrawal'        // Retiro de ganancias
  | 'payment'           // Pago por evento
  | 'refund'            // Reembolso
  | 'adjustment'        // Ajuste administrativo
  | 'commission';       // Comisión
```

#### **Estados de Transacción**
```typescript
type TransactionStatus = 
  | 'pending'    // Pendiente
  | 'completed'  // Completada
  | 'failed'     // Fallida
  | 'cancelled'; // Cancelada
```

#### **Índices**
```javascript
transactions: [
  { fields: ['userId', 'type'], mode: 'ASCENDING' },
  { fields: ['userId', 'createdAt'], mode: 'DESCENDING' },
  { fields: ['type', 'status'], mode: 'ASCENDING' },
  { fields: ['amount'], mode: 'ASCENDING' },
  { fields: ['createdAt'], mode: 'DESCENDING' }
]
```

---

### **7. Colección: `audit_logs`**

#### **Descripción**
Registra todas las acciones importantes del sistema para auditoría.

#### **Estructura**
```typescript
interface AuditLog {
  id: string;                    // ID único del log
  userId?: string;               // ID del usuario (si aplica)
  adminId?: string;              // ID del admin (si aplica)
  action: string;                // Acción realizada
  resource: string;              // Recurso afectado
  resourceId?: string;           // ID del recurso
  details: Record<string, any>;  // Detalles de la acción
  ipAddress?: string;            // IP del usuario
  userAgent?: string;            // User agent
  timestamp: string;             // Timestamp de la acción
  severity: LogSeverity;         // Severidad del log
  metadata?: Record<string, any>; // Metadatos adicionales
}
```

#### **Niveles de Severidad**
```typescript
type LogSeverity = 
  | 'info'      // Información
  | 'warning'   // Advertencia
  | 'error'     // Error
  | 'critical'; // Crítico
```

#### **Índices**
```javascript
audit_logs: [
  { fields: ['timestamp'], mode: 'DESCENDING' },
  { fields: ['userId'], mode: 'ASCENDING' },
  { fields: ['action'], mode: 'ASCENDING' },
  { fields: ['severity'], mode: 'ASCENDING' },
  { fields: ['resource', 'resourceId'], mode: 'ASCENDING' }
]
```

---

## 🗂️ Estructura de S3 (idriveE2)

### **Organización de Carpetas**

```
mussikon-bucket/
├── uploads/                    # Comprobantes de depósito
│   ├── user_123/
│   │   ├── 1703123456789_abc123_voucher.jpg
│   │   ├── 1703123456790_def456_receipt.pdf
│   │   └── 1703123456791_ghi789_document.png
│   └── user_456/
│       └── 1703123456792_jkl012_voucher.jpg
├── profiles/                   # Imágenes de perfil
│   ├── user_123/
│   │   └── 1703123456793_mno345_profile.jpg
│   └── user_456/
│       └── 1703123456794_pqr678_avatar.png
├── events/                     # Imágenes de eventos
│   ├── event_123/
│   │   ├── 1703123456795_stu901_banner.jpg
│   │   └── 1703123456796_vwx234_gallery/
│   │       ├── image1.jpg
│   │       └── image2.jpg
│   └── event_456/
│       └── 1703123456797_yz012_poster.jpg
├── musicians/                  # Imágenes de músicos
│   ├── musician_123/
│   │   ├── 1703123456798_abc345_photo.jpg
│   │   └── 1703123456799_def678_portfolio/
│   │       ├── photo1.jpg
│   │       └── photo2.jpg
│   └── musician_456/
│       └── 1703123456800_ghi901_profile.jpg
└── temp/                       # Archivos temporales
    └── uploads_temporales/
        └── temp_1703123456801_jkl234_file.jpg
```

### **Convención de Nombres**

```
{timestamp}_{randomSuffix}_{originalName}
```

**Ejemplo**: `1703123456789_abc123_voucher.jpg`

- **timestamp**: Timestamp en milisegundos
- **randomSuffix**: 6 caracteres aleatorios
- **originalName**: Nombre original del archivo (sanitizado)

---

## 🔐 Seguridad y Encriptación

### **Datos Sensibles Encriptados**

#### **Cuentas Bancarias**
```typescript
// Antes de guardar en Firestore
const encryptedAccountNumber = encrypt(accountNumber, ENCRYPTION_KEY);
const encryptedRoutingNumber = encrypt(routingNumber, ENCRYPTION_KEY);

// Al recuperar
const decryptedAccountNumber = decrypt(encryptedAccountNumber, ENCRYPTION_KEY);
```

#### **Información Personal**
```typescript
// Campos que se encriptan
- accountNumber
- routingNumber
- phoneNumber (parcial)
- address (si es necesario)
```

### **Reglas de Seguridad de Firestore**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer/editar solo sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         request.auth.token.role == 'superadmin' || 
         request.auth.token.role == 'senioradmin');
    }
    
    // Depósitos
    match /deposits/{depositId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.role in ['admin', 'superadmin', 'senioradmin']);
      allow create: if request.auth != null;
    }
    
    // Retiros
    match /withdrawals/{withdrawalId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.role in ['admin', 'superadmin', 'senioradmin']);
      allow create: if request.auth != null && 
        request.auth.token.role == 'musician';
    }
    
    // Cuentas bancarias
    match /bank_accounts/{accountId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && 
        request.auth.token.role in ['admin', 'superadmin', 'senioradmin'];
    }
    
    // Imágenes
    match /image_uploads/{imageId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.role in ['admin', 'superadmin', 'senioradmin']);
      allow create: if request.auth != null;
    }
    
    // Transacciones
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.role in ['admin', 'superadmin', 'senioradmin']);
      allow write: if request.auth != null && 
        request.auth.token.role in ['admin', 'superadmin', 'senioradmin'];
    }
    
    // Logs de auditoría
    match /audit_logs/{logId} {
      allow read: if request.auth != null && 
        request.auth.token.role in ['admin', 'superadmin', 'senioradmin'];
      allow create: if request.auth != null;
    }
  }
}
```

---

## 📊 Optimización y Rendimiento

### **Índices Compuestos**

```javascript
// Índices para consultas frecuentes
deposits: [
  // Consulta de depósitos pendientes por admin
  { fields: ['status', 'createdAt'], mode: 'DESCENDING' },
  
  // Consulta de depósitos de usuario
  { fields: ['userId', 'status', 'createdAt'], mode: 'DESCENDING' },
  
  // Consulta por banco y fecha
  { fields: ['bankName', 'depositDate'], mode: 'DESCENDING' },
  
  // Consulta por monto
  { fields: ['amount', 'status'], mode: 'ASCENDING' }
]

transactions: [
  // Consulta de transacciones de usuario
  { fields: ['userId', 'type', 'createdAt'], mode: 'DESCENDING' },
  
  // Consulta por tipo y estado
  { fields: ['type', 'status', 'createdAt'], mode: 'DESCENDING' }
]

image_uploads: [
  // Consulta de imágenes por usuario
  { fields: ['userId', 'folder', 'uploadedAt'], mode: 'DESCENDING' },
  
  // Consulta por tipo MIME
  { fields: ['mimeType', 'uploadedAt'], mode: 'DESCENDING' }
]
```

### **Estrategias de Caché**

```typescript
// Caché de consultas frecuentes
const cacheConfig = {
  // Balance de usuario (5 minutos)
  userBalance: { ttl: 300, key: 'user_balance_{userId}' },
  
  // Estadísticas de pagos (10 minutos)
  paymentStats: { ttl: 600, key: 'payment_stats_{period}' },
  
  // Lista de depósitos pendientes (2 minutos)
  pendingDeposits: { ttl: 120, key: 'pending_deposits' },
  
  // Metadatos de imagen (1 hora)
  imageMetadata: { ttl: 3600, key: 'image_metadata_{imageId}' }
};
```

---

## 🔄 Backup y Recuperación

### **Estrategia de Backup**

```javascript
// Backup automático de Firestore
const backupConfig = {
  // Backup diario a las 2:00 AM
  schedule: '0 2 * * *',
  
  // Retención de 30 días
  retention: 30,
  
  // Colecciones a respaldar
  collections: [
    'users',
    'deposits', 
    'withdrawals',
    'bank_accounts',
    'transactions',
    'audit_logs'
  ],
  
  // Excluir imágenes (se respaldan en S3)
  exclude: ['image_uploads']
};
```

### **Recuperación de Datos**

```typescript
// Script de recuperación
const recoveryScript = {
  // Restaurar desde backup
  restoreFromBackup: async (backupId: string) => {
    // Lógica de restauración
  },
  
  // Restaurar archivos desde S3
  restoreFromS3: async (date: string) => {
    // Lógica de restauración de archivos
  },
  
  // Verificar integridad
  verifyIntegrity: async () => {
    // Verificar consistencia de datos
  }
};
```

---

## 📈 Monitoreo y Métricas

### **Métricas de Base de Datos**

```typescript
// Métricas a monitorear
const dbMetrics = {
  // Rendimiento
  readLatency: 'firestore_read_latency',
  writeLatency: 'firestore_write_latency',
  queryCount: 'firestore_query_count',
  
  // Uso de recursos
  documentCount: 'firestore_document_count',
  storageSize: 'firestore_storage_size',
  indexSize: 'firestore_index_size',
  
  // Errores
  errorRate: 'firestore_error_rate',
  timeoutRate: 'firestore_timeout_rate'
};
```

### **Alertas Configuradas**

```javascript
// Alertas automáticas
const alerts = {
  // Latencia alta
  highLatency: {
    threshold: 1000, // ms
    duration: '5m',
    action: 'notify_admin'
  },
  
  // Tasa de error alta
  highErrorRate: {
    threshold: 0.05, // 5%
    duration: '10m',
    action: 'notify_admin'
  },
  
  // Espacio de almacenamiento
  storageLimit: {
    threshold: 0.8, // 80%
    action: 'notify_admin'
  }
};
```

---

*Documento actualizado: Enero 2024*
*Versión: 2.0*
*Esquema: COMPLETO* 