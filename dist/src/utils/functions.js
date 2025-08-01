"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberRandon = void 0;
exports.handleError = handleError;
exports.handleSuccess = handleSuccess;
const crypto_1 = require("crypto");
const numberRandon = () => {
    const number = (0, crypto_1.randomInt)(100000, 1000000);
    return number;
};
exports.numberRandon = numberRandon;
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
// Centraliza el manejo de errores y respuestas
function handleError(res, error, message = 'Error interno del servidor', status = 500) {
    console.error(error);
    return res.status(status).json({ msg: message, error });
}
function handleSuccess(res, data, message = 'Operación exitosa', status = 200) {
    return res.status(status).json({ msg: message, data });
}
