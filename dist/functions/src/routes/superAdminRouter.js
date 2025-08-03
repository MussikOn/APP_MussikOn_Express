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
const express_1 = __importDefault(require("express"));
const loggerService_1 = require("../services/loggerService");
const firebase_1 = require("../utils/firebase");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adm = (0, express_1.default)();
adm.use(express_1.default.json());
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Endpoints de administración y superusuario
 */
/**
 * @swagger
 * /superAdmin/deleteAllUsers:
 *   delete:
 *     tags: [Admin]
 *     summary: Elimina todos los usuarios de Firestore (protegido)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todos los usuarios eliminados exitosamente
 *       404:
 *         description: No hay usuarios para eliminar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error al eliminar todos los usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
adm.delete('/deleteAllUsers', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const snapshot = yield firebase_1.db.collection('users').get();
        if (snapshot.empty) {
            res.status(404).json({ message: 'No hay usuarios para eliminar' });
        }
        const deletePromises = [];
        snapshot.forEach(doc => {
            deletePromises.push(firebase_1.db.collection('users').doc(doc.id).delete());
        });
        yield Promise.all(deletePromises);
        res.status(200).json({ message: 'Todos los usuarios fueron eliminados exitosamente' });
    }
    catch (error) {
        loggerService_1.logger.error('Error al eliminar todos los usuarios:', error);
        res.status(500).json({ message: 'Error al eliminar todos los usuarios' });
    }
}));
exports.default = adm;
