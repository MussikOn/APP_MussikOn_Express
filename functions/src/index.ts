import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import authRoutes from './routes/authRutes';
import adminRoutes from './routes/adminRoutes';
import superAdminRoutes from './routes/superAdminRouter';
import imagesRoutes from './routes/imagesRoutes';
import musicianProfileRoutes from './routes/musicianProfileRoutes';
import eventsRoutes from './routes/eventsRoutes';
import musicianRequestRoutes from './routes/musicianRequestRoutes';
import chatRoutes from './routes/chatRoutes';

// Importar configuración
import { URL_API } from './config/ENV';

// Inicializar Firebase Admin
admin.initializeApp();

// Configurar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar rutas
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/superAdmin", superAdminRoutes);
app.use("/imgs", imagesRoutes);
app.use("/media", musicianProfileRoutes);
app.use("/events", eventsRoutes);
app.use('/musician-requests', musicianRequestRoutes);
app.use('/chat', chatRoutes);

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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error en la API:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
});

// Exportar la función HTTP
export const api = onRequest({
  timeoutSeconds: 540,
  memory: '2GiB',
  maxInstances: 10
}, app);

// Exportar función para WebSockets (si es necesario)
export const websocket = onRequest({
  timeoutSeconds: 540,
  memory: '1GiB',
  maxInstances: 10
}, (req: any, res: any) => {
  res.json({
    message: 'WebSocket endpoint - Implementar según necesidades',
    timestamp: new Date().toISOString()
  });
});

// Función de prueba
export const helloWorld = onRequest((request, response) => {
  response.json({
    message: "¡Hola desde MussikOn API en Firebase Cloud Functions!",
    timestamp: new Date().toISOString(),
    project: "mussikon-79cdc"
  });
});
