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
exports.analyticsService = exports.AnalyticsService = void 0;
const firebase_1 = require("../utils/firebase");
class AnalyticsService {
    /**
     * Analytics de eventos
     */
    getEventAnalytics() {
        return __awaiter(this, arguments, void 0, function* (filters = {}) {
            try {
                let query = firebase_1.db.collection('events');
                if (filters.dateFrom) {
                    query = query.where('createdAt', '>=', filters.dateFrom);
                }
                if (filters.dateTo) {
                    query = query.where('createdAt', '<=', filters.dateTo);
                }
                const snapshot = yield query.get();
                const events = snapshot.docs.map((doc) => doc.data());
                const eventsByStatus = {};
                const eventsByType = {};
                const eventsByMonth = {};
                let totalBudget = 0;
                let completedEvents = 0;
                let cancelledEvents = 0;
                events.forEach((event) => {
                    // Contar por estado
                    eventsByStatus[event.status] = (eventsByStatus[event.status] || 0) + 1;
                    // Contar por tipo
                    eventsByType[event.eventType] =
                        (eventsByType[event.eventType] || 0) + 1;
                    // Contar por mes - Validar fecha antes de convertir
                    let month;
                    try {
                        const createdAt = event.createdAt
                            ? new Date(event.createdAt)
                            : new Date();
                        if (isNaN(createdAt.getTime())) {
                            console.info('./src/services/analyticsService.ts line 126');
                            console.warn('Fecha inválida en event:', event.id, event.createdAt);
                            month = new Date().toISOString().substring(0, 7);
                        }
                        else {
                            month = createdAt.toISOString().substring(0, 7);
                        }
                    }
                    catch (error) {
                        console.info('./src/services/analyticsService.ts line 133');
                        console.warn('Error al procesar fecha de event:', event.id, error);
                        month = new Date().toISOString().substring(0, 7);
                    }
                    eventsByMonth[month] = (eventsByMonth[month] || 0) + 1;
                    // Calcular presupuesto
                    totalBudget += event.budget || 0;
                    // Contar eventos completados
                    if (event.status === 'completado')
                        completedEvents++;
                    // Contar eventos cancelados
                    if (event.status === 'cancelado')
                        cancelledEvents++;
                });
                const averageBudget = events.length > 0 ? totalBudget / events.length : 0;
                const completionRate = events.length > 0 ? (completedEvents / events.length) * 100 : 0;
                const cancellationRate = events.length > 0 ? (cancelledEvents / events.length) * 100 : 0;
                return {
                    totalEvents: events.length,
                    eventsByStatus,
                    eventsByType,
                    eventsByMonth,
                    averageBudget,
                    totalBudget,
                    completionRate,
                    cancellationRate,
                };
            }
            catch (error) {
                console.error('Error al obtener analytics de eventos:', error);
                throw new Error('Error al obtener analytics de eventos');
            }
        });
    }
    /**
     * Analytics de solicitudes de músicos
     */
    getRequestAnalytics() {
        return __awaiter(this, arguments, void 0, function* (filters = {}) {
            try {
                let query = firebase_1.db.collection('musicianRequests');
                if (filters.dateFrom) {
                    query = query.where('createdAt', '>=', filters.dateFrom);
                }
                if (filters.dateTo) {
                    query = query.where('createdAt', '<=', filters.dateTo);
                }
                const snapshot = yield query.get();
                const requests = snapshot.docs.map((doc) => doc.data());
                const requestsByStatus = {};
                const requestsByType = {};
                const requestsByMonth = {};
                let totalBudget = 0;
                let acceptedRequests = 0;
                let totalResponseTime = 0;
                let responseTimeCount = 0;
                requests.forEach((request) => {
                    // Contar por estado
                    requestsByStatus[request.status] =
                        (requestsByStatus[request.status] || 0) + 1;
                    // Contar por tipo
                    requestsByType[request.eventType] =
                        (requestsByType[request.eventType] || 0) + 1;
                    // Contar por mes - Validar fecha antes de convertir
                    let month;
                    try {
                        const createdAt = request.createdAt
                            ? new Date(request.createdAt)
                            : new Date();
                        if (isNaN(createdAt.getTime())) {
                            console.info('./src/services/analyticsService.ts line 208');
                            console.warn('Fecha inválida en request:', request.id, request.createdAt);
                            month = new Date().toISOString().substring(0, 7);
                        }
                        else {
                            month = createdAt.toISOString().substring(0, 7);
                        }
                    }
                    catch (error) {
                        console.info('./src/services/analyticsService.ts line 215');
                        console.warn('Error al procesar fecha de request:', request.id, error);
                        month = new Date().toISOString().substring(0, 7);
                    }
                    requestsByMonth[month] = (requestsByMonth[month] || 0) + 1;
                    // Calcular presupuesto
                    totalBudget += request.budget || 0;
                    // Contar solicitudes aceptadas
                    if (request.status === 'asignada')
                        acceptedRequests++;
                    // Calcular tiempo de respuesta - Validar fechas
                    if (request.assignedMusicianId && request.updatedAt) {
                        try {
                            const created = request.createdAt
                                ? new Date(request.createdAt)
                                : new Date();
                            const updated = new Date(request.updatedAt);
                            if (!isNaN(created.getTime()) && !isNaN(updated.getTime())) {
                                totalResponseTime += updated.getTime() - created.getTime();
                                responseTimeCount++;
                            }
                        }
                        catch (error) {
                            console.info('./src/services/analyticsService.ts line 239');
                            console.warn('Error al calcular tiempo de respuesta:', request.id, error);
                        }
                    }
                });
                const averageBudget = requests.length > 0 ? totalBudget / requests.length : 0;
                const acceptanceRate = requests.length > 0 ? (acceptedRequests / requests.length) * 100 : 0;
                const averageResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
                return {
                    totalRequests: requests.length,
                    requestsByStatus,
                    requestsByType,
                    requestsByMonth,
                    averageBudget,
                    totalBudget,
                    acceptanceRate,
                    averageResponseTime,
                };
            }
            catch (error) {
                console.error('Error al obtener analytics de solicitudes:', error);
                throw new Error('Error al obtener analytics de solicitudes');
            }
        });
    }
    /**
     * Analytics de usuarios
     */
    getUserAnalytics() {
        return __awaiter(this, arguments, void 0, function* (filters = {}) {
            try {
                let query = firebase_1.db.collection('users');
                if (filters.userRole) {
                    query = query.where('roll', '==', filters.userRole);
                }
                const snapshot = yield query.get();
                const users = snapshot.docs.map((doc) => doc.data());
                const usersByRole = {};
                const usersByMonth = {};
                let activeUsers = 0;
                let newUsersThisMonth = 0;
                const currentMonth = new Date().toISOString().substring(0, 7);
                const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .substring(0, 7);
                users.forEach((user) => {
                    // Contar por rol
                    usersByRole[user.roll] = (usersByRole[user.roll] || 0) + 1;
                    // Contar por mes - Validar fecha antes de convertir
                    let month;
                    try {
                        const createAt = user.create_at
                            ? new Date(user.create_at)
                            : new Date();
                        if (isNaN(createAt.getTime())) {
                            console.info('./src/services/analyticsService.ts line 296');
                            console.warn('Fecha inválida en user:', user.id, user.create_at);
                            month = new Date().toISOString().substring(0, 7);
                        }
                        else {
                            month = createAt.toISOString().substring(0, 7);
                        }
                    }
                    catch (error) {
                        console.info('./src/services/analyticsService.ts line 303');
                        console.warn('Error al procesar fecha de user:', user.id, error);
                        month = new Date().toISOString().substring(0, 7);
                    }
                    usersByMonth[month] = (usersByMonth[month] || 0) + 1;
                    // Contar usuarios activos (creados en el último mes)
                    if (month >= lastMonth)
                        activeUsers++;
                    // Contar nuevos usuarios este mes
                    if (month === currentMonth)
                        newUsersThisMonth++;
                });
                // Calcular tasa de crecimiento
                const previousMonthUsers = usersByMonth[lastMonth] || 0;
                const currentMonthUsers = usersByMonth[currentMonth] || 0;
                const userGrowthRate = previousMonthUsers > 0
                    ? ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) *
                        100
                    : 0;
                return {
                    totalUsers: users.length,
                    usersByRole,
                    usersByMonth,
                    activeUsers,
                    newUsersThisMonth,
                    userGrowthRate,
                };
            }
            catch (error) {
                console.error('Error al obtener analytics de usuarios:', error);
                throw new Error('Error al obtener analytics de usuarios');
            }
        });
    }
    /**
     * Analytics de la plataforma completa
     */
    getPlatformAnalytics() {
        return __awaiter(this, arguments, void 0, function* (filters = {}) {
            try {
                const [eventAnalytics, requestAnalytics, userAnalytics] = yield Promise.all([
                    this.getEventAnalytics(filters),
                    this.getRequestAnalytics(filters),
                    this.getUserAnalytics(filters),
                ]);
                // Calcular ingresos totales (simulado)
                const totalRevenue = eventAnalytics.totalBudget * 0.1; // 10% de comisión
                const averageEventValue = eventAnalytics.totalEvents > 0
                    ? eventAnalytics.totalBudget / eventAnalytics.totalEvents
                    : 0;
                // Top tipos de eventos
                const topEventTypes = Object.entries(eventAnalytics.eventsByType)
                    .map(([type, count]) => ({
                    type,
                    count,
                    revenue: count * averageEventValue,
                }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
                // Top ubicaciones (simulado)
                const topLocations = [
                    { location: 'Santo Domingo', count: 150, revenue: 15000 },
                    { location: 'Santiago', count: 120, revenue: 12000 },
                    { location: 'La Romana', count: 80, revenue: 8000 },
                    { location: 'Puerto Plata', count: 60, revenue: 6000 },
                    { location: 'San Pedro de Macorís', count: 40, revenue: 4000 },
                ];
                // Métricas de engagement
                const eventsPerUser = userAnalytics.totalUsers > 0
                    ? eventAnalytics.totalEvents / userAnalytics.totalUsers
                    : 0;
                const requestsPerUser = userAnalytics.totalUsers > 0
                    ? requestAnalytics.totalRequests / userAnalytics.totalUsers
                    : 0;
                // Métricas de performance (simuladas)
                const performance = {
                    averageResponseTime: requestAnalytics.averageResponseTime,
                    successRate: 95.5, // Simulado
                    errorRate: 4.5, // Simulado
                };
                return {
                    totalRevenue,
                    averageEventValue,
                    topEventTypes,
                    topLocations,
                    userEngagement: {
                        eventsPerUser,
                        requestsPerUser,
                        averageSessionDuration: 25.5, // Simulado en minutos
                    },
                    performance,
                };
            }
            catch (error) {
                console.error('Error al obtener analytics de plataforma:', error);
                throw new Error('Error al obtener analytics de plataforma');
            }
        });
    }
    /**
     * Reporte de tendencias
     */
    getTrendsReport() {
        return __awaiter(this, arguments, void 0, function* (months = 6) {
            try {
                const trends = {
                    eventTrends: [],
                    requestTrends: [],
                    userTrends: [],
                };
                // Generar datos de tendencias para los últimos meses
                for (let i = months - 1; i >= 0; i--) {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const month = date.toISOString().substring(0, 7);
                    // Simular datos de tendencias
                    const eventCount = Math.floor(Math.random() * 50) + 20;
                    const eventRevenue = eventCount * (Math.random() * 500 + 200);
                    const requestCount = Math.floor(Math.random() * 30) + 10;
                    const acceptanceRate = Math.random() * 30 + 60;
                    const newUsers = Math.floor(Math.random() * 20) + 5;
                    const activeUsers = Math.floor(Math.random() * 100) + 50;
                    trends.eventTrends.push({
                        month,
                        count: eventCount,
                        revenue: eventRevenue,
                    });
                    trends.requestTrends.push({
                        month,
                        count: requestCount,
                        acceptanceRate,
                    });
                    trends.userTrends.push({
                        month,
                        newUsers,
                        activeUsers,
                    });
                }
                return trends;
            }
            catch (error) {
                console.info('./src/services/analyticsService.ts line 459');
                console.error('Error al obtener reporte de tendencias:', error);
                throw new Error('Error al obtener reporte de tendencias');
            }
        });
    }
    /**
     * Reporte de rendimiento por ubicación
     */
    getLocationPerformanceReport() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Simular datos de rendimiento por ubicación
                const locations = [
                    'Santo Domingo',
                    'Santiago',
                    'La Romana',
                    'Puerto Plata',
                    'San Pedro de Macorís',
                    'Higüey',
                    'San Francisco de Macorís',
                    'La Vega',
                    'Moca',
                    'Bonao',
                ];
                return locations.map(location => ({
                    location,
                    totalEvents: Math.floor(Math.random() * 100) + 20,
                    totalRequests: Math.floor(Math.random() * 60) + 10,
                    totalRevenue: Math.floor(Math.random() * 20000) + 5000,
                    averageEventValue: Math.floor(Math.random() * 500) + 200,
                    completionRate: Math.random() * 30 + 70,
                    acceptanceRate: Math.random() * 40 + 50,
                }));
            }
            catch (error) {
                console.info('./src/services/analyticsService.ts line 502');
                console.error('Error al obtener reporte de rendimiento por ubicación:', error);
                throw new Error('Error al obtener reporte de rendimiento por ubicación');
            }
        });
    }
    /**
     * Reporte de usuarios más activos
     */
    getTopActiveUsersReport() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            try {
                // Obtener usuarios
                const usersSnapshot = yield firebase_1.db.collection('users').limit(limit).get();
                const users = usersSnapshot.docs.map(doc => doc.data());
                // Simular datos de actividad
                return users
                    .map(user => ({
                    user,
                    eventsCreated: Math.floor(Math.random() * 20) + 1,
                    requestsCreated: Math.floor(Math.random() * 15) + 1,
                    eventsCompleted: Math.floor(Math.random() * 15) + 1,
                    requestsAccepted: Math.floor(Math.random() * 10) + 1,
                    totalRevenue: Math.floor(Math.random() * 5000) + 500,
                }))
                    .sort((a, b) => b.totalRevenue - a.totalRevenue);
            }
            catch (error) {
                console.info('./src/services/analyticsService.ts line 534');
                console.error('Error al obtener reporte de usuarios más activos:', error);
                throw new Error('Error al obtener reporte de usuarios más activos');
            }
        });
    }
}
exports.AnalyticsService = AnalyticsService;
exports.analyticsService = new AnalyticsService();
