// Tipos para el Sistema de Pagos Completo
export interface BankAccount {
  id: string;
  userId: string;
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  accountType: 'savings' | 'checking';
  routingNumber?: string;
  isVerified: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserDeposit {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  voucherFile: {
    url: string;
    filename: string;
    uploadedAt: string;
  };
  hasVoucherFile?: boolean; // Propiedad calculada para compatibilidad con frontend
  // Información del depósito bancario
  accountHolderName: string;
  accountNumber?: string;
  bankName: string;
  depositDate?: string;
  depositTime?: string;
  referenceNumber?: string;
  comments?: string;
  // Estado y verificación
  status: 'pending' | 'approved' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  // Datos de verificación del administrador
  verificationData?: {
    bankDepositDate: string;
    bankDepositTime: string;
    referenceNumber: string;
    accountLastFourDigits: string;
    verifiedBy: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventPayment {
  id: string;
  eventId: string;
  organizerId: string;
  musicianId: string;
  amount: number;
  currency: string;
  commission: number;
  musicianAmount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface MusicianEarnings {
  id: string;
  musicianId: string;
  eventId: string;
  eventPaymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'available' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  musicianId: string;
  amount: number;
  currency: string;
  bankAccountId: string;
  status: 'pending' | 'approved' | 'rejected';
  processedBy?: string;
  processedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserBalance {
  userId: string;
  balance: number;
  currency: string;
  lastUpdated: string;
  totalDeposits: number;
  totalWithdrawals: number;
  totalEarnings: number;
}

export interface CommissionCalculation {
  totalAmount: number;
  commissionAmount: number;
  musicianAmount: number;
  commissionRate: number;
}

export interface PaymentStatistics {
  totalDeposits: number;
  totalPayments: number;
  totalCommissions: number;
  totalWithdrawals: number;
  pendingDepositsCount: number;
  pendingWithdrawalsCount: number;
  totalUsers: number;
  totalMusicians: number;
  totalEvents: number;
  lastUpdated: string;
}

// Tipos para requests
export interface DepositRequest {
  amount: number;
  voucherFile: Express.Multer.File;
}

export interface WithdrawalRequestData {
  amount: number;
  bankAccountId: string;
}

export interface BankAccountData {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  accountType: 'savings' | 'checking';
  routingNumber?: string;
}

export interface EventPaymentRequest {
  eventId: string;
  organizerId: string;
  musicianId: string;
  amount: number;
} 