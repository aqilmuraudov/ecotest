/** Same rules as /api/lead: Azerbaijan numbers are 994 + 9 digits (also accepted as 9 digits or 0 + 9), others 11-15 digits. */
export function validPhone(input: string): boolean {
  const d = String(input || '').replace(/\D/g, '');
  // the local forms become 994 + 9 digits on the server, where the 9 digits must not start with 0
  if (d.length === 9) return d[0] !== '0';
  if (d.length === 10 && d.startsWith('0')) return d[1] !== '0';
  if (d.startsWith('994')) return d.length === 12 && d[3] !== '0';
  return d.length >= 11 && d.length <= 15;
}
