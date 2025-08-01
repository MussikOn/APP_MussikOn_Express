// Tests para el sistema de registro con verificación por email
import { musicianRegisterSchema } from '../utils/validationSchemas';

describe('Sistema de Registro con Verificación', () => {
  describe('Esquema de Registro de Músicos', () => {
    test('should validate correct musician registration data', () => {
      const validData = {
        name: 'Juan',
        lastName: 'Pérez',
        userEmail: 'juan@example.com',
        userPassword: 'Password123!',
        roll: 'musico'
      };

      const { error } = musicianRegisterSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should validate correct event creator registration data', () => {
      const validData = {
        name: 'María',
        lastName: 'García',
        userEmail: 'maria@example.com',
        userPassword: 'Password123!',
        roll: 'eventCreator'
      };

      const { error } = musicianRegisterSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject invalid roll', () => {
      const invalidData = {
        name: 'Juan',
        lastName: 'Pérez',
        userEmail: 'juan@example.com',
        userPassword: 'Password123!',
        roll: 'admin' // Rol no permitido
      };

      const { error } = musicianRegisterSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('roll');
    });

    test('should reject missing roll', () => {
      const invalidData = {
        name: 'Juan',
        lastName: 'Pérez',
        userEmail: 'juan@example.com',
        userPassword: 'Password123!'
        // roll faltante
      };

      const { error } = musicianRegisterSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('roll');
    });

    test('should reject weak password', () => {
      const invalidData = {
        name: 'Juan',
        lastName: 'Pérez',
        userEmail: 'juan@example.com',
        userPassword: '123', // Contraseña débil
        roll: 'musico'
      };

      const { error } = musicianRegisterSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('userPassword');
    });

    test('should reject invalid email', () => {
      const invalidData = {
        name: 'Juan',
        lastName: 'Pérez',
        userEmail: 'invalid-email', // Email inválido
        userPassword: 'Password123!',
        roll: 'musico'
      };

      const { error } = musicianRegisterSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('userEmail');
    });
  });

  describe('Flujo de Registro', () => {
    test('should follow correct registration flow', () => {
      // 1. Usuario solicita verificación
      const registrationData = {
        name: 'Juan',
        lastName: 'Pérez',
        userEmail: 'juan@example.com',
        userPassword: 'Password123!',
        roll: 'musico'
      };

      // 2. Validar datos de entrada
      const { error } = musicianRegisterSchema.validate(registrationData);
      expect(error).toBeUndefined();

      // 3. Simular envío de email (esto se probaría en integración)
      expect(registrationData.userEmail).toBe('juan@example.com');
      expect(registrationData.roll).toBe('musico');

      // 4. Simular verificación de código (esto se probaría en integración)
      const verificationData = {
        userEmail: 'juan@example.com',
        code: '123456'
      };

      expect(verificationData.userEmail).toBe(registrationData.userEmail);
      expect(verificationData.code).toHaveLength(6);
    });
  });

  describe('Validación de Roles', () => {
    test('should accept musico role', () => {
      const data = {
        name: 'Juan',
        lastName: 'Pérez',
        userEmail: 'juan@example.com',
        userPassword: 'Password123!',
        roll: 'musico'
      };

      const { error } = musicianRegisterSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should accept eventCreator role', () => {
      const data = {
        name: 'María',
        lastName: 'García',
        userEmail: 'maria@example.com',
        userPassword: 'Password123!',
        roll: 'eventCreator'
      };

      const { error } = musicianRegisterSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should reject other roles', () => {
      const invalidRoles = ['admin', 'superadmin', 'usuario', 'adminJunior'];
      
      invalidRoles.forEach(role => {
        const data = {
          name: 'Juan',
          lastName: 'Pérez',
          userEmail: 'juan@example.com',
          userPassword: 'Password123!',
          roll: role
        };

        const { error } = musicianRegisterSchema.validate(data);
        expect(error).toBeDefined();
        expect(error?.details[0].path).toContain('roll');
      });
    });
  });
}); 