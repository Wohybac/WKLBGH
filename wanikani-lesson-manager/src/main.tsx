import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('[WKLBGH] Script starting...');

const injectApp = () => {
  // 1. Prevent multiple injections
  if (document.getElementById('wklbgh-container')) {
    console.log('[WKLBGH] Already injected.');
    return;
  }

  // 2. Ensure body is available
  if (!document.body) {
    console.log('[WKLBGH] Body not ready, retrying in 100ms...');
    setTimeout(injectApp, 100);
    return;
  }

  console.log('[WKLBGH] Injecting panel into document body...');
  const container = document.createElement('div');
  container.id = 'wklbgh-container';
  
  // Prepend to body to ensure it's at the very top of the page
  document.body.prepend(container);

  const shadow = container.attachShadow({ mode: 'open' });
  const rootDiv = document.createElement('div');
  shadow.appendChild(rootDiv);

  // Note: Styles are being handled by vite-plugin-monkey's automatic injection
  // which works even with Shadow DOM when using GM_addStyle (configured in grant).

  ReactDOM.createRoot(rootDiv).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('[WKLBGH] UI mounted successfully.');
};

// Start injection process
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  injectApp();
} else {
  window.addEventListener('DOMContentLoaded', injectApp);
}
