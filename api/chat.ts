import { env, rateLimit, clientIp } from './_lib/core.js';
import { runChat, type ChatMsg } from './_lib/ai.js';

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
    .map((m: any) => ({ role: m?.role === 'assistant' ? 'assistant' : 'user', content: String(m?.content ?? '').slice(0, 1500) }) as ChatMsg)
    .filter(m => m.content.trim())
    .slice(-16);
  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Last message must come from the user.' });
  }
  const lang: 'az' | 'ru' = body.lang === 'ru' ? 'ru' : 'az';

  if (!rateLimit(`chat:${clientIp(req)}`, 40, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many messages. Please try again in a few minutes.' });
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  res.status(200);
  const send = (evt: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(evt)}\n\n`);
    (res as any).flush?.();
  };

  if (!env('AI_API_KEY')) {
    send({ type: 'error', code: 'not_configured' });
    return res.end();
  }

  try {
    const { model } = await runChat(history, lang, send);
    send({ type: 'done', model });
  } catch (e: any) {
    console.error('[chat] failed:', e?.message || e);
    send({ type: 'error', code: 'unavailable' });
  }
  res.end();
}
