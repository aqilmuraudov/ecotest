/** Same rules as /api/lead: Azerbaijan numbers are 994 + 9 digits (also accepted as 9 digits or 0 + 9), others 11-15 digits. */
export function validPhone(input: string): boolean {
  const d = String(input || '').replace(/\D/g, '');
  if (d.length === 9 || (d.length === 10 && d.startsWith('0'))) return true;
  if (d.startsWith('994')) return d.length === 12 && d[3] !== '0';
  return d.length >= 11 && d.length <= 15;
}
