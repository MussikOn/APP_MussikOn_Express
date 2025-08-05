import { Request, Response, NextFunction } from 'express';
import { OperationalError } from './errorHandler';

// Role-based access control middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        console.log('[src/middleware/requireRole.ts:10] Usuario no autenticado');
        throw new OperationalError('Usuario no autenticado', 401);
      }

      console.log('[src/middleware/requireRole.ts:15] Usuario autenticado:', {
        email: user.userEmail,
        roll: user.roll,
        allowedRoles
      });

      if (!allowedRoles.includes(user.roll)) {
        console.log('[src/middleware/requireRole.ts:22] Acceso denegado - Rol no permitido');
        throw new OperationalError(
          `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`,
          403
        );
      }

      console.log('[src/middleware/requireRole.ts:28] Acceso permitido');
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware específicos para roles comunes 
export const requireAdmin = requireRole(['admin', 'superadmin']);
export const requireSuperAdmin = requireRole(['superadmin']);
export const requireMusician = requireRole([
  'musician',
  'admin',
  'superadmin',
]);
export const requireUser = requireRole([
  'user',
  'musician',
  'admin',
  'superadmin',
]);
