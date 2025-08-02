"use strict";
// Lee el archivo START.md y continúa con el desarrollo del proyecto
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const redoc_express_1 = __importDefault(require("redoc-express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const ENV_1 = require("./ENV");
// Importar middlewares de manejo de errores
const errorHandler_1 = require("./src/middleware/errorHandler");
const loggerService_1 = require("./src/services/loggerService");
// Importar rutas
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const adminRoutes_1 = __importDefault(require("./src/routes/adminRoutes"));
const superAdminRouter_1 = __importDefault(require("./src/routes/superAdminRouter"));
const imagesRoutes_1 = __importDefault(require("./src/routes/imagesRoutes"));
const musicianProfileRoutes_1 = __importDefault(require("./src/routes/musicianProfileRoutes"));
const eventsRoutes_1 = __importDefault(require("./src/routes/eventsRoutes"));
const musicianRequestRoutes_1 = __importDefault(require("./src/routes/musicianRequestRoutes"));
const chatRoutes_1 = __importDefault(require("./src/routes/chatRoutes"));
const searchRoutes_1 = __importDefault(require("./src/routes/searchRoutes"));
const analyticsRoutes_1 = __importDefault(require("./src/routes/analyticsRoutes"));
const geolocationRoutes_1 = __importDefault(require("./src/routes/geolocationRoutes"));
const paymentRoutes_1 = __importDefault(require("./src/routes/paymentRoutes"));
const notificationRoutes_1 = __importDefault(require("./src/routes/notificationRoutes"));
const pushNotificationRoutes_1 = __importDefault(require("./src/routes/pushNotificationRoutes"));
const musicianSearchRoutes_1 = __importDefault(require("./src/routes/musicianSearchRoutes"));
const hiringRoutes_1 = __importDefault(require("./src/routes/hiringRoutes"));
// Importar sockets (comentado temporalmente hasta que se implementen)
// import { setupChatSocket } from './src/sockets/chatSocket';
// import { setupEventSocket } from './src/sockets/eventSocket';
// Configurar variables de entorno
dotenv_1.default.config();
// Crear aplicación Express
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
exports.server = server;
// Configurar Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'http://localhost:5173/analytics',
            'http://192.168.54.59:5173',
            'http://192.168.54.86:5173',
            'http://192.168.54.59:1000',
            'http://172.20.10.2:5173',
            'http://172.20.10.2:3001/api-docs',
            'http://192.168.54.131:5173',
            'http://192.168.100.101:5173',
            'https://mussikon.web.app',
            'https://mussikon.firebaseapp.com'
        ],
        methods: ['GET', 'POST']
    }
});
exports.io = io;
// Configurar CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5173/analytics',
    'http://192.168.54.59:5173',
    'http://172.20.10.2:3001/api-docs',
    'http://192.168.54.86:5173',
    'http://192.168.54.59:1000',
    'http://172.20.10.2:5173',
    'http://192.168.54.131:5173',
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
// Middleware para parsing de JSON y URL encoded
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Middleware para logging de requests
app.use((req, res, next) => {
    const start = Date.now();
    // Generar ID único para el request
    const requestId = Array.isArray(req.headers['x-request-id'])
        ? req.headers['x-request-id'][0]
        : req.headers['x-request-id'] ||
            Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    req.headers['x-request-id'] = requestId;
    // Log del request
    loggerService_1.logger.info('Request iniciado', {
        requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    // Interceptar el final de la respuesta para logging
    res.on('finish', () => {
        const duration = Date.now() - start;
        loggerService_1.logger.logRequest(req, res, duration);
    });
    next();
});
// Configuración de Swagger
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "🎵 MussikOn API",
            version: "1.0.0",
            description: "API completa de MussikOn para conectar músicos con organizadores de eventos. Construida con Node.js, Express, TypeScript y Firebase.",
            contact: {
                name: "Jefry Astacio",
                email: "jefry.astacio@mussikon.com"
            },
            license: {
                name: "MIT",
                url: "https://opensource.org/licenses/MIT"
            }
        },
        servers: [
            {
                url: ENV_1.URL_API,
                description: "Servidor de producción"
            },
            {
                url: "http://localhost:3000",
                description: "Servidor de desarrollo"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT token para autenticación. Incluir en header: Authorization: Bearer <token>"
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        lastName: { type: "string" },
                        userEmail: { type: "string", format: "email" },
                        userPassword: { type: "string" },
                        roll: { type: "string", enum: ["admin", "superadmin", "eventCreator", "musician"] },
                        create_at: { type: "string", format: "date-time" },
                        update_at: { type: "string", format: "date-time" },
                        delete_at: { type: "string", format: "date-time" },
                        status: { type: "boolean" }
                    }
                },
                Event: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        user: { type: "string" },
                        eventName: { type: "string" },
                        eventType: { type: "string", enum: ["concierto", "boda", "culto", "evento_corporativo", "festival", "fiesta_privada", "graduacion", "cumpleanos", "otro"] },
                        date: { type: "string", format: "date" },
                        time: { type: "string" },
                        location: { type: "string" },
                        duration: { type: "string" },
                        instrument: { type: "string", enum: ["guitarra", "piano", "bajo", "bateria", "saxofon", "trompeta", "violin", "canto", "teclado", "flauta", "otro"] },
                        bringInstrument: { type: "boolean" },
                        comment: { type: "string" },
                        budget: { type: "string" },
                        flyerUrl: { type: "string" },
                        songs: { type: "array", items: { type: "string" } },
                        recommendations: { type: "array", items: { type: "string" } },
                        mapsLink: { type: "string" },
                        status: { type: "string", enum: ["pending_musician", "musician_assigned", "completed", "cancelled", "musician_cancelled"] },
                        assignedMusicianId: { type: "string" },
                        interestedMusicians: { type: "array", items: { type: "string" } },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    }
                },
                MusicianRequest: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        userId: { type: "string" },
                        eventType: { type: "string", enum: ["concierto", "boda", "culto", "evento_corporativo", "festival", "fiesta_privada", "graduacion", "cumpleanos", "otro"] },
                        date: { type: "string", format: "date" },
                        time: { type: "string" },
                        location: { type: "string" },
                        instrument: { type: "string", enum: ["guitarra", "piano", "bajo", "bateria", "saxofon", "trompeta", "violin", "canto", "teclado", "flauta", "otro"] },
                        budget: { type: "number" },
                        status: { type: "string", enum: ["pendiente", "asignada", "cancelada", "completada", "no_asignada"] },
                        assignedMusicianId: { type: "string" },
                        description: { type: "string" },
                        requirements: { type: "string" },
                        contactPhone: { type: "string" },
                        contactEmail: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    }
                },
                Image: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        key: { type: "string" },
                        url: { type: "string" },
                        originalName: { type: "string" },
                        fileName: { type: "string" },
                        size: { type: "number" },
                        mimetype: { type: "string" },
                        category: { type: "string", enum: ["profile", "post", "event", "gallery", "admin"] },
                        userId: { type: "string" },
                        description: { type: "string" },
                        tags: { type: "array", items: { type: "string" } },
                        metadata: { type: "object" },
                        isPublic: { type: "boolean" },
                        isActive: { type: "boolean" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                        expiresAt: { type: "string", format: "date-time" }
                    }
                },
                Message: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        conversationId: { type: "string" },
                        senderId: { type: "string" },
                        senderName: { type: "string" },
                        content: { type: "string" },
                        timestamp: { type: "string", format: "date-time" },
                        status: { type: "string", enum: ["sent", "delivered", "read"] },
                        type: { type: "string", enum: ["text", "image", "audio", "file"] }
                    }
                },
                Conversation: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        participants: { type: "array", items: { type: "string" } },
                        lastMessage: { $ref: "#/components/schemas/Message" },
                        unreadCount: { type: "number" },
                        updatedAt: { type: "string", format: "date-time" },
                        isActive: { type: "boolean" },
                        createdAt: { type: "string", format: "date-time" }
                    }
                },
                Error: {
                    type: "object",
                    properties: {
                        error: {
                            type: "string",
                            description: "Mensaje de error"
                        },
                        code: {
                            type: "string",
                            description: "Código de error"
                        },
                        timestamp: {
                            type: "string",
                            format: "date-time",
                            description: "Timestamp del error"
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: "Auth",
                description: "Endpoints de autenticación y gestión de usuarios"
            },
            {
                name: "Events",
                description: "Gestión de eventos y solicitudes de músicos"
            },
            {
                name: "Admin",
                description: "Funciones administrativas y de superusuario"
            },
            {
                name: "Images",
                description: "Gestión de imágenes y archivos multimedia"
            },
            {
                name: "Chat",
                description: "Sistema de chat en tiempo real"
            },
            {
                name: "Musician Requests",
                description: "Solicitudes directas de músicos"
            },
            {
                name: "Musician Profile",
                description: "Gestión de perfiles de músicos"
            },
            {
                name: "Media",
                description: "Endpoints para gestión de archivos multimedia"
            },
            {
                name: "Search",
                description: "Búsqueda avanzada y filtros"
            },
            {
                name: "Analytics",
                description: "Analytics, reportes y métricas de la plataforma"
            },
            {
                name: "Geolocation",
                description: "Servicios de geolocalización y búsqueda por proximidad"
            },
            {
                name: "Payments",
                description: "Sistema de pagos, facturación y gestión financiera"
            }
        ]
    },
    apis: ["./src/routes/*.ts", "./src/controllers/*.ts"]
};
const specs = (0, swagger_jsdoc_1.default)(swaggerOptions);
// Configurar Swagger UI
const swaggerUiOptions = {
    customSiteTitle: "🎵 MussikOn API - Documentación",
    customCss: '.swagger-ui .topbar { display: none }',
    customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js'
    ]
};
// Configurar rutas
app.use("/auth", authRoutes_1.default);
app.use("/admin", adminRoutes_1.default);
app.use("/superAdmin", superAdminRouter_1.default);
app.use("/imgs", imagesRoutes_1.default);
app.use("/media", musicianProfileRoutes_1.default);
app.use("/events", eventsRoutes_1.default);
app.use('/musician-requests', musicianRequestRoutes_1.default);
app.use('/chat', chatRoutes_1.default);
app.use('/search', searchRoutes_1.default);
app.use('/analytics', analyticsRoutes_1.default);
app.use('/geolocation', geolocationRoutes_1.default);
app.use('/payments', paymentRoutes_1.default);
app.use('/notifications', notificationRoutes_1.default);
app.use('/push-notifications', pushNotificationRoutes_1.default);
app.use('/musician-search', musicianSearchRoutes_1.default);
app.use('/hiring', hiringRoutes_1.default);
// Configurar documentación
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs, swaggerUiOptions));
app.use("/redoc", (0, redoc_express_1.default)({
    title: "🎵 MussikOn API - Documentación",
    specUrl: "/api-docs/swagger.json",
    redocOptions: {
        theme: {
            colors: {
                primary: {
                    main: "#667eea"
                }
            }
        }
    }
}));
// Endpoint de prueba
app.get('/test', (req, res) => {
    res.json({
        message: 'MussikOn API funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});
// Endpoint raíz
app.get('/', (req, res) => {
    res.json({
        message: '🎵 MussikOn API - Conectando músicos con organizadores',
        version: '1.0.0',
        status: 'online',
        documentation: '/api-docs',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/auth',
            events: '/events',
            admin: '/admin',
            images: '/imgs',
            chat: '/chat',
            search: '/search',
            analytics: '/analytics',
            geolocation: '/geolocation',
            payments: '/payments',
            notifications: '/notifications',
            pushNotifications: '/push-notifications',
            documentation: '/api-docs'
        }
    });
});
// Configurar sockets
// setupChatSocket(io);
// setupEventSocket(io);
// Middleware para rutas no encontradas (debe ir antes del error handler)
app.use(errorHandler_1.notFoundHandler);
// Middleware global de manejo de errores (debe ir al final)
app.use(errorHandler_1.errorHandler);
// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
    loggerService_1.logger.error('Unhandled Rejection at:', new Error('Unhandled Rejection'), {
        metadata: { reason, promise }
    });
});
process.on('uncaughtException', (error) => {
    loggerService_1.logger.error('Uncaught Exception:', error);
    process.exit(1);
});
const URL = ENV_1.URL_API;
// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    loggerService_1.logger.info(`🎵 Servidor MussikOn API iniciado en puerto ${URL}${PORT}`, {
        metadata: {
            port: PORT,
            environment: process.env.NODE_ENV || 'development',
            url: ENV_1.URL_API
        }
    });
});
