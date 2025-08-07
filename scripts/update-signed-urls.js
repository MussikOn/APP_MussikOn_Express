#!/usr/bin/env node

/**
 * Script para actualizar todas las URLs firmadas de imágenes
 * Garantiza que todas las imágenes tengan URLs firmadas válidas y seguras
 * 
 * Uso:
 *   node scripts/update-signed-urls.js
 *   node scripts/update-signed-urls.js --refresh-expired
 *   node scripts/update-signed-urls.js --health-check
 */

const axios = require('axios');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  console.error(`${colors.red}❌ ${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

async function makeRequest(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': ADMIN_TOKEN ? `Bearer ${ADMIN_TOKEN}` : ''
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`HTTP ${error.response.status}: ${error.response.data?.error || error.response.statusText}`);
    } else if (error.request) {
      throw new Error('No se pudo conectar al servidor. Asegúrate de que la API esté ejecutándose.');
    } else {
      throw new Error(error.message);
    }
  }
}

async function updateAllSignedUrls() {
  log('🔄 Actualizando todas las URLs firmadas...', 'cyan');
  
  try {
    const result = await makeRequest('/images/update-all-signed-urls', 'POST');
    
    if (result.success) {
      logSuccess('Actualización masiva completada exitosamente');
      logInfo(`📊 Resultados:`);
      logInfo(`   • Total de imágenes: ${result.data.totalImages}`);
      logInfo(`   • Imágenes actualizadas: ${result.data.updatedImages}`);
      logInfo(`   • Imágenes fallidas: ${result.data.failedImages}`);
      
      if (result.data.errors && result.data.errors.length > 0) {
        logWarning(`   • Errores encontrados: ${result.data.errors.length}`);
        result.data.errors.forEach((error, index) => {
          logError(`     ${index + 1}. ${error}`);
        });
      }
    } else {
      logError('La actualización falló');
    }
  } catch (error) {
    logError(`Error actualizando URLs firmadas: ${error.message}`);
  }
}

async function refreshExpiredSignedUrls() {
  log('🔄 Verificando y renovando URLs firmadas expiradas...', 'cyan');
  
  try {
    const result = await makeRequest('/images/refresh-expired-signed-urls', 'POST');
    
    if (result.success) {
      logSuccess('Verificación de URLs expiradas completada');
      logInfo(`📊 Resultados:`);
      logInfo(`   • Imágenes verificadas: ${result.data.checkedImages}`);
      logInfo(`   • URLs expiradas: ${result.data.expiredImages}`);
      logInfo(`   • URLs renovadas: ${result.data.refreshedImages}`);
      
      if (result.data.errors && result.data.errors.length > 0) {
        logWarning(`   • Errores encontrados: ${result.data.errors.length}`);
        result.data.errors.forEach((error, index) => {
          logError(`     ${index + 1}. ${error}`);
        });
      }
    } else {
      logError('La verificación falló');
    }
  } catch (error) {
    logError(`Error verificando URLs expiradas: ${error.message}`);
  }
}

async function checkSignedUrlsHealth() {
  log('🏥 Verificando salud de URLs firmadas...', 'cyan');
  
  try {
    const result = await makeRequest('/images/health/signed-urls', 'GET');
    
    if (result.success) {
      const health = result.data;
      
      logSuccess('Verificación de salud completada');
      logInfo(`📊 Estado de salud: ${health.status.toUpperCase()}`);
      logInfo(`   • Imágenes verificadas: ${health.checkedImages}`);
      logInfo(`   • URLs expiradas: ${health.expiredImages}`);
      logInfo(`   • URLs renovadas: ${health.refreshedImages}`);
      logInfo(`   • Errores: ${health.errorCount}`);
      logInfo(`   • Timestamp: ${health.timestamp}`);
      
      // Mostrar recomendaciones basadas en el estado
      if (health.status === 'healthy') {
        logSuccess('✅ El sistema de URLs firmadas está funcionando correctamente');
      } else if (health.status === 'warning') {
        logWarning('⚠️  Se detectaron algunos problemas menores');
        logInfo('   Recomendación: Ejecutar actualización manual');
      } else if (health.status === 'critical') {
        logError('🚨 Estado crítico detectado');
        logInfo('   Recomendación: Ejecutar actualización masiva inmediatamente');
      }
    } else {
      logError('La verificación de salud falló');
    }
  } catch (error) {
    logError(`Error verificando salud: ${error.message}`);
  }
}

async function main() {
  log('🎵 MussikOn API - Gestión de URLs Firmadas', 'bright');
  log('==========================================', 'bright');
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Verificar conexión con la API
  try {
    logInfo('Verificando conexión con la API...');
    await makeRequest('/test', 'GET');
    logSuccess('Conexión con la API establecida');
  } catch (error) {
    logError(`No se pudo conectar a la API: ${error.message}`);
    logInfo('Asegúrate de que la API esté ejecutándose en: ' + API_BASE_URL);
    process.exit(1);
  }
  
  // Ejecutar comando específico
  switch (command) {
    case '--refresh-expired':
      await refreshExpiredSignedUrls();
      break;
      
    case '--health-check':
      await checkSignedUrlsHealth();
      break;
      
    case '--all':
      log('🔄 Ejecutando todas las operaciones...', 'magenta');
      await checkSignedUrlsHealth();
      console.log('');
      await refreshExpiredSignedUrls();
      console.log('');
      await updateAllSignedUrls();
      break;
      
    default:
      // Comportamiento por defecto: actualización masiva
      await updateAllSignedUrls();
      break;
  }
  
  log('', 'reset');
  log('🎉 Proceso completado', 'green');
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logError('Error no manejado:');
  console.error(reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError('Excepción no capturada:');
  console.error(error);
  process.exit(1);
});

// Ejecutar script
if (require.main === module) {
  main().catch((error) => {
    logError(`Error ejecutando script: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  updateAllSignedUrls,
  refreshExpiredSignedUrls,
  checkSignedUrlsHealth
}; 