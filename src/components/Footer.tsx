import React from 'react';
import { Logo } from './Logo';
import { Language, Theme } from '../types';
import { translations } from '../data/translations';
import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin, ArrowRight } from 'lucide-react';

interface FooterProps {
  currentLang: Language;
  currentTheme?: Theme;
  onNavigate: (page: string, param?: string) => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ currentLang, currentTheme, onNavigate, onOpenContact }) => {
  const t = translations[currentLang];

  const navItems = [
    { id: 'home', num: '01', label: t.nav.home },
    { id: 'catalog', num: '02', label: t.nav.catalog },
    { id: 'projects', num: '03', label: t.nav.projects },
    { id: 'solutions', num: '04', label: t.nav.solutions },
    { id: 'configurator', num: '05', label: t.nav.configurator },
    { id: 'blog', num: '06', label: currentLang === 'az' ? 'Bloq & Xəbərlər' : currentLang === 'ru' ? 'Блог' : 'Blog' },
    { id: 'about', num: '07', label: t.nav.about },
    { id: 'contact', num: '08', label: t.nav.contact },
  ];

  return (
    <footer id="ecolife-global-footer" className="bg-[#08090A] border-t border-white/10 pt-16 pb-12 text-[#9E9EA4] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10 items-start">
          
          {/* Brand & Identity (col-span-4) */}
          <div className="md:col-span-4 space-y-4">
            <button 
              onClick={() => onNavigate('home')} 
              className="focus:outline-none"
              aria-label="Ecolife Home"
            >
              <Logo size="md" theme={currentTheme} />
            </button>
            <p className="text-sm text-gray-400 font-normal max-w-sm leading-relaxed">
              {t.footer.tagline}
            </p>
          </div>

          {/* Navigation Links from Navbar (col-span-5) */}
          <div className="md:col-span-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              {currentLang === 'az' ? 'Naviqasiya' : currentLang === 'ru' ? 'Навигация' : 'Navigation'}
            </h4>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="group flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="text-[11px] font-mono text-gray-600 group-hover:text-[#FFD21A] transition-colors">
                      {item.num}
                    </span>
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Contact & Socials (col-span-3) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              {t.footer.contactCol}
            </h4>
            
            <ul className="space-y-3 text-xs">
              <li>
                <a 
                  href="tel:+994504507007" 
                  className="flex items-center gap-2.5 text-gray-300 hover:text-[#FFD21A] transition-colors group"
                >
                  <Phone className="w-4 h-4 text-[#FFD21A] flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>+994 50 450 70 07</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:info@ecolife.az" 
                  className="flex items-center gap-2.5 text-gray-300 hover:text-[#FFD21A] transition-colors group"
                >
                  <Mail className="w-4 h-4 text-[#FFD21A] flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>info@ecolife.az</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-gray-300">
                <MapPin className="w-4 h-4 text-[#FFD21A] flex-shrink-0 mt-0.5" />
                <span>{t.contact.info.addressValue}</span>
              </li>
            </ul>

            {/* Social Media Icons */}
            <div className="pt-2 flex items-center space-x-2.5">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-black hover:bg-[#FFD21A] hover:border-[#FFD21A] transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-black hover:bg-[#FFD21A] hover:border-[#FFD21A] transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-black hover:bg-[#FFD21A] hover:border-[#FFD21A] transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>{t.footer.rights}</p>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => onNavigate('about')}
              className="hover:text-gray-300 transition-colors"
            >
              {t.footer.terms}
            </button>
            <button 
              onClick={() => onNavigate('about')}
              className="hover:text-gray-300 transition-colors"
            >
              {t.footer.privacy}
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
