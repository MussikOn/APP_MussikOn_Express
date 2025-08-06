const axios = require('axios');

async function testIDriveDirect() {
    console.log('🔍 Probando conexión directa con IDrive E2...\n');

    try {
        // Probar el endpoint público
        console.log('📡 Probando endpoint público...');
        const response = await axios.get('http://localhost:3001/imgs/all/idrive/public', {
            timeout: 10000
        });

        console.log('✅ Respuesta del servidor:');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.log('❌ Error en la prueba:');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else if (error.request) {
            console.log('Error de conexión:', error.message);
        } else {
            console.log('Error:', error.message);
        }
    }

    console.log('\n🔍 Verificando configuración de IDrive E2...');
    
    // Verificar variables de entorno
    const requiredEnvVars = [
        'IDRIVE_E2_ACCESS_KEY',
        'IDRIVE_E2_SECRET_KEY', 
        'IDRIVE_E2_BUCKET_NAME',
        'IDRIVE_E2_REGION',
        'IDRIVE_E2_ENDPOINT'
    ];

    console.log('\n📋 Variables de entorno requeridas:');
    requiredEnvVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
            console.log(`✅ ${varName}: ${varName.includes('KEY') ? '***' + value.slice(-4) : value}`);
        } else {
            console.log(`❌ ${varName}: NO CONFIGURADA`);
        }
    });

    console.log('\n💡 Instrucciones para configurar IDrive E2:');
    console.log('1. Verifica que tu archivo .env contenga las siguientes variables:');
    console.log('   IDRIVE_E2_ACCESS_KEY=tu_access_key');
    console.log('   IDRIVE_E2_SECRET_KEY=tu_secret_key');
    console.log('   IDRIVE_E2_BUCKET_NAME=musikon-media');
    console.log('   IDRIVE_E2_REGION=us-east-1');
    console.log('   IDRIVE_E2_ENDPOINT=https://s3.us-east-1.idrive.com');
    
    console.log('\n2. Asegúrate de que las credenciales sean correctas');
    console.log('3. Verifica que el bucket "musikon-media" exista en tu cuenta de IDrive E2');
    console.log('4. Confirma que las imágenes estén en las carpetas correctas:');
    console.log('   - /deposits/ (para vouchers)');
    console.log('   - /profile/ (para perfiles)');
    console.log('   - /post/ (para eventos)');
    console.log('   - /gallery/ (para galería)');
}

testIDriveDirect().catch(console.error); 