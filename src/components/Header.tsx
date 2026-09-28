import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Language } from '../types';
import { translations } from '../data/translations';
import { MessageSquare, ChevronDown, ChevronRight, Menu, X, Search, Phone, Mail, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  activePage: string;
  onNavigate: (page: string, param?: string) => void;
  onOpenContact: () => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
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
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
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
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'home', num: '01', label: t.nav.home },
    { id: 'catalog', num: '02', label: t.nav.catalog },
    { id: 'projects', num: '03', label: t.nav.projects },
    { 
      id: 'solutions', 
      num: '04', 
      label: t.nav.solutions,
      hasDropdown: true 
    },
    { id: 'configurator', num: '05', label: t.nav.configurator },
    { id: 'about', num: '06', label: t.nav.about },
    { id: 'contact', num: '07', label: t.nav.contact },
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
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#08090A]/95 backdrop-blur-md py-3.5 border-b border-white/10 shadow-2xl' 
            : 'bg-[#08090A]/85 backdrop-blur-sm py-4 sm:py-5 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Zone 1: Single Brand Lockup */}
          <button 
            onClick={() => handleNavClick('home')}
            className="group focus:outline-none focus:ring-1 focus:ring-[#FFD21A] p-0.5 rounded-none"
            aria-label="Ecolife Architectural Lighting Home"
          >
            <Logo size="md" />
          </button>

          {/* Zone 2: Editorial Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-7" aria-label="Main Navigation">
            {navItems.filter(item => item.id !== 'contact').map((item) => {
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
                      className={`flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest transition-colors py-2 ${
                        isActive 
                          ? 'text-[#FFD21A] font-bold' 
                          : 'text-[#F5F5F5]/70 hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isSolutionsDropdownOpen ? 'rotate-180 text-[#FFD21A]' : 'text-gray-500'}`} />
                    </button>

                    {/* Solutions Dropdown Menu */}
                    {isSolutionsDropdownOpen && (
                      <div className="absolute top-full left-0 w-64 bg-[#0E1013] border border-white/10 shadow-2xl py-1 z-50 animate-fadeIn rounded-none">
                        <button
                          onClick={() => { handleNavClick('solutions'); }}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-mono font-bold text-[#FFD21A] tracking-widest uppercase border-b border-white/5 hover:bg-white/5"
                        >
                          {t.solutions.exploreAll} →
                        </button>
                        <button
                          onClick={() => { onNavigate('solutions', 'commercial-lighting'); setIsSolutionsDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs text-[#F5F5F5] hover:text-[#FFD21A] hover:bg-white/5 transition-colors border-b border-white/5"
                        >
                          {currentLang === 'az' ? 'Ticarət və İctimai Məkanlar' : currentLang === 'ru' ? 'Торговые пространства' : 'Commercial & Retail'}
                        </button>
                        <button
                          onClick={() => { onNavigate('solutions', 'office-lighting'); setIsSolutionsDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs text-[#F5F5F5] hover:text-[#FFD21A] hover:bg-white/5 transition-colors border-b border-white/5"
                        >
                          {currentLang === 'az' ? 'Ofis və Biznes Mərkəzləri' : currentLang === 'ru' ? 'Офисы и бизнес-центры' : 'Office & Corporate'}
                        </button>
                        <button
                          onClick={() => { onNavigate('solutions', 'hospitality-lighting'); setIsSolutionsDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs text-[#F5F5F5] hover:text-[#FFD21A] hover:bg-white/5 transition-colors border-b border-white/5"
                        >
                          {currentLang === 'az' ? 'Otel və Restoranlar' : currentLang === 'ru' ? 'Отели и рестораны' : 'Hospitality & Dining'}
                        </button>
                        <button
                          onClick={() => { onNavigate('solutions', 'residential-lighting'); setIsSolutionsDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs text-[#F5F5F5] hover:text-[#FFD21A] hover:bg-white/5 transition-colors"
                        >
                          {currentLang === 'az' ? 'Fərdi Yaşayış və Villalar' : currentLang === 'ru' ? 'Элитное жилье' : 'Luxury Residential'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative text-xs font-mono uppercase tracking-widest transition-colors py-1 flex items-center gap-1.5 ${
                    isActive 
                      ? 'text-[#FFD21A] font-bold' 
                      : 'text-[#F5F5F5]/70 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#FFD21A]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Utilities & Primary Action */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Search Trigger */}
            <button 
              onClick={() => onOpenSearch ? onOpenSearch() : onNavigate('catalog')}
              className="text-gray-400 hover:text-[#FFD21A] transition-colors p-2 hover:bg-white/5 border border-white/10 rounded-none"
              aria-label="Search Catalog"
              title={t.catalog.searchPlaceholder}
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-[#F5F5F5] hover:text-[#FFD21A] px-2.5 py-1.5 border border-white/10 hover:border-[#FFD21A]/40 transition-colors rounded-none"
              >
                <span>{currentLang.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 text-[#FFD21A]" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-1 w-24 bg-[#0E1013] border border-white/10 shadow-xl py-1 z-50 rounded-none">
                  {(['az', 'en', 'ru'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        onLanguageChange(lang);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-[11px] font-mono uppercase transition-colors ${
                        currentLang === lang 
                          ? 'text-[#FFD21A] bg-white/10 font-bold' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {lang === 'az' ? 'AZ' : lang === 'en' ? 'EN' : 'RU'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              onClick={onOpenContact}
              className="flex items-center gap-2 bg-[#FFD21A] hover:bg-[#F0C413] text-black font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all duration-200 shadow-[0_0_15px_rgba(255,210,26,0.2)] rounded-none"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t.nav.writeUs}</span>
            </button>
          </div>

          {/* Mobile & Tablet Icons (Visible on screens < 1024px) */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button 
              onClick={() => onOpenSearch ? onOpenSearch() : onNavigate('catalog')}
              className="p-2 text-gray-300 hover:text-[#FFD21A] rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-white hover:text-[#FFD21A] rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 focus:outline-none transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile & Tablet Menu Modal */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-[#08090A] flex flex-col h-screen w-screen overflow-hidden animate-fadeIn text-[#F5F5F5]"
          id="ecolife-mobile-nav-modal"
        >
          {/* Top Bar inside Menu */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0E1013] flex-shrink-0">
            <button 
              onClick={() => handleNavClick('home')}
              className="focus:outline-none"
            >
              <Logo size="md" />
            </button>

            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenSearch) onOpenSearch();
                }}
                className="p-2.5 text-gray-400 hover:text-[#FFD21A] hover:bg-white/5 border border-white/10"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 focus:outline-none transition-colors"
                aria-label="Close Navigation Menu"
              >
                <X className="w-5 h-5 text-[#FFD21A]" />
              </button>
            </div>
          </div>

          {/* Scrollable Navigation Body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
            
            {/* Language Switcher */}
            <div>
              <div className="flex items-center justify-between p-3 bg-[#0E1013] border border-white/10">
                <span className="text-xs font-mono uppercase tracking-widest text-gray-400">
                  DİL:
                </span>
                <div className="flex space-x-1">
                  {(['az', 'en', 'ru'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => onLanguageChange(lang)}
                      className={`px-3 py-1.5 text-xs font-mono uppercase transition-all ${
                        currentLang === lang 
                          ? 'bg-[#FFD21A] text-black font-bold' 
                          : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Prominent Large Mobile Navigation Links List */}
            <div className="space-y-1 bg-[#0E1013] border border-white/10 p-2 sm:p-3">
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                
                if (item.id === 'solutions') {
                  return (
                    <div key={item.id} className="border-b border-white/5 last:border-none">
                      <button
                        type="button"
                        onClick={() => setIsMobileSolutionsOpen(!isMobileSolutionsOpen)}
                        className="w-full flex items-center justify-between py-3.5 px-3 rounded-lg hover:bg-white/5 transition-colors group"
                        aria-expanded={isMobileSolutionsOpen}
                      >
                        <div className="flex items-center gap-3.5 text-left">
                          <span className="text-sm font-mono text-[#FFD21A] font-extrabold">{item.num}</span>
                          <span className={`text-lg sm:text-xl font-bold tracking-wide transition-colors ${
                            isActive ? 'text-[#FFD21A]' : 'text-white group-hover:text-[#FFD21A]'
                          }`}>
                            {item.label}
                          </span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isMobileSolutionsOpen ? 'rotate-180 text-[#FFD21A]' : 'group-hover:text-[#FFD21A]'}`} />
                      </button>

                      {/* Subcategories */}
                      {isMobileSolutionsOpen && (
                        <div className="pl-6 sm:pl-10 pr-3 pb-4 space-y-2">
                          <button
                            onClick={() => handleNavClick('solutions')}
                            className="w-full text-left py-2 px-2 text-sm sm:text-base font-semibold text-[#FFD21A] hover:bg-white/5 rounded flex items-center justify-between border-b border-white/5"
                          >
                            <span>{currentLang === 'az' ? 'Bütün Həllər' : currentLang === 'ru' ? 'Все решения' : 'All Solutions'}</span>
                            <ChevronRight className="w-4 h-4 text-[#FFD21A]" />
                          </button>
                          <button
                            onClick={() => handleNavClick('solutions', 'commercial-lighting')}
                            className="w-full text-left py-2 px-2 text-sm sm:text-base text-gray-300 hover:text-[#FFD21A] hover:bg-white/5 rounded flex items-center justify-between border-b border-white/5"
                          >
                            <span>• {currentLang === 'az' ? 'Ticarət və İctimai Məkanlar' : currentLang === 'ru' ? 'Торговые пространства' : 'Commercial & Retail'}</span>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleNavClick('solutions', 'office-lighting')}
                            className="w-full text-left py-2 px-2 text-sm sm:text-base text-gray-300 hover:text-[#FFD21A] hover:bg-white/5 rounded flex items-center justify-between border-b border-white/5"
                          >
                            <span>• {currentLang === 'az' ? 'Ofis və Biznes Mərkəzləri' : currentLang === 'ru' ? 'Офисы и бизнес-центры' : 'Office & Corporate'}</span>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleNavClick('solutions', 'hospitality-lighting')}
                            className="w-full text-left py-2 px-2 text-sm sm:text-base text-gray-300 hover:text-[#FFD21A] hover:bg-white/5 rounded flex items-center justify-between border-b border-white/5"
                          >
                            <span>• {currentLang === 'az' ? 'Otel və Restoranlar' : currentLang === 'ru' ? 'Отели и рестораны' : 'Hospitality & Dining'}</span>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleNavClick('solutions', 'residential-lighting')}
                            className="w-full text-left py-2 px-2 text-sm sm:text-base text-gray-300 hover:text-[#FFD21A] hover:bg-white/5 rounded flex items-center justify-between"
                          >
                            <span>• {currentLang === 'az' ? 'Fərdi Yaşayış və Villalar' : currentLang === 'ru' ? 'Элитное жилье' : 'Luxury Residential'}</span>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between py-3.5 px-3 rounded-none text-left transition-all border-b border-white/5 last:border-none ${
                      isActive 
                        ? 'bg-[#FFD21A]/10 text-[#FFD21A] font-extrabold shadow-sm' 
                        : 'text-white hover:bg-white/5 hover:text-[#FFD21A]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-sm font-mono text-[#FFD21A] font-extrabold">{item.num}</span>
                      <span className="text-lg sm:text-xl font-bold tracking-wide">{item.label}</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${isActive ? 'text-[#FFD21A]' : 'text-gray-500'}`} />
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

