// import { Request, Response } from "express";
// import { registerEventModel } from "../models/eventModel";  // Asume que tienes este modelo.
// import { eventData } from "../utils/DataTypes";  // Asegúrate de tener un tipo eventData definido para los datos del evento.

// export async function registerEventController(req: Request, res: Response) {
//   try {
//     const { organizerId, title, description, location, startTime, endTime, musicianPreferences, budget }: eventData = req.body;

//     // Verificar que todos los campos estén presentes
//     if (!organizerId || !title || !description || !location || !startTime || !endTime || !musicianPreferences || !budget) {
//       return res.status(400).json({ msg: "Error al registrar el evento, todos los campos deben ser llenados." });
//     }

//     // Llamada al modelo para guardar el evento
//     const savedEvent = await registerEventModel(organizerId, title, description, location, startTime, endTime, musicianPreferences, budget);
    
//     if (!savedEvent) {
//       return res.status(500).json({ msg: "Hubo un error al guardar el evento." });
//     }

//     return res.status(200).json({ msg: "Evento registrado con éxito.", eventId: savedEvent.id });
//   } catch (error) {
//     console.error(`Error al registrar evento: ${error}`);
//     return res.status(400).json({ msg: "Error al registrar evento.", error });
//   }
// }
