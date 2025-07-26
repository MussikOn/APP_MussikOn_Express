"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const imagesController_1 = require("../controllers/imagesController");
const imgRouter = (0, express_1.default)();
const upload = (0, multer_1.default)();
imgRouter.use(express_1.default.json());
/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Endpoints para galería de imágenes
 */
/**
 * @swagger
 * /imgs/getAllImg:
 *   get:
 *     tags: [Images]
 *     summary: Obtiene la galería de imágenes
 *     responses:
 *       200:
 *         description: Galería de imágenes obtenida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *       405:
 *         description: Error al extraer las imágenes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 */
imgRouter.get("/getAllImg", imagesController_1.getAllImagesController);
/**
 * @swagger
 * /imgs/getUrl/{key}:
 *   get:
 *     tags: [Images]
 *     summary: Obtiene la URL firmada de una imagen
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
 */
imgRouter.get("/getUrl/:key", imagesController_1.getImageUrlController);
/**
 * @swagger
 * /imgs/upload:
 *   post:
 *     tags: [Images]
 *     summary: Sube una imagen
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
 *                 key:
 *                   type: string
 *                 url:
 *                   type: string
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Error al subir la imagen
 */
imgRouter.post("/upload", upload.single("file"), imagesController_1.uploadImageController);
/**
 * @swagger
 * /imgs/delete/{key}:
 *   delete:
 *     tags: [Images]
 *     summary: Elimina una imagen
 *     parameters:
 *       - in: path
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: Clave de la imagen
 *     responses:
 *       200:
 *         description: Imagen eliminada exitosamente
 *       400:
 *         description: Missing file key
 *       500:
 *         description: Error al eliminar la imagen
 */
imgRouter.delete("/delete/:key", imagesController_1.deleteImageController);
/**
 * @swagger
 * /imgs/update-metadata/{key}:
 *   put:
 *     tags: [Images]
 *     summary: Actualiza los metadatos de una imagen
 *     parameters:
 *       - in: path
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: Clave de la imagen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Metadatos actualizados exitosamente
 *       400:
 *         description: Missing file key or metadata
 *       500:
 *         description: Error al actualizar metadatos
 */
imgRouter.put("/update-metadata/:key", imagesController_1.updateImageMetadataController);
/**
 * @swagger
 * /media/saveImage:
 *   post:
 *     tags: [Images]
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
/**
 * @swagger
 * /media/getImage/{key}:
 *   get:
 *     tags: [Images]
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
exports.default = imgRouter;
