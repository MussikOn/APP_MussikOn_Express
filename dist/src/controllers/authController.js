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
exports.updateUserByEmailController = void 0;
exports.registerController = registerController;
exports.loginController = loginController;
const bcrypt_1 = __importDefault(require("bcrypt"));
const authModel_1 = require("../models/authModel");
const validatios_1 = require("../utils/validatios");
const jwt_1 = require("../utils/jwt");
function registerController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, lastName, roll, userEmail, userPassword } = req.body;
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
            const saved = yield (0, authModel_1.registerModel)(name, lastName, roll, userEmail, pass);
            if (!saved) {
                const token = (0, jwt_1.createToken)(name, lastName, userEmail, roll);
                res.status(200).json({ msg: "Usuario Registrado con éxito.", token });
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
            res.status(200).json({ msg: "Login Exitoso", token });
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
        const userEmail = req.params.userEmail;
        if (!dataUsers || !userEmail) {
            res.status(401).json({ msg: "No hay Datos para actualizar" });
        }
        if (!(0, validatios_1.validarEmail)(userEmail)) {
            res.status(400).json({ msg: "Dirección de correo electrónico no válido." });
            return;
        }
        ;
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
