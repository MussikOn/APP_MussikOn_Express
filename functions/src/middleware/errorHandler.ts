import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Clase para errores operacionales de la aplicación
 */
export class OperationalError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para manejar errores de forma centralizada
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Error de validación de Joi
  if (err.name === 'ValidationError') {
    const message = 'Datos de entrada inválidos';
    error = new OperationalError(message, 400);
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = new OperationalError(message, 401);
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = new OperationalError(message, 401);
  }

  // Error de Cast (ID inválido)
  if (err.name === 'CastError') {
    const message = 'ID inválido';
    error = new OperationalError(message, 400);
  }

  // Error de duplicación de clave única
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Datos duplicados';
    error = new OperationalError(message, 409);
  }

  // Error de Firestore
  if (err.name === 'FirebaseError') {
    const message = 'Error en la base de datos';
    error = new OperationalError(message, 500);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Middleware para capturar errores asíncronos
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Middleware para manejar rutas no encontradas
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = new OperationalError(
    `Ruta no encontrada: ${req.originalUrl}`,
    404
  );
  next(error);
}
