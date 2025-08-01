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
exports.searchService = exports.SearchService = void 0;
const firebase_1 = require("../utils/firebase");
class SearchService {
    /**
     * Búsqueda avanzada de eventos
     */
    searchEvents(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let query = firebase_1.db.collection('events');
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
                const snapshot = yield query.get();
                const events = snapshot.docs.map((doc) => doc.data());
                // Filtrado por texto si se especifica
                let filteredEvents = events;
                if (filters.query) {
                    const searchTerm = filters.query.toLowerCase();
                    filteredEvents = events.filter((event) => {
                        // Función auxiliar para verificar si un valor es string y hacer búsqueda
                        const searchInField = (field) => {
                            return typeof field === 'string' && field.toLowerCase().includes(searchTerm);
                        };
                        return (searchInField(event.eventName) ||
                            searchInField(event.location) ||
                            searchInField(event.comment));
                    });
                }
                // Filtrado por presupuesto si se especifica
                if (filters.budget) {
                    filteredEvents = filteredEvents.filter((event) => {
                        var _a, _b;
                        const eventBudget = parseFloat(event.budget || '0');
                        const minBudget = ((_a = filters.budget) === null || _a === void 0 ? void 0 : _a.min) || 0;
                        const maxBudget = ((_b = filters.budget) === null || _b === void 0 ? void 0 : _b.max) || Infinity;
                        return eventBudget >= minBudget && eventBudget <= maxBudget;
                    });
                }
                return {
                    data: filteredEvents,
                    total: filteredEvents.length,
                    page: Math.floor((filters.offset || 0) / limit) + 1,
                    limit,
                    hasMore: filteredEvents.length === limit,
                };
            }
            catch (error) {
                console.error('Error en búsqueda de eventos:', error);
                throw new Error('Error al buscar eventos');
            }
        });
    }
    /**
     * Búsqueda avanzada de solicitudes de músicos
     */
    searchMusicianRequests(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let query = firebase_1.db.collection('musicianRequests');
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
                const snapshot = yield query.get();
                const requests = snapshot.docs.map((doc) => doc.data());
                // Filtrado por texto si se especifica
                let filteredRequests = requests;
                if (filters.query) {
                    const searchTerm = filters.query.toLowerCase();
                    filteredRequests = requests.filter((request) => {
                        // Función auxiliar para verificar si un valor es string y hacer búsqueda
                        const searchInField = (field) => {
                            return typeof field === 'string' && field.toLowerCase().includes(searchTerm);
                        };
                        return (searchInField(request.description) ||
                            searchInField(request.location) ||
                            searchInField(request.requirements));
                    });
                }
                // Filtrado por presupuesto si se especifica
                if (filters.budget) {
                    filteredRequests = filteredRequests.filter((request) => {
                        var _a, _b;
                        const requestBudget = request.budget || 0;
                        const minBudget = ((_a = filters.budget) === null || _a === void 0 ? void 0 : _a.min) || 0;
                        const maxBudget = ((_b = filters.budget) === null || _b === void 0 ? void 0 : _b.max) || Infinity;
                        return requestBudget >= minBudget && requestBudget <= maxBudget;
                    });
                }
                return {
                    data: filteredRequests,
                    total: filteredRequests.length,
                    page: Math.floor((filters.offset || 0) / limit) + 1,
                    limit,
                    hasMore: filteredRequests.length === limit,
                };
            }
            catch (error) {
                console.error('Error en búsqueda de solicitudes:', error);
                throw new Error('Error al buscar solicitudes de músicos');
            }
        });
    }
    /**
     * Búsqueda avanzada de usuarios
     */
    searchUsers(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let query = firebase_1.db.collection('users');
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
                const snapshot = yield query.get();
                const users = snapshot.docs.map((doc) => doc.data());
                // Filtrado por texto si se especifica
                let filteredUsers = users;
                if (filters.query) {
                    const searchTerm = filters.query.toLowerCase();
                    filteredUsers = users.filter((user) => {
                        // Función auxiliar para verificar si un valor es string y hacer búsqueda
                        const searchInField = (field) => {
                            return typeof field === 'string' && field.toLowerCase().includes(searchTerm);
                        };
                        return (searchInField(user.name) ||
                            searchInField(user.lastName) ||
                            searchInField(user.userEmail));
                    });
                }
                return {
                    data: filteredUsers,
                    total: filteredUsers.length,
                    page: Math.floor((filters.offset || 0) / limit) + 1,
                    limit,
                    hasMore: filteredUsers.length === limit,
                };
            }
            catch (error) {
                console.error('Error en búsqueda de usuarios:', error);
                throw new Error('Error al buscar usuarios');
            }
        });
    }
    /**
     * Búsqueda global en todas las colecciones
     */
    globalSearch(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [eventsResult, requestsResult, usersResult] = yield Promise.all([
                    this.searchEvents(filters),
                    this.searchMusicianRequests(filters),
                    this.searchUsers(filters),
                ]);
                return {
                    events: eventsResult.data,
                    requests: requestsResult.data,
                    users: usersResult.data,
                };
            }
            catch (error) {
                console.error('Error en búsqueda global:', error);
                throw new Error('Error al realizar búsqueda global');
            }
        });
    }
    /**
     * Búsqueda por proximidad geográfica
     */
    searchByLocation(location_1) {
        return __awaiter(this, arguments, void 0, function* (location, radius = 50) {
            try {
                // Implementación básica - en producción usar servicios de geolocalización
                const eventsResult = yield this.searchEvents({ location });
                const requestsResult = yield this.searchMusicianRequests({ location });
                return {
                    events: eventsResult.data,
                    requests: requestsResult.data,
                };
            }
            catch (error) {
                console.error('Error en búsqueda por ubicación:', error);
                throw new Error('Error al buscar por ubicación');
            }
        });
    }
    /**
     * Búsqueda de eventos disponibles para músicos
     */
    searchAvailableEventsForMusician(musicianId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const availableFilters = Object.assign(Object.assign({}, filters), { status: 'pending_musician' });
                const result = yield this.searchEvents(availableFilters);
                // Filtrar eventos donde el músico no esté ya asignado o interesado
                const filteredEvents = result.data.filter(event => {
                    var _a;
                    return event.assignedMusicianId !== musicianId &&
                        !((_a = event.interestedMusicians) === null || _a === void 0 ? void 0 : _a.includes(musicianId));
                });
                return Object.assign(Object.assign({}, result), { data: filteredEvents, total: filteredEvents.length });
            }
            catch (error) {
                console.error('Error en búsqueda de eventos disponibles:', error);
                throw new Error('Error al buscar eventos disponibles');
            }
        });
    }
    /**
     * Búsqueda de músicos disponibles para un evento
     */
    searchAvailableMusiciansForEvent(eventId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const musicianFilters = Object.assign(Object.assign({}, filters), { userRole: 'musico' });
                const result = yield this.searchUsers(musicianFilters);
                // Aquí se podría implementar lógica adicional para filtrar músicos
                // que estén disponibles en la fecha del evento, tengan el instrumento requerido, etc.
                return result;
            }
            catch (error) {
                console.error('Error en búsqueda de músicos disponibles:', error);
                throw new Error('Error al buscar músicos disponibles');
            }
        });
    }
}
exports.SearchService = SearchService;
exports.searchService = new SearchService();
