import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../services/loggerService';

// Tipos para errores de validación
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  type?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedData: any;
}

/**
 * Clase para manejo de errores de validación
 */
export class ValidationErrorException extends Error {
  public errors: ValidationError[];
  public statusCode: number;

  constructor(
    errors: ValidationError[],
    message: string = 'Error de validación'
  ) {
    super(message);
    this.name = 'ValidationErrorException';
    this.errors = errors;
    this.statusCode = 400;
  }
}

/**
 * Función para sanitizar datos de entrada
 */
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    // Remover caracteres peligrosos y normalizar espacios
    return data
      .trim()
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/\s+/g, ' ') // Normalizar espacios múltiples
      .replace(/javascript:/gi, '') // Remover javascript: protocol
      .replace(/on\w+=/gi, '') // Remover event handlers
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // Remover scripts
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item));
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return data;
}

/**
 * Función para validar y sanitizar datos usando Joi
 */
export function validateAndSanitize(
  schema: Joi.ObjectSchema,
  data: any,
  options: Joi.ValidationOptions = {}
): ValidationResult {
  const defaultOptions: Joi.ValidationOptions = {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: false,
    convert: true,
    presence: 'required',
  };

  const validationOptions = { ...defaultOptions, ...options };

  try {
    // Sanitizar datos antes de validar
    const sanitizedData = sanitizeInput(data);

    const { error, value } = schema.validate(sanitizedData, validationOptions);

    if (error) {
      const errors: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
        type: detail.type,
      }));

      return {
        isValid: false,
        errors,
        sanitizedData: value,
      };
    }

    return {
      isValid: true,
      errors: [],
      sanitizedData: value,
    };
  } catch (err) {
    logger.error('Error en validación Joi', err as Error);
    return {
      isValid: false,
      errors: [
        {
          field: 'unknown',
          message: 'Error interno de validación',
          type: 'internal',
        },
      ],
      sanitizedData: data,
    };
  }
}

/**
 * Middleware de validación genérico mejorado
 */
export function validate(
  schema: Joi.ObjectSchema,
  property: 'body' | 'query' | 'params' = 'body',
  options: Joi.ValidationOptions = {}
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[property];
      const result = validateAndSanitize(schema, data, options);

      if (!result.isValid) {
        logger.warn('Validación fallida', {
          userId: (req as any).user?.userId,
          url: req.originalUrl,
          method: req.method,
          metadata: { errors: result.errors },
        });

        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: result.errors,
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
        return;
      }

      // Reemplazar datos con los validados y sanitizados
      req[property] = result.sanitizedData;

      logger.debug('Validación exitosa', {
        userId: (req as any).user?.userId,
        url: req.originalUrl,
        method: req.method,
      });

      next();
    } catch (error) {
      logger.error('Error en middleware de validación', error as Error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        timestamp: new Date().toISOString(),
      });
    }
  };
}

/**
 * Middleware para validar IDs de Firestore
 */
export function validateId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const id = req.params.id;

  if (!id || typeof id !== 'string') {
    res.status(400).json({
      success: false,
      message: 'ID requerido',
      field: 'id',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const sanitizedId = sanitizeInput(id);

  // Validación para IDs de Firestore
  if (sanitizedId.length < 1 || sanitizedId.length > 1500) {
    res.status(400).json({
      success: false,
      message: 'ID inválido: debe tener entre 1 y 1500 caracteres',
      field: 'id',
      value: sanitizedId,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Verificar que no contenga caracteres peligrosos
  if (/[<>\"'&]/.test(sanitizedId)) {
    res.status(400).json({
      success: false,
      message: 'ID contiene caracteres no permitidos',
      field: 'id',
      value: sanitizedId,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  req.params.id = sanitizedId;
  next();
}

/**
 * Middleware para validar paginación
 */
export function validatePagination(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = parseInt(req.query.offset as string) || 0;

  const errors: ValidationError[] = [];

  if (page < 1) {
    errors.push({
      field: 'page',
      message: 'Página debe ser mayor a 0',
      value: page,
    });
  }

  if (limit < 1 || limit > 100) {
    errors.push({
      field: 'limit',
      message: 'Límite debe estar entre 1 y 100',
      value: limit,
    });
  }

  if (offset < 0) {
    errors.push({
      field: 'offset',
      message: 'Offset debe ser mayor o igual a 0',
      value: offset,
    });
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Parámetros de paginación inválidos',
      errors,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Agregar valores validados a req
  (req as any).pagination = { page, limit, offset };
  next();
}

/**
 * Middleware para validar archivos
 */
export function validateFile(
  allowedTypes: string[] = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  maxSize: number = 10 * 1024 * 1024 // 10MB por defecto
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.file && !req.files) {
      res.status(400).json({
        success: false,
        message: 'Archivo requerido',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const files = req.files
      ? Array.isArray(req.files)
        ? req.files
        : [req.files]
      : [req.file];
    const errors: ValidationError[] = [];

    for (const file of files) {
      if (!file) continue;

      // Validar tipo de archivo
      if (
        file.mimetype &&
        typeof file.mimetype === 'string' &&
        !allowedTypes.includes(file.mimetype)
      ) {
        errors.push({
          field: 'file',
          message: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`,
          value: file.mimetype,
        });
      }

      // Validar tamaño
      if (typeof file.size === 'number' && file.size > maxSize) {
        errors.push({
          field: 'file',
          message: `Archivo demasiado grande. Tamaño máximo: ${Math.round(maxSize / 1024 / 1024)}MB`,
          value: file.size,
        });
      }

      // Validar nombre de archivo
      if (file.originalname && typeof file.originalname === 'string') {
        const sanitizedName = sanitizeInput(file.originalname);
        if (sanitizedName.length > 255) {
          errors.push({
            field: 'filename',
            message: 'Nombre de archivo demasiado largo',
            value: sanitizedName,
          });
        }

        // Verificar extensión
        const extension = sanitizedName.split('.').pop()?.toLowerCase();
        const allowedExtensions = allowedTypes.map(type => type.split('/')[1]);
        if (extension && !allowedExtensions.includes(extension)) {
          errors.push({
            field: 'filename',
            message: `Extensión no permitida. Extensiones permitidas: ${allowedExtensions.join(', ')}`,
            value: extension,
          });
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Archivo(s) inválido(s)',
        errors,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

/**
 * Middleware para validar coordenadas geográficas
 */
export function validateCoordinates(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { lat, lng, latitude, longitude } = req.query;

  const latValue = parseFloat((lat || latitude) as string);
  const lngValue = parseFloat((lng || longitude) as string);

  const errors: ValidationError[] = [];

  if (isNaN(latValue) || latValue < -90 || latValue > 90) {
    errors.push({
      field: 'latitude',
      message: 'Latitud debe ser un número entre -90 y 90',
      value: latValue,
    });
  }

  if (isNaN(lngValue) || lngValue < -180 || lngValue > 180) {
    errors.push({
      field: 'longitude',
      message: 'Longitud debe ser un número entre -180 y 180',
      value: lngValue,
    });
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Coordenadas geográficas inválidas',
      errors,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Agregar coordenadas validadas a req
  (req as any).coordinates = { latitude: latValue, longitude: lngValue };
  next();
}

/**
 * Middleware para validar fechas
 */
export function validateDateRange(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { startDate, endDate, dateFrom, dateTo } = req.query;

  const start = startDate || dateFrom;
  const end = endDate || dateTo;

  if (!start || !end) {
    res.status(400).json({
      success: false,
      message: 'Fechas de inicio y fin requeridas',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const startDateObj = new Date(start as string);
  const endDateObj = new Date(end as string);

  const errors: ValidationError[] = [];

  if (isNaN(startDateObj.getTime())) {
    errors.push({
      field: 'startDate',
      message: 'Fecha de inicio inválida',
      value: start,
    });
  }

  if (isNaN(endDateObj.getTime())) {
    errors.push({
      field: 'endDate',
      message: 'Fecha de fin inválida',
      value: end,
    });
  }

  if (startDateObj >= endDateObj) {
    errors.push({
      field: 'dateRange',
      message: 'La fecha de inicio debe ser anterior a la fecha de fin',
      value: { start: startDateObj, end: endDateObj },
    });
  }

  // Verificar que las fechas no estén muy en el futuro (más de 10 años)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 10);

  if (startDateObj > maxDate || endDateObj > maxDate) {
    errors.push({
      field: 'dateRange',
      message: 'Las fechas no pueden estar más de 10 años en el futuro',
      value: { start: startDateObj, end: endDateObj },
    });
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Rango de fechas inválido',
      errors,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Agregar fechas validadas a req
  (req as any).dateRange = { startDate: startDateObj, endDate: endDateObj };
  next();
}

/**
 * Middleware para validar rangos de precios
 */
export function validatePriceRange(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { minPrice, maxPrice, budget, budgetMax } = req.query;

  const min = parseFloat((minPrice || budget) as string);
  const max = parseFloat((maxPrice || budgetMax) as string);

  if (min !== undefined || max !== undefined) {
    const errors: ValidationError[] = [];

    if (min !== undefined && (isNaN(min) || min < 0)) {
      errors.push({
        field: 'minPrice',
        message: 'Precio mínimo debe ser un número mayor o igual a 0',
        value: min,
      });
    }

    if (max !== undefined && (isNaN(max) || max < 0)) {
      errors.push({
        field: 'maxPrice',
        message: 'Precio máximo debe ser un número mayor o igual a 0',
        value: max,
      });
    }

    if (min !== undefined && max !== undefined && min > max) {
      errors.push({
        field: 'priceRange',
        message: 'El precio mínimo no puede ser mayor al precio máximo',
        value: { min, max },
      });
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Rango de precios inválido',
        errors,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Agregar precios validados a req
    (req as any).priceRange = { min, max };
  }

  next();
}

/**
 * Middleware para validar roles de usuario
 */
export function validateUserRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!allowedRoles.includes(user.roll)) {
      res.status(403).json({
        success: false,
        message: `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`,
        userRole: user.roll,
        allowedRoles,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

/**
 * Middleware para validar límites de consulta
 */
export function validateQueryLimit(maxLimit: number = 100) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const limit = parseInt(req.query.limit as string) || 10;

    if (limit > maxLimit) {
      res.status(400).json({
        success: false,
        message: `Límite máximo permitido: ${maxLimit}`,
        field: 'limit',
        value: limit,
        maxLimit,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

/**
 * Middleware para validar campos de búsqueda
 */
export function validateSearchQuery(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { query, search } = req.query;
  const searchTerm = query || search;

  if (searchTerm && typeof searchTerm === 'string') {
    const sanitizedQuery = sanitizeInput(searchTerm);

    if (sanitizedQuery.length < 1) {
      res.status(400).json({
        success: false,
        message: 'Término de búsqueda no puede estar vacío',
        field: 'query',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (sanitizedQuery.length > 100) {
      res.status(400).json({
        success: false,
        message: 'Término de búsqueda demasiado largo (máximo 100 caracteres)',
        field: 'query',
        value: sanitizedQuery.length,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Verificar caracteres especiales peligrosos
    if (/[<>\"'&]/.test(sanitizedQuery)) {
      res.status(400).json({
        success: false,
        message: 'Término de búsqueda contiene caracteres no permitidos',
        field: 'query',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    req.query.query = sanitizedQuery;
  }

  next();
}
