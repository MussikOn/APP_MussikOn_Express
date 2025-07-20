import express from "express";
import multer from "multer";
import { 
  createMusicianRequest,
  getAvailableRequests,
  respondToRequest,
  acceptMusician,
  getOrganizerRequestsList,
  cancelRequest,
  resendRequest
} from "../controllers/musicianRequestController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Configurar multer para subida de imágenes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  },
});

// Rutas para organizadores (creadores de eventos)
router.post('/create', authMiddleware, upload.single('flyer'), createMusicianRequest);
router.get('/organizer/:organizerId', authMiddleware, getOrganizerRequestsList);
router.post('/cancel/:requestId', authMiddleware, cancelRequest);
router.post('/resend/:requestId', authMiddleware, resendRequest);

// Rutas para músicos
router.get('/available', authMiddleware, getAvailableRequests);
router.post('/respond/:requestId', authMiddleware, respondToRequest);

// Rutas para aceptar músicos
router.post('/accept/:requestId/:musicianId', authMiddleware, acceptMusician);

export default router; 