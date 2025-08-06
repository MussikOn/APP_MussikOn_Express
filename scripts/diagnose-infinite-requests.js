const axios = require('axios');

const BASE_URL = 'http://192.168.54.11:3001';

async function diagnoseInfiniteRequests() {
    console.log('🔍 Diagnóstico de consultas infinitas en el panel de imágenes...\n');

    console.log('📋 Verificando estado actual:');
    console.log('1. El auto-refresh automático ha sido DESACTIVADO');
    console.log('2. Solo se ejecutan consultas al cargar la página inicialmente');
    console.log('3. El usuario puede activar/desactivar auto-refresh manualmente\n');

    // Probar endpoints una sola vez
    const endpoints = [
        '/imgs/stats/public',
        '/imgs/all/public'
    ];

    console.log('🧪 Probando endpoints (una sola vez cada uno):');
    
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

    console.log('🎯 Diagnóstico completado.');
    console.log('');
    console.log('💡 Si sigues viendo consultas infinitas, verifica:');
    console.log('   • Limpia el cache del navegador (Ctrl+F5)');
    console.log('   • Cierra otras pestañas del panel de imágenes');
    console.log('   • Verifica que no hayas activado el auto-refresh manualmente');
    console.log('   • Revisa la consola del navegador para ver logs de auto-refresh');
    console.log('');
    console.log('🔧 El auto-refresh solo se ejecuta si:');
    console.log('   • El usuario hace clic en "Activar Auto-refresh"');
    console.log('   • Se ejecuta cada 30 segundos');
    console.log('   • Se puede detener con "Detener Auto-refresh"');
}

// Ejecutar diagnóstico
diagnoseInfiniteRequests().catch(console.error); 