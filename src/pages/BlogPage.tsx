import React, { useState } from 'react';
import { Language, BlogPost } from '../types';
import { translations } from '../data/translations';
import { useData } from '../context/DataContext';
import { getLocalizedText, getLocalizedArray } from '../utils/lang';
import { 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Share2, 
  Sparkles, 
  Check,
  ChevronRight,
  BookOpen,
  Eye,
  X,
  Layers
} from 'lucide-react';

interface BlogPageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  initialSlug?: string;
}

export const BlogPage: React.FC<BlogPageProps> = ({ currentLang, onNavigate, initialSlug }) => {
  const t = translations[currentLang];
  const { blogPosts } = useData();

  const [activeSlug, setActiveSlug] = useState<string | undefined>(initialSlug);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Active article if viewing single post
  const activePost = activeSlug ? blogPosts.find(b => b.slug === activeSlug || b.id === activeSlug) : null;

  const categories = [
    { id: 'all', label: currentLang === 'az' ? 'Bütün Məqalələr' : currentLang === 'ru' ? 'Все статьи' : 'All Articles' },
    { id: 'Architecture', label: currentLang === 'az' ? 'Memarlıq' : currentLang === 'ru' ? 'Архитектура' : 'Architecture' },
    { id: 'Technology', label: currentLang === 'az' ? 'Texnologiya & LED' : currentLang === 'ru' ? 'Технологии' : 'Technology' },
    { id: 'Design', label: currentLang === 'az' ? 'İşıq Dizaynı' : currentLang === 'ru' ? 'Светодизайн' : 'Lighting Design' },
  ];

  const filteredPosts = selectedCategory === 'all'
    ? blogPosts
    : blogPosts.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // SINGLE ARTICLE VIEW
  if (activePost) {
    return (
      <div className="min-h-screen bg-[#08090A] text-white pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb / Back */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setActiveSlug(undefined);
                onNavigate('blog');
              }}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-[#FFD21A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentLang === 'az' ? 'Bütün Məqalələrə Qayıt' : currentLang === 'ru' ? 'Назад к статьям' : 'Back to Articles'}</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs px-3.5 py-1.5 rounded-lg text-gray-300 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#FFD21A]" />}
              <span>{copiedLink ? (currentLang === 'az' ? 'Kopyalandı' : 'Copied') : (currentLang === 'az' ? 'Paylaş' : 'Share')}</span>
            </button>
          </div>

          {/* Article Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#FFD21A]/10 border border-[#FFD21A]/30 text-[#FFD21A] px-3 py-1 rounded text-xs font-mono uppercase font-bold">
              <span>{activePost.category}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              {getLocalizedText(activePost.title, currentLang)}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400 pt-2 border-b border-white/10 pb-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FFD21A]" />
                {activePost.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FFD21A]" />
                {activePost.readTime}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#FFD21A]" />
                {activePost.author}
              </span>
            </div>
          </div>

          {/* Cover Image */}
          <div 
            onClick={() => setLightboxImage(activePost.coverImage)}
            className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer relative"
          >
            <img
              src={activePost.coverImage}
              alt={getLocalizedText(activePost.title, 'az')}
              className="w-full max-h-[480px] object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-mono">
              <Eye className="w-4 h-4 text-[#FFD21A]" />
              <span>Böyütmək üçün klikləyin</span>
            </div>
          </div>

          {/* Lead / Summary */}
          {getLocalizedText(activePost.summary, currentLang) && (
            <div className="bg-[#12141B] border-l-4 border-[#FFD21A] p-5 rounded-r-xl text-gray-200 font-medium text-sm sm:text-base leading-relaxed">
              {getLocalizedText(activePost.summary, currentLang)}
            </div>
          )}

          {/* Body Paragraphs */}
          <div className="space-y-6 text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
            {getLocalizedArray(activePost.content, currentLang).map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Article Gallery (if multiple images present) */}
          {activePost.gallery && activePost.gallery.length > 1 && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-white tracking-wider">
                <Layers className="w-4 h-4 text-[#FFD21A]" />
                <span>Məqalə Qalereyası ({activePost.gallery.length} foto)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {activePost.gallery.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxImage(imgUrl)}
                    className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-[#12141B] border border-white/10 cursor-pointer"
                  >
                    <img
                      src={imgUrl}
                      alt={`Article gallery ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-5 h-5 text-[#FFD21A]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lightbox Modal */}
          {lightboxImage && (
            <div 
              onClick={() => setLightboxImage(null)}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
            >
              <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="absolute -top-12 right-0 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <img
                  src={lightboxImage}
                  alt="Full preview"
                  className="max-h-[85vh] max-w-full object-contain rounded-xl border border-white/10 shadow-2xl"
                />
              </div>
            </div>
          )}

          {/* Call to action footer */}
          <div className="bg-gradient-to-r from-[#12141B] to-[#161320] border border-[#FFD21A]/30 rounded-2xl p-8 text-center space-y-4 mt-12">
            <h3 className="text-xl font-bold text-white uppercase">Layihəniz Üçün İşıqlandırma Hesablaması Lazımdır?</h3>
            <p className="text-xs text-gray-300 max-w-lg mx-auto">
              Ecolife mühəndis komandası layihənizin Dialux simulyasiyasını və xətti armatur spesifikasiyasını ödənişsiz hazırlayır.
            </p>
            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center gap-2 bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-[#F0C413] transition-all shadow-[0_0_20px_rgba(255,210,26,0.3)]"
            >
              <span>Mühəndislə Əlaqə Saxlayın</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ARTICLES LISTING VIEW
  return (
    <div className="min-h-screen bg-[#08090A] text-white pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Banner */}
        <div className="bg-[#101115] border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD21A]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3 relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#FFD21A]/10 border border-[#FFD21A]/30 px-3 py-1 rounded text-xs font-mono uppercase font-bold text-[#FFD21A]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Memarlıq & İşıq Məqalələri</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
              {currentLang === 'az' ? 'Xəbərlər & Mühəndislik Bloqu' : currentLang === 'ru' ? 'Новости и Блог' : 'News & Architecture Blog'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Xətti LED optikası, Dialux hesablamaları, CRI standartları və müasir interyer işıqlandırma həlləri haqqında ekspert yazıları.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-[#FFD21A] text-black border-[#FFD21A] font-bold shadow-[0_0_15px_rgba(255,210,26,0.25)]'
                  : 'bg-[#101115] text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid of Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => {
                setActiveSlug(post.slug);
                onNavigate('blog', post.slug);
              }}
              className="bg-[#101115] border border-white/10 hover:border-[#FFD21A]/50 rounded-2xl overflow-hidden flex flex-col justify-between group cursor-pointer transition-all hover:scale-[1.01] shadow-xl"
            >
              <div>
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={getLocalizedText(post.title, 'az')}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono uppercase text-[#FFD21A] border border-white/10">
                    {post.category}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#FFD21A]" />
                      {post.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#FFD21A]" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-[#FFD21A] transition-colors leading-snug line-clamp-2">
                    {getLocalizedText(post.title, currentLang)}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                    {getLocalizedText(post.summary, currentLang)}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-white/5 mt-4 flex items-center justify-between">
                <span className="text-[11px] font-mono text-gray-400 truncate max-w-[150px]">{post.author}</span>
                <span className="text-xs font-bold text-[#FFD21A] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Oxu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
