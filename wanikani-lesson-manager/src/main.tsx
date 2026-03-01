import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { unsafeWindow, GM_getValue } from '$';

declare global {
  interface Window {
    wkof: any;
  }
}

console.log('[WKLBGH v0.2.13] Virtual Widget Injector starting...');

const getWkof = () => (unsafeWindow as any).wkof || window.wkof;

const injectApp = () => {
  const path = window.location.pathname;
  const isDashboard = path === '/' || path === '/dashboard' || path === '/home';
  if (!isDashboard) return;

  if (document.getElementById('wklbgh-container')) return;

  const content = document.querySelector('.dashboard__content');
  if (!content) return;

  // Placement Preference
  const placement = GM_getValue('wklbgh_placement', 'below_level_progress');
  const levelProgress = document.querySelector('.level-progress-widget') || 
                        document.querySelector('[data-dashboard-widget-url-value*="level-progress"]');

  const container = document.createElement('div');
  container.id = 'wklbgh-container';
  container.className = 'dashboard__row wklbgh-virtual-widget-row';
  container.innerHTML = '<div class="dashboard__widget dashboard__widget--full"><div id="wklbgh-mount"></div></div>';
  const mountPoint = container.querySelector('#wklbgh-mount') as HTMLElement;

  if (placement === 'below_level_progress' && levelProgress) {
    const row = levelProgress.closest('.dashboard__row');
    if (row) {
      row.after(container);
      console.log('[WKLBGH] Injected after Level Progress.');
    } else {
      content.prepend(container);
    }
  } else if (placement === 'bottom') {
    content.appendChild(container);
    console.log('[WKLBGH] Injected at bottom.');
  } else {
    content.prepend(container);
    console.log('[WKLBGH] Injected at top.');
  }

  const root = ReactDOM.createRoot(mountPoint);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// 2. Robust Observer setup
const startObserver = () => {
    const targetNode = document.documentElement || document.body || document;
    if (!targetNode) {
        // Extreme fallback
        setTimeout(startObserver, 100);
        return;
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector('.dashboard__content') && !document.getElementById('wklbgh-container')) {
        injectApp();
      }
    });

    observer.observe(targetNode, { childList: true, subtree: true });
    console.log('[WKLBGH] MutationObserver active.');
};

// 3. Initialize
const wkof = getWkof();
if (!wkof) {
  window.addEventListener('turbo:load', injectApp);
  // Start observer immediately or wait for DOMContentLoaded
  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startObserver);
  } else {
      startObserver();
  }
} else {
  wkof.include('ItemData, Menu');
  wkof.ready('ItemData, Menu').then(() => {
    console.log('[WKLBGH] WKOF Ready.');
    wkof.on_pageload(['/', '/dashboard', '/home'], injectApp);
    startObserver(); // Still use observer as fallback for WKOF pageload
    injectApp();
  });
}
