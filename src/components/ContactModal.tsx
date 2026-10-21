import React, { useEffect, useRef, useState } from 'react';
import { Language, Product } from '../types';
import { translations } from '../data/translations';
import { useData } from '../context/DataContext';
import { getLocalizedText } from '../utils/lang';
import { sanitizePhone, sanitizeText, checkRateLimit, getClientFingerprint } from '../utils/sanitize';
import { X, CheckCircle, Send, Phone, Sliders } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  prefilledProduct?: Product | null;
  configSummary?: string | null;
  /** the page the visitor was on when the form opened (tells the sales team where the request came from) */
  contextPage?: string;
  contextParam?: string;
}

// Short, plain wording.
const TEXT = {
  az: {
    place: 'İşıqlandırma harada lazımdır?',
    placeHint: 'istəyə bağlı',
    places: ['Mənzil / ev', 'Ofis', 'Mağaza', 'Restoran / kafe', 'Otel', 'Digər'],
    note: 'Qeyd (istəyə bağlı)',
    notePlaceholder: 'Məsələn: sahə, istədiyiniz məhsul, çatdırılma vaxtı…',
    namePh: 'Adınız',
    surnamePh: 'Soyadınız',
    phoneHint: 'Sizinlə əlaqə saxlayacağıq',
    errName: 'Adınızı yazın.',
    errPhone: 'Telefon nömrəsini düzgün yazın.',
    errRate: 'Çoxlu sorğu göndərdiniz. Bir neçə dəqiqə sonra yenidən cəhd edin.',
    errSend: 'Göndərilmədi. Bir az sonra yenidən cəhd edin.',
    consent: 'Göndərməklə məlumatlarınızın sorğunun işlənməsi üçün istifadəsinə razılıq verirsiniz.',
    doneTitle: 'Sorğunuz qəbul edildi!',
    close: 'Bağla',
    config: 'Xüsusi konfiqurasiya',
    productMsg: (n: string, c: string) => `Salam, "${n}" (${c}) məhsulu haqqında texniki məlumat və qiymət təklifi almaq istəyirəm.`,
    configMsg: (s: string) => `Salam, aşağıdakı xüsusi konfiqurasiya üçün qiymət təklifi və istehsal müddətini öyrənmək istəyirəm:\n${s}`,
    generalMsg: 'Müştəri sorğu göndərdi',
  },
  ru: {
    place: 'Где нужно освещение?',
    placeHint: 'по желанию',
    places: ['Квартира / дом', 'Офис', 'Магазин', 'Ресторан / кафе', 'Отель', 'Другое'],
    note: 'Комментарий (по желанию)',
    notePlaceholder: 'Например: площадь, нужный товар, сроки…',
    namePh: 'Ваше имя',
    surnamePh: 'Фамилия',
    phoneHint: 'Мы свяжемся с вами',
    errName: 'Укажите имя.',
    errPhone: 'Укажите корректный номер телефона.',
    errRate: 'Слишком много заявок. Повторите через несколько минут.',
    errSend: 'Не удалось отправить. Повторите позже.',
    consent: 'Отправляя заявку, вы соглашаетесь на обработку данных для её рассмотрения.',
    doneTitle: 'Заявка принята!',
    close: 'Закрыть',
    config: 'Индивидуальная конфигурация',
    productMsg: (n: string, c: string) => `Здравствуйте, хочу запросить коммерческое предложение и техническую информацию для продукта "${n}" (${c}).`,
    configMsg: (s: string) => `Здравствуйте, хочу узнать стоимость и сроки производства для следующей конфигурации:\n${s}`,
    generalMsg: 'Клиент отправил заявку',
  },
  en: {
    place: 'Where is the lighting needed?',
    placeHint: 'optional',
    places: ['Apartment / house', 'Office', 'Shop', 'Restaurant / cafe', 'Hotel', 'Other'],
    note: 'Note (optional)',
    notePlaceholder: 'For example: area, the product you want, timing…',
    namePh: 'First name',
    surnamePh: 'Last name',
    phoneHint: 'We will contact you',
    errName: 'Enter your name.',
    errPhone: 'Enter a valid phone number.',
    errRate: 'Too many requests. Please try again in a few minutes.',
    errSend: 'Could not send. Please try again later.',
    consent: 'By sending this request you agree to your data being used to process it.',
    doneTitle: 'Your request has been received!',
    close: 'Close',
    config: 'Custom configuration',
    productMsg: (n: string, c: string) => `Hello, I would like technical information and a price offer for the product "${n}" (${c}).`,
    configMsg: (s: string) => `Hello, I would like a price offer and the production time for the following custom configuration:\n${s}`,
    generalMsg: 'The customer sent a request',
  },
};

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  prefilledProduct,
  configSummary,
  contextPage,
  contextParam
}) => {
  const lang = currentLang;
  const t = translations[lang];
  const x = TEXT[lang];
  const { addInquiry } = useData();

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', place: '', note: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const firstRef = useRef<HTMLInputElement>(null);

  // a fresh form state every time the window opens (the typed name and phone stay: a second request should not retype them)
  useEffect(() => {
    if (!isOpen) return;
    setIsSubmitted(false);
    setError('');
    setForm(f => ({ ...f, place: '', note: '' }));
    const id = window.setTimeout(() => firstRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [isOpen, prefilledProduct, configSummary]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!checkRateLimit('contact_inquiry', 3, 5 * 60 * 1000)) { setError(x.errRate); return; }

    const firstName = sanitizeText(form.firstName, 80);
    const lastName = sanitizeText(form.lastName, 80);
    const phone = sanitizePhone(form.phone);
    const note = sanitizeText(form.note, 1500);
    if (firstName.length < 2) { setError(x.errName); return; }
    if (phone.replace(/\D/g, '').length < 9) { setError(x.errPhone); return; }

    // what the sales team reads: the customer's own note, otherwise the standard sentence for what they were looking at
    const defaultMsg = prefilledProduct
      ? x.productMsg(prefilledProduct.name, prefilledProduct.code)
      : configSummary ? x.configMsg(configSummary) : x.generalMsg;

    setIsSubmitting(true);
    try {
      const result = await addInquiry({
        name: `${firstName} ${lastName}`.trim(),
        email: '',
        phone,
        company: '',
        projectType: form.place || undefined,
        message: sanitizeText(note ? `${note}\n\n${defaultMsg}` : defaultMsg, 5000),
        productName: prefilledProduct ? sanitizeText(prefilledProduct.name, 200) : undefined,
        productCode: prefilledProduct?.code,
        productImage: prefilledProduct?.image,
        productCategory: prefilledProduct?.category,
        productSpecs: prefilledProduct?.specs,
        configSummary: configSummary ? sanitizeText(configSummary, 1000) : undefined,
        // product quote, configurator, or a project request (from a project / solution page or the general form)
        source: prefilledProduct ? 'product' : configSummary ? 'configurator' : 'project',
        sourceRef: !prefilledProduct && !configSummary && (contextPage === 'projects' || contextPage === 'solutions') && contextParam ? `${contextPage === 'projects' ? 'Layihə' : 'Həll'}: ${sanitizeText(contextParam, 120)}` : undefined,
        ipHash: getClientFingerprint(),
      } as any);
      if (result.success) setIsSubmitted(true);
      else setError(result.error === 'rate_limit' ? x.errRate : result.error === 'phone' ? x.errPhone : result.error === 'name' ? x.errName : x.errSend);
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      setError(x.errSend);
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = prefilledProduct ? t.productDetail.requestQuote : configSummary ? t.configurator.sendInquiry : t.contact.title;
  const label = 'block font-micro text-[9px] text-mute mb-1.5';
  const hasContext = !!prefilledProduct || !!configSummary;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 bg-[var(--ed-scrim)] backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        id="ecolife-inquiry-modal"
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-3xl bg-[var(--ed-modal)] border border-[var(--ed-line)] rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.45)] max-h-[94vh] overflow-y-auto text-[var(--ed-ivory)]"
      >
        {/* Top subtle linear LED light accent */}
        <div className="absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-[#FFD21A]/60 to-transparent pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--ed-mute)] hover:text-amber-warm p-2 rounded-full hover:bg-[var(--ed-line-soft)] transition-colors z-20"
          aria-label={x.close}
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-10 px-6 text-center space-y-4">
            <div className="w-14 h-14 bg-[rgba(245,166,35,0.1)] border border-[var(--ed-amber)] text-amber-warm rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="ed-display-sm font-display text-ivory">{x.doneTitle}</h3>
            <p className="text-sm text-soft max-w-md mx-auto">{t.contact.form.success}</p>
            <button onClick={onClose} className="ed-btn-primary">{x.close}</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            {/* LEFT: what this request is about */}
            <div className="p-6 md:p-7 md:border-r border-[var(--ed-line)] bg-[var(--ed-bg-2)]/60 flex flex-col gap-4">
              <div className="space-y-2 pr-8 md:pr-0">
                <span className="font-micro text-[9px] text-amber-warm flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--ed-amber)]" />
                  {t.nav.writeUs}
                </span>
                <h2 className="font-display text-ivory tracking-tight text-[1.6rem] sm:text-[1.9rem] leading-[1.08]">{title}</h2>
                {!hasContext && <p className="text-xs text-mute font-light leading-relaxed">{t.contact.subtitle}</p>}
              </div>

              {prefilledProduct && (
                <div className="p-3 bg-[var(--ed-bg-2)] border border-[var(--ed-line)] rounded-xl flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[var(--ed-cream)] border border-[var(--ed-line)] flex-shrink-0">
                    <img
                      src={prefilledProduct.image || (prefilledProduct.gallery && prefilledProduct.gallery[0]) || ''}
                      alt={prefilledProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-bold text-ivory uppercase tracking-tight leading-tight line-clamp-2">{prefilledProduct.name}</h3>
                    <p className="text-[11px] text-mute font-mono-tech mt-1">{prefilledProduct.code}</p>
                    <p className="text-[11px] text-soft truncate">{getLocalizedText(prefilledProduct.categoryName, lang)}</p>
                  </div>
                </div>
              )}

              {!prefilledProduct && configSummary && (
                <div className="p-3 bg-[var(--ed-bg-2)] border border-emerald-500/30 rounded-xl space-y-1">
                  <div className="text-[11px] font-bold text-ok uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{x.config}</span>
                  </div>
                  <div className="text-[11px] font-mono text-soft whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">{configSummary}</div>
                </div>
              )}

              <a
                href="tel:+994504507007"
                className="mt-auto text-xs text-mute hover:text-amber-warm flex items-center gap-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-warm" />
                <span className="font-mono-tech">+994 50 450 70 07</span>
              </a>
            </div>

            {/* RIGHT: the form (name, surname, phone: that is all that is required) */}
            <form onSubmit={handleSubmit} className="p-6 md:p-7 space-y-3.5" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label} htmlFor="cm-first">{t.contact.form.firstName} *</label>
                  <input
                    id="cm-first"
                    ref={firstRef}
                    type="text"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder={x.namePh}
                    className="ed-input"
                  />
                </div>
                <div>
                  <label className={label} htmlFor="cm-last">{t.contact.form.lastName}</label>
                  <input
                    id="cm-last"
                    type="text"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder={x.surnamePh}
                    className="ed-input"
                  />
                </div>
              </div>

              <div>
                <label className={label} htmlFor="cm-phone">{t.contact.form.phone} *</label>
                <input
                  id="cm-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+994 50 000 00 00"
                  className="ed-input"
                />
                <p className="text-[10.5px] text-mute mt-1">{x.phoneHint}</p>
              </div>

              {/* a plain question with one-tap answers instead of the old "project type" list */}
              <div>
                <span className={label}>{x.place} <span className="normal-case tracking-normal opacity-70">· {x.placeHint}</span></span>
                <div className="flex flex-wrap gap-1.5">
                  {x.places.map(p => {
                    const on = form.place === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setForm({ ...form, place: on ? '' : p })}
                        className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${on ? 'bg-[var(--ed-amber)] border-[var(--ed-amber)] text-[#1d1d1b] font-semibold' : 'border-[var(--ed-line)] text-soft hover:border-[var(--ed-amber)] hover:text-ivory'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={label} htmlFor="cm-note">{x.note}</label>
                <textarea
                  id="cm-note"
                  rows={2}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder={x.notePlaceholder}
                  className="ed-input resize-none"
                />
              </div>

              {error && <p role="alert" className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}

              <button type="submit" disabled={isSubmitting} className="ed-btn-primary w-full justify-center disabled:opacity-50 cursor-pointer">
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? t.contact.form.submitting : t.contact.form.submit}</span>
              </button>
              <p className="text-[10.5px] leading-snug text-mute">{x.consent}</p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
