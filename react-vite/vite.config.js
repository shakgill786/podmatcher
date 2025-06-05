import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // ✅ Force IPv4 instead of ::1
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000', // ✅ Match Flask host exactly
        changeOrigin: true,
      },
    },
  },
});
