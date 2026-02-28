import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Robust injection function
const injectApp = () => {
  // Check if we're already injected
  if (document.getElementById('wklbgh-container')) return;

  const container = document.createElement('div');
  container.id = 'wklbgh-container';
  
  // Find a stable place to inject (e.g., above the dashboard or at the top of the body)
  const target = document.querySelector('.dashboard') || document.body;
  if (target === document.body) {
    target.prepend(container);
  } else {
    target.before(container);
  }

  const shadow = container.attachShadow({ mode: 'open' });
  const rootDiv = document.createElement('div');
  shadow.appendChild(rootDiv);

  // Note: Styles are now being handled by vite-plugin-monkey's automatic injection
  // which works even with Shadow DOM if configured correctly. 
  // For the initial "cook" we keep the inline styles in App.tsx to ensure visibility.

  ReactDOM.createRoot(rootDiv).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
};

// Handle dynamic page loads (WaniKani is mostly static but let's be safe)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  injectApp();
} else {
  window.addEventListener('DOMContentLoaded', injectApp);
}
