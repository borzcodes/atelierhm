import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite rewrites each page's module script into its own `<script>` in the head
 * and drops the attributes it does not know. The project page's is marked
 * `blocking="render"` on purpose — the page is built by that script, and the
 * cross-document view transition that carries a picture in from the work grid
 * captures the page at its first render, so the project has to be on the page
 * before that render happens. This puts the attribute back after the rewrite.
 */
function renderBlockingEntry(pages) {
  return {
    name: 'hm:render-blocking-entry',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!pages.some((p) => ctx.filename.endsWith(p))) return html;
        return html.replace(
          /<script type="module" crossorigin src=/g,
          '<script type="module" crossorigin blocking="render" src='
        );
      },
    },
  };
}

export default defineConfig({
  base: './',
  server: { port: 5180, open: true },
  plugins: [renderBlockingEntry(['index.html', 'project.html'])],
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
