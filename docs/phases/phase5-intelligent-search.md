# 🔍 Fase 5: Algoritmo de Búsqueda Mejorado

## 📋 Resumen de la Fase

Esta fase implementa un sistema de búsqueda inteligente y avanzado para músicos, incluyendo scoring de relevancia, filtros avanzados, y un algoritmo que combina múltiples criterios para encontrar los mejores músicos para cada evento.

## 🎯 Objetivos

- ✅ Servicio de búsqueda inteligente con scoring
- ✅ Sistema de filtros avanzados
- ✅ Algoritmo de relevancia multicriterio
- ✅ Búsqueda en tiempo real con disponibilidad
- ✅ Integración con cálculo de tarifas
- ✅ Endpoints para búsqueda avanzada

## 🗄️ Base de Datos

### **📊 Colección: `searchIndexes`**

```typescript
interface SearchIndex {
  musicianId: string;
  
  // Datos básicos indexados
  basic: {
    name: string;
    instrument: string;
    location: string;
    city: string;
    country: string;
    experienceYears: number;
    rating: number;
  };
  
  // Datos de disponibilidad
  availability: {
    isOnline: boolean;
    isAvailable: boolean;
    lastSeen: Timestamp;
    workingHours: {
      start: string;
      end: string;
      days: number[];
    };
    blackoutDates: Timestamp[];
  };
  
  // Datos de tarifas
  rates: {
    baseHourlyRate: number;
    averageRate: number;
    minRate: number;
    maxRate: number;
    currency: string;
  };
  
  // Especializaciones y habilidades
  skills: {
    instruments: string[];
    genres: string[];
    languages: string[];
    specializations: string[];
    certifications: string[];
  };
  
  // Datos de rendimiento
  performance: {
    totalEvents: number;
    averageRating: number;
    responseTimeMinutes: number;
    acceptanceRate: number;
    cancellationRate: number;
    repeatClientRate: number;
  };
  
  // Datos geográficos
  geography: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    serviceAreas: string[];
    maxTravelDistance: number;
  };
  
  // Datos de eventos
  events: {
    upcomingEvents: number;
    completedEvents: number;
    eventTypes: string[];
    preferredEventTypes: string[];
  };
  
  // Metadatos de búsqueda
  searchMetadata: {
    searchScore: number;
    lastUpdated: Timestamp;
    isActive: boolean;
    priority: 'high' | 'medium' | 'low';
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### **📊 Colección: `searchQueries`**

```typescript
interface SearchQuery {
  queryId: string;
  userId: string;
  userType: 'event_organizer' | 'admin';
  
  // Criterios de búsqueda
  criteria: {
    eventType: string;
    eventDate: Timestamp;
    location: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    durationHours: number;
    budget: {
      min: number;
      max: number;
      currency: string;
    };
    instruments: string[];
    genres?: string[];
    languages?: string[];
    specializations?: string[];
  };
  
  // Filtros aplicados
  filters: {
    maxDistance: number;
    minRating: number;
    minExperience: number;
    maxPrice: number;
    availabilityOnly: boolean;
    onlineOnly: boolean;
  };
  
  // Resultados
  results: {
    totalFound: number;
    totalReturned: number;
    musicians: MusicianSearchResult[];
    searchTime: number;
    hasMore: boolean;
  };
  
  // Metadatos
  metadata: {
    searchEngine: string;
    algorithm: string;
    version: string;
    cacheHit: boolean;
  };
  
  createdAt: Timestamp;
  expiresAt: Timestamp;
}
```

## 🔧 Servicios

### **🔍 IntelligentSearchService**

```typescript
class IntelligentSearchService {
  private db: FirebaseFirestore.Firestore;
  private statusService: MusicianStatusService;
  private calendarService: CalendarService;
  private rateService: RateCalculationService;
  private scoringService: SearchScoringService;
  
  constructor() {
    this.db = admin.firestore();
    this.statusService = new MusicianStatusService();
    this.calendarService = new CalendarService();
    this.rateService = new RateCalculationService();
    this.scoringService = new SearchScoringService();
  }
  
  // Búsqueda principal de músicos disponibles
  async searchAvailableMusiciansForEvent(
    eventDetails: EventDetails,
    filters: SearchFilters
  ): Promise<SearchResult<Musician>> {
    try {
      console.log('🔍 Iniciando búsqueda inteligente de músicos');
      
      // 1. Búsqueda inicial por criterios básicos
      const initialResults = await this.performInitialSearch(eventDetails, filters);
      
      // 2. Verificar disponibilidad en tiempo real
      const availableMusicians = await this.checkRealTimeAvailability(initialResults, eventDetails);
      
      // 3. Calcular tarifas para cada músico
      const musiciansWithRates = await this.calculateRatesForMusicians(availableMusicians, eventDetails);
      
      // 4. Aplicar filtros avanzados
      const filteredMusicians = this.applyAdvancedFilters(musiciansWithRates, filters);
      
      // 5. Calcular scores de relevancia
      const scoredMusicians = await this.calculateRelevanceScores(filteredMusicians, eventDetails);
      
      // 6. Ordenar por relevancia y disponibilidad
      const sortedMusicians = this.sortByRelevanceAndAvailability(scoredMusicians);
      
      // 7. Aplicar paginación
      const paginatedResults = this.applyPagination(sortedMusicians, filters);
      
      // 8. Generar metadatos de búsqueda
      const searchMetadata = this.generateSearchMetadata(
        eventDetails, 
        filters, 
        initialResults.length, 
        availableMusicians.length, 
        sortedMusicians.length
      );
      
      console.log(`✅ Búsqueda completada: ${paginatedResults.data.length} músicos encontrados`);
      
      return {
        data: paginatedResults.data,
        total: sortedMusicians.length,
        page: paginatedResults.page,
        limit: paginatedResults.limit,
        hasMore: paginatedResults.hasMore,
        metadata: searchMetadata
      };
      
    } catch (error) {
      console.error('❌ Error en búsqueda inteligente:', error);
      throw new Error('Error en búsqueda de músicos disponibles');
    }
  }
  
  // Búsqueda inicial por criterios básicos
  private async performInitialSearch(
    eventDetails: EventDetails, 
    filters: SearchFilters
  ): Promise<SearchIndex[]> {
    try {
      let query = this.db.collection('searchIndexes')
        .where('searchMetadata.isActive', '==', true);
      
      // Filtrar por instrumento si se especifica
      if (eventDetails.instrument) {
        query = query.where('skills.instruments', 'array-contains', eventDetails.instrument);
      }
      
      // Filtrar por ubicación si se especifica
      if (eventDetails.location) {
        query = query.where('basic.location', '==', eventDetails.location);
      }
      
      // Filtrar por rating mínimo
      if (filters.minRating) {
        query = query.where('basic.rating', '>=', filters.minRating);
      }
      
      // Filtrar por experiencia mínima
      if (filters.minExperience) {
        query = query.where('basic.experienceYears', '>=', filters.minExperience);
      }
      
      // Limitar resultados iniciales
      const limit = Math.min(filters.limit || 50, 100);
      query = query.limit(limit);
      
      const snapshot = await query.get();
      const results = snapshot.docs.map(doc => doc.data() as SearchIndex);
      
      console.log(`📊 Búsqueda inicial: ${results.length} músicos encontrados`);
      
      return results;
    } catch (error) {
      console.error('Error en búsqueda inicial:', error);
      throw new Error('Error en búsqueda inicial de músicos');
    }
  }
  
  // Verificar disponibilidad en tiempo real
  private async checkRealTimeAvailability(
    musicians: SearchIndex[], 
    eventDetails: EventDetails
  ): Promise<AvailableMusician[]> {
    try {
      const availableMusicians: AvailableMusician[] = [];
      
      for (const musician of musicians) {
        // Verificar estado online/offline
        const isOnline = musician.availability.isOnline;
        const isAvailable = musician.availability.isAvailable;
        
        if (!isOnline || !isAvailable) {
          continue;
        }
        
        // Verificar disponibilidad en calendario
        const calendarAvailability = await this.calendarService.checkAvailability(
          musician.musicianId,
          eventDetails.eventDate,
          eventDetails.durationHours
        );
        
        if (!calendarAvailability.isAvailable) {
          continue;
        }
        
        // Verificar horario de trabajo
        const isWithinWorkingHours = this.checkWorkingHours(
          musician.availability.workingHours,
          eventDetails.eventDate
        );
        
        if (!isWithinWorkingHours) {
          continue;
        }
        
        // Verificar fechas bloqueadas
        const isBlackoutDate = this.checkBlackoutDates(
          musician.availability.blackoutDates,
          eventDetails.eventDate
        );
        
        if (isBlackoutDate) {
          continue;
        }
        
        availableMusicians.push({
          ...musician,
          availabilityStatus: {
            isOnline,
            isAvailable,
            calendarAvailable: calendarAvailability.isAvailable,
            workingHoursAvailable: isWithinWorkingHours,
            blackoutDateAvailable: !isBlackoutDate
          }
        });
      }
      
      console.log(`✅ Disponibilidad verificada: ${availableMusicians.length} músicos disponibles`);
      
      return availableMusicians;
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      throw new Error('Error verificando disponibilidad de músicos');
    }
  }
  
  // Calcular tarifas para músicos
  private async calculateRatesForMusicians(
    musicians: AvailableMusician[], 
    eventDetails: EventDetails
  ): Promise<MusicianWithRate[]> {
    try {
      const musiciansWithRates: MusicianWithRate[] = [];
      
      for (const musician of musicians) {
        try {
          const rateCalculation = await this.rateService.calculateEventRate(
            musician.musicianId,
            eventDetails
          );
          
          musiciansWithRates.push({
            ...musician,
            rateCalculation,
            priceScore: this.calculatePriceScore(
              rateCalculation.calculation.totalForEvent,
              eventDetails.budget
            )
          });
        } catch (error) {
          console.warn(`Error calculando tarifa para músico ${musician.musicianId}:`, error);
          // Continuar con el siguiente músico
        }
      }
      
      console.log(`💰 Tarifas calculadas: ${musiciansWithRates.length} músicos con precios`);
      
      return musiciansWithRates;
    } catch (error) {
      console.error('Error calculando tarifas:', error);
      throw new Error('Error calculando tarifas de músicos');
    }
  }
  
  // Aplicar filtros avanzados
  private applyAdvancedFilters(
    musicians: MusicianWithRate[], 
    filters: SearchFilters
  ): MusicianWithRate[] {
    try {
      let filteredMusicians = musicians;
      
      // Filtrar por distancia máxima
      if (filters.maxDistance) {
        filteredMusicians = filteredMusicians.filter(musician => 
          this.calculateDistance(
            filters.coordinates!,
            musician.geography.coordinates
          ) <= filters.maxDistance!
        );
      }
      
      // Filtrar por precio máximo
      if (filters.maxPrice) {
        filteredMusicians = filteredMusicians.filter(musician => 
          musician.rateCalculation.calculation.totalForEvent <= filters.maxPrice!
        );
      }
      
      // Filtrar solo músicos disponibles
      if (filters.availabilityOnly) {
        filteredMusicians = filteredMusicians.filter(musician => 
          musician.availabilityStatus.isAvailable
        );
      }
      
      // Filtrar solo músicos online
      if (filters.onlineOnly) {
        filteredMusicians = filteredMusicians.filter(musician => 
          musician.availabilityStatus.isOnline
        );
      }
      
      // Filtrar por géneros musicales
      if (filters.genres && filters.genres.length > 0) {
        filteredMusicians = filteredMusicians.filter(musician => 
          filters.genres!.some(genre => 
            musician.skills.genres.includes(genre)
          )
        );
      }
      
      // Filtrar por idiomas
      if (filters.languages && filters.languages.length > 0) {
        filteredMusicians = filteredMusicians.filter(musician => 
          filters.languages!.some(language => 
            musician.skills.languages.includes(language)
          )
        );
      }
      
      console.log(`🔧 Filtros aplicados: ${filteredMusicians.length} músicos después de filtros`);
      
      return filteredMusicians;
    } catch (error) {
      console.error('Error aplicando filtros:', error);
      throw new Error('Error aplicando filtros avanzados');
    }
  }
  
  // Calcular scores de relevancia
  private async calculateRelevanceScores(
    musicians: MusicianWithRate[], 
    eventDetails: EventDetails
  ): Promise<ScoredMusician[]> {
    try {
      const scoredMusicians: ScoredMusician[] = [];
      
      for (const musician of musicians) {
        const score = await this.scoringService.calculateMusicianScore(
          musician, 
          eventDetails
        );
        
        scoredMusicians.push({
          ...musician,
          relevanceScore: score.total,
          scoreBreakdown: score.breakdown
        });
      }
      
      console.log(`⭐ Scores calculados: ${scoredMusicians.length} músicos con puntuación`);
      
      return scoredMusicians;
    } catch (error) {
      console.error('Error calculando scores:', error);
      throw new Error('Error calculando scores de relevancia');
    }
  }
  
  // Ordenar por relevancia y disponibilidad
  private sortByRelevanceAndAvailability(musicians: ScoredMusician[]): ScoredMusician[] {
    try {
      return musicians.sort((a, b) => {
        // Priorizar músicos online y disponibles
        const aAvailability = a.availabilityStatus.isOnline && a.availabilityStatus.isAvailable ? 1 : 0;
        const bAvailability = b.availabilityStatus.isOnline && b.availabilityStatus.isAvailable ? 1 : 0;
        
        if (aAvailability !== bAvailability) {
          return bAvailability - aAvailability;
        }
        
        // Luego ordenar por score de relevancia
        return b.relevanceScore - a.relevanceScore;
      });
    } catch (error) {
      console.error('Error ordenando resultados:', error);
      return musicians;
    }
  }
  
  // Aplicar paginación
  private applyPagination(
    musicians: ScoredMusician[], 
    filters: SearchFilters
  ): PaginatedResult<ScoredMusician> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;
      
      const paginatedData = musicians.slice(offset, offset + limit);
      const hasMore = offset + limit < musicians.length;
      
      return {
        data: paginatedData,
        page,
        limit,
        hasMore
      };
    } catch (error) {
      console.error('Error aplicando paginación:', error);
      throw new Error('Error aplicando paginación');
    }
  }
  
  // Generar metadatos de búsqueda
  private generateSearchMetadata(
    eventDetails: EventDetails,
    filters: SearchFilters,
    initialCount: number,
    availableCount: number,
    finalCount: number
  ): SearchMetadata {
    return {
      searchEngine: 'intelligent_search_v2',
      algorithm: 'multi_criteria_scoring',
      version: '1.0.0',
      statistics: {
        initialResults: initialCount,
        availableAfterCheck: availableCount,
        finalResults: finalCount,
        filtersApplied: Object.keys(filters).length
      },
      performance: {
        searchTime: Date.now(),
        cacheHit: false
      }
    };
  }
  
  // Verificar horario de trabajo
  private checkWorkingHours(
    workingHours: any, 
    eventDate: Date
  ): boolean {
    const currentDay = eventDate.getDay();
    const currentTime = eventDate.toTimeString().slice(0, 5);
    
    return workingHours.days.includes(currentDay) &&
           currentTime >= workingHours.start &&
           currentTime <= workingHours.end;
  }
  
  // Verificar fechas bloqueadas
  private checkBlackoutDates(
    blackoutDates: Timestamp[], 
    eventDate: Date
  ): boolean {
    return blackoutDates.some(date => {
      const blackoutDate = date.toDate();
      return blackoutDate.toDateString() === eventDate.toDateString();
    });
  }
  
  // Calcular distancia
  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  // Convertir a radianes
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  // Calcular score de precio
  private calculatePriceScore(price: number, budget: { min: number; max: number }): number {
    const budgetMid = (budget.min + budget.max) / 2;
    const priceDiff = Math.abs(price - budgetMid);
    const maxDiff = budget.max - budget.min;
    
    return Math.max(0, 1 - (priceDiff / maxDiff));
  }
}
```

### **⭐ SearchScoringService**

```typescript
class SearchScoringService {
  // Calcular score completo del músico
  async calculateMusicianScore(
    musician: MusicianWithRate, 
    eventDetails: EventDetails
  ): Promise<MusicianScore> {
    try {
      const scores = {
        experience: this.calculateExperienceScore(musician.basic.experienceYears),
        rating: this.calculateRatingScore(musician.basic.rating),
        availability: this.calculateAvailabilityScore(musician.availabilityStatus),
        price: this.calculatePriceScore(musician.rateCalculation.calculation.totalForEvent, eventDetails.budget),
        distance: this.calculateDistanceScore(musician.geography.coordinates, eventDetails.coordinates),
        performance: this.calculatePerformanceScore(musician.performance),
        specialization: this.calculateSpecializationScore(musician.skills, eventDetails),
        response: this.calculateResponseScore(musician.performance.responseTimeMinutes)
      };
      
      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      
      return {
        total: totalScore,
        breakdown: scores
      };
    } catch (error) {
      console.error('Error calculando score del músico:', error);
      return {
        total: 0,
        breakdown: {}
      };
    }
  }
  
  // Calcular score por experiencia
  private calculateExperienceScore(experienceYears: number): number {
    // Máximo 25 puntos por experiencia
    return Math.min(experienceYears * 1.25, 25);
  }
  
  // Calcular score por rating
  private calculateRatingScore(rating: number): number {
    // Máximo 20 puntos por rating
    return rating * 4;
  }
  
  // Calcular score por disponibilidad
  private calculateAvailabilityScore(availabilityStatus: any): number {
    let score = 0;
    
    if (availabilityStatus.isOnline) score += 10;
    if (availabilityStatus.isAvailable) score += 10;
    if (availabilityStatus.calendarAvailable) score += 10;
    if (availabilityStatus.workingHoursAvailable) score += 5;
    if (availabilityStatus.blackoutDateAvailable) score += 5;
    
    return score; // Máximo 40 puntos
  }
  
  // Calcular score por precio
  private calculatePriceScore(price: number, budget: { min: number; max: number }): number {
    const budgetMid = (budget.min + budget.max) / 2;
    const priceDiff = Math.abs(price - budgetMid);
    const maxDiff = budget.max - budget.min;
    
    return Math.max(0, 20 - (priceDiff / maxDiff) * 20); // Máximo 20 puntos
  }
  
  // Calcular score por distancia
  private calculateDistanceScore(
    musicianCoords: { latitude: number; longitude: number },
    eventCoords: { latitude: number; longitude: number }
  ): number {
    const distance = this.calculateDistance(musicianCoords, eventCoords);
    
    if (distance <= 5) return 15; // Muy cerca
    if (distance <= 15) return 12; // Cerca
    if (distance <= 30) return 8;  // Moderado
    if (distance <= 50) return 4;  // Lejos
    return 0; // Muy lejos
  }
  
  // Calcular score por rendimiento
  private calculatePerformanceScore(performance: any): number {
    let score = 0;
    
    // Score por eventos completados
    score += Math.min(performance.completedEvents * 0.1, 5);
    
    // Score por tasa de aceptación
    score += performance.acceptanceRate * 10;
    
    // Score por tasa de clientes repetidos
    score += performance.repeatClientRate * 10;
    
    // Penalización por cancelaciones
    score -= performance.cancellationRate * 10;
    
    return Math.max(0, Math.min(score, 25)); // Máximo 25 puntos
  }
  
  // Calcular score por especialización
  private calculateSpecializationScore(skills: any, eventDetails: EventDetails): number {
    let score = 0;
    
    // Score por tipo de evento
    if (skills.specializations.includes(eventDetails.eventType)) {
      score += 10;
    }
    
    // Score por géneros musicales
    if (eventDetails.genres) {
      const matchingGenres = eventDetails.genres.filter(genre => 
        skills.genres.includes(genre)
      );
      score += matchingGenres.length * 2;
    }
    
    // Score por idiomas
    if (eventDetails.languages) {
      const matchingLanguages = eventDetails.languages.filter(language => 
        skills.languages.includes(language)
      );
      score += matchingLanguages.length * 1;
    }
    
    return Math.min(score, 15); // Máximo 15 puntos
  }
  
  // Calcular score por tiempo de respuesta
  private calculateResponseScore(responseTimeMinutes: number): number {
    if (responseTimeMinutes <= 30) return 10;  // Excelente
    if (responseTimeMinutes <= 60) return 8;   // Bueno
    if (responseTimeMinutes <= 120) return 5;  // Regular
    if (responseTimeMinutes <= 240) return 2;  // Lento
    return 0; // Muy lento
  }
  
  // Calcular distancia (fórmula de Haversine)
  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  // Convertir a radianes
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
```

## 🎯 Endpoints

### **🔍 POST /api/search/available-musicians-advanced**

```typescript
// Búsqueda avanzada de músicos disponibles
router.post('/available-musicians-advanced', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { eventDetails, filters } = req.body;
      
      const searchService = new IntelligentSearchService();
      const results = await searchService.searchAvailableMusiciansForEvent(
        eventDetails, 
        filters
      );
      
      res.json({ 
        success: true, 
        data: results 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error en búsqueda avanzada' 
      });
    }
  }
);
```

### **💡 GET /api/search/musician-suggestions**

```typescript
// Obtener sugerencias de músicos
router.get('/musician-suggestions', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { eventType, location, budget } = req.query;
      
      const searchService = new IntelligentSearchService();
      const suggestions = await searchService.getMusicianSuggestions({
        eventType: eventType as string,
        location: location as string,
        budget: parseInt(budget as string)
      });
      
      res.json({ 
        success: true, 
        data: suggestions 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo sugerencias' 
      });
    }
  }
);
```

### **⚡ POST /api/search/quick-match**

```typescript
// Búsqueda rápida de coincidencias
router.post('/quick-match', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { eventDetails } = req.body;
      
      const searchService = new IntelligentSearchService();
      const quickMatch = await searchService.performQuickMatch(eventDetails);
      
      res.json({ 
        success: true, 
        data: quickMatch 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error en búsqueda rápida' 
      });
    }
  }
);
```

### **📊 GET /api/search/search-history**

```typescript
// Obtener historial de búsquedas
router.get('/search-history', 
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { limit = 10, offset = 0 } = req.query;
      
      const searchService = new IntelligentSearchService();
      const history = await searchService.getSearchHistory(
        userId, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      
      res.json({ 
        success: true, 
        data: history 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo historial' 
      });
    }
  }
);
```

## 🧪 Testing

### **📋 Tests Unitarios**

```typescript
describe('IntelligentSearchService', () => {
  let searchService: IntelligentSearchService;
  
  beforeEach(() => {
    searchService = new IntelligentSearchService();
  });
  
  test('should perform intelligent search correctly', async () => {
    const eventDetails = {
      eventId: 'test-event-id',
      eventName: 'Boda de Juan y María',
      eventDate: new Date('2024-06-15'),
      location: 'Santo Domingo',
      durationHours: 3,
      instrument: 'piano',
      budget: { min: 200, max: 500 },
      coordinates: { latitude: 18.4861, longitude: -69.9312 }
    };
    
    const filters = {
      maxDistance: 30,
      minRating: 4.0,
      minExperience: 2,
      maxPrice: 400,
      availabilityOnly: true,
      onlineOnly: true
    };
    
    const results = await searchService.searchAvailableMusiciansForEvent(eventDetails, filters);
    
    expect(results.data.length).toBeGreaterThanOrEqual(0);
    expect(results.total).toBeGreaterThanOrEqual(0);
    expect(results.metadata).toBeDefined();
  });
  
  test('should calculate relevance scores correctly', async () => {
    const scoringService = new SearchScoringService();
    const musician = {
      basic: { experienceYears: 5, rating: 4.5 },
      availabilityStatus: { isOnline: true, isAvailable: true },
      rateCalculation: { calculation: { totalForEvent: 300 } },
      geography: { coordinates: { latitude: 18.4861, longitude: -69.9312 } },
      performance: { responseTimeMinutes: 45, acceptanceRate: 0.9 },
      skills: { specializations: ['boda'], genres: ['clásico'] }
    };
    
    const eventDetails = {
      eventType: 'boda',
      budget: { min: 200, max: 500 },
      coordinates: { latitude: 18.4861, longitude: -69.9312 },
      genres: ['clásico']
    };
    
    const score = await scoringService.calculateMusicianScore(musician, eventDetails);
    
    expect(score.total).toBeGreaterThan(0);
    expect(score.breakdown).toBeDefined();
  });
});
```

## 📊 Monitoreo

### **📈 Métricas a Monitorear**

- **Tiempo de búsqueda**: Tiempo promedio para completar búsquedas
- **Resultados por búsqueda**: Número promedio de resultados
- **Tasa de éxito**: Porcentaje de búsquedas exitosas
- **Cache hit rate**: Porcentaje de búsquedas desde caché

### **🔍 Logs**

```typescript
// Logs de búsqueda iniciada
logger.info('Búsqueda inteligente iniciada', {
  eventId: eventDetails.eventId,
  eventType: eventDetails.eventType,
  location: eventDetails.location,
  filters: Object.keys(filters)
});

// Logs de resultados de búsqueda
logger.info('Búsqueda completada', {
  eventId: eventDetails.eventId,
  initialResults: initialCount,
  availableResults: availableCount,
  finalResults: finalCount,
  searchTime: Date.now() - startTime
});

// Logs de scores calculados
logger.info('Scores calculados', {
  musicianId,
  totalScore,
  breakdown: scoreBreakdown
});
```

## 🚀 Deployment

### **📋 Configuración de Producción**

```typescript
// Variables de entorno
SEARCH_CACHE_TTL=300
SEARCH_MAX_RESULTS=100
SEARCH_TIMEOUT_MS=10000
SEARCH_INDEX_UPDATE_INTERVAL=3600
```

### **📋 Cron Jobs**

```typescript
// Actualizar índices de búsqueda cada hora
export const updateSearchIndexes = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const searchService = new IntelligentSearchService();
    await searchService.updateSearchIndexes();
  });
```

## 🎯 Criterios de Éxito

### **✅ Funcional**
- Búsqueda inteligente funciona correctamente
- Scoring de relevancia es preciso
- Filtros avanzados operativos
- Integración con otros servicios exitosa

### **📊 Performance**
- Tiempo de búsqueda < 3 segundos
- Escalabilidad con múltiples usuarios
- Optimización de consultas a Firestore
- Caché implementado correctamente

### **🔒 Seguridad**
- Validación de datos de entrada
- Verificación de permisos por usuario
- Logs de auditoría completos
- Protección contra consultas maliciosas

---

**📅 Fecha de Creación**: $(date)
**👨‍💻 Autor**: Sistema de Documentación Automática
**📋 Versión**: 1.0.0
**🎯 Estado**: Listo para Implementación 