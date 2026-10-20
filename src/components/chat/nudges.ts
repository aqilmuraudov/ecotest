/**
 * Contextual hellos for AISeller. Everything here is static text: showing a nudge costs the backend nothing.
 * Only when the visitor taps one of its chips does a request go out (and the first answer to a chip is cached on the server).
 */
export type ChatPage = { type: string; id?: string };
export interface Chip { id: string; label: string; q: string }
export interface Nudge { key: string; text: string; chips: Chip[]; delayMs: number }
type L = 'az' | 'ru' | 'en';

const pick = <T,>(lang: L, az: T, ru: T, en: T): T => (lang === 'ru' ? ru : lang === 'en' ? en : az);

/** `label` is the localized name of the category / product / project the visitor is looking at (may be empty). */
export function nudgeFor(page: ChatPage, lang: L, label: string): Nudge | null {
  const key = `${page.type}:${page.id || ''}`;
  const chip = (id: string, a: string, r: string, e: string, qa = a, qr = r, qe = e): Chip => ({ id: `${page.type}-${id}`, label: pick(lang, a, r, e), q: pick(lang, qa, qr, qe) });
  const n = (text: string, chips: Chip[], delayMs: number): Nudge => ({ key, text, chips, delayMs });

  switch (page.type) {
    case 'home':
      return n(
        pick(lang, 'Hansı məkan üçün işıq axtarırsınız? Bir neçə sualla sizə uyğun həlli tapım.', 'Для какого помещения нужен свет? Подберу решение за пару вопросов.', 'What space is the lighting for? I will find the right solution in a few questions.'),
        [
          chip('home', 'Ev üçün', 'Для дома', 'For home', 'Ev üçün işıqlandırma axtarıram', 'Ищу освещение для дома', 'I am looking for lighting for my home'),
          chip('biz', 'Ofis və ya mağaza', 'Офис или магазин', 'Office or shop', 'Ofis və ya mağaza üçün işıqlandırma axtarıram', 'Ищу освещение для офиса или магазина', 'I am looking for lighting for an office or shop'),
        ],
        8000
      );
    case 'catalog':
      return n(
        pick(lang, 'Məhsul çoxdur, seçməkdə kömək edim? Məkanınızı deyin, uyğun olanları göstərim.', 'Много моделей — помочь с выбором? Расскажите о помещении, покажу подходящие.', 'Plenty to choose from. Tell me about your space and I will show what fits.'),
        [
          chip('home', 'Ev üçün', 'Для дома', 'For home', 'Ev üçün işıqlandırma seçmək istəyirəm', 'Хочу выбрать освещение для дома', 'I want to choose lighting for my home'),
          chip('biz', 'Ofis üçün', 'Для офиса', 'For office', 'Ofis üçün işıqlandırma seçmək istəyirəm', 'Хочу выбрать освещение для офиса', 'I want to choose lighting for my office'),
        ],
        10000
      );
    case 'category': {
      const name = label || pick(lang, 'bu kateqoriya', 'эта категория', 'this category');
      return n(
        pick(lang, `${name} seçməkdə kömək edim? İki sualla sizə uyğun modeli göstərərəm.`, `Помочь выбрать — ${name}? Двумя вопросами подберу подходящую модель.`, `Shall I help you choose from ${name}? Two questions and I will show the right model.`),
        [
          chip('pick', 'Mənə uyğun olanı seç', 'Подобрать мне', 'Pick for me', `${name} üzrə mənə uyğun məhsul seçmək istəyirəm`, `Хочу подобрать подходящий товар: ${name}`, `I want help choosing the right product: ${name}`),
          chip('diff', 'Fərqlər nədir?', 'В чём разница?', 'What is the difference?', `${name} üzrə modellər arasında əsas fərqlər nədir?`, `В чём основные различия моделей: ${name}?`, `What are the main differences between the models: ${name}?`),
        ],
        9000
      );
    }
    case 'product':
      return n(
        pick(lang, 'Bu məhsul sizin məkana uyğundurmu? Yoxlayıb deyim.', 'Подойдёт ли этот товар для вашего помещения? Проверю и подскажу.', 'Is this product right for your space? I can check and tell you.'),
        [
          chip('fit', 'Mənim məkanıma uyğundur?', 'Подойдёт ли мне?', 'Will it suit my space?', 'Bu məhsul mənim məkanıma uyğundurmu?', 'Подойдёт ли этот товар для моего помещения?', 'Is this product suitable for my space?'),
          chip('alt', 'Oxşar variantlar', 'Похожие варианты', 'Similar options', 'Bu məhsula oxşar başqa variantlar göstərin', 'Покажите похожие варианты этого товара', 'Show me similar options to this product'),
        ],
        9000
      );
    case 'project':
      return n(
        pick(lang, 'Bu layihədəki işıqlandırma sizi maraqlandırır? Sizin məkan üçün də belə həll seçə bilərəm.', 'Нравится освещение в этом проекте? Могу подобрать похожее решение для вас.', 'Like the lighting in this project? I can suggest a similar solution for your space.'),
        [
          chip('used', 'Hansı məhsullar işlənib?', 'Какие продукты использованы?', 'Which products were used?', 'Bu layihədə hansı məhsullar istifadə olunub?', 'Какие продукты использованы в этом проекте?', 'Which products were used in this project?'),
          chip('mine', 'Mənim də layihəm var', 'У меня тоже проект', 'I have a project too', 'Mənim də buna oxşar layihəm var', 'У меня тоже похожий проект', 'I have a similar project'),
        ],
        9000
      );
    case 'projects':
      return n(
        pick(lang, 'Layihələrimiz sizə ilham verdi? Sizin layihəniz üçün də həll seçək.', 'Вдохновились нашими проектами? Подберём решение и для вашего.', 'Inspired by our projects? Let us find a solution for yours.'),
        [chip('mine', 'Layihəm var', 'У меня есть проект', 'I have a project', 'Mənim layihəm var, kömək edin', 'У меня есть проект, помогите', 'I have a project, please help')],
        12000
      );
    case 'solutions':
      return n(
        pick(lang, 'Məkan növünüzü deyin, ona uyğun həlli göstərim.', 'Назовите тип помещения — покажу подходящее решение.', 'Tell me your type of space and I will show the matching solution.'),
        [chip('mine', 'Məkanım üçün seçin', 'Подберите для моего помещения', 'Choose for my space', 'Mənim məkanım üçün həll seçin', 'Подберите решение для моего помещения', 'Please choose a solution for my space')],
        12000
      );
    case 'configurator':
      return n(
        pick(lang, 'Konfiqurator zamanı sualınız yaranarsa, kömək edim.', 'Если возникнут вопросы по конфигуратору — подскажу.', 'If anything in the configurator is unclear, I can help.'),
        [chip('help', 'Necə seçim edim?', 'Как выбрать?', 'How do I choose?', 'Konfiquratorda necə düzgün seçim edim?', 'Как правильно выбрать в конфигураторе?', 'How do I choose correctly in the configurator?')],
        14000
      );
    default:
      return null; // blog, about, contact, admin: never interrupt
  }
}

// ---- how often we may speak up: a few times per session, never twice on the same page, silent after the visitor dismisses it
interface NudgeState { count: number; keys: string[]; last: number; dismissed: boolean }
const NUDGE_KEY = 'ecolife-chat-nudges';
const EMPTY: NudgeState = { count: 0, keys: [], last: 0, dismissed: false };
export const MAX_NUDGES = 4;
export const NUDGE_GAP_MS = 25000;

export function readNudgeState(): NudgeState {
  try {
    const s = JSON.parse(sessionStorage.getItem(NUDGE_KEY) || 'null');
    return s && typeof s === 'object' ? { ...EMPTY, ...s } : { ...EMPTY };
  } catch { return { ...EMPTY }; }
}
export function writeNudgeState(s: NudgeState): void {
  try { sessionStorage.setItem(NUDGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}
