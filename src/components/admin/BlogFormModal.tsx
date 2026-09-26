import React, { useState } from 'react';
import { BlogPost, Language } from '../../types';
import { ProductGalleryManager } from './ProductGalleryManager';
import { adminTranslations } from '../../data/adminTranslations';
import { X } from 'lucide-react';

interface BlogFormModalProps {
  post: BlogPost | null;
  onClose: () => void;
  onSave: (post: any) => void;
  currentLang: Language;
}

export const BlogFormModal: React.FC<BlogFormModalProps> = ({
  post,
  onClose,
  onSave,
  currentLang
}) => {
  const t = adminTranslations[currentLang] || adminTranslations.az;
  const modalT = t?.blogModal || adminTranslations.az.blogModal;
  const commonT = t?.common || adminTranslations.az.common;

  const [titleAz, setTitleAz] = useState(post?.title?.az || '');
  const [titleEn, setTitleEn] = useState(post?.title?.en || '');
  const [titleRu, setTitleRu] = useState(post?.title?.ru || '');

  const [category, setCategory] = useState(post?.category || 'Architecture');
  const [date, setDate] = useState(post?.date || new Date().toLocaleDateString('az-AZ', { day: '2-digit', month: 'long', year: 'numeric' }));
  const [readTime, setReadTime] = useState(post?.readTime || '5 min read');
  const [author, setAuthor] = useState(post?.author || 'Ecolife Lighting Design');
  const [coverImage, setCoverImage] = useState(post?.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');
  
  const [additionalImages, setAdditionalImages] = useState<string[]>(() => {
    if (!post || !post.gallery) return [];
    const main = post.coverImage;
    return post.gallery.filter(img => img && img !== main);
  });

  const [summaryAz, setSummaryAz] = useState(post?.summary?.az || '');
  const [summaryEn, setSummaryEn] = useState(post?.summary?.en || '');
  const [summaryRu, setSummaryRu] = useState(post?.summary?.ru || '');

  const [contentAz, setContentAz] = useState(post?.content?.az?.join('\n\n') || '');
  const [contentEn, setContentEn] = useState(post?.content?.en?.join('\n\n') || '');
  const [contentRu, setContentRu] = useState(post?.content?.ru?.join('\n\n') || '');

  const [textLangTab, setTextLangTab] = useState<'az' | 'en' | 'ru'>('az');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = post?.slug || titleAz.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const paragraphsAz = contentAz.split('\n\n').filter(Boolean);
    const paragraphsEn = contentEn ? contentEn.split('\n\n').filter(Boolean) : paragraphsAz;
    const paragraphsRu = contentRu ? contentRu.split('\n\n').filter(Boolean) : paragraphsAz;

    const finalCover = coverImage.trim() || additionalImages[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
    const finalGallery = [finalCover, ...additionalImages.filter(img => img && img !== finalCover)];

    onSave({
      title: { az: titleAz, en: titleEn || titleAz, ru: titleRu || titleAz },
      slug: finalSlug,
      category,
      date,
      readTime,
      author,
      coverImage: finalCover,
      gallery: finalGallery,
      summary: { az: summaryAz, en: summaryEn || summaryAz, ru: summaryRu || summaryAz },
      content: { az: paragraphsAz, en: paragraphsEn, ru: paragraphsRu }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-[#12141B] border border-white/10 rounded-2xl max-w-5xl lg:max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161822]/80 backdrop-blur-md shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold uppercase text-white tracking-wide">
              {post ? modalT.titleEdit : modalT.titleNew}
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Bloq məqaləsini, örtük fotosunu və qalereya şəkillərini idarə edin
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
            
            {/* Section 1: Əsas Məlumatlar (Horizontal 4-Column Grid) */}
            <div className="bg-[#0E0F14] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFD21A]"></span>
                  <span className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                    Məqalənin Əsas Parametrləri
                  </span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Title (2 columns wide) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    {modalT.titleLabel} ({textLangTab.toUpperCase()}) <span className="text-[#FFD21A]">*</span>
                  </label>
                  {textLangTab === 'az' && (
                    <input
                      type="text"
                      required
                      value={titleAz}
                      onChange={(e) => setTitleAz(e.target.value)}
                      placeholder="Məs: Müasir Memarlıqda İşıqlandırma Trendləri"
                      className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                    />
                  )}
                  {textLangTab === 'en' && (
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="E.g.: Modern Architectural Lighting Trends"
                      className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                    />
                  )}
                  {textLangTab === 'ru' && (
                    <input
                      type="text"
                      value={titleRu}
                      onChange={(e) => setTitleRu(e.target.value)}
                      placeholder="Напр.: Тренды современного архитектурного освещения"
                      className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                    />
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    {modalT.categoryLabel}
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Architecture / News / Tips"
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    {modalT.authorLabel}
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Ecolife Lighting Design"
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                  />
                </div>

                {/* Date */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    Tarix
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="26 Avqust 2024"
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                  />
                </div>

                {/* Read Time */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    Oxuma Müddəti
                  </label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="5 dəqiqə"
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Blog Images & Gallery (Horizontal 2-Column internally) */}
            <ProductGalleryManager
              mainImage={coverImage}
              onMainImageChange={(url) => setCoverImage(url)}
              additionalImages={additionalImages}
              onAdditionalImagesChange={(urls) => setAdditionalImages(urls)}
              folder="blog"
              mainTitle="1. Məqalə Üz Qabığı (Əsas Şəkil)"
              mainSubtitle="Bloq siyahısında və məqalənin əsas başlığında görünən örtük fotosu."
              galleryTitle="2. Məqalə Qalereyası (Limitsiz Şəkillər)"
              gallerySubtitle="Məqalənin daxilində və foto bölməsində nümayiş olunacaq digər şəkillər."
              mainPlaceholderWarning="Məqalə üçün əsas şəkil təyin edilməyib. Fayl yükləyin və ya URL yazın."
              currentLang={currentLang}
            />

            {/* Section 3: Summary & Content (Horizontal 2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-[#0E0F14] border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <label className="block text-xs font-mono uppercase text-white font-bold tracking-wider">
                      {modalT.summaryLabel} ({textLangTab.toUpperCase()})
                    </label>
                    <span className="text-[10px] font-mono text-[#FFD21A] uppercase">
                      {textLangTab === 'az' ? 'Azərbaycan' : textLangTab === 'en' ? 'English' : 'Русский'}
                    </span>
                  </div>
                  {textLangTab === 'az' && (
                    <textarea
                      rows={4}
                      value={summaryAz}
                      onChange={(e) => setSummaryAz(e.target.value)}
                      placeholder="Xəbərin və ya məqalənin qısa xülasəsi..."
                      className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors leading-relaxed"
                    />
                  )}
                  {textLangTab === 'en' && (
                    <textarea
                      rows={4}
                      value={summaryEn}
                      onChange={(e) => setSummaryEn(e.target.value)}
                      placeholder="Summary of the article or news update..."
                      className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors leading-relaxed"
                    />
                  )}
                  {textLangTab === 'ru' && (
                    <textarea
                      rows={4}
                      value={summaryRu}
                      onChange={(e) => setSummaryRu(e.target.value)}
                      placeholder="Краткое резюме статьи или новости..."
                      className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors leading-relaxed"
                    />
                  )}
                </div>
                <p className="text-[11px] text-gray-500 font-mono">
                  Bu qısa xülasə bloq kartlarında və sosial paylaşımlarda nümayiş olunur.
                </p>
              </div>

              <div className="bg-[#0E0F14] border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <label className="block text-xs font-mono uppercase text-white font-bold tracking-wider">
                    {modalT.contentLabel} ({textLangTab.toUpperCase()})
                  </label>
                  <span className="text-[10px] font-mono text-[#FFD21A] uppercase">
                    {textLangTab === 'az' ? 'Azərbaycan' : textLangTab === 'en' ? 'English' : 'Русский'}
                  </span>
                </div>
                {textLangTab === 'az' && (
                  <textarea
                    rows={6}
                    value={contentAz}
                    onChange={(e) => setContentAz(e.target.value)}
                    placeholder="Məqalənin tam mətni (abzasları iki 'Enter' ilə ayıra bilərsiniz)..."
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors leading-relaxed"
                  />
                )}
                {textLangTab === 'en' && (
                  <textarea
                    rows={6}
                    value={contentEn}
                    onChange={(e) => setContentEn(e.target.value)}
                    placeholder="Full article content (separate paragraphs with double Enter)..."
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors leading-relaxed"
                  />
                )}
                {textLangTab === 'ru' && (
                  <textarea
                    rows={6}
                    value={contentRu}
                    onChange={(e) => setContentRu(e.target.value)}
                    placeholder="Полный текст статьи (разделяйте абзацы двойным Enter)..."
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors leading-relaxed"
                  />
                )}
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
