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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserByEmailModel = exports.getUserByEmailModel = exports.registerModel = void 0;
const firebase_1 = require("../utils/firebase");
const registerModel = (name, lastName, roll, userEmail, userPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!name || !lastName || !roll || !userEmail || !userPassword) {
            console.info("Hay campos que no han sido llenados, \n verificar codigo en C:/programacion/Express/MusikOn/src/models/authModel.ts linea 4.");
            return "Hay campos que no han sido llenados";
        }
        const newUser = {
            name,
            lastName,
            roll,
            userEmail: userEmail.toLocaleLowerCase(),
            userPassword,
            create_at: Date().toString(),
            update_at: "",
            delete_at: "",
            status: false
        };
        const querySnapshot = yield firebase_1.db.collection("users").where("userEmail", "==", userEmail).get();
        if (!querySnapshot.empty) {
            return "El usuario ya Existe.";
        }
        yield firebase_1.db.collection('users').doc(userEmail).set(newUser);
        return false;
    }
    catch (error) {
        console.info("Error al Guardar los datos, \n verificar codigo en C:/programacion/Express/MusikOn/src/models/authModel.ts linea 4.");
        return "Error al Guardar los datos.";
    }
});
exports.registerModel = registerModel;
const getUserByEmailModel = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!userEmail) {
            ;
            return null;
        }
        const querySnapshot = yield firebase_1.db.collection("users").where("userEmail", "==", userEmail.toLocaleLowerCase()).get();
        const data = querySnapshot.docs[0].data();
        return data;
    }
    catch (error) {
        console.info(`Error en la peticion getUserByEmail.\n\n`);
        return null;
    }
});
exports.getUserByEmailModel = getUserByEmailModel;
const updateUserByEmailModel = (userEmail, updatedData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!userEmail || !updatedData) {
            console.info("Faltan datos para actualizar.");
            return "Faltan datos para actualizar.";
        }
        yield firebase_1.db.collection("users").doc(userEmail.toLowerCase()).update(Object.assign(Object.assign({}, updatedData), { update_at: new Date().toString() }));
        return false;
    }
    catch (error) {
        console.info("Error al actualizar los datos.");
        return "Error al actualizar los datos.";
    }
});
exports.updateUserByEmailModel = updateUserByEmailModel;
