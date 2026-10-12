import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // FONDAMENTALE: permette a GitHub Pages di caricare le risorse
  build: {
    outDir: 'dist'
  }
});