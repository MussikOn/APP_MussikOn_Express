const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo endpoint de IDrive E2 (versión final)...\n');

const envPath = path.join(__dirname, '..', '.env');

try {
    if (fs.existsSync(envPath)) {
        let content = fs.readFileSync(envPath, 'utf8');
        
        // Corregir el endpoint al valor específico del bucket
        content = content.replace(
            /IDRIVE_E2_ENDPOINT=https:\/\/s3\.Virginia\.idrive\.com/g,
            'IDRIVE_E2_ENDPOINT=https://musikon-media.c8q1.va03.idrivee2-84.com'
        );
        
        fs.writeFileSync(envPath, content);
        
        console.log('✅ Endpoint corregido exitosamente!');
        console.log('   - Nuevo endpoint: https://musikon-media.c8q1.va03.idrivee2-84.com');
        
        console.log('\n📝 Verificando contenido actualizado...');
        const updatedContent = fs.readFileSync(envPath, 'utf8');
        const endpointLine = updatedContent.split('\n').find(line => line.includes('IDRIVE_E2_ENDPOINT'));
        console.log('   - Línea del endpoint:', endpointLine);
        
        console.log('\n🚀 Ahora puedes:');
        console.log('1. Reiniciar el servidor: npm start');
        console.log('2. Probar la conexión: node scripts/debug-idrive-connection.js');
        console.log('3. Probar el endpoint: curl http://localhost:3001/imgs/all/idrive/public');
        
    } else {
        console.log('❌ No se encontró el archivo .env');
    }
} catch (error) {
    console.error('❌ Error actualizando configuración:', error.message);
} 