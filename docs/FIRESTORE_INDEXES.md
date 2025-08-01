# 🔍 Índices de Firestore - MussikOn API

## 📋 Descripción

Este documento lista todos los índices compuestos requeridos por las consultas de Firestore en la aplicación MussikOn. Los índices son necesarios para consultas que combinan múltiples filtros y ordenamiento.

## 🚨 Índices Críticos

### **1. Colección: `conversations`**

#### **Índice para Consulta de Conversaciones por Usuario**
```json
{
  "collectionGroup": "conversations",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "participants",
      "arrayConfig": "CONTAINS"
    },
    {
      "fieldPath": "isActive",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "updatedAt",
      "order": "DESCENDING"
    }
  ]
}
```

**Consulta que lo requiere**:
```typescript
db.collection('conversations')
  .where('participants', 'array-contains', userEmail)
  .where('isActive', '==', true)
  .orderBy('updatedAt', 'desc')
```

**Estado**: ⚠️ **REQUERIDO** - Crear inmediatamente

---

### **2. Colección: `events`**

#### **Índice para Búsqueda de Eventos**
```json
{
  "collectionGroup": "events",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "status",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "eventType",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "date",
      "order": "ASCENDING"
    }
  ]
}
```

**Consulta que lo requiere**:
```typescript
db.collection('events')
  .where('status', '==', 'active')
  .where('eventType', '==', 'concierto')
  .orderBy('date', 'asc')
```

**Estado**: ✅ **OPCIONAL** - Para optimización

---

### **3. Colección: `musicianRequests`**

#### **Índice para Búsqueda de Solicitudes**
```json
{
  "collectionGroup": "musicianRequests",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "status",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "instrument",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "date",
      "order": "ASCENDING"
    }
  ]
}
```

**Estado**: ✅ **OPCIONAL** - Para optimización

---

### **4. Colección: `messages`**

#### **Índice para Mensajes por Conversación**
```json
{
  "collectionGroup": "messages",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "conversationId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "timestamp",
      "order": "ASCENDING"
    }
  ]
}
```

**Consulta que lo requiere**:
```typescript
db.collection('messages')
  .where('conversationId', '==', conversationId)
  .orderBy('timestamp', 'asc')
```

**Estado**: ✅ **OPCIONAL** - Para optimización

---

## 🛠️ Cómo Crear Índices

### **Método 1: Enlace Directo (Recomendado)**

Cuando aparece un error de índice faltante, Firebase proporciona un enlace directo:

```
https://console.firebase.google.com/v1/r/project/mus1k0n/firestore/indexes?create_composite=...
```

1. Haz clic en el enlace
2. Se abrirá Firebase Console con el índice pre-configurado
3. Haz clic en "Create Index"
4. Espera a que se construya (puede tomar 1-5 minutos)

### **Método 2: Firebase Console Manual**

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a **Firestore Database** → **Indexes**
4. Haz clic en **"Create Index"**
5. Configura los campos según la documentación arriba
6. Haz clic en **"Create"**

### **Método 3: Firebase CLI**

```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Crear archivo firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "conversations",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "participants",
          "arrayConfig": "CONTAINS"
        },
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "updatedAt",
          "order": "DESCENDING"
        }
      ]
    }
  ]
}

# Desplegar índices
firebase deploy --only firestore:indexes
```

## 🔍 Verificación de Índices

### **Comprobar Estado**

1. Ve a **Firebase Console** → **Firestore Database** → **Indexes**
2. Busca el índice en la lista
3. El estado debe ser **"Enabled"** (verde)

### **Monitorear Construcción**

Los índices pueden tardar en construirse:
- **Índices pequeños**: 1-2 minutos
- **Índices medianos**: 2-5 minutos
- **Índices grandes**: 5-15 minutos

## 🚨 Errores Comunes

### **Error 9: FAILED_PRECONDITION**

```
Error: 9 FAILED_PRECONDITION: The query requires an index.
```

**Solución**: Crear el índice requerido usando el enlace proporcionado.

### **Error: Index Building**

```
Index is being built. Please wait...
```

**Solución**: Esperar a que termine la construcción del índice.

### **Error: Too Many Indexes**

```
Maximum number of composite indexes reached
```

**Solución**: 
1. Revisar índices no utilizados
2. Eliminar índices obsoletos
3. Optimizar consultas para usar menos índices

## 📊 Optimización de Consultas

### **Mejores Prácticas**

1. **Usar índices existentes**: Diseñar consultas que usen índices ya creados
2. **Limitar filtros**: Usar solo los filtros necesarios
3. **Ordenamiento eficiente**: Ordenar por campos indexados
4. **Paginación**: Usar `limit()` para consultas grandes

### **Ejemplo de Consulta Optimizada**

```typescript
// ✅ Optimizada - usa índice compuesto
const conversations = await db
  .collection('conversations')
  .where('participants', 'array-contains', userEmail)
  .where('isActive', '==', true)
  .orderBy('updatedAt', 'desc')
  .limit(20)
  .get();

// ❌ No optimizada - requiere múltiples índices
const conversations = await db
  .collection('conversations')
  .where('participants', 'array-contains', userEmail)
  .where('isActive', '==', true)
  .where('type', '==', 'private')
  .orderBy('updatedAt', 'desc')
  .orderBy('createdAt', 'desc')
  .get();
```

## 🔄 Mantenimiento

### **Revisión Periódica**

1. **Mensual**: Revisar índices no utilizados
2. **Trimestral**: Optimizar consultas problemáticas
3. **Anual**: Revisar estrategia de indexación

### **Monitoreo**

- Usar **Firebase Console** para monitorear uso de índices
- Revisar logs de errores de consultas
- Optimizar consultas lentas

---

**Última Actualización**: Diciembre 2024  
**Estado**: ✅ Documentación completa  
**Próxima Revisión**: Enero 2025 