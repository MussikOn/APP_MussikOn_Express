#!/usr/bin/env node

/**
 * Script para analizar consultas de Firestore y detectar índices faltantes
 * 
 * Este script escanea el código fuente en busca de consultas de Firestore
 * y genera un reporte de índices necesarios.
 * 
 * Uso:
 *   node scripts/analyze-queries.js
 *   npm run analyze:queries
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Analizando consultas de Firestore...\n');

// Configuración
const SRC_DIR = path.join(__dirname, '..', 'src');
const PATTERNS = {
  where: /\.where\(['"`]([^'"`]+)['"`],\s*['"`]([^'"`]+)['"`],\s*([^)]+)\)/g,
  orderBy: /\.orderBy\(['"`]([^'"`]+)['"`],\s*['"`]([^'"`]+)['"`]\)/g,
  collection: /\.collection\(['"`]([^'"`]+)['"`]\)/g,
  arrayContains: /array-contains/g,
  arrayContainsAny: /array-contains-any/g,
  in: /['"`]in['"`]/g,
  notIn: /['"`]not-in['"`]/g
};

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

// Función para escanear archivos recursivamente
function scanFiles(dir, extensions = ['.ts', '.js']) {
  const files = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

// Función para analizar consultas en un archivo
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const queries = [];
  
  // Buscar colecciones
  const collectionMatches = content.matchAll(PATTERNS.collection);
  for (const match of collectionMatches) {
    const collectionName = match[1];
    
    // Buscar consultas en el contexto de esta colección
    const contextStart = Math.max(0, match.index - 200);
    const contextEnd = Math.min(content.length, match.index + 500);
    const context = content.substring(contextStart, contextEnd);
    
    const query = {
      collection: collectionName,
      file: path.relative(process.cwd(), filePath),
      line: content.substring(0, match.index).split('\n').length,
      whereClauses: [],
      orderByClauses: [],
      arrayOperations: []
    };
    
    // Buscar cláusulas where
    const whereMatches = context.matchAll(PATTERNS.where);
    for (const whereMatch of whereMatches) {
      query.whereClauses.push({
        field: whereMatch[1],
        operator: whereMatch[2],
        value: whereMatch[3].trim()
      });
    }
    
    // Buscar cláusulas orderBy
    const orderByMatches = context.matchAll(PATTERNS.orderBy);
    for (const orderByMatch of orderByMatches) {
      query.orderByClauses.push({
        field: orderByMatch[1],
        direction: orderByMatch[2]
      });
    }
    
    // Buscar operaciones de array
    if (PATTERNS.arrayContains.test(context)) {
      query.arrayOperations.push('array-contains');
    }
    if (PATTERNS.arrayContainsAny.test(context)) {
      query.arrayOperations.push('array-contains-any');
    }
    if (PATTERNS.in.test(context)) {
      query.arrayOperations.push('in');
    }
    if (PATTERNS.notIn.test(context)) {
      query.arrayOperations.push('not-in');
    }
    
    if (query.whereClauses.length > 0 || query.orderByClauses.length > 0) {
      queries.push(query);
    }
  }
  
  return queries;
}

// Función para generar índice sugerido
function generateIndexSuggestion(query) {
  const fields = [];
  
  // Agregar campos de where
  query.whereClauses.forEach(clause => {
    if (clause.operator === 'array-contains' || clause.operator === 'array-contains-any') {
      fields.push({
        fieldPath: clause.field,
        arrayConfig: clause.operator === 'array-contains' ? 'CONTAINS' : 'CONTAINS_ANY'
      });
    } else {
      fields.push({
        fieldPath: clause.field,
        order: 'ASCENDING'
      });
    }
  });
  
  // Agregar campos de orderBy
  query.orderByClauses.forEach(clause => {
    // Verificar si el campo ya está en where
    const existingField = fields.find(f => f.fieldPath === clause.field);
    if (!existingField) {
      fields.push({
        fieldPath: clause.field,
        order: clause.direction.toUpperCase()
      });
    } else if (existingField.order === 'ASCENDING') {
      existingField.order = clause.direction.toUpperCase();
    }
  });
  
  return {
    collectionGroup: query.collection,
    queryScope: 'COLLECTION',
    fields: fields
  };
}

// Función para verificar si un índice ya existe
function checkExistingIndexes(suggestedIndex, existingIndexes) {
  return existingIndexes.some(existing => {
    if (existing.collectionGroup !== suggestedIndex.collectionGroup) {
      return false;
    }
    
    if (existing.fields.length !== suggestedIndex.fields.length) {
      return false;
    }
    
    return existing.fields.every((field, index) => {
      const suggestedField = suggestedIndex.fields[index];
      return field.fieldPath === suggestedField.fieldPath &&
             field.order === suggestedField.order &&
             field.arrayConfig === suggestedField.arrayConfig;
    });
  });
}

// Función principal
async function analyzeQueries() {
  try {
    log('📁 Escaneando archivos fuente...', 'blue');
    const files = scanFiles(SRC_DIR);
    log(`✅ Encontrados ${files.length} archivos para analizar\n`, 'green');
    
    // Analizar consultas
    const allQueries = [];
    for (const file of files) {
      const queries = analyzeFile(file);
      allQueries.push(...queries);
    }
    
    log(`🔍 Encontradas ${allQueries.length} consultas\n`, 'green');
    
    // Generar sugerencias de índices
    const suggestedIndexes = [];
    const indexMap = new Map();
    
    for (const query of allQueries) {
      const suggestion = generateIndexSuggestion(query);
      const key = `${suggestion.collectionGroup}_${suggestion.fields.map(f => f.fieldPath).join('_')}`;
      
      if (!indexMap.has(key)) {
        indexMap.set(key, suggestion);
        suggestedIndexes.push(suggestion);
      }
    }
    
    // Cargar índices existentes
    let existingIndexes = [];
    try {
      const indexPath = path.join(__dirname, '..', 'firestore.indexes.json');
      if (fs.existsSync(indexPath)) {
        const indexConfig = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        existingIndexes = indexConfig.indexes || [];
      }
    } catch (error) {
      log('⚠️  No se pudo cargar firestore.indexes.json', 'yellow');
    }
    
    // Filtrar índices faltantes
    const missingIndexes = suggestedIndexes.filter(suggested => 
      !checkExistingIndexes(suggested, existingIndexes)
    );
    
    // Generar reporte
    log('📊 REPORTE DE ANÁLISIS DE CONSULTAS', 'bright');
    log('=====================================\n', 'cyan');
    
    log(`📈 Estadísticas:`, 'bright');
    log(`   - Archivos analizados: ${files.length}`, 'blue');
    log(`   - Consultas encontradas: ${allQueries.length}`, 'blue');
    log(`   - Índices sugeridos: ${suggestedIndexes.length}`, 'blue');
    log(`   - Índices existentes: ${existingIndexes.length}`, 'green');
    log(`   - Índices faltantes: ${missingIndexes.length}`, 'red');
    
    if (missingIndexes.length > 0) {
      log('\n❌ ÍNDICES FALTANTES:', 'red');
      log('===================\n', 'red');
      
      missingIndexes.forEach((index, i) => {
        log(`${i + 1}. Colección: ${index.collectionGroup}`, 'bright');
        log(`   Campos: ${index.fields.map(f => 
          `${f.fieldPath}${f.arrayConfig ? ` (${f.arrayConfig})` : ` (${f.order})`}`
        ).join(', ')}`, 'yellow');
        console.log();
      });
      
      // Generar archivo de índices faltantes
      const missingIndexesFile = {
        indexes: missingIndexes,
        fieldOverrides: []
      };
      
      const outputPath = path.join(__dirname, '..', 'firestore.missing-indexes.json');
      fs.writeFileSync(outputPath, JSON.stringify(missingIndexesFile, null, 2));
      
      log(`💾 Índices faltantes guardados en: firestore.missing-indexes.json`, 'green');
      log(`🚀 Para agregar estos índices, ejecuta:`, 'cyan');
      log(`   npm run deploy:indexes`, 'cyan');
    } else {
      log('\n✅ ¡Todos los índices necesarios están configurados!', 'green');
    }
    
    // Mostrar consultas problemáticas
    const problematicQueries = allQueries.filter(query => 
      query.whereClauses.length > 1 || 
      (query.whereClauses.length > 0 && query.orderByClauses.length > 0)
    );
    
    if (problematicQueries.length > 0) {
      log('\n⚠️  CONSULTAS COMPLEJAS DETECTADAS:', 'yellow');
      log('================================\n', 'yellow');
      
      problematicQueries.forEach((query, i) => {
        log(`${i + 1}. Archivo: ${query.file}:${query.line}`, 'bright');
        log(`   Colección: ${query.collection}`, 'blue');
        if (query.whereClauses.length > 0) {
          log(`   Where: ${query.whereClauses.map(w => 
            `${w.field} ${w.operator} ${w.value}`
          ).join(', ')}`, 'yellow');
        }
        if (query.orderByClauses.length > 0) {
          log(`   OrderBy: ${query.orderByClauses.map(o => 
            `${o.field} ${o.direction}`
          ).join(', ')}`, 'yellow');
        }
        console.log();
      });
    }
    
    log('\n🎉 Análisis completado exitosamente!', 'green');
    
  } catch (error) {
    log(`❌ Error durante el análisis: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Función para mostrar ayuda
function showHelp() {
  log(`
📚 Script de Análisis de Consultas de Firestore

Uso:
  node scripts/analyze-queries.js [opciones]

Opciones:
  --help, -h     Mostrar esta ayuda
  --output FILE  Guardar reporte en archivo específico
  --verbose      Mostrar detalles de cada consulta

Ejemplos:
  node scripts/analyze-queries.js
  node scripts/analyze-queries.js --verbose
  node scripts/analyze-queries.js --output report.json

Funcionalidades:
  - Escanea archivos .ts y .js en src/
  - Detecta consultas de Firestore
  - Sugiere índices faltantes
  - Genera reporte detallado
  - Identifica consultas complejas

Notas:
  - Requiere firestore.indexes.json para comparación
  - Genera firestore.missing-indexes.json si hay índices faltantes
  - Analiza patrones de consulta comunes
  `, 'cyan');
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Ejecutar análisis
analyzeQueries(); 