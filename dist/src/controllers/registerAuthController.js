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
exports.sendEmailVerificationLink = void 0;
// src/controllers/authController.ts
const firebase_1 = require("../utils/firebase");
const loggerService_1 = require("../services/loggerService");
/**
 * @swagger
 * /auth/sendEmailVerificationLink:
 *   post:
 *     summary: Envía un link de verificación de email a un usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: string
 *     responses:
 *       200:
 *         description: Link generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 link:
 *                   type: string
 */
const sendEmailVerificationLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.body;
    try {
        const user = yield firebase_1.dmAdmin.auth().getUser(uid);
        if (user.emailVerified) {
            res.status(400).json({ message: 'El correo ya está verificado.' });
            return;
        }
        const link = yield firebase_1.dmAdmin
            .auth()
            .generateEmailVerificationLink(user.email);
        // Aquí puedes enviar ese link por correo usando nodemailer o Mailgun, etc.
        loggerService_1.logger.info('Verification link:', { metadata: { id: link } });
        // Devolver el enlace directamente o enviar vía email
        res.status(200).json({ message: 'Link generado', link });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al generar el link', error });
    }
});
exports.sendEmailVerificationLink = sendEmailVerificationLink;
