import { Request, Response } from 'express';
import { logger } from '../services/loggerService';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client, generatePresignedUrl } from '../utils/idriveE2';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
dotenv.config();

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    console.info(req.file);

    const fileKey = Date.now() + '_' + req.file.originalname;

    const command = new PutObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    console.info('Direccion');
    const s3Client = await getS3Client();
    const direccion = await s3Client.send(command);
    console.info(direccion);

    // Generar URL firmada en lugar de URL directa
    const presignedUrl = await generatePresignedUrl(fileKey, 3600); // 1 hora

    res.status(200).json({
      message: 'File uploaded successfully',
      url: presignedUrl,
      key: fileKey,
    });
  } catch (error) {
    logger.error('Upload error:', error as Error);
    res.status(500).json({ error: 'Upload failed' });
  }
};

export const getFileUrl = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      res.status(400).json({ error: 'Missing file key' });
      return;
    }

    // Generar URL firmada en lugar de URL directa
    const presignedUrl = await generatePresignedUrl(key, 3600); // 1 hora

    res.status(200).json({ url: presignedUrl });
  } catch (error) {
    logger.error('URL error:', error as Error);
    res.status(500).json({ error: 'Failed to generate file URL' });
  }
};

/**
 * @swagger
 * /media/saveImage:
 *   post:
 *     summary: Sube una imagen de perfil de músico
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 url:
 *                   type: string
 *                 key:
 *                   type: string
 *
 * /media/getImage/{key}:
 *   get:
 *     summary: Obtiene la URL firmada de una imagen subida
 *     parameters:
 *       - in: path
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: Clave de la imagen
 *     responses:
 *       200:
 *         description: URL firmada obtenida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 */
