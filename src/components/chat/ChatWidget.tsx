import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './chat-light.css';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, Calculator, ImagePlus, Lightbulb, MessageCircle, Star, X } from 'lucide-react';
import { Language } from '../../types';
import { clearPass, getTurnstileToken, readPass, storePass, turnstileEnabled } from '../../lib/turnstile';
import { getSid, getVariant, track } from '../../lib/track';
import { useData } from '../../context/DataContext';
import { CALC_CHIP_Q, MAX_NUDGES, NUDGE_GAP_MS, nudgeFor, readNudgeState, writeNudgeState, type ChatPage, type Nudge } from './nudges';
import { STR, WHATSAPP, type ChatLang } from './strings';
import { validPhone } from '../../utils/phone';
import {
  CalcCard, LeadDoneView, LeadForm, LinkText, ProductCards, ProjectCardView, ShortlistTray, ToolCards, ToolChips, resizeImage,
  type CalcInput, type LeadState, type ProductCard, type ProjectCard,
} from './ui';

/**
 * AISeller: the digital sales consultant and site guide. Streams answers from /api/chat, shows real catalogue and project
 * cards, never talks prices (the server enforces it), keeps a shortlist, calculates a room's lighting, and hands the
 * customer to a human through one secure form (/api/lead -> database + Telegram + WhatsApp).
 */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: ProductCard[];
  projects?: ProjectCard[];
  image?: string; // the room photo the customer sent (kept in this tab only)
  chosen?: string[]; // product codes the customer chose, as understood by the assistant
  consultation?: string; // the secure contact form is shown under this message
  status?: string; // short progress note while tools run
  local?: boolean; // greeting and system notices, never sent to the model
  error?: boolean;
}

interface LeadDone { short: string; whatsappUrl: string; notified: boolean }

const STORAGE_KEY = 'ecolife-chat-v1';
const FAV_KEY = 'ecolife-chat-fav';
const uid = () => Math.random().toString(36).slice(2, 10);
const tidy = (s: string) => s.replace(/[ \t]{2,}/g, ' ').trim();

interface ChatWidgetProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  page: ChatPage;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ currentLang, onNavigate, page }) => {
  const lang: ChatLang = currentLang === 'ru' || currentLang === 'en' ? currentLang : 'az';
  const t = STR[lang];
  const apiLang = lang;
  const variant = useMemo(() => getVariant(), []);

  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState<Nudge | null>(null);
  const { products, categories, projects } = useData();
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch { /* storage unavailable */ }
    return [{ id: uid(), role: 'assistant', content: STR.az.greeting, local: true }];
  });
  const [lead, setLead] = useState<LeadState>({ name: '', phone: '+994 ', consent: false, website: '', callback: 'asap' });
  const [leadErr, setLeadErr] = useState('');
  const [leadDone, setLeadDone] = useState<LeadDone | null>(null);
  const [calcOpen, setCalcOpen] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false);
  const [shortlist, setShortlist] = useState<ProductCard[]>(() => {
    try { const s = JSON.parse(sessionStorage.getItem(FAV_KEY) || '[]'); return Array.isArray(s) ? s.slice(0, 12) : []; } catch { return []; }
  });
  // which helpers the customer has already used (the suggestions stop once they have)
  const [toolsUsed, setToolsUsed] = useState<{ calc: boolean; photo: boolean }>(() => {
    try { return { calc: false, photo: false, ...JSON.parse(sessionStorage.getItem('ecolife-chat-tools') || '{}') }; } catch { return { calc: false, photo: false }; }
  });
  const [visionOn, setVisionOn] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoHint, setPhotoHint] = useState(false);

  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // what the vision model saw in the customer's photo: kept for the whole chat so questions about the room keep working
  const visionRef = useRef<string>((() => { try { return sessionStorage.getItem('ecolife-chat-vision') || ''; } catch { return ''; } })());
  const photoTimes = useRef<number[]>([]);
  const openSrc = useRef<'launcher' | 'nudge'>('launcher');

  // keep the greeting in the visitor's language until they start talking
  useEffect(() => {
    setMessages(prev => (prev.length === 1 && prev[0].local ? [{ ...prev[0], content: t.greeting }] : prev));
  }, [t.greeting]);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40).map(({ image, ...m }) => m))); } catch { /* ignore */ }
  }, [messages]);
  useEffect(() => {
    try { sessionStorage.setItem(FAV_KEY, JSON.stringify(shortlist)); } catch { /* ignore */ }
  }, [shortlist]);

  // ---- what the visitor is looking at (names come from the already loaded site data)
  const pageLabel = useMemo(() => {
    if (page.type === 'product') return products.find(p => p.slug === page.id || p.id === page.id)?.name || '';
    if (page.type === 'category') {
      const c = categories.find(x => x.id === page.id);
      return c ? (currentLang === 'ru' ? c.nameRu : currentLang === 'en' ? c.nameEn : c.nameAz) : '';
    }
    if (page.type === 'project') return projects.find(p => p.slug === page.id)?.title || '';
    return '';
  }, [page.type, page.id, products, categories, projects, currentLang]);
  const pageNudge = useMemo(() => nudgeFor(page, lang, pageLabel, variant), [page, lang, pageLabel, variant]);

  const labelRef = useRef(pageLabel);
  labelRef.current = pageLabel;
  const chattedRef = useRef(false);
  chattedRef.current = messages.filter(m => m.role === 'user').length >= 2;
  const needsLabel = page.type === 'product' || page.type === 'category' || page.type === 'project';
  const nudgeReady = !needsLabel || !!pageLabel;

  // contextual hello: a short, static line per page (a few per session, never twice on one page, silent once dismissed)
  useEffect(() => {
    if (open || !nudgeReady) return;
    const nudge = nudgeFor(page, lang, labelRef.current, variant);
    if (!nudge) return;
    const st0 = readNudgeState();
    if (st0.dismissed || st0.count >= MAX_NUDGES || st0.keys.includes(nudge.key)) return;
    const wait = Math.max(nudge.delayMs, st0.last ? NUDGE_GAP_MS - (Date.now() - st0.last) : 0);
    let hide = 0;
    const id = window.setTimeout(() => {
      const st = readNudgeState();
      if (st.dismissed || chattedRef.current) return;
      setTeaser(nudge);
      track('nudge_shown', page.type, { key: nudge.key });
      writeNudgeState({ ...st, count: st.count + 1, keys: [...st.keys, nudge.key], last: Date.now() });
      hide = window.setTimeout(() => setTeaser(null), 18000);
    }, wait);
    return () => { window.clearTimeout(id); window.clearTimeout(hide); setTeaser(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.type, page.id, nudgeReady, lang, open, variant]);

  const dismissNudges = () => {
    setTeaser(null);
    track('nudge_dismiss', page.type);
    writeNudgeState({ ...readNudgeState(), dismissed: true });
  };

  useEffect(() => { if (open) setTeaser(null); }, [open]);

  useEffect(() => {
    if (open) {
      track('chat_open', page.type, { src: openSrc.current });
      openSrc.current = 'launcher';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // is the photo feature switched on on the server?
  useEffect(() => {
    if (!open || visionOn) return;
    fetch('/api/vision').then(r => r.json()).then(j => setVisionOn(!!j?.enabled)).catch(() => undefined);
  }, [open, visionOn]);

  // the message box grows with the text (up to about 6 lines) so the customer always sees everything they wrote
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
    el.style.overflowY = el.scrollHeight > 150 ? 'auto' : 'hidden'; // no scrollbar until the text really exceeds the box
  }, [input, open]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, leadDone, leadErr, open, calcOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    const f = window.setTimeout(() => inputRef.current?.focus(), 250);
    return () => { window.removeEventListener('keydown', onKey); window.clearTimeout(f); };
  }, [open]);

  // products of the latest cards the assistant showed, and the choice it recorded when it opened the form
  const lastShownCodes = useMemo(() => [...messages].reverse().find(m => m.products?.length)?.products?.map(p => p.code) || [], [messages]);
  const chosenCodes = useMemo(() => [...messages].reverse().find(m => m.chosen?.length)?.chosen || [], [messages]);
  const favCodes = useMemo(() => new Set(shortlist.map(p => p.code)), [shortlist]);

  const toggleFav = (p: ProductCard) => {
    setShortlist(prev => {
      if (prev.some(x => x.code === p.code)) return prev.filter(x => x.code !== p.code);
      track('shortlist_add', page.type);
      return [...prev, p].slice(-12);
    });
  };

  const patchLast = useCallback((fn: (m: ChatMessage) => ChatMessage) => {
    setMessages(prev => {
      const copy = [...prev];
      copy[copy.length - 1] = fn(copy[copy.length - 1]);
      return copy;
    });
  }, []);

  // one request to /api/chat for an already prepared conversation (the user's message and an empty assistant bubble are in `history`)
  const runRequest = useCallback(async (history: ChatMessage[], o: { canned?: string; calc?: CalcInput; first: boolean; visionNew?: boolean }) => {
    const ctl = new AbortController();
    abortRef.current = ctl;
    // greeting and error notices are UI-only; cards the customer saw are described to the model so "the first one" makes sense
    const payload = history
      .filter(m => !m.error && !m.local && m.content)
      .slice(-30)
      .map(m => ({ role: m.role, content: m.content, ...(m.products?.length ? { shown: m.products.map(p => ({ code: p.code, name: p.name })) } : {}) }));

    const attempt = async () => {
      // human check (Cloudflare Turnstile): solved once, then a signed pass covers the rest of the chat
      const pass = readPass();
      let cfToken = '';
      if (turnstileEnabled && !pass) cfToken = (await getTurnstileToken()) || '';
      const res = await fetch('/api/chat', {
        method: 'POST',
        signal: ctl.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang: apiLang,
          pass,
          cfToken,
          page,
          sid: getSid(),
          variant,
          canned: o.first ? o.canned : undefined,
          calc: o.calc ? { room: o.calc.room, area: o.calc.area, height: o.calc.height, cct: o.calc.cct } : undefined,
          shortlist: shortlist.slice(0, 8).map(p => ({ code: p.code, name: p.name })),
          vision: visionRef.current || undefined,
          visionNew: o.visionNew || undefined,
          messages: payload,
        }),
      });
      if (res.status === 403) { clearPass(); throw new Error('captcha'); }
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      let got = false; // something visible arrived (text, cards or the contact form)
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() ?? '';
        for (const part of parts) {
          if (!part.startsWith('data:')) continue;
          let evt: any;
          try { evt = JSON.parse(part.slice(5)); } catch { continue; }
          if (evt.type === 'text') { if (String(evt.delta || '').trim()) got = true; patchLast(m => ({ ...m, content: m.content + evt.delta, status: undefined })); }
          else if (evt.type === 'pass') { if (typeof evt.token === 'string') storePass(evt.token); }
          else if (evt.type === 'hint') { setPhotoHint(true); window.setTimeout(() => setPhotoHint(false), 9000); }
          else if (evt.type === 'status') patchLast(m => ({ ...m, status: String(evt.text || '') }));
          else if (evt.type === 'products') { got = true; patchLast(m => ({ ...m, products: evt.items })); }
          else if (evt.type === 'projects') { got = true; patchLast(m => ({ ...m, projects: evt.items })); }
          else if (evt.type === 'consultation') { got = true; patchLast(m => ({ ...m, consultation: evt.summary || '', chosen: Array.isArray(evt.codes) && evt.codes.length ? evt.codes.map(String) : undefined })); }
          else if (evt.type === 'reset') { got = false; patchLast(m => ({ ...m, content: '', status: undefined, products: undefined, projects: undefined, consultation: undefined })); }
          else if (evt.type === 'error') throw new Error(evt.code || 'error');
        }
      }
      // the stream finished but nothing visible came out: never leave the customer with a silent, empty bubble
      if (!got) throw new Error('empty');
      patchLast(m => ({ ...m, content: tidy(m.content) }));
    };

    try {
      for (let tryNo = 0; ; tryNo++) {
        try {
          await attempt();
          break;
        } catch (e: any) {
          if (e?.name === 'AbortError') return;
          const msg = String(e?.message || '');
          const hard = msg === 'captcha' || msg === 'HTTP 429' || msg === 'busy';
          if (!hard && tryNo < 1) {
            // one silent retry before the customer ever sees a problem
            patchLast(m => ({ ...m, content: '', status: undefined, products: undefined, projects: undefined, consultation: undefined }));
            await new Promise(r => setTimeout(r, 900));
            continue;
          }
          const shown = msg === 'busy' ? t.busy : msg === 'HTTP 429' ? t.rate : msg === 'captcha' ? t.captcha : t.err;
          patchLast(m => ({ ...m, content: shown, error: true, products: undefined, projects: undefined, consultation: undefined }));
          break;
        }
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }, [apiLang, page, patchLast, shortlist, t.err, t.busy, t.rate, t.captcha, variant]);

  const send = useCallback(async (raw: string, canned?: string, calc?: CalcInput) => {
    const text = raw.trim().slice(0, 1000);
    if (!text || busy) return;
    const first = !messages.some(m => m.role === 'user');
    if (first) track('first_message', page.type, { canned: canned || null });
    const history = [...messages, { id: uid(), role: 'user' as const, content: text }];
    setMessages([...history, { id: uid(), role: 'assistant', content: '' }]);
    setInput('');
    setCalcOpen(false);
    setBusy(true);
    await runRequest(history, { canned, calc, first });
  }, [busy, messages, page, runRequest]);

  const markUsed = (k: 'calc' | 'photo') => setToolsUsed(prev => {
    const next = { ...prev, [k]: true };
    try { sessionStorage.setItem('ecolife-chat-tools', JSON.stringify(next)); } catch { /* ignore */ }
    return next;
  });

  const runCalc = (c: CalcInput) => {
    markUsed('calc');
    track('calc_used', page.type, { room: c.room });
    void send(c.label, undefined, c);
  };

  // chip taps: the calculator chip opens the form, everything else is a normal (often cached) question
  const tapChip = (id: string, q: string) => {
    track('chip_click', page.type, { id });
    if (q === CALC_CHIP_Q) { setCalcOpen(true); return; }
    void send(q, id);
  };

  // ---- the secure contact form
  const openLeadForm = (content: string) => {
    track('lead_open', page.type);
    setTrayOpen(false);
    setMessages(prev => [...prev, { id: uid(), role: 'assistant', content, consultation: '', local: true }]);
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadErr('');
    if (lead.name.trim().length < 2) return setLeadErr(t.errName);
    if (!validPhone(lead.phone)) return setLeadErr(t.errPhone);
    if (!lead.consent) return setLeadErr(t.errConsent);
    // the customer sees "request received" at once; the request itself (human check, database, Telegram) runs in the background
    const ref = Math.random().toString(36).slice(2, 6);
    const codes = shortlist.length ? shortlist.map(p => p.code) : chosenCodes;
    const hi = apiLang === 'en' ? 'Hello! I am writing from the Ecolife website.' : apiLang === 'ru' ? 'Здравствуйте! Пишу с сайта Ecolife.' : 'Salam! Ecolife saytından yazıram.';
    const waNow = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`${hi} №${ref.toUpperCase()}${codes.length ? ' ' + codes.join(', ') : ''}`)}`;
    setLeadDone({ short: ref.toUpperCase(), whatsappUrl: waNow, notified: true });
    track('lead_submit', page.type, { shortlist: shortlist.length });
    const failed = (msg: string) => { setLeadDone(null); setLeadErr(msg); };
    try {
      const pass = readPass();
      const cfToken = pass ? '' : (await getTurnstileToken()) || '';
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone,
          consent: true,
          ref,
          pass,
          cfToken,
          website: lead.website,
          lang: apiLang,
          source: 'ai-chat',
          callback: lead.callback,
          vision: visionRef.current || undefined,
          sid: getSid(),
          shortlist: codes,
          products: lastShownCodes,
          transcript: messages.filter(m => !m.error && !m.local && m.content).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) { clearPass(); return failed(t.captcha); }
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      // the server's WhatsApp link carries the product names and the customer's name; its number wins over ours
      // (a repeated request within a few minutes is answered with the first request's number)
      setLeadDone(prev => (prev ? { ...prev, short: data.short || prev.short, whatsappUrl: data.whatsappUrl || prev.whatsappUrl, notified: !!data.notified } : prev));
    } catch {
      failed(t.errSend);
    }
  };

  // ---- room photo: checked and downscaled in the browser, analysed (and screened) by the vision model on the server, never stored
  const notice = (text: string) => setMessages(prev => [...prev, { id: uid(), role: 'assistant', content: text, local: true }]);

  const onPhoto = async (file: File | undefined) => {
    if (!file || busy || photoBusy) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return notice(t.photoType);
    if (file.size > 2 * 1024 * 1024) return notice(t.photoBig);
    const now = Date.now();
    photoTimes.current = photoTimes.current.filter(x => now - x < 60000);
    if (photoTimes.current.length >= 2) return notice(t.photoRate);
    photoTimes.current.push(now);

    setPhotoBusy(true);
    setBusy(true);
    let image = '';
    try { image = await resizeImage(file); } catch { setPhotoBusy(false); setBusy(false); return notice(t.photoErr); }

    // the customer sees their picture at once, with "analysing" under it
    const first = !messages.some(m => m.role === 'user');
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: t.photoMsg, image };
    const placeholder: ChatMessage = { id: uid(), role: 'assistant', content: '', status: t.photoBusy };
    const history = [...messages, userMsg];
    setMessages([...history, placeholder]);
    const drop = (text: string) => {
      setMessages(prev => [...prev.filter(m => m.id !== userMsg.id && m.id !== placeholder.id), { id: uid(), role: 'assistant', content: text, local: true }]);
      setPhotoBusy(false);
      setBusy(false);
    };
    try {
      const pass = readPass();
      const cfToken = pass ? '' : (await getTurnstileToken()) || '';
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, lang: apiLang, pass, cfToken, sid: getSid() }),
      });
      if (res.status === 403) clearPass();
      const j = await res.json().catch(() => ({}));
      if (res.status === 422 && j.error === 'rejected') return drop(j.banned ? t.photoBanned : t.photoRejected);
      if (res.status === 403 && j.error === 'banned') return drop(t.photoBanned);
      if (res.status === 429) return drop(t.photoRate);
      if (!res.ok || !j.summary) return drop(t.photoErr);
      visionRef.current = String(j.summary).slice(0, 900);
      try { sessionStorage.setItem('ecolife-chat-vision', visionRef.current); } catch { /* ignore */ }
      track('photo_used', page.type);
      markUsed('photo');
      setPhotoBusy(false);
      await runRequest(history, { first, visionNew: true });
    } catch {
      drop(t.photoErr);
    }
  };

  const openProduct = (slug: string) => {
    onNavigate('catalog', slug);
    if (window.matchMedia('(max-width: 767px)').matches) setOpen(false);
  };
  const openProject = (slug: string) => {
    onNavigate('projects', slug);
    if (window.matchMedia('(max-width: 767px)').matches) setOpen(false);
  };
  const navFromText = (p: string, param?: string) => {
    onNavigate(p, param);
    if (window.matchMedia('(max-width: 767px)').matches) setOpen(false);
  };

  const userStarted = messages.some(m => m.role === 'user');
  const lastIndex = messages.length - 1;
  const consultIdx = messages.reduce((acc, m, i) => (m.consultation !== undefined ? i : acc), -1);
  const last = messages[lastIndex];

  // one-tap follow-ups under the latest answer (static, so they cost nothing until tapped)
  const quick = useMemo(() => {
    if (busy || !userStarted || !last || last.role !== 'assistant' || last.local || last.error || !last.content || last.consultation !== undefined || leadDone) return [];
    if (last.products?.length) return [t.qMore, t.qConsult];
    if (last.projects?.length) return [t.qProjects, t.qMine];
    return [];
  }, [busy, userStarted, last, leadDone, t]);

  const userCount = messages.filter(m => m.role === 'user').length;
  const showTools = !busy && !photoBusy && !calcOpen && userCount >= 1 && userCount <= 4 && !leadDone && !!last && last.role === 'assistant' && !last.local && !last.error && !!last.content && last.consultation === undefined && (!toolsUsed.calc || (visionOn && !toolsUsed.photo));

  return (
    <>
      {/* launcher + contextual hello */}
      <div className="fixed z-[70] right-4 bottom-4 sm:right-6 sm:bottom-6 flex flex-col items-end gap-3 pointer-events-none">
        <AnimatePresence mode="wait">
          {teaser && !open && (
            <motion.div
              key={teaser.key}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="ecolife-chat pointer-events-auto relative w-[min(280px,calc(100vw-2rem))] bg-[#202228] text-[#f2ede3] rounded-2xl rounded-br-md px-4 py-3.5 border border-[var(--ed-amber)]/35 shadow-[0_14px_44px_rgba(0,0,0,0.55)]"
            >
              <button type="button" onClick={() => { track('nudge_click', page.type, { part: 'text' }); openSrc.current = 'nudge'; setOpen(true); }} className="block w-full text-left text-[13.5px] leading-snug">
                {teaser.text}
              </button>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {teaser.chips.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { track('nudge_click', page.type, { part: c.id }); openSrc.current = 'nudge'; setOpen(true); tapChip(c.id, c.q); }}
                    className="min-h-[36px] rounded-full border border-[var(--ed-amber)]/50 text-[var(--ed-amber)] hover:bg-[var(--ed-amber)] hover:text-[#1d1d1b] px-3.5 text-[12.5px] transition-colors"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-label={t.close}
                onClick={dismissNudges}
                className="absolute -top-2.5 -left-2.5 w-7 h-7 rounded-full bg-[#2c2e35] border border-white/10 grid place-items-center text-[#9a9a9f] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <div className="pointer-events-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              tabIndex={-1}
              aria-hidden="true"
              className="ecolife-chat ed-launcher-label hidden sm:block rounded-full bg-[#202228]/90 backdrop-blur border border-[var(--ed-amber)]/40 text-[var(--ed-amber)] text-[13px] font-medium px-4 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
            >
              {t.name} · {t.cta}
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t.open}
              className="ed-launcher relative w-[68px] h-[68px] rounded-full bg-[var(--ed-amber)] text-[#1d1d1b] grid place-items-center shadow-[0_10px_40px_rgba(245,185,55,0.55)] hover:scale-105 active:scale-95 transition-transform duration-300"
            >
              <span className="ed-launcher-ring" aria-hidden="true" />
              <span className="ed-launcher-ring ed-launcher-ring-2" aria-hidden="true" />
              <Lightbulb className="relative w-8 h-8" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[var(--ed-amber)]" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="shade"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[71] bg-black/55 md:hidden"
            />
            <motion.section
              key="panel"
              role="dialog"
              aria-label={t.name}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="ecolife-chat fixed z-[72] inset-x-0 bottom-0 h-[88dvh] md:inset-x-auto md:right-6 md:bottom-6 md:w-[410px] md:h-[min(660px,calc(100dvh-3rem))] flex flex-col bg-[#15161a] text-[#f2ede3] border border-white/10 rounded-t-3xl md:rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.65)] overflow-hidden"
            >
              {/* header */}
              <header className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-[#1b1c21]">
                <div className="w-10 h-10 rounded-full bg-[var(--ed-amber)] text-[#1d1d1b] grid place-items-center shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-tight">{t.name}</p>
                  <p className="text-xs text-[#9a9a9f] truncate">{t.sub}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTrayOpen(v => !v)}
                  aria-label={`${t.fav} (${shortlist.length})`}
                  aria-pressed={trayOpen}
                  className="relative h-11 px-3 grid place-items-center rounded-full text-[#9a9a9f] hover:text-[var(--ed-amber)] hover:bg-white/5 transition-colors"
                >
                  <Star className="w-5 h-5" fill={shortlist.length ? 'currentColor' : 'none'} style={shortlist.length ? { color: 'var(--ed-amber)' } : undefined} />
                  {shortlist.length > 0 && (
                    <span className="absolute top-1.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--ed-amber)] text-[#1d1d1b] text-[11px] font-semibold grid place-items-center">{shortlist.length}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t.close}
                  className="w-11 h-11 -mr-2 grid place-items-center rounded-full text-[#9a9a9f] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </header>

              {trayOpen && (
                <ShortlistTray
                  items={shortlist}
                  t={t}
                  onRemove={code => setShortlist(prev => prev.filter(p => p.code !== code))}
                  onOpen={openProduct}
                  onSend={() => openLeadForm(t.favAsk)}
                  onClose={() => setTrayOpen(false)}
                />
              )}

              {/* conversation */}
              <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scroll-smooth" aria-live="polite">
                {messages.map((m, i) => {
                  const isUser = m.role === 'user';
                  const typing = !isUser && !m.content && !m.consultation && busy && i === lastIndex;
                  if (!isUser && !m.content && !typing && !m.products && !m.projects && m.consultation === undefined) return null;
                  return (
                    <div key={m.id} className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
                      {(m.content || typing) && (
                        <div
                          className={`max-w-[86%] px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap break-words ${
                            isUser
                              ? 'bg-[var(--ed-amber)] text-[#1d1d1b] rounded-2xl rounded-br-md'
                              : 'bg-[#202228] text-[#f2ede3] rounded-2xl rounded-bl-md border border-white/5'
                          }`}
                        >
                          {typing ? (
                            <span className="inline-flex items-center gap-2 h-5" aria-label="…">
                              <span className="inline-flex items-center gap-1.5">
                                {[0, 1, 2].map(n => (
                                  <span key={n} className="w-1.5 h-1.5 rounded-full bg-[#9a9a9f] animate-pulse" style={{ animationDelay: `${n * 160}ms` }} />
                                ))}
                              </span>
                              {m.status && <span className="text-[12px] text-[#9a9a9f]">{m.status}</span>}
                            </span>
                          ) : isUser ? (
                            <>
                              {m.image && <img src={m.image} alt="" className="rounded-xl mb-2 max-h-48 w-auto" />}
                              {m.content}
                            </>
                          ) : (
                            <LinkText text={m.content} onNav={navFromText} />
                          )}
                        </div>
                      )}

                      {m.products && m.products.length > 0 && (
                        <ProductCards items={m.products} favCodes={favCodes} t={t} onFav={toggleFav} onOpen={openProduct} />
                      )}

                      {m.projects && m.projects.length > 0 && (
                        <div className="w-full space-y-2">
                          {m.projects.map(p => <ProjectCardView key={p.slug} p={p} t={t} onOpen={openProject} />)}
                        </div>
                      )}

                      {/* secure contact form requested by the assistant (or opened from the shortlist) */}
                      {i === consultIdx && m.consultation !== undefined && (
                        <div className="w-full rounded-2xl bg-[#1b1c21] border border-white/10 p-4">
                          {leadDone ? (
                            <LeadDoneView t={t} short={leadDone.short} whatsappUrl={leadDone.whatsappUrl} />
                          ) : (
                            <LeadForm t={t} lead={lead} setLead={setLead} err={leadErr} busy={false} onSubmit={submitLead} />
                          )}
                        </div>
                      )}

                      {/* graceful fallback: talk to a human directly */}
                      {m.error && (
                        <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="ed-btn-primary justify-center">
                          <MessageCircle className="w-4 h-4" /> {t.wa}
                        </a>
                      )}
                    </div>
                  );
                })}

                {quick.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {quick.map(q => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => { track('chip_click', page.type, { id: 'quick' }); void send(q); }}
                        className="min-h-[38px] rounded-full border border-[var(--ed-amber)]/40 text-[var(--ed-amber)] hover:bg-[var(--ed-amber)] hover:text-[#1d1d1b] px-3.5 text-[12.5px] transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {showTools && (
                  <ToolChips
                    t={t}
                    calcOn={!toolsUsed.calc}
                    photoOn={visionOn && !toolsUsed.photo}
                    onCalc={() => { track('chip_click', page.type, { id: 'tools-calc' }); setCalcOpen(true); }}
                    onPhoto={() => { track('chip_click', page.type, { id: 'tools-photo' }); fileRef.current?.click(); }}
                  />
                )}

                {!userStarted && (
                  <ToolCards
                    t={t}
                    photoOn={visionOn}
                    busy={busy || photoBusy}
                    onCalc={() => { track('chip_click', page.type, { id: 'tool-calc' }); setCalcOpen(true); }}
                    onPhoto={() => { track('chip_click', page.type, { id: 'tool-photo' }); fileRef.current?.click(); }}
                  />
                )}

                {!userStarted && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      ...(pageNudge ? pageNudge.chips.map(c => ({ key: c.id, label: c.label, go: () => tapChip(c.id, c.q) })) : t.chips.slice(0, 3).map(c => ({ key: c, label: c, go: () => { track('chip_click', page.type, { id: 'generic' }); void send(c); } }))),
                      { key: 'generic-last', label: t.chips[3], go: () => send(t.chips[3]) },
                    ].map(c => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={c.go}
                        className="min-h-[40px] rounded-full border border-white/15 hover:border-[var(--ed-amber)] hover:text-[var(--ed-amber)] px-4 text-[13px] text-[#d9d9dc] transition-colors"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* calculator */}
              {calcOpen && <CalcCard t={t} lang={lang} onSubmit={runCalc} onClose={() => setCalcOpen(false)} />}

              {/* composer */}
              <form onSubmit={(e) => { e.preventDefault(); void send(input); }} className="px-4 pt-3 pb-3 border-t border-white/10 bg-[#1b1c21]">
                <div className="flex items-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCalcOpen(v => !v)}
                    aria-label={t.calcTitle}
                    title={t.calcTitle}
                    aria-pressed={calcOpen}
                    className="w-10 h-[46px] shrink-0 grid place-items-center rounded-full text-[#9a9a9f] hover:text-[var(--ed-amber)] hover:bg-white/5"
                  >
                    <Calculator className="w-[18px] h-[18px]" />
                  </button>
                  {visionOn && (
                    <>
                      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/*" hidden onChange={e => { void onPhoto(e.target.files?.[0]); e.target.value = ''; }} />
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={photoBusy || busy}
                        aria-label={t.photo}
                        title={`${t.photo}. ${t.photoNote}`}
                        className={`w-10 h-[46px] shrink-0 grid place-items-center rounded-full hover:text-[var(--ed-amber)] hover:bg-white/5 disabled:opacity-40 ${photoHint ? 'text-[var(--ed-amber)] ring-2 ring-[var(--ed-amber)] animate-pulse' : 'text-[#9a9a9f]'}`}
                      >
                        <ImagePlus className="w-[18px] h-[18px]" />
                      </button>
                    </>
                  )}
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      // Enter sends, Shift+Enter starts a new line
                      if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(input); }
                    }}
                    rows={1}
                    placeholder={photoBusy ? t.photoBusy : t.placeholder}
                    maxLength={1000}
                    enterKeyHint="send"
                    className="flex-1 min-w-0 min-h-[46px] max-h-[150px] resize-none overflow-y-auto rounded-3xl bg-[#111216] border border-white/15 focus:border-[var(--ed-amber)] outline-none px-4 py-[13px] text-[14px] leading-snug placeholder:text-[#8d8d92]"
                  />
                  <button
                    type="submit"
                    disabled={busy || !input.trim()}
                    aria-label={t.send}
                    className="w-[46px] h-[46px] shrink-0 rounded-full bg-[var(--ed-amber)] text-[#1d1d1b] grid place-items-center disabled:opacity-40 transition-opacity"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-2.5 text-[11px] leading-snug text-[#8d8d92] text-center">{t.note}</p>
              </form>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
