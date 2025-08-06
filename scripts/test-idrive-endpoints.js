const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config();

async function testIDriveEndpoints() {
    console.log('🔍 Probando diferentes endpoints de IDrive E2...\n');

    const endpoints = [
        'https://s3.us-east-1.idrive.com',
        'https://s3.idrive.com',
        'https://idrive.com',
        'https://musikon-media.c8q1.va03.idrivee2-84.com',
        'https://c8q1.va03.idrivee2-84.com'
    ];

    const regions = ['us-east-1', 'Virginia', 'virginia'];

    for (const endpoint of endpoints) {
        for (const region of regions) {
            console.log(`\n🔧 Probando: ${endpoint} (región: ${region})`);
            
            try {
                const s3Client = new S3Client({
                    region: region,
                    endpoint: endpoint,
                    credentials: {
                        accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY,
                        secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY,
                    },
                    forcePathStyle: true,
                });

                const command = new ListObjectsV2Command({
                    Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
                    MaxKeys: 1,
                });

                const response = await s3Client.send(command);
                console.log(`✅ ¡ÉXITO! Endpoint: ${endpoint}, Región: ${region}`);
                console.log(`   - Objetos encontrados: ${response.Contents ? response.Contents.length : 0}`);
                
                if (response.Contents && response.Contents.length > 0) {
                    console.log(`   - Primer objeto: ${response.Contents[0].Key}`);
                }
                
                // Si llegamos aquí, encontramos la configuración correcta
                console.log('\n🎉 ¡Configuración correcta encontrada!');
                console.log(`Endpoint: ${endpoint}`);
                console.log(`Región: ${region}`);
                
                // Actualizar el archivo .env
                const fs = require('fs');
                const path = require('path');
                const envPath = path.join(__dirname, '..', '.env');
                
                if (fs.existsSync(envPath)) {
                    let content = fs.readFileSync(envPath, 'utf8');
                    content = content.replace(
                        /IDRIVE_E2_ENDPOINT=.*/g,
                        `IDRIVE_E2_ENDPOINT=${endpoint}`
                    );
                    content = content.replace(
                        /IDRIVE_E2_REGION=.*/g,
                        `IDRIVE_E2_REGION=${region}`
                    );
                    
                    fs.writeFileSync(envPath, content);
                    console.log('✅ Archivo .env actualizado automáticamente');
                }
                
                return;
                
            } catch (error) {
                console.log(`❌ Error: ${error.message}`);
            }
        }
    }
    
    console.log('\n❌ No se encontró una configuración válida');
    console.log('💡 Verifica tu configuración de IDrive E2');
}

testIDriveEndpoints().catch(console.error); 