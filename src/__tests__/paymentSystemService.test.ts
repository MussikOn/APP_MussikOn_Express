import { PaymentSystemService } from '../services/paymentSystemService';
import { db } from '../utils/firebase';
import { uploadToS3 } from '../utils/idriveE2';

// Mock Firebase
jest.mock('../utils/firebase', () => ({
  db: {
    collection: jest.fn(),
  },
}));

// Mock S3 upload
jest.mock('../utils/idriveE2', () => ({
  uploadToS3: jest.fn(),
}));

// Mock logger
jest.mock('../services/loggerService', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('PaymentSystemService', () => {
  let paymentService: PaymentSystemService;
  let mockFirestore: any;
  let mockCollection: any;
  let mockDoc: any;

  beforeEach(() => {
    paymentService = new PaymentSystemService();
    
    mockDoc = {
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      exists: false,
      data: jest.fn()
    };

    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
      where: jest.fn().mockReturnThis(),
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      add: jest.fn(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exists: false,
      data: jest.fn(),
      size: 0,
      docs: []
    };

    // Configurar mocks para que funcionen correctamente
    (db.collection as jest.Mock).mockReturnValue(mockCollection);
    (db as any).doc = jest.fn().mockReturnValue(mockDoc);
    
    // Configurar mockDoc.get para que retorne el mockDoc
    mockDoc.get.mockResolvedValue(mockDoc);
    
    // Configurar mockCollection.get para que retorne un objeto con docs
    mockCollection.get.mockResolvedValue({
      docs: [],
      size: 0
    });
    
    jest.clearAllMocks();
  });

  describe('getUserBalance', () => {
    it('should return existing user balance', async () => {
      // Arrange
      const userId = 'user123';
      const mockBalance = {
        userId,
        balance: 1000,
        currency: 'RD$',
        lastUpdated: new Date().toISOString(),
        totalDeposits: 2000,
        totalEarnings: 1500,
        totalWithdrawals: 500
      };

      mockDoc.exists = true;
      mockDoc.data.mockReturnValue(mockBalance);
      mockDoc.get.mockResolvedValue(mockDoc);

      // Act
      const result = await paymentService.getUserBalance(userId);

      // Assert
      expect(mockCollection.doc).toHaveBeenCalledWith(userId);
      expect(mockDoc.get).toHaveBeenCalled();
      expect(result).toEqual(mockBalance);
    });

    it('should create initial balance when user has no balance', async () => {
      // Arrange
      const userId = 'user123';
      mockDoc.exists = false;
      mockDoc.get.mockResolvedValue(mockDoc);

      // Act
      const result = await paymentService.getUserBalance(userId);

      // Assert
      expect(mockDoc.set).toHaveBeenCalledWith({
        userId,
        balance: 0,
        currency: 'RD$',
        lastUpdated: expect.any(String),
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalEarnings: 0
      });
      expect(result.balance).toBe(0);
      expect(result.currency).toBe('RD$');
    });
  });

  describe('registerBankAccount', () => {
    it('should register bank account successfully', async () => {
      // Arrange
      const userId = 'user123';
      const accountData = {
        accountHolder: 'John Doe',
        accountNumber: '1234567890',
        accountType: 'savings' as const,
        bankName: 'Banco Popular',
        routingNumber: '123456789'
      };

      mockCollection.get.mockResolvedValue({
        docs: [],
        size: 0
      });

      // Act
      const result = await paymentService.registerBankAccount(userId, accountData);

      // Assert
      expect(mockDoc.set).toHaveBeenCalledWith(expect.objectContaining({
        userId,
        ...accountData,
        isVerified: false,
        isDefault: false
      }));
      expect(result.isDefault).toBe(false);
    });

    it('should set first account as default', async () => {
      // Arrange
      const userId = 'user123';
      const accountData = {
        accountHolder: 'John Doe',
        accountNumber: '1234567890',
        accountType: 'savings' as const,
        bankName: 'Banco Popular',
        routingNumber: '123456789'
      };

      mockCollection.get.mockResolvedValue({
        docs: [{
          data: () => ({ id: 'existing_account' }),
          id: 'existing_account'
        }],
        size: 1
      });

      // Act
      const result = await paymentService.registerBankAccount(userId, accountData);

      // Assert
      expect(mockDoc.update).toHaveBeenCalledWith({ isDefault: true });
      expect(result.isDefault).toBe(true);
    });
  });

  describe('getUserBankAccounts', () => {
    it('should return user bank accounts with optimized query', async () => {
      // Arrange
      const userId = 'user123';
      const mockAccounts = [
        {
          id: 'bank1',
          userId,
          accountHolder: 'John Doe',
          accountNumber: '1234567890',
          accountType: 'savings' as const,
          bankName: 'Banco Popular',
          routingNumber: '123456789',
          isVerified: true,
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      mockCollection.get.mockResolvedValue({
        docs: mockAccounts.map(account => ({
          data: () => account,
          id: account.id
        })),
        size: mockAccounts.length
      });

      // Act
      const result = await paymentService.getUserBankAccounts(userId);

      // Assert
      expect(mockCollection.where).toHaveBeenCalledWith('userId', '==', userId);
      expect(mockCollection.orderBy).toHaveBeenCalledWith('isDefault', 'desc');
      expect(result).toEqual(mockAccounts);
    });

    it('should fallback to memory sorting when index is not available', async () => {
      // Arrange
      const userId = 'user123';
      mockCollection.get.mockRejectedValue(new Error('Index not available'));

      // Act & Assert
      await expect(paymentService.getUserBankAccounts(userId)).rejects.toThrow('Error obteniendo cuentas bancarias');
    });
  });

  describe('uploadDepositVoucher', () => {
    it('should upload deposit voucher successfully', async () => {
      // Arrange
      const userId = 'user123';
      const depositData = {
        amount: 1000,
        voucherFile: {
          fieldname: 'voucher',
          originalname: 'voucher.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('test'),
          size: 1024,
          stream: {} as any,
          destination: '',
          filename: 'voucher.jpg',
          path: ''
        },
        accountHolderName: 'Juan Pérez',
        bankName: 'Banco Popular'
      };

      const mockS3Url = 'https://s3.amazonaws.com/voucher.jpg';
      (uploadToS3 as jest.Mock).mockResolvedValue(mockS3Url);

      // Act
      const result = await paymentService.uploadDepositVoucher(userId, depositData);

      // Assert
      expect(uploadToS3).toHaveBeenCalledWith(
        depositData.voucherFile.buffer,
        'voucher.jpg',
        'image/jpeg',
        'deposits'
      );
      expect(mockDoc.set).toHaveBeenCalledWith(expect.objectContaining({
        userId,
        amount: depositData.amount,
        status: 'pending',
        accountHolderName: depositData.accountHolderName,
        bankName: depositData.bankName
      }));
      expect(result.status).toBe('pending');
    });
  });

  describe('verifyDeposit', () => {
    it('should verify deposit successfully', async () => {
      // Arrange
      const depositId = 'deposit123';
      const adminId = 'admin123';
      const approved = true;
      const notes = 'Depósito verificado';
      const verificationData = {
        bankDepositDate: '2024-01-15',
        bankDepositTime: '14:30',
        referenceNumber: 'REF123456',
        accountLastFourDigits: '1234',
        verifiedBy: 'admin123'
      };

      const mockDeposit = {
        id: depositId,
        userId: 'user123',
        amount: 1000,
        status: 'pending'
      };

      mockDoc.exists = true;
      mockDoc.data.mockReturnValue(mockDeposit);
      mockDoc.get.mockResolvedValue(mockDoc);

      // Act
      await paymentService.verifyDeposit(depositId, adminId, approved, notes);

      // Assert
      expect(mockDoc.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'approved',
        verifiedBy: adminId,
        verifiedAt: expect.any(String),
        notes
      }));
    });

    it('should reject deposit successfully', async () => {
      // Arrange
      const depositId = 'deposit123';
      const adminId = 'admin123';
      const approved = false;
      const notes = 'Comprobante inválido';

      const mockDeposit = {
        id: depositId,
        userId: 'user123',
        amount: 1000,
        status: 'pending'
      };

      mockDoc.exists = true;
      mockDoc.data.mockReturnValue(mockDeposit);
      mockDoc.get.mockResolvedValue(mockDoc);

      // Act
      await paymentService.verifyDeposit(depositId, adminId, approved, notes);

      // Assert
      expect(mockDoc.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'rejected',
        verifiedBy: adminId,
        verifiedAt: expect.any(String),
        notes
      }));
    });
  });

  describe('processEventPayment', () => {
    it('should process event payment successfully', async () => {
      // Arrange
      const paymentData = {
        eventId: 'event123',
        organizerId: 'organizer123',
        musicianId: 'musician123',
        amount: 500,
        paymentMethod: 'balance' as const,
        description: 'Pago por evento'
      };

      const mockBalance = {
        userId: 'organizer123',
        balance: 1000,
        currency: 'RD$',
        lastUpdated: new Date().toISOString(),
        totalDeposits: 2000,
        totalEarnings: 0,
        totalWithdrawals: 0
      };

      mockDoc.exists = true;
      mockDoc.data.mockReturnValue(mockBalance);
      mockDoc.get.mockResolvedValue(mockDoc);

      // Act
      const result = await paymentService.processEventPayment(paymentData);

      // Assert
      expect(mockDoc.set).toHaveBeenCalledWith(expect.objectContaining({
        eventId: paymentData.eventId,
        organizerId: paymentData.organizerId,
        musicianId: paymentData.musicianId,
        amount: paymentData.amount,
        status: 'completed'
      }));
      expect(result.status).toBe('completed');
    });
  });

  describe('requestWithdrawal', () => {
    it('should request withdrawal successfully', async () => {
      // Arrange
      const musicianId = 'musician123';
      const withdrawalData = {
        amount: 200,
        bankAccountId: 'bank123',
        description: 'Retiro de ganancias'
      };

      const mockEarnings = {
        totalEarnings: 500,
        availableBalance: 300
      };

      mockDoc.exists = true;
      mockDoc.data.mockReturnValue(mockEarnings);
      mockDoc.get.mockResolvedValue(mockDoc);

      // Act
      const result = await paymentService.requestWithdrawal(musicianId, withdrawalData);

      // Assert
      expect(mockDoc.set).toHaveBeenCalledWith(expect.objectContaining({
        musicianId,
        amount: withdrawalData.amount,
        bankAccountId: withdrawalData.bankAccountId,
        status: 'pending'
      }));
      expect(result.status).toBe('pending');
    });
  });

  describe('processWithdrawal', () => {
    it('should process withdrawal successfully', async () => {
      // Arrange
      const withdrawalId = 'withdrawal123';
      const adminId = 'admin123';
      const approved = true;
      const notes = 'Retiro aprobado';

      const mockWithdrawal = {
        id: withdrawalId,
        musicianId: 'musician123',
        amount: 200,
        status: 'pending'
      };

      mockDoc.exists = true;
      mockDoc.data.mockReturnValue(mockWithdrawal);
      mockDoc.get.mockResolvedValue(mockDoc);

      // Act
      await paymentService.processWithdrawal(withdrawalId, adminId, approved, notes);

      // Assert
      expect(mockDoc.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'approved',
        processedBy: adminId,
        processedAt: expect.any(String),
        notes
      }));
    });
  });

  describe('getPaymentStatistics', () => {
    it('should return payment statistics', async () => {
      // Arrange
      const mockStats = {
        totalUsers: 100,
        totalMusicians: 50,
        totalEvents: 200,
        totalRevenue: 50000,
        totalCommissions: 5000,
        averageEventValue: 250,
        monthlyGrowth: 15.5
      };

      mockCollection.get.mockResolvedValue({
        docs: [],
        size: 100
      });

      // Act
      const result = await paymentService.getPaymentStatistics();

      // Assert
      expect(result).toEqual(expect.objectContaining({
        totalUsers: expect.any(Number),
        totalMusicians: expect.any(Number),
        totalEvents: expect.any(Number)
      }));
    });
  });

  describe('getPendingDeposits', () => {
    it('should return pending deposits', async () => {
      // Arrange
      const mockDeposits = [
        {
          id: 'deposit1',
          userId: 'user123',
          amount: 1000,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];

      mockCollection.get.mockResolvedValue({
        docs: mockDeposits.map(deposit => ({
          data: () => deposit,
          id: deposit.id
        })),
        size: mockDeposits.length
      });

      // Act
      const result = await paymentService.getPendingDeposits();

      // Assert
      expect(mockCollection.where).toHaveBeenCalledWith('status', '==', 'pending');
      expect(mockCollection.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result).toEqual(mockDeposits);
    });
  });

  describe('getPendingWithdrawals', () => {
    it('should return pending withdrawals', async () => {
      // Arrange
      const mockWithdrawals = [
        {
          id: 'withdrawal1',
          musicianId: 'musician123',
          amount: 200,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];

      mockCollection.get.mockResolvedValue({
        docs: mockWithdrawals.map(withdrawal => ({
          data: () => withdrawal,
          id: withdrawal.id
        })),
        size: mockWithdrawals.length
      });

      // Act
      const result = await paymentService.getPendingWithdrawals();

      // Assert
      expect(mockCollection.where).toHaveBeenCalledWith('status', '==', 'pending');
      expect(mockCollection.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result).toEqual(mockWithdrawals);
    });
  });

  describe('getMusicianEarnings', () => {
    it('should return musician earnings', async () => {
      // Arrange
      const musicianId = 'musician123';
      const mockEarnings = [
        {
          id: 'earning1',
          musicianId,
          eventId: 'event123',
          amount: 500,
          commission: 50,
          netAmount: 450,
          createdAt: new Date().toISOString()
        }
      ];

      mockCollection.get.mockResolvedValue({
        docs: mockEarnings.map(earning => ({
          data: () => earning,
          id: earning.id
        })),
        size: mockEarnings.length
      });

      // Act
      const result = await paymentService.getMusicianEarnings(musicianId);

      // Assert
      expect(mockCollection.where).toHaveBeenCalledWith('musicianId', '==', musicianId);
      expect(mockCollection.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result).toEqual(mockEarnings);
    });
  });
}); 