/**
 * Which "reasoning" (thinking depth) settings a model accepts, in plain words for the admin panel.
 * A wrong value is not harmless: providers such as Groq answer 400 to a parameter the model does not know, and the chat then
 * silently moves on to the next model. So the panel only offers what the model family supports.
 */
export interface ReasoningOption { v: string; label: string; hint: string }
export interface ReasoningSpec {
  /** 'yes' = the options below are known to work; 'no' = the parameter must not be sent; 'unknown' = all levels offered, test it */
  support: 'yes' | 'no' | 'unknown';
  family: string;
  options: ReasoningOption[];
  note: string;
  /** the value to use when nothing better is known (chat answers should be quick) */
  fallback: string;
}

const OFF: ReasoningOption = { v: '', label: 'Göndərmə (model defoltu)', hint: 'Parametr heç göndərilmir, model öz defolt davranışı ilə işləyir. Bəzi düşünən modellərdə bu cavabı xeyli yavaşladır.' };
const NONE: ReasoningOption = { v: 'none', label: 'none · düşünmə yoxdur', hint: 'Model düşünmədən birbaşa cavab verir. Ən sürətli seçim, söhbət üçün ideal.' };
const MINIMAL: ReasoningOption = { v: 'minimal', label: 'minimal · çox qısa', hint: 'Demək olar düşünmür, çox sürətli. Söhbət, xülasə və şəkil təsviri üçün yaxşı seçimdir.' };
const LOW: ReasoningOption = { v: 'low', label: 'low · yüngül', hint: 'Qısa düşünmə. Sürət və dəqiqlik arasında balans, ehtiyat modellər üçün uyğundur.' };
const MEDIUM: ReasoningOption = { v: 'medium', label: 'medium · orta', hint: 'Hiss olunan düşünmə, cavab 2-5 saniyə uzanır. Mürəkkəb sualları olan "düşünən" rol üçün.' };
const HIGH: ReasoningOption = { v: 'high', label: 'high · dərin', hint: 'Ən dərin düşünmə, yavaş və bahalıdır. Adi söhbət üçün tövsiyə olunmur.' };

const m = (s: string) => s.toLowerCase();

export function reasoningSpec(provider: string, model: string): ReasoningSpec {
  const p = m(provider.replace(/\d+$/, ''));
  const x = m(model);
  if (!x) return { support: 'unknown', family: '', options: [OFF, NONE, MINIMAL, LOW, MEDIUM, HIGH], note: 'Əvvəl model adını yazın, uyğun seçimlər göstəriləcək.', fallback: '' };

  if (p === 'groq') {
    if (/qwen/.test(x)) return { support: 'yes', family: 'Groq · Qwen3', options: [NONE, { ...OFF, label: 'Göndərmə (düşünür)', hint: 'Qwen3 Groq-da defoltda düşünür və cavab gec gəlir.' }], note: 'Groq-da Qwen3 yalnız iki rejimi başa düşür: "none" (düşünmür) və ya göndərməmək (düşünür). low/medium/high göndərsəniz Groq xəta qaytarır. Söhbət üçün none seçin.', fallback: 'none' };
    if (/gpt-oss/.test(x)) return { support: 'yes', family: 'Groq · GPT-OSS', options: [LOW, MEDIUM, HIGH], note: 'GPT-OSS düşünməni tam söndürə bilmir, ən yüngülü "low"-dur. none/minimal Groq-da xəta verir. Söhbət üçün low seçin.', fallback: 'low' };
    return { support: 'no', family: 'Groq · reasoning dəstəklənmir', options: [OFF], note: 'Bu Groq modeli reasoning parametrini tanımır, ona görə heç nə göndərilmir (göndərilsə sorğu xəta ilə qayıdardı).', fallback: '' };
  }

  if (/llama|mixtral|gemma|mistral-(small|medium)|nemotron-nano/.test(x) && !/reason|think/.test(x)) {
    return { support: 'no', family: 'Düşünməyən model', options: [OFF], note: 'Bu model ailəsi reasoning rejiminə malik deyil. Parametr göndərilməsə yaxşıdır.', fallback: '' };
  }
  if (/gpt-5|luna|^o[134](-|$)|gpt-oss/.test(x)) return { support: 'yes', family: 'OpenAI tipli (GPT-5 / luna / o-seriyası)', options: [OFF, NONE, MINIMAL, LOW, MEDIUM, HIGH], note: 'Bu model bütün səviyyələri qəbul edir. Sürət üçün minimal, ağır suallar üçün medium. "none" bəzi versiyalarda dəstəklənmir: xəta çıxsa minimal seçin.', fallback: 'minimal' };
  if (/gemini/.test(x)) return { support: 'yes', family: 'Gemini', options: [OFF, MINIMAL, LOW, MEDIUM, HIGH], note: 'Gemini düşünmə səviyyəsini qəbul edir. Şəkil analizi və söhbət üçün minimal, mürəkkəb iş üçün medium.', fallback: 'minimal' };
  if (/qwen/.test(x)) return { support: 'yes', family: 'Qwen (şlüz vasitəsilə)', options: [OFF, NONE, MINIMAL, LOW, MEDIUM, HIGH], note: 'Şlüzlərdə Qwen çox vaxt düşünmə səviyyəsini qəbul edir, amma bəzilərində yalnız "none" işləyir. Test düyməsi ilə yoxlayın.', fallback: 'none' };
  if (/glm|seed|deepseek|minimax|kimi|grok|claude|mimo|hunyuan|ernie/.test(x)) return { support: 'yes', family: 'Düşünən model (şlüz vasitəsilə)', options: [OFF, NONE, MINIMAL, LOW, MEDIUM, HIGH], note: 'Şlüz bu səviyyələri modelə uyğunlaşdırır. Əvvəlki sınaqlarda minimal/low yaxşı işlədi, söhbət üçün onları seçin. Xəta və ya boş cavab olsa "göndərmə" seçin.', fallback: 'minimal' };

  return { support: 'unknown', family: 'Naməlum model', options: [OFF, NONE, MINIMAL, LOW, MEDIUM, HIGH], note: 'Bu modelin reasoning dəstəyi bizə məlum deyil. "Test" ilə yoxlayın: xəta qaytarırsa "göndərmə" seçin.', fallback: '' };
}

/** What each chat role wants, shown under the role title */
export const ROLE_REASONING_TIPS: Record<string, string> = {
  fast: 'Tövsiyə: none və ya minimal. Müştəri gözləyir, düşünmə vaxtı cavabı birbaşa yavaşladır.',
  thinking: 'Tövsiyə: medium (ən çox high). Yalnız uzun və mürəkkəb söhbətlərdə işləyir, gecikmə qəbul oluna bilər.',
  fallback: 'Tövsiyə: minimal və ya low. Əsas modellər düşəndə sürətli qalması vacibdir.',
  vision: 'Tövsiyə: minimal. Şəkil təsviri qısadır, uzun düşünmə yalnız xərci artırır.',
  summary: 'Tövsiyə: minimal və ya low. Satış komandası üçün qısa xülasə üçün dərin düşünmə lazım deyil.',
};

export const isAllowedEffort = (spec: ReasoningSpec, effort: string) => spec.options.some(o => o.v === effort);

/** The effort to keep when the model or provider changes: the current one if still valid, otherwise the safe default */
export function adjustEffort(spec: ReasoningSpec, effort: string | undefined): string {
  const cur = effort || '';
  if (spec.support === 'unknown') return cur;
  return isAllowedEffort(spec, cur) ? cur : spec.fallback;
}
