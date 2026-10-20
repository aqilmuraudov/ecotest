import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Bot, RefreshCw, Trash2, X } from 'lucide-react';

interface SessionRow {
  sid: string;
  created_at: string;
  updated_at: string;
  lang: string | null;
  first_page: string | null;
  last_page: string | null;
  variant: string | null;
  msg_count: number;
  lead_id: string | null;
  transcript: { r: 'u' | 'a'; t: string; c?: string[]; ts?: string }[];
}
interface EventRow { name: string; variant: string | null; page_type: string | null; created_at: string }

const DAYS = [7, 30, 90] as const;
const pct = (a: number, b: number) => (b > 0 ? `${((a / b) * 100).toFixed(1)}%` : '-');
const fmt = (iso: string) => new Date(iso).toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export const ChatLogsTab: React.FC<{ canDelete: boolean }> = ({ canDelete }) => {
  const [days, setDays] = useState<(typeof DAYS)[number]>(30);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openSid, setOpenSid] = useState<string | null>(null);
  const [onlyLeads, setOnlyLeads] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const [s, e] = await Promise.all([
      supabase.from('chat_sessions').select('*').gte('updated_at', since).order('updated_at', { ascending: false }).limit(300),
      supabase.from('chat_events').select('name,variant,page_type,created_at').gte('created_at', since).order('created_at', { ascending: false }).limit(10000),
    ]);
    if (s.error || e.error) setError(s.error?.message || e.error?.message || 'Xəta');
    setSessions((s.data as SessionRow[]) || []);
    setEvents((e.data as EventRow[]) || []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, [days]);

  // ---- A/B funnel per variant
  const funnel = useMemo(() => {
    const out: Record<string, Record<string, number>> = { A: {}, B: {} };
    for (const ev of events) {
      const v = ev.variant === 'B' ? 'B' : 'A';
      out[v][ev.name] = (out[v][ev.name] || 0) + 1;
    }
    return out;
  }, [events]);

  const talked = sessions.filter(s => s.transcript.filter(m => m.r === 'u').length >= 1);
  const withLead = sessions.filter(s => s.lead_id);

  // ---- what people ask first
  const topQuestions = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sessions) {
      const q = s.transcript.find(m => m.r === 'u')?.t?.toLowerCase().replace(/\s+/g, ' ').trim();
      if (q && q.length > 3) map.set(q.slice(0, 80), (map.get(q.slice(0, 80)) || 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [sessions]);

  const shown = sessions.filter(s => (onlyLeads ? !!s.lead_id : true));
  const current = sessions.find(s => s.sid === openSid) || null;

  const remove = async (sid: string) => {
    if (!window.confirm('Bu söhbət silinsin?')) return;
    const { error: err } = await supabase.from('chat_sessions').delete().eq('sid', sid);
    if (err) { setError(err.message); return; }
    setOpenSid(null);
    void load();
  };

  const metric = (label: string, value: string | number, hint?: string) => (
    <div className="bg-[#0D0E14] border border-white/5 rounded-xl p-4">
      <p className="text-[11px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {hint && <p className="text-[11px] text-gray-500 mt-1">{hint}</p>}
    </div>
  );

  const rows: { label: string; key: string }[] = [
    { label: 'Təklif göstərildi', key: 'nudge_shown' },
    { label: 'Təklifə klik', key: 'nudge_click' },
    { label: 'Söhbət açıldı', key: 'chat_open' },
    { label: 'İlk mesaj', key: 'first_message' },
    { label: 'Kalkulyator', key: 'calc_used' },
    { label: 'Seçilmişlərə əlavə', key: 'shortlist_add' },
    { label: 'Form açıldı', key: 'lead_open' },
    { label: 'Sorğu göndərildi', key: 'lead_submit' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#12131A] rounded-2xl border border-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Bot className="w-5 h-5 text-[#FFD21A]" /> AI söhbətlər və A/B test</h2>
          <div className="flex items-center gap-2">
            {DAYS.map(d => (
              <button key={d} onClick={() => setDays(d)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${days === d ? 'bg-[#FFD21A] text-black border-[#FFD21A]' : 'bg-[#0D0E14] text-gray-400 border-white/5 hover:text-white'}`}>{d} gün</button>
            ))}
            <button onClick={() => void load()} className="p-2 rounded-lg bg-[#0D0E14] border border-white/5 text-gray-400 hover:text-white" aria-label="Yenilə"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">Xəta: {error}</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {metric('Söhbət', talked.length)}
          {metric('Sorğuya çevrildi', withLead.length, pct(withLead.length, talked.length))}
          {metric('Orta mesaj sayı', talked.length ? (talked.reduce((n, s) => n + s.msg_count, 0) / talked.length).toFixed(1) : '-')}
          {metric('Hesab (kalkulyator)', (funnel.A.calc_used || 0) + (funnel.B.calc_used || 0))}
        </div>
      </div>

      <div className="bg-[#12131A] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-sm font-bold text-white">Təklif mətni testi: A (sual) və B (kalkulyator)</h3>
          <p className="text-xs text-gray-500 mt-1">Hər ziyarətçiyə təsadüfi variant verilir və hər zaman eyni qalır. Nəticə üçün ən azı bir neçə yüz göstərmə gözləyin.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500 border-b border-white/5">
                <th className="px-5 py-3">Mərhələ</th><th className="px-5 py-3">A</th><th className="px-5 py-3">B</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.key} className="border-b border-white/5 text-gray-300">
                  <td className="px-5 py-2.5">{r.label}</td>
                  <td className="px-5 py-2.5 font-mono">{funnel.A[r.key] || 0}</td>
                  <td className="px-5 py-2.5 font-mono">{funnel.B[r.key] || 0}</td>
                </tr>
              ))}
              <tr className="text-white font-semibold">
                <td className="px-5 py-3">Klik nisbəti (klik / göstərmə)</td>
                <td className="px-5 py-3 font-mono">{pct(funnel.A.nudge_click || 0, funnel.A.nudge_shown || 0)}</td>
                <td className="px-5 py-3 font-mono">{pct(funnel.B.nudge_click || 0, funnel.B.nudge_shown || 0)}</td>
              </tr>
              <tr className="text-white font-semibold">
                <td className="px-5 py-3">Sorğu nisbəti (sorğu / açılan söhbət)</td>
                <td className="px-5 py-3 font-mono">{pct(funnel.A.lead_submit || 0, funnel.A.chat_open || 0)}</td>
                <td className="px-5 py-3 font-mono">{pct(funnel.B.lead_submit || 0, funnel.B.chat_open || 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#12131A] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Son söhbətlər ({shown.length})</h3>
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input type="checkbox" checked={onlyLeads} onChange={e => setOnlyLeads(e.target.checked)} className="accent-[#FFD21A]" /> Yalnız sorğuya çevrilənlər
            </label>
          </div>
          <div className="max-h-[520px] overflow-y-auto divide-y divide-white/5">
            {shown.length === 0 && <p className="p-6 text-sm text-gray-500">{loading ? 'Yüklənir…' : 'Hələ söhbət yoxdur.'}</p>}
            {shown.map(s => (
              <button key={s.sid} onClick={() => setOpenSid(s.sid)} className={`w-full text-left px-5 py-3 hover:bg-white/5 transition-colors ${openSid === s.sid ? 'bg-white/5' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-mono text-gray-500">{fmt(s.updated_at)} · {s.lang?.toUpperCase() || '-'} · {s.first_page || '-'} · {s.variant || '-'}</span>
                  <span className="flex items-center gap-2 text-[11px]">
                    <span className="text-gray-500">{s.msg_count} mesaj</span>
                    {s.lead_id && <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">SORĞU</span>}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1 line-clamp-1">{s.transcript.find(m => m.r === 'u')?.t || '-'}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#12131A] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5"><h3 className="text-sm font-bold text-white">Ən çox verilən ilk suallar</h3></div>
          <ol className="p-5 space-y-2 text-sm text-gray-300 list-decimal list-inside">
            {topQuestions.length === 0 && <li className="list-none text-gray-500">Hələ məlumat yoxdur.</li>}
            {topQuestions.map(([q, n]) => <li key={q}><span>{q}</span> <span className="text-gray-500 font-mono">×{n}</span></li>)}
          </ol>
        </div>
      </div>

      {current && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpenSid(null)}>
          <div className="w-full max-w-xl max-h-[85vh] bg-[#12131A] border border-white/10 rounded-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <p className="text-sm text-white font-semibold">{fmt(current.created_at)} · {current.lang?.toUpperCase()} · {current.first_page} · variant {current.variant}{current.lead_id ? ` · sorğu ${current.lead_id.slice(-4).toUpperCase()}` : ''}</p>
              <div className="flex items-center gap-1">
                {canDelete && <button onClick={() => void remove(current.sid)} className="p-2 text-gray-500 hover:text-red-400" aria-label="Sil"><Trash2 className="w-4 h-4" /></button>}
                <button onClick={() => setOpenSid(null)} className="p-2 text-gray-500 hover:text-white" aria-label="Bağla"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {current.transcript.map((m, i) => (
                <div key={i} className={`flex ${m.r === 'u' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words ${m.r === 'u' ? 'bg-[#FFD21A] text-black' : 'bg-[#1A1C23] text-gray-200'}`}>
                    {m.t}
                    {m.c?.length ? <p className="mt-1 text-[11px] opacity-70">Kartlar: {m.c.join(', ')}</p> : null}
                  </div>
                </div>
              ))}
            </div>
            <p className="px-4 py-3 border-t border-white/5 text-[11px] text-gray-500">Söhbətdəki telefon və e-poçt nişanlanıb ([telefon], [e-poçt]) və saxlanmır.</p>
          </div>
        </div>
      )}
    </div>
  );
};
