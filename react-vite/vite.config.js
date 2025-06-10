import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost', // ✅ Match backend cookie domain
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // ✅ MUST match Flask's host for sessions to work
        changeOrigin: true,
      },
    },
  },
});
