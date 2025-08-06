import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { db } from '../utils/firebase';
import { createToken } from '../utils/jwt';
import { logger } from '../services/loggerService';

export class AdminAuthController {
  /**
   * Login para el panel de administración
   */
  async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role } = req.body;

      logger.info('[src/controllers/adminAuthController.ts] Intento de login admin', { 
        metadata: { email, role } 
      });

      // Validar campos requeridos
      if (!email || !password || !role) {
        res.status(400).json({
          success: false,
          error: 'Email, contraseña y rol son requeridos'
        });
        return;
      }

      // Validar rol permitido
      const allowedRoles = ['admin', 'superadmin', 'eventCreator', 'musician'];
      if (!allowedRoles.includes(role)) {
        res.status(400).json({
          success: false,
          error: 'Rol no válido'
        });
        return;
      }

      // Buscar usuario en Firestore
      const userSnapshot = await db.collection('users')
        .where('userEmail', '==', email)
        .where('roll', '==', role)
        .limit(1)
        .get();

      if (userSnapshot.empty) {
        res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
        return;
      }

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, userData.userPassword);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
        return;
      }

      // Verificar que el usuario esté activo
      if (userData.status !== 'active') {
        res.status(403).json({
          success: false,
          error: 'Usuario inactivo'
        });
        return;
      }

      // Crear token JWT
      const token = createToken(
        userData.name,
        userData.lastName,
        userData.userEmail,
        userData.roll
      );

      if (!token) {
        res.status(500).json({
          success: false,
          error: 'Error generando token'
        });
        return;
      }

      // Actualizar último login
      await userDoc.ref.update({
        lastLogin: new Date().toISOString(),
        loginCount: (userData.loginCount || 0) + 1
      });

      logger.info('[src/controllers/adminAuthController.ts] Login exitoso', { 
        metadata: { 
          userId: userDoc.id, 
          email, 
          role 
        }
      });

      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: userDoc.id,
            email: userData.userEmail,
            role: userData.roll,
            name: userData.name,
            lastName: userData.lastName,
            status: userData.status
          }
        }
      });

    } catch (error) {
      logger.error('[src/controllers/adminAuthController.ts] Error en login admin', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Verificar token de autenticación
   */
  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          success: false,
          error: 'Token no proporcionado'
        });
        return;
      }

      // Verificar token usando jwt.verify directamente
      const jwt = require('jsonwebtoken');
      const { TOKEN_SECRET } = require('../../../ENV');
      
      const decoded = jwt.verify(token, TOKEN_SECRET);
      
      // Buscar usuario en la base de datos para verificar que aún existe
      const userSnapshot = await db.collection('users').doc(decoded.userId).get();
      
      if (!userSnapshot.exists) {
        res.status(401).json({
          success: false,
          error: 'Usuario no encontrado'
        });
        return;
      }

      const userData = userSnapshot.data();

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: userSnapshot.id,
            email: userData?.userEmail,
            role: userData?.roll,
            name: userData?.name,
            lastName: userData?.lastName,
            status: userData?.status
          }
        }
      });

    } catch (error) {
      logger.error('[src/controllers/adminAuthController.ts] Error verificando token', error as Error);
      
      res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }
  }

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // El middleware de autenticación ya verificó el token y agregó user a req
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.userId,
            email: user.email,
            role: user.role,
            name: user.name,
            lastName: user.lastName
          }
        }
      });

    } catch (error) {
      logger.error('[src/controllers/adminAuthController.ts] Error obteniendo usuario actual', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Logout (invalidar token)
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // En un sistema real, aquí podrías invalidar el token en una blacklist
      // Por ahora, solo respondemos exitosamente
      
      logger.info('[src/controllers/adminAuthController.ts] Logout exitoso', { 
        userId: (req as any).user?.userId 
      });

      res.status(200).json({
        success: true,
        message: 'Logout exitoso'
      });

    } catch (error) {
      logger.error('[src/controllers/adminAuthController.ts] Error en logout', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear usuario administrador (solo para desarrollo)
   */
  async createAdminUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, lastName, email, password, role } = req.body;

      // Validar campos
      if (!name || !lastName || !email || !password || !role) {
        res.status(400).json({
          success: false,
          error: 'Todos los campos son requeridos'
        });
        return;
      }

      // Validar rol
      const allowedRoles = ['admin', 'superadmin', 'eventCreator', 'musician'];
      if (!allowedRoles.includes(role)) {
        res.status(400).json({
          success: false,
          error: 'Rol no válido'
        });
        return;
      }

      // Verificar si el usuario ya existe
      const existingUser = await db.collection('users')
        .where('userEmail', '==', email)
        .limit(1)
        .get();

      if (!existingUser.empty) {
        res.status(409).json({
          success: false,
          error: 'El usuario ya existe'
        });
        return;
      }

      // Encriptar contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear usuario
      const userData = {
        name,
        lastName,
        userEmail: email,
        userPassword: hashedPassword,
        roll: role,
        status: 'active',
        create_at: new Date().toISOString(),
        lastLogin: null,
        loginCount: 0
      };

      const userRef = await db.collection('users').add(userData);

      logger.info('[src/controllers/adminAuthController.ts] Usuario admin creado', { 
        metadata: { 
          userId: userRef.id, 
          email, 
          role 
        }
      });

      res.status(201).json({
        success: true,
        data: {
          userId: userRef.id,
          email,
          role,
          name,
          lastName
        }
      });

    } catch (error) {
      logger.error('[src/controllers/adminAuthController.ts] Error creando usuario admin', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

// Instancia singleton
export const adminAuthController = new AdminAuthController(); 