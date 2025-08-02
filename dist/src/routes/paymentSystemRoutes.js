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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentSystemController_1 = require("../controllers/paymentSystemController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const requireRole_1 = require("../middleware/requireRole");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = (0, express_1.Router)();
const paymentSystemController = new paymentSystemController_1.PaymentSystemController();
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
router.get('/my-balance', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.getUserBalance(req, res);
}));
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
router.post('/bank-accounts/register', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.registerBankAccount(req, res);
}));
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
router.get('/bank-accounts/my-accounts', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.getUserBankAccounts(req, res);
}));
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
router.post('/deposit', authMiddleware_1.authMiddleware, uploadMiddleware_1.upload.single('voucherFile'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.uploadDepositVoucher(req, res);
}));
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
router.get('/my-deposits', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.getUserDeposits(req, res);
}));
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
router.post('/events/:eventId/pay-musician', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.payMusicianForEvent(req, res);
}));
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
router.get('/musicians/earnings', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.getMusicianEarnings(req, res);
}));
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
router.post('/musicians/withdraw-earnings', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.requestWithdrawal(req, res);
}));
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
router.get('/admin/payments/pending-deposits', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.getPendingDeposits(req, res);
}));
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
router.put('/admin/payments/verify-deposit/:depositId', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.verifyDeposit(req, res);
}));
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
router.get('/admin/payments/pending-withdrawals', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.getPendingWithdrawals(req, res);
}));
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
router.put('/admin/payments/process-withdrawal/:withdrawalId', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.processWithdrawal(req, res);
}));
/**
 * @swagger
 * /admin/payments/statistics:
 *   get:
 *     summary: Obtener estadísticas de pagos (admin)
 *     tags: [Administración - Pagos]
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
 *                     totalDeposits:
 *                       type: number
 *                     totalWithdrawals:
 *                       type: number
 *                     totalCommissions:
 *                       type: number
 *                     pendingDeposits:
 *                       type: number
 *                     pendingWithdrawals:
 *                       type: number
 *                     averageTransactionAmount:
 *                       type: number
 *                     monthlyRevenue:
 *                       type: number
 *                     topEarningMusicians:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           musicianId:
 *                             type: string
 *                           musicianName:
 *                             type: string
 *                           totalEarnings:
 *                             type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/admin/payments/statistics', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.getPaymentStatistics(req, res);
}));
exports.default = router;
