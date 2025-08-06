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

describe('DepositController', () => {
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

  describe('POST /deposits/report', () => {
    it('should report deposit successfully', async () => {
      const depositData = {
        amount: 1000,
        bankName: 'Banco Popular',
        depositDate: '2024-01-15',
        description: 'Pago por evento',
        voucher: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
      };

      const response = await request(app)
        .post('/deposits/report')
        .set('Authorization', 'Bearer valid-token')
        .field('amount', depositData.amount)
        .field('bankName', depositData.bankName)
        .field('depositDate', depositData.depositDate)
        .field('description', depositData.description)
        .attach('voucher', Buffer.from('fake-image-data'), 'voucher.jpg')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('depositId');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/deposits/report')
        .set('Authorization', 'Bearer valid-token')
        .field('amount', '')
        .field('bankName', '')
        .field('depositDate', '')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate amount is positive', async () => {
      const response = await request(app)
        .post('/deposits/report')
        .set('Authorization', 'Bearer valid-token')
        .field('amount', '-100')
        .field('bankName', 'Banco Popular')
        .field('depositDate', '2024-01-15')
        .field('description', 'Test deposit')
        .attach('voucher', Buffer.from('fake-image-data'), 'voucher.jpg')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate voucher file', async () => {
      const response = await request(app)
        .post('/deposits/report')
        .set('Authorization', 'Bearer valid-token')
        .field('amount', '1000')
        .field('bankName', 'Banco Popular')
        .field('depositDate', '2024-01-15')
        .field('description', 'Test deposit')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate file type', async () => {
      const response = await request(app)
        .post('/deposits/report')
        .set('Authorization', 'Bearer valid-token')
        .field('amount', '1000')
        .field('bankName', 'Banco Popular')
        .field('depositDate', '2024-01-15')
        .field('description', 'Test deposit')
        .attach('voucher', Buffer.from('fake-text-data'), 'voucher.txt')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /deposits/my-deposits', () => {
    it('should return user deposits', async () => {
      const mockDeposits = [
        {
          id: '1',
          data: () => ({
            amount: 1000,
            bankName: 'Banco Popular',
            status: 'pending',
            createdAt: new Date(),
          }),
        },
        {
          id: '2',
          data: () => ({
            amount: 2000,
            bankName: 'Banco BHD',
            status: 'approved',
            createdAt: new Date(),
          }),
        },
      ];

      mockQuery.get.mockResolvedValue({
        size: 2,
        docs: mockDeposits,
      });

      const response = await request(app)
        .get('/deposits/my-deposits')
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
        .get('/deposits/my-deposits?page=2&limit=10')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/deposits/my-deposits?status=pending')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /deposits/pending', () => {
    it('should return pending deposits for admin', async () => {
      const mockPendingDeposits = [
        {
          id: '1',
          data: () => ({
            amount: 1000,
            bankName: 'Banco Popular',
            status: 'pending',
            userId: 'user123',
            createdAt: new Date(),
          }),
        },
      ];

      mockQuery.get.mockResolvedValue({
        size: 1,
        docs: mockPendingDeposits,
      });

      const response = await request(app)
        .get('/deposits/pending')
        .set('Authorization', 'Bearer valid-admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(1);
    });

    it('should require admin permissions', async () => {
      const response = await request(app)
        .get('/deposits/pending')
        .set('Authorization', 'Bearer valid-user-token')
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /deposits/:depositId/approve', () => {
    it('should approve deposit successfully', async () => {
      const mockDeposit = {
        amount: 1000,
        userId: 'user123',
        status: 'pending',
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockDeposit,
      });

      const response = await request(app)
        .post('/deposits/test-deposit-id/approve')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({
          adminNotes: 'Depósito verificado correctamente',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(mockDoc.update).toHaveBeenCalledWith({
        status: 'approved',
        approvedAt: expect.any(Date),
        approvedBy: expect.any(String),
        adminNotes: 'Depósito verificado correctamente',
      });
    });

    it('should return 404 when deposit not found', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const response = await request(app)
        .post('/deposits/non-existent-id/approve')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({
          adminNotes: 'Test approval',
        })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should not allow approving already approved deposits', async () => {
      const mockDeposit = {
        amount: 1000,
        userId: 'user123',
        status: 'approved',
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockDeposit,
      });

      const response = await request(app)
        .post('/deposits/test-deposit-id/approve')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({
          adminNotes: 'Test approval',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /deposits/:depositId/reject', () => {
    it('should reject deposit successfully', async () => {
      const mockDeposit = {
        amount: 1000,
        userId: 'user123',
        status: 'pending',
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockDeposit,
      });

      const response = await request(app)
        .post('/deposits/test-deposit-id/reject')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({
          reason: 'Voucher ilegible',
          adminNotes: 'No se puede verificar el depósito',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(mockDoc.update).toHaveBeenCalledWith({
        status: 'rejected',
        rejectedAt: expect.any(Date),
        rejectedBy: expect.any(String),
        reason: 'Voucher ilegible',
        adminNotes: 'No se puede verificar el depósito',
      });
    });

    it('should require rejection reason', async () => {
      const response = await request(app)
        .post('/deposits/test-deposit-id/reject')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /deposits/:depositId', () => {
    it('should return deposit details', async () => {
      const mockDepositData = {
        amount: 1000,
        bankName: 'Banco Popular',
        status: 'pending',
        depositDate: '2024-01-15',
        description: 'Pago por evento',
        voucherUrl: 'https://example.com/voucher.jpg',
        createdAt: new Date(),
        userId: 'user123',
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockDepositData,
      });

      const response = await request(app)
        .get('/deposits/test-deposit-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('amount', 1000);
      expect(response.body.data).toHaveProperty('bankName', 'Banco Popular');
    });

    it('should return 404 when deposit not found', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const response = await request(app)
        .get('/deposits/non-existent-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /deposits/stats', () => {
    it('should return deposit statistics for admin', async () => {
      const mockStats = {
        totalDeposits: 100,
        totalAmount: 50000,
        pendingDeposits: 10,
        approvedDeposits: 80,
        rejectedDeposits: 10,
        averageAmount: 500,
      };

      mockQuery.get.mockResolvedValue({
        size: 0,
        docs: [],
      });

      const response = await request(app)
        .get('/deposits/stats')
        .set('Authorization', 'Bearer valid-admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should require admin permissions', async () => {
      const response = await request(app)
        .get('/deposits/stats')
        .set('Authorization', 'Bearer valid-user-token')
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /deposits/bank-accounts', () => {
    it('should return bank accounts information', async () => {
      const mockBankAccounts = [
        {
          id: '1',
          data: () => ({
            bankName: 'Banco Popular',
            accountNumber: '1234567890',
            accountHolder: 'Mussikon SRL',
            accountType: 'Corriente',
          }),
        },
        {
          id: '2',
          data: () => ({
            bankName: 'Banco BHD',
            accountNumber: '0987654321',
            accountHolder: 'Mussikon SRL',
            accountType: 'Ahorro',
          }),
        },
      ];

      mockQuery.get.mockResolvedValue({
        size: 2,
        docs: mockBankAccounts,
      });

      const response = await request(app)
        .get('/deposits/bank-accounts')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockQuery.get.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/deposits/my-deposits')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle file upload errors', async () => {
      const response = await request(app)
        .post('/deposits/report')
        .set('Authorization', 'Bearer valid-token')
        .field('amount', '1000')
        .field('bankName', 'Banco Popular')
        .field('depositDate', '2024-01-15')
        .field('description', 'Test deposit')
        .attach('voucher', Buffer.from('fake-image-data'), 'voucher.jpg')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle authentication errors', async () => {
      const response = await request(app)
        .get('/deposits/my-deposits')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Validation', () => {
    it('should validate amount format', async () => {
      const response = await request(app)
        .post('/deposits/report')
        .set('Authorization', 'Bearer valid-token')
        .field('amount', 'not_a_number')
        .field('bankName', 'Banco Popular')
        .field('depositDate', '2024-01-15')
        .field('description', 'Test deposit')
        .attach('voucher', Buffer.from('fake-image-data'), 'voucher.jpg')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate deposit date format', async () => {
      const response = await request(app)
        .post('/deposits/report')
        .set('Authorization', 'Bearer valid-token')
        .field('amount', '1000')
        .field('bankName', 'Banco Popular')
        .field('depositDate', 'invalid_date')
        .field('description', 'Test deposit')
        .attach('voucher', Buffer.from('fake-image-data'), 'voucher.jpg')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate bank name length', async () => {
      const response = await request(app)
        .post('/deposits/report')
        .set('Authorization', 'Bearer valid-token')
        .field('amount', '1000')
        .field('bankName', 'a'.repeat(1000)) // Too long
        .field('depositDate', '2024-01-15')
        .field('description', 'Test deposit')
        .attach('voucher', Buffer.from('fake-image-data'), 'voucher.jpg')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate description length', async () => {
      const response = await request(app)
        .post('/deposits/report')
        .set('Authorization', 'Bearer valid-token')
        .field('amount', '1000')
        .field('bankName', 'Banco Popular')
        .field('depositDate', '2024-01-15')
        .field('description', 'a'.repeat(1000)) // Too long
        .attach('voucher', Buffer.from('fake-image-data'), 'voucher.jpg')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Security', () => {
    it('should not allow users to approve their own deposits', async () => {
      const mockDeposit = {
        amount: 1000,
        userId: 'current_user_id',
        status: 'pending',
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockDeposit,
      });

      const response = await request(app)
        .post('/deposits/test-deposit-id/approve')
        .set('Authorization', 'Bearer current_user_token')
        .send({
          adminNotes: 'Test approval',
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should not allow users to access other users deposits', async () => {
      const mockDeposit = {
        amount: 1000,
        userId: 'other_user_id',
        status: 'pending',
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockDeposit,
      });

      const response = await request(app)
        .get('/deposits/test-deposit-id')
        .set('Authorization', 'Bearer current_user_token')
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });
}); 