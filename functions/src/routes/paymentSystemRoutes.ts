import { Router } from 'express';
import { PaymentSystemController, getVoucherPresignedUrl } from '../controllers/paymentSystemController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();
const paymentSystemController = new PaymentSystemController();

// Swagger components schema definitions for payment types
/**
 * @swagger
 * components:
 *   schemas:
 *     BankAccount:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         accountHolder:
 *           type: string
 *         accountNumber:
 *           type: string
 *         bankName:
 *           type: string
 *         accountType:
 *           type: string
 *           enum: [savings, checking]
 *         isVerified:
 *           type: boolean
 *         isDefault:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     UserBalance:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         balance:
 *           type: number
 *         currency:
 *           type: string
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *         totalDeposits:
 *           type: number
 *         totalWithdrawals:
 *           type: number
 *         totalEarnings:
 *           type: number
 *     
 *     UserDeposit:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *         voucherFile:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             filename:
 *               type: string
 *             uploadedAt:
 *               type: string
 *               format: date-time
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     EventPayment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         eventId:
 *           type: string
 *         organizerId:
 *           type: string
 *         musicianId:
 *           type: string
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *         commission:
 *           type: number
 *         musicianAmount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *         paymentMethod:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     MusicianEarnings:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         musicianId:
 *           type: string
 *         eventId:
 *           type: string
 *         eventPaymentId:
 *           type: string
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, available, withdrawn]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     WithdrawalRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         musicianId:
 *           type: string
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *         bankAccountId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     PaymentStatistics:
 *       type: object
 *       properties:
 *         totalDeposits:
 *           type: number
 *         totalPayments:
 *           type: number
 *         totalCommissions:
 *           type: number
 *         totalWithdrawals:
 *           type: number
 *         pendingDepositsCount:
 *           type: number
 *         pendingWithdrawalsCount:
 *           type: number
 *         totalUsers:
 *           type: number
 *         totalMusicians:
 *           type: number
 *         totalEvents:
 *           type: number
 *         lastUpdated:
 *           type: string
 *           format: date-time
 */

// ===== RUTAS PARA USUARIOS =====

/**
 * @swagger
 * /payments/my-balance:
 *   get:
 *     summary: Obtener balance del usuario
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserBalance'
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/my-balance', authMiddleware, async (req, res) => {
  await paymentSystemController.getUserBalance(req, res);
});

/**
 * @swagger
 * /payments/bank-accounts/register:
 *   post:
 *     summary: Registrar cuenta bancaria
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountHolder
 *               - accountNumber
 *               - bankName
 *               - accountType
 *             properties:
 *               accountHolder:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountType:
 *                 type: string
 *                 enum: [savings, checking]
 *               routingNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cuenta bancaria registrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BankAccount'
 *       400:
 *         description: Datos de cuenta bancaria incompletos
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/bank-accounts/register', authMiddleware, async (req, res) => {
  await paymentSystemController.registerBankAccount(req, res);
});

/**
 * @swagger
 * /payments/bank-accounts/my-accounts:
 *   get:
 *     summary: Obtener cuentas bancarias del usuario
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cuentas bancarias obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BankAccount'
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/bank-accounts/my-accounts', authMiddleware, async (req, res) => {
  await paymentSystemController.getUserBankAccounts(req, res);
});

/**
 * @swagger
 * /payments/deposit:
 *   post:
 *     summary: Subir comprobante de depósito
 *     tags: [Payments]
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
 *               - voucherFile
 *             properties:
 *               amount:
 *                 type: number
 *               voucherFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Comprobante subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserDeposit'
 *       400:
 *         description: Datos de depósito incompletos
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/deposit', authMiddleware, upload.single('voucherFile'), async (req, res) => {
  await paymentSystemController.uploadDepositVoucher(req, res);
});

/**
 * @swagger
 * /payments/my-deposits:
 *   get:
 *     summary: Obtener depósitos del usuario
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Depósitos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserDeposit'
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/my-deposits', authMiddleware, async (req, res) => {
  await paymentSystemController.getUserDeposits(req, res);
});

/**
 * @swagger
 * /payments/events/{eventId}/pay-musician:
 *   post:
 *     summary: Pagar músico por evento
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - musicianId
 *               - amount
 *             properties:
 *               musicianId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Pago procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EventPayment'
 *       400:
 *         description: Datos de pago incompletos
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/events/:eventId/pay-musician', authMiddleware, async (req, res) => {
  await paymentSystemController.payMusicianForEvent(req, res);
});

/**
 * @swagger
 * /payments/musicians/earnings:
 *   get:
 *     summary: Obtener ganancias del músico
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ganancias obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MusicianEarnings'
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/musicians/earnings', authMiddleware, async (req, res) => {
  await paymentSystemController.getMusicianEarnings(req, res);
});

/**
 * @swagger
 * /payments/musicians/withdraw-earnings:
 *   post:
 *     summary: Solicitar retiro de ganancias
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - bankAccountId
 *             properties:
 *               amount:
 *                 type: number
 *               bankAccountId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Solicitud de retiro creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/WithdrawalRequest'
 *       400:
 *         description: Datos de retiro incompletos
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/musicians/withdraw-earnings', authMiddleware, async (req, res) => {
  await paymentSystemController.requestWithdrawal(req, res);
});

// ===== RUTAS DE ADMINISTRACIÓN =====

/**
 * @swagger
 * /payments/admin/payments/pending-deposits:
 *   get:
 *     summary: Obtener depósitos pendientes (admin)
 *     tags: [Payments Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Depósitos pendientes obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserDeposit'
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/payments/pending-deposits', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), async (req, res) => {
  await paymentSystemController.getPendingDeposits(req, res);
});

/**
 * @swagger
 * /payments/admin/payments/verify-deposit/{depositId}:
 *   put:
 *     summary: Verificar depósito (admin)
 *     tags: [Payments Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: depositId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del depósito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Depósito verificado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Estado de aprobación inválido
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/payments/verify-deposit/:depositId', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), async (req, res) => {
  await paymentSystemController.verifyDeposit(req, res);
});

/**
 * @swagger
 * /payments/admin/payments/pending-withdrawals:
 *   get:
 *     summary: Obtener retiros pendientes (admin)
 *     tags: [Payments Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retiros pendientes obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WithdrawalRequest'
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/payments/pending-withdrawals', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), async (req, res) => {
  await paymentSystemController.getPendingWithdrawals(req, res);
});

/**
 * @swagger
 * /payments/admin/payments/process-withdrawal/{withdrawalId}:
 *   put:
 *     summary: Procesar retiro (admin)
 *     tags: [Payments Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: withdrawalId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del retiro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Retiro procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Estado de aprobación inválido
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/payments/process-withdrawal/:withdrawalId', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), async (req, res) => {
  await paymentSystemController.processWithdrawal(req, res);
});

/**
 * @swagger
 * /payments/admin/payments/statistics:
 *   get:
 *     summary: Obtener estadísticas de pagos (admin)
 *     tags: [Payments Admin]
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
 *                   $ref: '#/components/schemas/PaymentStatistics'
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/payments/statistics', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), async (req, res) => {
  await paymentSystemController.getPaymentStatistics(req, res);
});

/**
 * @swagger
 * /admin/payments/deposit-stats:
 *   get:
 *     summary: Obtener estadísticas de depósitos (admin) - Ruta de compatibilidad
 *     tags: [Administración - Pagos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/admin/payments/deposit-stats', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), async (req, res) => {
  console.log('[paymentSystemRoutes.ts:730] Ruta /admin/payments/deposit-stats accedida');
  await paymentSystemController.getPaymentStatistics(req, res);
});

/**
 * @swagger
 * /admin/payments/deposit-info/{depositId}:
 *   get:
 *     summary: Obtener información detallada de un depósito (admin)
 *     tags: [Administración - Pagos]
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
 *         description: Información del depósito obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Depósito no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/admin/payments/deposit-info/:depositId', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), async (req, res) => {
  console.log('[paymentSystemRoutes.ts:750] Ruta /admin/payments/deposit-info accedida');
  await paymentSystemController.getDepositDetails(req, res);
});

/**
 * @swagger
 * /admin/payments/check-duplicate/{depositId}:
 *   get:
 *     summary: Verificar si un voucher es duplicado (admin)
 *     tags: [Administración - Pagos]
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
 *         description: Verificación completada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Depósito no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/admin/payments/check-duplicate/:depositId', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), async (req, res) => {
  console.log('[paymentSystemRoutes.ts:770] Ruta /admin/payments/check-duplicate accedida');
  await paymentSystemController.checkVoucherDuplicates(req, res);
});

/**
 * @swagger
 * /api/payments/voucher/{depositId}/presigned-url:
 *   get:
 *     summary: Obtener URL firmada para acceder a un comprobante de pago
 *     description: Genera una URL firmada temporal para acceder a un comprobante sin problemas de CORS
 *     tags: [Sistema de Pagos]
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
 *         description: URL firmada generada exitosamente
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
 *                     presignedUrl:
 *                       type: string
 *                       description: URL firmada temporal
 *                     expiresIn:
 *                       type: number
 *                       description: Tiempo de expiración en segundos
 *                     depositId:
 *                       type: string
 *                     voucherKey:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: ID de depósito requerido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para acceder a este depósito
 *       404:
 *         description: Depósito o comprobante no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/voucher/:depositId/presigned-url', authMiddleware, getVoucherPresignedUrl);

export default router; 