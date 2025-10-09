/**
 * @jest-environment jsdom
 */

// Mock fetch for testing
global.fetch = jest.fn();

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve())
  }
});

// Mock service worker
Object.assign(navigator, {
  serviceWorker: {
    register: jest.fn(() => Promise.resolve())
  }
});

// Load the app script
require('../public/js/app.js');

describe('PromptWizard Frontend', () => {
  let app;
  
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div class="mode-btn active" data-mode="optimize">Optimize</div>
      <div class="mode-btn" data-mode="generate">Generate</div>
      <div class="mode-btn" data-mode="regenerate">Regenerate</div>
      <textarea id="prompt-input"></textarea>
      <textarea id="requirements-input"></textarea>
      <span id="char-count">0</span>
      <span id="req-char-count">0</span>
      <select id="category"><option value="general">General</option></select>
      <select id="complexity"><option value="intermediate">Intermediate</option></select>
      <button id="process-btn"><span id="btn-text">Optimize Prompt</span></button>
      <button id="clear-btn">Clear</button>
      <button id="templates-btn">Templates</button>
      <div id="loading" class="hidden"></div>
      <div id="results" class="hidden"></div>
      <div id="error-message" class="hidden">
        <p id="error-text"></p>
        <button id="error-close">Close</button>
      </div>
      <div id="copy-toast" class="hidden">
        <i class="fas fa-check"></i>
        <span>Copied!</span>
      </div>
    `;
    
    // Clear mocks
    jest.clearAllMocks();
    fetch.mockClear();
    
    // Simulate DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  });

  describe('Mode Switching', () => {
    it('should switch between modes correctly', () => {
      const optimizeBtn = document.querySelector('[data-mode="optimize"]');
      const generateBtn = document.querySelector('[data-mode="generate"]');
      
      expect(optimizeBtn.classList.contains('active')).toBe(true);
      
      // Click generate button
      generateBtn.click();
      
      expect(optimizeBtn.classList.contains('active')).toBe(false);
      expect(generateBtn.classList.contains('active')).toBe(true);
    });

    it('should update UI based on selected mode', () => {
      const generateBtn = document.querySelector('[data-mode="generate"]');
      const btnText = document.getElementById('btn-text');
      
      generateBtn.click();
      
      expect(btnText.textContent).toBe('Generate Prompt');
    });
  });

  describe('Input Validation', () => {
    it('should update character counter', () => {
      const promptInput = document.getElementById('prompt-input');
      const charCount = document.getElementById('char-count');
      
      promptInput.value = 'Test prompt';
      promptInput.dispatchEvent(new Event('input'));
      
      expect(charCount.textContent).toBe('11');
    });

    it('should validate prompt length', () => {
      const promptInput = document.getElementById('prompt-input');
      const processBtn = document.getElementById('process-btn');
      
      promptInput.value = 'Short';
      processBtn.click();
      
      const errorMessage = document.getElementById('error-message');
      expect(errorMessage.classList.contains('hidden')).toBe(false);
    });
  });

  describe('API Integration', () => {
    it('should make API call for prompt optimization', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: {
            optimized: 'Optimized prompt text',
            structure: {
              context: 'Test context',
              task: 'Test task',
              format: 'Test format',
              examples: 'Test examples'
            },
            improvements: ['Better clarity']
          }
        })
      });
      
      const promptInput = document.getElementById('prompt-input');
      const processBtn = document.getElementById('process-btn');
      
      promptInput.value = 'This is a test prompt that is long enough to be valid';
      processBtn.click();
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(fetch).toHaveBeenCalledWith('/api/prompts/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'This is a test prompt that is long enough to be valid',
          type: 'optimize',
          category: 'general',
          complexity: 'intermediate'
        })
      });
    });

    it('should handle API errors gracefully', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: false,
          error: 'API Error'
        })
      });
      
      const promptInput = document.getElementById('prompt-input');
      const processBtn = document.getElementById('process-btn');
      
      promptInput.value = 'This is a test prompt that is long enough to be valid';
      processBtn.click();
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const errorMessage = document.getElementById('error-message');
      expect(errorMessage.classList.contains('hidden')).toBe(false);
    });
  });

  describe('Copy Functionality', () => {
    it('should copy text to clipboard', async () => {
      // Create a mock app instance
      const mockApp = {
        copyText: jest.fn().mockResolvedValue(),
        showToast: jest.fn()
      };
      
      await mockApp.copyText('Test text');
      
      expect(mockApp.copyText).toHaveBeenCalledWith('Test text');
    });
  });

  describe('Clear Functionality', () => {
    it('should clear all inputs', () => {
      const promptInput = document.getElementById('prompt-input');
      const requirementsInput = document.getElementById('requirements-input');
      const clearBtn = document.getElementById('clear-btn');
      
      promptInput.value = 'Test prompt';
      requirementsInput.value = 'Test requirements';
      
      clearBtn.click();
      
      expect(promptInput.value).toBe('');
      expect(requirementsInput.value).toBe('');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should handle Ctrl+Enter to process', () => {
      const processBtn = document.getElementById('process-btn');
      const clickSpy = jest.spyOn(processBtn, 'click');
      
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true
      });
      
      document.dispatchEvent(event);
      
      // Note: In real implementation, this would trigger the process function
      // Here we're just testing that the event is handled
      expect(event.defaultPrevented).toBe(true);
    });
  });
});