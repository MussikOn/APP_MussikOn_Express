import { db } from '../utils/firebase';
import { logger } from './loggerService';
import { FieldValue } from 'firebase-admin/firestore';

// Interfaces para el sistema de pagos
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'paypal' | 'stripe';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  userId: string;
}

export interface PaymentIntent {
  id: string;
  amount: number; // en centavos
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  paymentMethodId: string;
  userId: string;
  eventId?: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  userId: string;
  eventId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'service' | 'product' | 'fee';
}

export interface PaymentGateway {
  name: string;
  isActive: boolean;
  config: Record<string, any>;
}

export interface Refund {
  id: string;
  paymentIntentId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'succeeded' | 'failed';
  createdAt: Date;
}

export class PaymentService {
  private readonly supportedCurrencies = ['EUR', 'USD', 'GBP'];
  private readonly defaultCurrency = 'EUR';

  /**
   * Crear un método de pago
   */
  async createPaymentMethod(
    userId: string,
    paymentData: any
  ): Promise<PaymentMethod> {
    try {
      logger.info('Creando método de pago', {
        userId,
        metadata: { paymentData },
      });

      // En producción, esto se integraría con Stripe/PayPal
      const paymentMethod: PaymentMethod = {
        id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: paymentData.type,
        last4: paymentData.last4,
        brand: paymentData.brand,
        expiryMonth: paymentData.expiryMonth,
        expiryYear: paymentData.expiryYear,
        isDefault: paymentData.isDefault || false,
        userId,
      };

      await db
        .collection('paymentMethods')
        .doc(paymentMethod.id)
        .set(paymentMethod);

      // Si es el método por defecto, actualizar otros métodos
      if (paymentMethod.isDefault) {
        await this.setDefaultPaymentMethod(userId, paymentMethod.id);
      }

      logger.info('Método de pago creado', {
        userId,
        metadata: { paymentMethodId: paymentMethod.id },
      });

      return paymentMethod;
    } catch (error) {
      logger.error('Error creando método de pago', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Obtener métodos de pago de un usuario
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const snapshot = await db
        .collection('paymentMethods')
        .where('userId', '==', userId)
        .orderBy('isDefault', 'desc')
        .get();

      const paymentMethods: PaymentMethod[] = [];
      snapshot.forEach((doc: any) => {
        paymentMethods.push({ id: doc.id, ...doc.data() });
      });

      return paymentMethods;
    } catch (error) {
      logger.error('Error obteniendo métodos de pago', error as Error, {
        userId,
      });
      throw error;
    }
  }

  /**
   * Establecer método de pago por defecto
   */
  async setDefaultPaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<void> {
    try {
      const batch = db.batch();

      // Remover default de otros métodos
      const snapshot = await db
        .collection('paymentMethods')
        .where('userId', '==', userId)
        .where('isDefault', '==', true)
        .get();

      snapshot.forEach((doc: any) => {
        batch.update(doc.ref, { isDefault: false });
      });

      // Establecer nuevo método por defecto
      batch.update(db.collection('paymentMethods').doc(paymentMethodId), {
        isDefault: true,
      });

      await batch.commit();

      logger.info('Método de pago por defecto actualizado', {
        userId,
        metadata: { paymentMethodId },
      });
    } catch (error) {
      logger.error('Error estableciendo método por defecto', error as Error, {
        userId,
        metadata: { paymentMethodId },
      });
      throw error;
    }
  }

  /**
   * Crear intento de pago
   */
  async createPaymentIntent(
    userId: string,
    amount: number,
    currency: string = 'EUR',
    description: string,
    metadata: Record<string, any> = {}
  ): Promise<PaymentIntent> {
    try {
      logger.info('Creando intento de pago', {
        userId,
        metadata: { amount, currency, description },
      });

      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        currency: this.supportedCurrencies.includes(currency)
          ? currency
          : this.defaultCurrency,
        status: 'pending',
        paymentMethodId: '',
        userId,
        description,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db
        .collection('paymentIntents')
        .doc(paymentIntent.id)
        .set(paymentIntent);

      logger.info('Intento de pago creado', {
        userId,
        metadata: { paymentIntentId: paymentIntent.id },
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Error creando intento de pago', error as Error, {
        userId,
        metadata: { amount },
      });
      throw error;
    }
  }

  /**
   * Procesar pago
   */
  async processPayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<PaymentIntent> {
    try {
      logger.info('Procesando pago', {
        metadata: { paymentIntentId, paymentMethodId },
      });

      // Simular procesamiento de pago
      const success = Math.random() > 0.1; // 90% de éxito

      const paymentIntentRef = db
        .collection('paymentIntents')
        .doc(paymentIntentId);
      const paymentIntentDoc = await paymentIntentRef.get();

      if (!paymentIntentDoc.exists) {
        throw new Error('Payment intent no encontrado');
      }

      const paymentIntent = paymentIntentDoc.data() as PaymentIntent;

      if (success) {
        // Pago exitoso
        await paymentIntentRef.update({
          status: 'succeeded',
          paymentMethodId,
          updatedAt: new Date(),
        });

        // Crear factura automáticamente
        await this.createInvoiceFromPayment({
          ...paymentIntent,
          status: 'succeeded',
          paymentMethodId,
        });

        logger.info('Pago procesado exitosamente', {
          metadata: {
            paymentIntentId,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
          },
        });
      } else {
        // Pago fallido
        await paymentIntentRef.update({
          status: 'failed',
          paymentMethodId,
          updatedAt: new Date(),
        });

        logger.info('Pago fallido', { metadata: { paymentIntentId } });
      }

      return {
        ...paymentIntent,
        status: success ? 'succeeded' : 'failed',
        paymentMethodId,
        updatedAt: new Date(),
      };
    } catch (error) {
      logger.error('Error procesando pago', error as Error, {
        metadata: { paymentIntentId },
      });
      throw error;
    }
  }

  /**
   * Crear factura desde un pago
   */
  async createInvoiceFromPayment(
    paymentIntent: PaymentIntent
  ): Promise<Invoice> {
    try {
      const invoice: Invoice = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        number: `INV-${Date.now()}`,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'paid',
        dueDate: new Date(),
        paidAt: new Date(),
        userId: paymentIntent.userId,
        eventId: paymentIntent.eventId,
        items: [
          {
            id: `item_${Date.now()}`,
            description: paymentIntent.description,
            quantity: 1,
            unitPrice: paymentIntent.amount,
            total: paymentIntent.amount,
            type: 'service',
          },
        ],
        subtotal: paymentIntent.amount,
        tax: 0,
        total: paymentIntent.amount,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection('invoices').doc(invoice.id).set(invoice);

      logger.info('Factura creada desde pago', {
        metadata: {
          invoiceId: invoice.id,
          paymentIntentId: paymentIntent.id,
        },
      });

      return invoice;
    } catch (error) {
      logger.error('Error creando factura desde pago', error as Error, {
        metadata: { paymentIntent },
      });
      throw error;
    }
  }

  /**
   * Crear factura manual
   */
  async createInvoice(
    userId: string,
    items: Omit<InvoiceItem, 'id'>[],
    dueDate: Date,
    eventId?: string
  ): Promise<Invoice> {
    try {
      logger.info('Creando factura manual', {
        userId,
        metadata: { items, dueDate },
      });

      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const tax = subtotal * 0.16; // 16% IVA
      const total = subtotal + tax;

      const invoice: Invoice = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        number: `INV-${Date.now()}`,
        amount: total,
        currency: this.defaultCurrency,
        status: 'draft',
        dueDate,
        userId,
        eventId,
        items: items.map((item, index) => ({
          id: `item_${Date.now()}_${index}`,
          ...item,
          total: item.quantity * item.unitPrice,
        })),
        subtotal,
        tax,
        total,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection('invoices').doc(invoice.id).set(invoice);

      logger.info('Factura manual creada', {
        userId,
        metadata: { invoiceId: invoice.id },
      });

      return invoice;
    } catch (error) {
      logger.error('Error creando factura manual', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Obtener facturas de un usuario
   */
  async getInvoices(userId: string, status?: string): Promise<Invoice[]> {
    try {
      let query = db.collection('invoices').where('userId', '==', userId);

      if (status) {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.orderBy('createdAt', 'desc').get();

      const invoices: Invoice[] = [];
      snapshot.forEach((doc: any) => {
        invoices.push({ id: doc.id, ...doc.data() });
      });

      return invoices;
    } catch (error) {
      logger.error('Error obteniendo facturas', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Marcar factura como pagada
   */
  async markInvoiceAsPaid(
    invoiceId: string,
    paymentMethodId: string
  ): Promise<Invoice> {
    try {
      logger.info('Marcando factura como pagada', {
        metadata: { invoiceId, paymentMethodId },
      });

      const invoiceRef = db.collection('invoices').doc(invoiceId);
      const invoiceDoc = await invoiceRef.get();

      if (!invoiceDoc.exists) {
        throw new Error('Factura no encontrada');
      }

      const invoice = invoiceDoc.data() as Invoice;

      // Crear payment intent para la factura
      const paymentIntent = await this.createPaymentIntent(
        invoice.userId,
        invoice.total,
        invoice.currency,
        `Pago de factura ${invoice.number}`,
        { invoiceId }
      );

      // Procesar el pago
      const result = await this.processPayment(
        paymentIntent.id,
        paymentMethodId
      );

      if (result.status === 'succeeded') {
        // Actualizar factura como pagada
        await invoiceRef.update({
          status: 'paid',
          paidAt: new Date(),
          updatedAt: new Date(),
        });

        logger.info('Factura marcada como pagada', { metadata: { invoiceId } });
      }

      return {
        ...invoice,
        status: result.status === 'succeeded' ? 'paid' : 'sent',
        paidAt: result.status === 'succeeded' ? new Date() : undefined,
        updatedAt: new Date(),
      };
    } catch (error) {
      logger.error('Error marcando factura como pagada', error as Error, {
        metadata: { invoiceId },
      });
      throw error;
    }
  }

  /**
   * Procesar reembolso
   */
  async processRefund(
    paymentIntentId: string,
    amount: number,
    reason: string
  ): Promise<Refund> {
    try {
      logger.info('Procesando reembolso', {
        metadata: { paymentIntentId, amount, reason },
      });

      // Verificar que el payment intent existe y fue exitoso
      const paymentIntentDoc = await db
        .collection('paymentIntents')
        .doc(paymentIntentId)
        .get();

      if (!paymentIntentDoc.exists) {
        throw new Error('Payment intent no encontrado');
      }

      const paymentIntent = paymentIntentDoc.data() as PaymentIntent;

      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Solo se pueden reembolsar pagos exitosos');
      }

      if (amount > paymentIntent.amount) {
        throw new Error(
          'El monto del reembolso no puede ser mayor al pago original'
        );
      }

      // Simular procesamiento de reembolso
      const success = Math.random() > 0.05; // 95% de éxito

      const refund: Refund = {
        id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentIntentId,
        amount,
        reason,
        status: success ? 'succeeded' : 'failed',
        createdAt: new Date(),
      };

      await db.collection('refunds').doc(refund.id).set(refund);

      if (success) {
        // Actualizar payment intent
        await db.collection('paymentIntents').doc(paymentIntentId).update({
          status: 'cancelled',
          updatedAt: new Date(),
        });
      }

      logger.info('Reembolso procesado', {
        metadata: { refundId: refund.id, amount },
      });

      return refund;
    } catch (error) {
      logger.error('Error procesando reembolso', error as Error, {
        metadata: { paymentIntentId },
      });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de pagos
   */
  async getPaymentStats(userId?: string, period?: string): Promise<any> {
    try {
      logger.info('Obteniendo estadísticas de pagos', {
        metadata: { userId, period },
      });

      const now = new Date();
      let startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Inicio del mes

      if (period === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === 'month') {
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
      } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      // Estadísticas de payment intents
      let paymentQuery = db
        .collection('paymentIntents')
        .where('createdAt', '>=', startDate);

      if (userId) {
        paymentQuery = paymentQuery.where('userId', '==', userId);
      }

      const paymentSnapshot = await paymentQuery.get();
      const payments = paymentSnapshot.docs.map(doc => doc.data());

      // Estadísticas de facturas
      let invoiceQuery = db
        .collection('invoices')
        .where('createdAt', '>=', startDate);

      if (userId) {
        invoiceQuery = invoiceQuery.where('userId', '==', userId);
      }

      const invoiceSnapshot = await invoiceQuery.get();
      const invoices = invoiceSnapshot.docs.map(doc => doc.data());

      // Estadísticas de reembolsos
      const refundQuery = db
        .collection('refunds')
        .where('createdAt', '>=', startDate);

      const refundSnapshot = await refundQuery.get();
      const refunds = refundSnapshot.docs.map(doc => doc.data());

      const stats = {
        totalRevenue: payments
          .filter((p: any) => p.status === 'succeeded')
          .reduce((sum: number, p: any) => sum + p.amount, 0),
        totalTransactions: payments.length,
        successfulTransactions: payments.filter(
          (p: any) => p.status === 'succeeded'
        ).length,
        failedTransactions: payments.filter((p: any) => p.status === 'failed')
          .length,
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter((i: any) => i.status === 'paid').length,
        totalRefunds: refunds.length,
        refundAmount: refunds
          .filter((r: any) => r.status === 'succeeded')
          .reduce((sum: number, r: any) => sum + r.amount, 0),
        averageTransaction:
          payments.length > 0
            ? payments.reduce((sum: number, p: any) => sum + p.amount, 0) /
              payments.length
            : 0,
        successRate:
          payments.length > 0
            ? (payments.filter((p: any) => p.status === 'succeeded').length /
                payments.length) *
              100
            : 0,
      };

      logger.info('Estadísticas de pagos obtenidas', { metadata: { stats } });

      return stats;
    } catch (error) {
      logger.error('Error obteniendo estadísticas de pagos', error as Error);
      throw error;
    }
  }

  /**
   * Validar método de pago
   */
  async validatePaymentMethod(paymentData: any): Promise<boolean> {
    try {
      // Validaciones básicas
      if (
        !paymentData.cardNumber ||
        !paymentData.expiryMonth ||
        !paymentData.expiryYear ||
        !paymentData.cvc
      ) {
        return false;
      }

      // Validar formato de tarjeta (Luhn algorithm)
      const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
      if (!/^\d{13,19}$/.test(cardNumber)) {
        return false;
      }

      // Validar fecha de expiración
      const now = new Date();
      const expiryDate = new Date(
        paymentData.expiryYear,
        paymentData.expiryMonth - 1
      );
      if (expiryDate <= now) {
        return false;
      }

      // Validar CVC
      if (!/^\d{3,4}$/.test(paymentData.cvc)) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error validando método de pago', error as Error, {
        metadata: { paymentData },
      });
      return false;
    }
  }

  /**
   * Obtener gateways de pago disponibles
   */
  async getPaymentGateways(): Promise<PaymentGateway[]> {
    try {
      const gateways: PaymentGateway[] = [
        {
          name: 'Stripe',
          isActive: true,
          config: {
            supportedCurrencies: ['USD', 'EUR', 'GBP'],
            fees: { percentage: 2.9, fixed: 30 },
          },
        },
        {
          name: 'PayPal',
          isActive: true,
          config: {
            supportedCurrencies: ['USD', 'EUR', 'GBP'],
            fees: { percentage: 3.5, fixed: 0 },
          },
        },
        {
          name: 'MercadoPago',
          isActive: false,
          config: {
            supportedCurrencies: ['USD', 'ARS', 'BRL'],
            fees: { percentage: 3.5, fixed: 0 },
          },
        },
      ];

      return gateways.filter(gateway => gateway.isActive);
    } catch (error) {
      logger.error('Error obteniendo pasarelas de pago', error as Error);
      throw error;
    }
  }
}
