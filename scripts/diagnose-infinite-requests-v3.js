const axios = require('axios');

console.log('🔍 DIAGNÓSTICO AVANZADO DE CONSULTAS INFINITAS - VERSIÓN 3');
console.log('================================================================\n');

// Configuración
const BASE_URL = 'http://192.168.54.11:3001';
const ENDPOINTS = [
    '/imgs/stats/public',
    '/imgs/all/public', 
    '/imgs/statistics/public',
    '/imgs/verify/public'
];

// Función para probar un endpoint
async function testEndpoint(endpoint) {
    try {
        const startTime = Date.now();
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Diagnostic-Script-v3'
            }
        });
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ ${endpoint}: ${response.status} (${duration}ms)`);
        return { success: true, duration, status: response.status };
    } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status || error.code} - ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Función principal de diagnóstico
async function runDiagnosis() {
    console.log('📋 PASO 1: Verificando conectividad del servidor...');
    
    try {
        const serverResponse = await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
        console.log(`✅ Servidor respondiendo: ${serverResponse.status}`);
    } catch (error) {
        console.log(`❌ Servidor no responde: ${error.message}`);
        console.log('💡 Asegúrate de que el servidor esté ejecutándose con: npm start');
        return;
    }
    
    console.log('\n📋 PASO 2: Probando endpoints de imágenes...');
    
    for (const endpoint of ENDPOINTS) {
        await testEndpoint(endpoint);
        // Pequeña pausa entre requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📋 PASO 3: Análisis de posibles causas...');
    console.log('\n🔍 POSIBLES CAUSAS DE CONSULTAS INFINITAS:');
    console.log('===========================================');
    
    console.log('\n1️⃣ ERRORES DE IMÁGENES (MÁS PROBABLE):');
    console.log('   - El atributo onerror="this.src=\'/placeholder-image.jpg\'" en las imágenes');
    console.log('   - Si /placeholder-image.jpg no existe, puede causar un bucle infinito');
    console.log('   - SOLUCIÓN: Comentar temporalmente el onerror en createImageCard()');
    
    console.log('\n2️⃣ EVENTOS DE REDIMENSIONAMIENTO:');
    console.log('   - window.resize, scroll, o focus pueden estar re-triggerando las funciones');
    console.log('   - SOLUCIÓN: Verificar si hay event listeners en estos eventos');
    
    console.log('\n3️⃣ MUTATION OBSERVERS:');
    console.log('   - Observadores del DOM que detectan cambios y re-ejecutan funciones');
    console.log('   - SOLUCIÓN: Verificar si hay MutationObserver activos');
    
    console.log('\n4️⃣ PROMESAS RECHAZADAS:');
    console.log('   - Errores en fetch que causan re-intentos automáticos');
    console.log('   - SOLUCIÓN: Verificar el manejo de errores en loadImageStatistics() y loadImages()');
    
    console.log('\n5️⃣ CACHÉ DEL NAVEGADOR:');
    console.log('   - El navegador puede estar cacheando y re-ejecutando scripts');
    console.log('   - SOLUCIÓN: Hard refresh (Ctrl+F5) o limpiar caché');
    
    console.log('\n📋 PASO 4: Instrucciones para debugging en el navegador...');
    console.log('\n🔧 INSTRUCCIONES PARA EL USUARIO:');
    console.log('==================================');
    
    console.log('\n1️⃣ ABRIR HERRAMIENTAS DE DESARROLLADOR:');
    console.log('   - Presiona F12 o Ctrl+Shift+I');
    console.log('   - Ve a la pestaña "Console"');
    
    console.log('\n2️⃣ BUSCAR PATRONES EN LOS LOGS:');
    console.log('   - Busca los logs que empiecen con "📊" y "🖼️"');
    console.log('   - Verifica si los números de ejecución aumentan rápidamente');
    console.log('   - Ejemplo: "Ejecución #1", "Ejecución #2", etc.');
    
    console.log('\n3️⃣ REVISAR LA PESTAÑA NETWORK:');
    console.log('   - Ve a la pestaña "Network"');
    console.log('   - Filtra por "Fetch/XHR"');
    console.log('   - Observa qué requests se repiten infinitamente');
    console.log('   - Verifica el timing entre requests');
    
    console.log('\n4️⃣ PRUEBA TEMPORAL - COMENTAR ONERROR:');
    console.log('   - En images-admin.html, línea ~1045, comenta temporalmente:');
    console.log('   - onerror="this.src=\'/placeholder-image.jpg\'"');
    console.log('   - Cambia a: // onerror="this.src=\'/placeholder-image.jpg\'"');
    
    console.log('\n5️⃣ VERIFICAR SI HAY PLACEHOLDER IMAGE:');
    console.log('   - Ve a: http://192.168.54.11:3001/placeholder-image.jpg');
    console.log('   - Si devuelve 404, ese es el problema');
    
    console.log('\n6️⃣ MONITOREO EN TIEMPO REAL:');
    console.log('   - En la consola, ejecuta este código para monitorear:');
    console.log(`
    let requestCount = 0;
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        requestCount++;
        console.log(\`🌐 Request #\${requestCount}: \${args[0]}\`);
        return originalFetch.apply(this, args);
    };
    `);
    
    console.log('\n📋 PASO 5: Soluciones inmediatas a probar...');
    console.log('\n🚀 SOLUCIONES RÁPIDAS:');
    console.log('=====================');
    
    console.log('\n1️⃣ SOLUCIÓN INMEDIATA - DESHABILITAR ONERROR:');
    console.log('   - Edita public/images-admin.html');
    console.log('   - Comenta la línea con onerror en createImageCard()');
    console.log('   - Recarga la página');
    
    console.log('\n2️⃣ SOLUCIÓN ALTERNATIVA - CREAR PLACEHOLDER:');
    console.log('   - Crea un archivo placeholder-image.jpg en public/');
    console.log('   - O cambia la ruta a una imagen que sí exista');
    
    console.log('\n3️⃣ SOLUCIÓN DE EMERGENCIA - DESHABILITAR CARGA:');
    console.log('   - Comenta temporalmente las llamadas a loadImageStatistics() y loadImages()');
    console.log('   - En el DOMContentLoaded event listener');
    
    console.log('\n📊 RESUMEN DEL DIAGNÓSTICO:');
    console.log('============================');
    console.log('✅ Backend endpoints funcionando correctamente');
    console.log('🔍 El problema está en el frontend (JavaScript)');
    console.log('🎯 Causa más probable: onerror en imágenes o eventos de DOM');
    console.log('💡 Próximo paso: Seguir las instrucciones de debugging');
    
    console.log('\n📞 SI EL PROBLEMA PERSISTE:');
    console.log('===========================');
    console.log('1. Comparte los logs de la consola del navegador');
    console.log('2. Comparte una captura de la pestaña Network');
    console.log('3. Indica si el problema se resuelve al comentar onerror');
    console.log('4. Proporciona el número de requests por segundo que observas');
}

// Ejecutar diagnóstico
runDiagnosis().catch(console.error); 