import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    exclude: ['**/tests/**', '**/node_modules/**', '**/*.spec.ts'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/setupTests.ts'],
    },
  },
});
