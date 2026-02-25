/**
 * Jest Configuration
 *
 * This file configures Jest for testing TypeScript code in the backend application.
 */

module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: "ts-jest",

  // Set Node.js as the test environment
  testEnvironment: "node",

  // Define where test files are located
  roots: ["<rootDir>/src"],

  // Test file patterns to match
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],

  // Exclude setup files from being treated as tests
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "__tests__/setup.ts"],

  // Transform TypeScript files
  transform: {
    "^.+\.ts$": "ts-jest",
  },

  // Transform ESM modules in node_modules
  transformIgnorePatterns: ["node_modules/(?!(uuid)/)"],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts",
    "!src/server.ts", // Exclude server entry point from coverage
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Module path aliases (if needed)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],

  // Verbose output
  verbose: true,
};
