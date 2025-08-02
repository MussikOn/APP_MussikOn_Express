#!/usr/bin/env node

/**
 * Script para desplegar índices de Firestore
 * 
 * Este script automatiza el despliegue de índices de Firestore
 * para optimizar las consultas del sistema MussikOn.
 * 
 * Uso:
 *   node scripts/deploy-indexes.js
 *   npm run deploy:indexes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando despliegue de índices de Firestore...\n');

// Verificar que firebase CLI esté instalado
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI detectado');
} catch (error) {
  console.error('❌ Firebase CLI no está instalado');
  console.log('📦 Instalando Firebase CLI...');
  try {
    execSync('npm install -g firebase-tools', { stdio: 'inherit' });
    console.log('✅ Firebase CLI instalado correctamente');
  } catch (installError) {
    console.error('❌ Error al instalar Firebase CLI:', installError.message);
    process.exit(1);
  }
}

// Verificar que el archivo de índices existe
const indexPath = path.join(__dirname, '..', 'firestore.indexes.json');
if (!fs.existsSync(indexPath)) {
  console.error('❌ Archivo firestore.indexes.json no encontrado');
  process.exit(1);
}

console.log('📁 Archivo de índices encontrado');

// Verificar que estamos en el directorio correcto
const firebaseConfigPath = path.join(__dirname, '..', 'firebase.json');
if (!fs.existsSync(firebaseConfigPath)) {
  console.error('❌ Archivo firebase.json no encontrado');
  console.log('💡 Asegúrate de estar en el directorio raíz del proyecto');
  process.exit(1);
}

console.log('📋 Configuración de Firebase encontrada\n');

// Función para ejecutar comandos de Firebase
function runFirebaseCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    const output = execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: path.join(__dirname, '..')
    });
    console.log(`✅ ${description} completado`);
    return output;
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message);
    if (error.stdout) {
      console.log('📤 Salida:', error.stdout);
    }
    if (error.stderr) {
      console.log('📥 Error:', error.stderr);
    }
    throw error;
  }
}

// Función principal
async function deployIndexes() {
  try {
    // Verificar autenticación
    console.log('🔐 Verificando autenticación...');
    try {
      execSync('firebase projects:list', { stdio: 'pipe' });
      console.log('✅ Autenticación verificada');
    } catch (authError) {
      console.log('🔑 Iniciando autenticación...');
      runFirebaseCommand('firebase login', 'Autenticación con Firebase');
    }

    // Desplegar índices
    console.log('\n📊 Desplegando índices de Firestore...');
    const output = runFirebaseCommand(
      'firebase deploy --only firestore:indexes',
      'Despliegue de índices'
    );

    console.log('\n📋 Resumen del despliegue:');
    console.log(output);

    // Verificar estado de los índices
    console.log('\n🔍 Verificando estado de los índices...');
    const statusOutput = runFirebaseCommand(
      'firebase firestore:indexes',
      'Verificación de estado'
    );

    console.log('\n📊 Estado actual de los índices:');
    console.log(statusOutput);

    console.log('\n🎉 ¡Despliegue de índices completado exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Los índices pueden tardar varios minutos en construirse');
    console.log('   2. Puedes monitorear el progreso en la consola de Firebase');
    console.log('   3. Las consultas optimizadas estarán disponibles una vez que los índices estén listos');

  } catch (error) {
    console.error('\n❌ Error durante el despliegue:', error.message);
    console.log('\n🔧 Soluciones comunes:');
    console.log('   1. Verifica que tienes permisos en el proyecto de Firebase');
    console.log('   2. Asegúrate de que Firestore esté habilitado en tu proyecto');
    console.log('   3. Verifica que el archivo firestore.indexes.json sea válido');
    process.exit(1);
  }
}

// Función para mostrar información de ayuda
function showHelp() {
  console.log(`
📚 Script de Despliegue de Índices de Firestore

Uso:
  node scripts/deploy-indexes.js [opciones]

Opciones:
  --help, -h     Mostrar esta ayuda
  --dry-run      Simular el despliegue sin ejecutarlo
  --force        Forzar el despliegue sin confirmaciones

Ejemplos:
  node scripts/deploy-indexes.js
  node scripts/deploy-indexes.js --dry-run
  node scripts/deploy-indexes.js --force

Archivos requeridos:
  - firestore.indexes.json (configuración de índices)
  - firebase.json (configuración del proyecto)
  - .firebaserc (configuración del proyecto de Firebase)

Notas:
  - Requiere Firebase CLI instalado
  - Requiere autenticación con Firebase
  - Los índices pueden tardar varios minutos en construirse
  `);
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--dry-run')) {
  console.log('🔍 Modo de simulación activado');
  console.log('📋 Índices que se desplegarían:');
  
  try {
    const indexes = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    console.log(`   - Total de índices: ${indexes.indexes.length}`);
    indexes.indexes.forEach((index, i) => {
      console.log(`   ${i + 1}. Colección: ${index.collectionGroup}`);
      console.log(`      Campos: ${index.fields.map(f => f.fieldPath).join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Error al leer el archivo de índices:', error.message);
  }
  
  process.exit(0);
}

// Ejecutar el despliegue
deployIndexes(); 