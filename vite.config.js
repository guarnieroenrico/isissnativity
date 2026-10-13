import { defineConfig } from 'vite';

// base './' = percorsi relativi: funziona su GitHub Pages anche in una sottocartella
// (https://utente.github.io/nome-repo/).
export default defineConfig({
  base: './',
  build: { target: 'es2022', chunkSizeWarningLimit: 1200 },
});
