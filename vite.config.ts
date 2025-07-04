import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'verify-app/static',   // ⬅ path relative to repo root
    emptyOutDir: true,
  },
  server: {
  proxy: {
    '/verify_api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
         secure: false,
      },
    },
  },
});

