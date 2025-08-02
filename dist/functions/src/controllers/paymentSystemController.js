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
exports.PaymentSystemController = void 0;
const paymentSystemService_1 = require("../services/paymentSystemService");
const loggerService_1 = require("../services/loggerService");
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
                res.json({
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
                res.json({
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
                res.json({
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
     * Subir comprobante de depósito
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
                const { amount } = req.body;
                if (!amount || isNaN(Number(amount))) {
                    res.status(400).json({ error: 'Monto inválido' });
                    return;
                }
                const depositData = {
                    amount: Number(amount),
                    voucherFile: req.file
                };
                loggerService_1.logger.info('Subiendo comprobante de depósito', { metadata: { userId, amount } });
                const deposit = yield this.paymentService.uploadDepositVoucher(userId, depositData);
                res.json({
                    success: true,
                    data: deposit
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
     * Obtener depósitos del usuario
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
                // TODO: Implementar método en el servicio
                res.json({
                    success: true,
                    data: [],
                    message: 'Funcionalidad en desarrollo'
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
                res.json({
                    success: true,
                    data: payment
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error procesando pago de evento', error, {
                    metadata: { eventId: req.params.eventId }
                });
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
                res.json({
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
     * Solicitar retiro de ganancias
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
                res.json({
                    success: true,
                    data: withdrawal
                });
            }
            catch (error) {
                loggerService_1.logger.error('Error solicitando retiro', error, {
                    metadata: { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail }
                });
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
                res.json({
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
     * Verificar depósito (admin)
     */
    verifyDeposit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
                const { depositId } = req.params;
                const { approved, notes } = req.body;
                if (typeof approved !== 'boolean') {
                    res.status(400).json({ error: 'Estado de aprobación inválido' });
                    return;
                }
                loggerService_1.logger.info('Verificando depósito', { metadata: { depositId, adminId, approved } });
                yield this.paymentService.verifyDeposit(depositId, adminId, approved, notes);
                res.json({
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
     * Obtener retiros pendientes (admin)
     */
    getPendingWithdrawals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const withdrawals = yield this.paymentService.getPendingWithdrawals();
                res.json({
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
                res.json({
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
     * Obtener estadísticas de pagos (admin)
     */
    getPaymentStatistics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const statistics = yield this.paymentService.getPaymentStatistics();
                res.json({
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
}
exports.PaymentSystemController = PaymentSystemController;
