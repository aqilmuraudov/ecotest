import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { env } from './core.js';

/**
 * AI assistant configuration: providers (base URL + API key), and which model plays which role.
 *   fast      first-choice models, tried in order
 *   thinking  used first for long or complex conversations (optional)
 *   fallback  safety net when everything above fails or is rate limited
 *   vision    picture analysis
 *   summary   short summaries for the sales team (optional; defaults to the first fast model)
 *
 * Stored in Supabase (ai_settings), edited in the admin panel (/api/admin-ai). API keys are encrypted with AES-256-GCM before
 * they reach the database; the master key (AI_SECRETS_KEY) exists only in Vercel. Until something is saved in the admin panel
 * everything runs from the environment variables exactly as before, and an environment key is also the fallback for a provider
 * that has no key in the database.
 */
export interface ProviderCfg { id: string; label: string; baseUrl: string; enabled: boolean }
export interface ModelRef { provider: string; model: string; effort?: string; extra?: Record<string, unknown>; timeoutMs?: number }
export type RoleName = 'fast' | 'thinking' | 'fallback' | 'vision' | 'summary';
export interface AiConfig { providers: ProviderCfg[]; roles: Record<RoleName, ModelRef[]> }

export const ROLE_NAMES: RoleName[] = ['fast', 'thinking', 'fallback', 'vision', 'summary'];
export const EFFORTS = ['', 'none', 'minimal', 'low', 'medium', 'high'];
/** Environment variables a provider may fall back to (a fixed list: the client can never name an arbitrary variable). */
export const ENV_FALLBACK: Record<string, string[]> = { groq: ['GROQ_API_KEY'], clean: ['CLEAN_API_KEY', 'VISION_API_KEY'], gonka: ['AI_API_KEY'] };
const DEFAULT_TIMEOUT: Record<string, number> = { groq: 10000, clean: 15000, gonka: 22000 };

const trimSlash = (s: string) => s.replace(/\/+$/, '');
const sbUrl = () => env('VITE_SUPABASE_URL');
const sbKey = () => env('SUPABASE_SERVICE_ROLE_KEY');
const hdr = (extra: Record<string, string> = {}) => ({
  apikey: sbKey(),
  ...(sbKey().startsWith('eyJ') ? { Authorization: `Bearer ${sbKey()}` } : {}),
  'Content-Type': 'application/json',
  ...extra,
});
export const dbReady = () => !!(sbUrl() && sbKey());

// ------------------------------------------------------------------ defaults (the environment, exactly as the chat worked before)
export function defaultConfig(): AiConfig {
  const cleanBase = trimSlash(env('CLEAN_BASE_URL') || env('VISION_BASE_URL') || 'https://cleanapis.com/v1');
  const providers: ProviderCfg[] = [
    { id: 'groq', label: 'Groq', baseUrl: trimSlash(env('GROQ_BASE_URL', 'https://api.groq.com/openai/v1')), enabled: true },
    { id: 'clean', label: 'CleanAPIs', baseUrl: cleanBase, enabled: true },
    { id: 'gonka', label: 'Gonka', baseUrl: trimSlash(env('AI_BASE_URL', 'https://api.gonkarouter.io/v1')), enabled: true },
  ];
  const groq: ModelRef[] = [
    { provider: 'groq', model: env('GROQ_MODEL', 'qwen/qwen3.8-27b'), effort: /qwen/i.test(env('GROQ_MODEL', 'qwen/qwen3.8-27b')) ? 'none' : 'low' },
    { provider: 'groq', model: env('GROQ_MODEL_2', 'openai/gpt-oss-120b'), effort: 'low' },
  ];
  const mode = env('CLEAN_CHAT').toLowerCase();
  const clean: ModelRef[] = mode === 'on' || mode === 'first'
    ? [env('CLEAN_CHAT_MODEL', 'gpt-5.6-luna'), env('CLEAN_CHAT_MODEL_2', 'glm-5.3')].map(model => ({ provider: 'clean', model, effort: env('CLEAN_CHAT_EFFORT', 'minimal') }))
    : [];
  const effortLight = env('AI_EFFORT_LIGHT', 'low');
  return {
    providers,
    roles: {
      fast: mode === 'first' ? [...clean, ...groq] : groq,
      thinking: [],
      fallback: [
        ...(mode === 'on' ? clean : []),
        { provider: 'gonka', model: env('AI_MODEL_LIGHT', 'zai-org/GLM-5.3-Flash'), effort: effortLight },
        { provider: 'gonka', model: env('AI_MODEL_FALLBACK', 'deepseek-ai/DeepSeek-V4-Flash-0731'), effort: effortLight },
        { provider: 'gonka', model: env('AI_MODEL_THINK', 'MiniMaxAI/MiniMax-M2.7'), effort: env('AI_EFFORT_THINK', 'medium') },
      ],
      vision: env('VISION_MODEL') ? [{ provider: 'clean', model: env('VISION_MODEL'), effort: env('VISION_EFFORT') || '' }] : [],
      summary: [],
    },
  };
}

// ------------------------------------------------------------------ secrets (AES-256-GCM, master key only in Vercel)
export const secretsReady = () => env('AI_SECRETS_KEY').length >= 24;
const masterKey = () => createHash('sha256').update(`ecolife-ai-secrets-v1|${env('AI_SECRETS_KEY')}`).digest();

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', masterKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return `v1:${Buffer.concat([iv, cipher.getAuthTag(), enc]).toString('base64')}`;
}

export function decryptSecret(stored: string): string | null {
  try {
    if (!stored.startsWith('v1:')) return null;
    const raw = Buffer.from(stored.slice(3), 'base64');
    const d = createDecipheriv('aes-256-gcm', masterKey(), raw.subarray(0, 12));
    d.setAuthTag(raw.subarray(12, 28));
    return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString('utf8');
  } catch {
    return null; // wrong master key or damaged value: treated as "no key"
  }
}

// ------------------------------------------------------------------ runtime (cached 30 s per server instance)
export interface SecretMeta { last4: string; updatedAt: string; updatedBy: string | null }
export interface AiRuntime { cfg: AiConfig; source: 'db' | 'env'; version: number; keys: Map<string, string>; meta: Map<string, SecretMeta>; dbError?: string }
let cache: { at: number; rt: AiRuntime } | null = null;
const TTL = 30_000;

export function clearAiCache() { cache = null; }

async function loadRuntime(): Promise<AiRuntime> {
  const base: AiRuntime = { cfg: defaultConfig(), source: 'env', version: 0, keys: new Map(), meta: new Map() };
  if (!dbReady()) return base;
  try {
    const [s, k] = await Promise.all([
      fetch(`${sbUrl()}/rest/v1/ai_settings?id=eq.main&select=config,version`, { headers: hdr(), signal: AbortSignal.timeout(4000) }).then(r => r.json()),
      fetch(`${sbUrl()}/rest/v1/ai_secrets?select=name,ciphertext,last4,updated_at,updated_by`, { headers: hdr(), signal: AbortSignal.timeout(4000) }).then(r => r.json()),
    ]);
    // a failed read used to look exactly like "nothing saved yet"; keep the reason so the panel can show it
    if (!Array.isArray(s)) base.dbError = `ai_settings oxunmadı: ${String((s as any)?.message || (s as any)?.error || 'naməlum cavab').slice(0, 160)}`;
    else if (!Array.isArray(k)) base.dbError = `ai_secrets oxunmadı: ${String((k as any)?.message || (k as any)?.error || 'naməlum cavab').slice(0, 160)}`;
    const row = Array.isArray(s) ? s[0] : null;
    if (row?.config?.providers && row?.config?.roles) {
      base.cfg = { providers: row.config.providers, roles: { ...defaultConfig().roles, ...row.config.roles } };
      base.source = 'db';
      base.version = Number(row.version) || 1;
    }
    if (Array.isArray(k)) {
      for (const r of k) {
        base.meta.set(String(r.name), { last4: String(r.last4 || ''), updatedAt: String(r.updated_at || ''), updatedBy: r.updated_by || null });
        if (secretsReady()) {
          const plain = decryptSecret(String(r.ciphertext));
          if (plain) base.keys.set(String(r.name), plain);
        }
      }
    }
  } catch (e) {
    console.error('[aiconfig] load failed, using the previous or the environment configuration', e);
    if (cache?.rt) return cache.rt;
    base.dbError = `Baza ilə əlaqə alınmadı: ${String((e as any)?.message || e).slice(0, 120)}`;
    return base;
  }
  return base;
}

export async function getAiRuntime(force = false): Promise<AiRuntime> {
  if (!force && cache && Date.now() - cache.at < TTL) return cache.rt;
  const rt = await loadRuntime();
  cache = { at: Date.now(), rt };
  return rt;
}

/** The key a provider uses: the encrypted one from the database, otherwise the environment variable of the default providers. */
export function resolveKey(rt: AiRuntime, providerId: string): { key: string; source: 'db' | 'env' } | null {
  const db = rt.keys.get(`provider:${providerId}`);
  if (db) return { key: db, source: 'db' };
  for (const name of ENV_FALLBACK[providerId] || []) if (env(name)) return { key: env(name), source: 'env' };
  return null;
}

export interface AiTarget { label: string; base: string; key: string; model: string; effort?: string; extra?: Record<string, unknown>; firstByteMs: number }

export function toTarget(rt: AiRuntime, ref: ModelRef): AiTarget | null {
  const p = rt.cfg.providers.find(x => x.id === ref.provider && x.enabled);
  const k = p ? resolveKey(rt, p.id) : null;
  if (!p || !k || !ref.model) return null;
  return { label: p.id, base: trimSlash(p.baseUrl), key: k.key, model: ref.model, effort: ref.effort || undefined, extra: ref.extra, firstByteMs: ref.timeoutMs || DEFAULT_TIMEOUT[p.id] || 15000 };
}

export const roleTargets = (rt: AiRuntime, role: RoleName): AiTarget[] => rt.cfg.roles[role].map(r => toTarget(rt, r)).filter(Boolean) as AiTarget[];

// ------------------------------------------------------------------ validation (the admin API never stores anything that does not pass)
const HOST_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

export function validBaseUrl(u: string): string | null {
  try {
    const url = new URL(u);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return 'Base URL https:// ilə başlamalı, port və istifadəçi adı olmamalıdır';
    const h = url.hostname.toLowerCase();
    if (!HOST_RE.test(h) || /^\d+(\.\d+){3}$/.test(h) || h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return 'Base URL ictimai domen olmalıdır (IP və daxili ünvanlar qadağandır)';
    if (u.length > 200) return 'Base URL çox uzundur';
    return null;
  } catch {
    return 'Base URL düzgün deyil';
  }
}

export function validateConfig(input: any): { ok: true; cfg: AiConfig } | { ok: false; error: string } {
  if (!input || !Array.isArray(input.providers) || typeof input.roles !== 'object') return { ok: false, error: 'Konfiqurasiya formatı səhvdir' };
  if (input.providers.length < 1 || input.providers.length > 8) return { ok: false, error: 'Provayder sayı 1 ilə 8 arasında olmalıdır' };
  const providers: ProviderCfg[] = [];
  for (const p of input.providers) {
    const id = String(p?.id || '');
    if (!/^[a-z0-9_-]{2,24}$/.test(id)) return { ok: false, error: `Provayder adı (id) səhvdir: ${id}` };
    if (providers.some(x => x.id === id)) return { ok: false, error: `Provayder təkrarlanır: ${id}` };
    const bad = validBaseUrl(String(p?.baseUrl || ''));
    if (bad) return { ok: false, error: `${id}: ${bad}` };
    providers.push({ id, label: String(p?.label || id).slice(0, 40), baseUrl: trimSlash(String(p.baseUrl)), enabled: p?.enabled !== false });
  }
  const roles = {} as Record<RoleName, ModelRef[]>;
  for (const r of ROLE_NAMES) {
    const list: any[] = Array.isArray(input.roles[r]) ? input.roles[r] : [];
    if (list.length > 6) return { ok: false, error: `${r}: ən çox 6 model` };
    roles[r] = [];
    for (const m of list) {
      const provider = String(m?.provider || '');
      const model = String(m?.model || '').trim();
      if (!providers.some(p => p.id === provider)) return { ok: false, error: `${r}: naməlum provayder "${provider}"` };
      if (!/^[\w.\-:/@+]{1,100}$/.test(model)) return { ok: false, error: `${r}: model adı düzgün deyil` };
      const effort = String(m?.effort || '');
      if (!EFFORTS.includes(effort)) return { ok: false, error: `${r}: reasoning effort səhvdir` };
      let extra: Record<string, unknown> | undefined;
      if (m?.extra && typeof m.extra === 'object' && !Array.isArray(m.extra)) {
        if (JSON.stringify(m.extra).length > 400) return { ok: false, error: `${r}: əlavə parametrlər çox uzundur` };
        // parameters that would change who pays or what is sent are not allowed here
        if (['model', 'messages', 'stream', 'tools', 'tool_choice', 'max_tokens'].some(k => k in m.extra)) return { ok: false, error: `${r}: bu əlavə parametr qadağandır` };
        extra = m.extra;
      }
      const timeoutMs = Number(m?.timeoutMs);
      roles[r].push({ provider, model, ...(effort ? { effort } : {}), ...(extra ? { extra } : {}), ...(timeoutMs >= 3000 && timeoutMs <= 55000 ? { timeoutMs: Math.round(timeoutMs) } : {}) });
    }
  }
  return { ok: true, cfg: { providers, roles } };
}

// ------------------------------------------------------------------ persistence (used by /api/admin-ai)
/** A Supabase REST failure turned into a readable message (status + the database's own explanation, never any key). */
async function failure(what: string, r: Response): Promise<Error> {
  const body: any = await r.json().catch(() => ({}));
  return new Error(`${what}: HTTP ${r.status}${body?.message ? ` - ${String(body.message).slice(0, 160)}` : ''}${body?.hint ? ` (${String(body.hint).slice(0, 100)})` : ''}`);
}

export async function saveConfig(cfg: AiConfig, by: string, note: string): Promise<number> {
  const cur = await fetch(`${sbUrl()}/rest/v1/ai_settings?id=eq.main&select=version`, { headers: hdr(), signal: AbortSignal.timeout(8000) });
  if (!cur.ok) throw await failure('Cari versiya oxunmadı', cur);
  const current: any = await cur.json().catch(() => []);
  const version = (Array.isArray(current) && current[0]?.version ? Number(current[0].version) : 0) + 1;
  const row = { id: 'main', config: cfg, version, updated_at: new Date().toISOString(), updated_by: by };
  const r = await fetch(`${sbUrl()}/rest/v1/ai_settings?on_conflict=id`, { method: 'POST', headers: hdr({ Prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify(row), signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw await failure('Konfiqurasiya yazılmadı', r);
  // read it back: only report success when the database really holds the new version
  const back = await fetch(`${sbUrl()}/rest/v1/ai_settings?id=eq.main&select=version`, { headers: hdr(), signal: AbortSignal.timeout(8000) }).then(x => x.json()).catch(() => null);
  if (!Array.isArray(back) || Number(back[0]?.version) !== version) throw new Error('Konfiqurasiya yazıldı kimi göründü, amma bazadan geri oxunmadı');
  await addHistory(by, version, cfg, note);
  clearAiCache();
  return version;
}

export async function addHistory(by: string, version: number | null, cfg: AiConfig | null, note: string) {
  try {
    const r = await fetch(`${sbUrl()}/rest/v1/ai_settings_history`, { method: 'POST', headers: hdr({ Prefer: 'return=minimal' }), body: JSON.stringify({ by, version, config: cfg, note: note.slice(0, 300) }), signal: AbortSignal.timeout(8000) });
    if (!r.ok) console.error('[aiconfig] history not written', r.status);
  } catch (e) {
    console.error('[aiconfig] history not written', e);
  }
}

export async function listHistory(): Promise<{ id: number; at: string; by: string | null; version: number | null; note: string | null; hasConfig: boolean }[]> {
  const r: any = await fetch(`${sbUrl()}/rest/v1/ai_settings_history?select=id,at,by,version,note,config&order=id.desc&limit=25`, { headers: hdr() }).then(x => x.json()).catch(() => []);
  return Array.isArray(r) ? r.map((x: any) => ({ id: x.id, at: x.at, by: x.by, version: x.version, note: x.note, hasConfig: !!x.config })) : [];
}

export async function historyConfig(id: number): Promise<AiConfig | null> {
  const r: any = await fetch(`${sbUrl()}/rest/v1/ai_settings_history?id=eq.${Number(id)}&select=config`, { headers: hdr() }).then(x => x.json()).catch(() => []);
  return Array.isArray(r) && r[0]?.config ? r[0].config : null;
}

export async function putSecret(name: string, plain: string, by: string): Promise<void> {
  const row = { name, ciphertext: encryptSecret(plain), last4: plain.slice(-4), updated_at: new Date().toISOString(), updated_by: by };
  const r = await fetch(`${sbUrl()}/rest/v1/ai_secrets?on_conflict=name`, { method: 'POST', headers: hdr({ Prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify(row), signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw await failure('Açar yazılmadı', r);
  clearAiCache();
}

export async function removeSecret(name: string): Promise<void> {
  const r = await fetch(`${sbUrl()}/rest/v1/ai_secrets?name=eq.${encodeURIComponent(name)}`, { method: 'DELETE', headers: hdr({ Prefer: 'return=minimal' }), signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw await failure('Açar silinmədi', r);
  clearAiCache();
}
