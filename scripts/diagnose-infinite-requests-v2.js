const axios = require('axios');

console.log('🔍 Diagnóstico Avanzado de Consultas Infinitas - Versión 2');
console.log('========================================================');

async function testEndpoints() {
    const baseURL = 'http://192.168.54.11:3001';
    
    console.log('\n📊 Probando endpoints de imágenes...');
    
    try {
        // Probar endpoint de estadísticas
        console.log('\n1. Probando /imgs/stats/public...');
        const statsResponse = await axios.get(`${baseURL}/imgs/stats/public`);
        console.log('✅ Estadísticas públicas:', statsResponse.data);
        
        // Probar endpoint de imágenes
        console.log('\n2. Probando /imgs/all/public...');
        const imagesResponse = await axios.get(`${baseURL}/imgs/all/public`);
        console.log('✅ Imágenes públicas:', imagesResponse.data);
        
        // Probar endpoint de verificación
        console.log('\n3. Probando /imgs/verify/public...');
        const verifyResponse = await axios.get(`${baseURL}/imgs/verify/public`);
        console.log('✅ Verificación pública:', verifyResponse.data);
        
    } catch (error) {
        console.error('❌ Error probando endpoints:', error.message);
    }
}

async function checkServerStatus() {
    const baseURL = 'http://192.168.54.11:3001';
    
    console.log('\n🖥️ Verificando estado del servidor...');
    
    try {
        const response = await axios.get(`${baseURL}/`);
        console.log('✅ Servidor respondiendo correctamente');
    } catch (error) {
        console.error('❌ Error conectando al servidor:', error.message);
    }
}

async function main() {
    await checkServerStatus();
    await testEndpoints();
    
    console.log('\n📋 INSTRUCCIONES PARA EL USUARIO:');
    console.log('==================================');
    console.log('1. Abre el navegador y ve a: http://192.168.54.11:3001/images-admin.html');
    console.log('2. Abre las herramientas de desarrollador (F12)');
    console.log('3. Ve a la pestaña "Console"');
    console.log('4. Observa los logs que aparecen');
    console.log('5. Busca patrones como:');
    console.log('   - 📊 [timestamp] Cargando estadísticas... (Ejecución #X)');
    console.log('   - 🖼️ [timestamp] Cargando imágenes... (Ejecución #X)');
    console.log('6. Si ves números que aumentan constantemente, hay consultas infinitas');
    console.log('7. Si solo ves ejecución #1 y #2, está funcionando correctamente');
    console.log('\n🔧 SOLUCIONES APLICADAS:');
    console.log('- Auto-refresh completamente deshabilitado');
    console.log('- Logs detallados con timestamps y contadores');
    console.log('- Stack traces para identificar el origen de las llamadas');
    console.log('- Control de inicialización única');
    
    console.log('\n⚠️ Si el problema persiste:');
    console.log('1. Limpia el caché del navegador (Ctrl+Shift+R)');
    console.log('2. Cierra todas las pestañas del panel de imágenes');
    console.log('3. Verifica que no haya múltiples pestañas abiertas');
    console.log('4. Revisa si hay extensiones del navegador interfiriendo');
}

main().catch(console.error); 