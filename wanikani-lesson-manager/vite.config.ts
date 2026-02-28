import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        name: 'WKLBGH',
        icon: 'https://www.wanikani.com/favicon.ico',
        namespace: 'npm/vite-plugin-monkey',
        match: ['https://www.wanikani.com/*'],
        description: 'WKLBGH - WaniKani Lesson Based Grammar Helper: Manage your lessons with Gemini AI assistance.',
        'run-at': 'document-end',
        grant: ['GM_setValue', 'GM_getValue', 'GM_xmlhttpRequest'],
      },
      build: {
        externalGlobals: {
          'react': cdn.jsdelivr('React', 'umd/react.production.min.js'),
          'react-dom': cdn.jsdelivr('ReactDOM', 'umd/react-dom.production.min.js'),
        },
      },
    }),
  ],
  build: {
    minify: false,
    cssMinify: false,
  },
});
