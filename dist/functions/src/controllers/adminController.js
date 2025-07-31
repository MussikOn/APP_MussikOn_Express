"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const firebase_1 = require("../utils/firebase");
// --- Usuarios ---
function adminUsersGetAll(req, res, next) {
    firebase_1.db.collection('users').get()
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
            totalPages
        });
    })
        .catch(next);
}
function adminUsersGetById(req, res, next) {
    firebase_1.db.collection('users').doc(req.params.id).get()
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
    const data = req.body;
    firebase_1.db.collection('users').add(data)
        .then(ref => { res.status(201).json(Object.assign({ _id: ref.id }, data)); })
        .catch(next);
}
function adminUsersUpdate(req, res, next) {
    const data = req.body;
    firebase_1.db.collection('users').doc(req.params.id).update(data)
        .then(() => { res.status(200).json({ message: 'Usuario actualizado' }); })
        .catch(next);
}
function adminUsersRemove(req, res, next) {
    firebase_1.db.collection('users').doc(req.params.id).delete()
        .then(() => { res.status(200).json({ message: 'Usuario eliminado' }); })
        .catch(next);
}
function adminUsersStats(req, res, next) {
    firebase_1.db.collection('users').get()
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
            usersByMonth: getUsersByMonth(users)
        };
        res.status(200).json({ stats });
    })
        .catch(next);
}
// --- Eventos ---
function adminEventsGetAll(req, res, next) {
    firebase_1.db.collection('events').get()
        .then(snapshot => {
        const events = [];
        snapshot.forEach(doc => events.push(Object.assign({ _id: doc.id }, doc.data())));
        res.status(200).json(events);
    })
        .catch(next);
}
function adminEventsGetById(req, res, next) {
    firebase_1.db.collection('events').doc(req.params.id).get()
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
    firebase_1.db.collection('events').add(data)
        .then(ref => { res.status(201).json(Object.assign({ _id: ref.id }, data)); })
        .catch(next);
}
function adminEventsUpdate(req, res, next) {
    const data = req.body;
    firebase_1.db.collection('events').doc(req.params.id).update(data)
        .then(() => { res.status(200).json({ message: 'Evento actualizado' }); })
        .catch(next);
}
function adminEventsRemove(req, res, next) {
    firebase_1.db.collection('events').doc(req.params.id).delete()
        .then(() => { res.status(200).json({ message: 'Evento eliminado' }); })
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
    firebase_1.db.collection('musicianRequests').get()
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
            requests = requests.filter(req => { var _a; return (_a = req.location) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(location.toString().toLowerCase()); });
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
            totalPages
        });
    })
        .catch(next);
}
function adminMusicianRequestsCreate(req, res, next) {
    const data = req.body;
    firebase_1.db.collection('musicianRequests').add(data)
        .then(ref => { res.status(201).json(Object.assign({ _id: ref.id }, data)); })
        .catch(next);
}
function adminMusicianRequestsGetById(req, res, next) {
    firebase_1.db.collection('musicianRequests').doc(req.params.id).get()
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
    firebase_1.db.collection('musicianRequests').doc(req.params.id).update(data)
        .then(() => { res.status(200).json({ message: 'Solicitud actualizada' }); })
        .catch(next);
}
function adminMusicianRequestsRemove(req, res, next) {
    firebase_1.db.collection('musicianRequests').doc(req.params.id).delete()
        .then(() => { res.status(200).json({ message: 'Solicitud eliminada' }); })
        .catch(next);
}
// Endpoint para estadísticas de solicitudes
function adminMusicianRequestsStats(req, res, next) {
    firebase_1.db.collection('musicianRequests').get()
        .then(snapshot => {
        const requests = [];
        snapshot.forEach(doc => requests.push(Object.assign({ _id: doc.id }, doc.data())));
        const stats = {
            totalRequests: requests.length,
            pendingRequests: requests.filter(req => req.status === 'pendiente').length,
            assignedRequests: requests.filter(req => req.status === 'asignada').length,
            completedRequests: requests.filter(req => req.status === 'completada').length,
            cancelledRequests: requests.filter(req => req.status === 'cancelada').length,
            unassignedRequests: requests.filter(req => req.status === 'no_asignada').length,
            averageResponseTime: 0, // TODO: Implementar cálculo de tiempo de respuesta
            topInstruments: getTopInstruments(requests),
            topLocations: getTopLocations(requests),
            requestsByMonth: getRequestsByMonth(requests)
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
            instrumentCounts[req.instrument] = (instrumentCounts[req.instrument] || 0) + 1;
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
