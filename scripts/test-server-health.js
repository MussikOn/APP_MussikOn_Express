const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://192.168.54.93:3001';

// Función para verificar la salud del servidor
async function checkServerHealth() {
  try {
    console.log('🏥 Verificando salud del servidor...');
    
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Servidor funcionando correctamente:', response.data);
    
    return true;
  } catch (error) {
    console.error('❌ Error verificando servidor:', error.response?.data || error.message);
    return false;
  }
}

// Función para verificar que el endpoint de depósitos existe
async function checkDepositEndpoint() {
  try {
    console.log('🔍 Verificando endpoint de depósitos...');
    
    // Intentar hacer una petición OPTIONS para verificar que el endpoint existe
    const response = await axios.options(`${API_BASE_URL}/payment-system/deposit`);
    console.log('✅ Endpoint de depósitos disponible');
    
    return true;
  } catch (error) {
    if (error.response?.status === 405) {
      // 405 Method Not Allowed significa que el endpoint existe pero no acepta OPTIONS
      console.log('✅ Endpoint de depósitos disponible (405 Method Not Allowed es normal)');
      return true;
    }
    console.error('❌ Error verificando endpoint de depósitos:', error.response?.data || error.message);
    return false;
  }
}

// Función principal
async function runHealthCheck() {
  try {
    console.log('🚀 Iniciando verificación de salud del servidor...');
    
    const serverHealthy = await checkServerHealth();
    const endpointAvailable = await checkDepositEndpoint();
    
    if (serverHealthy && endpointAvailable) {
      console.log('🎉 ¡Servidor funcionando correctamente!');
      console.log('💡 La corrección de campos undefined debería estar funcionando.');
      console.log('📝 Ahora puedes probar crear un depósito desde el frontend.');
    } else {
      console.log('⚠️  Algunos problemas detectados en el servidor.');
    }
  } catch (error) {
    console.error('💥 Error en la verificación:', error.message);
  }
}

// Ejecutar verificación
runHealthCheck();
