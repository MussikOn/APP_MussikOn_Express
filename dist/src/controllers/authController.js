"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserByEmailController = exports.addEventToUserController = exports.validNumberGetByEmail = exports.emailRegisterController = exports.updateUserByEmailController = void 0;
exports.registerController = registerController;
exports.loginController = loginController;
const bcrypt_1 = __importDefault(require("bcrypt"));
const authModel_1 = require("../models/authModel");
const validatios_1 = require("../utils/validatios");
const jwt_1 = require("../utils/jwt");
const mailer_1 = require("../utils/mailer");
const functions_1 = require("../utils/functions");
const firebase_1 = require("../utils/firebase");
/**
 * @swagger
 * components:
 *   schemas:
 *     AuthUserRegister:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         lastName:
 *           type: string
 *         roll:
 *           type: string
 *         userEmail:
 *           type: string
 *         userPassword:
 *           type: string
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user:
 *           type: string
 *         eventName:
 *           type: string
 *         requesterName:
 *           type: string
 *         location:
 *           type: string
 *         date:
 *           type: string
 *         time:
 *           type: string
 *         duration:
 *           type: string
 *         instrument:
 *           type: string
 *         bringInstrument:
 *           type: boolean
 *         comment:
 *           type: string
 *         budget:
 *           type: string
 *         eventType:
 *           type: string
 *         flyerUrl:
 *           type: string
 *         songs:
 *           type: array
 *           items:
 *             type: string
 *         recommendations:
 *           type: array
 *           items:
 *             type: string
 *         mapsLink:
 *           type: string
 */
function registerController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, lastName, roll, userEmail, userPassword, status } = req.body;
            console.log(req.body);
            if (!name || !lastName || !roll || !userEmail || !userPassword) {
                res.status(400).json({ msg: "Error al registrarse, todos los campos deben de ser llenados" });
                return;
            }
            if (!(0, validatios_1.validarPassword)(userPassword)) {
                res.status(400).json({ msg: "La contraseña no cumple con los requisitos, debe de contener Mayúsculas, Minúsculas, Números y Carácteres especiales \n\n\nEjemplo: Tunombre*55 ." });
                return;
            }
            if (!(0, validatios_1.validarEmail)(userEmail)) {
                res.status(400).json({ msg: "Correo Electrónico inválido." });
                return;
            }
            const pass = yield bcrypt_1.default.hash(userPassword, 10);
            // status por defecto true si no se envía
            const userStatus = typeof status === 'boolean' ? status : true;
            const saved = yield (0, authModel_1.registerModel)(name, lastName, roll, userEmail, pass, userStatus);
            if (!saved) {
                const token = (0, jwt_1.createToken)(name, lastName, userEmail, roll);
                const user = yield (0, authModel_1.getUserByEmailModel)(userEmail);
                res.status(200).json({ msg: "Usuario Registrado con éxito.", token, user });
                return;
            }
            else if (saved === "Hay campos que no han sido llenados") {
                res.status(409).json({ msg: "Hay campos que no han sido llenados", data: saved });
                return;
            }
            else if (saved === "El usuario ya Existe.") {
                res.status(409).json({ msg: "Ya hay un usuario con esta direccion de correo electrónico.", data: saved });
                return;
            }
        }
        catch (error) {
            console.info(`Hubo un error al intentar registar un Usuario: ${error}`);
            res.status(400).json({ msg: "Error al registrarse.", error });
            return;
        }
    });
}
function loginController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userEmail, userPassword } = req.body;
            if (!userEmail || !userPassword) {
                res.status(400).json({ msg: "Todos los campos deben de ser llenados." });
                return;
            }
            ;
            if (!(0, validatios_1.validarEmail)(userEmail)) {
                res.status(400).json({ msg: "Dirección de correo electrónico no válido." });
                return;
            }
            ;
            const data = yield (0, authModel_1.getUserByEmailModel)(userEmail);
            if (!data) {
                res.status(401).json({ msg: "Verifique su dirección de correo electrónico o regístrese si no tiene una cuenta." });
                return;
            }
            ;
            const name = data.name;
            const lastName = data.lastName;
            const roll = data.roll;
            const pass = data.userPassword;
            const isMatch = yield bcrypt_1.default.compare(userPassword, pass);
            if (!isMatch) {
                res.status(401).json({ msg: "Contraseña incorrecta." });
                return;
            }
            const token = (0, jwt_1.createToken)(name, lastName, userEmail, roll);
            res.status(200).json({ msg: "Login Exitoso", token, user: data });
        }
        catch (error) {
            res.status(401).json({ msg: "Error en la petición, Inténtelo mas tarde.", error });
            return;
        }
    });
}
const updateUserByEmailController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dataUsers = req.body;
        const userEmail = req.params.userEmail.toLocaleLowerCase();
        if (!dataUsers || !userEmail) {
            res.status(401).json({ msg: "No hay Datos para actualizar" });
        }
        if (!(0, validatios_1.validarEmail)(userEmail)) {
            res.status(400).json({ msg: "Dirección de correo electrónico no válido." });
            return;
        }
        ;
        // status por defecto true si no se envía
        if (typeof dataUsers.status !== 'boolean') {
            dataUsers.status = true;
        }
        const updateValidation = yield (0, authModel_1.updateUserByEmailModel)(userEmail, dataUsers);
        if (updateValidation) {
            console.info("Resultado de updateUserByEmailModel");
            console.info(updateValidation);
            res.status(401).json({ msg: updateValidation });
        }
        res.status(200).json({ msg: "Consulta éxitosa", });
    }
    catch (error) {
        console.info("Error al actualizar los datos.");
        res.status(401).json({ msg: "Error al actualizar el usuario." });
    }
});
exports.updateUserByEmailController = updateUserByEmailController;
const emailRegisterController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const numRandon = (0, functions_1.numberRandon)().toString();
    const numParam = yield bcrypt_1.default.hash(numRandon, 10);
    const html = `<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Verifica tu correo - MusikOn</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', sans-serif;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #004aad; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <!-- Logo -->
            <tr>
              <td style="padding: 30px 0; text-align: center; background-color: #ffffff;">
                <img src="https://lh3.googleusercontent.com/a/ACg8ocLSs4B7UmP4bKLb26G-puyYjCURVh0Qnf9yHD_zxbCfRJTd3DFOovBly95OzJTWk34hnBf1RhigsdCnM0Wwg3TKCgsJ3rs=s288-c-no" alt="MusikOn Logo" width="120" style="border-radius: 50%;" />
              </td>
            </tr>

            <!-- Título -->
            <tr>
              <td style="padding: 30px; text-align: center;">
                <h2 style="margin: 0; font-size: 26px; color: #fff;">¡Bienvenido a <span style="color: #f1f1f1;">MusikOn</span>!</h2>
                <p style="font-size: 16px; color: hsl(246, 100%, 92%);">Gracias por registrarte. Solo falta un paso para activar tu cuenta.</p>
              </td>
            </tr>

            <!-- Botón -->
            <tr>
              <td style="text-align: center; padding: 20px;">
                <h1 style="display: inline-block; padding: 15px 30px; background-color: #004aad; color: #fff; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 50px;">
                  ${numRandon}
                </h1>
              </td>
            </tr>

            <!-- Mensaje de soporte -->
            <tr>
              <td style="padding: 20px 40px; text-align: center; font-size: 14px; color: #b6c9ff;">
                Si no creaste esta cuenta, puedes ignorar este mensaje. Si tienes dudas, contáctanos en <a href="mailto:appmusikon@gmail.com" style="color: hsl(214, 100%, 77%);">appmusikon@gmail.com</a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="text-align: center; padding: 30px; background-color: #f0f0f0; font-size: 12px; color: #0041f3;">
                &copy; 2025 MusikOn. Todos los derechos reservados.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
    try {
        const userEmail = req.body.userEmail.toLocaleLowerCase();
        if (!userEmail) {
            res.status(400).json({ msg: "Todos los campos deben de ser llenados." });
            return;
        }
        if (!(0, validatios_1.validarEmail)(userEmail)) {
            res.status(402).json({ msg: "Dirección de correo electrónico no válido." });
            return;
        }
        const querySnapshot = yield firebase_1.db.collection("users").where("userEmail", "==", userEmail).get();
        if (!querySnapshot.empty) {
            res.status(409).json({ msg: "Ya hay un usuario con esta dirección de correo electrónico." });
            return;
        }
        else {
            yield (0, mailer_1.sendEmail)(userEmail, "Verifica tu cuenta en MusikOn", html);
            res.status(200).json({ msg: "Email recibido con exito!", numParam });
        }
    }
    catch (err) {
        res.status(400).json({ msg: "Verifique bien su dirección de correo electrónico.", err });
        return;
    }
});
exports.emailRegisterController = emailRegisterController;
const validNumberGetByEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const numBack = req.body.vaildNumber.toString();
        const numParam = req.params.vaildNumber.toString();
        if (numBack === "" || numParam === "") {
            res.status(402).json({ msg: "Faltan datos requeridos." });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(numParam, numBack);
        if (!isMatch) {
            console.info(`Son Iguales: ${numBack},${numParam}.`);
            res.status(402).json({ msg: "Codigo Incorrecto." });
            return;
        }
        console.info(`Numero del Body: ${numBack}`);
        console.info(`Numero del Parametros: ${numParam}`);
        res.status(200).json({ msg: "Bien hecho!" });
    }
    catch (err) {
        res.status(402).json({ msg: "Fallo el proceso!" });
    }
});
exports.validNumberGetByEmail = validNumberGetByEmail;
const addEventToUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user || !user.userEmail) {
            res.status(401).json({ msg: "Usuario no autenticado." });
            return;
        }
        const eventData = req.body;
        if (!eventData) {
            res.status(400).json({ msg: "No se proporcionó información del evento." });
            return;
        }
        const result = yield (0, authModel_1.addEventToUserModel)(user.userEmail, eventData);
        if (!result) {
            res.status(200).json({ msg: "Evento guardado exitosamente." });
        }
        else {
            res.status(400).json({ msg: result });
        }
    }
    catch (error) {
        res.status(500).json({ msg: "Error al guardar el evento.", error });
    }
});
exports.addEventToUserController = addEventToUserController;
const deleteUserByEmailController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userEmail } = req.body;
        console.log('[DELETE] userEmail recibido:', userEmail); // LOG de depuración
        if (!userEmail) {
            res.status(400).json({ message: 'Falta el email' });
            return;
        }
        const result = yield (0, authModel_1.deleteUserByEmailModel)(userEmail);
        console.log(result);
        console.log('[DELETE] Resultado de deleteUserByEmailModel:', result); // LOG de depuración
        if (result === false) {
            res.json({ message: 'Usuario eliminado correctamente' });
        }
        else if (result === 'Falta el email') {
            res.status(400).json({ message: 'Falta el email' });
        }
        else if (result === 'not_found') {
            res.status(404).json({ message: 'El usuario no existe o ya fue eliminado' });
        }
        else {
            res.status(500).json({ message: result });
        }
    }
    catch (error) {
        console.log("./src/controllers/authController.ts linea 288");
        console.error('[DELETE] Error al eliminar usuario:', error); // LOG de error
        res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
    }
});
exports.deleteUserByEmailController = deleteUserByEmailController;
