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
  },
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts",
    "./index.ts"
  ],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
  io.to(users["jasbootstudios@gmail.com"]).emit("notification", {
    title: "Nueva solicitud de evento",
    nombre: "Organizador X",
    fecha: "2025-04-25",
    direccion: "Av. Siempre Viva #123",
  });

  res.send(`<h1>MusikOn API</h1><p>Se Agregaron las notificaciones!</p>`);
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
  console.log(`MusikOn API:${URL_API}${port}`);
  console.log(`MusikOn Swagger:${URL_API}${port}/api-docs`);
});
