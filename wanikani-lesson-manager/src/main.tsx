import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { unsafeWindow } from '$';

// 1. Declare wkof for TypeScript (provided by the @require in vite.config.ts)
declare global {
  interface Window {
    wkof: any;
  }
}

console.log('[WKLBGH v0.2.1] WKOF-Integrated Injector starting...');

// Function to get WKOF from the most likely context
const getWkof = () => {
    return (unsafeWindow as any).wkof || window.wkof;
};

const injectApp = () => {
  if (document.getElementById('wklbgh-container')) {
    console.log('[WKLBGH] Already present.');
    return;
  }

  // Look for a stable 2025 WaniKani dashboard widget
  const dashboard = document.querySelector('[data-widget-name="level_progress"]') || 
                    document.querySelector('.dashboard__content') || 
                    document.querySelector('.dashboard') || 
                    document.body;

  if (!dashboard) {
    console.warn('[WKLBGH] Waiting for WaniKani dashboard elements...');
    return;
  }

  console.log('[WKLBGH] Injecting panel after:', dashboard.tagName);
  
  const container = document.createElement('div');
  container.id = 'wklbgh-container';
  
  // Clean, sibling injection point (post-dashboard)
  dashboard.after(container);

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  
  console.log('[WKLBGH] UI mounted successfully.');
};

// 2. Initialize WKOF and handle page transitions
const wkof = getWkof();

if (!wkof) {
  // Fallback for when WKOF is missing
  console.error('[WKLBGH] WaniKani Open Framework is missing. Proceeding with standard DOM events.');
  window.addEventListener('turbo:load', injectApp);
  
  // Initial check in case it's already there
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
      injectApp();
  }
} else {
  // Proper WKOF initialization
  wkof.include('ItemData, Menu');
  wkof.ready('ItemData, Menu').then(() => {
    console.log('[WKLBGH] WKOF Ready.');
    
    // Add WKLBGH to the WaniKani Scripts Menu (Elegant!)
    wkof.Menu.insert_script_link({
        name: 'wklbgh',
        submenu: 'Settings',
        title: 'WKLBGH Lessons',
        on_click: () => { alert('WKLBGH is active on the dashboard!'); }
    });

    // Use WKOF's robust pageload hook for SPA navigation
    wkof.on_pageload(['/', '/dashboard', '/home'], injectApp);
    
    // Initial call
    injectApp();
  });
}
