// // models/eventModel.ts
// import { db } from "../utils/firebase";
// import { collection, addDoc } from "firebase/firestore";

// export async function registerEventModel(organizerId: string, title: string, description: string, location: string, startTime: Date, endTime: Date, musicianPreferences: string[], budget: number) {
//   try {
//     const docRef = await addDoc(collection(db, "events"), {
//       organizerId,
//       title,
//       description,
//       location,
//       startTime,
//       endTime,
//       musicianPreferences,
//       budget,
//       status: "open",  // Podría ser "open", "matched", etc.
//       createdAt: new Date(),
//     });
//     return { id: docRef.id };
//   } catch (error) {
//     console.error("Error al guardar evento:", error);
//     return null;
//   }
// }
