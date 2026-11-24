/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';

/** Files in `public/` that the worker must keep for offline use. */
const PUBLIC_FILES = [
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'apple-touch-icon.png',
];

/**
 * Emits `sw.js`: it stores every file of the build when it installs, serves the page from the network
 * when it can (so a new version shows up on the next visit) and from the stored copy when it cannot.
 * The cache name changes with the build, which also clears the old one.
 */
function offlineWorker(): Plugin {
  return {
    name: 'impastometro-offline-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const urls = ['./', ...Object.keys(bundle), ...PUBLIC_FILES].map((f) =>
        f === './' ? f : `./${f}`,
      );
      const version = createHash('sha1').update(urls.join('|')).digest('hex').slice(0, 10);
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `const CACHE = 'impastometro-${version}';
const URLS = ${JSON.stringify(urls)};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(URLS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html').then((hit) => hit || caches.match('./'))),
    );
    return;
  }
  event.respondWith(
    caches.match(request).then((hit) => hit || fetch(request)),
  );
});
`,
      });
    },
  };
}

export default defineConfig({
  // Relative asset paths: the site is served from a sub-path on GitHub Pages.
  base: './',
  plugins: [react(), tailwindcss(), offlineWorker()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  test: {
    environment: 'node',
    globalSetup: ['./tests/global-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
  },
});
