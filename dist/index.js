"use strict";
// Lee el archivo START.md y continúa con el desarrollo del proyecto
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = exports.io = void 0;
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_Io_1 = require("./src/utils/socket.Io");
const port = process.env.PORT || 1000;
const firebase_1 = require("./src/utils/firebase");
const ENV_1 = require("./ENV");
const authRutes_1 = __importDefault(require("./src/routes/authRutes"));
const superAdminRouter_1 = __importDefault(require("./src/routes/superAdminRouter"));
const imagesRoutes_1 = __importDefault(require("./src/routes/imagesRoutes"));
const express_1 = __importDefault(require("express"));
const musicianProfileRoutes_1 = __importDefault(require("./src/routes/musicianProfileRoutes"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const redoc_express_1 = __importDefault(require("redoc-express"));
const eventsRoutes_1 = __importDefault(require("./src/routes/eventsRoutes"));
const musicianRequestRoutes_1 = __importDefault(require("./src/routes/musicianRequestRoutes"));
const chatRoutes_1 = __importDefault(require("./src/routes/chatRoutes"));
const musicianRequestController_1 = require("./src/controllers/musicianRequestController");
const authModel_1 = require("./src/models/authModel");
const adminRoutes_1 = __importDefault(require("./src/routes/adminRoutes"));
const users = {};
exports.users = users;
dotenv_1.default.config();
const allowedOrigins = [
    'http://localhost:5173', // Localhost
    'http://192.168.54.59:5173', // IP de la computadora
    'http://192.168.54.59:1000', // IP de la computadora
    'http://192.168.100.101:5173' // IP de la computadora
];
const app = (0, express_1.default)();
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
app.use(express_1.default.json());
app.use("/admin", adminRoutes_1.default);
app.use("/auth", authRutes_1.default);
app.use("/superAdmin", superAdminRouter_1.default);
app.use("/imgs", imagesRoutes_1.default);
app.use("/media", musicianProfileRoutes_1.default);
app.use("/events", eventsRoutes_1.default);
app.use('/musician-requests', musicianRequestRoutes_1.default);
app.use('/chat', chatRoutes_1.default);
// Endpoint de prueba sin autenticación
app.get('/test', (req, res) => {
    res.json({ message: 'Backend funcionando correctamente' });
});
// Endpoint para verificar la estructura del token
app.get('/test/token-info', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Token no proporcionado',
            expectedFormat: 'Bearer <token>',
            receivedHeader: authHeader
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const jwt = require('jsonwebtoken');
        const { TOKEN_SECRET } = require('./ENV');
        const decoded = jwt.verify(token, TOKEN_SECRET);
        res.json({
            message: 'Token válido',
            tokenStructure: {
                name: decoded.name,
                lastName: decoded.lastName,
                userEmail: decoded.userEmail,
                roll: decoded.roll,
                iat: decoded.iat,
                exp: decoded.exp
            },
            expectedFields: ['name', 'lastName', 'userEmail', 'roll'],
            receivedFields: Object.keys(decoded)
        });
    }
    catch (err) {
        res.status(401).json({
            message: 'Token inválido o expirado',
            error: err.message,
            tokenReceived: token.substring(0, 20) + '...'
        });
    }
});
// Endpoint para generar un token de prueba
app.get('/test/generate-token', (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        const { TOKEN_SECRET } = require('./ENV');
        const testToken = jwt.sign({
            name: 'Admin',
            lastName: 'Test',
            userEmail: 'admin@mussikon.com',
            roll: 'admin'
        }, TOKEN_SECRET, { expiresIn: '1h' });
        res.json({
            message: 'Token de prueba generado',
            token: testToken,
            tokenStructure: {
                name: 'Admin',
                lastName: 'Test',
                userEmail: 'admin@mussikon.com',
                roll: 'admin'
            },
            usage: 'Usar en header: Authorization: Bearer <token>'
        });
    }
    catch (err) {
        res.status(500).json({
            message: 'Error generando token',
            error: err.message
        });
    }
});
// Endpoint de prueba para solicitudes de músicos sin autenticación
app.get('/test/musician-requests', (req, res) => {
    res.json([
        {
            _id: '1',
            userId: 'admin@mussikon.com',
            eventType: 'concierto',
            date: '2024-08-15',
            time: '20:00 - 22:00',
            location: 'Teatro Municipal',
            instrument: 'guitarra',
            budget: 500,
            comments: 'Necesitamos un guitarrista para un concierto de rock',
            status: 'pendiente',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            _id: '2',
            userId: 'admin@mussikon.com',
            eventType: 'boda',
            date: '2024-09-20',
            time: '18:00 - 20:00',
            location: 'Jardín Botánico',
            instrument: 'piano',
            budget: 800,
            comments: 'Buscamos pianista para ceremonia de boda',
            status: 'asignada',
            assignedMusicianId: 'musico1@email.com',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            _id: '3',
            userId: 'admin@mussikon.com',
            eventType: 'culto',
            date: '2024-08-04',
            time: '10:00 - 12:00',
            location: 'Iglesia Central',
            instrument: 'voz',
            budget: 300,
            comments: 'Cantante para servicio dominical',
            status: 'completada',
            assignedMusicianId: 'musico2@email.com',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ]);
});
// Endpoints de prueba para CRUD completo sin autenticación
app.get('/test/musician-requests/:id', (req, res) => {
    const { id } = req.params;
    res.json({
        _id: id,
        userId: 'admin@mussikon.com',
        eventType: 'concierto',
        date: '2024-08-15',
        time: '20:00 - 22:00',
        location: 'Teatro Municipal',
        instrument: 'guitarra',
        budget: 500,
        comments: 'Necesitamos un guitarrista para un concierto de rock',
        status: 'pendiente',
        createdAt: new Date(),
        updatedAt: new Date()
    });
});
// Endpoints de prueba CON autenticación para CRUD completo
app.get('/auth-test/musician-requests', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Token requerido para este endpoint',
            expectedFormat: 'Bearer <token>'
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const jwt = require('jsonwebtoken');
        const { TOKEN_SECRET } = require('./ENV');
        const decoded = jwt.verify(token, TOKEN_SECRET);
        // Verificar que el usuario tenga rol de admin
        if (decoded.roll !== 'admin' && decoded.roll !== 'superadmin') {
            return res.status(403).json({
                message: 'Acceso denegado. Se requiere rol de administrador.',
                userRole: decoded.roll,
                userEmail: decoded.userEmail
            });
        }
        res.json([
            {
                _id: '1',
                userId: decoded.userEmail,
                eventType: 'concierto',
                date: '2024-08-15',
                time: '20:00 - 22:00',
                location: 'Teatro Municipal',
                instrument: 'guitarra',
                budget: 500,
                comments: 'Necesitamos un guitarrista para un concierto de rock',
                status: 'pendiente',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: '2',
                userId: decoded.userEmail,
                eventType: 'boda',
                date: '2024-09-20',
                time: '18:00 - 20:00',
                location: 'Jardín Botánico',
                instrument: 'piano',
                budget: 800,
                comments: 'Buscamos pianista para ceremonia de boda',
                status: 'asignada',
                assignedMusicianId: 'musico1@email.com',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    }
    catch (err) {
        res.status(401).json({
            message: 'Token inválido o expirado',
            error: err.message
        });
    }
});
app.post('/test/musician-requests', (req, res) => {
    const newRequest = Object.assign(Object.assign({ _id: Date.now().toString() }, req.body), { status: 'pendiente', createdAt: new Date(), updatedAt: new Date() });
    res.status(201).json(newRequest);
});
app.put('/test/musician-requests/:id', (req, res) => {
    const { id } = req.params;
    res.json({
        success: true,
        message: 'Solicitud actualizada correctamente',
        data: {
            id,
            updatedAt: new Date()
        }
    });
});
app.delete('/test/musician-requests/:id', (req, res) => {
    const { id } = req.params;
    res.json({
        success: true,
        message: 'Solicitud eliminada correctamente'
    });
});
app.post('/test/musician-requests/accept', (req, res) => {
    res.json({
        success: true,
        message: 'Solicitud aceptada correctamente',
        data: {
            requestId: req.body.requestId,
            musicianId: req.body.musicianId,
            status: 'asignada',
            assignedAt: new Date()
        }
    });
});
app.post('/test/musician-requests/cancel', (req, res) => {
    res.json({
        success: true,
        message: 'Solicitud cancelada correctamente',
        data: {
            requestId: req.body.requestId,
            status: 'cancelada',
            cancelledAt: new Date()
        }
    });
});
// Endpoints de prueba para Chat
app.get('/test/chat/conversations', (req, res) => {
    res.json([
        {
            id: '1',
            participants: ['admin@mussikon.com', 'musico1@email.com'],
            lastMessage: {
                id: 'msg1',
                conversationId: '1',
                senderId: 'musico1@email.com',
                senderName: 'Juan Guitarrista',
                content: 'Hola, estoy interesado en tu solicitud',
                timestamp: new Date().toISOString(),
                status: 'read',
                type: 'text'
            },
            unreadCount: 0,
            updatedAt: new Date().toISOString(),
            isActive: true,
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            participants: ['admin@mussikon.com', 'musico2@email.com'],
            lastMessage: {
                id: 'msg2',
                conversationId: '2',
                senderId: 'admin@mussikon.com',
                senderName: 'Admin',
                content: 'Perfecto, te confirmo los detalles',
                timestamp: new Date().toISOString(),
                status: 'delivered',
                type: 'text'
            },
            unreadCount: 1,
            updatedAt: new Date().toISOString(),
            isActive: true,
            createdAt: new Date().toISOString()
        }
    ]);
});
app.get('/test/chat/conversations/:conversationId/messages', (req, res) => {
    const { conversationId } = req.params;
    res.json([
        {
            id: 'msg1',
            conversationId,
            senderId: 'musico1@email.com',
            senderName: 'Juan Guitarrista',
            content: 'Hola, vi tu solicitud para el concierto',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'read',
            type: 'text'
        },
        {
            id: 'msg2',
            conversationId,
            senderId: 'admin@mussikon.com',
            senderName: 'Admin',
            content: 'Hola Juan, gracias por tu interés',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            status: 'read',
            type: 'text'
        },
        {
            id: 'msg3',
            conversationId,
            senderId: 'musico1@email.com',
            senderName: 'Juan Guitarrista',
            content: '¿Cuál es el repertorio que necesitas?',
            timestamp: new Date().toISOString(),
            status: 'delivered',
            type: 'text'
        }
    ]);
});
app.post('/test/chat/conversations/:conversationId/messages', (req, res) => {
    const { conversationId } = req.params;
    const { content, type = 'text' } = req.body;
    const newMessage = {
        id: Date.now().toString(),
        conversationId,
        senderId: 'admin@mussikon.com',
        senderName: 'Admin',
        content,
        timestamp: new Date().toISOString(),
        status: 'sent',
        type
    };
    res.status(201).json(newMessage);
});
app.post('/test/chat/conversations', (req, res) => {
    const { participants } = req.body;
    const newConversation = {
        id: Date.now().toString(),
        participants: ['admin@mussikon.com', ...participants],
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
    };
    res.status(201).json(newConversation);
});
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MussikOn API",
            version: "1.0.0",
            description: "API completa para gestión de músicos y eventos en MussikOn. CRUD de solicitudes de músicos completamente implementado.",
            contact: {
                name: "Soporte MussikOn",
                email: "soporte@mussikon.com"
            },
            license: {
                name: "MIT",
                url: "https://opensource.org/licenses/MIT"
            }
        },
        servers: [
            {
                url: "http://localhost:1000",
                description: "Servidor de desarrollo"
            },
            {
                url: "https://api.mussikon.com",
                description: "Servidor de producción"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT token para autenticación"
                },
            },
            schemas: {
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
        security: [{ bearerAuth: [] }],
        tags: [
            {
                name: "Auth",
                description: "Endpoints de autenticación y usuarios - ✅ Implementado"
            },
            {
                name: "Events",
                description: "Endpoints de eventos y matching - ✅ Implementado"
            },
            {
                name: "Images",
                description: "Endpoints de galería de imágenes - ✅ Implementado"
            },
            {
                name: "MusicianRequests",
                description: "Endpoints de solicitudes directas de músicos - ✅ CRUD completo implementado"
            },
            {
                name: "Admin",
                description: "Endpoints de administración de usuarios - ✅ Implementado"
            },
            {
                name: "AdminEvents",
                description: "Endpoints de administración de eventos - ✅ Implementado"
            },
            {
                name: "AdminMusicians",
                description: "Endpoints de administración de músicos - ✅ Implementado"
            },
            {
                name: "AdminImages",
                description: "Endpoints de administración de imágenes - ✅ Implementado"
            },
            {
                name: "AdminMusicianRequests",
                description: "Endpoints de administración de solicitudes de músico - ✅ Implementado"
            },
            {
                name: "Chat",
                description: "Endpoints de chat en tiempo real - ✅ Implementado"
            }
        ]
    },
    apis: [
        "./src/routes/*.ts",
        "./src/controllers/*.ts",
        "./index.ts"
    ],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
// Configuración avanzada de Swagger UI con sidebar mejorado
const swaggerUiOptions = {
    explorer: true,
    customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .scheme-container { margin: 20px 0 }
    .swagger-ui .opblock-tag { font-size: 16px; font-weight: bold; }
    .swagger-ui .opblock-tag-section { margin-bottom: 20px; }
    .swagger-ui .opblock { margin: 10px 0; }
    .swagger-ui .opblock-summary { font-weight: 500; }
    .swagger-ui .sidebar { width: 300px; }
    .swagger-ui .main { margin-left: 300px; }
    .swagger-ui .sidebar .sidebar-content { padding: 20px; }
    .swagger-ui .sidebar .sidebar-content .sidebar-item { margin: 10px 0; }
    .swagger-ui .sidebar .sidebar-content .sidebar-item a { color: #333; text-decoration: none; }
    .swagger-ui .sidebar .sidebar-content .sidebar-item a:hover { color: #007bff; }
    .swagger-ui .info .title { color: #007bff; }
    .swagger-ui .info .description { color: #666; }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #61affe; }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #49cc90; }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #fca130; }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #f93e3e; }
  `,
    customSiteTitle: "MussikOn API Documentation - CRUD Completo Implementado",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
        docExpansion: "list",
        filter: true,
        showRequestHeaders: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
        requestInterceptor: (req) => {
            req.headers['Content-Type'] = 'application/json';
            return req;
        }
    }
};
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, swaggerUiOptions));
// Endpoint para servir el JSON de Swagger
app.get('/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
// Redoc como alternativa con sidebar lateral más moderno
app.get('/redoc', (0, redoc_express_1.default)({
    title: 'MussikOn API Documentation - CRUD Completo Implementado',
    specUrl: '/api-docs/swagger.json',
    redocOptions: {
        theme: {
            colors: {
                primary: {
                    main: '#007bff'
                }
            },
            sidebar: {
                width: '300px'
            }
        },
        hideDownloadButton: false,
        hideHostname: false,
        hideLoading: false,
        nativeScrollbars: false,
        pathInMiddlePanel: true,
        requiredPropsFirst: true,
        scrollYOffset: 0,
        showExtensions: true,
        sortPropsAlphabetically: true,
        suppressWarnings: false,
        untrustedSpec: false
    }
}));
/**
 * @swagger
 * /getAllUsers:
 *   get:
 *     summary: Obtiene todos los usuarios de la base de datos
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *
 * /getAllUsers/{userEmail}:
 *   post:
 *     summary: Envía una notificación a un usuario y retorna todos los usuarios
 *     parameters:
 *       - in: path
 *         name: userEmail
 *         schema:
 *           type: string
 *         required: true
 *         description: Email del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
const server = http_1.default.createServer(app);
const io = (0, socket_Io_1.initializeSocket)(server, users);
exports.io = io;
(0, musicianRequestController_1.setSocketInstance)(io, users);
// Middleware global de manejo de errores
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ msg: err.message || 'Error interno', error: err });
});
app.get("/getAllUsers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const snapshot = yield firebase_1.db.collection("users").get();
        const users = [];
        snapshot.forEach((doc) => {
            users.push(doc.data());
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Error al obtener datos de Firestore:", error);
        res.status(500).send("Error al obtener datos de Firebase");
    }
}));
app.post("/getAllUsers/:userEmail", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = req.params.userEmail.toLowerCase();
    const userData = req.body.userData;
    io.to(users[userEmail]).emit("notification", userData);
    // io.to(users[userEmail]).emit("notification",{"nombre":"Jefry Astacio", "Roll":"Músico"});
    try {
        const snapshot = yield firebase_1.db.collection("users").get();
        const users = [];
        snapshot.forEach((doc) => {
            users.push(doc.data());
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Error al obtener datos de Firestore:", error);
        res.status(500).send("Error al obtener datos de Firebase");
    }
}));
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/src/utils/index.html');
});
// Endpoint temporal para verificar si un usuario existe
app.get('/auth/check-user/:userEmail', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = req.params.userEmail.toLowerCase();
    const user = yield (0, authModel_1.getUserByEmailModel)(userEmail);
    if (user) {
        res.status(200).json({ exists: true, user });
    }
    else {
        res.status(404).json({ exists: false, message: 'Usuario no encontrado' });
    }
}));
server.listen(port, () => {
    console.log(`🎵 MussikOn API: ${ENV_1.URL_API}${port}`);
    console.log(`📚 Swagger UI: ${ENV_1.URL_API}${port}/api-docs`);
    console.log(`🎨 Redoc: ${ENV_1.URL_API}${port}/redoc`);
    console.log(`🏠 Página de inicio: ${ENV_1.URL_API}${port}/`);
});
