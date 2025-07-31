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
exports.PaymentService = void 0;
const firebase_1 = require("../utils/firebase");
const loggerService_1 = require("./loggerService");
class PaymentService {
    constructor() {
        this.supportedCurrencies = ['EUR', 'USD', 'GBP'];
        this.defaultCurrency = 'EUR';
    }
    /**
     * Crear un método de pago
     */
    createPaymentMethod(userId, paymentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Creando método de pago', { userId, metadata: { paymentData } });
                // En producción, esto se integraría con Stripe/PayPal
                const paymentMethod = {
                    id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: paymentData.type,
                    last4: paymentData.last4,
                    brand: paymentData.brand,
                    expiryMonth: paymentData.expiryMonth,
                    expiryYear: paymentData.expiryYear,
                    isDefault: paymentData.isDefault || false,
                    userId
                };
                yield firebase_1.db.collection('paymentMethods').doc(paymentMethod.id).set(paymentMethod);
                // Si es el método por defecto, actualizar otros métodos
                if (paymentMethod.isDefault) {
                    yield this.setDefaultPaymentMethod(userId, paymentMethod.id);
                }
                loggerService_1.logger.info('Método de pago creado', { userId, metadata: { paymentMethodId: paymentMethod.id } });
                return paymentMethod;
            }
            catch (error) {
                loggerService_1.logger.error('Error creando método de pago', error, { userId });
                throw error;
            }
        });
    }
    /**
     * Obtener métodos de pago de un usuario
     */
    getPaymentMethods(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield firebase_1.db.collection('paymentMethods')
                    .where('userId', '==', userId)
                    .orderBy('isDefault', 'desc')
                    .get();
                const paymentMethods = [];
                snapshot.forEach((doc) => {
                    paymentMethods.push(Object.assign({ id: doc.id }, doc.data()));
                });
                return paymentMethods;
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo métodos de pago', error, { userId });
                throw error;
            }
        });
    }
    /**
     * Establecer método de pago por defecto
     */
    setDefaultPaymentMethod(userId, paymentMethodId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const batch = firebase_1.db.batch();
                // Remover default de otros métodos
                const snapshot = yield firebase_1.db.collection('paymentMethods')
                    .where('userId', '==', userId)
                    .where('isDefault', '==', true)
                    .get();
                snapshot.forEach((doc) => {
                    batch.update(doc.ref, { isDefault: false });
                });
                // Establecer nuevo método por defecto
                batch.update(firebase_1.db.collection('paymentMethods').doc(paymentMethodId), { isDefault: true });
                yield batch.commit();
                loggerService_1.logger.info('Método de pago por defecto actualizado', { userId, metadata: { paymentMethodId } });
            }
            catch (error) {
                loggerService_1.logger.error('Error estableciendo método por defecto', error, { userId, metadata: { paymentMethodId } });
                throw error;
            }
        });
    }
    /**
     * Crear intento de pago
     */
    createPaymentIntent(userId_1, amount_1) {
        return __awaiter(this, arguments, void 0, function* (userId, amount, currency = 'EUR', description, metadata = {}) {
            try {
                loggerService_1.logger.info('Creando intento de pago', { userId, metadata: { amount, currency, description } });
                const paymentIntent = {
                    id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    amount,
                    currency: this.supportedCurrencies.includes(currency) ? currency : this.defaultCurrency,
                    status: 'pending',
                    paymentMethodId: '',
                    userId,
                    description,
                    metadata,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                yield firebase_1.db.collection('paymentIntents').doc(paymentIntent.id).set(paymentIntent);
                loggerService_1.logger.info('Intento de pago creado', { userId, metadata: { paymentIntentId: paymentIntent.id } });
                return paymentIntent;
            }
            catch (error) {
                loggerService_1.logger.error('Error creando intento de pago', error, { userId, metadata: { amount } });
                throw error;
            }
        });
    }
    /**
     * Procesar pago
     */
    processPayment(paymentIntentId, paymentMethodId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Procesando pago', { metadata: { paymentIntentId, paymentMethodId } });
                // Simular procesamiento de pago
                const success = Math.random() > 0.1; // 90% de éxito
                const paymentIntentRef = firebase_1.db.collection('paymentIntents').doc(paymentIntentId);
                const paymentIntentDoc = yield paymentIntentRef.get();
                if (!paymentIntentDoc.exists) {
                    throw new Error('Payment intent no encontrado');
                }
                const paymentIntent = paymentIntentDoc.data();
                if (success) {
                    // Pago exitoso
                    yield paymentIntentRef.update({
                        status: 'succeeded',
                        paymentMethodId,
                        updatedAt: new Date()
                    });
                    // Crear factura automáticamente
                    yield this.createInvoiceFromPayment(Object.assign(Object.assign({}, paymentIntent), { status: 'succeeded', paymentMethodId }));
                    loggerService_1.logger.info('Pago procesado exitosamente', {
                        metadata: {
                            paymentIntentId,
                            amount: paymentIntent.amount,
                            currency: paymentIntent.currency
                        }
                    });
                }
                else {
                    // Pago fallido
                    yield paymentIntentRef.update({
                        status: 'failed',
                        paymentMethodId,
                        updatedAt: new Date()
                    });
                    loggerService_1.logger.info('Pago fallido', { metadata: { paymentIntentId } });
                }
                return Object.assign(Object.assign({}, paymentIntent), { status: success ? 'succeeded' : 'failed', paymentMethodId, updatedAt: new Date() });
            }
            catch (error) {
                loggerService_1.logger.error('Error procesando pago', error, { metadata: { paymentIntentId } });
                throw error;
            }
        });
    }
    /**
     * Crear factura desde un pago
     */
    createInvoiceFromPayment(paymentIntent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const invoice = {
                    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    number: `INV-${Date.now()}`,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    status: 'paid',
                    dueDate: new Date(),
                    paidAt: new Date(),
                    userId: paymentIntent.userId,
                    eventId: paymentIntent.eventId,
                    items: [{
                            id: `item_${Date.now()}`,
                            description: paymentIntent.description,
                            quantity: 1,
                            unitPrice: paymentIntent.amount,
                            total: paymentIntent.amount,
                            type: 'service'
                        }],
                    subtotal: paymentIntent.amount,
                    tax: 0,
                    total: paymentIntent.amount,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                yield firebase_1.db.collection('invoices').doc(invoice.id).set(invoice);
                loggerService_1.logger.info('Factura creada desde pago', {
                    metadata: {
                        invoiceId: invoice.id,
                        paymentIntentId: paymentIntent.id
                    }
                });
                return invoice;
            }
            catch (error) {
                loggerService_1.logger.error('Error creando factura desde pago', error, { metadata: { paymentIntent } });
                throw error;
            }
        });
    }
    /**
     * Crear factura manual
     */
    createInvoice(userId, items, dueDate, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Creando factura manual', { userId, metadata: { items, dueDate } });
                const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
                const tax = subtotal * 0.16; // 16% IVA
                const total = subtotal + tax;
                const invoice = {
                    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    number: `INV-${Date.now()}`,
                    amount: total,
                    currency: this.defaultCurrency,
                    status: 'draft',
                    dueDate,
                    userId,
                    eventId,
                    items: items.map((item, index) => (Object.assign(Object.assign({ id: `item_${Date.now()}_${index}` }, item), { total: item.quantity * item.unitPrice }))),
                    subtotal,
                    tax,
                    total,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                yield firebase_1.db.collection('invoices').doc(invoice.id).set(invoice);
                loggerService_1.logger.info('Factura manual creada', { userId, metadata: { invoiceId: invoice.id } });
                return invoice;
            }
            catch (error) {
                loggerService_1.logger.error('Error creando factura manual', error, { userId });
                throw error;
            }
        });
    }
    /**
     * Obtener facturas de un usuario
     */
    getInvoices(userId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let query = firebase_1.db.collection('invoices').where('userId', '==', userId);
                if (status) {
                    query = query.where('status', '==', status);
                }
                const snapshot = yield query.orderBy('createdAt', 'desc').get();
                const invoices = [];
                snapshot.forEach((doc) => {
                    invoices.push(Object.assign({ id: doc.id }, doc.data()));
                });
                return invoices;
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo facturas', error, { userId });
                throw error;
            }
        });
    }
    /**
     * Marcar factura como pagada
     */
    markInvoiceAsPaid(invoiceId, paymentMethodId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Marcando factura como pagada', { metadata: { invoiceId, paymentMethodId } });
                const invoiceRef = firebase_1.db.collection('invoices').doc(invoiceId);
                const invoiceDoc = yield invoiceRef.get();
                if (!invoiceDoc.exists) {
                    throw new Error('Factura no encontrada');
                }
                const invoice = invoiceDoc.data();
                // Crear payment intent para la factura
                const paymentIntent = yield this.createPaymentIntent(invoice.userId, invoice.total, invoice.currency, `Pago de factura ${invoice.number}`, { invoiceId });
                // Procesar el pago
                const result = yield this.processPayment(paymentIntent.id, paymentMethodId);
                if (result.status === 'succeeded') {
                    // Actualizar factura como pagada
                    yield invoiceRef.update({
                        status: 'paid',
                        paidAt: new Date(),
                        updatedAt: new Date()
                    });
                    loggerService_1.logger.info('Factura marcada como pagada', { metadata: { invoiceId } });
                }
                return Object.assign(Object.assign({}, invoice), { status: result.status === 'succeeded' ? 'paid' : 'sent', paidAt: result.status === 'succeeded' ? new Date() : undefined, updatedAt: new Date() });
            }
            catch (error) {
                loggerService_1.logger.error('Error marcando factura como pagada', error, { metadata: { invoiceId } });
                throw error;
            }
        });
    }
    /**
     * Procesar reembolso
     */
    processRefund(paymentIntentId, amount, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Procesando reembolso', { metadata: { paymentIntentId, amount, reason } });
                // Verificar que el payment intent existe y fue exitoso
                const paymentIntentDoc = yield firebase_1.db.collection('paymentIntents').doc(paymentIntentId).get();
                if (!paymentIntentDoc.exists) {
                    throw new Error('Payment intent no encontrado');
                }
                const paymentIntent = paymentIntentDoc.data();
                if (paymentIntent.status !== 'succeeded') {
                    throw new Error('Solo se pueden reembolsar pagos exitosos');
                }
                if (amount > paymentIntent.amount) {
                    throw new Error('El monto del reembolso no puede ser mayor al pago original');
                }
                // Simular procesamiento de reembolso
                const success = Math.random() > 0.05; // 95% de éxito
                const refund = {
                    id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    paymentIntentId,
                    amount,
                    reason,
                    status: success ? 'succeeded' : 'failed',
                    createdAt: new Date()
                };
                yield firebase_1.db.collection('refunds').doc(refund.id).set(refund);
                if (success) {
                    // Actualizar payment intent
                    yield firebase_1.db.collection('paymentIntents').doc(paymentIntentId).update({
                        status: 'cancelled',
                        updatedAt: new Date()
                    });
                }
                loggerService_1.logger.info('Reembolso procesado', { metadata: { refundId: refund.id, amount } });
                return refund;
            }
            catch (error) {
                loggerService_1.logger.error('Error procesando reembolso', error, { metadata: { paymentIntentId } });
                throw error;
            }
        });
    }
    /**
     * Obtener estadísticas de pagos
     */
    getPaymentStats(userId, period) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('Obteniendo estadísticas de pagos', { metadata: { userId, period } });
                const now = new Date();
                let startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Inicio del mes
                if (period === 'week') {
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                }
                else if (period === 'month') {
                    startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                }
                else if (period === 'year') {
                    startDate = new Date(now.getFullYear(), 0, 1);
                }
                // Estadísticas de payment intents
                let paymentQuery = firebase_1.db.collection('paymentIntents')
                    .where('createdAt', '>=', startDate);
                if (userId) {
                    paymentQuery = paymentQuery.where('userId', '==', userId);
                }
                const paymentSnapshot = yield paymentQuery.get();
                const payments = paymentSnapshot.docs.map(doc => doc.data());
                // Estadísticas de facturas
                let invoiceQuery = firebase_1.db.collection('invoices')
                    .where('createdAt', '>=', startDate);
                if (userId) {
                    invoiceQuery = invoiceQuery.where('userId', '==', userId);
                }
                const invoiceSnapshot = yield invoiceQuery.get();
                const invoices = invoiceSnapshot.docs.map(doc => doc.data());
                // Estadísticas de reembolsos
                let refundQuery = firebase_1.db.collection('refunds')
                    .where('createdAt', '>=', startDate);
                const refundSnapshot = yield refundQuery.get();
                const refunds = refundSnapshot.docs.map(doc => doc.data());
                const stats = {
                    totalRevenue: payments
                        .filter((p) => p.status === 'succeeded')
                        .reduce((sum, p) => sum + p.amount, 0),
                    totalTransactions: payments.length,
                    successfulTransactions: payments.filter((p) => p.status === 'succeeded').length,
                    failedTransactions: payments.filter((p) => p.status === 'failed').length,
                    totalInvoices: invoices.length,
                    paidInvoices: invoices.filter((i) => i.status === 'paid').length,
                    totalRefunds: refunds.length,
                    refundAmount: refunds
                        .filter((r) => r.status === 'succeeded')
                        .reduce((sum, r) => sum + r.amount, 0),
                    averageTransaction: payments.length > 0
                        ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length
                        : 0,
                    successRate: payments.length > 0
                        ? (payments.filter((p) => p.status === 'succeeded').length / payments.length) * 100
                        : 0
                };
                loggerService_1.logger.info('Estadísticas de pagos obtenidas', { metadata: { stats } });
                return stats;
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo estadísticas de pagos', error);
                throw error;
            }
        });
    }
    /**
     * Validar método de pago
     */
    validatePaymentMethod(paymentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validaciones básicas
                if (!paymentData.cardNumber || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvc) {
                    return false;
                }
                // Validar formato de tarjeta (Luhn algorithm)
                const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
                if (!/^\d{13,19}$/.test(cardNumber)) {
                    return false;
                }
                // Validar fecha de expiración
                const now = new Date();
                const expiryDate = new Date(paymentData.expiryYear, paymentData.expiryMonth - 1);
                if (expiryDate <= now) {
                    return false;
                }
                // Validar CVC
                if (!/^\d{3,4}$/.test(paymentData.cvc)) {
                    return false;
                }
                return true;
            }
            catch (error) {
                loggerService_1.logger.error('Error validando método de pago', error, { metadata: { paymentData } });
                return false;
            }
        });
    }
    /**
     * Obtener gateways de pago disponibles
     */
    getPaymentGateways() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gateways = [
                    {
                        name: 'Stripe',
                        isActive: true,
                        config: {
                            supportedCurrencies: ['USD', 'EUR', 'GBP'],
                            fees: { percentage: 2.9, fixed: 30 }
                        }
                    },
                    {
                        name: 'PayPal',
                        isActive: true,
                        config: {
                            supportedCurrencies: ['USD', 'EUR', 'GBP'],
                            fees: { percentage: 3.5, fixed: 0 }
                        }
                    },
                    {
                        name: 'MercadoPago',
                        isActive: false,
                        config: {
                            supportedCurrencies: ['USD', 'ARS', 'BRL'],
                            fees: { percentage: 3.5, fixed: 0 }
                        }
                    }
                ];
                return gateways.filter(gateway => gateway.isActive);
            }
            catch (error) {
                loggerService_1.logger.error('Error obteniendo pasarelas de pago', error);
                throw error;
            }
        });
    }
}
exports.PaymentService = PaymentService;
