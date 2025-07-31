import { Request, Response, NextFunction } from "express";
import { authMiddleware } from "./authMiddleware";

/**
 * Middleware que permite el acceso solo a usuarios con rol admin o superadmin.
 * Primero autentica y luego verifica el rol.
 */
export function adminOnly(req: Request, res: Response, next: NextFunction) {
  // Primero aplicar autenticación
  authMiddleware(req, res, (err?: any) => {
    if (err) {
      return res.status(401).json({ message: "Token no válido" });
    }
    
    // Luego verificar rol de administrador
    const user = (req as any).user;
    if (
      user &&
      (user.roll === "admin" ||
        user.roll === "superadmin" ||
        user.roll === "adminJunior" ||
        user.roll === "adminMidLevel" ||
        user.roll === "adminSenior" ||
        user.roll === "superAdmin")
    ) {
      next();
    } else {
      res.status(403).json({ message: "Acceso solo para administradores" });
    }
  });
}
