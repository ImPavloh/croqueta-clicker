/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/testing/vitest-polyfills.ts', 'src/testing/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/app/**/*.ts'],
      exclude: ['src/app/**/*.spec.ts', 'src/app/**/*.routes.ts'],
    },
    reporters: ['default'],
    pool: 'forks',
    isolate: true,
    css: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@services': resolve(__dirname, './src/app/services'),
      '@ui': resolve(__dirname, './src/app/ui'),
      '@models': resolve(__dirname, './src/app/models'),
      '@data': resolve(__dirname, './src/app/data'),
      '@pages': resolve(__dirname, './src/app/pages'),
      '@pipes': resolve(__dirname, './src/app/pipes'),
      '@testing': resolve(__dirname, './src/testing'),
      testing: resolve(__dirname, './src/testing'),
    },
  },
});
