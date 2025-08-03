import path from 'path';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const FIREBASE_CREDENTIALS = process.env.FIREBASE_CREDENTIALS;

if (!FIREBASE_CREDENTIALS) {
  throw new Error('FIREBASE_CREDENTIALS environment variable is required');
}

const serviceAccountPath = path.join(__dirname, `../../${FIREBASE_CREDENTIALS}`);

// Verificar que el archivo de credenciales existe
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Firebase credentials file not found at: ${serviceAccountPath}`);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
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
