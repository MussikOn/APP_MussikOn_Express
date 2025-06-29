
// // import {io} from "../../index"

// // io.on('connection', (socket:any) => {
// //   console.log('Usuario conectado:', socket.id);


// //   socket.on('join', (userId:any) => {
// //     socket.join(userId); 
// //     console.log(`Usuario ${userId} unido a su sala.`);
// //   });

// //   socket.on('disconnect', () => {
// //     console.log('Usuario desconectado:', socket.id);
// //   });
// // });

// import { io } from "../../index"; // Ajusta la ruta según la ubicación

// // Por ejemplo, en un controlador cuando se crea una solicitud de evento:
// io.to(musicianId).emit("newAlert", {
//   title: "¡Nuevo Evento!",
//   message: "Has recibido una solicitud para participar.",
//   date: new Date(),
//   location: "Santo Domingo"
// });

