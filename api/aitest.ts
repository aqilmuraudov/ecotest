import { env, rateLimit, clientIp } from './_lib/core.js';

// Temporary latency lab for the AI seller (removed after tuning). GET /api/aitest?model=light|think|fallback&variant=...
const VARIANTS: Record<string, Record<string, unknown>> = {
  base: {},
  effort_low: { reasoning_effort: 'low' },
  effort_medium: { reasoning_effort: 'medium' },
  effort_high: { reasoning_effort: 'high' },
  effort_minimal: { reasoning_effort: 'minimal' },
  effort_none: { reasoning_effort: 'none' },
  thinking_disabled: { thinking: { type: 'disabled' } },
  template_off: { chat_template_kwargs: { enable_thinking: false } },
  reasoning_off: { reasoning: { enabled: false } },
};

export default async function handler(req: any, res: any) {
  if (!rateLimit(`aitest:${clientIp(req)}`, 20, 10 * 60 * 1000)) return res.status(429).json({ error: 'rate' });
  const q = new URL(req.url, 'http://x').searchParams;
  const which = q.get('model') || 'light';
  const model = which === 'think' ? env('AI_MODEL_THINK') : which === 'fallback' ? env('AI_MODEL_FALLBACK') : env('AI_MODEL_LIGHT');
  const variant = q.get('variant') || 'base';
  const extra = VARIANTS[variant];
  if (!extra || !env('AI_API_KEY')) return res.status(400).json({ error: 'bad variant or not configured' });

  const base = env('AI_BASE_URL').replace(/\/+$/, '');
  const t0 = Date.now();
  const out: Record<string, unknown> = { model, variant };
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 55000);
    const r = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env('AI_API_KEY')}` },
      body: JSON.stringify({
        model,
        stream: true,
        max_tokens: 200,
        temperature: 0.5,
        messages: [
          { role: 'system', content: 'You are a concise Azerbaijani-speaking lighting sales consultant. Answer in 1-2 short sentences and ask one question.' },
          { role: 'user', content: 'Salam, ofisim üçün xətti işıq axtarıram.' },
        ],
        ...extra,
      }),
    });
    out.status = r.status;
    out.headersMs = Date.now() - t0;
    if (!r.ok || !r.body) {
      out.error = (await r.text()).slice(0, 300);
      clearTimeout(timer);
      return res.status(200).json(out);
    }
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = '', text = '', reasoningChunks = 0, firstContent: number | null = null, firstAny: number | null = null;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const l of lines) {
        if (!l.startsWith('data:')) continue;
        const d = l.slice(5).trim();
        if (d === '[DONE]') continue;
        let j: any;
        try { j = JSON.parse(d); } catch { continue; }
        const delta = j.choices?.[0]?.delta || {};
        if (firstAny === null) firstAny = Date.now() - t0;
        if (delta.reasoning_content || delta.reasoning) reasoningChunks++;
        if (typeof delta.content === 'string' && delta.content) {
          if (firstContent === null) firstContent = Date.now() - t0;
          text += delta.content;
        }
      }
    }
    clearTimeout(timer);
    Object.assign(out, { firstChunkMs: firstAny, firstContentMs: firstContent, totalMs: Date.now() - t0, reasoningChunks, text: text.slice(0, 300) });
  } catch (e: any) {
    out.error = String(e?.message || e).slice(0, 200);
  }
  res.status(200).json(out);
}
