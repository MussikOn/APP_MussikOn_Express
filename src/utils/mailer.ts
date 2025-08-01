import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
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

    console.log('[src/utils/mailer.ts:21] Correo enviado a:', to);
  } catch (error) {
    console.error('[src/utils/mailer.ts:23] Error al enviar el correo:', error);
    throw error;
  }
};
