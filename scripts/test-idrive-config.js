const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Configuraciones de prueba para IDrive E2
const testConfigs = [
  {
    name: 'Configuración actual',
    region: process.env.IDRIVE_E2_REGION || 'us-east-1',
    endpoint: process.env.IDRIVE_E2_ENDPOINT,
    forcePathStyle: true
  },
  {
    name: 'IDrive E2 Virginia (c8q1.va03)',
    region: 'us-east-1',
    endpoint: 'https://s3.us-east-1.amazonaws.com',
    forcePathStyle: false
  },
  {
    name: 'IDrive E2 Virginia (path style)',
    region: 'us-east-1',
    endpoint: 'https://s3.us-east-1.amazonaws.com',
    forcePathStyle: true
  },
  {
    name: 'IDrive E2 directo',
    region: 'us-east-1',
    endpoint: 'https://musikon-media.c8q1.va03.idrivee2-84.com',
    forcePathStyle: true
  },
  {
    name: 'IDrive E2 sin path style',
    region: 'us-east-1',
    endpoint: 'https://musikon-media.c8q1.va03.idrivee2-84.com',
    forcePathStyle: false
  }
];

const BUCKET_NAME = process.env.IDRIVE_E2_BUCKET_NAME;
const ACCESS_KEY = process.env.IDRIVE_E2_ACCESS_KEY;
const SECRET_KEY = process.env.IDRIVE_E2_SECRET_KEY;

/**
 * Probar una configuración específica
 */
async function testConfig(config) {
  console.log(`\n🧪 Probando: ${config.name}`);
  console.log(`   Endpoint: ${config.endpoint}`);
  console.log(`   Region: ${config.region}`);
  console.log(`   Force Path Style: ${config.forcePathStyle}`);

  try {
    const s3Client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
      },
      forcePathStyle: config.forcePathStyle,
    });

    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 5,
    });

    const startTime = Date.now();
    const response = await s3Client.send(listCommand);
    const endTime = Date.now();

    const files = response.Contents || [];
    console.log(`   ✅ Éxito! (${endTime - startTime}ms)`);
    console.log(`   📁 Archivos encontrados: ${files.length}`);
    
    if (files.length > 0) {
      console.log('   📄 Primeros archivos:');
      files.slice(0, 3).forEach((file, index) => {
        console.log(`      ${index + 1}. ${file.Key} (${file.Size} bytes)`);
      });
    }

    return { success: true, files: files.length, time: endTime - startTime };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Probar todas las configuraciones
 */
async function testAllConfigs() {
  console.log('🔍 Probando diferentes configuraciones de IDrive E2...\n');
  console.log(`📋 Configuración actual:`);
  console.log(`   - Bucket: ${BUCKET_NAME}`);
  console.log(`   - Access Key: ${ACCESS_KEY ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`   - Secret Key: ${SECRET_KEY ? '✅ Configurado' : '❌ No configurado'}`);

  if (!ACCESS_KEY || !SECRET_KEY || !BUCKET_NAME) {
    console.log('\n❌ Variables de entorno incompletas. Configura:');
    console.log('   - IDRIVE_E2_ACCESS_KEY');
    console.log('   - IDRIVE_E2_SECRET_KEY');
    console.log('   - IDRIVE_E2_BUCKET_NAME');
    return;
  }

  const results = [];

  for (const config of testConfigs) {
    const result = await testConfig(config);
    results.push({ ...config, ...result });
  }

  // Mostrar resumen
  console.log('\n📊 Resumen de resultados:');
  const successfulConfigs = results.filter(r => r.success);
  
  if (successfulConfigs.length > 0) {
    console.log(`✅ ${successfulConfigs.length} configuraciones exitosas:`);
    successfulConfigs.forEach((config, index) => {
      console.log(`   ${index + 1}. ${config.name} (${config.files} archivos, ${config.time}ms)`);
    });

    // Recomendar la mejor configuración
    const bestConfig = successfulConfigs.reduce((best, current) => 
      current.time < best.time ? current : best
    );
    
    console.log(`\n🏆 Mejor configuración: ${bestConfig.name}`);
    console.log(`   Endpoint: ${bestConfig.endpoint}`);
    console.log(`   Region: ${bestConfig.region}`);
    console.log(`   Force Path Style: ${bestConfig.forcePathStyle}`);
    
    console.log('\n💡 Para usar esta configuración, actualiza tu archivo .env:');
    console.log(`   IDRIVE_E2_ENDPOINT=${bestConfig.endpoint}`);
    console.log(`   IDRIVE_E2_REGION=${bestConfig.region}`);
    console.log(`   IDRIVE_E2_FORCE_PATH_STYLE=${bestConfig.forcePathStyle}`);
  } else {
    console.log('❌ Ninguna configuración funcionó.');
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Verifica que las credenciales sean correctas');
    console.log('   2. Verifica que el bucket exista');
    console.log('   3. Verifica que tengas permisos de acceso');
    console.log('   4. Contacta al soporte de IDrive E2');
  }
}

// Ejecutar pruebas
if (require.main === module) {
  testAllConfigs().catch(console.error);
}

module.exports = { testAllConfigs, testConfig }; 