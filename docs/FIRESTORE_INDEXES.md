# 🔍 Índices de Firestore - Sistema MussikOn

## 📋 Resumen

Este documento describe la configuración y uso de índices de Firestore para optimizar las consultas del sistema MussikOn. Los índices son esenciales para mejorar el rendimiento de las consultas complejas y evitar errores de "missing index".

## 🎯 Objetivo

Optimizar todas las consultas del sistema para:
- ✅ Reducir tiempos de respuesta
- ✅ Evitar errores de índices faltantes
- ✅ Mejorar la experiencia del usuario
- ✅ Reducir costos de Firestore

## 📊 Índices Configurados

### 🏷️ Colección: `users`

| Índice | Campos | Propósito |
|--------|--------|-----------|
| `userEmail` | `userEmail ASC` | Búsqueda por email |
| `musician_availability` | `roll ASC, isApproved ASC, isAvailable ASC` | Filtrado de músicos disponibles |
| `user_role_status` | `roll ASC, status ASC` | Filtrado por rol y estado |

### 🎪 Colección: `events`

| Índice | Campos | Propósito |
|--------|--------|-----------|
| `user_status` | `user ASC, status ASC` | Eventos por usuario y estado |
| `status_only` | `status ASC` | Todos los eventos por estado |
| `musician_status` | `assignedMusicianId ASC, status ASC` | Eventos asignados a músico |
| `musician_only` | `assignedMusicianId ASC` | Eventos por músico |
| `search_asc` | `status ASC, eventType ASC, instrument ASC, date ASC` | Búsqueda con orden ascendente |
| `search_desc` | `status ASC, eventType ASC, instrument ASC, date DESC` | Búsqueda con orden descendente |

### 🤝 Colección: `hiring_requests`

| Índice | Campos | Propósito |
|--------|--------|-----------|
| `event_musician_status` | `eventId ASC, musicianId ASC, status ASC` | Solicitudes por evento y músico |
| `musician_created` | `musicianId ASC, createdAt DESC` | Solicitudes del músico ordenadas |
| `creator_created` | `eventCreatorId ASC, createdAt DESC` | Solicitudes del creador ordenadas |
| `musician_status_created` | `musicianId ASC, status ASC, createdAt DESC` | Solicitudes del músico por estado |
| `creator_status_created` | `eventCreatorId ASC, status ASC, createdAt DESC` | Solicitudes del creador por estado |

### 💬 Colección: `conversations`

| Índice | Campos | Propósito |
|--------|--------|-----------|
| `participants_active_updated` | `participants CONTAINS, isActive ASC, updatedAt DESC` | Conversaciones activas |
| `participants_active_unread` | `participants CONTAINS, isActive ASC, unreadCount ASC` | Conversaciones con mensajes no leídos |
| `participants_active_updated_asc` | `participants CONTAINS, isActive ASC, updatedAt ASC` | Conversaciones ordenadas ascendente |
| `participants_active_last_activity` | `participants CONTAINS, isActive ASC, lastActivity DESC` | Conversaciones por última actividad |

### 📨 Colección: `messages`

| Índice | Campos | Propósito |
|--------|--------|-----------|
| `conversation_timestamp_asc` | `conversationId ASC, timestamp ASC` | Mensajes ordenados ascendente |
| `conversation_timestamp_desc` | `conversationId ASC, timestamp DESC` | Mensajes ordenados descendente |
| `read_by` | `readBy CONTAINS` | Mensajes por lector |

### 🔔 Colección: `notifications`

| Índice | Campos | Propósito |
|--------|--------|-----------|
| `user_read_created` | `userId ASC, isRead ASC, createdAt DESC` | Notificaciones por usuario |
| `user_created` | `userId ASC, createdAt ASC` | Notificaciones ordenadas por fecha |

### 💳 Colección: `payments`

| Índice | Campos | Propósito |
|--------|--------|-----------|
| `user_default` | `userId ASC, isDefault DESC` | Métodos de pago por usuario |
| `user_created` | `userId ASC, createdAt ASC` | Pagos ordenados por fecha |

### 🧾 Colección: `invoices`

| Índice | Campos | Propósito |
|--------|--------|-----------|
| `user_status_created` | `userId ASC, status ASC, createdAt DESC` | Facturas por usuario y estado |
| `user_created` | `userId ASC, createdAt ASC` | Facturas ordenadas por fecha |

### 🖼️ Colección: `images`

| Índice | Campos | Propósito |
|--------|--------|-----------|
| `category_created` | `category ASC, createdAt DESC` | Imágenes por categoría |
| `user_created` | `userId ASC, createdAt DESC` | Imágenes por usuario |
| `public_created` | `isPublic ASC, createdAt DESC` | Imágenes públicas |
| `active_created` | `isActive ASC, createdAt DESC` | Imágenes activas |
| `expires_active` | `expiresAt ASC, isActive ASC` | Imágenes por expiración |

### 📍 Colección: `locations`

| Índice | Campos | Propósito |
|--------|--------|-----------|
| `type` | `type ASC` | Ubicaciones por tipo |
| `status` | `status ASC` | Ubicaciones por estado |
| `role_status` | `roll ASC, status ASC` | Ubicaciones por rol y estado |

## 🚀 Uso de los Scripts

### 📦 Desplegar Índices

```bash
# Desplegar todos los índices
npm run deploy:indexes

# Simular el despliegue (sin ejecutar)
npm run indexes:dry-run

# Con opciones adicionales
node scripts/deploy-indexes.js --force
```

### 🔍 Monitorear Construcción

```bash
# Monitorear en tiempo real
npm run monitor:indexes

# Con intervalo personalizado (60 segundos)
node scripts/monitor-indexes.js --interval 60

# Con tiempo máximo personalizado (60 minutos)
node scripts/monitor-indexes.js --max-time 60
```

### 📋 Verificar Estado Manual

```bash
# Ver estado actual de índices
firebase firestore:indexes

# Ver índices de una colección específica
firebase firestore:indexes --collection users
```

## ⚡ Optimización de Consultas

### ✅ Consultas Optimizadas

```typescript
// ✅ Optimizada - Usa índice user_status
db.collection('events')
  .where('user', '==', userEmail)
  .where('status', '==', 'pending_musician')

// ✅ Optimizada - Usa índice musician_availability
db.collection('users')
  .where('roll', '==', 'musico')
  .where('isApproved', '==', true)
  .where('isAvailable', '==', true)

// ✅ Optimizada - Usa índice participants_active_updated
db.collection('conversations')
  .where('participants', 'array-contains', userId)
  .where('isActive', '==', true)
  .orderBy('updatedAt', 'desc')
```

### ❌ Consultas No Optimizadas

```typescript
// ❌ Sin índice - Falta ordenamiento
db.collection('events')
  .where('status', '==', 'pending_musician')
  .orderBy('date', 'desc') // Requiere índice adicional

// ❌ Sin índice - Múltiples condiciones complejas
db.collection('users')
  .where('roll', '==', 'musico')
  .where('isApproved', '==', true)
  .where('location', '==', 'Madrid') // Campo no indexado
```

## 🔧 Mantenimiento

### 📈 Monitoreo de Rendimiento

1. **Revisar logs de Firestore** para consultas lentas
2. **Usar Firebase Console** para ver estadísticas de índices
3. **Monitorear costos** de lectura/escritura

### 🛠️ Actualización de Índices

```bash
# 1. Actualizar firestore.indexes.json
# 2. Desplegar cambios
npm run deploy:indexes

# 3. Monitorear construcción
npm run monitor:indexes
```

### 🧹 Limpieza de Índices

```bash
# Ver índices no utilizados
firebase firestore:indexes --unused

# Eliminar índices no utilizados (cuidado)
firebase firestore:indexes:delete [INDEX_ID]
```

## 📊 Métricas de Rendimiento

### 🎯 Objetivos

- **Tiempo de respuesta**: < 100ms para consultas simples
- **Tiempo de respuesta**: < 500ms para consultas complejas
- **Cobertura de índices**: 100% de consultas optimizadas
- **Errores de índice**: 0%

### 📈 Monitoreo

```typescript
// Ejemplo de métricas de consulta
const startTime = Date.now();
const snapshot = await query.get();
const endTime = Date.now();

logger.info('Consulta completada', {
  duration: endTime - startTime,
  documentCount: snapshot.size,
  metadata: {
    collection: 'events',
    query: 'user_status'
  }
});
```

## 🚨 Solución de Problemas

### ❌ Error: "Missing Index"

```bash
# 1. Verificar índices existentes
firebase firestore:indexes

# 2. Agregar índice faltante a firestore.indexes.json
# 3. Desplegar
npm run deploy:indexes

# 4. Esperar construcción (puede tardar minutos)
npm run monitor:indexes
```

### ⏳ Índices en Construcción

```bash
# Ver estado de construcción
firebase firestore:indexes

# Monitorear progreso
npm run monitor:indexes
```

### 💰 Costos Altos

1. **Revisar consultas** que no usan índices
2. **Optimizar consultas** complejas
3. **Implementar paginación** para grandes conjuntos
4. **Usar cache** para datos frecuentemente accedidos

## 📚 Recursos Adicionales

- [Documentación oficial de Firestore](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Mejores prácticas de índices](https://firebase.google.com/docs/firestore/query-data/indexing#best_practices)
- [Optimización de consultas](https://firebase.google.com/docs/firestore/query-data/queries#query_limitations)

## 🔄 Actualizaciones

### v1.0.0 (Actual)
- ✅ Configuración inicial de índices
- ✅ Scripts de despliegue y monitoreo
- ✅ Documentación completa
- ✅ Optimización de consultas principales

### Próximas Mejoras
- 🔄 Índices compuestos para búsquedas avanzadas
- 🔄 Índices geoespaciales para ubicaciones
- 🔄 Optimización automática basada en uso
- 🔄 Métricas de rendimiento en tiempo real 