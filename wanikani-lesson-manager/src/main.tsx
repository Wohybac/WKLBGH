import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('[WKLBGH] Script starting...');

const injectApp = () => {
  // 1. Prevent multiple injections
  if (document.getElementById('wklbgh-container')) {
    return;
  }

  // 2. Identify target for specific placement (under level progress)
  // WaniKani dashboard uses .level-progress-dashboard as a common container
  const targetSelector = '.level-progress-dashboard';
  const target = document.querySelector(targetSelector);

  if (!target) {
    console.log('[WKLBGH] Target .level-progress-dashboard not found, waiting...');
    return false;
  }

  console.log('[WKLBGH] Target found. Injecting panel...');
  const container = document.createElement('div');
  container.id = 'wklbgh-container';
  
  // Inject specifically AFTER the level progress component
  target.after(container);

  const shadow = container.attachShadow({ mode: 'open' });
  const rootDiv = document.createElement('div');
  shadow.appendChild(rootDiv);

  ReactDOM.createRoot(rootDiv).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('[WKLBGH] UI mounted successfully.');
  return true;
};

// Use MutationObserver to detect the level-progress-dashboard even if it loads late
const observer = new MutationObserver((mutations, obs) => {
  if (injectApp()) {
    obs.disconnect(); // Stop watching once successfully injected
  }
});

// Initial try
if (!injectApp()) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
