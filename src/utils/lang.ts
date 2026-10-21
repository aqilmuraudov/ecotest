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

// Spec values and project locations are typed once, in Azerbaijani; the known ones are shown in the visitor's language.
const VALUE_TR: Record<string, { ru: string; en: string }> = {
  'Alüminium': { ru: 'Алюминий', en: 'Aluminium' },
  'Sifarişə uyğun': { ru: 'Под заказ', en: 'Made to order' },
  'Səthi Quraşdırma': { ru: 'Накладной монтаж', en: 'Surface mounted' },
  'Gömülmüş': { ru: 'Встраиваемый', en: 'Recessed' },
  'Asma İşıqlar': { ru: 'Подвесной', en: 'Pendant' },
  'Lent İşıqlar': { ru: 'Светодиодная лента', en: 'LED strip' },
  'Trek Sistemləri': { ru: 'Трековые системы', en: 'Track systems' },
  'Lampalar': { ru: 'Лампы', en: 'Bulbs' },
  'Dekorativ': { ru: 'Декоративный', en: 'Decorative' },
  'PCB Platalar': { ru: 'Платы PCB', en: 'PCB boards' },
  'Driver': { ru: 'Драйвер', en: 'Driver' },
  'Bakı, Azərbaycan': { ru: 'Баку, Азербайджан', en: 'Baku, Azerbaijan' },
};

export function localizeValue(value: string | undefined, lang: string): string {
  if (!value) return '';
  const tr = VALUE_TR[value.trim()];
  return (tr && (lang === 'ru' || lang === 'en') ? tr[lang] : value);
}
