#!/usr/bin/env node

/**
 * Script de prueba para el sistema de IDrive E2
 * Este script prueba todas las funcionalidades implementadas
 */

const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
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

// Verificar variables de entorno
function checkEnvironmentVariables() {
  logHeader('Verificando Variables de Entorno');
  
  const requiredVars = [
    'IDRIVE_E2_ACCESS_KEY',
    'IDRIVE_E2_SECRET_KEY',
    'IDRIVE_E2_REGION',
    'IDRIVE_E2_ENDPOINT',
    'IDRIVE_E2_BUCKET_NAME'
  ];
  
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName}: Configurada`);
    } else {
      missingVars.push(varName);
      logError(`${varName}: No configurada`);
    }
  });
  
  if (missingVars.length > 0) {
    logError(`Variables faltantes: ${missingVars.join(', ')}`);
    return false;
  }
  
  logSuccess('Todas las variables de entorno están configuradas');
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

// Probar subida de imagen
async function testImageUpload(s3Client) {
  logHeader('Probando Subida de Imagen');
  
  try {
    // Crear una imagen de prueba (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0x00, 0x00,
      0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const testKey = `test/test-image-${Date.now()}.png`;
    
    logInfo(`Subiendo imagen de prueba: ${testKey}`);
    
    const command = new PutObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: testKey,
      Body: testImageBuffer,
      ContentType: 'image/png',
      ACL: 'public-read',
      CacheControl: 'public, max-age=3600'
    });
    
    await s3Client.send(command);
    logSuccess('Imagen subida exitosamente');
    
    // Generar URL
    const endpoint = process.env.IDRIVE_E2_ENDPOINT;
    let fileUrl;
    
    if (endpoint.includes('idrivee2')) {
      fileUrl = `${endpoint}/${process.env.IDRIVE_E2_BUCKET_NAME}/${testKey}`;
    } else if (endpoint.includes('amazonaws.com')) {
      fileUrl = `https://${process.env.IDRIVE_E2_BUCKET_NAME}.s3.${process.env.IDRIVE_E2_REGION}.amazonaws.com/${testKey}`;
    } else {
      fileUrl = `${endpoint}/${process.env.IDRIVE_E2_BUCKET_NAME}/${testKey}`;
    }
    
    logInfo(`URL generada: ${fileUrl}`);
    
    return { key: testKey, url: fileUrl };
  } catch (error) {
    logError(`Error en subida de imagen: ${error.message}`);
    return null;
  }
}

// Probar descarga de imagen
async function testImageDownload(s3Client, key) {
  logHeader('Probando Descarga de Imagen');
  
  try {
    logInfo(`Descargando imagen: ${key}`);
    
    const command = new GetObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: key
    });
    
    const response = await s3Client.send(command);
    
    if (!response.Body) {
      logError('No se pudo obtener el cuerpo de la respuesta');
      return false;
    }
    
    // Convertir stream a buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    logSuccess(`Imagen descargada exitosamente (${buffer.length} bytes)`);
    logInfo(`Content-Type: ${response.ContentType}`);
    logInfo(`Content-Length: ${response.ContentLength}`);
    
    return true;
  } catch (error) {
    logError(`Error en descarga de imagen: ${error.message}`);
    return false;
  }
}

// Probar acceso público
async function testPublicAccess(url) {
  logHeader('Probando Acceso Público');
  
  try {
    logInfo(`Probando acceso público a: ${url}`);
    
    const response = await fetch(url);
    
    if (response.ok) {
      logSuccess('Acceso público funcionando correctamente');
      logInfo(`Status: ${response.status}`);
      logInfo(`Content-Type: ${response.headers.get('content-type')}`);
      logInfo(`Content-Length: ${response.headers.get('content-length')}`);
      return true;
    } else {
      logWarning(`Acceso público no funciona (status: ${response.status})`);
      return false;
    }
  } catch (error) {
    logWarning(`No se pudo probar acceso público: ${error.message}`);
    return false;
  }
}

// Probar endpoints del servidor
async function testServerEndpoints() {
  logHeader('Probando Endpoints del Servidor');
  
  const baseUrl = 'http://localhost:10000';
  const testDepositId = 'test-deposit-123';
  
  try {
    // Probar endpoint de voucher
    logInfo('Probando endpoint de voucher...');
    const voucherResponse = await fetch(`${baseUrl}/imgs/voucher/${testDepositId}`);
    
    if (voucherResponse.status === 404) {
      logWarning('Endpoint de voucher responde (404 esperado para ID de prueba)');
    } else {
      logInfo(`Endpoint de voucher responde con status: ${voucherResponse.status}`);
    }
    
    // Probar endpoint de imágenes
    logInfo('Probando endpoint de imágenes...');
    const imagesResponse = await fetch(`${baseUrl}/images`);
    
    if (imagesResponse.status === 401) {
      logWarning('Endpoint de imágenes requiere autenticación (esperado)');
    } else {
      logInfo(`Endpoint de imágenes responde con status: ${imagesResponse.status}`);
    }
    
    return true;
  } catch (error) {
    logWarning(`No se pudo probar endpoints del servidor: ${error.message}`);
    logInfo('Asegúrate de que el servidor esté ejecutándose en http://localhost:10000');
    return false;
  }
}

// Generar reporte final
function generateTestReport(results) {
  logHeader('Reporte de Pruebas');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(result => result === true).length;
  const failedTests = totalTests - passedTests;
  
  log(`${colors.bright}Resumen de Pruebas:${colors.reset}`);
  log(`   Total de pruebas: ${totalTests}`, 'bright');
  log(`   Exitosas: ${passedTests}`, 'green');
  log(`   Fallidas: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  log(`   Tasa de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 'bright');
  
  log(`\n${colors.bright}Detalles:${colors.reset}`);
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅' : '❌';
    const color = result ? 'green' : 'red';
    log(`   ${status} ${test}`, color);
  });
  
  if (failedTests === 0) {
    logSuccess('\n🎉 Todas las pruebas pasaron exitosamente!');
    logInfo('El sistema de IDrive E2 está funcionando correctamente');
  } else {
    logWarning(`\n⚠️ ${failedTests} prueba(s) fallaron`);
    logInfo('Revisa los errores anteriores para más detalles');
  }
}

// Función principal
async function main() {
  logHeader('Pruebas del Sistema IDrive E2');
  
  const results = {};
  
  // Verificar variables de entorno
  results['Variables de Entorno'] = checkEnvironmentVariables();
  if (!results['Variables de Entorno']) {
    logError('No se pueden continuar las pruebas sin las variables de entorno');
    process.exit(1);
  }
  
  // Crear cliente S3
  const s3Client = createS3Client();
  if (!s3Client) {
    logError('No se pudo crear el cliente S3');
    process.exit(1);
  }
  
  // Probar subida de imagen
  const uploadResult = await testImageUpload(s3Client);
  results['Subida de Imagen'] = uploadResult !== null;
  
  if (uploadResult) {
    // Probar descarga de imagen
    results['Descarga de Imagen'] = await testImageDownload(s3Client, uploadResult.key);
    
    // Probar acceso público
    results['Acceso Público'] = await testPublicAccess(uploadResult.url);
  } else {
    results['Descarga de Imagen'] = false;
    results['Acceso Público'] = false;
  }
  
  // Probar endpoints del servidor
  results['Endpoints del Servidor'] = await testServerEndpoints();
  
  // Generar reporte final
  generateTestReport(results);
  
  // Limpiar archivo de prueba
  if (uploadResult) {
    try {
      const deleteCommand = new PutObjectCommand({
        Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
        Key: uploadResult.key
      });
      await s3Client.send(deleteCommand);
      logInfo('Archivo de prueba limpiado');
    } catch (error) {
      logWarning(`No se pudo limpiar el archivo de prueba: ${error.message}`);
    }
  }
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
  testImageUpload,
  testImageDownload,
  testPublicAccess,
  testServerEndpoints,
  generateTestReport
}; 