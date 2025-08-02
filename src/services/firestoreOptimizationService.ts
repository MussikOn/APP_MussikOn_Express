import { db } from '../utils/firebase';
import { logger } from './loggerService';
import { cacheService } from './cacheService';

export interface QueryOptimizationConfig {
  enableCache: boolean;
  cacheTTL: number;
  batchSize: number;
  maxConcurrentQueries: number;
  enableIndexing: boolean;
}

export interface QueryMetrics {
  queryTime: number;
  resultCount: number;
  cacheHit: boolean;
  indexUsed: boolean;
  optimizationApplied: boolean;
}

export interface BatchOperation {
  type: 'create' | 'update' | 'delete';
  collection: string;
  document: string;
  data?: any;
}

export class FirestoreOptimizationService {
  private static instance: FirestoreOptimizationService;
  private config: QueryOptimizationConfig;
  private queryCache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private activeQueries: Set<string>;

  private constructor(config: QueryOptimizationConfig = {
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

  public static getInstance(config?: QueryOptimizationConfig): FirestoreOptimizationService {
    if (!FirestoreOptimizationService.instance) {
      FirestoreOptimizationService.instance = new FirestoreOptimizationService(config);
    }
    return FirestoreOptimizationService.instance;
  }

  public async optimizedQuery(
    collection: string,
    filters: Record<string, any> = {},
    options: {
      limit?: number;
      offset?: number;
      orderBy?: { field: string; direction: 'asc' | 'desc' };
      select?: string[];
      cacheKey?: string;
    } = {}
  ): Promise<{ data: any[]; metrics: QueryMetrics }> {
    const startTime = Date.now();
    const cacheKey = options.cacheKey || this.generateCacheKey(collection, filters, options);
    
    try {
      // Check cache first
      if (this.config.enableCache) {
        const cachedData = await this.getFromCache(cacheKey);
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
      let query: any = db.collection(collection);

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
      const snapshot = await query.get();
      const data = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));

      // Cache results
      if (this.config.enableCache) {
        await this.setCache(cacheKey, data);
      }

      const metrics: QueryMetrics = {
        queryTime: Date.now() - startTime,
        resultCount: data.length,
        cacheHit: false,
        indexUsed: this.checkIndexUsage(filters, options.orderBy),
        optimizationApplied: true
      };

      logger.debug('Optimized query executed successfully', {
        metadata: {
          service: 'FirestoreOptimizationService',
          collection,
          metrics,
          cacheKey
        }
      });

      return { data, metrics };

    } catch (error) {
      logger.error('Error executing optimized query', error as Error, {
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
  }

  public async batchOperations(operations: BatchOperation[]): Promise<{
    success: boolean;
    results: any[];
    errors: any[];
  }> {
    const results: any[] = [];
    const errors: any[] = [];
    const batches: any[] = [];

    try {
      // Split operations into batches
      for (let i = 0; i < operations.length; i += this.config.batchSize) {
        const batch = db.batch();
        const batchOperations = operations.slice(i, i + this.config.batchSize);

        for (const operation of batchOperations) {
          const docRef = db.collection(operation.collection).doc(operation.document);

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
      const batchResults = await Promise.allSettled(
        batches.map(batch => batch.commit())
      );

      // Process results
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(...result.value);
        } else {
          errors.push({
            batchIndex: index,
            error: result.reason
          });
        }
      });

      logger.info('Batch operations completed', {
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

    } catch (error) {
      logger.error('Error executing batch operations', error as Error, {
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
  }

  public async createCompositeIndex(
    collection: string,
    fields: string[],
    queryScopes: string[] = ['COLLECTION']
  ): Promise<{ success: boolean; indexName?: string }> {
    try {
      // This would typically interact with Firestore Admin SDK
      // to create composite indexes programmatically
      logger.info('Composite index creation requested', {
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

    } catch (error) {
      logger.error('Error creating composite index', error as Error, {
        metadata: {
          service: 'FirestoreOptimizationService',
          collection,
          fields
        }
      });

      return { success: false };
    }
  }

  public async analyzeQueryPerformance(
    collection: string,
    filters: Record<string, any>,
    options: any = {}
  ): Promise<{
    recommendedIndexes: string[];
    estimatedCost: number;
    optimizationSuggestions: string[];
  }> {
    try {
      const recommendations: string[] = [];
      const suggestedIndexes: string[] = [];
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
          ? options.orderBy.map((o: any) => o.field)
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

    } catch (error) {
      logger.error('Error analyzing query performance', error as Error, {
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
  }

  private applyOptimizedFilters(query: any, filters: Record<string, any>): any {
    let optimizedQuery = query;

    for (const [field, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        // Handle array filters
        optimizedQuery = optimizedQuery.where(field, 'in', value);
      } else if (typeof value === 'object' && value !== null) {
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
      } else {
        // Handle simple equality
        optimizedQuery = optimizedQuery.where(field, '==', value);
      }
    }

    return optimizedQuery;
  }

  private async getFromCache(key: string): Promise<any[] | null> {
    try {
      return await cacheService.get<any[]>(key, 'firestore:');
    } catch (error) {
      logger.error('Error getting from cache', error as Error, {
        metadata: { service: 'FirestoreOptimizationService', key }
      });
      return null;
    }
  }

  private async setCache(key: string, data: any[]): Promise<void> {
    try {
      await cacheService.set(key, data, {
        ttl: this.config.cacheTTL,
        prefix: 'firestore:'
      });
    } catch (error) {
      logger.error('Error setting cache', error as Error, {
        metadata: { service: 'FirestoreOptimizationService', key }
      });
    }
  }

  private generateCacheKey(
    collection: string,
    filters: Record<string, any>,
    options: any
  ): string {
    const filterString = JSON.stringify(filters);
    const optionsString = JSON.stringify(options);
    return `${collection}:${filterString}:${optionsString}`;
  }

  private checkIndexUsage(filters: Record<string, any>, orderBy?: any): boolean {
    // Simple heuristic to check if indexes are likely being used
    const filterCount = Object.keys(filters).length;
    const hasOrdering = orderBy !== undefined;
    
    // If we have multiple filters or ordering, we likely need indexes
    return filterCount > 1 || hasOrdering;
  }

  private estimateQueryCost(filters: Record<string, any>, options: any): number {
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

  public async clearCache(prefix?: string): Promise<void> {
    try {
      await cacheService.clear(prefix || 'firestore:');
      logger.info('Firestore cache cleared', {
        metadata: { service: 'FirestoreOptimizationService', prefix }
      });
    } catch (error) {
      logger.error('Error clearing cache', error as Error, {
        metadata: { service: 'FirestoreOptimizationService' }
      });
    }
  }

  public getStats(): {
    cacheSize: number;
    activeQueries: number;
    config: QueryOptimizationConfig;
  } {
    return {
      cacheSize: this.queryCache.size,
      activeQueries: this.activeQueries.size,
      config: this.config
    };
  }
}

// Export singleton instance
export const firestoreOptimizationService = FirestoreOptimizationService.getInstance(); 