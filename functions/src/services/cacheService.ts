import { logger } from './loggerService';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export interface CacheData<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private static instance: CacheService;
  private redis: any;
  private isConnected: boolean = false;
  private readonly defaultTTL: number = 3600; // 1 hour
  private readonly prefix: string = 'mussikon:';

  private constructor() {
    this.initializeRedis();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private async initializeRedis(): Promise<void> {
    try {
      // Use Redis if available, otherwise fallback to in-memory cache
      if (process.env.REDIS_URL) {
        const Redis = require('ioredis');
        this.redis = new Redis(process.env.REDIS_URL, {
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        this.redis.on('connect', () => {
          this.isConnected = true;
          logger.info('Redis cache connected successfully', { metadata: { service: 'CacheService' } });
        });

        this.redis.on('error', (error: Error) => {
          this.isConnected = false;
          logger.error('Redis connection error', error, { metadata: { service: 'CacheService' } });
        });

        await this.redis.connect();
      } else {
        logger.warn('Redis URL not configured, using in-memory cache', { metadata: { service: 'CacheService' } });
        this.redis = new Map();
      }
    } catch (error) {
      logger.error('Failed to initialize cache service', error as Error, { metadata: { service: 'CacheService' } });
      this.redis = new Map(); // Fallback to in-memory
    }
  }

  private getKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || this.prefix;
    return `${keyPrefix}${key}`;
  }

  public async get<T>(key: string, prefix?: string): Promise<T | null> {
    try {
      const fullKey = this.getKey(key, prefix);
      
      if (this.isConnected && process.env.REDIS_URL) {
        const data = await this.redis.get(fullKey);
        if (data) {
          const parsed: CacheData<T> = JSON.parse(data);
          if (this.isExpired(parsed)) {
            await this.delete(key, prefix);
            return null;
          }
          return parsed.data;
        }
      } else {
        // In-memory cache
        const data = this.redis.get(fullKey);
        if (data && !this.isExpired(data)) {
          return data.data;
        } else if (data) {
          this.redis.delete(fullKey);
        }
      }
      
      return null;
    } catch (error) {
      logger.error('Error getting cache data', error as Error, { 
        metadata: { service: 'CacheService', key, prefix } 
      });
      return null;
    }
  }

  public async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    try {
      const fullKey = this.getKey(key, options.prefix);
      const ttl = options.ttl || this.defaultTTL;
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl * 1000, // Convert to milliseconds
      };

      if (this.isConnected && process.env.REDIS_URL) {
        await this.redis.setex(fullKey, ttl, JSON.stringify(cacheData));
      } else {
        // In-memory cache with expiration
        this.redis.set(fullKey, cacheData);
        setTimeout(() => {
          this.redis.delete(fullKey);
        }, ttl * 1000);
      }

      logger.debug('Cache data set successfully', { 
        metadata: { service: 'CacheService', key: fullKey, ttl } 
      });
    } catch (error) {
      logger.error('Error setting cache data', error as Error, { 
        metadata: { service: 'CacheService', key, prefix: options.prefix } 
      });
    }
  }

  public async delete(key: string, prefix?: string): Promise<void> {
    try {
      const fullKey = this.getKey(key, prefix);
      
      if (this.isConnected && process.env.REDIS_URL) {
        await this.redis.del(fullKey);
      } else {
        this.redis.delete(fullKey);
      }

      logger.debug('Cache data deleted successfully', { 
        metadata: { service: 'CacheService', key: fullKey } 
      });
    } catch (error) {
      logger.error('Error deleting cache data', error as Error, { 
        metadata: { service: 'CacheService', key, prefix } 
      });
    }
  }

  public async clear(prefix?: string): Promise<void> {
    try {
      const pattern = this.getKey('*', prefix);
      
      if (this.isConnected && process.env.REDIS_URL) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        // In-memory cache clear
        for (const key of this.redis.keys()) {
          if (key.startsWith(prefix || this.prefix)) {
            this.redis.delete(key);
          }
        }
      }

      logger.info('Cache cleared successfully', { 
        metadata: { service: 'CacheService', pattern } 
      });
    } catch (error) {
      logger.error('Error clearing cache', error as Error, { 
        metadata: { service: 'CacheService', prefix } 
      });
    }
  }

  public async exists(key: string, prefix?: string): Promise<boolean> {
    try {
      const fullKey = this.getKey(key, prefix);
      
      if (this.isConnected && process.env.REDIS_URL) {
        return await this.redis.exists(fullKey) === 1;
      } else {
        const data = this.redis.get(fullKey);
        return data && !this.isExpired(data);
      }
    } catch (error) {
      logger.error('Error checking cache existence', error as Error, { 
        metadata: { service: 'CacheService', key, prefix } 
      });
      return false;
    }
  }

  private isExpired(cacheData: CacheData): boolean {
    return Date.now() - cacheData.timestamp > cacheData.ttl;
  }

  public async getStats(): Promise<{ hits: number; misses: number; keys: number }> {
    try {
      if (this.isConnected && process.env.REDIS_URL) {
        const info = await this.redis.info('stats');
        const keys = await this.redis.dbsize();
        // Parse Redis info for hits/misses (simplified)
        return { hits: 0, misses: 0, keys };
      } else {
        return { hits: 0, misses: 0, keys: this.redis.size };
      }
    } catch (error) {
      logger.error('Error getting cache stats', error as Error, { 
        metadata: { service: 'CacheService' } 
      });
      return { hits: 0, misses: 0, keys: 0 };
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.isConnected && this.redis && this.redis.disconnect) {
        await this.redis.disconnect();
        this.isConnected = false;
        logger.info('Redis cache disconnected', { metadata: { service: 'CacheService' } });
      }
    } catch (error) {
      logger.error('Error disconnecting cache', error as Error, { 
        metadata: { service: 'CacheService' } 
      });
    }
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance(); 