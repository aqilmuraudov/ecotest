import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, Check, Lightbulb, MessageCircle, X } from 'lucide-react';
import { Language } from '../../types';
import { clearPass, getTurnstileToken, readPass, storePass, turnstileEnabled } from '../../lib/turnstile';
import { useData } from '../../context/DataContext';
import { MAX_NUDGES, NUDGE_GAP_MS, nudgeFor, readNudgeState, writeNudgeState, type ChatPage, type Nudge } from './nudges';

/**
 * AISeller: the digital sales consultant. Streams answers from /api/chat, shows real catalogue
 * cards, never talks prices (the server enforces it) and hands the customer over to a human
 * through one secure form (/api/lead -> database + Telegram + WhatsApp).
 */

interface ProductCard {
  code: string;
  slug: string;
  name: string;
  image: string;
  category?: { az?: string; en?: string; ru?: string };
  specs?: { power?: string; cct?: string; voltage?: string };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: ProductCard[];
  consultation?: string; // the AI asked for the secure contact form
  status?: string; // short progress note while tools run
  local?: boolean; // greeting and system notices, never sent to the model
  error?: boolean;
}

interface LeadDone { short: string; whatsappUrl: string; notified: boolean }

const WHATSAPP = '994504507007';
const STORAGE_KEY = 'ecolife-chat-v1';

const STR = {
  az: {
    name: 'AISeller',
    sub: 'Ecolife virtual məsləhətçisi',
    greeting: 'Salam! Mən AISeller, Ecolife-ın virtual məsləhətçisiyəm. Sizə necə kömək edə bilərəm?',
    teaser: 'Salam, sizə necə kömək edə bilərəm?',
    placeholder: 'Mesajınızı yazın…',
    send: 'Göndər',
    open: 'Məsləhətçi ilə yazışın',
    cta: 'Soruşun',
    close: 'Bağla',
    chips: ['Ev üçün işıq axtarıram', 'Ofis və ya mağaza üçün', 'Layihəm var', 'Məhsul barədə soruşmaq istəyirəm'],
    details: 'Ətraflı',
    note: 'AI cavabları məlumat xarakterlidir. Dəqiq qiyməti satış məsləhətçimiz təqdim edir.',
    formTitle: 'Məsləhətçi sizinlə əlaqə saxlasın',
    formName: 'Adınız',
    formPhone: 'Telefon (WhatsApp)',
    consent: 'Məlumatlarımın sorğunun işlənməsi üçün istifadəsinə razıyam',
    submit: 'Sorğunu göndər',
    sending: 'Göndərilir…',
    doneTitle: 'Sorğunuz qəbul olundu',
    doneText: 'Məsləhətçimiz tezliklə sizinlə əlaqə saxlayacaq (Bazar ertəsi - Şənbə, 09:00 - 18:00).',
    wa: 'WhatsApp-da yazın',
    err: 'Bağışlayın, hazırda cavab verə bilmirəm. Satış məsləhətçimizə birbaşa yaza bilərsiniz.',
    captcha: 'Təhlükəsizlik yoxlaması alınmadı. Zəhmət olmasa yenidən cəhd edin və ya satış məsləhətçimizə birbaşa yazın.',
    busy: 'Hazırda sorğular çoxdur. Bir neçə saniyə sonra yenidən yazın və ya satış məsləhətçimizə birbaşa yazın.',
    rate: 'Çox mesaj göndərdiniz. Bir neçə dəqiqə sonra yenidən yazın və ya satış məsləhətçimizə birbaşa yazın.',
    errName: 'Adınızı yazın',
    errPhone: 'Düzgün telefon nömrəsi yazın',
    errConsent: 'Razılıq lazımdır',
    errSend: 'Göndərmək alınmadı, bir az sonra yenidən cəhd edin',
  },
  ru: {
    name: 'AISeller',
    sub: 'Виртуальный консультант Ecolife',
    greeting: 'Здравствуйте! Я AISeller, виртуальный консультант Ecolife. Чем могу помочь?',
    teaser: 'Здравствуйте, чем могу помочь?',
    placeholder: 'Напишите сообщение…',
    send: 'Отправить',
    open: 'Написать консультанту',
    cta: 'Спросить',
    close: 'Закрыть',
    chips: ['Ищу свет для дома', 'Для офиса или магазина', 'У меня проект', 'Хочу узнать о продукте'],
    details: 'Подробнее',
    note: 'Ответы ИИ носят справочный характер. Точную стоимость назовёт менеджер по продажам.',
    formTitle: 'Пусть консультант свяжется с вами',
    formName: 'Ваше имя',
    formPhone: 'Телефон (WhatsApp)',
    consent: 'Согласен на обработку данных для рассмотрения заявки',
    submit: 'Отправить заявку',
    sending: 'Отправка…',
    doneTitle: 'Заявка принята',
    doneText: 'Наш консультант скоро свяжется с вами (Пн - Сб, 09:00 - 18:00).',
    wa: 'Написать в WhatsApp',
    err: 'Извините, сейчас не могу ответить. Вы можете написать менеджеру напрямую.',
    captcha: 'Не удалось пройти проверку безопасности. Повторите попытку или напишите менеджеру напрямую.',
    busy: 'Сейчас много запросов. Повторите через несколько секунд или напишите менеджеру напрямую.',
    rate: 'Слишком много сообщений. Попробуйте через несколько минут или напишите менеджеру напрямую.',
    errName: 'Укажите имя',
    errPhone: 'Укажите корректный номер телефона',
    errConsent: 'Нужно согласие',
    errSend: 'Не удалось отправить, повторите попытку позже',
  },
  en: {
    name: 'AISeller',
    sub: 'Ecolife virtual consultant',
    greeting: 'Hello! I am AISeller, the Ecolife virtual consultant. How can I help you?',
    teaser: 'Hello, how can I help you?',
    placeholder: 'Type your message…',
    send: 'Send',
    open: 'Chat with a consultant',
    cta: 'Ask us',
    close: 'Close',
    chips: ['Lighting for my home', 'For an office or shop', 'I have a project', 'I have a product question'],
    details: 'Details',
    note: 'AI answers are informational. Our sales consultant provides the exact price.',
    formTitle: 'Let a consultant contact you',
    formName: 'Your name',
    formPhone: 'Phone (WhatsApp)',
    consent: 'I agree to my data being used to process this request',
    submit: 'Send request',
    sending: 'Sending…',
    doneTitle: 'Request received',
    doneText: 'Our consultant will contact you shortly (Mon - Sat, 09:00 - 18:00).',
    wa: 'Chat on WhatsApp',
    err: 'Sorry, I cannot answer right now. You can message our sales consultant directly.',
    captcha: 'The security check could not be completed. Please try again or message our sales consultant.',
    busy: 'We are receiving many requests right now. Please try again in a few seconds or message our sales consultant.',
    rate: 'Too many messages. Please try again in a few minutes or message our sales consultant.',
    errName: 'Enter your name',
    errPhone: 'Enter a valid phone number',
    errConsent: 'Consent is required',
    errSend: 'Could not send, please try again later',
  },
} as const;

const uid = () => Math.random().toString(36).slice(2, 10);

/** Same rules as /api/lead: Azerbaijan numbers are 994 + 9 digits (also accepted as 9 digits or 0 + 9), others 11-15 digits. */
function validPhone(input: string): boolean {
  const d = input.replace(/\D/g, '');
  if (d.length === 9 || (d.length === 10 && d.startsWith('0'))) return true;
  if (d.startsWith('994')) return d.length === 12 && d[3] !== '0';
  return d.length >= 11 && d.length <= 15;
}
const tidy = (s: string) => s.replace(/[ \t]{2,}/g, ' ').trim();

interface ChatWidgetProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  page: ChatPage;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ currentLang, onNavigate, page }) => {
  const t = STR[currentLang] || STR.az;
  const apiLang = currentLang === 'ru' ? 'ru' : 'az';

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
  const [lead, setLead] = useState<{ name: string; phone: string; consent: boolean; website: string }>({ name: '', phone: '+994 ', consent: false, website: '' });
  const [leadErr, setLeadErr] = useState('');
  const [leadBusy, setLeadBusy] = useState(false);
  const [leadDone, setLeadDone] = useState<LeadDone | null>(null);

  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // keep the greeting in the visitor's language until they start talking
  useEffect(() => {
    setMessages(prev => (prev.length === 1 && prev[0].local ? [{ ...prev[0], content: t.greeting }] : prev));
  }, [t.greeting]);

  // remember the conversation for this tab
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40))); } catch { /* ignore */ }
  }, [messages]);

  // what the visitor is looking at (names come from the already loaded site data)
  const pageLabel = useMemo(() => {
    if (page.type === 'product') return products.find(p => p.slug === page.id || p.id === page.id)?.name || '';
    if (page.type === 'category') {
      const c = categories.find(x => x.id === page.id);
      return c ? (currentLang === 'ru' ? c.nameRu : currentLang === 'en' ? c.nameEn : c.nameAz) : '';
    }
    if (page.type === 'project') return projects.find(p => p.slug === page.id)?.title || '';
    return '';
  }, [page.type, page.id, products, categories, projects, currentLang]);
  const pageNudge = useMemo(() => nudgeFor(page, currentLang, pageLabel), [page, currentLang, pageLabel]);

  const labelRef = useRef(pageLabel);
  labelRef.current = pageLabel;
  const chattedRef = useRef(false);
  chattedRef.current = messages.filter(m => m.role === 'user').length >= 2;
  const needsLabel = page.type === 'product' || page.type === 'category' || page.type === 'project';
  const nudgeReady = !needsLabel || !!pageLabel;

  // contextual hello: a short, static line per page (a few per session, never twice on one page, silent once dismissed)
  useEffect(() => {
    if (open || !nudgeReady) return;
    const nudge = nudgeFor(page, currentLang, labelRef.current);
    if (!nudge) return;
    const st0 = readNudgeState();
    if (st0.dismissed || st0.count >= MAX_NUDGES || st0.keys.includes(nudge.key)) return;
    const wait = Math.max(nudge.delayMs, st0.last ? NUDGE_GAP_MS - (Date.now() - st0.last) : 0);
    let hide = 0;
    const id = window.setTimeout(() => {
      const st = readNudgeState();
      if (st.dismissed || chattedRef.current) return;
      setTeaser(nudge);
      writeNudgeState({ ...st, count: st.count + 1, keys: [...st.keys, nudge.key], last: Date.now() });
      hide = window.setTimeout(() => setTeaser(null), 18000);
    }, wait);
    return () => { window.clearTimeout(id); window.clearTimeout(hide); setTeaser(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.type, page.id, nudgeReady, currentLang, open]);

  const dismissNudges = () => {
    setTeaser(null);
    writeNudgeState({ ...readNudgeState(), dismissed: true });
  };

  useEffect(() => { if (open) setTeaser(null); }, [open]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, leadDone, leadErr, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    const f = window.setTimeout(() => inputRef.current?.focus(), 250);
    return () => { window.removeEventListener('keydown', onKey); window.clearTimeout(f); };
  }, [open]);

  const shownProducts = useMemo(() => messages.flatMap(m => m.products || []).map(p => p.code), [messages]);

  const patchLast = useCallback((fn: (m: ChatMessage) => ChatMessage) => {
    setMessages(prev => {
      const copy = [...prev];
      copy[copy.length - 1] = fn(copy[copy.length - 1]);
      return copy;
    });
  }, []);

  const send = useCallback(async (raw: string, canned?: string) => {
    const text = raw.trim().slice(0, 1000);
    if (!text || busy) return;
    const first = !messages.some(m => m.role === 'user');
    const history = [...messages, { id: uid(), role: 'user' as const, content: text }];
    setMessages([...history, { id: uid(), role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);

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
        body: JSON.stringify({ lang: apiLang, pass, cfToken, page, canned: first ? canned : undefined, messages: payload }),
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
          else if (evt.type === 'status') patchLast(m => ({ ...m, status: String(evt.text || '') }));
          else if (evt.type === 'products') { got = true; patchLast(m => ({ ...m, products: evt.items })); }
          else if (evt.type === 'consultation') { got = true; patchLast(m => ({ ...m, consultation: evt.summary || '' })); }
          else if (evt.type === 'reset') { got = false; patchLast(m => ({ ...m, content: '', status: undefined, products: undefined, consultation: undefined })); }
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
            patchLast(m => ({ ...m, content: '', status: undefined, products: undefined, consultation: undefined }));
            await new Promise(r => setTimeout(r, 900));
            continue;
          }
          const shown = msg === 'busy' ? t.busy : msg === 'HTTP 429' ? t.rate : msg === 'captcha' ? t.captcha : t.err;
          patchLast(m => ({ ...m, content: shown, error: true, products: undefined, consultation: undefined }));
          break;
        }
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }, [apiLang, busy, messages, page, patchLast, t.err, t.busy, t.rate, t.captcha]);

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadErr('');
    if (lead.name.trim().length < 2) return setLeadErr(t.errName);
    if (!validPhone(lead.phone)) return setLeadErr(t.errPhone);
    if (!lead.consent) return setLeadErr(t.errConsent);
    setLeadBusy(true);
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
          pass,
          cfToken,
          website: lead.website,
          lang: apiLang,
          source: 'ai-chat',
          products: Array.from(new Set(shownProducts)),
          transcript: messages.filter(m => !m.local && !m.error && m.content).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) { clearPass(); return setLeadErr(t.captcha); }
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setLeadDone({ short: data.short || '', whatsappUrl: data.whatsappUrl || `https://wa.me/${WHATSAPP}`, notified: !!data.notified });
    } catch {
      setLeadErr(t.errSend);
    } finally {
      setLeadBusy(false);
    }
  };

  const openProduct = (slug: string) => {
    onNavigate('catalog', slug);
    if (window.matchMedia('(max-width: 767px)').matches) setOpen(false);
  };

  const userStarted = messages.some(m => m.role === 'user');
  const lastIndex = messages.length - 1;
  const consultIdx = messages.reduce((acc, m, i) => (m.consultation !== undefined ? i : acc), -1);

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
              className="pointer-events-auto relative w-[min(280px,calc(100vw-2rem))] bg-[#202228] text-[#f2ede3] rounded-2xl rounded-br-md px-4 py-3.5 border border-[var(--ed-amber)]/35 shadow-[0_14px_44px_rgba(0,0,0,0.55)]"
            >
              <button type="button" onClick={() => setOpen(true)} className="block w-full text-left text-[13.5px] leading-snug">
                {teaser.text}
              </button>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {teaser.chips.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setOpen(true); void send(c.q, c.id); }}
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
              className="ed-launcher-label hidden sm:block rounded-full bg-[#202228]/90 backdrop-blur border border-[var(--ed-amber)]/40 text-[var(--ed-amber)] text-[13px] font-medium px-4 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
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
              className="fixed z-[72] inset-x-0 bottom-0 h-[88dvh] md:inset-x-auto md:right-6 md:bottom-6 md:w-[410px] md:h-[min(660px,calc(100dvh-3rem))] flex flex-col bg-[#15161a] text-[#f2ede3] border border-white/10 rounded-t-3xl md:rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.65)] overflow-hidden"
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
                  onClick={() => setOpen(false)}
                  aria-label={t.close}
                  className="w-11 h-11 -mr-2 grid place-items-center rounded-full text-[#9a9a9f] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </header>

              {/* conversation */}
              <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scroll-smooth" aria-live="polite">
                {messages.map((m, i) => {
                  const isUser = m.role === 'user';
                  const typing = !isUser && !m.content && !m.consultation && busy && i === lastIndex;
                  if (!isUser && !m.content && !typing && !m.products && m.consultation === undefined) return null;
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
                          ) : (
                            m.content
                          )}
                        </div>
                      )}

                      {m.products && m.products.length > 0 && (
                        <div className="w-full space-y-2">
                          {m.products.map(p => (
                            <button
                              key={p.code}
                              type="button"
                              onClick={() => openProduct(p.slug)}
                              className="group w-full flex items-center gap-3 text-left rounded-2xl bg-[#1b1c21] border border-white/10 hover:border-[var(--ed-amber)]/60 p-2.5 transition-colors"
                            >
                              <span className="ed-plate w-[72px] h-[72px] shrink-0 rounded-xl overflow-hidden grid place-items-center">
                                {p.image && <img src={p.image} alt="" loading="lazy" className="w-full h-full object-contain p-1.5" />}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-[13px] font-semibold leading-snug line-clamp-2">{p.name}</span>
                                <span className="block text-[11px] text-[#9a9a9f] mt-1">
                                  {[p.specs?.power, p.specs?.cct, p.specs?.voltage].filter(Boolean).join(' · ') || p.code}
                                </span>
                                <span className="block text-[11px] text-[var(--ed-amber)] mt-1.5 group-hover:translate-x-0.5 transition-transform">{t.details} →</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* secure contact form requested by the assistant */}
                      {i === consultIdx && m.consultation !== undefined && (
                        <div className="w-full rounded-2xl bg-[#1b1c21] border border-white/10 p-4">
                          {leadDone ? (
                            <div className="space-y-3">
                              <p className="flex items-center gap-2 text-[14px] font-semibold">
                                <span className="w-6 h-6 rounded-full bg-[var(--ed-amber)] text-[#1d1d1b] grid place-items-center"><Check className="w-3.5 h-3.5" /></span>
                                {t.doneTitle} {leadDone.short && <span className="text-[#9a9a9f] font-normal">№{leadDone.short}</span>}
                              </p>
                              <p className="text-[13px] text-[#c9c9cd] leading-relaxed">{t.doneText}</p>
                              <a
                                href={leadDone.whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ed-btn-primary w-full justify-center"
                              >
                                <MessageCircle className="w-4 h-4" /> {t.wa}
                              </a>
                            </div>
                          ) : (
                            <form onSubmit={submitLead} className="space-y-3" noValidate>
                              <p className="text-[14px] font-semibold">{t.formTitle}</p>
                              <label className="block">
                                <span className="sr-only">{t.formName}</span>
                                <input
                                  value={lead.name}
                                  onChange={e => setLead({ ...lead, name: e.target.value })}
                                  placeholder={t.formName}
                                  autoComplete="name"
                                  maxLength={80}
                                  className="w-full min-h-[44px] rounded-xl bg-[#111216] border border-white/15 focus:border-[var(--ed-amber)] outline-none px-3.5 text-[14px] placeholder:text-[#8d8d92]"
                                />
                              </label>
                              <label className="block">
                                <span className="sr-only">{t.formPhone}</span>
                                <input
                                  value={lead.phone}
                                  onChange={e => setLead({ ...lead, phone: e.target.value })}
                                  placeholder={t.formPhone}
                                  type="tel"
                                  inputMode="tel"
                                  autoComplete="tel"
                                  maxLength={20}
                                  className="w-full min-h-[44px] rounded-xl bg-[#111216] border border-white/15 focus:border-[var(--ed-amber)] outline-none px-3.5 text-[14px] placeholder:text-[#8d8d92]"
                                />
                              </label>
                              {/* honeypot: real visitors never see or fill this */}
                              <input
                                tabIndex={-1}
                                autoComplete="off"
                                aria-hidden="true"
                                value={lead.website}
                                onChange={e => setLead({ ...lead, website: e.target.value })}
                                className="absolute -left-[9999px] w-px h-px opacity-0"
                              />
                              <label className="flex items-start gap-2.5 text-[12px] text-[#b6b6bb] leading-snug cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={lead.consent}
                                  onChange={e => setLead({ ...lead, consent: e.target.checked })}
                                  className="mt-0.5 w-4 h-4 accent-[#f5b937]"
                                />
                                {t.consent}
                              </label>
                              {leadErr && <p className="text-[12px] text-[#ff8a80]" role="alert">{leadErr}</p>}
                              <button type="submit" disabled={leadBusy} className="ed-btn-primary w-full justify-center disabled:opacity-60">
                                {leadBusy ? t.sending : t.submit}
                              </button>
                            </form>
                          )}
                        </div>
                      )}

                      {/* graceful fallback: talk to a human directly */}
                      {m.error && (
                        <a
                          href={`https://wa.me/${WHATSAPP}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ed-btn-primary justify-center"
                        >
                          <MessageCircle className="w-4 h-4" /> {t.wa}
                        </a>
                      )}
                    </div>
                  );
                })}

                {!userStarted && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {pageNudge
                      ? [
                          ...pageNudge.chips.map(c => ({ key: c.id, label: c.label, go: () => send(c.q, c.id) })),
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
                        ))
                      : t.chips.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => send(c)}
                            className="min-h-[40px] rounded-full border border-white/15 hover:border-[var(--ed-amber)] hover:text-[var(--ed-amber)] px-4 text-[13px] text-[#d9d9dc] transition-colors"
                          >
                            {c}
                          </button>
                        ))}
                  </div>
                )}
              </div>

              {/* composer */}
              <form
                onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="px-4 pt-3 pb-3 border-t border-white/10 bg-[#1b1c21]"
              >
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={t.placeholder}
                    maxLength={1000}
                    enterKeyHint="send"
                    className="flex-1 min-w-0 min-h-[46px] rounded-full bg-[#111216] border border-white/15 focus:border-[var(--ed-amber)] outline-none px-4 text-[14px] placeholder:text-[#8d8d92]"
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
