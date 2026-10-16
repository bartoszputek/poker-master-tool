/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleDirectories: [
    'node_modules',
    'src',
  ],
  coveragePathIgnorePatterns: [
    'tests/'
  ]
};
