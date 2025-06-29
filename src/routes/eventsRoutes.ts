import express from 'express';
import {io} from '../../index'; 

const app = express();
app.use(express.json());
// Simulamos una alerta desde una ruta
app.post("/send-alert", (req, res) => {
  const { userId, title, description } = req.body;

  const alerta = {
    title,
    description,
    fecha: new Date().toISOString(),
  };

  // 🧠 Emitimos al usuario específico V8DXxlAIx7hvwsqLAAAB
  io.to(userId).emit("nuevaAlerta", alerta);

  res.status(200).json({ mensaje: "Alerta enviada con éxito" });
});
