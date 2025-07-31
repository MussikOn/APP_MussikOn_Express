"use strict";
// Creadenciales de google.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKEN_SECRET = exports.URL_API = exports.SERVER_PORT = exports.IP = void 0;
// Client ID: 52548761937-0nh2fu5rpv4tamjv41dvabje2kru5a6v.apps.googleusercontent.com
// Secreto del Cliente: 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
const os_1 = __importDefault(require("os"));
// export const IP = req.ip
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
exports.SERVER_PORT = 10000;
exports.URL_API = `http://${exports.IP}:`;
exports.TOKEN_SECRET = `0ch1n@gu@01`;
