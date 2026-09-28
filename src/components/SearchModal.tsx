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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        id="ecolife-global-search-modal"
        className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/20 bg-[linear-gradient(145deg,rgba(255,255,255,.14),rgba(72,43,28,.52))] text-[#F5F5F5] shadow-2xl backdrop-blur-2xl"
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-white/10 p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#FFD21A] flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.catalog.searchPlaceholder}
            className="w-full bg-transparent text-base text-white placeholder-gray-400 focus:outline-none font-mono"
          />
          <button 
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/[.06] p-2 text-gray-400 transition-all hover:bg-white/15 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-gray-400 space-y-2 font-mono">
              <div>
                {currentLang === 'az' 
                  ? 'Məhsul adı (məs. Linear 40), kod və ya layihə adı daxil edin.'
                  : currentLang === 'ru' 
                    ? 'Введите название продукта (напр. Linear 40), артикул или название проекта.'
                    : 'Enter a product name (e.g. Linear 40), code, or project title.'}
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <button onClick={() => setQuery('Linear')} className="rounded-full border border-white/15 bg-white/[.07] px-3 py-1.5 transition-all hover:border-[#FFD21A] hover:bg-white/15 hover:text-[#FFD21A]">Linear</button>
                <button onClick={() => setQuery('Rail')} className="rounded-full border border-white/15 bg-white/[.07] px-3 py-1.5 transition-all hover:border-[#FFD21A] hover:bg-white/15 hover:text-[#FFD21A]">Ultra Rail</button>
                <button onClick={() => setQuery('Ofis')} className="rounded-full border border-white/15 bg-white/[.07] px-3 py-1.5 transition-all hover:border-[#FFD21A] hover:bg-white/15 hover:text-[#FFD21A]">Ofis</button>
              </div>
            </div>
          ) : (
            <>
              {/* Products Results */}
              {results.products.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFD21A]">
                    {currentLang === 'az' ? 'Məhsullar' : currentLang === 'ru' ? 'Продукты' : 'Products'} ({results.products.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.products.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect('catalog', p.slug)}
                        className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-2.5 text-left transition-all hover:border-[#FFD21A]/60 hover:bg-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=200&q=80'} 
                            alt="" 
                            className="w-10 h-8 object-cover bg-[#16181D]"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=200&q=80';
                            }}
                          />
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-[#FFD21A]">{p.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{p.code}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#FFD21A]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Results */}
              {results.projects.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFD21A]">
                    {currentLang === 'az' ? 'Layihələr' : currentLang === 'ru' ? 'Проекты' : 'Projects'} ({results.projects.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.projects.map(pr => (
                      <button
                        key={pr.id}
                        onClick={() => handleSelect('projects', pr.slug)}
                        className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-2.5 text-left transition-all hover:border-[#FFD21A]/60 hover:bg-white/10"
                      >
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-[#FFD21A]">
                            {typeof pr.title === 'string' ? pr.title : getLocalizedText(pr.title, currentLang)}
                          </div>
                          <div className="text-[10px] font-mono text-gray-400">{pr.location}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#FFD21A]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.products.length === 0 && results.projects.length === 0 && (
                <div className="py-6 text-center text-xs text-gray-400 font-mono">
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
