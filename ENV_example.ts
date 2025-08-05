import os from "os";

function obtenerIpLocal(): string {
    const interfaces = os.networkInterfaces();
    let ipLocal = '';
    
    for (let interfaceName in interfaces) {
        for (let iface of interfaces[interfaceName]!) {
            if (!iface.internal && iface.family === 'IPv4') {
                ipLocal = iface.address;
                break;
            }
        }
        if (ipLocal) break;
    }
    return ipLocal;
}

export const IP = obtenerIpLocal();
export const PORT = 3000; // Aqui va el puerto que desees.
export const URL_API = `http://${IP}:`; // Aqui esta la IP del equipo donde se esta ejecutando la api.

// Almacenamiento seguro para idriveE2
export const IDRIVE_E2_ENDPOINT = ""; // ejemplo: https://musikon-media.c8q1.va03.idrivee2-84.com
export const IDRIVE_E2_ACCESS_KEY = "";
export const IDRIVE_E2_SECRET_KEY = "";
export const IDRIVE_E2_REGION = "";
export const IDRIVE_E2_BUCKET_NAME = ""; // ejemplo: musikon-media

// Email
export const EMAIL_USER = "";
export const EMAIL_PASSWORD = "";

// Firebase
export const FIREBASE_CREDENTIALS = "";

// Configuración de variables de entorno para MussikOn API
export const ENV = {
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
  REDIS_HOST: process.env.REDIS_HOST ?? 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT ?? '6379'),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD ?? '',
  REDIS_DB: parseInt(process.env.REDIS_DB ?? '0'),
  REDIS_TTL: parseInt(process.env.REDIS_TTL ?? '3600'),
  REDIS_MAX_MEMORY: process.env.REDIS_MAX_MEMORY ?? '256mb',
  
  // Cache Configuration
  CACHE_ENABLED: process.env.CACHE_ENABLED === 'true',
  CACHE_TTL: parseInt(process.env.CACHE_TTL ?? '3600'),
  CACHE_MAX_ITEMS: parseInt(process.env.CACHE_MAX_ITEMS ?? '1000'),
  CACHE_CLEANUP_INTERVAL: parseInt(process.env.CACHE_CLEANUP_INTERVAL ?? '300000'),
  
  // Compression Configuration
  COMPRESSION_ENABLED: process.env.COMPRESSION_ENABLED === 'true',
  COMPRESSION_THRESHOLD: parseInt(process.env.COMPRESSION_THRESHOLD ?? '1024'),
  COMPRESSION_LEVEL: parseInt(process.env.COMPRESSION_LEVEL ?? '6'),
  
  // Query Optimization Configuration
  QUERY_OPTIMIZATION_ENABLED: process.env.QUERY_OPTIMIZATION_ENABLED === 'true',
  DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE ?? '20'),
  MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE ?? '100'),
  DEFAULT_SORT_FIELD: process.env.DEFAULT_SORT_FIELD ?? 'createdAt',
  DEFAULT_SORT_DIRECTION: process.env.DEFAULT_SORT_DIRECTION ?? 'desc',
  
  // Firestore Optimization Configuration
  FIRESTORE_BATCH_SIZE: parseInt(process.env.FIRESTORE_BATCH_SIZE ?? '500'),
  FIRESTORE_TIMEOUT: parseInt(process.env.FIRESTORE_TIMEOUT ?? '30000'),
  FIRESTORE_RETRY_ATTEMPTS: parseInt(process.env.FIRESTORE_RETRY_ATTEMPTS ?? '3'),
  
  // Performance Monitoring Configuration
  PERFORMANCE_MONITORING_ENABLED: process.env.PERFORMANCE_MONITORING_ENABLED === 'true',
  METRICS_COLLECTION_INTERVAL: parseInt(process.env.METRICS_COLLECTION_INTERVAL ?? '60000'),
  SLOW_QUERY_THRESHOLD: parseInt(process.env.SLOW_QUERY_THRESHOLD ?? '1000'),
  
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
export const validateEnv = () => {
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

// Configuración específica para desarrollo
export const isDevelopment = ENV.NODE_ENV === 'development';
export const isProduction = ENV.NODE_ENV === 'production';
export const isTest = ENV.NODE_ENV === 'test';

// Configuración de URLs
export const getBaseUrl = () => {
  if (isDevelopment) {
    return `http://localhost:${ENV.PORT}`;
  }
  return process.env.BASE_URL || `https://your-domain.com`;
};

// Configuración de CORS
export const getCorsConfig = () => ({
  origin: ENV.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});

// Configuración de rate limiting
export const getRateLimitConfig = () => ({
  windowMs: parseInt(ENV.RATE_LIMIT_WINDOW_MS.toString()),
  max: parseInt(ENV.RATE_LIMIT_MAX_REQUESTS.toString()),
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuración de Expo
export const getExpoConfig = () => ({
  accessToken: ENV.EXPO_ACCESS_TOKEN,
  projectId: ENV.EXPO_PROJECT_ID,
});

// Configuración de VAPID
export const getVapidConfig = () => ({
  publicKey: ENV.VAPID_PUBLIC_KEY,
  privateKey: ENV.VAPID_PRIVATE_KEY,
});

export default ENV;