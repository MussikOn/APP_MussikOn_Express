// Configuración de la API
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
