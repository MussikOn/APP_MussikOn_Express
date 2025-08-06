const fs = require('fs');
const path = require('path');

console.log('🔧 Configuración final de IDrive E2...\n');

const envPath = path.join(__dirname, '..', '.env');

try {
    if (fs.existsSync(envPath)) {
        let content = fs.readFileSync(envPath, 'utf8');
        
        // Configurar el endpoint general de IDrive E2
        content = content.replace(
            /IDRIVE_E2_ENDPOINT=https:\/\/musikon-media\.c8q1\.va03\.idrivee2-84\.com/g,
            'IDRIVE_E2_ENDPOINT=https://s3.us-east-1.idrive.com'
        );
        
        // Asegurar que la región sea us-east-1
        content = content.replace(
            /IDRIVE_E2_REGION=Virginia/g,
            'IDRIVE_E2_REGION=us-east-1'
        );
        
        fs.writeFileSync(envPath, content);
        
        console.log('✅ Configuración corregida:');
        console.log('   - Endpoint: https://s3.us-east-1.idrive.com');
        console.log('   - Región: us-east-1');
        console.log('   - Bucket: musikon-media');
        
        console.log('\n📝 Verificando configuración...');
        const updatedContent = fs.readFileSync(envPath, 'utf8');
        const endpointLine = updatedContent.split('\n').find(line => line.includes('IDRIVE_E2_ENDPOINT'));
        const regionLine = updatedContent.split('\n').find(line => line.includes('IDRIVE_E2_REGION'));
        console.log('   - Endpoint:', endpointLine);
        console.log('   - Región:', regionLine);
        
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