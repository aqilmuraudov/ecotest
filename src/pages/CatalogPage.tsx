import React, { useState, useMemo } from 'react';
import { Language, ProductCategory, Product } from '../types';
import { translations } from '../data/translations';
import { productCategoriesList } from '../data/products';
import { useData } from '../context/DataContext';
import { getLocalizedText } from '../utils/lang';
import { 
  Search, 
  ArrowRight, 
  ChevronRight, 
  SlidersHorizontal, 
  Layers, 
  Headphones, 
  Truck, 
  Sparkles,
  X,
  Filter
} from 'lucide-react';

interface CatalogPageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  initialCategory?: ProductCategory | string;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  currentLang,
  onNavigate,
  initialCategory = 'all'
}) => {
  const t = translations[currentLang];
  const { products, categories } = useData();

  const dynamicCategories = useMemo(() => {
    const allTab = { id: 'all', nameAz: 'Bütün Məhsullar', nameEn: 'All Products', nameRu: 'Все продукты' };
    if (!categories || categories.length === 0) {
      return productCategoriesList;
    }
    return [allTab, ...categories];
  }, [categories]);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'name' | 'code'>('featured');

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
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
    <div className="min-h-screen bg-[#08090A] text-[#F5F5F5] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* TOP BANNER & BREADCRUMBS (Matching Reference 2) */}
        {/* ========================================================================= */}
        <div className="bg-[#101114] border border-white/10 rounded-2xl p-6 sm:p-10 mb-10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Header Info */}
            <div className="lg:col-span-7 space-y-4">
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-xs text-gray-400 font-medium">
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
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tight">
                {t.catalog.title}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-gray-300 max-w-xl font-normal leading-relaxed">
                {t.catalog.subtitle}
              </p>

              {/* Search Bar matching Reference 2 */}
              <div className="pt-2">
                <div className="relative max-w-lg">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.catalog.searchPlaceholder}
                    className="w-full bg-[#18191E] border border-white/15 rounded-lg pl-4 pr-11 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#FFD21A] transition-colors shadow-inner"
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
            <div className="hidden lg:block lg:col-span-5 h-48 rounded-xl overflow-hidden border border-white/10 relative shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" 
                alt="Ecolife Catalog Inspiration" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FFD21A]">
                  Xətti & Maqnit Sistemlər
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE CATEGORY SELECTOR (From Mobile Reference 3) */}
        {/* ========================================================================= */}
        <div className="lg:hidden mb-6">
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
        </div>

        {/* ========================================================================= */}
        {/* MAIN CATALOG LAYOUT: SIDEBAR + PRODUCT GRID (Matching Reference 2) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Categories Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 bg-[#101114] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
              
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FFD21A]">
                  {t.catalog.categories}
                </h3>
              </div>

              {/* Categories Navigation Items with Yellow Underline on Active */}
              <nav className="space-y-1" aria-label="Category Filters">
                {dynamicCategories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const label = currentLang === 'az' ? cat.nameAz : currentLang === 'ru' ? cat.nameRu : cat.nameEn;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left py-2.5 px-3 rounded text-sm transition-all duration-200 flex items-center justify-between group ${
                        isActive 
                          ? 'text-[#FFD21A] font-bold bg-[#FFD21A]/10 border-l-2 border-[#FFD21A]' 
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{label}</span>
                      </div>
                      {isActive && (
                        <div className="w-4 h-[2px] bg-[#FFD21A] rounded" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Quick Filter Reset */}
              {(selectedCategory !== 'all' || searchQuery) && (
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="w-full text-xs text-center font-semibold text-gray-400 hover:text-[#FFD21A] py-1.5 transition-colors"
                  >
                    {t.catalog.clearFilters}
                  </button>
                </div>
              )}

              {/* Configurator Quick Link */}
              <div className="pt-4 border-t border-white/10">
                <div className="p-3.5 bg-black/40 border border-[#FFD21A]/30 rounded-lg space-y-2">
                  <span className="text-[11px] font-bold text-[#FFD21A] uppercase tracking-wider block">
                    {t.catalog.customSizePromoTitle}
                  </span>
                  <p className="text-[11px] text-gray-400">
                    {t.catalog.customSizePromoDesc}
                  </p>
                  <button
                    onClick={() => onNavigate('configurator')}
                    className="text-xs font-bold text-white hover:text-[#FFD21A] flex items-center gap-1 pt-1"
                  >
                    <span>{t.catalog.configureNow}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          </aside>

          {/* Right Product Grid Column */}
          <main className="lg:col-span-9 space-y-6">
            
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

            {/* Products Grid (Matching Reference 2 Card Style) */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => onNavigate('catalog', product.slug)}
                    className="group bg-[#101114] border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#FFD21A]/50 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col justify-between"
                  >
                    {/* Clean Product Visual Container */}
                    <div className="relative aspect-[4/3] bg-[#16181D] overflow-hidden flex items-center justify-center p-3">
                      <img 
                        src={product.image || (product.gallery && product.gallery[0]) || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80'} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black/80 text-gray-300 px-2 py-0.5 rounded border border-white/10">
                          {product.code}
                        </span>
                      </div>
                    </div>

                    {/* Card Body matching Reference 2 */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-[#FFD21A] transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {getLocalizedText(product.subtitle, currentLang)}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-gray-400">
                          {product.specs.dimensions}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[#FFD21A] group-hover:bg-[#FFD21A] group-hover:text-black transition-all">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#101114] border border-white/10 rounded-xl p-12 text-center space-y-4">
                <Search className="w-10 h-10 text-gray-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">
                  {t.catalog.noProducts}
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Axtarış sözünü dəyişdirin və ya filtrləri sıfırlayın.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="bg-[#FFD21A] text-black font-bold text-xs uppercase px-6 py-2.5 rounded hover:bg-[#F0C413]"
                >
                  {t.catalog.clearFilters}
                </button>
              </div>
            )}

          </main>
        </div>

        {/* ========================================================================= */}
        {/* STAT BANNER UNDER CATALOG (Matching Reference 2 Bottom Banner) */}
        {/* ========================================================================= */}
        <div className="w-full bg-[#101114] border border-white/10 rounded-2xl p-6 lg:p-8 mt-14 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            
            <div className="flex items-center gap-4 pt-4 lg:pt-0 first:pt-0">
              <div className="w-12 h-12 rounded-lg bg-[#FFD21A]/10 border border-[#FFD21A]/30 flex items-center justify-center text-[#FFD21A] flex-shrink-0">
                <Layers className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-white tracking-tight">
                  500+
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {t.catalog.stats.varieties}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 lg:pt-0 lg:pl-8">
              <div className="w-12 h-12 rounded-lg bg-[#FFD21A]/10 border border-[#FFD21A]/30 flex items-center justify-center text-[#FFD21A] flex-shrink-0">
                <Headphones className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white tracking-tight">
                  {t.catalog.stats.support}
                </div>
                <div className="text-xs text-gray-400">
                  Dialux & CAD Dəstəyi
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 lg:pt-0 lg:pl-8">
              <div className="w-12 h-12 rounded-lg bg-[#FFD21A]/10 border border-[#FFD21A]/30 flex items-center justify-center text-[#FFD21A] flex-shrink-0">
                <Truck className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white tracking-tight">
                  {t.catalog.stats.delivery}
                </div>
                <div className="text-xs text-gray-400">
                  Bakı və regionlar
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 lg:pt-0 lg:pl-8">
              <div className="w-12 h-12 rounded-lg bg-[#FFD21A]/10 border border-[#FFD21A]/30 flex items-center justify-center text-[#FFD21A] flex-shrink-0">
                <Sparkles className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white tracking-tight">
                  {t.catalog.stats.custom}
                </div>
                <div className="text-xs text-gray-400">
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
