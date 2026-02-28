import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), // Bundling React is MANDATORY for CSP compliance on WaniKani
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        name: 'WKLBGH',
        icon: 'https://www.wanikani.com/favicon.ico',
        namespace: 'npm/vite-plugin-monkey',
        version: '0.1.1', // Final Sprint update
        match: [
          'https://www.wanikani.com/*',
        ],
        description: 'WKLBGH - WaniKani Lesson Based Grammar Helper: Manage your lessons with Gemini AI assistance.',
        'run-at': 'document-end',
        grant: ['GM_setValue', 'GM_getValue', 'GM_xmlhttpRequest', 'GM_addStyle'],
        require: [
          'https://greasyfork.org/scripts/38581-wanikani-open-framework/code/Wanikani%20Open%20Framework.user.js'
        ],
      },
    }),
  ],
  build: {
    minify: false,
    cssMinify: false,
  },
});
