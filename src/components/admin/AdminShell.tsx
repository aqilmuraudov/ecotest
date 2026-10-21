import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, ArrowUpRight, Database, Eye, Globe, LogOut, RefreshCw } from 'lucide-react';
import type { Language } from '../../types';

/**
 * Admin shell: slim top bar, a card hub that replaces the long scrolling tab strip, and a section header with a quick switcher.
 * Pure presentation: the sections themselves (products, projects, ...) are rendered by AdminPage as before.
 */
export type SectionId = 'products' | 'projects' | 'blog' | 'pages' | 'inquiries' | 'ai' | 'ai_settings' | 'users' | 'import_export' | 'database';
type Tone = 'gold' | 'violet' | 'blue' | 'teal' | 'emerald' | 'pink' | 'amber' | 'sky' | 'orange' | 'slate';
type Group = 'content' | 'customers' | 'system';

export interface SectionDef {
  id: SectionId;
  group: Group;
  label: string;
  icon: LucideIcon;
  tone: Tone;
  count?: number;
  badge?: number; // attention number (for example new inquiries)
}

// literal class names so Tailwind keeps them
const TONES: Record<Tone, { tile: string; text: string; hover: string; glow: string }> = {
  gold: { tile: 'bg-[#FFD21A]/12 text-[#FFD21A]', text: 'text-[#FFD21A]', hover: 'hover:border-[#FFD21A]/40', glow: 'from-[#FFD21A]/10' },
  violet: { tile: 'bg-violet-500/12 text-violet-300', text: 'text-violet-300', hover: 'hover:border-violet-400/40', glow: 'from-violet-500/10' },
  blue: { tile: 'bg-blue-500/12 text-blue-300', text: 'text-blue-300', hover: 'hover:border-blue-400/40', glow: 'from-blue-500/10' },
  teal: { tile: 'bg-teal-500/12 text-teal-300', text: 'text-teal-300', hover: 'hover:border-teal-400/40', glow: 'from-teal-500/10' },
  emerald: { tile: 'bg-emerald-500/12 text-emerald-300', text: 'text-emerald-300', hover: 'hover:border-emerald-400/40', glow: 'from-emerald-500/10' },
  pink: { tile: 'bg-pink-500/12 text-pink-300', text: 'text-pink-300', hover: 'hover:border-pink-400/40', glow: 'from-pink-500/10' },
  amber: { tile: 'bg-amber-500/12 text-amber-300', text: 'text-amber-300', hover: 'hover:border-amber-400/40', glow: 'from-amber-500/10' },
  sky: { tile: 'bg-sky-500/12 text-sky-300', text: 'text-sky-300', hover: 'hover:border-sky-400/40', glow: 'from-sky-500/10' },
  orange: { tile: 'bg-orange-500/12 text-orange-300', text: 'text-orange-300', hover: 'hover:border-orange-400/40', glow: 'from-orange-500/10' },
  slate: { tile: 'bg-slate-400/12 text-slate-300', text: 'text-slate-300', hover: 'hover:border-slate-300/40', glow: 'from-slate-400/10' },
};

const TEXT: Record<Language, { groups: Record<Group, string>; back: string; open: string; switch: string; hello: string; helloSub: string; newInq: (n: number) => string; review: string; desc: Record<SectionId, string> }> = {
  az: {
    groups: { content: 'Məzmun', customers: 'Müştərilər', system: 'Sistem' },
    back: 'Panel', open: 'Aç', switch: 'Bölməyə keç', hello: 'Xoş gəlmisiniz', helloSub: 'Saytın bütün bölmələri bir yerdə. Birini seçin.',
    newInq: n => `${n} yeni sorğu gözləyir`, review: 'Bax',
    desc: {
      products: 'Kataloq, şəkillər, kateqoriyalar', projects: 'Portfel və layihə səhifələri', blog: 'Xəbərlər və məqalələr', pages: 'Ana səhifə, haqqımızda, əlaqə mətnləri',
      inquiries: 'Formalardan və söhbətdən gələn müraciətlər', ai: 'AI söhbətlər və təklif mətni testi', ai_settings: 'Modellər, ehtiyatlar, vision və açarlar',
      users: 'Admin və moderator hesabları', import_export: 'Məhsulları Excel/JSON ilə yüklə və çıxar', database: 'Baza vəziyyəti, sxem və ilkin məlumatlar',
    },
  },
  en: {
    groups: { content: 'Content', customers: 'Customers', system: 'System' },
    back: 'Dashboard', open: 'Open', switch: 'Jump to section', hello: 'Welcome back', helloSub: 'Everything on the site in one place. Pick a section.',
    newInq: n => `${n} new ${n === 1 ? 'inquiry' : 'inquiries'} waiting`, review: 'Review',
    desc: {
      products: 'Catalogue, images, categories', projects: 'Portfolio and project pages', blog: 'News and articles', pages: 'Home, about and contact texts',
      inquiries: 'Requests from forms and chat', ai: 'AI conversations and nudge A/B test', ai_settings: 'Models, fallbacks, vision and keys',
      users: 'Admin and moderator accounts', import_export: 'Import and export products (Excel/JSON)', database: 'Database status, schema and seed data',
    },
  },
  ru: {
    groups: { content: 'Контент', customers: 'Клиенты', system: 'Система' },
    back: 'Панель', open: 'Открыть', switch: 'Перейти к разделу', hello: 'С возвращением', helloSub: 'Все разделы сайта в одном месте. Выберите нужный.',
    newInq: n => `Новых заявок: ${n}`, review: 'Смотреть',
    desc: {
      products: 'Каталог, изображения, категории', projects: 'Портфолио и страницы проектов', blog: 'Новости и статьи', pages: 'Тексты главной, о нас и контактов',
      inquiries: 'Заявки из форм и чата', ai: 'Диалоги ИИ и A/B тест подсказок', ai_settings: 'Модели, резерв, vision и ключи',
      users: 'Аккаунты админов и модераторов', import_export: 'Импорт и экспорт товаров (Excel/JSON)', database: 'Состояние базы, схема и начальные данные',
    },
  },
};
export const adminText = (lang: Language) => TEXT[lang] || TEXT.az;

// ------------------------------------------------------------------ top bar
export const AdminTopBar: React.FC<{
  title: string; liveLabel: string; lang: Language; onLang: (l: Language) => void; role: string; loading: boolean;
  refreshLabel: string; siteLabel: string; logoutLabel: string; onRefresh: () => void; onSite: () => void; onLogout: () => void;
}> = ({ title, liveLabel, lang, onLang, role, loading, refreshLabel, siteLabel, logoutLabel, onRefresh, onSite, onLogout }) => (
  <div className="sticky top-16 z-30 border-b border-white/[0.07] bg-[#0B0C10]/80 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-[#FFD21A]/12 border border-[#FFD21A]/25 grid place-items-center text-[#FFD21A] shrink-0"><Database className="w-4 h-4" /></div>
        <h1 className="text-[15px] font-semibold tracking-tight truncate">{title}</h1>
        <span className="hidden xl:inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {liveLabel}
        </span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="flex items-center rounded-lg bg-white/[0.05] border border-white/10 p-0.5 text-[11px] font-semibold" role="group" aria-label="Language">
          <Globe className="w-3.5 h-3.5 text-[#FFD21A] mx-1.5 hidden sm:block" />
          {(['az', 'ru', 'en'] as Language[]).map(l => (
            <button key={l} type="button" onClick={() => onLang(l)} className={`px-2 py-1 rounded-md uppercase transition-colors ${lang === l ? 'bg-[#FFD21A] text-black' : 'text-gray-400 hover:text-white'}`}>{l}</button>
          ))}
        </div>
        <button type="button" onClick={onRefresh} title={refreshLabel} aria-label={refreshLabel} className="h-9 px-2.5 sm:px-3 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-gray-300 text-xs flex items-center gap-1.5 transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> <span className="hidden md:inline">{refreshLabel}</span>
        </button>
        <button type="button" onClick={onSite} title={siteLabel} aria-label={siteLabel} className="h-9 px-2.5 sm:px-3 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-gray-300 text-xs flex items-center gap-1.5 transition-colors">
          <Eye className="w-3.5 h-3.5" /> <span className="hidden md:inline">{siteLabel}</span>
        </button>
        <span className={`hidden sm:inline-block h-9 leading-9 px-3 rounded-lg bg-white/[0.05] border border-white/10 text-[11px] font-semibold uppercase tracking-wide ${role === 'admin' ? 'text-[#FFD21A]' : 'text-sky-300'}`}>{role}</span>
        <button type="button" onClick={onLogout} title={logoutLabel} aria-label={logoutLabel} className="h-9 px-2.5 sm:px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs flex items-center gap-1.5 transition-colors">
          <LogOut className="w-3.5 h-3.5" /> <span className="hidden md:inline">{logoutLabel}</span>
        </button>
      </div>
    </div>
  </div>
);

// ------------------------------------------------------------------ hub of section cards
export const AdminHub: React.FC<{ sections: SectionDef[]; lang: Language; onOpen: (id: SectionId) => void }> = ({ sections, lang, onOpen }) => {
  const tx = adminText(lang);
  const groups: Group[] = ['content', 'customers', 'system'];
  return (
    <div className="space-y-9">
      {groups.map(g => {
        const list = sections.filter(s => s.group === g);
        if (!list.length) return null;
        return (
          <section key={g} aria-label={tx.groups[g]}>
            <div className="flex items-center gap-3 mb-3.5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">{tx.groups[g]}</h2>
              <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {list.map(s => {
                const tone = TONES[s.tone];
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onOpen(s.id)}
                    className={`group relative overflow-hidden text-left rounded-2xl border border-white/[0.08] bg-[#101218] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#13151C] ${tone.hover}`}
                  >
                    <span className={`pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${tone.glow} to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} aria-hidden="true" />
                    <div className="relative flex items-start justify-between gap-3">
                      <span className={`w-11 h-11 rounded-xl grid place-items-center ${tone.tile}`}><Icon className="w-5 h-5" /></span>
                      {s.badge ? (
                        <span className="min-w-[24px] h-6 px-2 rounded-full bg-amber-400 text-black text-[11px] font-bold grid place-items-center shadow-[0_0_14px_rgba(251,191,36,0.45)]">+{s.badge}</span>
                      ) : s.count !== undefined ? (
                        <span className="text-2xl font-semibold tracking-tight text-white leading-none">{s.count}</span>
                      ) : null}
                    </div>
                    <div className="relative mt-4">
                      <h3 className="text-[15px] font-semibold text-white">{s.label}</h3>
                      <p className="text-[12.5px] text-gray-400 leading-snug mt-1 min-h-[34px]">{tx.desc[s.id]}</p>
                    </div>
                    <div className={`relative mt-3.5 inline-flex items-center gap-1 text-xs font-medium ${tone.text} opacity-80 group-hover:opacity-100`}>
                      {tx.open} <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ header of an opened section
export const SectionHeader: React.FC<{
  section: SectionDef; sections: SectionDef[]; lang: Language; onBack: () => void; onSwitch: (id: SectionId) => void;
}> = ({ section, sections, lang, onBack, onSwitch }) => {
  const tx = adminText(lang);
  const tone = TONES[section.tone];
  const Icon = section.icon;
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3.5 min-w-0">
        <button type="button" onClick={onBack} className="h-10 pl-2.5 pr-3.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0">
          <ArrowLeft className="w-4 h-4" /> {tx.back}
        </button>
        <span className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${tone.tile}`}><Icon className="w-[18px] h-[18px]" /></span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight leading-tight flex items-center gap-2">
            {section.label}
            {section.count !== undefined && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/[0.07] text-gray-300">{section.count}</span>}
          </h2>
          <p className="text-[12.5px] text-gray-400 truncate">{tx.desc[section.id]}</p>
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
        <span className="hidden md:inline">{tx.switch}</span>
        <select
          value={section.id}
          onChange={e => onSwitch(e.target.value as SectionId)}
          className="h-10 min-w-[180px] rounded-xl bg-[#101218] border border-white/10 hover:border-white/20 focus:border-[#FFD21A]/50 outline-none px-3 text-sm text-white"
          aria-label={tx.switch}
        >
          {sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </label>
    </div>
  );
};
