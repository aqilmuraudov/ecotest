/**
 * Input sanitization utilities
 * XSS və injection hücumlarının qarşısını alır.
 *
 * React avtomatik olaraq mətn node-larında HTML escape edir,
 * amma biz:
 *   1. İstifadəçi daxilolmalarını zərərli HTML-dən təmizləyirik.
 *   2. dangerouslySetInnerHTML istifadə edən yerlərdə bu funksiyaları çağırırıq.
 *   3. URL sahələrində yalnız təhlükəsiz protokolları qəbul edirik.
 */

// HTML entity-ləri üçün escape
const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * İstifadəçi daxil etmiş mətndən HTML xarakterləri escape edir.
 * UI-da göstərmək üçün istifadə olunur.
 */
export function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ESCAPES[char] || char);
}

/**
 * Tək sətirli mətn sahələri üçün sanitizasiya:
 * - HTML tag-ləri silinir
 * - Script/iframe obyektləri bloklanır
 * - Uzunluq məhdudlaşdırılır
 * - Nəzarət simvolları təmizlənir (NULL byte və s.)
 */
export function sanitizeText(input: unknown, maxLength = 5000): string {
  if (input === null || input === undefined) return '';
  let str = String(input);

  // NULL bytes və digər nəzarət simvolları sil
  str = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  // HTML tag-ləri sil
  str = str.replace(/<\/?[^>]+(>|$)/g, '');

  // javascript:, data: və vbscript: sxemləri blokla
  str = str.replace(/javascript\s*:/gi, '');
  str = str.replace(/data\s*:/gi, '');
  str = str.replace(/vbscript\s*:/gi, '');

  // Uzunluq məhdudlaşdırması
  if (str.length > maxLength) {
    str = str.substring(0, maxLength);
  }

  return str.trim();
}

/**
 * E-poçt ünvanını yoxlayır və normallaşdırır.
 * Boş və ya yanlış formatlı daxilolmalar üçün boş string qaytarır.
 */
export function sanitizeEmail(input: unknown): string {
  if (input === null || input === undefined) return '';
  const str = String(input).trim().toLowerCase();

  // RFC 5322-nin sadələşdirilmiş versiyası (production üçün kifayətdir)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(str)) return '';

  // Uzunluq yoxlaması
  if (str.length > 254) return '';

  return str;
}

/**
 * Telefon nömrəsi üçün sanitizasiya:
 * - Yalnız rəqəm, +, -, (, ), boşluq saxlanılır
 * - Maksimum 20 simvol
 */
export function sanitizePhone(input: unknown): string {
  if (input === null || input === undefined) return '';
  const str = String(input).replace(/[^\d+\-() ]/g, '');
  return str.substring(0, 20).trim();
}

/**
 * URL üçün təhlükəsizlik yoxlaması:
 * - Yalnız http, https, mailto, tel protokolları qəbul edilir
 * - javascript: və data: bloklanır
 */
export function sanitizeUrl(input: unknown): string {
  if (input === null || input === undefined) return '';
  const str = String(input).trim();

  if (!str) return '';

  // Nisbi URL-lərə icazə ver
  if (str.startsWith('/') || str.startsWith('#')) {
    return str;
  }

  try {
    const url = new URL(str);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (!allowedProtocols.includes(url.protocol.toLowerCase())) {
      return '';
    }
    return url.toString();
  } catch {
    // URL parse olunmadı, boş qaytar
    return '';
  }
}

/**
 * Slug yaratmaq üçün (URL-də istifadə üçün).
 * Yalnız a-z, 0-9, -, _ saxlayır.
 */
export function sanitizeSlug(input: unknown, maxLength = 80): string {
  if (input === null || input === undefined) return '';
  const str = String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, maxLength);
  return str;
}

/**
 * JSON sahəsini (multi-language content) təmizləyir.
 * Hər bir dil üçün ayrıca tətbiq olunur.
 */
export function sanitizeLocalizedText(
  input: unknown,
  maxLength = 5000
): { az: string; en: string; ru: string } {
  const empty = { az: '', en: '', ru: '' };
  if (!input || typeof input !== 'object') return empty;

  const obj = input as Record<string, unknown>;
  return {
    az: sanitizeText(obj.az, maxLength),
    en: sanitizeText(obj.en, maxLength),
    ru: sanitizeText(obj.ru, maxLength),
  };
}

/**
 * Rate limiting üçün sadə client-side helper.
 * Browser localStorage istifadə edərək son çağırışların vaxtını saxlayır.
 */
const RATE_LIMIT_KEY = 'ecolife_rate_limit';

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

export function checkRateLimit(
  action: string,
  maxRequests: number,
  windowMs: number
): boolean {
  if (typeof window === 'undefined') return true;

  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const store: Record<string, RateLimitRecord> = raw ? JSON.parse(raw) : {};
    const now = Date.now();
    const record = store[action];

    if (!record || now - record.windowStart > windowMs) {
      store[action] = { count: 1, windowStart: now };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(store));
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count += 1;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(store));
    return true;
  } catch {
    return true;
  }
}

/**
 * Browser fingerprint / IP hash-i olmayan sadə korelyasiya identifikatoru.
 * Production-da server-side daha yaxşı həll olacaq.
 */
export function getClientFingerprint(): string {
  if (typeof window === 'undefined') return 'ssr';

  try {
    const stored = sessionStorage.getItem('ecolife_fp');
    if (stored) return stored;

    const parts = [
      navigator.userAgent,
      navigator.language,
      `${screen.width}x${screen.height}`,
      new Date().getTimezoneOffset(),
    ].join('|');

    // Sadə hash (production üçün Web Crypto API istifadə edin)
    let hash = 0;
    for (let i = 0; i < parts.length; i++) {
      hash = (hash << 5) - hash + parts.charCodeAt(i);
      hash |= 0;
    }
    const fp = Math.abs(hash).toString(36);
    sessionStorage.setItem('ecolife_fp', fp);
    return fp;
  } catch {
    return 'unknown';
  }
}
