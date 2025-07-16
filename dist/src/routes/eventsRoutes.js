"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const eventControllers_1 = require("../controllers/eventControllers");
const router = express_1.default.Router();
// Organizador crea solicitud de músico
router.post('/request-musician', authMiddleware_1.authMiddleware, eventControllers_1.requestMusicianController);
// Organizador ve sus eventos pendientes
router.get('/my-pending', authMiddleware_1.authMiddleware, eventControllers_1.myPendingEventsController);
// Organizador ve sus eventos asignados
router.get('/my-assigned', authMiddleware_1.authMiddleware, eventControllers_1.myAssignedEventsController);
// Organizador ve sus eventos completados
router.get('/my-completed', authMiddleware_1.authMiddleware, eventControllers_1.myCompletedEventsController);
// Músico ve solicitudes disponibles
router.get('/available-requests', authMiddleware_1.authMiddleware, eventControllers_1.availableRequestsController);
// Músico acepta una solicitud
router.post('/:eventId/accept', authMiddleware_1.authMiddleware, eventControllers_1.acceptEventController);
// Músico ve sus eventos agendados
router.get('/my-scheduled', authMiddleware_1.authMiddleware, eventControllers_1.myScheduledEventsController);
// Músico ve su historial de actuaciones
router.get('/my-past-performances', authMiddleware_1.authMiddleware, eventControllers_1.myPastPerformancesController);
exports.default = router;
