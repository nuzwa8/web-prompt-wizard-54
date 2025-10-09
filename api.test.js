const request = require('supertest');
const app = require('../server');
const logger = require('../src/utils/logger');

// Mock logger to prevent test output noise
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock OpenAI API calls
jest.mock('axios');
const axios = require('axios');

describe('Web Prompt Wizard API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Prompt Optimization', () => {
    beforeEach(() => {
      // Mock successful OpenAI response
      axios.post.mockResolvedValue({
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                text: 'Optimized prompt text',
                structure: {
                  context: 'Test context',
                  task: 'Test task',
                  format: 'Test format',
                  examples: 'Test examples'
                },
                improvements: ['Improved clarity', 'Better structure']
              })
            }
          }]
        }
      });
    });

    it('should optimize a prompt successfully', async () => {
      const testPrompt = {
        prompt: 'Write a story about a cat',
        type: 'optimize',
        category: 'creative',
        complexity: 'simple'
      };

      const response = await request(app)
        .post('/api/prompts/optimize')
        .send(testPrompt)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('optimized');
      expect(response.body.data).toHaveProperty('structure');
      expect(response.body.data).toHaveProperty('improvements');
    });

    it('should reject prompts that are too short', async () => {
      const testPrompt = {
        prompt: 'Short',
        type: 'optimize',
        category: 'general'
      };

      await request(app)
        .post('/api/prompts/optimize')
        .send(testPrompt)
        .expect(400);
    });

    it('should reject prompts that are too long', async () => {
      const testPrompt = {
        prompt: 'A'.repeat(2001),
        type: 'optimize',
        category: 'general'
      };

      await request(app)
        .post('/api/prompts/optimize')
        .send(testPrompt)
        .expect(400);
    });

    it('should reject invalid categories', async () => {
      const testPrompt = {
        prompt: 'Write a story about a cat that goes on adventures',
        type: 'optimize',
        category: 'invalid_category'
      };

      await request(app)
        .post('/api/prompts/optimize')
        .send(testPrompt)
        .expect(400);
    });
  });

  describe('Prompt Generation', () => {
    beforeEach(() => {
      axios.post.mockResolvedValue({
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                text: 'Generated prompt text',
                structure: {
                  context: 'Generated context',
                  task: 'Generated task',
                  format: 'Generated format',
                  examples: 'Generated examples'
                },
                suggestions: ['Use specific examples', 'Be more detailed']
              })
            }
          }]
        }
      });
    });

    it('should generate a prompt successfully', async () => {
      const testRequest = {
        requirements: 'I need a prompt for creative writing',
        category: 'creative',
        complexity: 'intermediate'
      };

      const response = await request(app)
        .post('/api/prompts/generate')
        .send(testRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompt');
      expect(response.body.data).toHaveProperty('structure');
      expect(response.body.data).toHaveProperty('suggestions');
    });

    it('should reject requirements that are too short', async () => {
      const testRequest = {
        requirements: 'Test',
        category: 'general'
      };

      await request(app)
        .post('/api/prompts/generate')
        .send(testRequest)
        .expect(400);
    });
  });

  describe('Prompt Regeneration', () => {
    beforeEach(() => {
      axios.post.mockResolvedValue({
        data: {
          choices: [{
            message: {
              content: JSON.stringify([
                {
                  text: 'Variation 1 text',
                  structure: {
                    context: 'Context 1',
                    task: 'Task 1',
                    format: 'Format 1',
                    examples: 'Examples 1'
                  }
                },
                {
                  text: 'Variation 2 text',
                  structure: {
                    context: 'Context 2',
                    task: 'Task 2',
                    format: 'Format 2',
                    examples: 'Examples 2'
                  }
                }
              ])
            }
          }]
        }
      });
    });

    it('should regenerate prompt variations successfully', async () => {
      const testPrompt = {
        prompt: 'Write a detailed story about space exploration',
        type: 'regenerate',
        category: 'creative',
        complexity: 'advanced'
      };

      const response = await request(app)
        .post('/api/prompts/regenerate')
        .send(testPrompt)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('variations');
      expect(Array.isArray(response.body.data.variations)).toBe(true);
    });
  });

  describe('Templates', () => {
    it('should return prompt templates', async () => {
      const response = await request(app)
        .get('/api/prompts/templates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('creative');
      expect(response.body.data).toHaveProperty('technical');
      expect(response.body.data).toHaveProperty('business');
      expect(response.body.data).toHaveProperty('educational');
      expect(response.body.data).toHaveProperty('general');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API key gracefully', async () => {
      // Mock API error
      axios.post.mockRejectedValue({
        response: {
          data: { error: 'Invalid API key' }
        }
      });

      const testPrompt = {
        prompt: 'Write a story about a cat that goes on adventures',
        type: 'optimize',
        category: 'creative'
      };

      const response = await request(app)
        .post('/api/prompts/optimize')
        .send(testPrompt)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/non-existent')
        .expect(404);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const testPrompt = {
        prompt: 'Write a story about a cat that goes on adventures',
        type: 'optimize',
        category: 'creative'
      };

      // Make multiple requests rapidly
      const requests = Array(12).fill().map(() => 
        request(app)
          .post('/api/prompts/optimize')
          .send(testPrompt)
      );

      const responses = await Promise.all(requests);
      
      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 10000);
  });
});