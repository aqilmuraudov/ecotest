import React, { useState, useMemo, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { useData } from '../context/DataContext';
import { solutions } from '../data/solutions';
import { getLocalizedText } from '../utils/lang';
import { Search, X, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onNavigate
}) => {
  const t = translations[currentLang];
  const { products, projects } = useData();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return { products: [], projects: [], solutions: [] };
    const q = query.toLowerCase();

    return {
      products: products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        getLocalizedText(p.categoryName, currentLang).toLowerCase().includes(q)
      ).slice(0, 4),
      projects: projects.filter(pr =>
        (typeof pr.title === 'string' ? pr.title : getLocalizedText(pr.title, currentLang)).toLowerCase().includes(q) ||
        pr.location.toLowerCase().includes(q)
      ).slice(0, 3),
      solutions: solutions.filter(s =>
        getLocalizedText(s.title, currentLang).toLowerCase().includes(q)
      ).slice(0, 2)
    };
  }, [query, currentLang]);

  if (!isOpen) return null;

  const handleSelect = (page: string, param?: string) => {
    onNavigate(page, param);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-[#141412]/90 backdrop-blur-md animate-fadeIn">
      <div
        id="ecolife-global-search-modal"
        className="relative w-full max-w-2xl bg-[#24231f] border border-[var(--ed-line)] rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden text-[var(--ed-ivory)]"
      >
        {/* Search input */}
        <div className="relative border-b border-[var(--ed-line)] p-5 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-warm flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.catalog.searchPlaceholder}
            className="w-full bg-transparent text-lg text-[var(--ed-ivory)] placeholder-[var(--ed-faint)] focus:outline-none font-light"
          />
          <button
            onClick={onClose}
            className="text-[var(--ed-mute)] hover:text-amber-warm p-1.5 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-mute space-y-3">
              <div>
                {currentLang === 'az'
                  ? 'Məhsul adı, kod və ya layihə adı daxil edin.'
                  : currentLang === 'ru'
                    ? 'Введите название продукта, артикул или название проекта.'
                    : 'Enter a product name, code, or project title.'}
              </div>
              <div className="flex justify-center gap-2 pt-2">
                {['Linear', 'Rail', 'Ofis'].map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="ed-pill !py-1 !px-3.5 !text-[11px]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Products */}
              {results.products.length > 0 && (
                <div className="space-y-2">
                  <div className="font-micro text-[9px] text-amber-warm">
                    {currentLang === 'az' ? 'Məhsullar' : currentLang === 'ru' ? 'Продукты' : 'Products'} ({results.products.length})
                  </div>
                  <div className="space-y-1">
                    {results.products.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect('catalog', p.slug)}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-[var(--ed-line)] hover:bg-white/[0.03] transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=200&q=80'}
                            alt=""
                            className="w-12 h-10 object-cover rounded-lg bg-[var(--ed-raise)]"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=200&q=80';
                            }}
                          />
                          <div>
                            <div className="text-xs font-medium text-[var(--ed-ivory)] group-hover:text-amber-warm transition-colors">{p.name}</div>
                            <div className="font-mono-tech text-[10px] text-mute">{p.code}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-mute group-hover:text-amber-warm group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {results.projects.length > 0 && (
                <div className="space-y-2">
                  <div className="font-micro text-[9px] text-amber-warm">
                    {currentLang === 'az' ? 'Layihələr' : currentLang === 'ru' ? 'Проекты' : 'Projects'} ({results.projects.length})
                  </div>
                  <div className="space-y-1">
                    {results.projects.map(pr => (
                      <button
                        key={pr.id}
                        onClick={() => handleSelect('projects', pr.slug)}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-[var(--ed-line)] hover:bg-white/[0.03] transition-all text-left group"
                      >
                        <div>
                          <div className="text-xs font-medium text-[var(--ed-ivory)] group-hover:text-amber-warm transition-colors">
                            {typeof pr.title === 'string' ? pr.title : getLocalizedText(pr.title, currentLang)}
                          </div>
                          <div className="font-mono-tech text-[10px] text-mute">{pr.location}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-mute group-hover:text-amber-warm group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.products.length === 0 && results.projects.length === 0 && (
                <div className="py-6 text-center text-xs text-mute">
                  {currentLang === 'az'
                    ? 'Nəticə tapılmadı. Zəhmət olmasa başqa axtarış sözü yoxlayın.'
                    : currentLang === 'ru'
                      ? 'Результаты не найдены. Попробуйте другой поисковый запрос.'
                      : 'No results found. Please try another search term.'}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
