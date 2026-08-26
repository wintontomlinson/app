import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['Android >= 7'],
      modernPolyfills: true,
    }),
  ],
  build: {
    outDir: '../static',
    emptyOutDir: true,
    sourcemap: false,
  },
});
