"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LoggerService = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class LoggerService {
    constructor(config = {}) {
        this.logs = [];
        this.config = Object.assign({ level: LogLevel.INFO, enableConsole: true, enableFile: false }, config);
    }
    shouldLog(level) {
        const levels = Object.values(LogLevel);
        const configIndex = levels.indexOf(this.config.level);
        const messageIndex = levels.indexOf(level);
        return messageIndex <= configIndex;
    }
    formatMessage(entry) {
        const timestamp = entry.timestamp.toISOString();
        const level = entry.level.toUpperCase().padEnd(5);
        const context = entry.context ? `[${entry.context}]` : '';
        const message = entry.message;
        const data = entry.data ? ` | ${JSON.stringify(entry.data)}` : '';
        const error = entry.error ? ` | Error: ${entry.error.message}` : '';
        return `${timestamp} ${level} ${context} ${message}${data}${error}`;
    }
    log(level, message, context, data, error) {
        if (!this.shouldLog(level))
            return;
        const entry = {
            timestamp: new Date(),
            level,
            message,
            context,
            data,
            error,
        };
        this.logs.push(entry);
        if (this.config.enableConsole) {
            const formattedMessage = this.formatMessage(entry);
            switch (level) {
                case LogLevel.ERROR:
                    console.error(formattedMessage);
                    break;
                case LogLevel.WARN:
                    console.warn(formattedMessage);
                    break;
                case LogLevel.INFO:
                    console.info(formattedMessage);
                    break;
                case LogLevel.DEBUG:
                    console.debug(formattedMessage);
                    break;
            }
        }
    }
    error(message, context, data, error) {
        this.log(LogLevel.ERROR, message, context, data, error);
    }
    warn(message, context, data) {
        this.log(LogLevel.WARN, message, context, data);
    }
    info(message, context, data) {
        this.log(LogLevel.INFO, message, context, data);
    }
    debug(message, context, data) {
        this.log(LogLevel.DEBUG, message, context, data);
    }
    // Métodos específicos para eventos
    logEventCreation(eventId, userEmail, eventData) {
        this.info('Evento creado', 'EventService', {
            eventId,
            userEmail,
            eventData,
        });
    }
    logEventCancellation(eventId, cancelledBy, assignedMusician) {
        this.info('Evento cancelado', 'EventService', {
            eventId,
            cancelledBy,
            assignedMusician,
        });
    }
    logEventCompletion(eventId, completedBy) {
        this.info('Evento completado', 'EventService', {
            eventId,
            completedBy,
        });
    }
    logMusicianAcceptance(eventId, musicianEmail, organizerEmail) {
        this.info('Músico aceptó evento', 'EventService', {
            eventId,
            musicianEmail,
            organizerEmail,
        });
    }
    logNotificationSent(userEmail, notificationType, eventId) {
        this.info('Notificación enviada', 'NotificationService', {
            userEmail,
            notificationType,
            eventId,
        });
    }
    logSocketConnection(socketId, userEmail) {
        this.debug('Socket conectado', 'SocketService', {
            socketId,
            userEmail,
        });
    }
    logSocketDisconnection(socketId, userEmail) {
        this.debug('Socket desconectado', 'SocketService', {
            socketId,
            userEmail,
        });
    }
    // Métodos para errores específicos
    logDatabaseError(operation, error, context) {
        this.error(`Error de base de datos en ${operation}`, 'DatabaseService', context, error);
    }
    logAuthenticationError(userEmail, error) {
        this.error('Error de autenticación', 'AuthService', { userEmail }, error);
    }
    logValidationError(field, value, error) {
        this.error('Error de validación', 'ValidationService', { field, value }, error);
    }
    // Obtener logs para debugging
    getLogs(level, limit) {
        let filteredLogs = this.logs;
        if (level) {
            filteredLogs = filteredLogs.filter(log => log.level === level);
        }
        if (limit) {
            filteredLogs = filteredLogs.slice(-limit);
        }
        return filteredLogs;
    }
    // Limpiar logs antiguos
    clearLogs() {
        this.logs = [];
    }
}
exports.LoggerService = LoggerService;
// Instancia singleton del logger
exports.logger = new LoggerService({
    level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
    enableConsole: true,
});
