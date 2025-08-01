# 💰 Fase 3: Sistema de Cálculo de Tarifas

## 📋 Resumen de la Fase

Esta fase implementa un sistema completo de cálculo automático de tarifas para músicos, basado en múltiples factores como experiencia, tipo de evento, distancia, demanda del mercado, y otros criterios dinámicos.

## 🎯 Objetivos

- ✅ Base de datos de tarifas y multiplicadores
- ✅ Algoritmo de cálculo automático de tarifas
- ✅ Análisis de mercado y demanda
- ✅ Desglose detallado de precios
- ✅ Rangos de precios sugeridos
- ✅ Endpoints para cálculo y gestión de tarifas

## 🗄️ Base de Datos

### **📊 Colección: `musicianRates`**

```typescript
interface MusicianRates {
  musicianId: string;
  
  baseHourlyRate: number;
  instrument: string;
  experienceYears: number;
  rating: number;
  
  multipliers: {
    eventType: EventTypeMultipliers;
    duration: DurationMultipliers;
    distance: DistanceMultipliers;
    demand: DemandMultipliers;
    experience: number;
    rating: number;
    urgency: UrgencyMultipliers;
    seasonality: SeasonalityMultipliers;
  };
  
  customRates: {
    specializations: { [specialization: string]: number };
    equipment: { [equipment: string]: number };
    travelExpenses: boolean;
    accommodationRequired: boolean;
    setupTimeIncluded: boolean;
  };
  
  marketData: {
    averageRateInArea: number;
    competitorRates: number[];
    demandLevel: 'low' | 'medium' | 'high';
    lastUpdated: Timestamp;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface EventTypeMultipliers {
  boda: number;
  concierto: number;
  corporativo: number;
  festival: number;
  fiesta_privada: number;
  graduacion: number;
  cumpleanos: number;
  culto: number;
  otro: number;
}

interface DurationMultipliers {
  short: { maxHours: number; multiplier: number }; // < 1 hora
  standard: { maxHours: number; multiplier: number }; // 1-4 horas
  long: { maxHours: number; multiplier: number }; // 4-8 horas
  extended: { maxHours: number; multiplier: number }; // > 8 horas
}

interface DistanceMultipliers {
  local: { maxKm: number; multiplier: number }; // 0-5 km
  regional: { maxKm: number; multiplier: number }; // 5-30 km
  national: { maxKm: number; multiplier: number }; // 30-100 km
  international: { maxKm: number; multiplier: number }; // > 100 km
}

interface DemandMultipliers {
  low: number;
  medium: number;
  high: number;
  peak: number;
}

interface UrgencyMultipliers {
  normal: { minDays: number; multiplier: number };
  urgent: { minDays: number; multiplier: number };
  emergency: { minDays: number; multiplier: number };
}

interface SeasonalityMultipliers {
  peak: { months: number[]; multiplier: number };
  high: { months: number[]; multiplier: number };
  medium: { months: number[]; multiplier: number };
  low: { months: number[]; multiplier: number };
}
```

### **📊 Colección: `marketRates`**

```typescript
interface MarketRates {
  location: string;
  instrument: string;
  season: string;
  
  // Datos de mercado
  averageRate: number;
  medianRate: number;
  minRate: number;
  maxRate: number;
  standardDeviation: number;
  
  // Factores de demanda
  demandLevel: 'low' | 'medium' | 'high';
  supplyLevel: 'low' | 'medium' | 'high';
  competitionLevel: 'low' | 'medium' | 'high';
  
  // Multiplicadores de mercado
  marketMultipliers: {
    season: number;
    location: number;
    demand: number;
    competition: number;
    eventType: { [eventType: string]: number };
  };
  
  // Estadísticas
  totalBookings: number;
  averageRating: number;
  successRate: number;
  cancellationRate: number;
  
  // Tendencias
  trendDirection: 'increasing' | 'stable' | 'decreasing';
  trendPercentage: number;
  
  updatedAt: Timestamp;
}
```

### **📊 Colección: `rateCalculations`**

```typescript
interface RateCalculation {
  id: string;
  musicianId: string;
  eventId: string;
  
  // Datos del evento
  eventDetails: {
    eventType: string;
    durationHours: number;
    distanceKm: number;
    eventDate: Timestamp;
    urgency: string;
    location: string;
  };
  
  // Cálculo
  calculation: {
    baseRate: number;
    totalRate: number;
    hourlyRate: number;
    totalForEvent: number;
    currency: string;
  };
  
  // Desglose detallado
  breakdown: RateBreakdown;
  
  // Rango de precios
  priceRange: PriceRange;
  
  // Metadatos
  calculatedAt: Timestamp;
  expiresAt: Timestamp;
  status: 'active' | 'expired' | 'accepted' | 'rejected';
}
```

## 🔧 Servicios

### **💰 RateCalculationService**

```typescript
class RateCalculationService {
  private db: FirebaseFirestore.Firestore;
  private marketService: MarketAnalysisService;
  
  constructor() {
    this.db = admin.firestore();
    this.marketService = new MarketAnalysisService();
  }
  
  // Calcular tarifa para un evento
  async calculateEventRate(
    musicianId: string, 
    eventDetails: EventDetails
  ): Promise<RateCalculation> {
    try {
      // 1. Obtener datos del músico
      const musicianRates = await this.getMusicianRates(musicianId);
      if (!musicianRates) {
        throw new Error('Tarifas del músico no encontradas');
      }
      
      // 2. Calcular tarifa base
      const baseRate = this.calculateBaseRate(musicianRates);
      
      // 3. Calcular multiplicadores
      const multipliers = await this.calculateMultipliers(musicianRates, eventDetails);
      
      // 4. Calcular tarifa total
      const totalRate = this.calculateTotalRate(baseRate, multipliers);
      
      // 5. Generar desglose
      const breakdown = this.generateBreakdown(baseRate, multipliers, totalRate);
      
      // 6. Calcular rango de precios
      const priceRange = this.calculatePriceRange(totalRate);
      
      // 7. Crear cálculo
      const calculation: RateCalculation = {
        id: this.db.collection('rateCalculations').doc().id,
        musicianId,
        eventId: eventDetails.eventId,
        eventDetails: {
          eventType: eventDetails.eventType,
          durationHours: eventDetails.durationHours,
          distanceKm: eventDetails.distanceKm,
          eventDate: admin.firestore.Timestamp.fromDate(eventDetails.eventDate),
          urgency: eventDetails.urgency,
          location: eventDetails.location
        },
        calculation: {
          baseRate,
          totalRate,
          hourlyRate: totalRate / eventDetails.durationHours,
          totalForEvent: totalRate * eventDetails.durationHours,
          currency: 'USD'
        },
        breakdown,
        priceRange,
        calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        ),
        status: 'active'
      };
      
      // 8. Guardar cálculo
      await this.saveCalculation(calculation);
      
      return calculation;
    } catch (error) {
      console.error('Error calculando tarifa:', error);
      throw new Error('Error calculando tarifa del evento');
    }
  }
  
  // Calcular tarifa base
  private calculateBaseRate(musicianRates: MusicianRates): number {
    let baseRate = musicianRates.baseHourlyRate;
    
    // Ajustar por experiencia
    const experienceMultiplier = 1 + (musicianRates.experienceYears / 20) * 0.5;
    baseRate *= experienceMultiplier;
    
    // Ajustar por rating
    const ratingMultiplier = 1 + ((musicianRates.rating - 3) / 2) * 0.2;
    baseRate *= ratingMultiplier;
    
    return Math.round(baseRate * 100) / 100; // Redondear a 2 decimales
  }
  
  // Calcular multiplicadores
  private async calculateMultipliers(
    musicianRates: MusicianRates, 
    eventDetails: EventDetails
  ): Promise<Multipliers> {
    const multipliers: Multipliers = {
      eventType: 1,
      duration: 1,
      distance: 1,
      demand: 1,
      experience: musicianRates.multipliers.experience,
      rating: musicianRates.multipliers.rating,
      urgency: 1,
      seasonality: 1
    };
    
    // Multiplicador por tipo de evento
    multipliers.eventType = musicianRates.multipliers.eventType[eventDetails.eventType] || 1;
    
    // Multiplicador por duración
    multipliers.duration = this.calculateDurationMultiplier(
      musicianRates.multipliers.duration, 
      eventDetails.durationHours
    );
    
    // Multiplicador por distancia
    multipliers.distance = this.calculateDistanceMultiplier(
      musicianRates.multipliers.distance, 
      eventDetails.distanceKm
    );
    
    // Multiplicador por demanda del mercado
    multipliers.demand = await this.calculateDemandMultiplier(
      eventDetails.location, 
      eventDetails.eventType, 
      eventDetails.eventDate
    );
    
    // Multiplicador por urgencia
    multipliers.urgency = this.calculateUrgencyMultiplier(
      musicianRates.multipliers.urgency, 
      eventDetails.eventDate
    );
    
    // Multiplicador por estacionalidad
    multipliers.seasonality = this.calculateSeasonalityMultiplier(
      musicianRates.multipliers.seasonality, 
      eventDetails.eventDate
    );
    
    return multipliers;
  }
  
  // Calcular multiplicador por duración
  private calculateDurationMultiplier(
    durationMultipliers: DurationMultipliers, 
    durationHours: number
  ): number {
    if (durationHours <= durationMultipliers.short.maxHours) {
      return durationMultipliers.short.multiplier;
    } else if (durationHours <= durationMultipliers.standard.maxHours) {
      return durationMultipliers.standard.multiplier;
    } else if (durationHours <= durationMultipliers.long.maxHours) {
      return durationMultipliers.long.multiplier;
    } else {
      return durationMultipliers.extended.multiplier;
    }
  }
  
  // Calcular multiplicador por distancia
  private calculateDistanceMultiplier(
    distanceMultipliers: DistanceMultipliers, 
    distanceKm: number
  ): number {
    if (distanceKm <= distanceMultipliers.local.maxKm) {
      return distanceMultipliers.local.multiplier;
    } else if (distanceKm <= distanceMultipliers.regional.maxKm) {
      return distanceMultipliers.regional.multiplier;
    } else if (distanceKm <= distanceMultipliers.national.maxKm) {
      return distanceMultipliers.national.multiplier;
    } else {
      return distanceMultipliers.international.multiplier;
    }
  }
  
  // Calcular multiplicador por demanda
  private async calculateDemandMultiplier(
    location: string, 
    eventType: string, 
    eventDate: Date
  ): Promise<number> {
    try {
      const marketData = await this.marketService.getMarketData(location, eventType, eventDate);
      return marketData.demandMultiplier;
    } catch (error) {
      console.error('Error obteniendo datos de mercado:', error);
      return 1; // Multiplicador neutral si no hay datos
    }
  }
  
  // Calcular multiplicador por urgencia
  private calculateUrgencyMultiplier(
    urgencyMultipliers: UrgencyMultipliers, 
    eventDate: Date
  ): number {
    const daysUntilEvent = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent <= urgencyMultipliers.emergency.minDays) {
      return urgencyMultipliers.emergency.multiplier;
    } else if (daysUntilEvent <= urgencyMultipliers.urgent.minDays) {
      return urgencyMultipliers.urgent.multiplier;
    } else {
      return urgencyMultipliers.normal.multiplier;
    }
  }
  
  // Calcular multiplicador por estacionalidad
  private calculateSeasonalityMultiplier(
    seasonalityMultipliers: SeasonalityMultipliers, 
    eventDate: Date
  ): number {
    const month = eventDate.getMonth() + 1; // getMonth() retorna 0-11
    
    if (seasonalityMultipliers.peak.months.includes(month)) {
      return seasonalityMultipliers.peak.multiplier;
    } else if (seasonalityMultipliers.high.months.includes(month)) {
      return seasonalityMultipliers.high.multiplier;
    } else if (seasonalityMultipliers.medium.months.includes(month)) {
      return seasonalityMultipliers.medium.multiplier;
    } else {
      return seasonalityMultipliers.low.multiplier;
    }
  }
  
  // Calcular tarifa total
  private calculateTotalRate(baseRate: number, multipliers: Multipliers): number {
    return baseRate * 
      multipliers.eventType * 
      multipliers.duration * 
      multipliers.distance * 
      multipliers.demand * 
      multipliers.experience * 
      multipliers.rating * 
      multipliers.urgency * 
      multipliers.seasonality;
  }
  
  // Generar desglose detallado
  private generateBreakdown(
    baseRate: number, 
    multipliers: Multipliers, 
    totalRate: number
  ): RateBreakdown {
    let runningTotal = baseRate;
    
    return {
      baseRate,
      eventType: {
        multiplier: multipliers.eventType,
        amount: runningTotal * multipliers.eventType,
        description: 'Tipo de evento'
      },
      duration: {
        multiplier: multipliers.duration,
        amount: (runningTotal *= multipliers.eventType) * multipliers.duration,
        description: 'Duración del evento'
      },
      distance: {
        multiplier: multipliers.distance,
        amount: (runningTotal *= multipliers.duration) * multipliers.distance,
        description: 'Distancia de viaje'
      },
      demand: {
        multiplier: multipliers.demand,
        amount: (runningTotal *= multipliers.distance) * multipliers.demand,
        description: 'Demanda del mercado'
      },
      experience: {
        multiplier: multipliers.experience,
        amount: (runningTotal *= multipliers.demand) * multipliers.experience,
        description: 'Experiencia del músico'
      },
      rating: {
        multiplier: multipliers.rating,
        amount: (runningTotal *= multipliers.experience) * multipliers.rating,
        description: 'Calificación del músico'
      },
      urgency: {
        multiplier: multipliers.urgency,
        amount: (runningTotal *= multipliers.rating) * multipliers.urgency,
        description: 'Urgencia del evento'
      },
      seasonality: {
        multiplier: multipliers.seasonality,
        amount: totalRate,
        description: 'Estacionalidad'
      }
    };
  }
  
  // Calcular rango de precios
  private calculatePriceRange(totalRate: number): PriceRange {
    return {
      minimum: Math.round(totalRate * 0.9), // 10% de descuento
      recommended: Math.round(totalRate),
      maximum: Math.round(totalRate * 1.2), // 20% de recargo
      currency: 'USD'
    };
  }
  
  // Obtener tarifas del músico
  private async getMusicianRates(musicianId: string): Promise<MusicianRates | null> {
    try {
      const doc = await this.db
        .collection('musicianRates')
        .doc(musicianId)
        .get();
        
      return doc.exists ? doc.data() as MusicianRates : null;
    } catch (error) {
      console.error('Error obteniendo tarifas del músico:', error);
      throw new Error('Error obteniendo tarifas del músico');
    }
  }
  
  // Guardar cálculo
  private async saveCalculation(calculation: RateCalculation): Promise<void> {
    try {
      await this.db
        .collection('rateCalculations')
        .doc(calculation.id)
        .set(calculation);
    } catch (error) {
      console.error('Error guardando cálculo:', error);
      throw new Error('Error guardando cálculo de tarifa');
    }
  }
}
```

### **📈 MarketAnalysisService**

```typescript
class MarketAnalysisService {
  private db: FirebaseFirestore.Firestore;
  
  constructor() {
    this.db = admin.firestore();
  }
  
  // Obtener datos de mercado
  async getMarketData(
    location: string, 
    eventType: string, 
    eventDate: Date
  ): Promise<MarketData> {
    try {
      const season = this.getSeason(eventDate);
      
      // Buscar datos de mercado específicos
      const doc = await this.db
        .collection('marketRates')
        .where('location', '==', location)
        .where('instrument', '==', eventType)
        .where('season', '==', season)
        .limit(1)
        .get();
      
      if (!doc.empty) {
        const marketData = doc.docs[0].data() as MarketRates;
        return this.processMarketData(marketData);
      }
      
      // Si no hay datos específicos, usar datos generales
      return this.getGeneralMarketData(location, season);
    } catch (error) {
      console.error('Error obteniendo datos de mercado:', error);
      return this.getDefaultMarketData();
    }
  }
  
  // Procesar datos de mercado
  private processMarketData(marketData: MarketRates): MarketData {
    const demandMultiplier = this.calculateDemandMultiplier(marketData);
    const competitionMultiplier = this.calculateCompetitionMultiplier(marketData);
    
    return {
      demandMultiplier,
      competitionMultiplier,
      averageRate: marketData.averageRate,
      trendDirection: marketData.trendDirection,
      trendPercentage: marketData.trendPercentage
    };
  }
  
  // Calcular multiplicador de demanda
  private calculateDemandMultiplier(marketData: MarketRates): number {
    switch (marketData.demandLevel) {
      case 'low': return 0.8;
      case 'medium': return 1.0;
      case 'high': return 1.3;
      default: return 1.0;
    }
  }
  
  // Calcular multiplicador de competencia
  private calculateCompetitionMultiplier(marketData: MarketRates): number {
    switch (marketData.competitionLevel) {
      case 'low': return 1.2; // Menos competencia = precios más altos
      case 'medium': return 1.0;
      case 'high': return 0.9; // Más competencia = precios más bajos
      default: return 1.0;
    }
  }
  
  // Obtener estación del año
  private getSeason(eventDate: Date): string {
    const month = eventDate.getMonth() + 1;
    
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }
  
  // Obtener datos generales de mercado
  private async getGeneralMarketData(location: string, season: string): Promise<MarketData> {
    // Implementar lógica para obtener datos generales
    return this.getDefaultMarketData();
  }
  
  // Datos de mercado por defecto
  private getDefaultMarketData(): MarketData {
    return {
      demandMultiplier: 1.0,
      competitionMultiplier: 1.0,
      averageRate: 50,
      trendDirection: 'stable',
      trendPercentage: 0
    };
  }
}
```

## 🎯 Endpoints

### **💰 POST /api/rates/calculate**

```typescript
// Calcular tarifa para un evento
router.post('/calculate', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { musicianId, eventDetails } = req.body;
      
      const rateService = new RateCalculationService();
      const calculation = await rateService.calculateEventRate(musicianId, eventDetails);
      
      res.json({ 
        success: true, 
        data: calculation 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error calculando tarifa' 
      });
    }
  }
);
```

### **📊 GET /api/rates/musician/:musicianId**

```typescript
// Obtener tarifas del músico
router.get('/musician/:musicianId', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { musicianId } = req.params;
      
      const rateService = new RateCalculationService();
      const rates = await rateService.getMusicianRates(musicianId);
      
      if (!rates) {
        return res.status(404).json({ 
          success: false, 
          message: 'Tarifas no encontradas' 
        });
      }
      
      res.json({ 
        success: true, 
        data: rates 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo tarifas' 
      });
    }
  }
);
```

### **📈 POST /api/rates/update-base-rate**

```typescript
// Actualizar tarifa base del músico
router.post('/update-base-rate', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const musicianId = req.user?.id;
      const { baseHourlyRate } = req.body;
      
      const rateService = new RateCalculationService();
      await rateService.updateBaseRate(musicianId, baseHourlyRate);
      
      res.json({ 
        success: true, 
        message: 'Tarifa base actualizada correctamente' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error actualizando tarifa base' 
      });
    }
  }
);
```

### **📊 GET /api/rates/market-analysis**

```typescript
// Obtener análisis de mercado
router.get('/market-analysis', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { location, eventType, eventDate } = req.query;
      
      const marketService = new MarketAnalysisService();
      const marketData = await marketService.getMarketData(
        location as string, 
        eventType as string, 
        new Date(eventDate as string)
      );
      
      res.json({ 
        success: true, 
        data: marketData 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo análisis de mercado' 
      });
    }
  }
);
```

## 🧪 Testing

### **📋 Tests Unitarios**

```typescript
describe('RateCalculationService', () => {
  let rateService: RateCalculationService;
  
  beforeEach(() => {
    rateService = new RateCalculationService();
  });
  
  test('should calculate event rate correctly', async () => {
    const musicianId = 'test-musician-id';
    const eventDetails = {
      eventId: 'test-event-id',
      eventType: 'boda',
      durationHours: 3,
      distanceKm: 25,
      eventDate: new Date('2024-06-15'),
      urgency: 'normal',
      location: 'Santo Domingo'
    };
    
    const calculation = await rateService.calculateEventRate(musicianId, eventDetails);
    
    expect(calculation.calculation.baseRate).toBeGreaterThan(0);
    expect(calculation.calculation.totalRate).toBeGreaterThan(calculation.calculation.baseRate);
    expect(calculation.breakdown).toBeDefined();
    expect(calculation.priceRange).toBeDefined();
  });
  
  test('should apply event type multiplier correctly', () => {
    const eventTypeMultipliers = {
      boda: 1.8,
      concierto: 1.5,
      corporativo: 1.6
    };
    
    const bodaMultiplier = rateService.calculateEventTypeMultiplier(eventTypeMultipliers, 'boda');
    expect(bodaMultiplier).toBe(1.8);
  });
  
  test('should calculate price range correctly', () => {
    const totalRate = 100;
    const priceRange = rateService.calculatePriceRange(totalRate);
    
    expect(priceRange.minimum).toBe(90);
    expect(priceRange.recommended).toBe(100);
    expect(priceRange.maximum).toBe(120);
  });
});
```

## 📊 Monitoreo

### **📈 Métricas a Monitorear**

- **Cálculos realizados**: Número de cálculos por día
- **Tiempo de cálculo**: Tiempo promedio para calcular tarifa
- **Tarifas promedio**: Tarifas promedio por tipo de evento
- **Errores de cálculo**: Errores en el proceso de cálculo

### **🔍 Logs**

```typescript
// Logs de cálculo de tarifas
logger.info('Tarifa calculada', {
  musicianId,
  eventId,
  baseRate,
  totalRate,
  calculationTime: Date.now() - startTime
});

// Logs de análisis de mercado
logger.info('Análisis de mercado realizado', {
  location,
  eventType,
  demandLevel,
  averageRate
});

// Logs de errores
logger.error('Error calculando tarifa', {
  musicianId,
  eventId,
  error: error.message,
  stack: error.stack
});
```

## 🚀 Deployment

### **📋 Configuración de Producción**

```typescript
// Variables de entorno
RATE_CALCULATION_CACHE_TTL=3600
MARKET_DATA_UPDATE_INTERVAL=24
DEFAULT_BASE_RATE=50
CURRENCY=USD
```

### **📋 Cron Jobs**

```typescript
// Actualizar datos de mercado diariamente
export const updateMarketData = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const marketService = new MarketAnalysisService();
    await marketService.updateMarketData();
  });
```

## 🎯 Criterios de Éxito

### **✅ Funcional**
- Cálculo de tarifas funciona correctamente
- Multiplicadores se aplican correctamente
- Desglose detallado es preciso
- Rangos de precios son razonables

### **📊 Performance**
- Tiempo de cálculo < 2 segundos
- Caché de cálculos implementado
- Escalabilidad con múltiples músicos
- Optimización de consultas a Firestore

### **🔒 Seguridad**
- Validación de datos de entrada
- Verificación de permisos por músico
- Logs de auditoría completos
- Protección contra manipulación de precios

---

**📅 Fecha de Creación**: $(date)
**👨‍💻 Autor**: Sistema de Documentación Automática
**📋 Versión**: 1.0.0
**🎯 Estado**: Listo para Implementación 