import React, { useState } from 'react';
import { Product, Language, ProductFile } from '../../types';
import { useData } from '../../context/DataContext';
import { ProductGalleryManager } from './ProductGalleryManager';
import { ProductFileManager } from './ProductFileManager';
import { adminTranslations } from '../../data/adminTranslations';
import { X } from 'lucide-react';

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (product: any) => void;
  currentLang: Language;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  onClose,
  onSave,
  currentLang
}) => {
  const t = adminTranslations[currentLang] || adminTranslations.az;
  const modalT = t?.productModal || adminTranslations.az.productModal;
  const commonT = t?.common || adminTranslations.az.common;
  const { categories } = useData();

  const [name, setName] = useState(product?.name || '');
  const [code, setCode] = useState(product?.code || '');
  const [slug, setSlug] = useState(product?.slug || '');

  const initialCategories = (() => {
    if (product?.categories && Array.isArray(product.categories) && product.categories.length > 0) {
      return product.categories;
    }
    if (product?.category) {
      return [product.category];
    }
    const fallback = categories[0]?.id || 'linear-profiles';
    return [fallback];
  })();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [primaryCategory, setPrimaryCategory] = useState<string>(product?.category || initialCategories[0] || 'linear-profiles');
  
  // Separation of Main Cover Image and Unlimited Gallery Images
  const [mainImage, setMainImage] = useState<string>(() => {
    return product?.image || (product?.gallery && product.gallery[0]) || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80';
  });

  const [additionalImages, setAdditionalImages] = useState<string[]>(() => {
    if (!product) return [];
    const main = product.image || (product.gallery && product.gallery[0]);
    if (!product.gallery || product.gallery.length === 0) return [];
    
    // Filter out the primary main image to isolate additional gallery photos
    const extras: string[] = [];
    let skippedFirstMain = false;
    for (const img of product.gallery) {
      if (img === main && !skippedFirstMain) {
        skippedFirstMain = true;
        continue;
      }
      if (img && !extras.includes(img)) {
        extras.push(img);
      }
    }
    return extras;
  });
  
  // Subtitle (AZ, EN, RU)
  const [subtitleAz, setSubtitleAz] = useState(product?.subtitle?.az || '');
  const [subtitleEn, setSubtitleEn] = useState(product?.subtitle?.en || '');
  const [subtitleRu, setSubtitleRu] = useState(product?.subtitle?.ru || '');
  
  // Description (AZ, EN, RU)
  const [descAz, setDescAz] = useState(product?.description?.az || '');
  const [descEn, setDescEn] = useState(product?.description?.en || '');
  const [descRu, setDescRu] = useState(product?.description?.ru || '');
  
  // Active Language Tab for text fields
  const [textLangTab, setTextLangTab] = useState<'az' | 'en' | 'ru'>('az');
  
  // Specs
  const [power, setPower] = useState(product?.specs?.power || '24W/m');
  const [cct, setCct] = useState(product?.specs?.cct || '3000K / 4000K');
  const [cri, setCri] = useState(product?.specs?.cri || 'CRI > 90');
  const [lumen, setLumen] = useState(product?.specs?.lumen || '2600 lm/m');
  const [dimensions, setDimensions] = useState(product?.specs?.dimensions || '50 x 75 mm');
  const [mounting, setMounting] = useState(product?.specs?.mounting || 'Suspended / Surface');
  const [ipRating, setIpRating] = useState(product?.specs?.ipRating || 'IP20');
  const [finish, setFinish] = useState(product?.specs?.finish || 'Anodized Black / White');

  const [featured, setFeatured] = useState(product?.featured || false);
  const [isNew, setIsNew] = useState(product?.isNew || false);
  // Real texniki fayllar (Supabase Storage URL-ləri ilə) — fake defolt fayl yoxdur
  const [productFiles, setProductFiles] = useState<ProductFile[]>(Array.isArray(product?.files) ? product.files : []);

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(catId)) {
        const next = prev.filter(id => id !== catId);
        if (primaryCategory === catId) {
          setPrimaryCategory(next[0] || '');
        }
        return next;
      }
      const next = [...prev, catId];
      if (!primaryCategory) {
        setPrimaryCategory(catId);
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const finalCategoryIds = selectedCategories.length > 0
      ? selectedCategories
      : [primaryCategory || (categories[0]?.id || 'linear-profiles')];
    const effectivePrimary = finalCategoryIds.includes(primaryCategory)
      ? primaryCategory
      : finalCategoryIds[0];
    const primaryCat = categories.find(c => c.id === effectivePrimary);
    const categoryNameObj = {
      az: primaryCat?.nameAz || effectivePrimary,
      en: primaryCat?.nameEn || effectivePrimary,
      ru: primaryCat?.nameRu || effectivePrimary
    };
    const categoryNamesArr = finalCategoryIds.map(id => {
      const c = categories.find(cat => cat.id === id);
      return {
        az: c?.nameAz || id,
        en: c?.nameEn || id,
        ru: c?.nameRu || id
      };
    });

    const finalMainImage = mainImage.trim() || additionalImages[0] || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80';
    
    // Construct unified gallery array starting strictly with the main image
    const finalGallery = [
      finalMainImage,
      ...additionalImages.filter(img => img && img !== finalMainImage)
    ];

    const finalProduct = {
      name,
      code,
      slug: finalSlug,
      category: effectivePrimary,
      categories: finalCategoryIds,
      categoryName: categoryNameObj,
      categoryNames: categoryNamesArr,
      image: finalMainImage,
      gallery: finalGallery,
      subtitle: { az: subtitleAz, en: subtitleEn || subtitleAz, ru: subtitleRu || subtitleEn || subtitleAz },
      description: { az: descAz, en: descEn || descAz, ru: descRu || descEn || descAz },
      specs: {
        material: 'Aluminium 6063-T5',
        dimensions,
        power,
        cct,
        cri,
        lumen,
        mounting,
        ipRating,
        finish,
        voltage: '220-240V AC',
        lifespan: '50,000 hrs (L80B10)',
        warranty: '5 Years'
      },
      files: productFiles,
      featured,
      isNew
    };

    onSave(finalProduct);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-[#12141B] border border-white/10 rounded-2xl max-w-6xl lg:max-w-7xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161822]/80 backdrop-blur-md shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold uppercase text-white tracking-wide">
              {product ? modalT.titleEdit : modalT.titleNew}
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              {modalT.subtitle || 'Məhsul məlumatlarını, texniki parametrlərini və limitsiz qalereyasını idarə edin'}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className="p-6 sm:p-7 space-y-6">
            
            {/* Section 1: Əsas İdentifikasiya Parametrləri (Horizontal 4-Column Grid) */}
            <div className="bg-[#0E0F14] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFD21A]"></span>
                  <span className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                    Məhsulun Əsas İdentifikatorları
                  </span>
                </div>
                {/* Flags Checkboxes */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FFD21A] bg-black border-white/20 accent-[#FFD21A]"
                    />
                    <span className="font-medium">{modalT.featuredLabel}</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FFD21A] bg-black border-white/20 accent-[#FFD21A]"
                    />
                    <span className="font-medium">{modalT.newLabel}</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    {modalT.nameLabel} <span className="text-[#FFD21A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Məs: LINEAR 50 ARCHITECTURAL"
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                  />
                </div>

                {/* Product Code */}
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    {modalT.codeLabel} <span className="text-[#FFD21A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Məs: ECL-LIN-50"
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors font-mono"
                  />
                </div>

                {/* Categories (multi-select) */}
                <div className="sm:col-span-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono uppercase text-gray-300 font-medium">
                      {modalT.categoryLabel} <span className="text-[#FFD21A]">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">
                      {selectedCategories.length > 0
                        ? `${selectedCategories.length} seçildi`
                        : 'Çoxlu seçim mümkündür'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 p-3 bg-[#16181F] border border-white/15 rounded-xl min-h-[46px]">
                    {categories.map((cat) => {
                      const catName = currentLang === 'ru' ? cat.nameRu : currentLang === 'en' ? cat.nameEn : cat.nameAz;
                      const isSelected = selectedCategories.includes(cat.id);
                      const isPrimary = primaryCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                            isSelected
                              ? isPrimary
                                ? 'bg-[#FFD21A] text-black border-[#FFD21A] font-bold'
                                : 'bg-[#FFD21A]/15 text-[#FFD21A] border-[#FFD21A]/40'
                              : 'bg-white/[0.03] text-gray-300 border-white/10 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {isPrimary && isSelected && (
                            <span className="text-[9px] uppercase tracking-wider opacity-80">★ Əsas</span>
                          )}
                          <span>{catName}</span>
                          {isSelected && !isPrimary && (
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(cat.id);
                              }}
                              className="ml-0.5 text-[10px] opacity-70 hover:opacity-100"
                            >
                              ✕
                            </span>
                          )}
                        </button>
                      );
                    })}
                    {selectedCategories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const first = selectedCategories[0];
                          setPrimaryCategory(first);
                        }}
                        className="ml-auto text-[10px] font-mono text-gray-400 hover:text-[#FFD21A] uppercase tracking-wider"
                      >
                        ★ Əsas kateqoriyanı dəyiş
                      </button>
                    )}
                  </div>
                  {selectedCategories.length > 1 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">Əsas:</span>
                      <select
                        value={primaryCategory}
                        onChange={(e) => setPrimaryCategory(e.target.value)}
                        className="bg-[#0E0F14] border border-white/15 rounded-lg px-2 py-1 text-[11px] text-white font-mono focus:border-[#FFD21A] focus:outline-none"
                      >
                        {selectedCategories.map(id => {
                          const c = categories.find(cat => cat.id === id);
                          const catName = currentLang === 'ru' ? c?.nameRu : currentLang === 'en' ? c?.nameEn : c?.nameAz;
                          return (
                            <option key={id} value={id}>{catName} ({id})</option>
                          );
                        })}
                      </select>
                      <span className="text-[10px] text-gray-500 font-mono">— Breadcrumb və URL üçün istifadə olunur</span>
                    </div>
                  )}
                </div>

                {/* Slug (URL key) */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    {modalT.slugLabel} <span className="text-[10px] text-gray-500 font-normal lowercase">(avtomatik və ya xüsusi)</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="linear-50-architectural"
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-2 text-xs text-white focus:border-[#FFD21A] focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Main Image and Unlimited Gallery Manager (Side-by-Side Horizontal 2 Columns) */}
            <ProductGalleryManager
              mainImage={mainImage}
              onMainImageChange={(url) => setMainImage(url)}
              additionalImages={additionalImages}
              onAdditionalImagesChange={(urls) => setAdditionalImages(urls)}
              currentLang={currentLang}
            />

            {/* Section 2.5: Real Technical Files Manager (Supabase Storage) */}
            <ProductFileManager
              files={productFiles}
              onChange={setProductFiles}
              currentLang={currentLang}
            />

            {/* Section 3: Subtitle & Description (Horizontal 2 Columns with Language Tabs) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFD21A]"></span>
                  <span className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                    {currentLang === 'az' ? 'Mətnlər və Təsvirlər (Çoxdilli)' : currentLang === 'ru' ? 'Тексты и описания (Мультиязычный)' : 'Texts & Descriptions (Multilingual)'}
                  </span>
                </div>
                {/* Language Switcher Tabs */}
                <div className="flex items-center bg-[#16181F] p-1 rounded-lg border border-white/10 text-xs font-mono">
                  {(['az', 'en', 'ru'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setTextLangTab(l)}
                      className={`px-3 py-1 rounded font-bold transition-all uppercase ${
                        textLangTab === l 
                          ? 'bg-[#FFD21A] text-black shadow-md' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-[#0E0F14] border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <label className="block text-xs font-mono uppercase text-white font-bold tracking-wider">
                      {modalT.subtitleLabel} ({textLangTab.toUpperCase()})
                    </label>
                    <span className="text-[10px] font-mono text-[#FFD21A] uppercase">
                      {textLangTab === 'az' ? 'Azərbaycan' : textLangTab === 'en' ? 'English' : 'Русский'}
                    </span>
                  </div>
                  {textLangTab === 'az' && (
                    <input
                      type="text"
                      value={subtitleAz}
                      onChange={(e) => setSubtitleAz(e.target.value)}
                      placeholder="Məs: Premium Asma və Gömülmə Xətti Profil Sistemi"
                      className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                    />
                  )}
                  {textLangTab === 'en' && (
                    <input
                      type="text"
                      value={subtitleEn}
                      onChange={(e) => setSubtitleEn(e.target.value)}
                      placeholder="E.g.: Premium Suspended and Recessed Linear Profile System"
                      className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                    />
                  )}
                  {textLangTab === 'ru' && (
                    <input
                      type="text"
                      value={subtitleRu}
                      onChange={(e) => setSubtitleRu(e.target.value)}
                      placeholder="Напр.: Премиальная подвесная и встраиваемая линейная система"
                      className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                    />
                  )}
                  <p className="text-[11px] text-gray-500 font-mono">
                    Məhsul kartının altında və detal səhifəsinin başlığında vurğulanan qısa xülasə.
                  </p>
                </div>

                <div className="bg-[#0E0F14] border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <label className="block text-xs font-mono uppercase text-white font-bold tracking-wider">
                      {modalT.descLabel} ({textLangTab.toUpperCase()})
                    </label>
                    <span className="text-[10px] font-mono text-[#FFD21A] uppercase">
                      {textLangTab === 'az' ? 'Azərbaycan' : textLangTab === 'en' ? 'English' : 'Русский'}
                    </span>
                  </div>
                  {textLangTab === 'az' && (
                    <textarea
                      rows={3}
                      value={descAz}
                      onChange={(e) => setDescAz(e.target.value)}
                      placeholder="Məhsulun dizaynı, tətbiq sahələri və optik xüsusiyyətləri haqqında ətraflı məlumat..."
                      className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors leading-relaxed"
                    />
                  )}
                  {textLangTab === 'en' && (
                    <textarea
                      rows={3}
                      value={descEn}
                      onChange={(e) => setDescEn(e.target.value)}
                      placeholder="Detailed information regarding design, optics, and architectural applications..."
                      className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors leading-relaxed"
                    />
                  )}
                  {textLangTab === 'ru' && (
                    <textarea
                      rows={3}
                      value={descRu}
                      onChange={(e) => setDescRu(e.target.value)}
                      placeholder="Подробная информация о дизайне, оптических характеристиках и применении..."
                      className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors leading-relaxed"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Technical Specs (Horizontal 4-Column Grid) */}
            <div className="bg-[#0E0F14] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
                <span className="w-2 h-2 rounded-full bg-[#FFD21A]"></span>
                <span className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                  {modalT.specsTitle || 'Texniki Parametrlər'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">{modalT.powerLabel}</label>
                  <input
                    type="text"
                    value={power}
                    onChange={(e) => setPower(e.target.value)}
                    className="w-full bg-[#16181F] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:border-[#FFD21A] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">{modalT.cctLabel}</label>
                  <input
                    type="text"
                    value={cct}
                    onChange={(e) => setCct(e.target.value)}
                    className="w-full bg-[#16181F] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:border-[#FFD21A] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">{modalT.criLabel}</label>
                  <input
                    type="text"
                    value={cri}
                    onChange={(e) => setCri(e.target.value)}
                    className="w-full bg-[#16181F] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:border-[#FFD21A] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">{modalT.lumenLabel}</label>
                  <input
                    type="text"
                    value={lumen}
                    onChange={(e) => setLumen(e.target.value)}
                    className="w-full bg-[#16181F] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:border-[#FFD21A] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">{modalT.dimensionsLabel}</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full bg-[#16181F] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:border-[#FFD21A] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">{modalT.mountingLabel}</label>
                  <input
                    type="text"
                    value={mounting}
                    onChange={(e) => setMounting(e.target.value)}
                    className="w-full bg-[#16181F] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:border-[#FFD21A] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">{modalT.ipLabel}</label>
                  <input
                    type="text"
                    value={ipRating}
                    onChange={(e) => setIpRating(e.target.value)}
                    className="w-full bg-[#16181F] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:border-[#FFD21A] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">{modalT.finishLabel}</label>
                  <input
                    type="text"
                    value={finish}
                    onChange={(e) => setFinish(e.target.value)}
                    className="w-full bg-[#16181F] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:border-[#FFD21A] focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#161822]/90 backdrop-blur-md shrink-0">
            <span className="text-[11px] font-mono text-gray-400 hidden sm:inline-block">
              * Ulduzlu xanaların doldurulması mütləqdir
            </span>
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-white/15 text-xs font-mono text-gray-300 hover:bg-white/5 transition-colors"
              >
                {commonT.cancel}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#F0C413] transition-all shadow-[0_0_15px_rgba(255,210,26,0.3)] flex items-center gap-2"
              >
                <span>{commonT.save}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

