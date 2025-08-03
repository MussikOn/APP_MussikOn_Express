import express, { Request, Response } from 'express';
import { logger } from '../services/loggerService';
import { db } from '../utils/firebase';
import cors from 'cors';
import { authMiddleware } from '../middleware/authMiddleware';

const adm = express();
adm.use(express.json());

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Endpoints de administración y superusuario
 */

/**
 * @swagger
 * /superAdmin/deleteAllUsers:
 *   delete:
 *     tags: [Admin]
 *     summary: Elimina todos los usuarios de Firestore (protegido)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todos los usuarios eliminados exitosamente
 *       404:
 *         description: No hay usuarios para eliminar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error al eliminar todos los usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
adm.delete(
  '/deleteAllUsers',
  authMiddleware,
  async (req: Request, res: Response) => {
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

      res
        .status(200)
        .json({ message: 'Todos los usuarios fueron eliminados exitosamente' });
    } catch (error) {
      logger.error('Error al eliminar todos los usuarios:', error as Error);
      res.status(500).json({ message: 'Error al eliminar todos los usuarios' });
    }
  }
);

export default adm;
