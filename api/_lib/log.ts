import { env } from './core.js';

/**
 * Conversation log + funnel events for the admin panel. Server-only writes with the Supabase service key (tables have no public policies).
 * Everything here is best effort: a logging problem must never affect a customer's chat.
 * Phone numbers and e-mail addresses typed into the chat are masked before anything is stored.
 */
const url = () => env('VITE_SUPABASE_URL');
const key = () => env('SUPABASE_SERVICE_ROLE_KEY');
export const loggingEnabled = () => !!(url() && key());

const headers = (extra: Record<string, string> = {}) => ({
  apikey: key(),
  ...(key().startsWith('eyJ') ? { Authorization: `Bearer ${key()}` } : {}),
  'Content-Type': 'application/json',
  ...extra,
});

export function scrub(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]{2,}/g, '[e-poçt]')
    .replace(/(?:\+?\d[\s().-]?){9,}/g, '[telefon]')
    .slice(0, 1500);
}

const timeout = <T,>(p: Promise<T>, ms: number): Promise<T | undefined> => Promise.race([p, new Promise<undefined>(r => setTimeout(() => r(undefined), ms))]);

export interface SessionLog {
  sid: string;
  lang: string;
  page?: string;
  variant?: string;
  history: { role: string; content: string }[];
  reply: string;
  cards?: string[];
}

export async function logSession(s: SessionLog): Promise<void> {
  if (!loggingEnabled() || !s.sid) return;
  const now = new Date().toISOString();
  const transcript = [
    ...s.history.slice(-40).map(m => ({ r: m.role === 'user' ? 'u' : 'a', t: scrub(m.content.replace(/\n\[Product cards shown[^\]]*\]/g, '')) })),
    { r: 'a', t: scrub(s.reply), c: s.cards?.length ? s.cards : undefined, ts: now },
  ];
  const row = {
    sid: s.sid,
    updated_at: now,
    lang: s.lang,
    last_page: s.page || null,
    variant: s.variant || null,
    msg_count: transcript.length,
    transcript,
  };
  try {
    // first_page is only set when the session is created (it is not part of the upsert payload afterwards)
    const exists = await timeout(fetch(`${url()}/rest/v1/chat_sessions?sid=eq.${encodeURIComponent(s.sid)}&select=sid`, { headers: headers() }).then(r => r.json() as Promise<any[]>), 1500);
    const isNew = !Array.isArray(exists) || exists.length === 0;
    await timeout(
      fetch(`${url()}/rest/v1/chat_sessions${isNew ? '' : `?sid=eq.${encodeURIComponent(s.sid)}`}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: headers({ Prefer: 'return=minimal' }),
        body: JSON.stringify(isNew ? { ...row, first_page: s.page || null } : row),
      }),
      1500
    );
  } catch (e) {
    console.error('[log] session failed', e);
  }
}

export async function linkLead(sid: string, leadId: string): Promise<void> {
  if (!loggingEnabled() || !sid) return;
  try {
    await timeout(
      fetch(`${url()}/rest/v1/chat_sessions?sid=eq.${encodeURIComponent(sid)}`, {
        method: 'PATCH',
        headers: headers({ Prefer: 'return=minimal' }),
        body: JSON.stringify({ lead_id: leadId, updated_at: new Date().toISOString() }),
      }),
      1500
    );
  } catch (e) {
    console.error('[log] link lead failed', e);
  }
}

export interface EventLog { sid?: string; name: string; variant?: string; page?: string; meta?: Record<string, unknown> }

export async function logEvents(list: EventLog[]): Promise<void> {
  if (!loggingEnabled() || list.length === 0) return;
  try {
    await timeout(
      fetch(`${url()}/rest/v1/chat_events`, {
        method: 'POST',
        headers: headers({ Prefer: 'return=minimal' }),
        body: JSON.stringify(list.map(e => ({ sid: e.sid || null, name: e.name, variant: e.variant || null, page_type: e.page || null, meta: e.meta || {} }))),
      }),
      1500
    );
  } catch (e) {
    console.error('[log] events failed', e);
  }
}

// ---------- photo upload abuse: 3 rejected pictures within 24 h block the address from uploading for 24 h.
// Addresses are stored only as a salted hash. Falls back to memory when the database is not reachable.
const DAY = 24 * 60 * 60 * 1000;
const memBans = new Map<string, { strikes: number; last: number; until: number }>();

export async function checkBan(hash: string): Promise<boolean> {
  const mem = memBans.get(hash);
  if (mem && mem.until > Date.now()) return true;
  if (!loggingEnabled()) return false;
  try {
    const rows: any = await timeout(fetch(`${url()}/rest/v1/chat_bans?ip_hash=eq.${hash}&select=banned_until`, { headers: headers() }).then(r => r.json()), 1500);
    const until = Array.isArray(rows) && rows[0]?.banned_until ? Date.parse(rows[0].banned_until) : 0;
    return until > Date.now();
  } catch {
    return false;
  }
}

/** Records one rejected upload; returns true when this strike started a ban. */
export async function addStrike(hash: string): Promise<boolean> {
  const now = Date.now();
  const prev = memBans.get(hash);
  let strikes = prev && now - prev.last < DAY ? prev.strikes + 1 : 1;
  try {
    if (loggingEnabled()) {
      const rows: any = await timeout(fetch(`${url()}/rest/v1/chat_bans?ip_hash=eq.${hash}&select=strikes,last_strike`, { headers: headers() }).then(r => r.json()), 1500);
      const row = Array.isArray(rows) ? rows[0] : null;
      if (row && now - Date.parse(row.last_strike) < DAY) strikes = Math.max(strikes, Number(row.strikes) + 1);
      const banned = strikes >= 3;
      await timeout(
        fetch(`${url()}/rest/v1/chat_bans`, {
          method: 'POST',
          headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
          body: JSON.stringify({ ip_hash: hash, strikes, last_strike: new Date(now).toISOString(), banned_until: banned ? new Date(now + DAY).toISOString() : null }),
        }),
        1500
      );
    }
  } catch (e) {
    console.error('[log] strike failed', e);
  }
  const banned = strikes >= 3;
  memBans.set(hash, { strikes, last: now, until: banned ? now + DAY : 0 });
  return banned;
}
