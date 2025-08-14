module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  maxWorkers: 1, 
  globalSetup: './jest.setup.js',
  globalTeardown: './jest.teardown.js',
}