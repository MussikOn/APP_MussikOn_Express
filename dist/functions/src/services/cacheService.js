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
exports.cacheService = exports.CacheService = void 0;
const loggerService_1 = require("./loggerService");
class CacheService {
    constructor() {
        this.isConnected = false;
        this.defaultTTL = 3600; // 1 hour
        this.prefix = 'mussikon:';
        this.initializeRedis();
    }
    static getInstance() {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }
    initializeRedis() {
        return __awaiter(this, void 0, void 0, function* () {
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
                        loggerService_1.logger.info('Redis cache connected successfully', { metadata: { service: 'CacheService' } });
                    });
                    this.redis.on('error', (error) => {
                        this.isConnected = false;
                        loggerService_1.logger.error('Redis connection error', error, { metadata: { service: 'CacheService' } });
                    });
                    yield this.redis.connect();
                }
                else {
                    loggerService_1.logger.warn('Redis URL not configured, using in-memory cache', { metadata: { service: 'CacheService' } });
                    this.redis = new Map();
                }
            }
            catch (error) {
                loggerService_1.logger.error('Failed to initialize cache service', error, { metadata: { service: 'CacheService' } });
                this.redis = new Map(); // Fallback to in-memory
            }
        });
    }
    getKey(key, prefix) {
        const keyPrefix = prefix || this.prefix;
        return `${keyPrefix}${key}`;
    }
    get(key, prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fullKey = this.getKey(key, prefix);
                if (this.isConnected && process.env.REDIS_URL) {
                    const data = yield this.redis.get(fullKey);
                    if (data) {
                        const parsed = JSON.parse(data);
                        if (this.isExpired(parsed)) {
                            yield this.delete(key, prefix);
                            return null;
                        }
                        return parsed.data;
                    }
                }
                else {
                    // In-memory cache
                    const data = this.redis.get(fullKey);
                    if (data && !this.isExpired(data)) {
                        return data.data;
                    }
                    else if (data) {
                        this.redis.delete(fullKey);
                    }
                }
                return null;
            }
            catch (error) {
                loggerService_1.logger.error('Error getting cache data', error, {
                    metadata: { service: 'CacheService', key, prefix }
                });
                return null;
            }
        });
    }
    set(key_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (key, data, options = {}) {
            try {
                const fullKey = this.getKey(key, options.prefix);
                const ttl = options.ttl || this.defaultTTL;
                const cacheData = {
                    data,
                    timestamp: Date.now(),
                    ttl: ttl * 1000, // Convert to milliseconds
                };
                if (this.isConnected && process.env.REDIS_URL) {
                    yield this.redis.setex(fullKey, ttl, JSON.stringify(cacheData));
                }
                else {
                    // In-memory cache with expiration
                    this.redis.set(fullKey, cacheData);
                    setTimeout(() => {
                        this.redis.delete(fullKey);
                    }, ttl * 1000);
                }
                loggerService_1.logger.debug('Cache data set successfully', {
                    metadata: { service: 'CacheService', key: fullKey, ttl }
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error setting cache data', error, {
                    metadata: { service: 'CacheService', key, prefix: options.prefix }
                });
            }
        });
    }
    delete(key, prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fullKey = this.getKey(key, prefix);
                if (this.isConnected && process.env.REDIS_URL) {
                    yield this.redis.del(fullKey);
                }
                else {
                    this.redis.delete(fullKey);
                }
                loggerService_1.logger.debug('Cache data deleted successfully', {
                    metadata: { service: 'CacheService', key: fullKey }
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error deleting cache data', error, {
                    metadata: { service: 'CacheService', key, prefix }
                });
            }
        });
    }
    clear(prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pattern = this.getKey('*', prefix);
                if (this.isConnected && process.env.REDIS_URL) {
                    const keys = yield this.redis.keys(pattern);
                    if (keys.length > 0) {
                        yield this.redis.del(...keys);
                    }
                }
                else {
                    // In-memory cache clear
                    for (const key of this.redis.keys()) {
                        if (key.startsWith(prefix || this.prefix)) {
                            this.redis.delete(key);
                        }
                    }
                }
                loggerService_1.logger.info('Cache cleared successfully', {
                    metadata: { service: 'CacheService', pattern }
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error clearing cache', error, {
                    metadata: { service: 'CacheService', prefix }
                });
            }
        });
    }
    exists(key, prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fullKey = this.getKey(key, prefix);
                if (this.isConnected && process.env.REDIS_URL) {
                    return (yield this.redis.exists(fullKey)) === 1;
                }
                else {
                    const data = this.redis.get(fullKey);
                    return data && !this.isExpired(data);
                }
            }
            catch (error) {
                loggerService_1.logger.error('Error checking cache existence', error, {
                    metadata: { service: 'CacheService', key, prefix }
                });
                return false;
            }
        });
    }
    isExpired(cacheData) {
        return Date.now() - cacheData.timestamp > cacheData.ttl;
    }
    getStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.isConnected && process.env.REDIS_URL) {
                    const info = yield this.redis.info('stats');
                    const keys = yield this.redis.dbsize();
                    // Parse Redis info for hits/misses (simplified)
                    return { hits: 0, misses: 0, keys };
                }
                else {
                    return { hits: 0, misses: 0, keys: this.redis.size };
                }
            }
            catch (error) {
                loggerService_1.logger.error('Error getting cache stats', error, {
                    metadata: { service: 'CacheService' }
                });
                return { hits: 0, misses: 0, keys: 0 };
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.isConnected && this.redis && this.redis.disconnect) {
                    yield this.redis.disconnect();
                    this.isConnected = false;
                    loggerService_1.logger.info('Redis cache disconnected', { metadata: { service: 'CacheService' } });
                }
            }
            catch (error) {
                loggerService_1.logger.error('Error disconnecting cache', error, {
                    metadata: { service: 'CacheService' }
                });
            }
        });
    }
}
exports.CacheService = CacheService;
// Export singleton instance
exports.cacheService = CacheService.getInstance();
