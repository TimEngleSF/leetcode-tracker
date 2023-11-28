import type { Config } from '@jest/types';

const baseDir = '<rootDir>/src/models';
const baseTestDir = '<rootDir>/src/tests/integration';
const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    testPathIgnorePatterns: ['<rootDir>/src/__tests__/', '<rootDir>/dist/'],
    collectCoverage: true,
    // collectCoverageFrom: [
    //     '<rootDir>/src/**/*.ts',
    //     '!<rootDir>/src/**/__tests__/**'
    // ],
    collectCoverageFrom: [`${baseDir}/**/*.ts`],
    testMatch: [`${baseTestDir}/**/*.test.ts`]
};

export default config;
