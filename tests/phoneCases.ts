// One table for both phone checks: src/utils/phone.ts (browser) and normalizePhone in api/lead.ts (server).
// `stored` is the digits the server keeps (saved as "+" + stored), null when the number is refused.
export interface PhoneCase { input: string; stored: string | null; note: string }

export const PHONE_CASES: PhoneCase[] = [
  // Azerbaijan, local forms
  { input: '504507007', stored: '994504507007', note: '9 digits' },
  { input: '50 450 70 07', stored: '994504507007', note: '9 digits with spaces' },
  { input: '0504507007', stored: '994504507007', note: '0 + 9 digits' },
  { input: '(050) 450-70-07', stored: '994504507007', note: '0 + 9 digits, formatted' },
  { input: '124987654', stored: '994124987654', note: '9 digits, Baku landline' },
  { input: '050 450 70 0', stored: null, note: '0 + 8 digits (one digit missing)' },
  { input: '012345678', stored: null, note: '9 digits starting with 0 (994 0...)' },
  { input: '0012345678', stored: null, note: '0 + 9 digits where the 9 start with 0 (994 0...)' },
  // Azerbaijan, international forms
  { input: '994504507007', stored: '994504507007', note: '994 + 9 digits' },
  { input: '+994 50 450 70 07', stored: '994504507007', note: '+994 formatted' },
  { input: '+994 (55) 123-45-67', stored: '994551234567', note: '+994 with brackets' },
  { input: '+994 050 450 70 07', stored: null, note: '994 + 0 + 9 digits (13 digits)' },
  { input: '994050450700', stored: null, note: '994 followed by 0 (12 digits)' },
  { input: '99450450700', stored: null, note: '994 + 8 digits' },
  { input: '9945045070071', stored: null, note: '994 + 10 digits' },
  // other countries: 11-15 digits
  { input: '+7 912 345 67 89', stored: '79123456789', note: 'Russia, 11 digits' },
  { input: '+90 532 123 45 67', stored: '905321234567', note: 'Turkey, 12 digits' },
  { input: '+44 20 7946 0958', stored: '442079460958', note: 'UK, 12 digits' },
  { input: '123456789012345', stored: '123456789012345', note: '15 digits' },
  { input: '1234567890123456', stored: null, note: '16 digits' },
  { input: '1234567890', stored: null, note: '10 digits, not starting with 0' },
  // junk
  { input: '', stored: null, note: 'empty' },
  { input: 'abc', stored: null, note: 'letters only' },
  { input: '12345', stored: null, note: 'too short' },
  { input: '45070', stored: null, note: '5 digits' },
];
