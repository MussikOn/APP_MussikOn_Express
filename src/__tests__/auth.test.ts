// Authentication tests for MussikOn API
import { registerSchema, loginSchema } from '../utils/validationSchemas';

describe('Authentication Validation', () => {
  describe('Register Schema', () => {
    test('should validate correct registration data', () => {
      const validData = {
        name: 'Juan',
        lastName: 'Pérez',
        userEmail: 'juan@example.com',
        userPassword: 'Password123!',
        roll: 'musico'
      };

      const { error } = registerSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject invalid email', () => {
      const invalidData = {
        name: 'Juan',
        lastName: 'Pérez',
        userEmail: 'invalid-email',
        userPassword: 'Password123!',
        roll: 'musico'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('userEmail');
    });

    test('should reject weak password', () => {
      const invalidData = {
        name: 'Juan',
        lastName: 'Pérez',
        userEmail: 'juan@example.com',
        userPassword: '123',
        roll: 'musico'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('userPassword');
    });
  });

  describe('Login Schema', () => {
    test('should validate correct login data', () => {
      const validData = {
        userEmail: 'juan@example.com',
        userPassword: 'Password123!'
      };

      const { error } = loginSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject empty email', () => {
      const invalidData = {
        userEmail: '',
        userPassword: 'Password123!'
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });
}); 