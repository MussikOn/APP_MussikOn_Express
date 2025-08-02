"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressionMiddleware = exports.CompressionMiddleware = void 0;
const loggerService_1 = require("../services/loggerService");
class CompressionMiddleware {
    constructor(options = {}) {
        this.options = Object.assign({ threshold: 1024, level: 6, filter: this.defaultFilter }, options);
        this.initializeCompression();
    }
    static getInstance(options) {
        if (!CompressionMiddleware.instance) {
            CompressionMiddleware.instance = new CompressionMiddleware(options);
        }
        return CompressionMiddleware.instance;
    }
    initializeCompression() {
        try {
            // Use compression library if available
            if (process.env.ENABLE_COMPRESSION === 'true') {
                this.compression = require('compression');
                loggerService_1.logger.info('Compression middleware initialized', {
                    metadata: { service: 'CompressionMiddleware', options: this.options }
                });
            }
            else {
                loggerService_1.logger.info('Compression disabled by environment variable', {
                    metadata: { service: 'CompressionMiddleware' }
                });
            }
        }
        catch (error) {
            loggerService_1.logger.warn('Compression library not available, using fallback', {
                metadata: { service: 'CompressionMiddleware' }
            });
        }
    }
    defaultFilter(req, res) {
        // Don't compress if request doesn't accept gzip
        if (!req.headers['accept-encoding'] || !req.headers['accept-encoding'].includes('gzip')) {
            return false;
        }
        // Don't compress small responses
        const contentLength = parseInt(res.getHeader('content-length')) || 0;
        if (contentLength < (this.options.threshold || 1024)) {
            return false;
        }
        // Don't compress already compressed content
        const contentType = res.getHeader('content-type');
        if (contentType && (contentType.includes('image/') ||
            contentType.includes('video/') ||
            contentType.includes('audio/') ||
            contentType.includes('application/zip') ||
            contentType.includes('application/gzip'))) {
            return false;
        }
        return true;
    }
    middleware() {
        return (req, res, next) => {
            // Skip compression if not enabled or library not available
            if (!this.compression || process.env.ENABLE_COMPRESSION !== 'true') {
                return next();
            }
            // Check if response should be compressed
            if (!this.options.filter(req, res)) {
                return next();
            }
            // Add compression headers
            res.setHeader('Vary', 'Accept-Encoding');
            // Use compression middleware
            const compress = this.compression({
                threshold: this.options.threshold,
                level: this.options.level,
                filter: this.options.filter
            });
            compress(req, res, next);
        };
    }
    static compressResponse(data, req, res) {
        try {
            // Simple compression for JSON responses
            if (typeof data === 'object') {
                const jsonString = JSON.stringify(data);
                // Only compress if response is large enough
                if (jsonString.length < (CompressionMiddleware.getInstance().options.threshold || 1024)) {
                    return jsonString;
                }
                // Simple compression by removing unnecessary whitespace
                const compressed = JSON.stringify(data, null, 0);
                res.setHeader('Content-Encoding', 'identity');
                res.setHeader('X-Compression', 'simple');
                return compressed;
            }
            return data;
        }
        catch (error) {
            loggerService_1.logger.error('Error compressing response', error, {
                metadata: { service: 'CompressionMiddleware' }
            });
            return data;
        }
    }
    static getCompressionStats(req, res) {
        const originalSize = parseInt(res.getHeader('content-length')) || 0;
        const encoding = res.getHeader('content-encoding');
        const compressedSize = encoding === 'gzip' ?
            parseInt(res.getHeader('x-compressed-size')) || originalSize :
            originalSize;
        const compressionRatio = originalSize > 0 ?
            ((originalSize - compressedSize) / originalSize) * 100 : 0;
        return {
            originalSize,
            compressedSize,
            compressionRatio,
            algorithm: encoding || 'none'
        };
    }
}
exports.CompressionMiddleware = CompressionMiddleware;
// Export middleware function
exports.compressionMiddleware = CompressionMiddleware.getInstance().middleware();
