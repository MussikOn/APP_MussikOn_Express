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