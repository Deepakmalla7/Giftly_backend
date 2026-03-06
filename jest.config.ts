import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: [
    "**/__tests__/unit/**/*.test.ts",
    "**/__tests__/integration/**/*.test.ts",
  ],
  moduleFileExtensions: ["ts", "js", "json"],
  moduleNameMapper: {
    "^uuid$": "<rootDir>/src/__mocks__/uuid.js",
  },
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 30000,
};

export default config;
