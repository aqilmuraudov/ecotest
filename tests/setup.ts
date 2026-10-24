import { afterEach, beforeEach, vi } from 'vitest';

// No test may reach the network (Supabase, Telegram, Turnstile). Every test starts with a fetch that refuses;
// tests that need responses replace it with their own stub.
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async (input: unknown) => {
    throw new Error(`Unexpected network request in a test: ${String(input)}`);
  }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
