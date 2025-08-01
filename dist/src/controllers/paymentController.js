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
exports.getPaymentGatewaysController = exports.validatePaymentMethodController = exports.getPaymentStatsController = exports.processRefundController = exports.markInvoiceAsPaidController = exports.getInvoicesController = exports.createInvoiceController = exports.processPaymentController = exports.createPaymentIntentController = exports.setDefaultPaymentMethodController = exports.getPaymentMethodsController = exports.createPaymentMethodController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const paymentService_1 = require("../services/paymentService");
const loggerService_1 = require("../services/loggerService");
const paymentService = new paymentService_1.PaymentService();
// Crear método de pago
exports.createPaymentMethodController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { type, cardNumber, expiryMonth, expiryYear, cvc, billingAddress } = req.body;
    loggerService_1.logger.info('Creating payment method', { userId, metadata: { type } });
    const paymentMethod = yield paymentService.createPaymentMethod(userId, {
        type,
        cardNumber,
        expiryMonth,
        expiryYear,
        cvc,
        billingAddress,
    });
    res.status(201).json({
        success: true,
        data: paymentMethod,
        message: 'Método de pago creado exitosamente',
    });
}));
// Obtener métodos de pago del usuario
exports.getPaymentMethodsController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    loggerService_1.logger.info('Getting payment methods', { userId });
    const paymentMethods = yield paymentService.getPaymentMethods(userId);
    res.status(200).json({
        success: true,
        data: paymentMethods,
        message: 'Métodos de pago obtenidos exitosamente',
    });
}));
// Establecer método de pago por defecto
exports.setDefaultPaymentMethodController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { paymentMethodId } = req.params;
    loggerService_1.logger.info('Setting default payment method', {
        userId,
        metadata: { paymentMethodId },
    });
    yield paymentService.setDefaultPaymentMethod(userId, paymentMethodId);
    res.status(200).json({
        success: true,
        message: 'Método de pago por defecto actualizado exitosamente',
    });
}));
// Crear intent de pago
exports.createPaymentIntentController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { amount, currency, description, metadata } = req.body;
    loggerService_1.logger.info('Creating payment intent', {
        userId,
        metadata: { amount, currency },
    });
    const paymentIntent = yield paymentService.createPaymentIntent(userId, amount, currency, description, metadata);
    res.status(201).json({
        success: true,
        data: paymentIntent,
        message: 'Intent de pago creado exitosamente',
    });
}));
// Procesar pago
exports.processPaymentController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { paymentIntentId, paymentMethodId } = req.body;
    loggerService_1.logger.info('Processing payment', {
        userId,
        metadata: { paymentIntentId, paymentMethodId },
    });
    const result = yield paymentService.processPayment(paymentIntentId, paymentMethodId);
    res.status(200).json({
        success: true,
        data: result,
        message: result.status === 'succeeded'
            ? 'Pago procesado exitosamente'
            : 'Error al procesar el pago',
    });
}));
// Crear factura
exports.createInvoiceController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { items, dueDate, eventId } = req.body;
    loggerService_1.logger.info('Creating invoice', {
        userId,
        metadata: { itemsCount: items.length },
    });
    const invoice = yield paymentService.createInvoice(userId, items, new Date(dueDate), eventId);
    res.status(201).json({
        success: true,
        data: invoice,
        message: 'Factura creada exitosamente',
    });
}));
// Obtener facturas del usuario
exports.getInvoicesController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { status } = req.query;
    loggerService_1.logger.info('Getting invoices', {
        userId,
        metadata: { status: status },
    });
    const invoices = yield paymentService.getInvoices(userId, status);
    res.status(200).json({
        success: true,
        data: invoices,
        message: 'Facturas obtenidas exitosamente',
    });
}));
// Marcar factura como pagada
exports.markInvoiceAsPaidController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { invoiceId } = req.params;
    const { paymentMethodId } = req.body;
    loggerService_1.logger.info('Marking invoice as paid', {
        userId,
        metadata: { invoiceId, paymentMethodId },
    });
    const result = yield paymentService.markInvoiceAsPaid(invoiceId, paymentMethodId);
    res.status(200).json({
        success: true,
        data: result,
        message: 'Factura marcada como pagada exitosamente',
    });
}));
// Procesar reembolso
exports.processRefundController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { paymentIntentId, amount, reason } = req.body;
    loggerService_1.logger.info('Processing refund', {
        userId,
        metadata: { paymentIntentId, amount, reason },
    });
    const refund = yield paymentService.processRefund(paymentIntentId, amount, reason);
    res.status(200).json({
        success: true,
        data: refund,
        message: 'Reembolso procesado exitosamente',
    });
}));
// Obtener estadísticas de pagos (solo admin)
exports.getPaymentStatsController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, period } = req.query;
    loggerService_1.logger.info('Getting payment stats', {
        userId: typeof userId === 'string' ? userId : undefined,
        metadata: { period: typeof period === 'string' ? period : undefined },
    });
    const stats = yield paymentService.getPaymentStats(typeof userId === 'string' ? userId : undefined, typeof period === 'string' ? period : undefined);
    res.status(200).json({
        success: true,
        data: stats,
        message: 'Estadísticas de pagos obtenidas exitosamente',
    });
}));
// Validar método de pago
exports.validatePaymentMethodController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cardNumber, expiryMonth, expiryYear, cvc } = req.body;
    loggerService_1.logger.info('Validating payment method');
    const validation = yield paymentService.validatePaymentMethod({
        cardNumber,
        expiryMonth,
        expiryYear,
        cvc,
    });
    res.status(200).json({
        success: true,
        data: { isValid: validation },
        message: validation ? 'Método de pago válido' : 'Método de pago inválido',
    });
}));
// Obtener gateways de pago disponibles
exports.getPaymentGatewaysController = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    loggerService_1.logger.info('Getting payment gateways');
    const gateways = yield paymentService.getPaymentGateways();
    res.status(200).json({
        success: true,
        data: gateways,
        message: 'Gateways de pago obtenidos exitosamente',
    });
}));
