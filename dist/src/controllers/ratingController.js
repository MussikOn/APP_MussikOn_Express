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
exports.ratingController = exports.RatingController = void 0;
const ratingService_1 = require("../services/ratingService");
const loggerService_1 = require("../services/loggerService");
class RatingController {
    /**
     * Crear un nuevo rating
     */
    createRating(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { eventId, musicianId, rating, review, category } = req.body;
                const eventCreatorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!eventCreatorId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                // Validaciones
                if (!eventId || !musicianId || !rating || !category) {
                    res.status(400).json({
                        success: false,
                        message: 'Faltan campos requeridos: eventId, musicianId, rating, category'
                    });
                    return;
                }
                if (rating < 1 || rating > 5) {
                    res.status(400).json({
                        success: false,
                        message: 'El rating debe estar entre 1 y 5 estrellas'
                    });
                    return;
                }
                if (category !== 'musician' && category !== 'event_creator') {
                    res.status(400).json({
                        success: false,
                        message: 'Categoría debe ser "musician" o "event_creator"'
                    });
                    return;
                }
                const newRating = yield ratingService_1.ratingService.createRating({
                    eventId,
                    musicianId,
                    eventCreatorId,
                    rating,
                    review,
                    category,
                    isVerified: false // Se verificará cuando el evento esté completado
                });
                loggerService_1.logger.info('RatingController: Rating creado exitosamente', {
                    metadata: {
                        ratingId: newRating.id,
                        eventId,
                        musicianId,
                        category
                    }
                });
                res.status(201).json({
                    success: true,
                    message: 'Rating creado exitosamente',
                    rating: newRating
                });
            }
            catch (error) {
                loggerService_1.logger.error('RatingController: Error al crear rating', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        context: 'rating'
                    }
                });
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Error interno del servidor'
                });
            }
        });
    }
    /**
     * Obtener ratings de un usuario
     */
    getUserRatings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, category } = req.params;
                const { minRating, maxRating, isVerified, dateFrom, dateTo } = req.query;
                if (!userId || !category) {
                    res.status(400).json({
                        success: false,
                        message: 'Faltan parámetros requeridos: userId, category'
                    });
                    return;
                }
                if (category !== 'musician' && category !== 'event_creator') {
                    res.status(400).json({
                        success: false,
                        message: 'Categoría debe ser "musician" o "event_creator"'
                    });
                    return;
                }
                const filters = {
                    minRating: minRating ? parseInt(minRating) : undefined,
                    maxRating: maxRating ? parseInt(maxRating) : undefined,
                    isVerified: isVerified ? isVerified === 'true' : undefined,
                    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
                    dateTo: dateTo ? new Date(dateTo) : undefined
                };
                const ratings = yield ratingService_1.ratingService.getUserRatings(userId, category, filters);
                loggerService_1.logger.info('RatingController: Ratings obtenidos exitosamente', {
                    metadata: {
                        userId,
                        category,
                        count: ratings.length
                    }
                });
                res.status(200).json({
                    success: true,
                    message: 'Ratings obtenidos exitosamente',
                    ratings,
                    count: ratings.length
                });
            }
            catch (error) {
                loggerService_1.logger.error('RatingController: Error al obtener ratings de usuario', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        context: 'rating'
                    }
                });
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Error interno del servidor'
                });
            }
        });
    }
    /**
     * Obtener estadísticas de rating de un usuario
     */
    getUserRatingStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, category } = req.params;
                if (!userId || !category) {
                    res.status(400).json({
                        success: false,
                        message: 'Faltan parámetros requeridos: userId, category'
                    });
                    return;
                }
                if (category !== 'musician' && category !== 'event_creator') {
                    res.status(400).json({
                        success: false,
                        message: 'Categoría debe ser "musician" o "event_creator"'
                    });
                    return;
                }
                const stats = yield ratingService_1.ratingService.getUserRatingStats(userId, category);
                loggerService_1.logger.info('RatingController: Estadísticas de rating obtenidas exitosamente', {
                    metadata: {
                        userId,
                        category,
                        averageRating: stats.averageRating
                    }
                });
                res.status(200).json({
                    success: true,
                    message: 'Estadísticas obtenidas exitosamente',
                    stats
                });
            }
            catch (error) {
                loggerService_1.logger.error('RatingController: Error al obtener estadísticas de rating', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        context: 'rating'
                    }
                });
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Error interno del servidor'
                });
            }
        });
    }
    /**
     * Actualizar rating
     */
    updateRating(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { ratingId } = req.params;
                const { rating, review, isActive } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                if (!ratingId) {
                    res.status(400).json({
                        success: false,
                        message: 'ID de rating requerido'
                    });
                    return;
                }
                // Verificar que el usuario sea el propietario del rating
                const existingRating = yield ratingService_1.ratingService.getRatingById(ratingId);
                if (!existingRating) {
                    res.status(404).json({
                        success: false,
                        message: 'Rating no encontrado'
                    });
                    return;
                }
                if (existingRating.eventCreatorId !== userId) {
                    res.status(403).json({
                        success: false,
                        message: 'No tienes permisos para actualizar este rating'
                    });
                    return;
                }
                const updates = {};
                if (rating !== undefined) {
                    if (rating < 1 || rating > 5) {
                        res.status(400).json({
                            success: false,
                            message: 'El rating debe estar entre 1 y 5 estrellas'
                        });
                        return;
                    }
                    updates.rating = rating;
                }
                if (review !== undefined) {
                    updates.review = review;
                }
                if (isActive !== undefined) {
                    updates.isActive = isActive;
                }
                const updatedRating = yield ratingService_1.ratingService.updateRating(ratingId, updates);
                loggerService_1.logger.info('RatingController: Rating actualizado exitosamente', {
                    metadata: {
                        ratingId,
                        userId
                    }
                });
                res.status(200).json({
                    success: true,
                    message: 'Rating actualizado exitosamente',
                    rating: updatedRating
                });
            }
            catch (error) {
                loggerService_1.logger.error('RatingController: Error al actualizar rating', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        context: 'rating'
                    }
                });
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Error interno del servidor'
                });
            }
        });
    }
    /**
     * Marcar rating como útil
     */
    markRatingAsHelpful(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { ratingId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                if (!ratingId) {
                    res.status(400).json({
                        success: false,
                        message: 'ID de rating requerido'
                    });
                    return;
                }
                yield ratingService_1.ratingService.markRatingAsHelpful(ratingId);
                loggerService_1.logger.info('RatingController: Rating marcado como útil', {
                    metadata: {
                        ratingId,
                        userId
                    }
                });
                res.status(200).json({
                    success: true,
                    message: 'Rating marcado como útil exitosamente'
                });
            }
            catch (error) {
                loggerService_1.logger.error('RatingController: Error al marcar rating como útil', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        context: 'rating'
                    }
                });
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Error interno del servidor'
                });
            }
        });
    }
    /**
     * Reportar rating
     */
    reportRating(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { ratingId } = req.params;
                const { reason } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                if (!ratingId || !reason) {
                    res.status(400).json({
                        success: false,
                        message: 'ID de rating y razón requeridos'
                    });
                    return;
                }
                yield ratingService_1.ratingService.reportRating(ratingId, reason);
                loggerService_1.logger.warn('RatingController: Rating reportado', {
                    metadata: {
                        ratingId,
                        userId,
                        reason
                    }
                });
                res.status(200).json({
                    success: true,
                    message: 'Rating reportado exitosamente'
                });
            }
            catch (error) {
                loggerService_1.logger.error('RatingController: Error al reportar rating', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        context: 'rating'
                    }
                });
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Error interno del servidor'
                });
            }
        });
    }
    /**
     * Obtener ratings de un evento
     */
    getEventRatings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { eventId } = req.params;
                if (!eventId) {
                    res.status(400).json({
                        success: false,
                        message: 'ID de evento requerido'
                    });
                    return;
                }
                const ratings = yield ratingService_1.ratingService.getEventRatings(eventId);
                loggerService_1.logger.info('RatingController: Ratings del evento obtenidos exitosamente', {
                    metadata: {
                        eventId,
                        count: ratings.length
                    }
                });
                res.status(200).json({
                    success: true,
                    message: 'Ratings del evento obtenidos exitosamente',
                    ratings,
                    count: ratings.length
                });
            }
            catch (error) {
                loggerService_1.logger.error('RatingController: Error al obtener ratings del evento', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        context: 'rating'
                    }
                });
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Error interno del servidor'
                });
            }
        });
    }
    /**
     * Obtener top músicos por rating
     */
    getTopRatedMusicians(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { limit = '10', minRatings = '5' } = req.query;
                const musicians = yield ratingService_1.ratingService.getTopRatedMusicians(parseInt(limit), parseInt(minRatings));
                loggerService_1.logger.info('RatingController: Top músicos obtenidos exitosamente', {
                    metadata: {
                        count: musicians.length,
                        limit: parseInt(limit),
                        minRatings: parseInt(minRatings)
                    }
                });
                res.status(200).json({
                    success: true,
                    message: 'Top músicos obtenidos exitosamente',
                    musicians,
                    count: musicians.length
                });
            }
            catch (error) {
                loggerService_1.logger.error('RatingController: Error al obtener top músicos', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        context: 'rating'
                    }
                });
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Error interno del servidor'
                });
            }
        });
    }
    /**
     * Obtener tendencias de rating
     */
    getRatingTrends(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { days = '30' } = req.query;
                const trends = yield ratingService_1.ratingService.getRatingTrends(parseInt(days));
                loggerService_1.logger.info('RatingController: Tendencias de rating obtenidas exitosamente', {
                    metadata: {
                        days: parseInt(days)
                    }
                });
                res.status(200).json({
                    success: true,
                    message: 'Tendencias de rating obtenidas exitosamente',
                    trends
                });
            }
            catch (error) {
                loggerService_1.logger.error('RatingController: Error al obtener tendencias de rating', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        context: 'rating'
                    }
                });
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Error interno del servidor'
                });
            }
        });
    }
    /**
     * Obtener ratings más útiles de un usuario
     */
    getMostHelpfulRatings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, category } = req.params;
                const { limit = '5' } = req.query;
                if (!userId || !category) {
                    res.status(400).json({
                        success: false,
                        message: 'Faltan parámetros requeridos: userId, category'
                    });
                    return;
                }
                if (category !== 'musician' && category !== 'event_creator') {
                    res.status(400).json({
                        success: false,
                        message: 'Categoría debe ser "musician" o "event_creator"'
                    });
                    return;
                }
                const ratings = yield ratingService_1.ratingService.getMostHelpfulRatings(userId, category, parseInt(limit));
                loggerService_1.logger.info('RatingController: Ratings más útiles obtenidos exitosamente', {
                    metadata: {
                        userId,
                        category,
                        count: ratings.length
                    }
                });
                res.status(200).json({
                    success: true,
                    message: 'Ratings más útiles obtenidos exitosamente',
                    ratings,
                    count: ratings.length
                });
            }
            catch (error) {
                loggerService_1.logger.error('RatingController: Error al obtener ratings más útiles', error instanceof Error ? error : new Error('Error desconocido'), {
                    metadata: {
                        context: 'rating'
                    }
                });
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Error interno del servidor'
                });
            }
        });
    }
}
exports.RatingController = RatingController;
exports.ratingController = new RatingController();
