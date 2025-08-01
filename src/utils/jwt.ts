import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../../ENV';

export function createToken(
  name: string,
  lastName: string,
  userEmail: string,
  roll: string
) {
  try {
    if (!userEmail || !name || !lastName || !roll) {
      return false;
    }

    // Generar token con expiración consistente para todos los roles
    // 24 horas para desarrollo, se puede ajustar según necesidades
    return jwt.sign(
      {
        name: name,
        lastName: lastName,
        userEmail: userEmail,
        roll: roll,
      },
      TOKEN_SECRET,
      { expiresIn: '24h' }
    );
  } catch (error) {
    return false;
  }
}
