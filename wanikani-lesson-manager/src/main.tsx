import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('[WKLBGH v0.0.1] Aggressive Injector starting...');

const injectApp = () => {
  if (document.getElementById('wklbgh-container')) return true;

  // Search for the level progress widget (2025 standard)
  const widget = document.querySelector('[data-widget-name="level_progress"]');
  const dashboard = document.querySelector('.dashboard__content') || 
                    document.querySelector('.dashboard') || 
                    document.querySelector('.container');
  
  const target = widget || dashboard || document.body;

  if (!target) {
    console.warn('[WKLBGH] No suitable target found in current DOM.');
    return false;
  }

  console.log('[WKLBGH] Found target:', target.tagName, target.className || target.getAttribute('data-widget-name'));
  
  const container = document.createElement('div');
  container.id = 'wklbgh-container';
  
  // High visibility styles to prove it's there
  container.style.cssText = `
    display: block !important;
    width: 100% !important;
    min-height: 200px !important;
    background: #fff !important;
    border: 5px solid yellow !important;
    margin: 20px 0 !important;
    z-index: 999999 !important;
    position: relative !important;
  `;

  // Standard DOM injection (no shadow DOM for this proof-of-concept fix)
  if (widget) {
    widget.after(container);
  } else {
    document.body.prepend(container);
  }

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  
  console.log('[WKLBGH] UI mounted successfully.');
  return true;
};

// Initial check and setup listeners
const setup = () => {
  if (!injectApp()) {
    // Retry every 200ms for 10 seconds
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (injectApp() || count > 50) clearInterval(interval);
    }, 200);
  }
};

window.addEventListener('turbo:load', () => {
  console.log('[WKLBGH] Turbo load.');
  setup();
});

// Run immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setup();
} else {
  window.addEventListener('DOMContentLoaded', setup);
}
