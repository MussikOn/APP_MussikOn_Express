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
exports.OptimizationController = void 0;
const loggerService_1 = require("../services/loggerService");
const cacheService_1 = require("../services/cacheService");
const firestoreOptimizationService_1 = require("../services/firestoreOptimizationService");
const queryOptimizationMiddleware_1 = require("../middleware/queryOptimizationMiddleware");
class OptimizationController {
    getCacheStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield cacheService_1.cacheService.getStats();
                const firestoreStats = firestoreOptimizationService_1.firestoreOptimizationService.getStats();
                const response = {
                    success: true,
                    data: {
                        cache: {
                            hits: stats.hits,
                            misses: stats.misses,
                            keys: stats.keys,
                            hitRate: stats.hits + stats.misses > 0 ?
                                (stats.hits / (stats.hits + stats.misses)) * 100 : 0
                        },
                        firestore: {
                            cacheSize: firestoreStats.cacheSize,
                            activeQueries: firestoreStats.activeQueries,
                            config: firestoreStats.config
                        },
                        timestamp: new Date().toISOString()
                    }
                };
                loggerService_1.logger.info('Cache stats retrieved successfully', {
                    metadata: { service: 'OptimizationController', stats: response.data }
                });
                res.status(200).json(response);
            }
            catch (error) {
                loggerService_1.logger.error('Error getting cache stats', error, {
                    metadata: { service: 'OptimizationController' }
                });
                res.status(500).json({
                    success: false,
                    message: 'Error retrieving cache statistics',
                    error: error.message
                });
            }
        });
    }
    clearCache(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { prefix } = req.query;
                const prefixString = prefix || undefined;
                yield cacheService_1.cacheService.clear(prefixString);
                yield firestoreOptimizationService_1.firestoreOptimizationService.clearCache(prefixString);
                const response = {
                    success: true,
                    message: 'Cache cleared successfully',
                    data: {
                        prefix: prefixString || 'all',
                        timestamp: new Date().toISOString()
                    }
                };
                loggerService_1.logger.info('Cache cleared successfully', {
                    metadata: { service: 'OptimizationController', prefix: prefixString }
                });
                res.status(200).json(response);
            }
            catch (error) {
                loggerService_1.logger.error('Error clearing cache', error, {
                    metadata: { service: 'OptimizationController' }
                });
                res.status(500).json({
                    success: false,
                    message: 'Error clearing cache',
                    error: error.message
                });
            }
        });
    }
    analyzeQueryPerformance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { collection, filters, options } = req.body;
                if (!collection) {
                    res.status(400).json({
                        success: false,
                        message: 'Collection name is required'
                    });
                    return;
                }
                const analysis = yield firestoreOptimizationService_1.firestoreOptimizationService.analyzeQueryPerformance(collection, filters || {}, options || {});
                const response = {
                    success: true,
                    data: {
                        collection,
                        analysis,
                        timestamp: new Date().toISOString()
                    }
                };
                loggerService_1.logger.info('Query performance analysis completed', {
                    metadata: {
                        service: 'OptimizationController',
                        collection,
                        analysis
                    }
                });
                res.status(200).json(response);
            }
            catch (error) {
                loggerService_1.logger.error('Error analyzing query performance', error, {
                    metadata: { service: 'OptimizationController' }
                });
                res.status(500).json({
                    success: false,
                    message: 'Error analyzing query performance',
                    error: error.message
                });
            }
        });
    }
    createCompositeIndex(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { collection, fields, queryScopes } = req.body;
                if (!collection || !fields || !Array.isArray(fields)) {
                    res.status(400).json({
                        success: false,
                        message: 'Collection name and fields array are required'
                    });
                    return;
                }
                const result = yield firestoreOptimizationService_1.firestoreOptimizationService.createCompositeIndex(collection, fields, queryScopes || ['COLLECTION']);
                const response = {
                    success: result.success,
                    message: result.success ? 'Composite index creation requested' : 'Failed to create composite index',
                    data: {
                        collection,
                        fields,
                        indexName: result.indexName,
                        timestamp: new Date().toISOString()
                    }
                };
                loggerService_1.logger.info('Composite index creation requested', {
                    metadata: {
                        service: 'OptimizationController',
                        collection,
                        fields,
                        result
                    }
                });
                res.status(result.success ? 200 : 500).json(response);
            }
            catch (error) {
                loggerService_1.logger.error('Error creating composite index', error, {
                    metadata: { service: 'OptimizationController' }
                });
                res.status(500).json({
                    success: false,
                    message: 'Error creating composite index',
                    error: error.message
                });
            }
        });
    }
    getOptimizationStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cacheStats = yield cacheService_1.cacheService.getStats();
                const firestoreStats = firestoreOptimizationService_1.firestoreOptimizationService.getStats();
                const queryStats = queryOptimizationMiddleware_1.QueryOptimizationMiddleware.getQueryStats(req);
                const response = {
                    success: true,
                    data: {
                        cache: {
                            hits: cacheStats.hits,
                            misses: cacheStats.misses,
                            keys: cacheStats.keys,
                            hitRate: cacheStats.hits + cacheStats.misses > 0 ?
                                (cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100 : 0
                        },
                        firestore: {
                            cacheSize: firestoreStats.cacheSize,
                            activeQueries: firestoreStats.activeQueries,
                            config: firestoreStats.config
                        },
                        query: {
                            queryTime: queryStats.queryTime,
                            resultCount: queryStats.resultCount,
                            cacheHit: queryStats.cacheHit,
                            optimizationApplied: queryStats.optimizationApplied
                        },
                        system: {
                            memoryUsage: process.memoryUsage(),
                            uptime: process.uptime(),
                            nodeVersion: process.version
                        },
                        timestamp: new Date().toISOString()
                    }
                };
                loggerService_1.logger.info('Optimization stats retrieved successfully', {
                    metadata: { service: 'OptimizationController', stats: response.data }
                });
                res.status(200).json(response);
            }
            catch (error) {
                loggerService_1.logger.error('Error getting optimization stats', error, {
                    metadata: { service: 'OptimizationController' }
                });
                res.status(500).json({
                    success: false,
                    message: 'Error retrieving optimization statistics',
                    error: error.message
                });
            }
        });
    }
    optimizeQuery(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { collection, filters, options } = req.body;
                if (!collection) {
                    res.status(400).json({
                        success: false,
                        message: 'Collection name is required'
                    });
                    return;
                }
                const result = yield firestoreOptimizationService_1.firestoreOptimizationService.optimizedQuery(collection, filters || {}, options || {});
                const response = {
                    success: true,
                    data: {
                        collection,
                        results: result.data,
                        metrics: result.metrics,
                        timestamp: new Date().toISOString()
                    }
                };
                loggerService_1.logger.info('Optimized query executed successfully', {
                    metadata: {
                        service: 'OptimizationController',
                        collection,
                        metrics: result.metrics
                    }
                });
                res.status(200).json(response);
            }
            catch (error) {
                loggerService_1.logger.error('Error executing optimized query', error, {
                    metadata: { service: 'OptimizationController' }
                });
                res.status(500).json({
                    success: false,
                    message: 'Error executing optimized query',
                    error: error.message
                });
            }
        });
    }
    batchOperations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { operations } = req.body;
                if (!operations || !Array.isArray(operations)) {
                    res.status(400).json({
                        success: false,
                        message: 'Operations array is required'
                    });
                    return;
                }
                const result = yield firestoreOptimizationService_1.firestoreOptimizationService.batchOperations(operations);
                const response = {
                    success: result.success,
                    message: result.success ? 'Batch operations completed successfully' : 'Some batch operations failed',
                    data: {
                        totalOperations: operations.length,
                        successfulResults: result.results.length,
                        errors: result.errors,
                        timestamp: new Date().toISOString()
                    }
                };
                loggerService_1.logger.info('Batch operations completed', {
                    metadata: {
                        service: 'OptimizationController',
                        totalOperations: operations.length,
                        success: result.success
                    }
                });
                res.status(result.success ? 200 : 207).json(response);
            }
            catch (error) {
                loggerService_1.logger.error('Error executing batch operations', error, {
                    metadata: { service: 'OptimizationController' }
                });
                res.status(500).json({
                    success: false,
                    message: 'Error executing batch operations',
                    error: error.message
                });
            }
        });
    }
    healthCheck(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cacheStats = yield cacheService_1.cacheService.getStats();
                const firestoreStats = firestoreOptimizationService_1.firestoreOptimizationService.getStats();
                const healthStatus = {
                    status: 'healthy',
                    services: {
                        cache: cacheStats.keys > 0 ? 'healthy' : 'warning',
                        firestore: firestoreStats.activeQueries < 100 ? 'healthy' : 'warning',
                        memory: process.memoryUsage().heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'warning' // 500MB
                    },
                    timestamp: new Date().toISOString()
                };
                // Determine overall status
                const serviceStatuses = Object.values(healthStatus.services);
                if (serviceStatuses.includes('unhealthy')) {
                    healthStatus.status = 'unhealthy';
                }
                else if (serviceStatuses.includes('warning')) {
                    healthStatus.status = 'degraded';
                }
                const response = {
                    success: true,
                    data: healthStatus
                };
                loggerService_1.logger.info('Health check completed', {
                    metadata: { service: 'OptimizationController', healthStatus }
                });
                res.status(200).json(response);
            }
            catch (error) {
                loggerService_1.logger.error('Error during health check', error, {
                    metadata: { service: 'OptimizationController' }
                });
                res.status(500).json({
                    success: false,
                    status: 'unhealthy',
                    message: 'Health check failed',
                    error: error.message
                });
            }
        });
    }
}
exports.OptimizationController = OptimizationController;
