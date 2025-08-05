import { Router } from 'express';
import { IDriveHealthController } from '../controllers/idriveHealthController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();
const idriveHealthController = new IDriveHealthController();

/**
 * @route GET /api/idrive/health
 * @desc Obtiene el estado de salud actual de IDrive E2
 * @access Admin only
 */
router.get('/health', authMiddleware, adminOnly, idriveHealthController.getHealthStatus.bind(idriveHealthController));

/**
 * @route POST /api/idrive/health/check
 * @desc Fuerza una verificación de salud completa
 * @access Admin only
 */
router.post('/health/check', authMiddleware, adminOnly, idriveHealthController.forceHealthCheck.bind(idriveHealthController));

/**
 * @route GET /api/idrive/health/tokens
 * @desc Verifica problemas específicos de tokens
 * @access Admin only
 */
router.get('/health/tokens', authMiddleware, adminOnly, idriveHealthController.checkTokenIssues.bind(idriveHealthController));

/**
 * @route GET /api/idrive/health/report
 * @desc Genera un reporte completo de salud
 * @access Admin only
 */
router.get('/health/report', authMiddleware, adminOnly, idriveHealthController.generateHealthReport.bind(idriveHealthController));

/**
 * @route GET /api/idrive/stats
 * @desc Obtiene estadísticas de uso de IDrive E2
 * @access Admin only
 */
router.get('/stats', authMiddleware, adminOnly, idriveHealthController.getUsageStats.bind(idriveHealthController));

/**
 * @route POST /api/idrive/restart
 * @desc Reinicia la conexión con IDrive E2
 * @access Admin only
 */
router.post('/restart', authMiddleware, adminOnly, idriveHealthController.restartConnection.bind(idriveHealthController));

/**
 * @route GET /api/idrive/config
 * @desc Obtiene información de configuración de IDrive E2 (sin credenciales sensibles)
 * @access Admin only
 */
router.get('/config', authMiddleware, adminOnly, idriveHealthController.getConfigurationInfo.bind(idriveHealthController));

export default router; 