# 📊 API de Analytics y Reportes

> **Sistema completo de métricas, analytics y reportes para la plataforma MussikOn**

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Endpoints](#endpoints)
- [Métricas Disponibles](#métricas-disponibles)
- [Filtros y Parámetros](#filtros-y-parámetros)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Respuestas](#respuestas)
- [Dashboard](#dashboard)
- [Exportación](#exportación)
- [Integración](#integración)

## 🎯 Descripción General

La API de Analytics proporciona métricas detalladas y reportes sobre el uso de la plataforma, incluyendo eventos, solicitudes de músicos, usuarios y tendencias temporales.

### Características Principales

- **Métricas de eventos** (creación, aceptación, cancelación)
- **Analytics de solicitudes** (tendencias, tasas de aceptación)
- **Estadísticas de usuarios** (registros, actividad)
- **Reportes de ubicación** y rendimiento geográfico
- **Tendencias temporales** y análisis de patrones
- **Dashboard administrativo** con métricas en tiempo real
- **Exportación de reportes** en CSV

## 📡 Endpoints

### 1. Métricas de Eventos

**GET** `/analytics/events`

Métricas detalladas sobre eventos de la plataforma.

### 2. Métricas de Solicitudes

**GET** `/analytics/requests`

Analytics de solicitudes de músicos y su rendimiento.

### 3. Métricas de Usuarios

**GET** `/analytics/users`

Estadísticas de usuarios y su actividad.

### 4. Métricas de Plataforma

**GET** `/analytics/platform`

Métricas generales de la plataforma.

### 5. Reporte de Tendencias

**GET** `/analytics/trends`

Análisis de tendencias temporales.

### 6. Rendimiento por Ubicación

**GET** `/analytics/location-performance`

Métricas de rendimiento geográfico.

### 7. Usuarios Más Activos

**GET** `/analytics/top-users`

Ranking de usuarios más activos.

### 8. Dashboard Administrativo

**GET** `/analytics/dashboard`

Dashboard completo con todas las métricas principales.

### 9. Exportar Reportes

**GET** `/analytics/export`

Exportar reportes en formato CSV.

## 📊 Métricas Disponibles

### Métricas de Eventos

- **Total de eventos** creados
- **Eventos por estado** (pendiente, asignado, completado, cancelado)
- **Eventos por tipo** (boda, concierto, evento corporativo, etc.)
- **Ingresos totales** y promedio por evento
- **Tasa de aceptación** de eventos
- **Tiempo promedio** de asignación
- **Eventos por ubicación**

### Métricas de Solicitudes

- **Total de solicitudes** creadas
- **Solicitudes por estado** (pendiente, asignada, cancelada, completada)
- **Tasa de aceptación** de solicitudes
- **Tiempo promedio** de respuesta
- **Solicitudes por instrumento**
- **Solicitudes por ubicación**

### Métricas de Usuarios

- **Total de usuarios** registrados
- **Usuarios por rol** (músico, organizador, admin)
- **Usuarios activos** vs inactivos
- **Crecimiento de usuarios** por período
- **Usuarios por ubicación**
- **Actividad de usuarios** (eventos creados, solicitudes aceptadas)

### Métricas de Plataforma

- **Uso general** de la plataforma
- **Picos de actividad** por hora/día
- **Dispositivos** más utilizados
- **Funcionalidades** más populares
- **Tiempo promedio** de sesión

## 🔧 Filtros y Parámetros

### Parámetros Comunes

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `period` | string | Período de análisis | `"day"`, `"week"`, `"month"`, `"year"` |
| `dateFrom` | string | Fecha de inicio (ISO) | `"2024-01-01"` |
| `dateTo` | string | Fecha de fin (ISO) | `"2024-12-31"` |
| `groupBy` | string | Agrupación de datos | `"day"`, `"week"`, `"month"` |
| `limit` | number | Número máximo de resultados | `20` |

### Filtros Específicos

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `eventType` | string | Filtrar por tipo de evento | `"boda"` |
| `instrument` | string | Filtrar por instrumento | `"piano"` |
| `location` | string | Filtrar por ubicación | `"Madrid"` |
| `userRole` | string | Filtrar por rol de usuario | `"musico"` |
| `status` | string | Filtrar por estado | `"completed"` |

## 💡 Ejemplos de Uso

### 1. Métricas de Eventos

**Request:**
```bash
GET /analytics/events?period=month&dateFrom=2024-01-01&dateTo=2024-12-31&groupBy=week
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEvents": 150,
    "eventsByStatus": {
      "pending_musician": 45,
      "musician_assigned": 80,
      "completed": 20,
      "cancelled": 5
    },
    "eventsByType": {
      "boda": 60,
      "concierto": 30,
      "evento_corporativo": 40,
      "festival": 20
    },
    "revenue": {
      "total": 7500000,
      "average": 50000,
      "byMonth": [
        {
          "month": "2024-01",
          "count": 25,
          "revenue": 1250000
        },
        {
          "month": "2024-02",
          "count": 30,
          "revenue": 1500000
        }
      ]
    },
    "performance": {
      "acceptanceRate": 0.85,
      "averageAssignmentTime": 2.5,
      "completionRate": 0.92
    }
  }
}
```

### 2. Dashboard Administrativo

**Request:**
```bash
GET /analytics/dashboard
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1250,
      "totalEvents": 450,
      "totalRequests": 320,
      "activeConversations": 89,
      "totalRevenue": 22500000
    },
    "trends": {
      "userGrowth": 15.5,
      "eventGrowth": 8.2,
      "requestGrowth": 12.1,
      "revenueGrowth": 18.7
    },
    "topPerformers": {
      "musicians": [
        {
          "id": "user_123",
          "name": "Carlos Rodríguez",
          "instrument": "piano",
          "eventsCompleted": 25,
          "rating": 4.8,
          "revenue": 1250000
        }
      ],
      "locations": [
        {
          "location": "Madrid",
          "events": 120,
          "revenue": 6000000,
          "growth": 12.5
        }
      ],
      "eventTypes": [
        {
          "type": "boda",
          "count": 180,
          "revenue": 9000000,
          "popularity": 0.4
        }
      ]
    },
    "recentActivity": {
      "newUsers": 15,
      "newEvents": 8,
      "newRequests": 12,
      "completedEvents": 5
    }
  }
}
```

### 3. Reporte de Tendencias

**Request:**
```bash
GET /analytics/trends?period=month&dateFrom=2024-01-01&dateTo=2024-12-31
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "eventTrends": [
      {
        "month": "2024-01",
        "count": 25,
        "revenue": 1250000,
        "growth": 0
      },
      {
        "month": "2024-02",
        "count": 30,
        "revenue": 1500000,
        "growth": 20.0
      }
    ],
    "requestTrends": [
      {
        "month": "2024-01",
        "count": 20,
        "acceptanceRate": 0.85,
        "growth": 0
      },
      {
        "month": "2024-02",
        "count": 25,
        "acceptanceRate": 0.88,
        "growth": 25.0
      }
    ],
    "userTrends": [
      {
        "month": "2024-01",
        "newUsers": 45,
        "activeUsers": 180,
        "growth": 0
      },
      {
        "month": "2024-02",
        "newUsers": 52,
        "activeUsers": 195,
        "growth": 15.6
      }
    ]
  }
}
```

### 4. Rendimiento por Ubicación

**Request:**
```bash
GET /analytics/location-performance?period=month&dateFrom=2024-01-01&dateTo=2024-12-31
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "location": "Madrid",
        "events": 120,
        "requests": 85,
        "users": 320,
        "revenue": 6000000,
        "acceptanceRate": 0.88,
        "growth": 12.5
      },
      {
        "location": "Barcelona",
        "events": 95,
        "requests": 65,
        "users": 280,
        "revenue": 4750000,
        "acceptanceRate": 0.85,
        "growth": 8.2
      }
    ],
    "topPerformingCities": [
      {
        "city": "Madrid",
        "performance": 0.95,
        "revenue": 6000000
      }
    ],
    "growthOpportunities": [
      {
        "city": "Valencia",
        "potential": 0.75,
        "currentEvents": 25,
        "estimatedGrowth": 40
      }
    ]
  }
}
```

### 5. Usuarios Más Activos

**Request:**
```bash
GET /analytics/top-users?period=month&limit=10&role=musico
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "topMusicians": [
      {
        "id": "user_123",
        "name": "Carlos Rodríguez",
        "instrument": "piano",
        "eventsCompleted": 25,
        "totalRevenue": 1250000,
        "rating": 4.8,
        "acceptanceRate": 0.95,
        "specialties": ["jazz", "clasico"]
      }
    ],
    "topOrganizers": [
      {
        "id": "user_456",
        "name": "María García",
        "eventsCreated": 15,
        "totalSpent": 750000,
        "averageRating": 4.6,
        "preferredTypes": ["boda", "evento_corporativo"]
      }
    ],
    "metrics": {
      "totalActiveMusicians": 180,
      "totalActiveOrganizers": 95,
      "averageEventsPerMusician": 8.5,
      "averageSpendingPerOrganizer": 45000
    }
  }
}
```

### 6. Exportar Reporte

**Request:**
```bash
GET /analytics/export?type=events&format=csv&dateFrom=2024-01-01&dateTo=2024-12-31
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://api.mussikon.com/exports/events_2024.csv",
    "expiresAt": "2024-01-16T10:30:00Z",
    "recordCount": 150,
    "fileSize": "2.5MB",
    "format": "csv"
  }
}
```

## 📊 Respuestas

### Estructura de Respuesta Estándar

```json
{
  "success": boolean,
  "data": {
    "metrics": object,
    "trends": array,
    "breakdown": object,
    "summary": object
  }
}
```

### Códigos de Estado

| Código | Descripción |
|--------|-------------|
| `200` | Analytics generados exitosamente |
| `400` | Parámetros inválidos |
| `401` | No autenticado |
| `403` | No autorizado (solo admins) |
| `500` | Error interno |

## 🎛️ Dashboard

### Componentes del Dashboard

1. **Métricas Principales**
   - Total de usuarios, eventos, solicitudes
   - Ingresos totales y crecimiento
   - Actividad reciente

2. **Gráficos de Tendencias**
   - Crecimiento de usuarios
   - Eventos por período
   - Ingresos por mes

3. **Top Performers**
   - Músicos más activos
   - Ubicaciones con mejor rendimiento
   - Tipos de eventos más populares

4. **Alertas y Notificaciones**
   - Eventos pendientes de asignación
   - Usuarios inactivos
   - Anomalías en métricas

### Configuración del Dashboard

```javascript
const dashboardConfig = {
  refreshInterval: 30000, // 30 segundos
  charts: {
    userGrowth: { type: 'line', period: 'month' },
    eventTrends: { type: 'bar', period: 'week' },
    revenue: { type: 'area', period: 'month' }
  },
  alerts: {
    pendingEvents: { threshold: 10, type: 'warning' },
    lowAcceptanceRate: { threshold: 0.7, type: 'error' }
  }
};
```

## 📤 Exportación

### Formatos Soportados

- **CSV**: Para análisis en Excel/Google Sheets
- **JSON**: Para integración con otras APIs
- **PDF**: Para reportes ejecutivos

### Tipos de Reportes

1. **Reporte de Eventos**
   - Lista detallada de eventos
   - Métricas por período
   - Análisis de rendimiento

2. **Reporte de Usuarios**
   - Actividad de usuarios
   - Crecimiento por período
   - Segmentación por rol

3. **Reporte de Ingresos**
   - Ingresos totales
   - Desglose por tipo de evento
   - Tendencias de crecimiento

4. **Reporte de Ubicaciones**
   - Rendimiento por ciudad
   - Oportunidades de crecimiento
   - Análisis geográfico

## 🔗 Integración

### Cliente de Analytics

```javascript
class AnalyticsAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async getDashboard() {
    const response = await fetch(`${this.baseURL}/analytics/dashboard`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  }

  async getEventMetrics(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/analytics/events?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  }

  async getTrends(period = 'month', dateFrom, dateTo) {
    const params = new URLSearchParams({
      period,
      dateFrom,
      dateTo
    });
    
    const response = await fetch(`${this.baseURL}/analytics/trends?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  }

  async exportReport(type, format, filters = {}) {
    const params = new URLSearchParams({
      type,
      format,
      ...filters
    });
    
    const response = await fetch(`${this.baseURL}/analytics/export?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  }
}

// Uso
const analyticsAPI = new AnalyticsAPI('https://api.mussikon.com', token);

// Obtener dashboard
const dashboard = await analyticsAPI.getDashboard();

// Obtener métricas de eventos
const eventMetrics = await analyticsAPI.getEventMetrics({
  period: 'month',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});

// Obtener tendencias
const trends = await analyticsAPI.getTrends('month', '2024-01-01', '2024-12-31');

// Exportar reporte
const exportData = await analyticsAPI.exportReport('events', 'csv', {
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
```

### Visualización con Chart.js

```javascript
// Configurar gráficos del dashboard
const setupDashboardCharts = async () => {
  const dashboard = await analyticsAPI.getDashboard();
  
  // Gráfico de crecimiento de usuarios
  const userGrowthCtx = document.getElementById('userGrowthChart').getContext('2d');
  new Chart(userGrowthCtx, {
    type: 'line',
    data: {
      labels: dashboard.data.trends.map(t => t.month),
      datasets: [{
        label: 'Crecimiento de Usuarios',
        data: dashboard.data.trends.map(t => t.userGrowth),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  
  // Gráfico de ingresos
  const revenueCtx = document.getElementById('revenueChart').getContext('2d');
  new Chart(revenueCtx, {
    type: 'bar',
    data: {
      labels: dashboard.data.trends.map(t => t.month),
      datasets: [{
        label: 'Ingresos (€)',
        data: dashboard.data.trends.map(t => t.revenue),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};
```

### Actualización en Tiempo Real

```javascript
// Actualizar dashboard cada 30 segundos
const updateDashboard = async () => {
  try {
    const dashboard = await analyticsAPI.getDashboard();
    
    // Actualizar métricas principales
    document.getElementById('totalUsers').textContent = dashboard.data.overview.totalUsers;
    document.getElementById('totalEvents').textContent = dashboard.data.overview.totalEvents;
    document.getElementById('totalRevenue').textContent = `€${dashboard.data.overview.totalRevenue.toLocaleString()}`;
    
    // Actualizar gráficos
    updateCharts(dashboard.data);
    
  } catch (error) {
    console.error('Error actualizando dashboard:', error);
  }
};

// Configurar actualización automática
setInterval(updateDashboard, 30000);

// Actualizar inmediatamente al cargar
updateDashboard();
```

---

**Documentación actualizada al**: $(date)

**Versión**: 1.0.0 - API de analytics y reportes implementada ✅ 