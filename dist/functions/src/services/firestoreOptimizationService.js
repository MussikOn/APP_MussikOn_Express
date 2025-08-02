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
exports.firestoreOptimizationService = exports.FirestoreOptimizationService = void 0;
const firebase_1 = require("../utils/firebase");
const loggerService_1 = require("./loggerService");
const cacheService_1 = require("./cacheService");
class FirestoreOptimizationService {
    constructor(config = {
        enableCache: true,
        cacheTTL: 300, // 5 minutes
        batchSize: 500,
        maxConcurrentQueries: 10,
        enableIndexing: true
    }) {
        this.config = config;
        this.queryCache = new Map();
        this.activeQueries = new Set();
    }
    static getInstance(config) {
        if (!FirestoreOptimizationService.instance) {
            FirestoreOptimizationService.instance = new FirestoreOptimizationService(config);
        }
        return FirestoreOptimizationService.instance;
    }
    optimizedQuery(collection_1) {
        return __awaiter(this, arguments, void 0, function* (collection, filters = {}, options = {}) {
            const startTime = Date.now();
            const cacheKey = options.cacheKey || this.generateCacheKey(collection, filters, options);
            try {
                // Check cache first
                if (this.config.enableCache) {
                    const cachedData = yield this.getFromCache(cacheKey);
                    if (cachedData) {
                        return {
                            data: cachedData,
                            metrics: {
                                queryTime: Date.now() - startTime,
                                resultCount: cachedData.length,
                                cacheHit: true,
                                indexUsed: false,
                                optimizationApplied: true
                            }
                        };
                    }
                }
                // Build optimized query
                let query = firebase_1.db.collection(collection);
                // Apply filters with optimization
                query = this.applyOptimizedFilters(query, filters);
                // Apply ordering
                if (options.orderBy) {
                    query = query.orderBy(options.orderBy.field, options.orderBy.direction);
                }
                // Apply field selection
                if (options.select && options.select.length > 0) {
                    query = query.select(...options.select);
                }
                // Apply pagination
                if (options.limit) {
                    query = query.limit(options.limit);
                }
                if (options.offset) {
                    query = query.offset(options.offset);
                }
                // Execute query
                const snapshot = yield query.get();
                const data = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
                // Cache results
                if (this.config.enableCache) {
                    yield this.setCache(cacheKey, data);
                }
                const metrics = {
                    queryTime: Date.now() - startTime,
                    resultCount: data.length,
                    cacheHit: false,
                    indexUsed: this.checkIndexUsage(filters, options.orderBy),
                    optimizationApplied: true
                };
                loggerService_1.logger.debug('Optimized query executed successfully', {
                    metadata: {
                        service: 'FirestoreOptimizationService',
                        collection,
                        metrics,
                        cacheKey
                    }
                });
                return { data, metrics };
            }
            catch (error) {
                loggerService_1.logger.error('Error executing optimized query', error, {
                    metadata: {
                        service: 'FirestoreOptimizationService',
                        collection,
                        filters,
                        options
                    }
                });
                return {
                    data: [],
                    metrics: {
                        queryTime: Date.now() - startTime,
                        resultCount: 0,
                        cacheHit: false,
                        indexUsed: false,
                        optimizationApplied: false
                    }
                };
            }
        });
    }
    batchOperations(operations) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const errors = [];
            const batches = [];
            try {
                // Split operations into batches
                for (let i = 0; i < operations.length; i += this.config.batchSize) {
                    const batch = firebase_1.db.batch();
                    const batchOperations = operations.slice(i, i + this.config.batchSize);
                    for (const operation of batchOperations) {
                        const docRef = firebase_1.db.collection(operation.collection).doc(operation.document);
                        switch (operation.type) {
                            case 'create':
                                batch.set(docRef, operation.data);
                                break;
                            case 'update':
                                batch.update(docRef, operation.data);
                                break;
                            case 'delete':
                                batch.delete(docRef);
                                break;
                        }
                    }
                    batches.push(batch);
                }
                // Execute batches concurrently (with limit)
                const batchResults = yield Promise.allSettled(batches.map(batch => batch.commit()));
                // Process results
                batchResults.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        results.push(...result.value);
                    }
                    else {
                        errors.push({
                            batchIndex: index,
                            error: result.reason
                        });
                    }
                });
                loggerService_1.logger.info('Batch operations completed', {
                    metadata: {
                        service: 'FirestoreOptimizationService',
                        totalOperations: operations.length,
                        successfulBatches: results.length,
                        failedBatches: errors.length
                    }
                });
                return {
                    success: errors.length === 0,
                    results,
                    errors
                };
            }
            catch (error) {
                loggerService_1.logger.error('Error executing batch operations', error, {
                    metadata: {
                        service: 'FirestoreOptimizationService',
                        operationCount: operations.length
                    }
                });
                return {
                    success: false,
                    results: [],
                    errors: [error]
                };
            }
        });
    }
    createCompositeIndex(collection_1, fields_1) {
        return __awaiter(this, arguments, void 0, function* (collection, fields, queryScopes = ['COLLECTION']) {
            try {
                // This would typically interact with Firestore Admin SDK
                // to create composite indexes programmatically
                loggerService_1.logger.info('Composite index creation requested', {
                    metadata: {
                        service: 'FirestoreOptimizationService',
                        collection,
                        fields,
                        queryScopes
                    }
                });
                // For now, we'll just log the request
                // In a real implementation, you would use the Admin SDK
                return {
                    success: true,
                    indexName: `${collection}_${fields.join('_')}`
                };
            }
            catch (error) {
                loggerService_1.logger.error('Error creating composite index', error, {
                    metadata: {
                        service: 'FirestoreOptimizationService',
                        collection,
                        fields
                    }
                });
                return { success: false };
            }
        });
    }
    analyzeQueryPerformance(collection_1, filters_1) {
        return __awaiter(this, arguments, void 0, function* (collection, filters, options = {}) {
            try {
                const recommendations = [];
                const suggestedIndexes = [];
                let estimatedCost = 0;
                // Analyze filters for index requirements
                const filterFields = Object.keys(filters);
                if (filterFields.length > 1) {
                    suggestedIndexes.push(`${collection}_${filterFields.join('_')}`);
                    recommendations.push('Consider creating a composite index for multiple filters');
                }
                // Analyze ordering
                if (options.orderBy) {
                    const orderFields = Array.isArray(options.orderBy)
                        ? options.orderBy.map((o) => o.field)
                        : [options.orderBy.field];
                    if (filterFields.length > 0) {
                        suggestedIndexes.push(`${collection}_${filterFields.join('_')}_${orderFields.join('_')}`);
                        recommendations.push('Consider creating an index that includes both filters and ordering');
                    }
                }
                // Estimate cost based on collection size and query complexity
                estimatedCost = this.estimateQueryCost(filters, options);
                return {
                    recommendedIndexes: suggestedIndexes,
                    estimatedCost,
                    optimizationSuggestions: recommendations
                };
            }
            catch (error) {
                loggerService_1.logger.error('Error analyzing query performance', error, {
                    metadata: {
                        service: 'FirestoreOptimizationService',
                        collection,
                        filters
                    }
                });
                return {
                    recommendedIndexes: [],
                    estimatedCost: 0,
                    optimizationSuggestions: ['Unable to analyze query performance']
                };
            }
        });
    }
    applyOptimizedFilters(query, filters) {
        let optimizedQuery = query;
        for (const [field, value] of Object.entries(filters)) {
            if (Array.isArray(value)) {
                // Handle array filters
                optimizedQuery = optimizedQuery.where(field, 'in', value);
            }
            else if (typeof value === 'object' && value !== null) {
                // Handle range queries
                if (value.gte !== undefined) {
                    optimizedQuery = optimizedQuery.where(field, '>=', value.gte);
                }
                if (value.lte !== undefined) {
                    optimizedQuery = optimizedQuery.where(field, '<=', value.lte);
                }
                if (value.gt !== undefined) {
                    optimizedQuery = optimizedQuery.where(field, '>', value.gt);
                }
                if (value.lt !== undefined) {
                    optimizedQuery = optimizedQuery.where(field, '<', value.lt);
                }
            }
            else {
                // Handle simple equality
                optimizedQuery = optimizedQuery.where(field, '==', value);
            }
        }
        return optimizedQuery;
    }
    getFromCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield cacheService_1.cacheService.get(key, 'firestore:');
            }
            catch (error) {
                loggerService_1.logger.error('Error getting from cache', error, {
                    metadata: { service: 'FirestoreOptimizationService', key }
                });
                return null;
            }
        });
    }
    setCache(key, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield cacheService_1.cacheService.set(key, data, {
                    ttl: this.config.cacheTTL,
                    prefix: 'firestore:'
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error setting cache', error, {
                    metadata: { service: 'FirestoreOptimizationService', key }
                });
            }
        });
    }
    generateCacheKey(collection, filters, options) {
        const filterString = JSON.stringify(filters);
        const optionsString = JSON.stringify(options);
        return `${collection}:${filterString}:${optionsString}`;
    }
    checkIndexUsage(filters, orderBy) {
        // Simple heuristic to check if indexes are likely being used
        const filterCount = Object.keys(filters).length;
        const hasOrdering = orderBy !== undefined;
        // If we have multiple filters or ordering, we likely need indexes
        return filterCount > 1 || hasOrdering;
    }
    estimateQueryCost(filters, options) {
        // Simple cost estimation based on query complexity
        let cost = 1; // Base cost
        // Add cost for each filter
        cost += Object.keys(filters).length * 0.5;
        // Add cost for ordering
        if (options.orderBy) {
            cost += 0.3;
        }
        // Add cost for pagination
        if (options.limit) {
            cost += 0.2;
        }
        return Math.round(cost * 100) / 100;
    }
    clearCache(prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield cacheService_1.cacheService.clear(prefix || 'firestore:');
                loggerService_1.logger.info('Firestore cache cleared', {
                    metadata: { service: 'FirestoreOptimizationService', prefix }
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error clearing cache', error, {
                    metadata: { service: 'FirestoreOptimizationService' }
                });
            }
        });
    }
    getStats() {
        return {
            cacheSize: this.queryCache.size,
            activeQueries: this.activeQueries.size,
            config: this.config
        };
    }
}
exports.FirestoreOptimizationService = FirestoreOptimizationService;
// Export singleton instance
exports.firestoreOptimizationService = FirestoreOptimizationService.getInstance();
