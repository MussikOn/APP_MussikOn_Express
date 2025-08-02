#!/usr/bin/env node

/**
 * 🚀 Script de Monitoreo de Performance
 * Monitorea las optimizaciones implementadas en producción
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  interval: parseInt(process.env.MONITOR_INTERVAL) || 60000, // 1 minuto
  logFile: process.env.LOG_FILE || 'performance-logs.json',
  alertThresholds: {
    cacheHitRate: 0.8,
    responseTime: 500,
    errorRate: 0.05,
    memoryUsage: 0.8
  }
};

// Colores para consola
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

class PerformanceMonitor {
  constructor() {
    this.logs = [];
    this.alerts = [];
    this.startTime = new Date();
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      service: 'performance-monitor'
    };

    this.logs.push(logEntry);
    
    // Colorear output en consola
    const colorMap = {
      info: colors.blue,
      success: colors.green,
      warning: colors.yellow,
      error: colors.red
    };

    const color = colorMap[level] || colors.reset;
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  async checkHealth() {
    try {
      this.log('🔍 Verificando health check...', 'info');
      
      const response = await axios.get(`${CONFIG.apiUrl}/health`, {
        timeout: 5000
      });

      if (response.status === 200) {
        this.log('✅ Health check exitoso', 'success');
        return true;
      } else {
        this.log(`❌ Health check falló: ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Error en health check: ${error.message}`, 'error');
      return false;
    }
  }

  async checkCacheStats() {
    try {
      this.log('📊 Obteniendo estadísticas de cache...', 'info');
      
      const response = await axios.get(`${CONFIG.apiUrl}/optimization/cache/stats`, {
        timeout: 5000
      });

      const stats = response.data;
      
      // Verificar métricas críticas
      if (stats.hitRate < CONFIG.alertThresholds.cacheHitRate) {
        this.alerts.push({
          type: 'cache_hit_rate',
          message: `Cache hit rate bajo: ${(stats.hitRate * 100).toFixed(2)}%`,
          threshold: CONFIG.alertThresholds.cacheHitRate * 100,
          current: stats.hitRate * 100
        });
        this.log(`⚠️ Cache hit rate bajo: ${(stats.hitRate * 100).toFixed(2)}%`, 'warning');
      } else {
        this.log(`✅ Cache hit rate: ${(stats.hitRate * 100).toFixed(2)}%`, 'success');
      }

      this.log(`📈 Total requests: ${stats.totalRequests}`, 'info');
      this.log(`⏱️ Average response time: ${stats.averageResponseTime}ms`, 'info');
      this.log(`💾 Memory usage: ${stats.memoryUsage}MB`, 'info');

      return stats;
    } catch (error) {
      this.log(`❌ Error obteniendo estadísticas de cache: ${error.message}`, 'error');
      return null;
    }
  }

  async checkOptimizationStats() {
    try {
      this.log('⚡ Obteniendo estadísticas de optimización...', 'info');
      
      const response = await axios.get(`${CONFIG.apiUrl}/optimization/stats`, {
        timeout: 5000
      });

      const stats = response.data;
      
      // Verificar métricas de performance
      if (stats.averageQueryTime > CONFIG.alertThresholds.responseTime) {
        this.alerts.push({
          type: 'slow_queries',
          message: `Consultas lentas detectadas: ${stats.averageQueryTime}ms promedio`,
          threshold: CONFIG.alertThresholds.responseTime,
          current: stats.averageQueryTime
        });
        this.log(`⚠️ Consultas lentas: ${stats.averageQueryTime}ms promedio`, 'warning');
      } else {
        this.log(`✅ Tiempo promedio de consulta: ${stats.averageQueryTime}ms`, 'success');
      }

      this.log(`🔍 Total queries: ${stats.totalQueries}`, 'info');
      this.log(`🎯 Cache hits: ${stats.cacheHits}`, 'info');
      this.log(`❌ Cache misses: ${stats.cacheMisses}`, 'info');

      return stats;
    } catch (error) {
      this.log(`❌ Error obteniendo estadísticas de optimización: ${error.message}`, 'error');
      return null;
    }
  }

  async testCompression() {
    try {
      this.log('🗜️ Probando compresión HTTP...', 'info');
      
      const response = await axios.get(`${CONFIG.apiUrl}/api/musicians`, {
        headers: {
          'Accept-Encoding': 'gzip, deflate'
        },
        timeout: 5000
      });

      const contentEncoding = response.headers['content-encoding'];
      const contentLength = response.headers['content-length'];

      if (contentEncoding === 'gzip') {
        this.log('✅ Compresión gzip funcionando correctamente', 'success');
        this.log(`📏 Tamaño de respuesta: ${contentLength} bytes`, 'info');
      } else {
        this.log('⚠️ Compresión no detectada', 'warning');
      }

      return {
        encoding: contentEncoding,
        size: contentLength
      };
    } catch (error) {
      this.log(`❌ Error probando compresión: ${error.message}`, 'error');
      return null;
    }
  }

  async testQueryOptimization() {
    try {
      this.log('🔍 Probando optimización de consultas...', 'info');
      
      const response = await axios.get(`${CONFIG.apiUrl}/api/musicians?page=1&limit=10&sort=rating&order=desc`, {
        timeout: 5000
      });

      const headers = response.headers;
      
      // Verificar headers de paginación
      if (headers['x-total-count'] && headers['x-page-count']) {
        this.log('✅ Headers de paginación presentes', 'success');
        this.log(`📄 Total: ${headers['x-total-count']}, Páginas: ${headers['x-page-count']}`, 'info');
      } else {
        this.log('⚠️ Headers de paginación no encontrados', 'warning');
      }

      return {
        totalCount: headers['x-total-count'],
        pageCount: headers['x-page-count'],
        hasPagination: !!(headers['x-total-count'] && headers['x-page-count'])
      };
    } catch (error) {
      this.log(`❌ Error probando optimización de consultas: ${error.message}`, 'error');
      return null;
    }
  }

  async runFullCheck() {
    this.log('🚀 Iniciando monitoreo completo de performance...', 'info');
    
    const results = {
      timestamp: new Date().toISOString(),
      health: await this.checkHealth(),
      cache: await this.checkCacheStats(),
      optimization: await this.checkOptimizationStats(),
      compression: await this.testCompression(),
      queryOptimization: await this.testQueryOptimization(),
      alerts: this.alerts
    };

    // Guardar resultados
    this.saveResults(results);

    // Mostrar resumen
    this.showSummary(results);

    return results;
  }

  saveResults(results) {
    try {
      const logPath = path.join(process.cwd(), CONFIG.logFile);
      
      // Cargar logs existentes
      let existingLogs = [];
      if (fs.existsSync(logPath)) {
        existingLogs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      }

      // Agregar nuevo resultado
      existingLogs.push(results);

      // Mantener solo los últimos 100 logs
      if (existingLogs.length > 100) {
        existingLogs = existingLogs.slice(-100);
      }

      // Guardar
      fs.writeFileSync(logPath, JSON.stringify(existingLogs, null, 2));
      this.log(`💾 Resultados guardados en ${CONFIG.logFile}`, 'info');
    } catch (error) {
      this.log(`❌ Error guardando resultados: ${error.message}`, 'error');
    }
  }

  showSummary(results) {
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.bright}📊 RESUMEN DE PERFORMANCE${colors.reset}`);
    console.log('='.repeat(60));

    // Health
    console.log(`${results.health ? colors.green : colors.red}🔍 Health Check: ${results.health ? 'OK' : 'FAIL'}${colors.reset}`);

    // Cache
    if (results.cache) {
      console.log(`${colors.blue}📊 Cache Hit Rate: ${(results.cache.hitRate * 100).toFixed(2)}%${colors.reset}`);
      console.log(`${colors.blue}⏱️ Avg Response Time: ${results.cache.averageResponseTime}ms${colors.reset}`);
    }

    // Optimization
    if (results.optimization) {
      console.log(`${colors.cyan}⚡ Avg Query Time: ${results.optimization.averageQueryTime}ms${colors.reset}`);
      console.log(`${colors.cyan}🔍 Total Queries: ${results.optimization.totalQueries}${colors.reset}`);
    }

    // Compression
    if (results.compression) {
      console.log(`${colors.magenta}🗜️ Compression: ${results.compression.encoding || 'None'}${colors.reset}`);
    }

    // Alerts
    if (results.alerts.length > 0) {
      console.log(`\n${colors.yellow}⚠️ ALERTAS ACTIVAS:${colors.reset}`);
      results.alerts.forEach(alert => {
        console.log(`${colors.yellow}  • ${alert.message}${colors.reset}`);
      });
    } else {
      console.log(`\n${colors.green}✅ No hay alertas activas${colors.reset}`);
    }

    console.log('='.repeat(60) + '\n');
  }

  startMonitoring() {
    this.log('🚀 Iniciando monitoreo continuo de performance...', 'info');
    this.log(`⏰ Intervalo: ${CONFIG.interval / 1000} segundos`, 'info');
    this.log(`🌐 API URL: ${CONFIG.apiUrl}`, 'info');

    // Ejecutar primera verificación
    this.runFullCheck();

    // Configurar intervalo
    setInterval(() => {
      this.runFullCheck();
    }, CONFIG.interval);
  }
}

// Función principal
async function main() {
  const monitor = new PerformanceMonitor();

  // Verificar argumentos
  const args = process.argv.slice(2);
  
  if (args.includes('--once')) {
    // Ejecutar una sola vez
    await monitor.runFullCheck();
    process.exit(0);
  } else if (args.includes('--help')) {
    console.log(`
${colors.bright}🚀 Performance Monitor - MussikOn Express${colors.reset}

Uso:
  node monitor-performance.js [opciones]

Opciones:
  --once     Ejecutar una sola vez y salir
  --help     Mostrar esta ayuda

Variables de entorno:
  API_URL                    URL de la API (default: http://localhost:3000)
  MONITOR_INTERVAL          Intervalo en ms (default: 60000)
  LOG_FILE                  Archivo de logs (default: performance-logs.json)

Ejemplos:
  node monitor-performance.js --once
  API_URL=https://api.mussikon.com node monitor-performance.js
    `);
    process.exit(0);
  } else {
    // Modo continuo
    monitor.startMonitoring();
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo monitoreo...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo monitoreo...');
  process.exit(0);
});

// Ejecutar
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
}); 