import React, { useState, useEffect } from 'react';
import { Language, Product, ProductFile } from '../types';
import { translations } from '../data/translations';
import { useData } from '../context/DataContext';
import { getLocalizedText } from '../utils/lang';
import { cctLabel, getCctOptions, getFinishOptions, shouldShowWarrantyBadge } from '../utils/productOptions';
import { downloadFileFromUrl, getDownloadableFiles } from '../utils/productFiles';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Box, 
  Sliders, 
  MessageSquare, 
  Check, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Eye, 
  Layers, 
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

function ProductFileTypeIcon({ type }: { type: ProductFile['type'] }) {
  if (type === 'IES' || type === 'LDT') return <Box className="w-4 h-4 text-[#FFD21A]" />;
  if (type === 'CAD') return <Layers className="w-4 h-4 text-[#FFD21A]" />;
  return <FileText className="w-4 h-4 text-[#FFD21A]" />;
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

  // Yalnız REAL məlumatı olan seçimlər göstərilir (hardcoded defolt yoxdur)
  const cctOptions = getCctOptions(product);
  const finishOptions = getFinishOptions(product);
  const showWarranty = shouldShowWarrantyBadge(product);

  const [selectedCCT, setSelectedCCT] = useState(cctOptions[0] || '');
  const [selectedFinish, setSelectedFinish] = useState(finishOptions[0] || '');
  const [copiedLink, setCopiedLink] = useState(false);

  // Məhsul dəyişəndə seçimləri və qalereya indeksini sıfırla
  useEffect(() => {
    setSelectedCCT(getCctOptions(product)[0] || '');
    setSelectedFinish(getFinishOptions(product)[0] || '');
    setActiveImageIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  // Unified Gallery list starting with main image
  const galleryList = Array.from(
    new Set([
      product.image,
      ...(Array.isArray(product.gallery) ? product.gallery : [])
    ].filter(Boolean))
  );
  
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

  // REAL fayllar — yalnız Supabase Storage URL-i olanlar göstərilir (fake fayl yoxdur)
  const downloadableFiles = getDownloadableFiles(product.files);

  const handleRealDownload = async (file: ProductFile) => {
    if (!file.url) return;
    onDownloadFile(file.name);
    await downloadFileFromUrl(file.url, file.name);
  };

  return (
    <div className="min-h-screen bg-[#08090A] text-[#F5F5F5] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Back Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <button 
              onClick={() => onNavigate('home')} 
              className="hover:text-[#FFD21A] transition-colors"
            >
              {t.nav.home}
            </button>
            <span>/</span>
            <button 
              onClick={() => onNavigate('catalog')} 
              className="hover:text-[#FFD21A] transition-colors"
            >
              {t.nav.catalog}
            </button>
            <span>/</span>
            <span className="text-[#FFD21A]">{product.name}</span>
          </div>

          <button
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kataloqa Qayıt</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TOP SECTION: IMAGE GALLERY & SUMMARY CONFIGURATION */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-[#101114] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">
          
          {/* Left Column: Image Gallery with Architectural Framing */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div 
              onClick={() => setLightboxOpen(true)}
              className="group relative aspect-[4/3] bg-[#16181D] border border-white/10 rounded-xl overflow-hidden flex items-center justify-center p-4 cursor-zoom-in"
            >
              <img 
                src={currentImage} 
                alt={product.name}
                className="w-full h-full object-cover rounded transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80';
                }}
              />
              
              {/* Product Code Badge */}
              <div className="absolute top-4 left-4">
                <span className="text-xs font-mono font-bold bg-black/80 text-[#FFD21A] px-3 py-1 rounded border border-white/10 shadow-lg">
                  {product.code}
                </span>
              </div>

              {/* Category Badge */}
              <div className="absolute top-4 right-4">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded border border-white/10 shadow-lg">
                  {getLocalizedText(product.categoryName, currentLang)}
                </span>
              </div>

              {/* Zoom hint badge */}
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md border border-white/10 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs">
                <Eye className="w-3.5 h-3.5 text-[#FFD21A]" />
                <span>Böyüt / Lightbox</span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {galleryList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {galleryList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border flex-shrink-0 transition-all ${
                      activeImageIndex === idx 
                        ? 'border-[#FFD21A] ring-2 ring-[#FFD21A]/40 scale-[1.02]' 
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${idx + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-[#FFD21A] text-black text-[7px] font-extrabold text-center uppercase tracking-wider py-0.5">
                        ƏSAS
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Key Technical Highlights Pills */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
              <div className="p-3 bg-black/30 border border-white/5 rounded-lg">
                <div className="text-gray-400 text-[10px] uppercase">Rəngötürmə</div>
                <div className="text-white font-bold mt-0.5">{product.specs?.cri || 'CRI > 90'}</div>
              </div>
              <div className="p-3 bg-black/30 border border-white/5 rounded-lg">
                <div className="text-gray-400 text-[10px] uppercase">Parıltı Dərəcəsi</div>
                <div className="text-white font-bold mt-0.5">{product.specs?.ugr || 'UGR < 19'}</div>
              </div>
              <div className="p-3 bg-black/30 border border-white/5 rounded-lg">
                <div className="text-gray-400 text-[10px] uppercase">İstismar Ömrü</div>
                <div className="text-white font-bold mt-0.5">{product.specs?.lifespan || '50,000 hrs'}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Quick Selectors & Action Buttons */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FFD21A]">
                  {getLocalizedText(product.categoryName, currentLang)}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight mt-1">
                  {product.name}
                </h1>
                <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                  {getLocalizedText(product.subtitle, currentLang)}
                </p>
              </div>

              <div className="h-[1px] bg-white/10" />

              {/* Description summary */}
              <p className="text-xs text-gray-300 leading-relaxed">
                {getLocalizedText(product.description, currentLang)}
              </p>

              {/* CCT Option Selection — yalnız real CCT məlumatı varsa göstərilir */}
              {cctOptions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Rəng Temperaturu (CCT): <span className="text-[#FFD21A]">{selectedCCT ? cctLabel(selectedCCT) : ''}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {cctOptions.map((cct) => (
                      <button
                        key={cct}
                        onClick={() => setSelectedCCT(cct)}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                          selectedCCT === cct 
                            ? 'border-[#FFD21A] bg-[#FFD21A]/15 text-[#FFD21A] font-bold' 
                            : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {cctLabel(cct)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Finish Option Selection — yalnız real rəng/örtük məlumatı varsa göstərilir */}
              {finishOptions.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Profil Rəngi / Örtük: <span className="text-[#FFD21A]">{selectedFinish}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {finishOptions.map((finish) => (
                      <button
                        key={finish}
                        onClick={() => setSelectedFinish(finish)}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                          selectedFinish === finish 
                            ? 'border-[#FFD21A] bg-[#FFD21A]/15 text-[#FFD21A] font-bold' 
                            : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {finish}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Warranty & Quality Note — yalnız uyğun məhsullarda */}
              {showWarranty && (
                <div className="flex items-center gap-2 p-3 bg-black/40 border border-[#FFD21A]/30 rounded-lg text-xs text-gray-300">
                  <ShieldCheck className="w-5 h-5 text-[#FFD21A] flex-shrink-0" />
                  <span>
                    {t.productDetail.warrantyBadge}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <button
                onClick={() => onRequestQuote(product)}
                className="w-full flex items-center justify-center gap-2 bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider py-4 rounded hover:bg-[#F0C413] transition-all shadow-[0_0_25px_rgba(255,210,26,0.3)] hover:scale-[1.01]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t.productDetail.requestQuote}</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onNavigate('configurator')}
                  className="flex items-center justify-center gap-1.5 bg-black/40 border border-white/15 hover:border-[#FFD21A] text-white hover:text-[#FFD21A] py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{t.nav.configurator}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-1.5 bg-black/40 border border-white/15 hover:border-white text-gray-300 hover:text-white py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? t.productDetail.linkCopied : t.productDetail.share}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 02: COMPLETE TECHNICAL SPECIFICATIONS & DOWNLOADS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          
          {/* Left Column: Full Technical Specifications Table */}
          <div className="lg:col-span-8 bg-[#101114] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#FFD21A] rounded-full" />
              <span>{t.productDetail.specsTitle}</span>
            </h2>

            <div className="divide-y divide-white/10 text-xs">
              <div className="py-3 flex justify-between">
                <span className="text-gray-400">Model / Code</span>
                <span className="text-white font-mono font-bold">{product.code}</span>
              </div>
              {product.specs?.cct && (
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">{t.productDetail.cct}</span>
                  <span className="text-white font-medium">{product.specs.cct}</span>
                </div>
              )}
              {product.specs?.finish && (
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">{t.productDetail.finish}</span>
                  <span className="text-white font-medium">{product.specs.finish}</span>
                </div>
              )}
              {!product.specs?.cct && !product.specs?.finish && (
                <div className="py-4 text-center text-gray-500 italic">
                  Əlavə texniki parametr daxil edilməyib.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Real File Downloads & Services */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Real Downloads Block — yalnız yüklənmiş real fayllar görünür */}
            {downloadableFiles.length > 0 && (
              <div className="bg-[#101114] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest text-[#FFD21A]">
                  {t.productDetail.downloadsTitle}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {currentLang === 'az'
                    ? `${downloadableFiles.length} texniki fayl mövcuddur — yükləmək üçün klikləyin.`
                    : currentLang === 'ru'
                    ? `${downloadableFiles.length} технических файлов — нажмите для загрузки.`
                    : `${downloadableFiles.length} technical file${downloadableFiles.length > 1 ? 's' : ''} available — click to download.`}
                </p>

                <div className="space-y-2.5 pt-2">
                  {downloadableFiles.map((file, index) => (
                    <button
                      key={`${file.name}-${index}`}
                      onClick={() => handleRealDownload(file)}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-[#18191E] hover:bg-white/5 border border-white/10 hover:border-[#FFD21A] transition-all text-xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ProductFileTypeIcon type={file.type} />
                        <div className="text-left min-w-0">
                          <div className="font-semibold text-white truncate max-w-[220px]">{file.name}</div>
                          <div className="text-[10px] text-gray-400">{file.type} • {file.size || '—'}</div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-gray-400 group-hover:text-[#FFD21A] flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Length Cut & Join Service */}
            <div className="bg-[#101114] border border-[#FFD21A]/30 rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFD21A]">
                <Sparkles className="w-4 h-4" />
                <span>{t.productDetail.customServiceTitle}</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {t.productDetail.customServiceDesc}
              </p>
              <button
                onClick={() => onRequestQuote(product)}
                className="text-xs font-bold text-white hover:text-[#FFD21A] inline-flex items-center gap-1.5 pt-1"
              >
                <span>{t.productDetail.consultEngineer}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* SECTION 03: SIMILAR / COMPATIBLE PRODUCTS */}
        {/* ========================================================================= */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              {t.productDetail.relatedProducts}
            </h2>
            <button
              onClick={() => onNavigate('catalog')}
              className="text-xs font-bold text-[#FFD21A] hover:text-white uppercase tracking-wider"
            >
              {t.productDetail.viewAll} →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => {
                  onNavigate('catalog', rel.slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group bg-[#101114] border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#FFD21A]/50 transition-all p-4 flex flex-col justify-between"
              >
                <div className="aspect-[4/3] bg-[#16181D] rounded-lg overflow-hidden mb-3">
                  <img src={rel.image} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase group-hover:text-[#FFD21A] transition-colors">{rel.name}</h3>
                    <div className="text-[11px] text-gray-400">{rel.code}</div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[#FFD21A] group-hover:bg-[#FFD21A] group-hover:text-black transition-all">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ARCHITECTURAL LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold bg-[#FFD21A] text-black px-2.5 py-1 rounded">
                {product.code}
              </span>
              <h4 className="text-sm font-bold text-white uppercase">{product.name}</h4>
              <span className="text-xs font-mono text-gray-400">
                ({activeImageIndex + 1} / {galleryList.length})
              </span>
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Lightbox Canvas with Left/Right Navigation */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            {galleryList.length > 1 && (
              <button
                onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryList.length - 1))}
                className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-black/70 hover:bg-[#FFD21A] text-white hover:text-black transition-all border border-white/10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={currentImage}
              alt={product.name}
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80';
              }}
            />

            {galleryList.length > 1 && (
              <button
                onClick={() => setActiveImageIndex((prev) => (prev < galleryList.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-black/70 hover:bg-[#FFD21A] text-white hover:text-black transition-all border border-white/10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {galleryList.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 max-w-4xl mx-auto">
              {galleryList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border transition-all ${
                    activeImageIndex === idx
                      ? 'border-[#FFD21A] ring-2 ring-[#FFD21A]/50 scale-105'
                      : 'border-white/20 opacity-50 hover:opacity-100'
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
