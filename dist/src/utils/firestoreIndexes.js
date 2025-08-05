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
exports.FirestoreIndexManager = void 0;
const loggerService_1 = require("../services/loggerService");
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
class FirestoreIndexManager {
    /**
     * Inicializar verificación de índices
     */
    static initializeIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                loggerService_1.logger.info('🔧 Verificando configuración de índices de Firestore...');
                // Log de índices requeridos para referencia manual
                for (const [collection, indexes] of Object.entries(REQUIRED_INDEXES)) {
                    for (const indexConfig of indexes) {
                        loggerService_1.logger.info(`📋 Índice requerido: ${collection} - ${indexConfig.name}`);
                        loggerService_1.logger.info(`   Campos: ${indexConfig.fields.map(f => `${f.fieldPath}(${f.order})`).join(', ')}`);
                    }
                }
                loggerService_1.logger.info('✅ Verificación de índices completada. Los índices deben crearse manualmente en Firebase Console.');
            }
            catch (error) {
                loggerService_1.logger.error('❌ Error verificando índices de Firestore', error);
            }
        });
    }
    /**
     * Obtener configuración de índices requeridos
     */
    static getRequiredIndexes() {
        return REQUIRED_INDEXES;
    }
    /**
     * Verificar si un índice específico está configurado
     */
    static isIndexConfigured(collection, indexName) {
        const collectionIndexes = REQUIRED_INDEXES[collection];
        if (!collectionIndexes)
            return false;
        return collectionIndexes.some(index => index.name === indexName);
    }
    /**
     * Obtener información de índices para una colección
     */
    static getIndexesForCollection(collection) {
        return REQUIRED_INDEXES[collection] || [];
    }
    /**
     * Verificar estado de índices (simulado)
     */
    static checkIndexStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const status = {};
            try {
                for (const [collection, indexes] of Object.entries(REQUIRED_INDEXES)) {
                    for (const indexConfig of indexes) {
                        // Por ahora, asumimos que los índices están configurados
                        // En producción, esto debería verificar contra la API de Firebase
                        status[`${collection}_${indexConfig.name}`] = true;
                    }
                }
                loggerService_1.logger.info('📊 Estado de índices verificado (simulado)');
            }
            catch (error) {
                loggerService_1.logger.error('Error verificando estado de índices', error);
            }
            return status;
        });
    }
    /**
     * Generar URL para crear índice en Firebase Console
     */
    static generateIndexCreationUrl(collection, indexName) {
        var _a;
        const indexConfig = (_a = REQUIRED_INDEXES[collection]) === null || _a === void 0 ? void 0 : _a.find(index => index.name === indexName);
        if (!indexConfig) {
            return '';
        }
        // Generar URL básica para Firebase Console
        const fields = indexConfig.fields.map(f => `${f.fieldPath}:${f.order.toLowerCase()}`).join(',');
        return `https://console.firebase.google.com/project/_/firestore/indexes?create_composite=${collection}&query_mode=COLLECTION&fields=${fields}`;
    }
}
exports.FirestoreIndexManager = FirestoreIndexManager;
