// Test setup file
const { logger } = require('../src/utils/logger');

// Suppress console output during tests
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
}

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.OPENAI_MODEL = 'gpt-3.5-turbo';
process.env.LOG_LEVEL = 'error';

// Global test timeout
jest.setTimeout(10000);