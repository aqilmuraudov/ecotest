import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  AlertTriangle, ArrowDown, ArrowUp, Bot, CheckCircle2, ChevronDown, FlaskConical, History, KeyRound, Loader2, Plus, RotateCcw, Save, Settings2, ShieldCheck, Trash2, X,
} from 'lucide-react';
import { ROLE_REASONING_TIPS, adjustEffort, reasoningSpec } from './reasoning';

/**
 * Admin panel: AI Assistent. Providers (base URL + API key), which model plays which role, live tests, history and a short
 * security guide. API keys are sent over HTTPS to /api/admin-ai, encrypted there (AES-256-GCM) and never sent back to the browser.
 */
interface ProviderCfg { id: string; label: string; baseUrl: string; enabled: boolean }
interface ModelRef { provider: string; model: string; effort?: string; extra?: Record<string, unknown>; timeoutMs?: number }
type RoleName = 'fast' | 'thinking' | 'fallback' | 'vision' | 'summary';
interface AiConfig { providers: ProviderCfg[]; roles: Record<RoleName, ModelRef[]> }
interface ProviderStatus { id: string; keySource: 'db' | 'env' | 'none'; last4: string; updatedAt: string | null; updatedBy: string | null; envName: string | null; dbKeyUnreadable: boolean }
interface HistoryRow { id: number; at: string; by: string | null; version: number | null; note: string | null; hasConfig: boolean }
interface State { config: AiConfig; source: 'db' | 'env'; version: number; providers: ProviderStatus[]; secretsReady: boolean; history: HistoryRow[]; me: string; dbError?: string | null }
interface TestResult { ok: boolean; ttfbMs?: number | null; totalMs?: number; text?: string; toolCalls?: number; error?: string; tokens?: number | null; status?: number }

const ROLES: { id: RoleName; title: string; help: string }[] = [
  { id: 'fast', title: 'Sürətli modellər (əsas)', help: 'Hər söhbətdə yuxarıdan aşağı yoxlanılır: ilk cavab verən istifadə olunur. Müştəri gözləməməsi üçün ən sürətli modelləri burada saxlayın.' },
  { id: 'thinking', title: 'Düşünən modellər', help: 'Uzun və ya mürəkkəb söhbətlərdə (4 və daha çox mesaj, uzun sual) əvvəl bunlar yoxlanılır. Boş saxlasanız, bütün söhbətlərdə yalnız sürətli modellər işləyir.' },
  { id: 'fallback', title: 'Ehtiyat modellər', help: 'Yuxarıdakı modellər xəta verəndə, limitə düşəndə və ya cavab verməyəndə avtomatik keçilir.' },
  { id: 'vision', title: 'Vision (şəkil analizi)', help: 'Müştərinin otaq şəklini yoxlayan və təsvir edən model (şəkil qəbul etməlidir). Boş olsa, şəkil düyməsi saytda görünmür.' },
  { id: 'summary', title: 'Xülasə modeli', help: 'Satış komandasına gedən qısa xülasə. Boş olsa, ilk sürətli model istifadə olunur.' },
];
const PRESETS: Record<string, { label: string; baseUrl: string; limits: string; models: string[] }> = {
  groq: { label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', limits: 'Pulsuz plan çox kiçikdir (təxminən 30 sorğu/dəq, ~8K token/dəq). Developer (pullu) planda limitlər xeyli yüksəkdir, dəqiq rəqəmləri groq.com-da yoxlayın.', models: ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'] },
  clean: { label: 'CleanAPIs', baseUrl: 'https://cleanapis.com/v1', limits: 'Plana görə: Free 80 sorğu/dəq (100K token/dəq), Starter 120 (200K), Basic 300 (500K), Pro 600 (1M), Scale 1 200 (2M), Unlimited 3 000 (5M). Gündəlik limit yoxdur; aylıq token + balans. Limit aşılsa 429, balans bitsə 402 qaytarır.', models: ['gpt-5.6-luna', 'glm-5.3', 'seed-2.1-turbo', 'gemini-3.7-flash', 'qwen3.8-27b', 'qwen3.8-max', 'deepseek-v4-flash-0731', 'kimi-k3'] },
  gonka: { label: 'Gonka', baseUrl: 'https://api.gonkarouter.io/v1', limits: 'Rəsmi limit açıq göstərilmir; sınaqda yavaş idi (3-8 s), ona görə ehtiyat üçün saxlanılır.', models: ['zai-org/GLM-5.3-Flash', 'deepseek-ai/DeepSeek-V4-Flash-0731', 'MiniMaxAI/MiniMax-M2.7'] },
  custom: { label: 'Başqa (OpenAI uyğun)', baseUrl: 'https://', limits: 'Provayderin /chat/completions (OpenAI formatı) dəstəkləməsi lazımdır. Limitləri onun saytında yoxlayın.', models: [] },
};

const input = 'w-full bg-[#0D0E14] border border-white/10 focus:border-[#FFD21A]/60 outline-none rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600';
const btn = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors disabled:opacity-40';
const btnGhost = `${btn} bg-[#0D0E14] border-white/10 text-gray-300 hover:text-white hover:border-white/25`;
const btnGold = `${btn} bg-[#FFD21A] border-[#FFD21A] text-black hover:bg-[#ffe050]`;
const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-');

async function api(method: 'GET' | 'POST', body?: unknown): Promise<any> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sessiya bitib, yenidən daxil olun');
  const res = await fetch('/api/admin-ai', { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : undefined });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
  return j;
}

export const AiSettingsTab: React.FC = () => {
  const [state, setState] = useState<State | null>(null);
  const [draft, setDraft] = useState<AiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [keyForm, setKeyForm] = useState<{ provider: string; value: string; busy: boolean; msg: string } | null>(null);
  const [tests, setTests] = useState<Record<string, TestResult | 'busy'>>({});
  const [models, setModels] = useState<Record<string, string[]>>({});
  const [advanced, setAdvanced] = useState<Record<string, boolean>>({});
  const [guideOpen, setGuideOpen] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const s: State = await api('GET');
      setState(s);
      setDraft(JSON.parse(JSON.stringify(s.config)));
    } catch (e: any) {
      setError(e.message || 'Yüklənmədi');
    }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const dirty = useMemo(() => !!state && !!draft && JSON.stringify(state.config) !== JSON.stringify(draft), [state, draft]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const statusOf = (id: string) => state?.providers.find(p => p.id === id);

  const flash = (m: string) => { setNotice(m); window.setTimeout(() => setNotice(''), 4000); };

  // ---------------------------------------------------------------- draft helpers
  const patchProvider = (id: string, patch: Partial<ProviderCfg>) => setDraft(d => d && { ...d, providers: d.providers.map(p => (p.id === id ? { ...p, ...patch } : p)) });
  const addProvider = (preset: string) => setDraft(d => {
    if (!d) return d;
    let id = preset;
    for (let i = 2; d.providers.some(p => p.id === id); i++) id = `${preset}${i}`;
    return { ...d, providers: [...d.providers, { id, label: PRESETS[preset].label, baseUrl: PRESETS[preset].baseUrl, enabled: true }] };
  });
  const removeProvider = (id: string) => setDraft(d => d && {
    providers: d.providers.filter(p => p.id !== id),
    roles: Object.fromEntries(Object.entries(d.roles).map(([r, list]) => [r, (list as ModelRef[]).filter(m => m.provider !== id)])) as AiConfig['roles'],
  });
  // adjust = re-check the reasoning level against what the (new) model supports; done when the model field is left, not on every keystroke
  const patchModel = (role: RoleName, i: number, patch: Partial<ModelRef>, adjust = false) => setDraft(d => d && {
    ...d,
    roles: {
      ...d.roles,
      [role]: d.roles[role].map((m, k) => {
        if (k !== i) return m;
        const n = { ...m, ...patch };
        if (adjust) n.effort = adjustEffort(reasoningSpec(n.provider, n.model), n.effort);
        return n;
      }),
    },
  });
  const addModel = (role: RoleName) => setDraft(d => d && { ...d, roles: { ...d.roles, [role]: [...d.roles[role], { provider: d.providers[0]?.id || '', model: '', effort: '' }] } });
  const removeModel = (role: RoleName, i: number) => setDraft(d => d && { ...d, roles: { ...d.roles, [role]: d.roles[role].filter((_, k) => k !== i) } });
  const moveModel = (role: RoleName, i: number, dir: -1 | 1) => setDraft(d => {
    if (!d) return d;
    const list = [...d.roles[role]];
    const j = i + dir;
    if (j < 0 || j >= list.length) return d;
    [list[i], list[j]] = [list[j], list[i]];
    return { ...d, roles: { ...d.roles, [role]: list } };
  });
  const applyRecommended = () => setDraft(d => {
    if (!d) return d;
    const has = (id: string) => d.providers.some(p => p.id === id);
    const m = (provider: string, model: string, effort = ''): ModelRef => ({ provider, model, effort });
    return {
      ...d,
      roles: {
        fast: [has('groq') && m('groq', 'qwen/qwen3.8-27b', 'none'), has('groq') && m('groq', 'openai/gpt-oss-120b', 'low')].filter(Boolean) as ModelRef[],
        thinking: [],
        fallback: [has('clean') && m('clean', 'gpt-5.6-luna', 'minimal'), has('clean') && m('clean', 'glm-5.3', 'minimal'), has('gonka') && m('gonka', 'zai-org/GLM-5.3-Flash', 'low')].filter(Boolean) as ModelRef[],
        vision: [has('clean') && m('clean', 'gemini-3.7-flash', 'minimal'), has('clean') && m('clean', 'gpt-5.6-luna', 'minimal')].filter(Boolean) as ModelRef[],
        summary: [has('clean') && m('clean', 'gpt-5.6-luna', 'minimal')].filter(Boolean) as ModelRef[],
      },
    };
  });

  // ---------------------------------------------------------------- actions
  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError('');
    try {
      const r = await api('POST', { action: 'save', config: draft, note: 'Admin paneldən dəyişiklik' });
      flash(`Saxlanıldı (versiya ${r.version}). Dəyişiklik 30 saniyə ərzində saytda aktiv olur.`);
      await load();
    } catch (e: any) {
      setError(e.message);
    }
    setSaving(false);
  };

  const runTest = async (role: RoleName, i: number, tools = false) => {
    if (!draft) return;
    const m = draft.roles[role][i];
    const p = draft.providers.find(x => x.id === m.provider);
    if (!p) return;
    const k = `${role}:${i}${tools ? ':tools' : ''}`;
    setTests(t => ({ ...t, [k]: 'busy' }));
    try {
      const r: TestResult = await api('POST', { action: role === 'vision' ? 'test_vision' : 'test', provider: p.id, baseUrl: p.baseUrl, model: m.model, effort: m.effort || '', extra: m.extra, tools });
      setTests(t => ({ ...t, [k]: r }));
    } catch (e: any) {
      setTests(t => ({ ...t, [k]: { ok: false, error: e.message } }));
    }
  };

  const loadModels = async (p: ProviderCfg, key?: string) => {
    try {
      const r = await api('POST', { action: 'models', provider: p.id, baseUrl: p.baseUrl, key });
      if (r.ok) { setModels(m => ({ ...m, [p.id]: r.models })); return r.models.length as number; }
      throw new Error(r.error || 'Alınmadı');
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  const saveKey = async () => {
    if (!keyForm) return;
    setKeyForm({ ...keyForm, busy: true, msg: '' });
    try {
      await api('POST', { action: 'set_key', provider: keyForm.provider, key: keyForm.value.trim() });
      setKeyForm(null);
      flash('Açar şifrələnib saxlanıldı. Köhnə açarı provayderin panelindən ləğv etməyi unutmayın.');
      await load();
    } catch (e: any) {
      setKeyForm(f => f && { ...f, busy: false, msg: e.message });
    }
  };

  const testKey = async (p: ProviderCfg) => {
    if (!keyForm) return;
    setKeyForm({ ...keyForm, busy: true, msg: '' });
    try {
      const n = await loadModels(p, keyForm.value.trim());
      setKeyForm(f => f && { ...f, busy: false, msg: `Açar işləyir (${n} model görünür). İndi "Açarı saxla" düyməsinə basın.` });
    } catch (e: any) {
      setKeyForm(f => f && { ...f, busy: false, msg: `Açar işləmədi: ${e.message}` });
    }
  };

  const deleteKey = async (id: string) => {
    if (!window.confirm('Bazadakı şifrəli açar silinsin? (Vercel env-də ehtiyat açar varsa, o istifadə olunacaq.)')) return;
    try { await api('POST', { action: 'delete_key', provider: id }); flash('Açar silindi'); await load(); } catch (e: any) { setError(e.message); }
  };

  const revert = async (h: HistoryRow) => {
    if (!window.confirm(`#${h.id} versiyasındakı konfiqurasiya bərpa olunsun? (Açarlar dəyişmir.)`)) return;
    try { const r = await api('POST', { action: 'revert', id: h.id }); flash(`Bərpa olundu (versiya ${r.version})`); await load(); } catch (e: any) { setError(e.message); }
  };

  // ---------------------------------------------------------------- derived: what will actually run
  const chainText = (role: RoleName[]) => {
    if (!draft) return '';
    const names = role.flatMap(r => draft.roles[r]).map(m => {
      const p = draft.providers.find(x => x.id === m.provider);
      const k = statusOf(m.provider);
      const ok = p?.enabled && k && k.keySource !== 'none';
      return `${ok ? '' : '⚠ '}${m.provider}/${m.model || '?'}`;
    });
    return names.join(' → ') || '(boş)';
  };

  if (loading && !state) return <div className="p-10 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  if (!state || !draft) return <div className="bg-[#12131A] border border-red-500/30 rounded-2xl p-6 text-sm text-red-300">{error || 'Yüklənmədi'}<button className={`${btnGhost} ml-3`} onClick={() => void load()}>Yenidən cəhd</button></div>;

  const testView = (k: string) => {
    const r = tests[k];
    if (!r) return null;
    if (r === 'busy') return <span className="text-xs text-gray-400 inline-flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> yoxlanılır…</span>;
    return (
      <span className={`text-xs ${r.ok ? 'text-emerald-400' : 'text-red-400'}`}>
        {r.ok ? '✓' : '✗'} {r.ttfbMs != null ? `ilk cavab ${(r.ttfbMs / 1000).toFixed(1)} s · ` : ''}{r.totalMs != null ? `cəmi ${(r.totalMs / 1000).toFixed(1)} s` : ''}
        {r.toolCalls !== undefined ? ` · alət çağırışı ${r.toolCalls ? '✓' : '✗'}` : ''}{r.tokens ? ` · ${r.tokens} token` : ''}
        {r.text ? <span className="text-gray-400"> · “{r.text.slice(0, 120)}”</span> : null}
        {r.error ? <span> · {r.error}</span> : null}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------ header */}
      <div className="bg-[#12131A] rounded-2xl border border-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Bot className="w-5 h-5 text-[#FFD21A]" /> AI Assistent</h2>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">Modelləri, ehtiyatları, vision-u və açarları burada idarə edin. Saxlayandan sonra dəyişiklik <b className="text-gray-200">30 saniyə ərzində</b> saytda aktiv olur, redeploy lazım deyil.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className={btnGhost} onClick={applyRecommended} title="Test nəticələrinə əsasən tövsiyə olunan rollar (saxlamadan əvvəl baxa bilərsiniz)"><Settings2 className="w-3.5 h-3.5" /> Tövsiyə olunan quraşdırma</button>
            <button className={btnGhost} disabled={!dirty} onClick={() => setDraft(JSON.parse(JSON.stringify(state.config)))}><X className="w-3.5 h-3.5" /> Ləğv et</button>
            <button className={btnGold} disabled={!dirty || saving} onClick={() => void save()}>{saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Saxla</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 text-[11px]">
          <span className={`px-2.5 py-1 rounded-full border ${state.source === 'db' ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10' : 'border-amber-500/30 text-amber-300 bg-amber-500/10'}`}>
            {state.source === 'db' ? `Konfiqurasiya: Supabase (versiya ${state.version})` : 'Konfiqurasiya: hələ saxlanılmayıb, Vercel env-dən işləyir'}
          </span>
          <span className={`px-2.5 py-1 rounded-full border ${state.secretsReady ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10' : 'border-red-500/30 text-red-300 bg-red-500/10'}`}>
            Açar şifrələmə (AI_SECRETS_KEY): {state.secretsReady ? 'hazırdır' : 'Vercel-də yoxdur'}
          </span>
          {dirty && <span className="px-2.5 py-1 rounded-full border border-[#FFD21A]/40 text-[#FFD21A] bg-[#FFD21A]/10">Saxlanılmamış dəyişiklik var</span>}
        </div>
        {state.dbError && <p className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/25 rounded-lg p-3 flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> Bazadan oxuma xətası, buna görə ayarlar saxlanmış kimi görünmür: {state.dbError}</p>}
        {error && <p className="mt-4 text-sm text-red-300 flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</p>}
        {notice && <p className="mt-4 text-sm text-emerald-300 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {notice}</p>}
        {!state.secretsReady && (
          <p className="mt-4 text-sm text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            Açarları bu paneldən saxlamaq üçün Vercel-də <code className="text-amber-100">AI_SECRETS_KEY</code> dəyişəni lazımdır (təsadüfi 32+ simvol), sonra Redeploy. Aşağıdakı "Təhlükəsizlik və dəyişiklik təlimatı" bölməsində addımlar var. Bu olmadan açarlar Vercel env-dən oxunmaqda davam edir.
          </p>
        )}
      </div>

      {/* ------------------------------------------------------------ providers */}
      <div className="bg-[#12131A] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><KeyRound className="w-4 h-4 text-[#FFD21A]" /> Provayderlər və açarlar</h3>
            <p className="text-xs text-gray-500 mt-1">Hər provayderin ünvanı (base URL) və açarı. Açarlar brauzerə geri qaytarılmır, yalnız son 4 simvol görünür.</p>
          </div>
          <select className="bg-[#0D0E14] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300" value="" onChange={e => { if (e.target.value) addProvider(e.target.value); }}>
            <option value="">+ Provayder əlavə et…</option>
            {Object.entries(PRESETS).map(([id, p]) => <option key={id} value={id}>{p.label}</option>)}
          </select>
        </div>
        <div className="divide-y divide-white/5">
          {draft.providers.map(p => {
            const st = statusOf(p.id);
            const preset = PRESETS[p.id.replace(/\d+$/, '')] || PRESETS.custom;
            const editing = keyForm?.provider === p.id;
            return (
              <div key={p.id} className="p-5 space-y-3">
                <div className="grid md:grid-cols-[160px_1fr_auto_auto] gap-3 items-center">
                  <input className={input} value={p.label} onChange={e => patchProvider(p.id, { label: e.target.value })} aria-label="Ad" />
                  <input className={input} value={p.baseUrl} onChange={e => patchProvider(p.id, { baseUrl: e.target.value })} placeholder="https://api.provider.com/v1" aria-label="Base URL" />
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer"><input type="checkbox" checked={p.enabled} onChange={e => patchProvider(p.id, { enabled: e.target.checked })} className="accent-[#FFD21A]" /> Aktiv</label>
                  <button className={`${btnGhost} text-red-300`} onClick={() => removeProvider(p.id)} aria-label="Sil"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-mono text-gray-500">id: {p.id}</span>
                  {st?.keySource === 'db' && <span className="text-emerald-300">Açar: ••••{st.last4} · şifrəli saxlanıb · {fmt(st.updatedAt)}{st.updatedBy ? ` · ${st.updatedBy}` : ''}</span>}
                  {st?.keySource === 'env' && <span className="text-sky-300">Açar: ••••{st.last4} · Vercel env ({st.envName}), ehtiyat mənbə</span>}
                  {(!st || st.keySource === 'none') && <span className="text-amber-300 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Açar yoxdur{!state.providers.some(x => x.id === p.id) ? ' (əvvəl "Saxla" düyməsinə basın, sonra açar yazın)' : ''}</span>}
                  {st?.dbKeyUnreadable && <span className="text-red-300">Bazadakı açar açıla bilmir (AI_SECRETS_KEY dəyişib?), yenisini yazın</span>}
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{preset.limits}</p>
                <div className="flex flex-wrap gap-2">
                  <button className={btnGhost} disabled={!state.secretsReady || !state.providers.some(x => x.id === p.id)} onClick={() => setKeyForm({ provider: p.id, value: '', busy: false, msg: '' })} title={!state.secretsReady ? 'Əvvəl AI_SECRETS_KEY əlavə edin' : ''}><KeyRound className="w-3.5 h-3.5" /> Açarı dəyiş</button>
                  {st?.keySource === 'db' && <button className={`${btnGhost} text-red-300`} onClick={() => void deleteKey(p.id)}>Bazadakı açarı sil</button>}
                  <button className={btnGhost} onClick={() => void loadModels(p).then(n => flash(`${p.label}: ${n} model yükləndi (aşağıdakı model sahələrində təklif kimi görünür)`)).catch(e => setError(`${p.label}: ${e.message}`))}>Modelləri yüklə</button>
                </div>
                {editing && keyForm && (
                  <div className="bg-[#0D0E14] border border-white/10 rounded-xl p-4 space-y-3">
                    <input type="password" autoComplete="new-password" spellCheck={false} className={input} placeholder="Yeni API açarı (burada yazılır, söhbətə və ya e-poçta yazmayın)" value={keyForm.value} onChange={e => setKeyForm({ ...keyForm, value: e.target.value, msg: '' })} />
                    <div className="flex flex-wrap items-center gap-2">
                      <button className={btnGhost} disabled={keyForm.busy || keyForm.value.trim().length < 8} onClick={() => void testKey(p)}>{keyForm.busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5" />} Əvvəl yoxla</button>
                      <button className={btnGold} disabled={keyForm.busy || keyForm.value.trim().length < 8} onClick={() => void saveKey()}>Açarı saxla</button>
                      <button className={btnGhost} onClick={() => setKeyForm(null)}>Ləğv et</button>
                    </div>
                    {keyForm.msg && <p className={`text-xs ${keyForm.msg.startsWith('Açar işləyir') ? 'text-emerald-300' : 'text-red-300'}`}>{keyForm.msg}</p>}
                    <p className="text-[11px] text-gray-500">Açar HTTPS ilə serverə gedir, orada AES-256-GCM ilə şifrələnir və yalnız şifrəli halda bazaya yazılır. Saxladıqdan sonra bu sahə təmizlənir.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------ reasoning guide */}
      <div className="bg-[#12131A] rounded-2xl border border-white/5 overflow-hidden">
        <button className="w-full p-5 flex items-center justify-between text-left" onClick={() => setReasoningOpen(v => !v)}>
          <span className="text-sm font-bold text-white">Reasoning (düşünmə dərinliyi) nədir? Hansını seçməli?</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${reasoningOpen ? 'rotate-180' : ''}`} />
        </button>
        {reasoningOpen && (
          <div className="px-5 pb-6 space-y-4 text-xs text-gray-400 leading-relaxed">
            <p>Bəzi modellər cavab verməzdən əvvəl "içində düşünür". Bu cavabı dəqiqləşdirir, amma <b className="text-gray-200">gecikməni və xərci artırır</b>. Söhbət botu üçün sürət vacibdir, ona görə adətən ən aşağı səviyyə seçilir. Hər model üçün yalnız onun qəbul etdiyi seçimlər göstərilir; yanlış dəyər provayderdə xəta yaradır və söhbət növbəti modelə keçir.</p>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
              <p><b className="text-gray-200">Göndərmə:</b> parametr yoxdur, model defoltu ilə işləyir.</p>
              <p><b className="text-gray-200">none:</b> düşünmür. Ən sürətli.</p>
              <p><b className="text-gray-200">minimal:</b> çox qısa düşünür. Söhbət üçün tövsiyə.</p>
              <p><b className="text-gray-200">low:</b> yüngül düşünmə. Ehtiyat modellər üçün.</p>
              <p><b className="text-gray-200">medium:</b> orta. "Düşünən" rol üçün.</p>
              <p><b className="text-gray-200">high:</b> dərin və yavaş. Adi söhbətdə lazım deyil.</p>
            </div>
            <div className="rounded-lg border border-white/5 divide-y divide-white/5">
              {[
                ['Groq · Qwen3', 'yalnız none və ya göndərmə. Söhbət üçün none.'],
                ['Groq · GPT-OSS', 'low / medium / high (söndürmək olmur). Söhbət üçün low.'],
                ['Groq · Llama, Gemma və b.', 'reasoning yoxdur, sahə bağlıdır.'],
                ['GPT-5 / luna', 'none, minimal, low, medium, high. Söhbət üçün minimal.'],
                ['Gemini', 'minimal, low, medium, high. Söhbət və şəkil üçün minimal.'],
                ['GLM, Seed, DeepSeek, MiniMax, Kimi (şlüzlərdə)', 'şlüz səviyyəni uyğunlaşdırır; minimal/low sınaqda yaxşı işlədi. Boş cavab olarsa göndərməyin.'],
              ].map(([a, b]) => <p key={a} className="px-3 py-2"><b className="text-gray-200">{a}:</b> {b}</p>)}
            </div>
            <p>Əmin deyilsinizsə sətirdəki <b className="text-gray-200">Test</b> düyməsi ilə yoxlayın: ilk cavab vaxtı qısa və cavab boş deyilsə seçim düzgündür.</p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------ roles */}
      {ROLES.map(role => (
        <div key={role.id} className="bg-[#12131A] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="text-sm font-bold text-white">{role.title}</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-3xl leading-relaxed">{role.help}</p>
            <p className="text-xs text-[#FFD21A]/90 mt-1.5 max-w-3xl leading-relaxed">{ROLE_REASONING_TIPS[role.id]}</p>
          </div>
          <div className="divide-y divide-white/5">
            {draft.roles[role.id].length === 0 && <p className="px-5 py-4 text-xs text-gray-500">Boşdur.</p>}
            {draft.roles[role.id].map((m, i) => {
              const key = `${role.id}:${i}`;
              const listId = `models-${role.id}-${i}`;
              const p = draft.providers.find(x => x.id === m.provider);
              const spec = reasoningSpec(m.provider, m.model);
              const curEffort = m.effort || '';
              const selected = spec.options.find(o => o.v === curEffort);
              const suggestions = Array.from(new Set([...(models[m.provider] || []), ...((PRESETS[m.provider.replace(/\d+$/, '')] || PRESETS.custom).models)]));
              return (
                <div key={key} className="px-5 py-4 space-y-2.5">
                  <div className="grid md:grid-cols-[150px_1fr_230px_auto] gap-2.5 items-start">
                    <select className={input} value={m.provider} onChange={e => patchModel(role.id, i, { provider: e.target.value }, true)} aria-label="Provayder">
                      {draft.providers.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}
                    </select>
                    <>
                      <input className={input} list={listId} value={m.model} onChange={e => patchModel(role.id, i, { model: e.target.value })} onBlur={() => patchModel(role.id, i, {}, true)} placeholder="model adı (məs. gpt-5.6-luna)" aria-label="Model" />
                      <datalist id={listId}>{suggestions.map(s => <option key={s} value={s} />)}</datalist>
                    </>
                    <div>
                      <select className={`${input} ${spec.support === 'no' ? 'opacity-60' : ''}`} value={curEffort} disabled={spec.support === 'no'} onChange={e => patchModel(role.id, i, { effort: e.target.value })} aria-label="Reasoning (düşünmə dərinliyi)">
                        {!selected && <option value={curEffort}>{`⚠ ${curEffort || 'göndərmə'} (bu model üçün uyğun deyil)`}</option>}
                        {spec.options.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
                      </select>
                      <span className="block mt-1 text-[10.5px] text-gray-500">Düşünmə dərinliyi (reasoning)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className={btnGhost} onClick={() => moveModel(role.id, i, -1)} disabled={i === 0} aria-label="Yuxarı"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <button className={btnGhost} onClick={() => moveModel(role.id, i, 1)} disabled={i === draft.roles[role.id].length - 1} aria-label="Aşağı"><ArrowDown className="w-3.5 h-3.5" /></button>
                      <button className={btnGhost} onClick={() => setAdvanced(a => ({ ...a, [key]: !a[key] }))} aria-label="Əlavə"><ChevronDown className={`w-3.5 h-3.5 transition-transform ${advanced[key] ? 'rotate-180' : ''}`} /></button>
                      <button className={`${btnGhost} text-red-300`} onClick={() => removeModel(role.id, i)} aria-label="Sil"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  {m.model && (
                    <p className={`text-[11px] leading-relaxed rounded-lg px-3 py-2 border ${!selected ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-white/5 bg-white/[0.02] text-gray-400'}`}>
                      <b className="text-gray-200">{spec.family}.</b>{' '}
                      {selected && spec.support !== 'no' ? <><b className="text-gray-300">{selected.label.split(' · ')[0]}:</b> {selected.hint} </> : null}
                      {spec.note}
                      {!selected && <> <button className="underline font-semibold" onClick={() => patchModel(role.id, i, { effort: spec.fallback })}>Düzəlt</button></>}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <button className={btnGhost} disabled={!m.model || !p || tests[key] === 'busy'} onClick={() => void runTest(role.id, i)}><FlaskConical className="w-3.5 h-3.5" /> {role.id === 'vision' ? 'Test (nümunə şəkil)' : 'Test'}</button>
                    {role.id !== 'vision' && <button className={btnGhost} disabled={!m.model || !p || tests[`${key}:tools`] === 'busy'} onClick={() => void runTest(role.id, i, true)}>Alət çağırışı testi</button>}
                    {testView(key)}
                    {testView(`${key}:tools`)}
                  </div>
                  {advanced[key] && (
                    <div className="grid md:grid-cols-2 gap-3 pt-1">
                      <label className="block text-[11px] text-gray-500">Əlavə parametrlər (JSON, məs. {'{"chat_template_kwargs":{"enable_thinking":false}}'})
                        <textarea className={`${input} mt-1 font-mono text-xs h-16`} defaultValue={m.extra ? JSON.stringify(m.extra) : ''} onBlur={e => {
                          const v = e.target.value.trim();
                          if (!v) return patchModel(role.id, i, { extra: undefined });
                          try { const o = JSON.parse(v); if (o && typeof o === 'object' && !Array.isArray(o)) patchModel(role.id, i, { extra: o }); else throw new Error(); } catch { setError('Əlavə parametrlər düzgün JSON obyekti olmalıdır'); }
                        }} />
                      </label>
                      <label className="block text-[11px] text-gray-500">İlk cavab gözləmə vaxtı (ms, 3000-55000, boş = provayder defoltu)
                        <input className={`${input} mt-1`} inputMode="numeric" value={m.timeoutMs ?? ''} onChange={e => patchModel(role.id, i, { timeoutMs: Number(e.target.value.replace(/\D/g, '')) || undefined })} />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t border-white/5"><button className={btnGhost} onClick={() => addModel(role.id)}><Plus className="w-3.5 h-3.5" /> Model əlavə et</button></div>
        </div>
      ))}

      {/* ------------------------------------------------------------ chain preview */}
      <div className="bg-[#12131A] rounded-2xl border border-white/5 p-5 space-y-2">
        <h3 className="text-sm font-bold text-white">Sayt nə vaxt hansı modeli çağıracaq</h3>
        <p className="text-xs text-gray-400 leading-relaxed"><b className="text-gray-200">Adi söhbət:</b> {chainText(['fast', 'fallback'])}</p>
        <p className="text-xs text-gray-400 leading-relaxed"><b className="text-gray-200">Mürəkkəb söhbət:</b> {chainText(['thinking', 'fast', 'fallback'])}</p>
        <p className="text-xs text-gray-400 leading-relaxed"><b className="text-gray-200">Şəkil analizi:</b> {chainText(['vision'])}</p>
        <p className="text-[11px] text-gray-500">⚠ işarəsi: provayder söndürülüb və ya açarı yoxdur, bu model ötürüləcək.</p>
      </div>

      {/* ------------------------------------------------------------ security guide */}
      <div className="bg-[#12131A] rounded-2xl border border-white/5 overflow-hidden">
        <button className="w-full p-5 flex items-center justify-between text-left" onClick={() => setGuideOpen(v => !v)}>
          <span className="text-sm font-bold text-white flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Təhlükəsizlik və dəyişiklik təlimatı</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${guideOpen ? 'rotate-180' : ''}`} />
        </button>
        {guideOpen && (
          <div className="px-5 pb-6 space-y-5 text-sm text-gray-300 leading-relaxed">
            <section>
              <h4 className="font-semibold text-white mb-1">Açar haradan haraya gedir</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-400">
                <li>Siz açarı bu paneldə yazırsınız. O yalnız HTTPS ilə <code>/api/admin-ai</code> serverinə göndərilir (sorğu yalnız baş adminin giriş tokeni ilə qəbul olunur).</li>
                <li>Server onu <b className="text-gray-200">AES-256-GCM</b> ilə şifrələyir. Şifrələmə açarı (<code>AI_SECRETS_KEY</code>) yalnız Vercel-dədir.</li>
                <li>Bazaya (Supabase) yalnız şifrəli mətn yazılır. Cədvəllərə brauzerdən giriş qadağandır (heç bir public siyasət yoxdur). Baza oğurlansa belə şifrəli mətn açarsız faydasızdır.</li>
                <li>Açar brauzerə geri qayıtmır, loglara və söhbət yazışmalarına düşmür. Panel yalnız son 4 simvolu göstərir. Söhbət zamanı server açarı bir neçə saniyə yaddaşda saxlayır (30 s keş).</li>
              </ol>
            </section>
            <section>
              <h4 className="font-semibold text-white mb-1">İlk dəfə qurmaq (bir dəfəlik)</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-400">
                <li>Vercel → Settings → Environment Variables: <code>AI_SECRETS_KEY</code> = təsadüfi 32+ simvol (parol meneceri ilə yaradın, heç kimə göndərməyin). Redeploy edin.</li>
                <li>Burada hər provayder üçün "Açarı dəyiş" → açarı yazın → "Əvvəl yoxla" → "Açarı saxla".</li>
                <li>Modelləri rollara qoyun → hər sətirdə "Test" → "Saxla".</li>
                <li>Hər şey işləyəndən sonra Vercel-dəki köhnə <code>GROQ_API_KEY</code>, <code>VISION_API_KEY</code>, <code>AI_API_KEY</code> dəyişənlərini silə bilərsiniz (silməsəniz, bazada açar olmayan provayder üçün ehtiyat kimi qalır). Vercel-də qalmalı olanlar: <code>SUPABASE_SERVICE_ROLE_KEY</code>, <code>AI_SECRETS_KEY</code>, <code>TURNSTILE_*</code>, <code>TELEGRAM_*</code>.</li>
              </ol>
            </section>
            <section>
              <h4 className="font-semibold text-white mb-1">İstənilən vaxt dəyişiklik edəndə</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li><b className="text-gray-200">Model dəyişmək:</b> sətrin model sahəsini dəyişin → "Test" → "Saxla". 30 saniyədə aktiv olur, redeploy yoxdur.</li>
                <li><b className="text-gray-200">Açarı yeniləmək (rotasiya):</b> provayderin panelində yeni açar yaradın → burada "Açarı dəyiş" → "Əvvəl yoxla" → "Açarı saxla" → sayt işləyirsə, <u>köhnə açarı provayderin panelindən ləğv edin</u>.</li>
                <li><b className="text-gray-200">Açar sızıbsa:</b> dərhal provayderin panelində ləğv edin, sonra burada yenisini yazın. Panelin tarixçəsində kimin nə vaxt dəyişdiyi görünür.</li>
                <li><b className="text-gray-200">Provayderi müvəqqəti söndürmək:</b> "Aktiv" qutusunu götürüb saxlayın. Onun modelləri avtomatik ötürülür.</li>
                <li><b className="text-gray-200">Səhv etdinizsə:</b> aşağıdakı "Tarixçə"dən əvvəlki versiyanı "Bərpa et". Açarlar bərpa ilə dəyişmir.</li>
                <li><b className="text-gray-200"><code>AI_SECRETS_KEY</code>-i dəyişsəniz:</b> bazadakı bütün açarlar açılmaz olur (panel "açıla bilmir" göstərir). Onda hər açarı yenidən yazın. Bu açarı yalnız sızma şübhəsi olanda dəyişin.</li>
              </ul>
            </section>
            <section>
              <h4 className="font-semibold text-white mb-1">Qoruma qaydaları</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Yalnız <b className="text-gray-200">baş admin</b> bu bölməni aça və dəyişə bilər (moderatorlar yox).</li>
                <li>Base URL yalnız <code>https://</code> ilə ictimai domen ola bilər (IP, localhost və daxili ünvanlar rədd edilir). Açarlar yalnız göstərilən ünvana göndərilir, ona görə ünvanı yalnız etibar etdiyiniz provayderə yazın.</li>
                <li>Hər dəyişiklik tarixçəyə yazılır (açar dəyərləri yox, yalnız "açar yeniləndi, ••••1234").</li>
                <li>Limit və xəta davranışı: provayder 429/402/5xx qaytarsa, söhbət avtomatik növbəti modelə keçir.</li>
              </ul>
            </section>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------ history */}
      <div className="bg-[#12131A] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5"><h3 className="text-sm font-bold text-white flex items-center gap-2"><History className="w-4 h-4 text-[#FFD21A]" /> Tarixçə</h3></div>
        <div className="max-h-[360px] overflow-y-auto divide-y divide-white/5">
          {state.history.length === 0 && <p className="p-5 text-sm text-gray-500">Hələ dəyişiklik yoxdur.</p>}
          {state.history.map(h => (
            <div key={h.id} className="px-5 py-3 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <p className="text-gray-300 truncate">{h.note || '-'}</p>
                <p className="text-gray-500">{fmt(h.at)} · {h.by || '-'}{h.version ? ` · versiya ${h.version}` : ''}</p>
              </div>
              {h.hasConfig && <button className={btnGhost} onClick={() => void revert(h)}><RotateCcw className="w-3.5 h-3.5" /> Bərpa et</button>}
            </div>
          ))}
        </div>
      </div>

      {/* floating save bar: the page is long, the buttons at the top are out of sight while editing */}
      {(dirty || saving || error) && (
        <div className="fixed bottom-4 inset-x-4 z-40 flex justify-center pointer-events-none">
          <div className="pointer-events-auto max-w-2xl w-full flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#FFD21A]/40 bg-[#161822]/90 backdrop-blur-xl px-4 py-3 shadow-2xl text-xs text-white">
            <span className="min-w-0">
              {error ? <span className="text-red-300 flex items-start gap-1.5"><AlertTriangle className="w-4 h-4 shrink-0" /> {error}</span> : <span className="text-[#FFD21A]">Saxlanılmamış dəyişiklik var. Saxlamasanız yeniləyəndə itəcək.</span>}
            </span>
            <span className="flex items-center gap-2 shrink-0">
              {dirty && <button className={btnGhost} onClick={() => setDraft(JSON.parse(JSON.stringify(state.config)))}><X className="w-3.5 h-3.5" /> Ləğv et</button>}
              {dirty && <button className={btnGold} disabled={saving} onClick={() => void save()}>{saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Saxla</button>}
              {!dirty && error && <button className={btnGhost} onClick={() => setError('')}><X className="w-3.5 h-3.5" /> Bağla</button>}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
