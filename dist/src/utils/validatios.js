"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarPassword = validarPassword;
exports.validarEmail = validarEmail;
function validarPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;
    return regex.test(password);
}
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
