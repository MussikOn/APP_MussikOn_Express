const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo configuración de IDrive E2...\n');

const envPath = path.join(__dirname, '..', '.env');

try {
    if (fs.existsSync(envPath)) {
        let content = fs.readFileSync(envPath, 'utf8');
        
        // Corregir la región
        content = content.replace(
            /IDRIVE_E2_REGION=Virginia/g,
            'IDRIVE_E2_REGION=us-east-1'
        );
        
        // Asegurar que el endpoint esté correcto
        content = content.replace(
            /IDRIVE_E2_ENDPOINT=https:\/\/musikon-media\.c8q1\.va03\.idrivee2-84\.com/g,
            'IDRIVE_E2_ENDPOINT=https://s3.us-east-1.idrive.com'
        );
        
        fs.writeFileSync(envPath, content);
        
        console.log('✅ Configuración corregida:');
        console.log('   - Región cambiada de "Virginia" a "us-east-1"');
        console.log('   - Endpoint actualizado a "https://s3.us-east-1.idrive.com"');
        
        console.log('\n📝 Contenido actualizado del archivo .env:');
        console.log(content);
        
        console.log('\n🚀 Ahora puedes:');
        console.log('1. Reiniciar el servidor: npm start');
        console.log('2. Probar el endpoint: curl http://localhost:3001/imgs/all/idrive/public');
        console.log('3. Abrir el panel de imágenes: http://localhost:3001/images-admin.html');
        
    } else {
        console.log('❌ No se encontró el archivo .env');
    }
} catch (error) {
    console.error('❌ Error actualizando configuración:', error.message);
} 