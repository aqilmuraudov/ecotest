import { rateLimit, clientIp } from './_lib/core.js';
import { logEvents, type EventLog } from './_lib/log.js';

// POST /api/track { sid, variant, page, events: [{ name, meta? }] }: funnel events for the A/B test and the admin panel. No personal data.
const NAMES = new Set(['nudge_shown', 'nudge_click', 'nudge_dismiss', 'chat_open', 'chip_click', 'first_message', 'calc_used', 'shortlist_add', 'lead_open', 'lead_submit', 'photo_used', 'voice_used']);
const id = (v: unknown, n = 40) => String(v ?? '').replace(/[^\w\-.]/g, '').slice(0, n);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!rateLimit(`track:${clientIp(req)}`, 120, 10 * 60 * 1000)) return res.status(204).end();
  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body || {};
  const sid = id(body.sid);
  const variant = body.variant === 'B' ? 'B' : 'A';
  const page = id(body.page, 20);
  const list: EventLog[] = (Array.isArray(body.events) ? body.events : [])
    .slice(0, 8)
    .filter((e: any) => NAMES.has(String(e?.name)))
    .map((e: any) => ({
      sid,
      name: String(e.name),
      variant,
      page,
      meta: typeof e.meta === 'object' && e.meta && JSON.stringify(e.meta).length <= 300 ? e.meta : {},
    }));
  await logEvents(list);
  return res.status(204).end();
}

function safeJson(s: string) {
  try { return JSON.parse(s || '{}'); } catch { return {}; }
}
