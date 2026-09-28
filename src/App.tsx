import React, { useState, useEffect, useCallback } from 'react';
import { Language, Product } from './types';
import { parseUrlToRoute, buildRoutePath } from './utils/router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AmbientLightingBackdrop } from './components/AmbientLightingBackdrop';
import { ContactModal } from './components/ContactModal';
import { SearchModal } from './components/SearchModal';
import { Toast } from './components/Toast';
import { SeoManager } from './components/SeoManager';

// Pages
import { HomePageLiquid as HomePage } from './pages/HomePageLiquid';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { SolutionsPage } from './pages/SolutionsPage';
import { ConfiguratorPage } from './pages/ConfiguratorPage';
import { BlogPage } from './pages/BlogPage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { useData } from './context/DataContext';

export default function App() {
  const { products } = useData();
  // Language State with localStorage recovery
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const saved = localStorage.getItem('ecolife_lang');
    return (saved === 'en' || saved === 'ru') ? saved : 'az';
  });

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
  const seoProduct = activePage === 'catalog' && pageParam
    ? products.find(product => !product.archived && (product.slug === pageParam || product.id === pageParam))
    : undefined;

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
  const [configPdfForInquiry, setConfigPdfForInquiry] = useState<File | null>(null);

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
    setConfigPdfForInquiry(null);
    setIsContactModalOpen(true);
  };

  const handleRequestProductQuote = (product: Product) => {
    setSelectedProductForInquiry(product);
    setConfigSummaryForInquiry(null);
    setConfigPdfForInquiry(null);
    setIsContactModalOpen(true);
  };

  const handleOpenInquiryWithSummary = (summary: string, pdfFile?: File) => {
    setSelectedProductForInquiry(null);
    setConfigSummaryForInquiry(summary);
    setConfigPdfForInquiry(pdfFile || null);
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
        const isProduct = pageParam && products.some(p => !p.archived && (p.slug === pageParam || p.id === pageParam));
        if (isProduct) {
          return (
            <ProductDetailPage
              productSlug={pageParam}
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
    <div className="ecolife-liquid-canvas min-h-screen text-[#F5F5F5] selection:bg-[#FFD21A] selection:text-black font-['Montserrat',sans-serif]">
      <SeoManager page={activePage} param={pageParam} language={currentLang} product={seoProduct} />
      {activePage !== 'admin' && <AmbientLightingBackdrop />}
      {/* Global Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenContact={handleOpenContact}
        onOpenSearch={() => setIsSearchModalOpen(true)}
      />

      {/* Main Routed Page Content */}
      <main className={`relative min-h-screen ${activePage === 'admin' ? '' : 'z-10 liquid-public-pages'}`}>
        {renderPage()}
      </main>

      {/* Global Footer */}
      <Footer
        currentLang={currentLang}
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
        configPdf={configPdfForInquiry}
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
