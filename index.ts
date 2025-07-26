// Lee el archivo START.md y continúa con el desarrollo del proyecto

import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { initializeSocket } from "./src/utils/socket.Io";
const port = process.env.PORT || 1000;
import { db } from "./src/utils/firebase";
import { URL_API } from "./ENV";
import routAuth from "./src/routes/authRutes";
import adm from "./src/routes/superAdminRouter";
import imgRouter from "./src/routes/imagesRoutes";
import express, { Response, Request } from "express";
import musician from "./src/routes/musicianProfileRoutes";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import redoc from "redoc-express";
import eventsRouter from "./src/routes/eventsRoutes";
import musicianRequestRoutes from './src/routes/musicianRequestRoutes';
import { setSocketInstance } from './src/controllers/musicianRequestController';
import { getUserByEmailModel } from './src/models/authModel';
import adminRoutes from "./src/routes/adminRoutes";
const users: Record<string, string> = {};
dotenv.config();
const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.54.59:5173',
  'http://192.168.54.59:1000',
  'http://192.168.100.101:5173'
];
const app = express();
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
app.use(express.json());
app.use("/admin", adminRoutes);
app.use("/auth", routAuth);
app.use("/superAdmin", adm);
app.use("/imgs", imgRouter);
app.use("/media", musician);
app.use("/events", eventsRouter);
app.use('/musician-requests', musicianRequestRoutes);

// Endpoint de prueba sin autenticación
app.get('/test', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
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
    }
  ]);
});

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MussikOn API",
      version: "1.0.0",
      description: "API para gestión de músicos y eventos en MussikOn",
    },
    servers: [
      {
        url: "http://localhost:1000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Endpoints de autenticación y usuarios" },
      { name: "Events", description: "Endpoints de eventos y matching" },
      { name: "Images", description: "Endpoints de galería de imágenes" },
      { name: "MusicianRequests", description: "Endpoints de solicitudes directas de músicos" },
      { name: "Admin", description: "Endpoints de administración de usuarios" },
      { name: "AdminEvents", description: "Endpoints de administración de eventos" },
      { name: "AdminMusicians", description: "Endpoints de administración de músicos" },
      { name: "AdminImages", description: "Endpoints de administración de imágenes" },
      { name: "AdminMusicianRequests", description: "Endpoints de administración de solicitudes de músico" }
    ]
  },
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts",
    "./index.ts"
  ],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);

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
  `,
  customSiteTitle: "MussikOn API Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    docExpansion: "list",
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (req: any) => {
      req.headers['Content-Type'] = 'application/json';
      return req;
    }
  }
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Endpoint para servir el JSON de Swagger
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Redoc como alternativa con sidebar lateral más moderno
app.get('/redoc', redoc({
  title: 'MussikOn API Documentation',
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
const server = http.createServer(app);
const io = initializeSocket(server, users);
setSocketInstance(io, users);

// Middleware global de manejo de errores
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error(err);
  res.status(err.status || 500).json({ msg: err.message || 'Error interno', error: err });
});

export { io, users };

app.get("/getAllUsers", async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("users").get();
    const users: any[] = [];

    snapshot.forEach((doc) => {
      users.push(doc.data());
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener datos de Firestore:", error);
    res.status(500).send("Error al obtener datos de Firebase");
  }
});

app.post("/getAllUsers/:userEmail", async (req: Request, res: Response) => {
  const userEmail: string = req.params.userEmail.toLowerCase();
  const userData = req.body.userData;
  io.to(users[userEmail]).emit("notification", userData);
  // io.to(users[userEmail]).emit("notification",{"nombre":"Jefry Astacio", "Roll":"Músico"});
  try {
    const snapshot = await db.collection("users").get();
    const users: any[] = [];

    snapshot.forEach((doc) => {
      users.push(doc.data());
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener datos de Firestore:", error);
    res.status(500).send("Error al obtener datos de Firebase");
  }
});

app.get("/", (req: Request, res: Response) => {
  res.sendFile(__dirname + '/src/utils/index.html');
});

// Endpoint temporal para verificar si un usuario existe
app.get('/auth/check-user/:userEmail', async (req: Request, res: Response) => {
  const userEmail = req.params.userEmail.toLowerCase();
  const user = await getUserByEmailModel(userEmail);
  if (user) {
    res.status(200).json({ exists: true, user });
  } else {
    res.status(404).json({ exists: false, message: 'Usuario no encontrado' });
  }
});

server.listen(port, () => {
  console.log(`🎵 MussikOn API: ${URL_API}${port}`);
  console.log(`📚 Swagger UI: ${URL_API}${port}/api-docs`);
  console.log(`🎨 Redoc: ${URL_API}${port}/redoc`);
  console.log(`🏠 Página de inicio: ${URL_API}${port}/`);
});
