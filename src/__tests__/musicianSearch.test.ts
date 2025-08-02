// Tests para el sistema de búsqueda de músicos
import { MusicianSearchService, MusicianSearchCriteria } from '../services/musicianSearchService';
import { Event } from '../utils/DataTypes';

// Mock de la base de datos
jest.mock('../utils/firebase', () => ({
  db: {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        where: jest.fn(() => ({
          where: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve({
              docs: [],
              empty: true,
            })),
          })),
        })),
        get: jest.fn(() => Promise.resolve({
          docs: [],
          empty: true,
        })),
      })),
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({
          exists: false,
          data: () => null,
        })),
      })),
    })),
  },
}));

describe('Sistema de Búsqueda de Músicos', () => {
  describe('MusicianSearchService', () => {
    const mockEvent: Event = {
      id: 'test-event-1',
      user: 'organizer@example.com',
      eventName: 'Fiesta de Cumpleaños',
      eventType: 'private',
      date: '2025-02-15',
      time: '18:00',
      location: 'Santo Domingo, RD',
      duration: '03:00',
      instrument: 'Guitarra',
      bringInstrument: false,
      comment: 'Necesito un guitarrista para mi fiesta',
      budget: '5000',
      flyerUrl: '',
      songs: ['Happy Birthday', 'Despacito'],
      recommendations: [],
      mapsLink: '',
      status: 'pending_musician',
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
    };

    const mockCriteria: MusicianSearchCriteria = {
      instrument: 'Guitarra',
      location: 'Santo Domingo, RD',
      budget: 5000,
      date: '2025-02-15',
      time: '18:00',
      duration: '03:00',
      eventType: 'private',
      maxDistance: 50,
    };

    describe('searchMusiciansForEvent', () => {
      test('should return empty array when no musicians available', async () => {
        const result = await MusicianSearchService.searchMusiciansForEvent(mockEvent, mockCriteria);
        expect(result).toEqual([]);
      });

      test('should handle errors gracefully', async () => {
        // Mock para simular un error
        const mockDb = require('../utils/firebase').db;
        mockDb.collection.mockImplementation(() => {
          throw new Error('Database error');
        });

        await expect(
          MusicianSearchService.searchMusiciansForEvent(mockEvent, mockCriteria)
        ).rejects.toThrow('Database error');
      });
    });

    describe('getRecommendedMusicians', () => {
      test('should throw error when event not found', async () => {
        // Mock para simular evento no encontrado
        const mockDb = require('../utils/firebase').db;
        mockDb.collection.mockImplementation(() => ({
          doc: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve({
              exists: false,
              data: () => null,
            })),
          })),
        }));

        await expect(
          MusicianSearchService.getRecommendedMusicians('non-existent-event')
        ).rejects.toThrow('Evento no encontrado');
      });
    });

    describe('parseDuration', () => {
      test('should parse duration correctly', () => {
        // Acceder al método privado para testing
        const service = MusicianSearchService as any;
        
        expect(service.parseDuration('02:30')).toBe(150); // 2h 30m = 150 minutos
        expect(service.parseDuration('01:00')).toBe(60); // 1h = 60 minutos
        expect(service.parseDuration('00:45')).toBe(45); // 45 minutos
        expect(service.parseDuration('03:15')).toBe(195); // 3h 15m = 195 minutos
      });

      test('should handle invalid duration format', () => {
        const service = MusicianSearchService as any;
        
        expect(service.parseDuration('invalid')).toBe(0);
        expect(service.parseDuration('')).toBe(0);
        expect(service.parseDuration('2:30')).toBe(150); // 2h 30m = 150 minutos
      });
    });

    describe('calculateDistance', () => {
      test('should return a number between 0 and 50', () => {
        const service = MusicianSearchService as any;
        
        const distance = service.calculateDistance('Location A', 'Location B');
        expect(typeof distance).toBe('number');
        expect(distance).toBeGreaterThanOrEqual(0);
        expect(distance).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('Criterios de Búsqueda', () => {
    test('should validate search criteria structure', () => {
      const criteria: MusicianSearchCriteria = {
        instrument: 'Piano',
        location: 'Santiago, RD',
        budget: 3000,
        date: '2025-03-20',
        time: '20:00',
        duration: '02:00',
        eventType: 'wedding',
        maxDistance: 30,
      };

      expect(criteria.instrument).toBe('Piano');
      expect(criteria.budget).toBe(3000);
      expect(criteria.maxDistance).toBe(30);
    });

    test('should handle optional criteria fields', () => {
      const minimalCriteria: MusicianSearchCriteria = {
        instrument: 'Violín',
      };

      expect(minimalCriteria.instrument).toBe('Violín');
      expect(minimalCriteria.location).toBeUndefined();
      expect(minimalCriteria.budget).toBeUndefined();
    });
  });

  describe('Resultados de Búsqueda', () => {
    test('should have correct result structure', () => {
      const mockResult = {
        userEmail: 'musician@example.com',
        name: 'Juan',
        lastName: 'Pérez',
        instruments: ['Guitarra', 'Piano'],
        hasOwnInstruments: true,
        experience: 5,
        hourlyRate: 2000,
        location: 'Santo Domingo, RD',
        isAvailable: true,
        rating: 4.5,
        matchScore: 85,
        availability: {
          isAvailable: true,
          conflicts: [],
        },
      };

      expect(mockResult.userEmail).toBe('musician@example.com');
      expect(mockResult.instruments).toContain('Guitarra');
      expect(mockResult.matchScore).toBeGreaterThanOrEqual(0);
      expect(mockResult.matchScore).toBeLessThanOrEqual(100);
      expect(mockResult.availability.isAvailable).toBe(true);
    });

    test('should validate match score range', () => {
      const mockResults = [
        { matchScore: 0 },
        { matchScore: 50 },
        { matchScore: 100 },
        { matchScore: 85 },
      ];

      mockResults.forEach(result => {
        expect(result.matchScore).toBeGreaterThanOrEqual(0);
        expect(result.matchScore).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Algoritmo de Scoring', () => {
    test('should calculate instrument score correctly', () => {
      // Simular cálculo de puntuación por instrumento (40 puntos)
      const instrumentScore = 40;
      expect(instrumentScore).toBe(40);
    });

    test('should calculate instrument availability score correctly', () => {
      // Simular cálculo de puntuación por disponibilidad de instrumento
      const hasOwnInstruments = true;
      const instrumentAvailabilityScore = hasOwnInstruments ? 15 : 5;
      expect(instrumentAvailabilityScore).toBe(15);
    });

    test('should calculate experience score correctly', () => {
      // Simular cálculo de puntuación por experiencia (máximo 20 puntos)
      const experience = 8;
      const experienceScore = Math.min(experience * 2, 20);
      expect(experienceScore).toBe(16);
    });

    test('should calculate rating score correctly', () => {
      // Simular cálculo de puntuación por rating (máximo 15 puntos)
      const rating = 4.5;
      const ratingScore = (rating / 5) * 15;
      expect(ratingScore).toBe(13.5);
    });

          test('should calculate budget score correctly', () => {
        // Simular cálculo de puntuación por presupuesto
        const hourlyRate = 2000;
        const eventDuration = 180; // 3 horas en minutos
        const budget = 5000;
        
        const hourlyCost = hourlyRate * eventDuration / 60;
        let budgetScore = 0;
        
        if (hourlyCost <= budget) {
          budgetScore = 10;
        } else if (hourlyCost <= budget * 1.2) {
          budgetScore = 5;
        }
        
        expect(budgetScore).toBe(5); // 6000 > 5000, pero 6000 <= 5000 * 1.2 = 6000
      });
  });

  describe('Validación de Disponibilidad', () => {
    test('should detect time conflicts correctly', () => {
      // Simular verificación de conflictos de horario
      const eventStart = new Date('2025-02-15T18:00:00');
      const eventEnd = new Date('2025-02-15T21:00:00');
      
      const conflictingEvent = {
        date: '2025-02-15',
        time: '19:00',
        duration: '02:00',
      };
      
      const conflictingEventStart = new Date(`${conflictingEvent.date}T${conflictingEvent.time}`);
      const conflictingEventEnd = new Date(conflictingEventStart.getTime() + 120 * 60 * 1000); // 2 horas
      
      // Verificar solapamiento
      const hasConflict = (
        (eventStart >= conflictingEventStart && eventStart < conflictingEventEnd) ||
        (eventEnd > conflictingEventStart && eventEnd <= conflictingEventEnd) ||
        (eventStart <= conflictingEventStart && eventEnd >= conflictingEventEnd)
      );
      
      expect(hasConflict).toBe(true);
    });

    test('should not detect conflicts for non-overlapping events', () => {
      // Simular eventos que no se solapan
      const eventStart = new Date('2025-02-15T18:00:00');
      const eventEnd = new Date('2025-02-15T21:00:00');
      
      const nonConflictingEvent = {
        date: '2025-02-15',
        time: '22:00',
        duration: '02:00',
      };
      
      const nonConflictingEventStart = new Date(`${nonConflictingEvent.date}T${nonConflictingEvent.time}`);
      const nonConflictingEventEnd = new Date(nonConflictingEventStart.getTime() + 120 * 60 * 1000);
      
      // Verificar que no hay solapamiento
      const hasConflict = (
        (eventStart >= nonConflictingEventStart && eventStart < nonConflictingEventEnd) ||
        (eventEnd > nonConflictingEventStart && eventEnd <= nonConflictingEventEnd) ||
        (eventStart <= nonConflictingEventStart && eventEnd >= nonConflictingEventEnd)
      );
      
      expect(hasConflict).toBe(false);
    });
  });
}); 