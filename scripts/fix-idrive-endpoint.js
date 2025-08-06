const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo endpoint de IDrive E2...\n');

const envPath = path.join(__dirname, '..', '.env');

try {
    if (fs.existsSync(envPath)) {
        let content = fs.readFileSync(envPath, 'utf8');
        
        // Revertir el endpoint al valor original que funcionaba
        content = content.replace(
            /IDRIVE_E2_ENDPOINT=https:\/\/s3\.us-east-1\.idrive\.com/g,
            'IDRIVE_E2_ENDPOINT=https://musikon-media.c8q1.va03.idrivee2-84.com'
        );
        
        // Mantener la región como Virginia (que es correcta para tu configuración)
        content = content.replace(
            /IDRIVE_E2_REGION=us-east-1/g,
            'IDRIVE_E2_REGION=Virginia'
        );
        
        fs.writeFileSync(envPath, content);
        
        console.log('✅ Endpoint corregido:');
        console.log('   - Endpoint restaurado a: https://musikon-media.c8q1.va03.idrivee2-84.com');
        console.log('   - Región mantenida como: Virginia');
        
        console.log('\n📝 Contenido actualizado del archivo .env:');
        console.log(content);
        
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