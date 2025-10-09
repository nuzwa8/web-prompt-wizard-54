const axios = require('axios');
const logger = require('../utils/logger');

class PromptService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 1000;
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7;
  }

  async callOpenAI(messages, temperature = this.temperature) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
        temperature,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error('Failed to process request with AI service');
    }
  }

  async optimizePrompt({ originalPrompt, type, category, complexity }) {
    const systemPrompt = `You are an expert prompt engineer. Your task is to optimize prompts to be:
1. Clear and specific
2. Well-structured
3. Action-oriented
4. Ready to copy and paste
5. Free of unnecessary elements

Return the response in this exact JSON format:
{
  "text": "optimized prompt here",
  "structure": {
    "context": "brief context section",
    "task": "clear task definition",
    "format": "expected output format",
    "examples": "any examples if needed"
  },
  "improvements": ["list of improvements made"]
}`;

    const userPrompt = `Optimize this ${type} prompt for ${category} use at ${complexity} complexity level:

"${originalPrompt}"

Make it structured, clean, and ready to copy-paste. Remove any unnecessary elements.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.callOpenAI(messages, 0.3);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      logger.error('Failed to parse OpenAI response:', error);
      return {
        text: originalPrompt,
        structure: {
          context: 'Original prompt',
          task: 'No changes made',
          format: 'As provided',
          examples: 'None'
        },
        improvements: ['Failed to optimize - API parsing error']
      };
    }
  }

  async generatePrompt({ requirements, category, complexity }) {
    const systemPrompt = `You are an expert prompt engineer. Create a high-quality prompt based on user requirements.

Return the response in this exact JSON format:
{
  "text": "generated prompt here",
  "structure": {
    "context": "context section",
    "task": "task definition",
    "format": "output format",
    "examples": "examples if applicable"
  },
  "suggestions": ["list of usage suggestions"]
}`;

    const userPrompt = `Generate a ${complexity} ${category} prompt based on these requirements:

"${requirements}"

Make it structured, clear, and ready to copy-paste.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.callOpenAI(messages, 0.7);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      logger.error('Failed to parse OpenAI response:', error);
      return {
        text: 'Failed to generate prompt. Please check your requirements and try again.',
        structure: {
          context: 'Error occurred',
          task: 'Prompt generation failed',
          format: 'Please retry',
          examples: 'None'
        },
        suggestions: ['Check your requirements', 'Try again with different parameters']
      };
    }
  }

  async regeneratePrompt({ originalPrompt, type, category, complexity }) {
    const systemPrompt = `You are an expert prompt engineer. Create 3 different variations of the given prompt.

Return the response in this exact JSON format:
[
  {
    "text": "variation 1 here",
    "structure": {
      "context": "context section",
      "task": "task definition",
      "format": "output format",
      "examples": "examples if applicable"
    }
  },
  {
    "text": "variation 2 here",
    "structure": {
      "context": "context section",
      "task": "task definition",
      "format": "output format",
      "examples": "examples if applicable"
    }
  },
  {
    "text": "variation 3 here",
    "structure": {
      "context": "context section",
      "task": "task definition",
      "format": "output format",
      "examples": "examples if applicable"
    }
  }
]`;

    const userPrompt = `Create 3 different ${complexity} variations of this ${category} ${type} prompt:

"${originalPrompt}"

Make each variation unique but structured and copy-ready.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.callOpenAI(messages, 0.8);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      logger.error('Failed to parse OpenAI response:', error);
      return [
        {
          text: originalPrompt,
          structure: {
            context: 'Original prompt',
            task: 'No variations generated',
            format: 'As provided',
            examples: 'None'
          }
        }
      ];
    }
  }

  getTemplates() {
    return {
      creative: [
        {
          name: 'Story Writing',
          prompt: 'Write a compelling story about [TOPIC]. Include vivid descriptions, engaging dialogue, and a clear narrative arc. The story should be [LENGTH] and targeted at [AUDIENCE].'
        },
        {
          name: 'Creative Brainstorming',
          prompt: 'Generate creative ideas for [PROJECT/TOPIC]. Think outside the box and provide at least 5 unique concepts with brief explanations for each.'
        }
      ],
      technical: [
        {
          name: 'Code Review',
          prompt: 'Review the following code for best practices, performance, and security issues. Provide specific suggestions for improvement:\n\n[CODE]'
        },
        {
          name: 'Technical Documentation',
          prompt: 'Create comprehensive technical documentation for [SYSTEM/API]. Include setup instructions, usage examples, and troubleshooting guide.'
        }
      ],
      business: [
        {
          name: 'Business Strategy',
          prompt: 'Develop a business strategy for [COMPANY/PRODUCT]. Analyze market opportunities, competitive landscape, and provide actionable recommendations.'
        },
        {
          name: 'Marketing Content',
          prompt: 'Create engaging marketing content for [PRODUCT/SERVICE]. The content should highlight key benefits, target [AUDIENCE], and include a clear call-to-action.'
        }
      ],
      educational: [
        {
          name: 'Lesson Plan',
          prompt: 'Create a detailed lesson plan for teaching [SUBJECT] to [GRADE LEVEL]. Include learning objectives, activities, and assessment methods.'
        },
        {
          name: 'Explanation',
          prompt: 'Explain [CONCEPT] in simple terms suitable for [AUDIENCE]. Use examples and analogies to make it easy to understand.'
        }
      ],
      general: [
        {
          name: 'Problem Solving',
          prompt: 'Help me solve this problem: [PROBLEM]. Provide a step-by-step approach and consider multiple solutions.'
        },
        {
          name: 'Analysis',
          prompt: 'Analyze [TOPIC] from multiple perspectives. Consider pros and cons, implications, and provide a balanced conclusion.'
        }
      ]
    };
  }
}

module.exports = new PromptService();