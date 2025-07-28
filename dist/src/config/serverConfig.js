"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerConfig = exports.defaultServerConfig = void 0;
exports.defaultServerConfig = {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development',
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // máximo 100 requests por ventana
    },
    compression: {
        enabled: process.env.NODE_ENV === 'production',
        level: 6,
    },
};
const getServerConfig = () => {
    return Object.assign(Object.assign({}, exports.defaultServerConfig), { port: parseInt(process.env.PORT || exports.defaultServerConfig.port.toString(), 10), host: process.env.HOST || exports.defaultServerConfig.host, environment: process.env.NODE_ENV || exports.defaultServerConfig.environment, cors: {
            origin: process.env.CORS_ORIGIN || exports.defaultServerConfig.cors.origin,
            credentials: exports.defaultServerConfig.cors.credentials,
        } });
};
exports.getServerConfig = getServerConfig;
