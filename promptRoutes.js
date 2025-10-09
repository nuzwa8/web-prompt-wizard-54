const express = require('express');
const promptService = require('../services/promptService');
const logger = require('../utils/logger');
const { 
  validateRequest, 
  promptOptimizeSchema, 
  promptGenerateSchema, 
  promptRegenerateSchema,
  rateLimit,
  sanitizeInput,
  logRequest
} = require('../middleware/validation');

const router = express.Router();

// Apply middleware to all routes
router.use(logRequest);
router.use(rateLimit);
router.use(sanitizeInput);

// @route   POST /api/prompts/optimize
// @desc    Optimize a prompt
// @access  Public
router.post('/optimize', validateRequest(promptOptimizeSchema), async (req, res) => {
  try {
    const { prompt, type, category, complexity } = req.validatedData;
    
    logger.info(`Optimizing prompt: ${prompt.substring(0, 50)}...`);
    
    const optimizedPrompt = await promptService.optimizePrompt({
      originalPrompt: prompt,
      type,
      category,
      complexity
    });

    res.json({
      success: true,
      data: {
        original: prompt,
        optimized: optimizedPrompt.text,
        improvements: optimizedPrompt.improvements,
        structure: optimizedPrompt.structure,
        copyReady: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error optimizing prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize prompt'
    });
  }
});

// @route   POST /api/prompts/generate
// @desc    Generate a new prompt based on requirements
// @access  Public
router.post('/generate', validateRequest(promptGenerateSchema), async (req, res) => {
  try {
    const { requirements, category, complexity } = req.validatedData;
    
    logger.info(`Generating prompt for: ${requirements.substring(0, 50)}...`);
    
    const generatedPrompt = await promptService.generatePrompt({
      requirements,
      category,
      complexity
    });

    res.json({
      success: true,
      data: {
        prompt: generatedPrompt.text,
        structure: generatedPrompt.structure,
        suggestions: generatedPrompt.suggestions,
        copyReady: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error generating prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate prompt'
    });
  }
});

// @route   POST /api/prompts/regenerate
// @desc    Regenerate a prompt with variations
// @access  Public
router.post('/regenerate', validateRequest(promptRegenerateSchema), async (req, res) => {
  try {
    const { prompt, type, category, complexity } = req.validatedData;
    
    logger.info(`Regenerating prompt: ${prompt.substring(0, 50)}...`);
    
    const variations = await promptService.regeneratePrompt({
      originalPrompt: prompt,
      type,
      category,
      complexity
    });

    res.json({
      success: true,
      data: {
        original: prompt,
        variations: variations.map(v => ({
          text: v.text,
          structure: v.structure,
          copyReady: true
        })),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error regenerating prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate prompt'
    });
  }
});

// @route   GET /api/prompts/templates
// @desc    Get prompt templates
// @access  Public
router.get('/templates', (req, res) => {
  try {
    const templates = promptService.getTemplates();
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates'
    });
  }
});

module.exports = router;