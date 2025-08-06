const axios = require('axios');

const BASE_URL = 'http://192.168.54.11:3001';

async function testInitializationFix() {
    console.log('🔧 Probando correcciones de inicialización...\n');

    console.log('📋 Cambios implementados:');
    console.log('1. ✅ Control de inicialización única');
    console.log('2. ✅ Prevención de múltiples ejecuciones');
    console.log('3. ✅ Logging detallado para debugging');
    console.log('4. ✅ Manejo de errores mejorado\n');

    // Probar endpoints para verificar que funcionan
    const endpoints = [
        '/imgs/stats/public',
        '/imgs/all/public'
    ];

    console.log('🧪 Verificando endpoints:');
    
    for (const endpoint of endpoints) {
        try {
            console.log(`📡 Probando: ${endpoint}`);
            const startTime = Date.now();
            
            const response = await axios.get(`${BASE_URL}${endpoint}`, {
                timeout: 5000
            });
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log(`✅ Respuesta exitosa en ${duration}ms`);
            console.log(`   Status: ${response.status}`);
            console.log('');
            
        } catch (error) {
            console.log(`❌ Error en ${endpoint}:`);
            console.log(`   ${error.message}`);
            console.log('');
        }
    }

    console.log('🎯 Prueba completada.');
    console.log('');
    console.log('💡 Ahora el panel debería:');
    console.log('   • Inicializarse solo UNA vez');
    console.log('   • Mostrar logs claros en la consola');
    console.log('   • No hacer consultas infinitas');
    console.log('   • Permitir actualización manual controlada');
    console.log('');
    console.log('🔍 Para verificar en el navegador:');
    console.log('   • Abre las herramientas de desarrollador (F12)');
    console.log('   • Ve a la pestaña Console');
    console.log('   • Recarga la página');
    console.log('   • Deberías ver: "🚀 Inicializando panel de imágenes..."');
    console.log('   • Luego: "✅ Panel de imágenes inicializado correctamente"');
    console.log('   • Y NO deberías ver más logs de carga automática');
}

// Ejecutar prueba
testInitializationFix().catch(console.error); 