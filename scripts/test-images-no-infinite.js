const axios = require('axios');

const BASE_URL = 'http://192.168.54.11:3001';

async function testImagesEndpoints() {
    console.log('🔍 Probando endpoints de imágenes para verificar que no hay consultas infinitas...\n');

    const endpoints = [
        '/imgs/stats/public',
        '/imgs/all/public', 
        '/imgs/statistics/public',
        '/imgs/verify/public'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`📡 Probando: ${endpoint}`);
            const startTime = Date.now();
            
            const response = await axios.get(`${BASE_URL}${endpoint}`, {
                timeout: 5000 // 5 segundos de timeout
            });
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log(`✅ Respuesta exitosa en ${duration}ms`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Datos: ${JSON.stringify(response.data).substring(0, 100)}...`);
            console.log('');
            
        } catch (error) {
            console.log(`❌ Error en ${endpoint}:`);
            console.log(`   ${error.message}`);
            console.log('');
        }
    }

    console.log('🎯 Prueba completada. Si no hay errores, los endpoints están funcionando correctamente.');
    console.log('💡 El auto-refresh automático ha sido desactivado. El usuario puede activarlo manualmente si lo desea.');
}

// Ejecutar la prueba
testImagesEndpoints().catch(console.error); 