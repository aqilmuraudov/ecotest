import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Language, ProductCategory, Product } from '../types';
import { translations } from '../data/translations';
import { productCategoriesList } from '../data/products';
import { useData } from '../context/DataContext';
import { getLocalizedText } from '../utils/lang';
import { FadeIn } from '../components/ui/FadeIn';
import { EdButton, EdLink, EdSectionHead, EdHairline } from '../components/ed/EditorialUI';
import { EdProductCard } from '../components/ed/EdProductCard';
import { EdCategoryPills } from '../components/ed/EdCategoryPills';
import { Search, X, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface CatalogPageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  onRequestQuote?: (product: Product) => void;
  initialCategory?: ProductCategory | string;
}

const ITEMS_PER_PAGE = 9;

export const CatalogPage: React.FC<CatalogPageProps> = ({
  currentLang,
  onNavigate,
  onRequestQuote,
  initialCategory = 'all'
}) => {
  const t = translations[currentLang];
  const { products, categories } = useData();
  const gridTopRef = useRef<HTMLDivElement>(null);

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
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setSelectedCategory(initialCategory || 'all');
    setCurrentPage(1);
  }, [initialCategory]);

  // Reset to page 1 whenever filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  // Filtered and sorted products (logic preserved from the original implementation)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productCats: string[] = Array.isArray(product.categories) && product.categories.length > 0
        ? product.categories
        : [product.category];
      const matchesCategory = selectedCategory === 'all' || productCats.includes(selectedCategory);

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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredProducts, safePage]);

  const handlePageChange = (page: number) => {
    const next = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(next);
    if (gridTopRef.current) {
      const top = gridTopRef.current.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[var(--ed-bg)] text-[var(--ed-ivory)] pt-32 pb-24">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

        {/* Header — open editorial, no card container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-12">
          <div className="lg:col-span-7">
            <FadeIn>
              <p className="font-micro text-amber-warm mb-5">01 — {t.catalog.title}</p>
              <h1 className="ed-display-lg font-display text-ivory">
                {currentLang === 'az' ? 'işıq' : currentLang === 'ru' ? 'свет' : 'light'}
                <br />
                <span className="text-soft">{currentLang === 'az' ? 'kataloqu' : currentLang === 'ru' ? 'каталог' : 'catalog'}</span>
              </h1>
              <p className="text-sm text-mute mt-6 max-w-lg leading-relaxed">
                {t.catalog.subtitle}
              </p>
            </FadeIn>
          </div>

          {/* Search */}
          <div className="lg:col-span-5">
            <FadeIn delay={0.1}>
              <div className="relative max-w-md lg:ml-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.catalog.searchPlaceholder}
                  className="ed-input !rounded-full !pl-5 !pr-11"
                  aria-label={t.catalog.searchPlaceholder}
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-mute hover:text-ivory transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <Search className="w-4 h-4 text-mute absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </div>
            </FadeIn>
          </div>
        </div>

        <div ref={gridTopRef} />
        <EdHairline className="mb-10" />

        {/* Category pills — horizontal scroll on mobile */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <EdCategoryPills
            items={dynamicCategories.map(cat => ({
              id: cat.id,
              label: currentLang === 'az' ? cat.nameAz : currentLang === 'ru' ? cat.nameRu : cat.nameEn
            }))}
            activeId={selectedCategory}
            onSelect={setSelectedCategory}
            className="flex-1 !justify-start"
          />
        </div>

        {/* Result meta + sort */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <span className="font-micro text-[10px] text-mute">
              {filteredProducts.length} {t.catalog.productsCount}
            </span>
            {totalPages > 1 && (
              <span className="font-mono-tech text-[11px] text-amber-warm">
                {currentLang === 'az' ? `SƏHİFƏ ${safePage} / ${totalPages}` : currentLang === 'ru' ? `СТР. ${safePage} / ${totalPages}` : `PAGE ${safePage} / ${totalPages}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-micro text-[10px] text-mute">{t.catalog.sortBy}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border border-[var(--ed-line)] rounded-full px-4 py-1.5 text-xs text-[var(--ed-ivory)] focus:outline-none focus:border-[var(--ed-amber)]"
            >
              <option value="featured">{t.catalog.sortFeatured}</option>
              <option value="name">{t.catalog.sortName}</option>
              <option value="code">{t.catalog.sortCode}</option>
            </select>
          </div>
        </div>

        {/* Editorial product grid (3x3 = 9 products per page) */}
        {paginatedProducts.length > 0 ? (
          <>
            <div key={`page-${safePage}-${selectedCategory}-${sortBy}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {paginatedProducts.map((product, i) => (
                <FadeIn key={product.id} delay={Math.min(0.04 * i, 0.3)}>
                  <div className="relative">
                    <EdProductCard
                      product={product}
                      currentLang={currentLang}
                      onNavigate={onNavigate}
                      exploreLabel={currentLang === 'az' ? 'Ətraflı' : currentLang === 'ru' ? 'Подробнее' : 'Explore'}
                    />
                    {onRequestQuote && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestQuote(product);
                        }}
                        className="absolute top-4 right-4 z-10 font-micro text-[9px] text-[#1d1d1b] bg-[var(--ed-amber)] hover:bg-[var(--ed-amber-2)] px-3 py-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        title={t.productDetail.requestQuote}
                      >
                        {t.productDetail.requestQuote}
                      </button>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Pagination bar — compact with smart ellipsis */}
            {totalPages > 1 && (() => {
              const getVisiblePages = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
                if (totalPages <= 5) {
                  return Array.from({ length: totalPages }, (_, i) => i + 1);
                }
                if (safePage <= 3) {
                  return [1, 2, 3, 'ellipsis-end', totalPages];
                }
                if (safePage >= totalPages - 2) {
                  return [1, 'ellipsis-start', totalPages - 2, totalPages - 1, totalPages];
                }
                return [1, 'ellipsis-start', safePage - 1, safePage, safePage + 1, 'ellipsis-end', totalPages];
              };

              const visiblePages = getVisiblePages();

              return (
                <div className="mt-14 pt-6 border-t border-[var(--ed-line)] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="font-mono-tech text-[10px] text-mute whitespace-nowrap">
                    {currentLang === 'az'
                      ? `${(safePage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length)} / ${filteredProducts.length} MƏHSUL`
                      : currentLang === 'ru'
                      ? `${(safePage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length)} ИЗ ${filteredProducts.length}`
                      : `${(safePage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length)} OF ${filteredProducts.length}`}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePageChange(safePage - 1)}
                      disabled={safePage === 1}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[var(--ed-line)] flex items-center justify-center text-[var(--ed-ivory)] hover:border-[var(--ed-amber)] hover:text-amber-warm disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    {visiblePages.map((item) => {
                      if (item === 'ellipsis-start' || item === 'ellipsis-end') {
                        return (
                          <span
                            key={item}
                            className="w-6 text-center font-mono-tech text-[11px] text-mute select-none"
                          >
                            …
                          </span>
                        );
                      }
                      const isCurrent = item === safePage;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handlePageChange(item)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-mono-tech text-[11px] transition-all ${
                            isCurrent
                              ? 'bg-[var(--ed-amber)] text-[#1d1d1b] font-semibold shadow-[0_0_14px_rgba(245,166,35,0.28)]'
                              : 'border border-[var(--ed-line)] text-[var(--ed-soft)] hover:border-[var(--ed-amber)] hover:text-ivory'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => handlePageChange(safePage + 1)}
                      disabled={safePage === totalPages}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[var(--ed-line)] flex items-center justify-center text-[var(--ed-ivory)] hover:border-[var(--ed-amber)] hover:text-amber-warm disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          <div className="py-24 text-center space-y-6 border-t border-[var(--ed-line)]">
            <Search className="w-8 h-8 text-mute mx-auto" />
            <h3 className="ed-display-sm font-display text-ivory">
              {t.catalog.noProducts}
            </h3>
            <EdButton
              variant="ghost"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
            >
              {t.catalog.clearFilters}
            </EdButton>
          </div>
        )}

        {/* Configurator cross-link */}
        <div className="mt-28">
          <EdHairline amber className="mb-14" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <FadeIn>
              <h2 className="ed-display-md font-display text-ivory">
                {t.catalog.customSizePromoTitle}
              </h2>
              <p className="text-sm text-mute mt-5 max-w-md leading-relaxed">
                {t.catalog.customSizePromoDesc}
              </p>
              <div className="mt-8">
                <EdButton arrow onClick={() => onNavigate('configurator')}>
                  {t.catalog.configureNow}
                </EdButton>
              </div>
            </FadeIn>
            <FadeIn delay={0.1} className="lg:text-right">
              <EdLink arrow onClick={() => onNavigate('solutions')}>
                {t.solutions.exploreAll}
              </EdLink>
            </FadeIn>
          </div>
        </div>

      </div>
    </div>
  );
};
