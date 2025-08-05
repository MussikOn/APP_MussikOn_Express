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
exports.RateCalculationService = void 0;
const firebase_1 = require("../utils/firebase");
const loggerService_1 = require("./loggerService");
class RateCalculationService {
    constructor() {
        this.COLLECTION_RATES = 'musician_rates';
        this.COLLECTION_MARKET_DATA = 'market_data';
        this.COLLECTION_PERFORMANCE = 'musician_performance';
        // Tarifas base por instrumento (por hora)
        this.BASE_RATES = {
            'guitarra': 50,
            'piano': 60,
            'violin': 70,
            'bateria': 55,
            'bajo': 45,
            'saxofon': 65,
            'trompeta': 60,
            'flauta': 55,
            'canto': 80,
            'dj': 100,
            'banda_completa': 300
        };
        // Multiplicadores por tipo de evento
        this.EVENT_TYPE_MULTIPLIERS = {
            'wedding': 1.5,
            'corporate': 1.3,
            'birthday': 1.0,
            'anniversary': 1.2,
            'graduation': 1.1,
            'party': 1.0,
            'ceremony': 1.4,
            'concert': 1.6,
            'festival': 1.8,
            'private': 1.2
        };
        // Multiplicadores por ubicación
        this.LOCATION_MULTIPLIERS = {
            'madrid': 1.3,
            'barcelona': 1.4,
            'valencia': 1.1,
            'sevilla': 1.0,
            'bilbao': 1.2,
            'malaga': 1.1,
            'granada': 0.9,
            'alicante': 1.0,
            'murcia': 0.9,
            'zaragoza': 1.1
        };
    }
    /**
     * Obtener datos del mercado (método público)
     */
    getPublicMarketData(instrument, location, eventType) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getMarketData(instrument, location, eventType);
        });
    }
    /**
     * Calcular tarifa automática para un músico
     */
    calculateRate(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Calculando tarifa para músico:', { context: 'Rate', metadata: { musicianId: request.musicianId } });
                // Obtener datos del músico
                const musicianData = yield this.getMusicianData(request.musicianId);
                // Obtener datos del mercado
                const marketData = yield this.getMarketData(request.instrument, request.location, request.eventType);
                // Calcular factores
                const factors = yield this.calculateFactors(request, musicianData, marketData);
                // Calcular tarifa base
                const baseRate = this.BASE_RATES[request.instrument] || 50;
                // Calcular tarifa final
                const finalRate = this.calculateFinalRate(baseRate, factors);
                // Generar breakdown
                const breakdown = this.generateBreakdown(baseRate, factors);
                // Generar recomendaciones
                const recommendations = yield this.generateRecommendations(request, finalRate, marketData);
                const result = {
                    baseRate,
                    finalRate,
                    breakdown,
                    factors,
                    recommendations
                };
                loggerService_1.logger.info('Cálculo de tarifa completado', {
                    metadata: {
                        musicianId: request.musicianId,
                        baseRate,
                        finalRate,
                        factors
                    }
                });
                return result;
            }
            catch (error) {
                loggerService_1.logger.error('Error calculando tarifa', error, {
                    metadata: { request }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener datos del músico
     */
    getMusicianData(musicianId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const performanceRef = firebase_1.db.collection(this.COLLECTION_PERFORMANCE).doc(musicianId);
                const doc = yield performanceRef.get();
                if (doc.exists) {
                    const data = doc.data();
                    return {
                        experience: (data === null || data === void 0 ? void 0 : data.experience) || 1,
                        rating: (data === null || data === void 0 ? void 0 : data.rating) || 3.0,
                        totalEvents: (data === null || data === void 0 ? void 0 : data.totalEvents) || 0,
                        completedEvents: (data === null || data === void 0 ? void 0 : data.completedEvents) || 0,
                        averageResponseTime: (data === null || data === void 0 ? void 0 : data.averageResponseTime) || 60,
                        specializations: (data === null || data === void 0 ? void 0 : data.specializations) || []
                    };
                }
                // Datos por defecto para músicos nuevos
                return {
                    experience: 1,
                    rating: 3.0,
                    totalEvents: 0,
                    completedEvents: 0,
                    averageResponseTime: 60,
                    specializations: []
                };
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo datos del músico', error, {
                    metadata: { musicianId }
                });
                throw error;
            }
        });
    }
    /**
     * Obtener datos del mercado
     */
    getMarketData(instrument, location, eventType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const marketRef = firebase_1.db.collection(this.COLLECTION_MARKET_DATA)
                    .where('instrument', '==', instrument)
                    .where('location', '==', location)
                    .where('eventType', '==', eventType);
                const snapshot = yield marketRef.get();
                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data();
                    return {
                        averageRate: data.averageRate || 50,
                        minRate: data.minRate || 30,
                        maxRate: data.maxRate || 100,
                        demandLevel: data.demandLevel || 'medium',
                        seasonalityFactor: data.seasonalityFactor || 1.0
                    };
                }
                // Datos por defecto
                return {
                    averageRate: 50,
                    minRate: 30,
                    maxRate: 100,
                    demandLevel: 'medium',
                    seasonalityFactor: 1.0
                };
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo datos del mercado', error, {
                    metadata: { instrument, location, eventType }
                });
                throw error;
            }
        });
    }
    /**
     * Calcular factores de multiplicación
     */
    calculateFactors(request, musicianData, marketData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Factor de experiencia
            const experienceMultiplier = this.calculateExperienceMultiplier(musicianData.experience);
            // Factor de demanda del mercado
            const demandMultiplier = this.calculateDemandMultiplier(marketData.demandLevel);
            // Factor de ubicación
            const locationMultiplier = this.LOCATION_MULTIPLIERS[request.location.toLowerCase()] || 1.0;
            // Factor de tipo de evento
            const eventTypeMultiplier = this.EVENT_TYPE_MULTIPLIERS[request.eventType.toLowerCase()] || 1.0;
            // Factor de duración
            const durationMultiplier = this.calculateDurationMultiplier(request.duration);
            // Factor de urgencia
            const urgencyMultiplier = request.isUrgent ? 1.3 : 1.0;
            // Factor de estacionalidad
            const seasonalityMultiplier = this.calculateSeasonalityMultiplier(request.eventDate, marketData.seasonalityFactor);
            // Factor de rendimiento del músico
            const performanceMultiplier = this.calculatePerformanceMultiplier(musicianData);
            return {
                baseRate: this.BASE_RATES[request.instrument] || 50,
                experienceMultiplier,
                demandMultiplier,
                locationMultiplier,
                eventTypeMultiplier,
                durationMultiplier,
                urgencyMultiplier,
                seasonalityMultiplier: seasonalityMultiplier * performanceMultiplier
            };
        });
    }
    /**
     * Calcular multiplicador por experiencia
     */
    calculateExperienceMultiplier(experience) {
        if (experience < 1)
            return 0.8;
        if (experience < 3)
            return 1.0;
        if (experience < 5)
            return 1.2;
        if (experience < 10)
            return 1.4;
        return 1.6; // 10+ años
    }
    /**
     * Calcular multiplicador por demanda
     */
    calculateDemandMultiplier(demandLevel) {
        switch (demandLevel) {
            case 'low': return 0.9;
            case 'medium': return 1.0;
            case 'high': return 1.3;
            default: return 1.0;
        }
    }
    /**
     * Calcular multiplicador por duración
     */
    calculateDurationMultiplier(duration) {
        const hours = duration / 60;
        if (hours <= 1)
            return 1.0;
        if (hours <= 2)
            return 0.9;
        if (hours <= 4)
            return 0.85;
        if (hours <= 6)
            return 0.8;
        return 0.75; // Más de 6 horas
    }
    /**
     * Calcular multiplicador por estacionalidad
     */
    calculateSeasonalityMultiplier(eventDate, baseFactor) {
        const month = eventDate.getMonth() + 1;
        // Meses de alta temporada (verano, diciembre)
        if (month === 6 || month === 7 || month === 8 || month === 12) {
            return baseFactor * 1.2;
        }
        // Meses de temporada media (primavera, otoño)
        if (month === 3 || month === 4 || month === 5 || month === 9 || month === 10) {
            return baseFactor * 1.1;
        }
        // Meses de baja temporada (enero, febrero, noviembre)
        return baseFactor * 0.9;
    }
    /**
     * Calcular multiplicador por rendimiento
     */
    calculatePerformanceMultiplier(musicianData) {
        const ratingMultiplier = musicianData.rating / 5.0;
        const completionRate = musicianData.totalEvents > 0 ?
            musicianData.completedEvents / musicianData.totalEvents : 0.8;
        const responseMultiplier = Math.max(0.8, 1.0 - (musicianData.averageResponseTime - 30) / 120);
        return (ratingMultiplier + completionRate + responseMultiplier) / 3;
    }
    /**
     * Calcular tarifa final
     */
    calculateFinalRate(baseRate, factors) {
        const finalRate = baseRate *
            factors.experienceMultiplier *
            factors.demandMultiplier *
            factors.locationMultiplier *
            factors.eventTypeMultiplier *
            factors.durationMultiplier *
            factors.urgencyMultiplier *
            factors.seasonalityMultiplier;
        // Redondear a múltiplos de 5
        return Math.round(finalRate / 5) * 5;
    }
    /**
     * Generar breakdown detallado
     */
    generateBreakdown(baseRate, factors) {
        return [
            {
                factor: 'Tarifa Base',
                multiplier: 1.0,
                amount: baseRate
            },
            {
                factor: 'Experiencia',
                multiplier: factors.experienceMultiplier,
                amount: baseRate * (factors.experienceMultiplier - 1)
            },
            {
                factor: 'Demanda del Mercado',
                multiplier: factors.demandMultiplier,
                amount: baseRate * (factors.demandMultiplier - 1)
            },
            {
                factor: 'Ubicación',
                multiplier: factors.locationMultiplier,
                amount: baseRate * (factors.locationMultiplier - 1)
            },
            {
                factor: 'Tipo de Evento',
                multiplier: factors.eventTypeMultiplier,
                amount: baseRate * (factors.eventTypeMultiplier - 1)
            },
            {
                factor: 'Duración',
                multiplier: factors.durationMultiplier,
                amount: baseRate * (factors.durationMultiplier - 1)
            },
            {
                factor: 'Urgencia',
                multiplier: factors.urgencyMultiplier,
                amount: baseRate * (factors.urgencyMultiplier - 1)
            },
            {
                factor: 'Estacionalidad y Rendimiento',
                multiplier: factors.seasonalityMultiplier,
                amount: baseRate * (factors.seasonalityMultiplier - 1)
            }
        ];
    }
    /**
     * Generar recomendaciones
     */
    generateRecommendations(request, calculatedRate, marketData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Obtener tarifas de competidores
            const competitorRates = yield this.getCompetitorRates(request.instrument, request.location);
            // Calcular tarifa sugerida basada en el mercado
            const suggestedRate = Math.max(marketData.minRate, Math.min(marketData.maxRate, calculatedRate));
            return {
                suggestedRate,
                marketAverage: marketData.averageRate,
                competitorRates
            };
        });
    }
    /**
     * Obtener tarifas de competidores
     */
    getCompetitorRates(instrument, location) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ratesRef = firebase_1.db.collection(this.COLLECTION_RATES)
                    .where('instrument', '==', instrument)
                    .where('location', '==', location)
                    .orderBy('rate', 'desc')
                    .limit(5);
                const snapshot = yield ratesRef.get();
                return snapshot.docs.map(doc => doc.data().rate);
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo tarifas de competidores', error, {
                    metadata: { instrument, location }
                });
                return [];
            }
        });
    }
    /**
     * Actualizar datos del mercado
     */
    updateMarketData(instrument, location, eventType, rate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('[src/services/rateCalculationService.ts:350] Actualizando datos del mercado');
                const marketRef = firebase_1.db.collection(this.COLLECTION_MARKET_DATA)
                    .where('instrument', '==', instrument)
                    .where('location', '==', location)
                    .where('eventType', '==', eventType);
                const snapshot = yield marketRef.get();
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    const data = doc.data();
                    // Actualizar promedio
                    const newAverage = (data.averageRate * data.count + rate) / (data.count + 1);
                    const newMin = Math.min(data.minRate, rate);
                    const newMax = Math.max(data.maxRate, rate);
                    yield doc.ref.update({
                        averageRate: newAverage,
                        minRate: newMin,
                        maxRate: newMax,
                        count: data.count + 1,
                        updatedAt: new Date()
                    });
                }
                else {
                    // Crear nuevo registro
                    yield firebase_1.db.collection(this.COLLECTION_MARKET_DATA).add({
                        instrument,
                        location,
                        eventType,
                        averageRate: rate,
                        minRate: rate,
                        maxRate: rate,
                        count: 1,
                        demandLevel: 'medium',
                        seasonalityFactor: 1.0,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }
            catch (error) {
                loggerService_1.logger.error('Error actualizando datos del mercado', error, {
                    metadata: { instrument, location, eventType, rate }
                });
                throw error;
            }
        });
    }
}
exports.RateCalculationService = RateCalculationService;
