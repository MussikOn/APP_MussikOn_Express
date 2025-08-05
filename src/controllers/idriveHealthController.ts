import { Request, Response } from 'express';
import { idriveHealthService } from '../services/idriveHealthService';
import { logger } from '../services/loggerService';

export class IDriveHealthController {
  /**
   * Obtiene el estado de salud actual de IDrive E2
   */
  async getHealthStatus(req: Request, res: Response): Promise<void> {
    try {
      logger.info('[src/controllers/idriveHealthController.ts] Solicitando estado de salud de IDrive E2');
      
      const healthStatus = await idriveHealthService.getHealthStatusWithCheck();
      
      res.status(200).json({
        success: true,
        data: healthStatus,
        message: healthStatus.isHealthy ? 'IDrive E2 está funcionando correctamente' : 'IDrive E2 tiene problemas'
      });
    } catch (error) {
      logger.error('[src/controllers/idriveHealthController.ts] Error obteniendo estado de salud:', error instanceof Error ? error : new Error(String(error)));
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estado de salud de IDrive E2'
      });
    }
  }

  /**
   * Fuerza una verificación de salud completa
   */
  async forceHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      logger.info('[src/controllers/idriveHealthController.ts] Forzando verificación de salud de IDrive E2');
      
      const healthStatus = await idriveHealthService.checkHealth();
      
      res.status(200).json({
        success: true,
        data: healthStatus,
        message: 'Verificación de salud completada'
      });
    } catch (error) {
      logger.error('[src/controllers/idriveHealthController.ts] Error en verificación forzada:', error instanceof Error ? error : new Error(String(error)));
      
      res.status(500).json({
        success: false,
        error: 'Error en verificación de salud de IDrive E2'
      });
    }
  }

  /**
   * Verifica problemas específicos de tokens
   */
  async checkTokenIssues(req: Request, res: Response): Promise<void> {
    try {
      logger.info('[src/controllers/idriveHealthController.ts] Verificando problemas de tokens de IDrive E2');
      
      const tokenIssues = await idriveHealthService.checkTokenIssues();
      
      res.status(200).json({
        success: true,
        data: tokenIssues,
        message: tokenIssues.hasTokenIssues ? 'Se encontraron problemas de tokens' : 'No se encontraron problemas de tokens'
      });
    } catch (error) {
      logger.error('[src/controllers/idriveHealthController.ts] Error verificando problemas de tokens:', error instanceof Error ? error : new Error(String(error)));
      
      res.status(500).json({
        success: false,
        error: 'Error verificando problemas de tokens de IDrive E2'
      });
    }
  }

  /**
   * Genera un reporte completo de salud
   */
  async generateHealthReport(req: Request, res: Response): Promise<void> {
    try {
      logger.info('[src/controllers/idriveHealthController.ts] Generando reporte de salud de IDrive E2');
      
      const report = await idriveHealthService.generateHealthReport();
      
      res.status(200).json({
        success: true,
        data: report,
        message: 'Reporte de salud generado exitosamente'
      });
    } catch (error) {
      logger.error('[src/controllers/idriveHealthController.ts] Error generando reporte de salud:', error instanceof Error ? error : new Error(String(error)));
      
      res.status(500).json({
        success: false,
        error: 'Error generando reporte de salud de IDrive E2'
      });
    }
  }

  /**
   * Obtiene estadísticas de uso de IDrive E2
   */
  async getUsageStats(req: Request, res: Response): Promise<void> {
    try {
      logger.info('[src/controllers/idriveHealthController.ts] Obteniendo estadísticas de uso de IDrive E2');
      
      // Aquí podrías implementar lógica para obtener estadísticas reales
      // Por ahora, devolvemos información básica
      const stats = {
        lastHealthCheck: idriveHealthService.getHealthStatus()?.lastCheck || null,
        isCurrentlyHealthy: idriveHealthService.getHealthStatus()?.isHealthy || false,
        averageResponseTime: idriveHealthService.getHealthStatus()?.responseTime || 0,
        totalChecks: 0, // Implementar contador
        successfulChecks: 0, // Implementar contador
        failedChecks: 0 // Implementar contador
      };
      
      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estadísticas de uso obtenidas'
      });
    } catch (error) {
      logger.error('[src/controllers/idriveHealthController.ts] Error obteniendo estadísticas:', error instanceof Error ? error : new Error(String(error)));
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estadísticas de uso de IDrive E2'
      });
    }
  }

  /**
   * Reinicia la conexión con IDrive E2
   */
  async restartConnection(req: Request, res: Response): Promise<void> {
    try {
      logger.info('[src/controllers/idriveHealthController.ts] Reiniciando conexión con IDrive E2');
      
      // Forzar una nueva verificación de salud
      const healthStatus = await idriveHealthService.checkHealth();
      
      res.status(200).json({
        success: true,
        data: healthStatus,
        message: 'Conexión con IDrive E2 reiniciada'
      });
    } catch (error) {
      logger.error('[src/controllers/idriveHealthController.ts] Error reiniciando conexión:', error instanceof Error ? error : new Error(String(error)));
      
      res.status(500).json({
        success: false,
        error: 'Error reiniciando conexión con IDrive E2'
      });
    }
  }

  /**
   * Obtiene información de configuración de IDrive E2 (sin credenciales sensibles)
   */
  async getConfigurationInfo(req: Request, res: Response): Promise<void> {
    try {
      logger.info('[src/controllers/idriveHealthController.ts] Obteniendo información de configuración de IDrive E2');
      
      const configInfo = {
        region: process.env.IDRIVE_E2_REGION || 'No configurado',
        endpoint: process.env.IDRIVE_E2_ENDPOINT ? 'Configurado' : 'No configurado',
        bucketName: process.env.IDRIVE_E2_BUCKET_NAME || 'No configurado',
        accessKeyConfigured: !!process.env.IDRIVE_E2_ACCESS_KEY,
        secretKeyConfigured: !!process.env.IDRIVE_E2_SECRET_KEY,
        environment: process.env.NODE_ENV || 'development'
      };
      
      res.status(200).json({
        success: true,
        data: configInfo,
        message: 'Información de configuración obtenida'
      });
    } catch (error) {
      logger.error('[src/controllers/idriveHealthController.ts] Error obteniendo configuración:', error instanceof Error ? error : new Error(String(error)));
      
      res.status(500).json({
        success: false,
        error: 'Error obteniendo información de configuración'
      });
    }
  }
} 