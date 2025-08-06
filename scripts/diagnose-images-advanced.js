const admin = require('firebase-admin');
const { S3Client, ListObjectsV2Command, HeadObjectCommand } = require('@aws-sdk/client-s3');

// Configurar Firebase Admin
const serviceAccount = require('../firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Configurar S3 Client para IDrive E2
const s3Client = new S3Client({
  region: process.env.IDRIVE_E2_REGION || 'us-east-1',
  endpoint: process.env.IDRIVE_E2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY,
    secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY,
  },
  forcePathStyle: true,
});

const bucketName = process.env.IDRIVE_E2_BUCKET_NAME;

async function diagnoseImagesAdvanced() {
  console.log('🔍 Iniciando diagnóstico avanzado del sistema de imágenes...\n');

  const results = {
    firebase: { status: 'unknown', details: {} },
    idrive: { status: 'unknown', details: {} },
    images: { status: 'unknown', details: {} },
    recommendations: []
  };

  try {
    // 1. Diagnóstico de Firebase
    console.log('📊 1. Verificando Firebase Firestore...');
    results.firebase = await diagnoseFirebase();
    
    // 2. Diagnóstico de IDrive E2
    console.log('☁️ 2. Verificando IDrive E2...');
    results.idrive = await diagnoseIDriveE2();
    
    // 3. Análisis de imágenes
    console.log('🖼️ 3. Analizando imágenes del sistema...');
    results.images = await analyzeImages();
    
    // 4. Generar recomendaciones
    console.log('💡 4. Generando recomendaciones...');
    results.recommendations = generateRecommendations(results);

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    results.error = error.message;
  }

  // Mostrar resultados
  displayResults(results);
}

async function diagnoseFirebase() {
  const result = { status: 'unknown', details: {} };

  try {
    // Verificar conexión
    const testDoc = await db.collection('test').doc('connection-test').get();
    result.status = 'connected';
    result.details.connection = 'OK';

    // Verificar colección de imágenes
    const imagesSnapshot = await db.collection('images').limit(1).get();
    result.details.imagesCollection = imagesSnapshot.empty ? 'empty' : 'exists';
    result.details.imagesCount = imagesSnapshot.size;

    // Verificar estructura de documentos
    if (!imagesSnapshot.empty) {
      const sampleDoc = imagesSnapshot.docs[0];
      const data = sampleDoc.data();
      result.details.sampleFields = Object.keys(data);
    }

    console.log('   ✅ Firebase conectado correctamente');
    return result;

  } catch (error) {
    result.status = 'error';
    result.details.error = error.message;
    console.log('   ❌ Error en Firebase:', error.message);
    return result;
  }
}

async function diagnoseIDriveE2() {
  const result = { status: 'unknown', details: {} };

  try {
    // Verificar conexión
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1
    });

    const listResponse = await s3Client.send(listCommand);
    result.status = 'connected';
    result.details.connection = 'OK';
    result.details.bucket = bucketName;
    result.details.objectsCount = listResponse.KeyCount || 0;

    // Verificar permisos de lectura
    if (listResponse.Contents && listResponse.Contents.length > 0) {
      const testKey = listResponse.Contents[0].Key;
      const headCommand = new HeadObjectCommand({
        Bucket: bucketName,
        Key: testKey
      });

      const headResponse = await s3Client.send(headCommand);
      result.details.readPermissions = 'OK';
      result.details.sampleFile = {
        key: testKey,
        size: headResponse.ContentLength,
        lastModified: headResponse.LastModified
      };
    }

    // Listar archivos de imágenes
    const imagesCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 100
    });

    const imagesResponse = await s3Client.send(imagesCommand);
    result.details.totalFiles = imagesResponse.KeyCount || 0;
    
    if (imagesResponse.Contents) {
      const imageFiles = imagesResponse.Contents.filter(obj => 
        obj.Key && (obj.Key.includes('.jpg') || obj.Key.includes('.png') || obj.Key.includes('.gif'))
      );
      result.details.imageFiles = imageFiles.length;
      result.details.totalSize = imagesResponse.Contents.reduce((sum, obj) => sum + (obj.Size || 0), 0);
    }

    console.log('   ✅ IDrive E2 conectado correctamente');
    return result;

  } catch (error) {
    result.status = 'error';
    result.details.error = error.message;
    console.log('   ❌ Error en IDrive E2:', error.message);
    return result;
  }
}

async function analyzeImages() {
  const result = { status: 'unknown', details: {} };

  try {
    // Obtener todas las imágenes de Firestore
    const imagesSnapshot = await db.collection('images').get();
    
    if (imagesSnapshot.empty) {
      result.status = 'empty';
      result.details.totalImages = 0;
      console.log('   ⚠️ No se encontraron imágenes en Firestore');
      return result;
    }

    result.status = 'found';
    result.details.totalImages = imagesSnapshot.size;

    // Analizar tipos de imágenes
    const imageTypes = {};
    const userStats = {};
    const sizeStats = { total: 0, average: 0 };
    const dateStats = { oldest: null, newest: null };

    imagesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Contar por tipo
      const mimeType = data.mimeType || 'unknown';
      imageTypes[mimeType] = (imageTypes[mimeType] || 0) + 1;
      
      // Contar por usuario
      const user = data.uploadedBy || 'unknown';
      userStats[user] = (userStats[user] || 0) + 1;
      
      // Estadísticas de tamaño
      if (data.size) {
        sizeStats.total += data.size;
      }
      
      // Estadísticas de fecha
      if (data.uploadedAt) {
        const date = new Date(data.uploadedAt);
        if (!dateStats.oldest || date < dateStats.oldest) {
          dateStats.oldest = date;
        }
        if (!dateStats.newest || date > dateStats.newest) {
          dateStats.newest = date;
        }
      }
    });

    sizeStats.average = sizeStats.total / imagesSnapshot.size;
    result.details.imageTypes = imageTypes;
    result.details.userStats = userStats;
    result.details.sizeStats = sizeStats;
    result.details.dateStats = dateStats;

    // Verificar URLs
    const urlStats = { valid: 0, invalid: 0, missing: 0 };
    const sampleImages = imagesSnapshot.docs.slice(0, 10); // Solo verificar 10 imágenes como muestra

    for (const doc of sampleImages) {
      const data = doc.data();
      if (!data.url) {
        urlStats.missing++;
      } else if (data.url.includes('idrive') || data.url.includes('s3')) {
        urlStats.valid++;
      } else {
        urlStats.invalid++;
      }
    }

    result.details.urlStats = urlStats;

    console.log(`   ✅ Encontradas ${imagesSnapshot.size} imágenes en Firestore`);
    return result;

  } catch (error) {
    result.status = 'error';
    result.details.error = error.message;
    console.log('   ❌ Error analizando imágenes:', error.message);
    return result;
  }
}

function generateRecommendations(results) {
  const recommendations = [];

  // Recomendaciones basadas en Firebase
  if (results.firebase.status === 'error') {
    recommendations.push({
      priority: 'high',
      category: 'firebase',
      message: 'Resolver problemas de conexión con Firebase',
      action: 'Verificar credenciales y configuración de Firebase'
    });
  }

  if (results.firebase.details.imagesCollection === 'empty') {
    recommendations.push({
      priority: 'medium',
      category: 'data',
      message: 'No hay imágenes en la base de datos',
      action: 'Considerar migrar imágenes existentes o crear algunas de prueba'
    });
  }

  // Recomendaciones basadas en IDrive E2
  if (results.idrive.status === 'error') {
    recommendations.push({
      priority: 'high',
      category: 'storage',
      message: 'Resolver problemas de conexión con IDrive E2',
      action: 'Verificar credenciales, endpoint y configuración de IDrive E2'
    });
  }

  if (results.idrive.details.imageFiles === 0) {
    recommendations.push({
      priority: 'medium',
      category: 'storage',
      message: 'No se encontraron archivos de imagen en IDrive E2',
      action: 'Verificar que las imágenes se estén subiendo correctamente'
    });
  }

  // Recomendaciones basadas en análisis de imágenes
  if (results.images.status === 'found') {
    const { urlStats, sizeStats } = results.images.details;
    
    if (urlStats.missing > 0) {
      recommendations.push({
        priority: 'high',
        category: 'data',
        message: `${urlStats.missing} imágenes sin URL`,
        action: 'Revisar y corregir URLs faltantes en la base de datos'
      });
    }

    if (urlStats.invalid > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'data',
        message: `${urlStats.invalid} imágenes con URLs inválidas`,
        action: 'Verificar formato y validez de las URLs'
      });
    }

    if (sizeStats.average > 5 * 1024 * 1024) { // Más de 5MB promedio
      recommendations.push({
        priority: 'low',
        category: 'optimization',
        message: 'Tamaño promedio de imágenes alto',
        action: 'Considerar comprimir imágenes para optimizar almacenamiento'
      });
    }
  }

  // Recomendaciones generales
  if (results.firebase.status === 'connected' && results.idrive.status === 'connected') {
    recommendations.push({
      priority: 'low',
      category: 'optimization',
      message: 'Sistema funcionando correctamente',
      action: 'Considerar implementar cache y optimizaciones de rendimiento'
    });
  }

  return recommendations;
}

function displayResults(results) {
  console.log('\n📋 RESULTADOS DEL DIAGNÓSTICO AVANZADO');
  console.log('=' .repeat(50));

  // Estado general
  const allConnected = results.firebase.status === 'connected' && 
                      results.idrive.status === 'connected';
  
  console.log(`\n🎯 Estado General: ${allConnected ? '✅ CONECTADO' : '❌ PROBLEMAS DETECTADOS'}`);

  // Firebase
  console.log('\n📊 FIREBASE FIRESTORE:');
  console.log(`   Estado: ${results.firebase.status === 'connected' ? '✅ Conectado' : '❌ Error'}`);
  if (results.firebase.details.imagesCollection) {
    console.log(`   Colección de imágenes: ${results.firebase.details.imagesCollection}`);
  }
  if (results.firebase.details.imagesCount !== undefined) {
    console.log(`   Imágenes en BD: ${results.firebase.details.imagesCount}`);
  }

  // IDrive E2
  console.log('\n☁️ IDRIVE E2:');
  console.log(`   Estado: ${results.idrive.status === 'connected' ? '✅ Conectado' : '❌ Error'}`);
  if (results.idrive.details.bucket) {
    console.log(`   Bucket: ${results.idrive.details.bucket}`);
  }
  if (results.idrive.details.totalFiles !== undefined) {
    console.log(`   Archivos totales: ${results.idrive.details.totalFiles}`);
  }
  if (results.idrive.details.imageFiles !== undefined) {
    console.log(`   Archivos de imagen: ${results.idrive.details.imageFiles}`);
  }
  if (results.idrive.details.totalSize !== undefined) {
    console.log(`   Tamaño total: ${formatBytes(results.idrive.details.totalSize)}`);
  }

  // Análisis de imágenes
  if (results.images.status === 'found') {
    console.log('\n🖼️ ANÁLISIS DE IMÁGENES:');
    console.log(`   Total de imágenes: ${results.images.details.totalImages}`);
    
    if (results.images.details.imageTypes) {
      console.log('   Tipos de imagen:');
      Object.entries(results.images.details.imageTypes).forEach(([type, count]) => {
        console.log(`     ${type}: ${count}`);
      });
    }

    if (results.images.details.sizeStats) {
      const { total, average } = results.images.details.sizeStats;
      console.log(`   Tamaño total: ${formatBytes(total)}`);
      console.log(`   Tamaño promedio: ${formatBytes(average)}`);
    }

    if (results.images.details.urlStats) {
      const { valid, invalid, missing } = results.images.details.urlStats;
      console.log(`   URLs válidas: ${valid}`);
      console.log(`   URLs inválidas: ${invalid}`);
      console.log(`   URLs faltantes: ${missing}`);
    }
  }

  // Recomendaciones
  if (results.recommendations.length > 0) {
    console.log('\n💡 RECOMENDACIONES:');
    results.recommendations.forEach((rec, index) => {
      const priorityIcon = rec.priority === 'high' ? '🔴' : 
                          rec.priority === 'medium' ? '🟡' : '🟢';
      console.log(`   ${priorityIcon} ${rec.message}`);
      console.log(`      Acción: ${rec.action}`);
    });
  }

  // Resumen
  console.log('\n📈 RESUMEN:');
  console.log(`   Firebase: ${results.firebase.status === 'connected' ? '✅' : '❌'}`);
  console.log(`   IDrive E2: ${results.idrive.status === 'connected' ? '✅' : '❌'}`);
  console.log(`   Imágenes: ${results.images.status === 'found' ? '✅' : '❌'}`);
  console.log(`   Recomendaciones: ${results.recommendations.length}`);

  console.log('\n🎉 Diagnóstico completado!');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Ejecutar diagnóstico
diagnoseImagesAdvanced().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
}); 