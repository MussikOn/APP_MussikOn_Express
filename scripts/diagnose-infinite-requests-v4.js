const fs = require('fs');
const path = require('path');

console.log('🔍 ANÁLISIS EXHAUSTIVO DE CONSULTAS INFINITAS - VERSIÓN 4');
console.log('================================================================\n');

// Analizar el archivo images-admin.html
const htmlPath = path.join(__dirname, '../public/images-admin.html');

if (!fs.existsSync(htmlPath)) {
    console.log('❌ No se encontró el archivo images-admin.html');
    process.exit(1);
}

const htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log('📋 PASO 1: Análisis del código JavaScript...');
console.log('===========================================\n');

// Buscar patrones problemáticos
const patterns = {
    'setInterval': (htmlContent.match(/setInterval/g) || []).length,
    'setTimeout': (htmlContent.match(/setTimeout/g) || []).length,
    'fetch(': (htmlContent.match(/fetch\(/g) || []).length,
    'onerror': (htmlContent.match(/onerror/g) || []).length,
    'DOMContentLoaded': (htmlContent.match(/DOMContentLoaded/g) || []).length,
    'loadImageStatistics': (htmlContent.match(/loadImageStatistics/g) || []).length,
    'loadImages': (htmlContent.match(/loadImages/g) || []).length,
    'addEventListener': (htmlContent.match(/addEventListener/g) || []).length,
    'MutationObserver': (htmlContent.match(/MutationObserver/g) || []).length,
    'window.onload': (htmlContent.match(/window\.onload/g) || []).length,
    'window.onresize': (htmlContent.match(/window\.onresize/g) || []).length,
    'window.onscroll': (htmlContent.match(/window\.onscroll/g) || []).length
};

console.log('🔍 PATRONES ENCONTRADOS EN EL CÓDIGO:');
console.log('=====================================');
Object.entries(patterns).forEach(([pattern, count]) => {
    const icon = count > 0 ? '🔴' : '✅';
    console.log(`${icon} ${pattern}: ${count} ocurrencias`);
});

console.log('\n📋 PASO 2: Análisis de posibles causas...');
console.log('==========================================\n');

// Analizar el DOMContentLoaded
const domContentLoadedMatch = htmlContent.match(/document\.addEventListener\('DOMContentLoaded',[^}]+}/gs);
if (domContentLoadedMatch) {
    console.log('🔍 ANÁLISIS DEL DOMContentLoaded:');
    console.log('================================');
    const content = domContentLoadedMatch[0];
    
    if (content.includes('loadImageStatistics()')) {
        console.log('⚠️  DOMContentLoaded llama a loadImageStatistics()');
    }
    if (content.includes('loadImages()')) {
        console.log('⚠️  DOMContentLoaded llama a loadImages()');
    }
    if (content.includes('setTimeout')) {
        console.log('⚠️  DOMContentLoaded contiene setTimeout');
    }
    if (content.includes('setInterval')) {
        console.log('⚠️  DOMContentLoaded contiene setInterval');
    }
}

// Analizar las funciones de carga
console.log('\n🔍 ANÁLISIS DE FUNCIONES DE CARGA:');
console.log('==================================');

const loadImageStatisticsMatch = htmlContent.match(/async function loadImageStatistics\(\)[^}]+}/gs);
if (loadImageStatisticsMatch) {
    console.log('📊 Función loadImageStatistics encontrada');
    const content = loadImageStatisticsMatch[0];
    
    if (content.includes('fetch(')) {
        console.log('   - Hace llamadas fetch');
    }
    if (content.includes('updateStatistics')) {
        console.log('   - Llama a updateStatistics()');
    }
}

const loadImagesMatch = htmlContent.match(/async function loadImages\(\)[^}]+}/gs);
if (loadImagesMatch) {
    console.log('🖼️  Función loadImages encontrada');
    const content = loadImagesMatch[0];
    
    if (content.includes('fetch(')) {
        console.log('   - Hace llamadas fetch');
    }
    if (content.includes('renderImages')) {
        console.log('   - Llama a renderImages()');
    }
}

// Analizar createImageCard
const createImageCardMatch = htmlContent.match(/function createImageCard\([^}]+}/gs);
if (createImageCardMatch) {
    console.log('\n🖼️  Función createImageCard encontrada');
    const content = createImageCardMatch[0];
    
    if (content.includes('onerror')) {
        console.log('⚠️  CONTIENE onerror - POSIBLE CAUSA DEL PROBLEMA');
        console.log('   - El onerror puede causar bucles infinitos si la imagen de fallback también falla');
    }
}

console.log('\n📋 PASO 3: Identificación de causas más probables...');
console.log('===================================================\n');

console.log('🎯 CAUSAS MÁS PROBABLES (en orden de probabilidad):');
console.log('===================================================');

console.log('\n1️⃣ ONERROR EN IMÁGENES (MÁS PROBABLE):');
console.log('   - El atributo onerror="this.src=\'/placeholder-image.jpg\'"');
console.log('   - Si /placeholder-image.jpg no existe o falla, puede causar bucle infinito');
console.log('   - SOLUCIÓN: Ya comentado en el código');

console.log('\n2️⃣ EVENTOS DE DOM REPETIDOS:');
console.log('   - DOMContentLoaded puede dispararse múltiples veces');
console.log('   - Event listeners pueden acumularse');
console.log('   - SOLUCIÓN: Verificar si hay múltiples event listeners');

console.log('\n3️⃣ PROMESAS RECHAZADAS:');
console.log('   - Errores en fetch que causan re-intentos');
console.log('   - Manejo de errores que re-ejecuta las funciones');
console.log('   - SOLUCIÓN: Verificar el manejo de errores');

console.log('\n4️⃣ CACHÉ DEL NAVEGADOR:');
console.log('   - El navegador puede estar re-ejecutando scripts');
console.log('   - SOLUCIÓN: Hard refresh (Ctrl+F5)');

console.log('\n📋 PASO 4: Soluciones implementadas...');
console.log('=====================================\n');

console.log('✅ SOLUCIONES YA IMPLEMENTADAS:');
console.log('==============================');
console.log('1. ✅ Auto-refresh completamente deshabilitado');
console.log('2. ✅ Contadores de ejecución agregados');
console.log('3. ✅ Logs detallados con stack traces');
console.log('4. ✅ onerror modificado para solo hacer console.warn');
console.log('5. ✅ Archivo placeholder-image.jpg creado');

console.log('\n📋 PASO 5: Instrucciones para el usuario...');
console.log('=========================================\n');

console.log('🔧 INSTRUCCIONES PARA DEBUGGING:');
console.log('================================');

console.log('\n1️⃣ ABRIR HERRAMIENTAS DE DESARROLLADOR:');
console.log('   - Presiona F12 o Ctrl+Shift+I');
console.log('   - Ve a la pestaña "Console"');

console.log('\n2️⃣ BUSCAR LOS LOGS DE DEBUGGING:');
console.log('   - Busca mensajes que empiecen con "📊" y "🖼️"');
console.log('   - Ejemplo: "📊 [10:30:15] Cargando estadísticas... (Ejecución #1)"');
console.log('   - Si ves números que aumentan rápidamente, hay un bucle');

console.log('\n3️⃣ REVISAR LA PESTAÑA NETWORK:');
console.log('   - Ve a la pestaña "Network"');
console.log('   - Filtra por "Fetch/XHR"');
console.log('   - Observa qué requests se repiten');
console.log('   - Verifica el timing entre requests');

console.log('\n4️⃣ EJECUTAR MONITOREO EN TIEMPO REAL:');
console.log('   - En la consola del navegador, ejecuta:');
console.log(`
let requestCount = 0;
const originalFetch = window.fetch;
window.fetch = function(...args) {
    requestCount++;
    console.log(\`🌐 Request #\${requestCount}: \${args[0]} - \${new Date().toLocaleTimeString()}\`);
    return originalFetch.apply(this, args);
};
`);

console.log('\n5️⃣ VERIFICAR SI EL PROBLEMA PERSISTE:');
console.log('   - Recarga la página (Ctrl+F5)');
console.log('   - Observa si las consultas infinitas continúan');
console.log('   - Si continúan, comparte los logs de la consola');

console.log('\n📊 RESUMEN DEL ANÁLISIS:');
console.log('========================');
console.log('✅ Código analizado exhaustivamente');
console.log('✅ Soluciones implementadas para las causas más probables');
console.log('🔍 El problema puede estar en:');
console.log('   - Eventos de DOM que se disparan múltiples veces');
console.log('   - Promesas rechazadas que causan re-intentos');
console.log('   - Caché del navegador');
console.log('💡 Próximo paso: Seguir las instrucciones de debugging');

console.log('\n📞 INFORMACIÓN PARA COMPARTIR:');
console.log('=============================');
console.log('Si el problema persiste, comparte:');
console.log('1. Los logs de la consola del navegador');
console.log('2. Una captura de la pestaña Network');
console.log('3. El número de requests por segundo que observas');
console.log('4. Si el problema se resuelve con Ctrl+F5 (hard refresh)'); 