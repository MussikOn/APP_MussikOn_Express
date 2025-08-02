import { Request, Response } from 'express';
import { logger } from '../services/loggerService';
import { cacheService } from '../services/cacheService';
import { firestoreOptimizationService } from '../services/firestoreOptimizationService';
import { QueryOptimizationMiddleware } from '../middleware/queryOptimizationMiddleware';

export class OptimizationController {
  public async getCacheStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await cacheService.getStats();
      const firestoreStats = firestoreOptimizationService.getStats();

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

      logger.info('Cache stats retrieved successfully', {
        metadata: { service: 'OptimizationController', stats: response.data }
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error getting cache stats', error as Error, {
        metadata: { service: 'OptimizationController' }
      });

      res.status(500).json({
        success: false,
        message: 'Error retrieving cache statistics',
        error: (error as Error).message
      });
    }
  }

  public async clearCache(req: Request, res: Response): Promise<void> {
    try {
      const { prefix } = req.query;
      const prefixString = prefix as string || undefined;

      await cacheService.clear(prefixString);
      await firestoreOptimizationService.clearCache(prefixString);

      const response = {
        success: true,
        message: 'Cache cleared successfully',
        data: {
          prefix: prefixString || 'all',
          timestamp: new Date().toISOString()
        }
      };

      logger.info('Cache cleared successfully', {
        metadata: { service: 'OptimizationController', prefix: prefixString }
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error clearing cache', error as Error, {
        metadata: { service: 'OptimizationController' }
      });

      res.status(500).json({
        success: false,
        message: 'Error clearing cache',
        error: (error as Error).message
      });
    }
  }

  public async analyzeQueryPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { collection, filters, options } = req.body;

      if (!collection) {
        res.status(400).json({
          success: false,
          message: 'Collection name is required'
        });
        return;
      }

      const analysis = await firestoreOptimizationService.analyzeQueryPerformance(
        collection,
        filters || {},
        options || {}
      );

      const response = {
        success: true,
        data: {
          collection,
          analysis,
          timestamp: new Date().toISOString()
        }
      };

      logger.info('Query performance analysis completed', {
        metadata: { 
          service: 'OptimizationController', 
          collection,
          analysis 
        }
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error analyzing query performance', error as Error, {
        metadata: { service: 'OptimizationController' }
      });

      res.status(500).json({
        success: false,
        message: 'Error analyzing query performance',
        error: (error as Error).message
      });
    }
  }

  public async createCompositeIndex(req: Request, res: Response): Promise<void> {
    try {
      const { collection, fields, queryScopes } = req.body;

      if (!collection || !fields || !Array.isArray(fields)) {
        res.status(400).json({
          success: false,
          message: 'Collection name and fields array are required'
        });
        return;
      }

      const result = await firestoreOptimizationService.createCompositeIndex(
        collection,
        fields,
        queryScopes || ['COLLECTION']
      );

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

      logger.info('Composite index creation requested', {
        metadata: { 
          service: 'OptimizationController', 
          collection,
          fields,
          result 
        }
      });

      res.status(result.success ? 200 : 500).json(response);
    } catch (error) {
      logger.error('Error creating composite index', error as Error, {
        metadata: { service: 'OptimizationController' }
      });

      res.status(500).json({
        success: false,
        message: 'Error creating composite index',
        error: (error as Error).message
      });
    }
  }

  public async getOptimizationStats(req: Request, res: Response): Promise<void> {
    try {
      const cacheStats = await cacheService.getStats();
      const firestoreStats = firestoreOptimizationService.getStats();
      const queryStats = QueryOptimizationMiddleware.getQueryStats(req);

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

      logger.info('Optimization stats retrieved successfully', {
        metadata: { service: 'OptimizationController', stats: response.data }
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error getting optimization stats', error as Error, {
        metadata: { service: 'OptimizationController' }
      });

      res.status(500).json({
        success: false,
        message: 'Error retrieving optimization statistics',
        error: (error as Error).message
      });
    }
  }

  public async optimizeQuery(req: Request, res: Response): Promise<void> {
    try {
      const { collection, filters, options } = req.body;

      if (!collection) {
        res.status(400).json({
          success: false,
          message: 'Collection name is required'
        });
        return;
      }

      const result = await firestoreOptimizationService.optimizedQuery(
        collection,
        filters || {},
        options || {}
      );

      const response = {
        success: true,
        data: {
          collection,
          results: result.data,
          metrics: result.metrics,
          timestamp: new Date().toISOString()
        }
      };

      logger.info('Optimized query executed successfully', {
        metadata: { 
          service: 'OptimizationController', 
          collection,
          metrics: result.metrics 
        }
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error executing optimized query', error as Error, {
        metadata: { service: 'OptimizationController' }
      });

      res.status(500).json({
        success: false,
        message: 'Error executing optimized query',
        error: (error as Error).message
      });
    }
  }

  public async batchOperations(req: Request, res: Response): Promise<void> {
    try {
      const { operations } = req.body;

      if (!operations || !Array.isArray(operations)) {
        res.status(400).json({
          success: false,
          message: 'Operations array is required'
        });
        return;
      }

      const result = await firestoreOptimizationService.batchOperations(operations);

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

      logger.info('Batch operations completed', {
        metadata: { 
          service: 'OptimizationController', 
          totalOperations: operations.length,
          success: result.success 
        }
      });

      res.status(result.success ? 200 : 207).json(response);
    } catch (error) {
      logger.error('Error executing batch operations', error as Error, {
        metadata: { service: 'OptimizationController' }
      });

      res.status(500).json({
        success: false,
        message: 'Error executing batch operations',
        error: (error as Error).message
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const cacheStats = await cacheService.getStats();
      const firestoreStats = firestoreOptimizationService.getStats();

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
      } else if (serviceStatuses.includes('warning')) {
        healthStatus.status = 'degraded';
      }

      const response = {
        success: true,
        data: healthStatus
      };

      logger.info('Health check completed', {
        metadata: { service: 'OptimizationController', healthStatus }
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error during health check', error as Error, {
        metadata: { service: 'OptimizationController' }
      });

      res.status(500).json({
        success: false,
        status: 'unhealthy',
        message: 'Health check failed',
        error: (error as Error).message
      });
    }
  }
} 