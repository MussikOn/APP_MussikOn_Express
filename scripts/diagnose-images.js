const { S3Client, ListObjectsV2Command, HeadObjectCommand } = require('@aws-sdk/client-s3');
const admin = require('firebase-admin');
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

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

/**
 * Diagnóstico completo del sistema de imágenes
 */
async function diagnoseImages() {
  console.log('🔍 Iniciando diagnóstico del sistema de imágenes...\n');

  try {
    // 1. Verificar configuración de IDrive E2
    console.log('📋 1. Verificando configuración de IDrive E2...');
    console.log(`   - Endpoint: ${process.env.IDRIVE_E2_ENDPOINT}`);
    console.log(`   - Region: ${process.env.IDRIVE_E2_REGION}`);
    console.log(`   - Bucket: ${BUCKET_NAME}`);
    console.log(`   - Access Key: ${process.env.IDRIVE_E2_ACCESS_KEY ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`   - Secret Key: ${process.env.IDRIVE_E2_SECRET_KEY ? '✅ Configurado' : '❌ No configurado'}\n`);

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
        console.log('   📄 Primeros 5 archivos:');
        s3Files.slice(0, 5).forEach((file, index) => {
          console.log(`      ${index + 1}. ${file.Key} (${file.Size} bytes)`);
        });
      }
      console.log('');
    } catch (error) {
      console.log('   ❌ Error listando archivos:', error.message);
    }

    // 4. Verificar registros en Firestore
    console.log('🔥 4. Verificando registros en Firestore...');
    try {
      // Verificar colección 'images'
      const imagesSnapshot = await db.collection('images').limit(10).get();
      console.log(`   ✅ Colección 'images': ${imagesSnapshot.size} registros`);

      // Verificar colección 'image_uploads'
      const imageUploadsSnapshot = await db.collection('image_uploads').limit(10).get();
      console.log(`   ✅ Colección 'image_uploads': ${imageUploadsSnapshot.size} registros`);

      // Mostrar algunos registros de ejemplo
      if (imagesSnapshot.size > 0) {
        console.log('   📄 Ejemplos de registros en "images":');
        imagesSnapshot.docs.slice(0, 3).forEach((doc, index) => {
          const data = doc.data();
          console.log(`      ${index + 1}. ID: ${doc.id}`);
          console.log(`         Key: ${data.key || 'N/A'}`);
          console.log(`         URL: ${data.url ? data.url.substring(0, 50) + '...' : 'N/A'}`);
          console.log(`         User: ${data.userId || 'N/A'}`);
          console.log(`         Category: ${data.category || 'N/A'}`);
          console.log('');
        });
      }

      if (imageUploadsSnapshot.size > 0) {
        console.log('   📄 Ejemplos de registros en "image_uploads":');
        imageUploadsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
          const data = doc.data();
          console.log(`      ${index + 1}. ID: ${doc.id}`);
          console.log(`         Filename: ${data.filename || 'N/A'}`);
          console.log(`         URL: ${data.url ? data.url.substring(0, 50) + '...' : 'N/A'}`);
          console.log(`         User: ${data.userId || 'N/A'}`);
          console.log(`         Size: ${data.size || 'N/A'} bytes`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('   ❌ Error verificando Firestore:', error.message);
    }

    // 5. Verificar sincronización entre IDrive E2 y Firestore
    console.log('🔄 5. Verificando sincronización...');
    try {
      // Obtener archivos de IDrive E2
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        MaxKeys: 50,
      });
      const s3Response = await s3Client.send(listCommand);
      const s3Files = s3Response.Contents || [];

      // Obtener registros de Firestore
      const firestoreSnapshot = await db.collection('images').limit(50).get();
      const firestoreFiles = firestoreSnapshot.docs.map(doc => doc.data());

      console.log(`   📊 Archivos en IDrive E2: ${s3Files.length}`);
      console.log(`   📊 Registros en Firestore: ${firestoreFiles.length}`);

      // Verificar archivos que están en S3 pero no en Firestore
      const s3Keys = s3Files.map(file => file.Key);
      const firestoreKeys = firestoreFiles.map(file => file.key).filter(Boolean);
      
      const onlyInS3 = s3Keys.filter(key => !firestoreKeys.includes(key));
      const onlyInFirestore = firestoreKeys.filter(key => !s3Keys.includes(key));

      console.log(`   ⚠️  Archivos solo en IDrive E2: ${onlyInS3.length}`);
      console.log(`   ⚠️  Registros solo en Firestore: ${onlyInFirestore.length}`);

      if (onlyInS3.length > 0) {
        console.log('   📄 Archivos solo en IDrive E2 (primeros 5):');
        onlyInS3.slice(0, 5).forEach((key, index) => {
          console.log(`      ${index + 1}. ${key}`);
        });
      }

      if (onlyInFirestore.length > 0) {
        console.log('   📄 Registros solo en Firestore (primeros 5):');
        onlyInFirestore.slice(0, 5).forEach((key, index) => {
          console.log(`      ${index + 1}. ${key}`);
        });
      }
      console.log('');
    } catch (error) {
      console.log('   ❌ Error verificando sincronización:', error.message);
    }

    // 6. Verificar URLs de acceso
    console.log('🔗 6. Verificando URLs de acceso...');
    try {
      const testImage = await db.collection('images').limit(1).get();
      if (!testImage.empty) {
        const imageData = testImage.docs[0].data();
        const imageUrl = imageData.url;
        
        console.log(`   📄 URL de ejemplo: ${imageUrl}`);
        
        // Verificar si la URL es accesible
        try {
          const response = await fetch(imageUrl, { method: 'HEAD' });
          if (response.ok) {
            console.log('   ✅ URL accesible');
          } else {
            console.log(`   ❌ URL no accesible (status: ${response.status})`);
          }
        } catch (fetchError) {
          console.log('   ❌ Error accediendo a URL:', fetchError.message);
        }
      } else {
        console.log('   ⚠️  No hay imágenes para probar URLs');
      }
      console.log('');
    } catch (error) {
      console.log('   ❌ Error verificando URLs:', error.message);
    }

    // 7. Recomendaciones
    console.log('💡 7. Recomendaciones:');
    console.log('   - Verifica que las variables de entorno de IDrive E2 estén configuradas correctamente');
    console.log('   - Asegúrate de que el bucket tenga los permisos correctos');
    console.log('   - Verifica que las URLs generadas sean accesibles');
    console.log('   - Considera sincronizar archivos que están solo en IDrive E2 o solo en Firestore');
    console.log('   - Revisa los logs del sistema para errores específicos');

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
}

/**
 * Función para sincronizar archivos faltantes
 */
async function syncMissingFiles() {
  console.log('🔄 Iniciando sincronización de archivos faltantes...\n');

  try {
    // Obtener archivos de IDrive E2
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 100,
    });
    const s3Response = await s3Client.send(listCommand);
    const s3Files = s3Response.Contents || [];

    // Obtener registros de Firestore
    const firestoreSnapshot = await db.collection('images').limit(100).get();
    const firestoreFiles = firestoreSnapshot.docs.map(doc => doc.data());

    const s3Keys = s3Files.map(file => file.Key);
    const firestoreKeys = firestoreFiles.map(file => file.key).filter(Boolean);
    
    const onlyInS3 = s3Keys.filter(key => !firestoreKeys.includes(key));

    console.log(`📊 Encontrados ${onlyInS3.length} archivos solo en IDrive E2`);

    if (onlyInS3.length > 0) {
      console.log('🔄 Creando registros en Firestore para archivos faltantes...');
      
      for (const key of onlyInS3.slice(0, 10)) { // Limitar a 10 para evitar sobrecarga
        try {
          // Obtener información del archivo
          const headCommand = new HeadObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
          });
          const headResponse = await s3Client.send(headCommand);

          // Crear registro en Firestore
          const imageData = {
            key: key,
            url: `${process.env.IDRIVE_E2_ENDPOINT}/${BUCKET_NAME}/${key}`,
            originalName: key.split('/').pop() || 'unknown',
            fileName: key.split('/').pop() || 'unknown',
            size: headResponse.ContentLength || 0,
            mimetype: headResponse.ContentType || 'image/jpeg',
            category: key.split('/')[0] || 'uploads',
            userId: 'system-sync',
            description: 'Archivo sincronizado automáticamente',
            tags: [],
            metadata: {},
            isPublic: true,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await db.collection('images').add(imageData);
          console.log(`   ✅ Sincronizado: ${key}`);
        } catch (error) {
          console.log(`   ❌ Error sincronizando ${key}:`, error.message);
        }
      }
    }

    console.log('✅ Sincronización completada');
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
  }
}

// Ejecutar diagnóstico
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'sync') {
    syncMissingFiles();
  } else {
    diagnoseImages();
  }
}

module.exports = { diagnoseImages, syncMissingFiles }; 