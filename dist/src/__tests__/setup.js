"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Jest setup file for MussikOn API tests
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables for testing
dotenv_1.default.config({ path: '.env.test' });
// Global test setup
beforeAll(() => {
    // Setup any global test configuration
    console.log('Setting up test environment...');
});
afterAll(() => {
    // Cleanup after all tests
    console.log('Cleaning up test environment...');
});
// Global test utilities
global.console = Object.assign({}, console);
