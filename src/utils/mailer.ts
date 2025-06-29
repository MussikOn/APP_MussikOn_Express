import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: `"MusikOn" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Correo enviado a:", to);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw error;
  }
};
