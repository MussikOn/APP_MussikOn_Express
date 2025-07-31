import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../../ENV';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);
    // Agregar el usuario decodificado en req.user
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

/**
 * Middleware para validar el rol del usuario.
 * @param roles Roles permitidos para acceder al endpoint
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.roll)) {
      return res.status(403).json({ msg: 'No autorizado. Rol insuficiente.' });
    }
    next();
  };
}
