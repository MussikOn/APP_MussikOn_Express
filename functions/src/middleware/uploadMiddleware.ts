import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

/**
 * Middleware para manejar errores de multer
 */
export const handleMulterError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
        error: 'El archivo es demasiado grande',
        details: 'El tamaño máximo permitido es 10MB',
        code: 'FILE_TOO_LARGE'
      });
      return;
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
        res.status(400).json({
        error: 'Demasiados archivos',
        details: 'Solo se permite un archivo por vez',
        code: 'TOO_MANY_FILES'
      });
      return;
    }
    
      res.status(400).json({
      error: 'Error en la subida del archivo',
      details: error.message,
      code: 'UPLOAD_ERROR'
    });
    return;
  }
  
  if (error.message && error.message.includes('Tipo de archivo no permitido')) {
      res.status(400).json({
      error: 'Tipo de archivo no permitido',
      details: 'Solo se permiten imágenes (JPEG, PNG, GIF, WebP, SVG)',
      code: 'INVALID_FILE_TYPE'
    });
    return;
  }
  
  console.error('[src/middleware/uploadMiddleware.ts] Error de subida:', error);
    res.status(500).json({
    error: 'Error interno del servidor',
    details: 'Error al procesar el archivo',
    code: 'INTERNAL_ERROR'
  });
  return;
};

/**
 * Middleware para validar archivos antes de procesar
 */
export const validateImageFile = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.file) {
    res.status(400).json({
      error: 'No se proporcionó ningún archivo',
      code: 'NO_FILE'
    });
    return;
  }
  
  // Validar tamaño (máximo 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (req.file.size > maxSize) {
    res.status(400).json({
      error: 'El archivo es demasiado grande',
      details: `Tamaño máximo: ${maxSize / 1024 / 1024}MB`,
      code: 'FILE_TOO_LARGE'
    });
    return;
  }
  
  // Validar tipo MIME
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    res.status(400).json({
      error: 'Tipo de archivo no permitido',
      details: 'Solo se permiten imágenes (JPEG, PNG, GIF, WebP, SVG)',
      code: 'INVALID_FILE_TYPE'
    });
    return;
  }
  
  next();
};

/**
 * Configuración de multer para imágenes
 */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1, // Solo un archivo
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes'));
    }
  },
});

/**
 * Configuración de multer para documentos (comprobantes de pago)
 */
export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1, // Solo un archivo
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes y PDFs'));
    }
  },
});

// Exportación por defecto para compatibilidad
export const upload = documentUpload; 