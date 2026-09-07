import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  server: { port: 5180, open: true },
  build: {
    outDir: 'dist',
    // gsap and lenis change far less often than the site does, so they get
    // their own long-lived chunk.
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        project: resolve(__dirname, 'project.html'),
      },
      output: {
        manualChunks: {
          motion: ['gsap', 'gsap/ScrollTrigger', 'lenis'],
        },
      },
    },
  },
});
