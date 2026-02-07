import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

const config: Config = {
  // Test environment
  testEnvironment: "jsdom",
  
  // Setup files
  setupFilesAfterEnv: ["<rootDir>/jest.setup.tsx"],
  
  // Module path aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  
  // Test file patterns
  testMatch: [
    "<rootDir>/src/**/*.test.{ts,tsx}",
    "<rootDir>/src/**/*.spec.{ts,tsx}",
    "<rootDir>/__tests__/**/*.{ts,tsx}",
  ],
  
  // Coverage settings
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/types/**/*",
    "!src/**/index.ts",
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
  ],
  
  // Transform settings
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  
  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  
  // Verbose output
  verbose: true,
};

export default createJestConfig(config);
