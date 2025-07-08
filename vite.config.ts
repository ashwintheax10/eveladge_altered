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
      '/monitor': 'http://localhost:5000',
      '/verify': 'http://localhost:5000',
      '/code': 'http://localhost:5000',
    }
  },
});

