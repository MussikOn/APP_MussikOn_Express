# 💳 Sistema de Verificación de Pagos - Panel de Administración

## 🏢 Descripción General

El panel de administración permite a los administradores verificar y aprobar depósitos por transferencia realizados por los usuarios de la aplicación móvil. El sistema incluye notificaciones automáticas, gestión de estados y auditoría completa.

## 🔄 Flujo de Administración

### 1. **Recepción de Notificación**
```
Nuevo Depósito → Notificación Automática → Panel Admin → Bandeja de Entrada
```

### 2. **Proceso de Verificación**
```
Admin → Revisa Datos → Verifica Comprobante → Aprueba/Rechaza → Sistema Actualiza
```

### 3. **Notificación al Usuario**
```
Sistema → Actualiza Estado → Notifica Usuario → Actualiza Balance (si aprobado)
```

## 🎨 Interfaz de Usuario

### Pantalla Principal: "Verificación de Depósitos"

#### Filtros y Búsqueda
- **Estado:** Todos, Pendientes, Aprobados, Rechazados
- **Fecha:** Rango de fechas personalizable
- **Monto:** Rango de montos
- **Usuario:** Búsqueda por email o nombre
- **Banco:** Filtro por banco de origen

#### Lista de Depósitos
```javascript
const depositColumns = [
  { key: 'date', label: 'Fecha', sortable: true },
  { key: 'user', label: 'Usuario', sortable: true },
  { key: 'amount', label: 'Monto', sortable: true },
  { key: 'bank', label: 'Banco', sortable: true },
  { key: 'status', label: 'Estado', sortable: true },
  { key: 'actions', label: 'Acciones', sortable: false }
];
```

#### Estados Visuales
- **Pendiente:** 🟡 Amarillo con ícono de reloj
- **Aprobado:** 🟢 Verde con ícono de check
- **Rechazado:** 🔴 Rojo con ícono de X

### Pantalla de Detalles: "Verificar Depósito"

#### Información del Usuario
```javascript
const userInfo = {
  name: "Juan Carlos Pérez",
  email: "juan.perez@email.com",
  phone: "+1 809-555-0123",
  registrationDate: "2024-01-10",
  totalDeposits: 5,
  totalAmount: 15000.00
};
```

#### Información del Depósito
```javascript
const depositInfo = {
  id: "deposit_1705320000000_user123",
  amount: 1000.00,
  currency: "RD$",
  accountHolderName: "Juan Carlos Pérez Rodríguez",
  bankName: "Banco Popular",
  accountNumber: "1234567890",
  depositDate: "2024-01-15",
  depositTime: "14:30",
  referenceNumber: "REF123456",
  comments: "Pago para evento del 20 de enero",
  status: "pending",
  createdAt: "2024-01-15T14:30:00.000Z"
};
```

#### Comprobante (Boucher)
- **Vista previa:** Imagen ampliable
- **Descarga:** Botón para descargar original
- **Zoom:** Funcionalidad de zoom para detalles
- **Rotación:** Botones para rotar imagen

#### Formulario de Verificación

##### Campos Obligatorios (al aprobar)
- **Fecha del Depósito en Banco** (date picker)
  - Validación: No puede ser posterior a hoy
  - Placeholder: "Fecha en que se realizó el depósito"

- **Hora del Depósito** (time picker)
  - Placeholder: "Hora aproximada del depósito"

- **Número de Referencia** (input texto)
  - Validación: Obligatorio para aprobar
  - Placeholder: "Número de referencia bancaria"

- **Últimos 4 Dígitos de la Cuenta** (input texto)
  - Validación: Exactamente 4 dígitos
  - Placeholder: "Ej: 7890"

##### Campos Opcionales
- **Notas del Administrador** (textarea)
  - Máximo: 1000 caracteres
  - Placeholder: "Notas adicionales sobre la verificación"

#### Botones de Acción
- **"Aprobar Depósito"** - Aprueba y actualiza balance
- **"Rechazar Depósito"** - Rechaza con razón
- **"Solicitar Más Información"** - Marca como pendiente con comentario
- **"Cancelar"** - Regresa a la lista

## 📡 Integración con Backend

### Endpoint: `GET /api/admin/payments/deposits/pending`

#### Headers
```javascript
{
  'Authorization': `Bearer ${adminToken}`,
  'Content-Type': 'application/json'
}
```

#### Query Parameters
```javascript
{
  status: 'pending', // 'pending' | 'approved' | 'rejected' | 'all'
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  minAmount: 100,
  maxAmount: 10000,
  userEmail: 'juan.perez@email.com',
  bankName: 'banco_popular',
  page: 1,
  limit: 20
}
```

#### Respuesta
```javascript
{
  success: true,
  data: [
    {
      id: "deposit_1705320000000_user123",
      userId: "juan.perez@email.com",
      user: {
        name: "Juan Carlos",
        lastName: "Pérez",
        userEmail: "juan.perez@email.com"
      },
      amount: 1000.00,
      voucherFile: {
        url: "https://storage.example.com/deposits/boucher_123.jpg",
        filename: "boucher_123.jpg"
      },
      accountHolderName: "Juan Carlos Pérez Rodríguez",
      accountNumber: "1234567890",
      bankName: "Banco Popular",
      depositDate: "2024-01-15",
      depositTime: "14:30",
      referenceNumber: "REF123456",
      comments: "Pago para evento del 20 de enero",
      status: "pending",
      createdAt: "2024-01-15T14:30:00.000Z"
    }
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 45,
    totalPages: 3
  }
}
```

### Endpoint: `POST /api/admin/payments/deposits/:id/verify`

#### Headers
```javascript
{
  'Authorization': `Bearer ${adminToken}`,
  'Content-Type': 'application/json'
}
```

#### Body (Aprobar)
```javascript
{
  approved: true,
  adminNotes: "Depósito verificado correctamente",
  verificationData: {
    bankDepositDate: "2024-01-15",
    bankDepositTime: "14:30",
    referenceNumber: "REF123456",
    accountLastFourDigits: "7890",
    verifiedBy: "admin@mussikon.com"
  }
}
```

#### Body (Rechazar)
```javascript
{
  approved: false,
  adminNotes: "Comprobante no legible, por favor subir una imagen más clara",
  rejectionReason: "Comprobante no legible"
}
```

#### Respuesta Exitosa
```javascript
{
  success: true,
  data: {
    depositId: "deposit_1705320000000_user123",
    status: "approved",
    verifiedBy: "admin@mussikon.com",
    verifiedAt: "2024-01-15T15:00:00.000Z",
    userBalanceUpdated: true
  },
  message: "Depósito aprobado exitosamente"
}
```

## 🔔 Sistema de Notificaciones

### Notificaciones Recibidas

#### 1. Nuevo Depósito Pendiente
```javascript
{
  id: "notification_123",
  title: "Nuevo Depósito Pendiente",
  message: "Usuario juan.perez@email.com ha subido un depósito de RD$ 1,000.00",
  type: "info",
  category: "payment",
  isRead: false,
  createdAt: "2024-01-15T14:30:00.000Z",
  metadata: {
    depositId: "deposit_1705320000000_user123",
    userId: "juan.perez@email.com",
    amount: 1000.00,
    voucherUrl: "https://storage.example.com/deposits/boucher_123.jpg"
  }
}
```

### Notificaciones Enviadas

#### 1. Depósito Aprobado → Usuario
```javascript
{
  userId: "juan.perez@email.com",
  title: "Depósito Aprobado",
  message: "Tu depósito de RD$ 1,000.00 ha sido aprobado y agregado a tu balance",
  type: "success",
  category: "payment",
  metadata: {
    depositId: "deposit_1705320000000_user123",
    amount: 1000.00,
    newBalance: 1500.00
  }
}
```

#### 2. Depósito Rechazado → Usuario
```javascript
{
  userId: "juan.perez@email.com",
  title: "Depósito Rechazado",
  message: "Tu depósito ha sido rechazado: Comprobante no legible",
  type: "error",
  category: "payment",
  metadata: {
    depositId: "deposit_1705320000000_user123",
    reason: "Comprobante no legible"
  }
}
```

## 📊 Dashboard y Estadísticas

### Panel de Resumen
```javascript
const dashboardStats = {
  pendingDeposits: 12,
  approvedToday: 8,
  rejectedToday: 2,
  totalAmountPending: 25000.00,
  averageProcessingTime: "2.5 horas",
  verificationRate: "85%"
};
```

### Gráficos y Métricas
- **Depósitos por Estado** (Pie Chart)
- **Volumen Diario** (Line Chart)
- **Tiempo de Procesamiento** (Bar Chart)
- **Tasa de Aprobación** (Gauge Chart)

### Reportes Exportables
- **Reporte Diario:** Depósitos procesados hoy
- **Reporte Semanal:** Resumen semanal de verificaciones
- **Reporte Mensual:** Estadísticas completas del mes
- **Reporte por Usuario:** Historial de depósitos de un usuario específico

## 🛡️ Validaciones y Seguridad

### Validaciones del Cliente
```javascript
const validateVerificationForm = (formData) => {
  const errors = {};

  if (formData.approved) {
    // Validaciones para aprobación
    if (!formData.verificationData.bankDepositDate) {
      errors.bankDepositDate = 'Fecha del depósito es obligatoria';
    }
    
    if (!formData.verificationData.referenceNumber) {
      errors.referenceNumber = 'Número de referencia es obligatorio';
    }
    
    if (!formData.verificationData.accountLastFourDigits || 
        formData.verificationData.accountLastFourDigits.length !== 4) {
      errors.accountLastFourDigits = 'Debe ingresar exactamente 4 dígitos';
    }
  } else {
    // Validaciones para rechazo
    if (!formData.rejectionReason) {
      errors.rejectionReason = 'Debe especificar la razón del rechazo';
    }
  }

  return errors;
};
```

### Seguridad
- **Autenticación:** JWT requerido
- **Autorización:** Solo usuarios con rol 'admin' o 'superadmin'
- **Auditoría:** Log de todas las acciones
- **Rate Limiting:** Máximo 10 verificaciones por minuto
- **Validación de Datos:** Sanitización de inputs

## 🎯 Estados de la UI

### Estados de Carga
- **Cargando lista** - Skeleton loader para la tabla
- **Cargando detalles** - Spinner en pantalla de detalles
- **Procesando verificación** - Botones deshabilitados con spinner
- **Actualizando estado** - Indicador de progreso

### Estados de Error
- **Error de conexión** - Mensaje con opción de reintentar
- **Error de validación** - Mensajes específicos por campo
- **Error de permisos** - Mensaje de acceso denegado
- **Error del servidor** - Mensaje genérico con opción de contactar soporte

### Estados de Éxito
- **Depósito aprobado** - Confirmación con actualización de balance
- **Depósito rechazado** - Confirmación con razón
- **Notificación enviada** - Confirmación de notificación al usuario

## 📱 Componentes Reutilizables

### 1. **DepositTable**
```javascript
const DepositTable = ({ deposits, onRowClick, onStatusChange }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Fecha</TableHeaderCell>
          <TableHeaderCell>Usuario</TableHeaderCell>
          <TableHeaderCell>Monto</TableHeaderCell>
          <TableHeaderCell>Banco</TableHeaderCell>
          <TableHeaderCell>Estado</TableHeaderCell>
          <TableHeaderCell>Acciones</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deposits.map(deposit => (
          <TableRow key={deposit.id} onClick={() => onRowClick(deposit)}>
            <TableCell>{formatDate(deposit.createdAt)}</TableCell>
            <TableCell>{deposit.user.name}</TableCell>
            <TableCell>{formatCurrency(deposit.amount)}</TableCell>
            <TableCell>{deposit.bankName}</TableCell>
            <TableCell>
              <StatusBadge status={deposit.status} />
            </TableCell>
            <TableCell>
              <ActionButtons deposit={deposit} onStatusChange={onStatusChange} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

### 2. **VerificationForm**
```javascript
const VerificationForm = ({ deposit, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    approved: false,
    adminNotes: '',
    verificationData: {
      bankDepositDate: '',
      bankDepositTime: '',
      referenceNumber: '',
      accountLastFourDigits: ''
    },
    rejectionReason: ''
  });

  const handleSubmit = () => {
    const errors = validateVerificationForm(formData);
    if (Object.keys(errors).length === 0) {
      onSubmit(deposit.id, formData);
    }
  };

  return (
    <Form>
      <FormSection title="Información del Depósito">
        <InfoRow label="Usuario" value={deposit.user.name} />
        <InfoRow label="Monto" value={formatCurrency(deposit.amount)} />
        <InfoRow label="Banco" value={deposit.bankName} />
        <InfoRow label="Fecha" value={formatDate(deposit.createdAt)} />
      </FormSection>

      <FormSection title="Comprobante">
        <ImagePreview src={deposit.voucherFile.url} />
      </FormSection>

      <FormSection title="Verificación">
        <RadioGroup
          value={formData.approved}
          onChange={(value) => setFormData({...formData, approved: value})}
        >
          <Radio value={true}>Aprobar Depósito</Radio>
          <Radio value={false}>Rechazar Depósito</Radio>
        </RadioGroup>

        {formData.approved ? (
          <VerificationFields
            data={formData.verificationData}
            onChange={(data) => setFormData({...formData, verificationData: data})}
          />
        ) : (
          <RejectionFields
            reason={formData.rejectionReason}
            onChange={(reason) => setFormData({...formData, rejectionReason: reason})}
          />
        )}

        <TextArea
          label="Notas del Administrador"
          value={formData.adminNotes}
          onChange={(notes) => setFormData({...formData, adminNotes: notes})}
          placeholder="Notas adicionales sobre la verificación"
        />
      </FormSection>

      <FormActions>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit}>
          {formData.approved ? 'Aprobar' : 'Rechazar'} Depósito
        </Button>
      </FormActions>
    </Form>
  );
};
```

### 3. **NotificationCenter**
```javascript
const NotificationCenter = ({ notifications, onMarkAsRead }) => {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Badge count={notifications.filter(n => !n.isRead).length}>
          <Icon name="bell" />
        </Badge>
      </DropdownTrigger>
      <DropdownContent>
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={() => onMarkAsRead(notification.id)}
          />
        ))}
      </DropdownContent>
    </Dropdown>
  );
};
```

## 🔧 Configuración

### Variables de Entorno
```javascript
// API Configuration
API_BASE_URL=https://api.mussikon.com
API_TIMEOUT=30000

// Admin Configuration
ADMIN_SESSION_TIMEOUT=3600000 // 1 hora
MAX_DEPOSITS_PER_PAGE=20
AUTO_REFRESH_INTERVAL=30000 // 30 segundos

// Notification Configuration
NOTIFICATION_SOUND_ENABLED=true
NOTIFICATION_DESKTOP_ENABLED=true
```

### Configuración de Permisos
```javascript
const ADMIN_PERMISSIONS = {
  view_deposits: true,
  verify_deposits: true,
  reject_deposits: true,
  view_reports: true,
  export_data: true,
  manage_users: false // Solo superadmin
};
```

## 🚀 Próximas Mejoras

### Fase 1 (Prioridad Alta)
- [ ] Notificaciones en tiempo real con WebSockets
- [ ] Filtros avanzados y búsqueda
- [ ] Exportación de reportes en múltiples formatos

### Fase 2 (Prioridad Media)
- [ ] Verificación en lote (múltiples depósitos)
- [ ] Plantillas de respuestas para rechazos
- [ ] Dashboard con métricas en tiempo real

### Fase 3 (Prioridad Baja)
- [ ] Integración con APIs bancarias
- [ ] Verificación automática con IA
- [ ] Sistema de alertas por montos sospechosos

## 📞 Soporte

Para dudas sobre el sistema de verificación de pagos:
- **Desarrollador:** Jefry Astacio
- **Email:** jefry.astacio@mussikon.com
- **Documentación:** `/docs/admin-system/payment-verification.md` 