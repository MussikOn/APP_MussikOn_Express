import { db } from '../utils/firebase';
import { Event } from '../utils/DataTypes';

// Interfaz para los criterios de búsqueda
export interface MusicianSearchCriteria {
  instrument: string;
  location?: string;
  budget?: number;
  date?: string;
  time?: string;
  duration?: string;
  eventType?: string;
  maxDistance?: number; // en kilómetros
}

// Interfaz para el resultado de búsqueda
export interface MusicianSearchResult {
  userEmail: string;
  name: string;
  lastName: string;
  instruments: string[];
  hasOwnInstruments: boolean;
  experience: number;
  hourlyRate: number;
  location: string;
  isAvailable: boolean;
  rating: number;
  distance?: number; // distancia desde la ubicación del evento
  matchScore: number; // puntuación de compatibilidad (0-100)
  availability: {
    isAvailable: boolean;
    conflicts: string[];
  };
}

// Interfaz para el perfil de músico
interface MusicianProfile {
  userEmail: string;
  name: string;
  lastName: string;
  instruments: string[];
  hasOwnInstruments: boolean;
  experience: number;
  bio?: string;
  location: string;
  hourlyRate: number;
  isApproved: boolean;
  isAvailable: boolean;
  phone?: string;
  socialMedia?: Record<string, string>;
  rating: number;
  totalEvents: number;
  completedEvents: number;
}

/**
 * Algoritmo de búsqueda de músicos para eventos
 * Implementa un sistema de scoring basado en múltiples criterios
 */
export class MusicianSearchService {
  /**
   * Busca músicos disponibles que coincidan con los criterios del evento
   */
  static async searchMusiciansForEvent(
    event: Event,
    criteria: MusicianSearchCriteria
  ): Promise<MusicianSearchResult[]> {
    console.log(
      '[src/services/musicianSearchService.ts:75] 🔍 Iniciando búsqueda de músicos para evento:',
      event.id
    );

    try {
      // 1. Obtener todos los músicos aprobados y disponibles
      const musicians = await this.getAvailableMusicians();

      console.log(
        '[src/services/musicianSearchService.ts:82] 📊 Músicos disponibles encontrados:',
        musicians.length
      );

      // 2. Filtrar por instrumento requerido
      const musiciansWithInstrument = musicians.filter(musician =>
        musician.instruments.includes(criteria.instrument)
      );

      console.log(
        '[src/services/musicianSearchService.ts:89] 🎵 Músicos con instrumento requerido:',
        musiciansWithInstrument.length
      );

      // 3. Verificar disponibilidad de tiempo
      const availableMusicians = await this.checkAvailability(
        musiciansWithInstrument,
        event
      );

      console.log(
        '[src/services/musicianSearchService.ts:96] ⏰ Músicos disponibles en fecha/hora:',
        availableMusicians.length
      );

      // 4. Calcular puntuaciones de matching
      const scoredMusicians = await this.calculateMatchScores(
        availableMusicians,
        event,
        criteria
      );

      // 5. Ordenar por puntuación (mayor a menor)
      const sortedMusicians = scoredMusicians.sort(
        (a, b) => b.matchScore - a.matchScore
      );

      console.log(
        '[src/services/musicianSearchService.ts:108] 🏆 Búsqueda completada. Músicos encontrados:',
        sortedMusicians.length
      );

      return sortedMusicians;
    } catch (error) {
      console.error(
        '[src/services/musicianSearchService.ts:115] ❌ Error en búsqueda de músicos:',
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene todos los músicos aprobados y disponibles
   */
  private static async getAvailableMusicians(): Promise<MusicianProfile[]> {
    const snapshot = await db
      .collection('users')
      .where('roll', '==', 'musico')
      .where('isApproved', '==', true)
      .where('isAvailable', '==', true)
      .get();

    const musicians: MusicianProfile[] = [];

    for (const doc of snapshot.docs) {
      const userData = doc.data();
      
      // Obtener perfil completo del músico
      const profileSnapshot = await db
        .collection('musicianProfiles')
        .where('userEmail', '==', userData.userEmail)
        .limit(1)
        .get();

      if (!profileSnapshot.empty) {
        const profileData = profileSnapshot.docs[0].data();
        musicians.push({
          userEmail: userData.userEmail,
          name: userData.name,
          lastName: userData.lastName,
          instruments: profileData.instruments || [],
          hasOwnInstruments: profileData.hasOwnInstruments || false,
          experience: profileData.experience || 0,
          bio: profileData.bio,
          location: profileData.location || '',
          hourlyRate: profileData.hourlyRate || 0,
          isApproved: userData.isApproved || false,
          isAvailable: userData.isAvailable || false,
          phone: profileData.phone,
          socialMedia: profileData.socialMedia,
          rating: profileData.rating || 0,
          totalEvents: profileData.totalEvents || 0,
          completedEvents: profileData.completedEvents || 0,
        });
      }
    }

    return musicians;
  }

  /**
   * Verifica la disponibilidad de tiempo de los músicos
   */
  private static async checkAvailability(
    musicians: MusicianProfile[],
    event: Event
  ): Promise<MusicianProfile[]> {
    const eventDate = new Date(`${event.date}T${event.time}`);
    const eventEndTime = new Date(eventDate.getTime() + this.parseDuration(event.duration));

    const availableMusicians: MusicianProfile[] = [];

    for (const musician of musicians) {
      // Verificar si el músico tiene conflictos en la fecha/hora del evento
      const conflicts = await this.checkMusicianConflicts(
        musician.userEmail,
        eventDate,
        eventEndTime
      );

      if (conflicts.length === 0) {
        availableMusicians.push(musician);
      }
    }

    return availableMusicians;
  }

  /**
   * Verifica conflictos de horario para un músico específico
   */
  private static async checkMusicianConflicts(
    musicianEmail: string,
    eventStart: Date,
    eventEnd: Date
  ): Promise<string[]> {
    const conflicts: string[] = [];

    // Buscar eventos asignados al músico en la misma fecha
    const snapshot = await db
      .collection('events')
      .where('assignedMusicianId', '==', musicianEmail)
      .where('status', 'in', ['musician_assigned', 'pending_musician'])
      .get();

    for (const doc of snapshot.docs) {
      const event = doc.data() as Event;
      const eventDate = new Date(`${event.date}T${event.time}`);
      const eventEndTime = new Date(eventDate.getTime() + this.parseDuration(event.duration));

      // Verificar si hay solapamiento de horarios
      if (
        (eventStart >= eventDate && eventStart < eventEndTime) ||
        (eventEnd > eventDate && eventEnd <= eventEndTime) ||
        (eventStart <= eventDate && eventEnd >= eventEndTime)
      ) {
        conflicts.push(event.eventName);
      }
    }

    return conflicts;
  }

  /**
   * Calcula las puntuaciones de matching para cada músico
   */
  private static async calculateMatchScores(
    musicians: MusicianProfile[],
    event: Event,
    criteria: MusicianSearchCriteria
  ): Promise<MusicianSearchResult[]> {
    const results: MusicianSearchResult[] = [];

    for (const musician of musicians) {
      let matchScore = 0;

      // 1. Puntuación por instrumento (40 puntos)
      if (musician.instruments.includes(criteria.instrument)) {
        matchScore += 40;
      }

      // 2. Puntuación por disponibilidad de instrumento (15 puntos)
      if (musician.hasOwnInstruments) {
        matchScore += 15;
      } else if (event.bringInstrument) {
        matchScore += 5; // Puntuación menor si el evento requiere instrumento
      }

      // 3. Puntuación por experiencia (20 puntos)
      const experienceScore = Math.min(musician.experience * 2, 20);
      matchScore += experienceScore;

      // 4. Puntuación por rating (15 puntos)
      const ratingScore = (musician.rating / 5) * 15;
      matchScore += ratingScore;

      // 5. Puntuación por presupuesto (10 puntos)
      if (criteria.budget) {
        const hourlyCost = musician.hourlyRate * this.parseDuration(event.duration) / 60;
        if (hourlyCost <= criteria.budget) {
          matchScore += 10;
        } else if (hourlyCost <= criteria.budget * 1.2) {
          matchScore += 5; // Puntuación reducida si está dentro del 20% del presupuesto
        }
      }

      // 6. Puntuación por ubicación (si se especifica)
      if (criteria.location && musician.location) {
        const distance = this.calculateDistance(criteria.location, musician.location);
        if (distance <= 10) { // 10 km
          matchScore += 10;
        } else if (distance <= 25) { // 25 km
          matchScore += 5;
        }
      }

      // 7. Puntuación por historial de eventos completados
      if (musician.completedEvents > 0) {
        const completionRate = musician.completedEvents / musician.totalEvents;
        matchScore += completionRate * 10;
      }

      // Limitar la puntuación máxima a 100
      matchScore = Math.min(matchScore, 100);

      results.push({
        userEmail: musician.userEmail,
        name: musician.name,
        lastName: musician.lastName,
        instruments: musician.instruments,
        hasOwnInstruments: musician.hasOwnInstruments,
        experience: musician.experience,
        hourlyRate: musician.hourlyRate,
        location: musician.location,
        isAvailable: musician.isAvailable,
        rating: musician.rating,
        matchScore: Math.round(matchScore),
        availability: {
          isAvailable: true,
          conflicts: [],
        },
      });
    }

    return results;
  }

  /**
   * Convierte la duración de string a minutos
   */
  private static parseDuration(duration: string): number {
    const hours = parseInt(duration.split(':')[0]) || 0;
    const minutes = parseInt(duration.split(':')[1]) || 0;
    return hours * 60 + minutes;
  }

  /**
   * Calcula la distancia entre dos ubicaciones (implementación básica)
   * En producción, usar Google Maps API o similar
   */
  private static calculateDistance(location1: string, location2: string): number {
    // Implementación básica - en producción usar Google Maps API
    // Por ahora retorna una distancia aleatoria para demostración
    return Math.random() * 50; // 0-50 km
  }

  /**
   * Obtiene músicos recomendados para un evento específico
   */
  static async getRecommendedMusicians(eventId: string): Promise<MusicianSearchResult[]> {
    const event = await this.getEventById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    const criteria: MusicianSearchCriteria = {
      instrument: event.instrument,
      budget: parseFloat(event.budget),
      date: event.date,
      time: event.time,
      duration: event.duration,
      eventType: event.eventType,
    };

    return this.searchMusiciansForEvent(event, criteria);
  }

  /**
   * Obtiene un evento por ID
   */
  private static async getEventById(eventId: string): Promise<Event | null> {
    const doc = await db.collection('events').doc(eventId).get();
    if (!doc.exists) return null;
    return doc.data() as Event;
  }
} 