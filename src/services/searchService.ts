import { db } from '../utils/firebase';
import { Event, User } from '../utils/DataTypes';

// Definir tipo para MusicianRequest ya que no existe en DataTypes
export interface MusicianRequest {
  id: string;
  user: string;
  eventName: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  duration: string;
  instrument: string;
  bringInstrument: boolean;
  comment: string;
  budget: string;
  flyerUrl?: string;
  songs: string[];
  recommendations: string[];
  mapsLink: string;
  status: 'pendiente' | 'asignada' | 'cancelada' | 'completada' | 'no_asignada';
  assignedMusicianId?: string;
  interestedMusicians?: string[];
  createdAt: string;
  updatedAt: string;
  description?: string;
  requirements?: string;
}

export interface SearchFilters {
  query?: string;
  status?: string;
  eventType?: string;
  instrument?: string;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  budget?: {
    min?: number;
    max?: number;
  };
  userRole?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class SearchService {
  /**
   * Búsqueda avanzada de eventos
   */
  async searchEvents(filters: SearchFilters): Promise<SearchResult<Event>> {
    try {
      let query: any = db.collection('events');

      // Aplicar filtros
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      if (filters.eventType) {
        query = query.where('eventType', '==', filters.eventType);
      }

      if (filters.instrument) {
        query = query.where('instrument', '==', filters.instrument);
      }

      if (filters.dateFrom) {
        query = query.where('date', '>=', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.where('date', '<=', filters.dateTo);
      }

      // Aplicar límites y ordenamiento
      const limit = filters.limit || 20;
      query = query.limit(limit);

      if (filters.sortBy) {
        const order = filters.sortOrder === 'asc' ? 'asc' : 'desc';
        query = query.orderBy(filters.sortBy, order);
      }

      const snapshot = await query.get();
      const events = snapshot.docs.map((doc: any) => doc.data() as Event);

      // Filtrado por texto si se especifica
      let filteredEvents = events;
      if (filters.query) {
        const searchTerm = filters.query.toLowerCase();
        filteredEvents = events.filter((event: any) => 
          event.eventName.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm) ||
          event.comment?.toLowerCase().includes(searchTerm)
        );
      }

      // Filtrado por presupuesto si se especifica
      if (filters.budget) {
        filteredEvents = filteredEvents.filter((event: any) => {
          const eventBudget = parseFloat(event.budget || '0');
          const minBudget = filters.budget?.min || 0;
          const maxBudget = filters.budget?.max || Infinity;
          return eventBudget >= minBudget && eventBudget <= maxBudget;
        });
      }

      return {
        data: filteredEvents,
        total: filteredEvents.length,
        page: Math.floor((filters.offset || 0) / limit) + 1,
        limit,
        hasMore: filteredEvents.length === limit
      };
    } catch (error) {
      console.error('Error en búsqueda de eventos:', error);
      throw new Error('Error al buscar eventos');
    }
  }

  /**
   * Búsqueda avanzada de solicitudes de músicos
   */
  async searchMusicianRequests(filters: SearchFilters): Promise<SearchResult<MusicianRequest>> {
    try {
      let query: any = db.collection('musicianRequests');

      // Aplicar filtros
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      if (filters.eventType) {
        query = query.where('eventType', '==', filters.eventType);
      }

      if (filters.instrument) {
        query = query.where('instrument', '==', filters.instrument);
      }

      if (filters.dateFrom) {
        query = query.where('date', '>=', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.where('date', '<=', filters.dateTo);
      }

      // Aplicar límites y ordenamiento
      const limit = filters.limit || 20;
      query = query.limit(limit);

      if (filters.sortBy) {
        const order = filters.sortOrder === 'asc' ? 'asc' : 'desc';
        query = query.orderBy(filters.sortBy, order);
      }

      const snapshot = await query.get();
      const requests = snapshot.docs.map((doc: any) => doc.data() as MusicianRequest);

      // Filtrado por texto si se especifica
      let filteredRequests = requests;
      if (filters.query) {
        const searchTerm = filters.query.toLowerCase();
        filteredRequests = requests.filter((request: any) => 
          request.description?.toLowerCase().includes(searchTerm) ||
          request.location.toLowerCase().includes(searchTerm) ||
          request.requirements?.toLowerCase().includes(searchTerm)
        );
      }

      // Filtrado por presupuesto si se especifica
      if (filters.budget) {
        filteredRequests = filteredRequests.filter((request: any) => {
          const requestBudget = request.budget || 0;
          const minBudget = filters.budget?.min || 0;
          const maxBudget = filters.budget?.max || Infinity;
          return requestBudget >= minBudget && requestBudget <= maxBudget;
        });
      }

      return {
        data: filteredRequests,
        total: filteredRequests.length,
        page: Math.floor((filters.offset || 0) / limit) + 1,
        limit,
        hasMore: filteredRequests.length === limit
      };
    } catch (error) {
      console.error('Error en búsqueda de solicitudes:', error);
      throw new Error('Error al buscar solicitudes de músicos');
    }
  }

  /**
   * Búsqueda avanzada de usuarios
   */
  async searchUsers(filters: SearchFilters): Promise<SearchResult<User>> {
    try {
      let query: any = db.collection('users');

      // Aplicar filtros
      if (filters.userRole) {
        query = query.where('roll', '==', filters.userRole);
      }

      // Aplicar límites y ordenamiento
      const limit = filters.limit || 20;
      query = query.limit(limit);

      if (filters.sortBy) {
        const order = filters.sortOrder === 'asc' ? 'asc' : 'desc';
        query = query.orderBy(filters.sortBy, order);
      }

      const snapshot = await query.get();
      const users = snapshot.docs.map((doc: any) => doc.data() as User);

      // Filtrado por texto si se especifica
      let filteredUsers = users;
      if (filters.query) {
        const searchTerm = filters.query.toLowerCase();
        filteredUsers = users.filter((user: any) => 
          user.name.toLowerCase().includes(searchTerm) ||
          user.lastName.toLowerCase().includes(searchTerm) ||
          user.userEmail.toLowerCase().includes(searchTerm)
        );
      }

      return {
        data: filteredUsers,
        total: filteredUsers.length,
        page: Math.floor((filters.offset || 0) / limit) + 1,
        limit,
        hasMore: filteredUsers.length === limit
      };
    } catch (error) {
      console.error('Error en búsqueda de usuarios:', error);
      throw new Error('Error al buscar usuarios');
    }
  }

  /**
   * Búsqueda global en todas las colecciones
   */
  async globalSearch(filters: SearchFilters): Promise<{
    events: Event[];
    requests: MusicianRequest[];
    users: User[];
  }> {
    try {
      const [eventsResult, requestsResult, usersResult] = await Promise.all([
        this.searchEvents(filters),
        this.searchMusicianRequests(filters),
        this.searchUsers(filters)
      ]);

      return {
        events: eventsResult.data,
        requests: requestsResult.data,
        users: usersResult.data
      };
    } catch (error) {
      console.error('Error en búsqueda global:', error);
      throw new Error('Error al realizar búsqueda global');
    }
  }

  /**
   * Búsqueda por proximidad geográfica
   */
  async searchByLocation(location: string, radius: number = 50): Promise<{
    events: Event[];
    requests: MusicianRequest[];
  }> {
    try {
      // Implementación básica - en producción usar servicios de geolocalización
      const eventsResult = await this.searchEvents({ location });
      const requestsResult = await this.searchMusicianRequests({ location });

      return {
        events: eventsResult.data,
        requests: requestsResult.data
      };
    } catch (error) {
      console.error('Error en búsqueda por ubicación:', error);
      throw new Error('Error al buscar por ubicación');
    }
  }

  /**
   * Búsqueda de eventos disponibles para músicos
   */
  async searchAvailableEventsForMusician(musicianId: string, filters: SearchFilters): Promise<SearchResult<Event>> {
    try {
      const availableFilters = {
        ...filters,
        status: 'pending_musician'
      };

      const result = await this.searchEvents(availableFilters);
      
      // Filtrar eventos donde el músico no esté ya asignado o interesado
      const filteredEvents = result.data.filter(event => 
        event.assignedMusicianId !== musicianId &&
        !event.interestedMusicians?.includes(musicianId)
      );

      return {
        ...result,
        data: filteredEvents,
        total: filteredEvents.length
      };
    } catch (error) {
      console.error('Error en búsqueda de eventos disponibles:', error);
      throw new Error('Error al buscar eventos disponibles');
    }
  }

  /**
   * Búsqueda de músicos disponibles para un evento
   */
  async searchAvailableMusiciansForEvent(eventId: string, filters: SearchFilters): Promise<SearchResult<User>> {
    try {
      const musicianFilters = {
        ...filters,
        userRole: 'musico'
      };

      const result = await this.searchUsers(musicianFilters);
      
      // Aquí se podría implementar lógica adicional para filtrar músicos
      // que estén disponibles en la fecha del evento, tengan el instrumento requerido, etc.

      return result;
    } catch (error) {
      console.error('Error en búsqueda de músicos disponibles:', error);
      throw new Error('Error al buscar músicos disponibles');
    }
  }
}

export const searchService = new SearchService(); 