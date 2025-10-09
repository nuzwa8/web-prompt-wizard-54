const promptService = require('../src/services/promptService');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('PromptService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('optimizePrompt', () => {
    it('should call OpenAI API with correct parameters', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                text: 'Optimized prompt',
                structure: {
                  context: 'Test context',
                  task: 'Test task',
                  format: 'Test format',
                  examples: 'Test examples'
                },
                improvements: ['Better clarity']
              })
            }
          }]
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const input = {
        originalPrompt: 'Original prompt text',
        type: 'optimize',
        category: 'creative',
        complexity: 'intermediate'
      };
      
      const result = await promptService.optimizePrompt(input);
      
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          model: expect.any(String),
          messages: expect.any(Array),
          max_tokens: expect.any(Number),
          temperature: expect.any(Number)
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer'),
            'Content-Type': 'application/json'
          })
        })
      );
      
      expect(result).toHaveProperty('text', 'Optimized prompt');
      expect(result).toHaveProperty('structure');
      expect(result).toHaveProperty('improvements');
    });

    it('should handle API errors gracefully', async () => {
      axios.post.mockRejectedValue(new Error('API Error'));
      
      const input = {
        originalPrompt: 'Original prompt text',
        type: 'optimize',
        category: 'general',
        complexity: 'simple'
      };
      
      await expect(promptService.optimizePrompt(input)).rejects.toThrow('Failed to process request with AI service');
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: 'Invalid JSON response'
            }
          }]
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const input = {
        originalPrompt: 'Original prompt text',
        type: 'optimize',
        category: 'general',
        complexity: 'simple'
      };
      
      const result = await promptService.optimizePrompt(input);
      
      expect(result).toHaveProperty('text', 'Original prompt text');
      expect(result.improvements).toContain('Failed to optimize - API parsing error');
    });
  });

  describe('generatePrompt', () => {
    it('should generate prompt based on requirements', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                text: 'Generated prompt',
                structure: {
                  context: 'Generated context',
                  task: 'Generated task',
                  format: 'Generated format',
                  examples: 'Generated examples'
                },
                suggestions: ['Use specific examples']
              })
            }
          }]
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const input = {
        requirements: 'Create a prompt for creative writing',
        category: 'creative',
        complexity: 'advanced'
      };
      
      const result = await promptService.generatePrompt(input);
      
      expect(result).toHaveProperty('text', 'Generated prompt');
      expect(result).toHaveProperty('structure');
      expect(result).toHaveProperty('suggestions');
    });
  });

  describe('regeneratePrompt', () => {
    it('should create multiple variations', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify([
                {
                  text: 'Variation 1',
                  structure: {
                    context: 'Context 1',
                    task: 'Task 1',
                    format: 'Format 1',
                    examples: 'Examples 1'
                  }
                },
                {
                  text: 'Variation 2',
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
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const input = {
        originalPrompt: 'Original prompt',
        type: 'regenerate',
        category: 'technical',
        complexity: 'advanced'
      };
      
      const result = await promptService.regeneratePrompt(input);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('text', 'Variation 1');
      expect(result[1]).toHaveProperty('text', 'Variation 2');
    });
  });

  describe('getTemplates', () => {
    it('should return templates for all categories', () => {
      const templates = promptService.getTemplates();
      
      expect(templates).toHaveProperty('creative');
      expect(templates).toHaveProperty('technical');
      expect(templates).toHaveProperty('business');
      expect(templates).toHaveProperty('educational');
      expect(templates).toHaveProperty('general');
      
      expect(Array.isArray(templates.creative)).toBe(true);
      expect(templates.creative.length).toBeGreaterThan(0);
      
      expect(templates.creative[0]).toHaveProperty('name');
      expect(templates.creative[0]).toHaveProperty('prompt');
    });
  });
});