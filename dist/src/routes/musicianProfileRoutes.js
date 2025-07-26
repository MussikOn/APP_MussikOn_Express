"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const musicianProfileController_1 = require("../controllers/musicianProfileController");
const musician = (0, express_1.Router)();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
musician.use(upload.single("file"));
/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Endpoints para gestión de imágenes de perfil de músico
 */
/**
 * @swagger
 * /media/saveImage:
 *   post:
 *     tags: [Media]
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
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Error al subir la imagen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
musician.post("/saveImage", musicianProfileController_1.uploadFile);
/**
 * @swagger
 * /media/getImage/{key}:
 *   get:
 *     tags: [Media]
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
 *       400:
 *         description: Missing file key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Error al generar la URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
musician.get("/getImage/:key", musicianProfileController_1.getFileUrl);
exports.default = musician;
