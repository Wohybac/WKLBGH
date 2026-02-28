import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Essential to avoid bundling the JSX runtime
      jsxRuntime: 'classic',
    }),
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        name: 'WKLBGH',
        icon: 'https://www.wanikani.com/favicon.ico',
        namespace: 'npm/vite-plugin-monkey',
        version: '0.0.3', // Patch update
        match: [
          'https://www.wanikani.com/*',
          'https://www.wanikani.com/dashboard',
          'https://www.wanikani.com/home'
        ],
        description: 'WKLBGH - WaniKani Lesson Based Grammar Helper: Manage your lessons with Gemini AI assistance.',
        'run-at': 'document-end',
        grant: ['GM_setValue', 'GM_getValue', 'GM_xmlhttpRequest', 'GM_addStyle'],
      },
      build: {
        externalGlobals: {
          'react': cdn.jsdelivr('React', 'umd/react.production.min.js'),
          'react-dom': cdn.jsdelivr('ReactDOM', 'umd/react-dom.production.min.js'),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      'react/jsx-runtime': 'react',
      'react-dom/client': 'react-dom',
    }
  },
  build: {
    minify: false,
    cssMinify: false,
  },
});
