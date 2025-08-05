#!/usr/bin/env node

/**
 * Script de configuración y verificación de IDrive E2
 * 
 * Este script ayuda a:
 * 1. Verificar la configuración de variables de entorno
 * 2. Probar la conectividad con IDrive E2
 * 3. Crear buckets si es necesario
 * 4. Configurar permisos
 */

const fs = require('fs');
const path = require('path');
const { S3Client, CreateBucketCommand, PutBucketPolicyCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');

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

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

/**
 * Verifica si existe el archivo .env
 */
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    logError('Archivo .env no encontrado');
    logInfo('Crea un archivo .env basado en env.example');
    return false;
  }
  
  logSuccess('Archivo .env encontrado');
  return true;
}

/**
 * Verifica las variables de entorno de IDrive E2
 */
function checkEnvironmentVariables() {
  const requiredVars = [
    'IDRIVE_E2_ACCESS_KEY',
    'IDRIVE_E2_SECRET_KEY',
    'IDRIVE_E2_REGION',
    'IDRIVE_E2_ENDPOINT',
    'IDRIVE_E2_BUCKET_NAME'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    logError(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
    return false;
  }
  
  logSuccess('Todas las variables de entorno están configuradas');
  return true;
}

/**
 * Crea un cliente S3 para IDrive E2
 */
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

/**
 * Verifica la conectividad con IDrive E2
 */
async function testConnectivity(s3Client) {
  try {
    logInfo('Probando conectividad con IDrive E2...');
    
    const command = new HeadBucketCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME
    });
    
    await s3Client.send(command);
    logSuccess('Conectividad exitosa con IDrive E2');
    return true;
  } catch (error) {
    logError(`Error de conectividad: ${error.message}`);
    return false;
  }
}

/**
 * Verifica si el bucket existe
 */
async function checkBucketExists(s3Client) {
  try {
    logInfo('Verificando si el bucket existe...');
    
    const command = new HeadBucketCommand({
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

/**
 * Crea el bucket si no existe
 */
async function createBucket(s3Client) {
  try {
    logInfo(`Creando bucket "${process.env.IDRIVE_E2_BUCKET_NAME}"...`);
    
    const command = new CreateBucketCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      CreateBucketConfiguration: {
        LocationConstraint: process.env.IDRIVE_E2_REGION
      }
    });
    
    await s3Client.send(command);
    logSuccess(`Bucket "${process.env.IDRIVE_E2_BUCKET_NAME}" creado exitosamente`);
    return true;
  } catch (error) {
    logError(`Error creando bucket: ${error.message}`);
    return false;
  }
}

/**
 * Configura la política del bucket para acceso público
 */
async function configureBucketPolicy(s3Client) {
  try {
    logInfo('Configurando política del bucket...');
    
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${process.env.IDRIVE_E2_BUCKET_NAME}/*`
        }
      ]
    };
    
    const command = new PutBucketPolicyCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    });
    
    await s3Client.send(command);
    logSuccess('Política del bucket configurada para acceso público');
    return true;
  } catch (error) {
    logWarning(`No se pudo configurar la política del bucket: ${error.message}`);
    return false;
  }
}

/**
 * Prueba la subida de un archivo
 */
async function testFileUpload(s3Client) {
  try {
    logInfo('Probando subida de archivo...');
    
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    
    const testContent = Buffer.from('Test de configuración de IDrive E2 - ' + new Date().toISOString());
    const testKey = 'setup-test/test-file.txt';
    
    const command = new PutObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
      ACL: 'public-read'
    });
    
    await s3Client.send(command);
    logSuccess('Subida de archivo exitosa');
    return true;
  } catch (error) {
    logError(`Error en subida de archivo: ${error.message}`);
    return false;
  }
}

/**
 * Muestra información de configuración
 */
function showConfiguration() {
  log('\n📋 Configuración actual:', 'cyan');
  log(`   Región: ${process.env.IDRIVE_E2_REGION}`, 'bright');
  log(`   Endpoint: ${process.env.IDRIVE_E2_ENDPOINT}`, 'bright');
  log(`   Bucket: ${process.env.IDRIVE_E2_BUCKET_NAME}`, 'bright');
  log(`   Access Key: ${process.env.IDRIVE_E2_ACCESS_KEY ? '✅ Configurada' : '❌ No configurada'}`, 'bright');
  log(`   Secret Key: ${process.env.IDRIVE_E2_SECRET_KEY ? '✅ Configurada' : '❌ No configurada'}`, 'bright');
}

/**
 * Función principal
 */
async function main() {
  log('\n🚀 Configuración de IDrive E2 para MussikOn', 'magenta');
  log('==========================================\n', 'magenta');
  
  // Cargar variables de entorno
  require('dotenv').config();
  
  // Verificar archivo .env
  if (!checkEnvFile()) {
    process.exit(1);
  }
  
  // Verificar variables de entorno
  if (!checkEnvironmentVariables()) {
    process.exit(1);
  }
  
  // Mostrar configuración
  showConfiguration();
  
  // Crear cliente S3
  const s3Client = createS3Client();
  if (!s3Client) {
    process.exit(1);
  }
  
  // Verificar conectividad
  if (!await testConnectivity(s3Client)) {
    process.exit(1);
  }
  
  // Verificar bucket
  const bucketExists = await checkBucketExists(s3Client);
  if (!bucketExists) {
    const create = process.argv.includes('--create-bucket');
    if (create) {
      if (!await createBucket(s3Client)) {
        process.exit(1);
      }
    } else {
      logWarning('Usa --create-bucket para crear el bucket automáticamente');
      process.exit(1);
    }
  }
  
  // Configurar política del bucket
  await configureBucketPolicy(s3Client);
  
  // Probar subida de archivo
  if (!await testFileUpload(s3Client)) {
    process.exit(1);
  }
  
  log('\n🎉 Configuración completada exitosamente!', 'green');
  log('IDrive E2 está listo para usar con MussikOn', 'green');
  
  log('\n📝 Próximos pasos:', 'cyan');
  log('1. Reinicia tu servidor de desarrollo', 'bright');
  log('2. Prueba subir una imagen desde la aplicación', 'bright');
  log('3. Verifica que las imágenes se muestren correctamente', 'bright');
  log('4. Monitorea los logs para detectar problemas', 'bright');
}

// Ejecutar script
if (require.main === module) {
  main().catch(error => {
    logError(`Error inesperado: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  checkEnvFile,
  checkEnvironmentVariables,
  createS3Client,
  testConnectivity,
  checkBucketExists,
  createBucket,
  configureBucketPolicy,
  testFileUpload
}; 