import { Product } from '../types';
import { getLocalizedText } from './lang';

/** Məlum CCT dəyərləri üçün oxunaqlı etiketlər */
const CCT_LABELS: Record<string, string> = {
  '2200K': '2200K Çox İsti',
  '2700K': '2700K İsti',
  '3000K': '3000K İsti Ağ',
  '3500K': '3500K Neytral İsti',
  '4000K': '4000K Neytral',
  '4500K': '4500K Neytral',
  '5000K': '5000K Gündüz',
  '5700K': '5700K Soyux',
  '6000K': '6000K Soyux',
  '6500K': '6500K Soyux Ağ',
  'TUNABLE WHITE': 'Tunable White'
};

function normalizeCctKey(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase();
}

/**
 * Məhsulun REAL CCT seçimlərini toplayır.
 * Mənbələr: specs.cct ("2700K / 3000K / 4000K / Tunable White") + ad/təsvirdəki (6000K) formatı.
 * Real məlumat yoxdursa boş massiv qaytarır — UI heç nə göstərmir (yalan info yox).
 */
export function getCctOptions(product: Product): string[] {
  const found: string[] = [];
  const seen = new Set<string>();

  const push = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const key = normalizeCctKey(trimmed);
    if (key && !seen.has(key)) {
      seen.add(key);
      found.push(trimmed);
    }
  };

  // 1) specs.cct ("2700K / 3000K / 4000K / Tunable White") — admin tərəfindən daxil edilmiş real data
  const specsCct = product.specs?.cct;
  if (typeof specsCct === 'string' && specsCct.trim()) {
    for (const part of specsCct.split(/[\/,;|]/)) {
      const t = part.trim();
      if (!t) continue;
      if (/^tunable(\s*white)?$/i.test(t)) {
        push('Tunable White');
      } else {
        push(t);
      }
    }
  }

  // 2) Ad + təsvirdəki inline dəyərlər (məs. "D30 48V 20W 4000K 35mm" → 4000K)
  const inlineHay = `${product.name || ''} ${getLocalizedText(product.description, 'az')}`;
  const inlineMatches = inlineHay.match(/\b\d{4}\s*K\b/gi);
  if (inlineMatches) {
    for (const m of inlineMatches) {
      push(m.replace(/\s+/g, '').toUpperCase());
    }
  }

  return found;
}

/** CCT dəyərini oxunaqlı etiketə çevirir (3000K → 3000K İsti Ağ) */
export function cctLabel(value: string): string {
  return CCT_LABELS[normalizeCctKey(value)] || value;
}

/**
 * Məhsulun REAL rəng/örtük seçimlərini qaytarır.
 * Yalnız specs.colorOptions və ya specs.finish mövcuddursa — əks halda boş massiv.
 */
export function getFinishOptions(product: Product): string[] {
  const colorOptions = product.specs?.colorOptions;
  if (Array.isArray(colorOptions) && colorOptions.length) {
    return colorOptions.filter((c): c is string => typeof c === 'string' && c.trim().length > 0);
  }
  const finish = product.specs?.finish;
  if (typeof finish === 'string' && finish.trim()) {
    return finish
      .split('/')
      .map(f => f.trim())
      .filter(Boolean);
  }
  return [];
}

export function shouldShowWarrantyBadge(_product: Product): boolean {
  return false;
}

/**
 * Removes duplicate product images from gallery:
 * - Bulk-import duplicate uploads (/ecolife_bulk_import/ second copy of main image)
 * - Identical URLs or URLs with the same base filename before timestamp (-1788157498024.png)
 */
export function dedupeProductGallery(mainImage?: string, rawGallery?: unknown): string[] {
  const main = typeof mainImage === 'string' ? mainImage.trim() : '';
  const raw = Array.isArray(rawGallery)
    ? rawGallery.filter((g): g is string => typeof g === 'string' && g.trim().length > 0).map(g => g.trim())
    : [];

  const getCanonicalKey = (url: string) =>
    url.replace(/-\d{10,14}(\.[a-zA-Z0-9]+)$/, '$1');

  const seen = new Set<string>();
  const result: string[] = [];

  const addUnique = (url: string) => {
    if (!url) return;
    const key = getCanonicalKey(url);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(url);
  };

  addUnique(main);

  for (const g of raw) {
    // Bulk import uploaded the single product image twice (once for image, once for gallery[0])
    if (main && g.includes('/ecolife_bulk_import/')) {
      continue;
    }
    addUnique(g);
  }

  return result;
}

