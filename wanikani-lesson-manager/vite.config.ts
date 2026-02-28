import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), // Back to standard React bundling to bypass CSP
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        name: 'WKLBGH',
        icon: 'https://www.wanikani.com/favicon.ico',
        namespace: 'npm/vite-plugin-monkey',
        version: '0.0.2',
        match: [
          'https://www.wanikani.com/*',
          'https://www.wanikani.com/dashboard',
          'https://www.wanikani.com/home'
        ],
        description: 'WKLBGH - WaniKani Lesson Based Grammar Helper: Manage your lessons with Gemini AI assistance.',
        'run-at': 'document-end',
        grant: ['GM_setValue', 'GM_getValue', 'GM_xmlhttpRequest', 'GM_addStyle'],
      },
    }),
  ],
  build: {
    minify: false,
    cssMinify: false,
  },
});
