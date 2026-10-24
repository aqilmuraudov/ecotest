import { describe, expect, it } from 'vitest';
import { validPhone } from '../src/utils/phone';
import { normalizePhone } from '../api/lead';
import { PHONE_CASES } from './phoneCases';

describe('normalizePhone (server, api/lead.ts)', () => {
  it.each(PHONE_CASES)('$note: "$input" -> $stored', ({ input, stored }) => {
    expect(normalizePhone(input)).toBe(stored);
  });
});

describe('validPhone (browser, src/utils/phone.ts)', () => {
  it.each(PHONE_CASES)('$note: "$input" -> ok=$stored', ({ input, stored }) => {
    expect(validPhone(input)).toBe(stored !== null);
  });

  it('treats null / undefined as invalid', () => {
    expect(validPhone(undefined as unknown as string)).toBe(false);
    expect(validPhone(null as unknown as string)).toBe(false);
  });
});

describe('browser and server phone rules agree', () => {
  it.each(PHONE_CASES)('$note: "$input"', ({ input }) => {
    expect(validPhone(input)).toBe(normalizePhone(input) !== null);
  });

  // every number with 7-16 digits in a few shapes, so a rule changed on one side only is caught even outside the table
  it('agrees on generated numbers', () => {
    const prefixes = ['', '0', '00', '994', '9940', '7', '1'];
    const disagree: string[] = [];
    for (const p of prefixes) {
      for (let len = 7; len <= 16; len++) {
        for (const first of ['0', '1', '5', '9']) {
          const n = (p + first + '2345678901234567').slice(0, len);
          if (validPhone(n) !== (normalizePhone(n) !== null)) disagree.push(n);
        }
      }
    }
    expect(disagree).toEqual([]);
  });
});
