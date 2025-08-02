import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/loggerService';

export interface QueryOptimizationOptions {
  maxLimit?: number;
  defaultLimit?: number;
  maxPageSize?: number;
  enableCache?: boolean;
  cacheTTL?: number;
}

export interface OptimizedQuery {
  limit: number;
  offset: number;
  page: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  search?: string;
  fields?: string[];
}

export class QueryOptimizationMiddleware {
  private static instance: QueryOptimizationMiddleware;
  private options: QueryOptimizationOptions;

  private constructor(options: QueryOptimizationOptions = {}) {
    this.options = {
      maxLimit: 100,
      defaultLimit: 20,
      maxPageSize: 50,
      enableCache: true,
      cacheTTL: 300, // 5 minutes
      ...options
    };
  }

  public static getInstance(options?: QueryOptimizationOptions): QueryOptimizationMiddleware {
    if (!QueryOptimizationMiddleware.instance) {
      QueryOptimizationMiddleware.instance = new QueryOptimizationMiddleware(options);
    }
    return QueryOptimizationMiddleware.instance;
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Optimize query parameters
        const optimizedQuery = this.optimizeQuery(req.query);
        
        // Add optimized query to request
        (req as any).optimizedQuery = optimizedQuery;
        
        // Add query optimization headers
        res.setHeader('X-Query-Optimized', 'true');
        res.setHeader('X-Page-Size', optimizedQuery.limit.toString());
        res.setHeader('X-Current-Page', optimizedQuery.page.toString());

        logger.debug('Query optimized successfully', { 
          metadata: { 
            service: 'QueryOptimizationMiddleware',
            originalQuery: req.query,
            optimizedQuery 
          } 
        });

        next();
      } catch (error) {
        logger.error('Error optimizing query', error as Error, { 
          metadata: { service: 'QueryOptimizationMiddleware' } 
        });
        next();
      }
    };
  }

  private optimizeQuery(query: any): OptimizedQuery {
    const optimized: OptimizedQuery = {
      limit: this.options.defaultLimit!,
      offset: 0,
      page: 1,
      filters: {},
      fields: []
    };

    // Handle pagination
    if (query.page) {
      const page = parseInt(query.page as string) || 1;
      optimized.page = Math.max(1, page);
    }

    if (query.limit) {
      const limit = parseInt(query.limit as string) || this.options.defaultLimit!;
      optimized.limit = Math.min(limit, this.options.maxLimit!);
    }

    if (query.pageSize) {
      const pageSize = parseInt(query.pageSize as string) || this.options.defaultLimit!;
      optimized.limit = Math.min(pageSize, this.options.maxPageSize!);
    }

    // Calculate offset
    optimized.offset = (optimized.page - 1) * optimized.limit;

    // Handle sorting
    if (query.sortBy) {
      optimized.sortBy = query.sortBy as string;
    }

    if (query.sortOrder) {
      const order = (query.sortOrder as string).toLowerCase();
      optimized.sortOrder = order === 'desc' ? 'desc' : 'asc';
    }

    // Handle search
    if (query.search) {
      optimized.search = query.search as string;
    }

    // Handle field selection
    if (query.fields) {
      const fields = Array.isArray(query.fields) ? query.fields : [query.fields];
      optimized.fields = fields.map((f: any) => f.toString());
    }

    // Handle filters (exclude pagination and sorting params)
    const excludeParams = ['page', 'limit', 'pageSize', 'sortBy', 'sortOrder', 'search', 'fields'];
    for (const [key, value] of Object.entries(query)) {
      if (!excludeParams.includes(key)) {
        optimized.filters![key] = value;
      }
    }

    return optimized;
  }

  public static addPaginationHeaders(res: Response, data: any[], total: number, query: OptimizedQuery): void {
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
    const params = new URLSearchParams(res.req.query as any);
    
    const links: Record<string, string> = {};
    
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

  public static optimizeFirestoreQuery(query: any, optimizedQuery: OptimizedQuery): any {
    try {
      let optimizedQueryBuilder = query;

      // Apply filters
      if (optimizedQuery.filters) {
        for (const [field, value] of Object.entries(optimizedQuery.filters)) {
          if (typeof value === 'string' && value.includes(',')) {
            // Handle array filters
            const values = value.split(',').map(v => v.trim());
            optimizedQueryBuilder = optimizedQueryBuilder.where(field, 'in', values);
          } else {
            optimizedQueryBuilder = optimizedQueryBuilder.where(field, '==', value);
          }
        }
      }

      // Apply search (if supported)
      if (optimizedQuery.search) {
        // This would need to be implemented based on your search strategy
        // For now, we'll just log it
        logger.debug('Search query detected', { 
          metadata: { 
            service: 'QueryOptimizationMiddleware',
            search: optimizedQuery.search 
          } 
        });
      }

      // Apply sorting
      if (optimizedQuery.sortBy) {
        optimizedQueryBuilder = optimizedQueryBuilder.orderBy(
          optimizedQuery.sortBy, 
          optimizedQuery.sortOrder || 'asc'
        );
      }

      // Apply pagination
      optimizedQueryBuilder = optimizedQueryBuilder
        .limit(optimizedQuery.limit)
        .offset(optimizedQuery.offset);

      return optimizedQueryBuilder;
    } catch (error) {
      logger.error('Error optimizing Firestore query', error as Error, { 
        metadata: { service: 'QueryOptimizationMiddleware' } 
      });
      return query;
    }
  }

  public static getQueryStats(req: Request): {
    queryTime: number;
    resultCount: number;
    cacheHit: boolean;
    optimizationApplied: boolean;
  } {
    const startTime = (req as any).queryStartTime || Date.now();
    const queryTime = Date.now() - startTime;
    const resultCount = (req as any).resultCount || 0;
    const cacheHit = (req as any).cacheHit || false;
    const optimizationApplied = req.headers['x-query-optimized'] === 'true';

    return {
      queryTime,
      resultCount,
      cacheHit,
      optimizationApplied
    };
  }
}

// Export middleware function
export const queryOptimizationMiddleware = QueryOptimizationMiddleware.getInstance().middleware(); 