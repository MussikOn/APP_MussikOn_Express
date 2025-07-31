import { Request, Response, NextFunction } from "express";

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  // @ts-ignore
  const user = req.user;
  if (user && (user.roll === 'admin' || user.roll === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ error: "Acceso denegado: solo administradores" });
  }
}
