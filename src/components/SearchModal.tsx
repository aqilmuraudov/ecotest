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
        className="w-full max-w-2xl bg-[#101114] border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-[#F5F5F5]"
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
            className="w-full bg-transparent text-base text-white placeholder-gray-400 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-gray-400 space-y-2">
              <div>
                {currentLang === 'az' 
                  ? 'Məhsul adı (məs. Linear 40), kod və ya layihə adı daxil edin.'
                  : currentLang === 'ru' 
                    ? 'Введите название продукта (напр. Linear 40), артикул или название проекта.'
                    : 'Enter a product name (e.g. Linear 40), code, or project title.'}
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <button onClick={() => setQuery('Linear')} className="px-2.5 py-1 bg-white/5 rounded hover:text-[#FFD21A]">Linear</button>
                <button onClick={() => setQuery('Rail')} className="px-2.5 py-1 bg-white/5 rounded hover:text-[#FFD21A]">Ultra Rail</button>
                <button onClick={() => setQuery('Ofis')} className="px-2.5 py-1 bg-white/5 rounded hover:text-[#FFD21A]">Ofis</button>
              </div>
            </div>
          ) : (
            <>
              {/* Products Results */}
              {results.products.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#FFD21A]">
                    {currentLang === 'az' ? 'Məhsullar' : currentLang === 'ru' ? 'Продукты' : 'Products'} ({results.products.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.products.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect('catalog', p.slug)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=200&q=80'} 
                            alt="" 
                            className="w-10 h-8 object-cover rounded bg-[#16181D]"
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
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#FFD21A]">
                    {currentLang === 'az' ? 'Layihələr' : currentLang === 'ru' ? 'Проекты' : 'Projects'} ({results.projects.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.projects.map(pr => (
                      <button
                        key={pr.id}
                        onClick={() => handleSelect('projects', pr.slug)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors text-left group"
                      >
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-[#FFD21A]">
                            {typeof pr.title === 'string' ? pr.title : getLocalizedText(pr.title, currentLang)}
                          </div>
                          <div className="text-[10px] text-gray-400">{pr.location}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#FFD21A]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.products.length === 0 && results.projects.length === 0 && (
                <div className="py-6 text-center text-xs text-gray-400">
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
