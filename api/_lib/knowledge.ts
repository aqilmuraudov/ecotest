import { loadProjects, type ProjectInfo } from './core.js';
import { blogPosts } from '../../src/data/blog.js';
import { solutions } from '../../src/data/solutions.js';
import { initialPagesContent } from '../../src/data/pagesContent.js';

/**
 * What AISeller knows about the website beyond the product catalogue: projects, solutions, articles, the company and how to reach it.
 * Nothing here costs tokens unless the customer's message is about it: a block is added to the prompt only on a matching intent.
 */
type L = 'az' | 'ru';
const tr = (v: any, l: L): string => (typeof v === 'string' ? v : String(v?.[l] || v?.az || ''));
const clip = (s: string, n: number) => {
  const t = s.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
};

export const SITEMAP = [
  '/catalog (products), /catalog/<category> (categories), /projects (our realised projects), /projects/<slug>, /solutions (solutions by space type),',
  '/configurator (lighting configurator), /blog (articles), /about (company), /contact (contacts and request form).',
].join(' ');

const RE = {
  projects: /(layih|proyekt|проект|project|portfolio|portfel|nümun|referans|реализ|işlərin|işləriniz|работ)/i,
  solutions: /(həll|hell\b|solution|решени|tətbiq|применен)/i,
  blog: /(məqalə|meqale|blog|xəbər|статья|статей|article|cri\b|ugr\b|kelvin|rəng temperatur|lümen|lumen|люмен)/i,
  company: /(haqq[ıi]n[dt]a|kimsiniz|şirkət|sirket|istehsal|zavod|fabrik|o компани|о вас|о компании|производ|компани|about|ünvan|unvan|address|адрес|telefon|nömr|phone|телефон|e-?po[çc]t|email|почт|iş saat|iş vaxt|working hours|время работы|график|harada|where are|где наход|dialux|xidmət|услуг|montaj|монтаж|sifari[şs] ver|əlaqə|elaqe|contact|kontakt|связат)/i,
};
const CAT_WORDS: [string, RegExp][] = [
  ['restaurant', /(restoran|restaurant|ресторан|kafe|cafe|кафе|coffee|bar\b)/i],
  ['office', /(ofis|office|офис|korporativ|iş mərkəz)/i],
  ['commercial', /(mağaza|magaza|ticarət|ticaret|commercial|магазин|торгов|butik|avtosalon|fitness|studio|salon|aptek|apteka)/i],
];
const STOP = new Set(['hansı', 'hansılar', 'layihə', 'layihələr', 'layihəniz', 'layihələriniz', 'var', 'varmı', 'bizim', 'sizin', 'üçün', 'haqqında', 'məlumat', 'göstərin', 'проект', 'проекты', 'какие', 'есть', 'покажите', 'project', 'projects', 'which', 'show', 'have', 'özünüz', 'işləyib', 'tamamladığı', 'tamamladığınız']);

export interface KnowledgeCard { slug: string; title: string; image: string; category: string; year: string }
export interface Knowledge { text: string; projectCards: KnowledgeCard[] }

function projectLine(p: ProjectInfo, lang: L, chars = 150): string {
  return `- ${p.title.trim()} (${p.category}${p.year ? ', ' + p.year : ''}${p.location ? ', ' + p.location : ''}): ${clip(p.desc[lang] || p.desc.az, chars)}`;
}

function articleBlock(q: string, lang: L): string {
  const toks = q.toLowerCase().split(/[^\p{L}\d]+/u).filter(t => t.length >= 4 && !STOP.has(t));
  const scored = blogPosts
    .map(b => {
      const hay = `${tr(b.title, lang)} ${tr(b.summary, lang)} ${b.category}`.toLowerCase();
      return { b, s: toks.reduce((n, t) => n + (hay.includes(t.slice(0, 5)) ? 1 : 0), 0) };
    })
    .sort((a, b) => b.s - a.s);
  const top = (scored[0]?.s ? scored.filter(x => x.s > 0) : scored).slice(0, 2);
  if (!top.length) return '';
  return 'ARTICLES (blog):\n' + top.map(({ b }) => `- "${tr(b.title, lang)}" /blog/${b.slug}: ${clip(tr(b.summary, lang) + ' ' + (b.content[lang] || b.content.az).join(' '), 320)}`).join('\n');
}

function companyBlock(lang: L): string {
  const a = initialPagesContent.about;
  const c = initialPagesContent.contact;
  const pts = (a.facilityPoints[lang] || a.facilityPoints.az).slice(0, 4).join('; ');
  return [
    'COMPANY:',
    `- ${clip(tr(a.storyP1, lang), 260)} ${clip(tr(a.storyP2, lang), 200)}`,
    `- Capabilities: ${pts}.`,
    `- Contact: phone/WhatsApp ${c.phone}, e-mail ${c.email}, address ${tr(c.address, lang)}, hours ${tr(c.hours, lang)}.`,
  ].join('\n');
}

function solutionsBlock(lang: L): string {
  return 'SOLUTIONS (/solutions/<slug>):\n' + solutions.map(s => `- ${tr(s.title, lang)} /solutions/${s.slug}: ${clip(tr(s.subtitle, lang), 110)}`).join('\n');
}

/** Block for the prompt (empty when the message is not about the site itself) plus project cards to show. */
export async function knowledgeFor(userText: string, lang: L, page?: { type: string; id?: string }): Promise<Knowledge> {
  const q = userText || '';
  const parts: string[] = [];
  let projectCards: KnowledgeCard[] = [];

  const wantsProjects = RE.projects.test(q);
  if (wantsProjects || page?.type === 'projects') {
    const all = await loadProjects();
    if (all.length) {
      const cats = CAT_WORDS.filter(([, re]) => re.test(q)).map(([id]) => id);
      const toks = q.toLowerCase().split(/[^\p{L}\d]+/u).filter(t => t.length >= 3 && !STOP.has(t));
      // a project named in the question (e.g. "Papa Johns") beats the category filter
      const byName = all.filter(p => toks.some(t => p.title.toLowerCase().includes(t)));
      let pool = byName.length && byName.length <= 4 ? byName : all;
      if (pool === all && cats.length) pool = all.filter(p => cats.includes(p.category));
      if (!pool.length) pool = all;
      const counts = ['restaurant', 'office', 'commercial'].map(c => `${c} ${all.filter(p => p.category === c).length}`).join(', ');
      const shown = pool.slice(0, 6);
      parts.push(`PROJECTS (${all.length} realised projects: ${counts}). ${pool === all ? 'Newest/relevant ones' : `${pool.length} match`}:\n${shown.map(p => projectLine(p, lang, byName.length && byName.length <= 2 ? 700 : 150)).join('\n')}\nThe system shows cards with links for the first three; mention them by name, do not write links.`);
      projectCards = shown.slice(0, 3).map(p => ({ slug: p.slug, title: p.title.trim(), image: p.image, category: p.category, year: p.year }));
    }
  }
  if (RE.solutions.test(q) || page?.type === 'solutions') parts.push(solutionsBlock(lang));
  if (RE.blog.test(q) || page?.type === 'blog') {
    const b = articleBlock(q, lang);
    if (b) parts.push(b);
  }
  if (RE.company.test(q) || page?.type === 'about' || page?.type === 'contact') parts.push(companyBlock(lang));
  return { text: parts.join('\n'), projectCards };
}
