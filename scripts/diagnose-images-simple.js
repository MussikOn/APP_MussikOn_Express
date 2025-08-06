const { S3Client, ListObjectsV2Command, HeadObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Configuración de IDrive E2
const s3Client = new S3Client({
  region: process.env.IDRIVE_E2_REGION || 'us-east-1',
  endpoint: process.env.IDRIVE_E2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY,
    secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.IDRIVE_E2_BUCKET_NAME;

/**
 * Diagnóstico simplificado del sistema de imágenes
 */
async function diagnoseImagesSimple() {
  console.log('🔍 Iniciando diagnóstico simplificado del sistema de imágenes...\n');

  try {
    // 1. Verificar configuración de IDrive E2
    console.log('📋 1. Verificando configuración de IDrive E2...');
    console.log(`   - Endpoint: ${process.env.IDRIVE_E2_ENDPOINT || 'No configurado'}`);
    console.log(`   - Region: ${process.env.IDRIVE_E2_REGION || 'No configurado'}`);
    console.log(`   - Bucket: ${BUCKET_NAME || 'No configurado'}`);
    console.log(`   - Access Key: ${process.env.IDRIVE_E2_ACCESS_KEY ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`   - Secret Key: ${process.env.IDRIVE_E2_SECRET_KEY ? '✅ Configurado' : '❌ No configurado'}\n`);

    // Verificar que todas las variables estén configuradas
    if (!process.env.IDRIVE_E2_ENDPOINT || !process.env.IDRIVE_E2_ACCESS_KEY || !process.env.IDRIVE_E2_SECRET_KEY || !BUCKET_NAME) {
      console.log('❌ Variables de entorno de IDrive E2 incompletas. Por favor, configura:');
      console.log('   - IDRIVE_E2_ENDPOINT');
      console.log('   - IDRIVE_E2_ACCESS_KEY');
      console.log('   - IDRIVE_E2_SECRET_KEY');
      console.log('   - IDRIVE_E2_BUCKET_NAME');
      return;
    }

    // 2. Verificar conexión a IDrive E2
    console.log('🔗 2. Verificando conexión a IDrive E2...');
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        MaxKeys: 1,
      });
      await s3Client.send(listCommand);
      console.log('   ✅ Conexión a IDrive E2 exitosa\n');
    } catch (error) {
      console.log('   ❌ Error conectando a IDrive E2:', error.message);
      console.log('   💡 Posibles causas:');
      console.log('      - Credenciales incorrectas');
      console.log('      - Endpoint incorrecto');
      console.log('      - Bucket no existe o no tienes permisos');
      console.log('      - Problemas de red');
      return;
    }

    // 3. Listar archivos en IDrive E2
    console.log('📁 3. Listando archivos en IDrive E2...');
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        MaxKeys: 100,
      });
      const response = await s3Client.send(listCommand);
      const s3Files = response.Contents || [];
      console.log(`   ✅ Encontrados ${s3Files.length} archivos en IDrive E2`);
      
      if (s3Files.length > 0) {
        console.log('   📄 Primeros 10 archivos:');
        s3Files.slice(0, 10).forEach((file, index) => {
          console.log(`      ${index + 1}. ${file.Key} (${file.Size} bytes) - ${file.LastModified}`);
        });
      } else {
        console.log('   ⚠️  No se encontraron archivos en el bucket');
      }
      console.log('');
    } catch (error) {
      console.log('   ❌ Error listando archivos:', error.message);
    }

    // 4. Verificar URLs de acceso
    console.log('🔗 4. Verificando URLs de acceso...');
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        MaxKeys: 5,
      });
      const response = await s3Client.send(listCommand);
      const s3Files = response.Contents || [];

      if (s3Files.length > 0) {
        console.log('   📄 Probando URLs de acceso:');
        
        for (const file of s3Files.slice(0, 3)) {
          const directUrl = `${process.env.IDRIVE_E2_ENDPOINT}/${BUCKET_NAME}/${file.Key}`;
          console.log(`   📄 Archivo: ${file.Key}`);
          console.log(`      URL directa: ${directUrl}`);
          
          try {
            const response = await fetch(directUrl, { method: 'HEAD' });
            if (response.ok) {
              console.log(`      ✅ URL accesible (status: ${response.status})`);
            } else {
              console.log(`      ❌ URL no accesible (status: ${response.status})`);
            }
          } catch (fetchError) {
            console.log(`      ❌ Error accediendo a URL: ${fetchError.message}`);
          }
          console.log('');
        }
      } else {
        console.log('   ⚠️  No hay archivos para probar URLs');
      }
    } catch (error) {
      console.log('   ❌ Error verificando URLs:', error.message);
    }

    // 5. Verificar permisos del bucket
    console.log('🔐 5. Verificando permisos del bucket...');
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: 'test-permissions',
      });
      await s3Client.send(headCommand);
    } catch (error) {
      if (error.name === 'NotFound') {
        console.log('   ✅ Permisos de lectura correctos (archivo de prueba no existe, pero se puede acceder al bucket)');
      } else {
        console.log('   ❌ Error de permisos:', error.message);
      }
    }
    console.log('');

    // 6. Recomendaciones
    console.log('💡 6. Recomendaciones:');
    console.log('   - Si las imágenes están en IDrive E2 pero no aparecen en las consultas:');
    console.log('     * Verifica que los registros en Firestore tengan las URLs correctas');
    console.log('     * Asegúrate de que las URLs apunten al endpoint correcto de IDrive E2');
    console.log('     * Verifica que los archivos tengan permisos de lectura pública');
    console.log('   - Si las URLs no son accesibles:');
    console.log('     * Verifica la configuración del endpoint de IDrive E2');
    console.log('     * Asegúrate de que el bucket tenga permisos de lectura pública');
    console.log('     * Considera usar URLs firmadas para acceso privado');
    console.log('   - Para sincronizar archivos faltantes:');
    console.log('     * Ejecuta: npm run images:sync');

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
}

// Ejecutar diagnóstico
if (require.main === module) {
  diagnoseImagesSimple();
}

module.exports = { diagnoseImagesSimple }; 