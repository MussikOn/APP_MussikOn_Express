import request from 'supertest';
import { app } from '../../index';
import { db } from '../utils/firebase';
import { logger } from '../services/loggerService';

// Mock Firebase
jest.mock('../utils/firebase', () => ({
  db: {
    collection: jest.fn(),
  },
}));

// Mock logger
jest.mock('../services/loggerService', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('PaymentController', () => {
  let mockCollection: jest.Mocked<any>;
  let mockDoc: jest.Mocked<any>;
  let mockQuery: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDoc = {
      id: 'test-id',
      data: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
    };

    mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
      doc: jest.fn().mockReturnValue(mockDoc),
    };

    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
      add: jest.fn(),
      where: jest.fn().mockReturnValue(mockQuery),
      orderBy: jest.fn().mockReturnValue(mockQuery),
      limit: jest.fn().mockReturnValue(mockQuery),
      get: jest.fn(),
    };

    (db.collection as jest.Mock).mockReturnValue(mockCollection);
  });

  describe('POST /payments/create-payment-intent', () => {
    it('should create payment intent successfully', async () => {
      const paymentData = {
        amount: 1000,
        currency: 'usd',
        description: 'Test payment',
        metadata: {
          userId: 'user123',
          eventId: 'event123',
        },
      };

      const response = await request(app)
        .post('/payments/create-payment-intent')
        .set('Authorization', 'Bearer valid-token')
        .send(paymentData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('clientSecret');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/payments/create-payment-intent')
        .set('Authorization', 'Bearer valid-token')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate amount is positive', async () => {
      const response = await request(app)
        .post('/payments/create-payment-intent')
        .set('Authorization', 'Bearer valid-token')
        .send({
          amount: -100,
          currency: 'usd',
          description: 'Test payment',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /payments/confirm-payment', () => {
    it('should confirm payment successfully', async () => {
      const confirmData = {
        paymentIntentId: 'pi_test123',
        userId: 'user123',
        eventId: 'event123',
      };

      const response = await request(app)
        .post('/payments/confirm-payment')
        .set('Authorization', 'Bearer valid-token')
        .send(confirmData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should handle invalid payment intent', async () => {
      const response = await request(app)
        .post('/payments/confirm-payment')
        .set('Authorization', 'Bearer valid-token')
        .send({
          paymentIntentId: 'invalid_id',
          userId: 'user123',
          eventId: 'event123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /payments/history', () => {
    it('should return payment history for user', async () => {
      const mockPayments = [
        {
          id: '1',
          data: () => ({
            amount: 1000,
            currency: 'usd',
            status: 'succeeded',
            createdAt: new Date(),
          }),
        },
        {
          id: '2',
          data: () => ({
            amount: 2000,
            currency: 'usd',
            status: 'pending',
            createdAt: new Date(),
          }),
        },
      ];

      mockQuery.get.mockResolvedValue({
        size: 2,
        docs: mockPayments,
      });

      const response = await request(app)
        .get('/payments/history')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle pagination', async () => {
      mockQuery.get.mockResolvedValue({
        size: 10,
        docs: [],
      });

      const response = await request(app)
        .get('/payments/history?page=2&limit=10')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /payments/:paymentId', () => {
    it('should return payment details', async () => {
      const mockPaymentData = {
        amount: 1000,
        currency: 'usd',
        status: 'succeeded',
        description: 'Test payment',
        createdAt: new Date(),
        metadata: {
          userId: 'user123',
          eventId: 'event123',
        },
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockPaymentData,
      });

      const response = await request(app)
        .get('/payments/test-payment-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('amount', 1000);
    });

    it('should return 404 when payment not found', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const response = await request(app)
        .get('/payments/non-existent-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /payments/refund', () => {
    it('should process refund successfully', async () => {
      const refundData = {
        paymentId: 'pi_test123',
        amount: 500,
        reason: 'Customer request',
      };

      const response = await request(app)
        .post('/payments/refund')
        .set('Authorization', 'Bearer valid-token')
        .send(refundData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should validate refund amount', async () => {
      const response = await request(app)
        .post('/payments/refund')
        .set('Authorization', 'Bearer valid-token')
        .send({
          paymentId: 'pi_test123',
          amount: -100,
          reason: 'Customer request',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /payments/statistics', () => {
    it('should return payment statistics', async () => {
      const mockStats = {
        totalPayments: 100,
        totalAmount: 50000,
        averageAmount: 500,
        successRate: 0.95,
        monthlyGrowth: 0.1,
      };

      mockQuery.get.mockResolvedValue({
        size: 0,
        docs: [],
      });

      const response = await request(app)
        .get('/payments/statistics')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should handle date range filters', async () => {
      const response = await request(app)
        .get('/payments/statistics?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /payments/webhook', () => {
    it('should handle payment succeeded webhook', async () => {
      const webhookData = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            amount: 1000,
            currency: 'usd',
            metadata: {
              userId: 'user123',
              eventId: 'event123',
            },
          },
        },
      };

      const response = await request(app)
        .post('/payments/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should handle payment failed webhook', async () => {
      const webhookData = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test123',
            amount: 1000,
            currency: 'usd',
            last_payment_error: {
              message: 'Card declined',
            },
          },
        },
      };

      const response = await request(app)
        .post('/payments/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should handle unknown webhook type', async () => {
      const webhookData = {
        type: 'unknown.event',
        data: {
          object: {
            id: 'pi_test123',
          },
        },
      };

      const response = await request(app)
        .post('/payments/webhook')
        .send(webhookData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /payments/methods', () => {
    it('should return available payment methods', async () => {
      const response = await request(app)
        .get('/payments/methods')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /payments/save-method', () => {
    it('should save payment method successfully', async () => {
      const methodData = {
        paymentMethodId: 'pm_test123',
        type: 'card',
        last4: '4242',
        brand: 'visa',
      };

      const response = await request(app)
        .post('/payments/save-method')
        .set('Authorization', 'Bearer valid-token')
        .send(methodData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should validate payment method data', async () => {
      const response = await request(app)
        .post('/payments/save-method')
        .set('Authorization', 'Bearer valid-token')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /payments/methods/:methodId', () => {
    it('should delete payment method successfully', async () => {
      const response = await request(app)
        .delete('/payments/methods/pm_test123')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Error handling', () => {
    it('should handle Stripe errors gracefully', async () => {
      const response = await request(app)
        .post('/payments/create-payment-intent')
        .set('Authorization', 'Bearer valid-token')
        .send({
          amount: 1000,
          currency: 'invalid_currency',
          description: 'Test payment',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle database errors', async () => {
      mockQuery.get.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/payments/history')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle authentication errors', async () => {
      const response = await request(app)
        .get('/payments/history')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Validation', () => {
    it('should validate currency format', async () => {
      const response = await request(app)
        .post('/payments/create-payment-intent')
        .set('Authorization', 'Bearer valid-token')
        .send({
          amount: 1000,
          currency: 'INVALID',
          description: 'Test payment',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate amount is number', async () => {
      const response = await request(app)
        .post('/payments/create-payment-intent')
        .set('Authorization', 'Bearer valid-token')
        .send({
          amount: 'not_a_number',
          currency: 'usd',
          description: 'Test payment',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate description length', async () => {
      const response = await request(app)
        .post('/payments/create-payment-intent')
        .set('Authorization', 'Bearer valid-token')
        .send({
          amount: 1000,
          currency: 'usd',
          description: 'a'.repeat(1000), // Too long
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });
}); 