import { Request, Response, NextFunction } from "express";

/**
 * Middleware que permite el acceso solo a usuarios con rol admin o superadmin.
 * Se espera que req.user.roll esté presente (agregado por el middleware de autenticación).
 */
export function adminOnly(req: Request, res: Response, next: NextFunction) {
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
  }
  res.status(403).json({ message: "Acceso solo para administradores" });
}
