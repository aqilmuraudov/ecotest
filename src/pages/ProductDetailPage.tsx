import React, { useState, useEffect } from 'react';
import { Language, Product, ProductFile } from '../types';
import { translations } from '../data/translations';
import { useData } from '../context/DataContext';
import { getLocalizedText } from '../utils/lang';
import { cctLabel, getCctOptions, getFinishOptions, shouldShowWarrantyBadge, dedupeProductGallery } from '../utils/productOptions';
import { downloadFileFromUrl, getDownloadableFiles } from '../utils/productFiles';
import { FadeIn } from '../components/ui/FadeIn';
import { EdButton, EdLink, EdHairline } from '../components/ed/EditorialUI';
import { EdGlowFigure } from '../components/ed/EdGlowFigure';
import { EdProductCard } from '../components/ed/EdProductCard';
import {
  ArrowLeft,
  Download,
  FileText,
  Box,
  Layers,
  Share2,
  ShieldCheck,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

function ProductFileTypeIcon({ type }: { type: ProductFile['type'] }) {
  if (type === 'IES' || type === 'LDT') return <Box className="w-4 h-4 text-amber-warm" />;
  if (type === 'CAD') return <Layers className="w-4 h-4 text-amber-warm" />;
  return <FileText className="w-4 h-4 text-amber-warm" />;
}

interface ProductDetailPageProps {
  productSlug: string;
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  onRequestQuote: (product: Product) => void;
  onDownloadFile: (fileName: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productSlug,
  currentLang,
  onNavigate,
  onRequestQuote,
  onDownloadFile
}) => {
  const t = translations[currentLang];
  const { products } = useData();

  const product = products.find((p) => p.slug === productSlug || p.id === productSlug) || products[0] || {
    id: 'not-found',
    slug: 'not-found',
    name: 'Məhsul',
    code: 'ECO-000',
    image: '',
    gallery: [],
    category: 'linear-profiles',
    categoryName: { az: 'Xətti Profillər', en: 'Linear Profiles', ru: 'Линейные профили' },
    subtitle: { az: '', en: '', ru: '' },
    description: { az: '', en: '', ru: '' },
    specs: { material: 'Alüminium', dimensions: '', ipRating: 'IP20', mounting: 'Surface' },
    files: []
  };
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const cctOptions = getCctOptions(product);
  const finishOptions = getFinishOptions(product);
  const showWarranty = shouldShowWarrantyBadge(product);

  const [selectedCCT, setSelectedCCT] = useState(cctOptions[0] || '');
  const [selectedFinish, setSelectedFinish] = useState(finishOptions[0] || '');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setSelectedCCT(getCctOptions(product)[0] || '');
    setSelectedFinish(getFinishOptions(product)[0] || '');
    setActiveImageIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  const galleryList = dedupeProductGallery(product.image, product.gallery);

  const currentImage = galleryList[activeImageIndex] || galleryList[0] || product.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80';

  const relatedProducts = products
    .filter((p) => {
      if (p.id === product.id) return false;
      const pCats: string[] = Array.isArray(p.categories) && p.categories.length > 0
        ? p.categories
        : [p.category];
      return pCats.includes(product.category) || p.featured;
    })
    .slice(0, 3);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const downloadableFiles = getDownloadableFiles(product.files);

  const handleRealDownload = async (file: ProductFile) => {
    if (!file.url) return;
    onDownloadFile(file.name);
    await downloadFileFromUrl(file.url, file.name);
  };

  return (
    <div className="bg-[var(--ed-bg)] text-[var(--ed-ivory)] pt-32 pb-24">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2 font-micro text-[9px] text-mute">
            <button onClick={() => onNavigate('home')} className="hover:text-amber-warm transition-colors">{t.nav.home}</button>
            <span>/</span>
            <button onClick={() => onNavigate('catalog')} className="hover:text-amber-warm transition-colors">{t.nav.catalog}</button>
            <span>/</span>
            <span className="text-[var(--ed-ivory)]">{product.name}</span>
          </div>

          <button
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-1.5 font-micro text-[9px] text-mute hover:text-ivory transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.catalog.backToCatalog}</span>
          </button>
        </div>

        {/* Hero: image left on cream plate, editorial summary right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Gallery column */}
          <div className="lg:col-span-7 space-y-4">
            <FadeIn>
              <div
                onClick={() => setLightboxOpen(true)}
                className="group relative ed-plate aspect-[4/3] overflow-hidden cursor-zoom-in flex items-center justify-center p-6 sm:p-10"
              >
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full max-w-[85%] max-h-[85%] object-contain transition-transform duration-[900ms] group-hover:scale-[1.04]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80';
                  }}
                />
                {/* Warm floor glow activation */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 ed-glow-floor opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </div>
            </FadeIn>

            {/* Thumbnail strip */}
            {galleryList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {galleryList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 overflow-hidden flex-shrink-0 ed-plate p-1.5 transition-all ${
                      activeImageIndex === idx
                        ? 'ring-2 ring-[var(--ed-amber)]'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Editorial summary column */}
          <div className="lg:col-span-5 space-y-8">
            <FadeIn delay={0.1}>
              <div>
                <p className="font-micro text-amber-warm mb-4">
                  {getLocalizedText(product.categoryName, currentLang)}
                </p>
                <h1 className="ed-display-md font-display text-ivory">
                  {product.name}
                </h1>
                <p className="text-sm text-soft mt-5 leading-relaxed">
                  {getLocalizedText(product.subtitle, currentLang)}
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.18}>
              <EdHairline />
              <p className="text-xs text-mute leading-relaxed pt-5">
                {getLocalizedText(product.description, currentLang)}
              </p>
            </FadeIn>

            {/* CCT options (only when real data exists — logic preserved) */}
            {cctOptions.length > 0 && (
              <FadeIn delay={0.22}>
                <div className="space-y-2.5">
                  <label className="font-micro text-[9px] text-mute block">
                    {t.productDetail.cct}: <span className="text-amber-warm">{selectedCCT ? cctLabel(selectedCCT) : ''}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {cctOptions.map((cct) => (
                      <button
                        key={cct}
                        onClick={() => setSelectedCCT(cct)}
                        className={`ed-pill !py-1.5 !px-4 !text-xs ${selectedCCT === cct ? 'ed-pill--active' : ''}`}
                      >
                        {cctLabel(cct)}
                      </button>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Finish options (only when real data exists — logic preserved) */}
            {finishOptions.length > 0 && (
              <FadeIn delay={0.26}>
                <div className="space-y-2.5">
                  <label className="font-micro text-[9px] text-mute block">
                    {t.productDetail.color}: <span className="text-amber-warm">{selectedFinish}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {finishOptions.map((finish) => (
                      <button
                        key={finish}
                        onClick={() => setSelectedFinish(finish)}
                        className={`ed-pill !py-1.5 !px-4 !text-xs ${selectedFinish === finish ? 'ed-pill--active' : ''}`}
                      >
                        {finish}
                      </button>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Actions */}
            <FadeIn delay={0.34}>
              <div className="space-y-4 pt-4">
                <EdButton
                  onClick={() => onRequestQuote(product)}
                  className="w-full justify-center"
                >
                  {t.productDetail.requestQuote}
                </EdButton>

                <div className="grid grid-cols-2 gap-3">
                  <EdButton variant="ghost" onClick={() => onNavigate('configurator')} className="justify-center !text-xs">
                    {t.nav.configurator}
                  </EdButton>
                  <EdButton variant="ghost" onClick={handleShare} className="justify-center !text-xs">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedLink ? t.productDetail.linkCopied : t.productDetail.share}</span>
                  </EdButton>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Specifications + downloads */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-24">

          <div className="lg:col-span-7">
            <FadeIn>
              <p className="font-micro text-amber-warm mb-8">{t.productDetail.specsTitle}</p>
              <div className="border-t border-[var(--ed-line)]">
                <div className="py-4 flex justify-between items-center border-b border-[var(--ed-line)]">
                  <span className="font-micro text-[9px] text-mute">Code</span>
                  <span className="font-mono-tech text-sm text-[var(--ed-ivory)]">{product.code}</span>
                </div>
                {product.specs?.cct && (
                  <div className="py-4 flex justify-between items-center border-b border-[var(--ed-line)]">
                    <span className="font-micro text-[9px] text-mute">{t.productDetail.cct}</span>
                    <span className="text-sm text-[var(--ed-ivory)]">{product.specs.cct}</span>
                  </div>
                )}
                {product.specs?.finish && (
                  <div className="py-4 flex justify-between items-center border-b border-[var(--ed-line)]">
                    <span className="font-micro text-[9px] text-mute">{t.productDetail.color}</span>
                    <span className="text-sm text-[var(--ed-ivory)]">{product.specs.finish}</span>
                  </div>
                )}
                {product.specs?.mounting && (
                  <div className="py-4 flex justify-between items-center border-b border-[var(--ed-line)]">
                    <span className="font-micro text-[9px] text-mute">{t.productDetail.mounting}</span>
                    <span className="text-sm text-[var(--ed-ivory)]">{product.specs.mounting}</span>
                  </div>
                )}
                {product.specs?.material && (
                  <div className="py-4 flex justify-between items-center border-b border-[var(--ed-line)]">
                    <span className="font-micro text-[9px] text-mute">{t.productDetail.material}</span>
                    <span className="text-sm text-[var(--ed-ivory)]">{product.specs.material}</span>
                  </div>
                )}
                {product.specs?.dimensions && (
                  <div className="py-4 flex justify-between items-center border-b border-[var(--ed-line)]">
                    <span className="font-micro text-[9px] text-mute">{t.productDetail.dimensions}</span>
                    <span className="text-sm text-[var(--ed-ivory)]">{product.specs.dimensions}</span>
                  </div>
                )}
                {!product.specs?.cct && !product.specs?.finish && !product.specs?.dimensions && (
                  <div className="py-6 text-mute text-xs italic">
                    {currentLang === 'az' ? 'Əlavə texniki parametr daxil edilməyib.' : currentLang === 'ru' ? 'Дополнительные параметры не указаны.' : 'No additional technical parameters specified.'}
                  </div>
                )}
              </div>
            </FadeIn>
          </div>

          {/* Downloads + custom service */}
          <div className="lg:col-span-5 space-y-10">
            {downloadableFiles.length > 0 && (
              <FadeIn delay={0.08}>
                <div>
                  <p className="font-micro text-amber-warm mb-6">{t.productDetail.downloadsTitle}</p>
                  <div className="space-y-2">
                    {downloadableFiles.map((file, index) => (
                      <button
                        key={`${file.name}-${index}`}
                        onClick={() => handleRealDownload(file)}
                        className="w-full flex items-center justify-between p-3.5 border border-[var(--ed-line)] hover:border-[var(--ed-line-amber)] transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ProductFileTypeIcon type={file.type} />
                          <div className="text-left min-w-0">
                            <div className="text-xs font-medium text-[var(--ed-ivory)] truncate max-w-[220px]">{file.name}</div>
                            <div className="font-mono-tech text-[10px] text-mute">{file.type} • {file.size || '—'}</div>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-mute group-hover:text-amber-warm transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Custom fabrication */}
            <FadeIn delay={0.14}>
              <div>
                <EdHairline amber />
                <p className="font-micro text-amber-warm mt-6 mb-3">{t.productDetail.customServiceTitle}</p>
                <p className="text-xs text-mute leading-relaxed">
                  {t.productDetail.customServiceDesc}
                </p>
                <div className="mt-5">
                  <EdLink arrow onClick={() => onRequestQuote(product)}>
                    {t.productDetail.consultEngineer}
                  </EdLink>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-28">
            <FadeIn>
              <div className="flex items-end justify-between mb-12">
                <h2 className="ed-display-md font-display text-ivory">
                  {currentLang === 'az' ? 'oxşar' : currentLang === 'ru' ? 'похожие' : 'related'}
                  <br />
                  <span className="text-soft">{currentLang === 'az' ? 'sistemlər' : currentLang === 'ru' ? 'системы' : 'systems'}</span>
                </h2>
                <EdLink arrow onClick={() => onNavigate('catalog')}>
                  {t.productDetail.viewAll}
                </EdLink>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {relatedProducts.map((rel, i) => (
                <FadeIn key={rel.id} delay={0.06 * i}>
                  <EdProductCard
                    product={rel}
                    currentLang={currentLang}
                    onNavigate={onNavigate}
                    exploreLabel={currentLang === 'az' ? 'Ətraflı' : currentLang === 'ru' ? 'Подробнее' : 'Explore'}
                  />
                </FadeIn>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox — preserved */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-[#141412]/98 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-[var(--ed-line)] pb-4 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <span className="font-mono-tech text-xs text-amber-warm">{product.code}</span>
              <h4 className="text-sm font-medium text-[var(--ed-ivory)]">{product.name}</h4>
              <span className="font-mono-tech text-xs text-mute">
                ({activeImageIndex + 1} / {galleryList.length})
              </span>
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 text-[var(--ed-soft)] hover:text-amber-warm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Canvas with navigation */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            {galleryList.length > 1 && (
              <button
                onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryList.length - 1))}
                className="absolute left-2 sm:left-6 z-10 p-3 border border-[var(--ed-line)] hover:border-[var(--ed-amber)] text-[var(--ed-ivory)] transition-colors rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <img
              src={currentImage}
              alt={product.name}
              className="max-h-[75vh] max-w-[90vw] object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80';
              }}
            />

            {galleryList.length > 1 && (
              <button
                onClick={() => setActiveImageIndex((prev) => (prev < galleryList.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 sm:right-6 z-10 p-3 border border-[var(--ed-line)] hover:border-[var(--ed-amber)] text-[var(--ed-ivory)] transition-colors rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Bottom thumbnails */}
          {galleryList.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 max-w-4xl mx-auto">
              {galleryList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-12 overflow-hidden transition-all ${
                    activeImageIndex === idx
                      ? 'ring-1 ring-[var(--ed-amber)]'
                      : 'opacity-40 hover:opacity-90'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
