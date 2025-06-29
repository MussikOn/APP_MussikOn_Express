import path from "path";
import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const FIREBASE_CREDENTIALS = process.env.FIREBASE_CREDENTIALS;


const serviceAccount = path.join(__dirname, `../../${FIREBASE_CREDENTIALS}`);
// Inicializacion e FireBase.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
export const dmAdmin = admin;
export const db = admin.firestore();