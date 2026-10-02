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
import { FadeIn } from '../components/ui/FadeIn';
import { EdButton, EdHairline } from '../components/ed/EditorialUI';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Instagram,
  Facebook,
  Linkedin
} from 'lucide-react';

interface ContactPageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const { addInquiry, pagesContent } = useData();
  const contactData = pagesContent?.contact;

  const pageTitle = contactData?.title?.[currentLang] || t.contact.title;
  const pageSubtitle = contactData?.subtitle?.[currentLang] || t.contact.subtitle;
  const contactPhone = contactData?.phone || '+994 50 450 70 07';
  const contactEmail = contactData?.email || 'info@ecolife.az';
  const contactAddress = contactData?.address?.[currentLang] || t.contact.info.addressValue;
  const contactHours = contactData?.hours?.[currentLang] || t.contact.info.hoursValue;

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

    // Rate limit: max 3 inquiries per 5 minutes (preserved)
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

  const inputLabel = "block font-micro text-[9px] text-mute mb-2";

  return (
    <div className="bg-[var(--ed-bg)] text-[var(--ed-ivory)] pt-32 pb-24">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="mb-16">
          <FadeIn>
            <p className="font-micro text-amber-warm mb-5">05 — {t.nav.contact}</p>
            <h1 className="ed-display-lg font-display text-ivory">
              {pageTitle}
            </h1>
            <p className="text-sm text-mute mt-6 max-w-lg leading-relaxed">
              {pageSubtitle}
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-start">

          {/* Contact information — thin dividers, no card */}
          <div className="lg:col-span-5">
            <FadeIn delay={0.1}>
              <p className="font-micro text-amber-warm mb-8">{t.contact.directInfo}</p>

              <div className="border-t border-[var(--ed-line)]">
                <div className="py-6 border-b border-[var(--ed-line)] flex items-start gap-4">
                  <MapPin className="w-4 h-4 text-amber-warm flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-micro text-[9px] text-mute block mb-1.5">{t.contact.info.address}</span>
                    <span className="text-sm text-[var(--ed-ivory)] leading-relaxed">{contactAddress}</span>
                  </div>
                </div>

                <div className="py-6 border-b border-[var(--ed-line)] flex items-start gap-4">
                  <Phone className="w-4 h-4 text-amber-warm flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-micro text-[9px] text-mute block mb-1.5">{t.contact.info.phone}</span>
                    <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className="font-mono-tech text-sm text-[var(--ed-ivory)] hover:text-amber-warm transition-colors">
                      {contactPhone}
                    </a>
                  </div>
                </div>

                <div className="py-6 border-b border-[var(--ed-line)] flex items-start gap-4">
                  <Mail className="w-4 h-4 text-amber-warm flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-micro text-[9px] text-mute block mb-1.5">{t.contact.info.email}</span>
                    <a href={`mailto:${contactEmail}`} className="text-sm text-[var(--ed-ivory)] hover:text-amber-warm transition-colors">
                      {contactEmail}
                    </a>
                  </div>
                </div>

                <div className="py-6 border-b border-[var(--ed-line)] flex items-start gap-4">
                  <Clock className="w-4 h-4 text-amber-warm flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-micro text-[9px] text-mute block mb-1.5">{t.contact.info.hours}</span>
                    <span className="text-sm text-[var(--ed-ivory)]">{contactHours}</span>
                  </div>
                </div>
              </div>

              {/* Socials */}
              <div className="pt-8 flex items-center gap-2.5">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-[var(--ed-line)] flex items-center justify-center text-[var(--ed-soft)] hover:text-[#1d1d1b] hover:bg-[var(--ed-amber)] hover:border-[var(--ed-amber)] transition-all" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-[var(--ed-line)] flex items-center justify-center text-[var(--ed-soft)] hover:text-[#1d1d1b] hover:bg-[var(--ed-amber)] hover:border-[var(--ed-amber)] transition-all" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-[var(--ed-line)] flex items-center justify-center text-[var(--ed-soft)] hover:text-[#1d1d1b] hover:bg-[var(--ed-amber)] hover:border-[var(--ed-amber)] transition-all" aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Inquiry form — open editorial layout */}
          <div className="lg:col-span-7">
            <FadeIn delay={0.15}>
              {isSubmitted ? (
                <div className="py-20 text-center">
                  <CheckCircle className="w-10 h-10 text-amber-warm mx-auto mb-6" />
                  <h2 className="ed-display-md font-display text-ivory">
                    {currentLang === 'az' ? 'qəbul edildi' : currentLang === 'ru' ? 'принято' : 'received'}
                  </h2>
                  <p className="text-sm text-mute max-w-md mx-auto mt-6 leading-relaxed">
                    {t.contact.form.success}
                  </p>
                  <div className="mt-10">
                    <EdButton
                      variant="ghost"
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', projectType: 'commercial', message: '' });
                      }}
                    >
                      {currentLang === 'az' ? 'Yeni müraciət' : currentLang === 'ru' ? 'Новый запрос' : 'New inquiry'}
                    </EdButton>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {validationError && (
                    <div className="p-4 border border-red-500/40 bg-red-500/10 text-red-400 text-xs rounded-lg animate-fadeIn">
                      {validationError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={inputLabel}>{t.contact.form.firstName} *</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder={currentLang === 'az' ? 'Adınız' : currentLang === 'ru' ? 'Ваше имя' : 'First name'}
                        className="ed-input"
                      />
                    </div>
                    <div>
                      <label className={inputLabel}>{t.contact.form.lastName}</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder={currentLang === 'az' ? 'Soyadınız' : currentLang === 'ru' ? 'Ваша фамилия' : 'Last name'}
                        className="ed-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={inputLabel}>{t.contact.form.email} *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="ed-input"
                      />
                    </div>
                    <div>
                      <label className={inputLabel}>{t.contact.form.phone} *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+994 50 000 00 00"
                        className="ed-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={inputLabel}>{t.contact.form.company}</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder={currentLang === 'az' ? 'Şirkət / Dizayn Studiyası' : currentLang === 'ru' ? 'Компания / Студия' : 'Company / Studio'}
                        className="ed-input"
                      />
                    </div>
                    <div>
                      <label className={inputLabel}>{t.contact.form.projectType}</label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        className="ed-input"
                      >
                        <option value="commercial">{currentLang === 'az' ? 'Ticarət & Retail' : currentLang === 'ru' ? 'Торговля' : 'Commercial & Retail'}</option>
                        <option value="office">{currentLang === 'az' ? 'Ofis & Biznes Mərkəzi' : currentLang === 'ru' ? 'Офис' : 'Office & Corporate'}</option>
                        <option value="hospitality">{currentLang === 'az' ? 'Otel & Restoran' : currentLang === 'ru' ? 'Отели и рестораны' : 'Hospitality'}</option>
                        <option value="residential">{currentLang === 'az' ? 'Fərdi Yaşayış / Villa' : currentLang === 'ru' ? 'Жилье' : 'Residential'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={inputLabel}>{t.contact.form.message} *</label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={currentLang === 'az' ? 'Layihənizin tələbləri, metraj və digər qeydlər...' : currentLang === 'ru' ? 'Требования проекта, метраж и примечания...' : 'Project requirements, area and other notes...'}
                      className="ed-input resize-none"
                    />
                  </div>

                  <EdButton type="submit" arrow disabled={isSubmitting} className="w-full justify-center !py-4">
                    {isSubmitting ? t.contact.form.submitting : t.contact.form.submit}
                  </EdButton>
                </form>
              )}
            </FadeIn>
          </div>
        </div>

        <EdHairline className="mt-24" />

      </div>
    </div>
  );
};
