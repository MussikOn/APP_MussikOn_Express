# 🎵 Fase 1: Sistema de Estado de Músicos

## 📋 Resumen de la Fase

Esta fase implementa un sistema completo de gestión del estado de músicos en tiempo real, incluyendo disponibilidad, ubicación, y configuración de preferencias.

## 🎯 Objetivos

- ✅ Sistema de estado online/offline en tiempo real
- ✅ Verificación de disponibilidad automática
- ✅ Configuración de preferencias de trabajo
- ✅ Middleware de heartbeat para mantener estado activo
- ✅ Endpoints para gestión de estado

## 🗄️ Base de Datos

### **📊 Colección: `musicianStatus`**

```typescript
interface MusicianStatus {
  musicianId: string;
  isOnline: boolean;
  isAvailable: boolean;
  lastSeen: Timestamp;
  currentStatus: 'online' | 'offline' | 'busy' | 'away';
  
  availabilitySettings: {
    autoAcceptRequests: boolean;
    maxDistanceKm: number;
    minNoticeHours: number;
    workingHours: {
      start: string; // "09:00"
      end: string;   // "18:00"
      days: number[]; // [1,2,3,4,5,6,7] - Lunes=1, Domingo=7
    };
    preferredEventTypes: string[];
    blackoutDates: Timestamp[];
  };
  
  realTimeStatus: {
    latitude: number;
    longitude: number;
    batteryLevel: number;
    appVersion: string;
    lastLocationUpdate: Timestamp;
  };
  
  performance: {
    totalEvents: number;
    averageRating: number;
    responseTimeMinutes: number;
    acceptanceRate: number;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### **📊 Colección: `statusHistory`**

```typescript
interface StatusHistory {
  id: string;
  musicianId: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  timestamp: Timestamp;
  duration: number; // minutos
  reason?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}
```

## 🔧 Servicios

### **🎵 MusicianStatusService**

```typescript
class MusicianStatusService {
  private db: FirebaseFirestore.Firestore;
  
  constructor() {
    this.db = admin.firestore();
  }
  
  // Actualizar estado del músico
  async updateStatus(
    musicianId: string, 
    status: Partial<MusicianStatus>
  ): Promise<void> {
    try {
      const updateData = {
        ...status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await this.db
        .collection('musicianStatus')
        .doc(musicianId)
        .set(updateData, { merge: true });
        
      // Registrar en historial
      await this.logStatusChange(musicianId, status.currentStatus);
      
    } catch (error) {
      console.error('Error actualizando estado:', error);
      throw new Error('Error actualizando estado del músico');
    }
  }
  
  // Obtener estado actual
  async getStatus(musicianId: string): Promise<MusicianStatus | null> {
    try {
      const doc = await this.db
        .collection('musicianStatus')
        .doc(musicianId)
        .get();
        
      return doc.exists ? doc.data() as MusicianStatus : null;
    } catch (error) {
      console.error('Error obteniendo estado:', error);
      throw new Error('Error obteniendo estado del músico');
    }
  }
  
  // Verificar disponibilidad
  async checkAvailability(musicianId: string): Promise<boolean> {
    try {
      const status = await this.getStatus(musicianId);
      if (!status) return false;
      
      // Verificar estado básico
      if (!status.isOnline || !status.isAvailable) return false;
      
      // Verificar horario de trabajo
      if (!this.isWithinWorkingHours(status.availabilitySettings.workingHours)) {
        return false;
      }
      
      // Verificar fechas bloqueadas
      if (this.isBlackoutDate(status.availabilitySettings.blackoutDates)) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      return false;
    }
  }
  
  // Obtener músicos disponibles
  async getAvailableMusicians(filters?: AvailabilityFilters): Promise<MusicianStatus[]> {
    try {
      let query = this.db.collection('musicianStatus')
        .where('isOnline', '==', true)
        .where('isAvailable', '==', true);
      
      if (filters?.maxDistance) {
        // Implementar filtro por distancia
      }
      
      const snapshot = await query.get();
      const musicians = snapshot.docs.map(doc => doc.data() as MusicianStatus);
      
      // Filtrar por horario de trabajo
      return musicians.filter(musician => 
        this.isWithinWorkingHours(musician.availabilitySettings.workingHours)
      );
    } catch (error) {
      console.error('Error obteniendo músicos disponibles:', error);
      throw new Error('Error obteniendo músicos disponibles');
    }
  }
  
  // Registrar cambio de estado
  private async logStatusChange(
    musicianId: string, 
    status: string
  ): Promise<void> {
    try {
      await this.db.collection('statusHistory').add({
        musicianId,
        status,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error registrando cambio de estado:', error);
    }
  }
  
  // Verificar horario de trabajo
  private isWithinWorkingHours(workingHours: any): boolean {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
    
    // Verificar si es día laboral
    if (!workingHours.days.includes(currentDay)) return false;
    
    // Verificar si está dentro del horario
    return currentTime >= workingHours.start && currentTime <= workingHours.end;
  }
  
  // Verificar fecha bloqueada
  private isBlackoutDate(blackoutDates: Timestamp[]): boolean {
    const today = new Date();
    return blackoutDates.some(date => {
      const blackoutDate = date.toDate();
      return blackoutDate.toDateString() === today.toDateString();
    });
  }
}
```

### **⏰ HeartbeatService**

```typescript
class HeartbeatService {
  private db: FirebaseFirestore.Firestore;
  private statusService: MusicianStatusService;
  
  constructor() {
    this.db = admin.firestore();
    this.statusService = new MusicianStatusService();
  }
  
  // Procesar heartbeat del músico
  async processHeartbeat(
    musicianId: string, 
    heartbeatData: HeartbeatData
  ): Promise<void> {
    try {
      const updateData = {
        isOnline: true,
        lastSeen: admin.firestore.FieldValue.serverTimestamp(),
        realTimeStatus: {
          latitude: heartbeatData.latitude,
          longitude: heartbeatData.longitude,
          batteryLevel: heartbeatData.batteryLevel,
          appVersion: heartbeatData.appVersion,
          lastLocationUpdate: admin.firestore.FieldValue.serverTimestamp()
        }
      };
      
      await this.statusService.updateStatus(musicianId, updateData);
      
    } catch (error) {
      console.error('Error procesando heartbeat:', error);
      throw new Error('Error procesando heartbeat');
    }
  }
  
  // Marcar músico como offline después de timeout
  async markOfflineAfterTimeout(musicianId: string): Promise<void> {
    try {
      await this.statusService.updateStatus(musicianId, {
        isOnline: false,
        currentStatus: 'offline'
      });
    } catch (error) {
      console.error('Error marcando offline:', error);
    }
  }
  
  // Limpiar estados antiguos
  async cleanupOldStatuses(): Promise<void> {
    try {
      const timeoutMinutes = 10; // 10 minutos sin heartbeat = offline
      const timeoutDate = new Date(Date.now() - timeoutMinutes * 60 * 1000);
      
      const snapshot = await this.db
        .collection('musicianStatus')
        .where('lastSeen', '<', timeoutDate)
        .where('isOnline', '==', true)
        .get();
      
      const batch = this.db.batch();
      
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          isOnline: false,
          currentStatus: 'offline',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
      
    } catch (error) {
      console.error('Error limpiando estados:', error);
    }
  }
}
```

## 🔌 Middleware

### **💓 HeartbeatMiddleware**

```typescript
const heartbeatMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const musicianId = req.user?.id;
    if (!musicianId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    const heartbeatData: HeartbeatData = {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      batteryLevel: req.body.batteryLevel,
      appVersion: req.body.appVersion
    };
    
    const heartbeatService = new HeartbeatService();
    await heartbeatService.processHeartbeat(musicianId, heartbeatData);
    
    next();
  } catch (error) {
    console.error('Error en heartbeat middleware:', error);
    next(error);
  }
};
```

### **📊 StatusMiddleware**

```typescript
const statusMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const musicianId = req.user?.id;
    if (!musicianId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    // Actualizar último acceso
    const statusService = new MusicianStatusService();
    await statusService.updateStatus(musicianId, {
      lastSeen: admin.firestore.FieldValue.serverTimestamp()
    });
    
    next();
  } catch (error) {
    console.error('Error en status middleware:', error);
    next(error);
  }
};
```

## 🎯 Endpoints

### **📱 POST /api/musician/status/update**

```typescript
// Actualizar estado del músico
router.post('/status/update', 
  authMiddleware, 
  statusMiddleware,
  async (req: Request, res: Response) => {
    try {
      const musicianId = req.user?.id;
      const statusData = req.body;
      
      const statusService = new MusicianStatusService();
      await statusService.updateStatus(musicianId, statusData);
      
      res.json({ 
        success: true, 
        message: 'Estado actualizado correctamente' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error actualizando estado' 
      });
    }
  }
);
```

### **📊 GET /api/musician/status/:musicianId**

```typescript
// Obtener estado de un músico
router.get('/status/:musicianId', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { musicianId } = req.params;
      
      const statusService = new MusicianStatusService();
      const status = await statusService.getStatus(musicianId);
      
      if (!status) {
        return res.status(404).json({ 
          success: false, 
          message: 'Músico no encontrado' 
        });
      }
      
      res.json({ 
        success: true, 
        data: status 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo estado' 
      });
    }
  }
);
```

### **⚙️ POST /api/musician/availability/settings**

```typescript
// Actualizar configuración de disponibilidad
router.post('/availability/settings', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const musicianId = req.user?.id;
      const settings = req.body;
      
      const statusService = new MusicianStatusService();
      await statusService.updateStatus(musicianId, {
        availabilitySettings: settings
      });
      
      res.json({ 
        success: true, 
        message: 'Configuración actualizada correctamente' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error actualizando configuración' 
      });
    }
  }
);
```

### **📋 GET /api/musician/available**

```typescript
// Obtener músicos disponibles
router.get('/available', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const filters = req.query;
      
      const statusService = new MusicianStatusService();
      const musicians = await statusService.getAvailableMusicians(filters);
      
      res.json({ 
        success: true, 
        data: musicians,
        total: musicians.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo músicos disponibles' 
      });
    }
  }
);
```

### **💓 POST /api/musician/heartbeat**

```typescript
// Endpoint para heartbeat
router.post('/heartbeat', 
  authMiddleware, 
  heartbeatMiddleware,
  async (req: Request, res: Response) => {
    try {
      res.json({ 
        success: true, 
        message: 'Heartbeat procesado correctamente' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error procesando heartbeat' 
      });
    }
  }
);
```

## 🧪 Testing

### **📋 Tests Unitarios**

```typescript
describe('MusicianStatusService', () => {
  let statusService: MusicianStatusService;
  
  beforeEach(() => {
    statusService = new MusicianStatusService();
  });
  
  test('should update musician status correctly', async () => {
    const musicianId = 'test-musician-id';
    const statusData = {
      isOnline: true,
      currentStatus: 'online' as const
    };
    
    await statusService.updateStatus(musicianId, statusData);
    
    const status = await statusService.getStatus(musicianId);
    expect(status?.isOnline).toBe(true);
    expect(status?.currentStatus).toBe('online');
  });
  
  test('should check availability correctly', async () => {
    const musicianId = 'test-musician-id';
    
    // Configurar músico como disponible
    await statusService.updateStatus(musicianId, {
      isOnline: true,
      isAvailable: true,
      availabilitySettings: {
        workingHours: {
          start: '09:00',
          end: '18:00',
          days: [1, 2, 3, 4, 5, 6, 7]
        },
        blackoutDates: []
      }
    });
    
    const isAvailable = await statusService.checkAvailability(musicianId);
    expect(isAvailable).toBe(true);
  });
  
  test('should return false for unavailable musician', async () => {
    const musicianId = 'test-musician-id';
    
    await statusService.updateStatus(musicianId, {
      isOnline: false,
      isAvailable: false
    });
    
    const isAvailable = await statusService.checkAvailability(musicianId);
    expect(isAvailable).toBe(false);
  });
});
```

### **📋 Tests de Integración**

```typescript
describe('Musician Status API', () => {
  test('should update status via API', async () => {
    const response = await request(app)
      .post('/api/musician/status/update')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        isOnline: true,
        currentStatus: 'online'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
  
  test('should get musician status', async () => {
    const response = await request(app)
      .get('/api/musician/status/test-musician-id')
      .set('Authorization', `Bearer ${testToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });
});
```

## 📊 Monitoreo

### **📈 Métricas a Monitorear**

- **Músicos online**: Número de músicos conectados
- **Tiempo de respuesta**: Tiempo para actualizar estado
- **Tasa de heartbeat**: Porcentaje de heartbeats exitosos
- **Errores de estado**: Errores al actualizar estado

### **🔍 Logs**

```typescript
// Logs de estado
logger.info('Estado actualizado', {
  musicianId,
  status: statusData.currentStatus,
  timestamp: new Date()
});

// Logs de heartbeat
logger.info('Heartbeat procesado', {
  musicianId,
  batteryLevel: heartbeatData.batteryLevel,
  location: `${heartbeatData.latitude}, ${heartbeatData.longitude}`
});

// Logs de errores
logger.error('Error actualizando estado', {
  musicianId,
  error: error.message,
  stack: error.stack
});
```

## 🚀 Deployment

### **📋 Configuración de Producción**

```typescript
// Variables de entorno
MUSICIAN_STATUS_TIMEOUT_MINUTES=10
HEARTBEAT_INTERVAL_SECONDS=300
STATUS_CLEANUP_INTERVAL_MINUTES=15
```

### **📋 Cron Jobs**

```typescript
// Limpiar estados antiguos cada 15 minutos
export const cleanupOldStatuses = functions.pubsub
  .schedule('every 15 minutes')
  .onRun(async (context) => {
    const heartbeatService = new HeartbeatService();
    await heartbeatService.cleanupOldStatuses();
  });
```

## 🎯 Criterios de Éxito

### **✅ Funcional**
- Sistema de estado funciona correctamente
- Heartbeat mantiene estado actualizado
- Endpoints responden correctamente
- Tests pasan al 100%

### **📊 Performance**
- Tiempo de respuesta < 500ms
- Uptime > 99.5%
- Sin memory leaks
- Escalabilidad probada

### **🔒 Seguridad**
- Autenticación requerida
- Validación de datos
- Rate limiting implementado
- Logs de auditoría

---

**📅 Fecha de Creación**: $(date)
**👨‍💻 Autor**: Sistema de Documentación Automática
**📋 Versión**: 1.0.0
**🎯 Estado**: Listo para Implementación 