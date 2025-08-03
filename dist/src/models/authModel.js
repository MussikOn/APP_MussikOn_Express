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
exports.deleteUserByEmailModel = exports.addEventToUserModel = exports.updateUserByEmailModel = exports.getUserByEmailModel = exports.registerModel = void 0;
const firebase_1 = require("../utils/firebase");
const admin = __importStar(require("firebase-admin"));
const loggerService_1 = require("../services/loggerService");
const registerModel = (name_1, lastName_1, roll_1, userEmail_1, userPassword_1, ...args_1) => __awaiter(void 0, [name_1, lastName_1, roll_1, userEmail_1, userPassword_1, ...args_1], void 0, function* (name, lastName, roll, userEmail, userPassword, status = true) {
    try {
        if (!name || !lastName || !roll || !userEmail || !userPassword) {
            console.info('Hay campos que no han sido llenados, \n verificar codigo en C:/programacion/Express/MusikOn/src/models/authModel.ts linea 4.');
            return 'Hay campos que no han sido llenados';
        }
        const newUser = {
            name,
            lastName,
            roll,
            userEmail: userEmail.toLocaleLowerCase(),
            userPassword,
            create_at: Date().toString(),
            update_at: '',
            delete_at: '',
            status,
        };
        const querySnapshot = yield firebase_1.db
            .collection('users')
            .where('userEmail', '==', userEmail)
            .get();
        if (!querySnapshot.empty) {
            return 'El usuario ya Existe.';
        }
        yield firebase_1.db.collection('users').doc(userEmail).set(newUser);
        return false;
    }
    catch (error) {
        console.info('[src/models/authModel.ts:25] Error al Guardar los datos, \n verificar codigo en C:/programacion/Express/MusikOn/src/models/authModel.ts linea 4.');
        return 'Error al Guardar los datos.';
    }
});
exports.registerModel = registerModel;
const getUserByEmailModel = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!userEmail) {
            return null;
        }
        const querySnapshot = yield firebase_1.db
            .collection('users')
            .where('userEmail', '==', userEmail.toLocaleLowerCase())
            .get();
        const data = querySnapshot.docs[0].data();
        return data;
    }
    catch (error) {
        loggerService_1.logger.info('Error en getUserByEmailModel:', { context: 'AuthModel', metadata: { error: String(error) } });
        console.log('[src/models/authModel.ts:41] Ubicación: ./src/models/authModel.ts linea 41');
        console.info('[src/models/authModel.ts:42] Error en la peticion getUserByEmail.\n\n');
        return null;
    }
});
exports.getUserByEmailModel = getUserByEmailModel;
const updateUserByEmailModel = (userEmail, updatedData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!userEmail || !updatedData) {
            console.info('[src/models/authModel.ts:50] Faltan datos para actualizar.');
            return 'Faltan datos para actualizar.';
        }
        yield firebase_1.db
            .collection('users')
            .doc(userEmail.toLowerCase())
            .update(Object.assign(Object.assign({}, updatedData), { update_at: new Date().toString() }));
        return false;
    }
    catch (error) {
        loggerService_1.logger.info('Error en updateUserByEmailModel:', { context: 'AuthModel', metadata: { error: String(error) } });
        console.log('[src/models/authModel.ts:62] Ubicación: ./src/models/authModel.ts linea 62');
        console.info('[src/models/authModel.ts:63] Error al actualizar los datos.');
        return 'Error al actualizar los datos.';
    }
});
exports.updateUserByEmailModel = updateUserByEmailModel;
const addEventToUserModel = (userEmail, eventData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!userEmail || !eventData) {
            return 'Faltan datos para guardar el evento.';
        }
        const userRef = firebase_1.db.collection('users').doc(userEmail.toLowerCase());
        // Agrega el evento al array 'createdEvents' del usuario
        yield userRef.update({
            createdEvents: admin.firestore.FieldValue.arrayUnion(eventData),
            update_at: new Date().toString(),
        });
        return false;
    }
    catch (error) {
        loggerService_1.logger.info('Error en addEventToUserModel:', { context: 'AuthModel', metadata: { error: String(error) } });
        console.log('[src/models/authModel.ts:82] Ubicación: ./src/models/authModel.ts linea 82');
        console.info('[src/models/authModel.ts:83] Error al guardar el evento en el usuario.');
        return 'Error al guardar el evento.';
    }
});
exports.addEventToUserModel = addEventToUserModel;
const deleteUserByEmailModel = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!userEmail)
            return 'Falta el email';
        const doc = yield firebase_1.db.collection('users').doc(userEmail.toLowerCase()).get();
        if (!doc.exists)
            return 'not_found';
        yield firebase_1.db.collection('users').doc(userEmail.toLowerCase()).delete();
        return false;
    }
    catch (error) {
        loggerService_1.logger.info('Error en deleteUserByEmailModel:', { context: 'AuthModel', metadata: { error: String(error) } });
        console.log('[src/models/authModel.ts:97] Ubicación: ./src/models/authModel.ts linea 97');
        console.info('[src/models/authModel.ts:98] Error al eliminar el usuario:', error);
        return 'Error al eliminar el usuario';
    }
});
exports.deleteUserByEmailModel = deleteUserByEmailModel;
