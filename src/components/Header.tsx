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
            className="group rounded-full p-1 focus:outline-none focus:ring-1 focus:ring-[#FFD21A]/70"
            aria-label="Ecolife Architectural Lighting Home"
          >
            <Logo size="md" />
          </button>

          {/* Zone 2: Editorial Navigation Links (Desktop) */}
          <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Main Navigation">
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
                      className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-mono uppercase tracking-widest transition-all ${
                        isActive 
                          ? 'bg-white/15 text-[#FFD21A] font-bold shadow-[inset_0_1px_rgba(255,255,255,.18)]'
                          : 'text-[#F5F5F5]/70 hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isSolutionsDropdownOpen ? 'rotate-180 text-[#FFD21A]' : 'text-gray-500'}`} />
                    </button>

                    {/* Solutions Dropdown Menu */}
                    {isSolutionsDropdownOpen && (
                      <div className="absolute left-0 top-full z-50 w-64 pt-2 animate-fadeIn">
                        <div className="space-y-1 rounded-2xl border border-white/20 bg-[#38271f]/88 p-2 shadow-[inset_0_1px_rgba(255,255,255,.18),0_24px_60px_rgba(0,0,0,.34)] backdrop-blur-2xl">
                        <button
                          onClick={() => { handleNavClick('solutions'); }}
                          className="w-full rounded-xl px-4 py-2.5 text-left text-[11px] font-mono font-bold uppercase tracking-widest text-[#FFD21A] hover:bg-white/10"
                        >
                          {t.solutions.exploreAll} →
                        </button>
                        <button
                          onClick={() => { onNavigate('solutions', 'commercial-lighting'); setIsSolutionsDropdownOpen(false); }}
                          className="w-full rounded-xl px-4 py-2.5 text-left text-xs text-[#F5F5F5] transition-colors hover:bg-white/10 hover:text-[#FFD21A]"
                        >
                          {currentLang === 'az' ? 'Ticarət və İctimai Məkanlar' : currentLang === 'ru' ? 'Торговые пространства' : 'Commercial & Retail'}
                        </button>
                        <button
                          onClick={() => { onNavigate('solutions', 'office-lighting'); setIsSolutionsDropdownOpen(false); }}
                          className="w-full rounded-xl px-4 py-2.5 text-left text-xs text-[#F5F5F5] transition-colors hover:bg-white/10 hover:text-[#FFD21A]"
                        >
                          {currentLang === 'az' ? 'Ofis və Biznes Mərkəzləri' : currentLang === 'ru' ? 'Офисы и бизнес-центры' : 'Office & Corporate'}
                        </button>
                        <button
                          onClick={() => { onNavigate('solutions', 'hospitality-lighting'); setIsSolutionsDropdownOpen(false); }}
                          className="w-full rounded-xl px-4 py-2.5 text-left text-xs text-[#F5F5F5] transition-colors hover:bg-white/10 hover:text-[#FFD21A]"
                        >
                          {currentLang === 'az' ? 'Otel və Restoranlar' : currentLang === 'ru' ? 'Отели и рестораны' : 'Hospitality & Dining'}
                        </button>
                        <button
                          onClick={() => { onNavigate('solutions', 'residential-lighting'); setIsSolutionsDropdownOpen(false); }}
                          className="w-full rounded-xl px-4 py-2.5 text-left text-xs text-[#F5F5F5] transition-colors hover:bg-white/10 hover:text-[#FFD21A]"
                        >
                          {currentLang === 'az' ? 'Fərdi Yaşayış və Villalar' : currentLang === 'ru' ? 'Элитное жилье' : 'Luxury Residential'}
                        </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-mono uppercase tracking-widest transition-all ${
                    isActive 
                      ? 'bg-white/15 text-[#FFD21A] font-bold shadow-[inset_0_1px_rgba(255,255,255,.18)]'
                      : 'text-[#F5F5F5]/70 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Utilities & Primary Action */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Search Trigger */}
            <button 
              onClick={() => onOpenSearch ? onOpenSearch() : onNavigate('catalog')}
              className="rounded-full border border-white/15 bg-white/[.07] p-2.5 text-gray-300 shadow-[inset_0_1px_rgba(255,255,255,.12)] transition-all hover:border-[#FFD21A]/40 hover:bg-white/15 hover:text-[#FFD21A]"
              aria-label="Search Catalog"
              title={t.catalog.searchPlaceholder}
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[.07] px-3 py-2 text-[11px] font-mono uppercase tracking-widest text-[#F5F5F5] shadow-[inset_0_1px_rgba(255,255,255,.12)] transition-all hover:border-[#FFD21A]/40 hover:bg-white/15 hover:text-[#FFD21A]"
              >
                <span>{currentLang.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 text-[#FFD21A]" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-28 space-y-1 rounded-2xl border border-white/15 bg-[#201713]/90 p-2 shadow-xl backdrop-blur-2xl">
                  {(['az', 'en', 'ru'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        onLanguageChange(lang);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full rounded-xl px-3 py-2 text-left text-[11px] font-mono uppercase transition-all ${
                        currentLang === lang 
                          ? 'bg-white/15 text-[#FFD21A] font-bold shadow-inner'
                          : 'text-gray-400 hover:bg-white/10 hover:text-white'
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
              className="flex items-center gap-2 rounded-full border border-[#ffe778]/70 bg-[linear-gradient(135deg,#ffe36c,#ffd21a)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-[inset_0_1px_rgba(255,255,255,.65),0_0_22px_rgba(255,210,26,.24)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t.nav.writeUs}</span>
            </button>
          </div>

          {/* Mobile & Tablet Icons (Visible on screens < 1024px) */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button 
              onClick={() => onOpenSearch ? onOpenSearch() : onNavigate('catalog')}
              className="rounded-full border border-transparent p-2.5 text-gray-300 transition-all hover:border-white/15 hover:bg-white/10 hover:text-[#FFD21A]"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-full border border-white/15 bg-white/10 p-2.5 text-white shadow-[inset_0_1px_rgba(255,255,255,.14)] transition-all hover:bg-white/15 hover:text-[#FFD21A] focus:outline-none"
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
          className="fixed inset-0 z-[100] flex h-screen w-screen flex-col overflow-hidden bg-[#08090A] text-[#F5F5F5] animate-fadeIn"
          id="ecolife-mobile-nav-modal"
        >
          {/* Top Bar inside Menu */}
          <div className="flex flex-shrink-0 items-center justify-between rounded-3xl border border-white/15 bg-[#0E1013] px-5 py-4 shadow-[inset_0_1px_rgba(255,255,255,.14),0_16px_50px_rgba(0,0,0,.28)]">
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
                className="rounded-full border border-white/15 bg-white/[.06] p-2.5 text-gray-300 transition-all hover:bg-white/15 hover:text-[#FFD21A]"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full border border-white/15 bg-white/10 p-2.5 text-gray-300 transition-all hover:bg-white/15 hover:text-white focus:outline-none"
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
              <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-[#0E1013] p-3 shadow-[inset_0_1px_rgba(255,255,255,.12)]">
                <span className="text-xs font-mono uppercase tracking-widest text-gray-400">
                  DİL:
                </span>
                <div className="flex space-x-1 rounded-full border border-white/10 bg-black/15 p-1">
                  {(['az', 'en', 'ru'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => onLanguageChange(lang)}
                      className={`rounded-full px-3 py-1.5 text-xs font-mono uppercase transition-all ${
                        currentLang === lang 
                          ? 'bg-[#FFD21A] text-black font-bold shadow-[0_0_16px_rgba(255,210,26,.22)]'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Prominent Large Mobile Navigation Links List */}
            <div className="space-y-1.5 rounded-3xl border border-white/15 bg-[#0E1013] p-2.5 shadow-[inset_0_1px_rgba(255,255,255,.12)] sm:p-3">
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                
                if (item.id === 'solutions') {
                  return (
                    <div key={item.id} className="rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setIsMobileSolutionsOpen(!isMobileSolutionsOpen)}
                        className={`group flex w-full items-center justify-between rounded-2xl px-3 py-3.5 transition-all ${isActive ? 'bg-white/15 shadow-inner' : 'hover:bg-white/10'}`}
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
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#FFD21A] hover:bg-white/10 sm:text-base"
                          >
                            <span>{currentLang === 'az' ? 'Bütün Həllər' : currentLang === 'ru' ? 'Все решения' : 'All Solutions'}</span>
                            <ChevronRight className="w-4 h-4 text-[#FFD21A]" />
                          </button>
                          <button
                            onClick={() => handleNavClick('solutions', 'commercial-lighting')}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-[#FFD21A] sm:text-base"
                          >
                            <span>• {currentLang === 'az' ? 'Ticarət və İctimai Məkanlar' : currentLang === 'ru' ? 'Торговые пространства' : 'Commercial & Retail'}</span>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleNavClick('solutions', 'office-lighting')}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-[#FFD21A] sm:text-base"
                          >
                            <span>• {currentLang === 'az' ? 'Ofis və Biznes Mərkəzləri' : currentLang === 'ru' ? 'Офисы и бизнес-центры' : 'Office & Corporate'}</span>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleNavClick('solutions', 'hospitality-lighting')}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-[#FFD21A] sm:text-base"
                          >
                            <span>• {currentLang === 'az' ? 'Otel və Restoranlar' : currentLang === 'ru' ? 'Отели и рестораны' : 'Hospitality & Dining'}</span>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleNavClick('solutions', 'residential-lighting')}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-[#FFD21A] sm:text-base"
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
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-3.5 text-left transition-all ${
                      isActive 
                        ? 'bg-white/15 text-[#FFD21A] font-extrabold shadow-[inset_0_1px_rgba(255,255,255,.14)]'
                        : 'text-white hover:bg-white/10 hover:text-[#FFD21A]'
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

