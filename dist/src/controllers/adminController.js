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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGetMobilePaymentStats = exports.adminRejectMobilePayment = exports.adminVerifyMobilePayment = exports.adminGetMobilePayments = exports.adminExportReport = exports.adminRequestAnalytics = exports.adminEventAnalytics = exports.adminUserAnalytics = exports.adminDashboardAnalytics = exports.adminGlobalSearch = void 0;
exports.adminUsersGetAll = adminUsersGetAll;
exports.adminUsersGetById = adminUsersGetById;
exports.adminUsersCreate = adminUsersCreate;
exports.adminUsersUpdate = adminUsersUpdate;
exports.adminUsersRemove = adminUsersRemove;
exports.adminUsersStats = adminUsersStats;
exports.adminEventsGetAll = adminEventsGetAll;
exports.adminEventsGetById = adminEventsGetById;
exports.adminEventsCreate = adminEventsCreate;
exports.adminEventsUpdate = adminEventsUpdate;
exports.adminEventsRemove = adminEventsRemove;
exports.adminMusiciansGetAll = adminMusiciansGetAll;
exports.adminMusiciansGetById = adminMusiciansGetById;
exports.adminMusiciansUpdate = adminMusiciansUpdate;
exports.adminMusiciansRemove = adminMusiciansRemove;
exports.adminImagesGetAll = adminImagesGetAll;
exports.adminImagesGetById = adminImagesGetById;
exports.adminImagesRemove = adminImagesRemove;
exports.adminMusicianRequestsGetAll = adminMusicianRequestsGetAll;
exports.adminMusicianRequestsCreate = adminMusicianRequestsCreate;
exports.adminMusicianRequestsGetById = adminMusicianRequestsGetById;
exports.adminMusicianRequestsUpdate = adminMusicianRequestsUpdate;
exports.adminMusicianRequestsRemove = adminMusicianRequestsRemove;
exports.adminMusicianRequestsStats = adminMusicianRequestsStats;
exports.adminEventsStats = adminEventsStats;
exports.adminImagesStats = adminImagesStats;
exports.adminPaymentsStats = adminPaymentsStats;
exports.adminChatStats = adminChatStats;
exports.adminSystemStats = adminSystemStats;
const bcrypt_1 = __importDefault(require("bcrypt"));
const firebase_1 = require("../utils/firebase");
const errorHandler_1 = require("../middleware/errorHandler");
const errorHandler_2 = require("../middleware/errorHandler");
const loggerService_1 = require("../services/loggerService");
// --- Usuarios ---
function adminUsersGetAll(req, res, next) {
    firebase_1.db.collection('users')
        .get()
        .then(snapshot => {
        let users = [];
        snapshot.forEach(doc => users.push(Object.assign({ _id: doc.id }, doc.data())));
        // Aplicar filtros
        const { status, roll, search, email } = req.query;
        if (status) {
            users = users.filter(user => user.status === status);
        }
        if (roll) {
            users = users.filter(user => user.roll === roll);
        }
        if (search) {
            users = users.filter(user => {
                var _a, _b, _c;
                return ((_a = user.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toString().toLowerCase())) ||
                    ((_b = user.lastName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toString().toLowerCase())) ||
                    ((_c = user.userEmail) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toString().toLowerCase()));
            });
        }
        if (email) {
            users = users.filter(user => user.userEmail === email);
        }
        // Obtener parámetros de paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const total = users.length;
        const totalPages = Math.ceil(total / limit);
        // Aplicar paginación
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = users.slice(startIndex, endIndex);
        res.status(200).json({
            users: paginatedUsers,
            total,
            page,
            limit,
            totalPages,
        });
    })
        .catch(next);
}
function adminUsersGetById(req, res, next) {
    firebase_1.db.collection('users')
        .doc(req.params.id)
        .get()
        .then(doc => {
        if (!doc.exists) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }
        res.status(200).json(Object.assign({ _id: doc.id }, doc.data()));
    })
        .catch(next);
}
function adminUsersCreate(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = req.body;
            // Encriptar la contraseña si se proporciona
            if (data.userPassword) {
                data.userPassword = yield bcrypt_1.default.hash(data.userPassword, 10);
            }
            const ref = yield firebase_1.db.collection('users').add(data);
            res.status(201).json(Object.assign({ _id: ref.id }, data));
        }
        catch (error) {
            next(error);
        }
    });
}
function adminUsersUpdate(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = req.body;
            // Encriptar la contraseña si se proporciona
            if (data.userPassword) {
                data.userPassword = yield bcrypt_1.default.hash(data.userPassword, 10);
            }
            yield firebase_1.db.collection('users').doc(req.params.id).update(data);
            res.status(200).json({ message: 'Usuario actualizado' });
        }
        catch (error) {
            next(error);
        }
    });
}
function adminUsersRemove(req, res, next) {
    firebase_1.db.collection('users')
        .doc(req.params.id)
        .delete()
        .then(() => {
        res.status(200).json({ message: 'Usuario eliminado' });
    })
        .catch(next);
}
function adminUsersStats(req, res, next) {
    firebase_1.db.collection('users')
        .get()
        .then(snapshot => {
        const users = [];
        snapshot.forEach(doc => users.push(Object.assign({ _id: doc.id }, doc.data())));
        const stats = {
            totalUsers: users.length,
            activeUsers: users.filter(user => user.status === 'active').length,
            blockedUsers: users.filter(user => user.status === 'blocked').length,
            pendingUsers: users.filter(user => user.status === 'pending').length,
            inactiveUsers: users.filter(user => user.status === 'inactive').length,
            organizers: users.filter(user => user.roll === 'organizer').length,
            musicians: users.filter(user => user.roll === 'musician').length,
            averageRating: 0, // TODO: Implement calculation
            topLocations: getTopUserLocations(users),
            usersByMonth: getUsersByMonth(users),
        };
        res.status(200).json({ stats });
    })
        .catch(next);
}
// --- Eventos ---
function adminEventsGetAll(req, res, next) {
    firebase_1.db.collection('events')
        .get()
        .then(snapshot => {
        const events = [];
        snapshot.forEach(doc => events.push(Object.assign({ _id: doc.id }, doc.data())));
        res.status(200).json(events);
    })
        .catch(next);
}
function adminEventsGetById(req, res, next) {
    firebase_1.db.collection('events')
        .doc(req.params.id)
        .get()
        .then(doc => {
        if (!doc.exists) {
            res.status(404).json({ message: 'Evento no encontrado' });
            return;
        }
        res.status(200).json(Object.assign({ _id: doc.id }, doc.data()));
    })
        .catch(next);
}
function adminEventsCreate(req, res, next) {
    const data = req.body;
    firebase_1.db.collection('events')
        .add(data)
        .then(ref => {
        res.status(201).json(Object.assign({ _id: ref.id }, data));
    })
        .catch(next);
}
function adminEventsUpdate(req, res, next) {
    const data = req.body;
    firebase_1.db.collection('events')
        .doc(req.params.id)
        .update(data)
        .then(() => {
        res.status(200).json({ message: 'Evento actualizado' });
    })
        .catch(next);
}
function adminEventsRemove(req, res, next) {
    firebase_1.db.collection('events')
        .doc(req.params.id)
        .delete()
        .then(() => {
        res.status(200).json({ message: 'Evento eliminado' });
    })
        .catch(next);
}
// --- Músicos ---
function adminMusiciansGetAll(req, res, next) {
    res.status(200).json([]);
    return;
}
function adminMusiciansGetById(req, res, next) {
    res.status(200).json({});
    return;
}
function adminMusiciansUpdate(req, res, next) {
    res.status(200).json({ message: 'Músico actualizado' });
    return;
}
function adminMusiciansRemove(req, res, next) {
    res.status(200).json({ message: 'Músico eliminado' });
    return;
}
// --- Imágenes ---
function adminImagesGetAll(req, res, next) {
    res.status(200).json([]);
    return;
}
function adminImagesGetById(req, res, next) {
    res.status(200).json({});
    return;
}
function adminImagesRemove(req, res, next) {
    res.status(200).json({ message: 'Imagen eliminada' });
    return;
}
// --- Solicitudes de Músico ---
function adminMusicianRequestsGetAll(req, res, next) {
    firebase_1.db.collection('musicianRequests')
        .get()
        .then(snapshot => {
        let requests = [];
        snapshot.forEach(doc => requests.push(Object.assign({ _id: doc.id }, doc.data())));
        // Aplicar filtros
        const { status, instrument, location, search, eventId, musicianId } = req.query;
        if (status) {
            requests = requests.filter(req => req.status === status);
        }
        if (instrument) {
            requests = requests.filter(req => req.instrument === instrument);
        }
        if (location) {
            requests = requests.filter(req => {
                var _a;
                return (_a = req.location) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(location.toString().toLowerCase());
            });
        }
        if (search) {
            requests = requests.filter(req => {
                var _a, _b, _c;
                return ((_a = req.eventType) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toString().toLowerCase())) ||
                    ((_b = req.description) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toString().toLowerCase())) ||
                    ((_c = req.location) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toString().toLowerCase()));
            });
        }
        if (eventId) {
            requests = requests.filter(req => req.eventId === eventId);
        }
        if (musicianId) {
            requests = requests.filter(req => req.assignedMusicianId === musicianId);
        }
        // Obtener parámetros de paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const total = requests.length;
        const totalPages = Math.ceil(total / limit);
        // Aplicar paginación
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRequests = requests.slice(startIndex, endIndex);
        res.status(200).json({
            requests: paginatedRequests,
            total,
            page,
            limit,
            totalPages,
        });
    })
        .catch(next);
}
function adminMusicianRequestsCreate(req, res, next) {
    const data = req.body;
    firebase_1.db.collection('musicianRequests')
        .add(data)
        .then(ref => {
        res.status(201).json(Object.assign({ _id: ref.id }, data));
    })
        .catch(next);
}
function adminMusicianRequestsGetById(req, res, next) {
    firebase_1.db.collection('musicianRequests')
        .doc(req.params.id)
        .get()
        .then(doc => {
        if (!doc.exists) {
            res.status(404).json({ message: 'Solicitud no encontrada' });
            return;
        }
        res.status(200).json(Object.assign({ _id: doc.id }, doc.data()));
    })
        .catch(next);
}
function adminMusicianRequestsUpdate(req, res, next) {
    const data = req.body;
    firebase_1.db.collection('musicianRequests')
        .doc(req.params.id)
        .update(data)
        .then(() => {
        res.status(200).json({ message: 'Solicitud actualizada' });
    })
        .catch(next);
}
function adminMusicianRequestsRemove(req, res, next) {
    firebase_1.db.collection('musicianRequests')
        .doc(req.params.id)
        .delete()
        .then(() => {
        res.status(200).json({ message: 'Solicitud eliminada' });
    })
        .catch(next);
}
// Endpoint para estadísticas de solicitudes
function adminMusicianRequestsStats(req, res, next) {
    firebase_1.db.collection('musicianRequests')
        .get()
        .then(snapshot => {
        const requests = [];
        snapshot.forEach(doc => requests.push(Object.assign({ _id: doc.id }, doc.data())));
        const stats = {
            totalRequests: requests.length,
            pendingRequests: requests.filter(req => req.status === 'pendiente')
                .length,
            assignedRequests: requests.filter(req => req.status === 'asignada')
                .length,
            completedRequests: requests.filter(req => req.status === 'completada')
                .length,
            cancelledRequests: requests.filter(req => req.status === 'cancelada')
                .length,
            unassignedRequests: requests.filter(req => req.status === 'no_asignada')
                .length,
            averageResponseTime: 0, // TODO: Implementar cálculo de tiempo de respuesta
            topInstruments: getTopInstruments(requests),
            topLocations: getTopLocations(requests),
            requestsByMonth: getRequestsByMonth(requests),
        };
        res.status(200).json({ stats });
    })
        .catch(next);
}
// Función auxiliar para obtener instrumentos más populares
function getTopInstruments(requests) {
    const instrumentCounts = {};
    requests.forEach(req => {
        if (req.instrument) {
            instrumentCounts[req.instrument] =
                (instrumentCounts[req.instrument] || 0) + 1;
        }
    });
    return Object.entries(instrumentCounts)
        .map(([instrument, count]) => ({ instrument, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
}
// Función auxiliar para obtener ubicaciones más populares
function getTopLocations(requests) {
    const locationCounts = {};
    requests.forEach(req => {
        if (req.location) {
            locationCounts[req.location] = (locationCounts[req.location] || 0) + 1;
        }
    });
    return Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
}
// Función auxiliar para obtener solicitudes por mes
function getRequestsByMonth(requests) {
    const monthCounts = {};
    requests.forEach(req => {
        if (req.createdAt) {
            const date = new Date(req.createdAt);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthCounts[month] = (monthCounts[month] || 0) + 1;
        }
    });
    return Object.entries(monthCounts)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));
}
// Función auxiliar para obtener ubicaciones más populares de usuarios
function getTopUserLocations(users) {
    const locationCounts = {};
    users.forEach(user => {
        if (user.location) {
            locationCounts[user.location] = (locationCounts[user.location] || 0) + 1;
        }
    });
    return Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
}
// Función auxiliar para obtener usuarios por mes
function getUsersByMonth(users) {
    const monthCounts = {};
    users.forEach(user => {
        if (user.createdAt) {
            const date = new Date(user.createdAt);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthCounts[month] = (monthCounts[month] || 0) + 1;
        }
    });
    return Object.entries(monthCounts)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));
}
// ===== NUEVOS CONTROLADORES PARA ADMIN SYSTEM =====
/**
 * Búsqueda global en toda la plataforma
 */
exports.adminGlobalSearch = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query, types, page = 1, limit = 20 } = req.query;
    const { userId } = req.user;
    loggerService_1.logger.info('Búsqueda global iniciada', {
        userId,
        metadata: { query, types },
    });
    if (!query || typeof query !== 'string') {
        throw new errorHandler_2.OperationalError('Query de búsqueda requerida', 400);
    }
    const searchTypes = types
        ? types.split(',')
        : ['users', 'events', 'requests'];
    const results = {};
    // Búsqueda en usuarios
    if (searchTypes.includes('users')) {
        const users = yield firebase_1.db
            .collection('users')
            .where('name', '>=', query)
            .where('name', '<=', query + '\uf8ff')
            .limit(parseInt(limit))
            .get();
        results.users = users.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    }
    // Búsqueda en eventos
    if (searchTypes.includes('events')) {
        const events = yield firebase_1.db
            .collection('events')
            .where('name', '>=', query)
            .where('name', '<=', query + '\uf8ff')
            .limit(parseInt(limit))
            .get();
        results.events = events.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    }
    // Búsqueda en solicitudes
    if (searchTypes.includes('requests')) {
        const requests = yield firebase_1.db
            .collection('musicianRequests')
            .where('description', '>=', query)
            .where('description', '<=', query + '\uf8ff')
            .limit(parseInt(limit))
            .get();
        results.requests = requests.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    }
    loggerService_1.logger.info('Búsqueda global completada', {
        userId,
        metadata: { resultsCount: Object.keys(results).length },
    });
    res.status(200).json({
        success: true,
        data: results,
        message: 'Búsqueda global completada',
    });
}));
/**
 * Analytics del dashboard
 */
exports.adminDashboardAnalytics = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    loggerService_1.logger.info('Obteniendo analytics del dashboard', { userId });
    // Estadísticas de usuarios
    const usersSnapshot = yield firebase_1.db.collection('users').get();
    const totalUsers = usersSnapshot.size;
    const activeUsers = usersSnapshot.docs.filter(doc => doc.data().status === true).length;
    // Estadísticas de eventos
    const eventsSnapshot = yield firebase_1.db.collection('events').get();
    const totalEvents = eventsSnapshot.size;
    const activeEvents = eventsSnapshot.docs.filter(doc => doc.data().status === 'active').length;
    // Estadísticas de solicitudes
    const requestsSnapshot = yield firebase_1.db.collection('musicianRequests').get();
    const totalRequests = requestsSnapshot.size;
    const pendingRequests = requestsSnapshot.docs.filter(doc => doc.data().status === 'pending').length;
    // Estadísticas de imágenes
    const imagesSnapshot = yield firebase_1.db.collection('images').get();
    const totalImages = imagesSnapshot.size;
    // Cálculo de crecimiento (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = usersSnapshot.docs.filter(doc => {
        var _a, _b;
        const createdAt = ((_b = (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) || new Date(doc.data().createdAt);
        return createdAt >= thirtyDaysAgo;
    }).length;
    const recentEvents = eventsSnapshot.docs.filter(doc => {
        var _a, _b;
        const createdAt = ((_b = (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) || new Date(doc.data().createdAt);
        return createdAt >= thirtyDaysAgo;
    }).length;
    const analytics = {
        users: {
            total: totalUsers,
            active: activeUsers,
            recent: recentUsers,
            growth: recentUsers > 0 ? ((recentUsers / totalUsers) * 100).toFixed(1) : '0',
        },
        events: {
            total: totalEvents,
            active: activeEvents,
            recent: recentEvents,
            growth: recentEvents > 0
                ? ((recentEvents / totalEvents) * 100).toFixed(1)
                : '0',
        },
        requests: {
            total: totalRequests,
            pending: pendingRequests,
            completionRate: totalRequests > 0
                ? (((totalRequests - pendingRequests) / totalRequests) *
                    100).toFixed(1)
                : '0',
        },
        images: {
            total: totalImages,
        },
        system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString(),
        },
    };
    loggerService_1.logger.info('Analytics del dashboard obtenidos', {
        userId,
        metadata: { analytics },
    });
    res.status(200).json({
        success: true,
        data: analytics,
        message: 'Analytics del dashboard obtenidos',
    });
}));
/**
 * Analytics de usuarios
 */
exports.adminUserAnalytics = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { period = 'week', groupBy = 'role' } = req.query;
    const { userId } = req.user;
    loggerService_1.logger.info('Obteniendo analytics de usuarios', {
        userId,
        metadata: { period, groupBy },
    });
    const usersSnapshot = yield firebase_1.db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    let analytics = {};
    if (groupBy === 'role') {
        const roleStats = users.reduce((acc, user) => {
            const role = user.roll || 'user';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {});
        analytics = {
            byRole: roleStats,
            total: users.length,
            active: users.filter((u) => u.status === true).length,
            inactive: users.filter((u) => u.status === false).length,
        };
    }
    else if (groupBy === 'status') {
        analytics = {
            active: users.filter((u) => u.status === true).length,
            inactive: users.filter((u) => u.status === false).length,
            total: users.length,
        };
    }
    // Datos por período
    const now = new Date();
    let startDate;
    switch (period) {
        case 'day':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    const recentUsers = users.filter((user) => {
        var _a, _b;
        const createdAt = ((_b = (_a = user.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) || new Date(user.createdAt);
        return createdAt >= startDate;
    });
    analytics.recent = recentUsers.length;
    analytics.period = period;
    loggerService_1.logger.info('Analytics de usuarios obtenidos', {
        userId,
        metadata: { analytics },
    });
    res.status(200).json({
        success: true,
        data: analytics,
        message: 'Analytics de usuarios obtenidos',
    });
}));
/**
 * Analytics de eventos
 */
exports.adminEventAnalytics = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { period = 'month', groupBy = 'status' } = req.query;
    const { userId } = req.user;
    loggerService_1.logger.info('Obteniendo analytics de eventos', {
        userId,
        metadata: { period, groupBy },
    });
    const eventsSnapshot = yield firebase_1.db.collection('events').get();
    const events = eventsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    let analytics = {};
    if (groupBy === 'status') {
        const statusStats = events.reduce((acc, event) => {
            const status = event.status || 'draft';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        analytics = {
            byStatus: statusStats,
            total: events.length,
            active: events.filter((e) => e.status === 'active').length,
            completed: events.filter((e) => e.status === 'completed').length,
            cancelled: events.filter((e) => e.status === 'cancelled').length,
        };
    }
    else if (groupBy === 'category') {
        const categoryStats = events.reduce((acc, event) => {
            const category = event.category || 'other';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        analytics = {
            byCategory: categoryStats,
            total: events.length,
        };
    }
    // Datos por período
    const now = new Date();
    let startDate;
    switch (period) {
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case 'quarter':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    const recentEvents = events.filter((event) => {
        var _a, _b;
        const createdAt = ((_b = (_a = event.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) || new Date(event.createdAt);
        return createdAt >= startDate;
    });
    analytics.recent = recentEvents.length;
    analytics.period = period;
    loggerService_1.logger.info('Analytics de eventos obtenidos', {
        userId,
        metadata: { analytics },
    });
    res.status(200).json({
        success: true,
        data: analytics,
        message: 'Analytics de eventos obtenidos',
    });
}));
/**
 * Analytics de solicitudes
 */
exports.adminRequestAnalytics = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { period = 'quarter', groupBy = 'instrument' } = req.query;
    const { userId } = req.user;
    loggerService_1.logger.info('Obteniendo analytics de solicitudes', {
        userId,
        metadata: { period, groupBy },
    });
    const requestsSnapshot = yield firebase_1.db.collection('musicianRequests').get();
    const requests = requestsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    let analytics = {};
    if (groupBy === 'instrument') {
        const instrumentStats = requests.reduce((acc, request) => {
            const instrument = request.instrument || 'other';
            acc[instrument] = (acc[instrument] || 0) + 1;
            return acc;
        }, {});
        analytics = {
            byInstrument: instrumentStats,
            total: requests.length,
            pending: requests.filter((r) => r.status === 'pending').length,
            assigned: requests.filter((r) => r.status === 'assigned').length,
            completed: requests.filter((r) => r.status === 'completed').length,
            cancelled: requests.filter((r) => r.status === 'cancelled').length,
        };
    }
    else if (groupBy === 'status') {
        analytics = {
            pending: requests.filter((r) => r.status === 'pending').length,
            assigned: requests.filter((r) => r.status === 'assigned').length,
            completed: requests.filter((r) => r.status === 'completed').length,
            cancelled: requests.filter((r) => r.status === 'cancelled').length,
            total: requests.length,
        };
    }
    // Datos por período
    const now = new Date();
    let startDate;
    switch (period) {
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case 'quarter':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }
    const recentRequests = requests.filter((request) => {
        var _a, _b;
        const createdAt = ((_b = (_a = request.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) || new Date(request.createdAt);
        return createdAt >= startDate;
    });
    analytics.recent = recentRequests.length;
    analytics.period = period;
    // Tasa de completitud
    const completedRequests = requests.filter((r) => r.status === 'completed').length;
    analytics.completionRate =
        requests.length > 0
            ? ((completedRequests / requests.length) * 100).toFixed(1)
            : '0';
    loggerService_1.logger.info('Analytics de solicitudes obtenidos', {
        userId,
        metadata: { analytics },
    });
    res.status(200).json({
        success: true,
        data: analytics,
        message: 'Analytics de solicitudes obtenidos',
    });
}));
/**
 * Exportar reportes
 */
exports.adminExportReport = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, filters, format = 'csv' } = req.query;
    const { userId } = req.user;
    loggerService_1.logger.info('Exportando reporte', { userId, metadata: { type, format } });
    let data = [];
    switch (type) {
        case 'users':
            const usersSnapshot = yield firebase_1.db.collection('users').get();
            data = usersSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            break;
        case 'events':
            const eventsSnapshot = yield firebase_1.db.collection('events').get();
            data = eventsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            break;
        case 'requests':
            const requestsSnapshot = yield firebase_1.db.collection('musicianRequests').get();
            data = requestsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            break;
        default:
            throw new errorHandler_2.OperationalError('Tipo de reporte no válido', 400);
    }
    // Aplicar filtros si se proporcionan
    if (filters) {
        const filterObj = JSON.parse(filters);
        data = data.filter(item => {
            return Object.keys(filterObj).every(key => {
                return item[key] === filterObj[key];
            });
        });
    }
    let reportContent;
    if (format === 'csv') {
        // Convertir a CSV
        const headers = Object.keys(data[0] || {});
        const csvRows = [headers.join(',')];
        data.forEach(item => {
            const values = headers.map(header => {
                const value = item[header];
                return typeof value === 'string' ? `"${value}"` : value;
            });
            csvRows.push(values.join(','));
        });
        reportContent = csvRows.join('\n');
    }
    else {
        // JSON por defecto
        reportContent = JSON.stringify(data, null, 2);
    }
    loggerService_1.logger.info('Reporte exportado exitosamente', {
        userId,
        metadata: { dataCount: data.length },
    });
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_report.${format}"`);
    res.status(200).send(reportContent);
}));
// ===== NUEVOS CONTROLADORES PARA VERIFICACIÓN DE PAGOS MÓVILES =====
/**
 * Obtener todas las solicitudes de pago móvil
 */
exports.adminGetMobilePayments = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { status, limit = 50, offset = 0 } = req.query;
    loggerService_1.logger.info('Obteniendo pagos móviles', { userId, metadata: { status } });
    // Obtener pagos móviles desde la colección mobilePayments
    let query = firebase_1.db.collection('mobilePayments').orderBy('createdAt', 'desc');
    // Aplicar filtros
    if (status) {
        query = query.where('status', '==', status);
    }
    const snapshot = yield query.limit(Number(limit)).offset(Number(offset)).get();
    const mobilePayments = snapshot.docs.map(doc => {
        var _a, _b;
        return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toDate() }));
    });
    // Obtener información adicional de usuarios
    const userIds = [...new Set(mobilePayments.map(payment => payment.userId))];
    let users = {};
    // Solo hacer la consulta si hay userIds
    if (userIds.length > 0) {
        const usersSnapshot = yield firebase_1.db.collection('users').where('_id', 'in', userIds).get();
        users = usersSnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = Object.assign({ id: doc.id }, doc.data());
            return acc;
        }, {});
    }
    // Combinar datos
    const paymentsWithUserInfo = mobilePayments.map(payment => (Object.assign(Object.assign({}, payment), { user: users[payment.userId] || null })));
    loggerService_1.logger.info('Pagos móviles obtenidos exitosamente', {
        userId,
        metadata: { count: paymentsWithUserInfo.length },
    });
    res.status(200).json({
        success: true,
        data: paymentsWithUserInfo,
        message: 'Pagos móviles obtenidos exitosamente',
    });
}));
/**
 * Verificar pago móvil
 */
exports.adminVerifyMobilePayment = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { id } = req.params;
    const { notes, verificationMethod } = req.body;
    loggerService_1.logger.info('Verificando pago móvil', { userId, metadata: { paymentId: id } });
    // Obtener el pago móvil
    const paymentRef = firebase_1.db.collection('mobilePayments').doc(id);
    const paymentDoc = yield paymentRef.get();
    if (!paymentDoc.exists) {
        throw new errorHandler_2.OperationalError('Pago móvil no encontrado', 404);
    }
    const paymentData = paymentDoc.data();
    if (paymentData.status !== 'pending') {
        throw new errorHandler_2.OperationalError('El pago ya no está pendiente de verificación', 400);
    }
    // Actualizar el pago como verificado
    yield paymentRef.update({
        status: 'verified',
        verifiedBy: userId,
        verifiedAt: new Date(),
        verificationNotes: notes || '',
        verificationMethod: verificationMethod || 'manual',
        updatedAt: new Date(),
    });
    // Crear una transacción de pago exitosa
    const paymentIntent = {
        id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: paymentData.amount,
        currency: paymentData.currency || 'EUR',
        status: 'succeeded',
        paymentMethodId: 'mobile_verification',
        userId: paymentData.userId,
        eventId: paymentData.eventId,
        description: `Pago móvil verificado: ${paymentData.description}`,
        metadata: {
            mobilePaymentId: id,
            verificationMethod,
            notes,
            verifiedBy: userId,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    // Guardar la transacción
    yield firebase_1.db.collection('paymentIntents').add(paymentIntent);
    // Notificar al usuario (aquí se podría integrar con el sistema de notificaciones)
    yield firebase_1.db.collection('notifications').add({
        userId: paymentData.userId,
        type: 'payment_verified',
        title: 'Pago Verificado',
        message: `Tu pago de ${paymentData.amount}€ ha sido verificado exitosamente.`,
        data: {
            paymentId: id,
            amount: paymentData.amount,
            eventId: paymentData.eventId,
        },
        read: false,
        createdAt: new Date(),
    });
    loggerService_1.logger.info('Pago móvil verificado exitosamente', {
        userId,
        metadata: { paymentId: id, amount: paymentData.amount },
    });
    res.status(200).json({
        success: true,
        data: {
            paymentId: id,
            status: 'verified',
            transactionId: paymentIntent.id,
        },
        message: 'Pago móvil verificado exitosamente',
    });
}));
/**
 * Rechazar pago móvil
 */
exports.adminRejectMobilePayment = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { id } = req.params;
    const { reason, notes } = req.body;
    loggerService_1.logger.info('Rechazando pago móvil', { userId, metadata: { paymentId: id, reason } });
    // Obtener el pago móvil
    const paymentRef = firebase_1.db.collection('mobilePayments').doc(id);
    const paymentDoc = yield paymentRef.get();
    if (!paymentDoc.exists) {
        throw new errorHandler_2.OperationalError('Pago móvil no encontrado', 404);
    }
    const paymentData = paymentDoc.data();
    if (paymentData.status !== 'pending') {
        throw new errorHandler_2.OperationalError('El pago ya no está pendiente de verificación', 400);
    }
    // Actualizar el pago como rechazado
    yield paymentRef.update({
        status: 'rejected',
        rejectedBy: userId,
        rejectedAt: new Date(),
        rejectionReason: reason || 'Sin especificar',
        rejectionNotes: notes || '',
        updatedAt: new Date(),
    });
    // Notificar al usuario
    yield firebase_1.db.collection('notifications').add({
        userId: paymentData.userId,
        type: 'payment_rejected',
        title: 'Pago Rechazado',
        message: `Tu pago de ${paymentData.amount}€ ha sido rechazado. Razón: ${reason || 'Sin especificar'}`,
        data: {
            paymentId: id,
            amount: paymentData.amount,
            reason,
            eventId: paymentData.eventId,
        },
        read: false,
        createdAt: new Date(),
    });
    loggerService_1.logger.info('Pago móvil rechazado exitosamente', {
        userId,
        metadata: { paymentId: id, reason },
    });
    res.status(200).json({
        success: true,
        data: {
            paymentId: id,
            status: 'rejected',
            reason,
        },
        message: 'Pago móvil rechazado exitosamente',
    });
}));
/**
 * Obtener estadísticas de pagos móviles
 */
exports.adminGetMobilePaymentStats = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { period = '30d' } = req.query;
    loggerService_1.logger.info('Obteniendo estadísticas de pagos móviles', { userId, metadata: { period } });
    // Calcular fecha de inicio basada en el período
    const now = new Date();
    let startDate;
    switch (period) {
        case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    // Obtener todos los pagos móviles del período
    const snapshot = yield firebase_1.db.collection('mobilePayments')
        .where('createdAt', '>=', startDate)
        .get();
    const payments = snapshot.docs.map(doc => {
        var _a;
        return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: (_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate() }));
    });
    // Calcular estadísticas
    const stats = {
        total: payments.length,
        pending: payments.filter(p => p.status === 'pending').length,
        verified: payments.filter(p => p.status === 'verified').length,
        rejected: payments.filter(p => p.status === 'rejected').length,
        totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
        verifiedAmount: payments
            .filter(p => p.status === 'verified')
            .reduce((sum, p) => sum + (p.amount || 0), 0),
        averageAmount: payments.length > 0
            ? payments.reduce((sum, p) => sum + (p.amount || 0), 0) / payments.length
            : 0,
        verificationRate: payments.length > 0
            ? ((payments.filter(p => p.status === 'verified').length / payments.length) * 100).toFixed(1)
            : '0',
        rejectionRate: payments.length > 0
            ? ((payments.filter(p => p.status === 'rejected').length / payments.length) * 100).toFixed(1)
            : '0',
        // Estadísticas por día
        dailyStats: getDailyStats(payments, startDate, now),
        // Top métodos de pago
        topPaymentMethods: getTopPaymentMethods(payments),
        // Top eventos
        topEvents: getTopEvents(payments),
    };
    loggerService_1.logger.info('Estadísticas de pagos móviles obtenidas exitosamente', {
        userId,
        metadata: { stats },
    });
    res.status(200).json({
        success: true,
        data: stats,
        message: 'Estadísticas de pagos móviles obtenidas exitosamente',
    });
}));
// Funciones auxiliares para estadísticas
function getDailyStats(payments, startDate, endDate) {
    const dailyStats = {};
    // Inicializar todos los días del período
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        dailyStats[dateKey] = { count: 0, amount: 0 };
    }
    // Contar pagos por día
    payments.forEach(payment => {
        const dateKey = payment.createdAt.toISOString().split('T')[0];
        if (dailyStats[dateKey]) {
            dailyStats[dateKey].count++;
            dailyStats[dateKey].amount += payment.amount || 0;
        }
    });
    return Object.entries(dailyStats).map(([date, stats]) => (Object.assign({ date }, stats)));
}
function getTopPaymentMethods(payments) {
    const methodCounts = {};
    payments.forEach(payment => {
        const method = payment.paymentMethod || 'unknown';
        methodCounts[method] = (methodCounts[method] || 0) + 1;
    });
    return Object.entries(methodCounts)
        .map(([method, count]) => ({ method, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
}
function getTopEvents(payments) {
    const eventCounts = {};
    payments.forEach(payment => {
        if (payment.eventId) {
            eventCounts[payment.eventId] = (eventCounts[payment.eventId] || 0) + 1;
        }
    });
    return Object.entries(eventCounts)
        .map(([eventId, count]) => ({ eventId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
}
// ===== NUEVAS FUNCIONES DE ESTADÍSTICAS =====
/**
 * Obtener estadísticas de eventos
 */
function adminEventsStats(req, res, next) {
    firebase_1.db.collection('events')
        .get()
        .then(snapshot => {
        const events = [];
        snapshot.forEach(doc => events.push(Object.assign({ _id: doc.id }, doc.data())));
        const stats = {
            total: events.length,
            upcoming: events.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate > new Date();
            }).length,
            completed: events.filter(event => event.status === 'completed').length,
            cancelled: events.filter(event => event.status === 'cancelled').length,
            byType: getEventsByType(events),
            byStatus: getEventsByStatus(events),
            attendanceRate: 85.5, // Mock data - implement real calculation
            topVenues: getTopVenues(events)
        };
        res.status(200).json({ success: true, data: stats });
    })
        .catch(err => {
        loggerService_1.logger.error('Error getting events stats:', err);
        res.status(500).json({ success: false, error: err.message });
    });
}
/**
 * Obtener estadísticas de imágenes
 */
function adminImagesStats(req, res, next) {
    firebase_1.db.collection('images')
        .get()
        .then(snapshot => {
        const images = [];
        snapshot.forEach(doc => images.push(Object.assign({ _id: doc.id }, doc.data())));
        const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
        const today = new Date();
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const stats = {
            total: images.length,
            totalSize: totalSize,
            averageSize: images.length > 0 ? totalSize / images.length : 0,
            byType: getImagesByType(images),
            uploadsToday: images.filter(img => {
                const imgDate = new Date(img.createdAt);
                return imgDate.toDateString() === today.toDateString();
            }).length,
            uploadsThisWeek: images.filter(img => {
                const imgDate = new Date(img.createdAt);
                return imgDate >= thisWeek;
            }).length,
            storageUsed: totalSize,
            storageLimit: 10 * 1024 * 1024 * 1024 // 10GB mock limit
        };
        res.status(200).json({ success: true, data: stats });
    })
        .catch(err => {
        loggerService_1.logger.error('Error getting images stats:', err);
        res.status(500).json({ success: false, error: err.message });
    });
}
/**
 * Obtener estadísticas de pagos
 */
function adminPaymentsStats(req, res, next) {
    firebase_1.db.collection('payments')
        .get()
        .then(snapshot => {
        const payments = [];
        snapshot.forEach(doc => payments.push(Object.assign({ _id: doc.id }, doc.data())));
        const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const successfulPayments = payments.filter(p => p.status === 'completed');
        const stats = {
            totalRevenue: totalRevenue,
            totalTransactions: payments.length,
            averageTransaction: payments.length > 0 ? totalRevenue / payments.length : 0,
            successRate: payments.length > 0 ? (successfulPayments.length / payments.length) * 100 : 0,
            failureRate: payments.length > 0 ? ((payments.length - successfulPayments.length) / payments.length) * 100 : 0,
            byMethod: getPaymentsByMethod(payments),
            revenueGrowth: 12.5, // Mock data - implement real calculation
            topCurrencies: getTopCurrencies(payments)
        };
        res.status(200).json({ success: true, data: stats });
    })
        .catch(err => {
        loggerService_1.logger.error('Error getting payments stats:', err);
        res.status(500).json({ success: false, error: err.message });
    });
}
/**
 * Obtener estadísticas de chat
 */
function adminChatStats(req, res, next) {
    Promise.all([
        firebase_1.db.collection('conversations').get(),
        firebase_1.db.collection('messages').get()
    ])
        .then(([conversationsSnapshot, messagesSnapshot]) => {
        const conversations = [];
        const messages = [];
        conversationsSnapshot.forEach(doc => conversations.push(Object.assign({ _id: doc.id }, doc.data())));
        messagesSnapshot.forEach(doc => messages.push(Object.assign({ _id: doc.id }, doc.data())));
        const activeConversations = conversations.filter(conv => conv.isActive);
        const stats = {
            totalConversations: conversations.length,
            activeConversations: activeConversations.length,
            totalMessages: messages.length,
            messagesPerConversation: conversations.length > 0 ? messages.length / conversations.length : 0,
            responseTime: 2.5, // Mock data - implement real calculation
            userSatisfaction: 4.6 // Mock data - implement real calculation
        };
        res.status(200).json({ success: true, data: stats });
    })
        .catch(err => {
        loggerService_1.logger.error('Error getting chat stats:', err);
        res.status(500).json({ success: false, error: err.message });
    });
}
/**
 * Obtener estadísticas del sistema
 */
function adminSystemStats(req, res, next) {
    try {
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();
        const stats = {
            uptime: 99.8, // Mock percentage uptime
            cpuUsage: Math.random() * 50 + 25, // Mock CPU usage between 25-75%
            memoryUsage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
            diskUsage: 34.5, // Mock disk usage
            networkLatency: Math.random() * 50 + 10, // Mock latency 10-60ms
            errorRate: Math.random() * 2, // Mock error rate 0-2%
            requestsPerMinute: Math.floor(Math.random() * 1000 + 500), // Mock requests
            activeConnections: Math.floor(Math.random() * 200 + 50) // Mock connections
        };
        res.status(200).json({ success: true, data: stats });
    }
    catch (err) {
        loggerService_1.logger.error('Error getting system stats:', err);
        res.status(500).json({ success: false, error: err.message });
    }
}
// ===== FUNCIONES AUXILIARES =====
function getEventsByType(events) {
    const typeCounts = {};
    events.forEach(event => {
        const type = event.eventType || 'unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    return typeCounts;
}
function getEventsByStatus(events) {
    const statusCounts = {};
    events.forEach(event => {
        const status = event.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return statusCounts;
}
function getTopVenues(events) {
    const venueCounts = {};
    events.forEach(event => {
        const venue = event.location || 'unknown';
        venueCounts[venue] = (venueCounts[venue] || 0) + 1;
    });
    return Object.entries(venueCounts)
        .map(([venue, count]) => ({ venue, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
}
function getImagesByType(images) {
    const typeCounts = {};
    images.forEach(image => {
        var _a;
        const type = ((_a = image.mimetype) === null || _a === void 0 ? void 0 : _a.split('/')[1]) || 'unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    return typeCounts;
}
function getPaymentsByMethod(payments) {
    const methodCounts = {};
    payments.forEach(payment => {
        const method = payment.paymentMethod || 'unknown';
        methodCounts[method] = (methodCounts[method] || 0) + 1;
    });
    return methodCounts;
}
function getTopCurrencies(payments) {
    const currencyCounts = {};
    payments.forEach(payment => {
        const currency = payment.currency || 'USD';
        const amount = payment.amount || 0;
        currencyCounts[currency] = (currencyCounts[currency] || 0) + amount;
    });
    return Object.entries(currencyCounts)
        .map(([currency, amount]) => ({ currency, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);
}
