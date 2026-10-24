import { describe, expect, it } from 'vitest';
import { ROOMS, planText, roomPlan } from '../api/_lib/calc';
import type { CatalogItem } from '../api/_lib/core';

// a small catalogue with the same fixture in warm, in-between and neutral versions
const item = (code: string, category: string, w: number, k: number): CatalogItem => ({
  code, slug: code.toLowerCase(), name: `${category} ${w}W ${k}K`, category,
  categoryName: { az: category, en: category, ru: category }, image: '', url: `https://site.test/catalog/${code}`,
  specs: { power: `${w}W`, cct: `${k}K` }, haystack: '',
});
const CATALOG: CatalogItem[] = [];
for (const cat of ['downlights', 'panels', 'linear', 'track-lights', 'magnetic-systems', 'led-lent']) {
  for (const k of [3000, 3500, 4000]) for (const w of [7, 10, 20]) CATALOG.push(item(`${cat}-${w}-${k}`, cat, w, k));
}
const room = (key: string) => ROOMS.find(r => r.key === key)!;
const ccts = (key: string, cct?: number) => [...new Set(roomPlan(room(key), 20, CATALOG, undefined, cct).options.map(o => o.item.specs.cct))];

describe('calculator colour temperature', () => {
  it.each(['living', 'kitchen', 'bathroom', 'hall', 'office', 'meeting', 'shop', 'gym'])('auto: %s gets neutral 4000K', key => {
    expect(roomPlan(room(key), 20, CATALOG).cct).toBe(4000);
    expect(ccts(key)).toEqual(['4000K']);
  });

  it.each(['bedroom', 'hotel', 'restaurant'])('auto: %s stays warm 3000K', key => {
    expect(ccts(key)).toEqual(['3000K']);
  });

  it('auto is not warm for most rooms (regression: it used to be warm by default)', () => {
    expect(ROOMS.filter(r => r.cct <= 3200).map(r => r.key).sort()).toEqual(['bedroom', 'hotel', 'restaurant']);
  });

  it.each([3000, 4000])('a chosen %iK wins over the room default', k => {
    for (const r of ROOMS) expect(ccts(r.key, k)).toEqual([`${k}K`]);
  });

  it('falls back to the closest colour temperature in stock', () => {
    const onlyWarm = CATALOG.filter(i => i.specs.cct === '3000K');
    expect([...new Set(roomPlan(room('office'), 20, onlyWarm).options.map(o => o.item.specs.cct))]).toEqual(['3000K']);
  });

  it('the answer names the tone next to the Kelvin value', () => {
    expect(planText(roomPlan(room('living'), 20, CATALOG), 'az')).toContain('(4000K, neytral ağ işıq)');
    expect(planText(roomPlan(room('bedroom'), 20, CATALOG), 'ru')).toContain('(3000 K, тёплый свет)');
    expect(planText(roomPlan(room('office'), 20, CATALOG, undefined, 6000), 'en')).toContain('(6000K, cool white)');
  });
});
