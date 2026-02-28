import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('[WKLBGH] 2025 Robust Injector starting...');

const injectApp = () => {
  if (document.getElementById('wklbgh-container')) return true;

  // 1. Try to find the Level Progress widget (2025 standard)
  const widgetSelector = '[data-widget-name="level_progress"]';
  let target = document.querySelector(widgetSelector);

  // 2. Fallback to common dashboard containers if widget isn't found
  if (!target) {
    target = document.querySelector('.dashboard__content') || 
             document.querySelector('.dashboard') || 
             document.body;
  }

  if (!target) {
    console.log('[WKLBGH] No suitable injection target found.');
    return false;
  }

  console.log('[WKLBGH] Target found:', target.tagName, target.className);
  
  const container = document.createElement('div');
  container.id = 'wklbgh-container';
  
  // High visibility styles for the container itself
  container.style.display = 'block';
  container.style.width = '100%';
  container.style.minHeight = '50px';
  container.style.zIndex = '9999';
  container.style.position = 'relative';

  // If we are at the body level, let's make it more obvious
  if (target === document.body) {
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.width = '400px';
    container.style.boxShadow = '0 0 20px rgba(255,0,51,0.5)';
    console.log('[WKLBGH] Falling back to fixed position injection.');
  }

  target.after(container);

  const shadow = container.attachShadow({ mode: 'open' });
  const rootDiv = document.createElement('div');
  rootDiv.style.display = 'block';
  rootDiv.style.width = '100%';
  shadow.appendChild(rootDiv);

  ReactDOM.createRoot(rootDiv).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  
  console.log('[WKLBGH] UI mounted successfully.');
  return true;
};

// Handle Turbo loads
window.addEventListener('turbo:load', () => {
  console.log('[WKLBGH] Turbo load.');
  injectApp();
});

// Regular intervals for 5 seconds to catch delayed widgets
let attempts = 0;
const interval = setInterval(() => {
  attempts++;
  if (injectApp() || attempts > 50) {
    clearInterval(interval);
  }
}, 100);

// Mutation Observer as secondary backup
const observer = new MutationObserver(() => injectApp());
observer.observe(document.documentElement, { childList: true, subtree: true });
