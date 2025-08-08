# 🔧 Troubleshooting - Sistema de Pagos

## Problemas Comunes y Soluciones

### 1. Error de Campos Undefined en Firestore

#### Problema
```
Value for argument "data" is not a valid Firestore document. Cannot use "undefined" as a Firestore value (found in field "accountNumber")
```

#### Causa
Firestore no permite campos con valor `undefined` en los documentos. Esto ocurre cuando el frontend no envía campos opcionales como `accountNumber`, `depositDate`, `depositTime`, etc.

#### Solución Implementada
Se creó una función utilitaria `cleanObjectForFirestore()` que limpia automáticamente todos los campos `undefined` antes de enviar objetos a Firestore.

**Ubicación:** `src/utils/firebase.ts`

```typescript
export function cleanObjectForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanObjectForFirestore(item)) as T;
  }

  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (typeof value === 'object' && value !== null) {
        cleaned[key] = cleanObjectForFirestore(value);
      } else {
        cleaned[key] = value;
      }
    }
  }

  return cleaned as T;
}
```

#### Servicios Actualizados
- `PaymentSystemService` - Todos los métodos que crean documentos
- `DepositService` - Métodos de creación de depósitos y balances

#### Métodos Corregidos
- `uploadDepositVoucher()` - Creación de depósitos
- `registerBankAccount()` - Registro de cuentas bancarias
- `processEventPayment()` - Procesamiento de pagos
- `createMusicianEarning()` - Creación de ganancias
- `requestWithdrawal()` - Solicitudes de retiro
- `updateUserBalance()` - Actualización de balances
- `getUserBalance()` - Creación de balance inicial

### 2. Error 500 al Crear Depósitos

#### Problema
Error 500 interno del servidor al intentar crear depósitos desde el frontend.

#### Causa
Campos opcionales con valor `undefined` siendo enviados a Firestore.

#### Solución
La función `cleanObjectForFirestore()` se aplica automáticamente en todos los objetos antes de enviarlos a Firestore.

### 3. Problemas de Validación de Datos

#### Problema
Errores de validación en campos opcionales.

#### Solución
Los campos opcionales se manejan de forma segura:
- Si el campo tiene valor, se incluye en el documento
- Si el campo es `undefined`, se omite automáticamente

## Prevención de Problemas

### 1. Uso de la Función Utilitaria
Siempre usar `cleanObjectForFirestore()` al crear objetos para Firestore:

```typescript
const deposit: UserDeposit = cleanObjectForFirestore({
  id: `deposit_${Date.now()}_${userId}`,
  userId,
  amount: depositData.amount,
  // ... otros campos
  accountNumber: depositData.accountNumber, // Campo opcional
  depositDate: depositData.depositDate,     // Campo opcional
  // ... resto de campos
});
```

### 2. Validación de Tipos
Asegurarse de que las interfaces TypeScript reflejen correctamente los campos opcionales:

```typescript
export interface DepositRequest {
  amount: number;
  voucherFile: Express.Multer.File;
  accountHolderName: string;
  accountNumber?: string;  // Campo opcional
  bankName: string;
  depositDate?: string;    // Campo opcional
  depositTime?: string;    // Campo opcional
  referenceNumber?: string; // Campo opcional
  comments?: string;       // Campo opcional
}
```

### 3. Testing
Ejecutar pruebas para verificar que los campos opcionales se manejan correctamente:

```bash
npm run test
```

## Logs y Monitoreo

### Logs Importantes
- `Error subiendo comprobante de depósito` - Indica problemas en la creación de depósitos
- `Value for argument "data" is not a valid Firestore document` - Error específico de campos undefined

### Monitoreo
- Verificar logs del servidor para detectar errores de Firestore
- Monitorear respuestas 500 en endpoints de pagos
- Revisar objetos antes de enviarlos a Firestore

## Contacto y Soporte

Para problemas adicionales:
1. Revisar logs del servidor
2. Verificar configuración de Firestore
3. Comprobar tipos de datos en el frontend
4. Contactar al equipo de desarrollo 