import { env, rateLimit, clientIp, checkHuman } from './_lib/core.js';
import { runChat, shouldOfferForm, type ChatMsg, type PageCtx } from './_lib/ai.js';

// First answers to the one-tap page questions ("canned" chips) do not depend on the visitor, so they are computed once and replayed:
// popular pages then cost no model call at all.
const CACHE_TTL_MS = 20 * 60 * 1000;
const CACHE_MAX = 300;
const replyCache = new Map<string, { at: number; events: Record<string, unknown>[] }>();
function cacheGet(key: string) {
  const hit = replyCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) { replyCache.delete(key); return null; }
  return hit.events;
}
function cacheSet(key: string, events: Record<string, unknown>[]) {
  if (replyCache.size >= CACHE_MAX) replyCache.delete(replyCache.keys().next().value as string);
  replyCache.set(key, { at: Date.now(), events });
}

const PAGE_TYPES = new Set(['home', 'catalog', 'category', 'product', 'projects', 'project', 'solutions', 'configurator', 'blog', 'contact', 'about']);
const safeId = (v: unknown, n = 80) => String(v ?? '').replace(/[^\w\-.]/g, '').slice(0, n);

// POST /api/chat  { messages: [{role, content}], lang: 'az' | 'ru' | 'en' }
// Server-sent events: text | products | consultation | reset | error | done
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const raw: unknown[] = Array.isArray(body.messages) ? body.messages : [];
  const history: ChatMsg[] = raw
    .map((m: any) => {
      const role = m?.role === 'assistant' ? 'assistant' : 'user';
      let content = String(m?.content ?? '').slice(0, 1500);
      // cards the customer saw are invisible in the text; tell the model so "1-ci məhsul" / "the first one" resolves
      if (role === 'assistant' && Array.isArray(m?.shown) && m.shown.length) {
        const list = m.shown.slice(0, 3).map((p: any, i: number) => `${i + 1}) ${String(p?.name ?? '').slice(0, 120)} (${safeId(p?.code, 20)})`).join('; ');
        content += `\n[Product cards shown to the customer: ${list}]`;
      }
      return { role, content } as ChatMsg;
    })
    .filter(m => m.content.trim())
    .slice(-30);
  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Last message must come from the user.' });
  }
  const lang: 'az' | 'ru' = body.lang === 'ru' ? 'ru' : 'az';
  const pageType = String(body.page?.type ?? '');
  const page: PageCtx | undefined = PAGE_TYPES.has(pageType) ? { type: pageType, id: safeId(body.page?.id) || undefined } : undefined;
  const canned = safeId(body.canned, 40);

  // lean context: the model gets the last 10 messages; older customer messages shrink to a short memory so nothing is forgotten
  const recent = history.slice(-10);
  // the opening messages usually hold the key facts (space, size), so they are kept first, then the most recent older ones
  const older = history.slice(0, -10).filter(m => m.role === 'user');
  const memory = [...older.slice(0, 2), ...older.slice(2).slice(-4)]
    .map(m => `- ${m.content.replace(/\s+/g, ' ').slice(0, 200)}`)
    .join('\n');

  const ip = clientIp(req);
  if (!rateLimit(`chat-burst:${ip}`, 10, 60 * 1000) || !rateLimit(`chat:${ip}`, 40, 10 * 60 * 1000) || !rateLimit(`chat-day:${ip}`, 300, 24 * 60 * 60 * 1000)) {
    return res.status(429).json({ error: 'rate_limit' });
  }
  const human = await checkHuman(body, ip);
  if (!human.ok) return res.status(403).json({ error: 'captcha' });

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  res.status(200);
  const send = (evt: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(evt)}\n\n`);
    (res as any).flush?.();
  };

  if (!env('AI_API_KEY') && !env('GROQ_API_KEY')) {
    send({ type: 'error', code: 'not_configured' });
    return res.end();
  }
  if (human.pass) send({ type: 'pass', token: human.pass });

  const cacheKey = canned && history.length === 1 ? `${lang}|${page?.type || ''}|${page?.id || ''}|${canned}` : '';
  const cached = cacheKey ? cacheGet(cacheKey) : null;
  if (cached) {
    for (const evt of cached) send(evt);
    send({ type: 'done', model: 'cache' });
    return res.end();
  }
  const recorded: Record<string, unknown>[] = [];

  let formShown = false;
  let textLen = 0;
  const tracked = (evt: Record<string, unknown>) => {
    if (evt.type === 'consultation') formShown = true;
    if (evt.type === 'text') textLen += String(evt.delta || '').length;
    if (evt.type === 'reset') { formShown = false; textLen = 0; recorded.length = 0; }
    if (cacheKey && (evt.type === 'text' || evt.type === 'products' || evt.type === 'consultation')) recorded.push(evt);
    send(evt);
  };
  try {
    const { model } = await runChat(recent, lang, tracked, undefined, memory, page);
    if (!formShown && shouldOfferForm(history)) {
      if (textLen < 40) {
        const line = lang === 'ru'
          ? 'Оставьте, пожалуйста, имя и номер в форме ниже, и наш консультант свяжется с вами.'
          : 'Zəhmət olmasa, aşağıdakı formada adınızı və nömrənizi yazın, satış məsləhətçimiz sizinlə əlaqə saxlasın.';
        send({ type: 'text', delta: (textLen ? ' ' : '') + line });
      }
      send({ type: 'consultation', summary: history.filter(m => m.role === 'user').slice(-2).map(m => m.content).join(' ').slice(0, 400) });
    }
    if (cacheKey && recorded.length && !formShown) cacheSet(cacheKey, recorded);
    send({ type: 'done', model });
  } catch (e: any) {
    console.error('[chat] failed:', e?.message || e);
    send({ type: 'error', code: e?.message === 'rate_limited' ? 'busy' : 'unavailable' });
  }
  res.end();
}
