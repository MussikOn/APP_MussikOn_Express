// src/controllers/authController.ts
import { db , dmAdmin } from "../utils/firebase";
import nodemailer from "nodemailer";
import {Request,Response} from "express";

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
export const sendEmailVerificationLink = async (req:Request, res:Response) => {
  const { uid } = req.body;

  try {
    const user = await dmAdmin.auth().getUser(uid);

    if (user.emailVerified) {
        res.status(400).json({ message: "El correo ya está verificado." });
        return;
    }

    const link = await dmAdmin.auth().generateEmailVerificationLink(user.email!);

    // Aquí puedes enviar ese link por correo usando nodemailer o Mailgun, etc.
    console.log("Verification link:", link);

    // Devolver el enlace directamente o enviar vía email
    res.status(200).json({ message: "Link generado", link });
  } catch (error) {
    res.status(500).json({ message: "Error al generar el link", error });
  }
};
