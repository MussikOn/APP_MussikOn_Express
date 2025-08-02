# 🚀 Configuración de Producción - Optimizaciones de Rendimiento

## 📋 Índice
- [Configuración de Redis](#redis-configuration)
- [Variables de Entorno](#environment-variables)
- [Monitoreo de Performance](#performance-monitoring)
- [Configuración de Firestore](#firestore-configuration)
- [Deployment Checklist](#deployment-checklist)

---

## 🔴 Redis Configuration

### Instalación y Configuración

#### 1. Instalación de Redis
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# CentOS/RHEL
sudo yum install redis

# macOS
brew install redis
```

#### 2. Configuración de Redis
```bash
# Editar configuración
sudo nano /etc/redis/redis.conf

# Configuraciones recomendadas para producción:
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
tcp-keepalive 300
```

#### 3. Variables de Entorno para Redis
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password
REDIS_DB=0
REDIS_TTL=3600
REDIS_MAX_MEMORY=256mb

# Cache Configuration
CACHE_ENABLED=true
CACHE_TTL=3600
CACHE_MAX_ITEMS=1000
CACHE_CLEANUP_INTERVAL=300000
```

---

## 🌍 Environment Variables

### Variables Completas para Producción

```env
# ===== REDIS & CACHE =====
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password
REDIS_DB=0
REDIS_TTL=3600
REDIS_MAX_MEMORY=256mb

CACHE_ENABLED=true
CACHE_TTL=3600
CACHE_MAX_ITEMS=1000
CACHE_CLEANUP_INTERVAL=300000

# ===== COMPRESSION =====
COMPRESSION_ENABLED=true
COMPRESSION_THRESHOLD=1024
COMPRESSION_LEVEL=6

# ===== QUERY OPTIMIZATION =====
QUERY_OPTIMIZATION_ENABLED=true
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
DEFAULT_SORT_FIELD=createdAt
DEFAULT_SORT_DIRECTION=desc

# ===== FIRESTORE OPTIMIZATION =====
FIRESTORE_BATCH_SIZE=500
FIRESTORE_TIMEOUT=30000
FIRESTORE_RETRY_ATTEMPTS=3

# ===== PERFORMANCE MONITORING =====
PERFORMANCE_MONITORING_ENABLED=true
METRICS_COLLECTION_INTERVAL=60000
SLOW_QUERY_THRESHOLD=1000
```

---

## 📊 Performance Monitoring

### 1. Métricas a Monitorear

#### Cache Metrics
```typescript
// Ejemplo de métricas de cache
{
  hitRate: 0.85,           // Tasa de aciertos
  missRate: 0.15,          // Tasa de fallos
  totalRequests: 10000,    // Total de requests
  averageResponseTime: 45, // Tiempo promedio de respuesta (ms)
  memoryUsage: 128,        // Uso de memoria (MB)
  evictions: 150           // Número de evicciones
}
```

#### Query Performance
```typescript
// Métricas de consultas
{
  averageQueryTime: 120,   // Tiempo promedio de consulta (ms)
  slowQueries: 25,         // Consultas lentas (>1s)
  totalQueries: 5000,      // Total de consultas
  cacheHits: 4250,         // Aciertos de cache
  cacheMisses: 750         // Fallos de cache
}
```

### 2. Configuración de Alertas

```typescript
// Alertas recomendadas
const ALERTS = {
  cacheHitRate: {
    threshold: 0.8,
    action: 'Revisar estrategia de cache'
  },
  responseTime: {
    threshold: 500,
    action: 'Optimizar consultas lentas'
  },
  memoryUsage: {
    threshold: 200,
    action: 'Aumentar memoria Redis'
  },
  errorRate: {
    threshold: 0.05,
    action: 'Revisar logs de errores'
  }
};
```

---

## 🔥 Firestore Configuration

### 1. Índices Recomendados

#### Índices Compuestos para Búsqueda
```javascript
// Músicos por ubicación y instrumento
{
  collection: 'musicians',
  fields: [
    { fieldPath: 'location', order: 'ASCENDING' },
    { fieldPath: 'instruments', order: 'ASCENDING' },
    { fieldPath: 'rating', order: 'DESCENDING' }
  ]
}

// Eventos por fecha y estado
{
  collection: 'events',
  fields: [
    { fieldPath: 'date', order: 'ASCENDING' },
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}

// Mensajes por chat y fecha
{
  collection: 'messages',
  fields: [
    { fieldPath: 'chatId', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

### 2. Scripts de Deployment de Índices

```javascript
// scripts/deploy-indexes.js
const { deployIndexes } = require('../src/services/firestoreOptimizationService');

async function deployRecommendedIndexes() {
  const indexes = [
    // Índices para músicos
    {
      collection: 'musicians',
      fields: ['location', 'instruments', 'rating']
    },
    // Índices para eventos
    {
      collection: 'events',
      fields: ['date', 'status', 'createdAt']
    },
    // Índices para mensajes
    {
      collection: 'messages',
      fields: ['chatId', 'createdAt']
    }
  ];

  for (const index of indexes) {
    try {
      await deployIndexes(index);
      console.log(`✅ Índice creado para ${index.collection}`);
    } catch (error) {
      console.error(`❌ Error creando índice para ${index.collection}:`, error);
    }
  }
}

deployRecommendedIndexes();
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Redis instalado y configurado
- [ ] Variables de entorno configuradas
- [ ] Índices de Firestore creados
- [ ] Tests ejecutados exitosamente
- [ ] Build completado sin errores

### Post-Deployment
- [ ] Verificar conexión a Redis
- [ ] Monitorear métricas de cache
- [ ] Verificar compresión HTTP
- [ ] Probar optimizaciones de consultas
- [ ] Configurar alertas de performance

### Monitoreo Continuo
- [ ] Cache hit rate > 80%
- [ ] Response time < 500ms
- [ ] Error rate < 5%
- [ ] Memory usage < 80%
- [ ] Slow queries < 10%

---

## 🛠️ Comandos Útiles

### Redis Management
```bash
# Verificar estado de Redis
redis-cli ping

# Monitorear Redis en tiempo real
redis-cli monitor

# Ver estadísticas de Redis
redis-cli info stats

# Limpiar cache
redis-cli flushall
```

### Performance Testing
```bash
# Test de carga con Apache Bench
ab -n 1000 -c 10 https://your-api.com/api/musicians

# Test de cache
curl -X GET "https://your-api.com/optimization/cache/stats"

# Test de compresión
curl -H "Accept-Encoding: gzip" -I https://your-api.com/api/musicians
```

### Health Checks
```bash
# Health check general
curl https://your-api.com/health

# Health check de optimizaciones
curl https://your-api.com/optimization/health

# Health check de cache
curl https://your-api.com/optimization/cache/health
```

---

## 📈 Optimización Continua

### 1. Análisis Semanal
- Revisar métricas de performance
- Identificar consultas lentas
- Ajustar TTLs de cache
- Optimizar índices

### 2. Ajustes Mensuales
- Revisar patrones de uso
- Ajustar configuración de Redis
- Actualizar índices de Firestore
- Optimizar queries complejas

### 3. Mejoras Trimestrales
- Evaluar nuevas optimizaciones
- Implementar nuevas estrategias de cache
- Optimizar arquitectura general
- Revisar y actualizar documentación

---

## 🚨 Troubleshooting

### Problemas Comunes

#### Redis Connection Issues
```bash
# Verificar conectividad
telnet your-redis-host 6379

# Verificar configuración
redis-cli -h your-redis-host -p 6379 ping
```

#### Cache Performance Issues
```typescript
// Verificar configuración de cache
const cacheConfig = {
  enabled: process.env.CACHE_ENABLED === 'true',
  ttl: parseInt(process.env.CACHE_TTL) || 3600,
  maxItems: parseInt(process.env.CACHE_MAX_ITEMS) || 1000
};
```

#### Firestore Query Issues
```typescript
// Verificar índices faltantes
const missingIndexes = await firestoreOptimizationService.analyzeQueryPerformance();
console.log('Índices faltantes:', missingIndexes);
```

---

## 📞 Soporte

Para problemas de producción:
1. Revisar logs de aplicación
2. Verificar métricas de Redis
3. Analizar performance de Firestore
4. Contactar al equipo de desarrollo

**Documentación actualizada**: $(date)
**Versión**: 1.0.0 