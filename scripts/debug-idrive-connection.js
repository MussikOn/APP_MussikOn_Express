const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config();

async function debugIDriveConnection() {
    console.log('🔍 Diagnóstico detallado de conexión con IDrive E2...\n');

    // Verificar variables de entorno
    console.log('📋 Variables de entorno:');
    const envVars = {
        'IDRIVE_E2_ACCESS_KEY': process.env.IDRIVE_E2_ACCESS_KEY,
        'IDRIVE_E2_SECRET_KEY': process.env.IDRIVE_E2_SECRET_KEY,
        'IDRIVE_E2_BUCKET_NAME': process.env.IDRIVE_E2_BUCKET_NAME,
        'IDRIVE_E2_REGION': process.env.IDRIVE_E2_REGION,
        'IDRIVE_E2_ENDPOINT': process.env.IDRIVE_E2_ENDPOINT
    };

    Object.entries(envVars).forEach(([key, value]) => {
        if (value) {
            if (key.includes('KEY')) {
                console.log(`✅ ${key}: ***${value.slice(-4)}`);
            } else {
                console.log(`✅ ${key}: ${value}`);
            }
        } else {
            console.log(`❌ ${key}: NO CONFIGURADA`);
        }
    });

    // Verificar si todas las variables están configuradas
    const missingVars = Object.entries(envVars).filter(([_, value]) => !value);
    if (missingVars.length > 0) {
        console.log('\n❌ Variables faltantes:', missingVars.map(([key]) => key).join(', '));
        console.log('💡 Ejecuta: node scripts/fix-idrive-config.js');
        return;
    }

    console.log('\n🔧 Creando cliente S3...');
    
    try {
        const s3Client = new S3Client({
            region: process.env.IDRIVE_E2_REGION,
            endpoint: process.env.IDRIVE_E2_ENDPOINT,
            credentials: {
                accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY,
                secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY,
            },
            forcePathStyle: true,
        });

        console.log('✅ Cliente S3 creado exitosamente');

        console.log('\n📡 Probando conexión con IDrive E2...');
        
        // Intentar listar objetos
        const command = new ListObjectsV2Command({
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
            MaxKeys: 10, // Solo los primeros 10 objetos
        });

        console.log('🔄 Enviando comando ListObjectsV2...');
        const response = await s3Client.send(command);
        
        console.log('✅ Conexión exitosa!');
        console.log('📊 Respuesta:');
        console.log('  - IsTruncated:', response.IsTruncated);
        console.log('  - KeyCount:', response.KeyCount);
        console.log('  - Objects found:', response.Contents ? response.Contents.length : 0);

        if (response.Contents && response.Contents.length > 0) {
            console.log('\n📁 Primeros objetos encontrados:');
            response.Contents.slice(0, 5).forEach((obj, index) => {
                console.log(`  ${index + 1}. ${obj.Key} (${obj.Size} bytes)`);
            });
        } else {
            console.log('\n⚠️  No se encontraron objetos en el bucket');
        }

        // Probar con prefijos específicos
        console.log('\n🔍 Probando con prefijos específicos...');
        
        const prefixes = ['deposits/', 'profile/', 'post/', 'gallery/'];
        
        for (const prefix of prefixes) {
            try {
                console.log(`\n📂 Probando prefijo: ${prefix}`);
                const prefixCommand = new ListObjectsV2Command({
                    Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
                    Prefix: prefix,
                    MaxKeys: 5,
                });
                
                const prefixResponse = await s3Client.send(prefixCommand);
                const count = prefixResponse.Contents ? prefixResponse.Contents.length : 0;
                console.log(`  ✅ Encontrados ${count} objetos`);
                
                if (prefixResponse.Contents && prefixResponse.Contents.length > 0) {
                    prefixResponse.Contents.forEach((obj, index) => {
                        console.log(`    ${index + 1}. ${obj.Key}`);
                    });
                }
            } catch (error) {
                console.log(`  ❌ Error con prefijo ${prefix}:`, error.message);
            }
        }

    } catch (error) {
        console.log('\n❌ Error en la conexión:');
        console.log('  - Tipo:', error.constructor.name);
        console.log('  - Mensaje:', error.message);
        
        if (error.Code) {
            console.log('  - Código:', error.Code);
        }
        
        if (error.$metadata) {
            console.log('  - Metadata:', error.$metadata);
        }

        console.log('\n💡 Posibles soluciones:');
        console.log('1. Verifica que las credenciales sean correctas');
        console.log('2. Confirma que el bucket "musikon-media" exista');
        console.log('3. Verifica que el endpoint sea correcto');
        console.log('4. Asegúrate de que la región sea "us-east-1"');
    }
}

debugIDriveConnection().catch(console.error); 