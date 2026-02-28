import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('[WKLBGH v0.0.2] React-Compliant Injector starting...');

const injectApp = () => {
  if (document.getElementById('wklbgh-container')) return;

  // We are looking for the Level Progress widget, BUT we will inject
  // as a SIBLING to the main dashboard container to avoid React conflicts.
  const dashboard = document.querySelector('.dashboard') || 
                    document.querySelector('.dashboard__content') ||
                    document.body;

  if (!dashboard) {
    console.log('[WKLBGH] Waiting for dashboard...');
    return;
  }

  console.log('[WKLBGH] Injecting sibling to:', dashboard.tagName);
  
  const container = document.createElement('div');
  container.id = 'wklbgh-container';
  
  // Mandatory "I am here" styles
  container.style.cssText = `
    display: block !important;
    width: 100% !important;
    margin: 20px auto !important;
    max-width: 1100px !important;
    z-index: 100 !important;
    position: relative !important;
    background: #fff !important;
    border: 10px solid blue !important; /* BLUE for this version's testing */
    min-height: 200px !important;
  `;

  // Place it inside the dashboard container but NOT as a child of a React component
  dashboard.prepend(container);

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  
  console.log('[WKLBGH] Successfully mounted.');
};

// Turbo events are critical for WaniKani
window.addEventListener('turbo:load', () => {
  console.log('[WKLBGH] Turbo load.');
  injectApp();
});

window.addEventListener('turbo:render', () => {
  console.log('[WKLBGH] Turbo render.');
  injectApp();
});

// Periodic check for dynamic loading
setInterval(injectApp, 1000);

// Initial try
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  injectApp();
} else {
  window.addEventListener('DOMContentLoaded', injectApp);
}
