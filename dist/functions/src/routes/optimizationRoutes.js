"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const optimizationController_1 = require("../controllers/optimizationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const requireRole_1 = require("../middleware/requireRole");
const router = (0, express_1.Router)();
const optimizationController = new optimizationController_1.OptimizationController();
/**
 * @swagger
 * components:
 *   schemas:
 *     CacheStats:
 *       type: object
 *       properties:
 *         hits:
 *           type: number
 *           description: Number of cache hits
 *         misses:
 *           type: number
 *           description: Number of cache misses
 *         keys:
 *           type: number
 *           description: Number of cached keys
 *         hitRate:
 *           type: number
 *           description: Cache hit rate percentage
 *     OptimizationStats:
 *       type: object
 *       properties:
 *         cache:
 *           $ref: '#/components/schemas/CacheStats'
 *         firestore:
 *           type: object
 *           properties:
 *             cacheSize:
 *               type: number
 *             activeQueries:
 *               type: number
 *         query:
 *           type: object
 *           properties:
 *             queryTime:
 *               type: number
 *             resultCount:
 *               type: number
 *             cacheHit:
 *               type: boolean
 *             optimizationApplied:
 *               type: boolean
 *     QueryAnalysis:
 *       type: object
 *       properties:
 *         recommendedIndexes:
 *           type: array
 *           items:
 *             type: string
 *         estimatedCost:
 *           type: number
 *         optimizationSuggestions:
 *           type: array
 *           items:
 *             type: string
 *     BatchOperation:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [create, update, delete]
 *         collection:
 *           type: string
 *         document:
 *           type: string
 *         data:
 *           type: object
 *     HealthStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, degraded, unhealthy]
 *         services:
 *           type: object
 *           properties:
 *             cache:
 *               type: string
 *             firestore:
 *               type: string
 *             memory:
 *               type: string
 */
/**
 * @swagger
 * /optimization/cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     description: Retrieve comprehensive cache performance statistics
 *     tags: [Optimization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache statistics retrieved successfully
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
 *                     cache:
 *                       $ref: '#/components/schemas/CacheStats'
 *                     firestore:
 *                       type: object
 *                     timestamp:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/cache/stats', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['admin', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () { yield optimizationController.getCacheStats(req, res); }));
/**
 * @swagger
 * /optimization/cache/clear:
 *   delete:
 *     summary: Clear cache
 *     description: Clear all cache or cache with specific prefix
 *     tags: [Optimization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: prefix
 *         schema:
 *           type: string
 *         description: Cache prefix to clear (optional)
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/cache/clear', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['admin', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () { yield optimizationController.clearCache(req, res); }));
/**
 * @swagger
 * /optimization/query/analyze:
 *   post:
 *     summary: Analyze query performance
 *     description: Analyze and provide recommendations for query optimization
 *     tags: [Optimization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection
 *             properties:
 *               collection:
 *                 type: string
 *                 description: Firestore collection name
 *               filters:
 *                 type: object
 *                 description: Query filters
 *               options:
 *                 type: object
 *                 description: Query options
 *     responses:
 *       200:
 *         description: Query analysis completed
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
 *                     collection:
 *                       type: string
 *                     analysis:
 *                       $ref: '#/components/schemas/QueryAnalysis'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/query/analyze', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['admin', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () { yield optimizationController.analyzeQueryPerformance(req, res); }));
/**
 * @swagger
 * /optimization/index/create:
 *   post:
 *     summary: Create composite index
 *     description: Request creation of a composite index for better query performance
 *     tags: [Optimization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection
 *               - fields
 *             properties:
 *               collection:
 *                 type: string
 *                 description: Firestore collection name
 *               fields:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Fields to include in the index
 *               queryScopes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Query scopes for the index
 *     responses:
 *       200:
 *         description: Composite index creation requested
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/index/create', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['admin', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () { yield optimizationController.createCompositeIndex(req, res); }));
/**
 * @swagger
 * /optimization/stats:
 *   get:
 *     summary: Get optimization statistics
 *     description: Retrieve comprehensive optimization performance statistics
 *     tags: [Optimization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Optimization statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/OptimizationStats'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/stats', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['admin', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () { yield optimizationController.getOptimizationStats(req, res); }));
/**
 * @swagger
 * /optimization/query/execute:
 *   post:
 *     summary: Execute optimized query
 *     description: Execute a query with optimization applied
 *     tags: [Optimization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection
 *             properties:
 *               collection:
 *                 type: string
 *                 description: Firestore collection name
 *               filters:
 *                 type: object
 *                 description: Query filters
 *               options:
 *                 type: object
 *                 description: Query options
 *     responses:
 *       200:
 *         description: Optimized query executed successfully
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
 *                     collection:
 *                       type: string
 *                     results:
 *                       type: array
 *                     metrics:
 *                       type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/query/execute', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['admin', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () { yield optimizationController.optimizeQuery(req, res); }));
/**
 * @swagger
 * /optimization/batch:
 *   post:
 *     summary: Execute batch operations
 *     description: Execute multiple Firestore operations in batches for better performance
 *     tags: [Optimization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operations
 *             properties:
 *               operations:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/BatchOperation'
 *     responses:
 *       200:
 *         description: Batch operations completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOperations:
 *                       type: number
 *                     successfulResults:
 *                       type: number
 *                     errors:
 *                       type: array
 *       207:
 *         description: Some batch operations failed
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/batch', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['admin', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () { yield optimizationController.batchOperations(req, res); }));
/**
 * @swagger
 * /optimization/health:
 *   get:
 *     summary: Health check
 *     description: Check the health status of optimization services
 *     tags: [Optimization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/HealthStatus'
 *       500:
 *         description: Health check failed
 */
router.get('/health', authMiddleware_1.authMiddleware, (0, requireRole_1.requireRole)(['admin', 'superadmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () { yield optimizationController.healthCheck(req, res); }));
exports.default = router;
