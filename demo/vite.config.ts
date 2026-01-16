import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // Local dev: resolve the library package to source.
      '@reactkits.dev/better-auth-connect': resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy Better Auth API calls to backend (optional, for CORS)
      '/api/auth': {
        target: process.env.VITE_BETTER_AUTH_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
