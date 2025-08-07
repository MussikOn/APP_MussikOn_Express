import { Router } from 'express';
import { voucherController } from '../controllers/voucherController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Vouchers
 *   description: Endpoints para gestión de vouchers de depósitos con referencias IDrive E2
 */

/**
 * @swagger
 * /vouchers/upload:
 *   post:
 *     tags: [Vouchers]
 *     summary: Subir voucher de depósito con referencia a IDrive E2
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               voucherFile:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de voucher (imagen)
 *               amount:
 *                 type: number
 *                 description: Monto del depósito
 *               accountHolderName:
 *                 type: string
 *                 description: Nombre del titular de la cuenta
 *               bankName:
 *                 type: string
 *                 description: Nombre del banco
 *               accountNumber:
 *                 type: string
 *                 description: Número de cuenta (opcional)
 *               depositDate:
 *                 type: string
 *                 description: Fecha del depósito (YYYY-MM-DD)
 *               depositTime:
 *                 type: string
 *                 description: Hora del depósito (HH:MM)
 *               referenceNumber:
 *                 type: string
 *                 description: Número de referencia del depósito
 *               comments:
 *                 type: string
 *                 description: Comentarios adicionales
 *     responses:
 *       201:
 *         description: Voucher subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     depositId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     status:
 *                       type: string
 *                     uploadedAt:
 *                       type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/upload', authMiddleware, upload.single('voucherFile'), async (req, res) => {
  await voucherController.uploadVoucher(req, res);
});

/**
 * @swagger
 * /vouchers/{depositId}:
 *   get:
 *     tags: [Vouchers]
 *     summary: Obtener voucher con URL firmada temporal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: depositId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del depósito
 *     responses:
 *       200:
 *         description: Voucher obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     voucherFile:
 *                       type: object
 *                       properties:
 *                         idriveKey:
 *                           type: string
 *                         filename:
 *                           type: string
 *                         displayUrl:
 *                           type: string
 *       404:
 *         description: Voucher no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:depositId', authMiddleware, async (req, res) => {
  await voucherController.getVoucher(req, res);
});

/**
 * @swagger
 * /vouchers/batch:
 *   post:
 *     tags: [Vouchers]
 *     summary: Obtener múltiples vouchers con URLs firmadas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               depositIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de IDs de depósitos
 *     responses:
 *       200:
 *         description: Vouchers obtenidos exitosamente
 *       400:
 *         description: Lista de IDs inválida
 *       500:
 *         description: Error interno del servidor
 */
router.post('/batch', authMiddleware, async (req, res) => {
  await voucherController.getVouchers(req, res);
});

/**
 * @swagger
 * /vouchers/{depositId}/integrity:
 *   get:
 *     tags: [Vouchers]
 *     summary: Verificar integridad del voucher en IDrive E2
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: depositId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del depósito
 *     responses:
 *       200:
 *         description: Verificación completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     depositId:
 *                       type: string
 *                     exists:
 *                       type: boolean
 *                     accessible:
 *                       type: boolean
 *                     size:
 *                       type: number
 *                     lastModified:
 *                       type: string
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:depositId/integrity', authMiddleware, async (req, res) => {
  await voucherController.verifyVoucherIntegrity(req, res);
});

/**
 * @swagger
 * /vouchers/{depositId}:
 *   delete:
 *     tags: [Vouchers]
 *     summary: Eliminar voucher de IDrive E2 y Firebase
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: depositId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del depósito
 *     responses:
 *       200:
 *         description: Voucher eliminado exitosamente
 *       404:
 *         description: Voucher no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:depositId', authMiddleware, async (req, res) => {
  await voucherController.deleteVoucher(req, res);
});

/**
 * @swagger
 * /vouchers/statistics:
 *   get:
 *     tags: [Vouchers]
 *     summary: Obtener estadísticas de vouchers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalVouchers:
 *                       type: number
 *                     totalSize:
 *                       type: number
 *                     vouchersByStatus:
 *                       type: object
 *                     vouchersByMonth:
 *                       type: object
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/statistics', authMiddleware, requireRole(['admin', 'superadmin']), async (req, res) => {
  await voucherController.getVoucherStatistics(req, res);
});

export default router; 