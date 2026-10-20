import { env, rateLimit, clientIp, checkHuman } from './_lib/core.js';

// GET  /api/vision -> { enabled }  (the chat shows the camera button only when this is true)
// POST /api/vision { image: dataURL (jpeg/png/webp, already downscaled by the browser), lang, pass|cfToken }
//   -> { summary }  a short description of the room for the lighting consultant. The photo is never stored or logged.
//
// Configure with: VISION_API_KEY, VISION_MODEL and (for non-OpenAI providers) VISION_BASE_URL. Any OpenAI-compatible vision model works.
const enabled = () => !!(env('VISION_API_KEY') && env('VISION_MODEL'));

const PROMPT = `You are helping a lighting consultant. Look at this photo of a room and describe it in at most 90 words of plain text (no markdown, no lists):
room type, approximate size (small / medium / large and a rough area in m2 only if it can be judged), ceiling (height impression and type: plasterboard, suspended, wooden, concrete, beams), existing lighting, wall and floor colours (light or dark), windows and natural light, style, furniture layout, and any installation constraint you can see.
Describe only what is visible. If the picture is not an interior or a room, answer exactly: NOT_A_ROOM`;

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') return res.status(200).json({ enabled: enabled() });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!enabled()) return res.status(503).json({ error: 'not_configured' });

  const ip = clientIp(req);
  if (!rateLimit(`vision:${ip}`, 4, 10 * 60 * 1000) || !rateLimit(`vision-day:${ip}`, 20, 24 * 60 * 60 * 1000)) {
    return res.status(429).json({ error: 'rate_limit' });
  }
  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body || {};
  const human = await checkHuman(body, ip);
  if (!human.ok) return res.status(403).json({ error: 'captcha' });

  const image = String(body.image || '');
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(image);
  if (!m || image.length > 1_300_000) return res.status(400).json({ error: 'bad_image' });
  // the first bytes must really be an image of the declared type (not a renamed file)
  const head = Buffer.from(m[2].slice(0, 16), 'base64');
  const ok = m[1] === 'jpeg' ? head[0] === 0xff && head[1] === 0xd8 : m[1] === 'png' ? head[0] === 0x89 && head[1] === 0x50 : head.slice(0, 4).toString() === 'RIFF';
  if (!ok) return res.status(400).json({ error: 'bad_image' });

  const base = env('VISION_BASE_URL', 'https://api.openai.com/v1').replace(/\/+$/, '');
  try {
    const r = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env('VISION_API_KEY')}` },
      body: JSON.stringify({
        model: env('VISION_MODEL'),
        temperature: 0.2,
        max_tokens: 300,
        messages: [{ role: 'user', content: [{ type: 'text', text: PROMPT }, { type: 'image_url', image_url: { url: image } }] }],
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!r.ok) {
      console.error('[vision] provider status', r.status);
      return res.status(502).json({ error: 'unavailable' });
    }
    const j: any = await r.json();
    const text = String(j.choices?.[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').replace(/\s+/g, ' ').trim();
    if (!text) return res.status(502).json({ error: 'unavailable' });
    if (/NOT_A_ROOM/i.test(text)) return res.status(422).json({ error: 'not_room' });
    return res.status(200).json({ summary: text.slice(0, 900) });
  } catch (e: any) {
    console.error('[vision] failed', e?.message || e);
    return res.status(502).json({ error: 'unavailable' });
  }
}

function safeJson(s: string) {
  try { return JSON.parse(s || '{}'); } catch { return {}; }
}
