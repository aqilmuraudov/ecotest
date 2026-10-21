import type { CatalogItem } from './core.js';

/**
 * Lighting estimate for a room (lumen method). Deterministic and cheap: no model call is needed to answer "20 m2 living room".
 * Targets follow common EN 12464-1 maintained illuminance values; utilisation x maintenance is taken as 0.45.
 * The result is an estimate: exact placement is done by the consultant with Dialux.
 */
export interface RoomDef {
  key: string;
  lux: number;
  cct: number; // preferred colour temperature
  cats: string[]; // catalogue categories to draw products from, best first
  name: { az: string; ru: string; en: string };
  words: string; // stems customers use (az / ru / en)
}

export const ROOMS: RoomDef[] = [
  { key: 'living', lux: 150, cct: 3000, cats: ['downlights', 'linear', 'magnetic-systems'], name: { az: 'qonaq otağı', ru: 'гостиная', en: 'living room' }, words: 'qonaq|zal otağı|living|lounge|гостин' },
  { key: 'bedroom', lux: 100, cct: 3000, cats: ['downlights', 'led-lent'], name: { az: 'yataq otağı', ru: 'спальня', en: 'bedroom' }, words: 'yataq|bedroom|спальн' },
  { key: 'kitchen', lux: 300, cct: 4000, cats: ['downlights', 'panels', 'led-lent'], name: { az: 'mətbəx', ru: 'кухня', en: 'kitchen' }, words: 'mətbəx|metbex|kitchen|кухн' },
  { key: 'bathroom', lux: 200, cct: 3500, cats: ['downlights', 'panels'], name: { az: 'hamam', ru: 'ванная', en: 'bathroom' }, words: 'hamam|vanna|sanitar|bathroom|toilet|ванн|санузел|туалет|tualet' },
  { key: 'hall', lux: 100, cct: 3000, cats: ['downlights', 'linear'], name: { az: 'dəhliz', ru: 'коридор', en: 'hallway' }, words: 'dəhliz|dehliz|koridor|hall|corridor|прихож|коридор' },
  { key: 'office', lux: 500, cct: 4000, cats: ['panels', 'linear', 'downlights'], name: { az: 'ofis', ru: 'офис', en: 'office' }, words: 'ofis|office|офис|kabinet|кабинет|iş otağı' },
  { key: 'meeting', lux: 500, cct: 4000, cats: ['panels', 'linear', 'downlights'], name: { az: 'iclas otağı', ru: 'переговорная', en: 'meeting room' }, words: 'iclas|meeting|переговор' },
  { key: 'shop', lux: 500, cct: 4000, cats: ['track-lights', 'magnetic-systems', 'linear', 'downlights'], name: { az: 'mağaza', ru: 'магазин', en: 'shop' }, words: 'mağaza|magaza|shop|store|магазин|butik|бутик|showroom|şou-?rum' },
  { key: 'restaurant', lux: 200, cct: 3000, cats: ['track-lights', 'downlights', 'linear'], name: { az: 'restoran/kafe', ru: 'ресторан/кафе', en: 'restaurant/cafe' }, words: 'restoran|restaurant|ресторан|kafe|cafe|кафе|coffee|bar\\b|бар\\b' },
  { key: 'hotel', lux: 150, cct: 3000, cats: ['downlights', 'linear'], name: { az: 'otel otağı', ru: 'номер отеля', en: 'hotel room' }, words: 'otel|hotel|отел|гостиниц' },
  { key: 'gym', lux: 300, cct: 4000, cats: ['panels', 'linear', 'downlights'], name: { az: 'idman zalı', ru: 'спортзал', en: 'gym' }, words: 'idman|fitness|fitnes|gym|спортзал|фитнес' },
];

const EFFICACY: Record<string, number> = { downlights: 90, panels: 110, linear: 90, 'track-lights': 80, 'magnetic-systems': 80, 'led-lent': 80, bulbs: 80 };

const AREA_RE = /(\d{1,4}(?:[.,]\d+)?)\s*(?:m2|m²|m\^2|kv\.?\s?m|kvm|kvadrat|sq\.?\s?m|sqm|square\s?met|кв\.?\s?м|м2|м²|квадрат)/i;
const HEIGHT_RE = /(?:tavan|hündürlük|hundurluk|высот\w*|потол\w*|ceiling)\D{0,24}(\d(?:[.,]\d)?)\s*(?:m\b|metr|meter|м\b|метр)/i;
const CCT_RE = /\b([2-6]\d00)\s?k\b/i;

export function detectRoom(text: string): RoomDef | undefined {
  const s = text.toLowerCase();
  return ROOMS.find(r => new RegExp(`(?:^|[^\\p{L}])(?:${r.words})`, 'u').test(s));
}

/** Pull "room type + area (+ height, colour temperature)" out of free text; area is required, the rest is optional. */
export function parseRoomRequest(text: string): { room: RoomDef; area: number; height?: number; cct?: number } | null {
  const a = AREA_RE.exec(text);
  const room = detectRoom(text);
  if (!a || !room) return null;
  const area = Number(a[1].replace(',', '.'));
  if (!(area >= 2 && area <= 3000)) return null;
  const h = HEIGHT_RE.exec(text);
  const k = CCT_RE.exec(text);
  const height = h ? Number(h[1].replace(',', '.')) : undefined;
  return { room, area, height: height && height >= 2 && height <= 12 ? height : undefined, cct: k ? Number(k[1]) : undefined };
}

const wattOf = (i: CatalogItem): number => {
  const m = /(\d+(?:[.,]\d+)?)\s*W/i.exec(i.specs.power || '');
  return m ? Number(m[1].replace(',', '.')) : 0;
};
const cctOf = (i: CatalogItem): number => Number((i.specs.cct || '').replace(/\D/g, '')) || 0;

export interface PlanOption { item: CatalogItem; count: number; perW: number; totalW: number }
export interface RoomPlan {
  room: RoomDef;
  area: number;
  height: number;
  lux: number;
  lumens: number;
  watts: number;
  cct: number;
  options: PlanOption[];
}

export function roomPlan(room: RoomDef, area: number, items: CatalogItem[], height = 2.8, cct?: number): RoomPlan {
  const hf = 1 + Math.max(0, height - 2.8) * 0.12; // higher ceilings need more light at the working plane
  const lumens = Math.round((room.lux * area * hf) / 0.45 / 100) * 100;
  const want = cct || room.cct;
  const options: PlanOption[] = [];
  let watts = 0;
  for (const cat of room.cats) {
    const eff = EFFICACY[cat] || 85;
    const w = Math.round(lumens / eff);
    if (!watts) watts = w;
    // fixtures of this category with the closest colour temperature and a known wattage
    const pool = items
      .filter(i => i.category === cat && wattOf(i) > 0 && cctOf(i) > 0)
      .map(i => ({ i, d: Math.abs(cctOf(i) - want), w: wattOf(i) }))
      .sort((a, b) => a.d - b.d);
    if (!pool.length) continue;
    const bestD = pool[0].d;
    const sameCct = pool.filter(p => p.d === bestD);
    // two sensible sizes: roughly 4-10 fixtures and 10-25 fixtures
    const pick = (target: number) => sameCct.slice().sort((a, b) => Math.abs(Math.ceil(w / a.w) - target) - Math.abs(Math.ceil(w / b.w) - target))[0];
    const picks = [pick(6), pick(14)].filter((p, idx, arr) => p && arr.findIndex(q => q.i.code === p.i.code) === idx);
    for (const p of picks) options.push({ item: p.i, count: Math.max(1, Math.ceil(w / p.w)), perW: p.w, totalW: Math.max(1, Math.ceil(w / p.w)) * p.w });
    if (options.length >= 3) break;
  }
  return { room, area, height, lux: room.lux, lumens, watts, cct: want, options: options.slice(0, 3) };
}

/** A short, customer-facing answer built from the numbers (used when no language model is needed). */
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export function planText(p: RoomPlan, lang: 'az' | 'ru' | 'en'): string {
  const rn = p.room.name[lang];
  const first = p.options[0];
  const more = p.options.slice(1);
  const line = (o: PlanOption) => `${o.count} × ${o.item.name} (${o.perW} W)`;
  if (lang === 'ru') {
    return `Для помещения «${rn}» площадью ${p.area} м² нужна освещённость около ${p.lux} лк. Это примерно ${fmt(p.lumens)} лм, то есть около ${p.watts} Вт суммарно (${p.cct} K). ` +
      (first ? `Например: ${line(first)}${more.map(o => `; или ${line(o)}`).join('')}. ` : '') +
      'Это ориентировочный расчёт: точную расстановку наш специалист выполнит в Dialux.';
  }
  if (lang === 'en') {
    return `For a ${p.area} m² ${rn} the target light level is about ${p.lux} lux. That is about ${fmt(p.lumens)} lumens, or about ${p.watts} W in total (${p.cct}K). ` +
      (first ? `For example: ${line(first)}${more.map(o => `; or ${line(o)}`).join('')}. ` : '') +
      'This is an approximate calculation: our consultant prepares the exact layout in Dialux.';
  }
  return `${p.area} m² ${rn} üçün hədəf işıqlandırma təxminən ${p.lux} lüksdür. Bu, təxminən ${fmt(p.lumens)} lümen, yəni ümumilikdə təxminən ${p.watts} W (${p.cct}K) deməkdir. ` +
    (first ? `Məsələn: ${line(first)}${more.map(o => `; yaxud ${line(o)}`).join('')}. ` : '') +
    'Bu təxmini hesabdır: dəqiq yerləşdirməni məsləhətçimiz Dialux ilə hazırlayır.';
}

/** Compact block for the model prompt. */
export function planPrompt(p: RoomPlan, fresh = true): string {
  const opts = p.options.map((o, i) => `  ${String.fromCharCode(65 + i)}) ${o.count} x ${o.item.name} (${o.perW} W each, about ${o.totalW} W total) [${o.item.code}]`).join('\n');
  return `CALCULATION (lumen method, approximate; use these numbers, never invent others): ${p.room.key}, ${p.area} m2, ceiling ${p.height} m, target about ${p.lux} lux -> about ${p.lumens} lm -> about ${p.watts} W total at ${p.cct}K.\n${opts}\n${fresh ? 'Explain it in 2-3 short sentences (target light level, total power, how many fixtures of which kind), call recommend_products with the codes of the options, and say that the consultant will confirm the exact layout with Dialux.' : 'These numbers and options were already presented earlier in the conversation: do NOT show these product cards again; use the numbers only if the customer asks about quantities or the calculation.'}`;
}
