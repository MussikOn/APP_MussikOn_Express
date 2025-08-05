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
exports.getFileUrl = exports.uploadFile = void 0;
const loggerService_1 = require("../services/loggerService");
const client_s3_1 = require("@aws-sdk/client-s3");
const idriveE2_1 = require("../utils/idriveE2");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        console.info(req.file);
        const fileKey = Date.now() + '_' + req.file.originalname;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
            Key: fileKey,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        });
        console.info('Direccion');
        const s3Client = yield (0, idriveE2_1.getS3Client)();
        const direccion = yield s3Client.send(command);
        console.info(direccion);
        // Generar URL firmada en lugar de URL directa
        const presignedUrl = yield (0, idriveE2_1.generatePresignedUrl)(fileKey, 3600); // 1 hora
        res.status(200).json({
            message: 'File uploaded successfully',
            url: presignedUrl,
            key: fileKey,
        });
    }
    catch (error) {
        loggerService_1.logger.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});
exports.uploadFile = uploadFile;
const getFileUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.params;
        if (!key) {
            res.status(400).json({ error: 'Missing file key' });
            return;
        }
        // Generar URL firmada en lugar de URL directa
        const presignedUrl = yield (0, idriveE2_1.generatePresignedUrl)(key, 3600); // 1 hora
        res.status(200).json({ url: presignedUrl });
    }
    catch (error) {
        loggerService_1.logger.error('URL error:', error);
        res.status(500).json({ error: 'Failed to generate file URL' });
    }
});
exports.getFileUrl = getFileUrl;
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
