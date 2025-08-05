"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const loggerService_1 = require("../services/loggerService");
const firebase_1 = require("../utils/firebase");
const router = (0, express_1.Router)();
const paymentSystemController = new paymentSystemController_1.PaymentSystemController();
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
router.get('/payments/statistics', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.dptGetPaymentStatistics(req, res);
}));
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
 *         description: Estadísticas de depósitos obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/payments/deposit-stats', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.dptGetPaymentStatistics(req, res);
}));
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
router.get('/payments/pending-deposits', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[paymentSystemRoutes.ts:49] Ruta /admin/payments/pending-deposits accedida');
    yield paymentSystemController.getPendingDeposits(req, res);
}));
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
router.get('/payments/pending-withdrawals', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.getPendingWithdrawals(req, res);
}));
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
    yield paymentSystemController.dptUploadDepositVoucher(req, res);
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
    yield paymentSystemController.dptGetUserDeposits(req, res);
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
router.get('/payments/pending-deposits', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.dptGetPendingDeposits(req, res);
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
router.put('/payments/verify-deposit/:depositId', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.dptVerifyDeposit(req, res);
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
router.get('/payments/pending-withdrawals', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
router.put('/payments/process-withdrawal/:withdrawalId', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.processWithdrawal(req, res);
}));
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
router.get('/firestore/indexes/status', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { FirestoreIndexManager } = yield Promise.resolve().then(() => __importStar(require('../utils/firestoreIndexes')));
        const indexStatus = yield FirestoreIndexManager.checkIndexStatus();
        res.json({
            success: true,
            data: indexStatus,
            message: 'Estado de índices obtenido exitosamente'
        });
    }
    catch (error) {
        loggerService_1.logger.error('Error verificando estado de índices', error);
        res.status(500).json({
            success: false,
            error: 'Error verificando estado de índices'
        });
    }
}));
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
router.get('/payments/voucher-image/:depositId', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { depositId } = req.params;
        console.log('[src/routes/paymentSystemRoutes.ts] Solicitando voucher para depositId:', depositId);
        // Obtener el depósito de la base de datos
        const depositDoc = yield firebase_1.db.collection('user_deposits').doc(depositId).get();
        if (!depositDoc.exists) {
            console.log('[src/routes/paymentSystemRoutes.ts] Depósito no encontrado:', depositId);
            res.status(404).json({ error: 'Depósito no encontrado' });
            return;
        }
        const deposit = depositDoc.data();
        console.log('[src/routes/paymentSystemRoutes.ts] Depósito encontrado:', {
            id: depositId,
            hasVoucherFile: !!deposit.voucherFile,
            voucherUrl: (_a = deposit.voucherFile) === null || _a === void 0 ? void 0 : _a.url
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
    }
    catch (error) {
        console.error('[src/routes/paymentSystemRoutes.ts] Error obteniendo imagen del voucher:', error);
        res.status(500).json({ error: 'Error obteniendo imagen del voucher' });
    }
}));
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
router.get('/payments/voucher-image-direct/:depositId', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { depositId } = req.params;
        console.log('[src/routes/paymentSystemRoutes.ts] Solicitando voucher directo para depositId:', depositId);
        // Obtener el depósito de la base de datos
        const depositDoc = yield firebase_1.db.collection('user_deposits').doc(depositId).get();
        if (!depositDoc.exists) {
            console.log('[src/routes/paymentSystemRoutes.ts] Depósito no encontrado:', depositId);
            res.status(404).json({ error: 'Depósito no encontrado' });
            return;
        }
        const deposit = depositDoc.data();
        if (!deposit.voucherFile || !deposit.voucherFile.url) {
            console.log('[src/routes/paymentSystemRoutes.ts] Voucher no encontrado en depósito:', depositId);
            res.status(404).json({ error: 'Imagen del voucher no encontrada' });
            return;
        }
        // Servir la imagen directamente desde S3
        try {
            const response = yield fetch(deposit.voucherFile.url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const buffer = yield response.arrayBuffer();
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
        }
        catch (fetchError) {
            console.error('[src/routes/paymentSystemRoutes.ts] Error obteniendo imagen de S3:', fetchError);
            res.status(500).json({ error: 'Error obteniendo imagen del voucher' });
        }
    }
    catch (error) {
        console.error('[src/routes/paymentSystemRoutes.ts] Error obteniendo imagen del voucher:', error);
        res.status(500).json({ error: 'Error obteniendo imagen del voucher' });
    }
}));
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
router.get('/payments/check-duplicate/:depositId', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[src/routes/paymentSystemRoutes.ts] Ruta /admin/payments/check-duplicate accedida');
    yield paymentSystemController.dptCheckVoucherDuplicates(req, res);
}));
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
router.get('/payments/deposit-info/:depositId', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['adminJunior', 'adminMidLevel', 'adminSenior', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentSystemController.dptGetDepositDetails(req, res);
}));
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
router.get('/voucher/:depositId/presigned-url', authMiddleware_1.authMiddleware, paymentSystemController_1.getVoucherPresignedUrl);
exports.default = router;
