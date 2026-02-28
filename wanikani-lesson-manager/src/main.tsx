import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.createElement('div');
container.id = 'wklbgh-container';
document.body.prepend(container);

const shadow = container.attachShadow({ mode: 'open' });
const rootDiv = document.createElement('div');
shadow.appendChild(rootDiv);

// To ensure styles are applied inside the Shadow DOM, 
// we'll need to inject the style tags there. 
// vite-plugin-monkey handles this automatically if configured, 
// but for a robust start, we'll let it handle the default behavior 
// or manually inject if we notice style issues.

ReactDOM.createRoot(rootDiv).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
