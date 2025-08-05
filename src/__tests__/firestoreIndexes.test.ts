import { FirestoreIndexManager } from '../utils/firestoreIndexes';

describe('FirestoreIndexManager', () => {
  beforeEach(() => {
    // Limpiar mocks
    jest.clearAllMocks();
  });

  describe('initializeIndexes', () => {
    it('should log required indexes information', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      // Act
      await FirestoreIndexManager.initializeIndexes();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('🔧 Verificando configuración de índices de Firestore...'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('📋 Índice requerido: bank_accounts - bank_accounts_user_default_created'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('   Campos: userId(ASCENDING), isDefault(DESCENDING), createdAt(DESCENDING)'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('📋 Índice requerido: user_deposits - user_deposits_status_created'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('   Campos: status(ASCENDING), createdAt(DESCENDING)'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('📋 Índice requerido: withdrawal_requests - withdrawal_requests_status_created'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('   Campos: status(ASCENDING), createdAt(DESCENDING)'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('📋 Índice requerido: musician_earnings - musician_earnings_musician_created'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('   Campos: musicianId(ASCENDING), createdAt(DESCENDING)'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✅ Verificación de índices completada. Los índices deben crearse manualmente en Firebase Console.'));

      // Cleanup
      consoleSpy.mockRestore();
    });


  });

  describe('getRequiredIndexes', () => {
    it('should return all required indexes configuration', () => {
      // Act
      const indexes = FirestoreIndexManager.getRequiredIndexes();

      // Assert
      expect(indexes).toHaveProperty('bank_accounts');
      expect(indexes).toHaveProperty('user_deposits');
      expect(indexes).toHaveProperty('withdrawal_requests');
      expect(indexes).toHaveProperty('musician_earnings');

      // Verify bank_accounts index
      expect(indexes.bank_accounts).toHaveLength(1);
      expect(indexes.bank_accounts[0]).toEqual({
        name: 'bank_accounts_user_default_created',
        fields: [
          { fieldPath: 'userId', order: 'ASCENDING' },
          { fieldPath: 'isDefault', order: 'DESCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      });

      // Verify user_deposits index
      expect(indexes.user_deposits).toHaveLength(1);
      expect(indexes.user_deposits[0]).toEqual({
        name: 'user_deposits_status_created',
        fields: [
          { fieldPath: 'status', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      });

      // Verify withdrawal_requests index
      expect(indexes.withdrawal_requests).toHaveLength(1);
      expect(indexes.withdrawal_requests[0]).toEqual({
        name: 'withdrawal_requests_status_created',
        fields: [
          { fieldPath: 'status', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      });

      // Verify musician_earnings index
      expect(indexes.musician_earnings).toHaveLength(1);
      expect(indexes.musician_earnings[0]).toEqual({
        name: 'musician_earnings_musician_created',
        fields: [
          { fieldPath: 'musicianId', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      });
    });
  });

  describe('isIndexConfigured', () => {
    it('should return true for configured indexes', () => {
      // Act & Assert
      expect(FirestoreIndexManager.isIndexConfigured('bank_accounts', 'bank_accounts_user_default_created')).toBe(true);
      expect(FirestoreIndexManager.isIndexConfigured('user_deposits', 'user_deposits_status_created')).toBe(true);
      expect(FirestoreIndexManager.isIndexConfigured('withdrawal_requests', 'withdrawal_requests_status_created')).toBe(true);
      expect(FirestoreIndexManager.isIndexConfigured('musician_earnings', 'musician_earnings_musician_created')).toBe(true);
    });

    it('should return false for non-configured indexes', () => {
      // Act & Assert
      expect(FirestoreIndexManager.isIndexConfigured('bank_accounts', 'non_existent_index')).toBe(false);
      expect(FirestoreIndexManager.isIndexConfigured('non_existent_collection', 'some_index')).toBe(false);
    });

    it('should return false for non-existent collections', () => {
      // Act & Assert
      expect(FirestoreIndexManager.isIndexConfigured('non_existent_collection', 'bank_accounts_user_default_created')).toBe(false);
    });
  });

  describe('getIndexesForCollection', () => {
    it('should return indexes for existing collections', () => {
      // Act
      const bankAccountsIndexes = FirestoreIndexManager.getIndexesForCollection('bank_accounts');
      const userDepositsIndexes = FirestoreIndexManager.getIndexesForCollection('user_deposits');
      const withdrawalRequestsIndexes = FirestoreIndexManager.getIndexesForCollection('withdrawal_requests');
      const musicianEarningsIndexes = FirestoreIndexManager.getIndexesForCollection('musician_earnings');

      // Assert
      expect(bankAccountsIndexes).toHaveLength(1);
      expect(bankAccountsIndexes[0].name).toBe('bank_accounts_user_default_created');

      expect(userDepositsIndexes).toHaveLength(1);
      expect(userDepositsIndexes[0].name).toBe('user_deposits_status_created');

      expect(withdrawalRequestsIndexes).toHaveLength(1);
      expect(withdrawalRequestsIndexes[0].name).toBe('withdrawal_requests_status_created');

      expect(musicianEarningsIndexes).toHaveLength(1);
      expect(musicianEarningsIndexes[0].name).toBe('musician_earnings_musician_created');
    });

    it('should return empty array for non-existent collections', () => {
      // Act
      const nonExistentIndexes = FirestoreIndexManager.getIndexesForCollection('non_existent_collection');

      // Assert
      expect(nonExistentIndexes).toEqual([]);
    });
  });

  describe('checkIndexStatus', () => {
    it('should return simulated index status', async () => {
      // Act
      const status = await FirestoreIndexManager.checkIndexStatus();

      // Assert
      expect(status).toEqual({
        'bank_accounts_bank_accounts_user_default_created': true,
        'user_deposits_user_deposits_status_created': true,
        'withdrawal_requests_withdrawal_requests_status_created': true,
        'musician_earnings_musician_earnings_musician_created': true
      });
    });


  });

  describe('generateIndexCreationUrl', () => {
    it('should generate URL for bank_accounts index', () => {
      // Act
      const url = FirestoreIndexManager.generateIndexCreationUrl('bank_accounts', 'bank_accounts_user_default_created');

      // Assert
      expect(url).toContain('https://console.firebase.google.com/project/_/firestore/indexes');
      expect(url).toContain('create_composite=bank_accounts');
      expect(url).toContain('query_mode=COLLECTION');
      expect(url).toContain('fields=userId:ascending,isDefault:descending,createdAt:descending');
    });

    it('should generate URL for user_deposits index', () => {
      // Act
      const url = FirestoreIndexManager.generateIndexCreationUrl('user_deposits', 'user_deposits_status_created');

      // Assert
      expect(url).toContain('create_composite=user_deposits');
      expect(url).toContain('fields=status:ascending,createdAt:descending');
    });

    it('should generate URL for withdrawal_requests index', () => {
      // Act
      const url = FirestoreIndexManager.generateIndexCreationUrl('withdrawal_requests', 'withdrawal_requests_status_created');

      // Assert
      expect(url).toContain('create_composite=withdrawal_requests');
      expect(url).toContain('fields=status:ascending,createdAt:descending');
    });

    it('should generate URL for musician_earnings index', () => {
      // Act
      const url = FirestoreIndexManager.generateIndexCreationUrl('musician_earnings', 'musician_earnings_musician_created');

      // Assert
      expect(url).toContain('create_composite=musician_earnings');
      expect(url).toContain('fields=musicianId:ascending,createdAt:descending');
    });

    it('should return empty string for non-existent index', () => {
      // Act
      const url = FirestoreIndexManager.generateIndexCreationUrl('bank_accounts', 'non_existent_index');

      // Assert
      expect(url).toBe('');
    });

    it('should return empty string for non-existent collection', () => {
      // Act
      const url = FirestoreIndexManager.generateIndexCreationUrl('non_existent_collection', 'bank_accounts_user_default_created');

      // Assert
      expect(url).toBe('');
    });
  });

  describe('Index Configuration Validation', () => {
    it('should have valid field configurations', () => {
      // Act
      const indexes = FirestoreIndexManager.getRequiredIndexes();

      // Assert - Validate bank_accounts index
      const bankAccountsIndex = indexes.bank_accounts[0];
      expect(bankAccountsIndex.fields).toHaveLength(3);
      expect(bankAccountsIndex.fields[0]).toEqual({ fieldPath: 'userId', order: 'ASCENDING' });
      expect(bankAccountsIndex.fields[1]).toEqual({ fieldPath: 'isDefault', order: 'DESCENDING' });
      expect(bankAccountsIndex.fields[2]).toEqual({ fieldPath: 'createdAt', order: 'DESCENDING' });

      // Validate user_deposits index
      const userDepositsIndex = indexes.user_deposits[0];
      expect(userDepositsIndex.fields).toHaveLength(2);
      expect(userDepositsIndex.fields[0]).toEqual({ fieldPath: 'status', order: 'ASCENDING' });
      expect(userDepositsIndex.fields[1]).toEqual({ fieldPath: 'createdAt', order: 'DESCENDING' });

      // Validate withdrawal_requests index
      const withdrawalRequestsIndex = indexes.withdrawal_requests[0];
      expect(withdrawalRequestsIndex.fields).toHaveLength(2);
      expect(withdrawalRequestsIndex.fields[0]).toEqual({ fieldPath: 'status', order: 'ASCENDING' });
      expect(withdrawalRequestsIndex.fields[1]).toEqual({ fieldPath: 'createdAt', order: 'DESCENDING' });

      // Validate musician_earnings index
      const musicianEarningsIndex = indexes.musician_earnings[0];
      expect(musicianEarningsIndex.fields).toHaveLength(2);
      expect(musicianEarningsIndex.fields[0]).toEqual({ fieldPath: 'musicianId', order: 'ASCENDING' });
      expect(musicianEarningsIndex.fields[1]).toEqual({ fieldPath: 'createdAt', order: 'DESCENDING' });
    });

    it('should have unique index names', () => {
      // Act
      const indexes = FirestoreIndexManager.getRequiredIndexes();
      const allIndexes = [
        ...indexes.bank_accounts,
        ...indexes.user_deposits,
        ...indexes.withdrawal_requests,
        ...indexes.musician_earnings
      ];

      const indexNames = allIndexes.map(index => index.name);

      // Assert
      const uniqueNames = new Set(indexNames);
      expect(uniqueNames.size).toBe(indexNames.length);
    });

    it('should have valid order values', () => {
      // Act
      const indexes = FirestoreIndexManager.getRequiredIndexes();
      const allIndexes = [
        ...indexes.bank_accounts,
        ...indexes.user_deposits,
        ...indexes.withdrawal_requests,
        ...indexes.musician_earnings
      ];

      // Assert
      allIndexes.forEach(index => {
        index.fields.forEach(field => {
          expect(['ASCENDING', 'DESCENDING']).toContain(field.order);
        });
      });
    });
  });

  describe('Integration Tests', () => {
    it('should provide complete index information for all collections', () => {
      // Act
      const indexes = FirestoreIndexManager.getRequiredIndexes();
      const collections = Object.keys(indexes);

      // Assert
      expect(collections).toHaveLength(4);
      expect(collections).toContain('bank_accounts');
      expect(collections).toContain('user_deposits');
      expect(collections).toContain('withdrawal_requests');
      expect(collections).toContain('musician_earnings');

      // Verify each collection has at least one index
      collections.forEach(collection => {
        const collectionIndexes = indexes[collection as keyof typeof indexes];
        expect(collectionIndexes).toHaveLength(1);
        expect(collectionIndexes[0]).toHaveProperty('name');
        expect(collectionIndexes[0]).toHaveProperty('fields');
        expect(Array.isArray(collectionIndexes[0].fields)).toBe(true);
      });
    });

    it('should generate valid URLs for all indexes', () => {
      // Act
      const indexes = FirestoreIndexManager.getRequiredIndexes();
      const collections = Object.keys(indexes);

      // Assert
      collections.forEach(collection => {
        const index = indexes[collection as keyof typeof indexes][0];
        const url = FirestoreIndexManager.generateIndexCreationUrl(collection, index.name);
        
        expect(url).not.toBe('');
        expect(url).toContain('https://console.firebase.google.com');
        expect(url).toContain('firestore/indexes');
        expect(url).toContain(`create_composite=${collection}`);
        expect(url).toContain('query_mode=COLLECTION');
        expect(url).toContain('fields=');
      });
    });
  });
}); 