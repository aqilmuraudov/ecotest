import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { useData } from '../context/DataContext';
import {
  sanitizeEmail,
  sanitizePhone,
  sanitizeText,
  checkRateLimit,
  getClientFingerprint,
} from '../utils/sanitize';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  Instagram, 
  Facebook, 
  Linkedin,
  MessageSquare
} from 'lucide-react';

interface ContactPageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ currentLang, onNavigate }) => {
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Rate limit: max 3 inquiries per 5 minutes
    if (!checkRateLimit('contact_page_inquiry', 3, 5 * 60 * 1000)) {
      setValidationError(
        currentLang === 'az' 
          ? 'Çoxlu sorğu göndərdiniz. 5 dəqiqə sonra yenidən sınayın.' 
          : currentLang === 'ru' 
            ? 'Слишком много запросов. Попробуйте через 5 минут.' 
            : 'Too many requests. Please try again in 5 minutes.'
      );
      return;
    }

    const cleanEmail = sanitizeEmail(formData.email);
    const cleanPhone = sanitizePhone(formData.phone);
    const cleanFirstName = sanitizeText(formData.firstName, 80);
    const cleanLastName = sanitizeText(formData.lastName, 80);
    const cleanCompany = sanitizeText(formData.company, 120);
    const cleanMessage = sanitizeText(formData.message, 5000);

    if (!cleanEmail) {
      setValidationError(currentLang === 'az' ? 'Düzgün email ünvanı daxil edin.' : currentLang === 'ru' ? 'Введите корректный email.' : 'Please enter a valid email address.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 7) {
      setValidationError(currentLang === 'az' ? 'Düzgün telefon nömrəsi daxil edin.' : currentLang === 'ru' ? 'Введите корректный номер телефона.' : 'Please enter a valid phone number.');
      return;
    }
    if (cleanMessage.length < 5) {
      setValidationError(currentLang === 'az' ? 'Mesaj ən azı 5 simvol olmalıdır.' : currentLang === 'ru' ? 'Сообщение должно содержать не менее 5 символов.' : 'Message must be at least 5 characters.');
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
        ipHash: fingerprint,
      } as any);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Failed to submit contact form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090A] text-[#F5F5F5] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-[#101114] border border-white/10 rounded-2xl p-6 sm:p-10 mb-10 shadow-2xl">
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-3">
            <button onClick={() => onNavigate('home')} className="hover:text-[#FFD21A] transition-colors">
              {t.nav.home}
            </button>
            <span>/</span>
            <span className="text-[#FFD21A]">{t.nav.contact}</span>
          </div>

          <div className="max-w-2xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tight">
              {t.contact.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
              {t.contact.subtitle}
            </p>
          </div>
        </div>

        {/* 2 Column Layout: Contact Info & Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-14">
          
          {/* Left Column: Office & Showroom Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#101114] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                {t.contact.directInfo}
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-white/5">
                  <MapPin className="w-5 h-5 text-[#FFD21A] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-sm mb-0.5">{t.contact.info.address}:</strong>
                    <span className="text-gray-300">{t.contact.info.addressValue}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-white/5">
                  <Phone className="w-5 h-5 text-[#FFD21A] flex-shrink-0" />
                  <div>
                    <strong className="text-white block text-sm mb-0.5">{t.contact.info.phone} & WhatsApp:</strong>
                    <a href="tel:+994504507007" className="text-gray-300 hover:text-[#FFD21A] transition-colors">
                      +994 50 450 70 07
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-white/5">
                  <Mail className="w-5 h-5 text-[#FFD21A] flex-shrink-0" />
                  <div>
                    <strong className="text-white block text-sm mb-0.5">{t.contact.info.email}:</strong>
                    <a href="mailto:info@ecolife.az" className="text-gray-300 hover:text-[#FFD21A] transition-colors">
                      info@ecolife.az
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-white/5">
                  <Clock className="w-5 h-5 text-[#FFD21A] flex-shrink-0" />
                  <div>
                    <strong className="text-white block text-sm mb-0.5">{t.contact.info.hours}:</strong>
                    <span className="text-gray-300">{t.contact.info.hoursValue}</span>
                  </div>
                </div>
              </div>

              {/* Socials */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-gray-400 block mb-3">Sosial Şəbəkələr:</span>
                <div className="flex items-center space-x-3">
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-black hover:bg-[#FFD21A] transition-all">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-black hover:bg-[#FFD21A] transition-all">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-black hover:bg-[#FFD21A] transition-all">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 bg-[#101114] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-xl">
            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-[#FFD21A]/10 border border-[#FFD21A] text-[#FFD21A] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Müraciətiniz Qəbul Edildi!
                </h3>
                <p className="text-sm text-gray-300 max-w-md mx-auto">
                  {t.contact.form.success}
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', projectType: 'commercial', message: '' });
                  }}
                  className="bg-[#FFD21A] text-black font-bold text-xs uppercase px-6 py-3 rounded mt-4"
                >
                  Yeni Müraciət Göndər
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">
                  {t.contact.form.title || (currentLang === 'az' ? 'Onlayn Sorğu Formu' : currentLang === 'ru' ? 'Онлайн Форма Запроса' : 'Online Inquiry Form')}
                </h2>

                {validationError && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2 animate-fadeIn">
                    <span className="font-semibold">{validationError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full bg-[#18191E] border border-white/10 rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD21A]"
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
                      className="w-full bg-[#18191E] border border-white/10 rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD21A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                      {t.contact.form.email} *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full bg-[#18191E] border border-white/10 rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD21A]"
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
                      className="w-full bg-[#18191E] border border-white/10 rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD21A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                      {t.contact.form.company}
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Şirkət / Dizayn Studiyası"
                      className="w-full bg-[#18191E] border border-white/10 rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD21A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                      {t.contact.form.projectType}
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full bg-[#18191E] border border-white/10 rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD21A]"
                    >
                      <option value="commercial">Ticarət & Retail</option>
                      <option value="office">Ofis & Biznes Mərkəzi</option>
                      <option value="hospitality">Otel & Restoran</option>
                      <option value="residential">Fərdi Yaşayış / Villa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    {t.contact.form.message} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Layihənizin tələbləri, metraj və digər qeydlər..."
                    className="w-full bg-[#18191E] border border-white/10 rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD21A] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider py-4 rounded hover:bg-[#F0C413] transition-all shadow-[0_0_20px_rgba(255,210,26,0.25)] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? t.contact.form.submitting : t.contact.form.submit}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
