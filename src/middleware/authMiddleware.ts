import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../../ENV';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Validar que el token no esté vacío
  if (!token || token.trim() === '') {
    res.status(401).json({ message: 'Token inválido o expirado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);
    // Agregar el usuario decodificado en req.user
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
}


