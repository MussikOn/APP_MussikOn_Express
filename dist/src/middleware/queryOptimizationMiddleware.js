"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryOptimizationMiddleware = exports.QueryOptimizationMiddleware = void 0;
const loggerService_1 = require("../services/loggerService");
class QueryOptimizationMiddleware {
    constructor(options = {}) {
        this.options = Object.assign({ maxLimit: 100, defaultLimit: 20, maxPageSize: 50, enableCache: true, cacheTTL: 300 }, options);
    }
    static getInstance(options) {
        if (!QueryOptimizationMiddleware.instance) {
            QueryOptimizationMiddleware.instance = new QueryOptimizationMiddleware(options);
        }
        return QueryOptimizationMiddleware.instance;
    }
    middleware() {
        return (req, res, next) => {
            try {
                // Optimize query parameters
                const optimizedQuery = this.optimizeQuery(req.query);
                // Add optimized query to request
                req.optimizedQuery = optimizedQuery;
                // Add query optimization headers
                res.setHeader('X-Query-Optimized', 'true');
                res.setHeader('X-Page-Size', optimizedQuery.limit.toString());
                res.setHeader('X-Current-Page', optimizedQuery.page.toString());
                loggerService_1.logger.debug('Query optimized successfully', {
                    metadata: {
                        service: 'QueryOptimizationMiddleware',
                        originalQuery: req.query,
                        optimizedQuery
                    }
                });
                next();
            }
            catch (error) {
                loggerService_1.logger.error('Error optimizing query', error, {
                    metadata: { service: 'QueryOptimizationMiddleware' }
                });
                next();
            }
        };
    }
    optimizeQuery(query) {
        const optimized = {
            limit: this.options.defaultLimit,
            offset: 0,
            page: 1,
            filters: {},
            fields: []
        };
        // Handle pagination
        if (query.page) {
            const page = parseInt(query.page) || 1;
            optimized.page = Math.max(1, page);
        }
        if (query.limit) {
            const limit = parseInt(query.limit) || this.options.defaultLimit;
            optimized.limit = Math.min(limit, this.options.maxLimit);
        }
        if (query.pageSize) {
            const pageSize = parseInt(query.pageSize) || this.options.defaultLimit;
            optimized.limit = Math.min(pageSize, this.options.maxPageSize);
        }
        // Calculate offset
        optimized.offset = (optimized.page - 1) * optimized.limit;
        // Handle sorting
        if (query.sortBy) {
            optimized.sortBy = query.sortBy;
        }
        if (query.sortOrder) {
            const order = query.sortOrder.toLowerCase();
            optimized.sortOrder = order === 'desc' ? 'desc' : 'asc';
        }
        // Handle search
        if (query.search) {
            optimized.search = query.search;
        }
        // Handle field selection
        if (query.fields) {
            const fields = Array.isArray(query.fields) ? query.fields : [query.fields];
            optimized.fields = fields.map((f) => f.toString());
        }
        // Handle filters (exclude pagination and sorting params)
        const excludeParams = ['page', 'limit', 'pageSize', 'sortBy', 'sortOrder', 'search', 'fields'];
        for (const [key, value] of Object.entries(query)) {
            if (!excludeParams.includes(key)) {
                optimized.filters[key] = value;
            }
        }
        return optimized;
    }
    static addPaginationHeaders(res, data, total, query) {
        const totalPages = Math.ceil(total / query.limit);
        const hasNext = query.page < totalPages;
        const hasPrev = query.page > 1;
        res.setHeader('X-Total-Count', total.toString());
        res.setHeader('X-Total-Pages', totalPages.toString());
        res.setHeader('X-Has-Next', hasNext.toString());
        res.setHeader('X-Has-Prev', hasPrev.toString());
        res.setHeader('X-Current-Page', query.page.toString());
        res.setHeader('X-Page-Size', query.limit.toString());
        // Add pagination links
        const baseUrl = res.req.originalUrl.split('?')[0];
        const params = new URLSearchParams(res.req.query);
        const links = {};
        if (hasPrev) {
            params.set('page', (query.page - 1).toString());
            links.prev = `${baseUrl}?${params.toString()}`;
        }
        if (hasNext) {
            params.set('page', (query.page + 1).toString());
            links.next = `${baseUrl}?${params.toString()}`;
        }
        res.setHeader('Link', Object.entries(links)
            .map(([rel, url]) => `<${url}>; rel="${rel}"`)
            .join(', '));
    }
    static optimizeFirestoreQuery(query, optimizedQuery) {
        try {
            let optimizedQueryBuilder = query;
            // Apply filters
            if (optimizedQuery.filters) {
                for (const [field, value] of Object.entries(optimizedQuery.filters)) {
                    if (typeof value === 'string' && value.includes(',')) {
                        // Handle array filters
                        const values = value.split(',').map(v => v.trim());
                        optimizedQueryBuilder = optimizedQueryBuilder.where(field, 'in', values);
                    }
                    else {
                        optimizedQueryBuilder = optimizedQueryBuilder.where(field, '==', value);
                    }
                }
            }
            // Apply search (if supported)
            if (optimizedQuery.search) {
                // This would need to be implemented based on your search strategy
                // For now, we'll just log it
                loggerService_1.logger.debug('Search query detected', {
                    metadata: {
                        service: 'QueryOptimizationMiddleware',
                        search: optimizedQuery.search
                    }
                });
            }
            // Apply sorting
            if (optimizedQuery.sortBy) {
                optimizedQueryBuilder = optimizedQueryBuilder.orderBy(optimizedQuery.sortBy, optimizedQuery.sortOrder || 'asc');
            }
            // Apply pagination
            optimizedQueryBuilder = optimizedQueryBuilder
                .limit(optimizedQuery.limit)
                .offset(optimizedQuery.offset);
            return optimizedQueryBuilder;
        }
        catch (error) {
            loggerService_1.logger.error('Error optimizing Firestore query', error, {
                metadata: { service: 'QueryOptimizationMiddleware' }
            });
            return query;
        }
    }
    static getQueryStats(req) {
        const startTime = req.queryStartTime || Date.now();
        const queryTime = Date.now() - startTime;
        const resultCount = req.resultCount || 0;
        const cacheHit = req.cacheHit || false;
        const optimizationApplied = req.headers['x-query-optimized'] === 'true';
        return {
            queryTime,
            resultCount,
            cacheHit,
            optimizationApplied
        };
    }
}
exports.QueryOptimizationMiddleware = QueryOptimizationMiddleware;
// Export middleware function
exports.queryOptimizationMiddleware = QueryOptimizationMiddleware.getInstance().middleware();
