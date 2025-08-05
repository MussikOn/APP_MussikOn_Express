import { db } from './firebase';
import { logger } from '../services/loggerService';

/**
 * Configuración de índices necesarios para el sistema
 */
const REQUIRED_INDEXES = {
  bank_accounts: [
    {
      name: 'bank_accounts_user_default_created',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'isDefault', order: 'DESCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    }
  ],
  user_deposits: [
    {
      name: 'user_deposits_status_created',
      fields: [
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    }
  ],
  withdrawal_requests: [
    {
      name: 'withdrawal_requests_status_created',
      fields: [
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    }
  ],
  musician_earnings: [
    {
      name: 'musician_earnings_musician_created',
      fields: [
        { fieldPath: 'musicianId', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    }
  ]
};

/**
 * Clase para gestionar índices de Firestore
 * Nota: Los índices deben crearse manualmente en Firebase Console
 * Esta clase proporciona información y validación
 */
export class FirestoreIndexManager {
  /**
   * Inicializar verificación de índices
   */
  static async initializeIndexes(): Promise<void> {
    try {
      logger.info('🔧 Verificando configuración de índices de Firestore...');
      
      // Log de índices requeridos para referencia manual
      for (const [collection, indexes] of Object.entries(REQUIRED_INDEXES)) {
        for (const indexConfig of indexes) {
          logger.info(`📋 Índice requerido: ${collection} - ${indexConfig.name}`);
          logger.info(`   Campos: ${indexConfig.fields.map(f => `${f.fieldPath}(${f.order})`).join(', ')}`);
        }
      }
      
      logger.info('✅ Verificación de índices completada. Los índices deben crearse manualmente en Firebase Console.');
    } catch (error) {
      logger.error('❌ Error verificando índices de Firestore', error as Error);
    }
  }

  /**
   * Obtener configuración de índices requeridos
   */
  static getRequiredIndexes(): typeof REQUIRED_INDEXES {
    return REQUIRED_INDEXES;
  }

  /**
   * Verificar si un índice específico está configurado
   */
  static isIndexConfigured(collection: string, indexName: string): boolean {
    const collectionIndexes = REQUIRED_INDEXES[collection as keyof typeof REQUIRED_INDEXES];
    if (!collectionIndexes) return false;
    
    return collectionIndexes.some(index => index.name === indexName);
  }

  /**
   * Obtener información de índices para una colección
   */
  static getIndexesForCollection(collection: string): Array<{ name: string; fields: Array<{ fieldPath: string; order: string }> }> {
    return REQUIRED_INDEXES[collection as keyof typeof REQUIRED_INDEXES] || [];
  }

  /**
   * Verificar estado de índices (simulado)
   */
  static async checkIndexStatus(): Promise<{ [key: string]: boolean }> {
    const status: { [key: string]: boolean } = {};
    
    try {
      for (const [collection, indexes] of Object.entries(REQUIRED_INDEXES)) {
        for (const indexConfig of indexes) {
          // Por ahora, asumimos que los índices están configurados
          // En producción, esto debería verificar contra la API de Firebase
          status[`${collection}_${indexConfig.name}`] = true;
        }
      }
      
      logger.info('📊 Estado de índices verificado (simulado)');
    } catch (error) {
      logger.error('Error verificando estado de índices', error as Error);
    }
    
    return status;
  }

  /**
   * Generar URL para crear índice en Firebase Console
   */
  static generateIndexCreationUrl(collection: string, indexName: string): string {
    const indexConfig = REQUIRED_INDEXES[collection as keyof typeof REQUIRED_INDEXES]?.find(
      index => index.name === indexName
    );
    
    if (!indexConfig) {
      return '';
    }
    
    // Generar URL básica para Firebase Console
    const fields = indexConfig.fields.map(f => `${f.fieldPath}:${f.order.toLowerCase()}`).join(',');
    return `https://console.firebase.google.com/project/_/firestore/indexes?create_composite=${collection}&query_mode=COLLECTION&fields=${fields}`;
  }
} 