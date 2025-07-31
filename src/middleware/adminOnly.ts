import { Request, Response, NextFunction } from "express";

/**
 * Middleware que permite el acceso solo a usuarios con rol admin o superadmin.
 * Debe usarse DESPUÉS de authMiddleware.
 */
export function adminOnly(req: Request, res: Response, next: NextFunction): void {
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
    user.roll === "superAdmin"
  ) {
    next();
  } else {
    res.status(403).json({ message: "Acceso solo para administradores" });
  }
}

/**
 * Middleware genérico para validar roles específicos
 * @param roles Roles permitidos para acceder al endpoint
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.roll)) {
      res.status(403).json({ msg: 'No autorizado. Rol insuficiente.' });
      return;
    }
    next();
  };
}
