"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class LoggerService {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }
    formatLog(entry) {
        const base = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
        const context = entry.context ? ` [${entry.context}]` : '';
        const user = entry.userId ? ` [User: ${entry.userId}]` : '';
        const request = entry.requestId ? ` [Request: ${entry.requestId}]` : '';
        const duration = entry.duration ? ` [${entry.duration}ms]` : '';
        return `${base}${context}${user}${request}${duration}`;
    }
    log(level, message, options = {}) {
        const entry = Object.assign({ timestamp: new Date().toISOString(), level,
            message }, options);
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
    error(message, error, options = {}) {
        this.log(LogLevel.ERROR, message, Object.assign(Object.assign({}, options), { error }));
    }
    warn(message, options = {}) {
        this.log(LogLevel.WARN, message, options);
    }
    info(message, options = {}) {
        this.log(LogLevel.INFO, message, options);
    }
    debug(message, options = {}) {
        this.log(LogLevel.DEBUG, message, options);
    }
    // Métodos específicos para logging de requests
    logRequest(req, res, duration) {
        var _a;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail) || 'anonymous';
        const requestId = req.headers['x-request-id'] || 'unknown';
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
                contentLength: res.get('Content-Length'),
            },
        });
    }
    logError(error, req, context) {
        var _a;
        const userId = req
            ? ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail) || 'anonymous'
            : 'unknown';
        const requestId = req
            ? req.headers['x-request-id'] || 'unknown'
            : 'unknown';
        this.error(error.message, error, {
            context: context || 'Application',
            userId,
            requestId,
            method: req === null || req === void 0 ? void 0 : req.method,
            url: req === null || req === void 0 ? void 0 : req.originalUrl,
            ip: req === null || req === void 0 ? void 0 : req.ip,
            userAgent: req === null || req === void 0 ? void 0 : req.get('User-Agent'),
        });
    }
    // Métodos específicos para diferentes contextos
    logAuth(message, userId, options = {}) {
        this.info(message, Object.assign({ context: 'Auth', userId }, options));
    }
    logEvent(message, eventId, userId, options = {}) {
        this.info(message, Object.assign({ context: 'Event', userId, metadata: Object.assign({ eventId }, options.metadata) }, options));
    }
    logImage(message, imageId, userId, options = {}) {
        this.info(message, Object.assign({ context: 'Image', userId, metadata: Object.assign({ imageId }, options.metadata) }, options));
    }
    logChat(message, conversationId, userId, options = {}) {
        this.info(message, Object.assign({ context: 'Chat', userId, metadata: Object.assign({ conversationId }, options.metadata) }, options));
    }
    logAdmin(message, adminId, action, options = {}) {
        this.info(message, Object.assign({ context: 'Admin', userId: adminId, metadata: Object.assign({ action }, options.metadata) }, options));
    }
}
// Exportar una instancia singleton
exports.logger = new LoggerService();
