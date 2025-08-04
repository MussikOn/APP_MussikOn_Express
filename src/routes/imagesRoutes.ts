import { Router } from 'express';
import { imagesController } from '../controllers/imagesController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';
import { upload } from '../middleware/uploadMiddleware';
import { validateImageFile } from '../middleware/uploadMiddleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ImageUploadResult:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *         filename:
 *           type: string
 *         size:
 *           type: number
 *         mimeType:
 *           type: string
 *         uploadedAt:
 *           type: string
 *         metadata:
 *           type: object
 *     
 *     ImageValidationResult:
 *       type: object
 *       properties:
 *         isValid:
 *           type: boolean
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *         warnings:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /images/upload:
 *   post:
 *     summary: Subir imagen
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
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
 *                 description: Archivo de imagen
 *               folder:
 *                 type: string
 *                 default: uploads
 *                 description: Carpeta donde guardar
 *               description:
 *                 type: string
 *                 description: Descripción de la imagen
 *               tags:
 *                 type: string
 *                 description: Etiquetas separadas por comas
 *     responses:
 *       201:
 *         description: Imagen subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ImageUploadResult'
 *                 message:
 *                   type: string
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/upload', authMiddleware, upload.single('file'), validateImageFile, async (req, res) => {
  await imagesController.uploadImage(req, res);
});

/**
 * @swagger
 * /images/{imageId}:
 *   get:
 *     summary: Obtener imagen por ID
 *     tags: [Imágenes]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la imagen
 *     responses:
 *       200:
 *         description: Imagen obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ImageUploadResult'
 *       404:
 *         description: Imagen no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:imageId', async (req, res) => {
  await imagesController.getImage(req, res);
});

/**
 * @swagger
 * /images/url:
 *   get:
 *     summary: Obtener imagen por URL
 *     tags: [Imágenes]
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: URL de la imagen
 *     responses:
 *       200:
 *         description: Imagen obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ImageUploadResult'
 *       404:
 *         description: Imagen no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/url', async (req, res) => {
  await imagesController.getImageByUrl(req, res);
});

/**
 * @swagger
 * /images/{imageId}:
 *   delete:
 *     summary: Eliminar imagen
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la imagen
 *     responses:
 *       200:
 *         description: Imagen eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Imagen no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:imageId', authMiddleware, async (req, res) => {
  await imagesController.deleteImage(req, res);
});

/**
 * @swagger
 * /images/statistics:
 *   get:
 *     summary: Obtener estadísticas de imágenes
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID del usuario (solo admin)
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
router.get('/statistics', authMiddleware, async (req, res) => {
  await imagesController.getImageStatistics(req, res);
});

/**
 * @swagger
 * /images/{imageId}/integrity:
 *   get:
 *     summary: Verificar integridad de imagen
 *     tags: [Imágenes]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la imagen
 *     responses:
 *       200:
 *         description: Integridad verificada exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/:imageId/integrity', async (req, res) => {
  await imagesController.verifyImageIntegrity(req, res);
});

/**
 * @swagger
 * /images/cleanup:
 *   post:
 *     summary: Limpiar imágenes no utilizadas (solo admin)
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daysOld:
 *                 type: number
 *                 default: 30
 *                 description: Días de antigüedad para eliminar
 *     responses:
 *       200:
 *         description: Limpieza completada exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/cleanup', authMiddleware, requireRole(['admin', 'superadmin']), async (req, res) => {
  await imagesController.cleanupUnusedImages(req, res);
});

/**
 * @swagger
 * /images/validate:
 *   post:
 *     summary: Validar archivo antes de subir
 *     tags: [Imágenes]
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
 *                 description: Archivo a validar
 *     responses:
 *       200:
 *         description: Validación completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ImageValidationResult'
 *                 message:
 *                   type: string
 *       400:
 *         description: No se proporcionó archivo
 *       500:
 *         description: Error del servidor
 */
router.post('/validate', upload.single('file'), async (req, res) => {
  await imagesController.validateImageFile(req, res);
});

/**
 * @swagger
 * /images/{imageId}/serve:
 *   get:
 *     summary: Servir imagen directamente
 *     tags: [Imágenes]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la imagen
 *     responses:
 *       200:
 *         description: Imagen servida exitosamente
 *       404:
 *         description: Imagen no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:imageId/serve', async (req, res) => {
  await imagesController.serveImage(req, res);
});

/**
 * @swagger
 * /images/serve-url:
 *   get:
 *     summary: Servir imagen directamente desde URL
 *     tags: [Imágenes]
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: URL de la imagen
 *     responses:
 *       200:
 *         description: Imagen servida exitosamente
 *       400:
 *         description: URL requerida
 *       500:
 *         description: Error del servidor
 */
router.get('/serve-url', async (req, res) => {
  await imagesController.serveImageByUrl(req, res);
});

// Rutas de compatibilidad con el sistema anterior
/**
 * @swagger
 * /images/saveImage:
 *   post:
 *     summary: Subir imagen (compatibilidad)
 *     tags: [Imágenes - Compatibilidad]
 *     security:
 *       - bearerAuth: []
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
 *       201:
 *         description: Imagen subida exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/saveImage', authMiddleware, upload.single('file'), validateImageFile, async (req, res) => {
  await imagesController.uploadImage(req, res);
});

/**
 * @swagger
 * /images/getImage/{key}:
 *   get:
 *     summary: Obtener imagen por clave (compatibilidad)
 *     tags: [Imágenes - Compatibilidad]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Clave de la imagen
 *     responses:
 *       200:
 *         description: URL de la imagen obtenida
 *       400:
 *         description: Clave requerida
 *       404:
 *         description: Imagen no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/getImage/:key', async (req, res) => {
  // Convertir clave a imageId para compatibilidad
  (req.params as any).imageId = req.params.key;
  await imagesController.getImage(req, res);
});

export default router;
