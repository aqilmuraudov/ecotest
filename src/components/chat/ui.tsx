import React, { useState } from 'react';
import { Calculator, Check, ImagePlus, MessageCircle, Star, X } from 'lucide-react';
import { ROOM_LABELS, type ChatLang, type Strings } from './strings';

export interface ProductCard {
  code: string;
  slug: string;
  name: string;
  image: string;
  category?: { az?: string; en?: string; ru?: string };
  specs?: { power?: string; cct?: string; voltage?: string };
}
export interface ProjectCard { slug: string; title: string; image: string; category: string; year: string }

type Nav = (page: string, param?: string) => void;

// ------------------------------------------------------------------ text with clickable site links
const PATH_RE = /(?:https?:\/\/(?:www\.)?ecolife\.az)?(\/(?:blog|projects|solutions|catalog|configurator|about|contact)(?:\/[\w\-.%~]+)?)/g;

export const LinkText: React.FC<{ text: string; onNav: Nav }> = ({ text, onNav }) => {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  PATH_RE.lastIndex = 0;
  while ((m = PATH_RE.exec(text))) {
    const before = text[m.index - 1];
    if (before && /[\p{L}\d]/u.test(before)) continue; // part of another word
    const path = m[1].replace(/[.,;:)]+$/, '');
    const [page, ...rest] = path.split('/').filter(Boolean);
    if (m.index > last) out.push(text.slice(last, m.index));
    const param = rest.length ? decodeURIComponent(rest.join('/')) : undefined;
    out.push(
      <a
        key={m.index}
        href={path}
        onClick={e => { e.preventDefault(); onNav(page, param); }}
        className="underline decoration-[var(--ed-amber)]/60 underline-offset-2 text-[var(--ed-amber)] break-all"
      >
        {path}
      </a>
    );
    last = m.index + (m[0].length - (m[1].length - path.length));
    PATH_RE.lastIndex = last;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
};

// ------------------------------------------------------------------ cards
export const ProductCardView: React.FC<{
  p: ProductCard; n?: number; fav: boolean; t: Strings; onFav: (p: ProductCard) => void; onOpen: (slug: string) => void;
}> = ({ p, n, fav, t, onFav, onOpen }) => (
  <div className="group relative w-full flex items-center gap-3 rounded-2xl bg-[#1b1c21] border border-white/10 hover:border-[var(--ed-amber)]/60 p-2.5 transition-colors">
    <button type="button" onClick={() => onOpen(p.slug)} className="flex items-center gap-3 text-left min-w-0 flex-1">
      <span className="ed-plate relative w-[72px] h-[72px] shrink-0 rounded-xl overflow-hidden grid place-items-center">
        {p.image && <img src={p.image} alt="" loading="lazy" className="w-full h-full object-contain p-1.5" />}
        {/* the number lets the customer say "the 2nd one" and the model knows which card that is */}
        {n !== undefined && (
          <span className="absolute top-1 left-1 min-w-[20px] h-5 px-1 grid place-items-center rounded-full bg-[#111216] border border-white/10 text-[var(--ed-amber)] text-[11px] font-semibold leading-none">{n}</span>
        )}
      </span>
      <span className="min-w-0 flex-1 pr-9">
        <span className="block text-[13px] font-semibold leading-snug line-clamp-2">{p.name}</span>
        <span className="block text-[11px] text-[#9a9a9f] mt-1">{[p.specs?.power, p.specs?.cct, p.specs?.voltage].filter(Boolean).join(' · ') || p.code}</span>
        <span className="block text-[11px] text-[var(--ed-amber)] mt-1.5 group-hover:translate-x-0.5 transition-transform">{t.details} →</span>
      </span>
    </button>
    <button
      type="button"
      onClick={() => onFav(p)}
      aria-pressed={fav}
      aria-label={fav ? t.favRemove : t.favAdd}
      title={fav ? t.favRemove : t.favAdd}
      className={`absolute top-1.5 right-1.5 w-9 h-9 grid place-items-center rounded-full transition-colors ${fav ? 'text-[var(--ed-amber)]' : 'text-[#8d8d92] hover:text-[var(--ed-amber)]'}`}
    >
      <Star className="w-[18px] h-[18px]" fill={fav ? 'currentColor' : 'none'} />
    </button>
  </div>
);

// the best matches stay in view; further options wait behind one tap, so a long list does not bury the main choice
export const FIRST_CARDS = 3;

export const ProductCards: React.FC<{
  items: ProductCard[]; favCodes: Set<string>; t: Strings; onFav: (p: ProductCard) => void; onOpen: (slug: string) => void;
}> = ({ items, favCodes, t, onFav, onOpen }) => {
  const [all, setAll] = useState(false);
  // hiding a single card saves nothing
  const shown = all || items.length <= FIRST_CARDS + 1 ? items : items.slice(0, FIRST_CARDS);
  const hidden = items.length - shown.length;
  return (
    <div className="w-full space-y-2">
      {shown.map((p, i) => (
        <ProductCardView key={p.code} p={p} n={items.length > 1 ? i + 1 : undefined} fav={favCodes.has(p.code)} t={t} onFav={onFav} onOpen={onOpen} />
      ))}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setAll(true)}
          className="w-full min-h-[44px] rounded-2xl border border-dashed border-white/15 text-[12.5px] text-[#c9c9cd] hover:border-[var(--ed-amber)]/60 hover:text-[var(--ed-amber)] transition-colors"
        >
          {t.moreCards(hidden)}
        </button>
      )}
    </div>
  );
};

export const ProjectCardView: React.FC<{ p: ProjectCard; t: Strings; onOpen: (slug: string) => void }> = ({ p, t, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(p.slug)}
    className="group w-full flex items-center gap-3 text-left rounded-2xl bg-[#1b1c21] border border-white/10 hover:border-[var(--ed-amber)]/60 p-2.5 transition-colors"
  >
    <span className="w-[72px] h-[72px] shrink-0 rounded-xl overflow-hidden bg-[#111216] grid place-items-center">
      {p.image && <img src={p.image} alt="" loading="lazy" className="w-full h-full object-cover" />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-[13px] font-semibold leading-snug line-clamp-2">{p.title}</span>
      <span className="block text-[11px] text-[#9a9a9f] mt-1 capitalize">{[t.project, p.category, p.year].filter(Boolean).join(' · ')}</span>
      <span className="block text-[11px] text-[var(--ed-amber)] mt-1.5 group-hover:translate-x-0.5 transition-transform">{t.details} →</span>
    </span>
  </button>
);

// ------------------------------------------------------------------ calculator form (answered by the server without a model)
export interface CalcInput { room: string; area: number; height?: number; cct?: number; label: string }

export const CalcCard: React.FC<{ t: Strings; lang: ChatLang; onSubmit: (c: CalcInput) => void; onClose: () => void }> = ({ t, lang, onSubmit, onClose }) => {
  const rooms = ROOM_LABELS[lang];
  const [room, setRoom] = useState(rooms[0].key);
  const [area, setArea] = useState('');
  const [height, setHeight] = useState('');
  const [cct, setCct] = useState('0');
  const [err, setErr] = useState('');
  const field = 'w-full min-h-[42px] rounded-xl bg-[#111216] border border-white/15 focus:border-[var(--ed-amber)] outline-none px-3 text-[13.5px] placeholder:text-[#8d8d92]';

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const a = Number(area.replace(',', '.'));
    if (!(a >= 2 && a <= 3000)) return setErr(t.calcErrArea);
    const h = Number(height.replace(',', '.'));
    onSubmit({
      room,
      area: a,
      height: h >= 2 && h <= 12 ? h : undefined,
      cct: Number(cct) || undefined,
      label: t.calcUser(rooms.find(r => r.key === room)?.label || room, a),
    });
  };

  return (
    <form onSubmit={go} className="mx-4 mb-3 rounded-2xl bg-[#1b1c21] border border-[var(--ed-amber)]/30 p-3.5 space-y-2.5" noValidate>
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[13.5px] font-semibold"><Calculator className="w-4 h-4 text-[var(--ed-amber)]" /> {t.calcTitle}</p>
        <button type="button" onClick={onClose} aria-label={t.close} className="w-8 h-8 grid place-items-center rounded-full text-[#9a9a9f] hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      <label className="block">
        <span className="sr-only">{t.calcRoom}</span>
        <select value={room} onChange={e => setRoom(e.target.value)} className={field}>
          {rooms.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <input value={area} onChange={e => { setArea(e.target.value); setErr(''); }} placeholder={t.calcArea} inputMode="decimal" maxLength={6} className={field} aria-label={t.calcArea} />
        <input value={height} onChange={e => setHeight(e.target.value)} placeholder={t.calcHeight} inputMode="decimal" maxLength={4} className={field} aria-label={t.calcHeight} />
      </div>
      <select value={cct} onChange={e => setCct(e.target.value)} className={field} aria-label={t.calcCct}>
        <option value="0">{t.calcCct}: {t.calcAuto}</option>
        <option value="3000">{t.calcWarm}</option>
        <option value="4000">{t.calcNeutral}</option>
      </select>
      {err && <p className="text-[12px] text-[#ff8a80]" role="alert">{err}</p>}
      <button type="submit" className="ed-btn-primary w-full justify-center">{t.calcGo}</button>
    </form>
  );
};

// ------------------------------------------------------------------ shortlist tray
export const ShortlistTray: React.FC<{
  items: ProductCard[]; t: Strings; onRemove: (code: string) => void; onOpen: (slug: string) => void; onSend: () => void; onClose: () => void;
}> = ({ items, t, onRemove, onOpen, onSend, onClose }) => (
  <div className="absolute inset-x-0 top-[72px] bottom-0 z-10 bg-[#15161a] flex flex-col">
    <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
      <p className="flex items-center gap-2 text-[14px] font-semibold"><Star className="w-4 h-4 text-[var(--ed-amber)]" fill="currentColor" /> {t.fav} ({items.length})</p>
      <button type="button" onClick={onClose} aria-label={t.close} className="w-9 h-9 grid place-items-center rounded-full text-[#9a9a9f] hover:text-white"><X className="w-4 h-4" /></button>
    </div>
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
      {items.length === 0 && <p className="text-[13px] text-[#9a9a9f] text-center py-10">{t.favEmpty}</p>}
      {items.map(p => (
        <div key={p.code} className="flex items-center gap-3 rounded-2xl bg-[#1b1c21] border border-white/10 p-2.5">
          <button type="button" onClick={() => onOpen(p.slug)} className="flex items-center gap-3 text-left min-w-0 flex-1">
            <span className="ed-plate w-14 h-14 shrink-0 rounded-xl overflow-hidden grid place-items-center">
              {p.image && <img src={p.image} alt="" loading="lazy" className="w-full h-full object-contain p-1" />}
            </span>
            <span className="min-w-0 text-[12.5px] font-semibold leading-snug line-clamp-2">{p.name}</span>
          </button>
          <button type="button" onClick={() => onRemove(p.code)} aria-label={t.favRemove} className="w-9 h-9 shrink-0 grid place-items-center rounded-full text-[#8d8d92] hover:text-[#ff8a80]"><X className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
    {items.length > 0 && (
      <div className="p-4 border-t border-white/10">
        <button type="button" onClick={onSend} className="ed-btn-primary w-full justify-center">{t.favSend}</button>
      </div>
    )}
  </div>
);

// ------------------------------------------------------------------ callback time (Baku time: Mon-Sat 09:00-18:00)
export function callbackOptions(t: Strings): { value: string; label: string }[] {
  const b = new Date(Date.now() + 4 * 3600 * 1000);
  const day = b.getUTCDay();
  const h = b.getUTCHours() + b.getUTCMinutes() / 60;
  const wins: [string, string, number][] = [['am', '09:00-12:00', 12], ['noon', '12:00-15:00', 15], ['pm', '15:00-18:00', 18]];
  const opts = [{ value: 'asap', label: t.cbAsap }];
  if (day !== 0) for (const [k, l, end] of wins) if (end - h > 1) opts.push({ value: `today-${k}`, label: `${t.cbToday} ${l}` });
  const tomorrowIsSunday = (day + 1) % 7 === 0;
  for (const [k, l] of wins) opts.push({ value: `tmrw-${k}`, label: `${tomorrowIsSunday ? t.cbNext : t.cbTomorrow} ${l}` });
  return opts;
}

// ------------------------------------------------------------------ the secure contact form
export interface LeadState { name: string; phone: string; consent: boolean; website: string; callback: string }

export const LeadForm: React.FC<{
  t: Strings; lead: LeadState; setLead: (l: LeadState) => void; err: string; busy: boolean; onSubmit: (e: React.FormEvent) => void;
}> = ({ t, lead, setLead, err, busy, onSubmit }) => {
  const input = 'w-full min-h-[44px] rounded-xl bg-[#111216] border border-white/15 focus:border-[var(--ed-amber)] outline-none px-3.5 text-[14px] placeholder:text-[#8d8d92]';
  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <p className="text-[14px] font-semibold">{t.formTitle}</p>
      <label className="block">
        <span className="sr-only">{t.formName}</span>
        <input value={lead.name} onChange={e => setLead({ ...lead, name: e.target.value })} placeholder={t.formName} autoComplete="name" maxLength={80} className={input} />
      </label>
      <label className="block">
        <span className="sr-only">{t.formPhone}</span>
        <input value={lead.phone} onChange={e => setLead({ ...lead, phone: e.target.value })} placeholder={t.formPhone} type="tel" inputMode="tel" autoComplete="tel" maxLength={20} className={input} />
      </label>
      <label className="block">
        <span className="block text-[12px] text-[#b6b6bb] mb-1.5">{t.cbTitle}</span>
        <select value={lead.callback} onChange={e => setLead({ ...lead, callback: e.target.value })} className={input}>
          {callbackOptions(t).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      {/* honeypot: real visitors never see or fill this */}
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={lead.website} onChange={e => setLead({ ...lead, website: e.target.value })} className="absolute -left-[9999px] w-px h-px opacity-0" />
      <label className="flex items-start gap-2.5 text-[12px] text-[#b6b6bb] leading-snug cursor-pointer">
        <input type="checkbox" checked={lead.consent} onChange={e => setLead({ ...lead, consent: e.target.checked })} className="mt-0.5 w-4 h-4 accent-[#f5b937]" />
        {t.consent}
      </label>
      {err && <p className="text-[12px] text-[#ff8a80]" role="alert">{err}</p>}
      <button type="submit" disabled={busy} className="ed-btn-primary w-full justify-center disabled:opacity-60">{busy ? t.sending : t.submit}</button>
    </form>
  );
};

export const LeadDoneView: React.FC<{ t: Strings; short: string; whatsappUrl: string }> = ({ t, short, whatsappUrl }) => (
  <div className="space-y-3">
    <p className="flex items-center gap-2 text-[14px] font-semibold">
      <span className="w-6 h-6 rounded-full bg-[var(--ed-amber)] text-[#1d1d1b] grid place-items-center"><Check className="w-3.5 h-3.5" /></span>
      {t.doneTitle} {short && <span className="text-[#9a9a9f] font-normal">№{short}</span>}
    </p>
    <p className="text-[13px] text-[#c9c9cd] leading-relaxed">{t.doneText}</p>
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="ed-btn-primary w-full justify-center">
      <MessageCircle className="w-4 h-4" /> {t.wa}
    </a>
  </div>
);

// ------------------------------------------------------------------ photo downscaling (the model needs ~1024 px, not a 12 MP original)
export async function resizeImage(file: File, max = 896, quality = 0.78): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close?.();
  return canvas.toDataURL('image/jpeg', quality);
}

// ------------------------------------------------------------------ the two tools, explained in words (icons alone are easy to miss)
export const ToolCards: React.FC<{ t: Strings; photoOn: boolean; busy: boolean; onCalc: () => void; onPhoto: () => void }> = ({ t, photoOn, busy, onCalc, onPhoto }) => {
  const card = 'w-full flex items-start gap-3 text-left rounded-2xl border border-[var(--ed-amber)]/30 bg-[#1b1c21] hover:border-[var(--ed-amber)] p-3.5 transition-colors disabled:opacity-50';
  const icon = 'w-9 h-9 shrink-0 rounded-full bg-[var(--ed-amber)]/15 text-[var(--ed-amber)] grid place-items-center';
  return (
    <div className="grid gap-2 pt-1">
      <button type="button" onClick={onCalc} className={card}>
        <span className={icon}><Calculator className="w-[18px] h-[18px]" /></span>
        <span className="min-w-0"><span className="block text-[13.5px] font-semibold">{t.toolCalcTitle}</span><span className="block text-[12px] text-[#a8a8ad] leading-snug mt-0.5">{t.toolCalcDesc}</span></span>
      </button>
      {photoOn && (
        <button type="button" onClick={onPhoto} disabled={busy} className={card}>
          <span className={icon}><ImagePlus className="w-[18px] h-[18px]" /></span>
          <span className="min-w-0"><span className="block text-[13.5px] font-semibold">{t.toolPhotoTitle}</span><span className="block text-[12px] text-[#a8a8ad] leading-snug mt-0.5">{t.toolPhotoDesc}</span></span>
        </button>
      )}
    </div>
  );
};

export const ToolChips: React.FC<{ t: Strings; calcOn: boolean; photoOn: boolean; onCalc: () => void; onPhoto: () => void }> = ({ t, calcOn, photoOn, onCalc, onPhoto }) => {
  const chip = 'inline-flex items-center gap-1.5 min-h-[38px] rounded-full border border-white/15 hover:border-[var(--ed-amber)] hover:text-[var(--ed-amber)] px-3.5 text-[12.5px] text-[#d9d9dc] transition-colors';
  if (!calcOn && !photoOn) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 pt-0.5">
      <span className="text-[12px] text-[#8d8d92]">{t.toolsLead}</span>
      {calcOn && <button type="button" onClick={onCalc} className={chip}><Calculator className="w-3.5 h-3.5" /> {t.toolCalcChip}</button>}
      {photoOn && <button type="button" onClick={onPhoto} className={chip}><ImagePlus className="w-3.5 h-3.5" /> {t.toolPhotoChip}</button>}
    </div>
  );
};
