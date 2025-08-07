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
exports.getVoucherPresignedUrl = exports.PaymentSystemController = void 0;
const paymentSystemService_1 = require("../services/paymentSystemService");
const loggerService_1 = require("../services/loggerService");
const firebase_1 = require("../utils/firebase");
const idriveE2_1 = require("../utils/idriveE2");
class PaymentSystemController {
    constructor() {
        this.paymentService = new paymentSystemService_1.PaymentSystemService();
    }
    /**
     * Obtener balance de usuario
     */
    getUserBalance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                if (!userId) {
                    res.status(401).json({ error: 'Usuario no autenticado' });
                    return;
                }
                const balance = yield this.paymentService.getUserBalance(userId);
                res.status(200).json({
                    success: true,
                    data: balance
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo balance de usuario', error, {
                    metadata: { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail }
                });
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo balance de usuario'
                });
            }
        });
    }
    /**
     * Registrar cuenta bancaria
     */
    registerBankAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                if (!userId) {
                    res.status(401).json({ error: 'Usuario no autenticado' });
                    return;
                }
                const accountData = req.body;
                // Validaciones básicas
                if (!accountData.accountHolder || !accountData.accountNumber || !accountData.bankName) {
                    res.status(400).json({ error: 'Datos de cuenta bancaria incompletos' });
                    return;
                }
                const bankAccount = yield this.paymentService.registerBankAccount(userId, accountData);
                res.status(200).json({
                    success: true,
                    data: bankAccount
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error registrando cuenta bancaria', error, {
                    metadata: { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail }
                });
                res.status(500).json({
                    success: false,
                    error: 'Error registrando cuenta bancaria'
                });
            }
        });
    }
    /**
     * Obtener cuentas bancarias de usuario
     */
    getUserBankAccounts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                if (!userId) {
                    res.status(401).json({ error: 'Usuario no autenticado' });
                    return;
                }
                const accounts = yield this.paymentService.getUserBankAccounts(userId);
                res.status(200).json({
                    success: true,
                    data: accounts
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo cuentas bancarias', error, {
                    metadata: { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail }
                });
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo cuentas bancarias'
                });
            }
        });
    }
    /**
     * Subir comprobante de depósito (MEJORADO)
     */
    uploadDepositVoucher(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                if (!userId) {
                    res.status(401).json({ error: 'Usuario no autenticado' });
                    return;
                }
                if (!req.file) {
                    res.status(400).json({ error: 'No se proporcionó archivo de comprobante' });
                    return;
                }
                const { amount, accountHolderName, accountNumber, bankName, depositDate, depositTime, referenceNumber, comments } = req.body;
                if (!amount || isNaN(Number(amount))) {
                    res.status(400).json({ error: 'Monto inválido' });
                    return;
                }
                if (!accountHolderName || !bankName) {
                    res.status(400).json({ error: 'Nombre del titular y banco son obligatorios' });
                    return;
                }
                const depositData = {
                    amount: Number(amount),
                    voucherFile: req.file,
                    accountHolderName,
                    accountNumber,
                    bankName,
                    depositDate,
                    depositTime,
                    referenceNumber,
                    comments
                };
                loggerService_1.logger.info('Subiendo comprobante de depósito', { metadata: { userId, amount } });
                const deposit = yield this.paymentService.uploadDepositVoucher(userId, depositData);
                // Notificar automáticamente a todos los administradores
                yield this.notifyAdminsAboutNewDeposit(deposit, userId);
                res.status(201).json({
                    success: true,
                    data: deposit,
                    message: 'Depósito subido exitosamente. Pendiente de verificación por administrador.'
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error subiendo comprobante de depósito', error, {
                    metadata: { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail }
                });
                // Manejar errores específicos
                if (error instanceof Error) {
                    if (error.message.includes('monto mínimo') || error.message.includes('monto máximo')) {
                        res.status(400).json({
                            success: false,
                            error: error.message
                        });
                        return;
                    }
                    if (error.message.includes('archivo') || error.message.includes('tamaño')) {
                        res.status(400).json({
                            success: false,
                            error: error.message
                        });
                        return;
                    }
                }
                res.status(500).json({
                    success: false,
                    error: 'Error subiendo comprobante de depósito'
                });
            }
        });
    }
    /**
     * Obtener depósitos del usuario (MEJORADO)
     */
    getUserDeposits(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                if (!userId) {
                    res.status(401).json({ error: 'Usuario no autenticado' });
                    return;
                }
                const deposits = yield this.paymentService.getUserDeposits(userId);
                res.status(200).json({
                    success: true,
                    data: deposits,
                    message: 'Depósitos obtenidos exitosamente'
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo depósitos del usuario', error, {
                    metadata: { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail }
                });
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo depósitos del usuario'
                });
            }
        });
    }
    /**
     * Notificar a administradores sobre nuevo depósito
     */
    notifyAdminsAboutNewDeposit(deposit, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Obtener todos los usuarios administradores
                const adminsSnapshot = yield firebase_1.db.collection('users')
                    .where('roll', 'in', ['admin', 'superadmin'])
                    .get();
                const adminEmails = adminsSnapshot.docs.map(doc => doc.data().userEmail);
                // Crear notificación para cada administrador
                const notificationPromises = adminEmails.map(adminEmail => firebase_1.db.collection('notifications').add({
                    userId: adminEmail,
                    title: 'Nuevo Depósito Pendiente',
                    message: `Usuario ${userId} ha subido un depósito de RD$ ${deposit.amount.toLocaleString()}`,
                    type: 'info',
                    category: 'payment',
                    isRead: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    metadata: {
                        depositId: deposit.id,
                        userId: userId,
                        amount: deposit.amount,
                        voucherUrl: deposit.voucherFile.url,
                        accountHolderName: deposit.accountHolderName,
                        bankName: deposit.bankName
                    }
                }));
                yield Promise.all(notificationPromises);
                loggerService_1.logger.info('Notificaciones enviadas a administradores', {
                    metadata: {
                        depositId: deposit.id,
                        adminCount: adminEmails.length
                    }
                });
                // Enviar push notifications si está disponible
                try {
                    const { pushNotificationService } = yield Promise.resolve().then(() => __importStar(require('../services/pushNotificationService')));
                    const pushPromises = adminEmails.map(adminEmail => pushNotificationService.sendNotificationToUser(adminEmail, {
                        title: 'Nuevo Depósito Pendiente',
                        body: `Usuario ${userId} ha subido un depósito de RD$ ${deposit.amount.toLocaleString()}`,
                        data: {
                            depositId: deposit.id,
                            type: 'new_deposit',
                            amount: deposit.amount,
                            userId: userId
                        },
                        type: 'payment',
                        category: 'deposit'
                    }));
                    yield Promise.all(pushPromises);
                }
                catch (pushError) {
                    loggerService_1.logger.warn('Error enviando push notifications a administradores', pushError);
                }
            }
            catch (error) {
                loggerService_1.logger.error('Error notificando a administradores sobre nuevo depósito', error);
            }
        });
    }
    /**
     * Pagar músico por evento
     */
    payMusicianForEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                if (!userId) {
                    res.status(401).json({ error: 'Usuario no autenticado' });
                    return;
                }
                const { eventId } = req.params;
                const { musicianId, amount } = req.body;
                if (!musicianId || !amount || isNaN(Number(amount))) {
                    res.status(400).json({ error: 'Datos de pago incompletos' });
                    return;
                }
                const paymentData = {
                    eventId,
                    organizerId: userId,
                    musicianId,
                    amount: Number(amount)
                };
                loggerService_1.logger.info('Procesando pago de evento', {
                    metadata: {
                        eventId,
                        organizerId: userId,
                        musicianId,
                        amount
                    }
                });
                const payment = yield this.paymentService.processEventPayment(paymentData);
                res.status(200).json({
                    success: true,
                    data: payment
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error procesando pago de evento', error, {
                    metadata: { eventId: req.params.eventId }
                });
                // Manejar errores específicos
                if (error instanceof Error) {
                    if (error.message.includes('Saldo insuficiente')) {
                        res.status(400).json({
                            success: false,
                            error: error.message
                        });
                        return;
                    }
                }
                res.status(500).json({
                    success: false,
                    error: 'Error procesando pago de evento'
                });
            }
        });
    }
    /**
     * Obtener ganancias de músico
     */
    getMusicianEarnings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                if (!userId) {
                    res.status(401).json({ error: 'Usuario no autenticado' });
                    return;
                }
                const earnings = yield this.paymentService.getMusicianEarnings(userId);
                res.status(200).json({
                    success: true,
                    data: earnings
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo ganancias de músico', error, {
                    metadata: { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail }
                });
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo ganancias de músico'
                });
            }
        });
    }
    /**
     * Solicitar retiro de ganancias (MEJORADO)
     */
    requestWithdrawal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                if (!userId) {
                    res.status(401).json({ error: 'Usuario no autenticado' });
                    return;
                }
                const { amount, bankAccountId } = req.body;
                if (!amount || !bankAccountId || isNaN(Number(amount))) {
                    res.status(400).json({ error: 'Datos de retiro incompletos' });
                    return;
                }
                const withdrawalData = {
                    amount: Number(amount),
                    bankAccountId
                };
                loggerService_1.logger.info('Solicitando retiro de ganancias', { metadata: { userId, amount: withdrawalData.amount } });
                const withdrawal = yield this.paymentService.requestWithdrawal(userId, withdrawalData);
                res.status(200).json({
                    success: true,
                    data: withdrawal,
                    message: 'Solicitud de retiro creada exitosamente'
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error solicitando retiro', error, {
                    metadata: { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail }
                });
                // Manejar errores específicos
                if (error instanceof Error) {
                    if (error.message.includes('monto mínimo') || error.message.includes('Saldo insuficiente')) {
                        res.status(400).json({
                            success: false,
                            error: error.message
                        });
                        return;
                    }
                    if (error.message.includes('Cuenta bancaria no encontrada')) {
                        res.status(400).json({
                            success: false,
                            error: error.message
                        });
                        return;
                    }
                }
                res.status(500).json({
                    success: false,
                    error: 'Error solicitando retiro'
                });
            }
        });
    }
    // ===== ENDPOINTS DE ADMINISTRACIÓN =====
    /**
     * Obtener depósitos pendientes (admin)
     */
    getPendingDeposits(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deposits = yield this.paymentService.getPendingDeposits();
                res.status(200).json({
                    success: true,
                    data: deposits
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo depósitos pendientes', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo depósitos pendientes'
                });
            }
        });
    }
    /**
     * Verificar depósito (admin) - MEJORADO
     */
    verifyDeposit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                const { depositId } = req.params;
                const { approved, notes, verificationData } = req.body;
                if (typeof approved !== 'boolean') {
                    res.status(400).json({ error: 'Estado de aprobación inválido' });
                    return;
                }
                // Si se aprueba, validar que se proporcionen los datos de verificación
                if (approved && (!verificationData || !verificationData.bankDepositDate || !verificationData.referenceNumber)) {
                    res.status(400).json({
                        error: 'Para aprobar un depósito, debe proporcionar fecha del depósito y número de referencia'
                    });
                    return;
                }
                loggerService_1.logger.info('Verificando depósito', { metadata: { depositId, adminId, approved } });
                yield this.paymentService.verifyDeposit(depositId, adminId, approved, notes);
                // Notificar al usuario sobre el resultado
                yield this.notifyUserAboutDepositVerification(depositId, approved, notes);
                res.status(200).json({
                    success: true,
                    data: {
                        depositId,
                        status: approved ? 'approved' : 'rejected',
                        verifiedBy: adminId,
                        verifiedAt: new Date().toISOString(),
                        userBalanceUpdated: approved
                    },
                    message: `Depósito ${approved ? 'aprobado' : 'rechazado'} exitosamente`
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error verificando depósito', error, {
                    metadata: { depositId: req.params.depositId, adminId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail }
                });
                // Manejar errores específicos
                if (error instanceof Error) {
                    if (error.message.includes('Depósito no encontrado') || error.message.includes('ya fue procesado')) {
                        res.status(400).json({
                            success: false,
                            error: error.message
                        });
                        return;
                    }
                }
                res.status(500).json({
                    success: false,
                    error: 'Error verificando depósito'
                });
            }
        });
    }
    /**
     * Notificar al usuario sobre la verificación de su depósito
     */
    notifyUserAboutDepositVerification(depositId, approved, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Obtener información del depósito
                const depositDoc = yield firebase_1.db.collection('user_deposits').doc(depositId).get();
                if (!depositDoc.exists)
                    return;
                const deposit = depositDoc.data();
                const userId = deposit.userId;
                // Crear notificación para el usuario
                yield firebase_1.db.collection('notifications').add({
                    userId: userId,
                    title: approved ? 'Depósito Aprobado' : 'Depósito Rechazado',
                    message: approved
                        ? `Tu depósito de RD$ ${deposit.amount.toLocaleString()} ha sido aprobado y agregado a tu balance`
                        : `Tu depósito ha sido rechazado: ${notes || 'Sin especificar'}`,
                    type: approved ? 'success' : 'error',
                    category: 'payment',
                    isRead: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    metadata: {
                        depositId: depositId,
                        amount: deposit.amount,
                        status: approved ? 'approved' : 'rejected',
                        notes: notes
                    }
                });
                // Enviar push notification si está disponible
                try {
                    const { pushNotificationService } = yield Promise.resolve().then(() => __importStar(require('../services/pushNotificationService')));
                    yield pushNotificationService.sendNotificationToUser(userId, {
                        title: approved ? 'Depósito Aprobado' : 'Depósito Rechazado',
                        body: approved
                            ? `Tu depósito de RD$ ${deposit.amount.toLocaleString()} ha sido aprobado`
                            : `Tu depósito ha sido rechazado: ${notes || 'Sin especificar'}`,
                        data: {
                            depositId: depositId,
                            type: approved ? 'deposit_approved' : 'deposit_rejected',
                            amount: deposit.amount
                        },
                        type: 'payment',
                        category: 'deposit'
                    });
                }
                catch (pushError) {
                    loggerService_1.logger.warn('Error enviando push notification al usuario', pushError);
                }
                loggerService_1.logger.info('Usuario notificado sobre verificación de depósito', {
                    metadata: { depositId, userId, approved }
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error notificando al usuario sobre verificación de depósito', error);
            }
        });
    }
    /**
     * Obtener retiros pendientes (admin)
     */
    getPendingWithdrawals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const withdrawals = yield this.paymentService.getPendingWithdrawals();
                res.status(200).json({
                    success: true,
                    data: withdrawals
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo retiros pendientes', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo retiros pendientes'
                });
            }
        });
    }
    /**
     * Procesar retiro (admin)
     */
    processWithdrawal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                const { withdrawalId } = req.params;
                const { approved, notes } = req.body;
                if (typeof approved !== 'boolean') {
                    res.status(400).json({ error: 'Estado de aprobación inválido' });
                    return;
                }
                loggerService_1.logger.info('Procesando retiro', { metadata: { withdrawalId, adminId, approved } });
                yield this.paymentService.processWithdrawal(withdrawalId, adminId, approved, notes);
                res.status(200).json({
                    success: true,
                    message: `Retiro ${approved ? 'aprobado' : 'rechazado'} exitosamente`
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error procesando retiro', error, {
                    metadata: { withdrawalId: req.params.withdrawalId, adminId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail }
                });
                res.status(500).json({
                    success: false,
                    error: 'Error procesando retiro'
                });
            }
        });
    }
    /**
     * Obtener estadísticas de pagos (admin) (DPT - DEPÓSITO)
     */
    dptGetPaymentStatistics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const statistics = yield this.paymentService.getPaymentStatistics();
                res.status(200).json({
                    success: true,
                    data: statistics
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo estadísticas de pagos', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo estadísticas de pagos'
                });
            }
        });
    }
    /**
     * Obtener estadísticas de pagos (admin) - MÉTODO LEGACY
     */
    getPaymentStatistics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.dptGetPaymentStatistics(req, res);
        });
    }
    /**
     * Obtener detalles de un depósito específico (admin)
     */
    getDepositDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { depositId } = req.params;
                const deposit = yield this.paymentService.getDepositDetails(depositId);
                if (!deposit) {
                    res.status(404).json({
                        success: false,
                        error: 'Depósito no encontrado'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: deposit
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo detalles del depósito', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo detalles del depósito'
                });
            }
        });
    }
    /**
     * Verificar duplicados de voucher (admin)
     */
    checkVoucherDuplicates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { depositId } = req.params;
                if (!depositId) {
                    res.status(400).json({
                        success: false,
                        error: 'ID de depósito requerido'
                    });
                    return;
                }
                loggerService_1.logger.info('Verificando duplicados de voucher', { metadata: { depositId } });
                const duplicates = yield this.paymentService.checkVoucherDuplicates(depositId);
                res.status(200).json({
                    success: true,
                    data: duplicates
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error verificando duplicados de voucher', error, {
                    metadata: { depositId: req.params.depositId }
                });
                res.status(500).json({
                    success: false,
                    error: 'Error verificando duplicados de voucher'
                });
            }
        });
    }
    // ===== MÉTODOS DPT (DEPÓSITOS) =====
    /**
     * Subir comprobante de depósito (DPT - DEPÓSITO)
     */
    dptUploadDepositVoucher(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                if (!userId) {
                    res.status(401).json({ error: 'Usuario no autenticado' });
                    return;
                }
                const { amount, description } = req.body;
                const voucherFile = req.file;
                // Validaciones básicas
                if (!amount || !voucherFile) {
                    res.status(400).json({ error: 'Monto y comprobante son requeridos' });
                    return;
                }
                const depositData = {
                    amount: parseFloat(amount),
                    voucherFile,
                    accountHolderName: 'Usuario', // Valor por defecto
                    bankName: 'Banco' // Valor por defecto
                };
                const deposit = yield this.paymentService.uploadDepositVoucher(userId, depositData);
                // Notificar a administradores sobre nuevo depósito
                yield this.notifyAdminsAboutNewDeposit(deposit, userId);
                res.status(201).json({
                    success: true,
                    data: deposit,
                    message: 'Comprobante de depósito subido exitosamente'
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error subiendo comprobante de depósito', error, {
                    metadata: { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail }
                });
                res.status(500).json({
                    success: false,
                    error: 'Error subiendo comprobante de depósito'
                });
            }
        });
    }
    /**
     * Obtener historial de depósitos del usuario (DPT - DEPÓSITO)
     */
    dptGetUserDeposits(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                if (!userId) {
                    res.status(401).json({ error: 'Usuario no autenticado' });
                    return;
                }
                const deposits = yield this.paymentService.getUserDeposits(userId);
                res.status(200).json({
                    success: true,
                    data: deposits
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo depósitos del usuario', error, {
                    metadata: { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail }
                });
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo depósitos del usuario'
                });
            }
        });
    }
    /**
     * Obtener depósitos pendientes (admin) (DPT - DEPÓSITO)
     */
    dptGetPendingDeposits(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deposits = yield this.paymentService.getPendingDeposits();
                res.status(200).json({
                    success: true,
                    data: deposits
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo depósitos pendientes', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo depósitos pendientes'
                });
            }
        });
    }
    /**
     * Verificar depósito (admin) (DPT - DEPÓSITO)
     */
    dptVerifyDeposit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                const { depositId } = req.params;
                const { approved, notes, verificationData } = req.body;
                if (typeof approved !== 'boolean') {
                    res.status(400).json({ error: 'Estado de aprobación inválido' });
                    return;
                }
                loggerService_1.logger.info('Verificando depósito', { metadata: { depositId, adminId, approved } });
                yield this.paymentService.verifyDeposit(depositId, adminId, approved, notes);
                // Notificar al usuario sobre la verificación
                yield this.notifyUserAboutDepositVerification(depositId, approved, notes);
                res.status(200).json({
                    success: true,
                    message: `Depósito ${approved ? 'aprobado' : 'rechazado'} exitosamente`
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error verificando depósito', error, {
                    metadata: { depositId: req.params.depositId, adminId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail }
                });
                res.status(500).json({
                    success: false,
                    error: 'Error verificando depósito'
                });
            }
        });
    }
    /**
     * Obtener detalles de un depósito específico (admin) (DPT - DEPÓSITO)
     */
    dptGetDepositDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { depositId } = req.params;
                const deposit = yield this.paymentService.getDepositDetails(depositId);
                if (!deposit) {
                    res.status(404).json({
                        success: false,
                        error: 'Depósito no encontrado'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: deposit
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo detalles del depósito', error);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo detalles del depósito'
                });
            }
        });
    }
    /**
     * Verificar duplicados de voucher (admin) (DPT - DEPÓSITO)
     */
    dptCheckVoucherDuplicates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { depositId } = req.params;
                if (!depositId) {
                    res.status(400).json({
                        success: false,
                        error: 'ID de depósito requerido'
                    });
                    return;
                }
                loggerService_1.logger.info('Verificando duplicados de voucher', { metadata: { depositId } });
                const duplicates = yield this.paymentService.checkVoucherDuplicates(depositId);
                res.status(200).json({
                    success: true,
                    data: duplicates
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error verificando duplicados de voucher', error, {
                    metadata: { depositId: req.params.depositId }
                });
                res.status(500).json({
                    success: false,
                    error: 'Error verificando duplicados de voucher'
                });
            }
        });
    }
}
exports.PaymentSystemController = PaymentSystemController;
/**
 * Genera una URL firmada para acceder a un comprobante de pago
 * Resuelve problemas de CORS y Access Denied en el frontend
 */
const getVoucherPresignedUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { depositId } = req.params;
        if (!depositId) {
            res.status(400).json({
                success: false,
                error: 'ID de depósito requerido'
            });
            return;
        }
        loggerService_1.logger.info('[src/controllers/paymentSystemController.ts] Generando URL firmada para comprobante:', { metadata: { depositId } });
        // Obtener información del depósito
        const paymentSystemService = new paymentSystemService_1.PaymentSystemService();
        const deposit = yield paymentSystemService.getDepositDetails(depositId);
        if (!deposit) {
            res.status(404).json({
                success: false,
                error: 'Depósito no encontrado'
            });
            return;
        }
        // Verificar que el usuario tenga permisos para ver este depósito
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId || (deposit.userId !== userId && !((_c = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === null || _c === void 0 ? void 0 : _c.includes('admin')))) {
            res.status(403).json({
                success: false,
                error: 'No tienes permisos para acceder a este depósito'
            });
            return;
        }
        // Obtener la clave del archivo del comprobante desde la referencia IDrive E2
        const voucherKey = (_d = deposit.voucherFile) === null || _d === void 0 ? void 0 : _d.idriveKey;
        if (!voucherKey) {
            res.status(404).json({
                success: false,
                error: 'Comprobante no encontrado'
            });
            return;
        }
        // Generar URL firmada
        const presignedUrl = yield (0, idriveE2_1.generatePresignedUrl)(voucherKey, 3600); // 1 hora
        loggerService_1.logger.info('[src/controllers/paymentSystemController.ts] URL firmada generada exitosamente:', { metadata: { depositId, voucherKey } });
        res.status(200).json({
            success: true,
            data: {
                presignedUrl,
                expiresIn: 3600,
                depositId,
                voucherKey
            },
            message: 'URL firmada generada exitosamente'
        });
    }
    catch (error) {
        loggerService_1.logger.error('[src/controllers/paymentSystemController.ts] Error generando URL firmada:', error instanceof Error ? error : new Error(String(error)));
        res.status(500).json({
            success: false,
            error: 'Error generando URL firmada del comprobante'
        });
    }
});
exports.getVoucherPresignedUrl = getVoucherPresignedUrl;
