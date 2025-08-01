"use strict";
// Example test file to verify Jest configuration
describe('Example Test Suite', () => {
    test('should pass a basic test', () => {
        expect(1 + 1).toBe(2);
    });
    test('should handle string operations', () => {
        const message = 'Hello, MussikOn!';
        expect(message).toContain('MussikOn');
    });
    test('should handle array operations', () => {
        const instruments = ['guitar', 'piano', 'drums'];
        expect(instruments).toHaveLength(3);
        expect(instruments).toContain('piano');
    });
});
