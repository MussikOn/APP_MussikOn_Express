import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
const port = process.env.PORT || 10000;
import { db } from "./src/utils/firebase";
import { SERVER_PORT, URL_API } from "./ENV";
import routAuth from "./src/routes/authRutes";
import adm from "./src/routes/superAdminRouter";
import imgRouter from "./src/routes/imagesRoutes";
import express, { Response, Request } from "express";
import musician from "./src/routes/musicianProfileRoutes";
import { socketHandler } from "./src/sockets/eventSocket";
const users: Record<string, string> = {};
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", routAuth);
app.use("/superAdmin", adm);
app.use("/imgs", imgRouter);
app.use("/media", musician);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"],
  },
});

io.on("connection", (socket) => {
  socketHandler(io, socket, users);
});

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

server.listen(port, () => {
  console.log(`MusikOn API:${URL_API}${port}`);
});
