import { db } from '../utils/firebase';
import { logger } from '../services/loggerService';
import { BankAccount } from '../utils/DataTypes';

/**
 * Script para inicializar las cuentas bancarias de Mussikon
 * Este script debe ejecutarse una vez para configurar las cuentas bancarias
 */
export async function initializeBankAccounts(): Promise<void> {
  try {
    logger.info('Inicializando cuentas bancarias de Mussikon...');

    const bankAccounts: Omit<BankAccount, 'id'>[] = [
      {
        accountName: 'Mussikon S.L.',
        accountNumber: 'ES91 2100 0418 4502 0005 1332',
        bankName: 'CaixaBank',
        accountType: 'checking',
        isActive: true,
        createdAt: new Date()
      },
      {
        accountName: 'Mussikon S.L.',
        accountNumber: 'ES66 2100 0418 4502 0005 1333',
        bankName: 'CaixaBank',
        accountType: 'savings',
        isActive: true,
        createdAt: new Date()
      },
      {
        accountName: 'Mussikon S.L.',
        accountNumber: 'ES91 2100 0418 4502 0005 1334',
        bankName: 'Banco Santander',
        accountType: 'checking',
        isActive: true,
        createdAt: new Date()
      }
    ];

    const batch = db.batch();

    for (const account of bankAccounts) {
      const docRef = db.collection('bank_accounts').doc();
      batch.set(docRef, account);
    }

    await batch.commit();

    logger.info('Cuentas bancarias de Mussikon inicializadas exitosamente', {
      metadata: { accountsCount: bankAccounts.length }
    });

    console.log('✅ Cuentas bancarias inicializadas:');
    bankAccounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.bankName} - ${account.accountNumber} (${account.accountType})`);
    });

  } catch (error) {
    logger.error('Error inicializando cuentas bancarias:', error as Error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeBankAccounts()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando script:', error);
      process.exit(1);
    });
} 