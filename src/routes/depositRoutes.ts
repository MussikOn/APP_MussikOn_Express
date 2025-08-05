import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { documentUpload } from '../middleware/uploadMiddleware';
import {
  reportDepositController,
  getMyDepositsController,
  getPendingDepositsController,
  approveDepositController,
  rejectDepositController,
  getDepositStatsController,
  getBankAccountsController,
  getDepositByIdController
} from '../controllers/depositController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     BankDeposit:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del depósito
 *         userEmail:
 *           type: string
 *           description: Email del usuario que reportó el depósito
 *         amount:
 *           type: number
 *           description: Monto del depósito
 *         currency:
 *           type: string
 *           description: Moneda del depósito
 *         depositDate:
 *           type: string
 *           format: date-time
 *           description: Fecha del depósito
 *         bankName:
 *           type: string
 *           description: Nombre del banco
 *         accountNumber:
 *           type: string
 *           description: Número de cuenta
 *         reference:
 *           type: string
 *           description: Referencia del depósito
 *         purpose:
 *           type: string
 *           description: Propósito del depósito
 *         voucherUrl:
 *           type: string
 *           description: URL del voucher subido
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Estado del depósito
 *         rejectionReason:
 *           type: string
 *           description: Razón del rechazo (si aplica)
 *         reviewedBy:
 *           type: string
 *           description: Email del administrador que revisó
 *         reviewedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de revisión
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     BankAccount:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         accountName:
 *           type: string
 *         accountNumber:
 *           type: string
 *         bankName:
 *           type: string
 *         accountType:
 *           type: string
 *           enum: [savings, checking]
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /deposits/report:
 *   post:
 *     tags: [Deposits]
 *     summary: Reportar un nuevo depósito bancario
 *     description: Permite a los usuarios reportar un depósito bancario con voucher
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - depositDate
 *               - bankName
 *               - accountNumber
 *               - reference
 *               - purpose
 *               - voucher
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Monto del depósito
 *               currency:
 *                 type: string
 *                 default: EUR
 *                 description: Moneda del depósito
 *               depositDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha del depósito
 *               bankName:
 *                 type: string
 *                 description: Nombre del banco
 *               accountNumber:
 *                 type: string
 *                 description: Número de cuenta
 *               reference:
 *                 type: string
 *                 description: Referencia del depósito
 *               purpose:
 *                 type: string
 *                 description: Propósito del depósito
 *               voucher:
 *                 type: string
 *                 format: binary
 *                 description: Foto del voucher del depósito
 *     responses:
 *       201:
 *         description: Depósito reportado exitosamente
 *       400:
 *         description: Datos inválidos o voucher faltante
 *       401:
 *         description: No autorizado
 */
router.post('/report', authMiddleware, documentUpload.single('voucher'), reportDepositController);

/**
 * @swagger
 * /deposits/my-deposits:
 *   get:
 *     tags: [Deposits]
 *     summary: Obtener depósitos del usuario
 *     description: Obtiene todos los depósitos reportados por el usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Depósitos obtenidos exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/my-deposits', authMiddleware, getMyDepositsController);

/**
 * @swagger
 * /deposits/pending:
 *   get:
 *     tags: [Deposits]
 *     summary: Obtener depósitos pendientes (ADMIN ONLY)
 *     description: Obtiene todos los depósitos pendientes de revisión
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Depósitos pendientes obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/pending', authMiddleware, getPendingDepositsController);

/**
 * @swagger
 * /deposits/{depositId}/approve:
 *   post:
 *     tags: [Deposits]
 *     summary: Aprobar un depósito (ADMIN ONLY)
 *     description: Aprueba un depósito pendiente y actualiza el balance del usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: depositId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del depósito a aprobar
 *     responses:
 *       200:
 *         description: Depósito aprobado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Depósito no encontrado
 */
router.post('/:depositId/approve', authMiddleware, approveDepositController);

/**
 * @swagger
 * /deposits/{depositId}/reject:
 *   post:
 *     tags: [Deposits]
 *     summary: Rechazar un depósito (ADMIN ONLY)
 *     description: Rechaza un depósito pendiente con razón
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: depositId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del depósito a rechazar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Razón del rechazo
 *     responses:
 *       200:
 *         description: Depósito rechazado exitosamente
 *       400:
 *         description: Razón requerida
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Depósito no encontrado
 */
router.post('/:depositId/reject', authMiddleware, rejectDepositController);

/**
 * @swagger
 * /deposits/stats:
 *   get:
 *     tags: [Deposits]
 *     summary: Obtener estadísticas de depósitos (ADMIN ONLY)
 *     description: Obtiene estadísticas generales de depósitos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Período de análisis
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/stats', authMiddleware, getDepositStatsController);

/**
 * @swagger
 * /deposits/bank-accounts:
 *   get:
 *     tags: [Deposits]
 *     summary: Obtener cuentas bancarias de Mussikon
 *     description: Obtiene las cuentas bancarias activas de Mussikon
 *     responses:
 *       200:
 *         description: Cuentas bancarias obtenidas exitosamente
 */
router.get('/bank-accounts', getBankAccountsController);

/**
 * @swagger
 * /deposits/{depositId}:
 *   get:
 *     tags: [Deposits]
 *     summary: Obtener detalles de un depósito
 *     description: Obtiene los detalles completos de un depósito específico
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
 *         description: Depósito obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Depósito no encontrado
 */
router.get('/:depositId', authMiddleware, getDepositByIdController);

export default router; 