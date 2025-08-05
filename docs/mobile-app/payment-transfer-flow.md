# 💳 Flujo de Pago por Transferencia - App Móvil

## 📱 Descripción General

La aplicación móvil permite a los usuarios realizar depósitos mediante transferencias bancarias, subir comprobantes (bouchers) y recibir notificaciones sobre el estado de sus pagos.

## 🔄 Flujo de Usuario

### 1. **Inicio del Proceso de Pago**
```
Usuario → Selecciona "Realizar Pago" → Elige "Transferencia Bancaria"
```

### 2. **Información de la Transferencia**
```
Usuario → Ingresa datos del depósito → Sube comprobante → Envía al backend
```

### 3. **Seguimiento del Estado**
```
Usuario → Recibe notificaciones → Consulta estado → Ve balance actualizado
```

## 🎨 Interfaz de Usuario

### Pantalla: "Realizar Depósito por Transferencia"

#### Campos Obligatorios
- **Monto del Depósito** (input numérico)
  - Formato: RD$ 0.00
  - Validación: Mínimo RD$ 100, máximo RD$ 100,000
  - Placeholder: "Ingrese el monto depositado"

- **Nombre del Titular de la Cuenta** (input texto)
  - Validación: Nombre completo obligatorio
  - Placeholder: "Ej: Juan Carlos Pérez Rodríguez"

- **Banco de Origen** (selector)
  - Opciones: Lista de bancos dominicanos
  - Placeholder: "Seleccione el banco"

#### Campos Opcionales
- **Número de Cuenta** (input texto)
  - Placeholder: "Últimos 4 dígitos (opcional)"

- **Fecha del Depósito** (date picker)
  - Default: Fecha actual
  - Placeholder: "Fecha en que realizó el depósito"

- **Hora del Depósito** (time picker)
  - Default: Hora actual
  - Placeholder: "Hora aproximada del depósito"

- **Número de Referencia** (input texto)
  - Placeholder: "Número de referencia bancaria (opcional)"

- **Comentarios** (textarea)
  - Placeholder: "Comentarios adicionales (opcional)"
  - Máximo: 500 caracteres

#### Subida de Comprobante
- **Botón "Seleccionar Comprobante"**
  - Opciones: Cámara o Galería
  - Formatos aceptados: JPG, PNG, PDF
  - Tamaño máximo: 5MB
  - Preview: Mostrar imagen seleccionada

#### Botones de Acción
- **"Cancelar"** - Regresa a pantalla anterior
- **"Enviar Depósito"** - Envía datos al backend

## 📡 Integración con Backend

### Endpoint: `POST /api/payments/deposits/upload`

#### Headers
```javascript
{
  'Authorization': `Bearer ${userToken}`,
  'Content-Type': 'multipart/form-data'
}
```

#### FormData
```javascript
const formData = new FormData();
formData.append('amount', amount);
formData.append('voucherFile', file);
formData.append('accountHolderName', accountHolderName);
formData.append('bankName', bankName);
formData.append('accountNumber', accountNumber || '');
formData.append('depositDate', depositDate);
formData.append('depositTime', depositTime);
formData.append('referenceNumber', referenceNumber || '');
formData.append('comments', comments || '');
```

#### Respuesta Exitosa
```javascript
{
  success: true,
  data: {
    id: "deposit_1705320000000_user123",
    userId: "user123@email.com",
    amount: 1000.00,
    currency: "RD$",
    voucherFile: {
      url: "https://storage.example.com/deposits/boucher_123.jpg",
      filename: "boucher_123.jpg"
    },
    accountHolderName: "Juan Pérez",
    bankName: "Banco Popular",
    status: "pending",
    createdAt: "2024-01-15T14:30:00.000Z"
  },
  message: "Depósito subido exitosamente. Pendiente de verificación por administrador."
}
```

## 🔔 Sistema de Notificaciones

### Notificaciones Push

#### 1. Depósito Aprobado
```javascript
{
  title: "Depósito Aprobado",
  body: "Tu depósito de RD$ 1,000.00 ha sido aprobado y agregado a tu balance",
  data: {
    type: "deposit_approved",
    depositId: "deposit_1705320000000_user123",
    amount: 1000.00
  }
}
```

#### 2. Depósito Rechazado
```javascript
{
  title: "Depósito Rechazado",
  body: "Tu depósito ha sido rechazado: Comprobante no legible",
  data: {
    type: "deposit_rejected",
    depositId: "deposit_1705320000000_user123",
    reason: "Comprobante no legible"
  }
}
```

### Manejo de Notificaciones

```javascript
// En el componente principal
useEffect(() => {
  const handleNotification = (notification) => {
    if (notification.data?.type === 'deposit_approved') {
      // Mostrar mensaje de éxito
      showSuccessMessage('Depósito aprobado exitosamente');
      // Actualizar balance
      refreshUserBalance();
      // Navegar a historial de depósitos
      navigation.navigate('DepositHistory');
    } else if (notification.data?.type === 'deposit_rejected') {
      // Mostrar mensaje de error
      showErrorMessage(`Depósito rechazado: ${notification.data.reason}`);
      // Navegar a pantalla de depósito para reintentar
      navigation.navigate('NewDeposit');
    }
  };

  // Suscribirse a notificaciones
  notificationService.subscribe(handleNotification);
}, []);
```

## 📊 Pantallas Relacionadas

### 1. **Historial de Depósitos**
- Lista de todos los depósitos del usuario
- Estado: Pendiente, Aprobado, Rechazado
- Filtros por estado y fecha
- Detalles de cada depósito

### 2. **Balance Actual**
- Saldo disponible
- Total de depósitos aprobados
- Total de retiros
- Ganancias como músico

### 3. **Detalles del Depósito**
- Información completa del depósito
- Comprobante (imagen)
- Estado y fecha de verificación
- Notas del administrador (si aplica)

## 🛡️ Validaciones del Cliente

### Validaciones de Entrada
```javascript
const validateDepositForm = (formData) => {
  const errors = {};

  // Validar monto
  if (!formData.amount || formData.amount < 100) {
    errors.amount = 'El monto mínimo es RD$ 100';
  }
  if (formData.amount > 100000) {
    errors.amount = 'El monto máximo es RD$ 100,000';
  }

  // Validar nombre del titular
  if (!formData.accountHolderName || formData.accountHolderName.trim().length < 3) {
    errors.accountHolderName = 'Ingrese el nombre completo del titular';
  }

  // Validar banco
  if (!formData.bankName) {
    errors.bankName = 'Seleccione el banco de origen';
  }

  // Validar archivo
  if (!formData.voucherFile) {
    errors.voucherFile = 'Debe seleccionar un comprobante';
  }

  return errors;
};
```

### Validaciones de Archivo
```javascript
const validateFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande. Máximo 5MB');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Formato no válido. Use JPG, PNG o PDF');
  }

  return true;
};
```

## 🎯 Estados de la UI

### Estados de Carga
- **Cargando formulario** - Spinner mientras se cargan datos iniciales
- **Subiendo archivo** - Progress bar durante la subida
- **Enviando depósito** - Botón deshabilitado con spinner
- **Procesando** - Pantalla de confirmación

### Estados de Error
- **Error de conexión** - Mensaje con opción de reintentar
- **Error de validación** - Mensajes específicos por campo
- **Error de archivo** - Mensaje con opción de seleccionar otro archivo
- **Error del servidor** - Mensaje genérico con opción de contactar soporte

### Estados de Éxito
- **Depósito enviado** - Confirmación con ID de depósito
- **Depósito aprobado** - Notificación push + actualización de balance
- **Depósito rechazado** - Notificación con razón y opción de reintentar

## 📱 Componentes Reutilizables

### 1. **CurrencyInput**
```javascript
const CurrencyInput = ({ value, onChange, placeholder, error }) => {
  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType="numeric"
        style={[styles.input, error && styles.inputError]}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};
```

### 2. **FileUploader**
```javascript
const FileUploader = ({ onFileSelect, selectedFile, error }) => {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onFileSelect(result.assets[0]);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
        <Icon name="upload" size={24} />
        <Text>Seleccionar Comprobante</Text>
      </TouchableOpacity>
      {selectedFile && (
        <Image source={{ uri: selectedFile.uri }} style={styles.preview} />
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};
```

### 3. **BankSelector**
```javascript
const BankSelector = ({ selectedBank, onBankSelect, error }) => {
  const banks = [
    { id: 'banco_popular', name: 'Banco Popular' },
    { id: 'banreservas', name: 'Banreservas' },
    { id: 'banco_bhd', name: 'Banco BHD' },
    // ... más bancos
  ];

  return (
    <View>
      <Picker
        selectedValue={selectedBank}
        onValueChange={onBankSelect}
        style={[styles.picker, error && styles.pickerError]}
      >
        <Picker.Item label="Seleccione el banco" value="" />
        {banks.map(bank => (
          <Picker.Item key={bank.id} label={bank.name} value={bank.id} />
        ))}
      </Picker>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};
```

## 🔧 Configuración

### Variables de Entorno
```javascript
// API Configuration
API_BASE_URL=https://api.mussikon.com
API_TIMEOUT=30000

// File Upload
MAX_FILE_SIZE=5242880 // 5MB
ALLOWED_FILE_TYPES=['image/jpeg', 'image/png', 'application/pdf']

// Validation
MIN_DEPOSIT_AMOUNT=100
MAX_DEPOSIT_AMOUNT=100000
```

### Configuración de Notificaciones
```javascript
// Expo Push Notifications
EXPO_PUSH_TOKEN=your-expo-push-token

// Notification Categories
NOTIFICATION_CATEGORIES={
  deposit_approved: {
    title: 'Depósito Aprobado',
    sound: 'success.wav'
  },
  deposit_rejected: {
    title: 'Depósito Rechazado',
    sound: 'error.wav'
  }
}
```

## 🚀 Próximas Mejoras

### Fase 1 (Prioridad Alta)
- [ ] Validación en tiempo real de campos
- [ ] Preview mejorado de comprobantes
- [ ] Guardado automático de formulario

### Fase 2 (Prioridad Media)
- [ ] Escaneo de comprobantes con OCR
- [ ] Historial de depósitos con filtros avanzados
- [ ] Exportar comprobantes

### Fase 3 (Prioridad Baja)
- [ ] Integración con APIs bancarias
- [ ] Verificación automática de depósitos
- [ ] Alertas de depósitos sospechosos

## 📞 Soporte

Para dudas sobre el flujo de pagos en la app móvil:
- **Desarrollador:** Jefry Astacio
- **Email:** jefry.astacio@mussikon.com
- **Documentación:** `/docs/mobile-app/payment-transfer-flow.md` 