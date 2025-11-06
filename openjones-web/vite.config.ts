import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: './frontend',
  publicDir: 'public',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@engine': path.resolve(__dirname, './frontend/src/engine'),
      '@components': path.resolve(__dirname, './frontend/src/components'),
      '@rendering': path.resolve(__dirname, './frontend/src/rendering'),
      '@store': path.resolve(__dirname, './frontend/src/store'),
      '@hooks': path.resolve(__dirname, './frontend/src/hooks'),
      '@utils': path.resolve(__dirname, './frontend/src/utils'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: '../dist',
    sourcemap: true,
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
