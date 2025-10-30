import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    watch: false,
    pool: 'threads',
    maxThreads: 4,
    minThreads: 1,
    testTimeout: 2000,
    hookTimeout: 5000,
    reporters: 'basic',
  },
});

