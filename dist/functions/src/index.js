"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloWorld = exports.websocket = exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Importar rutas
const authRutes_1 = __importDefault(require("./routes/authRutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const superAdminRouter_1 = __importDefault(require("./routes/superAdminRouter"));
const imagesRoutes_1 = __importDefault(require("./routes/imagesRoutes"));
const musicianProfileRoutes_1 = __importDefault(require("./routes/musicianProfileRoutes"));
const eventsRoutes_1 = __importDefault(require("./routes/eventsRoutes"));
const musicianRequestRoutes_1 = __importDefault(require("./routes/musicianRequestRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const advancedSearchRoutes_1 = __importDefault(require("./routes/advancedSearchRoutes"));
const optimizationRoutes_1 = __importDefault(require("./routes/optimizationRoutes"));
// Inicializar Firebase Admin
admin.initializeApp();
// Configurar variables de entorno
dotenv_1.default.config();
// Crear aplicación Express
const app = (0, express_1.default)();
// Configurar CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://192.168.54.59:5173',
    'http://192.168.54.59:1000',
    'http://172.20.10.2:5173',
    'http://192.168.100.101:5173',
    'https://mussikon.web.app',
    'https://mussikon.firebaseapp.com'
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Configurar rutas
app.use("/auth", authRutes_1.default);
app.use("/admin", adminRoutes_1.default);
app.use("/superAdmin", superAdminRouter_1.default);
app.use("/imgs", imagesRoutes_1.default);
app.use("/media", musicianProfileRoutes_1.default);
app.use("/events", eventsRoutes_1.default);
app.use('/musician-requests', musicianRequestRoutes_1.default);
app.use('/chat', chatRoutes_1.default);
app.use('/advanced-search', advancedSearchRoutes_1.default);
app.use('/optimization', optimizationRoutes_1.default);
// Endpoint de prueba
app.get('/test', (req, res) => {
    res.json({
        message: 'MussikOn API funcionando en Firebase Cloud Functions',
        timestamp: new Date().toISOString(),
        environment: 'production'
    });
});
// Endpoint raíz
app.get('/', (req, res) => {
    res.json({
        message: '🎵 MussikOn API - Conectando músicos con organizadores',
        version: '1.0.0',
        status: 'online',
        documentation: '/api-docs',
        timestamp: new Date().toISOString()
    });
});
// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error en la API:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        timestamp: new Date().toISOString()
    });
});
// Exportar la función HTTP
exports.api = (0, https_1.onRequest)({
    timeoutSeconds: 540,
    memory: '2GiB',
    maxInstances: 10
}, app);
// Exportar función para WebSockets (si es necesario)
exports.websocket = (0, https_1.onRequest)({
    timeoutSeconds: 540,
    memory: '1GiB',
    maxInstances: 10
}, (req, res) => {
    res.json({
        message: 'WebSocket endpoint - Implementar según necesidades',
        timestamp: new Date().toISOString()
    });
});
// Función de prueba
exports.helloWorld = (0, https_1.onRequest)((request, response) => {
    response.json({
        message: "¡Hola desde MussikOn API en Firebase Cloud Functions!",
        timestamp: new Date().toISOString(),
        project: "mussikon-79cdc"
    });
});
