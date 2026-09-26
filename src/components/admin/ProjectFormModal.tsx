import React, { useState } from 'react';
import { Project, ProjectCategory, Language } from '../../types';
import { ProductGalleryManager } from './ProductGalleryManager';
import { adminTranslations } from '../../data/adminTranslations';
import { X } from 'lucide-react';

interface ProjectFormModalProps {
  project: Project | null;
  onClose: () => void;
  onSave: (project: any) => void;
  currentLang: Language;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  project,
  onClose,
  onSave,
  currentLang
}) => {
  const t = adminTranslations[currentLang] || adminTranslations.az;
  const modalT = t?.projectModal || adminTranslations.az.projectModal;
  const commonT = t?.common || adminTranslations.az.common;

  const [title, setTitle] = useState(project?.title || '');
  const [category, setCategory] = useState<ProjectCategory>(project?.category || 'office');
  const [client, setClient] = useState(project?.client || '');
  const [location, setLocation] = useState(project?.location || 'Bakı, Azərbaycan');
  const [year, setYear] = useState(project?.year || '2025');
  const [coverImage, setCoverImage] = useState(project?.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80');
  
  const [additionalImages, setAdditionalImages] = useState<string[]>(() => {
    if (!project || !project.gallery) return [];
    const main = project.coverImage;
    return project.gallery.filter(img => img && img !== main);
  });

  const [descAz, setDescAz] = useState(project?.shortDescription?.az || '');
  const [descEn, setDescEn] = useState(project?.shortDescription?.en || '');
  const [descRu, setDescRu] = useState(project?.shortDescription?.ru || '');

  const [textLangTab, setTextLangTab] = useState<'az' | 'en' | 'ru'>('az');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = project?.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const finalCover = coverImage.trim() || additionalImages[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';
    const finalGallery = [finalCover, ...additionalImages.filter(img => img && img !== finalCover)];

    onSave({
      title,
      slug: finalSlug,
      category,
      categoryName: { az: category, en: category, ru: category },
      client,
      location,
      year,
      coverImage: finalCover,
      gallery: finalGallery,
      shortDescription: { az: descAz, en: descEn || descAz, ru: descRu || descAz },
      fullDescription: { 
        az: project?.fullDescription?.az || descAz, 
        en: descEn || project?.fullDescription?.en || descAz, 
        ru: descRu || project?.fullDescription?.ru || descAz 
      },
      lightingSolution: project?.lightingSolution || { 
        az: 'Ecolife xətti profilləri və spot sistemləri', 
        en: 'Ecolife linear profiles and track systems', 
        ru: 'Линейные профили Ecolife' 
      },
      productsUsed: project?.productsUsed || ['LINEAR 40', 'MAGNETIC TRACK 20']
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-[#12141B] border border-white/10 rounded-2xl max-w-5xl lg:max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161822]/80 backdrop-blur-md shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold uppercase text-white tracking-wide">
              {project ? modalT.titleEdit : modalT.titleNew}
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Layihə məlumatlarını, örtük şəklini və limitsiz qalereya fotolarını tərtib edin
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

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className="p-6 sm:p-7 space-y-6">
            
            {/* Row 1: Layihə Əsas Parametrləri (Horizontal 4-Column Grid) */}
            <div className="bg-[#0E0F14] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
                <span className="w-2 h-2 rounded-full bg-[#FFD21A]"></span>
                <span className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                  Layihənin Əsas Məlumatları
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Title (2 columns wide) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    {modalT.titleLabel} <span className="text-[#FFD21A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Məs: Pasha Bank Head Office"
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    {modalT.categoryLabel}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                  >
                    <option value="office">Office & Workspace</option>
                    <option value="commercial">Commercial</option>
                    <option value="restaurant">Restaurant & Hospitality</option>
                    <option value="hotel">Hotel & Lounge</option>
                    <option value="residential">Residential</option>
                  </select>
                </div>

                {/* Client */}
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    {modalT.clientLabel}
                  </label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="Məs: Pasha Holding"
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                  />
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    {modalT.locationLabel}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Məs: Bakı, Heydər Əliyev pr. 102"
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                  />
                </div>

                {/* Year */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    {modalT.yearLabel}
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Məs: 2024"
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Project Images & Unlimited Gallery Manager (Horizontal 2-Column internally) */}
            <ProductGalleryManager
              mainImage={coverImage}
              onMainImageChange={(url) => setCoverImage(url)}
              additionalImages={additionalImages}
              onAdditionalImagesChange={(urls) => setAdditionalImages(urls)}
              folder="projects"
              mainTitle="1. Layihə Üz Qabığı (Əsas Şəkil)"
              mainSubtitle="Layihələr vitrində və əsas kartda görünən örtük fotosu."
              galleryTitle="2. Layihə Qalereyası (Limitsiz Şəkillər)"
              gallerySubtitle="Layihə səhifəsindəki interaktiv qalereya və lightbox üçün fotolar."
              mainPlaceholderWarning="Layihə üçün əsas şəkil təyin edilməyib. Fayl yükləyin və ya URL daxil edin."
              currentLang={currentLang}
            />

            {/* Row 3: Short Description (Multilingual) */}
            <div className="bg-[#0E0F14] border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFD21A]"></span>
                  <label className="block text-xs font-mono uppercase text-white font-bold tracking-wider">
                    {modalT.descLabel} ({textLangTab.toUpperCase()})
                  </label>
                </div>
                {/* Language Switcher */}
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
              {textLangTab === 'az' && (
                <textarea
                  rows={3}
                  value={descAz}
                  onChange={(e) => setDescAz(e.target.value)}
                  placeholder="Layihə haqqında arxitektura, işıqlandırma konsepti və istifadə olunmuş işıqlandırma həlləri barədə məlumat..."
                  className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors leading-relaxed"
                />
              )}
              {textLangTab === 'en' && (
                <textarea
                  rows={3}
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  placeholder="Information regarding architecture, lighting concept, and custom systems used in the project..."
                  className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors leading-relaxed"
                />
              )}
              {textLangTab === 'ru' && (
                <textarea
                  rows={3}
                  value={descRu}
                  onChange={(e) => setDescRu(e.target.value)}
                  placeholder="Информация об архитектуре, световой концепции и использованных решениях в проекте..."
                  className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors leading-relaxed"
                />
              )}
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
