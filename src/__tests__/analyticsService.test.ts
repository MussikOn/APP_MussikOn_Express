import { AnalyticsService } from '../services/analyticsService';
import { db } from '../utils/firebase';
import { Event, User } from '../utils/DataTypes';

// Mock de Firebase
jest.mock('../utils/firebase', () => ({
  db: {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        get: jest.fn(),
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn()
          }))
        }))
      })),
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }))
    }))
  }
}));

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockDb: any;

  beforeEach(() => {
    analyticsService = new AnalyticsService();
    mockDb = db;
    jest.clearAllMocks();
  });

  describe('getEventAnalytics', () => {
    it('should return event analytics with default filters', async () => {
      const mockSnapshot = {
        size: 10,
        docs: [
          {
            data: () => ({
              status: 'completed',
              eventType: 'wedding',
              budget: '1000',
              createdAt: '2024-01-01'
            })
          }
        ]
      };

      (mockDb.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockSnapshot)
        })
      });

      const result = await analyticsService.getEventAnalytics();

      expect(result).toHaveProperty('totalEvents');
      expect(result).toHaveProperty('eventsByStatus');
      expect(result).toHaveProperty('eventsByType');
      expect(result).toHaveProperty('averageBudget');
    });

    it('should apply date filters correctly', async () => {
      const filters = {
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      };

      const mockSnapshot = { size: 5, docs: [] };

      (mockDb.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockSnapshot)
        })
      });

      await analyticsService.getEventAnalytics(filters);

      expect(mockDb.collection).toHaveBeenCalledWith('events');
    });
  });

  describe('getRequestAnalytics', () => {
    it('should return request analytics', async () => {
      const mockSnapshot = {
        size: 15,
        docs: [
          {
            data: () => ({
              status: 'asignada',
              eventType: 'party',
              budget: '500',
              createdAt: '2024-01-01'
            })
          }
        ]
      };

      (mockDb.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockSnapshot)
        })
      });

      const result = await analyticsService.getRequestAnalytics();

      expect(result).toHaveProperty('totalRequests');
      expect(result).toHaveProperty('requestsByStatus');
      expect(result).toHaveProperty('acceptanceRate');
    });
  });

  describe('getUserAnalytics', () => {
    it('should return user analytics', async () => {
      const mockSnapshot = {
        size: 100,
        docs: [
          {
            data: () => ({
              roll: 'musico',
              status: true,
              createdAt: '2024-01-01'
            })
          }
        ]
      };

      (mockDb.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockSnapshot)
        })
      });

      const result = await analyticsService.getUserAnalytics();

      expect(result).toHaveProperty('totalUsers');
      expect(result).toHaveProperty('usersByRole');
      expect(result).toHaveProperty('activeUsers');
    });
  });

  describe('getPlatformAnalytics', () => {
    it('should return platform analytics', async () => {
      const mockEventSnapshot = { size: 50, docs: [] };
      const mockRequestSnapshot = { size: 30, docs: [] };
      const mockUserSnapshot = { size: 200, docs: [] };

      (mockDb.collection as jest.Mock)
        .mockReturnValueOnce({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockEventSnapshot)
          })
        })
        .mockReturnValueOnce({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockRequestSnapshot)
          })
        })
        .mockReturnValueOnce({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockUserSnapshot)
          })
        });

      const result = await analyticsService.getPlatformAnalytics();

      expect(result).toHaveProperty('totalRevenue');
      expect(result).toHaveProperty('userEngagement');
      expect(result).toHaveProperty('performance');
    });
  });

  describe('getTrendsReport', () => {
    it('should return trends report for specified months', async () => {
      const mockSnapshot = { size: 20, docs: [] };

      (mockDb.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue(mockSnapshot)
            })
          })
        })
      });

      const result = await analyticsService.getTrendsReport(6);

      expect(result).toHaveProperty('eventTrends');
      expect(result).toHaveProperty('requestTrends');
      expect(result).toHaveProperty('userTrends');
    });
  });

  describe('getLocationPerformanceReport', () => {
    it('should return location performance report', async () => {
      const mockSnapshot = {
        size: 10,
        docs: [
          {
            data: () => ({
              location: 'Madrid',
              budget: '1000',
              status: 'completed'
            })
          }
        ]
      };

      (mockDb.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockSnapshot)
        })
      });

      const result = await analyticsService.getLocationPerformanceReport();

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('location');
        expect(result[0]).toHaveProperty('totalEvents');
        expect(result[0]).toHaveProperty('totalRevenue');
      }
    });
  });

  describe('getTopActiveUsersReport', () => {
    it('should return top active users report', async () => {
      const mockSnapshot = {
        size: 5,
        docs: [
          {
            data: () => ({
              userEmail: 'test@example.com',
              roll: 'musico',
              status: true
            })
          }
        ]
      };

      (mockDb.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue(mockSnapshot)
            })
          })
        })
      });

      const result = await analyticsService.getTopActiveUsersReport(10);

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('user');
        expect(result[0]).toHaveProperty('eventsCreated');
        expect(result[0]).toHaveProperty('totalRevenue');
      }
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      (mockDb.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      await expect(analyticsService.getEventAnalytics()).rejects.toThrow('Database error');
    });

    it('should handle empty results', async () => {
      const mockSnapshot = { size: 0, docs: [] };

      (mockDb.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockSnapshot)
        })
      });

      const result = await analyticsService.getEventAnalytics();

      expect(result.totalEvents).toBe(0);
      expect(result.averageBudget).toBe(0);
    });
  });
}); 