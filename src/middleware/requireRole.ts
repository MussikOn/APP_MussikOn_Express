import { Request, Response, NextFunction } from 'express';
import { OperationalError } from './errorHandler';

// Role-based access control middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        throw new OperationalError('Usuario no autenticado', 401);
      }

      if (!allowedRoles.includes(user.role)) {
        throw new OperationalError(
          `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware específicos para roles comunes
export const requireAdmin = requireRole(['admin', 'super_admin']);
export const requireSuperAdmin = requireRole(['super_admin']);
export const requireMusician = requireRole(['musician', 'admin', 'super_admin']);
export const requireUser = requireRole(['user', 'musician', 'admin', 'super_admin']); 