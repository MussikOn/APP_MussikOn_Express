# 🎵 Gestión de Músicos - MussikOn API

## 📋 Índice

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Perfiles de Músicos](#perfiles-de-músicos)
- [Búsqueda Inteligente](#búsqueda-inteligente)
- [Sistema de Calificaciones](#sistema-de-calificaciones)
- [Gestión de Disponibilidad](#gestión-de-disponibilidad)
- [Contratación](#contratación)
- [Comunicación](#comunicación)
- [Analytics de Músicos](#analytics-de-músicos)
- [Verificación y Moderación](#verificación-y-moderación)

## 🎯 Descripción General

El Sistema de Gestión de Músicos de MussikOn es el núcleo de la plataforma, permitiendo a los músicos crear perfiles profesionales, gestionar su disponibilidad, recibir contrataciones y mantener comunicación con organizadores de eventos.

### Características Principales

- **Perfiles Profesionales**: Creación y gestión de perfiles detallados
- **Búsqueda Inteligente**: Algoritmos avanzados de búsqueda y filtrado
- **Sistema de Calificaciones**: Reviews y ratings de músicos
- **Gestión de Disponibilidad**: Calendario y conflictos automáticos
- **Proceso de Contratación**: Flujo completo de contratación
- **Comunicación Integrada**: Chat y notificaciones en tiempo real
- **Analytics Personalizados**: Métricas de rendimiento individual

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────┐
│         Frontend/App                │
├─────────────────────────────────────┤
│         MussikOn API                │
│  ┌─────────────────────────────┐    │
│  │   Musician Controllers      │    │
│  │  ┌─────────────────────┐    │    │
│  │  │ MusicianProfileCtrl │    │    │
│  │  │ MusicianSearchCtrl  │    │    │
│  │  │ RatingController    │    │    │
│  │  └─────────────────────┘    │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│        Musician Services            │
│  ┌─────────────────────────────┐    │
│  │  MusicianProfileService     │    │
│  │  MusicianSearchService      │    │
│  │  RatingService              │    │
│  │  AvailabilityService        │    │
│  │  HiringService              │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│         Firebase Firestore          │
│  ┌─────────────────────────────┐    │
│  │  musicians collection       │    │
│  │  ratings collection         │    │
│  │  availability collection    │    │
│  │  bookings collection        │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Estructura de Archivos

```
src/
├── controllers/
│   ├── musicianProfileController.ts   # Controlador de perfiles
│   ├── musicianSearchController.ts    # Controlador de búsqueda
│   ├── ratingController.ts            # Controlador de calificaciones
│   └── hiringController.ts            # Controlador de contratación
├── services/
│   ├── musicianProfileService.ts      # Servicio de perfiles
│   ├── musicianSearchService.ts       # Servicio de búsqueda
│   ├── ratingService.ts               # Servicio de calificaciones
│   ├── availabilityService.ts         # Servicio de disponibilidad
│   └── hiringService.ts               # Servicio de contratación
├── routes/
│   ├── musicianProfileRoutes.ts       # Rutas de perfiles
│   ├── musicianSearchRoutes.ts        # Rutas de búsqueda
│   ├── ratingRoutes.ts                # Rutas de calificaciones
│   └── hiringRoutes.ts                # Rutas de contratación
├── types/
│   └── musicianTypes.ts               # Tipos específicos de músicos
└── utils/
    ├── searchAlgorithms.ts            # Algoritmos de búsqueda
    └── ratingCalculator.ts            # Cálculo de calificaciones
```

## 👤 Perfiles de Músicos

### Estructura del Perfil

```typescript
interface MusicianProfile {
  id: string;
  userId: string;
  
  // Información Personal
  personalInfo: {
    firstName: string;
    lastName: string;
    stageName?: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    profileImage: string;
    coverImage?: string;
  };
  
  // Información Profesional
  professionalInfo: {
    bio: string;
    experience: number; // años de experiencia
    genres: string[];
    instruments: string[];
    languages: string[];
    certifications: Certification[];
    awards: Award[];
  };
  
  // Ubicación
  location: {
    city: string;
    state: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    travelRadius: number; // km
    willingToTravel: boolean;
  };
  
  // Tarifas y Disponibilidad
  pricing: {
    hourlyRate: number;
    currency: string;
    minimumBooking: number; // horas mínimas
    depositRequired: boolean;
    depositPercentage: number;
  };
  
  // Multimedia
  media: {
    photos: MediaItem[];
    videos: MediaItem[];
    audioSamples: MediaItem[];
    portfolio: MediaItem[];
  };
  
  // Configuración
  settings: {
    isPublic: boolean;
    autoAcceptBookings: boolean;
    notificationPreferences: NotificationSettings;
    privacySettings: PrivacySettings;
  };
  
  // Métricas
  metrics: {
    totalBookings: number;
    completedEvents: number;
    averageRating: number;
    totalReviews: number;
    responseRate: number;
    responseTime: number; // minutos promedio
  };
  
  // Estados
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  certificateUrl?: string;
}

interface Award {
  id: string;
  name: string;
  organization: string;
  year: number;
  description?: string;
  certificateUrl?: string;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
  isPublic: boolean;
  uploadedAt: Date;
}
```

### Creación y Actualización de Perfiles

```typescript
// services/musicianProfileService.ts
export class MusicianProfileService {
  async createProfile(userId: string, profileData: CreateProfileDto): Promise<MusicianProfile> {
    try {
      // 1. Validar datos del perfil
      await this.validateProfileData(profileData);
      
      // 2. Verificar que el usuario no tenga perfil existente
      const existingProfile = await this.getProfileByUserId(userId);
      if (existingProfile) {
        throw new Error('El usuario ya tiene un perfil de músico');
      }
      
      // 3. Procesar imágenes y multimedia
      const processedMedia = await this.processProfileMedia(profileData.media);
      
      // 4. Crear perfil en base de datos
      const profile = await this.saveProfile({
        userId,
        ...profileData,
        media: processedMedia,
        status: 'pending_verification',
        verificationStatus: 'unverified',
        metrics: {
          totalBookings: 0,
          completedEvents: 0,
          averageRating: 0,
          totalReviews: 0,
          responseRate: 100,
          responseTime: 0
        }
      });
      
      // 5. Crear índices de búsqueda
      await this.createSearchIndexes(profile);
      
      // 6. Notificar al administrador para verificación
      await this.notifyAdminForVerification(profile);
      
      return profile;
    } catch (error) {
      logger.error('Error creating musician profile:', error);
      throw new Error('Error al crear perfil de músico');
    }
  }
  
  async updateProfile(profileId: string, updateData: UpdateProfileDto): Promise<MusicianProfile> {
    try {
      // 1. Obtener perfil existente
      const existingProfile = await this.getProfileById(profileId);
      if (!existingProfile) {
        throw new Error('Perfil no encontrado');
      }
      
      // 2. Validar cambios
      await this.validateProfileUpdate(existingProfile, updateData);
      
      // 3. Procesar cambios en multimedia
      const updatedMedia = await this.processMediaUpdates(existingProfile.media, updateData.media);
      
      // 4. Actualizar perfil
      const updatedProfile = await this.saveProfileUpdate(profileId, {
        ...updateData,
        media: updatedMedia,
        updatedAt: new Date()
      });
      
      // 5. Actualizar índices de búsqueda
      await this.updateSearchIndexes(updatedProfile);
      
      // 6. Notificar cambios relevantes
      await this.notifyRelevantChanges(existingProfile, updatedProfile);
      
      return updatedProfile;
    } catch (error) {
      logger.error('Error updating musician profile:', error);
      throw new Error('Error al actualizar perfil de músico');
    }
  }
  
  async getProfileById(profileId: string): Promise<MusicianProfile> {
    try {
      const profile = await admin.firestore()
        .collection('musicians')
        .doc(profileId)
        .get();
      
      if (!profile.exists) {
        throw new Error('Perfil no encontrado');
      }
      
      return profile.data() as MusicianProfile;
    } catch (error) {
      logger.error('Error getting musician profile:', error);
      throw new Error('Error al obtener perfil de músico');
    }
  }
  
  async getPublicProfiles(filters: ProfileFilters): Promise<PaginatedProfiles> {
    try {
      let query = admin.firestore()
        .collection('musicians')
        .where('status', '==', 'active')
        .where('isPublic', '==', true);
      
      // Aplicar filtros
      if (filters.genres && filters.genres.length > 0) {
        query = query.where('professionalInfo.genres', 'array-contains-any', filters.genres);
      }
      
      if (filters.instruments && filters.instruments.length > 0) {
        query = query.where('professionalInfo.instruments', 'array-contains-any', filters.instruments);
      }
      
      if (filters.location) {
        query = query.where('location.city', '==', filters.location.city);
      }
      
      if (filters.minRating) {
        query = query.where('metrics.averageRating', '>=', filters.minRating);
      }
      
      // Ordenar por relevancia
      query = query.orderBy('metrics.averageRating', 'desc');
      
      // Paginación
      if (filters.cursor) {
        query = query.startAfter(filters.cursor);
      }
      
      const snapshot = await query.limit(filters.limit || 20).get();
      
      const profiles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MusicianProfile[];
      
      return {
        profiles,
        pagination: {
          hasMore: snapshot.docs.length === (filters.limit || 20),
          cursor: snapshot.docs[snapshot.docs.length - 1]?.id
        }
      };
    } catch (error) {
      logger.error('Error getting public profiles:', error);
      throw new Error('Error al obtener perfiles públicos');
    }
  }
}
```

## 🔍 Búsqueda Inteligente

### Algoritmos de Búsqueda

#### Búsqueda por Texto
```typescript
// utils/searchAlgorithms.ts
export class SearchAlgorithm {
  async searchByText(query: string, filters: SearchFilters): Promise<SearchResult[]> {
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
      logger.error('Error in text search:', error);
      throw new Error('Error en búsqueda de texto');
    }
  }
  
  private processQuery(query: string): ProcessedQuery {
    // Normalizar consulta
    const normalized = query.toLowerCase().trim();
    
    // Extraer palabras clave
    const keywords = normalized.split(/\s+/).filter(word => word.length > 2);
    
    // Identificar tipos de búsqueda
    const searchTypes = {
      name: this.isNameSearch(keywords),
      genre: this.isGenreSearch(keywords),
      instrument: this.isInstrumentSearch(keywords),
      location: this.isLocationSearch(keywords)
    };
    
    return {
      original: query,
      normalized,
      keywords,
      searchTypes
    };
  }
  
  private async searchByName(query: ProcessedQuery): Promise<SearchResult[]> {
    const results = await admin.firestore()
      .collection('musicians')
      .where('status', '==', 'active')
      .get();
    
    return results.docs
      .map(doc => doc.data() as MusicianProfile)
      .filter(profile => {
        const fullName = `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`.toLowerCase();
        const stageName = profile.personalInfo.stageName?.toLowerCase() || '';
        
        return query.keywords.some(keyword => 
          fullName.includes(keyword) || stageName.includes(keyword)
        );
      })
      .map(profile => ({
        profile,
        relevance: this.calculateNameRelevance(profile, query),
        matchType: 'name'
      }));
  }
  
  private calculateNameRelevance(profile: MusicianProfile, query: ProcessedQuery): number {
    const fullName = `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`.toLowerCase();
    const stageName = profile.personalInfo.stageName?.toLowerCase() || '';
    
    let relevance = 0;
    
    // Coincidencia exacta en nombre
    if (fullName.includes(query.normalized)) {
      relevance += 100;
    }
    
    // Coincidencia en nombre artístico
    if (stageName.includes(query.normalized)) {
      relevance += 90;
    }
    
    // Coincidencia parcial
    query.keywords.forEach(keyword => {
      if (fullName.includes(keyword)) relevance += 50;
      if (stageName.includes(keyword)) relevance += 45;
    });
    
    return relevance;
  }
}
```

#### Búsqueda por Ubicación
```typescript
// utils/searchAlgorithms.ts
export class LocationSearch {
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
      
      // 3. Filtrar por longitud y radio de viaje
      const filteredResults = results.docs
        .map(doc => doc.data() as MusicianProfile)
        .filter(profile => {
          const distance = this.calculateDistance(center, profile.location.coordinates);
          return distance <= radius && distance <= profile.location.travelRadius;
        });
      
      // 4. Ordenar por distancia
      const sortedResults = filteredResults
        .map(profile => ({
          profile,
          distance: this.calculateDistance(center, profile.location.coordinates),
          relevance: this.calculateLocationRelevance(profile, center, radius)
        }))
        .sort((a, b) => a.distance - b.distance);
      
      return sortedResults;
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
  
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
```

### Filtros Avanzados

```typescript
// types/musicianTypes.ts
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
    timeSlot?: {
      start: string;
      end: string;
    };
  };
  
  // Filtros de experiencia
  experience?: {
    min: number;
    max: number;
  };
  
  // Filtros de idioma
  languages?: string[];
  
  // Filtros de verificación
  verifiedOnly?: boolean;
  
  // Filtros de respuesta
  responseRate?: {
    min: number;
  };
  
  // Ordenamiento
  sortBy?: 'relevance' | 'rating' | 'price' | 'distance' | 'experience';
  sortOrder?: 'asc' | 'desc';
  
  // Paginación
  page?: number;
  limit?: number;
}
```

## ⭐ Sistema de Calificaciones

### Estructura de Calificaciones

```typescript
interface Rating {
  id: string;
  musicianId: string;
  reviewerId: string;
  eventId: string;
  
  // Calificaciones específicas
  ratings: {
    professionalism: number; // 1-5
    punctuality: number;     // 1-5
    quality: number;         // 1-5
    communication: number;   // 1-5
    overall: number;         // 1-5
  };
  
  // Comentario
  comment: string;
  
  // Metadatos
  eventDate: Date;
  eventType: string;
  eventLocation: string;
  
  // Estados
  status: 'pending' | 'approved' | 'rejected';
  isVerified: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

interface RatingSummary {
  musicianId: string;
  totalRatings: number;
  averageRating: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  categoryAverages: {
    professionalism: number;
    punctuality: number;
    quality: number;
    communication: number;
  };
  recentRatings: Rating[];
  lastUpdated: Date;
}
```

### Servicio de Calificaciones

```typescript
// services/ratingService.ts
export class RatingService {
  async createRating(ratingData: CreateRatingDto): Promise<Rating> {
    try {
      // 1. Validar que el usuario puede calificar
      await this.validateRatingEligibility(ratingData);
      
      // 2. Calcular calificación general
      const overallRating = this.calculateOverallRating(ratingData.ratings);
      
      // 3. Crear calificación
      const rating = await this.saveRating({
        ...ratingData,
        ratings: {
          ...ratingData.ratings,
          overall: overallRating
        },
        status: 'pending',
        isVerified: false
      });
      
      // 4. Actualizar resumen de calificaciones
      await this.updateRatingSummary(ratingData.musicianId);
      
      // 5. Notificar al músico
      await this.notifyMusicianOfRating(rating);
      
      return rating;
    } catch (error) {
      logger.error('Error creating rating:', error);
      throw new Error('Error al crear calificación');
    }
  }
  
  async getRatingSummary(musicianId: string): Promise<RatingSummary> {
    try {
      // 1. Obtener calificaciones aprobadas
      const ratings = await this.getApprovedRatings(musicianId);
      
      // 2. Calcular métricas
      const totalRatings = ratings.length;
      const averageRating = this.calculateAverageRating(ratings);
      const ratingDistribution = this.calculateRatingDistribution(ratings);
      const categoryAverages = this.calculateCategoryAverages(ratings);
      
      // 3. Obtener calificaciones recientes
      const recentRatings = ratings
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10);
      
      return {
        musicianId,
        totalRatings,
        averageRating,
        ratingDistribution,
        categoryAverages,
        recentRatings,
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error getting rating summary:', error);
      throw new Error('Error al obtener resumen de calificaciones');
    }
  }
  
  private calculateOverallRating(ratings: Partial<Rating['ratings']>): number {
    const weights = {
      professionalism: 0.25,
      punctuality: 0.20,
      quality: 0.30,
      communication: 0.25
    };
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    Object.entries(ratings).forEach(([category, rating]) => {
      if (category !== 'overall' && rating) {
        weightedSum += rating * weights[category as keyof typeof weights];
        totalWeight += weights[category as keyof typeof weights];
      }
    });
    
    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;
  }
  
  private calculateRatingDistribution(ratings: Rating[]): RatingSummary['ratingDistribution'] {
    const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    
    ratings.forEach(rating => {
      const overall = Math.round(rating.ratings.overall);
      distribution[overall.toString() as keyof typeof distribution]++;
    });
    
    return distribution;
  }
}
```

## 📅 Gestión de Disponibilidad

### Estructura de Disponibilidad

```typescript
interface Availability {
  id: string;
  musicianId: string;
  
  // Configuración general
  settings: {
    autoAcceptBookings: boolean;
    minimumNoticeHours: number;
    maximumAdvanceBookingDays: number;
    blackoutDates: Date[];
  };
  
  // Horarios regulares
  regularSchedule: {
    monday: TimeSlot[];
    tuesday: TimeSlot[];
    wednesday: TimeSlot[];
    thursday: TimeSlot[];
    friday: TimeSlot[];
    saturday: TimeSlot[];
    sunday: TimeSlot[];
  };
  
  // Disponibilidad específica
  specificAvailability: SpecificAvailability[];
  
  // Bloqueos
  blocks: AvailabilityBlock[];
  
  // Timestamps
  updatedAt: Date;
}

interface TimeSlot {
  start: string; // HH:MM
  end: string;   // HH:MM
  isAvailable: boolean;
}

interface SpecificAvailability {
  id: string;
  date: Date;
  timeSlots: TimeSlot[];
  isAvailable: boolean;
  reason?: string;
}

interface AvailabilityBlock {
  id: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
}
```

### Servicio de Disponibilidad

```typescript
// services/availabilityService.ts
export class AvailabilityService {
  async checkAvailability(
    musicianId: string,
    eventDate: Date,
    duration: number
  ): Promise<AvailabilityCheck> {
    try {
      // 1. Obtener disponibilidad del músico
      const availability = await this.getMusicianAvailability(musicianId);
      
      // 2. Verificar bloqueos
      const hasBlock = this.checkForBlocks(availability, eventDate);
      if (hasBlock) {
        return {
          isAvailable: false,
          reason: 'Músico no disponible en esta fecha',
          conflicts: []
        };
      }
      
      // 3. Verificar horarios regulares
      const dayOfWeek = eventDate.getDay();
      const regularSlots = availability.regularSchedule[this.getDayName(dayOfWeek)];
      
      // 4. Verificar disponibilidad específica
      const specificAvailability = this.getSpecificAvailability(availability, eventDate);
      
      // 5. Verificar conflictos con otros eventos
      const conflicts = await this.checkEventConflicts(musicianId, eventDate, duration);
      
      // 6. Determinar disponibilidad
      const isAvailable = this.determineAvailability(
        regularSlots,
        specificAvailability,
        conflicts,
        duration
      );
      
      return {
        isAvailable,
        reason: isAvailable ? 'Disponible' : 'No disponible',
        conflicts,
        suggestedSlots: isAvailable ? [] : this.getSuggestedSlots(availability, eventDate)
      };
    } catch (error) {
      logger.error('Error checking availability:', error);
      throw new Error('Error al verificar disponibilidad');
    }
  }
  
  async updateAvailability(
    musicianId: string,
    updates: AvailabilityUpdate
  ): Promise<Availability> {
    try {
      // 1. Validar actualizaciones
      await this.validateAvailabilityUpdates(updates);
      
      // 2. Verificar conflictos con eventos existentes
      const conflicts = await this.checkUpdateConflicts(musicianId, updates);
      if (conflicts.length > 0) {
        throw new Error(`Conflicto con eventos existentes: ${conflicts.map(c => c.eventId).join(', ')}`);
      }
      
      // 3. Actualizar disponibilidad
      const updatedAvailability = await this.saveAvailabilityUpdate(musicianId, updates);
      
      // 4. Notificar a organizadores con eventos pendientes
      await this.notifyOrganizersOfChanges(musicianId, updates);
      
      return updatedAvailability;
    } catch (error) {
      logger.error('Error updating availability:', error);
      throw new Error('Error al actualizar disponibilidad');
    }
  }
  
  private determineAvailability(
    regularSlots: TimeSlot[],
    specificAvailability: SpecificAvailability | null,
    conflicts: EventConflict[],
    duration: number
  ): boolean {
    // Si hay disponibilidad específica, usarla
    if (specificAvailability) {
      return specificAvailability.isAvailable && conflicts.length === 0;
    }
    
    // Usar horarios regulares
    const availableSlots = regularSlots.filter(slot => slot.isAvailable);
    if (availableSlots.length === 0) {
      return false;
    }
    
    // Verificar que hay suficiente tiempo disponible
    const totalAvailableTime = availableSlots.reduce((total, slot) => {
      const start = this.parseTime(slot.start);
      const end = this.parseTime(slot.end);
      return total + (end - start);
    }, 0);
    
    return totalAvailableTime >= duration && conflicts.length === 0;
  }
}
```

## 🤝 Contratación

### Proceso de Contratación

```typescript
// services/hiringService.ts
export class HiringService {
  async initiateHiring(
    organizerId: string,
    musicianId: string,
    eventData: EventData
  ): Promise<HiringRequest> {
    try {
      // 1. Verificar disponibilidad
      const availability = await this.availabilityService.checkAvailability(
        musicianId,
        eventData.date,
        eventData.duration
      );
      
      if (!availability.isAvailable) {
        throw new Error(`Músico no disponible: ${availability.reason}`);
      }
      
      // 2. Calcular tarifa
      const musician = await this.musicianService.getMusicianById(musicianId);
      const fee = this.calculateFee(musician, eventData);
      
      // 3. Crear solicitud de contratación
      const hiringRequest = await this.createHiringRequest({
        organizerId,
        musicianId,
        eventData,
        fee,
        status: 'pending'
      });
      
      // 4. Notificar al músico
      await this.notifyMusicianOfHiringRequest(hiringRequest);
      
      return hiringRequest;
    } catch (error) {
      logger.error('Error initiating hiring:', error);
      throw new Error('Error al iniciar contratación');
    }
  }
  
  async acceptHiring(hiringId: string, musicianId: string): Promise<HiringRequest> {
    try {
      // 1. Verificar que el músico puede aceptar
      const hiring = await this.getHiringRequest(hiringId);
      if (hiring.musicianId !== musicianId) {
        throw new Error('No autorizado para aceptar esta contratación');
      }
      
      if (hiring.status !== 'pending') {
        throw new Error('La contratación ya no está pendiente');
      }
      
      // 2. Verificar disponibilidad nuevamente
      const availability = await this.availabilityService.checkAvailability(
        musicianId,
        hiring.eventData.date,
        hiring.eventData.duration
      );
      
      if (!availability.isAvailable) {
        throw new Error('Ya no disponible para esta fecha');
      }
      
      // 3. Actualizar estado
      const updatedHiring = await this.updateHiringStatus(hiringId, 'accepted');
      
      // 4. Bloquear disponibilidad
      await this.availabilityService.blockAvailability(
        musicianId,
        hiring.eventData.date,
        hiring.eventData.duration,
        `Evento: ${hiring.eventData.title}`
      );
      
      // 5. Notificar al organizador
      await this.notifyOrganizerOfAcceptance(updatedHiring);
      
      return updatedHiring;
    } catch (error) {
      logger.error('Error accepting hiring:', error);
      throw new Error('Error al aceptar contratación');
    }
  }
  
  async rejectHiring(hiringId: string, musicianId: string, reason: string): Promise<HiringRequest> {
    try {
      // 1. Verificar autorización
      const hiring = await this.getHiringRequest(hiringId);
      if (hiring.musicianId !== musicianId) {
        throw new Error('No autorizado para rechazar esta contratación');
      }
      
      // 2. Actualizar estado
      const updatedHiring = await this.updateHiringStatus(hiringId, 'rejected', reason);
      
      // 3. Notificar al organizador
      await this.notifyOrganizerOfRejection(updatedHiring, reason);
      
      return updatedHiring;
    } catch (error) {
      logger.error('Error rejecting hiring:', error);
      throw new Error('Error al rechazar contratación');
    }
  }
  
  private calculateFee(musician: MusicianProfile, eventData: EventData): FeeCalculation {
    const baseRate = musician.pricing.hourlyRate;
    const totalHours = eventData.duration;
    const baseAmount = baseRate * totalHours;
    
    // Aplicar descuentos por volumen
    let discount = 0;
    if (totalHours >= 8) {
      discount = 0.10; // 10% descuento para eventos de 8+ horas
    } else if (totalHours >= 4) {
      discount = 0.05; // 5% descuento para eventos de 4+ horas
    }
    
    const discountedAmount = baseAmount * (1 - discount);
    
    // Calcular comisión de la plataforma
    const platformCommission = discountedAmount * 0.15; // 15%
    const finalAmount = discountedAmount + platformCommission;
    
    return {
      baseAmount,
      discount,
      discountedAmount,
      platformCommission,
      finalAmount,
      currency: musician.pricing.currency
    };
  }
}
```

## 💬 Comunicación

### Sistema de Chat

```typescript
// services/chatService.ts
export class ChatService {
  async sendMessage(
    senderId: string,
    receiverId: string,
    messageData: MessageData
  ): Promise<Message> {
    try {
      // 1. Validar que pueden comunicarse
      await this.validateCommunication(senderId, receiverId);
      
      // 2. Crear mensaje
      const message = await this.createMessage({
        senderId,
        receiverId,
        content: messageData.content,
        type: messageData.type || 'text',
        attachments: messageData.attachments || []
      });
      
      // 3. Enviar notificación push
      await this.sendPushNotification(receiverId, {
        title: 'Nuevo mensaje',
        body: messageData.content.substring(0, 100),
        data: {
          type: 'chat_message',
          messageId: message.id,
          senderId
        }
      });
      
      // 4. Actualizar métricas de respuesta
      await this.updateResponseMetrics(senderId, receiverId);
      
      return message;
    } catch (error) {
      logger.error('Error sending message:', error);
      throw new Error('Error al enviar mensaje');
    }
  }
  
  async getConversation(
    userId1: string,
    userId2: string,
    options: ConversationOptions
  ): Promise<Conversation> {
    try {
      // 1. Obtener mensajes
      const messages = await this.getMessages(userId1, userId2, options);
      
      // 2. Marcar como leídos
      await this.markAsRead(userId1, userId2);
      
      // 3. Obtener información de los usuarios
      const [user1, user2] = await Promise.all([
        this.getUserInfo(userId1),
        this.getUserInfo(userId2)
      ]);
      
      return {
        participants: [user1, user2],
        messages,
        unreadCount: messages.filter(m => !m.readBy.includes(userId1)).length
      };
    } catch (error) {
      logger.error('Error getting conversation:', error);
      throw new Error('Error al obtener conversación');
    }
  }
}
```

## 📊 Analytics de Músicos

### Métricas de Rendimiento

```typescript
// services/analyticsService.ts
export class MusicianAnalyticsService {
  async getMusicianAnalytics(musicianId: string, period: AnalyticsPeriod): Promise<MusicianAnalytics> {
    try {
      // 1. Obtener datos del período
      const [bookings, ratings, messages, views] = await Promise.all([
        this.getBookingsInPeriod(musicianId, period),
        this.getRatingsInPeriod(musicianId, period),
        this.getMessagesInPeriod(musicianId, period),
        this.getProfileViewsInPeriod(musicianId, period)
      ]);
      
      // 2. Calcular métricas
      const metrics = {
        totalBookings: bookings.length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        totalRevenue: bookings.reduce((sum, b) => sum + b.amount, 0),
        averageRating: this.calculateAverageRating(ratings),
        responseRate: this.calculateResponseRate(messages),
        profileViews: views.length,
        conversionRate: this.calculateConversionRate(views, bookings)
      };
      
      // 3. Generar tendencias
      const trends = {
        bookings: this.generateBookingTrends(bookings, period),
        revenue: this.generateRevenueTrends(bookings, period),
        ratings: this.generateRatingTrends(ratings, period)
      };
      
      // 4. Comparar con período anterior
      const previousPeriod = this.getPreviousPeriod(period);
      const previousMetrics = await this.getMusicianAnalytics(musicianId, previousPeriod);
      
      const growth = {
        bookings: this.calculateGrowth(metrics.totalBookings, previousMetrics.metrics.totalBookings),
        revenue: this.calculateGrowth(metrics.totalRevenue, previousMetrics.metrics.totalRevenue),
        rating: this.calculateGrowth(metrics.averageRating, previousMetrics.metrics.averageRating)
      };
      
      return {
        period,
        metrics,
        trends,
        growth,
        insights: this.generateInsights(metrics, trends, growth)
      };
    } catch (error) {
      logger.error('Error getting musician analytics:', error);
      throw new Error('Error al obtener analytics del músico');
    }
  }
  
  private generateInsights(
    metrics: MusicianMetrics,
    trends: TrendData,
    growth: GrowthData
  ): Insight[] {
    const insights: Insight[] = [];
    
    // Análisis de rendimiento
    if (growth.revenue > 20) {
      insights.push({
        type: 'positive',
        title: 'Crecimiento de ingresos',
        description: `Tus ingresos han crecido un ${growth.revenue}% este período`,
        action: 'Mantén el buen trabajo'
      });
    }
    
    if (metrics.responseRate < 80) {
      insights.push({
        type: 'warning',
        title: 'Tasa de respuesta baja',
        description: 'Tu tasa de respuesta es del 80%. Responde más rápido para obtener más contrataciones',
        action: 'Configura notificaciones automáticas'
      });
    }
    
    if (metrics.averageRating < 4.0) {
      insights.push({
        type: 'warning',
        title: 'Calificación promedio baja',
        description: 'Tu calificación promedio es de 4.0. Revisa los comentarios para mejorar',
        action: 'Revisar feedback reciente'
      });
    }
    
    return insights;
  }
}
```

## ✅ Verificación y Moderación

### Proceso de Verificación

```typescript
// services/verificationService.ts
export class VerificationService {
  async submitVerification(
    musicianId: string,
    verificationData: VerificationData
  ): Promise<VerificationRequest> {
    try {
      // 1. Validar datos de verificación
      await this.validateVerificationData(verificationData);
      
      // 2. Crear solicitud de verificación
      const verification = await this.createVerificationRequest({
        musicianId,
        documents: verificationData.documents,
        status: 'pending',
        submittedAt: new Date()
      });
      
      // 3. Notificar a administradores
      await this.notifyAdminsOfVerification(verification);
      
      return verification;
    } catch (error) {
      logger.error('Error submitting verification:', error);
      throw new Error('Error al enviar verificación');
    }
  }
  
  async reviewVerification(
    verificationId: string,
    adminId: string,
    decision: 'approve' | 'reject',
    comments?: string
  ): Promise<VerificationRequest> {
    try {
      // 1. Obtener solicitud de verificación
      const verification = await this.getVerificationRequest(verificationId);
      
      // 2. Actualizar estado
      const updatedVerification = await this.updateVerificationStatus(
        verificationId,
        decision,
        adminId,
        comments
      );
      
      // 3. Actualizar perfil del músico
      await this.updateMusicianVerificationStatus(
        verification.musicianId,
        decision === 'approve' ? 'verified' : 'rejected'
      );
      
      // 4. Notificar al músico
      await this.notifyMusicianOfVerificationDecision(updatedVerification);
      
      return updatedVerification;
    } catch (error) {
      logger.error('Error reviewing verification:', error);
      throw new Error('Error al revisar verificación');
    }
  }
}
```

---

**Anterior**: [Sistema de Pagos](../payment-system/README.md)  
**Siguiente**: [Gestión de Eventos](../event-management/README.md) 