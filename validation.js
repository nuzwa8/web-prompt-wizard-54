const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Joi = require('joi');
const logger = require('../utils/logger');

// Validation schemas using Joi
const promptOptimizeSchema = Joi.object({
  prompt: Joi.string().min(10).max(2000).required(),
  type: Joi.string().valid('optimize', 'generate', 'enhance').required(),
  category: Joi.string().valid('creative', 'technical', 'business', 'educational', 'general').default('general'),
  complexity: Joi.string().valid('simple', 'intermediate', 'advanced').default('intermediate')
});

const promptGenerateSchema = Joi.object({
  requirements: Joi.string().min(5).max(500).required(),
  category: Joi.string().valid('creative', 'technical', 'business', 'educational', 'general').default('general'),
  complexity: Joi.string().valid('simple', 'intermediate', 'advanced').default('intermediate')
});

const promptRegenerateSchema = Joi.object({
  prompt: Joi.string().min(10).max(2000).required(),
  type: Joi.string().valid('optimize', 'generate', 'enhance', 'regenerate').required(),
  category: Joi.string().valid('creative', 'technical', 'business', 'educational', 'general').default('general'),
  complexity: Joi.string().valid('simple', 'intermediate', 'advanced').default('intermediate')
});

// Validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.validatedData = value;
    next();
  };
};

// Rate limiting middleware (simple implementation)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

const rateLimit = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(clientIP)) {
    rateLimitMap.set(clientIP, { requests: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = rateLimitMap.get(clientIP);
  
  if (now > clientData.resetTime) {
    rateLimitMap.set(clientIP, { requests: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  if (clientData.requests >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait before trying again.'
    });
  }
  
  clientData.requests++;
  next();
};

// Input sanitization
const sanitizeInput = (req, res, next) => {
  if (req.body.prompt) {
    req.body.prompt = req.body.prompt.trim().replace(/[<>"'&]/g, '');
  }
  if (req.body.requirements) {
    req.body.requirements = req.body.requirements.trim().replace(/[<>"'&]/g, '');
  }
  next();
};

// Logging middleware
const logRequest = (req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method === 'POST' ? { ...req.body, prompt: req.body.prompt ? '[REDACTED]' : undefined } : undefined
  });
  next();
};

module.exports = {
  validateRequest,
  promptOptimizeSchema,
  promptGenerateSchema,
  promptRegenerateSchema,
  rateLimit,
  sanitizeInput,
  logRequest
};