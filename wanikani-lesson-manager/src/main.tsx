import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('[WKLBGH] Widget-based injector starting...');

const injectApp = () => {
  // 1. Prevent multiple injections
  if (document.getElementById('wklbgh-container')) {
    console.log('[WKLBGH] Already present.');
    return;
  }

  // 2. 2025 Widget Selector: Target the Level Progress widget
  const targetSelector = '[data-widget-name="level_progress"]';
  const target = document.querySelector(targetSelector);

  if (!target) {
    console.log('[WKLBGH] Level Progress widget not found yet.');
    return false;
  }

  console.log('[WKLBGH] Found Level Progress widget. Injecting...');
  const container = document.createElement('div');
  container.id = 'wklbgh-container';
  container.style.width = '100%';
  container.style.marginTop = '20px'; // Ensure spacing below the widget
  
  // Inject AFTER the widget as requested
  target.after(container);

  const shadow = container.attachShadow({ mode: 'open' });
  const rootDiv = document.createElement('div');
  shadow.appendChild(rootDiv);

  ReactDOM.createRoot(rootDiv).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('[WKLBGH] Mounted successfully below Level Progress.');
  return true;
};

// Use MutationObserver for dynamic widget loading
const observer = new MutationObserver(() => {
  if (injectApp()) {
    // We don't disconnect immediately because WaniKani's Turbo 
    // might swap elements out. We keep it running but 
    // injectApp() will prevent duplicates.
  }
});

// Initial try and setup observers
const init = () => {
  if (!injectApp()) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
};

// Listen for Turbo load events (WaniKani standard)
window.addEventListener('turbo:load', () => {
  console.log('[WKLBGH] Turbo load detected.');
  init();
});

// Fallback for initial load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  window.addEventListener('DOMContentLoaded', init);
}
