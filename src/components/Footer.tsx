import React from 'react';
import { Logo } from './Logo';
import { Language, Theme } from '../types';
import { translations } from '../data/translations';
import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';

interface FooterProps {
  currentLang: Language;
  currentTheme?: Theme;
  onNavigate: (page: string, param?: string) => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ currentLang, currentTheme, onNavigate }) => {
  const t = translations[currentLang];

  const navItems = [
    { id: 'catalog', label: currentLang === 'az' ? 'Məhsullar' : currentLang === 'ru' ? 'Продукты' : 'Products' },
    { id: 'projects', label: t.nav.projects },
    { id: 'solutions', label: t.nav.solutions },
    { id: 'configurator', label: t.nav.configurator },
    { id: 'blog', label: currentLang === 'az' ? 'Bloq' : currentLang === 'ru' ? 'Блог' : 'Blog' },
    { id: 'about', label: t.nav.about },
    { id: 'contact', label: t.nav.contact },
  ];

  return (
    <footer id="ecolife-global-footer" className="bg-[var(--ed-bg)] pt-10 pb-10">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

        {/* Oversized wordmark row */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 pb-14">
          <div className="space-y-5">
            <Logo size="lg" theme={currentTheme} />
            <p className="text-sm text-mute max-w-xs leading-relaxed">
              {t.footer.tagline}
            </p>
          </div>

          {/* Minimal nav columns */}
          <div className="flex flex-wrap gap-x-16 gap-y-8">
            <nav className="space-y-3.5" aria-label="Footer Navigation">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="block text-sm text-[var(--ed-soft)] hover:text-amber-warm transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Contact */}
            <div className="space-y-3.5 text-sm">
              <a
                href="tel:+994504507007"
                className="flex items-center gap-2.5 text-[var(--ed-soft)] hover:text-amber-warm transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-warm" />
                <span className="font-mono-tech text-xs">+994 50 450 70 07</span>
              </a>
              <a
                href="mailto:info@ecolife.az"
                className="flex items-center gap-2.5 text-[var(--ed-soft)] hover:text-amber-warm transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-amber-warm" />
                <span>info@ecolife.az</span>
              </a>
              <div className="flex items-start gap-2.5 text-[var(--ed-soft)] max-w-[240px]">
                <MapPin className="w-3.5 h-3.5 text-amber-warm flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed text-xs">{t.contact.info.addressValue}</span>
              </div>

              {/* Socials */}
              <div className="flex items-center gap-2 pt-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full border border-[var(--ed-line)] flex items-center justify-center text-[var(--ed-soft)] hover:text-[#1d1d1b] hover:bg-[var(--ed-amber)] hover:border-[var(--ed-amber)] transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full border border-[var(--ed-line)] flex items-center justify-center text-[var(--ed-soft)] hover:text-[#1d1d1b] hover:bg-[var(--ed-amber)] hover:border-[var(--ed-amber)] transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full border border-[var(--ed-line)] flex items-center justify-center text-[var(--ed-soft)] hover:text-[#1d1d1b] hover:bg-[var(--ed-amber)] hover:border-[var(--ed-amber)] transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="ed-hairline" />

        {/* Bottom bar */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-micro text-[10px] text-mute">{t.footer.rights}</p>
          <div className="flex items-center gap-8">
            <span className="font-micro text-[10px] text-mute">ecolife.az</span>
            <button onClick={() => onNavigate('about')} className="font-micro text-[10px] text-mute hover:text-ivory transition-colors">
              {t.footer.terms}
            </button>
            <button onClick={() => onNavigate('about')} className="font-micro text-[10px] text-mute hover:text-ivory transition-colors">
              {t.footer.privacy}
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
