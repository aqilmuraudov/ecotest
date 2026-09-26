import { CategoryItem, Product } from '../types';

// CSV idxalında da istifadə olunan standart placeholder şəkil
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80';

export interface ResolvedCategory {
  id: string;
  az: string;
  en: string;
  ru: string;
}

/**
 * Köhnə ecolife.az kataloqundakı xam kateqoriya adları (böyük hərflə AZ)
 * saytın daxili kateqoriya id-lərinə + lokalizə olunmuş adlarına map olunur.
 */
export const IMPORT_CATEGORY_MAP: Record<string, ResolvedCategory> = {
  'GÖMÜLMÜŞ': { id: 'recessed', az: 'Gömülmüş', en: 'Recessed', ru: 'Встраиваемые' },
  'STRIP_LENT': { id: 'strip-lights', az: 'Lent İşıqlar', en: 'LED Strips', ru: 'Светодиодные ленты' },
  'STRIP LENT': { id: 'strip-lights', az: 'Lent İşıqlar', en: 'LED Strips', ru: 'Светодиодные ленты' },
  'STRIP': { id: 'strip-lights', az: 'Lent İşıqlar', en: 'LED Strips', ru: 'Светодиодные ленты' },
  'TREK': { id: 'track-systems', az: 'Trek Sistemləri', en: 'Track Systems', ru: 'Трековые системы' },
  'ASMA': { id: 'pendants', az: 'Asma İşıqlar', en: 'Pendant Lights', ru: 'Подвесные светильники' },
  'SƏTHI': { id: 'surface-mounted', az: 'Səthi Quraşdırma', en: 'Surface Mounted', ru: 'Накладные' },
  'BULB': { id: 'bulbs', az: 'Lampalar', en: 'Bulbs', ru: 'Лампы' },
  'DRIVER': { id: 'drivers', az: 'Driver', en: 'Drivers', ru: 'Блоки питания' },
  'PCB': { id: 'pcb-boards', az: 'PCB Platalar', en: 'PCB Boards', ru: 'PCB платы' },
  'DEKORATIV': { id: 'decorative', az: 'Dekorativ', en: 'Decorative', ru: 'Декоративные' },
  'SPOT': { id: 'spot-downlight', az: 'Spot & Downlight', en: 'Spot & Downlight', ru: 'Споты и даунлайты' }
};

/** id/slug generasiyası üçün təhlükəsiz qısa slug */
export function slugifyId(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

/**
 * Məhsul adından/təsvirindən REAL texniki göstəriciləri çıxarır:
 * güc (3X10W, 20W), gərginlik (220V, 160-240V, 48V), rəng temperaturu (6000K), IP (IP65).
 * Uyğunlaşmayan sahələr əlavə olunmur — yalan defolt info yaranmır.
 */
export function extractSpecsFromName(text: string): Record<string, string> {
  const specs: Record<string, string> = {};
  if (!text) return specs;

  // CCT: 6000K, 3500K, 4000K ... (birdən çox ola bilər)
  const cctMatches = text.match(/\b\d{4}\s*K\b/gi);
  if (cctMatches && cctMatches.length) {
    const values = Array.from(new Set(cctMatches.map(m => m.replace(/\s+/g, '').toUpperCase())));
    specs.cct = values.join(' / ');
  }

  // Gərginlik: 220V, 48V, 160-240V
  const voltMatch = text.match(/\b(\d{2,3}\s*-\s*\d{2,3}|\d{2,3})\s*V\b/i);
  if (voltMatch) {
    specs.voltage = `${voltMatch[1].replace(/\s+/g, '')}V`;
  }

  // IP dərəcəsi: IP65, IP20, ip 44
  const ipMatch = text.match(/\bIP\s?-?(\d{2})\b/i);
  if (ipMatch) {
    specs.ipRating = `IP${ipMatch[1]}`;
  }

  // Güc: 3X10W, 2x7W, 20W, 0.5W, 07W
  const powerMatch = text.match(/\b\d{1,3}\s*[xX×]\s*\d{1,3}\s*W\b|\b\d{1,4}(?:[.,]\d+)?\s*W\b/i);
  if (powerMatch) {
    specs.power = powerMatch[0].replace(/\s+/g, '').replace(/[x×]/i, 'X').toUpperCase();
  }

  return specs;
}

/** İstənilən sahəni {az,en,ru} lokalizə struktura çevirir */
function toLocalized(value: any, fallback: string): { az: string; en: string; ru: string } {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const az = String(value.az ?? value.en ?? value.ru ?? fallback).trim() || fallback;
    const en = String(value.en ?? value.az ?? value.ru ?? fallback).trim() || fallback;
    const ru = String(value.ru ?? value.az ?? value.en ?? fallback).trim() || fallback;
    return { az, en, ru };
  }
  const text = typeof value === 'string' && value.trim() ? value.trim() : fallback;
  return { az: text, en: text, ru: text };
}

/**
 * Xam kateqoriya adını sayt kateqoriyasına çevirir:
 * 1) statik map (GÖMÜLMÜŞ -> recessed ...), 2) dinamik kateqoriya siyahısı,
 * 3) tapılmadısa xam ad öz kateqoriyası kimi saxlanılır.
 */
export function resolveImportedCategory(rawCategory: any, categories?: CategoryItem[]): ResolvedCategory {
  const raw = typeof rawCategory === 'string' ? rawCategory.trim() : '';
  if (raw) {
    const key = raw.toUpperCase();
    const mapped =
      IMPORT_CATEGORY_MAP[key] ||
      IMPORT_CATEGORY_MAP[key.replace(/_/g, ' ')] ||
      IMPORT_CATEGORY_MAP[key.replace(/\s+/g, '_')];
    if (mapped) return mapped;

    if (categories && categories.length) {
      const needle = raw.toLowerCase();
      const found = categories.find(
        c =>
          (c.nameAz || '').toLowerCase() === needle ||
          (c.nameEn || '').toLowerCase() === needle ||
          c.id.toLowerCase() === needle
      );
      if (found) {
        return { id: found.id, az: found.nameAz, en: found.nameEn, ru: found.nameRu };
      }
    }
    return { id: raw, az: raw, en: raw, ru: raw };
  }
  return { id: 'accessories', az: 'Digər', en: 'Other', ru: 'Другое' };
}

/**
 * Xam idxal elementini (ad, kod, kateqoriya, şəkil, təsvir, slug ...) saytın tam
 * Product strukturasına çevirir. Çatışmayan sahələr məntiqli defoltlarla doldurulur.
 */
export function normalizeImportedProduct(raw: any, index: number, categories?: CategoryItem[]): Product {
  const item = raw && typeof raw === 'object' ? raw : {};
  const name = String(item.name ?? item.title ?? '').trim() || `Məhsul ${index + 1}`;
  const code = String(item.code ?? '').trim() || `ECL-IMP-${Date.now()}-${index + 1}`;
  const cat = resolveImportedCategory(item.category, categories);

  // id: JSON-da varsa saxla, yoxdursa unikal generasiya et
  const id =
    typeof item.id === 'string' && item.id.trim()
      ? item.id.trim()
      : `imported-${slugifyId(code) || slugifyId(name) || 'product'}-${Date.now()}-${index + 1}`;
  
  const slug =
    typeof item.slug === 'string' && item.slug.trim()
      ? item.slug.trim()
      : `${slugifyId(name) || 'product'}-${slugifyId(code) || (index + 1)}`;

  const image = typeof item.image === 'string' && item.image.trim() ? item.image.trim() : FALLBACK_IMAGE;
  const galleryRaw = Array.isArray(item.gallery) && item.gallery.length > 0
    ? item.gallery.filter((g: any) => typeof g === 'string' && g.trim())
    : [image];

  const rawSpecs = item.specs && typeof item.specs === 'object' && !Array.isArray(item.specs) ? item.specs : {};
  // Ad/təsvirdən REAL göstəricilər (W, V, K, IP) — defolt dəyərləri real məlumatla əvəz edir
  const parsedSpecs = extractSpecsFromName(`${name} ${typeof item.description === 'string' ? item.description : ''}`);

  const categoriesList: string[] = Array.isArray(item.categories) && item.categories.length > 0
    ? item.categories
    : [cat.id];

  const categoryNameObj = (item.categoryName && typeof item.categoryName === 'object')
    ? toLocalized(item.categoryName, cat.az)
    : { az: cat.az, en: cat.en, ru: cat.ru };

  const categoryNamesList = Array.isArray(item.categoryNames) && item.categoryNames.length > 0
    ? item.categoryNames
    : [categoryNameObj];

  return {
    id,
    slug,
    name,
    code,
    category: cat.id,
    categories: categoriesList,
    categoryName: categoryNameObj,
    categoryNames: categoryNamesList,
    subtitle: toLocalized(item.subtitle, cat.az),
    image,
    gallery: galleryRaw,
    description: toLocalized(item.description, `${name} — Ecolife | Kod: ${code}`),
    specs: {
      material: 'Alüminium',
      dimensions: 'Sifarişə uyğun',
      ipRating: 'IP20',
      mounting: cat.az,
      ...parsedSpecs,
      ...rawSpecs
    },
    files: Array.isArray(item.files) ? item.files : [],
    featured: Boolean(item.featured),
    isNew: Boolean(item.isNew ?? item.is_new),
    applications: Array.isArray(item.applications) ? item.applications : []
  };
}

/**
 * Xam idxal siyahısını tam Product[] massivinə çevirir.
 * id olmayan elementlərə batch daxilində zəmanətli unikal id verilir.
 */
export function normalizeImportedProducts(rawItems: any[], categories?: CategoryItem[]): Product[] {
  const usedIds = new Set<string>();
  return (Array.isArray(rawItems) ? rawItems : []).map((raw, index) => {
    const product = normalizeImportedProduct(raw, index, categories);
    let id = product.id;
    while (usedIds.has(id)) {
      id = `${product.id}-${index + 1}`;
    }
    usedIds.add(id);
    return { ...product, id };
  });
}

