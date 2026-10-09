import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Language, Theme, Product } from './types';
import { parseUrlToRoute, buildRoutePath } from './utils/router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ContactModal } from './components/ContactModal';
import { SearchModal } from './components/SearchModal';
import { Toast } from './components/Toast';

// Pages
import { HomePage } from './pages/HomePage';
const CatalogPage = lazy(() => import('./pages/CatalogPage').then(module => ({ default: module.CatalogPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(module => ({ default: module.ProductDetailPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then(module => ({ default: module.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage').then(module => ({ default: module.ProjectDetailPage })));
const SolutionsPage = lazy(() => import('./pages/SolutionsPage').then(module => ({ default: module.SolutionsPage })));
const ConfiguratorPage = lazy(() => import('./pages/ConfiguratorPage').then(module => ({ default: module.ConfiguratorPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(module => ({ default: module.BlogPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(module => ({ default: module.AdminPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
import { useData } from './context/DataContext';
import { productCategoriesList } from './data/products';

export default function App() {
  const { products, categories } = useData();
  // Theme State with localStorage recovery (Default is 'dark')
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('ecolife_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Language State with localStorage recovery
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const saved = localStorage.getItem('ecolife_lang');
    return (saved === 'en' || saved === 'ru') ? saved : 'az';
  });

  // Sync theme with HTML document
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('ecolife_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Navigation State initialized from actual browser URL
  const [activePage, setActivePage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return parseUrlToRoute(window.location.pathname).page;
    }
    return 'home';
  });

  const [pageParam, setPageParam] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      return parseUrlToRoute(window.location.pathname).param;
    }
    return undefined;
  });

  // Listen to Browser Back / Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const route = parseUrlToRoute(window.location.pathname);
      setActivePage(route.page);
      setPageParam(route.param);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Modals & Feedback
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState<Product | null>(null);
  const [configSummaryForInquiry, setConfigSummaryForInquiry] = useState<string | null>(null);

  // Download Toast State
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);

  // Sync language with HTML document to fix casing / uppercase rules
  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.setAttribute('lang', currentLang);
    localStorage.setItem('ecolife_lang', currentLang);
  }, [currentLang]);

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
  };

  const handleNavigate = useCallback((page: string, param?: string, replace: boolean = false) => {
    setActivePage(page);
    setPageParam(param);

    // Update browser URL seamlessly via HTML5 History API
    if (typeof window !== 'undefined') {
      const targetPath = buildRoutePath(page, param);
      if (window.location.pathname !== targetPath) {
        if (replace) {
          window.history.replaceState({ page, param }, '', targetPath);
        } else {
          window.history.pushState({ page, param }, '', targetPath);
        }
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenContact = () => {
    setSelectedProductForInquiry(null);
    setConfigSummaryForInquiry(null);
    setIsContactModalOpen(true);
  };

  const handleRequestProductQuote = (product: Product) => {
    setSelectedProductForInquiry(product);
    setConfigSummaryForInquiry(null);
    setIsContactModalOpen(true);
  };

  const handleOpenInquiryWithSummary = (summary: string) => {
    setSelectedProductForInquiry(null);
    setConfigSummaryForInquiry(summary);
    setIsContactModalOpen(true);
  };

  const handleDownloadFile = (fileName: string) => {
    setToastMessage(`"${fileName}" faylı uğurla yüklənir...`);
    setIsToastVisible(true);
  };

  // Render Current Page
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return (
          <HomePage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onOpenContact={handleOpenContact}
          />
        );

      case 'catalog': {
        const isKnownCategory = Boolean(
          pageParam && (
            pageParam === 'all' ||
            categories.some(c => c.id === pageParam) ||
            productCategoriesList.some(c => c.id === pageParam)
          )
        );
        const isProduct = Boolean(
          pageParam && (
            products.some(p => p.slug === pageParam || p.id === pageParam) ||
            !isKnownCategory
          )
        );
        if (isProduct) {
          return (
            <ProductDetailPage
              productSlug={pageParam!}
              currentLang={currentLang}
              onNavigate={handleNavigate}
              onRequestQuote={handleRequestProductQuote}
              onDownloadFile={handleDownloadFile}
            />
          );
        }
        return (
          <CatalogPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onRequestQuote={handleRequestProductQuote}
            initialCategory={pageParam || 'all'}
          />
        );
      }

      case 'projects':
        if (pageParam) {
          return (
            <ProjectDetailPage
              projectSlug={pageParam}
              currentLang={currentLang}
              onNavigate={handleNavigate}
              onOpenContact={handleOpenContact}
            />
          );
        }
        return (
          <ProjectsPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
          />
        );

      case 'solutions':
        return (
          <SolutionsPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onOpenContact={handleOpenContact}
            initialSlug={pageParam}
          />
        );

      case 'configurator':
        return (
          <ConfiguratorPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onOpenInquiryWithSummary={handleOpenInquiryWithSummary}
            onDownloadFile={handleDownloadFile}
          />
        );

      case 'blog':
        return (
          <BlogPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            initialSlug={pageParam}
          />
        );

      case 'admin':
        return (
          <AdminPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onLanguageChange={handleLanguageChange}
          />
        );

      case 'about':
        return (
          <AboutPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onOpenContact={handleOpenContact}
          />
        );

      case 'contact':
        return (
          <ContactPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
          />
        );

      default:
        return (
          <HomePage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onOpenContact={handleOpenContact}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ed-bg)] text-[var(--ed-ivory)] selection:bg-[var(--ed-amber)] selection:text-[#1d1d1b]">
      {/* Global Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        currentTheme={theme}
        onToggleTheme={handleToggleTheme}
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenContact={handleOpenContact}
        onOpenSearch={() => setIsSearchModalOpen(true)}
      />

      {/* Main Routed Page Content */}
      <main className="min-h-screen">
        <Suspense fallback={<div className="min-h-screen bg-[var(--ed-bg)]" aria-label="Səhifə yüklənir" />}>
          {renderPage()}
        </Suspense>
      </main>

      {/* Global Footer */}
      <Footer
        currentLang={currentLang}
        currentTheme={theme}
        onNavigate={handleNavigate}
        onOpenContact={handleOpenContact}
      />

      {/* Interactive Contact & Quotation Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => {
          setIsContactModalOpen(false);
          setSelectedProductForInquiry(null);
          setConfigSummaryForInquiry(null);
        }}
        currentLang={currentLang}
        prefilledProduct={selectedProductForInquiry}
        configSummary={configSummaryForInquiry}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        currentLang={currentLang}
        onNavigate={handleNavigate}
      />

      {/* File Download & Confirmation Toast */}
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
        type="download"
      />
    </div>
  );
}
