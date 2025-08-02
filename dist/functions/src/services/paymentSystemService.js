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
exports.PaymentSystemService = void 0;
const firebase_1 = require("../utils/firebase");
const loggerService_1 = require("./loggerService");
const idriveE2_1 = require("../utils/idriveE2");
class PaymentSystemService {
    constructor() {
        this.COMMISSION_RATE = 0.10; // 10% de comisión
    }
    /**
     * Calcular comisión de la plataforma
     */
    calculateCommission(eventAmount) {
        const commission = eventAmount * this.COMMISSION_RATE;
        const musicianAmount = eventAmount - commission;
        return {
            totalAmount: eventAmount,
            commissionAmount: commission,
            musicianAmount: musicianAmount,
            commissionRate: this.COMMISSION_RATE
        };
    }
    /**
     * Obtener balance de usuario
     */
    getUserBalance(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Obteniendo balance de usuario', { metadata: { userId } });
                const balanceDoc = yield firebase_1.db.collection('user_balances').doc(userId).get();
                if (!balanceDoc.exists) {
                    // Crear balance inicial si no existe
                    const initialBalance = {
                        userId,
                        balance: 0,
                        currency: 'RD$',
                        lastUpdated: new Date().toISOString(),
                        totalDeposits: 0,
                        totalWithdrawals: 0,
                        totalEarnings: 0
                    };
                    yield firebase_1.db.collection('user_balances').doc(userId).set(initialBalance);
                    return initialBalance;
                }
                return balanceDoc.data();
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo balance de usuario', error, {
                    metadata: { userId }
                });
                throw new Error('Error obteniendo balance de usuario');
            }
        });
    }
    /**
     * Registrar cuenta bancaria
     */
    registerBankAccount(userId, accountData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Registrando cuenta bancaria', { metadata: { userId } });
                const bankAccount = Object.assign(Object.assign({ id: `bank_${Date.now()}_${userId}`, userId }, accountData), { isVerified: false, isDefault: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
                yield firebase_1.db.collection('bank_accounts').doc(bankAccount.id).set(bankAccount);
                // Si es la primera cuenta, establecer como default
                const userAccounts = yield firebase_1.db.collection('bank_accounts')
                    .where('userId', '==', userId)
                    .get();
                if (userAccounts.size === 1) {
                    bankAccount.isDefault = true;
                    yield firebase_1.db.collection('bank_accounts').doc(bankAccount.id).update({ isDefault: true });
                }
                return bankAccount;
            }
            catch (error) {
                loggerService_1.logger.error('Error registrando cuenta bancaria', error, {
                    metadata: { userId }
                });
                throw new Error('Error registrando cuenta bancaria');
            }
        });
    }
    /**
     * Obtener cuentas bancarias de usuario
     */
    getUserBankAccounts(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Obteniendo cuentas bancarias de usuario', { metadata: { userId } });
                const accountsSnapshot = yield firebase_1.db.collection('bank_accounts')
                    .where('userId', '==', userId)
                    .orderBy('isDefault', 'desc')
                    .orderBy('createdAt', 'desc')
                    .get();
                return accountsSnapshot.docs.map(doc => doc.data());
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo cuentas bancarias', error, {
                    metadata: { userId }
                });
                throw new Error('Error obteniendo cuentas bancarias');
            }
        });
    }
    /**
     * Subir comprobante de depósito
     */
    uploadDepositVoucher(userId, depositData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Subiendo comprobante de depósito', { metadata: { userId, amount: depositData.amount } });
                // Subir archivo a S3
                const fileUrl = yield (0, idriveE2_1.uploadToS3)(depositData.voucherFile.buffer, depositData.voucherFile.originalname || 'voucher.jpg', depositData.voucherFile.mimetype || 'image/jpeg', 'deposits');
                const deposit = {
                    id: `deposit_${Date.now()}_${userId}`,
                    userId,
                    amount: depositData.amount,
                    currency: 'RD$',
                    voucherFile: {
                        url: fileUrl,
                        filename: depositData.voucherFile.originalname || 'voucher.jpg',
                        uploadedAt: new Date().toISOString()
                    },
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                yield firebase_1.db.collection('user_deposits').doc(deposit.id).set(deposit);
                return deposit;
            }
            catch (error) {
                loggerService_1.logger.error('Error subiendo comprobante de depósito', error, {
                    metadata: { userId }
                });
                throw new Error('Error subiendo comprobante de depósito');
            }
        });
    }
    /**
     * Verificar depósito (admin)
     */
    verifyDeposit(depositId, adminId, approved, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Verificando depósito', { metadata: { depositId, adminId, approved } });
                const depositRef = firebase_1.db.collection('user_deposits').doc(depositId);
                const depositDoc = yield depositRef.get();
                if (!depositDoc.exists) {
                    throw new Error('Depósito no encontrado');
                }
                const deposit = depositDoc.data();
                if (deposit.status !== 'pending') {
                    throw new Error('Depósito ya fue procesado');
                }
                const updateData = {
                    status: approved ? 'approved' : 'rejected',
                    verifiedBy: adminId,
                    verifiedAt: new Date().toISOString(),
                    notes,
                    updatedAt: new Date().toISOString()
                };
                yield depositRef.update(updateData);
                // Si fue aprobado, actualizar balance del usuario
                if (approved) {
                    yield this.updateUserBalance(deposit.userId, deposit.amount, 'deposit');
                }
            }
            catch (error) {
                loggerService_1.logger.error('Error verificando depósito', error, {
                    metadata: { depositId, adminId }
                });
                throw new Error('Error verificando depósito');
            }
        });
    }
    /**
     * Procesar pago de evento
     */
    processEventPayment(paymentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Procesando pago de evento', {
                    metadata: {
                        eventId: paymentData.eventId,
                        organizerId: paymentData.organizerId,
                        musicianId: paymentData.musicianId,
                        amount: paymentData.amount
                    }
                });
                const commission = this.calculateCommission(paymentData.amount);
                const eventPayment = {
                    id: `payment_${Date.now()}_${paymentData.eventId}`,
                    eventId: paymentData.eventId,
                    organizerId: paymentData.organizerId,
                    musicianId: paymentData.musicianId,
                    amount: paymentData.amount,
                    currency: 'RD$',
                    commission: commission.commissionAmount,
                    musicianAmount: commission.musicianAmount,
                    status: 'completed',
                    paymentMethod: 'transfer',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                yield firebase_1.db.collection('event_payments').doc(eventPayment.id).set(eventPayment);
                // Crear ganancia para el músico
                yield this.createMusicianEarning(eventPayment);
                // Actualizar balance del organizador (deducir pago)
                yield this.updateUserBalance(paymentData.organizerId, -paymentData.amount, 'payment');
                return eventPayment;
            }
            catch (error) {
                loggerService_1.logger.error('Error procesando pago de evento', error, {
                    metadata: { eventId: paymentData.eventId }
                });
                throw new Error('Error procesando pago de evento');
            }
        });
    }
    /**
     * Crear ganancia para músico
     */
    createMusicianEarning(eventPayment) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const earning = {
                    id: `earning_${Date.now()}_${eventPayment.musicianId}`,
                    musicianId: eventPayment.musicianId,
                    eventId: eventPayment.eventId,
                    eventPaymentId: eventPayment.id,
                    amount: eventPayment.musicianAmount,
                    currency: 'RD$',
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                yield firebase_1.db.collection('musician_earnings').doc(earning.id).set(earning);
                // Actualizar balance del músico
                yield this.updateUserBalance(eventPayment.musicianId, eventPayment.musicianAmount, 'earning');
            }
            catch (error) {
                loggerService_1.logger.error('Error creando ganancia para músico', error, {
                    metadata: { musicianId: eventPayment.musicianId, eventId: eventPayment.eventId }
                });
                throw new Error('Error creando ganancia para músico');
            }
        });
    }
    /**
     * Solicitar retiro de ganancias
     */
    requestWithdrawal(musicianId, withdrawalData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Solicitando retiro de ganancias', { metadata: { musicianId, amount: withdrawalData.amount } });
                // Verificar que el usuario tenga suficiente balance
                const balance = yield this.getUserBalance(musicianId);
                if (balance.balance < withdrawalData.amount) {
                    throw new Error('Saldo insuficiente para el retiro');
                }
                const withdrawal = {
                    id: `withdrawal_${Date.now()}_${musicianId}`,
                    musicianId,
                    amount: withdrawalData.amount,
                    currency: 'RD$',
                    bankAccountId: withdrawalData.bankAccountId,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                yield firebase_1.db.collection('withdrawal_requests').doc(withdrawal.id).set(withdrawal);
                return withdrawal;
            }
            catch (error) {
                loggerService_1.logger.error('Error solicitando retiro', error, {
                    metadata: { musicianId }
                });
                throw new Error('Error solicitando retiro');
            }
        });
    }
    /**
     * Procesar retiro (admin)
     */
    processWithdrawal(withdrawalId, adminId, approved, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Procesando retiro', { metadata: { withdrawalId, adminId, approved } });
                const withdrawalRef = firebase_1.db.collection('withdrawal_requests').doc(withdrawalId);
                const withdrawalDoc = yield withdrawalRef.get();
                if (!withdrawalDoc.exists) {
                    throw new Error('Solicitud de retiro no encontrada');
                }
                const withdrawal = withdrawalDoc.data();
                if (withdrawal.status !== 'pending') {
                    throw new Error('Solicitud de retiro ya fue procesada');
                }
                const updateData = {
                    status: approved ? 'approved' : 'rejected',
                    processedBy: adminId,
                    processedAt: new Date().toISOString(),
                    notes,
                    updatedAt: new Date().toISOString()
                };
                yield withdrawalRef.update(updateData);
                // Si fue aprobado, actualizar balance del usuario
                if (approved) {
                    yield this.updateUserBalance(withdrawal.musicianId, -withdrawal.amount, 'withdrawal');
                }
            }
            catch (error) {
                loggerService_1.logger.error('Error procesando retiro', error, {
                    metadata: { withdrawalId, adminId }
                });
                throw new Error('Error procesando retiro');
            }
        });
    }
    /**
     * Actualizar balance de usuario
     */
    updateUserBalance(userId, amount, transactionType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const balanceRef = firebase_1.db.collection('user_balances').doc(userId);
                const balanceDoc = yield balanceRef.get();
                let currentBalance = 0;
                let totalDeposits = 0;
                let totalWithdrawals = 0;
                let totalEarnings = 0;
                if (balanceDoc.exists) {
                    const balance = balanceDoc.data();
                    currentBalance = balance.balance;
                    totalDeposits = balance.totalDeposits;
                    totalWithdrawals = balance.totalWithdrawals;
                    totalEarnings = balance.totalEarnings;
                }
                // Actualizar balance y estadísticas
                const newBalance = currentBalance + amount;
                switch (transactionType) {
                    case 'deposit':
                        totalDeposits += amount;
                        break;
                    case 'withdrawal':
                        totalWithdrawals += Math.abs(amount);
                        break;
                    case 'earning':
                        totalEarnings += amount;
                        break;
                }
                const updatedBalance = {
                    userId,
                    balance: newBalance,
                    currency: 'RD$',
                    lastUpdated: new Date().toISOString(),
                    totalDeposits,
                    totalWithdrawals,
                    totalEarnings
                };
                yield balanceRef.set(updatedBalance);
            }
            catch (error) {
                loggerService_1.logger.error('Error actualizando balance de usuario', error, {
                    metadata: { userId, amount, transactionType }
                });
                throw new Error('Error actualizando balance de usuario');
            }
        });
    }
    /**
     * Obtener estadísticas de pagos (admin)
     */
    getPaymentStatistics() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Obtener total de depósitos
                const depositsSnapshot = yield firebase_1.db.collection('user_deposits')
                    .where('status', '==', 'approved')
                    .get();
                const totalDeposits = depositsSnapshot.docs.reduce((sum, doc) => {
                    const deposit = doc.data();
                    return sum + deposit.amount;
                }, 0);
                // Obtener total de pagos de eventos
                const paymentsSnapshot = yield firebase_1.db.collection('event_payments')
                    .where('status', '==', 'completed')
                    .get();
                const totalPayments = paymentsSnapshot.docs.reduce((sum, doc) => {
                    const payment = doc.data();
                    return sum + payment.amount;
                }, 0);
                const totalCommissions = paymentsSnapshot.docs.reduce((sum, doc) => {
                    const payment = doc.data();
                    return sum + payment.commission;
                }, 0);
                // Obtener total de retiros
                const withdrawalsSnapshot = yield firebase_1.db.collection('withdrawal_requests')
                    .where('status', '==', 'approved')
                    .get();
                const totalWithdrawals = withdrawalsSnapshot.docs.reduce((sum, doc) => {
                    const withdrawal = doc.data();
                    return sum + withdrawal.amount;
                }, 0);
                // Obtener depósitos pendientes
                const pendingDepositsSnapshot = yield firebase_1.db.collection('user_deposits')
                    .where('status', '==', 'pending')
                    .get();
                // Obtener retiros pendientes
                const pendingWithdrawalsSnapshot = yield firebase_1.db.collection('withdrawal_requests')
                    .where('status', '==', 'pending')
                    .get();
                return {
                    totalDeposits,
                    totalPayments,
                    totalCommissions,
                    totalWithdrawals,
                    pendingDepositsCount: pendingDepositsSnapshot.size,
                    pendingWithdrawalsCount: pendingWithdrawalsSnapshot.size,
                    totalUsers: yield this.getTotalUsers(),
                    totalMusicians: yield this.getTotalMusicians(),
                    totalEvents: yield this.getTotalEvents(),
                    lastUpdated: new Date().toISOString()
                };
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo estadísticas de pagos', error);
                throw new Error('Error obteniendo estadísticas de pagos');
            }
        });
    }
    /**
     * Obtener depósitos pendientes (admin)
     */
    getPendingDeposits() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const depositsSnapshot = yield firebase_1.db.collection('user_deposits')
                    .where('status', '==', 'pending')
                    .orderBy('createdAt', 'desc')
                    .get();
                return depositsSnapshot.docs.map(doc => doc.data());
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo depósitos pendientes', error);
                throw new Error('Error obteniendo depósitos pendientes');
            }
        });
    }
    /**
     * Obtener retiros pendientes (admin)
     */
    getPendingWithdrawals() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const withdrawalsSnapshot = yield firebase_1.db.collection('withdrawal_requests')
                    .where('status', '==', 'pending')
                    .orderBy('createdAt', 'desc')
                    .get();
                return withdrawalsSnapshot.docs.map(doc => doc.data());
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo retiros pendientes', error);
                throw new Error('Error obteniendo retiros pendientes');
            }
        });
    }
    /**
     * Obtener ganancias de músico
     */
    getMusicianEarnings(musicianId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const earningsSnapshot = yield firebase_1.db.collection('musician_earnings')
                    .where('musicianId', '==', musicianId)
                    .orderBy('createdAt', 'desc')
                    .get();
                return earningsSnapshot.docs.map(doc => doc.data());
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo ganancias de músico', error, {
                    metadata: { musicianId }
                });
                throw new Error('Error obteniendo ganancias de músico');
            }
        });
    }
    // Métodos auxiliares para estadísticas
    getTotalUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const usersSnapshot = yield firebase_1.db.collection('users').get();
            return usersSnapshot.size;
        });
    }
    getTotalMusicians() {
        return __awaiter(this, void 0, void 0, function* () {
            const musiciansSnapshot = yield firebase_1.db.collection('users')
                .where('role', '==', 'musician')
                .get();
            return musiciansSnapshot.size;
        });
    }
    getTotalEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            const eventsSnapshot = yield firebase_1.db.collection('events').get();
            return eventsSnapshot.size;
        });
    }
}
exports.PaymentSystemService = PaymentSystemService;
