module.exports = {
  // 🆕 CONFIGURACIÓN MEJORADA DE JEST
  
  // Configuración básica
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).ts',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Configuración de transformación
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest'
  },
  
  // Configuración de módulos
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/src/__tests__/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1'
  },
  
  // Configuración de cobertura
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,js}',
    '!src/**/*.spec.{ts,js}',
    '!src/__tests__/**',
    '!src/config/**',
    '!src/types/**',
    '!src/utils/logger.ts',
    '!src/utils/firebase.ts',
    '!src/utils/idriveE2.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Configuración de timeouts
  testTimeout: 30000, // 30 segundos para tests complejos
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // Configuración de mocks
  automock: false,
  resetMocks: true,
  restoreMocks: true,
  clearMocks: true,
  
  // Configuración de verbose
  verbose: true,
  silent: false,
  
  // Configuración de workers
  maxWorkers: '50%',
  
  // Configuración de cache
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Configuración de watch
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/.jest-cache/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  
  // Configuración de errores
  errorOnDeprecated: true,
  forceExit: true,
  detectOpenHandles: true,
  
  // Configuración de globals
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      diagnostics: {
        ignoreCodes: [151001]
      }
    }
  },
  
  // Configuración de environment
  testEnvironmentOptions: {
    url: 'http://localhost',
    NODE_ENV: 'test'
  },
  
  // Configuración de mocks automáticos
  unmockedModulePathPatterns: [
    '<rootDir>/node_modules/'
  ],
  
  // Configuración de transformación de archivos
  transformIgnorePatterns: [
    'node_modules/(?!(firebase|@firebase)/)'
  ],
  
  // Configuración de test location
  testLocationInResults: true,
  
  // Configuración de fake timers
  fakeTimers: {
    enableGlobally: false
  }
}; 