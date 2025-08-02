#!/usr/bin/env node

/**
 * Script para monitorear el estado de los índices de Firestore
 * 
 * Este script verifica el estado de construcción de los índices
 * y proporciona información en tiempo real sobre su progreso.
 * 
 * Uso:
 *   node scripts/monitor-indexes.js
 *   npm run monitor:indexes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando monitoreo de índices de Firestore...\n');

// Configuración
let CHECK_INTERVAL = 30000; // 30 segundos
const MAX_CHECKS = 60; // Máximo 30 minutos de monitoreo

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

// Función para obtener el estado de los índices
function getIndexStatus() {
  try {
    const output = execSync('firebase firestore:indexes', { 
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: path.join(__dirname, '..')
    });
    return output;
  } catch (error) {
    throw new Error(`Error al obtener estado de índices: ${error.message}`);
  }
}

// Función para parsear el estado de los índices
function parseIndexStatus(output) {
  const lines = output.split('\n');
  const indexes = [];
  let currentIndex = null;

  for (const line of lines) {
    // Buscar líneas que contengan información de índices
    if (line.includes('Collection ID:') || line.includes('Collection Group:')) {
      if (currentIndex) {
        indexes.push(currentIndex);
      }
      currentIndex = {
        collection: line.split(':')[1]?.trim() || 'Unknown',
        fields: [],
        state: 'Unknown'
      };
    } else if (line.includes('Fields:')) {
      // Parsear campos del índice
      const fieldMatch = line.match(/Fields:\s*(.+)/);
      if (fieldMatch && currentIndex) {
        currentIndex.fields = fieldMatch[1].split(',').map(f => f.trim());
      }
    } else if (line.includes('State:')) {
      // Parsear estado del índice
      const stateMatch = line.match(/State:\s*(.+)/);
      if (stateMatch && currentIndex) {
        currentIndex.state = stateMatch[1].trim();
      }
    }
  }

  if (currentIndex) {
    indexes.push(currentIndex);
  }

  return indexes;
}

// Función para mostrar el progreso
function showProgress(indexes) {
  const total = indexes.length;
  const ready = indexes.filter(idx => idx.state === 'READY').length;
  const building = indexes.filter(idx => idx.state === 'BUILDING').length;
  const error = indexes.filter(idx => idx.state === 'ERROR').length;
  const pending = indexes.filter(idx => idx.state === 'PENDING').length;

  console.clear();
  log('📊 Estado de Índices de Firestore', 'bright');
  log('=====================================\n', 'cyan');

  // Resumen general
  log(`📈 Progreso: ${ready}/${total} índices listos`, 'green');
  if (building > 0) log(`🔨 Construyendo: ${building}`, 'yellow');
  if (pending > 0) log(`⏳ Pendientes: ${pending}`, 'blue');
  if (error > 0) log(`❌ Errores: ${error}`, 'red');

  console.log('\n📋 Detalles por colección:');

  // Agrupar por colección
  const byCollection = {};
  indexes.forEach(idx => {
    if (!byCollection[idx.collection]) {
      byCollection[idx.collection] = [];
    }
    byCollection[idx.collection].push(idx);
  });

  Object.entries(byCollection).forEach(([collection, collectionIndexes]) => {
    log(`\n📁 ${collection}:`, 'bright');
    
    collectionIndexes.forEach((idx, i) => {
      const stateColor = idx.state === 'READY' ? 'green' : 
                        idx.state === 'BUILDING' ? 'yellow' : 
                        idx.state === 'ERROR' ? 'red' : 'blue';
      
      const stateIcon = idx.state === 'READY' ? '✅' : 
                       idx.state === 'BUILDING' ? '🔨' : 
                       idx.state === 'ERROR' ? '❌' : '⏳';
      
      log(`   ${stateIcon} ${idx.fields.join(' + ')} - ${idx.state}`, stateColor);
    });
  });

  // Mostrar tiempo transcurrido
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  log(`\n⏱️  Tiempo transcurrido: ${minutes}:${seconds.toString().padStart(2, '0')}`, 'cyan');
}

// Función para verificar si todos los índices están listos
function areAllIndexesReady(indexes) {
  return indexes.every(idx => idx.state === 'READY');
}

// Función para verificar si hay errores
function hasErrors(indexes) {
  return indexes.some(idx => idx.state === 'ERROR');
}

// Función principal de monitoreo
async function monitorIndexes() {
  let checkCount = 0;
  const startTime = Date.now();

  log('🚀 Iniciando monitoreo continuo...', 'green');
  log('💡 Presiona Ctrl+C para detener el monitoreo\n', 'cyan');

  const monitorInterval = setInterval(async () => {
    try {
      checkCount++;
      
      if (checkCount > MAX_CHECKS) {
        log('\n⏰ Tiempo máximo de monitoreo alcanzado', 'yellow');
        log('💡 Los índices pueden seguir construyéndose en segundo plano', 'cyan');
        clearInterval(monitorInterval);
        process.exit(0);
      }

      const statusOutput = getIndexStatus();
      const indexes = parseIndexStatus(statusOutput);
      
      showProgress(indexes);

      // Verificar si todos están listos
      if (areAllIndexesReady(indexes)) {
        log('\n🎉 ¡Todos los índices están listos!', 'green');
        log('✅ El sistema está optimizado para las consultas', 'green');
        clearInterval(monitorInterval);
        process.exit(0);
      }

      // Verificar si hay errores
      if (hasErrors(indexes)) {
        log('\n❌ Se detectaron errores en algunos índices', 'red');
        log('🔧 Revisa la consola de Firebase para más detalles', 'yellow');
        clearInterval(monitorInterval);
        process.exit(1);
      }

    } catch (error) {
      log(`\n❌ Error durante el monitoreo: ${error.message}`, 'red');
      log('🔄 Reintentando en el próximo ciclo...', 'yellow');
    }
  }, CHECK_INTERVAL);

  // Manejar interrupción del usuario
  process.on('SIGINT', () => {
    log('\n\n🛑 Monitoreo detenido por el usuario', 'yellow');
    log('💡 Puedes verificar el estado manualmente con: firebase firestore:indexes', 'cyan');
    clearInterval(monitorInterval);
    process.exit(0);
  });
}

// Función para mostrar información de ayuda
function showHelp() {
  log(`
📚 Script de Monitoreo de Índices de Firestore

Uso:
  node scripts/monitor-indexes.js [opciones]

Opciones:
  --help, -h     Mostrar esta ayuda
  --interval N   Intervalo de verificación en segundos (default: 30)
  --max-time N   Tiempo máximo de monitoreo en minutos (default: 30)

Ejemplos:
  node scripts/monitor-indexes.js
  node scripts/monitor-indexes.js --interval 60
  node scripts/monitor-indexes.js --max-time 60

Estados de índices:
  ✅ READY     - Índice construido y listo para usar
  🔨 BUILDING  - Índice en proceso de construcción
  ⏳ PENDING   - Índice pendiente de construcción
  ❌ ERROR     - Error en la construcción del índice

Notas:
  - Requiere Firebase CLI instalado y autenticado
  - Los índices pueden tardar varios minutos en construirse
  - Presiona Ctrl+C para detener el monitoreo
  `, 'cyan');
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Configurar intervalo personalizado
const intervalIndex = args.indexOf('--interval');
if (intervalIndex !== -1 && args[intervalIndex + 1]) {
  const customInterval = parseInt(args[intervalIndex + 1]) * 1000;
  if (customInterval > 0) {
    CHECK_INTERVAL = customInterval;
    log(`⏱️  Intervalo personalizado: ${customInterval / 1000} segundos`, 'blue');
  }
}

// Configurar tiempo máximo personalizado
const maxTimeIndex = args.indexOf('--max-time');
if (maxTimeIndex !== -1 && args[maxTimeIndex + 1]) {
  const customMaxTime = parseInt(args[maxTimeIndex + 1]);
  if (customMaxTime > 0) {
    MAX_CHECKS = Math.floor((customMaxTime * 60 * 1000) / CHECK_INTERVAL);
    log(`⏰ Tiempo máximo personalizado: ${customMaxTime} minutos`, 'blue');
  }
}

// Ejecutar el monitoreo
monitorIndexes(); 