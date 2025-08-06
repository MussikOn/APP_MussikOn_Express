import express from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/adminOnly';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Endpoints de analytics y estadísticas del sistema
 */

/**
 * @swagger
 * /analytics/stats:
 *   get:
 *     tags: [Analytics]
 *     summary: Obtener estadísticas generales del sistema
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         byRole:
 *                           type: object
 *                         change:
 *                           type: number
 *                     events:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         byStatus:
 *                           type: object
 *                         change:
 *                           type: number
 *                     requests:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         byStatus:
 *                           type: object
 *                         change:
 *                           type: number
 *                     images:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         totalSize:
 *                           type: number
 *                         change:
 *                           type: number
 *                     chat:
 *                       type: object
 *                       properties:
 *                         conversations:
 *                           type: integer
 *                         messages:
 *                           type: integer
 *                     system:
 *                       type: object
 *                       properties:
 *                         timestamp:
 *                           type: string
 *                         uptime:
 *                           type: number
 *                         memory:
 *                           type: object
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get(
  '/stats',
  authMiddleware,
  requireRole('admin', 'superadmin'),
  async (req, res) => {
    await analyticsController.getSystemStats(req, res);
  }
);

// Ruta temporal pública para desarrollo (remover en producción)
router.get(
  '/stats/public',
  async (req, res) => {
    await analyticsController.getSystemStats(req, res);
  }
);

// Ruta con autenticación real
router.get(
  '/stats/authenticated',
  authMiddleware,
  requireRole('admin', 'superadmin'),
  async (req, res) => {
    await analyticsController.getSystemStats(req, res);
  }
);

/**
 * @swagger
 * /analytics/performance:
 *   get:
 *     tags: [Analytics]
 *     summary: Obtener estadísticas de rendimiento del sistema
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de rendimiento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                     memory:
 *                       type: object
 *                     cpu:
 *                       type: object
 *                     uptime:
 *                       type: number
 *                     platform:
 *                       type: string
 *                     nodeVersion:
 *                       type: string
 *                     pid:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get(
  '/performance',
  authMiddleware,
  requireRole('admin', 'superadmin'),
  async (req, res) => {
    await analyticsController.getPerformanceStats(req, res);
  }
);

/**
 * @swagger
 * /analytics/recent-activity:
 *   get:
 *     tags: [Analytics]
 *     summary: Obtener actividad reciente del sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de registros a obtener
 *     responses:
 *       200:
 *         description: Actividad reciente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     events:
 *                       type: array
 *                       items:
 *                         type: object
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                     requests:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get(
  '/recent-activity',
  authMiddleware,
  requireRole('admin', 'superadmin'),
  async (req, res) => {
    await analyticsController.getRecentActivity(req, res);
  }
);

/**
 * @swagger
 * /analytics:
 *   get:
 *     tags: [Analytics]
 *     summary: Obtener estadísticas generales (alias para /stats)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del sistema
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get(
  '/',
  authMiddleware,
  requireRole('admin', 'superadmin'),
  async (req, res) => {
    await analyticsController.getSystemStats(req, res);
  }
);

export default router;
