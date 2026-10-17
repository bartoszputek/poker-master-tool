import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const { version } = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
) as { version: string };

export default defineConfig({
  plugins: [
    sveltekit({
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
      },
      // The Express backend serves the static build from the build directory.
      adapter: adapter(),
      // The page is prerendered, so SvelteKit puts this policy in a <meta> tag
      // and adds the hash of its inline start-up script to script-src.
      csp: {
        mode: 'hash',
        directives: {
          'default-src': ['self'],
          'base-uri': ['self'],
          'font-src': ['self'],
          'form-action': ['self'],
          'img-src': ['self', 'data:'],
          'object-src': ['none'],
          'script-src': ['self'],
          'script-src-attr': ['none'],
          // Svelte sets inline style attributes, for example the card backgrounds.
          'style-src': ['self', 'unsafe-inline'],
        },
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  server: {
    port: 8080,
    proxy: {
      '/compute': 'http://localhost:3000',
    },
  },
});
