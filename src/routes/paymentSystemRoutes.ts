import { Router } from 'express';
import { PaymentSystemController } from '../controllers/paymentSystemController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';
import { upload } from '../middleware/uploadMiddleware';
import { logger } from '../services/loggerService';
import { db } from '../utils/firebase';

const router = Router();
const paymentSystemController = new PaymentSystemController();

// Rutas adicionales para compatibilidad con el frontend
// Estas rutas redirigen a las rutas principales del payment system

/**
 * @swagger
 * /admin/payments/statistics:
 *   get:
 *     summary: Obtener estadísticas de pagos (admin) - Ruta de compatibilidad
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
router.get('/payments/statistics', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), async (req, res) => {
  await paymentSystemController.getPaymentStatistics(req, res);
});

/**
 * @swagger
 * /admin/payments/pending-deposits:
 *   get:
 *     summary: Obtener depósitos pendientes (admin) - Ruta de compatibilidad
 *     tags: [Administración - Pagos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Depósitos pendientes obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/payments/pending-deposits', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), async (req, res) => {
  console.log('[paymentSystemRoutes.ts:49] Ruta /admin/payments/pending-deposits accedida');
  await paymentSystemController.getPendingDeposits(req, res);
});

/**
 * @swagger
 * /admin/payments/pending-withdrawals:
 *   get:
 *     summary: Obtener retiros pendientes (admin) - Ruta de compatibilidad
 *     tags: [Administración - Pagos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retiros pendientes obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/payments/pending-withdrawals', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), async (req, res) => {
  await paymentSystemController.getPendingWithdrawals(req, res);
});

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
 *         routingNumber:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         isDefault:
 *           type: boolean
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     
 *     UserBalance:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         userType:
 *           type: string
 *           enum: [musician, event_organizer]
 *         currentBalance:
 *           type: number
 *         currency:
 *           type: string
 *         totalDeposited:
 *           type: number
 *         totalWithdrawn:
 *           type: number
 *         totalEarned:
 *           type: number
 *         pendingEarnings:
 *           type: number
 *         lastTransactionAt:
 *           type: string
 *         updatedAt:
 *           type: string
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
 *         status:
 *           type: string
 *           enum: [pending, verified, rejected]
 *         adminNotes:
 *           type: string
 *         verifiedBy:
 *           type: string
 *         verifiedAt:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
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
 *         eventDate:
 *           type: string
 *         eventTitle:
 *           type: string
 *         organizerName:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     
 *     WithdrawalRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         musicianId:
 *           type: string
 *         bankAccountId:
 *           type: string
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, rejected]
 *         adminNotes:
 *           type: string
 *         processedBy:
 *           type: string
 *         processedAt:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

// ===== RUTAS PARA USUARIOS =====

/**
 * @swagger
 * /payments/my-balance:
 *   get:
 *     summary: Obtener balance actual del usuario
 *     tags: [Sistema de Pagos]
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
 *                 message:
 *                   type: string
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/my-balance', authMiddleware, async (req, res) => {
  await paymentSystemController.getUserBalance(req, res);
});

/**
 * @swagger
 * /bank-accounts/register:
 *   post:
 *     summary: Registrar cuenta bancaria
 *     tags: [Sistema de Pagos]
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
 *       201:
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
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos incompletos
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error del servidor
 */
router.post('/bank-accounts/register', authMiddleware, async (req, res) => {
  await paymentSystemController.registerBankAccount(req, res);
});

/**
 * @swagger
 * /bank-accounts/my-accounts:
 *   get:
 *     summary: Obtener cuentas bancarias del usuario
 *     tags: [Sistema de Pagos]
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
 *                 message:
 *                   type: string
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/bank-accounts/my-accounts', authMiddleware, async (req, res) => {
  await paymentSystemController.getUserBankAccounts(req, res);
});

/**
 * @swagger
 * /payments/deposit:
 *   post:
 *     summary: Subir comprobante de depósito
 *     tags: [Sistema de Pagos]
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
 *               description:
 *                 type: string
 *     responses:
 *       201:
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
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos incompletos
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error del servidor
 */
router.post('/deposit', authMiddleware, upload.single('voucherFile'), async (req, res) => {
  await paymentSystemController.uploadDepositVoucher(req, res);
});

/**
 * @swagger
 * /payments/my-deposits:
 *   get:
 *     summary: Obtener historial de depósitos del usuario
 *     tags: [Sistema de Pagos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial obtenido exitosamente
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
 *                 message:
 *                   type: string
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/my-deposits', authMiddleware, async (req, res) => {
  await paymentSystemController.getUserDeposits(req, res);
});

/**
 * @swagger
 * /events/{eventId}/pay-musician:
 *   post:
 *     summary: Pagar a músico por evento
 *     tags: [Sistema de Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
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
 *               paymentMethod:
 *                 type: string
 *                 enum: [balance, bank_transfer]
 *                 default: balance
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pago procesado exitosamente
 *       400:
 *         description: Datos incompletos
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error del servidor
 */
router.post('/events/:eventId/pay-musician', authMiddleware, async (req, res) => {
  await paymentSystemController.payMusicianForEvent(req, res);
});

/**
 * @swagger
 * /musicians/earnings:
 *   get:
 *     summary: Obtener ganancias del músico
 *     tags: [Sistema de Pagos]
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
 *                 message:
 *                   type: string
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/musicians/earnings', authMiddleware, async (req, res) => {
  await paymentSystemController.getMusicianEarnings(req, res);
});

/**
 * @swagger
 * /musicians/withdraw-earnings:
 *   post:
 *     summary: Solicitar retiro de ganancias
 *     tags: [Sistema de Pagos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bankAccountId
 *               - amount
 *             properties:
 *               bankAccountId:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
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
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos incompletos
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error del servidor
 */
router.post('/musicians/withdraw-earnings', authMiddleware, async (req, res) => {
  await paymentSystemController.requestWithdrawal(req, res);
});

// ===== RUTAS DE ADMINISTRACIÓN =====

/**
 * @swagger
 * /admin/payments/pending-deposits:
 *   get:
 *     summary: Obtener depósitos pendientes (admin)
 *     tags: [Administración - Pagos]
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
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/payments/pending-deposits', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), async (req, res) => {
  await paymentSystemController.getPendingDeposits(req, res);
});

/**
 * @swagger
 * /admin/payments/verify-deposit/{depositId}:
 *   put:
 *     summary: Verificar depósito (admin)
 *     tags: [Administración - Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: depositId
 *         required: true
 *         schema:
 *           type: string
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
 *       400:
 *         description: Datos incompletos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.put('/payments/verify-deposit/:depositId', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), async (req, res) => {
  await paymentSystemController.verifyDeposit(req, res);
});

/**
 * @swagger
 * /admin/payments/pending-withdrawals:
 *   get:
 *     summary: Obtener retiros pendientes (admin)
 *     tags: [Administración - Pagos]
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
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/payments/pending-withdrawals', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), async (req, res) => {
  await paymentSystemController.getPendingWithdrawals(req, res);
});

/**
 * @swagger
 * /admin/payments/process-withdrawal/{withdrawalId}:
 *   put:
 *     summary: Procesar retiro (admin)
 *     tags: [Administración - Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: withdrawalId
 *         required: true
 *         schema:
 *           type: string
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
 *       400:
 *         description: Datos incompletos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.put('/payments/process-withdrawal/:withdrawalId', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), async (req, res) => {
  await paymentSystemController.processWithdrawal(req, res);
});

/**
 * @swagger
 * /admin/firestore/indexes/status:
 *   get:
 *     summary: Verificar estado de índices de Firestore (admin)
 *     tags: [Administración - Sistema]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de índices obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/firestore/indexes/status', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), async (req, res) => {
  try {
    const { FirestoreIndexManager } = await import('../utils/firestoreIndexes');
    const indexStatus = await FirestoreIndexManager.checkIndexStatus();
    
    res.json({
      success: true,
      data: indexStatus,
      message: 'Estado de índices obtenido exitosamente'
    });
  } catch (error) {
    logger.error('Error verificando estado de índices', error as Error);
    res.status(500).json({
      success: false,
      error: 'Error verificando estado de índices'
    });
  }
});

/**
 * @swagger
 * /admin/payments/voucher-image/{depositId}:
 *   get:
 *     summary: Obtener imagen del voucher de un depósito (admin)
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
 *         description: Imagen del voucher obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Depósito o imagen no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/payments/voucher-image/:depositId', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), async (req, res) => {
  try {
    const { depositId } = req.params;
    
    console.log('[src/routes/paymentSystemRoutes.ts] Solicitando voucher para depositId:', depositId);
    
    // Obtener el depósito de la base de datos
    const depositDoc = await db.collection('user_deposits').doc(depositId).get();
    
    if (!depositDoc.exists) {
      console.log('[src/routes/paymentSystemRoutes.ts] Depósito no encontrado:', depositId);
      res.status(404).json({ error: 'Depósito no encontrado' });
      return;
    }
    
    const deposit = depositDoc.data() as any;
    console.log('[src/routes/paymentSystemRoutes.ts] Depósito encontrado:', {
      id: depositId,
      hasVoucherFile: !!deposit.voucherFile,
      voucherUrl: deposit.voucherFile?.url
    });
    
    if (!deposit.voucherFile || !deposit.voucherFile.url) {
      console.log('[src/routes/paymentSystemRoutes.ts] Voucher no encontrado en depósito:', depositId);
      res.status(404).json({ error: 'Imagen del voucher no encontrada' });
      return;
    }
    
    // Opción 1: Redirigir a la URL de S3 (más simple)
    console.log('[src/routes/paymentSystemRoutes.ts] Redirigiendo a:', deposit.voucherFile.url);
    res.redirect(deposit.voucherFile.url);
    
    // Opción 2: Servir la imagen directamente (más seguro pero requiere más recursos)
    // try {
    //   const response = await fetch(deposit.voucherFile.url);
    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }
    //   const buffer = await response.arrayBuffer();
    //   res.set({
    //     'Content-Type': 'image/jpeg',
    //     'Cache-Control': 'public, max-age=3600',
    //     'Content-Length': buffer.byteLength.toString()
    //   });
    //   res.send(Buffer.from(buffer));
    // } catch (fetchError) {
    //   console.error('[src/routes/paymentSystemRoutes.ts] Error obteniendo imagen de S3:', fetchError);
    //   res.status(500).json({ error: 'Error obteniendo imagen del voucher' });
    // }
  } catch (error) {
    console.error('[src/routes/paymentSystemRoutes.ts] Error obteniendo imagen del voucher:', error);
    res.status(500).json({ error: 'Error obteniendo imagen del voucher' });
  }
});

/**
 * @swagger
 * /admin/payments/voucher-image-direct/{depositId}:
 *   get:
 *     summary: Obtener imagen del voucher directamente (sin redirección)
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
 *         description: Imagen del voucher obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Depósito o imagen no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/payments/voucher-image-direct/:depositId', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), async (req, res) => {
  try {
    const { depositId } = req.params;
    
    console.log('[src/routes/paymentSystemRoutes.ts] Solicitando voucher directo para depositId:', depositId);
    
    // Obtener el depósito de la base de datos
    const depositDoc = await db.collection('user_deposits').doc(depositId).get();
    
    if (!depositDoc.exists) {
      console.log('[src/routes/paymentSystemRoutes.ts] Depósito no encontrado:', depositId);
      res.status(404).json({ error: 'Depósito no encontrado' });
      return;
    }
    
    const deposit = depositDoc.data() as any;
    
    if (!deposit.voucherFile || !deposit.voucherFile.url) {
      console.log('[src/routes/paymentSystemRoutes.ts] Voucher no encontrado en depósito:', depositId);
      res.status(404).json({ error: 'Imagen del voucher no encontrada' });
      return;
    }
    
    // Servir la imagen directamente desde S3
    try {
      const response = await fetch(deposit.voucherFile.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': buffer.byteLength.toString(),
        'Access-Control-Allow-Origin': '*'
      });
      
      console.log('[src/routes/paymentSystemRoutes.ts] Sirviendo imagen directamente:', {
        depositId,
        contentType,
        size: buffer.byteLength
      });
      
      res.send(Buffer.from(buffer));
    } catch (fetchError) {
      console.error('[src/routes/paymentSystemRoutes.ts] Error obteniendo imagen de S3:', fetchError);
      res.status(500).json({ error: 'Error obteniendo imagen del voucher' });
    }
  } catch (error) {
    console.error('[src/routes/paymentSystemRoutes.ts] Error obteniendo imagen del voucher:', error);
    res.status(500).json({ error: 'Error obteniendo imagen del voucher' });
  }
});

/**
 * @swagger
 * /admin/payments/deposit-info/{depositId}:
 *   get:
 *     summary: Obtener información de un depósito (para debugging)
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
router.get('/payments/deposit-info/:depositId', authMiddleware, requireRole(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), async (req, res) => {
  try {
    const { depositId } = req.params;
    
    console.log('[src/routes/paymentSystemRoutes.ts] Solicitando información de depósito:', depositId);
    
    // Obtener el depósito de la base de datos
    const depositDoc = await db.collection('user_deposits').doc(depositId).get();
    
    if (!depositDoc.exists) {
      console.log('[src/routes/paymentSystemRoutes.ts] Depósito no encontrado:', depositId);
      res.status(404).json({ error: 'Depósito no encontrado' });
      return;
    }
    
    const deposit = depositDoc.data() as any;
    
    // Retornar información del depósito (sin datos sensibles)
    const depositInfo = {
      id: deposit.id,
      userId: deposit.userId,
      amount: deposit.amount,
      currency: deposit.currency,
      status: deposit.status,
      accountHolderName: deposit.accountHolderName,
      bankName: deposit.bankName,
      createdAt: deposit.createdAt,
      updatedAt: deposit.updatedAt,
      voucherFile: deposit.voucherFile ? {
        url: deposit.voucherFile.url,
        filename: deposit.voucherFile.filename,
        uploadedAt: deposit.voucherFile.uploadedAt
      } : null,
      hasVoucherFile: !!deposit.voucherFile,
      voucherUrl: deposit.voucherFile?.url
    };
    
    console.log('[src/routes/paymentSystemRoutes.ts] Información del depósito:', depositInfo);
    
    res.json({
      success: true,
      data: depositInfo,
      message: 'Información del depósito obtenida exitosamente'
    });
  } catch (error) {
    console.error('[src/routes/paymentSystemRoutes.ts] Error obteniendo información del depósito:', error);
    res.status(500).json({ error: 'Error obteniendo información del depósito' });
  }
});

export default router; 