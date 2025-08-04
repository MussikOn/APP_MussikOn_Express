const axios = require('axios');

// Configuración
const BACKEND_URL = 'http://localhost:5001';
const ADMIN_SYSTEM_URL = 'http://localhost:3000';

// Colores para console.log
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testBackendConnection() {
  log('\n🔍 Probando conexión con el Backend...', 'blue');
  
  try {
    const response = await axios.get(`${BACKEND_URL}/`);
    log('✅ Backend conectado correctamente', 'green');
    log(`📊 Estado: ${response.data.status}`, 'green');
    log(`📅 Timestamp: ${response.data.timestamp}`, 'green');
    return true;
  } catch (error) {
    log('❌ Error conectando con el backend', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

async function testPaymentEndpoints() {
  log('\n💰 Probando endpoints de pagos...', 'blue');
  
  const endpoints = [
    '/admin/payments/pending-deposits',
    '/admin/payments/statistics',
    '/payments/user-balance',
    '/payments/user-deposits'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint}`);
      log(`✅ ${endpoint} - ${response.status}`, 'green');
    } catch (error) {
      if (error.response?.status === 401) {
        log(`⚠️  ${endpoint} - Requiere autenticación (401)`, 'yellow');
      } else {
        log(`❌ ${endpoint} - Error: ${error.response?.status || error.message}`, 'red');
      }
    }
  }
}

async function testImageEndpoints() {
  log('\n🖼️  Probando endpoints de imágenes...', 'blue');
  
  const endpoints = [
    '/imgs',
    '/imgs/stats',
    '/imgs/upload'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint}`);
      log(`✅ ${endpoint} - ${response.status}`, 'green');
    } catch (error) {
      if (error.response?.status === 401) {
        log(`⚠️  ${endpoint} - Requiere autenticación (401)`, 'yellow');
      } else {
        log(`❌ ${endpoint} - Error: ${error.response?.status || error.message}`, 'red');
      }
    }
  }
}

async function testCORS() {
  log('\n🌐 Probando configuración CORS...', 'blue');
  
  try {
    const response = await axios.get(`${BACKEND_URL}/`, {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    
    const corsHeaders = response.headers['access-control-allow-origin'];
    if (corsHeaders) {
      log('✅ CORS configurado correctamente', 'green');
      log(`📋 Headers CORS: ${corsHeaders}`, 'green');
    } else {
      log('⚠️  Headers CORS no encontrados', 'yellow');
    }
  } catch (error) {
    log('❌ Error probando CORS', 'red');
    log(`Error: ${error.message}`, 'red');
  }
}

async function testAdminSystemConnection() {
  log('\n🖥️  Probando conexión con el Sistema de Administración...', 'blue');
  
  try {
    const response = await axios.get(`${ADMIN_SYSTEM_URL}`);
    log('✅ Sistema de administración accesible', 'green');
    return true;
  } catch (error) {
    log('❌ Error conectando con el sistema de administración', 'red');
    log(`Error: ${error.message}`, 'red');
    log('💡 Asegúrate de que el sistema de administración esté ejecutándose en http://localhost:3000', 'yellow');
    return false;
  }
}

async function runIntegrationTests() {
  log('🚀 Iniciando pruebas de integración...', 'blue');
  log('=' * 50, 'blue');
  
  // Probar conexión con backend
  const backendConnected = await testBackendConnection();
  
  if (backendConnected) {
    // Probar endpoints de pagos
    await testPaymentEndpoints();
    
    // Probar endpoints de imágenes
    await testImageEndpoints();
    
    // Probar CORS
    await testCORS();
  }
  
  // Probar sistema de administración
  await testAdminSystemConnection();
  
  log('\n' + '=' * 50, 'blue');
  log('✅ Pruebas de integración completadas', 'green');
  log('\n📋 Resumen:', 'blue');
  log('• Backend: http://localhost:5001', 'green');
  log('• Admin System: http://localhost:3000', 'green');
  log('• CORS: Configurado para permitir comunicación entre sistemas', 'green');
}

// Ejecutar pruebas
runIntegrationTests().catch(error => {
  log('❌ Error ejecutando pruebas de integración', 'red');
  log(`Error: ${error.message}`, 'red');
  process.exit(1);
}); 