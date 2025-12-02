// ai-assistant/js/aiAssistant-fixed.js
// Fixed AI Assistant with correct API endpoints

console.log('Majelani AI Assistant FIXED loaded');

// Test backend connection
fetch('https://api.majelaniaccounting.com/health')
  .then(r => r.json())
  .then(data => console.log('Backend test:', data))
  .catch(e => console.error('Backend test failed:', e));

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('ai-form');
  
  if (!form) {
    console.error('AI form not found');
    return;
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const text = document.getElementById('ai-input').value.trim();
    const mode = document.getElementById('ai-mode').value;
    const button = document.getElementById('ai-submit');
    const status = document.getElementById('ai-status');
    const result = document.getElementById('ai-result');
    
    if (!text) {
      status.textContent = 'Please enter some text first.';
      status.className = 'ai-status show error';
      return;
    }
    
    // Set loading state
    button.disabled = true;
    button.querySelector('.button-text').textContent = 'Processing...';
    button.querySelector('.loading-spinner').style.display = 'inline-block';
    status.textContent = 'Analyzing your request...';
    status.className = 'ai-status show info';
    result.textContent = '';
    
    try {
      const endpoint = mode === 'summary' ? 'summary' : 'explain';
      console.log(`FIXED: Using /api/${endpoint}`);
      
      const response = await fetch(`https://api.majelaniaccounting.com/api/${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      // Display result
      const aiResponse = data.summary || 'No response received';
      result.textContent = aiResponse;
      
      // Detect Persian text and set direction
      const isPersian = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(aiResponse);
      result.className = `ai-result ${isPersian ? 'rtl' : 'ltr'}`;
      
      status.textContent = 'Analysis completed successfully!';
      status.className = 'ai-status show success';
      
    } catch (error) {
      console.error('AI Assistant Error:', error);
      status.textContent = `Error: ${error.message}`;
      status.className = 'ai-status show error';
      result.textContent = '';
    } finally {
      // Reset button state
      button.disabled = false;
      button.querySelector('.button-text').textContent = 'Ask AI';
      button.querySelector('.loading-spinner').style.display = 'none';
    }
  });
});

// Auto-resize textarea
document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('ai-input');
  if (textarea) {
    const autoResize = () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(120, textarea.scrollHeight) + 'px';
    };
    textarea.addEventListener('input', autoResize);
    textarea.addEventListener('focus', autoResize);
  }
});