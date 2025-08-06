import { Request, Response } from 'express';
import { PaymentSystemController } from '../controllers/paymentSystemController';
import { PaymentSystemService } from '../services/paymentSystemService';

// Mock the payment system service
jest.mock('../services/paymentSystemService');
jest.mock('../services/pushNotificationService', () => ({
  pushNotificationService: {
    sendNotificationToUser: jest.fn()
  }
}));

// Mock Firebase
jest.mock('../utils/firebase', () => ({
  db: {
    collection: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: []
      }),
      add: jest.fn().mockResolvedValue({})
    })
  }
}));

// Mock logger
jest.mock('../services/loggerService', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('PaymentSystemController', () => {
  let paymentController: PaymentSystemController;
  let mockPaymentSystemService: jest.Mocked<PaymentSystemService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
    
    // Crear mock del servicio
    mockPaymentSystemService = {
      getUserBalance: jest.fn(),
      registerBankAccount: jest.fn(),
      getUserBankAccounts: jest.fn(),
      uploadDepositVoucher: jest.fn(),
      verifyDeposit: jest.fn(),
      processEventPayment: jest.fn(),
      getMusicianEarnings: jest.fn(),
      requestWithdrawal: jest.fn(),
      processWithdrawal: jest.fn(),
      getPaymentStatistics: jest.fn(),
      getPendingDeposits: jest.fn(),
      getPendingWithdrawals: jest.fn()
    } as any;
    
    // Mock del constructor del servicio
    (PaymentSystemService as jest.Mock).mockImplementation(() => mockPaymentSystemService);
    
    // Crear instancia del controlador
    paymentController = new PaymentSystemController();
    
    // Reemplazar el servicio en el controlador con nuestro mock
    (paymentController as any).paymentService = mockPaymentSystemService;
    
    // Configurar mocks de respuesta
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn().mockReturnThis();
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };
  });

  describe('getUserBalance', () => {
    it('should return user balance successfully', async () => {
      // Arrange
      const userEmail = 'user@example.com';
      const mockBalance = {
        userId: userEmail,
        balance: 1000,
        currency: 'RD$',
        lastUpdated: new Date().toISOString(),
        totalDeposits: 2000,
        totalEarnings: 1500,
        totalWithdrawals: 500
      };

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        }
      };

      mockPaymentSystemService.getUserBalance.mockResolvedValue(mockBalance);

      // Act
      await paymentController.getUserBalance(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockPaymentSystemService.getUserBalance).toHaveBeenCalledWith(userEmail);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockBalance
      });
    });

    it('should return error when user is not authenticated', async () => {
      // Arrange
      mockRequest = {
        user: undefined
      };

      // Act
      await paymentController.getUserBalance(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Usuario no autenticado'
      });
    });

    it('should handle service errors', async () => {
      // Arrange
      const userEmail = 'user@example.com';
      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        }
      };

      mockPaymentSystemService.getUserBalance.mockRejectedValue(new Error('Service error'));

      // Act
      await paymentController.getUserBalance(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Error obteniendo balance de usuario'
      });
    });
  });

  describe('registerBankAccount', () => {
    it('should register bank account successfully', async () => {
      // Arrange
      const userEmail = 'user@example.com';
      const accountData = {
        accountHolder: 'John Doe',
        accountNumber: '1234567890',
        accountType: 'savings' as const,
        bankName: 'Banco Popular',
        routingNumber: '123456789'
      };

      const mockAccount = {
        id: 'bank123',
        userId: userEmail,
        ...accountData,
        isVerified: false,
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        body: accountData
      };

      mockPaymentSystemService.registerBankAccount.mockResolvedValue(mockAccount);

      // Act
      await paymentController.registerBankAccount(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockPaymentSystemService.registerBankAccount).toHaveBeenCalledWith(userEmail, accountData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockAccount
      });
    });

    it('should return error for missing required fields', async () => {
      // Arrange
      const userEmail = 'user@example.com';
      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        body: {
          accountHolder: 'John Doe'
          // Missing required fields
        }
      };

      // Act
      await paymentController.registerBankAccount(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Datos de cuenta bancaria incompletos'
      });
    });
  });

  describe('getUserBankAccounts', () => {
    it('should return user bank accounts successfully', async () => {
      // Arrange
      const userEmail = 'user@example.com';
      const mockAccounts = [
        {
          id: 'bank1',
          userId: userEmail,
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

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        }
      };

      mockPaymentSystemService.getUserBankAccounts.mockResolvedValue(mockAccounts);

      // Act
      await paymentController.getUserBankAccounts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockPaymentSystemService.getUserBankAccounts).toHaveBeenCalledWith(userEmail);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockAccounts
      });
    });
  });

  describe('uploadDepositVoucher', () => {
    it('should upload deposit voucher successfully', async () => {
      // Arrange
      const userEmail = 'user@example.com';
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

      const mockDeposit = {
        id: 'deposit_123',
        userId: userEmail,
        amount: 1000,
        currency: 'RD$',
        voucherFile: {
          url: 'https://example.com/voucher.jpg',
          filename: 'voucher.jpg',
          uploadedAt: new Date().toISOString()
        },
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accountHolderName: 'Juan Pérez',
        bankName: 'Banco Popular'
      };

      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        body: depositData,
        file: depositData.voucherFile
      };

      mockPaymentSystemService.uploadDepositVoucher.mockResolvedValue(mockDeposit);

      // Act
      await paymentController.uploadDepositVoucher(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockPaymentSystemService.uploadDepositVoucher).toHaveBeenCalledWith(userEmail, {
        amount: 1000,
        voucherFile: depositData.voucherFile,
        accountHolderName: 'Juan Pérez',
        bankName: 'Banco Popular'
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockDeposit,
        message: 'Depósito subido exitosamente. Pendiente de verificación por administrador.'
      });
    });

    it('should return error for missing file', async () => {
      // Arrange
      const userEmail = 'user@example.com';
      mockRequest = {
        user: {
          userId: 'user123',
          userEmail: userEmail,
          email: userEmail,
          role: 'user',
          name: 'Test User'
        },
        body: {
          amount: 1000
          // Missing voucherFile
        }
      };

      // Act
      await paymentController.uploadDepositVoucher(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'No se proporcionó archivo de comprobante'
      });
    });
  });

  describe('verifyDeposit', () => {
    it('should verify deposit successfully', async () => {
      // Arrange
      const depositId = 'deposit_123';
      const adminEmail = 'admin@example.com';
      const verificationData = {
        bankDepositDate: '2024-01-15',
        bankDepositTime: '14:30',
        referenceNumber: 'REF123456',
        accountLastFourDigits: '1234',
        verifiedBy: 'admin_123'
      };

      mockRequest = {
        user: {
          userId: 'admin_123',
          userEmail: adminEmail,
          email: adminEmail,
          role: 'admin',
          name: 'Admin User'
        },
        params: { depositId },
        body: {
          approved: true,
          notes: 'Depósito verificado correctamente',
          verificationData
        }
      };

      mockPaymentSystemService.verifyDeposit.mockResolvedValue();

      // Act
      await paymentController.verifyDeposit(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockPaymentSystemService.verifyDeposit).toHaveBeenCalledWith(
        depositId,
        adminEmail,
        true,
        'Depósito verificado correctamente'
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          depositId,
          status: 'approved',
          verifiedBy: adminEmail,
          verifiedAt: expect.any(String),
          userBalanceUpdated: true
        },
        message: 'Depósito aprobado exitosamente'
      });
    });
  });

  describe('payMusicianForEvent', () => {
    it('should process event payment successfully', async () => {
      // Arrange
      const eventId = 'event_123';
      const organizerEmail = 'organizer@example.com';
      const musicianId = 'musician_123';
      const paymentData = {
        amount: 500,
        paymentMethod: 'balance' as const,
        description: 'Pago por evento'
      };

      const mockPayment = {
        id: 'payment_123',
        eventId,
        organizerId: organizerEmail,
        musicianId,
        amount: 500,
        currency: 'RD$',
        paymentMethod: 'balance' as const,
        commission: 50,
        musicianAmount: 450,
        status: 'completed' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockRequest = {
        user: {
          userId: 'organizer_123',
          userEmail: organizerEmail,
          email: organizerEmail,
          role: 'user',
          name: 'Organizer User'
        },
        params: { eventId },
        body: {
          musicianId,
          amount: 500
        }
      };

      mockPaymentSystemService.processEventPayment.mockResolvedValue(mockPayment);

      // Act
      await paymentController.payMusicianForEvent(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockPaymentSystemService.processEventPayment).toHaveBeenCalledWith({
        eventId,
        organizerId: organizerEmail,
        musicianId,
        amount: 500
      });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockPayment
      });
    });
  });

  describe('getMusicianEarnings', () => {
    it('should return musician earnings successfully', async () => {
      // Arrange
      const musicianEmail = 'musician@example.com';
      const mockEarnings = [
        {
          id: 'earning_123',
          musicianId: musicianEmail,
          eventId: 'event_123',
          eventPaymentId: 'payment_123',
          amount: 500,
          currency: 'RD$',
          status: 'available' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      mockRequest = {
        user: {
          userId: 'musician_123',
          userEmail: musicianEmail,
          email: musicianEmail,
          role: 'musician',
          name: 'Musician User'
        }
      };

      mockPaymentSystemService.getMusicianEarnings.mockResolvedValue(mockEarnings);

      // Act
      await paymentController.getMusicianEarnings(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockPaymentSystemService.getMusicianEarnings).toHaveBeenCalledWith(musicianEmail);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockEarnings
      });
    });
  });

  describe('requestWithdrawal', () => {
    it('should request withdrawal successfully', async () => {
      // Arrange
      const musicianEmail = 'musician@example.com';
      const withdrawalData = {
        amount: 200,
        bankAccountId: 'bank_123',
        description: 'Retiro de ganancias'
      };

      const mockWithdrawal = {
        id: 'withdrawal_123',
        musicianId: musicianEmail,
        amount: 200,
        currency: 'RD$',
        bankAccountId: 'bank_123',
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockRequest = {
        user: {
          userId: 'musician_123',
          userEmail: musicianEmail,
          email: musicianEmail,
          role: 'musician',
          name: 'Musician User'
        },
        body: {
          amount: 200,
          bankAccountId: 'bank_123'
        }
      };

      mockPaymentSystemService.requestWithdrawal.mockResolvedValue(mockWithdrawal);

      // Act
      await paymentController.requestWithdrawal(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockPaymentSystemService.requestWithdrawal).toHaveBeenCalledWith(musicianEmail, {
        amount: 200,
        bankAccountId: 'bank_123'
      });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockWithdrawal,
        message: 'Solicitud de retiro creada exitosamente'
      });
    });
  });

  describe('processWithdrawal', () => {
    it('should process withdrawal successfully', async () => {
      // Arrange
      const withdrawalId = 'withdrawal_123';
      const adminEmail = 'admin@example.com';
      const processData = {
        approved: true,
        notes: 'Retiro procesado correctamente'
      };

      mockRequest = {
        user: {
          userId: 'admin_123',
          userEmail: adminEmail,
          email: adminEmail,
          role: 'admin',
          name: 'Admin User'
        },
        params: { withdrawalId },
        body: processData
      };

      mockPaymentSystemService.processWithdrawal.mockResolvedValue();

      // Act
      await paymentController.processWithdrawal(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockPaymentSystemService.processWithdrawal).toHaveBeenCalledWith(
        withdrawalId,
        adminEmail,
        processData.approved,
        processData.notes
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Retiro aprobado exitosamente'
      });
    });
  });

  describe('getPaymentStatistics', () => {
    it('should return payment statistics successfully', async () => {
      // Arrange
      const mockStats = {
        totalUsers: 100,
        totalMusicians: 50,
        totalEvents: 200,
        totalDeposits: 50000,
        totalPayments: 40000,
        totalWithdrawals: 10000,
        totalCommissions: 5000,
        pendingDepositsCount: 5,
        pendingWithdrawalsCount: 3,
        averageEventValue: 250,
        monthlyGrowth: 15.5,
        lastUpdated: new Date().toISOString()
      };

      mockRequest = {
        user: {
          userId: 'admin_123',
          userEmail: 'admin@example.com',
          email: 'admin@example.com',
          role: 'admin',
          name: 'Admin User'
        }
      };

      mockPaymentSystemService.getPaymentStatistics.mockResolvedValue(mockStats);

      // Act
      await paymentController.getPaymentStatistics(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockPaymentSystemService.getPaymentStatistics).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
    });
  });

  describe('getPendingDeposits', () => {
    it('should return pending deposits successfully', async () => {
      // Arrange
      const mockDeposits = [
        {
          id: 'deposit_123',
          userId: 'user_123',
          amount: 1000,
          currency: 'RD$',
          status: 'pending' as const,
          voucherFile: {
            url: 'https://example.com/voucher_123.jpg',
            filename: 'voucher_123.jpg',
            uploadedAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          accountHolderName: 'Juan Pérez',
          bankName: 'Banco Popular'
        }
      ];

      mockRequest = {
        user: {
          userId: 'admin_123',
          userEmail: 'admin@example.com',
          email: 'admin@example.com',
          role: 'admin',
          name: 'Admin User'
        }
      };

      mockPaymentSystemService.getPendingDeposits.mockResolvedValue(mockDeposits);

      // Act
      await paymentController.getPendingDeposits(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockPaymentSystemService.getPendingDeposits).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockDeposits
      });
    });
  });

  describe('getPendingWithdrawals', () => {
    it('should return pending withdrawals successfully', async () => {
      // Arrange
      const mockWithdrawals = [
        {
          id: 'withdrawal_123',
          musicianId: 'musician_123',
          amount: 200,
          currency: 'RD$',
          bankAccountId: 'bank_123',
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      mockRequest = {
        user: {
          userId: 'admin_123',
          userEmail: 'admin@example.com',
          email: 'admin@example.com',
          role: 'admin',
          name: 'Admin User'
        }
      };

      mockPaymentSystemService.getPendingWithdrawals.mockResolvedValue(mockWithdrawals);

      // Act
      await paymentController.getPendingWithdrawals(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockPaymentSystemService.getPendingWithdrawals).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockWithdrawals
      });
    });
  });
}); 
