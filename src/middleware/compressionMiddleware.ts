import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/loggerService';

export interface CompressionOptions {
  threshold?: number; // Minimum size to compress (bytes)
  level?: number; // Compression level (1-9)
  filter?: (req: Request, res: Response) => boolean;
}

export class CompressionMiddleware {
  private static instance: CompressionMiddleware;
  private compression: any;
  private options: CompressionOptions;

  private constructor(options: CompressionOptions = {}) {
    this.options = {
      threshold: 1024, // 1KB
      level: 6,
      filter: this.defaultFilter,
      ...options
    };
    this.initializeCompression();
  }

  public static getInstance(options?: CompressionOptions): CompressionMiddleware {
    if (!CompressionMiddleware.instance) {
      CompressionMiddleware.instance = new CompressionMiddleware(options);
    }
    return CompressionMiddleware.instance;
  }

  private initializeCompression(): void {
    try {
      // Use compression library if available
      if (process.env.ENABLE_COMPRESSION === 'true') {
        this.compression = require('compression');
        logger.info('Compression middleware initialized', { 
          metadata: { service: 'CompressionMiddleware', options: this.options } 
        });
      } else {
        logger.info('Compression disabled by environment variable', { 
          metadata: { service: 'CompressionMiddleware' } 
        });
      }
    } catch (error) {
      logger.warn('Compression library not available, using fallback', { 
        metadata: { service: 'CompressionMiddleware' } 
      });
    }
  }

  private defaultFilter(req: Request, res: Response): boolean {
    // Don't compress if request doesn't accept gzip
    if (!req.headers['accept-encoding'] || !req.headers['accept-encoding'].includes('gzip')) {
      return false;
    }

    // Don't compress small responses
    const contentLength = parseInt(res.getHeader('content-length') as string) || 0;
    if (contentLength < (this.options.threshold || 1024)) {
      return false;
    }

    // Don't compress already compressed content
    const contentType = res.getHeader('content-type') as string;
    if (contentType && (
      contentType.includes('image/') ||
      contentType.includes('video/') ||
      contentType.includes('audio/') ||
      contentType.includes('application/zip') ||
      contentType.includes('application/gzip')
    )) {
      return false;
    }

    return true;
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Skip compression if not enabled or library not available
      if (!this.compression || process.env.ENABLE_COMPRESSION !== 'true') {
        return next();
      }

      // Check if response should be compressed
      if (!this.options.filter!(req, res)) {
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

  public static compressResponse(data: any, req: Request, res: Response): Buffer | string {
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
    } catch (error) {
      logger.error('Error compressing response', error as Error, { 
        metadata: { service: 'CompressionMiddleware' } 
      });
      return data;
    }
  }

  public static getCompressionStats(req: Request, res: Response): {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    algorithm: string;
  } {
    const originalSize = parseInt(res.getHeader('content-length') as string) || 0;
    const encoding = res.getHeader('content-encoding') as string;
    const compressedSize = encoding === 'gzip' ? 
      parseInt(res.getHeader('x-compressed-size') as string) || originalSize : 
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

// Export middleware function
export const compressionMiddleware = CompressionMiddleware.getInstance().middleware(); 