import express from "express";
import multer from "multer";
import { getAllImagesController, getImageUrlController, uploadImageController, deleteImageController, updateImageMetadataController } from "../controllers/imagesController";

const imgRouter = express();
const upload = multer();
imgRouter.use(express.json());

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
imgRouter.get("/getAllImg", getAllImagesController);

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
imgRouter.get("/getUrl/:key", getImageUrlController);

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
imgRouter.post("/upload", upload.single("file"), uploadImageController);

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
imgRouter.delete("/delete/:key", deleteImageController);

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
imgRouter.put("/update-metadata/:key", updateImageMetadataController);

export default imgRouter;