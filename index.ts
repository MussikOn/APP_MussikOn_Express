// Lee el archivo START.md y continúa con el desarrollo del proyecto

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import redoc from 'redoc-express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { URL_API } from './ENV';

// Importar middlewares de manejo de errores
import { errorHandler, notFoundHandler, asyncHandler } from './src/middleware/errorHandler';
import { logger } from './src/services/loggerService';

// Importar middleware de URLs firmadas
import { autoUpdateSignedUrls, ensureSignedUrlsInResponse, scheduledSignedUrlUpdate } from './src/middleware/signedUrlMiddleware';

// Importar rutas
import authRoutes from './src/routes/authRoutes';
import adminRoutes from './src/routes/adminRoutes';
import superAdminRoutes from './src/routes/superAdminRouter';
import adminAuthRoutes from './src/routes/adminAuthRoutes';
import imagesRoutes from './src/routes/imagesRoutes';
import musicianProfileRoutes from './src/routes/musicianProfileRoutes';
import eventsRoutes from './src/routes/eventsRoutes';
import musicianRequestRoutes from './src/routes/musicianRequestRoutes';
import chatRoutes from './src/routes/chatRoutes';
import searchRoutes from './src/routes/searchRoutes';
import analyticsRoutes from './src/routes/analyticsRoutes';
import geolocationRoutes from './src/routes/geolocationRoutes';
import paymentRoutes from './src/routes/paymentRoutes';
import paymentSystemRoutes from './src/routes/paymentSystemRoutes';
import notificationRoutes from './src/routes/notificationRoutes';
import pushNotificationRoutes from './src/routes/pushNotificationRoutes';
import musicianSearchRoutes from './src/routes/musicianSearchRoutes';
import hiringRoutes from './src/routes/hiringRoutes';
import ratingRoutes from './src/routes/ratingRoutes';
import depositRoutes from './src/routes/depositRoutes';
import voucherRoutes from './src/routes/voucherRoutes';

// Importar gestor de índices
import { FirestoreIndexManager } from './src/utils/firestoreIndexes';

// Importar sockets
import { chatSocketHandler } from './src/sockets/chatSocket';
import { socketHandler } from './src/sockets/eventSocket';

// Configurar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();
const server = createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3001',
      'http://localhost:5173/analytics',
      'http://172.20.10.2:5173',
      'http://172.20.10.2:3001/api-docs',
      'http://192.168.54.17:3001',
      'http://192.168.54.11:3001',
      'http://192.168.54.11:5173',
      'http://192.168.54.93:5173',
      'http://192.168.100.101:5173',
      'https://mussikon.web.app',
      'https://mussikon.firebaseapp.com'
    ],
    methods: ['GET', 'POST']
  }
});

// Configurar CORS
const allowedOrigins = [
  'http://localhost:5173',
      'http://localhost:3001',
      'http://localhost:5173/analytics',
      'http://172.20.10.2:5173',
      'http://172.20.10.2:3001/api-docs',
      'http://192.168.54.17:3001',
      'http://192.168.54.11:3001',
      'http://192.168.54.11:5173',
      'http://192.168.54.93:5173',
      'http://192.168.100.101:5173',
      'https://mussikon.web.app',
      'https://mussikon.firebaseapp.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// app.use(cors());

// Middleware para parsing de JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (Panel de Administración)
app.use(express.static('public'));

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
  logger.info('Request iniciado', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Interceptar el final de la respuesta para logging
  res.on('finish', () => {
    const duration = Date.now() - start;
    try {
      logger.logRequest(req, res, duration);
    } catch (error) {
      console.error('Error logging request:', error);
    }
  });

  next();
});

// Middleware para actualización automática de URLs firmadas
app.use(autoUpdateSignedUrls);
app.use(ensureSignedUrlsInResponse);

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
        url: URL_API,
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

const specs = swaggerJsdoc(swaggerOptions);

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
app.use("/auth", authRoutes);
app.use("/admin-auth", adminAuthRoutes);
app.use("/admin", paymentSystemRoutes); // Rutas de compatibilidad para /admin/payments/* (debe ir antes)
app.use("/admin", adminRoutes);
app.use("/superAdmin", superAdminRoutes);
app.use("/imgs", imagesRoutes);
app.use("/media", musicianProfileRoutes);
app.use("/events", eventsRoutes);
app.use('/musician-requests', musicianRequestRoutes);
app.use('/chat', chatRoutes);
app.use('/search', searchRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/geolocation', geolocationRoutes);
app.use('/payments', paymentRoutes);
app.use('/payment-system', paymentSystemRoutes);
app.use('/notifications', notificationRoutes);
app.use('/push-notifications', pushNotificationRoutes);
app.use('/musician-search', musicianSearchRoutes);
app.use('/hiring', hiringRoutes);
app.use('/ratings', ratingRoutes);
app.use('/deposits', depositRoutes);
app.use('/vouchers', voucherRoutes);

// Configurar documentación
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
app.use("/redoc", redoc({
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
io.on('connection', (socket) => {
  // Configurar handler de eventos
  socketHandler(io, socket, {});
});

// Middleware para rutas no encontradas (debe ir antes del error handler)
app.use(notFoundHandler);

// Middleware global de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', new Error('Unhandled Rejection'), {
    metadata: { reason, promise }
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Exportar para uso en tests
export { app, server, io };
const URL = URL_API;
// Iniciar servidor
const PORT = process.env.PORT || 3000;

// Función para inicializar el servidor
async function initializeServer() {
  try {
    // Inicializar índices de Firestore
    logger.info('🔧 Inicializando índices de Firestore...');
    await FirestoreIndexManager.initializeIndexes();
    
    // Inicializar actualización programada de URLs firmadas
    logger.info('🔧 Inicializando actualización programada de URLs firmadas...');
    scheduledSignedUrlUpdate();
    
    // Iniciar servidor
    server.listen(PORT, () => {
      logger.info(`🎵 Servidor MussikOn API iniciado en puerto ${URL}${PORT}`, {
        metadata: {
          port: PORT,
          environment: process.env.NODE_ENV || 'development',
          url: URL_API
        }
      });
    });
  } catch (error) {
    logger.error('❌ Error inicializando servidor:', error as Error);
    process.exit(1);
  }
}

// Inicializar servidor solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  initializeServer();
}
