// jest.config.js

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['./jest.setup.ts'],

  // Test environment for Next.js
  testEnvironment: 'jest-environment-jsdom',

  // NEW/UPDATED: Simplify transformIgnorePatterns
  // Explicitly list node_modules packages that need transformation
  // Rely on next/jest's SWC for most files and for packages NOT in this list
  transformIgnorePatterns: [
    '/node_modules/(?!next-auth|jose|@panva/hkdf|uuid|preact-render-to-string|preact|node-fetch)',
  ],

  // REMOVED: The explicit 'transform' block for node-fetch and TS/TSX
  // Relying on next/jest's SWC to handle transformation based on file types
  // and the transformIgnorePatterns above.


  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/generated/(.*)$': '<rootDir>/node_modules/.prisma/client/$1',
    '^jose$': '<rootDir>/node_modules/next-auth/node_modules/jose/dist/node/cjs/index.js',
    '^@panva/hkdf$': '<rootDir>/node_modules/next-auth/node_modules/@panva/hkdf/dist/node/cjs/index.js',
    '^uuid$': '<rootDir>/node_modules/next-auth/node_modules/uuid/dist/index.js',
    '^preact-render-to-string$': '<rootDir>/node_modules/next-auth/node_modules/preact-render-to-string/dist/index.js',
    '^preact$': '<rootDir>/node_modules/next-auth/node_modules/preact/dist/preact.js',
    // Keep node-fetch mapping to src/index.js as per package.json
    '^node-fetch$': '<rootDir>/node_modules/node-fetch/src/index.js',

    // Add other mappings if needed
  },

  // testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
};

// createJestConfig is an async function that returns the modified jest config
module.exports = createJestConfig(customJestConfig);