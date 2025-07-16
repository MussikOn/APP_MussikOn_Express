import os from "os";

function obtenerIpLocal(): string {
    const interfaces = os.networkInterfaces();
    let ipLocal = '';
    
    for (let interfaceName in interfaces) {
        for (let iface of interfaces[interfaceName]!) {
            if (!iface.internal && iface.family === 'IPv4') {
                ipLocal = iface.address;
                break;
            }
        }
        if (ipLocal) break;
    }
    return ipLocal;
}

export const IP = obtenerIpLocal();
export const PORT = 3000; // Aqui va el puerto que desees.
export const URL_API = `http://${IP}:`; // Aqui esta la IP del equipo donde se esta ejecutando la api.

// Almacenamiento seguro para idriveE2
export const IDRIVE_E2_ENDPOINT = ""; // ejemplo: https://musikon-media.c8q1.va03.idrivee2-84.com
export const IDRIVE_E2_ACCESS_KEY = "";
export const IDRIVE_E2_SECRET_KEY = "";
export const IDRIVE_E2_REGION = "";

// Email
export const EMAIL_USER = "";
export const EMAIL_PASSWORD = "";

// Firebase
export const FIREBASE_CREDENTIALS = "";