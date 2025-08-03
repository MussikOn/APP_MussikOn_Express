"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVapidConfig = exports.getExpoConfig = exports.getRateLimitConfig = exports.getCorsConfig = exports.getBaseUrl = exports.isTest = exports.isProduction = exports.isDevelopment = exports.validateEnv = exports.ENV = exports.FIREBASE_CREDENTIALS = exports.EMAIL_PASSWORD = exports.EMAIL_USER = exports.IDRIVE_E2_BUCKET_NAME = exports.IDRIVE_E2_REGION = exports.IDRIVE_E2_SECRET_KEY = exports.IDRIVE_E2_ACCESS_KEY = exports.IDRIVE_E2_ENDPOINT = exports.URL_API = exports.PORT = exports.IP = void 0;
const os_1 = __importDefault(require("os"));
function obtenerIpLocal() {
    const interfaces = os_1.default.networkInterfaces();
    let ipLocal = '';
    for (let interfaceName in interfaces) {
        for (let iface of interfaces[interfaceName]) {
            if (!iface.internal && iface.family === 'IPv4') {
                ipLocal = iface.address;
                break;
            }
        }
        if (ipLocal)
            break;
    }
    return ipLocal;
}
exports.IP = obtenerIpLocal();
exports.PORT = 3000; // Aqui va el puerto que desees.
exports.URL_API = `http://${exports.IP}:`; // Aqui esta la IP del equipo donde se esta ejecutando la api.
// Almacenamiento seguro para idriveE2
exports.IDRIVE_E2_ENDPOINT = ""; // ejemplo: https://musikon-media.c8q1.va03.idrivee2-84.com
exports.IDRIVE_E2_ACCESS_KEY = "";
exports.IDRIVE_E2_SECRET_KEY = "";
exports.IDRIVE_E2_REGION = "";
exports.IDRIVE_E2_BUCKET_NAME = ""; // ejemplo: musikon-media
// Email
exports.EMAIL_USER = "";
exports.EMAIL_PASSWORD = "";
// Firebase
exports.FIREBASE_CREDENTIALS = "";
// Configuración de variables de entorno para MussikOn API
exports.ENV = {
    // Configuración del servidor
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    // Base de datos
    DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/mussikon',
    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    // Firebase
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'your-firebase-project-id',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || 'your-firebase-private-key',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || 'your-firebase-client-email',
    // Email
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: process.env.EMAIL_PORT || 587,
    EMAIL_USER: process.env.EMAIL_USER || 'your-email@gmail.com',
    EMAIL_PASS: process.env.EMAIL_PASS || 'your-email-password',
    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutos
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    // File Upload
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5242880, // 5MB
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif',
    // Socket.IO
    SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
    // Expo Push Notifications
    EXPO_ACCESS_TOKEN: process.env.EXPO_ACCESS_TOKEN || 'your-expo-access-token',
    EXPO_PROJECT_ID: process.env.EXPO_PROJECT_ID || 'your-expo-project-id',
    // VAPID Keys (para Web Push)
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || 'your-vapid-public-key',
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || 'your-vapid-private-key',
    // Redis (opcional, para cache y sesiones)
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    // ===== OPTIMIZACIONES DE RENDIMIENTO =====
    // Redis Configuration
    REDIS_HOST: (_a = process.env.REDIS_HOST) !== null && _a !== void 0 ? _a : 'localhost',
    REDIS_PORT: parseInt((_b = process.env.REDIS_PORT) !== null && _b !== void 0 ? _b : '6379'),
    REDIS_PASSWORD: (_c = process.env.REDIS_PASSWORD) !== null && _c !== void 0 ? _c : '',
    REDIS_DB: parseInt((_d = process.env.REDIS_DB) !== null && _d !== void 0 ? _d : '0'),
    REDIS_TTL: parseInt((_e = process.env.REDIS_TTL) !== null && _e !== void 0 ? _e : '3600'),
    REDIS_MAX_MEMORY: (_f = process.env.REDIS_MAX_MEMORY) !== null && _f !== void 0 ? _f : '256mb',
    // Cache Configuration
    CACHE_ENABLED: process.env.CACHE_ENABLED === 'true',
    CACHE_TTL: parseInt((_g = process.env.CACHE_TTL) !== null && _g !== void 0 ? _g : '3600'),
    CACHE_MAX_ITEMS: parseInt((_h = process.env.CACHE_MAX_ITEMS) !== null && _h !== void 0 ? _h : '1000'),
    CACHE_CLEANUP_INTERVAL: parseInt((_j = process.env.CACHE_CLEANUP_INTERVAL) !== null && _j !== void 0 ? _j : '300000'),
    // Compression Configuration
    COMPRESSION_ENABLED: process.env.COMPRESSION_ENABLED === 'true',
    COMPRESSION_THRESHOLD: parseInt((_k = process.env.COMPRESSION_THRESHOLD) !== null && _k !== void 0 ? _k : '1024'),
    COMPRESSION_LEVEL: parseInt((_l = process.env.COMPRESSION_LEVEL) !== null && _l !== void 0 ? _l : '6'),
    // Query Optimization Configuration
    QUERY_OPTIMIZATION_ENABLED: process.env.QUERY_OPTIMIZATION_ENABLED === 'true',
    DEFAULT_PAGE_SIZE: parseInt((_m = process.env.DEFAULT_PAGE_SIZE) !== null && _m !== void 0 ? _m : '20'),
    MAX_PAGE_SIZE: parseInt((_o = process.env.MAX_PAGE_SIZE) !== null && _o !== void 0 ? _o : '100'),
    DEFAULT_SORT_FIELD: (_p = process.env.DEFAULT_SORT_FIELD) !== null && _p !== void 0 ? _p : 'createdAt',
    DEFAULT_SORT_DIRECTION: (_q = process.env.DEFAULT_SORT_DIRECTION) !== null && _q !== void 0 ? _q : 'desc',
    // Firestore Optimization Configuration
    FIRESTORE_BATCH_SIZE: parseInt((_r = process.env.FIRESTORE_BATCH_SIZE) !== null && _r !== void 0 ? _r : '500'),
    FIRESTORE_TIMEOUT: parseInt((_s = process.env.FIRESTORE_TIMEOUT) !== null && _s !== void 0 ? _s : '30000'),
    FIRESTORE_RETRY_ATTEMPTS: parseInt((_t = process.env.FIRESTORE_RETRY_ATTEMPTS) !== null && _t !== void 0 ? _t : '3'),
    // Performance Monitoring Configuration
    PERFORMANCE_MONITORING_ENABLED: process.env.PERFORMANCE_MONITORING_ENABLED === 'true',
    METRICS_COLLECTION_INTERVAL: parseInt((_u = process.env.METRICS_COLLECTION_INTERVAL) !== null && _u !== void 0 ? _u : '60000'),
    SLOW_QUERY_THRESHOLD: parseInt((_v = process.env.SLOW_QUERY_THRESHOLD) !== null && _v !== void 0 ? _v : '1000'),
    // AWS S3 (opcional, para almacenamiento de archivos)
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'your-aws-access-key',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'your-aws-secret-key',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'your-s3-bucket-name',
    // Stripe (opcional, para pagos)
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'your-stripe-secret-key',
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || 'your-stripe-publishable-key',
    // Analytics
    ANALYTICS_ENABLED: process.env.ANALYTICS_ENABLED === 'true',
    ANALYTICS_API_KEY: process.env.ANALYTICS_API_KEY || 'your-analytics-api-key',
    // Monitoring
    MONITORING_ENABLED: process.env.MONITORING_ENABLED === 'true',
    MONITORING_API_KEY: process.env.MONITORING_API_KEY || 'your-monitoring-api-key',
    // Security
    BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || 12,
    SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret',
    // Development
    DEBUG_MODE: process.env.DEBUG_MODE === 'true',
    HOT_RELOAD: process.env.HOT_RELOAD === 'true',
    // Testing
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/mussikon-test',
    TEST_MODE: process.env.TEST_MODE === 'true',
};
// Validación de variables críticas
const validateEnv = () => {
    const requiredVars = [
        'JWT_SECRET',
        'DATABASE_URL',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL',
    ];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        console.warn('⚠️ Variables de entorno faltantes:', missingVars);
        console.warn('💡 Asegúrate de configurar estas variables en tu archivo .env');
    }
    return missingVars.length === 0;
};
exports.validateEnv = validateEnv;
// Configuración específica para desarrollo
exports.isDevelopment = exports.ENV.NODE_ENV === 'development';
exports.isProduction = exports.ENV.NODE_ENV === 'production';
exports.isTest = exports.ENV.NODE_ENV === 'test';
// Configuración de URLs
const getBaseUrl = () => {
    if (exports.isDevelopment) {
        return `http://localhost:${exports.ENV.PORT}`;
    }
    return process.env.BASE_URL || `https://your-domain.com`;
};
exports.getBaseUrl = getBaseUrl;
// Configuración de CORS
const getCorsConfig = () => ({
    origin: exports.ENV.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});
exports.getCorsConfig = getCorsConfig;
// Configuración de rate limiting
const getRateLimitConfig = () => ({
    windowMs: parseInt(exports.ENV.RATE_LIMIT_WINDOW_MS.toString()),
    max: parseInt(exports.ENV.RATE_LIMIT_MAX_REQUESTS.toString()),
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
});
exports.getRateLimitConfig = getRateLimitConfig;
// Configuración de Expo
const getExpoConfig = () => ({
    accessToken: exports.ENV.EXPO_ACCESS_TOKEN,
    projectId: exports.ENV.EXPO_PROJECT_ID,
});
exports.getExpoConfig = getExpoConfig;
// Configuración de VAPID
const getVapidConfig = () => ({
    publicKey: exports.ENV.VAPID_PUBLIC_KEY,
    privateKey: exports.ENV.VAPID_PRIVATE_KEY,
});
exports.getVapidConfig = getVapidConfig;
exports.default = exports.ENV;
