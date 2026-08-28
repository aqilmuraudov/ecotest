export function getLocalizedText(field: any, lang: string = 'az'): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    return field[lang] || field.az || field.en || field.ru || Object.values(field)[0] || '';
  }
  return String(field);
}

export function getLocalizedArray(field: any, lang: string = 'az'): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'object') {
    const val = field[lang] || field.az || field.en || field.ru;
    if (Array.isArray(val)) return val;
    for (const v of Object.values(field)) {
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}
