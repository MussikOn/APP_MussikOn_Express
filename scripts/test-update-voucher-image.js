const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración
const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_TOKEN = process.env.TEST_TOKEN || 'your_test_token_here';

// Función para obtener token de prueba
async function getTestToken() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      userEmail: 'test@example.com',
      userPassword: 'testpassword'
    });
    return response.data.token;
  } catch (error) {
    console.log('⚠️  No se pudo obtener token de prueba, usando token por defecto');
    return TEST_TOKEN;
  }
}

// Función para crear un voucher de prueba
async function createTestVoucher(token) {
  try {
    console.log('📄 Creando voucher de prueba...');
    
    const formData = new FormData();
    
    // Crear un archivo de imagen de prueba
    const testImageBuffer = Buffer.from('fake-image-data');
    formData.append('voucherFile', testImageBuffer, {
      filename: 'test-voucher.jpg',
      contentType: 'image/jpeg'
    });
    
    formData.append('amount', '500.00');
    formData.append('accountHolderName', 'Test User');
    formData.append('bankName', 'Test Bank');
    formData.append('accountNumber', '1234567890');
    formData.append('depositDate', '2024-01-15');
    formData.append('depositTime', '14:30');
    formData.append('referenceNumber', 'REF123456');
    formData.append('comments', 'Voucher de prueba');

    const response = await axios.post(`${BASE_URL}/vouchers/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Voucher de prueba creado:', response.data.data.depositId);
    return response.data.data.depositId;
  } catch (error) {
    console.error('❌ Error creando voucher de prueba:', error.response?.data || error.message);
    throw error;
  }
}

// Función para actualizar imagen de voucher
async function updateVoucherImage(token, voucherId) {
  try {
    console.log(`🔄 Actualizando imagen del voucher: ${voucherId}`);
    
    const formData = new FormData();
    
    // Crear una nueva imagen de prueba
    const newImageBuffer = Buffer.from('updated-fake-image-data');
    formData.append('voucherImage', newImageBuffer, {
      filename: 'updated-voucher.jpg',
      contentType: 'image/jpeg'
    });

    const response = await axios.put(`${BASE_URL}/vouchers/${voucherId}/image`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Imagen del voucher actualizada exitosamente');
    console.log('📊 Datos de respuesta:', {
      id: response.data.data.id,
      amount: response.data.data.amount,
      status: response.data.data.status,
      filename: response.data.data.voucherFile.filename,
      fileSize: response.data.data.voucherFile.fileSize,
      updatedAt: response.data.data.updatedAt
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error actualizando imagen del voucher:', error.response?.data || error.message);
    throw error;
  }
}

// Función para verificar el voucher actualizado
async function verifyUpdatedVoucher(token, voucherId) {
  try {
    console.log(`🔍 Verificando voucher actualizado: ${voucherId}`);
    
    const response = await axios.get(`${BASE_URL}/vouchers/${voucherId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Voucher verificado exitosamente');
    console.log('📊 Datos del voucher:', {
      id: response.data.data.id,
      filename: response.data.data.voucherFile.filename,
      uploadedAt: response.data.data.voucherFile.uploadedAt,
      hasVoucherFile: response.data.data.hasVoucherFile
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error verificando voucher:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal de prueba
async function testUpdateVoucherImage() {
  console.log('🧪 Iniciando prueba del endpoint PUT /vouchers/:voucherId/image');
  console.log('=' .repeat(60));

  try {
    // 1. Obtener token
    console.log('🔑 Obteniendo token de autenticación...');
    const token = await getTestToken();
    console.log('✅ Token obtenido');

    // 2. Crear voucher de prueba
    const voucherId = await createTestVoucher(token);

    // 3. Actualizar imagen del voucher
    await updateVoucherImage(token, voucherId);

    // 4. Verificar voucher actualizado
    await verifyUpdatedVoucher(token, voucherId);

    console.log('=' .repeat(60));
    console.log('🎉 ¡Prueba completada exitosamente!');
    console.log('✅ El endpoint PUT /vouchers/:voucherId/image funciona correctamente');

  } catch (error) {
    console.log('=' .repeat(60));
    console.error('💥 Prueba fallida:', error.message);
    process.exit(1);
  }
}

// Ejecutar prueba si se llama directamente
if (require.main === module) {
  testUpdateVoucherImage();
}

module.exports = {
  testUpdateVoucherImage,
  updateVoucherImage,
  createTestVoucher,
  verifyUpdatedVoucher
}; 