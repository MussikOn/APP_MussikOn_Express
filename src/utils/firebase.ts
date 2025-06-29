import path from "path";
import * as admin from "firebase-admin";


const serviceAccount = path.join(__dirname, "../../mus1k0n-firebase-adminsdk-fbsvc-d5c9971a94.json");
// Inicializacion e FireBase.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
export const dmAdmin = admin;
export const db = admin.firestore();