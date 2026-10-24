import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts on purpose: that file copies .env.local into process.env, and tests must never
// see real keys. envDir points at a folder without .env files, so nothing is loaded; tests set their own fake env.
export default defineConfig({
  envDir: './tests',
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    restoreMocks: true,
  },
});
