import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['services/**/*.ts'],
      exclude: ['**/*.test.ts', '**/__tests__/**', '**/testHelpers.ts'],
    },
  },
});

