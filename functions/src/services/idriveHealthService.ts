import { logger } from './loggerService';
import { fileExistsInS3, getFileInfo, uploadToS3 } from '../utils/idriveE2';

export interface IDriveHealthStatus {
  isHealthy: boolean;
  lastCheck: Date;
  responseTime: number;
  errors: string[];
  warnings: string[];
  bucketAccessible: boolean;
  uploadTest: boolean;
  downloadTest: boolean;
}

export class IDriveHealthService {
  private static instance: IDriveHealthService;
  private healthStatus: IDriveHealthStatus | null = null;
  private readonly checkInterval = 5 * 60 * 1000; // 5 minutos
  private lastCheckTime = 0;

  private constructor() {}

  static getInstance(): IDriveHealthService {
    if (!IDriveHealthService.instance) {
      IDriveHealthService.instance = new IDriveHealthService();
    }
    return IDriveHealthService.instance;
  }

  /**
   * Verifica la salud de la conexión con IDrive E2
   */
  async checkHealth(): Promise<IDriveHealthStatus> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      logger.info('[functions/src/services/idriveHealthService.ts] Iniciando verificación de salud de IDrive E2');

      // Verificar acceso al bucket
      const bucketAccessible = await this.testBucketAccess();
      
      // Verificar subida de archivo
      const uploadTest = await this.testUpload();
      
      // Verificar descarga de archivo
      const downloadTest = await this.testDownload();

      const responseTime = Date.now() - startTime;
      const isHealthy = bucketAccessible && uploadTest && downloadTest && errors.length === 0;

      this.healthStatus = {
        isHealthy,
        lastCheck: new Date(),
        responseTime,
        errors,
        warnings,
        bucketAccessible,
        uploadTest,
        downloadTest
      };

      logger.info('[functions/src/services/idriveHealthService.ts] Verificación de salud completada', {
        metadata: {
          isHealthy,
          responseTime,
          errors: errors.length,
          warnings: warnings.length
        }
      });

      return this.healthStatus;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      errors.push(`Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`);

      this.healthStatus = {
        isHealthy: false,
        lastCheck: new Date(),
        responseTime,
        errors,
        warnings,
        bucketAccessible: false,
        uploadTest: false,
        downloadTest: false
      };

      logger.error('[functions/src/services/idriveHealthService.ts] Error en verificación de salud:', error instanceof Error ? error : new Error(String(error)));
      return this.healthStatus;
    }
  }

  /**
   * Obtiene el estado de salud actual (sin verificar si no es necesario)
   */
  getHealthStatus(): IDriveHealthStatus | null {
    return this.healthStatus;
  }

  /**
   * Verifica la salud si ha pasado mucho tiempo desde la última verificación
   */
  async getHealthStatusWithCheck(): Promise<IDriveHealthStatus> {
    const now = Date.now();
    
    // Si no hay estado o ha pasado mucho tiempo, verificar
    if (!this.healthStatus || (now - this.lastCheckTime) > this.checkInterval) {
      this.lastCheckTime = now;
      return await this.checkHealth();
    }

    return this.healthStatus;
  }

  /**
   * Prueba el acceso al bucket
   */
  private async testBucketAccess(): Promise<boolean> {
    try {
      // Intentar verificar si existe un archivo de prueba
      const testKey = 'health-check/test-access.txt';
      await fileExistsInS3(testKey);
      return true;
    } catch (error) {
      logger.error('[functions/src/services/idriveHealthService.ts] Error verificando acceso al bucket:', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Prueba la subida de un archivo
   */
  private async testUpload(): Promise<boolean> {
    try {
      const testContent = Buffer.from('Test de salud de IDrive E2 - ' + new Date().toISOString());
      const testFileName = `health-check-${Date.now()}.txt`;
      
      await uploadToS3(
        testContent,
        testFileName,
        'text/plain',
        'health-check'
      );
      
      return true;
    } catch (error) {
      logger.error('[functions/src/services/idriveHealthService.ts] Error en prueba de subida:', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Prueba la descarga de un archivo
   */
  private async testDownload(): Promise<boolean> {
    try {
      const testKey = 'health-check/test-download.txt';
      const fileInfo = await getFileInfo(testKey);
      return fileInfo.exists;
    } catch (error) {
      logger.error('[functions/src/services/idriveHealthService.ts] Error en prueba de descarga:', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Verifica si hay problemas de tokens
   */
  async checkTokenIssues(): Promise<{
    hasTokenIssues: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      const health = await this.getHealthStatusWithCheck();

      if (!health.isHealthy) {
        issues.push('La conexión con IDrive E2 no está funcionando correctamente');
        
        if (!health.bucketAccessible) {
          issues.push('No se puede acceder al bucket de almacenamiento');
          recommendations.push('Verificar las credenciales de acceso');
          recommendations.push('Verificar que el bucket existe y es accesible');
        }

        if (!health.uploadTest) {
          issues.push('No se pueden subir archivos');
          recommendations.push('Verificar permisos de escritura en el bucket');
          recommendations.push('Verificar que las credenciales tienen permisos de subida');
        }

        if (!health.downloadTest) {
          issues.push('No se pueden descargar archivos');
          recommendations.push('Verificar permisos de lectura en el bucket');
        }

        if (health.responseTime > 10000) { // Más de 10 segundos
          issues.push('Tiempo de respuesta muy lento');
          recommendations.push('Verificar la conectividad de red');
          recommendations.push('Considerar cambiar la región del bucket');
        }
      }

      return {
        hasTokenIssues: issues.length > 0,
        issues,
        recommendations
      };
    } catch (error) {
      issues.push(`Error verificando problemas de tokens: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      recommendations.push('Revisar los logs del servidor para más detalles');
      
      return {
        hasTokenIssues: true,
        issues,
        recommendations
      };
    }
  }

  /**
   * Genera un reporte de salud detallado
   */
  async generateHealthReport(): Promise<{
    timestamp: Date;
    status: IDriveHealthStatus;
    tokenIssues: {
      hasTokenIssues: boolean;
      issues: string[];
      recommendations: string[];
    };
    summary: string;
  }> {
    const status = await this.getHealthStatusWithCheck();
    const tokenIssues = await this.checkTokenIssues();

    let summary = '';
    if (status.isHealthy && !tokenIssues.hasTokenIssues) {
      summary = '✅ IDrive E2 está funcionando correctamente';
    } else if (status.isHealthy && tokenIssues.hasTokenIssues) {
      summary = '⚠️ IDrive E2 funciona pero hay advertencias';
    } else {
      summary = '❌ IDrive E2 tiene problemas que requieren atención';
    }

    return {
      timestamp: new Date(),
      status,
      tokenIssues,
      summary
    };
  }
}

// Exportar instancia singleton
export const idriveHealthService = IDriveHealthService.getInstance(); 