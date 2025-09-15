import nextJest from 'next/jest';

// Providing the path to the Next.js app so that next/jest can load the Next.js configuration and apply SWC
const createJestConfig = nextJest({
  dir: './',
});

// Add any custom Jest configuration options here
const customJestConfig = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Path aliases defined in tsconfig.json
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Setup file to run before each test file
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Environment for browser-like testing; change to `node` if only back-end tests are required
  testEnvironment: 'jest-environment-jsdom',
};

// Export configuration
export default createJestConfig(customJestConfig);
