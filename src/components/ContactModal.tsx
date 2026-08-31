import React, { useState } from 'react';
import { Language, Product } from '../types';
import { translations } from '../data/translations';
import { useData } from '../context/DataContext';
import { getLocalizedText } from '../utils/lang';
import {
  sanitizeEmail,
  sanitizePhone,
  sanitizeText,
  checkRateLimit,
  getClientFingerprint,
} from '../utils/sanitize';
import { X, CheckCircle, Send, Phone, Layers, ShieldCheck, Box, Sliders } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  prefilledProduct?: Product | null;
  configSummary?: string | null;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  prefilledProduct,
  configSummary
}) => {
  const t = translations[currentLang];
  const { addInquiry } = useData();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    projectType: 'commercial',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync default message and state when modal opens or prefilled item changes
  React.useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      let defaultMsg = '';
      if (prefilledProduct) {
        defaultMsg = currentLang === 'az'
          ? `Salam, "${prefilledProduct.name}" (${prefilledProduct.code}) məhsulu haqqında texniki məlumat və qiymət təklifi almaq istəyirəm.`
          : currentLang === 'ru'
            ? `Здравствуйте, хочу запросить коммерческое предложение и техническую информацию для продукта "${prefilledProduct.name}" (${prefilledProduct.code}).`
            : `Hello, I would like to request technical details and a price quote for product "${prefilledProduct.name}" (${prefilledProduct.code}).`;
      } else if (configSummary) {
        defaultMsg = currentLang === 'az'
          ? `Salam, aşağıdakı xüsusi konfiqurasiya üçün qiymət təklifi və istehsal müddətini öyrənmək istəyirəm:\n${configSummary}`
          : currentLang === 'ru'
            ? `Здравствуйте, хочу узнать стоимость и сроки производства для следующей конфигурации:\n${configSummary}`
            : `Hello, I would like to inquire about pricing and lead time for the following custom configuration:\n${configSummary}`;
      }
      setFormData(prev => ({
        ...prev,
        message: defaultMsg
      }));
    }
  }, [isOpen, prefilledProduct, configSummary, currentLang]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limit: eyni istifadəçidən 5 dəqiqə ərzində maksimum 3 sorğu
    if (!checkRateLimit('contact_inquiry', 3, 5 * 60 * 1000)) {
      alert('Çoxlu sorğu göndərdiniz. 5 dəqiqə sonra yenidən sınayın.');
      return;
    }

    // Input sanitization
    const cleanEmail = sanitizeEmail(formData.email);
    const cleanPhone = sanitizePhone(formData.phone);
    const cleanFirstName = sanitizeText(formData.firstName, 80);
    const cleanLastName = sanitizeText(formData.lastName, 80);
    const cleanCompany = sanitizeText(formData.company, 120);
    const cleanMessage = sanitizeText(formData.message, 5000);

    if (!cleanEmail) {
      alert('Düzgün email daxil edin.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 7) {
      alert('Düzgün telefon nömrəsi daxil edin.');
      return;
    }
    if (cleanMessage.length < 5) {
      alert('Mesaj çox qısadır.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fingerprint = getClientFingerprint();
      await addInquiry({
        name: `${cleanFirstName} ${cleanLastName}`.trim() || 'Adsız Müştəri',
        email: cleanEmail,
        phone: cleanPhone,
        company: cleanCompany,
        projectType: formData.projectType,
        message: cleanMessage,
        productName: prefilledProduct ? sanitizeText(prefilledProduct.name, 200) : undefined,
        productCode: prefilledProduct?.code,
        productImage: prefilledProduct?.image,
        productCategory: prefilledProduct?.category,
        productSpecs: prefilledProduct?.specs,
        configSummary: configSummary ? sanitizeText(configSummary, 1000) : undefined,
        ipHash: fingerprint,
      } as any);
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        id="ecolife-inquiry-modal"
        className="relative w-full max-w-2xl bg-[#101114] border border-white/15 rounded-2xl shadow-2xl p-5 sm:p-8 max-h-[92vh] overflow-y-auto text-[#F5F5F5]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors z-20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-12 text-center space-y-5">
            <div className="w-16 h-16 bg-[#FFD21A]/10 border border-[#FFD21A] text-[#FFD21A] rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">
              {currentLang === 'az' ? 'Sorğunuz Uğurla Qəbul Edildi!' : currentLang === 'ru' ? 'Запрос успешно отправлен!' : 'Inquiry Successfully Received!'}
            </h3>
            <p className="text-sm text-gray-300 max-w-md mx-auto">
              {t.contact.form.success}
            </p>
            {prefilledProduct && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/10 text-xs text-[#FFD21A] font-mono">
                <span>{prefilledProduct.name} [{prefilledProduct.code}]</span>
              </div>
            )}
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-xl hover:bg-[#F0C413] transition-colors"
              >
                {currentLang === 'az' ? 'Pəncərəni Bağla' : currentLang === 'ru' ? 'Закрыть' : 'Close Window'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="space-y-1.5 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FFD21A] bg-[#FFD21A]/10 px-2.5 py-0.5 rounded border border-[#FFD21A]/30">
                  {t.nav.writeUs}
                </span>
                {prefilledProduct && (
                  <span className="text-xs text-gray-400 font-mono">
                    [{prefilledProduct.code}]
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight uppercase">
                {prefilledProduct 
                  ? `${prefilledProduct.name} - ${t.productDetail.requestQuote}`
                  : configSummary 
                    ? t.configurator.sendInquiry 
                    : t.contact.title}
              </h2>
              <p className="text-xs text-gray-400">
                {t.contact.subtitle}
              </p>
            </div>

            {/* REAL SELECTED PRODUCT CARD PREVIEW */}
            {prefilledProduct && (
              <div className="mt-4 p-3.5 sm:p-4 bg-[#16181F] border border-[#FFD21A]/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg">
                {/* Product Thumbnail */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-black/60 border border-white/10 flex-shrink-0 flex items-center justify-center">
                  <img
                    src={prefilledProduct.image || (prefilledProduct.gallery && prefilledProduct.gallery[0]) || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80'}
                    alt={prefilledProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-[#FFD21A] font-bold">
                    {prefilledProduct.code}
                  </div>
                </div>

                {/* Product Meta & Key Specs */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight truncate">
                      {prefilledProduct.name}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/10 text-gray-300">
                      {getLocalizedText(prefilledProduct.categoryName, currentLang)}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-300 line-clamp-1">
                    {getLocalizedText(prefilledProduct.subtitle, currentLang)}
                  </p>

                  {/* Spec badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono text-gray-300">
                    {prefilledProduct.specs.dimensions && (
                      <span className="px-2 py-0.5 rounded bg-black/40 border border-white/5 text-[#FFD21A]">
                        {prefilledProduct.specs.dimensions}
                      </span>
                    )}
                    {prefilledProduct.specs.mounting && (
                      <span className="px-2 py-0.5 rounded bg-black/40 border border-white/5 text-gray-300">
                        {prefilledProduct.specs.mounting}
                      </span>
                    )}
                    {prefilledProduct.specs.ipRating && (
                      <span className="px-2 py-0.5 rounded bg-black/40 border border-white/5 text-gray-300">
                        {prefilledProduct.specs.ipRating}
                      </span>
                    )}
                    {prefilledProduct.specs.power && (
                      <span className="px-2 py-0.5 rounded bg-black/40 border border-white/5 text-emerald-400">
                        {prefilledProduct.specs.power}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Custom Configuration Summary Banner if from Configurator */}
            {!prefilledProduct && configSummary && (
              <div className="mt-4 p-3.5 bg-[#16181F] border border-emerald-500/30 rounded-xl space-y-1">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Xüsusi Konfiqurasiya</span>
                </div>
                <div className="text-xs font-mono text-gray-200 whitespace-pre-line leading-relaxed">
                  {configSummary}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    {t.contact.form.firstName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Adınız"
                    className="w-full bg-[#18191E] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD21A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    {t.contact.form.lastName}
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Soyadınız"
                    className="w-full bg-[#18191E] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD21A] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    {t.contact.form.email} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@mail.com"
                    className="w-full bg-[#18191E] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD21A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    {t.contact.form.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+994 50 000 00 00"
                    className="w-full bg-[#18191E] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD21A] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    {t.contact.form.company}
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Memarlıq Bürosu / Şirkət"
                    className="w-full bg-[#18191E] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD21A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    {t.contact.form.projectType}
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full bg-[#18191E] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD21A] transition-colors"
                  >
                    <option value="commercial">Ticarət & Retail</option>
                    <option value="office">Ofis & Biznes Mərkəzi</option>
                    <option value="hospitality">Otel & Restoran</option>
                    <option value="residential">Fərdi Mənzil / Villa</option>
                    <option value="other">Digər Layihə</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  {t.contact.form.message} *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Layihənizin detallarını, tələb olunan metrajı və ya xüsusi qeydlərinizi daxil edin..."
                  className="w-full bg-[#18191E] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD21A] transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <a 
                  href="tel:+994504507007"
                  className="text-xs text-gray-400 hover:text-[#FFD21A] flex items-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#FFD21A]" />
                  <span>+994 50 450 70 07</span>
                </a>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl hover:bg-[#F0C413] transition-all shadow-[0_0_20px_rgba(255,210,26,0.25)] disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? t.contact.form.submitting : t.contact.form.submit}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
