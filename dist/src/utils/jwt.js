"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = createToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ENV_1 = require("../../ENV");
function createToken(name, lastName, userEmail, roll) {
    try {
        if (!userEmail || !name || !lastName || !roll) {
            return false;
        }
        // Generar token con expiración consistente para todos los roles
        // 24 horas para desarrollo, se puede ajustar según necesidades
        return jsonwebtoken_1.default.sign({
            name: name,
            lastName: lastName,
            userEmail: userEmail,
            roll: roll
        }, ENV_1.TOKEN_SECRET, { expiresIn: "24h" });
    }
    catch (error) {
        return false;
    }
}
