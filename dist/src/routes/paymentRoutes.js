"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const requireRole_1 = require("../middleware/requireRole");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const paymentController_1 = require("../controllers/paymentController");
const paymentSystemController_1 = require("../controllers/paymentSystemController");
const dtos_1 = require("../utils/dtos");
const router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentMethod:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [card, bank_account, paypal]
 *         last4:
 *           type: string
 *         brand:
 *           type: string
 *         isDefault:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     PaymentIntent:
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
 *         status:
 *           type: string
 *           enum: [pending, processing, succeeded, failed, canceled]
 *         description:
 *           type: string
 *         metadata:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Invoice:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unitPrice:
 *                 type: number
 *               total:
 *                 type: number
 *         subtotal:
 *           type: number
 *         tax:
 *           type: number
 *         total:
 *           type: number
 *         status:
 *           type: string
 *           enum: [draft, sent, paid, overdue, canceled]
 *         dueDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Refund:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         paymentIntentId:
 *           type: string
 *         amount:
 *           type: number
 *         reason:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, succeeded, failed]
 *         createdAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/payments/methods:
 *   post:
 *     summary: Crear método de pago
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentMethodDTO'
 *     responses:
 *       201:
 *         description: Método de pago creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PaymentMethod'
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/methods', authMiddleware_1.authMiddleware, (0, validationMiddleware_1.validate)(dtos_1.createPaymentMethodDTO), paymentController_1.createPaymentMethodController);
/**
 * @swagger
 * /api/payments/methods:
 *   get:
 *     summary: Obtener métodos de pago del usuario
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métodos de pago obtenidos exitosamente
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
 *                     $ref: '#/components/schemas/PaymentMethod'
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 */
router.get('/methods', authMiddleware_1.authMiddleware, paymentController_1.getPaymentMethodsController);
/**
 * @swagger
 * /api/payments/methods/{paymentMethodId}/default:
 *   put:
 *     summary: Establecer método de pago por defecto
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentMethodId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del método de pago
 *     responses:
 *       200:
 *         description: Método de pago por defecto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Método de pago no encontrado
 */
router.put('/methods/:paymentMethodId/default', authMiddleware_1.authMiddleware, paymentController_1.setDefaultPaymentMethodController);
/**
 * @swagger
 * /api/payments/intents:
 *   post:
 *     summary: Crear intent de pago
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentIntentDTO'
 *     responses:
 *       201:
 *         description: Intent de pago creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PaymentIntent'
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/intents', authMiddleware_1.authMiddleware, (0, validationMiddleware_1.validate)(dtos_1.createPaymentIntentDTO), paymentController_1.createPaymentIntentController);
/**
 * @swagger
 * /api/payments/intents:
 *   get:
 *     summary: Obtener intents de pago del usuario
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Intents de pago obtenidos exitosamente
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
 *                     $ref: '#/components/schemas/PaymentIntent'
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 */
router.get('/intents', authMiddleware_1.authMiddleware, paymentController_1.getPaymentIntentsController);
/**
 * @swagger
 * /api/payments/process:
 *   post:
 *     summary: Procesar pago
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcessPaymentDTO'
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
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     transactionId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/process', authMiddleware_1.authMiddleware, (0, validationMiddleware_1.validate)(dtos_1.processPaymentDTO), paymentController_1.processPaymentController);
/**
 * @swagger
 * /api/payments/invoices:
 *   post:
 *     summary: Crear factura
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInvoiceDTO'
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/invoices', authMiddleware_1.authMiddleware, (0, validationMiddleware_1.validate)(dtos_1.createInvoiceDTO), paymentController_1.createInvoiceController);
/**
 * @swagger
 * /api/payments/invoices:
 *   get:
 *     summary: Obtener facturas del usuario
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, sent, paid, overdue, canceled]
 *         description: Filtrar por estado
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de resultados por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de resultados a omitir
 *     responses:
 *       200:
 *         description: Facturas obtenidas exitosamente
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
 *                     $ref: '#/components/schemas/Invoice'
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 */
router.get('/invoices', authMiddleware_1.authMiddleware, paymentController_1.getInvoicesController);
/**
 * @swagger
 * /api/payments/invoices/{invoiceId}/pay:
 *   post:
 *     summary: Marcar factura como pagada
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethodId
 *             properties:
 *               paymentMethodId:
 *                 type: string
 *                 description: ID del método de pago a usar
 *     responses:
 *       200:
 *         description: Factura marcada como pagada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PaymentIntent'
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Factura no encontrada
 */
router.post('/invoices/:invoiceId/pay', authMiddleware_1.authMiddleware, paymentController_1.markInvoiceAsPaidController);
/**
 * @swagger
 * /api/payments/refunds:
 *   post:
 *     summary: Procesar reembolso
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcessRefundDTO'
 *     responses:
 *       200:
 *         description: Reembolso procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Refund'
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/refunds', authMiddleware_1.authMiddleware, (0, validationMiddleware_1.validate)(dtos_1.processRefundDTO), paymentController_1.processRefundController);
/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     summary: Obtener estadísticas de pagos (solo admin)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *         description: Agrupación de estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas de pagos obtenidas exitosamente
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
 *                     totalRevenue:
 *                       type: number
 *                     totalTransactions:
 *                       type: number
 *                     averageTransaction:
 *                       type: number
 *                     successRate:
 *                       type: number
 *                     trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           revenue:
 *                             type: number
 *                           transactions:
 *                             type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/stats', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['admin', 'superadmin']), paymentController_1.getPaymentStatsController);
/**
 * @swagger
 * /api/payments/validate:
 *   post:
 *     summary: Validar método de pago
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidatePaymentMethodDTO'
 *     responses:
 *       200:
 *         description: Validación completada
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
 *                     isValid:
 *                       type: boolean
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 */
router.post('/validate', (0, validationMiddleware_1.validate)(dtos_1.validatePaymentMethodDTO), paymentController_1.validatePaymentMethodController);
/**
 * @swagger
 * /api/payments/gateways:
 *   get:
 *     summary: Obtener gateways de pago disponibles
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Gateways de pago obtenidos exitosamente
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       supportedCurrencies:
 *                         type: array
 *                         items:
 *                           type: string
 *                       fees:
 *                         type: object
 *                       isActive:
 *                         type: boolean
 *                 message:
 *                   type: string
 */
router.get('/gateways', paymentController_1.getPaymentGatewaysController);
/**
 * @swagger
 * /payments/voucher/{depositId}/presigned-url:
 *   get:
 *     summary: Obtener URL firmada para acceder a un comprobante de pago
 *     description: Genera una URL firmada temporal para acceder a un comprobante sin problemas de CORS
 *     tags: [Payments]
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
