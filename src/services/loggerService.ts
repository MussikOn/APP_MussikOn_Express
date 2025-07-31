import { Request, Response } from 'express';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  userId?: string;
  requestId?: string;
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  error?: Error;
  metadata?: Record<string, any>;
}

class LoggerService {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    const base = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    const context = entry.context ? ` [${entry.context}]` : '';
    const user = entry.userId ? ` [User: ${entry.userId}]` : '';
    const request = entry.requestId ? ` [Request: ${entry.requestId}]` : '';
    const duration = entry.duration ? ` [${entry.duration}ms]` : '';
    
    return `${base}${context}${user}${request}${duration}`;
  }

  private log(level: LogLevel, message: string, options: Partial<LogEntry> = {}): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...options
    };

    const formattedLog = this.formatLog(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedLog);
        if (entry.error) {
          console.error('Stack:', entry.error.stack);
        }
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedLog);
        }
        break;
    }

    // En producción, aquí se podría enviar a un servicio de logging externo
    // como Winston, Pino, o un servicio cloud como CloudWatch, Loggly, etc.
  }

  error(message: string, error?: Error, options: Partial<LogEntry> = {}): void {
    this.log(LogLevel.ERROR, message, { ...options, error });
  }

  warn(message: string, options: Partial<LogEntry> = {}): void {
    this.log(LogLevel.WARN, message, options);
  }

  info(message: string, options: Partial<LogEntry> = {}): void {
    this.log(LogLevel.INFO, message, options);
  }

  debug(message: string, options: Partial<LogEntry> = {}): void {
    this.log(LogLevel.DEBUG, message, options);
  }

  // Métodos específicos para logging de requests
  logRequest(req: Request, res: Response, duration: number): void {
    const userId = (req as any).user?.userEmail || 'anonymous';
    const requestId = req.headers['x-request-id'] as string || 'unknown';
    
    this.info('Request completed', {
      context: 'HTTP',
      userId,
      requestId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      duration,
      metadata: {
        statusCode: res.statusCode,
        contentLength: res.get('Content-Length')
      }
    });
  }

  logError(error: Error, req?: Request, context?: string): void {
    const userId = req ? ((req as any).user?.userEmail || 'anonymous') : 'unknown';
    const requestId = req ? (req.headers['x-request-id'] as string || 'unknown') : 'unknown';
    
    this.error(error.message, error, {
      context: context || 'Application',
      userId,
      requestId,
      method: req?.method,
      url: req?.originalUrl,
      ip: req?.ip,
      userAgent: req?.get('User-Agent')
    });
  }

  // Métodos específicos para diferentes contextos
  logAuth(message: string, userId?: string, options: Partial<LogEntry> = {}): void {
    this.info(message, { context: 'Auth', userId, ...options });
  }

  logEvent(message: string, eventId?: string, userId?: string, options: Partial<LogEntry> = {}): void {
    this.info(message, { 
      context: 'Event', 
      userId, 
      metadata: { eventId, ...options.metadata },
      ...options 
    });
  }

  logImage(message: string, imageId?: string, userId?: string, options: Partial<LogEntry> = {}): void {
    this.info(message, { 
      context: 'Image', 
      userId, 
      metadata: { imageId, ...options.metadata },
      ...options 
    });
  }

  logChat(message: string, conversationId?: string, userId?: string, options: Partial<LogEntry> = {}): void {
    this.info(message, { 
      context: 'Chat', 
      userId, 
      metadata: { conversationId, ...options.metadata },
      ...options 
    });
  }

  logAdmin(message: string, adminId?: string, action?: string, options: Partial<LogEntry> = {}): void {
    this.info(message, { 
      context: 'Admin', 
      userId: adminId, 
      metadata: { action, ...options.metadata },
      ...options 
    });
  }
}

// Exportar una instancia singleton
export const logger = new LoggerService(); 