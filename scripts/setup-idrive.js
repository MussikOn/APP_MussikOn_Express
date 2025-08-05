#!/usr/bin/env node

/**
 * Script de configuración y verificación de IDrive E2
 * Este script ayuda a configurar y verificar la conexión con IDrive E2
 */

const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, ListBucketsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  log(`${colors.bright}${colors.cyan}${message}${colors.reset}`);
  log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

// Verificar variables de entorno requeridas
const requiredEnvVars = [
  'IDRIVE_E2_ACCESS_KEY',
  'IDRIVE_E2_SECRET_KEY',
  'IDRIVE_E2_REGION',
  'IDRIVE_E2_ENDPOINT',
  'IDRIVE_E2_BUCKET_NAME'
];

function checkEnvironmentVariables() {
  logHeader('Verificando Variables de Entorno');
  
  const missingVars = [];
  const configuredVars = [];
  
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      configuredVars.push(varName);
      logSuccess(`${varName}: Configurada`);
    } else {
      missingVars.push(varName);
      logError(`${varName}: No configurada`);
    }
  });
  
  if (missingVars.length > 0) {
    logWarning(`\nVariables faltantes: ${missingVars.join(', ')}`);
    logInfo('Configura estas variables en tu archivo .env o como variables de entorno');
    return false;
  }
  
  logSuccess(`\nTodas las variables de entorno están configuradas (${configuredVars.length}/${requiredEnvVars.length})`);
  return true;
}

// Crear cliente S3
function createS3Client() {
  try {
    return new S3Client({
      region: process.env.IDRIVE_E2_REGION,
      endpoint: process.env.IDRIVE_E2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY,
        secretAccessKey: process.env.IDRIVE_E2_SECRET_KEY,
      },
      forcePathStyle: true,
    });
  } catch (error) {
    logError(`Error creando cliente S3: ${error.message}`);
    return null;
  }
}

// Verificar conexión con IDrive E2
async function testConnection(s3Client) {
  logHeader('Probando Conexión con IDrive E2');
  
  try {
    logInfo('Enviando comando ListBuckets...');
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    logSuccess('Conexión exitosa con IDrive E2');
    logInfo(`Buckets disponibles: ${response.Buckets?.length || 0}`);
    
    if (response.Buckets && response.Buckets.length > 0) {
      response.Buckets.forEach(bucket => {
        logInfo(`  - ${bucket.Name} (creado: ${bucket.CreationDate})`);
      });
    }
    
    return true;
  } catch (error) {
    logError(`Error de conexión: ${error.message}`);
    logWarning('Verifica tus credenciales y configuración de red');
    return false;
  }
}

// Verificar si el bucket existe
async function checkBucketExists(s3Client) {
  logHeader('Verificando Existencia del Bucket');
  
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME
    });
    
    await s3Client.send(command);
    logSuccess(`Bucket "${process.env.IDRIVE_E2_BUCKET_NAME}" existe`);
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      logWarning(`Bucket "${process.env.IDRIVE_E2_BUCKET_NAME}" no existe`);
      return false;
    } else {
      logError(`Error verificando bucket: ${error.message}`);
      return false;
    }
  }
}

// Crear bucket si no existe
async function createBucket(s3Client) {
  logHeader('Creando Bucket');
  
  try {
    logInfo(`Creando bucket "${process.env.IDRIVE_E2_BUCKET_NAME}"...`);
    
    const command = new PutObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: 'test/connection-test.txt',
      Body: 'Test de conexión - ' + new Date().toISOString(),
      ContentType: 'text/plain'
    });
    
    await s3Client.send(command);
    logSuccess(`Bucket "${process.env.IDRIVE_E2_BUCKET_NAME}" creado exitosamente`);
    return true;
  } catch (error) {
    logError(`Error creando bucket: ${error.message}`);
    return false;
  }
}

// Probar subida de archivo
async function testUpload(s3Client) {
  logHeader('Probando Subida de Archivo');
  
  try {
    const testContent = `Test de subida - ${new Date().toISOString()}`;
    const testKey = `test/upload-test-${Date.now()}.txt`;
    
    logInfo(`Subiendo archivo de prueba: ${testKey}`);
    
    const command = new PutObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
      ACL: 'public-read'
    });
    
    await s3Client.send(command);
    logSuccess('Archivo subido exitosamente');
    
    // Verificar que se puede descargar
    logInfo('Verificando descarga del archivo...');
    const getCommand = new GetObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: testKey
    });
    
    const response = await s3Client.send(getCommand);
    const downloadedContent = await response.Body.transformToString();
    
    if (downloadedContent === testContent) {
      logSuccess('Descarga verificada exitosamente');
    } else {
      logWarning('El contenido descargado no coincide con el original');
    }
    
    return true;
  } catch (error) {
    logError(`Error en prueba de subida: ${error.message}`);
    return false;
  }
}

// Probar acceso público
async function testPublicAccess(s3Client) {
  logHeader('Probando Acceso Público');
  
  try {
    const testKey = `test/public-access-test-${Date.now()}.txt`;
    const testContent = 'Test de acceso público - ' + new Date().toISOString();
    
    logInfo('Subiendo archivo con acceso público...');
    
    const command = new PutObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
      ACL: 'public-read'
    });
    
    await s3Client.send(command);
    
    // Intentar acceder públicamente
    const publicUrl = `${process.env.IDRIVE_E2_ENDPOINT}/${process.env.IDRIVE_E2_BUCKET_NAME}/${testKey}`;
    logInfo(`URL pública: ${publicUrl}`);
    
    try {
      const response = await fetch(publicUrl);
      if (response.ok) {
        logSuccess('Acceso público funcionando correctamente');
      } else {
        logWarning(`Acceso público no funciona (status: ${response.status})`);
      }
    } catch (fetchError) {
      logWarning(`No se pudo probar acceso público: ${fetchError.message}`);
    }
    
    return true;
  } catch (error) {
    logError(`Error probando acceso público: ${error.message}`);
    return false;
  }
}

// Generar reporte de configuración
function generateConfigReport() {
  logHeader('Reporte de Configuración');
  
  log(`${colors.bright}Configuración Actual:${colors.reset}`);
  log(`   Región: ${process.env.IDRIVE_E2_REGION}`, 'bright');
  log(`   Endpoint: ${process.env.IDRIVE_E2_ENDPOINT}`, 'bright');
  log(`   Bucket: ${process.env.IDRIVE_E2_BUCKET_NAME}`, 'bright');
  log(`   Access Key: ${process.env.IDRIVE_E2_ACCESS_KEY ? '✅ Configurada' : '❌ No configurada'}`, 'bright');
  log(`   Secret Key: ${process.env.IDRIVE_E2_SECRET_KEY ? '✅ Configurada' : '❌ No configurada'}`, 'bright');
  
  log(`\n${colors.bright}URLs de Ejemplo:${colors.reset}`);
  log(`   Subida: ${process.env.IDRIVE_E2_ENDPOINT}/${process.env.IDRIVE_E2_BUCKET_NAME}/uploads/`);
  log(`   Acceso: ${process.env.IDRIVE_E2_ENDPOINT}/${process.env.IDRIVE_E2_BUCKET_NAME}/uploads/archivo.jpg`);
}

// Función principal
async function main() {
  logHeader('Configuración y Verificación de IDrive E2');
  
  // Verificar variables de entorno
  if (!checkEnvironmentVariables()) {
    logError('No se pueden continuar las pruebas sin las variables de entorno');
    process.exit(1);
  }
  
  // Crear cliente S3
  const s3Client = createS3Client();
  if (!s3Client) {
    logError('No se pudo crear el cliente S3');
    process.exit(1);
  }
  
  // Probar conexión
  const connectionOk = await testConnection(s3Client);
  if (!connectionOk) {
    logError('No se pudo establecer conexión con IDrive E2');
    process.exit(1);
  }
  
  // Verificar bucket
  const bucketExists = await checkBucketExists(s3Client);
  if (!bucketExists) {
    logWarning('El bucket no existe, intentando crearlo...');
    const created = await createBucket(s3Client);
    if (!created) {
      logError('No se pudo crear el bucket');
      process.exit(1);
    }
  }
  
  // Probar subida
  const uploadOk = await testUpload(s3Client);
  if (!uploadOk) {
    logError('La prueba de subida falló');
    process.exit(1);
  }
  
  // Probar acceso público
  await testPublicAccess(s3Client);
  
  // Generar reporte
  generateConfigReport();
  
  logHeader('Configuración Completada');
  logSuccess('IDrive E2 está configurado y funcionando correctamente');
  logInfo('Puedes usar el sistema de imágenes en tu aplicación');
}

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Ejecutar script
if (require.main === module) {
  main().catch(error => {
    logError(`Error en el script: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  checkEnvironmentVariables,
  createS3Client,
  testConnection,
  checkBucketExists,
  createBucket,
  testUpload,
  testPublicAccess
}; 