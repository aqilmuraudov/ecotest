import { env, rateLimit, clientIp } from './_lib/core.js';
import { visionPrompt } from './_lib/visionPrompt.js';
import {
  dbReady, ENV_FALLBACK, getAiRuntime, historyConfig, listHistory, putSecret, removeSecret, resolveKey, saveConfig, addHistory,
  secretsReady, validateConfig, validBaseUrl,
} from './_lib/aiconfig.js';

// Admin API for the "AI Assistent" panel. Only a logged-in master admin (admin_users.role = 'admin') may use it.
//   GET                          -> current configuration, key status (never the keys), history
//   POST { action: 'save', config, note }
//   POST { action: 'set_key', provider, key }      encrypts the key (AES-256-GCM) and stores the ciphertext
//   POST { action: 'delete_key', provider }
//   POST { action: 'test', provider, baseUrl, key?, model, effort?, extra?, tools? }   one small chat request, measured
//   POST { action: 'test_vision', provider, baseUrl, key?, model, effort?, extra? }    one picture request on a sample photo
//   POST { action: 'models', provider, baseUrl, key? }                                  lists the models of a provider
//   POST { action: 'revert', id }                                                       restores a configuration from the history

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=896&q=75';

async function whoAmI(token: string): Promise<{ role: string | null; email: string }> {
  const url = env('VITE_SUPABASE_URL');
  const anon = env('VITE_SUPABASE_ANON_KEY');
  if (!url || !anon || !token) return { role: null, email: '' };
  try {
    const [rows, user]: any[] = await Promise.all([
      fetch(`${url}/rest/v1/admin_users?select=role&limit=1`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } }).then(r => (r.ok ? r.json() : [])),
      fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } }).then(r => (r.ok ? r.json() : {})),
    ]);
    return { role: Array.isArray(rows) && rows[0]?.role ? String(rows[0].role) : null, email: String(user?.email || '') };
  } catch {
    return { role: null, email: '' };
  }
}

const trimSlash = (s: string) => s.replace(/\/+$/, '');
const cleanKey = (k: unknown) => String(k ?? '').trim();

/** One small, timed chat request (streaming, like the real chat). */
async function probe(base: string, key: string, model: string, effort: string, extra: any, tools: boolean) {
  const t0 = Date.now();
  const body: any = {
    model,
    stream: true,
    temperature: 0.3,
    max_tokens: 700,
    ...(effort ? { reasoning_effort: effort } : {}),
    ...(extra && typeof extra === 'object' && JSON.stringify(extra).length <= 400 ? extra : {}),
    messages: tools
      ? [{ role: 'user', content: 'Call the function ping with message "salam".' }]
      : [{ role: 'system', content: 'Answer in Azerbaijani with one short sentence.' }, { role: 'user', content: 'Salam, necəsiniz?' }],
    ...(tools ? { tools: [{ type: 'function', function: { name: 'ping', description: 'Test function', parameters: { type: 'object', properties: { message: { type: 'string' } } } } }], tool_choice: 'auto' } : {}),
  };
  try {
    const r = await fetch(`${base}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(body), signal: AbortSignal.timeout(40000) });
    if (!r.ok || !r.body) {
      const detail = (await r.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200);
      return { ok: false, status: r.status, error: detail || `HTTP ${r.status}`, totalMs: Date.now() - t0 };
    }
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    let text = '';
    let ttfb: number | null = null;
    let toolCalls = 0;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const line of lines) {
        const l = line.trim();
        if (!l.startsWith('data:') || l.slice(5).trim() === '[DONE]') continue;
        try {
          const d = JSON.parse(l.slice(5)).choices?.[0]?.delta;
          if (typeof d?.content === 'string' && d.content) { if (ttfb === null) ttfb = Date.now() - t0; text += d.content; }
          if (Array.isArray(d?.tool_calls) && d.tool_calls.length) { if (ttfb === null) ttfb = Date.now() - t0; toolCalls += 1; }
        } catch { /* ignore partial chunks */ }
      }
    }
    const clean = text.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/\s+/g, ' ').trim();
    return { ok: !!clean || toolCalls > 0, status: r.status, ttfbMs: ttfb, totalMs: Date.now() - t0, text: clean.slice(0, 200), toolCalls, error: clean || toolCalls ? undefined : 'Boş cavab (model fikirləşməyə bütün tokeni sərf edə bilər: effort-u azaldın)' };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e).slice(0, 160), totalMs: Date.now() - t0 };
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (!rateLimit(`adminai:${clientIp(req)}`, 90, 60 * 1000)) return res.status(429).json({ error: 'rate_limit' });
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const me = await whoAmI(token);
  if (me.role !== 'admin') return res.status(me.role ? 403 : 401).json({ error: me.role ? 'Yalnız baş admin' : 'Unauthorized' });
  if (!dbReady()) return res.status(503).json({ error: 'SUPABASE_SERVICE_ROLE_KEY Vercel-də yoxdur' });
  const by = me.email || 'admin';

  if (req.method === 'GET') {
    const rt = await getAiRuntime(true);
    const providers = rt.cfg.providers.map(p => {
      const db = rt.meta.get(`provider:${p.id}`);
      const k = resolveKey(rt, p.id);
      const envName = (ENV_FALLBACK[p.id] || []).find(n => env(n));
      return {
        id: p.id,
        keySource: k ? k.source : 'none',
        last4: k ? k.key.slice(-4) : '',
        updatedAt: db?.updatedAt || null,
        updatedBy: db?.updatedBy || null,
        envName: envName || null,
        dbKeyUnreadable: !!db && !rt.keys.has(`provider:${p.id}`), // stored, but the master key does not open it
      };
    });
    return res.status(200).json({ config: rt.cfg, source: rt.source, version: rt.version, providers, secretsReady: secretsReady(), history: await listHistory(), me: by, dbError: rt.dbError || null });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body || {};
  const action = String(body.action || '');

  try {
    if (action === 'save') {
      const v = validateConfig(body.config);
      if ('error' in v) return res.status(400).json({ error: v.error });
      const version = await saveConfig(v.cfg, by, String(body.note || 'Konfiqurasiya yeniləndi'));
      return res.status(200).json({ ok: true, version });
    }

    if (action === 'set_key' || action === 'delete_key') {
      const provider = String(body.provider || '');
      if (!/^[a-z0-9_-]{2,24}$/.test(provider)) return res.status(400).json({ error: 'Provayder adı səhvdir' });
      if (action === 'delete_key') {
        await removeSecret(`provider:${provider}`);
        await addHistory(by, null, null, `${provider}: DB-dəki açar silindi`);
        return res.status(200).json({ ok: true });
      }
      if (!secretsReady()) return res.status(400).json({ error: 'AI_SECRETS_KEY Vercel-də yoxdur (ən azı 24 simvol). Əvvəl onu əlavə edib Redeploy edin.' });
      const key = cleanKey(body.key);
      if (key.length < 8 || key.length > 400 || /\s/.test(key)) return res.status(400).json({ error: 'Açar 8-400 simvol olmalı və boşluq içərməməlidir' });
      await putSecret(`provider:${provider}`, key, by);
      await addHistory(by, null, null, `${provider}: açar yeniləndi (••••${key.slice(-4)})`);
      return res.status(200).json({ ok: true, last4: key.slice(-4) });
    }

    if (action === 'test' || action === 'test_vision' || action === 'models') {
      const provider = String(body.provider || '');
      const bad = validBaseUrl(String(body.baseUrl || ''));
      if (bad) return res.status(400).json({ error: bad });
      const base = trimSlash(String(body.baseUrl));
      const rt = await getAiRuntime();
      // a key typed in the panel can be tried before it is saved; otherwise the stored (or environment) key is used
      const key = cleanKey(body.key) || resolveKey(rt, provider)?.key || '';
      if (!key) return res.status(400).json({ error: 'Bu provayder üçün açar yoxdur' });

      if (action === 'models') {
        const r = await fetch(`${base}/models`, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15000) });
        const j: any = await r.json().catch(() => ({}));
        if (!r.ok) return res.status(200).json({ ok: false, error: String(j?.error?.message || `HTTP ${r.status}`).slice(0, 160) });
        return res.status(200).json({ ok: true, models: (j.data || []).map((m: any) => String(m.id)).slice(0, 300) });
      }

      const model = String(body.model || '');
      if (!/^[\w.\-:/@+]{1,100}$/.test(model)) return res.status(400).json({ error: 'Model adı səhvdir' });
      const effort = String(body.effort || '');

      if (action === 'test') return res.status(200).json(await probe(base, key, model, effort, body.extra, body.tools === true));

      // vision: a public interior photo, the same prompt the site uses
      const t0 = Date.now();
      try {
        const img = await fetch(SAMPLE_IMAGE, { signal: AbortSignal.timeout(15000) });
        const dataUrl = `data:image/jpeg;base64,${Buffer.from(await img.arrayBuffer()).toString('base64')}`;
        const r = await fetch(`${base}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model, temperature: 0.1, max_tokens: 1200,
            ...(effort ? { reasoning_effort: effort } : {}),
            ...(body.extra && JSON.stringify(body.extra).length <= 400 ? body.extra : {}),
            messages: [{ role: 'user', content: [{ type: 'text', text: visionPrompt('az') }, { type: 'image_url', image_url: { url: dataUrl } }] }],
          }),
          signal: AbortSignal.timeout(55000),
        });
        const j: any = await r.json().catch(() => ({}));
        const text = String(j.choices?.[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').replace(/\s+/g, ' ').trim();
        return res.status(200).json({ ok: r.ok && !!text, status: r.status, totalMs: Date.now() - t0, text: text.slice(0, 400), tokens: j.usage ? (j.usage.prompt_tokens || 0) + (j.usage.completion_tokens || 0) : null, error: r.ok ? (text ? undefined : 'Boş cavab') : String(j?.error?.message || `HTTP ${r.status}`).slice(0, 160) });
      } catch (e: any) {
        return res.status(200).json({ ok: false, error: String(e?.message || e).slice(0, 160), totalMs: Date.now() - t0 });
      }
    }

    if (action === 'revert') {
      const cfg = await historyConfig(Number(body.id));
      if (!cfg) return res.status(404).json({ error: 'Bu versiyada konfiqurasiya yoxdur (yalnız açar dəyişiklikləri bərpa olunmur)' });
      const v = validateConfig(cfg);
      if ('error' in v) return res.status(400).json({ error: v.error });
      const version = await saveConfig(v.cfg, by, `Bərpa: tarixçə #${Number(body.id)}`);
      return res.status(200).json({ ok: true, version });
    }
  } catch (e: any) {
    console.error('[admin-ai]', action, e?.message || e);
    // this endpoint is for the master admin only, and the message carries just the database's own explanation, never a key
    return res.status(500).json({ error: `Server xətası: ${String(e?.message || e).slice(0, 220)}` });
  }
  return res.status(400).json({ error: 'Naməlum əməliyyat' });
}

function safeJson(s: string) {
  try { return JSON.parse(s || '{}'); } catch { return {}; }
}
