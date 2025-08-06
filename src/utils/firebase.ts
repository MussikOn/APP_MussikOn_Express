import path from 'path';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const FIREBASE_CREDENTIALS = process.env.FIREBASE_CREDENTIALS || 'mus1k0n-firebase-adminsdk-fbsvc-d6e712e084.json';

// Corregir la ruta para que apunte a la raíz del proyecto, no a dist
const serviceAccount = path.join(process.cwd(), FIREBASE_CREDENTIALS);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
// Inicializando Auth
export const suthAdmin = admin.auth();
// Inicializacion en FireBase.
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });
export const dmAdmin = admin;
export const db = admin.firestore();
