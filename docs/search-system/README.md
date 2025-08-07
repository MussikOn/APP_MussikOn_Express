# 🔍 Búsqueda Avanzada - MussikOn API

## 📋 Índice

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Algoritmos de Búsqueda](#algoritmos-de-búsqueda)
- [Filtros y Geolocalización](#filtros-y-geolocalización)
- [Optimización de Consultas](#optimización-de-consultas)
- [Índices de Firestore](#índices-de-firestore)

## 🎯 Descripción General

El Sistema de Búsqueda Avanzada de MussikOn proporciona capacidades de búsqueda inteligente y filtrado para encontrar músicos, eventos y contenido de manera eficiente y relevante.

### Características Principales

- **Búsqueda Inteligente**: Algoritmos de relevancia y coincidencia fuzzy
- **Filtros Avanzados**: Múltiples criterios de filtrado
- **Geolocalización**: Búsqueda por proximidad geográfica
- **Optimización de Rendimiento**: Índices optimizados y caché
- **Búsqueda en Tiempo Real**: Resultados instantáneos

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
src/
├── controllers/
│   └── advancedSearchController.ts     # Controlador de búsqueda
├── services/
│   ├── searchService.ts               # Servicio de búsqueda
│   └── geolocationService.ts          # Servicio de geolocalización
├── utils/
│   ├── searchAlgorithms.ts            # Algoritmos de búsqueda
│   └── queryOptimizer.ts              # Optimizador de consultas
└── types/
    └── searchTypes.ts                 # Tipos de búsqueda
```

## 🔍 Algoritmos de Búsqueda

### Búsqueda por Texto

```typescript
// utils/searchAlgorithms.ts
export class SearchAlgorithm {
  async searchMusicians(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      // 1. Procesar consulta
      const processedQuery = this.processQuery(query);
      
      // 2. Búsqueda en múltiples campos
      const results = await Promise.all([
        this.searchByName(processedQuery),
        this.searchByGenres(processedQuery),
        this.searchByInstruments(processedQuery),
        this.searchByBio(processedQuery)
      ]);
      
      // 3. Combinar y rankear resultados
      const combinedResults = this.combineSearchResults(results);
      const rankedResults = this.rankResults(combinedResults, filters);
      
      // 4. Aplicar filtros adicionales
      const filteredResults = this.applyFilters(rankedResults, filters);
      
      return filteredResults;
    } catch (error) {
      logger.error('Error in musician search:', error);
      throw new Error('Error en búsqueda de músicos');
    }
  }
  
  private processQuery(query: string): ProcessedQuery {
    const normalized = query.toLowerCase().trim();
    const keywords = normalized.split(/\s+/).filter(word => word.length > 2);
    
    return {
      original: query,
      normalized,
      keywords,
      searchTypes: this.identifySearchTypes(keywords)
    };
  }
  
  private calculateRelevance(musician: MusicianProfile, query: ProcessedQuery): number {
    let relevance = 0;
    
    // Coincidencia exacta en nombre
    const fullName = `${musician.personalInfo.firstName} ${musician.personalInfo.lastName}`.toLowerCase();
    if (fullName.includes(query.normalized)) {
      relevance += 100;
    }
    
    // Coincidencia en géneros
    const genreMatches = musician.professionalInfo.genres.filter(genre =>
      query.keywords.some(keyword => genre.toLowerCase().includes(keyword))
    );
    relevance += genreMatches.length * 30;
    
    // Coincidencia en instrumentos
    const instrumentMatches = musician.professionalInfo.instruments.filter(instrument =>
      query.keywords.some(keyword => instrument.toLowerCase().includes(keyword))
    );
    relevance += instrumentMatches.length * 25;
    
    // Calificación del músico
    relevance += musician.metrics.averageRating * 10;
    
    return relevance;
  }
}
```

### Búsqueda por Ubicación

```typescript
// services/geolocationService.ts
export class GeolocationService {
  async searchByLocation(
    center: { latitude: number; longitude: number },
    radius: number,
    filters: SearchFilters
  ): Promise<SearchResult[]> {
    try {
      // 1. Calcular límites del área de búsqueda
      const bounds = this.calculateSearchBounds(center, radius);
      
      // 2. Búsqueda por coordenadas
      const results = await admin.firestore()
        .collection('musicians')
        .where('status', '==', 'active')
        .where('location.coordinates.latitude', '>=', bounds.minLat)
        .where('location.coordinates.latitude', '<=', bounds.maxLat)
        .get();
      
      // 3. Filtrar por distancia y radio de viaje
      const filteredResults = results.docs
        .map(doc => doc.data() as MusicianProfile)
        .filter(profile => {
          const distance = this.calculateDistance(center, profile.location.coordinates);
          return distance <= radius && distance <= profile.location.travelRadius;
        });
      
      // 4. Ordenar por distancia
      return filteredResults
        .map(profile => ({
          profile,
          distance: this.calculateDistance(center, profile.location.coordinates),
          relevance: this.calculateLocationRelevance(profile, center, radius)
        }))
        .sort((a, b) => a.distance - b.distance);
    } catch (error) {
      logger.error('Error in location search:', error);
      throw new Error('Error en búsqueda por ubicación');
    }
  }
  
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
}
```

## 🔧 Filtros y Geolocalización

### Sistema de Filtros

```typescript
// types/searchTypes.ts
interface SearchFilters {
  // Filtros básicos
  genres?: string[];
  instruments?: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
    coordinates?: { latitude: number; longitude: number };
    radius?: number;
  };
  
  // Filtros de precio
  priceRange?: {
    min: number;
    max: number;
  };
  
  // Filtros de calificación
  rating?: {
    min: number;
    max: number;
  };
  
  // Filtros de disponibilidad
  availability?: {
    date: Date;
    timeSlot?: { start: string; end: string };
  };
  
  // Filtros de experiencia
  experience?: {
    min: number;
    max: number;
  };
  
  // Ordenamiento
  sortBy?: 'relevance' | 'rating' | 'price' | 'distance' | 'experience';
  sortOrder?: 'asc' | 'desc';
  
  // Paginación
  page?: number;
  limit?: number;
}

// services/searchService.ts
export class SearchService {
  async applyFilters(results: SearchResult[], filters: SearchFilters): Promise<SearchResult[]> {
    let filteredResults = results;
    
    // Filtrar por géneros
    if (filters.genres && filters.genres.length > 0) {
      filteredResults = filteredResults.filter(result =>
        result.profile.professionalInfo.genres.some(genre =>
          filters.genres!.includes(genre)
        )
      );
    }
    
    // Filtrar por instrumentos
    if (filters.instruments && filters.instruments.length > 0) {
      filteredResults = filteredResults.filter(result =>
        result.profile.professionalInfo.instruments.some(instrument =>
          filters.instruments!.includes(instrument)
        )
      );
    }
    
    // Filtrar por precio
    if (filters.priceRange) {
      filteredResults = filteredResults.filter(result =>
        result.profile.pricing.hourlyRate >= filters.priceRange!.min &&
        result.profile.pricing.hourlyRate <= filters.priceRange!.max
      );
    }
    
    // Filtrar por calificación
    if (filters.rating) {
      filteredResults = filteredResults.filter(result =>
        result.profile.metrics.averageRating >= filters.rating!.min &&
        result.profile.metrics.averageRating <= filters.rating!.max
      );
    }
    
    // Ordenar resultados
    if (filters.sortBy) {
      filteredResults = this.sortResults(filteredResults, filters.sortBy, filters.sortOrder);
    }
    
    return filteredResults;
  }
  
  private sortResults(
    results: SearchResult[],
    sortBy: string,
    sortOrder: 'asc' | 'desc' = 'desc'
  ): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'rating':
          comparison = a.profile.metrics.averageRating - b.profile.metrics.averageRating;
          break;
        case 'price':
          comparison = a.profile.pricing.hourlyRate - b.profile.pricing.hourlyRate;
          break;
        case 'distance':
          comparison = (a.distance || 0) - (b.distance || 0);
          break;
        case 'experience':
          comparison = a.profile.professionalInfo.experience - b.profile.professionalInfo.experience;
          break;
        default:
          comparison = (a.relevance || 0) - (b.relevance || 0);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }
}
```

## ⚡ Optimización de Consultas

### Optimizador de Consultas

```typescript
// utils/queryOptimizer.ts
export class QueryOptimizer {
  optimizeFirestoreQuery(filters: SearchFilters): FirestoreQuery {
    let query = admin.firestore().collection('musicians');
    
    // Aplicar filtros que pueden usar índices
    if (filters.genres && filters.genres.length > 0) {
      query = query.where('professionalInfo.genres', 'array-contains-any', filters.genres);
    }
    
    if (filters.instruments && filters.instruments.length > 0) {
      query = query.where('professionalInfo.instruments', 'array-contains-any', filters.instruments);
    }
    
    if (filters.rating?.min) {
      query = query.where('metrics.averageRating', '>=', filters.rating.min);
    }
    
    if (filters.priceRange?.min) {
      query = query.where('pricing.hourlyRate', '>=', filters.priceRange.min);
    }
    
    if (filters.priceRange?.max) {
      query = query.where('pricing.hourlyRate', '<=', filters.priceRange.max);
    }
    
    // Ordenar por campo indexado
    if (filters.sortBy === 'rating') {
      query = query.orderBy('metrics.averageRating', filters.sortOrder || 'desc');
    } else if (filters.sortBy === 'price') {
      query = query.orderBy('pricing.hourlyRate', filters.sortOrder || 'asc');
    }
    
    // Limitar resultados
    query = query.limit(filters.limit || 20);
    
    return query;
  }
  
  async executeOptimizedQuery(filters: SearchFilters): Promise<MusicianProfile[]> {
    try {
      const query = this.optimizeFirestoreQuery(filters);
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MusicianProfile[];
    } catch (error) {
      logger.error('Error executing optimized query:', error);
      throw new Error('Error al ejecutar consulta optimizada');
    }
  }
}
```

## 📊 Índices de Firestore

### Configuración de Índices

```typescript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "musicians",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "professionalInfo.genres", "arrayConfig": "CONTAINS" },
        { "fieldPath": "metrics.averageRating", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "musicians",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "professionalInfo.instruments", "arrayConfig": "CONTAINS" },
        { "fieldPath": "pricing.hourlyRate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "musicians",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "location.coordinates.latitude", "order": "ASCENDING" },
        { "fieldPath": "location.coordinates.longitude", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### Gestión de Índices

```typescript
// utils/firestoreIndexes.ts
export class FirestoreIndexManager {
  async createIndexes(): Promise<void> {
    try {
      const indexes = [
        {
          collectionGroup: 'musicians',
          queryScope: 'COLLECTION',
          fields: [
            { fieldPath: 'status', order: 'ASCENDING' },
            { fieldPath: 'professionalInfo.genres', arrayConfig: 'CONTAINS' },
            { fieldPath: 'metrics.averageRating', order: 'DESCENDING' }
          ]
        }
      ];
      
      for (const index of indexes) {
        await this.createIndex(index);
      }
      
      logger.info('Firestore indexes created successfully');
    } catch (error) {
      logger.error('Error creating Firestore indexes:', error);
      throw new Error('Error al crear índices de Firestore');
    }
  }
  
  async checkIndexStatus(): Promise<IndexStatus[]> {
    try {
      const indexes = await admin.firestore().listIndexes();
      return indexes.map(index => ({
        name: index.name,
        state: index.state,
        fields: index.fields
      }));
    } catch (error) {
      logger.error('Error checking index status:', error);
      throw new Error('Error al verificar estado de índices');
    }
  }
}
```

---

**Anterior**: [Sistema de Imágenes](../image-system/README.md)  
**Siguiente**: [Seguridad](../security/README.md) 