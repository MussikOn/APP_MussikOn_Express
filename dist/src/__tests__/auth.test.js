"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Authentication tests for MussikOn API
const validationSchemas_1 = require("../utils/validationSchemas");
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
            const { error } = validationSchemas_1.registerSchema.validate(validData);
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
            const { error } = validationSchemas_1.registerSchema.validate(invalidData);
            expect(error).toBeDefined();
            expect(error === null || error === void 0 ? void 0 : error.details[0].path).toContain('userEmail');
        });
        test('should reject weak password', () => {
            const invalidData = {
                name: 'Juan',
                lastName: 'Pérez',
                userEmail: 'juan@example.com',
                userPassword: '123',
                roll: 'musico'
            };
            const { error } = validationSchemas_1.registerSchema.validate(invalidData);
            expect(error).toBeDefined();
            expect(error === null || error === void 0 ? void 0 : error.details[0].path).toContain('userPassword');
        });
    });
    describe('Login Schema', () => {
        test('should validate correct login data', () => {
            const validData = {
                userEmail: 'juan@example.com',
                userPassword: 'Password123!'
            };
            const { error } = validationSchemas_1.loginSchema.validate(validData);
            expect(error).toBeUndefined();
        });
        test('should reject empty email', () => {
            const invalidData = {
                userEmail: '',
                userPassword: 'Password123!'
            };
            const { error } = validationSchemas_1.loginSchema.validate(invalidData);
            expect(error).toBeDefined();
        });
    });
});
