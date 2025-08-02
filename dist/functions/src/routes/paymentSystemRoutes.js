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
router.get('/my-balance', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.getUserBalance(req, res);
}));
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
router.post('/bank-accounts/register', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.registerBankAccount(req, res);
}));
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
router.get('/bank-accounts/my-accounts', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.getUserBankAccounts(req, res);
}));
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
router.post('/deposit', authMiddleware_1.authMiddleware, uploadMiddleware_1.upload.single('voucherFile'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.uploadDepositVoucher(req, res);
}));
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
router.get('/my-deposits', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.getUserDeposits(req, res);
}));
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
router.post('/events/:eventId/pay-musician', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.payMusicianForEvent(req, res);
}));
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
router.get('/musicians/earnings', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.getMusicianEarnings(req, res);
}));
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
router.post('/musicians/withdraw-earnings', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.requestWithdrawal(req, res);
}));
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
router.get('/admin/payments/pending-deposits', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.getPendingDeposits(req, res);
}));
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
router.put('/admin/payments/verify-deposit/:depositId', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.verifyDeposit(req, res);
}));
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
router.get('/admin/payments/pending-withdrawals', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.getPendingWithdrawals(req, res);
}));
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
router.put('/admin/payments/process-withdrawal/:withdrawalId', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.processWithdrawal(req, res);
}));
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
router.get('/admin/payments/statistics', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.getPaymentStatistics(req, res);
}));
exports.default = router;
