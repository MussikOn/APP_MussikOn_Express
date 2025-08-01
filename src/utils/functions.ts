import { randomInt } from 'crypto';
import { Response } from 'express';

export const numberRandon = () => {
  const number = randomInt(100000, 1000000);
  return number;
};

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
// Centraliza el manejo de errores y respuestas
export function handleError(
  res: Response,
  error: any,
  message: string = 'Error interno del servidor',
  status: number = 500
) {
  console.error(error);
  return res.status(status).json({ msg: message, error });
}

export function handleSuccess(
  res: Response,
  data: any,
  message: string = 'Operación exitosa',
  status: number = 200
) {
  return res.status(status).json({ msg: message, data });
}
