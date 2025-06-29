import express, {Request, Response} from "express";
import { db } from "../utils/firebase";
import cors from "cors";

const adm = express();
adm.use(express.json());

  // Ruta para eliminar todos los usuarios de Firestore
adm.delete('/deleteAllUsers', async (req:Request, res:Response) => {
    try {
      const snapshot = await db.collection('users').get();
  
      if (snapshot.empty) {
         res.status(404).json({ message: 'No hay usuarios para eliminar' });
      }
      const deletePromises: Promise<FirebaseFirestore.WriteResult>[] = [];
  
      snapshot.forEach(doc => {
        deletePromises.push(db.collection('users').doc(doc.id).delete());
      });
  
      await Promise.all(deletePromises);
  
      res.status(200).json({ message: 'Todos los usuarios fueron eliminados exitosamente' });
    } catch (error) {
      console.error('Error al eliminar todos los usuarios:', error);
      res.status(500).json({ message: 'Error al eliminar todos los usuarios' });
    }
  });

export default adm;