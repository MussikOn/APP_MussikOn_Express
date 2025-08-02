"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const analyticsService_1 = require("../services/analyticsService");
const firebase_1 = require("../utils/firebase");
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
    let analyticsService;
    let mockDb;
    beforeEach(() => {
        analyticsService = new analyticsService_1.AnalyticsService();
        mockDb = firebase_1.db;
        jest.clearAllMocks();
    });
    describe('getEventAnalytics', () => {
        it('should return event analytics with default filters', () => __awaiter(void 0, void 0, void 0, function* () {
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
            mockDb.collection.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue(mockSnapshot)
                })
            });
            const result = yield analyticsService.getEventAnalytics();
            expect(result).toHaveProperty('totalEvents');
            expect(result).toHaveProperty('eventsByStatus');
            expect(result).toHaveProperty('eventsByType');
            expect(result).toHaveProperty('averageBudget');
        }));
        it('should apply date filters correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const filters = {
                dateFrom: '2024-01-01',
                dateTo: '2024-12-31'
            };
            const mockSnapshot = { size: 5, docs: [] };
            mockDb.collection.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue(mockSnapshot)
                })
            });
            yield analyticsService.getEventAnalytics(filters);
            expect(mockDb.collection).toHaveBeenCalledWith('events');
        }));
    });
    describe('getRequestAnalytics', () => {
        it('should return request analytics', () => __awaiter(void 0, void 0, void 0, function* () {
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
            mockDb.collection.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue(mockSnapshot)
                })
            });
            const result = yield analyticsService.getRequestAnalytics();
            expect(result).toHaveProperty('totalRequests');
            expect(result).toHaveProperty('requestsByStatus');
            expect(result).toHaveProperty('acceptanceRate');
        }));
    });
    describe('getUserAnalytics', () => {
        it('should return user analytics', () => __awaiter(void 0, void 0, void 0, function* () {
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
            mockDb.collection.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue(mockSnapshot)
                })
            });
            const result = yield analyticsService.getUserAnalytics();
            expect(result).toHaveProperty('totalUsers');
            expect(result).toHaveProperty('usersByRole');
            expect(result).toHaveProperty('activeUsers');
        }));
    });
    describe('getPlatformAnalytics', () => {
        it('should return platform analytics', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEventSnapshot = { size: 50, docs: [] };
            const mockRequestSnapshot = { size: 30, docs: [] };
            const mockUserSnapshot = { size: 200, docs: [] };
            mockDb.collection
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
            const result = yield analyticsService.getPlatformAnalytics();
            expect(result).toHaveProperty('totalRevenue');
            expect(result).toHaveProperty('userEngagement');
            expect(result).toHaveProperty('performance');
        }));
    });
    describe('getTrendsReport', () => {
        it('should return trends report for specified months', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSnapshot = { size: 20, docs: [] };
            mockDb.collection.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    orderBy: jest.fn().mockReturnValue({
                        limit: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue(mockSnapshot)
                        })
                    })
                })
            });
            const result = yield analyticsService.getTrendsReport(6);
            expect(result).toHaveProperty('eventTrends');
            expect(result).toHaveProperty('requestTrends');
            expect(result).toHaveProperty('userTrends');
        }));
    });
    describe('getLocationPerformanceReport', () => {
        it('should return location performance report', () => __awaiter(void 0, void 0, void 0, function* () {
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
            mockDb.collection.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue(mockSnapshot)
                })
            });
            const result = yield analyticsService.getLocationPerformanceReport();
            expect(Array.isArray(result)).toBe(true);
            if (result.length > 0) {
                expect(result[0]).toHaveProperty('location');
                expect(result[0]).toHaveProperty('totalEvents');
                expect(result[0]).toHaveProperty('totalRevenue');
            }
        }));
    });
    describe('getTopActiveUsersReport', () => {
        it('should return top active users report', () => __awaiter(void 0, void 0, void 0, function* () {
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
            mockDb.collection.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    orderBy: jest.fn().mockReturnValue({
                        limit: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue(mockSnapshot)
                        })
                    })
                })
            });
            const result = yield analyticsService.getTopActiveUsersReport(10);
            expect(Array.isArray(result)).toBe(true);
            if (result.length > 0) {
                expect(result[0]).toHaveProperty('user');
                expect(result[0]).toHaveProperty('eventsCreated');
                expect(result[0]).toHaveProperty('totalRevenue');
            }
        }));
    });
    describe('Error handling', () => {
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockDb.collection.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    get: jest.fn().mockRejectedValue(new Error('Database error'))
                })
            });
            yield expect(analyticsService.getEventAnalytics()).rejects.toThrow('Database error');
        }));
        it('should handle empty results', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSnapshot = { size: 0, docs: [] };
            mockDb.collection.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue(mockSnapshot)
                })
            });
            const result = yield analyticsService.getEventAnalytics();
            expect(result.totalEvents).toBe(0);
            expect(result.averageBudget).toBe(0);
        }));
    });
});
