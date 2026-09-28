import React, { useState, useMemo } from 'react';
import { Language, ProductCategory, Product } from '../types';
import { translations } from '../data/translations';
import { useData } from '../context/DataContext';
import { getLocalizedText } from '../utils/lang';
import { 
  Search, 
  ArrowRight, 
  ChevronRight, 
  SlidersHorizontal, 
  LampCeiling, 
  DraftingCompass, 
  Truck, 
  X,
  Filter
} from 'lucide-react';

interface CatalogPageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  onRequestQuote?: (product: Product) => void;
  initialCategory?: ProductCategory | string;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  currentLang,
  onNavigate,
  onRequestQuote,
  initialCategory = 'all'
}) => {
  const t = translations[currentLang];
  const { products, categories, isLoading } = useData();

  const dynamicCategories = useMemo(() => {
    const allTab = { id: 'all', nameAz: 'Bütün Məhsullar', nameEn: 'All Products', nameRu: 'Все продукты' };
    return [allTab, ...(categories || [])];
  }, [categories]);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'name' | 'code'>('featured');

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Arxivdə olan məhsullar yalnız idarəetmə panelində görünür.
      if (product.archived) return false;
      // Category filter
      const productCats: string[] = Array.isArray(product.categories) && product.categories.length > 0
        ? product.categories
        : [product.category];
      const matchesCategory = selectedCategory === 'all' || productCats.includes(selectedCategory);
      
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        product.name.toLowerCase().includes(q) ||
        product.code.toLowerCase().includes(q) ||
        getLocalizedText(product.categoryName, currentLang).toLowerCase().includes(q) ||
        (Array.isArray(product.categoryNames) ? product.categoryNames : []).some(cn =>
          getLocalizedText(cn as any, currentLang).toLowerCase().includes(q)
        ) ||
        getLocalizedText(product.subtitle, currentLang).toLowerCase().includes(q) ||
        getLocalizedText(product.description, currentLang).toLowerCase().includes(q)
      );

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'code') return a.code.localeCompare(b.code);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, sortBy, currentLang]);

  return (
    <div className="liquid-page min-h-screen text-[#F5F5F5] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* TOP BANNER & BREADCRUMBS */}
        {/* ========================================================================= */}
        <div className="liquid-surface p-6 sm:p-10 mb-10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Header Info */}
            <div className="lg:col-span-7 space-y-4">
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-xs font-mono uppercase text-gray-400">
                <button 
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#FFD21A] transition-colors"
                >
                  {t.nav.home}
                </button>
                <span>/</span>
                <span className="text-[#FFD21A]">{t.catalog.title}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
                {t.catalog.title}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-gray-300 max-w-xl font-normal leading-relaxed">
                {t.catalog.subtitle}
              </p>

              {/* Search Bar */}
              <div className="pt-2">
                <div className="relative max-w-lg">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.catalog.searchPlaceholder}
                    className="liquid-pill w-full pl-4 pr-11 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#FFD21A] transition-colors shadow-inner"
                  />
                  {searchQuery ? (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      aria-label="Clear Search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>
              </div>
            </div>

            {/* Right Architectural Moodshot */}
            <div className="liquid-card hidden lg:block lg:col-span-5 h-48 overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" 
                alt="Ecolife Catalog Inspiration" 
                className="w-full h-full object-cover brightness-75 contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090A] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-4 text-[10px] font-mono uppercase tracking-widest text-[#FFD21A]">
                ARCHITECTURAL SPECIFICATION CATALOGUE
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE CATEGORY SELECTOR */}
        {/* ========================================================================= */}
        {!isLoading && <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {t.catalog.categories}
            </span>
            <span className="text-xs text-gray-400">
              {filteredProducts.length} {t.catalog.productsCount}
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#101114] border border-white/15 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD21A] appearance-none cursor-pointer"
            >
              {dynamicCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {currentLang === 'az' ? cat.nameAz : currentLang === 'ru' ? cat.nameRu : cat.nameEn}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </div>
          </div>
        </div>}

        {!isLoading && (
          <div className="mb-7 hidden flex-wrap items-center gap-2 lg:flex" aria-label="Category Filters">
            {dynamicCategories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const label = currentLang === 'az' ? cat.nameAz : currentLang === 'ru' ? cat.nameRu : cat.nameEn;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`liquid-pill px-4 py-2 text-sm transition-all ${
                    isActive
                      ? 'border-[#FFD21A] bg-[#FFD21A]/15 font-bold text-[#FFD21A] shadow-[0_0_24px_rgba(255,210,26,.14)]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN CATALOG LAYOUT: SIDEBAR + PRODUCT GRID (Matching Reference 2) */}
        {/* ========================================================================= */}
        {isLoading ? (
          <div
            className="min-h-80 bg-[#101114] border border-white/10 flex flex-col items-center justify-center gap-4 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="w-8 h-8 border-2 border-[#FFD21A] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono uppercase tracking-widest text-gray-400">
              Kataloq yüklənir...
            </p>
          </div>
        ) : (
        <div>
          {/* Full-width product grid mirrors the reference catalogue structure. */}
          <main className="space-y-6">
            
            {/* Grid Header Info */}
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span>
                {filteredProducts.length} {t.catalog.productsCount}
              </span>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{t.catalog.sortBy}:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#101114] border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#FFD21A]"
                >
                  <option value="featured">{t.catalog.sortFeatured}</option>
                  <option value="name">{t.catalog.sortName}</option>
                  <option value="code">{t.catalog.sortCode}</option>
                </select>
              </div>
            </div>

            {/* Products Grid (Architectural Specification Card Style) */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => onNavigate('catalog', product.slug)}
                    className="liquid-card group overflow-hidden cursor-pointer hover:border-[#FFD21A] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
                  >
                    {/* Clean Product Visual Container */}
                    <div className="relative aspect-[4/3] bg-[#08090A] overflow-hidden flex items-center justify-center p-3">
                      <img 
                        src={product.image || (product.gallery && product.gallery[0]) || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80'} 
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider bg-black/80 text-gray-300 px-2 py-0.5 border border-white/10">
                          {product.code}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-[#FFD21A] transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                          {getLocalizedText(product.subtitle, currentLang)}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 hairline-t flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-gray-400 truncate">
                          {product.specs.dimensions || product.category}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {onRequestQuote && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRequestQuote(product);
                              }}
                              className="px-2 py-1 bg-[#FFD21A]/10 hover:bg-[#FFD21A] text-[#FFD21A] hover:text-black text-[10px] font-mono font-bold uppercase tracking-wider border border-[#FFD21A]/30 hover:border-[#FFD21A] transition-all cursor-pointer"
                              title="Sorğu Göndər"
                            >
                              Sorğu
                            </button>
                          )}
                          <div className="w-6 h-6 bg-white/5 flex items-center justify-center text-[#FFD21A] group-hover:bg-[#FFD21A] group-hover:text-black transition-all">
                            <ArrowRight className="w-3.5 h-3.5 transform group-hover:-rotate-45 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#101114] border border-white/10 p-12 text-center space-y-4">
                <Search className="w-10 h-10 text-gray-500 mx-auto" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                  {t.catalog.noProducts}
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto font-mono">
                  Axtarış sözünü dəyişdirin və ya filtrləri sıfırlayın.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="bg-[#FFD21A] text-black font-bold text-xs uppercase px-6 py-2.5 hover:bg-[#F0C413] transition-colors"
                >
                  {t.catalog.clearFilters}
                </button>
              </div>
            )}

          </main>
        </div>
        )}

        {/* ========================================================================= */}
        {/* STAT BANNER UNDER CATALOG (Matching Reference 2 Bottom Banner) */}
        {/* ========================================================================= */}
        <div className="liquid-surface w-full p-6 lg:p-8 mt-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            
            <div className="flex items-center gap-4 pt-4 lg:pt-0 first:pt-0">
              <div className="w-12 h-12 bg-[#FFD21A]/10 border border-[#FFD21A]/30 flex items-center justify-center text-[#FFD21A] flex-shrink-0">
                <LampCeiling className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-white tracking-tight tabular-nums">
                  500+
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {t.catalog.stats.varieties}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 lg:pt-0 lg:pl-8">
              <div className="w-12 h-12 bg-[#FFD21A]/10 border border-[#FFD21A]/30 flex items-center justify-center text-[#FFD21A] flex-shrink-0">
                <DraftingCompass className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white tracking-tight">
                  {t.catalog.stats.support}
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  Dialux & CAD Dəstəyi
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 lg:pt-0 lg:pl-8">
              <div className="w-12 h-12 bg-[#FFD21A]/10 border border-[#FFD21A]/30 flex items-center justify-center text-[#FFD21A] flex-shrink-0">
                <Truck className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white tracking-tight">
                  {t.catalog.stats.delivery}
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  Bakı və regionlar
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 lg:pt-0 lg:pl-8">
              <div className="w-12 h-12 bg-[#FFD21A]/10 border border-[#FFD21A]/30 flex items-center justify-center text-[#FFD21A] flex-shrink-0">
                <SlidersHorizontal className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white tracking-tight">
                  {t.catalog.stats.custom}
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  Layihəniz üçün xüsusi
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
