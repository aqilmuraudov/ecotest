import { createHash } from 'node:crypto';
import { env, rateLimit, clientIp, checkHuman } from './_lib/core.js';
import { addStrike, checkBan } from './_lib/log.js';
import { visionPrompt } from './_lib/visionPrompt.js';
import { getAiRuntime, roleTargets, type AiTarget } from './_lib/aiconfig.js';

// GET  /api/vision -> { enabled }  (the chat shows the photo button only when this is true)
// POST /api/vision { image: dataURL (jpeg/png/webp, already downscaled by the browser), lang, pass|cfToken }
//   -> { summary }  a short description of the space for the lighting consultant. The photo is never stored or logged.
//
// Which model does the work is set in the admin panel (AI Assistent -> Vision) or, until then, by VISION_API_KEY / VISION_MODEL /
// VISION_BASE_URL / VISION_EFFORT. Models of the vision role are tried in order.
//
// Only pictures that belong on a lighting website are accepted (rooms, buildings, plans, lighting products, the Ecolife site).
// People, nudity, violence, documents and unrelated pictures are rejected, and 3 rejections in 24 h block the address from uploading for 24 h.

const ipHash = (ip: string) => createHash('sha256').update(`${ip}|${env('SUPABASE_SERVICE_ROLE_KEY').slice(-12) || 'ecolife'}`).digest('hex').slice(0, 32);

type Outcome =
  | { kind: 'ok'; summary: string }
  | { kind: 'reject'; reason: 'people' | 'nsfw' | 'unrelated' }
  | { kind: 'fail'; status?: number; reason?: string; finish?: string | null };

async function askVision(t: AiTarget, image: string, lang: 'az' | 'ru'): Promise<Outcome> {
  try {
    const r = await fetch(`${t.base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t.key}` },
      body: JSON.stringify({
        model: t.model,
        temperature: 0.1,
        max_tokens: 1200, // reasoning models spend part of the budget thinking before the visible answer
        ...(t.effort ? { reasoning_effort: t.effort } : {}),
        ...(t.extra || {}),
        messages: [{ role: 'user', content: [{ type: 'text', text: visionPrompt(lang) }, { type: 'image_url', image_url: { url: image } }] }],
      }),
      signal: AbortSignal.timeout(Math.max(t.firstByteMs, 45000)),
    });
    if (!r.ok) {
      const detail = (await r.text().catch(() => '')).slice(0, 300);
      console.error('[vision] provider status', r.status, detail);
      // the provider's own safety filter refusing a picture counts as a rejection
      if (r.status === 400 && /(content[_ -]?(policy|filter)|safety|moderat|inappropriate|violat)/i.test(detail)) return { kind: 'reject', reason: 'nsfw' };
      return { kind: 'fail', status: r.status };
    }
    const j: any = await r.json();
    const text = String(j.choices?.[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').replace(/\s+/g, ' ').trim();
    if (!text) {
      console.error('[vision] empty answer', JSON.stringify(j).slice(0, 300));
      return { kind: 'fail', reason: 'empty_answer', finish: j.choices?.[0]?.finish_reason || null };
    }
    const rej = /REJECT:\s*(PEOPLE|NSFW|UNRELATED)/i.exec(text) || (/NOT_A_ROOM/i.test(text) ? [null, 'UNRELATED'] : null);
    if (rej) return { kind: 'reject', reason: String(rej[1]).toLowerCase() as 'people' | 'nsfw' | 'unrelated' };
    const okText = /OK:\s*([\s\S]+)/i.exec(text)?.[1] || text;
    return { kind: 'ok', summary: okText.trim().slice(0, 900) };
  } catch (e: any) {
    console.error('[vision] failed', e?.message || e);
    return { kind: 'fail' };
  }
}

export default async function handler(req: any, res: any) {
  const rt = await getAiRuntime();
  const targets = roleTargets(rt, 'vision');
  if (req.method === 'GET') return res.status(200).json({ enabled: targets.length > 0 });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (targets.length === 0) return res.status(503).json({ error: 'not_configured' });

  const ip = clientIp(req);
  const hash = ipHash(ip);
  if (await checkBan(hash)) return res.status(403).json({ error: 'banned' });
  // 2 pictures per minute, 4 per 10 minutes, 20 per day
  if (!rateLimit(`vision-min:${ip}`, 2, 60 * 1000) || !rateLimit(`vision:${ip}`, 4, 10 * 60 * 1000) || !rateLimit(`vision-day:${ip}`, 20, 24 * 60 * 60 * 1000)) {
    return res.status(429).json({ error: 'rate_limit' });
  }
  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body || {};
  const human = await checkHuman(body, ip);
  if (!human.ok) return res.status(403).json({ error: 'captcha' });

  const image = String(body.image || '');
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(image);
  // the browser already downscaled the picture; 2 MB of base64 is far more than it ever sends
  if (!m || image.length > 2_000_000) return res.status(400).json({ error: 'bad_image' });
  // the first bytes must really be an image of the declared type (not a renamed file)
  const head = Buffer.from(m[2].slice(0, 16), 'base64');
  const ok = m[1] === 'jpeg' ? head[0] === 0xff && head[1] === 0xd8 : m[1] === 'png' ? head[0] === 0x89 && head[1] === 0x50 : head.slice(0, 4).toString() === 'RIFF';
  if (!ok) return res.status(400).json({ error: 'bad_image' });

  const lang = body.lang === 'ru' ? 'ru' : 'az';
  let last: Outcome = { kind: 'fail' };
  for (const t of targets.slice(0, 3)) {
    last = await askVision(t, image, lang);
    if (last.kind === 'ok') return res.status(200).json({ summary: last.summary });
    if (last.kind === 'reject') {
      const banned = await addStrike(hash);
      return res.status(422).json({ error: 'rejected', reason: last.reason, banned });
    }
  }
  return res.status(502).json({ error: 'unavailable', provider_status: last.kind === 'fail' ? last.status : undefined, reason: last.kind === 'fail' ? last.reason : undefined, finish: last.kind === 'fail' ? last.finish : undefined });
}

function safeJson(s: string) {
  try { return JSON.parse(s || '{}'); } catch { return {}; }
}
