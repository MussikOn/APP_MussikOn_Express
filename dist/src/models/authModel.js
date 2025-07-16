"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.addEventToUserModel = exports.updateUserByEmailModel = exports.getUserByEmailModel = exports.registerModel = void 0;
const firebase_1 = require("../utils/firebase");
const admin = __importStar(require("firebase-admin"));
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
const addEventToUserModel = (userEmail, eventData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!userEmail || !eventData) {
            return "Faltan datos para guardar el evento.";
        }
        const userRef = firebase_1.db.collection("users").doc(userEmail.toLowerCase());
        // Agrega el evento al array 'createdEvents' del usuario
        yield userRef.update({
            createdEvents: admin.firestore.FieldValue.arrayUnion(eventData),
            update_at: new Date().toString(),
        });
        return false;
    }
    catch (error) {
        console.info("Error al guardar el evento en el usuario.");
        return "Error al guardar el evento.";
    }
});
exports.addEventToUserModel = addEventToUserModel;
