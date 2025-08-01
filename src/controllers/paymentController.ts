import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { PaymentService } from '../services/paymentService';
import { logger } from '../services/loggerService';

const paymentService = new PaymentService();

// Crear método de pago
export const createPaymentMethodController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const { type, cardNumber, expiryMonth, expiryYear, cvc, billingAddress } =
      req.body;

    logger.info('Creating payment method', { userId, metadata: { type } });

    const paymentMethod = await paymentService.createPaymentMethod(userId, {
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
  }
);

// Obtener métodos de pago del usuario
export const getPaymentMethodsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user!;

    logger.info('Getting payment methods', { userId });

    const paymentMethods = await paymentService.getPaymentMethods(userId);

    res.status(200).json({
      success: true,
      data: paymentMethods,
      message: 'Métodos de pago obtenidos exitosamente',
    });
  }
);

// Establecer método de pago por defecto
export const setDefaultPaymentMethodController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const { paymentMethodId } = req.params;

    logger.info('Setting default payment method', {
      userId,
      metadata: { paymentMethodId },
    });

    await paymentService.setDefaultPaymentMethod(userId, paymentMethodId);

    res.status(200).json({
      success: true,
      message: 'Método de pago por defecto actualizado exitosamente',
    });
  }
);

// Crear intent de pago
export const createPaymentIntentController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const { amount, currency, description, metadata } = req.body;

    logger.info('Creating payment intent', {
      userId,
      metadata: { amount, currency },
    });

    const paymentIntent = await paymentService.createPaymentIntent(
      userId,
      amount,
      currency,
      description,
      metadata
    );

    res.status(201).json({
      success: true,
      data: paymentIntent,
      message: 'Intent de pago creado exitosamente',
    });
  }
);

// Procesar pago
export const processPaymentController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const { paymentIntentId, paymentMethodId } = req.body;

    logger.info('Processing payment', {
      userId,
      metadata: { paymentIntentId, paymentMethodId },
    });

    const result = await paymentService.processPayment(
      paymentIntentId,
      paymentMethodId
    );

    res.status(200).json({
      success: true,
      data: result,
      message:
        result.status === 'succeeded'
          ? 'Pago procesado exitosamente'
          : 'Error al procesar el pago',
    });
  }
);

// Crear factura
export const createInvoiceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const { items, dueDate, eventId } = req.body;

    logger.info('Creating invoice', {
      userId,
      metadata: { itemsCount: items.length },
    });

    const invoice = await paymentService.createInvoice(
      userId,
      items,
      new Date(dueDate),
      eventId
    );

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Factura creada exitosamente',
    });
  }
);

// Obtener facturas del usuario
export const getInvoicesController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const { status } = req.query;

    logger.info('Getting invoices', {
      userId,
      metadata: { status: status as string },
    });

    const invoices = await paymentService.getInvoices(userId, status as string);

    res.status(200).json({
      success: true,
      data: invoices,
      message: 'Facturas obtenidas exitosamente',
    });
  }
);

// Marcar factura como pagada
export const markInvoiceAsPaidController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const { invoiceId } = req.params;
    const { paymentMethodId } = req.body;

    logger.info('Marking invoice as paid', {
      userId,
      metadata: { invoiceId, paymentMethodId },
    });

    const result = await paymentService.markInvoiceAsPaid(
      invoiceId,
      paymentMethodId
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Factura marcada como pagada exitosamente',
    });
  }
);

// Procesar reembolso
export const processRefundController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const { paymentIntentId, amount, reason } = req.body;

    logger.info('Processing refund', {
      userId,
      metadata: { paymentIntentId, amount, reason },
    });

    const refund = await paymentService.processRefund(
      paymentIntentId,
      amount,
      reason
    );

    res.status(200).json({
      success: true,
      data: refund,
      message: 'Reembolso procesado exitosamente',
    });
  }
);

// Obtener estadísticas de pagos (solo admin)
export const getPaymentStatsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, period } = req.query;

    logger.info('Getting payment stats', {
      userId: typeof userId === 'string' ? userId : undefined,
      metadata: { period: typeof period === 'string' ? period : undefined },
    });

    const stats = await paymentService.getPaymentStats(
      typeof userId === 'string' ? userId : undefined,
      typeof period === 'string' ? period : undefined
    );

    res.status(200).json({
      success: true,
      data: stats,
      message: 'Estadísticas de pagos obtenidas exitosamente',
    });
  }
);

// Validar método de pago
export const validatePaymentMethodController = asyncHandler(
  async (req: Request, res: Response) => {
    const { cardNumber, expiryMonth, expiryYear, cvc } = req.body;

    logger.info('Validating payment method');

    const validation = await paymentService.validatePaymentMethod({
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
  }
);

// Obtener gateways de pago disponibles
export const getPaymentGatewaysController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.info('Getting payment gateways');

    const gateways = await paymentService.getPaymentGateways();

    res.status(200).json({
      success: true,
      data: gateways,
      message: 'Gateways de pago obtenidos exitosamente',
    });
  }
);
