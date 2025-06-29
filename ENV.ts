// Creadenciales de google.

// Client ID: 52548761937-0nh2fu5rpv4tamjv41dvabje2kru5a6v.apps.googleusercontent.com
// Secreto del Cliente: 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

import os from "os";
// export const IP = req.ip
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
export const SERVER_PORT = 10000;
export const URL_API = `http://${IP}:`;
export const TOKEN_SECRET = `0ch1n@gu@01`; 
