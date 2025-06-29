"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.URL_API = exports.PORT = exports.IP = void 0;
const os_1 = __importDefault(require("os"));
function obtenerIpLocal() {
    const interfaces = os_1.default.networkInterfaces();
    let ipLocal = '';
    for (let interfaceName in interfaces) {
        for (let iface of interfaces[interfaceName]) {
            if (!iface.internal && iface.family === 'IPv4') {
                ipLocal = iface.address;
                break;
            }
        }
        if (ipLocal)
            break;
    }
    return ipLocal;
}
exports.IP = obtenerIpLocal();
exports.PORT = 3000; // Aqui va el puerto que desees.
exports.URL_API = `http://${exports.IP}:`; // Aqui esta la IP del equipo donde se esta ejecutando la api.
