// Shared server-side helpers for the AI seller (chat + lead). Files under api/_lib are not routes.
import { createHmac, timingSafeEqual } from 'node:crypto';

export const env = (name: string, fallback = ''): string => (process.env[name] ?? fallback).trim();

export const SITE_URL = () => env('SITE_URL', 'https://ecolife.az').replace(/\/+$/, '');
export const SALES_WHATSAPP = () => env('SALES_WHATSAPP', '994504507007').replace(/\D/g, '');

// ---------- tiny in-memory rate limiter (best effort on serverless; real protection is Turnstile + provider limits)
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= max) return false;
  b.count += 1;
  return true;
}

export function clientIp(req: any): string {
  const fwd = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || req.socket?.remoteAddress || 'unknown';
}

// ---------- Cloudflare Turnstile (human check). Inert until TURNSTILE_SECRET_KEY is set, so the site never breaks half-configured.
// A solved challenge is exchanged for a short-lived signed "pass" so a chat does not need a new challenge for every message.
const PASS_TTL_S = 45 * 60;
export const captchaEnabled = () => !!env('TURNSTILE_SECRET_KEY');

function passSig(exp: number): string {
  return createHmac('sha256', env('TURNSTILE_SECRET_KEY')).update(`pass:${exp}`).digest('base64url').slice(0, 27);
}
export function issuePass(): string {
  const exp = Math.floor(Date.now() / 1000) + PASS_TTL_S;
  return `${exp}.${passSig(exp)}`;
}
export function checkPass(pass: unknown): boolean {
  const m = /^(\d{9,12})\.([A-Za-z0-9_-]{20,40})$/.exec(String(pass || ''));
  if (!m || Number(m[1]) < Date.now() / 1000) return false;
  const want = Buffer.from(passSig(Number(m[1])));
  const got = Buffer.from(m[2]);
  return want.length === got.length && timingSafeEqual(want, got);
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: env('TURNSTILE_SECRET_KEY'), response: token, ...(ip && ip !== 'unknown' ? { remoteip: ip } : {}) }),
      signal: AbortSignal.timeout(5000),
    });
    const j: any = await r.json();
    return j.success === true;
  } catch (e) {
    // Cloudflare unreachable: do not lock real customers out (the rate limits still apply)
    console.error('[turnstile] verify unavailable, allowing', e);
    return true;
  }
}

/** { ok: true, pass? } when the request is from a verified visitor (or the check is not configured). */
export async function checkHuman(body: any, ip: string): Promise<{ ok: boolean; pass?: string }> {
  if (!captchaEnabled()) return { ok: true };
  if (checkPass(body?.pass)) return { ok: true };
  const token = String(body?.cfToken || '').slice(0, 2048);
  if (token && (await verifyTurnstile(token, ip))) return { ok: true, pass: issuePass() };
  return { ok: false };
}

// ---------- opening hours (Baku, UTC+4, Mon-Sat 09:00-18:00)
export function bakuNow(): { open: boolean; label: string } {
  const d = new Date(Date.now() + 4 * 3600 * 1000);
  const day = d.getUTCDay(); // 0 = Sunday
  const mins = d.getUTCHours() * 60 + d.getUTCMinutes();
  const open = day !== 0 && mins >= 9 * 60 && mins < 18 * 60;
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return { open, label: `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]} ${hh}:${mm} (Baku)` };
}

// ---------- Telegram
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function sendTelegram(html: string, buttons?: { text: string; url: string }[]): Promise<boolean> {
  const token = env('TELEGRAM_BOT_TOKEN');
  const chat = env('TELEGRAM_CHAT_ID', '-1004425538189');
  if (!token || !chat) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: html,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: buttons?.length ? { inline_keyboard: [buttons.map(b => ({ text: b.text, url: b.url }))] } : undefined,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
export { esc as escapeHtml };

// ---------- catalogue (public read via the anon key, cached for 5 minutes)
export interface CatalogItem {
  code: string;
  slug: string;
  name: string;
  category: string;
  categoryName: { az: string; en: string; ru: string };
  image: string;
  url: string;
  specs: Record<string, string>;
  haystack: string;
}

let cache: { at: number; items: CatalogItem[] } | null = null;

const first = (s: string, re: RegExp) => s.match(re)?.[0] || '';

export async function loadCatalog(): Promise<CatalogItem[]> {
  if (cache && Date.now() - cache.at < 5 * 60 * 1000) return cache.items;
  const url = env('VITE_SUPABASE_URL');
  const key = env('VITE_SUPABASE_ANON_KEY');
  if (!url || !key) return cache?.items || [];
  let rows: any[];
  try {
    const res = await fetch(
      `${url}/rest/v1/products?select=code,slug,name,category,category_name,image&limit=1000`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return cache?.items || [];
    rows = await res.json();
  } catch {
    return cache?.items || [];
  }
  const items = rows.map(r => {
    const name = String(r.name || '');
    const cn = r.category_name || {};
    const specs: Record<string, string> = {};
    const w = first(name, /\d+(?:[.,]\d+)?x?\d*W\b/i);
    const k = first(name, /\b\d{4}K\b/i);
    const v = first(name, /\b\d+(?:-\d+)?V\b/i);
    if (w) specs.power = w;
    if (k) specs.cct = k;
    if (v) specs.voltage = v;
    return {
      code: String(r.code || ''),
      slug: String(r.slug || r.code || ''),
      name,
      category: String(r.category || ''),
      categoryName: { az: cn.az || '', en: cn.en || '', ru: cn.ru || '' },
      image: typeof r.image === 'string' && r.image.startsWith('http') ? r.image : '',
      url: `${SITE_URL()}/catalog/${encodeURIComponent(String(r.slug || r.code))}`,
      specs,
      haystack: `${name} ${r.code} ${r.category} ${cn.az || ''} ${cn.en || ''} ${cn.ru || ''}`.toLowerCase(),
    } as CatalogItem;
  });
  cache = { at: Date.now(), items };
  return items;
}

export async function searchCatalog(args: { query?: string; category?: string; limit?: number }): Promise<CatalogItem[]> {
  const items = await loadCatalog();
  const limit = Math.min(Math.max(args.limit || 6, 1), 8);
  let pool = items;
  if (args.category) pool = pool.filter(i => i.category === args.category);
  const tokens = (args.query || '')
    .toLowerCase()
    .split(/[\s,;]+/)
    .filter(t => t.length > 1);
  if (tokens.length === 0) return pool.slice(0, limit);
  const scored = pool
    // word forms: "lentiniz" must still find "lentlər"/"LED Strip" categories, so long words also match by their first 4 letters
    .map(i => ({ i, s: tokens.reduce((n, t) => n + (i.haystack.includes(t) ? 1 : t.length >= 5 && i.haystack.includes(t.slice(0, 4)) ? 0.5 : 0), 0) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s);
  return scored.slice(0, limit).map(x => x.i);
}

export const publicItem = (i: CatalogItem) => ({
  code: i.code,
  name: i.name,
  category: i.categoryName.en || i.category,
  specs: i.specs,
  url: i.url,
});
