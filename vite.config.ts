/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths: the site is served from a sub-path on GitHub Pages.
  base: './',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    globalSetup: ['./tests/global-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
  },
});
