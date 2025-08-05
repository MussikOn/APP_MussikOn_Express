#!/usr/bin/env node

/**
 * Script para crear índices de Firestore
 * Uso: node scripts/create-indexes.js
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config();

// Configuración de Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  
  // Inicializar Firebase Admin
  const app = initializeApp({
    credential: require('firebase-admin').credential.cert(serviceAccount),
    projectId: 'mus1k0n'
  });

  const db = getFirestore(app);

  // Configuración de índices necesarios
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

  async function createIndexes() {
    console.log('🔧 Iniciando creación de índices de Firestore...\n');

    for (const [collection, indexes] of Object.entries(REQUIRED_INDEXES)) {
      console.log(`📋 Procesando colección: ${collection}`);
      
      for (const indexConfig of indexes) {
        try {
          console.log(`  🔄 Creando índice: ${indexConfig.name}`);
          
          const [operation] = await db.createIndex({
            collectionGroup: collection,
            queryScope: 'COLLECTION',
            fields: indexConfig.fields
          });

          console.log(`  ⏳ Esperando construcción del índice...`);
          
          // Esperar a que se construya (con timeout de 2 minutos)
          await Promise.race([
            operation.promise(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout construyendo índice')), 120000)
            )
          ]);

          console.log(`  ✅ Índice ${indexConfig.name} creado exitosamente`);
          
        } catch (error) {
          if (error.code === 'ALREADY_EXISTS') {
            console.log(`  ℹ️  Índice ${indexConfig.name} ya existe`);
          } else {
            console.log(`  ❌ Error creando índice ${indexConfig.name}:`, error.message);
          }
        }
      }
      console.log('');
    }

    console.log('🎉 Proceso de creación de índices completado');
  }

  // Ejecutar el script
  createIndexes()
    .then(() => {
      console.log('✅ Script ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el script:', error);
      process.exit(1);
    });

} catch (error) {
  console.error('❌ Error cargando configuración de Firebase:', error.message);
  console.log('\n💡 Asegúrate de que:');
  console.log('   1. El archivo serviceAccountKey.json existe en la raíz del proyecto');
  console.log('   2. Las credenciales de Firebase son válidas');
  console.log('   3. Tienes permisos para crear índices en Firestore');
  process.exit(1);
} 