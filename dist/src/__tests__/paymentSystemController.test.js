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
const paymentSystemController_1 = require("../controllers/paymentSystemController");
const paymentSystemService_1 = require("../services/paymentSystemService");
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
    let paymentController;
    let mockPaymentSystemService;
    let mockRequest;
    let mockResponse;
    let mockStatus;
    let mockJson;
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
        };
        // Mock del constructor del servicio
        paymentSystemService_1.PaymentSystemService.mockImplementation(() => mockPaymentSystemService);
        // Crear instancia del controlador
        paymentController = new paymentSystemController_1.PaymentSystemController();
        // Reemplazar el servicio en el controlador con nuestro mock
        paymentController.paymentService = mockPaymentSystemService;
        // Configurar mocks de respuesta
        mockStatus = jest.fn().mockReturnThis();
        mockJson = jest.fn().mockReturnThis();
        mockResponse = {
            status: mockStatus,
            json: mockJson
        };
    });
    describe('getUserBalance', () => {
        it('should return user balance successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            yield paymentController.getUserBalance(mockRequest, mockResponse);
            // Assert
            expect(mockPaymentSystemService.getUserBalance).toHaveBeenCalledWith(userEmail);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockBalance
            });
        }));
        it('should return error when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest = {
                user: undefined
            };
            // Act
            yield paymentController.getUserBalance(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Usuario no autenticado'
            });
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
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
            yield paymentController.getUserBalance(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: 'Error obteniendo balance de usuario'
            });
        }));
    });
    describe('registerBankAccount', () => {
        it('should register bank account successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const userEmail = 'user@example.com';
            const accountData = {
                accountHolder: 'John Doe',
                accountNumber: '1234567890',
                accountType: 'savings',
                bankName: 'Banco Popular',
                routingNumber: '123456789'
            };
            const mockAccount = Object.assign(Object.assign({ id: 'bank123', userId: userEmail }, accountData), { isVerified: false, isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
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
            yield paymentController.registerBankAccount(mockRequest, mockResponse);
            // Assert
            expect(mockPaymentSystemService.registerBankAccount).toHaveBeenCalledWith(userEmail, accountData);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockAccount
            });
        }));
        it('should return error for missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
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
            yield paymentController.registerBankAccount(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Datos de cuenta bancaria incompletos'
            });
        }));
    });
    describe('getUserBankAccounts', () => {
        it('should return user bank accounts successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const userEmail = 'user@example.com';
            const mockAccounts = [
                {
                    id: 'bank1',
                    userId: userEmail,
                    accountHolder: 'John Doe',
                    accountNumber: '1234567890',
                    accountType: 'savings',
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
            yield paymentController.getUserBankAccounts(mockRequest, mockResponse);
            // Assert
            expect(mockPaymentSystemService.getUserBankAccounts).toHaveBeenCalledWith(userEmail);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockAccounts
            });
        }));
    });
    describe('uploadDepositVoucher', () => {
        it('should upload deposit voucher successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
                    stream: {},
                    destination: '',
                    filename: 'voucher.jpg',
                    path: ''
                },
                accountHolderName: 'Juan Pérez',
                bankName: 'Banco Popular'
            };
            const mockDeposit = {
                id: 'deposit_123',
                userId: 'user123',
                amount: 5000,
                currency: 'RD$',
                voucherFile: {
                    idriveKey: 'musikon-media/deposits/test-voucher.png',
                    filename: 'test-voucher.png',
                    uploadedAt: '2024-01-15T10:00:00Z'
                },
                status: 'pending',
                createdAt: '2024-01-15T10:00:00Z',
                updatedAt: '2024-01-15T10:00:00Z',
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
            yield paymentController.uploadDepositVoucher(mockRequest, mockResponse);
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
        }));
        it('should return error for missing file', () => __awaiter(void 0, void 0, void 0, function* () {
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
            yield paymentController.uploadDepositVoucher(mockRequest, mockResponse);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'No se proporcionó archivo de comprobante'
            });
        }));
    });
    describe('verifyDeposit', () => {
        it('should verify deposit successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            yield paymentController.verifyDeposit(mockRequest, mockResponse);
            // Assert
            expect(mockPaymentSystemService.verifyDeposit).toHaveBeenCalledWith(depositId, adminEmail, true, 'Depósito verificado correctamente');
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
        }));
    });
    describe('payMusicianForEvent', () => {
        it('should process event payment successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const eventId = 'event_123';
            const organizerEmail = 'organizer@example.com';
            const musicianId = 'musician_123';
            const paymentData = {
                amount: 500,
                paymentMethod: 'balance',
                description: 'Pago por evento'
            };
            const mockPayment = {
                id: 'payment_123',
                eventId,
                organizerId: organizerEmail,
                musicianId,
                amount: 500,
                currency: 'RD$',
                paymentMethod: 'balance',
                commission: 50,
                musicianAmount: 450,
                status: 'completed',
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
            yield paymentController.payMusicianForEvent(mockRequest, mockResponse);
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
        }));
    });
    describe('getMusicianEarnings', () => {
        it('should return musician earnings successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
                    status: 'available',
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
            yield paymentController.getMusicianEarnings(mockRequest, mockResponse);
            // Assert
            expect(mockPaymentSystemService.getMusicianEarnings).toHaveBeenCalledWith(musicianEmail);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockEarnings
            });
        }));
    });
    describe('requestWithdrawal', () => {
        it('should request withdrawal successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
                status: 'pending',
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
            yield paymentController.requestWithdrawal(mockRequest, mockResponse);
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
        }));
    });
    describe('processWithdrawal', () => {
        it('should process withdrawal successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            yield paymentController.processWithdrawal(mockRequest, mockResponse);
            // Assert
            expect(mockPaymentSystemService.processWithdrawal).toHaveBeenCalledWith(withdrawalId, adminEmail, processData.approved, processData.notes);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Retiro aprobado exitosamente'
            });
        }));
    });
    describe('getPaymentStatistics', () => {
        it('should return payment statistics successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            yield paymentController.getPaymentStatistics(mockRequest, mockResponse);
            // Assert
            expect(mockPaymentSystemService.getPaymentStatistics).toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockStats
            });
        }));
    });
    describe('getPendingDeposits', () => {
        it('should return pending deposits successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const mockDeposits = [
                {
                    id: 'deposit_123',
                    userId: 'user_123',
                    amount: 1000,
                    currency: 'RD$',
                    status: 'pending',
                    voucherFile: {
                        idriveKey: 'musikon-media/deposits/voucher_123.jpg',
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
            yield paymentController.getPendingDeposits(mockRequest, mockResponse);
            // Assert
            expect(mockPaymentSystemService.getPendingDeposits).toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockDeposits
            });
        }));
    });
    describe('getPendingWithdrawals', () => {
        it('should return pending withdrawals successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const mockWithdrawals = [
                {
                    id: 'withdrawal_123',
                    musicianId: 'musician_123',
                    amount: 200,
                    currency: 'RD$',
                    bankAccountId: 'bank_123',
                    status: 'pending',
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
            yield paymentController.getPendingWithdrawals(mockRequest, mockResponse);
            // Assert
            expect(mockPaymentSystemService.getPendingWithdrawals).toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockWithdrawals
            });
        }));
    });
});
