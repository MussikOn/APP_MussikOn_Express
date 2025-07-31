"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = createToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ENV_1 = require("../config/ENV");
function createToken(name, lastName, userEmail, roll) {
    try {
        if (!userEmail || !name || !lastName || !roll) {
            return false;
        }
        if (roll === "admin") {
            return jsonwebtoken_1.default.sign({ "name": name, "lastName": lastName, "userEmail": userEmail, "roll": roll }, ENV_1.TOKEN_SECRET, { expiresIn: "1h" });
        }
        else {
            return jsonwebtoken_1.default.sign({ name, lastName, userEmail, roll }, ENV_1.TOKEN_SECRET);
        }
    }
    catch (error) {
        return false;
    }
}
