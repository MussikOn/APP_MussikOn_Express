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
        this.MAX_DEPOSIT_AMOUNT = 1000000; // 1 millón RD$
        this.MIN_DEPOSIT_AMOUNT = 100; // 100 RD$
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
     * Validar monto de depósito
     */
    validateDepositAmount(amount) {
        if (amount < this.MIN_DEPOSIT_AMOUNT) {
            throw new Error(`El monto mínimo de depósito es RD$ ${this.MIN_DEPOSIT_AMOUNT.toLocaleString()}`);
        }
        if (amount > this.MAX_DEPOSIT_AMOUNT) {
            throw new Error(`El monto máximo de depósito es RD$ ${this.MAX_DEPOSIT_AMOUNT.toLocaleString()}`);
        }
    }
    /**
     * Validar archivo de voucher
     */
    validateVoucherFile(file) {
        if (!file) {
            throw new Error('No se proporcionó archivo de comprobante');
        }
        // Validar tamaño (máximo 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('El archivo es demasiado grande. Máximo 10MB');
        }
        // Validar tipo MIME
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf'
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error('Tipo de archivo no permitido. Solo imágenes y PDFs');
        }
    }
    /**
     * Generar nombre único para archivo
     */
    generateUniqueFileName(originalName, userId) {
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const extension = originalName.split('.').pop() || 'jpg';
        return `deposits/${userId}/${timestamp}_${randomSuffix}.${extension}`;
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
                // Validar datos de cuenta bancaria
                if (!accountData.accountHolder || !accountData.accountNumber || !accountData.bankName) {
                    throw new Error('Datos de cuenta bancaria incompletos');
                }
                // Verificar que no exista una cuenta con el mismo número para este usuario
                const existingAccounts = yield firebase_1.db.collection('bank_accounts')
                    .where('userId', '==', userId)
                    .where('accountNumber', '==', accountData.accountNumber)
                    .get();
                if (!existingAccounts.empty) {
                    throw new Error('Ya existe una cuenta bancaria con este número');
                }
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
            var _a;
            try {
                loggerService_1.logger.info('Obteniendo cuentas bancarias de usuario', { metadata: { userId } });
                try {
                    // Intentar consulta optimizada con índices
                    const accountsSnapshot = yield firebase_1.db.collection('bank_accounts')
                        .where('userId', '==', userId)
                        .orderBy('isDefault', 'desc')
                        .orderBy('createdAt', 'desc')
                        .get();
                    return accountsSnapshot.docs.map(doc => doc.data());
                }
                catch (indexError) {
                    // Si falla por falta de índice, usar consulta simple y ordenar en memoria
                    const error = indexError;
                    if (error.code === 'FAILED_PRECONDITION' && ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('index'))) {
                        loggerService_1.logger.warn('Índice no disponible, usando ordenamiento en memoria', {
                            metadata: { userId, error: error.message }
                        });
                        const accountsSnapshot = yield firebase_1.db.collection('bank_accounts')
                            .where('userId', '==', userId)
                            .get();
                        const accounts = accountsSnapshot.docs.map(doc => doc.data());
                        // Ordenar por default primero, luego por fecha de creación
                        return accounts.sort((a, b) => {
                            // Primero por isDefault (descendente)
                            if (a.isDefault !== b.isDefault) {
                                return b.isDefault ? 1 : -1;
                            }
                            // Luego por createdAt (descendente)
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                        });
                    }
                    else {
                        // Si es otro tipo de error, relanzarlo
                        throw indexError;
                    }
                }
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
     * Subir comprobante de depósito (MEJORADO)
     */
    uploadDepositVoucher(userId, depositData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Subiendo comprobante de depósito', { metadata: { userId, amount: depositData.amount } });
                // Validaciones
                this.validateDepositAmount(depositData.amount);
                this.validateVoucherFile(depositData.voucherFile);
                if (!depositData.accountHolderName || !depositData.bankName) {
                    throw new Error('Nombre del titular y banco son obligatorios');
                }
                // Generar nombre único para el archivo
                const uniqueFileName = this.generateUniqueFileName(depositData.voucherFile.originalname || 'voucher.jpg', userId);
                // Subir archivo a S3 con mejor manejo de errores
                let fileUrl;
                try {
                    fileUrl = yield (0, idriveE2_1.uploadToS3)(depositData.voucherFile.buffer, uniqueFileName, depositData.voucherFile.mimetype || 'image/jpeg', 'deposits');
                }
                catch (uploadError) {
                    loggerService_1.logger.error('Error subiendo archivo a S3', uploadError, { metadata: { userId } });
                    throw new Error('Error subiendo comprobante. Intente nuevamente.');
                }
                // Verificar que no haya depósitos duplicados recientes
                const recentDeposits = yield firebase_1.db.collection('user_deposits')
                    .where('userId', '==', userId)
                    .where('amount', '==', depositData.amount)
                    .where('status', '==', 'pending')
                    .where('createdAt', '>', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24 horas
                    .get();
                if (!recentDeposits.empty) {
                    loggerService_1.logger.warn('Posible depósito duplicado detectado', { metadata: { userId, amount: depositData.amount } });
                }
                const deposit = {
                    id: `deposit_${Date.now()}_${userId}`,
                    userId,
                    amount: depositData.amount,
                    currency: 'RD$',
                    voucherFile: {
                        url: fileUrl,
                        filename: uniqueFileName,
                        uploadedAt: new Date().toISOString()
                    },
                    // Información del depósito bancario
                    accountHolderName: depositData.accountHolderName,
                    accountNumber: depositData.accountNumber,
                    bankName: depositData.bankName,
                    depositDate: depositData.depositDate,
                    depositTime: depositData.depositTime,
                    referenceNumber: depositData.referenceNumber,
                    comments: depositData.comments,
                    // Estado inicial
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                yield firebase_1.db.collection('user_deposits').doc(deposit.id).set(deposit);
                loggerService_1.logger.info('Depósito creado exitosamente', { metadata: { depositId: deposit.id, userId } });
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
     * Obtener depósitos del usuario
     */
    getUserDeposits(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Obteniendo depósitos del usuario', { metadata: { userId } });
                const depositsSnapshot = yield firebase_1.db.collection('user_deposits')
                    .where('userId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get();
                return depositsSnapshot.docs.map(doc => doc.data());
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo depósitos del usuario', error, {
                    metadata: { userId }
                });
                throw new Error('Error obteniendo depósitos del usuario');
            }
        });
    }
    /**
     * Verificar depósito (admin) - MEJORADO
     */
    verifyDeposit(depositId, adminId, approved, notes, verificationData) {
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
                // Validar datos de verificación si se aprueba
                if (approved && verificationData) {
                    if (!verificationData.bankDepositDate || !verificationData.referenceNumber) {
                        throw new Error('Para aprobar un depósito, debe proporcionar fecha del depósito y número de referencia');
                    }
                }
                const updateData = {
                    status: approved ? 'approved' : 'rejected',
                    verifiedBy: adminId,
                    verifiedAt: new Date().toISOString(),
                    notes,
                    updatedAt: new Date().toISOString()
                };
                // Si fue aprobado y se proporcionan datos de verificación, agregarlos
                if (approved && verificationData) {
                    updateData.verificationData = Object.assign(Object.assign({}, verificationData), { verifiedBy: adminId });
                }
                yield depositRef.update(updateData);
                // Si fue aprobado, actualizar balance del usuario
                if (approved) {
                    yield this.updateUserBalance(deposit.userId, deposit.amount, 'deposit');
                    loggerService_1.logger.info('Balance actualizado después de aprobar depósito', {
                        metadata: { userId: deposit.userId, amount: deposit.amount }
                    });
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
                // Verificar que el organizador tenga suficiente balance
                const organizerBalance = yield this.getUserBalance(paymentData.organizerId);
                if (organizerBalance.balance < paymentData.amount) {
                    throw new Error('Saldo insuficiente para realizar el pago');
                }
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
                // Validar monto mínimo de retiro
                const minWithdrawal = 500; // RD$ 500
                if (withdrawalData.amount < minWithdrawal) {
                    throw new Error(`El monto mínimo de retiro es RD$ ${minWithdrawal.toLocaleString()}`);
                }
                // Verificar que el usuario tenga suficiente balance
                const balance = yield this.getUserBalance(musicianId);
                if (balance.balance < withdrawalData.amount) {
                    throw new Error('Saldo insuficiente para el retiro');
                }
                // Verificar que la cuenta bancaria existe
                const bankAccountDoc = yield firebase_1.db.collection('bank_accounts').doc(withdrawalData.bankAccountId).get();
                if (!bankAccountDoc.exists) {
                    throw new Error('Cuenta bancaria no encontrada');
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
    /**
     * Obtener información detallada de un depósito
     */
    getDepositDetails(depositId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const depositDoc = yield firebase_1.db.collection('user_deposits').doc(depositId).get();
                if (!depositDoc.exists) {
                    return null;
                }
                return depositDoc.data();
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo detalles del depósito', error, {
                    metadata: { depositId }
                });
                throw new Error('Error obteniendo detalles del depósito');
            }
        });
    }
    /**
     * Verificar duplicados de voucher
     */
    checkVoucherDuplicates(voucherUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const depositsSnapshot = yield firebase_1.db.collection('user_deposits')
                    .where('voucherFile.url', '==', voucherUrl)
                    .get();
                return !depositsSnapshot.empty;
            }
            catch (error) {
                loggerService_1.logger.error('Error verificando duplicados de voucher', error);
                return false;
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
