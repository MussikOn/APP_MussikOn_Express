const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración
const API_BASE_URL = 'http://192.168.54.93:3001';
const TEST_USER_EMAIL = 'astaciosanchezjefryagustin@gmail.com';

// Función para obtener token de autenticación
async function getAuthToken() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      userEmail: TEST_USER_EMAIL,
      userPassword: 'test123' // Asegúrate de usar una contraseña válida
    });
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Error obteniendo token de autenticación:', error.response?.data || error.message);
    throw error;
  }
}

// Función para probar la subida de depósito
async function testDepositUpload(token) {
  try {
    console.log('🧪 Probando subida de depósito...');
    
    // Crear un archivo de prueba temporal
    const testImagePath = path.join(__dirname, 'test-voucher.png');
    const testImageBuffer = Buffer.from('fake-image-data');
    fs.writeFileSync(testImagePath, testImageBuffer);
    
    // Crear FormData
    const formData = new FormData();
    formData.append('amount', '1000');
    formData.append('accountHolderName', 'Test User');
    formData.append('bankName', 'Banco de Prueba');
    // No incluir accountNumber para probar el campo undefined
    formData.append('depositDate', '2024-01-15');
    formData.append('depositTime', '14:30');
    formData.append('referenceNumber', 'REF123456');
    formData.append('comments', 'Prueba de depósito');
    formData.append('voucherFile', fs.createReadStream(testImagePath), {
      filename: 'test-voucher.png',
      contentType: 'image/png'
    });
    
    // Realizar la petición
    const response = await axios.post(`${API_BASE_URL}/payment-system/deposit`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Depósito subido exitosamente:', response.data);
    
    // Limpiar archivo temporal
    fs.unlinkSync(testImagePath);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error en la prueba de depósito:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal
async function runTest() {
  try {
    console.log('🚀 Iniciando prueba de corrección de campos undefined...');
    
    // Obtener token
    const token = await getAuthToken();
    console.log('✅ Token obtenido correctamente');
    
    // Probar subida de depósito
    await testDepositUpload(token);
    
    console.log('🎉 ¡Todas las pruebas pasaron! La corrección funciona correctamente.');
  } catch (error) {
    console.error('💥 Error en las pruebas:', error.message);
    process.exit(1);
  }
}

// Ejecutar pruebas
runTest();
