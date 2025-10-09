// Web Prompt Wizard - Main Application
class PromptWizard {
    constructor() {
        this.currentMode = 'optimize';
        this.templates = {};
        this.initializeApp();
    }

    initializeApp() {
        this.bindEvents();
        this.loadTemplates();
        this.setupCharCounters();
        this.updateUIForMode();
    }

    bindEvents() {
        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleModeChange(e));
        });

        // Main action button
        document.getElementById('process-btn').addEventListener('click', () => this.processPrompt());
        
        // Clear button
        document.getElementById('clear-btn').addEventListener('click', () => this.clearInputs());
        
        // Templates button
        document.getElementById('templates-btn').addEventListener('click', () => this.showTemplates());
        
        // Copy buttons
        document.getElementById('copy-btn').addEventListener('click', () => this.copyMainResult());
        document.getElementById('regenerate-result-btn').addEventListener('click', () => this.regenerateFromResult());
        
        // Modal events
        document.getElementById('modal-close').addEventListener('click', () => this.hideTemplates());
        document.getElementById('templates-modal').addEventListener('click', (e) => {
            if (e.target.id === 'templates-modal') this.hideTemplates();
        });
        
        // Template category buttons
        document.querySelectorAll('.template-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTemplateCategoryChange(e));
        });
        
        // Error close
        document.getElementById('error-close').addEventListener('click', () => this.hideError());
        
        // Character counters
        document.getElementById('prompt-input').addEventListener('input', () => this.updateCharCounter('prompt'));
        document.getElementById('requirements-input').addEventListener('input', () => this.updateCharCounter('requirements'));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Copy single prompt buttons (delegated event)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-single-btn') || e.target.closest('.copy-single-btn')) {
                const btn = e.target.classList.contains('copy-single-btn') ? e.target : e.target.closest('.copy-single-btn');
                this.copyText(btn.dataset.text);
            }
        });
    }

    handleModeChange(e) {
        const newMode = e.target.dataset.mode;
        if (newMode === this.currentMode) return;
        
        // Update active button
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.currentMode = newMode;
        this.updateUIForMode();
        this.hideResults();
        this.hideError();
    }

    updateUIForMode() {
        const promptContainer = document.getElementById('prompt-input-container');
        const requirementsContainer = document.getElementById('requirements-input-container');
        const btnText = document.getElementById('btn-text');
        
        switch (this.currentMode) {
            case 'optimize':
                promptContainer.style.display = 'block';
                requirementsContainer.style.display = 'none';
                btnText.textContent = 'Optimize Prompt';
                break;
            case 'generate':
                promptContainer.style.display = 'none';
                requirementsContainer.style.display = 'block';
                btnText.textContent = 'Generate Prompt';
                break;
            case 'regenerate':
                promptContainer.style.display = 'block';
                requirementsContainer.style.display = 'none';
                btnText.textContent = 'Regenerate Variations';
                break;
        }
    }

    setupCharCounters() {
        this.updateCharCounter('prompt');
        this.updateCharCounter('requirements');
    }

    updateCharCounter(type) {
        const input = document.getElementById(type === 'prompt' ? 'prompt-input' : 'requirements-input');
        const counter = document.getElementById(type === 'prompt' ? 'char-count' : 'req-char-count');
        const maxLength = type === 'prompt' ? 2000 : 500;
        
        const length = input.value.length;
        counter.textContent = length;
        
        const counterContainer = counter.parentElement;
        counterContainer.classList.remove('warning', 'danger');
        
        if (length > maxLength * 0.9) {
            counterContainer.classList.add('danger');
        } else if (length > maxLength * 0.75) {
            counterContainer.classList.add('warning');
        }
    }

    async processPrompt() {
        const input = this.getInputData();
        
        if (!this.validateInput(input)) {
            return;
        }
        
        this.showLoading();
        this.hideError();
        this.hideResults();
        
        try {
            let result;
            
            switch (this.currentMode) {
                case 'optimize':
                    result = await this.optimizePrompt(input);
                    break;
                case 'generate':
                    result = await this.generatePrompt(input);
                    break;
                case 'regenerate':
                    result = await this.regeneratePrompt(input);
                    break;
            }
            
            this.displayResults(result);
            
        } catch (error) {
            console.error('Error processing prompt:', error);
            this.showError(error.message || 'An error occurred while processing your request.');
        } finally {
            this.hideLoading();
        }
    }

    getInputData() {
        const category = document.getElementById('category').value;
        const complexity = document.getElementById('complexity').value;
        
        if (this.currentMode === 'generate') {
            return {
                requirements: document.getElementById('requirements-input').value.trim(),
                category,
                complexity
            };
        } else {
            return {
                prompt: document.getElementById('prompt-input').value.trim(),
                type: this.currentMode,
                category,
                complexity
            };
        }
    }

    validateInput(input) {
        if (this.currentMode === 'generate') {
            if (!input.requirements || input.requirements.length < 5) {
                this.showError('Please enter at least 5 characters describing your requirements.');
                return false;
            }
            if (input.requirements.length > 500) {
                this.showError('Requirements must be 500 characters or less.');
                return false;
            }
        } else {
            if (!input.prompt || input.prompt.length < 10) {
                this.showError('Please enter at least 10 characters for your prompt.');
                return false;
            }
            if (input.prompt.length > 2000) {
                this.showError('Prompt must be 2000 characters or less.');
                return false;
            }
        }
        return true;
    }

    async optimizePrompt(input) {
        const response = await fetch('/api/prompts/optimize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(input)
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to optimize prompt');
        }
        
        return data.data;
    }

    async generatePrompt(input) {
        const response = await fetch('/api/prompts/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(input)
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to generate prompt');
        }
        
        return data.data;
    }

    async regeneratePrompt(input) {
        const response = await fetch('/api/prompts/regenerate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(input)
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to regenerate prompt');
        }
        
        return data.data;
    }

    displayResults(result) {
        const resultsContainer = document.getElementById('results');
        const singleResult = document.getElementById('single-result');
        const multipleResults = document.getElementById('multiple-results');
        const resultTitle = document.getElementById('result-title');
        
        // Update title based on mode
        switch (this.currentMode) {
            case 'optimize':
                resultTitle.textContent = 'Optimized Prompt';
                break;
            case 'generate':
                resultTitle.textContent = 'Generated Prompt';
                break;
            case 'regenerate':
                resultTitle.textContent = 'Prompt Variations';
                break;
        }
        
        if (this.currentMode === 'regenerate') {
            this.displayVariations(result.variations);
            singleResult.classList.add('hidden');
            multipleResults.classList.remove('hidden');
        } else {
            this.displaySingleResult(result);
            singleResult.classList.remove('hidden');
            multipleResults.classList.add('hidden');
        }
        
        resultsContainer.classList.remove('hidden');
        resultsContainer.classList.add('fade-in');
        
        // Scroll to results
        setTimeout(() => {
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    displaySingleResult(result) {
        const promptText = this.currentMode === 'generate' ? result.prompt : result.optimized;
        
        // Update main prompt text
        document.getElementById('optimized-prompt').textContent = promptText;
        
        // Update copy button data
        const copyBtn = document.querySelector('.copy-single-btn');
        copyBtn.dataset.text = promptText;
        
        // Update structure info
        if (result.structure) {
            document.getElementById('structure-context').textContent = result.structure.context || 'Not specified';
            document.getElementById('structure-task').textContent = result.structure.task || 'Not specified';
            document.getElementById('structure-format').textContent = result.structure.format || 'Not specified';
            document.getElementById('structure-examples').textContent = result.structure.examples || 'None provided';
            document.getElementById('structure-info').classList.remove('hidden');
        } else {
            document.getElementById('structure-info').classList.add('hidden');
        }
        
        // Update improvements
        if (result.improvements && result.improvements.length > 0) {
            const improvementsList = document.getElementById('improvements-list');
            improvementsList.innerHTML = '';
            result.improvements.forEach(improvement => {
                const li = document.createElement('li');
                li.textContent = improvement;
                improvementsList.appendChild(li);
            });
            document.getElementById('improvements').classList.remove('hidden');
        } else {
            document.getElementById('improvements').classList.add('hidden');
        }
        
        // Update suggestions
        if (result.suggestions && result.suggestions.length > 0) {
            const suggestionsList = document.getElementById('suggestions-list');
            suggestionsList.innerHTML = '';
            result.suggestions.forEach(suggestion => {
                const li = document.createElement('li');
                li.textContent = suggestion;
                suggestionsList.appendChild(li);
            });
            document.getElementById('suggestions').classList.remove('hidden');
        } else {
            document.getElementById('suggestions').classList.add('hidden');
        }
    }

    displayVariations(variations) {
        const container = document.getElementById('variations-container');
        container.innerHTML = '';
        
        variations.forEach((variation, index) => {
            const variationElement = document.createElement('div');
            variationElement.className = 'variation-item slide-in';
            variationElement.style.animationDelay = `${index * 0.1}s`;
            
            variationElement.innerHTML = `
                <div class="variation-header">
                    <span class="variation-title">Variation ${index + 1}</span>
                    <button class="copy-single-btn" data-text="${this.escapeHtml(variation.text)}">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <div class="variation-content">${this.escapeHtml(variation.text)}</div>
            `;
            
            container.appendChild(variationElement);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async copyMainResult() {
        let textToCopy = '';
        
        if (this.currentMode === 'regenerate') {
            // Copy all variations
            const variations = document.querySelectorAll('.variation-content');
            variations.forEach((variation, index) => {
                textToCopy += `Variation ${index + 1}:\n${variation.textContent}\n\n`;
            });
        } else {
            // Copy single result
            textToCopy = document.getElementById('optimized-prompt').textContent;
        }
        
        await this.copyText(textToCopy);
    }

    async copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            // Fallback for older browsers
            this.fallbackCopy(text);
        }
    }

    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Copied to clipboard!');
        } catch (error) {
            console.error('Fallback copy failed:', error);
            this.showToast('Failed to copy. Please select and copy manually.', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    regenerateFromResult() {
        const currentPrompt = document.getElementById('optimized-prompt').textContent;
        if (!currentPrompt) return;
        
        // Set the prompt in the input and switch to regenerate mode
        document.getElementById('prompt-input').value = currentPrompt;
        
        // Update mode
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-mode="regenerate"]').classList.add('active');
        this.currentMode = 'regenerate';
        this.updateUIForMode();
        
        // Process immediately
        this.processPrompt();
    }

    clearInputs() {
        document.getElementById('prompt-input').value = '';
        document.getElementById('requirements-input').value = '';
        this.updateCharCounter('prompt');
        this.updateCharCounter('requirements');
        this.hideResults();
        this.hideError();
    }

    async loadTemplates() {
        try {
            const response = await fetch('/api/prompts/templates');
            const data = await response.json();
            
            if (data.success) {
                this.templates = data.data;
            }
        } catch (error) {
            console.error('Failed to load templates:', error);
        }
    }

    showTemplates() {
        document.getElementById('templates-modal').classList.remove('hidden');
        this.displayTemplateCategory('creative');
        document.body.style.overflow = 'hidden';
    }

    hideTemplates() {
        document.getElementById('templates-modal').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    handleTemplateCategoryChange(e) {
        const category = e.target.dataset.category;
        
        // Update active button
        document.querySelectorAll('.template-category-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.displayTemplateCategory(category);
    }

    displayTemplateCategory(category) {
        const templatesList = document.getElementById('templates-list');
        templatesList.innerHTML = '';
        
        if (!this.templates[category]) return;
        
        this.templates[category].forEach(template => {
            const templateElement = document.createElement('div');
            templateElement.className = 'template-item';
            templateElement.innerHTML = `
                <div class="template-name">${template.name}</div>
                <div class="template-prompt">${template.prompt}</div>
            `;
            
            templateElement.addEventListener('click', () => {
                this.useTemplate(template.prompt);
            });
            
            templatesList.appendChild(templateElement);
        });
    }

    useTemplate(prompt) {
        if (this.currentMode === 'generate') {
            document.getElementById('requirements-input').value = prompt;
            this.updateCharCounter('requirements');
        } else {
            document.getElementById('prompt-input').value = prompt;
            this.updateCharCounter('prompt');
        }
        
        this.hideTemplates();
        this.hideResults();
        this.hideError();
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('process-btn').disabled = true;
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('process-btn').disabled = false;
    }

    showResults() {
        document.getElementById('results').classList.remove('hidden');
    }

    hideResults() {
        document.getElementById('results').classList.add('hidden');
    }

    showError(message) {
        document.getElementById('error-text').textContent = message;
        document.getElementById('error-message').classList.remove('hidden');
    }

    hideError() {
        document.getElementById('error-message').classList.add('hidden');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('copy-toast');
        const span = toast.querySelector('span');
        const icon = toast.querySelector('i');
        
        span.textContent = message;
        
        if (type === 'error') {
            toast.style.background = '#dc3545';
            icon.className = 'fas fa-exclamation-triangle';
        } else {
            toast.style.background = '#28a745';
            icon.className = 'fas fa-check';
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to process
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.processPrompt();
        }
        
        // Ctrl/Cmd + C when results are visible to copy
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !document.getElementById('results').classList.contains('hidden')) {
            if (!e.target.matches('input, textarea')) {
                e.preventDefault();
                this.copyMainResult();
            }
        }
        
        // Escape to close modal
        if (e.key === 'Escape') {
            this.hideTemplates();
            this.hideError();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new PromptWizard();
    
    // Add global error handling
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        app.showError('An unexpected error occurred. Please refresh and try again.');
    });
    
    // Add service worker for caching (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('Service worker registration failed:', err);
        });
    }
    
    console.log('Web Prompt Wizard initialized successfully!');
});