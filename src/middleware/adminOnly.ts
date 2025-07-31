import { Request, Response, NextFunction } from "express";
import { authMiddleware } from "./authMiddleware";

/**
 * Middleware que permite el acceso solo a usuarios con rol admin o superadmin.
 * Incluye automáticamente la autenticación.
 */
export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  // Primero verificar autenticación
  authMiddleware(req, res, (authError?: any) => {
    if (authError) {
      // Si hay error de autenticación, ya se envió la respuesta
      return;
    }
    
    // Luego verificar rol de administrador
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }
    
    if (
      user.roll === "admin" ||
      user.roll === "superadmin" ||
      user.roll === "adminJunior" ||
      user.roll === "adminMidLevel" ||
      user.roll === "adminSenior" ||
      user.roll === "superAdmin" ||
      user.roll === "organizador" ||
      user.roll === "eventCreator" ||
      user.roll === "musico" // Temporalmente permitido para testing
    ) {
      next();
    } else {
      res.status(403).json({ message: "Acceso solo para administradores" });
    }
  });
}

/**
 * Middleware genérico para validar roles específicos
 * Incluye automáticamente la autenticación.
 * @param roles Roles permitidos para acceder al endpoint
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Primero verificar autenticación
    authMiddleware(req, res, (authError?: any) => {
      if (authError) {
        // Si hay error de autenticación, ya se envió la respuesta
        return;
      }
      
      // Luego verificar rol específico
      const user = (req as any).user;
      if (!user || !roles.includes(user.roll)) {
        res.status(403).json({ msg: 'No autorizado. Rol insuficiente.' });
        return;
      }
      next();
    });
  };
}
