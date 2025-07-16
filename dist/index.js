"use strict";
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
const eventsRoutes_1 = __importDefault(require("./src/routes/eventsRoutes"));
const users = {};
exports.users = users;
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/auth", authRutes_1.default);
app.use("/superAdmin", superAdminRouter_1.default);
app.use("/imgs", imagesRoutes_1.default);
app.use("/media", musicianProfileRoutes_1.default);
app.use("/events", eventsRoutes_1.default);
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MusikOn API",
            version: "1.0.0",
            description: "API para gestión de músicos y eventos en MusikOn",
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
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
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
    io.to(users["jasbootstudios@gmail.com"]).emit("notification", {
        title: "Nueva solicitud de evento",
        nombre: "Organizador X",
        fecha: "2025-04-25",
        direccion: "Av. Siempre Viva #123",
    });
    res.send(`<h1>MusikOn API</h1><p>Se Agregaron las notificaciones!</p>`);
});
server.listen(port, () => {
    console.log(`MusikOn API:${ENV_1.URL_API}${port}`);
});
