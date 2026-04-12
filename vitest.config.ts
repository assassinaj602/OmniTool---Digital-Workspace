import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['utils/pdf/download.ts', 'utils/pdf/errors.ts', 'utils/pdf/validation.ts'],
      exclude: ['**/*.d.ts'],
      thresholds: {
        lines: 60,
        branches: 80,
        functions: 50,
        statements: 60,
      },
    },
  },
});
