// ai-assistant/js/aiAssistant.js
// Modern UI controller for Majelani Accounting AI Assistant

import { summarizeText, explainConcept } from './apiClient-v2.js';

class AIAssistant {
  constructor() {
    this.elements = {
      form: document.getElementById('ai-form'),
      input: document.getElementById('ai-input'),
      mode: document.getElementById('ai-mode'),
      submit: document.getElementById('ai-submit'),
      status: document.getElementById('ai-status'),
      result: document.getElementById('ai-result'),
      spinner: document.querySelector('.loading-spinner'),
      buttonText: document.querySelector('.button-text')
    };
    
    this.isProcessing = false;
    this.init();
  }

  init() {
    if (!this.elements.form) {
      console.warn('AI Assistant form not found');
      return;
    }

    this.bindEvents();
    this.setupAutoResize();
  }

  bindEvents() {
    this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.elements.input.addEventListener('input', () => this.handleInputChange());
  }

  setupAutoResize() {
    const textarea = this.elements.input;
    
    const autoResize = () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(120, textarea.scrollHeight) + 'px';
    };

    textarea.addEventListener('input', autoResize);
    textarea.addEventListener('focus', autoResize);
    
    // Initial resize
    setTimeout(autoResize, 100);
  }

  handleInputChange() {
    const hasText = this.elements.input.value.trim().length > 0;
    this.elements.submit.style.opacity = hasText ? '1' : '0.7';
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    if (this.isProcessing) return;

    const text = this.elements.input.value.trim();
    const mode = this.elements.mode.value;

    if (!text) {
      this.showStatus('Please enter some text first.', 'error');
      this.elements.input.focus();
      return;
    }

    await this.processRequest(text, mode);
  }

  async processRequest(text, mode) {
    this.setLoadingState(true);
    this.showStatus('Analyzing your request...', 'info');
    this.elements.result.textContent = '';

    try {
      let response;
      
      if (mode === 'summary') {
        response = await summarizeText(text);
      } else if (mode === 'explain') {
        response = await explainConcept(text);
      } else {
        throw new Error('Invalid mode selected');
      }

      this.displayResult(response);
      this.showStatus('Analysis completed successfully!', 'success');
      
    } catch (error) {
      console.error('AI Assistant Error Details:', {
        message: error.message,
        status: error.status,
        name: error.name,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to process your request.';
      
      if (error.status === 408) {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.status === 400) {
        errorMessage = 'Invalid request. Please check your input.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message && error.message.includes('OpenAI')) {
        errorMessage = 'AI service temporarily unavailable. Please try again.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      this.showStatus(errorMessage, 'error');
      this.elements.result.textContent = '';
    } finally {
      this.setLoadingState(false);
    }
  }

  setLoadingState(loading) {
    this.isProcessing = loading;
    this.elements.submit.disabled = loading;
    
    if (loading) {
      this.elements.spinner.style.display = 'inline-block';
      this.elements.buttonText.textContent = 'Processing...';
    } else {
      this.elements.spinner.style.display = 'none';
      this.elements.buttonText.textContent = 'Ask AI';
    }
  }

  showStatus(message, type) {
    const status = this.elements.status;
    
    // Remove existing classes
    status.classList.remove('show', 'success', 'error', 'info');
    
    if (message) {
      status.textContent = message;
      status.classList.add('show', type);
      
      // Auto-hide success messages
      if (type === 'success') {
        setTimeout(() => {
          status.classList.remove('show');
        }, 3000);
      }
    } else {
      status.classList.remove('show');
    }
  }

  displayResult(text) {
    if (!text) {
      this.elements.result.textContent = 'No response received.';
      return;
    }

    // Detect language and set direction
    const isPersian = this.detectPersianText(text);
    this.elements.result.className = `ai-result ${isPersian ? 'rtl' : 'ltr'}`;
    
    // Render markdown-like formatting
    const formattedText = this.renderMarkdown(text);
    this.elements.result.innerHTML = formattedText;
    
    // Smooth scroll to result
    this.elements.result.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });
  }

  detectPersianText(text) {
    // Check for Persian/Arabic characters
    const persianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return persianRegex.test(text);
  }

  renderMarkdown(text) {
    return text
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      
      // Bullet points (both - and •)
      .replace(/^[•\\-]\\s+(.*)$/gm, '<li>$1</li>')
      
      // Numbered lists
      .replace(/^\\d+\\.\\s+(.*)$/gm, '<li>$1</li>')
      
      // Wrap consecutive <li> elements in <ul>
      .replace(/(<li>.*<\\/li>)/gs, (match) => {
        const items = match.split('</li>').filter(item => item.trim());
        if (items.length > 1) {
          return '<ul>' + items.map(item => item + '</li>').join('') + '</ul>';
        }
        return '<ul>' + match + '</ul>';
      })
      
      // Paragraphs
      .replace(/\\n\\n/g, '</p><p>')
      .replace(/^(.*)$/gm, (match) => {
        if (match.trim() && !match.startsWith('<')) {
          return '<p>' + match + '</p>';
        }
        return match;
      })
      
      // Clean up extra paragraph tags
      .replace(/<p><\\/p>/g, '')
      .replace(/<p>(<[^>]+>)/g, '$1')
      .replace(/(<\\/[^>]+>)<\\/p>/g, '$1');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AIAssistant();
});

// Export for debugging
window.AIAssistant = AIAssistant;