import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Keep legacy localhost URL literals from leaking into the browser bundle.
 * The app should use same-origin /api and /uploads in production. During local
 * dev, Vite proxies those paths to the HACHI API on port 3002.
 */
function normalizeRuntimeApiUrls(): Plugin {
  return {
    name: 'normalize-runtime-api-urls',
    transform(code, id) {
      if (!id.includes('/src/') || (!id.endsWith('.ts') && !id.endsWith('.tsx'))) {
        return null;
      }

      const normalized = code
        .replaceAll('http://localhost:3001/api', '/api')
        .replaceAll('http://localhost:3001', '');

      return normalized === code ? null : { code: normalized, map: null };
    },
  };
}

export default defineConfig({
  plugins: [normalizeRuntimeApiUrls(), react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
