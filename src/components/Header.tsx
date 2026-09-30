import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Language, Theme } from '../types';
import { translations } from '../data/translations';
import { ChevronDown, ChevronRight, Menu, X, Search, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  currentTheme: Theme;
  onToggleTheme: () => void;
  activePage: string;
  onNavigate: (page: string, param?: string) => void;
  onOpenContact: () => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  currentTheme,
  onToggleTheme,
  activePage,
  onNavigate,
  onOpenContact,
  onOpenSearch
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isSolutionsDropdownOpen, setIsSolutionsDropdownOpen] = useState(false);
  const [isMobileSolutionsOpen, setIsMobileSolutionsOpen] = useState(false);

  const t = translations[currentLang];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  interface NavItem {
    id: string;
    num: string;
    label: string;
    hasDropdown?: boolean;
  }

  const navItems: NavItem[] = [
    { id: 'catalog', num: '01', label: currentLang === 'az' ? 'Məhsullar' : currentLang === 'ru' ? 'Продукты' : 'Products' },
    { id: 'projects', num: '02', label: t.nav.projects },
    { id: 'solutions', num: '03', label: t.nav.solutions, hasDropdown: true },
    { id: 'configurator', num: '04', label: t.nav.configurator },
    { id: 'about', num: '05', label: t.nav.about },
  ];

  const handleNavClick = (pageId: string, param?: string) => {
    onNavigate(pageId, param);
    setIsMobileMenuOpen(false);
    setIsSolutionsDropdownOpen(false);
  };

  return (
    <>
      <header
        id="ecolife-global-header"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#1d1d1b]/90 backdrop-blur-xl border-b border-[var(--ed-line)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 flex items-center justify-between h-[72px]">
          {/* Brand */}
          <button
            onClick={() => handleNavClick('home')}
            className="group focus:outline-none focus:ring-1 focus:ring-[var(--ed-amber)] rounded p-1"
            aria-label="Ecolife Home"
          >
            <Logo size="md" theme={currentTheme} />
          </button>

          {/* Center Navigation — small, generous spacing, underline animation */}
          <nav className="hidden lg:flex items-center gap-10 xl:gap-12" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activePage === item.id || (item.id === 'catalog' && activePage.startsWith('catalog-'));

              if (item.hasDropdown) {
                return (
                  <div
                    key={item.id}
                    className="relative group"
                    onMouseEnter={() => setIsSolutionsDropdownOpen(true)}
                    onMouseLeave={() => setIsSolutionsDropdownOpen(false)}
                  >
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`relative font-micro text-[11px] transition-colors py-2 flex items-center gap-1.5 ${
                        isActive ? 'text-amber-warm' : 'text-[var(--ed-soft)] hover:text-ivory'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isSolutionsDropdownOpen ? 'rotate-180' : ''}`} />
                      <span className={`absolute bottom-0 left-0 right-0 h-px bg-[var(--ed-amber)] transition-transform duration-300 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                    </button>

                    {/* Quiet dropdown */}
                    {isSolutionsDropdownOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-60 bg-[#24231f] border border-[var(--ed-line)] rounded-xl shadow-2xl py-2 px-1.5 z-50 animate-fadeIn">
                        <button
                          onClick={() => { handleNavClick('solutions'); }}
                          className="w-full text-left px-3 py-2.5 text-xs font-micro text-amber-warm hover:bg-white/5 rounded-lg"
                        >
                          {t.solutions.exploreAll}
                        </button>
                        <div className="ed-hairline my-1" />
                        {[
                          { slug: 'commercial-lighting', az: 'Ticarət və İctimai', ru: 'Торговые пространства', en: 'Commercial & Retail' },
                          { slug: 'office-lighting', az: 'Ofis və Biznes', ru: 'Офисы и бизнес', en: 'Office & Corporate' },
                          { slug: 'hospitality-lighting', az: 'Otel və Restoranlar', ru: 'Отели и рестораны', en: 'Hospitality & Dining' },
                          { slug: 'residential-lighting', az: 'Fərdi Yaşayış', ru: 'Элитное жилье', en: 'Luxury Residential' },
                        ].map((entry) => (
                          <button
                            key={entry.slug}
                            onClick={() => { onNavigate('solutions', entry.slug); setIsSolutionsDropdownOpen(false); }}
                            className="w-full text-left px-3 py-2.5 text-[13px] text-[var(--ed-soft)] hover:text-ivory hover:bg-white/5 rounded-lg transition-colors"
                          >
                            {currentLang === 'az' ? entry.az : currentLang === 'ru' ? entry.ru : entry.en}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative font-micro text-[11px] transition-colors py-2 ${
                    isActive ? 'text-amber-warm' : 'text-[var(--ed-soft)] hover:text-ivory'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className={`absolute bottom-0 left-0 right-0 h-px bg-[var(--ed-amber)] transition-transform duration-300 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </button>
              );
            })}
          </nav>

          {/* Right controls: search · language · contact */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => onOpenSearch ? onOpenSearch() : onNavigate('catalog')}
              className="p-2.5 text-[var(--ed-soft)] hover:text-amber-warm transition-colors rounded-full hover:bg-white/5"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 text-[var(--ed-soft)] hover:text-amber-warm transition-colors rounded-full hover:bg-white/5"
              aria-label="Toggle theme"
            >
              {currentTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="font-micro text-[11px] text-[var(--ed-soft)] hover:text-ivory px-2.5 py-1.5 rounded-full border border-[var(--ed-line)] hover:border-[rgba(242,237,227,0.3)] transition-colors flex items-center gap-1"
              >
                {currentLang.toUpperCase()}
                <ChevronDown className="w-3 h-3" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-28 bg-[#24231f] border border-[var(--ed-line)] rounded-xl shadow-xl py-1 z-50 animate-fadeIn">
                  {(['az', 'en', 'ru'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { onLanguageChange(lang); setIsLangDropdownOpen(false); }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-micro transition-colors ${
                        currentLang === lang ? 'text-amber-warm' : 'text-[var(--ed-soft)] hover:text-ivory hover:bg-white/5'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Contact CTA */}
            <button
              onClick={onOpenContact}
              className="ed-btn-primary !py-2 !px-5 ml-2"
            >
              {t.nav.contact}
            </button>
          </div>

          {/* Mobile icons */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              onClick={() => onOpenSearch ? onOpenSearch() : onNavigate('catalog')}
              className="p-2.5 text-[var(--ed-soft)] hover:text-amber-warm transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2.5 text-ivory hover:text-amber-warm transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[100] bg-[#1d1d1b] flex flex-col h-screen w-screen overflow-hidden animate-fadeIn"
          id="ecolife-mobile-nav-modal"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ed-line)] flex-shrink-0">
            <button onClick={() => handleNavClick('home')} className="focus:outline-none">
              <Logo size="md" theme={currentTheme} />
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleTheme}
                className="p-2.5 text-[var(--ed-soft)] hover:text-amber-warm"
                aria-label="Toggle theme"
              >
                {currentTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 text-ivory hover:text-amber-warm"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Nav body */}
          <div className="flex-1 overflow-y-auto px-5 py-8 space-y-8">
            {/* Language pills */}
            <div className="flex gap-2">
              {(['az', 'en', 'ru'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={`ed-pill !px-4 !py-1.5 !text-xs ${currentLang === lang ? 'ed-pill--active' : ''}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Large nav list */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activePage === item.id;

                if (item.id === 'solutions') {
                  return (
                    <div key={item.id} className="border-b border-[var(--ed-line-soft)]">
                      <button
                        type="button"
                        onClick={() => setIsMobileSolutionsOpen(!isMobileSolutionsOpen)}
                        className="w-full flex items-center justify-between py-4 text-left"
                        aria-expanded={isMobileSolutionsOpen}
                      >
                        <div className="flex items-baseline gap-4">
                          <span className="font-mono-tech text-xs text-mute">{item.num}</span>
                          <span className={`ed-display-sm font-display ${isActive ? 'text-amber-warm' : 'text-ivory'}`}>
                            {item.label}
                          </span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-mute transition-transform duration-200 ${isMobileSolutionsOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isMobileSolutionsOpen && (
                        <div className="pb-5 pl-10 space-y-1">
                          <button
                            onClick={() => handleNavClick('solutions')}
                            className="w-full text-left py-2.5 text-sm text-amber-warm flex items-center justify-between"
                          >
                            <span>{t.solutions.exploreAll}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          {[
                            { slug: 'commercial-lighting', az: 'Ticarət və İctimai', ru: 'Торговые пространства', en: 'Commercial & Retail' },
                            { slug: 'office-lighting', az: 'Ofis və Biznes', ru: 'Офисы и бизнес', en: 'Office & Corporate' },
                            { slug: 'hospitality-lighting', az: 'Otel və Restoranlar', ru: 'Отели и рестораны', en: 'Hospitality & Dining' },
                            { slug: 'residential-lighting', az: 'Fərdi Yaşayış', ru: 'Элитное жилье', en: 'Luxury Residential' },
                          ].map((entry) => (
                            <button
                              key={entry.slug}
                              onClick={() => handleNavClick('solutions', entry.slug)}
                              className="w-full text-left py-2.5 text-sm text-[var(--ed-soft)] hover:text-ivory"
                            >
                              {currentLang === 'az' ? entry.az : currentLang === 'ru' ? entry.ru : entry.en}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-baseline gap-4 py-4 text-left border-b border-[var(--ed-line-soft)] ${
                      isActive ? 'text-amber-warm' : 'text-ivory'
                    }`}
                  >
                    <span className="font-mono-tech text-xs text-mute">{item.num}</span>
                    <span className="ed-display-sm font-display">{item.label}</span>
                  </button>
                );
              })}

              {/* Contact */}
              <button
                onClick={() => handleNavClick('contact')}
                className="w-full flex items-baseline gap-4 py-4 text-left border-b border-[var(--ed-line-soft)] text-ivory"
              >
                <span className="font-mono-tech text-xs text-mute">06</span>
                <span className="ed-display-sm font-display">{t.nav.contact}</span>
              </button>
            </nav>

            {/* Contact CTA */}
            <button onClick={onOpenContact} className="ed-btn-primary w-full justify-center">
              {t.nav.writeUs}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
