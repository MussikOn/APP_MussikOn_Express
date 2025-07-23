import { Router } from 'express';
import { createRequest, acceptRequest, cancelRequest, getRequestStatus } from '../controllers/musicianRequestController';

const router = Router();

// Crear solicitud
router.post('/', createRequest);
// Aceptar solicitud
router.post('/accept', acceptRequest);
// Cancelar solicitud
router.post('/cancel', cancelRequest);
// Consultar estado
router.get('/:id/status', getRequestStatus);

export default router; 