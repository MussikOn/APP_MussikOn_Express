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
exports.ratingService = exports.RatingService = void 0;
const firebase_1 = require("../utils/firebase");
const loggerService_1 = require("./loggerService");
const firestore_1 = require("firebase-admin/firestore");
class RatingService {
    constructor() {
        this.collection = 'ratings';
    }
    /**
     * Crear un nuevo rating
     */
    createRating(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('RatingService: Creando nuevo rating', {
                    metadata: {
                        eventId: data.eventId,
                        musicianId: data.musicianId,
                        category: data.category,
                        context: 'rating'
                    }
                });
                // Validar que el rating esté entre 1-5
                if (data.rating < 1 || data.rating > 5) {
                    throw new Error('El rating debe estar entre 1 y 5 estrellas');
                }
                // Verificar que no exista un rating duplicado
                const existingRating = yield this.getRatingByEventAndUser(data.eventId, data.musicianId, data.eventCreatorId);
                if (existingRating) {
                    throw new Error('Ya existe un rating para este evento y usuario');
                }
                const now = new Date();
                const rating = Object.assign(Object.assign({}, data), { id: firebase_1.db.collection(this.collection).doc().id, createdAt: now, updatedAt: now, helpfulCount: 0, reportedCount: 0, isActive: true });
                yield firebase_1.db.collection(this.collection).doc(rating.id).set(rating);
                // Actualizar estadísticas del usuario
                yield this.updateUserRatingStats(data.musicianId, data.category);
                loggerService_1.logger.info('RatingService: Rating creado exitosamente', {
                    metadata: {
                        ratingId: rating.id,
                        context: 'rating'
                    }
                });
                return rating;
            }
            catch (error) {
                loggerService_1.logger.error('RatingService: Error al crear rating', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        eventId: data.eventId,
                        musicianId: data.musicianId,
                        category: data.category
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener rating por ID
     */
    getRatingById(ratingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doc = yield firebase_1.db.collection(this.collection).doc(ratingId).get();
                return doc.exists ? doc.data() : null;
            }
            catch (error) {
                loggerService_1.logger.error('RatingService: Error al obtener rating por ID', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        ratingId
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener rating por evento y usuario
     */
    getRatingByEventAndUser(eventId, musicianId, eventCreatorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield firebase_1.db.collection(this.collection)
                    .where('eventId', '==', eventId)
                    .where('musicianId', '==', musicianId)
                    .where('eventCreatorId', '==', eventCreatorId)
                    .where('isActive', '==', true)
                    .limit(1)
                    .get();
                return snapshot.empty ? null : snapshot.docs[0].data();
            }
            catch (error) {
                loggerService_1.logger.error('RatingService: Error al obtener rating por evento y usuario', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        eventId,
                        musicianId,
                        eventCreatorId
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener ratings de un usuario
     */
    getUserRatings(userId, category, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let query = firebase_1.db.collection(this.collection)
                    .where('isActive', '==', true);
                if (category === 'musician') {
                    query = query.where('musicianId', '==', userId);
                }
                else {
                    query = query.where('eventCreatorId', '==', userId);
                }
                query = query.where('category', '==', category);
                // Aplicar filtros adicionales
                if (filters === null || filters === void 0 ? void 0 : filters.minRating) {
                    query = query.where('rating', '>=', filters.minRating);
                }
                if (filters === null || filters === void 0 ? void 0 : filters.maxRating) {
                    query = query.where('rating', '<=', filters.maxRating);
                }
                if ((filters === null || filters === void 0 ? void 0 : filters.isVerified) !== undefined) {
                    query = query.where('isVerified', '==', filters.isVerified);
                }
                if (filters === null || filters === void 0 ? void 0 : filters.dateFrom) {
                    query = query.where('createdAt', '>=', filters.dateFrom);
                }
                if (filters === null || filters === void 0 ? void 0 : filters.dateTo) {
                    query = query.where('createdAt', '<=', filters.dateTo);
                }
                query = query.orderBy('createdAt', 'desc');
                const snapshot = yield query.get();
                return snapshot.docs.map(doc => doc.data());
            }
            catch (error) {
                loggerService_1.logger.error('RatingService: Error al obtener ratings de usuario', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        userId,
                        category
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener estadísticas de rating de un usuario
     */
    getUserRatingStats(userId, category) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ratings = yield this.getUserRatings(userId, category);
                if (ratings.length === 0) {
                    return {
                        averageRating: 0,
                        totalRatings: 0,
                        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                        recentRatings: [],
                        verifiedRatings: 0,
                        responseRate: 0
                    };
                }
                // Calcular promedio
                const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
                const averageRating = totalRating / ratings.length;
                // Calcular distribución
                const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                ratings.forEach(rating => {
                    ratingDistribution[rating.rating]++;
                });
                // Ratings recientes (últimos 10)
                const recentRatings = ratings.slice(0, 10);
                // Ratings verificados
                const verifiedRatings = ratings.filter(rating => rating.isVerified).length;
                // Calcular tasa de respuesta (eventos con rating vs total de eventos)
                const responseRate = yield this.calculateResponseRate(userId, category);
                return {
                    averageRating: Math.round(averageRating * 100) / 100, // Redondear a 2 decimales
                    totalRatings: ratings.length,
                    ratingDistribution,
                    recentRatings,
                    verifiedRatings,
                    responseRate
                };
            }
            catch (error) {
                loggerService_1.logger.error('RatingService: Error al obtener estadísticas de rating', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        userId,
                        category
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Actualizar rating
     */
    updateRating(ratingId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('RatingService: Actualizando rating', {
                    metadata: {
                        ratingId,
                        context: 'rating'
                    }
                });
                const updateData = Object.assign(Object.assign({}, updates), { updatedAt: new Date() });
                yield firebase_1.db.collection(this.collection).doc(ratingId).update(updateData);
                const updatedRating = yield this.getRatingById(ratingId);
                if (!updatedRating) {
                    throw new Error('Rating no encontrado después de la actualización');
                }
                // Actualizar estadísticas del usuario
                yield this.updateUserRatingStats(updatedRating.musicianId, updatedRating.category);
                loggerService_1.logger.info('RatingService: Rating actualizado exitosamente', {
                    metadata: {
                        ratingId,
                        context: 'rating'
                    }
                });
                return updatedRating;
            }
            catch (error) {
                loggerService_1.logger.error('RatingService: Error al actualizar rating', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        ratingId
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Marcar rating como útil
     */
    markRatingAsHelpful(ratingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield firebase_1.db.collection(this.collection).doc(ratingId).update({
                    helpfulCount: firestore_1.FieldValue.increment(1),
                    updatedAt: new Date()
                });
            }
            catch (error) {
                loggerService_1.logger.error('RatingService: Error al marcar rating como útil', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        ratingId
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Reportar rating
     */
    reportRating(ratingId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.warn('RatingService: Rating reportado', {
                    metadata: {
                        ratingId,
                        reason,
                        context: 'rating'
                    }
                });
                yield firebase_1.db.collection(this.collection).doc(ratingId).update({
                    reportedCount: firestore_1.FieldValue.increment(1),
                    updatedAt: new Date()
                });
                // Si el rating tiene más de 5 reportes, desactivarlo automáticamente
                const rating = yield this.getRatingById(ratingId);
                if (rating && rating.reportedCount >= 5) {
                    yield this.updateRating(ratingId, { isActive: false });
                    loggerService_1.logger.warn('RatingService: Rating desactivado por múltiples reportes', {
                        metadata: {
                            ratingId,
                            reportedCount: rating.reportedCount,
                            context: 'rating'
                        }
                    });
                }
            }
            catch (error) {
                loggerService_1.logger.error('RatingService: Error al reportar rating', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        ratingId,
                        reason
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener ratings más útiles
     */
    getMostHelpfulRatings(userId_1, category_1) {
        return __awaiter(this, arguments, void 0, function* (userId, category, limit = 5) {
            try {
                let query = firebase_1.db.collection(this.collection)
                    .where('isActive', '==', true);
                if (category === 'musician') {
                    query = query.where('musicianId', '==', userId);
                }
                else {
                    query = query.where('eventCreatorId', '==', userId);
                }
                query = query.where('category', '==', category);
                query = query.orderBy('helpfulCount', 'desc');
                query = query.limit(limit);
                const snapshot = yield query.get();
                return snapshot.docs.map(doc => doc.data());
            }
            catch (error) {
                loggerService_1.logger.error('RatingService: Error al obtener ratings más útiles', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        userId,
                        category
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener ratings por evento
     */
    getEventRatings(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield firebase_1.db.collection(this.collection)
                    .where('eventId', '==', eventId)
                    .where('isActive', '==', true)
                    .orderBy('createdAt', 'desc')
                    .get();
                return snapshot.docs.map(doc => doc.data());
            }
            catch (error) {
                loggerService_1.logger.error('RatingService: Error al obtener ratings del evento', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        eventId
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Calcular tasa de respuesta
     */
    calculateResponseRate(userId, category) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Obtener total de eventos del usuario
                let eventsQuery = firebase_1.db.collection('events');
                if (category === 'musician') {
                    eventsQuery = eventsQuery.where('assignedMusicianId', '==', userId);
                }
                else {
                    eventsQuery = eventsQuery.where('user', '==', userId);
                }
                eventsQuery = eventsQuery.where('status', '==', 'completed');
                const eventsSnapshot = yield eventsQuery.get();
                const totalEvents = eventsSnapshot.size;
                if (totalEvents === 0) {
                    return 0;
                }
                // Obtener eventos con ratings
                const ratings = yield this.getUserRatings(userId, category);
                const eventsWithRatings = new Set(ratings.map(rating => rating.eventId)).size;
                return Math.round((eventsWithRatings / totalEvents) * 100);
            }
            catch (error) {
                loggerService_1.logger.error('RatingService: Error al calcular tasa de respuesta', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        userId,
                        category
                    }
                });
                return 0;
            }
        });
    }
    /**
     * Actualizar estadísticas de rating del usuario
     */
    updateUserRatingStats(userId, category) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield this.getUserRatingStats(userId, category);
                const userDoc = firebase_1.db.collection('users').doc(userId);
                const updateData = {};
                if (category === 'musician') {
                    updateData.musicianRatingStats = stats;
                }
                else {
                    updateData.eventCreatorRatingStats = stats;
                }
                yield userDoc.update(updateData);
            }
            catch (error) {
                loggerService_1.logger.error('RatingService: Error al actualizar estadísticas de usuario', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        userId,
                        category
                    }
                });
            }
        });
    }
    /**
     * Obtener top músicos por rating
     */
    getTopRatedMusicians() {
        return __awaiter(this, arguments, void 0, function* (limit = 10, minRatings = 5) {
            try {
                // Obtener todos los usuarios músicos
                const usersSnapshot = yield firebase_1.db.collection('users')
                    .where('roll', '==', 'musico')
                    .where('isApproved', '==', true)
                    .get();
                const musicians = usersSnapshot.docs.map(doc => doc.data());
                // Obtener estadísticas de rating para cada músico
                const musiciansWithStats = yield Promise.all(musicians.map((musician) => __awaiter(this, void 0, void 0, function* () {
                    const stats = yield this.getUserRatingStats(musician.id, 'musician');
                    return {
                        userId: musician.id,
                        stats
                    };
                })));
                // Filtrar por mínimo de ratings y ordenar por rating promedio
                return musiciansWithStats
                    .filter(musician => musician.stats.totalRatings >= minRatings)
                    .sort((a, b) => b.stats.averageRating - a.stats.averageRating)
                    .slice(0, limit);
            }
            catch (error) {
                loggerService_1.logger.error('RatingService: Error al obtener top músicos', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        limit,
                        minRatings
                    }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener análisis de tendencias de rating
     */
    getRatingTrends() {
        return __awaiter(this, arguments, void 0, function* (days = 30) {
            try {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - days);
                const snapshot = yield firebase_1.db.collection(this.collection)
                    .where('createdAt', '>=', startDate)
                    .where('isActive', '==', true)
                    .orderBy('createdAt', 'asc')
                    .get();
                const ratings = snapshot.docs.map(doc => doc.data());
                const averageRatingByDay = {};
                const totalRatingsByDay = {};
                const categoryDistribution = {};
                // Agrupar por día
                ratings.forEach(rating => {
                    const date = rating.createdAt.toDateString();
                    if (!averageRatingByDay[date]) {
                        averageRatingByDay[date] = 0;
                        totalRatingsByDay[date] = 0;
                    }
                    averageRatingByDay[date] += rating.rating;
                    totalRatingsByDay[date]++;
                    // Distribución por categoría
                    categoryDistribution[rating.category] = (categoryDistribution[rating.category] || 0) + 1;
                });
                // Calcular promedios
                Object.keys(averageRatingByDay).forEach(date => {
                    averageRatingByDay[date] = Math.round((averageRatingByDay[date] / totalRatingsByDay[date]) * 100) / 100;
                });
                return {
                    averageRatingByDay,
                    totalRatingsByDay,
                    categoryDistribution
                };
            }
            catch (error) {
                loggerService_1.logger.error('RatingService: Error al obtener tendencias de rating', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        days
                    }
                });
                throw error;
            }
        });
    }
}
exports.RatingService = RatingService;
exports.ratingService = new RatingService();
